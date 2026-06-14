// Chemistry · Chapter 3 · Lesson 2
// Solutions and Mixtures

const LESSON_CHEM_3_2 = {
  title: 'Solutions and Mixtures',
  subtitle: 'Why some things dissolve and others don\'t — and what "like dissolves like" really means.',
  sequential: true,

  cells: [

    // ── Section 1 ───────────────────────────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `### The Question Every Cook and Chemist Asks

Why does salt dissolve in water but not in oil? Why does grease dissolve in gasoline but not in water? Why does sugar disappear into coffee but wax floats on top? Why can you mix ethanol and water in any proportion, but add a drop of olive oil and it beads up immediately?

These are not isolated curiosities — they all follow from one principle, one of the most useful in all of chemistry:

**Like dissolves like.**

Polar solvents dissolve polar and ionic solutes. Nonpolar solvents dissolve nonpolar solutes. The rule is simple to state, but understanding *why* it is true requires thinking about intermolecular forces — specifically, about what happens at the molecular level when a solute encounters a solvent.

When a solute dissolves, its particles must separate from each other and become surrounded by solvent molecules. For this to happen spontaneously, the **solute-solvent interactions** must be comparable to or stronger than the **solute-solute** and **solvent-solvent** interactions that must be disrupted. If the solute and solvent are "like" — meaning they have similar types of intermolecular forces — this energy balance works out. If they are "unlike," the disruption costs more energy than the new interactions provide, and the solute stays undissolved.

This chapter builds that picture from the ground up: what a solution is, how dissolution works step by step, what determines solubility, and how the same principles that govern salt in water also govern why your cell membranes exist.`,
    },

    // ── Section 2 ───────────────────────────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `### Mixtures, Solutions, and Pure Substances

Before diving into dissolution, let's establish the vocabulary precisely.

A **pure substance** has a fixed composition throughout — every sample has the same properties. Elements (pure copper, pure oxygen) and compounds (pure water, pure salt) are pure substances.

A **mixture** contains two or more pure substances combined in variable proportions. The components retain their individual identities and can, in principle, be separated by physical means.

Mixtures come in two types:

**Heterogeneous mixtures** are physically non-uniform — you can see different regions with different compositions. Sand and water, oil and vinegar, granite. If you zoom in on different spots, you get different compositions.

**Homogeneous mixtures** are physically uniform throughout — every part looks and behaves the same. Salt water, air, bronze (copper + tin alloy), white wine. No matter where you sample, you get the same composition. A homogeneous mixture is called a **solution**.

In a solution:
- The **solvent** is the component present in the larger amount (or the one doing the dissolving). In salt water, water is the solvent.
- The **solute** is the component present in smaller amount (or the one being dissolved). Salt is the solute.
- The solution takes on the phase of the solvent. Most solutions we discuss are aqueous (water as solvent), but solutions can be liquid-liquid (ethanol in water), solid-liquid (salt in water), gas-liquid (CO₂ in water, i.e. fizzy drinks), solid-solid (alloys), or even gas-gas (air).

The distinction between heterogeneous and homogeneous mixtures depends on scale — technically, if you zoom in far enough, every mixture is heterogeneous at the molecular level. "Homogeneous" means uniform at the scale you're observing.`,
    },

    // ── Visual 1 — Mixture types ────────────────────────────────────────────────
    {
      type: 'js',
      instruction: `### Pure substance, heterogeneous mixture, solution — side by side

The three panels show particle-level views. A pure substance has only one type of particle arranged uniformly. A heterogeneous mixture has regions of different composition. A solution has two types of particles completely intermixed at the molecular level — indistinguishable by region.`,
      html: `<canvas id="cv" width="700" height="280"></canvas>`,
      css: `body{margin:0;background:#0a0f1e;display:flex;justify-content:center}
canvas{display:block;width:100%;max-width:700px}`,
      startCode: `var canvas=document.getElementById('cv');
var ctx=canvas.getContext('2d');
var W=canvas.width,H=canvas.height;
var t=0;

var panelW=W/3;
var pad=14,r=8;

// Pure substance: uniform grid of blue particles
var pureParticles=[];
for(var row=0;row<5;row++){
  for(var col=0;col<5;col++){
    pureParticles.push({
      x:pad+col*(panelW-pad*2)/4,
      y:40+row*(H-100)/4,
      phase:Math.random()*Math.PI*2
    });
  }
}

// Heterogeneous: two clusters of different particles
var hetParticles=[];
// Left cluster (blue)
for(var i=0;i<12;i++){
  hetParticles.push({x:panelW+20+Math.random()*100,y:40+Math.random()*(H-90),color:'#38bdf8',r2:8});
}
// Right cluster (orange)
for(var j=0;j<12;j++){
  hetParticles.push({x:panelW+145+Math.random()*80,y:40+Math.random()*(H-90),color:'#fb923c',r2:7});
}

// Solution: intermixed particles
var solParticles=[];
for(var k=0;k<18;k++){
  solParticles.push({
    x:panelW*2+14+Math.random()*(panelW-28),
    y:38+Math.random()*(H-88),
    color:k%3===0?'#fb923c':'#38bdf8',
    r2:k%3===0?7:8,
    vx:(Math.random()-0.5)*0.5,
    vy:(Math.random()-0.5)*0.5,
    phase:Math.random()*Math.PI*2
  });
}

function draw(){
  ctx.clearRect(0,0,W,H);
  ctx.fillStyle='#0a0f1e';ctx.fillRect(0,0,W,H);

  // Panel borders
  [0,panelW,panelW*2].forEach(function(px,i){
    ctx.fillStyle='rgba(255,255,255,0.03)';
    ctx.fillRect(px+2,2,panelW-4,H-4);
    ctx.strokeStyle='rgba(255,255,255,0.1)';ctx.lineWidth=1;
    ctx.strokeRect(px+2,2,panelW-4,H-4);
  });

  // ── PURE SUBSTANCE ──
  pureParticles.forEach(function(p){
    var ox=Math.sin(t*0.06+p.phase)*1.5;
    var oy=Math.cos(t*0.07+p.phase)*1.5;
    ctx.beginPath();ctx.arc(p.x+ox,p.y+oy,r,0,Math.PI*2);
    ctx.fillStyle='#0f172a';ctx.fill();
    ctx.strokeStyle='#38bdf8';ctx.lineWidth=1.8;ctx.stroke();
    ctx.fillStyle='#38bdf8';ctx.font='bold 7px monospace';
    ctx.textAlign='center';ctx.textBaseline='middle';
    ctx.fillText('A',p.x+ox,p.y+oy);
  });
  ctx.fillStyle='rgba(255,255,255,0.7)';ctx.font='bold 12px monospace';ctx.textAlign='center';
  ctx.fillText('Pure Substance',panelW/2,H-30);
  ctx.fillStyle='rgba(255,255,255,0.35)';ctx.font='10px monospace';
  ctx.fillText('one component, uniform',panelW/2,H-14);

  // ── HETEROGENEOUS ──
  hetParticles.forEach(function(p){
    ctx.beginPath();ctx.arc(p.x,p.y,p.r2,0,Math.PI*2);
    ctx.fillStyle='#0f172a';ctx.fill();
    ctx.strokeStyle=p.color;ctx.lineWidth=1.8;ctx.stroke();
    ctx.fillStyle=p.color;ctx.font='bold 7px monospace';
    ctx.textAlign='center';ctx.textBaseline='middle';
    ctx.fillText(p.color==='#38bdf8'?'A':'B',p.x,p.y);
  });
  // Boundary line between clusters
  ctx.strokeStyle='rgba(255,255,255,0.15)';ctx.lineWidth=1;ctx.setLineDash([4,4]);
  ctx.beginPath();ctx.moveTo(panelW+130,20);ctx.lineTo(panelW+130,H-20);ctx.stroke();ctx.setLineDash([]);

  ctx.fillStyle='rgba(255,255,255,0.7)';ctx.font='bold 12px monospace';ctx.textAlign='center';
  ctx.fillText('Heterogeneous Mixture',panelW+panelW/2,H-30);
  ctx.fillStyle='rgba(255,255,255,0.35)';ctx.font='10px monospace';
  ctx.fillText('distinct regions visible',panelW+panelW/2,H-14);

  // ── SOLUTION ──
  solParticles.forEach(function(p){
    p.x+=p.vx;p.y+=p.vy;
    p.vx+=(Math.random()-0.5)*0.04;p.vy+=(Math.random()-0.5)*0.04;
    p.vx=Math.max(-0.8,Math.min(0.8,p.vx));p.vy=Math.max(-0.8,Math.min(0.8,p.vy));
    if(p.x<panelW*2+10){p.x=panelW*2+10;p.vx=Math.abs(p.vx);}
    if(p.x>W-10){p.x=W-10;p.vx=-Math.abs(p.vx);}
    if(p.y<36){p.y=36;p.vy=Math.abs(p.vy);}
    if(p.y>H-36){p.y=H-36;p.vy=-Math.abs(p.vy);}
    ctx.beginPath();ctx.arc(p.x,p.y,p.r2,0,Math.PI*2);
    ctx.fillStyle='#0f172a';ctx.fill();
    ctx.strokeStyle=p.color;ctx.lineWidth=1.8;ctx.stroke();
    ctx.fillStyle=p.color;ctx.font='bold 7px monospace';
    ctx.textAlign='center';ctx.textBaseline='middle';
    ctx.fillText(p.color==='#38bdf8'?'A':'B',p.x,p.y);
  });
  ctx.fillStyle='rgba(255,255,255,0.7)';ctx.font='bold 12px monospace';ctx.textAlign='center';
  ctx.fillText('Solution',panelW*2+panelW/2,H-30);
  ctx.fillStyle='rgba(255,255,255,0.35)';ctx.font='10px monospace';
  ctx.fillText('uniform at molecular level',panelW*2+panelW/2,H-14);

  t++;requestAnimationFrame(draw);
}
draw();`,
      outputHeight: 300,
    },

    // ── Section 3 ───────────────────────────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `### How Dissolution Works: A Three-Step Energy Model

To understand why something dissolves — or doesn't — think of the process in three steps. Each step involves breaking or forming intermolecular forces, and therefore involves energy.

**Step 1: Separate the solute particles.**
To dissolve, solute particles must break away from each other. This requires overcoming the intermolecular forces (or lattice energy, for ionic solids) holding the solute together. This step always **costs energy** (endothermic). For NaCl, this means overcoming the electrostatic attractions in the crystal lattice — a very large energy cost (787 kJ/mol).

**Step 2: Separate solvent molecules to make room.**
The solvent molecules must spread apart to create a cavity for the incoming solute particle. This breaks solvent-solvent intermolecular forces. This step also **costs energy**. For water, this means partially disrupting the hydrogen bond network.

**Step 3: Solute particles interact with solvent molecules.**
The solute particles fill the cavities and interact with solvent molecules. This step **releases energy** (exothermic). For NaCl in water, the δ− oxygen of water interacts strongly with Na⁺ and the δ+ hydrogens interact strongly with Cl⁻ — this is called **hydration** (or more generally, **solvation**).

The **enthalpy of solution** (ΔH_solution) is the net energy: Step 3 energy released minus Steps 1 and 2 energy costs.

If ΔH_solution is negative (exothermic, energy released), the dissolution is energetically favourable. If it's positive (endothermic, energy absorbed), dissolution requires energy input.

But here's the critical insight: **many substances dissolve even when ΔH_solution is positive** — even when dissolution is endothermic. This is because dissolution also involves an increase in **entropy** — the dispersal of ordered particles into a more random arrangement. Entropy is the second thermodynamic driving force for dissolution, and for many solutes, the entropy gain is enough to drive dissolution even when the enthalpy is unfavourable. We will explore entropy more in the reactions chapter.`,
    },

    // ── Visual 2 — NaCl dissolution animation ──────────────────────────────────
    {
      type: 'js',
      instruction: `### NaCl dissolving in water — step by step

Watch water molecules orient around the crystal surface: oxygen atoms (red) point toward Na⁺ ions, hydrogen atoms point toward Cl⁻ ions. Ions are pulled out one by one and become surrounded by a hydration shell. The process is driven by the favourable ion-dipole interactions between the ions and polar water molecules.`,
      html: `<canvas id="cv" width="700" height="340"></canvas>`,
      css: `body{margin:0;background:#0a0f1e;display:flex;justify-content:center}
canvas{display:block;width:100%;max-width:700px}`,
      startCode: `var canvas=document.getElementById('cv');
var ctx=canvas.getContext('2d');
var W=canvas.width,H=canvas.height;
var t=0;

// Crystal: 4x3 grid on left
var crystalIons=[];
for(var row=0;row<3;row++){
  for(var col=0;col<4;col++){
    crystalIons.push({
      homeX:70+col*42,homeY:110+row*44,
      isNa:(row+col)%2===0,
      released:false,
      releaseTime:80+(row*4+col)*32,
      x:0,y:0,targetX:0,targetY:0,
      hydrated:false,hydrateTimer:0
    });
  }
}
crystalIons.forEach(function(ion){ion.x=ion.homeX;ion.y=ion.homeY;});

// Water molecules in the right half — and around crystal
var waterMols=[];
for(var w=0;w<22;w++){
  waterMols.push({
    x:300+Math.random()*370,
    y:30+Math.random()*(H-60),
    angle:Math.random()*Math.PI*2,
    targetAngle:Math.random()*Math.PI*2,
    nearIon:null
  });
}

function drawWater(x,y,angle,highlight){
  var ba=52*(Math.PI/180),bl=14;
  var baseA=angle+Math.PI/2;
  var h1x=x+Math.cos(baseA-ba)*bl,h1y=y+Math.sin(baseA-ba)*bl;
  var h2x=x+Math.cos(baseA+ba)*bl,h2y=y+Math.sin(baseA+ba)*bl;
  ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(h1x,h1y);
  ctx.strokeStyle=highlight?'rgba(248,113,113,0.9)':'rgba(248,113,113,0.5)';ctx.lineWidth=1.8;ctx.stroke();
  ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(h2x,h2y);
  ctx.strokeStyle=highlight?'rgba(248,113,113,0.9)':'rgba(248,113,113,0.5)';ctx.lineWidth=1.8;ctx.stroke();
  ctx.beginPath();ctx.arc(x,y,8,0,Math.PI*2);
  ctx.fillStyle='#0f172a';ctx.fill();
  ctx.strokeStyle=highlight?'#f87171':'rgba(248,113,113,0.6)';ctx.lineWidth=1.5;ctx.stroke();
  ctx.fillStyle=highlight?'#f87171':'rgba(248,113,113,0.7)';
  ctx.font='bold 7px monospace';ctx.textAlign='center';ctx.textBaseline='middle';
  ctx.fillText('O',x,y);
  [[h1x,h1y],[h2x,h2y]].forEach(function(h){
    ctx.beginPath();ctx.arc(h[0],h[1],5,0,Math.PI*2);
    ctx.fillStyle='#1e293b';ctx.fill();
    ctx.strokeStyle=highlight?'#e2e8f0':'rgba(148,163,184,0.5)';ctx.lineWidth=1;ctx.stroke();
    ctx.fillStyle=highlight?'#e2e8f0':'rgba(148,163,184,0.6)';
    ctx.font='bold 6px monospace';ctx.fillText('H',h[0],h[1]);
  });
}

function drawIon(x,y,isNa,r){
  r=r||11;
  var color=isNa?'#f97316':'#a78bfa';
  ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);
  ctx.fillStyle=color;ctx.fill();
  ctx.fillStyle='#fff';ctx.font='bold '+(r>9?9:7)+'px monospace';
  ctx.textAlign='center';ctx.textBaseline='middle';
  ctx.fillText(isNa?'Na+':'Cl-',x,y);
}

function draw(){
  ctx.clearRect(0,0,W,H);
  ctx.fillStyle='#0a0f1e';ctx.fillRect(0,0,W,H);

  // Water background (right)
  ctx.fillStyle='rgba(14,116,144,0.1)';ctx.fillRect(250,0,W-250,H);

  // Water molecules — orient near released ions
  var releasedIons=crystalIons.filter(function(ion){return ion.released;});
  waterMols.forEach(function(wm){
    // Drift gently
    wm.angle+=Math.sin(t*0.01+wm.x)*0.01;
    wm.x+=Math.cos(wm.angle*0.3)*0.2;
    wm.y+=Math.sin(wm.angle*0.4)*0.2;
    if(wm.x<255){wm.x=255;}
    if(wm.x>W-18){wm.x=W-18;}
    if(wm.y<18){wm.y=18;}
    if(wm.y>H-18){wm.y=H-18;}

    // Orient toward nearest released ion
    var nearDist=999,nearIon=null;
    releasedIons.forEach(function(ion){
      var d=Math.sqrt(Math.pow(wm.x-ion.x,2)+Math.pow(wm.y-ion.y,2));
      if(d<55&&d<nearDist){nearDist=d;nearIon=ion;}
    });

    var highlight=false;
    if(nearIon&&nearDist<55){
      // Point O toward Na+, H toward Cl-
      var targetA=Math.atan2(nearIon.y-wm.y,nearIon.x-wm.x);
      if(nearIon.isNa){
        // O points toward Na+
        var diff=targetA-wm.angle;
        while(diff>Math.PI)diff-=Math.PI*2;
        while(diff<-Math.PI)diff+=Math.PI*2;
        wm.angle+=diff*0.06;
      } else {
        // H points toward Cl- (O points away)
        var targetA2=targetA+Math.PI;
        var diff2=targetA2-wm.angle;
        while(diff2>Math.PI)diff2-=Math.PI*2;
        while(diff2<-Math.PI)diff2+=Math.PI*2;
        wm.angle+=diff2*0.06;
      }
      highlight=nearDist<35;

      // Draw orientation line
      if(nearDist<45){
        ctx.beginPath();ctx.moveTo(wm.x,wm.y);ctx.lineTo(nearIon.x,nearIon.y);
        ctx.strokeStyle='rgba(250,204,21,'+(0.4*(1-nearDist/55))+')';
        ctx.lineWidth=1;ctx.setLineDash([3,3]);ctx.stroke();ctx.setLineDash([]);
      }
    }
    drawWater(wm.x,wm.y,wm.angle,highlight);
  });

  // Crystal bonds
  for(var i=0;i<crystalIons.length;i++){
    for(var j=i+1;j<crystalIons.length;j++){
      var a=crystalIons[i],b=crystalIons[j];
      if(a.released||b.released)continue;
      if(Math.abs(a.homeX-b.homeX)+Math.abs(a.homeY-b.homeY)===42){
        ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);
        ctx.strokeStyle='rgba(255,255,255,0.15)';ctx.lineWidth=1.5;ctx.stroke();
      }
    }
  }

  // Update ions
  crystalIons.forEach(function(ion){
    if(!ion.released&&t>ion.releaseTime){
      ion.released=true;
      ion.targetX=310+Math.random()*340;
      ion.targetY=40+Math.random()*(H-80);
    }
    if(ion.released){
      var dx=ion.targetX-ion.x,dy=ion.targetY-ion.y;
      ion.x+=dx*0.018;ion.y+=dy*0.018;
      if(Math.abs(dx)<8&&Math.abs(dy)<8){
        ion.targetX=310+Math.random()*340;
        ion.targetY=40+Math.random()*(H-80);
      }
    }
    drawIon(ion.x,ion.y,ion.isNa,11);
  });

  // Labels
  ctx.fillStyle='rgba(255,255,255,0.5)';ctx.font='12px monospace';ctx.textAlign='center';
  ctx.fillText('NaCl crystal',135,H-16);
  ctx.fillText('Aqueous solution',490,H-16);

  ctx.fillStyle='rgba(250,204,21,0.6)';ctx.font='10px monospace';ctx.textAlign='center';
  ctx.fillText('Ion-dipole interactions orient water molecules',W/2,18);

  t++;requestAnimationFrame(draw);
}
draw();`,
      outputHeight: 360,
    },

    // ── Challenge 1 ─────────────────────────────────────────────────────────────
    {
      type: 'challenge',
      instruction: `When ammonium nitrate (NH₄NO₃) dissolves in water, the solution becomes noticeably cold. This is used in instant cold packs. What does this tell you about the enthalpy of solution?`,
      options: [
        { label: 'A', text: 'The enthalpy of solution is negative (exothermic) — energy is released to the surroundings' },
        { label: 'B', text: 'The enthalpy of solution is positive (endothermic) — the dissolution absorbs heat from the surroundings, cooling them' },
        { label: 'C', text: 'Temperature change has nothing to do with enthalpy — it is caused by pressure changes' },
        { label: 'D', text: 'The solution cools because water molecules slow down when surrounded by ions' },
      ],
      check: (label) => label === 'B',
      successMessage: "Correct! When the solution feels cold, it is absorbing heat from your hand and surroundings. This means the dissolution is endothermic — ΔH_solution is positive (+25.7 kJ/mol for NH₄NO₃). The energy cost of separating the lattice and separating water molecules exceeds the energy released by ion-water interactions. Yet it still dissolves spontaneously because of the large entropy increase.",
      failMessage: "If the solution gets cold, it is taking heat energy from the surroundings — the dissolution is absorbing energy, making it endothermic (ΔH > 0). The cost of breaking apart the crystal lattice and disrupting water's hydrogen bond network exceeds the energy released when ions interact with water molecules. Cold packs work exactly because NH₄NO₃ dissolution is endothermic.",
      html: '', css: `body{margin:0;padding:0;font-family:sans-serif}`, startCode: '',
      outputHeight: 300,
    },

    // ── Section 4 ───────────────────────────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `### Like Dissolves Like: The Molecular Explanation

