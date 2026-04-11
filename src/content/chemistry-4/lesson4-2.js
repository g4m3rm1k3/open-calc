// Chemistry · Chapter 4 · Lesson 2
// Reaction Rates

const LESSON_CHEM_4_2 = {
  title: 'Reaction Rates',
  subtitle: 'What determines how fast a reaction goes — and how to control it.',
  sequential: true,

  cells: [

    // ── Section 1 ───────────────────────────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `### Why Does Speed Matter?

Iron rusts slowly over years. TNT detonates in microseconds. Milk sours in days. Diamonds convert to graphite over geological time. All of these are chemical reactions, but their rates span more than twenty orders of magnitude.

Rate matters enormously in practice. Industrial chemists optimize reaction rates to maximise production. Pharmacologists design drugs that react quickly with their targets but clear from the body at the right pace. Food scientists control spoilage rates. Explosives engineers need reactions that go from zero to complete in microseconds. Your own metabolism depends on enzymes tuned to exact rates — fast enough to sustain life, slow enough to be controlled.

The **rate of a reaction** is the speed at which reactants are consumed or products are formed. Formally:

$\\text{rate} = -\\frac{\\Delta[\\text{reactant}]}{\\Delta t} = +\\frac{\\Delta[\\text{product}]}{\\Delta t}$

The brackets denote molar concentration, and the negative sign on the reactant side reflects that reactant concentration decreases over time. Rate has units of mol/L·s (or mol/L·min, etc.).

Four factors control reaction rate:
1. **Concentration** — more particles per unit volume means more collisions
2. **Temperature** — hotter molecules move faster, collide harder, more frequently exceed Eₐ
3. **Surface area** — more exposed surface means more sites for reaction
4. **Catalysts** — lower the activation energy barrier

We'll examine each factor in depth, then formalize the relationship between concentration and rate with **rate laws**.`,
    },

    // ── Section 2 ───────────────────────────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `### Collision Theory: Why Reactions Need More Than Contact

Before we examine the four factors, we need the conceptual framework: **collision theory**.

For a reaction to occur, molecules must:
1. **Collide** — obviously they must come into contact
2. **Have sufficient energy** — they must hit hard enough to overcome the activation energy barrier
3. **Have the correct orientation** — they must approach each other in a geometry that allows bonds to break and form

This third point is subtler than it seems. Consider HBr reacting with OH⁻ to give H₂O + Br⁻. The OH⁻ must approach the H end of HBr — attacking from the Br side would not lead to reaction. Only a fraction of collisions have both sufficient energy and the correct orientation. This fraction is called the **steric factor**.

The rate of a reaction is therefore:

$\\text{rate} \\propto (\\text{collision frequency}) \\times (\\text{fraction with } E \\geq E_a) \\times (\\text{steric factor})$

Each of the four rate factors maps onto this framework:
- **Concentration**: increases collision frequency — more particles per volume, more collisions per second
- **Temperature**: increases the fraction of collisions with E ≥ Eₐ — shifts the Maxwell-Boltzmann distribution to higher energies
- **Surface area**: increases collision frequency for heterogeneous reactions (solid + liquid/gas)
- **Catalyst**: lowers Eₐ, increasing the fraction with E ≥ Eₐ, and may also improve orientation (especially enzymes)

Understanding rate is really understanding what controls these three multiplicative factors.`,
    },

    // ── Visual 1 — Collision theory simulation ─────────────────────────────────
    {
      type: 'js',
      instruction: `### Collision theory: concentration, temperature, and orientation

The simulation shows molecules colliding. Adjust concentration (number of particles) and temperature (speed) to see how collision frequency changes. Successful reactions (correct orientation + sufficient energy) flash green; failed collisions flash red. Watch how temperature and concentration independently affect the reaction rate.`,
      html: `<div style="padding:12px 14px 0;background:#0a0f1e">
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:8px">
    <div>
      <div style="color:rgba(255,255,255,0.5);font-size:11px;font-family:monospace;margin-bottom:3px">CONCENTRATION (particles)</div>
      <input type="range" id="conc-sl" min="4" max="24" value="10" style="width:100%">
      <div style="color:#38bdf8;font-family:monospace;font-size:14px;font-weight:700;text-align:center" id="conc-lbl">10 particles</div>
    </div>
    <div>
      <div style="color:rgba(255,255,255,0.5);font-size:11px;font-family:monospace;margin-bottom:3px">TEMPERATURE (speed)</div>
      <input type="range" id="temp-sl" min="1" max="5" value="2" step="0.5" style="width:100%">
      <div style="color:#f87171;font-family:monospace;font-size:14px;font-weight:700;text-align:center" id="temp-lbl">Low</div>
    </div>
  </div>
</div>
<canvas id="cv" width="700" height="260"></canvas>`,
      css: `body{margin:0;background:#0a0f1e;font-family:monospace}
canvas{display:block;width:100%;max-width:700px}`,
      startCode: `var canvas=document.getElementById('cv');
var ctx=canvas.getContext('2d');
var W=canvas.width,H=canvas.height;
var t=0;

var concSl=document.getElementById('conc-sl');
var tempSl=document.getElementById('temp-sl');
var concLbl=document.getElementById('conc-lbl');
var tempLbl=document.getElementById('temp-lbl');

var particles=[];
var flashes=[];
var reactionCount=0;
var lastSecond=0;
var rateHistory=[];

var TYPES=['A','B'];
var COLORS={'A':'#38bdf8','B':'#f97316'};

function initParticles(n){
  particles=[];
  for(var i=0;i<n;i++){
    particles.push({
      x:20+Math.random()*(W-40),
      y:20+Math.random()*(H-60),
      vx:(Math.random()-0.5)*2,
      vy:(Math.random()-0.5)*2,
      type:i%2===0?'A':'B',
      r:10,
      phase:Math.random()*Math.PI*2,
      // orientation angle (direction molecule is "pointing")
      orient:Math.random()*Math.PI*2
    });
  }
}

initParticles(10);

function getTempLabel(v){
  if(v<2)return'Very Low';
  if(v<3)return'Low';
  if(v<4)return'Medium';
  if(v<5)return'High';
  return'Very High';
}

concSl.oninput=function(){
  concLbl.textContent=concSl.value+' particles';
  initParticles(parseInt(concSl.value));
};
tempSl.oninput=function(){
  tempLbl.textContent=getTempLabel(parseFloat(tempSl.value));
};

function draw(){
  ctx.clearRect(0,0,W,H);
  ctx.fillStyle='#0a0f1e';ctx.fillRect(0,0,W,H);

  var tempFactor=parseFloat(tempSl.value);

  // Update particles
  particles.forEach(function(p){
    var speed=tempFactor;
    p.x+=p.vx*speed;
    p.y+=p.vy*speed;
    p.orient+=0.05;
    // Boundary
    if(p.x<p.r){p.x=p.r;p.vx=Math.abs(p.vx);}
    if(p.x>W-p.r){p.x=W-p.r;p.vx=-Math.abs(p.vx);}
    if(p.y<p.r){p.y=p.r;p.vy=Math.abs(p.vy);}
    if(p.y>H-50-p.r){p.y=H-50-p.r;p.vy=-Math.abs(p.vy);}
    // Random nudge
    p.vx+=(Math.random()-0.5)*0.1;
    p.vy+=(Math.random()-0.5)*0.1;
    var spd=Math.sqrt(p.vx*p.vx+p.vy*p.vy);
    if(spd>2.5){p.vx*=2.5/spd;p.vy*=2.5/spd;}
    if(spd<0.3){p.vx*=1.5;p.vy*=1.5;}
  });

  // Check collisions between A and B
  for(var i=0;i<particles.length;i++){
    for(var j=i+1;j<particles.length;j++){
      var a=particles[i],b=particles[j];
      if(a.type===b.type)continue;
      var dx=a.x-b.x,dy=a.y-b.y;
      var dist=Math.sqrt(dx*dx+dy*dy);
      if(dist<a.r+b.r+4){
        // Collision! Check if successful
        var relSpeed=Math.sqrt(Math.pow(a.vx-b.vx,2)+Math.pow(a.vy-b.vy,2));
        var energyOk=relSpeed*tempFactor>(2.5+Math.random()*1.5);
        // Orientation check: angle between approach and molecule orientation
        var approachAngle=Math.atan2(dy,dx);
        var orientDiff=Math.abs(Math.cos(a.orient-approachAngle));
        var orientOk=orientDiff>0.4;

        var success=energyOk&&orientOk;
        flashes.push({x:(a.x+b.x)/2,y:(a.y+b.y)/2,life:18,success:success});
        if(success)reactionCount++;

        // Elastic bounce
        var nx=dx/dist,ny=dy/dist;
        var dvx=a.vx-b.vx,dvy=a.vy-b.vy;
        var dot=dvx*nx+dvy*ny;
        a.vx-=dot*nx;a.vy-=dot*ny;
        b.vx+=dot*nx;b.vy+=dot*ny;
      }
    }
  }

  // Draw particles
  particles.forEach(function(p){
    var c=COLORS[p.type];
    // Direction arrow (orientation)
    var ax=p.x+Math.cos(p.orient)*14,ay=p.y+Math.sin(p.orient)*14;
    ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(ax,ay);
    ctx.strokeStyle=c+'55';ctx.lineWidth=2;ctx.stroke();

    ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
    ctx.fillStyle='#0f172a';ctx.fill();
    ctx.strokeStyle=c;ctx.lineWidth=2;ctx.stroke();
    ctx.fillStyle=c;ctx.font='bold 9px monospace';
    ctx.textAlign='center';ctx.textBaseline='middle';
    ctx.fillText(p.type,p.x,p.y);
  });

  // Draw flashes
  flashes=flashes.filter(function(f){return f.life>0;});
  flashes.forEach(function(f){
    var alpha=f.life/18;
    var r=f.success?20:14;
    ctx.beginPath();ctx.arc(f.x,f.y,r*(1-f.life/18)*2+8,0,Math.PI*2);
    ctx.fillStyle=f.success?'rgba(74,222,128,'+alpha*0.4+')':'rgba(248,113,113,'+alpha*0.25+')';
    ctx.fill();
    if(f.success){
      ctx.fillStyle='rgba(74,222,128,'+alpha+')';ctx.font='bold 11px monospace';ctx.textAlign='center';
      ctx.fillText('\u2713 REACT',f.x,f.y-18);
    }
    f.life--;
  });

  // Rate counter
  if(t%60===0){
    rateHistory.push(reactionCount);
    if(rateHistory.length>8)rateHistory.shift();
    reactionCount=0;
  }
  var avgRate=rateHistory.length?rateHistory.reduce(function(a,b){return a+b;})/rateHistory.length:0;

  // Bottom stats bar
  ctx.fillStyle='rgba(255,255,255,0.08)';ctx.fillRect(0,H-44,W,44);
  ctx.fillStyle='rgba(255,255,255,0.5)';ctx.font='11px monospace';ctx.textAlign='left';
  ctx.fillText('Particles: '+particles.length,14,H-28);
  ctx.fillText('Temp factor: '+tempFactor+'×',14,H-13);
  ctx.fillStyle='#4ade80';ctx.font='bold 12px monospace';ctx.textAlign='center';
  ctx.fillText('Reactions/min \u2248 '+Math.round(avgRate*60/60),W/2,H-28);
  ctx.fillStyle='rgba(255,255,255,0.35)';ctx.font='10px monospace';
  ctx.fillText('Green flash = successful reaction (right energy + orientation)',W/2,H-12);
  ctx.fillStyle='rgba(248,113,113,0.6)';ctx.font='10px monospace';ctx.textAlign='right';
  ctx.fillText('Red flash = insufficient energy or wrong orientation',W-14,H-12);

  t++;requestAnimationFrame(draw);
}
draw();`,
      outputHeight: 340,
    },

    // ── Challenge 1 ─────────────────────────────────────────────────────────────
    {
      type: 'challenge',
      instruction: `A student cuts a large piece of zinc into small pieces before adding it to hydrochloric acid. The reaction produces hydrogen gas. Why does the smaller pieces react faster than one large piece?`,
      options: [
        { label: 'A', text: 'Smaller pieces have lower activation energy because they are weaker' },
        { label: 'B', text: 'Smaller pieces expose more surface area — more zinc atoms are in contact with acid molecules, increasing the frequency of productive collisions' },
        { label: 'C', text: 'Cutting the zinc releases energy that speeds up the reaction' },
        { label: 'D', text: 'Smaller pieces dissolve completely, so there is more zinc in solution to react' },
      ],
      check: (label) => label === 'B',
      successMessage: "Correct! Surface area is critical for heterogeneous reactions (solid + liquid). The reaction only occurs at the zinc surface where Zn atoms can contact H⁺ ions. Cutting the zinc into smaller pieces dramatically increases the total surface area exposed to the acid, increasing collision frequency and thus rate. Zinc dust (extreme surface area) reacts almost explosively with acid.",
      failMessage: "Zinc is still zinc regardless of size — the activation energy doesn't change. The key is surface area. Reactions between a solid and a liquid can only occur at the solid's surface. A large single piece has a small surface area relative to its mass. Cutting it into smaller pieces increases the surface-to-mass ratio, exposing more zinc atoms to acid molecules per unit time.",
      html: '', css: `body{margin:0;padding:0;font-family:sans-serif}`, startCode: '',
      outputHeight: 300,
    },

    // ── Section 3 ───────────────────────────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `### Rate Laws: The Mathematical Relationship

Collision theory tells us qualitatively that concentration affects rate. But the quantitative relationship must be determined experimentally — it cannot be predicted from the balanced equation alone.

A **rate law** expresses the rate as a function of reactant concentrations:

$\\text{rate} = k[A]^m[B]^n$

Where:
- k is the **rate constant** — a proportionality constant that depends on temperature and the specific reaction
- [A] and [B] are the molar concentrations of reactants A and B
- m and n are the **reaction orders** with respect to A and B respectively
- The **overall order** of the reaction = m + n

The reaction orders m and n are almost always small integers (0, 1, or 2) or occasionally fractions. Critically, **they must be determined from experiment** — they are not the stoichiometric coefficients.

**Zero order (m = 0):** Rate is independent of [A]. Doubling [A] has no effect on rate. Rate = k. This occurs when the reaction is limited by something other than collision frequency — like a catalyst that is saturated.

**First order (m = 1):** Rate is proportional to [A]. Doubling [A] doubles the rate. Rate = k[A]. Radioactive decay is always first order.

**Second order (m = 2):** Rate is proportional to [A]². Doubling [A] quadruples the rate. Rate = k[A]². Many bimolecular reactions are second order overall.

To determine orders experimentally: run the reaction multiple times, changing one concentration at a time, and observe how the rate changes. If doubling [A] doubles the rate, the order with respect to A is 1. If doubling [A] quadruples the rate, the order is 2.`,
    },

    // ── Visual 2 — Rate law explorer ───────────────────────────────────────────
    {
      type: 'js',
      instruction: `### Rate law: how concentration order affects rate

The chart shows how rate changes as concentration increases for zero, first, and second order reactions. Notice how the curves diverge dramatically — second order reactions accelerate far more with concentration than first order, which accelerates more than zero order.`,
      html: `<canvas id="cv" width="700" height="300"></canvas>`,
      css: `body{margin:0;background:#0a0f1e;display:flex;justify-content:center}
canvas{display:block;width:100%;max-width:700px}`,
      startCode: `var canvas=document.getElementById('cv');
var ctx=canvas.getContext('2d');
var W=canvas.width,H=canvas.height;

ctx.fillStyle='#0a0f1e';ctx.fillRect(0,0,W,H);

var chartX=60,chartY=20,chartW=W-90,chartH=H-70;
var maxC=3.0,maxRate=9.0;
var k=1.0;

function toScreen(c,rate){
  return{
    x:chartX+(c/maxC)*chartW,
    y:chartY+chartH-(rate/maxRate)*chartH
  };
}

// Axes
ctx.strokeStyle='rgba(255,255,255,0.2)';ctx.lineWidth=1;
ctx.beginPath();ctx.moveTo(chartX,chartY);ctx.lineTo(chartX,chartY+chartH);ctx.stroke();
ctx.beginPath();ctx.moveTo(chartX,chartY+chartH);ctx.lineTo(chartX+chartW,chartY+chartH);ctx.stroke();

// Grid
[0,1,2,3,4,5,6,7,8,9].forEach(function(r){
  var y=chartY+chartH-(r/maxRate)*chartH;
  ctx.beginPath();ctx.moveTo(chartX,y);ctx.lineTo(chartX+chartW,y);
  ctx.strokeStyle='rgba(255,255,255,0.05)';ctx.stroke();
  if(r%3===0){ctx.fillStyle='rgba(255,255,255,0.35)';ctx.font='10px monospace';ctx.textAlign='right';ctx.fillText(r,chartX-5,y+4);}
});
[0,0.5,1,1.5,2,2.5,3].forEach(function(c){
  var x=chartX+(c/maxC)*chartW;
  ctx.beginPath();ctx.moveTo(x,chartY+chartH);ctx.lineTo(x,chartY+chartH+4);
  ctx.strokeStyle='rgba(255,255,255,0.2)';ctx.stroke();
  ctx.fillStyle='rgba(255,255,255,0.35)';ctx.font='10px monospace';ctx.textAlign='center';
  ctx.fillText(c.toFixed(1),x,chartY+chartH+16);
});

// Draw order curves
var orders=[
  {order:0,color:'#94a3b8',label:'Zero order: rate = k',fn:function(c){return k;}},
  {order:1,color:'#38bdf8',label:'First order: rate = k[A]',fn:function(c){return k*c;}},
  {order:2,color:'#f87171',label:'Second order: rate = k[A]²',fn:function(c){return k*c*c;}},
];

orders.forEach(function(ord){
  ctx.beginPath();
  for(var i=0;i<=100;i++){
    var c=i*(maxC/100);
    var r=Math.min(ord.fn(c),maxRate);
    var pt=toScreen(c,r);
    if(i===0)ctx.moveTo(pt.x,pt.y);else ctx.lineTo(pt.x,pt.y);
  }
  ctx.strokeStyle=ord.color;ctx.lineWidth=2.5;ctx.stroke();

  // Label at end of curve
  var endC=maxC;
  var endR=Math.min(ord.fn(endC),maxRate);
  var endPt=toScreen(endC,endR);
  ctx.fillStyle=ord.color;ctx.font='bold 11px monospace';ctx.textAlign='left';
  ctx.fillText(ord.label,endPt.x+6,endPt.y+4);
});

// Axis labels
ctx.fillStyle='rgba(255,255,255,0.5)';ctx.font='11px monospace';ctx.textAlign='center';
ctx.fillText('[A] concentration (mol/L)',chartX+chartW/2,chartY+chartH+32);
ctx.save();ctx.translate(16,chartY+chartH/2);ctx.rotate(-Math.PI/2);ctx.fillText('Rate (mol/L\u00b7s)',0,0);ctx.restore();

// Title
ctx.fillStyle='rgba(255,255,255,0.6)';ctx.font='bold 12px monospace';ctx.textAlign='center';
ctx.fillText('Rate vs. concentration for different reaction orders (k = 1.0)',W/2,chartY-4);

// Annotation: doubling effect
var c1=1,c2=2;
var annY=chartY+chartH-40;
ctx.strokeStyle='rgba(255,255,255,0.15)';ctx.lineWidth=1;ctx.setLineDash([3,3]);
ctx.beginPath();ctx.moveTo(toScreen(c1,0).x,chartY);ctx.lineTo(toScreen(c1,0).x,chartY+chartH);ctx.stroke();
ctx.beginPath();ctx.moveTo(toScreen(c2,0).x,chartY);ctx.lineTo(toScreen(c2,0).x,chartY+chartH);ctx.stroke();
ctx.setLineDash([]);

ctx.fillStyle='rgba(255,255,255,0.4)';ctx.font='10px monospace';ctx.textAlign='center';
ctx.fillText('[A] doubles: 1\u21922 M',toScreen(1.5,0).x,chartY+chartH+48);

// Delta rate arrows
[{ord:orders[0],dy:0},{ord:orders[1],dy:1},{ord:orders[2],dy:4}].forEach(function(item){
  var r1=item.ord.fn(c1),r2=item.ord.fn(c2);
  var p1=toScreen(c1,Math.min(r1,maxRate));
  var p2=toScreen(c2,Math.min(r2,maxRate));
  ctx.fillStyle=item.ord.color+'aa';ctx.font='bold 10px monospace';ctx.textAlign='center';
  if(r2>r1){
    ctx.fillText('\u00d7'+(r2/r1).toFixed(0),(p1.x+p2.x)/2+30,(p1.y+p2.y)/2-6);
  } else {
    ctx.fillText('unchanged',(p1.x+p2.x)/2+30,p1.y-6);
  }
});`,
      outputHeight: 340,
    },

    // ── Section 4 ───────────────────────────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `### Temperature and the Arrhenius Equation

We said that higher temperature increases the fraction of molecules with enough energy to react. Svante Arrhenius quantified this relationship in 1889:

$k = A \\cdot e^{-E_a/RT}$

where:
- k is the rate constant
- A is the **pre-exponential factor** (frequency factor) — related to how often molecules collide and with correct orientation
- Eₐ is the activation energy (J/mol)
- R is the gas constant (8.314 J/mol·K)
- T is the absolute temperature (Kelvin)

The exponential term e^(−Eₐ/RT) is the fraction of molecules with enough energy to react. As T increases, Eₐ/RT decreases, e^(−Eₐ/RT) increases, and k increases. A small increase in temperature can cause a dramatic increase in rate because of the exponential relationship.

**The rule of thumb:** For many reactions near room temperature, rate approximately doubles for every 10°C rise in temperature. This corresponds to an activation energy of about 50–60 kJ/mol, which is typical for many organic reactions.

**Comparing two temperatures:** Taking the logarithm of the Arrhenius equation gives:

$\\ln\\left(\\frac{k_2}{k_1}\\right) = \\frac{E_a}{R}\\left(\\frac{1}{T_1} - \\frac{1}{T_2}\\right)$

This lets you calculate Eₐ from two rate measurements at different temperatures, or predict the rate constant at any temperature given Eₐ.

**Why refrigerators work:** Food spoils by chemical reactions (mostly microbial, but the underlying processes are chemical). Lowering temperature from 25°C (298 K) to 4°C (277 K) — a 21°C drop — reduces the rate of these reactions by roughly a factor of 4–8, extending the food's shelf life correspondingly.`,
    },

    // ── Visual 3 — Arrhenius interactive ───────────────────────────────────────
    {
      type: 'js',
      instruction: `### The Arrhenius equation: temperature and activation energy

Adjust temperature and activation energy to see how the rate constant k changes. The left panel shows the Arrhenius curve. The right panel shows the Maxwell-Boltzmann distribution at that temperature with the Eₐ threshold marked — the shaded area is the fraction of molecules that can react.`,
      html: `<div style="padding:12px 14px 0;background:#0a0f1e">
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:6px">
    <div>
      <div style="color:rgba(255,255,255,0.5);font-size:11px;font-family:monospace;margin-bottom:3px">TEMPERATURE (K): <span id="T-lbl" style="color:#f87171;font-weight:700">298 K (25°C)</span></div>
      <input type="range" id="T-sl" min="200" max="600" value="298" style="width:100%">
    </div>
    <div>
      <div style="color:rgba(255,255,255,0.5);font-size:11px;font-family:monospace;margin-bottom:3px">ACTIVATION ENERGY: <span id="Ea-lbl" style="color:#facc15;font-weight:700">50 kJ/mol</span></div>
      <input type="range" id="Ea-sl" min="20" max="150" value="50" style="width:100%">
    </div>
  </div>
</div>
<canvas id="cv" width="700" height="260"></canvas>`,
      css: `body{margin:0;background:#0a0f1e;font-family:monospace}
canvas{display:block;width:100%;max-width:700px}`,
      startCode: `var canvas=document.getElementById('cv');
var ctx=canvas.getContext('2d');
var W=canvas.width,H=canvas.height;

var TSl=document.getElementById('T-sl');
var EaSl=document.getElementById('Ea-sl');
var TLbl=document.getElementById('T-lbl');
var EaLbl=document.getElementById('Ea-lbl');

var R=8.314;

function mbFunc(v,T){
  var m=3e-26,k=1.381e-23;
  var a=m/(k*T);
  return 4*Math.PI*Math.pow(a/Math.PI,1.5)*v*v*Math.exp(-a*v*v/2);
}

function kRelative(T,Ea){
  return Math.exp(-Ea*1000/(R*T));
}

TSl.oninput=render;EaSl.oninput=render;

function render(){
  ctx.clearRect(0,0,W,H);
  ctx.fillStyle='#0a0f1e';ctx.fillRect(0,0,W,H);

  var T=parseInt(TSl.value);
  var Ea=parseInt(EaSl.value);
  TLbl.textContent=T+' K ('+(T-273)+'°C)';
  EaLbl.textContent=Ea+' kJ/mol';

  var k=kRelative(T,Ea);
  var kRef=kRelative(298,Ea);
  var kRatio=k/kRef;

  // ── Left: Arrhenius k vs T curve ──
  var ax=30,ay=18,aw=300,ah=H-50;

  // Axes
  ctx.strokeStyle='rgba(255,255,255,0.2)';ctx.lineWidth=1;
  ctx.beginPath();ctx.moveTo(ax,ay);ctx.lineTo(ax,ay+ah);ctx.lineTo(ax+aw,ay+ah);ctx.stroke();

  // Curve
  var maxK=kRelative(600,Ea);
  ctx.beginPath();
  for(var ti=200;ti<=600;ti+=2){
    var ki=kRelative(ti,Ea);
    var px=ax+(ti-200)/(600-200)*aw;
    var py=ay+ah-(Math.min(ki/maxK,1))*ah*0.9;
    if(ti===200)ctx.moveTo(px,py);else ctx.lineTo(px,py);
  }
  ctx.strokeStyle='#f87171';ctx.lineWidth=2.5;ctx.stroke();

  // Current T marker
  var markerX=ax+(T-200)/400*aw;
  var markerY=ay+ah-(Math.min(k/maxK,1))*ah*0.9;
  ctx.beginPath();ctx.arc(markerX,markerY,7,0,Math.PI*2);
  ctx.fillStyle='#facc15';ctx.shadowColor='#facc15';ctx.shadowBlur=10;ctx.fill();ctx.shadowBlur=0;
  ctx.strokeStyle='rgba(250,204,21,0.5)';ctx.lineWidth=1;ctx.setLineDash([3,3]);
  ctx.beginPath();ctx.moveTo(markerX,markerY);ctx.lineTo(markerX,ay+ah);ctx.stroke();ctx.setLineDash([]);

  // Labels
  ctx.fillStyle='rgba(255,255,255,0.5)';ctx.font='10px monospace';ctx.textAlign='center';
  ctx.fillText('200 K',ax,ay+ah+14);ctx.fillText('600 K',ax+aw,ay+ah+14);
  ctx.fillText('Temperature (K)',ax+aw/2,ay+ah+28);
  ctx.save();ctx.translate(ax-16,ay+ah/2);ctx.rotate(-Math.PI/2);ctx.fillText('Rate constant k',0,0);ctx.restore();
  ctx.fillStyle='rgba(255,255,255,0.6)';ctx.font='bold 11px monospace';ctx.textAlign='center';
  ctx.fillText('k vs. Temperature (Arrhenius)',ax+aw/2,ay-4);

  // k ratio badge
  ctx.fillStyle='rgba(250,204,21,0.15)';ctx.beginPath();ctx.roundRect(ax+aw/2-70,ay+ah-52,140,36,6);ctx.fill();
  ctx.strokeStyle='rgba(250,204,21,0.4)';ctx.lineWidth=1.5;ctx.beginPath();ctx.roundRect(ax+aw/2-70,ay+ah-52,140,36,6);ctx.stroke();
  ctx.fillStyle='#facc15';ctx.font='bold 12px monospace';ctx.textAlign='center';
  ctx.fillText('k / k(298K) = '+kRatio.toFixed(2)+'×',ax+aw/2,ay+ah-38);
  ctx.fillStyle='rgba(255,255,255,0.4)';ctx.font='10px monospace';
  ctx.fillText('k = A\u00b7e^(\u2212Ea/RT)',ax+aw/2,ay+ah-24);

  // ── Right: Maxwell-Boltzmann panel ──
  var mbX=360,mbY=18,mbW=300,mbH=H-50;

  ctx.strokeStyle='rgba(255,255,255,0.2)';ctx.lineWidth=1;
  ctx.beginPath();ctx.moveTo(mbX,mbY);ctx.lineTo(mbX,mbY+mbH);ctx.lineTo(mbX+mbW,mbY+mbH);ctx.stroke();

  var maxV=3000;
  var curMaxP=0;
  for(var vi=1;vi<=100;vi++){var vv=vi*(maxV/100);var pp=mbFunc(vv,T);if(pp>curMaxP)curMaxP=pp;}

  // Ea speed threshold: Ea = 0.5*m*v^2 per molecule
  // v_ea = sqrt(2*Ea/(N_A*m_amu)) where m = 3e-26 kg
  var EaJ=Ea*1000;
  var vEa=Math.sqrt(2*EaJ/(6.022e23*3e-26));
  var eaX=mbX+(vEa/maxV)*mbW;

  // Shaded region beyond Ea
  ctx.beginPath();
  var startV=Math.round(vEa/maxV*100);
  if(startV<100){
    ctx.moveTo(Math.min(eaX,mbX+mbW),mbY+mbH);
    for(var vi2=startV;vi2<=100;vi2++){
      var vv2=vi2*(maxV/100);
      var pp2=mbFunc(vv2,T);
      var bx2=mbX+(vv2/maxV)*mbW;
      var by2=mbY+mbH-(pp2/curMaxP)*mbH*0.9;
      ctx.lineTo(bx2,by2);
    }
    ctx.lineTo(mbX+mbW,mbY+mbH);ctx.closePath();
    ctx.fillStyle='rgba(248,113,113,0.25)';ctx.fill();
  }

  // Curve
  ctx.beginPath();
  for(var vi3=1;vi3<=100;vi3++){
    var vv3=vi3*(maxV/100);
    var pp3=mbFunc(vv3,T);
    var bx3=mbX+(vv3/maxV)*mbW;
    var by3=mbY+mbH-(pp3/curMaxP)*mbH*0.9;
    if(vi3===1)ctx.moveTo(bx3,by3);else ctx.lineTo(bx3,by3);
  }
  ctx.strokeStyle='rgba(255,255,255,0.6)';ctx.lineWidth=2;ctx.stroke();

  // Ea threshold line
  if(eaX>mbX&&eaX<mbX+mbW){
    ctx.strokeStyle='#facc15';ctx.lineWidth=1.5;ctx.setLineDash([4,3]);
    ctx.beginPath();ctx.moveTo(eaX,mbY);ctx.lineTo(eaX,mbY+mbH);ctx.stroke();ctx.setLineDash([]);
    ctx.fillStyle='#facc15';ctx.font='bold 10px monospace';ctx.textAlign='center';
    ctx.fillText('Eₐ threshold',eaX,mbY+12);
  }

  // Fraction label
  var fracReactive=k/kRelative(Math.max(T,299),Math.min(Ea,149));
  var pct=(k*100).toFixed(3);
  ctx.fillStyle='#f87171';ctx.font='bold 11px monospace';ctx.textAlign='center';
  ctx.fillText((parseFloat(pct)<0.01?'<0.01':pct)+'% can react',mbX+mbW*0.78,mbY+mbH-30);

  ctx.fillStyle='rgba(255,255,255,0.5)';ctx.font='10px monospace';ctx.textAlign='center';
  ctx.fillText('Molecular speed \u2192',mbX+mbW/2,mbY+mbH+14);
  ctx.fillStyle='rgba(255,255,255,0.6)';ctx.font='bold 11px monospace';
  ctx.fillText('Energy distribution at '+T+' K',mbX+mbW/2,mbY-4);
}

render();`,
      outputHeight: 340,
    },

    // ── Challenge 2 ─────────────────────────────────────────────────────────────
    {
      type: 'challenge',
      instruction: `A reaction has an activation energy of 80 kJ/mol. At 300 K, its rate constant is k₁. At 310 K, its rate constant is k₂. Using the Arrhenius equation, which is closest to the ratio k₂/k₁?`,
      options: [
        { label: 'A', text: '1.1 (rate increases by ~10%)' },
        { label: 'B', text: '2.0 (rate roughly doubles)' },
        { label: 'C', text: '4.0 (rate roughly quadruples)' },
        { label: 'D', text: '10.0 (rate increases tenfold)' },
      ],
      check: (label) => label === 'B',
      successMessage: "Correct! Using ln(k₂/k₁) = (Ea/R)(1/T₁ − 1/T₂) = (80000/8.314)(1/300 − 1/310) = 9619 × 0.0001075 = 1.034. So k₂/k₁ = e^1.034 ≈ 2.81. The rate roughly triples — the well-known 'doubles per 10°C' rule is approximate; the actual factor depends on Ea. For Ea = 80 kJ/mol, it's close to 3×.",
      failMessage: "Use ln(k₂/k₁) = (Ea/R)(1/T₁ − 1/T₂). With Ea = 80,000 J/mol, R = 8.314 J/mol·K, T₁ = 300 K, T₂ = 310 K: ln(k₂/k₁) = (80000/8.314)(1/300 − 1/310) = 9619 × (0.003333 − 0.003226) = 9619 × 0.0001075 ≈ 1.03. k₂/k₁ = e^1.03 ≈ 2.8. The rate roughly doubles to triples per 10°C for this Ea.",
      html: '', css: `body{margin:0;padding:0;font-family:sans-serif}`, startCode: '',
      outputHeight: 300,
    },

    // ── Section 5 ───────────────────────────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `### Reaction Mechanisms and Rate-Determining Steps

The rate law for an overall reaction is determined by its **mechanism** — the sequence of elementary steps through which reactants become products. Most reactions don't happen in one single collision; they proceed through a series of steps, each with its own rate.

An **elementary step** is a single molecular event — a collision that directly produces a new species. For an elementary step, the rate law can be written directly from the stoichiometry: a unimolecular step A → products has rate = k[A]; a bimolecular step A + B → products has rate = k[A][B].

The overall rate of a multi-step reaction is determined by the **rate-determining step** — the slowest step in the mechanism. Just as the rate of a production line is set by its slowest machine, the rate of a reaction is set by its slowest step.

**Example:** The reaction of NO₂ with CO (NO₂ + CO → NO + CO₂) follows second-order kinetics: rate = k[NO₂]². But the balanced equation suggests it should be rate = k[NO₂][CO]. The resolution: the reaction proceeds in two steps.

Step 1 (slow): NO₂ + NO₂ → NO₃ + NO  (rate-determining, rate = k₁[NO₂]²)
Step 2 (fast): NO₃ + CO → NO₂ + CO₂

The slow step involves two NO₂ molecules, so the rate depends on [NO₂]², not on [CO]. CO appears only in the fast step and doesn't affect the rate. This is why the observed rate law is rate = k[NO₂]² — it reflects the rate-determining step.

The reaction mechanism is a hypothesis — it must be consistent with the experimental rate law and with other evidence. A mechanism can be disproven but never proven with absolute certainty, because different mechanisms can produce the same rate law.`,
    },

    // ── Visual 4 — Rate-determining step ───────────────────────────────────────
    {
      type: 'js',
      instruction: `### Rate-determining step: the bottleneck

The animation shows a two-step reaction mechanism. Step 1 is slow (high activation energy); Step 2 is fast (low activation energy). The intermediate builds up while waiting for Step 2 to process it. The overall reaction rate is controlled entirely by Step 1 — the bottleneck.`,
      html: `<canvas id="cv" width="700" height="300"></canvas>`,
      css: `body{margin:0;background:#0a0f1e;display:flex;justify-content:center}
canvas{display:block;width:100%;max-width:700px}`,
      startCode: `var canvas=document.getElementById('cv');
var ctx=canvas.getContext('2d');
var W=canvas.width,H=canvas.height;
var t=0;

// Pipeline model: particles flow through two steps
// Step 1 (slow): queue builds up
// Step 2 (fast): processes immediately
var STEP1_TIME=120; // frames per particle through step 1
var STEP2_TIME=20;  // frames per particle through step 2

var reactantPool=[];
var step1Queue=[];
var step1Active=null;
var step1Progress=0;
var intermediatePool=[];
var step2Active=null;
var step2Progress=0;
var productPool=[];

var spawnTimer=0;
var SPAWN_INTERVAL=40;

function spawnReactant(){
  reactantPool.push({x:30+Math.random()*60,y:50+Math.random()*(H-100),phase:Math.random()*Math.PI*2});
}

for(var i=0;i<6;i++) spawnReactant();

function drawMolecule(x,y,color,label,r,glow){
  r=r||10;
  if(glow){ctx.shadowColor=color;ctx.shadowBlur=16;}
  ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);
  ctx.fillStyle='#0f172a';ctx.fill();
  ctx.strokeStyle=color;ctx.lineWidth=2;ctx.stroke();
  ctx.shadowBlur=0;
  ctx.fillStyle=color;ctx.font='bold '+(r>9?'8':'7')+'px monospace';
  ctx.textAlign='center';ctx.textBaseline='middle';
  ctx.fillText(label,x,y);
}

function drawStage(x,y,w,h,label,sublabel,color,slow){
  ctx.fillStyle=color+'11';ctx.beginPath();ctx.roundRect(x,y,w,h,8);ctx.fill();
  ctx.strokeStyle=color+(slow?'':'66');ctx.lineWidth=slow?2:1.5;
  ctx.beginPath();ctx.roundRect(x,y,w,h,8);ctx.stroke();
  ctx.fillStyle=color;ctx.font='bold 11px monospace';ctx.textAlign='center';
  ctx.fillText(label,x+w/2,y+16);
  ctx.fillStyle='rgba(255,255,255,0.35)';ctx.font='9px monospace';
  ctx.fillText(sublabel,x+w/2,y+30);
  if(slow){
    ctx.fillStyle='rgba(248,113,113,0.7)';ctx.font='bold 9px monospace';
    ctx.fillText('\u23f1 SLOW — rate-determining',x+w/2,y+h-10);
  } else {
    ctx.fillStyle='rgba(74,222,128,0.7)';ctx.font='bold 9px monospace';
    ctx.fillText('\u26a1 FAST',x+w/2,y+h-10);
  }
}

function draw(){
  ctx.clearRect(0,0,W,H);
  ctx.fillStyle='#0a0f1e';ctx.fillRect(0,0,W,H);

  // Layout
  var s1x=110,s1y=80,s1w=160,s1h=140;
  var s2x=410,s2y=80,s2w=120,s2h=140;
  var arrowY=H/2;

  // Stages
  drawStage(s1x,s1y,s1w,s1h,'Step 1','A + A \u2192 Int + C','#f87171',true);
  drawStage(s2x,s2y,s2w,s2h,'Step 2','Int + B \u2192 P','#4ade80',false);

  // Arrows between stages
  ctx.strokeStyle='rgba(255,255,255,0.2)';ctx.lineWidth=1.5;
  ctx.beginPath();ctx.moveTo(s1x+s1w+8,arrowY);ctx.lineTo(s2x-10,arrowY);ctx.stroke();
  ctx.beginPath();ctx.moveTo(s2x-18,arrowY-5);ctx.lineTo(s2x-10,arrowY);ctx.lineTo(s2x-18,arrowY+5);ctx.stroke();
  ctx.fillStyle='rgba(255,255,255,0.4)';ctx.font='10px monospace';ctx.textAlign='center';
  ctx.fillText('Intermediate',s1x+s1w+60,arrowY-12);

  // Spawn particles
  spawnTimer++;
  if(spawnTimer>=SPAWN_INTERVAL){spawnTimer=0;spawnReactant();}

  // Move reactants toward step 1
  reactantPool.forEach(function(p){
    p.x+=(s1x+s1w/2-p.x)*0.015;
    p.y+=(arrowY-p.y)*0.015;
    p.phase+=0.05;
    var jx=Math.sin(p.phase)*3;
    drawMolecule(p.x+jx,p.y,'#38bdf8','A',9);
  });

  // Feed step 1
  if(!step1Active&&reactantPool.length>=2){
    step1Active={};step1Progress=0;
    reactantPool.splice(0,2);
  }

  if(step1Active){
    step1Progress++;
    var frac=step1Progress/STEP1_TIME;
    // Draw progress bar inside step 1
    var pbW=(s1w-20)*frac;
    ctx.fillStyle='rgba(248,113,113,0.2)';ctx.fillRect(s1x+10,arrowY-10,s1w-20,12);
    ctx.fillStyle='#f87171';ctx.fillRect(s1x+10,arrowY-10,pbW,12);
    ctx.fillStyle='rgba(255,255,255,0.5)';ctx.font='8px monospace';ctx.textAlign='center';
    ctx.fillText(Math.round(frac*100)+'%',s1x+s1w/2,arrowY-3);

    if(step1Progress>=STEP1_TIME){
      step1Active=null;step1Progress=0;
      intermediatePool.push({x:s1x+s1w+20,y:arrowY,phase:Math.random()*Math.PI*2});
    }
  }

  // Move intermediates
  intermediatePool.forEach(function(p){
    p.x+=(s2x-20-p.x)*0.06;
    p.phase+=0.05;
    var jy=Math.sin(p.phase)*2;
    drawMolecule(p.x,p.y+jy,'#a78bfa','Int',9);
  });

  // Feed step 2
  if(!step2Active&&intermediatePool.length>0){
    step2Active={};step2Progress=0;
    intermediatePool.splice(0,1);
  }

  if(step2Active){
    step2Progress++;
    var frac2=step2Progress/STEP2_TIME;
    var pbW2=(s2w-20)*frac2;
    ctx.fillStyle='rgba(74,222,128,0.2)';ctx.fillRect(s2x+10,arrowY-10,s2w-20,12);
    ctx.fillStyle='#4ade80';ctx.fillRect(s2x+10,arrowY-10,pbW2,12);
    ctx.fillStyle='rgba(255,255,255,0.5)';ctx.font='8px monospace';ctx.textAlign='center';
    ctx.fillText(Math.round(frac2*100)+'%',s2x+s2w/2,arrowY-3);

    if(step2Progress>=STEP2_TIME){
      step2Active=null;step2Progress=0;
      productPool.push({x:s2x+s2w+20,y:50+Math.random()*(H-100),life:180});
    }
  }

  // Products drift right
  productPool=productPool.filter(function(p){return p.life>0;});
  productPool.forEach(function(p){
    p.x+=0.6;p.life--;
    var alpha=Math.min(p.life/30,1);
    ctx.globalAlpha=alpha;
    drawMolecule(p.x,p.y,'#4ade80','P',9);
    ctx.globalAlpha=1;
  });

  // Labels
  ctx.fillStyle='rgba(255,255,255,0.6)';ctx.font='bold 12px monospace';ctx.textAlign='left';
  ctx.fillText('Reactants (A)',14,arrowY-4);
  ctx.fillStyle='rgba(255,255,255,0.3)';ctx.font='10px monospace';
  ctx.fillText('('+reactantPool.length+' waiting)',14,arrowY+12);
  ctx.fillStyle='rgba(74,222,128,0.7)';ctx.font='bold 12px monospace';ctx.textAlign='right';
  ctx.fillText('Products',W-14,arrowY-4);

  // Bottleneck annotation
  ctx.fillStyle='rgba(248,113,113,0.6)';ctx.font='bold 11px monospace';ctx.textAlign='center';
  ctx.fillText('Overall rate = rate of Step 1 (slowest step)',W/2,H-14);

  t++;requestAnimationFrame(draw);
}
draw();`,
      outputHeight: 320,
    },

    // ── Challenge 3 ─────────────────────────────────────────────────────────────
    {
      type: 'challenge',
      instruction: `The experimentally determined rate law for the reaction 2NO(g) + O₂(g) → 2NO₂(g) is: rate = k[NO]²[O₂]. A student argues that since 2NO means two NO molecules react, the exponent for NO should be 2 — so the rate law matches the stoichiometry. Is this reasoning correct, and why?`,
      options: [
        { label: 'A', text: 'Yes — stoichiometric coefficients always give the reaction orders directly' },
        { label: 'B', text: 'No — for this specific reaction, the rate law happens to match the stoichiometry, but this is coincidental. In general, reaction orders must be determined experimentally and often don\'t match stoichiometric coefficients' },
        { label: 'C', text: 'No — you must always divide the stoichiometric coefficients by 2 to get reaction orders' },
        { label: 'D', text: 'Yes — for reactions involving gases only, stoichiometric coefficients always equal reaction orders' },
      ],
      check: (label) => label === 'B',
      successMessage: "Correct! The student's conclusion happens to be right for this reaction, but the reasoning is wrong. Reaction orders must always be determined experimentally. For this particular reaction, the mechanism happens to involve a termolecular (or effectively termolecular) step, so the rate law matches the stoichiometry. But for the NO₂ + CO reaction we discussed, rate = k[NO₂]² even though CO appears in the balanced equation — because CO is in a fast step that doesn't affect the rate.",
      failMessage: "This is a crucial conceptual point: reaction orders are NOT determined by stoichiometric coefficients — they must be found experimentally. For this specific reaction, the rate law happens to match the balanced equation, but this is coincidental. Many reactions have rate laws that look nothing like their balanced equations — like the NO₂ + CO example where rate = k[NO₂]² even though CO appears as a reactant.",
      html: '', css: `body{margin:0;padding:0;font-family:sans-serif}`, startCode: '',
      outputHeight: 300,
    },

    // ── Challenge 4 ─────────────────────────────────────────────────────────────
    {
      type: 'challenge',
      instruction: `In an experiment, doubling the concentration of A while keeping [B] constant doubled the reaction rate. Doubling [B] while keeping [A] constant had no effect on the rate. What is the rate law?`,
      options: [
        { label: 'A', text: 'rate = k[A][B]' },
        { label: 'B', text: 'rate = k[A]²' },
        { label: 'C', text: 'rate = k[A]' },
        { label: 'D', text: 'rate = k[B]' },
      ],
      check: (label) => label === 'C',
      successMessage: "Correct! Doubling [A] doubles the rate → rate ∝ [A]¹ → first order in A. Doubling [B] has no effect → rate ∝ [B]⁰ → zero order in B (B doesn't appear in the rate law). Overall rate law: rate = k[A]. This might occur if B is involved only in a fast step after the rate-determining step.",
      failMessage: "Analyse each reactant separately. Doubling [A] doubles the rate → the exponent for A is 1 (first order). Doubling [B] has no effect → the exponent for B is 0 (zero order — B doesn't appear in the rate law). Combining: rate = k[A]¹[B]⁰ = k[A].",
      html: '', css: `body{margin:0;padding:0;font-family:sans-serif}`, startCode: '',
      outputHeight: 300,
    },

    // ── Closing ──────────────────────────────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `### Reaction Rates: The Four Levers

Every factor that controls reaction rate maps onto collision theory's three requirements: collisions must happen, they must have sufficient energy, and they must have the correct orientation.

**Concentration** increases collision frequency — straightforward. More particles per unit volume means more encounters per unit time. This is captured quantitatively by the rate law: rate = k[A]^m[B]^n.

**Temperature** increases the fraction of collisions with E ≥ Eₐ — an exponential relationship captured by the Arrhenius equation. A modest temperature increase produces a large rate increase because the Maxwell-Boltzmann tail grows rapidly.

**Surface area** increases collision frequency for heterogeneous reactions. A solid reactant can only react at its surface. Grinding it to powder creates an enormous surface-to-mass ratio.

**Catalysts** lower the activation energy — the barrier itself — without changing the net reaction energy. More molecules can surmount a lower barrier, so the rate constant k increases. The reaction pathway changes; the thermodynamics do not.

These four levers are used continuously in industrial chemistry: the Haber process for ammonia (high pressure = high concentration, high temperature, iron catalyst) optimises all four simultaneously. Every industrial chemical process is an exercise in rate optimisation.

In the next lesson, we'll see what happens when a reaction doesn't go to completion — when forward and reverse reactions reach a balance point called equilibrium.`,
    },

  ],
};

export default {
  id: 'chem-4-2-reaction-rates',
  slug: 'reaction-rates',
  chapter: 'chem.4',
  order: 2,
  title: 'Reaction Rates',
  subtitle: 'What determines how fast a reaction goes — and how to control it.',
  tags: ['chemistry', 'reaction-rates', 'collision-theory', 'rate-law', 'Arrhenius', 'activation-energy', 'catalysis', 'concentration', 'temperature', 'surface-area'],
  hook: {
    question: 'Iron rusts in years; TNT explodes in microseconds. Both are chemical reactions. What makes the difference — and how do chemists control reaction speed?',
    realWorldContext: 'Rate control is the core skill of industrial chemistry. The Haber process, drug design, food preservation, and enzyme engineering all depend on precisely manipulating the four factors — concentration, temperature, surface area, and catalysts — that govern how fast chemistry happens.',
    previewVisualizationId: 'ScienceNotebook',
  },
  intuition: {
    prose: [
      'Rate requires: collision + sufficient energy (E ≥ Eₐ) + correct orientation.',
      'Four factors: concentration (collision frequency), temperature (energy fraction), surface area (heterogeneous collision frequency), catalyst (lowers Eₐ).',
      'Rate law: rate = k[A]^m[B]^n. Orders m, n determined by experiment, not from stoichiometry.',
      'Arrhenius: k = A·e^(−Ea/RT). Rate roughly doubles per 10°C for Eₐ ≈ 50–60 kJ/mol.',
      'Rate-determining step: slowest step in mechanism controls overall rate. Rate law reflects slow step stoichiometry.',
    ],
    callouts: [
      { type: 'important', title: 'Rate orders ≠ stoichiometric coefficients', body: 'The exponents in the rate law must be determined experimentally. They often differ from the balanced equation coefficients because the rate depends on the mechanism — specifically the rate-determining step — not the overall stoichiometry.' },
    ],
    visualizations: [{ id: 'ScienceNotebook', title: 'Reaction Rates', props: { lesson: LESSON_CHEM_4_2 } }],
  },
  math: { prose: [], callouts: [], visualizations: [] },
  rigor: { prose: [], callouts: [], visualizations: [] },
  examples: [],
  challenges: [],
  mentalModel: [
    'Rate = k[A]^m[B]^n. k depends on T and Ea. Orders m,n from experiment only.',
    'Collision theory: rate ∝ (frequency) × (fraction E≥Ea) × (steric factor).',
    'Arrhenius: k = A·e^(−Ea/RT). ln(k₂/k₁) = (Ea/R)(1/T₁ − 1/T₂).',
    'Four rate factors: [concentration] → collision freq; T → Boltzmann fraction; surface area → heterogeneous collision; catalyst → lowers Ea.',
    'Mechanism: sequence of elementary steps. Rate law matches rate-determining (slowest) step.',
    'Industrial example: Haber process (N₂ + 3H₂ → 2NH₃) uses high P, ~400°C, Fe catalyst to optimise all four factors.',
  ],
  checkpoints: ['read-intuition'],
  quiz: [],
};

export { LESSON_CHEM_4_2 };
