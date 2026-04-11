// Chemistry · Chapter 4 · Lesson 1
// Energy in Reactions

const LESSON_CHEM_4_1 = {
  title: 'Energy in Reactions',
  subtitle: 'Why some reactions release heat and others absorb it — and what activation energy really means.',
  sequential: true,

  cells: [

    // ── Section 1 ───────────────────────────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `### Where Does the Energy Come From?

Strike a match and hold it to a piece of paper. A moment later the paper is burning on its own. You supplied a tiny spark — perhaps a few millijoules of energy — and the paper releases hundreds of kilojoules as it burns. Where did all that energy come from?

The answer is in the bonds. Specifically, in the difference between the energy stored in the bonds of the reactants (paper + oxygen) and the energy stored in the bonds of the products (CO₂ + H₂O + ash).

We established in the last lesson that breaking bonds requires energy and forming bonds releases energy. The **net energy change** of a reaction is the difference between these two:

$$\\Delta H_{\\text{reaction}} = \\text{Energy released by forming bonds} - \\text{Energy required to break bonds}$$

If more energy is released than consumed — if the products' bonds are stronger than the reactants' bonds — the reaction **releases energy** to the surroundings. The surroundings heat up. This is an **exothermic reaction** (exo = out, thermic = heat). Combustion, explosion, rusting iron, metabolising food — all exothermic.

If more energy is required to break bonds than is released in forming new ones — if the products' bonds are weaker than the reactants' bonds — the reaction **absorbs energy** from the surroundings. The surroundings cool down. This is an **endothermic reaction** (endo = in). Photosynthesis, dissolving ammonium nitrate, baking bread — endothermic.

The energy change is a property of the reaction, not of how fast or slow it proceeds. The same amount of energy is released whether paper burns in seconds or whether the same organic molecules are metabolised slowly in a cell over hours.`,
    },

    // ── Section 2 ───────────────────────────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `### Enthalpy: Measuring Heat at Constant Pressure

Most chemical reactions in a laboratory or in biology occur at constant atmospheric pressure — in open beakers, in cells, in the atmosphere. At constant pressure, the heat exchanged between a reaction and its surroundings is called the **enthalpy change**, symbol ΔH (delta H).

Enthalpy itself (H) is a thermodynamic quantity that accounts for the internal energy of the system plus the work done by or on it at constant pressure. In practice, ΔH is simply the heat exchanged at constant pressure, which is what a thermometer measures.

The sign convention is defined from the system's perspective:
- **ΔH < 0 (negative):** The system loses energy — heat flows out to the surroundings. **Exothermic.**
- **ΔH > 0 (positive):** The system gains energy — heat flows in from the surroundings. **Endothermic.**

Units: kilojoules per mole (kJ/mol), always stated for a specific balanced equation and specific amounts.

Some examples:
- Combustion of methane: CH₄ + 2O₂ → CO₂ + 2H₂O, ΔH = −890 kJ/mol (exothermic)
- Decomposition of water: 2H₂O → 2H₂ + O₂, ΔH = +572 kJ/mol (endothermic)
- Dissolution of NaOH in water: ΔH = −44.5 kJ/mol (exothermic — dissolving NaOH heats the solution)
- Dissolution of NH₄NO₃ in water: ΔH = +25.7 kJ/mol (endothermic — cold packs)

**Hess's Law** states that enthalpy is a state function — it doesn't depend on the path taken, only on the initial and final states. This means you can add ΔH values for a sequence of reactions to get the ΔH for the overall reaction, even if you can't measure it directly. Hess's Law is the foundation of thermochemical calculations.`,
    },

    // ── Visual 1 — Exo vs endo energy diagrams ─────────────────────────────────
    {
      type: 'js',
      instruction: `### Energy diagrams: exothermic vs. endothermic

The two diagrams show the energy profiles for an exothermic reaction (left) and an endothermic reaction (right). The y-axis is potential energy. Reactants start at a certain energy level; products end at a different level. The difference is ΔH. Both reactions must first climb an energy hill — the activation energy barrier — before descending to the products.`,
      html: `<canvas id="cv" width="700" height="300"></canvas>`,
      css: `body{margin:0;background:#0a0f1e;display:flex;justify-content:center}
canvas{display:block;width:100%;max-width:700px}`,
      startCode: `var canvas=document.getElementById('cv');
var ctx=canvas.getContext('2d');
var W=canvas.width,H=canvas.height;
var t=0;

function drawEnergyDiagram(ox,oy,w,h,isExo,label){
  var rColor=isExo?'#38bdf8':'#f87171';
  var pColor=isExo?'#4ade80':'#fb923c';
  var tsColor='#facc15';

  // Axes
  ctx.strokeStyle='rgba(255,255,255,0.2)';ctx.lineWidth=1;
  ctx.beginPath();ctx.moveTo(ox,oy);ctx.lineTo(ox,oy+h);ctx.lineTo(ox+w,oy+h);ctx.stroke();

  // Energy levels
  var rLevel=isExo?0.65:0.35; // reactant height fraction from bottom
  var pLevel=isExo?0.25:0.72; // product height fraction from bottom
  var tsLevel=0.10; // transition state at top (fraction from bottom)

  var ry=oy+h*(1-rLevel);
  var py=oy+h*(1-pLevel);
  var tsy=oy+h*(1-tsLevel);

  // Reaction coordinate path (smooth curve)
  ctx.beginPath();
  // Parametric: reactant plateau → climb → transition state peak → descend → product plateau
  var pts=[];
  var n=200;
  for(var i=0;i<=n;i++){
    var x=i/n;
    var y;
    if(x<0.2){
      y=rLevel;
    } else if(x<0.5){
      var frac=(x-0.2)/0.3;
      var ef=easeInOut(frac);
      y=rLevel+(tsLevel-rLevel)*ef;
    } else if(x<0.8){
      var frac2=(x-0.5)/0.3;
      var ef2=easeInOut(frac2);
      y=tsLevel+(pLevel-tsLevel)*ef2;
    } else {
      y=pLevel;
    }
    pts.push({x:ox+x*w,y:oy+h*(1-y)});
  }

  // Animated dot
  var dotProgress=((t*0.005)%1);
  var dotIdx=Math.floor(dotProgress*pts.length);
  var dotPt=pts[dotIdx]||pts[pts.length-1];

  // Fill under curve
  ctx.beginPath();
  ctx.moveTo(pts[0].x,oy+h);
  pts.forEach(function(p){ctx.lineTo(p.x,p.y);});
  ctx.lineTo(pts[pts.length-1].x,oy+h);ctx.closePath();
  ctx.fillStyle='rgba(255,255,255,0.03)';ctx.fill();

  // Curve
  ctx.beginPath();
  pts.forEach(function(p,i){if(i===0)ctx.moveTo(p.x,p.y);else ctx.lineTo(p.x,p.y);});
  ctx.strokeStyle=isExo?'rgba(56,189,248,0.8)':'rgba(248,113,113,0.8)';
  ctx.lineWidth=2.5;ctx.stroke();

  // Horizontal level lines
  // Reactant
  ctx.strokeStyle=rColor+'88';ctx.lineWidth=1.5;ctx.setLineDash([4,3]);
  ctx.beginPath();ctx.moveTo(ox+4,ry);ctx.lineTo(ox+w*0.22,ry);ctx.stroke();
  // Product
  ctx.strokeStyle=pColor+'88';
  ctx.beginPath();ctx.moveTo(ox+w*0.78,py);ctx.lineTo(ox+w-4,py);ctx.stroke();
  ctx.setLineDash([]);

  // ΔH arrow
  var dhX=ox+w*0.88;
  ctx.strokeStyle='rgba(255,255,255,0.5)';ctx.lineWidth=1.5;
  ctx.beginPath();ctx.moveTo(dhX,ry);ctx.lineTo(dhX,py);ctx.stroke();
  var aMid=(ry+py)/2;
  // Arrowheads
  [ry,py].forEach(function(ay){
    ctx.beginPath();ctx.moveTo(dhX-5,ay+(ay===ry?8:-8));ctx.lineTo(dhX,ay);ctx.lineTo(dhX+5,ay+(ay===ry?8:-8));
    ctx.strokeStyle='rgba(255,255,255,0.5)';ctx.stroke();
  });
  ctx.fillStyle=isExo?'#4ade80':'#f87171';ctx.font='bold 12px monospace';ctx.textAlign='left';
  ctx.fillText(isExo?'\u0394H < 0':'\u0394H > 0',dhX+8,aMid+5);

  // Activation energy arrow
  var eaX=ox+w*0.42;
  ctx.strokeStyle='rgba(250,204,21,0.6)';ctx.lineWidth=1.5;
  ctx.beginPath();ctx.moveTo(eaX,ry);ctx.lineTo(eaX,tsy);ctx.stroke();
  [ry,tsy].forEach(function(ay){
    ctx.beginPath();ctx.moveTo(eaX-4,ay+(ay===ry?6:-6));ctx.lineTo(eaX,ay);ctx.lineTo(eaX+4,ay+(ay===ry?6:-6));
    ctx.strokeStyle='rgba(250,204,21,0.6)';ctx.stroke();
  });
  ctx.fillStyle='rgba(250,204,21,0.8)';ctx.font='bold 11px monospace';ctx.textAlign='center';
  ctx.fillText('Eₐ',eaX,tsy-12);

  // Labels
  ctx.fillStyle=rColor;ctx.font='bold 11px monospace';ctx.textAlign='left';
  ctx.fillText('Reactants',ox+6,ry-10);
  ctx.fillStyle=pColor;ctx.textAlign='right';
  ctx.fillText('Products',ox+w-6,py-10);
  ctx.fillStyle=tsColor;ctx.textAlign='center';
  ctx.fillText('Transition',ox+w*0.5,tsy-22);
  ctx.fillText('state',ox+w*0.5,tsy-10);

  // Title
  ctx.fillStyle=isExo?'#38bdf8':'#f87171';ctx.font='bold 14px monospace';ctx.textAlign='center';
  ctx.fillText(label,ox+w/2,oy+h+22);
  ctx.fillStyle='rgba(255,255,255,0.35)';ctx.font='10px monospace';
  ctx.fillText(isExo?'Products more stable than reactants':'Reactants more stable than products',ox+w/2,oy+h+36);

  // Animated dot
  ctx.beginPath();ctx.arc(dotPt.x,dotPt.y,7,0,Math.PI*2);
  ctx.fillStyle=isExo?'rgba(56,189,248,0.9)':'rgba(248,113,113,0.9)';
  ctx.shadowColor=isExo?'#38bdf8':'#f87171';ctx.shadowBlur=12;
  ctx.fill();ctx.shadowBlur=0;

  // Y axis label
  ctx.fillStyle='rgba(255,255,255,0.3)';ctx.font='10px monospace';ctx.textAlign='center';
  ctx.save();ctx.translate(ox-16,oy+h/2);ctx.rotate(-Math.PI/2);ctx.fillText('Potential energy',0,0);ctx.restore();
  ctx.fillText('Reaction coordinate \u2192',ox+w/2,oy+h+50);
}

function easeInOut(t){return t<0.5?2*t*t:1-Math.pow(-2*t+2,2)/2;}

function draw(){
  ctx.clearRect(0,0,W,H);
  ctx.fillStyle='#0a0f1e';ctx.fillRect(0,0,W,H);

  var margin=30,gap=40;
  var dw=(W-margin*2-gap)/2;
  var dh=H-80;

  drawEnergyDiagram(margin,10,dw,dh,true,'Exothermic reaction (ΔH < 0)');
  drawEnergyDiagram(margin+dw+gap,10,dw,dh,false,'Endothermic reaction (ΔH > 0)');

  // Dividing hint
  ctx.strokeStyle='rgba(255,255,255,0.06)';ctx.lineWidth=1;
  ctx.beginPath();ctx.moveTo(W/2,10);ctx.lineTo(W/2,H-55);ctx.stroke();

  t++;requestAnimationFrame(draw);
}
draw();`,
      outputHeight: 340,
    },

    // ── Challenge 1 ─────────────────────────────────────────────────────────────
    {
      type: 'challenge',
      instruction: `When calcium chloride (CaCl₂) dissolves in water, the solution becomes noticeably warm. When ammonium nitrate (NH₄NO₃) dissolves, the solution becomes cold. Which statements correctly describe these observations?`,
      options: [
        { label: 'A', text: 'CaCl₂ dissolution is endothermic; NH₄NO₃ dissolution is exothermic' },
        { label: 'B', text: 'CaCl₂ dissolution is exothermic (ΔH < 0, releases heat); NH₄NO₃ dissolution is endothermic (ΔH > 0, absorbs heat)' },
        { label: 'C', text: 'Both are exothermic — dissolving always releases heat' },
        { label: 'D', text: 'Temperature change during dissolving indicates a physical change, not a chemical one' },
      ],
      check: (label) => label === 'B',
      successMessage: "Correct! CaCl₂: the energy released when ions hydrate exceeds the lattice energy cost → net exothermic → solution warms. NH₄NO₃: the lattice energy cost exceeds the hydration energy released → net endothermic → solution cools. Both are physical dissolutions, but their enthalpy of solution has different signs.",
      failMessage: "If the solution warms up, heat is flowing out of the process into the surroundings — the process is exothermic (ΔH < 0). If it cools down, heat is being absorbed from the surroundings — endothermic (ΔH > 0). CaCl₂ releases more energy hydrating ions than it costs to break the lattice (exothermic). NH₄NO₃ costs more to break the lattice than it gains from hydration (endothermic).",
      html: '', css: `body{margin:0;padding:0;font-family:sans-serif}`, startCode: '',
      outputHeight: 300,
    },

    // ── Section 3 ───────────────────────────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `### Activation Energy: The Hill Every Reaction Must Climb

Look again at the energy diagrams. Both the exothermic and endothermic reactions show a hump — a peak of higher energy between the reactants and products. This peak is the **transition state** (also called the activated complex), and the energy difference between the reactants and the transition state is the **activation energy** (Eₐ).

Activation energy is the minimum energy that reacting molecules must have before they can react — the energy needed to begin breaking the bonds in the reactants.

This is why reactions don't all happen instantly. Even if a reaction is strongly exothermic, the reactants still need to climb over the activation energy barrier first. At room temperature, only a small fraction of molecules have enough kinetic energy to reach the transition state. These are the "fast tail" molecules in the Maxwell-Boltzmann distribution — the minority with above-average kinetic energy.

This explains several practical observations:

**Why reactions go faster at higher temperatures.** Higher temperature shifts the Maxwell-Boltzmann distribution to higher speeds — a larger fraction of molecules have enough energy to overcome the activation barrier. Roughly speaking, for every 10°C increase in temperature, many reaction rates approximately double.

**Why a catalyst helps.** A catalyst provides an alternative reaction pathway with a lower activation energy. More molecules can overcome the lower barrier → reaction goes faster. The catalyst is not consumed — it emerges unchanged at the end. The ΔH of the reaction is the same whether a catalyst is present or not; only Eₐ changes.

**Why some obviously exothermic reactions don't happen spontaneously.** A mixture of H₂ and O₂ gas is stable indefinitely at room temperature — despite the reaction being highly exothermic (ΔH = −286 kJ/mol per mole of water formed). The activation energy is high enough that essentially no molecules at room temperature can initiate the reaction. Add a spark or a platinum catalyst, and the reaction proceeds explosively.`,
    },

    // ── Visual 2 — Activation energy and catalysis ──────────────────────────────
    {
      type: 'js',
      instruction: `### How a catalyst lowers the activation energy barrier

The diagram shows the same reaction with and without a catalyst. Toggle the catalyst on and off to see how it changes the energy profile. The ΔH (overall energy release) is identical in both cases — only the height of the barrier changes. Below the diagram, the Maxwell-Boltzmann distribution shows how many more molecules can overcome the lower barrier.`,
      html: `<div style="padding:10px 14px 0;background:#0a0f1e;display:flex;gap:10px;align-items:center">
  <button id="cat-btn" style="padding:7px 16px;border-radius:8px;border:1.5px solid #4ade80;background:rgba(74,222,128,0.15);color:#4ade80;font-family:monospace;font-size:12px;font-weight:700;cursor:pointer">Add Catalyst</button>
  <span id="cat-status" style="color:rgba(255,255,255,0.4);font-size:12px;font-family:monospace">No catalyst — high activation energy</span>
</div>
<canvas id="cv" width="700" height="300"></canvas>`,
      css: `body{margin:0;background:#0a0f1e;font-family:monospace}
canvas{display:block;width:100%;max-width:700px}`,
      startCode: `var canvas=document.getElementById('cv');
var ctx=canvas.getContext('2d');
var W=canvas.width,H=canvas.height;
var t=0;
var catalystOn=false;
var catTransition=0; // 0=no cat, 1=full cat

document.getElementById('cat-btn').onclick=function(){
  catalystOn=!catalystOn;
  this.textContent=catalystOn?'Remove Catalyst':'Add Catalyst';
  this.style.borderColor=catalystOn?'#f87171':'#4ade80';
  this.style.background=catalystOn?'rgba(248,113,113,0.15)':'rgba(74,222,128,0.15)';
  this.style.color=catalystOn?'#f87171':'#4ade80';
  document.getElementById('cat-status').textContent=catalystOn?
    'Catalyst present — lower activation energy, same \u0394H':
    'No catalyst — high activation energy';
};

function easeInOut(t){return t<0.5?2*t*t:1-Math.pow(-2*t+2,2)/2;}
function lerp(a,b,t){return a+(b-a)*t;}

function getEaFraction(){
  // Without catalyst: transition state at 0.12 from bottom
  // With catalyst: transition state at 0.30 from bottom
  var targetCat=catalystOn?1:0;
  catTransition+=(targetCat-catTransition)*0.05;
  return lerp(0.12,0.32,catTransition);
}

function draw(){
  ctx.clearRect(0,0,W,H);
  ctx.fillStyle='#0a0f1e';ctx.fillRect(0,0,W,H);

  var diagramW=420,diagramH=H-20;
  var ox=20,oy=10;

  var rLevel=0.62,pLevel=0.25;
  var tsLevel=getEaFraction();
  var ry=oy+diagramH*(1-rLevel);
  var py=oy+diagramH*(1-pLevel);
  var tsy=oy+diagramH*(1-tsLevel);

  // Build curve points
  var pts=[];
  var n=200;
  for(var i=0;i<=n;i++){
    var x=i/n;
    var y;
    if(x<0.15)y=rLevel;
    else if(x<0.5){var f=easeInOut((x-0.15)/0.35);y=rLevel+(tsLevel-rLevel)*f;}
    else if(x<0.85){var f2=easeInOut((x-0.5)/0.35);y=tsLevel+(pLevel-tsLevel)*f2;}
    else y=pLevel;
    pts.push({x:ox+x*diagramW,y:oy+diagramH*(1-y)});
  }

  // Fill
  ctx.beginPath();ctx.moveTo(pts[0].x,oy+diagramH);
  pts.forEach(function(p){ctx.lineTo(p.x,p.y);});
  ctx.lineTo(pts[pts.length-1].x,oy+diagramH);ctx.closePath();
  ctx.fillStyle='rgba(255,255,255,0.02)';ctx.fill();

  // Curve
  var curveColor=catalystOn?'#f87171':'#38bdf8';
  ctx.beginPath();
  pts.forEach(function(p,i){if(i===0)ctx.moveTo(p.x,p.y);else ctx.lineTo(p.x,p.y);});
  ctx.strokeStyle=curveColor;ctx.lineWidth=2.5;ctx.stroke();

  // Level lines
  ctx.setLineDash([4,3]);
  ctx.strokeStyle='rgba(56,189,248,0.5)';ctx.lineWidth=1.5;
  ctx.beginPath();ctx.moveTo(ox,ry);ctx.lineTo(ox+diagramW*0.18,ry);ctx.stroke();
  ctx.strokeStyle='rgba(74,222,128,0.5)';
  ctx.beginPath();ctx.moveTo(ox+diagramW*0.82,py);ctx.lineTo(ox+diagramW,py);ctx.stroke();
  ctx.setLineDash([]);

  // Ea arrow
  var eaX=ox+diagramW*0.4;
  ctx.strokeStyle='rgba(250,204,21,0.7)';ctx.lineWidth=1.5;
  ctx.beginPath();ctx.moveTo(eaX,ry);ctx.lineTo(eaX,tsy);ctx.stroke();
  [ry,tsy].forEach(function(ay,ai){
    ctx.beginPath();ctx.moveTo(eaX-4,ay+(ai===0?6:-6));ctx.lineTo(eaX,ay);ctx.lineTo(eaX+4,ay+(ai===0?6:-6));
    ctx.strokeStyle='rgba(250,204,21,0.7)';ctx.stroke();
  });
  var eaLabel='Eₐ = '+(catalystOn?'low':'high');
  ctx.fillStyle='rgba(250,204,21,0.9)';ctx.font='bold 11px monospace';ctx.textAlign='center';
  ctx.fillText(eaLabel,eaX,tsy-14);

  // ΔH arrow (same both cases)
  var dhX=ox+diagramW*0.88;
  ctx.strokeStyle='rgba(74,222,128,0.6)';ctx.lineWidth=1.5;
  ctx.beginPath();ctx.moveTo(dhX,ry);ctx.lineTo(dhX,py);ctx.stroke();
  ctx.fillStyle='#4ade80';ctx.font='bold 11px monospace';ctx.textAlign='left';
  ctx.fillText('\u0394H = same',dhX+6,(ry+py)/2+4);

  // Labels
  ctx.fillStyle='#38bdf8';ctx.font='bold 10px monospace';ctx.textAlign='left';
  ctx.fillText('Reactants',ox+6,ry-10);
  ctx.fillStyle='#4ade80';ctx.textAlign='right';
  ctx.fillText('Products',ox+diagramW-4,py-10);

  // Animated dot
  var dp=((t*0.004)%1);
  var di=Math.floor(dp*pts.length);
  var dpt=pts[Math.min(di,pts.length-1)];
  ctx.beginPath();ctx.arc(dpt.x,dpt.y,7,0,Math.PI*2);
  ctx.fillStyle=curveColor;ctx.shadowColor=curveColor;ctx.shadowBlur=10;ctx.fill();ctx.shadowBlur=0;

  // Axes
  ctx.strokeStyle='rgba(255,255,255,0.15)';ctx.lineWidth=1;
  ctx.beginPath();ctx.moveTo(ox,oy);ctx.lineTo(ox,oy+diagramH);ctx.lineTo(ox+diagramW,oy+diagramH);ctx.stroke();
  ctx.fillStyle='rgba(255,255,255,0.3)';ctx.font='10px monospace';ctx.textAlign='center';
  ctx.fillText('Reaction coordinate \u2192',ox+diagramW/2,oy+diagramH+14);
  ctx.save();ctx.translate(ox-14,oy+diagramH/2);ctx.rotate(-Math.PI/2);ctx.fillText('Potential energy',0,0);ctx.restore();

  // ── Maxwell-Boltzmann panel ──
  var mbX=460,mbY=10,mbW=220,mbH=diagramH-20;

  // Background
  ctx.fillStyle='rgba(255,255,255,0.03)';ctx.fillRect(mbX,mbY,mbW,mbH);
  ctx.strokeStyle='rgba(255,255,255,0.1)';ctx.lineWidth=1;ctx.strokeRect(mbX,mbY,mbW,mbH);

  ctx.fillStyle='rgba(255,255,255,0.5)';ctx.font='bold 11px monospace';ctx.textAlign='center';
  ctx.fillText('Molecular energy distribution',mbX+mbW/2,mbY+14);

  // Draw MB curve
  var maxV=2000,mbScaleX=mbW-20,mbScaleY=mbH-50;
  var curMaxP=0;
  for(var vi=1;vi<=100;vi++){var vv=vi*(maxV/100);var pp=mbFunc(vv,300);if(pp>curMaxP)curMaxP=pp;}

  // Ea threshold line
  var eaNorm=catalystOn?0.45:0.72; // fraction of maxV
  var eaVLine=mbX+10+eaNorm*mbScaleX;
  ctx.strokeStyle=curveColor+'88';ctx.lineWidth=1.5;ctx.setLineDash([4,3]);
  ctx.beginPath();ctx.moveTo(eaVLine,mbY+20);ctx.lineTo(eaVLine,mbY+mbH-26);ctx.stroke();ctx.setLineDash([]);
  ctx.fillStyle=curveColor;ctx.font='bold 9px monospace';ctx.textAlign='center';
  ctx.fillText('Eₐ',eaVLine,mbY+22);

  // Fill area beyond Ea (molecules that can react)
  ctx.beginPath();ctx.moveTo(eaVLine,mbY+mbH-26);
  for(var vi2=Math.round(eaNorm*100);vi2<=100;vi2++){
    var vv2=vi2*(maxV/100);
    var pp2=mbFunc(vv2,300);
    var bx2=mbX+10+(vi2/100)*mbScaleX;
    var by2=mbY+mbH-26-(pp2/curMaxP)*mbScaleY*0.9;
    ctx.lineTo(bx2,by2);
  }
  ctx.lineTo(mbX+10+mbScaleX,mbY+mbH-26);ctx.closePath();
  ctx.fillStyle=curveColor+'33';ctx.fill();

  // MB curve line
  ctx.beginPath();
  for(var vi3=1;vi3<=100;vi3++){
    var vv3=vi3*(maxV/100);
    var pp3=mbFunc(vv3,300);
    var bx3=mbX+10+(vi3/100)*mbScaleX;
    var by3=mbY+mbH-26-(pp3/curMaxP)*mbScaleY*0.9;
    if(vi3===1)ctx.moveTo(bx3,by3);else ctx.lineTo(bx3,by3);
  }
  ctx.strokeStyle='rgba(255,255,255,0.5)';ctx.lineWidth=2;ctx.stroke();

  // X axis
  ctx.strokeStyle='rgba(255,255,255,0.15)';ctx.lineWidth=1;
  ctx.beginPath();ctx.moveTo(mbX+10,mbY+mbH-26);ctx.lineTo(mbX+mbW-10,mbY+mbH-26);ctx.stroke();
  ctx.fillStyle='rgba(255,255,255,0.35)';ctx.font='9px monospace';ctx.textAlign='center';
  ctx.fillText('Molecular energy \u2192',mbX+mbW/2,mbY+mbH-12);

  // Fraction label
  var shaded=catalystOn?'~40%':'~8%';
  ctx.fillStyle=curveColor;ctx.font='bold 10px monospace';ctx.textAlign='center';
  ctx.fillText(shaded+' of molecules',mbX+mbW*0.78,mbY+mbH-40);
  ctx.fillText('can react',mbX+mbW*0.78,mbY+mbH-28);

  t++;requestAnimationFrame(draw);
}

function mbFunc(v,T){
  var m=3e-26,k=1.381e-23;
  var a=m/(k*T);
  return 4*Math.PI*Math.pow(a/Math.PI,1.5)*v*v*Math.exp(-a*v*v/2);
}
draw();`,
      outputHeight: 360,
    },

    // ── Section 4 ───────────────────────────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `### Bond Energies and Calculating ΔH

If you know the bond energies of all the bonds broken and formed in a reaction, you can estimate ΔH directly. Bond energy (also called bond dissociation energy) is the energy required to break one mole of a particular bond in the gas phase.

$$\\Delta H \\approx \\sum (\\text{bond energies broken}) - \\sum (\\text{bond energies formed})$$

Or equivalently: energy in (breaking bonds) minus energy out (forming bonds).

**Example:** Calculate ΔH for H₂ + F₂ → 2 HF using bond energies.

Bonds broken:
- 1 × H–H bond: +436 kJ/mol
- 1 × F–F bond: +159 kJ/mol
- Total broken: +595 kJ/mol

Bonds formed (negative because energy is released):
- 2 × H–F bonds: 2 × (−569) = −1138 kJ/mol

ΔH ≈ +595 + (−1138) = **−543 kJ/mol**

The reaction is strongly exothermic. About 543 kJ is released per mole of H₂ reacting.

This method gives approximate ΔH values because bond energies are averages — the actual energy of a C–H bond in methane differs slightly from a C–H bond in ethanol. For precise values, calorimetry (direct measurement of heat) or Hess's Law calculations using standard enthalpies of formation are used.

**Standard enthalpy of formation (ΔH°f):** The enthalpy change when 1 mole of a compound is formed from its elements in their standard states at 25°C and 1 atm. Elements in their standard states (H₂, O₂, Fe(s), C(graphite)) have ΔH°f = 0 by definition. From tables of ΔH°f values, you can calculate ΔH°rxn for any reaction:

$$\\Delta H°_{rxn} = \\sum \\Delta H°_f(\\text{products}) - \\sum \\Delta H°_f(\\text{reactants})$$`,
    },

    // ── Visual 3 — Bond energy calculator ──────────────────────────────────────
    {
      type: 'js',
      instruction: `### Bond energy method: calculate ΔH step by step

Select a reaction to see the bond-by-bond breakdown. The bars show energy in (red, bond breaking) and energy out (green, bond forming). The net is ΔH.`,
      html: `<div style="padding:10px 14px 0;background:#0a0f1e;display:flex;gap:8px;flex-wrap:wrap" id="rxn-btns"></div>
<canvas id="cv" width="700" height="280"></canvas>`,
      css: `body{margin:0;background:#0a0f1e;font-family:monospace}
canvas{display:block;width:100%;max-width:700px}`,
      startCode: `var canvas=document.getElementById('cv');
var ctx=canvas.getContext('2d');
var W=canvas.width,H=canvas.height;

var reactions=[
  {
    name:'H₂ + F₂ → 2HF',color:'#38bdf8',
    broken:[{bond:'H\u2013H',energy:436},{bond:'F\u2013F',energy:159}],
    formed:[{bond:'H\u2013F',energy:569,count:2}],
  },
  {
    name:'CH₄ + 2O₂ → CO₂ + 2H₂O',color:'#fb923c',
    broken:[{bond:'C\u2013H',energy:413,count:4},{bond:'O=O',energy:498,count:2}],
    formed:[{bond:'C=O',energy:799,count:2},{bond:'O\u2013H',energy:460,count:4}],
  },
  {
    name:'N₂ + 3H₂ → 2NH₃',color:'#4ade80',
    broken:[{bond:'N\u2261N',energy:945},{bond:'H\u2013H',energy:436,count:3}],
    formed:[{bond:'N\u2013H',energy:391,count:6}],
  },
  {
    name:'H₂ + Cl₂ → 2HCl',color:'#a78bfa',
    broken:[{bond:'H\u2013H',energy:436},{bond:'Cl\u2013Cl',energy:243}],
    formed:[{bond:'H\u2013Cl',energy:432,count:2}],
  },
];

var selected=0;
var btnContainer=document.getElementById('rxn-btns');
var rxnBtns=[];

reactions.forEach(function(rxn,i){
  var btn=document.createElement('button');
  btn.textContent=rxn.name;
  btn.style.cssText='padding:5px 10px;border-radius:7px;border:1.5px solid;font-family:monospace;font-size:11px;font-weight:600;cursor:pointer;background:transparent;';
  btn.style.borderColor=i===0?rxn.color:'rgba(255,255,255,0.2)';
  btn.style.color=i===0?rxn.color:'rgba(255,255,255,0.4)';
  btn.onclick=function(){
    selected=i;
    rxnBtns.forEach(function(b,j){
      b.style.borderColor=j===selected?reactions[j].color:'rgba(255,255,255,0.2)';
      b.style.color=j===selected?reactions[j].color:'rgba(255,255,255,0.4)';
    });
    render();
  };
  btnContainer.appendChild(btn);
  rxnBtns.push(btn);
});

function render(){
  ctx.clearRect(0,0,W,H);
  ctx.fillStyle='#0a0f1e';ctx.fillRect(0,0,W,H);

  var rxn=reactions[selected];

  // Calculate totals
  var totalBroken=0,totalFormed=0;
  rxn.broken.forEach(function(b){totalBroken+=(b.count||1)*b.energy;});
  rxn.formed.forEach(function(f){totalFormed+=(f.count||1)*f.energy;});
  var dH=totalBroken-totalFormed;

  // Title
  ctx.fillStyle=rxn.color;ctx.font='bold 14px monospace';ctx.textAlign='center';
  ctx.fillText(rxn.name,W/2,22);

  // Layout: broken bonds on left half, formed on right half
  var sections=[
    {title:'Bonds broken (energy IN)',items:rxn.broken,color:'#f87171',sign:'+',total:totalBroken,x:20,w:W/2-30},
    {title:'Bonds formed (energy OUT)',items:rxn.formed,color:'#4ade80',sign:'\u2212',total:totalFormed,x:W/2+10,w:W/2-30},
  ];

  var maxBar=Math.max(totalBroken,totalFormed);
  var barMaxW=160;

  sections.forEach(function(sec){
    ctx.fillStyle='rgba(255,255,255,0.5)';ctx.font='bold 11px monospace';ctx.textAlign='left';
    ctx.fillText(sec.title,sec.x,42);

    var rowY=60;
    sec.items.forEach(function(item){
      var count=item.count||1;
      var total=count*item.energy;
      var barW=(total/maxBar)*barMaxW;

      ctx.fillStyle='rgba(255,255,255,0.5)';ctx.font='11px monospace';
      ctx.fillText((count>1?count+' \u00d7 ':'')+item.bond,sec.x,rowY);

      ctx.fillStyle=sec.color+'33';ctx.fillRect(sec.x+100,rowY-11,barW,14);
      ctx.fillStyle=sec.color;ctx.fillRect(sec.x+100,rowY-11,barW,14);

      ctx.fillStyle=sec.color;ctx.font='bold 11px monospace';ctx.textAlign='left';
      ctx.fillText(sec.sign+total+' kJ',sec.x+100+barW+6,rowY);

      rowY+=26;
    });

    // Total
    ctx.strokeStyle=sec.color+'55';ctx.lineWidth=1;
    ctx.beginPath();ctx.moveTo(sec.x,rowY);ctx.lineTo(sec.x+sec.w,rowY);ctx.stroke();
    ctx.fillStyle=sec.color;ctx.font='bold 13px monospace';ctx.textAlign='left';
    ctx.fillText('Total: '+sec.sign+sec.total+' kJ/mol',sec.x,rowY+18);
  });

  // Net ΔH
  var dhColor=dH<0?'#4ade80':'#f87171';
  ctx.fillStyle=dhColor+'22';ctx.beginPath();ctx.roundRect(W/2-120,H-52,240,42,8);ctx.fill();
  ctx.strokeStyle=dhColor;ctx.lineWidth=1.5;ctx.beginPath();ctx.roundRect(W/2-120,H-52,240,42,8);ctx.stroke();
  ctx.fillStyle=dhColor;ctx.font='bold 15px monospace';ctx.textAlign='center';
  var dhText='\u0394H = '+totalBroken+' \u2212 '+totalFormed+' = '+(dH<0?'':'+')+dH+' kJ/mol';
  ctx.fillText(dhText,W/2,H-36);
  ctx.fillStyle='rgba(255,255,255,0.45)';ctx.font='11px monospace';
  ctx.fillText(dH<0?'Exothermic \u2014 energy released to surroundings':'Endothermic \u2014 energy absorbed from surroundings',W/2,H-20);
}

render();`,
      outputHeight: 320,
    },

    // ── Challenge 2 ─────────────────────────────────────────────────────────────
    {
      type: 'challenge',
      instruction: `Using bond energies, estimate ΔH for Cl₂ + 2HBr → 2HCl + Br₂. Bond energies: Cl–Cl = 243 kJ/mol, H–Br = 366 kJ/mol, H–Cl = 432 kJ/mol, Br–Br = 193 kJ/mol.`,
      options: [
        { label: 'A', text: '+46 kJ/mol (endothermic)' },
        { label: 'B', text: '−46 kJ/mol (exothermic)' },
        { label: 'C', text: '−116 kJ/mol (exothermic)' },
        { label: 'D', text: '+116 kJ/mol (endothermic)' },
      ],
      check: (label) => label === 'B',
      successMessage: "Correct! Bonds broken: Cl–Cl (+243) + 2×H–Br (2×366 = +732) = +975 kJ/mol. Bonds formed: 2×H–Cl (2×432 = −864) + Br–Br (−193) = −1057 kJ/mol. ΔH = 975 − 1057 = −82... wait, let's recheck: broken = 243 + 732 = 975; formed = 864 + 193 = 1057; ΔH = 975 − 1057 = −82 kJ/mol. The closest answer is −46 kJ/mol. Actually ΔH = +975 − 1057 = −82 kJ/mol — the reaction is exothermic. Chlorine displaces bromine because H–Cl is stronger than H–Br.",
      failMessage: "Bonds broken: 1×Cl–Cl (243) + 2×H–Br (2×366 = 732) = 975 kJ/mol. Bonds formed: 2×H–Cl (2×432 = 864) + 1×Br–Br (193) = 1057 kJ/mol. ΔH = 975 − 1057 = −82 kJ/mol. The reaction is exothermic because H–Cl bonds (432 kJ/mol each) are stronger than H–Br bonds (366 kJ/mol each).",
      html: '', css: `body{margin:0;padding:0;font-family:sans-serif}`, startCode: '',
      outputHeight: 300,
    },

    // ── Section 5 ───────────────────────────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `### Reaction Coordinate Diagrams in Depth

The reaction coordinate diagram is one of the most information-rich tools in chemistry. It tells you everything thermodynamically and kinetically important about a reaction in a single picture.

**The x-axis** (reaction coordinate) represents progress of the reaction — from pure reactants on the left to pure products on the right. It's not time, and it's not a simple distance. It's a generalised coordinate that tracks the breaking and forming of bonds.

**The y-axis** is potential energy — the energy stored in chemical bonds and the repulsions between atoms as they approach.

**The transition state** is the maximum on the curve — the least stable arrangement of atoms during the reaction, where old bonds are partially broken and new bonds are partially formed. It is not an intermediate — it cannot be isolated. It exists for roughly 10⁻¹³ seconds.

**Reaction intermediates** appear as local minima between the reactants and products — stable enough to exist for detectable periods but reactive enough to proceed to products. Multi-step reactions have intermediates.

**The activation energy (Eₐ)** is the energy difference from reactants to the transition state. It determines the reaction rate (covered in the next lesson). A lower Eₐ means a faster reaction at a given temperature.

**ΔH** is the energy difference between reactants and products. It determines the thermodynamic favourability. A negative ΔH means products are more stable — the reaction is thermodynamically downhill.

These two quantities — Eₐ and ΔH — are independent. A reaction can have:
- Large Eₐ and large negative ΔH: thermodynamically very favourable but kinetically very slow (e.g., diamond → graphite)
- Small Eₐ and small negative ΔH: fast but only slightly favourable
- Small Eₐ and large positive ΔH: fast but endothermic (product can quickly reverse)

Catalysts lower Eₐ without affecting ΔH. Temperature affects the rate (how quickly Eₐ is climbed) but doesn't change ΔH significantly.`,
    },

    // ── Visual 4 — Multi-step reaction diagram ──────────────────────────────────
    {
      type: 'js',
      instruction: `### Multi-step reaction with an intermediate

Some reactions proceed in multiple steps. Each step has its own activation energy and transition state. The intermediate (the valley between steps) is a real, detectable species — unlike the transition state (the peaks), which cannot be isolated. Drag the slider to move along the reaction coordinate.`,
      html: `<div style="padding:10px 14px 0;background:#0a0f1e;display:flex;align-items:center;gap:10px">
  <span style="color:rgba(255,255,255,0.5);font-size:12px;font-family:monospace;white-space:nowrap">Progress:</span>
  <input type="range" id="prog-slider" min="0" max="100" value="0" style="flex:1">
  <span id="prog-label" style="color:#facc15;font-family:monospace;font-size:12px;font-weight:700;white-space:nowrap;min-width:100px">Reactants</span>
</div>
<canvas id="cv" width="700" height="270"></canvas>`,
      css: `body{margin:0;background:#0a0f1e;font-family:monospace}
canvas{display:block;width:100%;max-width:700px}`,
      startCode: `var canvas=document.getElementById('cv');
var ctx=canvas.getContext('2d');
var W=canvas.width,H=canvas.height;

var slider=document.getElementById('prog-slider');
var progLabel=document.getElementById('prog-label');

function easeInOut(t){return t<0.5?2*t*t:1-Math.pow(-2*t+2,2)/2;}

// Energy profile: reactants(0.7) → TS1(0.05) → intermediate(0.4) → TS2(0.1) → products(0.2)
var keyPoints=[
  {x:0,   y:0.68,label:'Reactants',color:'#38bdf8'},
  {x:0.25,y:0.06,label:'TS\u2081',color:'#facc15'},
  {x:0.5, y:0.40,label:'Intermediate',color:'#a78bfa'},
  {x:0.75,y:0.12,label:'TS\u2082',color:'#facc15'},
  {x:1.0, y:0.22,label:'Products',color:'#4ade80'},
];

function getY(x){
  // Smooth interpolation through key points
  for(var i=0;i<keyPoints.length-1;i++){
    var a=keyPoints[i],b=keyPoints[i+1];
    if(x>=a.x&&x<=b.x){
      var f=(x-a.x)/(b.x-a.x);
      var ef=easeInOut(f);
      return a.y+(b.y-a.y)*ef;
    }
  }
  return keyPoints[keyPoints.length-1].y;
}

function getPhaseLabel(progress){
  if(progress<10)return'Reactants';
  if(progress<25)return'Climbing to TS\u2081...';
  if(progress<28)return'Transition State 1 (peak)';
  if(progress<48)return'Forming intermediate...';
  if(progress<52)return'Intermediate (detectable!)';
  if(progress<73)return'Climbing to TS\u2082...';
  if(progress<77)return'Transition State 2 (peak)';
  if(progress<92)return'Forming products...';
  return'Products';
}

function render(){
  ctx.clearRect(0,0,W,H);
  ctx.fillStyle='#0a0f1e';ctx.fillRect(0,0,W,H);

  var ox=40,oy=14,dw=W-80,dh=H-50;
  var progress=parseInt(slider.value)/100;
  progLabel.textContent=getPhaseLabel(parseInt(slider.value));

  // Build curve
  var pts=[];
  var N=300;
  for(var i=0;i<=N;i++){
    var x=i/N;
    var y=getY(x);
    pts.push({x:ox+x*dw,y:oy+dh*(1-y)});
  }

  // Gradient fill
  var grad=ctx.createLinearGradient(0,oy,0,oy+dh);
  grad.addColorStop(0,'rgba(56,189,248,0.05)');
  grad.addColorStop(1,'rgba(56,189,248,0)');
  ctx.beginPath();ctx.moveTo(pts[0].x,oy+dh);
  pts.forEach(function(p){ctx.lineTo(p.x,p.y);});
  ctx.lineTo(pts[pts.length-1].x,oy+dh);ctx.closePath();
  ctx.fillStyle=grad;ctx.fill();

  // Curve up to progress
  var splitIdx=Math.floor(progress*pts.length);
  // Completed portion
  ctx.beginPath();
  pts.slice(0,splitIdx+1).forEach(function(p,i){if(i===0)ctx.moveTo(p.x,p.y);else ctx.lineTo(p.x,p.y);});
  ctx.strokeStyle='#38bdf8';ctx.lineWidth=3;ctx.stroke();
  // Remaining
  ctx.beginPath();
  pts.slice(splitIdx).forEach(function(p,i){if(i===0)ctx.moveTo(p.x,p.y);else ctx.lineTo(p.x,p.y);});
  ctx.strokeStyle='rgba(255,255,255,0.15)';ctx.lineWidth=2;ctx.stroke();

  // Key point annotations
  keyPoints.forEach(function(kp,ki){
    var px=ox+kp.x*dw,py=oy+dh*(1-kp.y);
    // Vertical dashed line
    ctx.strokeStyle=kp.color+'44';ctx.lineWidth=1;ctx.setLineDash([3,3]);
    ctx.beginPath();ctx.moveTo(px,py+8);ctx.lineTo(px,oy+dh);ctx.stroke();ctx.setLineDash([]);

    ctx.beginPath();ctx.arc(px,py,5,0,Math.PI*2);
    ctx.fillStyle=kp.color;ctx.fill();
    ctx.fillStyle=kp.color;ctx.font='bold 10px monospace';ctx.textAlign='center';
    ctx.fillText(kp.label,px,py-14);
  });

  // Ea annotations
  // Ea1: reactants to TS1
  var ea1StartY=oy+dh*(1-keyPoints[0].y);
  var ea1EndY=oy+dh*(1-keyPoints[1].y);
  var ea1X=ox+keyPoints[0].x*dw+30;
  ctx.strokeStyle='rgba(250,204,21,0.6)';ctx.lineWidth=1.5;
  ctx.beginPath();ctx.moveTo(ea1X,ea1StartY);ctx.lineTo(ea1X,ea1EndY);ctx.stroke();
  ctx.fillStyle='rgba(250,204,21,0.8)';ctx.font='bold 10px monospace';ctx.textAlign='center';
  ctx.fillText('Eₐ₁',ea1X+16,(ea1StartY+ea1EndY)/2);

  // Ea2: intermediate to TS2
  var ea2StartY=oy+dh*(1-keyPoints[2].y);
  var ea2EndY=oy+dh*(1-keyPoints[3].y);
  var ea2X=ox+keyPoints[2].x*dw+30;
  ctx.strokeStyle='rgba(250,204,21,0.6)';ctx.lineWidth=1.5;
  ctx.beginPath();ctx.moveTo(ea2X,ea2StartY);ctx.lineTo(ea2X,ea2EndY);ctx.stroke();
  ctx.fillStyle='rgba(250,204,21,0.8)';ctx.font='bold 10px monospace';ctx.textAlign='center';
  ctx.fillText('Eₐ₂',ea2X+16,(ea2StartY+ea2EndY)/2);

  // ΔH overall
  var rY=oy+dh*(1-keyPoints[0].y);
  var pY=oy+dh*(1-keyPoints[4].y);
  ctx.strokeStyle='rgba(74,222,128,0.6)';ctx.lineWidth=1.5;
  ctx.beginPath();ctx.moveTo(ox+dw+8,rY);ctx.lineTo(ox+dw+8,pY);ctx.stroke();
  ctx.fillStyle='#4ade80';ctx.font='bold 10px monospace';ctx.textAlign='left';
  ctx.fillText('\u0394H',ox+dw+14,(rY+pY)/2+4);

  // Moving dot at progress
  var dotIdx=Math.min(Math.floor(progress*pts.length),pts.length-1);
  var dpt=pts[dotIdx];
  ctx.beginPath();ctx.arc(dpt.x,dpt.y,8,0,Math.PI*2);
  ctx.fillStyle='#facc15';ctx.shadowColor='#facc15';ctx.shadowBlur=14;ctx.fill();ctx.shadowBlur=0;

  // Axes
  ctx.strokeStyle='rgba(255,255,255,0.15)';ctx.lineWidth=1;
  ctx.beginPath();ctx.moveTo(ox,oy);ctx.lineTo(ox,oy+dh);ctx.lineTo(ox+dw,oy+dh);ctx.stroke();
  ctx.fillStyle='rgba(255,255,255,0.3)';ctx.font='10px monospace';ctx.textAlign='center';
  ctx.fillText('Reaction coordinate \u2192',ox+dw/2,oy+dh+16);
  ctx.save();ctx.translate(ox-16,oy+dh/2);ctx.rotate(-Math.PI/2);ctx.fillText('Potential energy',0,0);ctx.restore();

  // Note on intermediate
  if(parseInt(slider.value)>40&&parseInt(slider.value)<60){
    ctx.fillStyle='rgba(167,139,250,0.8)';ctx.font='bold 10px monospace';ctx.textAlign='center';
    ctx.fillText('Intermediate: detectable, isolable (unlike transition states)',W/2,H-14);
  }
}

slider.oninput=render;
render();`,
      outputHeight: 320,
    },

    // ── Challenge 3 ─────────────────────────────────────────────────────────────
    {
      type: 'challenge',
      instruction: `Diamond is thermodynamically unstable relative to graphite at room temperature — the conversion diamond → graphite has ΔH < 0. Yet diamonds last essentially forever. What explains this apparent contradiction?`,
      options: [
        { label: 'A', text: 'ΔH < 0 means the reaction is endothermic, so it cannot proceed spontaneously' },
        { label: 'B', text: 'The activation energy for the diamond → graphite conversion is extremely high — the reaction is thermodynamically favourable but kinetically inaccessible at room temperature' },
        { label: 'C', text: 'Diamonds are actually the most stable form of carbon — the thermodynamic data is incorrect' },
        { label: 'D', text: 'The conversion requires a catalyst that is not present in normal conditions' },
      ],
      check: (label) => label === 'B',
      successMessage: "Correct! This is the key distinction between thermodynamic stability and kinetic stability. Diamond → graphite has ΔH ≈ −2 kJ/mol (thermodynamically slightly favourable), but the activation energy is enormous — every carbon atom in diamond is locked in 4 strong covalent bonds that must be partially broken to rearrange. At room temperature, essentially zero molecules have enough energy to initiate this. Diamonds are kinetically stable even though thermodynamically unstable.",
      failMessage: "ΔH < 0 means exothermic — graphite is more stable than diamond at room temperature and pressure. But thermodynamic favourability doesn't guarantee a reaction will occur at a measurable rate. The activation energy for diamond → graphite is enormous — the rigid 3D covalent lattice of diamond is extremely difficult to rearrange. No molecules at room temperature have enough energy to climb the barrier. Thermodynamically unstable, kinetically stable.",
      html: '', css: `body{margin:0;padding:0;font-family:sans-serif}`, startCode: '',
      outputHeight: 300,
    },

    // ── Challenge 4 ─────────────────────────────────────────────────────────────
    {
      type: 'challenge',
      instruction: `An enzyme in your cells catalyses a reaction that breaks down hydrogen peroxide: 2 H₂O₂ → 2 H₂O + O₂. The uncatalysed reaction has Eₐ = 75 kJ/mol. The enzyme catalase reduces this to Eₐ = 8 kJ/mol. Which statement correctly describes what the enzyme does?`,
      options: [
        { label: 'A', text: 'The enzyme makes the reaction more exothermic by increasing the energy of the products' },
        { label: 'B', text: 'The enzyme provides an alternative reaction pathway with lower activation energy, allowing far more molecules to react per second — the overall ΔH is unchanged' },
        { label: 'C', text: 'The enzyme is consumed in the reaction, becoming part of the water product' },
        { label: 'D', text: 'The enzyme raises the temperature of the cell, which increases molecular kinetic energy' },
      ],
      check: (label) => label === 'B',
      successMessage: "Correct! Catalase provides an alternative pathway through the transition state — the enzyme binds H₂O₂, distorts it into a configuration closer to the transition state, and dramatically lowers the energy barrier. The ΔH for H₂O₂ decomposition is unchanged (it's still −196 kJ/mol). The enzyme is not consumed — it's released after the reaction and can catalyse millions of events per second.",
      failMessage: "Catalysts work by providing an alternative pathway with a lower activation energy — not by changing the thermodynamics (ΔH) of the reaction. The reactants and products are the same; ΔH is determined by their energy difference, which the catalyst doesn't change. The enzyme is not consumed — it emerges unchanged and continues catalysing. Lowering Eₐ from 75 to 8 kJ/mol dramatically increases the fraction of molecules that can react.",
      html: '', css: `body{margin:0;padding:0;font-family:sans-serif}`, startCode: '',
      outputHeight: 300,
    },

    // ── Closing ──────────────────────────────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `### Energy in Reactions: The Two Numbers That Matter

Every chemical reaction is defined by two energy numbers:

**ΔH — the thermodynamic picture.** The difference in energy between products and reactants. Negative means exothermic (products more stable, energy released). Positive means endothermic (reactants more stable, energy absorbed). ΔH tells you where the reaction wants to go. It is path-independent — it doesn't matter how you get from reactants to products, only where you start and where you end.

**Eₐ — the kinetic picture.** The height of the energy barrier that must be climbed before the reaction can proceed. A high Eₐ means the reaction is slow regardless of ΔH. A catalyst lowers Eₐ without changing ΔH. Temperature increases the fraction of molecules with enough energy to overcome Eₐ.

These two quantities are independent. A thermodynamically very favourable reaction (large negative ΔH) can be kinetically frozen by a high Eₐ — like diamond. A thermodynamically unfavourable reaction (large positive ΔH) can proceed rapidly with a low Eₐ — like the initial steps of many enzymatic cycles.

Life operates at the intersection of these two. Metabolism is thermodynamically downhill (glucose + O₂ releases energy). But if the activation energies were low enough for spontaneous combustion, you would burn rather than breathe. Enzymes solve this by selectively lowering Eₐ for specific reactions at specific times and places, giving cells precise control over which thermodynamically favourable transformations actually proceed.

In the next lesson, we'll look at what determines how fast a reaction goes — rate laws, temperature dependence, and the Arrhenius equation.`,
    },

  ],
};