"Like dissolves like" is a rule about intermolecular forces. Let's unpack it precisely.

**Polar solvent + ionic/polar solute → dissolves.**
Water is highly polar with strong hydrogen bonds and ion-dipole capabilities. When NaCl enters water, the ion-dipole interactions between water's δ+ hydrogens and Cl⁻, and between water's δ− oxygens and Na⁺, are strong enough to compensate for the lattice energy and the cost of disrupting water's hydrogen bond network. Salt dissolves.

When glucose (a polar molecule with many O–H groups) enters water, it can form hydrogen bonds with water molecules all around it. The glucose-water hydrogen bonds are energetically similar to the water-water and glucose-glucose hydrogen bonds they replace. Glucose dissolves readily.

**Polar solvent + nonpolar solute → doesn't dissolve.**
When a nonpolar molecule like hexane (C₆H₁₄) is dropped into water, it can only offer weak London dispersion forces. But to make room for hexane, water must break strong hydrogen bonds. The energy balance is hugely unfavourable — and as we saw in the Water lesson, the **hydrophobic effect** drives nonpolar molecules together to minimise the disruption of water's H-bond network. Hexane floats on water.

**Nonpolar solvent + nonpolar solute → dissolves.**
When iodine (I₂, nonpolar) is added to hexane (nonpolar), the London dispersion forces between I₂ and hexane molecules are similar in kind and strength to the I₂–I₂ and hexane–hexane London forces. The energy balance is approximately neutral. I₂ dissolves readily in hexane, giving a pink-purple solution. The same I₂ barely dissolves in water.

**Nonpolar solvent + ionic/polar solute → doesn't dissolve.**
NaCl won't dissolve in hexane because hexane has no dipoles to interact with the ions — it cannot provide anything comparable to the ion-dipole interactions that water provides. The lattice energy can't be compensated.`,
    },

    // ── Visual 3 — Like dissolves like interactive ──────────────────────────────
    {
      type: 'js',
      instruction: `### Like dissolves like — four combinations

Click each combination to see what happens at the molecular level. The simulation shows whether solute particles mix with the solvent or aggregate separately.`,
      html: `<div style="padding:10px 14px 0;background:#0a0f1e;display:grid;grid-template-columns:1fr 1fr;gap:8px;max-width:700px">
  <button id="btn-pw" style="padding:7px;border-radius:8px;border:1.5px solid #38bdf8;background:rgba(56,189,248,0.2);color:#38bdf8;font-family:monospace;font-size:11px;font-weight:700;cursor:pointer">💧 Water + NaCl (polar+ionic)</button>
  <button id="btn-po" style="padding:7px;border-radius:8px;border:1.5px solid rgba(255,255,255,0.2);background:transparent;color:rgba(255,255,255,0.4);font-family:monospace;font-size:11px;font-weight:700;cursor:pointer">💧 Water + Hexane (polar+nonpolar)</button>
  <button id="btn-np" style="padding:7px;border-radius:8px;border:1.5px solid rgba(255,255,255,0.2);background:transparent;color:rgba(255,255,255,0.4);font-family:monospace;font-size:11px;font-weight:700;cursor:pointer">🛢 Hexane + I₂ (nonpolar+nonpolar)</button>
  <button id="btn-ni" style="padding:7px;border-radius:8px;border:1.5px solid rgba(255,255,255,0.2);background:transparent;color:rgba(255,255,255,0.4);font-family:monospace;font-size:11px;font-weight:700;cursor:pointer">🛢 Hexane + NaCl (nonpolar+ionic)</button>