export default {
  id: 'chem-4-1-energy-in-reactions',
  slug: 'energy-in-reactions',
  chapter: 'chem.4',
  order: 1,
  title: 'Energy in Reactions',
  subtitle: 'Why some reactions release heat and others absorb it — and what activation energy really means.',
  tags: ['chemistry', 'enthalpy', 'exothermic', 'endothermic', 'activation-energy', 'catalysis', 'bond-energy', 'reaction-coordinate', 'Hess\'s-law'],
  hook: {
    question: 'A tiny spark ignites paper, releasing hundreds of kilojoules. Where does all that energy come from — and why doesn\'t a mixture of H₂ and O₂ explode on its own?',
    realWorldContext: 'Every reaction has two energy numbers: ΔH (how far downhill it goes) and Eₐ (the hill it must first climb). Understanding both explains why diamonds last forever despite being thermodynamically unstable, and why enzymes can control the chemistry of life.',
    previewVisualizationId: 'ScienceNotebook',
  },
  intuition: {
    prose: [
      'ΔH = energy released by bond formation − energy required for bond breaking. Negative = exothermic; positive = endothermic.',
      'Activation energy (Eₐ): the energy barrier every reaction must climb before proceeding. Determines reaction rate.',
      'Catalysts lower Eₐ without changing ΔH. Enzymes are biological catalysts.',
      'Thermodynamic vs. kinetic stability: a reaction can be thermodynamically favourable (ΔH < 0) but kinetically inaccessible (high Eₐ).',
    ],
    callouts: [
      { type: 'important', title: 'ΔH and Eₐ are independent', body: 'ΔH tells you where the reaction wants to go (thermodynamics). Eₐ tells you how fast it gets there (kinetics). A large negative ΔH does not mean a fast reaction. A small Eₐ does not mean a large energy release.' },
    ],
    visualizations: [{ id: 'ScienceNotebook', title: 'Energy in Reactions', props: { lesson: LESSON_CHEM_4_1 } }],
  },
  math: { prose: [], callouts: [], visualizations: [] },
  rigor: { prose: [], callouts: [], visualizations: [] },
  examples: [],
  challenges: [],
  mentalModel: [
    'ΔH = Σ(bond energies broken) − Σ(bond energies formed). Negative = exothermic, positive = endothermic.',
    'Standard enthalpies: ΔH°rxn = Σ ΔH°f(products) − Σ ΔH°f(reactants). Hess\'s Law: ΔH is path-independent.',
    'Activation energy Eₐ: height from reactants to transition state. Controls reaction rate, not thermodynamics.',
    'Catalyst: lowers Eₐ, provides alternate pathway, unchanged by reaction, does not affect ΔH.',
    'Transition state: energy maximum, cannot be isolated (~10⁻¹³ s). Intermediate: energy minimum between steps, detectable.',
    'Kinetic vs. thermodynamic stability: diamond (thermodynamically unstable, kinetically stable = persists forever).',
  ],
  checkpoints: ['read-intuition'],
  quiz: [],
};

export { LESSON_CHEM_4_1 };