</div>
<canvas id="cv" width="700" height="290"></canvas>`,
      css: `body{margin:0;background:#0a0f1e;font-family:monospace}
canvas{display:block;width:100%;max-width:700px}`,
      startCode: `var canvas=document.getElementById('cv');
var ctx=canvas.getContext('2d');
var W=canvas.width,H=canvas.height;
var t=0;
var mode='pw';

var configs={
  pw:{label:'Water + NaCl',result:'DISSOLVES',color:'#4ade80',
    solventColor:'#38bdf8',solventLabel:'H₂O',
    soluteColor1:'#f97316',soluteColor2:'#a78bfa',
    soluteLabel:'Na⁺/Cl⁻',mixed:true,
    desc:'Ion-dipole interactions: water\\'s δ− O attracts Na⁺; δ+ H attracts Cl⁻. Electrostatic energy compensates lattice energy.'},
  po:{label:'Water + Hexane',result:'DOES NOT DISSOLVE',color:'#f87171',
    solventColor:'#38bdf8',solventLabel:'H₂O',
    soluteColor1:'#fbbf24',soluteColor2:'#fbbf24',
    soluteLabel:'C₆H₁₄',mixed:false,
    desc:'Hexane is nonpolar — only London forces. Breaking water\\'s H-bonds costs too much. Hydrophobic effect clusters hexane together.'},
  np:{label:'Hexane + I₂',result:'DISSOLVES',color:'#4ade80',
    solventColor:'#fbbf24',solventLabel:'C₆H₁₄',
    soluteColor1:'#a78bfa',soluteColor2:'#a78bfa',
    soluteLabel:'I₂',mixed:true,
    desc:'Both nonpolar — London forces throughout. Similar IMF types means disruption cost ≈ new interaction energy. I₂ disperses freely.'},
  ni:{label:'Hexane + NaCl',result:'DOES NOT DISSOLVE',color:'#f87171',
    solventColor:'#fbbf24',solventLabel:'C₆H₁₄',
    soluteColor1:'#f97316',soluteColor2:'#a78bfa',
    soluteLabel:'Na⁺/Cl⁻',mixed:false,
    desc:'Hexane has no dipoles or charges — cannot compensate NaCl lattice energy. Ions stay together; hexane stays separate.'},
};

var btns={pw:'btn-pw',po:'btn-po',np:'btn-np',ni:'btn-ni'};
Object.keys(btns).forEach(function(k){
  document.getElementById(btns[k]).onclick=function(){
    mode=k;
    Object.keys(btns).forEach(function(k2){
      var b=document.getElementById(btns[k2]);
      var c=configs[k2];
      b.style.borderColor=k2===k?c.solventColor:'rgba(255,255,255,0.2)';
      b.style.background=k2===k?c.solventColor+'22':'transparent';
      b.style.color=k2===k?c.solventColor:'rgba(255,255,255,0.4)';
    });
  };
});

// Particles
var solventP=[],soluteP=[];
function initParticles(cfg){
  solventP=[];soluteP=[];
  for(var i=0;i<28;i++){
    solventP.push({x:18+Math.random()*(W-36),y:18+Math.random()*(H-36),
      vx:(Math.random()-0.5)*1.2,vy:(Math.random()-0.5)*1.2});
  }
  for(var j=0;j<14;j++){
    var startX=cfg.mixed?(18+Math.random()*(W-36)):(W*0.6+Math.random()*W*0.35);
    var startY=cfg.mixed?(18+Math.random()*(H-36)):(18+Math.random()*(H-36));
    soluteP.push({x:startX,y:startY,
      vx:(Math.random()-0.5)*(cfg.mixed?1.0:0.3),
      vy:(Math.random()-0.5)*(cfg.mixed?1.0:0.3),
      colorIdx:j%2});
  }
}
initParticles(configs[mode]);
var lastMode=mode;

function draw(){
  if(mode!==lastMode){initParticles(configs[mode]);lastMode=mode;}
  ctx.clearRect(0,0,W,H);
  ctx.fillStyle='#0a0f1e';ctx.fillRect(0,0,W,H);
  var cfg=configs[mode];

  // If not mixed, draw a dividing boundary
  if(!cfg.mixed){
    ctx.fillStyle=cfg.solventColor+'08';ctx.fillRect(0,0,W*0.55,H);
    ctx.fillStyle=cfg.soluteColor1+'08';ctx.fillRect(W*0.55,0,W*0.45,H);
    ctx.strokeStyle='rgba(255,255,255,0.08)';ctx.lineWidth=1.5;ctx.setLineDash([6,4]);
    ctx.beginPath();ctx.moveTo(W*0.55,0);ctx.lineTo(W*0.55,H);ctx.stroke();ctx.setLineDash([]);
  }

  // Solvent particles
  solventP.forEach(function(p){
    p.x+=p.vx;p.y+=p.vy;
    p.vx+=(Math.random()-0.5)*0.08;p.vy+=(Math.random()-0.5)*0.08;
    p.vx=Math.max(-1.5,Math.min(1.5,p.vx));p.vy=Math.max(-1.5,Math.min(1.5,p.vy));
    if(!cfg.mixed){
      if(p.x>W*0.52){p.x=W*0.52;p.vx=-Math.abs(p.vx);}
    }
    if(p.x<10){p.x=10;p.vx=Math.abs(p.vx);}
    if(p.x>W-10){p.x=W-10;p.vx=-Math.abs(p.vx);}
    if(p.y<10){p.y=10;p.vy=Math.abs(p.vy);}
    if(p.y>H-10){p.y=H-10;p.vy=-Math.abs(p.vy);}
    ctx.beginPath();ctx.arc(p.x,p.y,8,0,Math.PI*2);
    ctx.fillStyle='#0f172a';ctx.fill();
    ctx.strokeStyle=cfg.solventColor+'cc';ctx.lineWidth=1.5;ctx.stroke();
    ctx.fillStyle=cfg.solventColor;ctx.font='bold 7px monospace';
    ctx.textAlign='center';ctx.textBaseline='middle';
    ctx.fillText(cfg.solventLabel.slice(0,3),p.x,p.y);
  });

  // Solute particles
  soluteP.forEach(function(p){
    p.x+=p.vx;p.y+=p.vy;
    p.vx+=(Math.random()-0.5)*0.06;p.vy+=(Math.random()-0.5)*0.06;
    if(!cfg.mixed){
      if(p.x<W*0.58){p.x=W*0.58;p.vx=Math.abs(p.vx);}
      // Clustering force
      var cx2=W*0.78,cy2=H/2;
      p.vx+=(cx2-p.x)*0.002;p.vy+=(cy2-p.y)*0.002;
      p.vx=Math.max(-0.6,Math.min(0.6,p.vx));p.vy=Math.max(-0.6,Math.min(0.6,p.vy));
    } else {
      p.vx=Math.max(-1.2,Math.min(1.2,p.vx));p.vy=Math.max(-1.2,Math.min(1.2,p.vy));
    }
    if(p.x<10){p.x=10;p.vx=Math.abs(p.vx);}
    if(p.x>W-10){p.x=W-10;p.vx=-Math.abs(p.vx);}
    if(p.y<10){p.y=10;p.vy=Math.abs(p.vy);}
    if(p.y>H-10){p.y=H-10;p.vy=-Math.abs(p.vy);}
    var sc=p.colorIdx===0?cfg.soluteColor1:cfg.soluteColor2;
    ctx.beginPath();ctx.arc(p.x,p.y,9,0,Math.PI*2);
    ctx.fillStyle='#0f172a';ctx.fill();
    ctx.strokeStyle=sc+'cc';ctx.lineWidth=2;ctx.stroke();
    ctx.fillStyle=sc;ctx.font='bold 7px monospace';
    ctx.textAlign='center';ctx.textBaseline='middle';
    ctx.fillText(cfg.soluteLabel.slice(0,3),p.x,p.y);
  });

  // Result badge
  ctx.fillStyle=cfg.color+'22';
  ctx.beginPath();ctx.roundRect(W/2-100,H-46,200,30,8);ctx.fill();
  ctx.strokeStyle=cfg.color;ctx.lineWidth=1.5;
  ctx.beginPath();ctx.roundRect(W/2-100,H-46,200,30,8);ctx.stroke();
  ctx.fillStyle=cfg.color;ctx.font='bold 13px monospace';ctx.textAlign='center';ctx.textBaseline='middle';
  ctx.fillText(cfg.result,W/2,H-31);

  // Description
  var words=cfg.desc.split(' ');
  var lines=[],line='';
  words.forEach(function(w){
    if((line+w).length>90){lines.push(line.trim());line='';}
    line+=w+' ';
  });
  if(line.trim())lines.push(line.trim());
  ctx.fillStyle='rgba(255,255,255,0.4)';ctx.font='11px monospace';ctx.textAlign='center';
  lines.forEach(function(l,i){ctx.fillText(l,W/2,14+i*15);});

  t++;requestAnimationFrame(draw);
}
draw();`,
      outputHeight: 360,
    },

    // ── Challenge 2 ─────────────────────────────────────────────────────────────
    {
      type: 'challenge',
      instruction: `Iodine (I₂) is nearly insoluble in water but dissolves readily in hexane (C₆H₁₄). When I₂ dissolves in water, the solution is very pale. In hexane, it turns deep violet. Which explanation is correct?`,
      options: [
        { label: 'A', text: 'I₂ reacts chemically with hexane but not with water' },
        { label: 'B', text: 'I₂ is nonpolar — it can only engage London forces. Hexane is nonpolar (similar forces, dissolves well). Water has strong H-bonds that are disrupted by I₂ with no compensating interaction (doesn\'t dissolve well)' },
        { label: 'C', text: 'I₂ is more dense than water so it sinks, but less dense than hexane so it floats and appears dissolved' },
        { label: 'D', text: 'Temperature differences between water and hexane cause the solubility difference' },
      ],
      check: (label) => label === 'B',
      successMessage: "Correct! I₂ is nonpolar — it only offers London dispersion forces. Hexane is also nonpolar — the I₂-hexane London forces are energetically similar to the hexane-hexane and I₂-I₂ forces they replace. Water's strong hydrogen bonds would be disrupted by I₂ with no comparable compensation. Like dissolves like.",
      failMessage: "I₂ doesn't react with either solvent here — this is physical dissolution, not a chemical reaction. The key is IMF matching. I₂ is nonpolar and so is hexane — their London forces match well. Water has strong hydrogen bonds that I₂ cannot form or compensate for. The solubility difference is entirely due to IMF compatibility.",
      html: '', css: `body{margin:0;padding:0;font-family:sans-serif}`, startCode: '',
      outputHeight: 300,
    },

    // ── Section 5 ───────────────────────────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `### Solubility: Saturated, Unsaturated, Supersaturated

Dissolving has a limit. At a given temperature and pressure, there is a maximum amount of solute that will dissolve in a given amount of solvent. This is the **solubility** of the solute — typically expressed in grams per 100 mL of solvent or in moles per litre (molarity, which we'll cover next lesson).

When you keep adding salt to water, eventually no more dissolves. The solution has reached its **solubility limit** and is now **saturated** — it contains the maximum dissolved solute possible at that temperature.

In a saturated solution, dissolution and crystallisation are happening simultaneously at the same rate — a **dynamic equilibrium**. Solute particles are continuously leaving the crystal and entering solution, but solution particles are simultaneously leaving solution and joining the crystal. The net concentration doesn't change, but both processes are active.

An **unsaturated solution** contains less solute than the maximum — more solute can still dissolve. A **supersaturated solution** contains more dissolved solute than the equilibrium solubility — this is an unstable state, typically achieved by heating (which usually increases solubility) and then slowly cooling without allowing crystallisation. Supersaturated solutions crystallise rapidly when disturbed — adding a seed crystal, scratching the glass, or even a sudden vibration can trigger rapid precipitation. This is the spectacular chemistry behind sodium acetate "hot ice."

**Temperature and solubility.** For most solid solutes in water, solubility increases with temperature — higher thermal energy helps overcome the lattice energy. But for gases dissolved in liquids, the opposite is true: higher temperature means gas molecules have more energy to escape the solution. This is why warm sodas go flat faster, and why lakes become oxygen-poor in hot weather, stressing fish populations.

**Pressure and gas solubility.** Henry's Law: the solubility of a gas in a liquid is proportional to the partial pressure of the gas above the solution. Open a carbonated drink (release the CO₂ pressure) and CO₂ comes out of solution — the solubility drops to match the new lower pressure.`,
    },

    // ── Visual 4 — Solubility vs temperature ────────────────────────────────────
    {
      type: 'js',
      instruction: `### Solubility curves: how temperature affects dissolution

The chart shows solubility curves for several common substances. Most solid solutes become more soluble as temperature rises. Gases (CO₂, O₂) become less soluble as temperature rises — explained by the kinetic energy argument.`,
      html: `<canvas id="cv" width="700" height="310"></canvas>`,
      css: `body{margin:0;background:#0a0f1e;display:flex;justify-content:center}
canvas{display:block;width:100%;max-width:700px}`,
      startCode: `var canvas=document.getElementById('cv');
var ctx=canvas.getContext('2d');
var W=canvas.width,H=canvas.height;
var t=0;

ctx.fillStyle='#0a0f1e';ctx.fillRect(0,0,W,H);

var chartX=60,chartY=18,chartW=W-90,chartH=H-66;
var minT=0,maxT=100;

// Solubility data: [temp, solubility g/100mL]
try {
  var substances = [
    {
      name: 'KNO₃', color: '#f87171',
      data: [[0, 13], [20, 32], [40, 64], [60, 110], [80, 169], [100, 246]]
    },
    {
      name: 'NaCl', color: '#38bdf8',
      data: [[0, 35.7], [20, 35.9], [40, 36.4], [60, 37.1], [80, 38.0], [100, 39.2]]
    },
    {
      name: 'KCl', color: '#a78bfa',
      data: [[0, 27.6], [20, 34.0], [40, 40.0], [60, 45.5], [80, 51.1], [100, 56.7]]
    },
    {
      name: 'NaHCO₃', color: '#fb923c',
      data: [[0, 6.9], [20, 9.6], [40, 12.7], [60, 16.4], [80, 20.0], [100, 23.6]] 
    }, // Closed the array and the object here
    {
      name: 'CO₂ (×100)', color: '#4ade80',
      data: [[0, 0.335], [20, 0.169], [40, 0.097], [60, 0.058], [80, 0.035], [100, 0.02]],
      scale: 100
    }
  ];
} catch (error) { // Added parentheses
  console.log(error);
}

// Find max solubility for scaling
var maxSol=0;
substances.forEach(function(s){
  s.data.forEach(function(d){if(d[1]*( s.scale||1)>maxSol)maxSol=d[1]*(s.scale||1);});
});
maxSol=280;

function toScreen(tempC,sol){
  var x=chartX+((tempC-minT)/(maxT-minT))*chartW;
  var y=chartY+chartH-(sol/maxSol)*chartH;
  return{x:x,y:y};
}

// Axes
ctx.strokeStyle='rgba(255,255,255,0.2)';ctx.lineWidth=1;
ctx.beginPath();ctx.moveTo(chartX,chartY);ctx.lineTo(chartX,chartY+chartH);ctx.stroke();
ctx.beginPath();ctx.moveTo(chartX,chartY+chartH);ctx.lineTo(chartX+chartW,chartY+chartH);ctx.stroke();

// Grid
[0,50,100,150,200,250].forEach(function(s){
  var y=chartY+chartH-(s/maxSol)*chartH;
  ctx.beginPath();ctx.moveTo(chartX,y);ctx.lineTo(chartX+chartW,y);
  ctx.strokeStyle='rgba(255,255,255,0.06)';ctx.lineWidth=1;ctx.stroke();
  ctx.fillStyle='rgba(255,255,255,0.35)';ctx.font='10px monospace';ctx.textAlign='right';
  ctx.fillText(s,chartX-5,y+4);
});

[0,20,40,60,80,100].forEach(function(T){
  var pt=toScreen(T,0);
  ctx.beginPath();ctx.moveTo(pt.x,chartY+chartH);ctx.lineTo(pt.x,chartY+chartH+5);
  ctx.strokeStyle='rgba(255,255,255,0.3)';ctx.lineWidth=1;ctx.stroke();
  ctx.fillStyle='rgba(255,255,255,0.45)';ctx.font='10px monospace';ctx.textAlign='center';
  ctx.fillText(T+'°C',pt.x,chartY+chartH+16);
});

// Draw curves
substances.forEach(function(s){
  var scale=s.scale||1;
  ctx.beginPath();
  s.data.forEach(function(d,i){
    var pt=toScreen(d[0],d[1]*scale);
    if(i===0)ctx.moveTo(pt.x,pt.y);else ctx.lineTo(pt.x,pt.y);
  });
  ctx.strokeStyle=s.color;ctx.lineWidth=2.5;ctx.stroke();

  // Data dots
  s.data.forEach(function(d){
    var pt=toScreen(d[0],d[1]*scale);
    ctx.beginPath();ctx.arc(pt.x,pt.y,3.5,0,Math.PI*2);
    ctx.fillStyle=s.color;ctx.fill();
  });

  // Label at last point
  var last=s.data[s.data.length-1];
  var lpt=toScreen(last[0],last[1]*scale);
  ctx.fillStyle=s.color;ctx.font='bold 11px monospace';ctx.textAlign='left';
  ctx.fillText(s.name,lpt.x+6,lpt.y+4);
});

// Axis labels
ctx.fillStyle='rgba(255,255,255,0.5)';ctx.font='11px monospace';ctx.textAlign='center';
ctx.fillText('Temperature (°C)',chartX+chartW/2,chartY+chartH+32);
ctx.save();ctx.translate(14,chartY+chartH/2);ctx.rotate(-Math.PI/2);
ctx.fillText('Solubility (g / 100 mL)',0,0);ctx.restore();

// Title
ctx.fillStyle='rgba(255,255,255,0.6)';ctx.font='bold 12px monospace';ctx.textAlign='center';
ctx.fillText('Solubility curves — solids increase, gases decrease with temperature',W/2,chartY-4);

// CO2 annotation
var co2arrow=toScreen(20,17);
ctx.strokeStyle='rgba(74,222,128,0.5)';ctx.lineWidth=1;ctx.setLineDash([3,3]);
ctx.beginPath();ctx.moveTo(co2arrow.x-30,co2arrow.y-20);ctx.lineTo(co2arrow.x,co2arrow.y);ctx.stroke();ctx.setLineDash([]);
ctx.fillStyle='rgba(74,222,128,0.7)';ctx.font='10px monospace';ctx.textAlign='right';
ctx.fillText('CO₂ decreases',co2arrow.x-32,co2arrow.y-22);
ctx.fillText('(×100 scale)',co2arrow.x-32,co2arrow.y-10);`,
      outputHeight: 330,
    },

    // ── Challenge 3 ─────────────────────────────────────────────────────────────
    {
      type: 'challenge',
      instruction: `A carbonated drink contains CO₂ dissolved under pressure. When you open the bottle, CO₂ bubbles out rapidly. Which principle explains this?`,
      options: [
        { label: 'A', text: 'Opening the bottle warms the drink, and higher temperature reduces gas solubility' },
        { label: 'B', text: 'Henry\'s Law: gas solubility is proportional to partial pressure. Releasing the pressure cap drops the CO₂ pressure above the liquid, so CO₂ comes out of solution to re-establish equilibrium' },
        { label: 'C', text: 'CO₂ reacts with water to form carbonic acid, which then decomposes into bubbles' },
        { label: 'D', text: 'The CO₂ molecules become too large to stay dissolved once the bottle is opened' },
      ],
      check: (label) => label === 'B',
      successMessage: "Correct! Henry's Law states that the solubility of a gas in a liquid is proportional to its partial pressure above the solution. Sealed bottles contain CO₂ at ~2-4 atm above the liquid. Opening drops the CO₂ partial pressure to ~0.0004 atm (atmospheric CO₂). The solubility plummets, and dissolved CO₂ escapes as bubbles until a new equilibrium is reached.",
      failMessage: "Opening a bottle doesn't significantly change temperature. While CO₂ does form carbonic acid (H₂CO₃) in water, that's not what drives the fizzing. The key is Henry's Law: gas solubility ∝ gas pressure. Carbonated drinks are sealed at high CO₂ pressure (~3 atm). Release the pressure, and the solubility of CO₂ drops dramatically — gas escapes to match the new lower pressure.",
      html: '', css: `body{margin:0;padding:0;font-family:sans-serif}`, startCode: '',
      outputHeight: 300,
    },

    // ── Section 6 ───────────────────────────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `### Miscibility, Suspensions, and Colloids

Not all mixtures fall neatly into "dissolves" or "doesn't dissolve." There is a spectrum of mixing behaviour.

**Miscibility** describes liquids. Two liquids that mix in all proportions are **miscible** — water and ethanol, for example. Two liquids that don't mix are **immiscible** — water and oil. Miscibility follows "like dissolves like": both ethanol and water are polar with H-bonding capability, so they mix freely. Oil is nonpolar; water is polar — they are immiscible.

**Suspensions** are heterogeneous mixtures where particles are large enough to see (>1000 nm) and will eventually settle by gravity. Muddy water, blood (loosely), paint. Shake them and the particles disperse temporarily; let them sit and they settle.

**Colloids** (or colloidal dispersions) are intermediate: particles of 1–1000 nm dispersed in a medium. They appear homogeneous but are not true solutions — the particles are larger than molecules. Examples: milk (fat droplets in water), fog (water droplets in air), gelatin (protein network in water), smoke (solid particles in air), mayonnaise (oil droplets in water, stabilised by lecithin).

Colloids don't settle because the particles are small enough to be kept dispersed by Brownian motion — the constant random buffeting from solvent molecules. You can distinguish a colloid from a true solution using the **Tyndall effect**: shine a beam of light through a colloid and you see a visible beam (light scatters off the colloidal particles). A true solution is transparent to the beam — molecules are too small to scatter visible light. This is why fog scatters headlight beams but clear air doesn't.

Biological fluids are mostly colloidal. Blood plasma, cytoplasm, and mucus are all complex colloidal systems. Cell membranes form because of the hydrophobic effect operating on phospholipids — an elegant example of "like dissolves like" creating structure spontaneously.`,
    },

    // ── Challenge 4 ─────────────────────────────────────────────────────────────
    {
      type: 'challenge',
      instruction: `Cell membranes are made of phospholipids — molecules with a polar, hydrophilic "head" group and two nonpolar, hydrophobic "tail" chains. In water, these spontaneously arrange into a bilayer with tails pointing inward and heads pointing outward. What drives this self-assembly?`,
      options: [
        { label: 'A', text: 'Phospholipids are attracted to each other by strong covalent bonds that form in water' },
        { label: 'B', text: 'The hydrophobic effect: water strongly prefers to maintain its H-bond network. Nonpolar tails disrupt this network, so water pushes them together into the interior — simultaneously allowing polar heads to interact with water on the outside' },
        { label: 'C', text: 'Phospholipid tails are positively charged and heads are negatively charged, creating ionic attraction' },
        { label: 'D', text: 'The arrangement is random — lipid bilayers form only because enzymes actively assemble them' },
      ],
      check: (label) => label === 'B',
      successMessage: "Correct! This is the hydrophobic effect in action — arguably the most important application of 'like dissolves like' in biology. Water's hydrogen bond network is disrupted by nonpolar tails. The system minimises disruption by clustering tails together, away from water. The polar heads face outward into water, where they can engage in favourable H-bond and dipole-dipole interactions. No enzymes needed — thermodynamics drives it.",
      failMessage: "Phospholipids self-assemble without covalent bond formation and without ionic charges on tails. The driving force is the hydrophobic effect: water's hydrogen bond network is disrupted by nonpolar hydrocarbon tails, and the system minimises this disruption by sequestering tails away from water. It's the same principle as oil droplets coalescing in water — but here it creates functional biological membranes.",
      html: '', css: `body{margin:0;padding:0;font-family:sans-serif}`, startCode: '',
      outputHeight: 300,
    },

    // ── Closing ──────────────────────────────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `### Solutions: The Chemistry of Mixing

The principle "like dissolves like" is really a statement about intermolecular forces: dissolution is favourable when the forces a solute forms with its solvent are comparable in type and strength to the forces being broken.

The consequences ripple through biology, medicine, materials science, and daily life:

Salt and sugar dissolve in water because they can engage the same kinds of electrostatic and hydrogen-bonding interactions that water molecules use among themselves. Fats and oils don't dissolve in water but dissolve in each other because they share nonpolar London forces. Cell membranes self-assemble because polar heads match water and nonpolar tails match each other — both outcomes driven by the same IMF principle.

Saturated solutions, supersaturation, Henry's Law, and the Tyndall effect are all downstream of the same fundamental question: can the solute-solvent interactions compete with what's being disrupted?

In the next lesson we'll quantify how much solute is dissolved — introducing molarity and the tools chemists use to measure and control concentration.`,
    },

  ],
};

export default {
  id: 'chem-3-2-solutions-and-mixtures',
  slug: 'solutions-and-mixtures',
  chapter: 'chem.3',
  order: 2,
  title: 'Solutions and Mixtures',
  subtitle: 'Why some things dissolve and others don\'t — and what "like dissolves like" really means.',
  tags: ['chemistry', 'solutions', 'mixtures', 'solubility', 'like-dissolves-like', 'hydrophobic-effect', 'Henry\'s-law', 'colloids', 'saturation'],
  hook: {
    question: 'Why does salt dissolve in water but not in oil — and why does this same principle explain why your cell membranes exist?',
    realWorldContext: '"Like dissolves like" is not a memorisation rule — it is a consequence of intermolecular forces. Understanding it explains salt water, instant cold packs, carbonated drinks, oil spills, and the spontaneous assembly of every cell membrane on Earth.',
    previewVisualizationId: 'ScienceNotebook',
  },
  intuition: {
    prose: [
      'A solution is a homogeneous mixture — one component (solvent) dissolves another (solute) at the molecular level.',
      'Dissolution involves three energy steps: separate solute, separate solvent, form solute-solvent interactions. Net energy = enthalpy of solution.',
      '"Like dissolves like": polar solvents dissolve polar/ionic solutes; nonpolar solvents dissolve nonpolar solutes. Driven by IMF matching.',
      'Solubility has a limit (saturation). Solid solubility usually increases with temperature; gas solubility decreases. Gas solubility ∝ pressure (Henry\'s Law).',
      'Colloids: intermediate particles (1–1000 nm) that don\'t settle. Identified by the Tyndall effect.',
    ],
    callouts: [
      { type: 'important', title: 'Why cell membranes self-assemble', body: 'Phospholipid bilayers form spontaneously because the hydrophobic effect — water pushing nonpolar tails together — is thermodynamically driven. No enzymes needed. This is "like dissolves like" creating the boundary of life.' },
    ],
    visualizations: [{ id: 'ScienceNotebook', title: 'Solutions and Mixtures', props: { lesson: LESSON_CHEM_3_2 } }],
  },
  math: { prose: [], callouts: [], visualizations: [] },
  rigor: { prose: [], callouts: [], visualizations: [] },
  examples: [],
  challenges: [],
  mentalModel: [
    'Solution = homogeneous mixture. Solvent dissolves solute. Phase = solvent phase.',
    'Three-step dissolution energy: (1) separate solute, (2) separate solvent, (3) form solute-solvent IMFs. ΔH_solution = net.',
    'Like dissolves like: polar in polar, nonpolar in nonpolar. IMF compatibility drives dissolution.',
    'Saturated = max dissolved solute at equilibrium. Dynamic — dissolution and crystallisation occur simultaneously.',
    'Solid solubility usually ↑ with T. Gas solubility ↓ with T and ∝ partial pressure (Henry\'s Law).',
    'Colloids: 1–1000 nm particles, stable vs. Brownian motion, show Tyndall effect. Distinct from true solutions and suspensions.',
    'Hydrophobic effect = water pushes nonpolar molecules together to preserve H-bond network. Drives cell membrane formation.',
  ],
  checkpoints: ['read-intuition'],
  quiz: [],
};

export { LESSON_CHEM_3_2 };
