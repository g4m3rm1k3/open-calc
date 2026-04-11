// Chemistry · Chapter 4 · Lesson 4
// Acids and Bases

const LESSON_CHEM_4_4 = {
  title: 'Acids and Bases',
  subtitle: 'Proton transfer, pH, and the chemistry that runs through all of biology.',
  sequential: true,

  cells: [

    // ── Section 1 ───────────────────────────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `### The Chemistry You Taste Every Day

Lemon juice is sour. Baking soda tastes bitter and fizzes in vinegar. Battery acid dissolves metal. Bleach is caustic. Antacids soothe heartburn. Blood maintains a pH within a razor-thin range — drift outside it and you die.

All of this is acid-base chemistry. It is the most pervasive chemistry in daily life, in medicine, in biology, and in the environment. And at its core, it is simple: **acid-base reactions are proton transfers.**

An acid donates a proton (H⁺). A base accepts a proton. That's it. When hydrochloric acid dissolves in water, it donates H⁺ to water. When ammonia dissolves in water, it accepts H⁺ from water. The H⁺ moving between molecules is the entire story.

But the consequences of that simple exchange cascade through everything. The concentration of H⁺ in a solution — the pH — determines enzyme activity, protein structure, drug absorption, mineral solubility, and the ability of blood to carry oxygen. Every cell in your body continuously generates acid (CO₂ from respiration, lactic acid from exercise) and every cell has mechanisms to manage that acid.

We'll build the picture from first principles: what makes an acid or a base, why water is both, what pH means and how to calculate it, and how buffer systems maintain the stability that life depends on.`,
    },

    // ── Section 2 ───────────────────────────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `### Three Definitions of Acids and Bases

Chemistry developed three progressively more powerful definitions:

**Arrhenius (1884):** An acid produces H⁺ in water; a base produces OH⁻ in water. Simple and practical, but limited — it only works in aqueous solution and can't explain why ammonia (NH₃) is a base even though it contains no OH⁻.

**Brønsted-Lowry (1923):** An acid is a **proton donor**; a base is a **proton acceptor**. This is the definition we use most. It works in any solvent and explains ammonia: NH₃ accepts H⁺ from water, becoming NH₄⁺ (ammonium), leaving OH⁻ behind.

HCl + H₂O → H₃O⁺ + Cl⁻ (HCl donates H⁺ to water — HCl is the acid, H₂O is the base)
NH₃ + H₂O ⇌ NH₄⁺ + OH⁻ (H₂O donates H⁺ to NH₃ — H₂O is the acid, NH₃ is the base)

**Lewis (1923):** An acid is an **electron pair acceptor**; a base is an **electron pair donor**. The broadest definition — it covers reactions that involve no proton at all, like the reaction of BF₃ with NH₃ where BF₃ accepts a lone pair from NH₃. Lewis acids and bases are central to organometallic chemistry and catalysis.

**Conjugate acid-base pairs:** In Brønsted-Lowry chemistry, when an acid donates a proton, the species that remains is called the **conjugate base**. When a base accepts a proton, the result is the **conjugate acid**.

HCl donates H⁺ → conjugate base is Cl⁻
H₂O accepts H⁺ → conjugate acid is H₃O⁺

Every Brønsted-Lowry acid-base reaction involves two conjugate pairs. The stronger the acid, the weaker its conjugate base — and vice versa.`,
    },

    // ── Visual 1 — Proton transfer animation ────────────────────────────────────
    {
      type: 'js',
      instruction: `### Brønsted-Lowry proton transfer: acid donates H⁺ to base

The animation shows two reactions: HCl donating H⁺ to water (strong acid, complete transfer), and acetic acid donating H⁺ to water (weak acid, partial equilibrium). Watch the proton move between molecules and see how the conjugate pairs form.`,
      html: `<div style="padding:8px 14px 0;background:#0a0f1e;display:flex;gap:8px">
  <button id="btn-hcl" style="padding:6px 14px;border-radius:8px;border:1.5px solid #f87171;background:rgba(248,113,113,0.2);color:#f87171;font-family:monospace;font-size:12px;font-weight:700;cursor:pointer">HCl (strong acid)</button>
  <button id="btn-acetic" style="padding:6px 14px;border-radius:8px;border:1.5px solid rgba(255,255,255,0.2);background:transparent;color:rgba(255,255,255,0.4);font-family:monospace;font-size:12px;font-weight:700;cursor:pointer">CH₃COOH (weak acid)</button>
</div>
<canvas id="cv" width="700" height="300"></canvas>`,
      css: `body{margin:0;background:#0a0f1e;font-family:monospace}
canvas{display:block;width:100%;max-width:700px}`,
      startCode: `var canvas=document.getElementById('cv');
var ctx=canvas.getContext('2d');
var W=canvas.width,H=canvas.height;
var t=0;
var mode='hcl';

document.getElementById('btn-hcl').onclick=function(){
  mode='hcl';t=0;
  this.style.borderColor='#f87171';this.style.background='rgba(248,113,113,0.2)';this.style.color='#f87171';
  var b=document.getElementById('btn-acetic');
  b.style.borderColor='rgba(255,255,255,0.2)';b.style.background='transparent';b.style.color='rgba(255,255,255,0.4)';
};
document.getElementById('btn-acetic').onclick=function(){
  mode='acetic';t=0;
  this.style.borderColor='#fb923c';this.style.background='rgba(251,146,60,0.2)';this.style.color='#fb923c';
  var b=document.getElementById('btn-hcl');
  b.style.borderColor='rgba(255,255,255,0.2)';b.style.background='transparent';b.style.color='rgba(255,255,255,0.4)';
};

function drawAtom(x,y,sym,color,r){
  r=r||16;
  ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);
  ctx.fillStyle='#0f172a';ctx.fill();
  ctx.strokeStyle=color;ctx.lineWidth=2;ctx.stroke();
  ctx.fillStyle=color;ctx.font='bold '+(r>13?'11':'9')+'px monospace';
  ctx.textAlign='center';ctx.textBaseline='middle';
  ctx.fillText(sym,x,y);
}

function drawBond(x1,y1,x2,y2,color,alpha){
  ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);
  ctx.strokeStyle=color;ctx.lineWidth=3;ctx.globalAlpha=alpha||1;ctx.stroke();ctx.globalAlpha=1;
}

function easeInOut(t){return t<0.5?2*t*t:1-Math.pow(-2*t+2,2)/2;}
function lerp(a,b,f){return a+(b-a)*f;}

function draw(){
  ctx.clearRect(0,0,W,H);
  ctx.fillStyle='#0a0f1e';ctx.fillRect(0,0,W,H);

  var cy=H/2-10;
  var CYCLE=240;
  var cycle=t%CYCLE;
  var isStrong=mode==='hcl';

  // Phases: 0-60 approach, 60-120 transfer, 120-180 products stable, 180-240 reset (weak only reverses)
  var phase=cycle<60?0:cycle<120?1:cycle<180?2:3;
  var frac=(cycle%60)/60;
  var ef=easeInOut(frac);

  // ── Layout ──
  // Left side: acid molecule
  // Right side: water/base
  // After transfer: H3O+ (or conjugate) on right, conjugate base on left

  var acidX=180,waterX=490;
  var acidLabel=isStrong?'HCl':'CH\u2083COOH';
  var conjBaseLabel=isStrong?'Cl\u207b':'CH\u2083COO\u207b';
  var acidColor=isStrong?'#f87171':'#fb923c';

  // H position (proton being transferred)
  var hStartX=acidX+28,hStartY=cy;
  var hEndX=waterX-28,hEndY=cy;
  var hx,hy;

  // For weak acid: show equilibrium oscillation after phase 1
  var showReverse=!isStrong&&phase===3;
  var transferProg=0;

  if(phase===0){transferProg=0;}
  else if(phase===1){transferProg=ef;}
  else if(phase===2||phase===3){transferProg=isStrong?1:0.95+0.05*Math.sin(t*0.08);}

  hx=lerp(hStartX,hEndX,transferProg);
  hy=lerp(hStartY,hEndY,transferProg)+Math.sin(transferProg*Math.PI)*(-30);

  // Draw acid molecule (losing H)
  // HCl: H-Cl, CH3COOH: simplified as RCOOH
  if(isStrong){
    // H ... Cl with bond fading
    if(transferProg<0.8)drawBond(hx,hy,acidX+38,cy,acidColor,1-transferProg*1.2);
    drawAtom(acidX+38,cy,'Cl','#4ade80',20);
    ctx.fillStyle=acidColor;ctx.font='10px monospace';ctx.textAlign='center';
    ctx.fillText(transferProg>0.8?'Cl\u207b (conjugate base)':'HCl (acid)',acidX+38,cy+36);
  } else {
    // CH3COO-H with carboxyl group
    drawAtom(acidX,cy,'CH\u2083','#fb923c',22);
    drawBond(acidX+22,cy,acidX+42,cy,'#fb923c',1);
    drawAtom(acidX+50,cy,'C','#fb923c',12);
    drawBond(acidX+62,cy,acidX+72,cy-12,'#fb923c',1);
    drawAtom(acidX+72,cy-12,'O','#f87171',10);
    drawBond(acidX+62,cy,acidX+78,cy+8,'#fb923c',1);
    drawAtom(acidX+78,cy+8,'O','#f87171',10);
    if(transferProg<0.85)drawBond(hx,hy,acidX+88,cy+8,'#e2e8f0',1-transferProg);
    ctx.fillStyle=acidColor;ctx.font='10px monospace';ctx.textAlign='center';
    ctx.fillText(transferProg>0.85?'CH\u2083COO\u207b (conjugate base)':'CH\u2083COOH (acid)',acidX+38,cy+50);
  }

  // Draw water molecule (accepting H)
  var waterAccepting=transferProg>0.5;
  var h2oAngle=0.5;
  var h2oX=waterX+(waterAccepting?8:0),h2oY=cy;
  var wH1x=h2oX-Math.sin(h2oAngle)*22,wH1y=h2oY+Math.cos(h2oAngle)*22;
  var wH2x=h2oX+Math.sin(h2oAngle)*22,wH2y=h2oY+Math.cos(h2oAngle)*22;

  drawBond(h2oX,h2oY,wH1x,wH1y,'#e2e8f0',1);
  drawBond(h2oX,h2oY,wH2x,wH2y,'#e2e8f0',1);
  drawAtom(h2oX,h2oY,'O','#38bdf8',16);
  drawAtom(wH1x,wH1y,'H','#e2e8f0',11);
  drawAtom(wH2x,wH2y,'H','#e2e8f0',11);
  ctx.fillStyle='#38bdf8';ctx.font='10px monospace';ctx.textAlign='center';
  ctx.fillText(waterAccepting?'H\u2083O\u207a (conjugate acid)':'H\u2082O (base)',h2oX,cy+40);

  // Draw the transferring proton
  drawAtom(hx,hy,'H','#facc15',11);
  if(transferProg>0.05&&transferProg<0.95){
    ctx.fillStyle='rgba(250,204,21,0.6)';ctx.font='9px monospace';ctx.textAlign='center';
    ctx.fillText('H\u207a in transit',hx,hy-18);
  }

  // Arrows showing direction
  ctx.strokeStyle='rgba(255,255,255,0.2)';ctx.lineWidth=1.5;ctx.setLineDash([4,3]);
  if(phase<=1){
    ctx.beginPath();ctx.moveTo(acidX+60,cy-50);ctx.lineTo(waterX-60,cy-50);ctx.stroke();
    ctx.beginPath();ctx.moveTo(waterX-68,cy-55);ctx.lineTo(waterX-60,cy-50);ctx.lineTo(waterX-68,cy-45);ctx.stroke();
  }
  ctx.setLineDash([]);

  // For weak acid, show reverse arrow
  if(!isStrong&&phase>=2){
    ctx.strokeStyle='rgba(251,146,60,0.4)';ctx.lineWidth=1.5;ctx.setLineDash([4,3]);
    ctx.beginPath();ctx.moveTo(waterX-60,cy-62);ctx.lineTo(acidX+60,cy-62);ctx.stroke();
    ctx.beginPath();ctx.moveTo(acidX+68,cy-67);ctx.lineTo(acidX+60,cy-62);ctx.lineTo(acidX+68,cy-57);ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle='rgba(251,146,60,0.6)';ctx.font='10px monospace';ctx.textAlign='center';
    ctx.fillText('(partial \u2014 equilibrium)',W/2,cy-72);
  }

  // Top label
  var topLabel=isStrong?'HCl + H\u2082O \u2192 H\u2083O\u207a + Cl\u207b  (complete, irreversible)':
    'CH\u2083COOH + H\u2082O \u21cc H\u2083O\u207a + CH\u2083COO\u207b  (partial equilibrium, Ka = 1.8\u00d710\u207b\u2075)';
  ctx.fillStyle=acidColor;ctx.font='bold 12px monospace';ctx.textAlign='center';
  ctx.fillText(topLabel,W/2,26);

  // Conjugate pair labels
  ctx.fillStyle='rgba(255,255,255,0.3)';ctx.font='10px monospace';ctx.textAlign='center';
  ctx.fillText('Conjugate pair 1',isStrong?acidX+38:acidX+38,H-28);
  ctx.fillText('Conjugate pair 2',waterX,H-28);

  t++;requestAnimationFrame(draw);
}
draw();`,
      outputHeight: 360,
    },

    // ── Section 3 ───────────────────────────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `### Strong vs. Weak Acids and Bases

Not all acids donate protons equally readily. The strength of an acid is measured by how completely it donates its proton to water.

**Strong acids** ionise completely in water. Every molecule donates its proton. Examples: HCl, HBr, HI, HNO₃, H₂SO₄, HClO₄. If you dissolve 0.1 mol of HCl in 1 L of water, you get 0.1 mol of H₃O⁺ and 0.1 mol of Cl⁻. No HCl molecules remain.

**Weak acids** only partially ionise — they establish an equilibrium. Acetic acid (vinegar), carbonic acid (fizzy drinks), phosphoric acid (cola), hydrofluoric acid (surprisingly weak despite being dangerous). The equilibrium constant for weak acid ionisation is called **Ka** (the acid dissociation constant):

$$\text{HA} + \text{H}_2\text{O} \rightleftharpoons \text{H}_3\text{O}^+ + \text{A}^-$$
$$K_a = \\frac{[\\text{H}_3\\text{O}^+][\\text{A}^-]}{[\\text{HA}]}$$

A large Ka means more dissociation (stronger acid). A small Ka means little dissociation (weaker acid). Ka values span many orders of magnitude, so we often use pKa = −log₁₀(Ka) for convenience. A lower pKa means a stronger acid.

**Strong bases** dissociate completely in water: NaOH, KOH, Ca(OH)₂. They release OH⁻ quantitatively.

**Weak bases** partially accept protons. Ammonia (NH₃), the amine groups in amino acids, the imidazole ring in histidine. The equilibrium constant is Kb. The relationship between Ka of an acid and Kb of its conjugate base is:

$$K_a \\times K_b = K_w = 1.0 \\times 10^{-14} \\text{ at 25°C}$$

where Kw is the **ion product of water** — a fundamental constant we'll meet next.`,
    },

    // ── Challenge 1 ─────────────────────────────────────────────────────────────
    {
      type: 'challenge',
      instruction: `Hydrofluoric acid (HF) has Ka = 6.8 × 10⁻⁴. Acetic acid (CH₃COOH) has Ka = 1.8 × 10⁻⁵. Both are weak acids. Which is stronger, and what does this mean physically?`,
      options: [
        { label: 'A', text: 'Acetic acid is stronger because it has a larger molecule' },
        { label: 'B', text: 'HF is stronger because it has a larger Ka — at equilibrium, a higher fraction of HF molecules have donated their proton compared to acetic acid molecules' },
        { label: 'C', text: 'Both are equally weak because Ka < 1 for both' },
        { label: 'D', text: 'HF is stronger because fluorine is the most electronegative element' },
      ],
      check: (label) => label === 'B',
      successMessage: "Correct! Ka(HF) = 6.8 × 10⁻⁴ is about 38 times larger than Ka(CH₃COOH) = 1.8 × 10⁻⁵. Both are weak (Ka << 1, neither fully ionises), but HF has a larger fraction ionised at equilibrium. In 0.1 M solutions, HF is about 8% ionised while acetic acid is about 1.3% ionised. Both are far weaker than strong acids like HCl (essentially 100% ionised).",
      failMessage: "Acid strength is determined by Ka, not molecular size or electronegativity alone. Larger Ka = stronger acid = greater fraction ionised. Ka(HF) = 6.8 × 10⁻⁴ > Ka(CH₃COOH) = 1.8 × 10⁻⁵, so HF is the stronger of the two weak acids — more of its molecules donate H⁺ at equilibrium. (Note: despite being a weak acid, HF is extremely toxic and corrosive for other reasons.)",
      html: '', css: `body{margin:0;padding:0;font-family:sans-serif}`, startCode: '',
      outputHeight: 300,
    },

    // ── Section 4 ───────────────────────────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `### The pH Scale: Measuring Acidity

Pure water is not entirely H₂O molecules. A tiny fraction of water molecules spontaneously transfer a proton to each other:

$$\\text{H}_2\\text{O} + \\text{H}_2\\text{O} \\rightleftharpoons \\text{H}_3\\text{O}^+ + \\text{OH}^-$$

The equilibrium constant for this **autoionisation of water** is:

$$K_w = [\\text{H}_3\\text{O}^+][\\text{OH}^-] = 1.0 \\times 10^{-14} \\text{ at 25°C}$$

In pure water, [H₃O⁺] = [OH⁻] = 1.0 × 10⁻⁷ mol/L. The solution is neutral.

The **pH scale** is a logarithmic measure of [H₃O⁺]:

$$\\text{pH} = -\\log_{10}[\\text{H}_3\\text{O}^+]$$

In pure water: pH = −log(1.0 × 10⁻⁷) = 7.0 (neutral).

Because of Kw, [OH⁻] = Kw/[H₃O⁺], so:

$$\\text{pOH} = -\\log[\\text{OH}^-] \\quad \\text{and} \\quad \\text{pH} + \\text{pOH} = 14$$

**Key pH values to know:**
- pH < 7: acidic (more H₃O⁺ than OH⁻)
- pH = 7: neutral (equal H₃O⁺ and OH⁻)
- pH > 7: basic/alkaline (less H₃O⁺ than OH⁻)

The scale is logarithmic: a change of 1 pH unit represents a 10-fold change in [H₃O⁺]. Stomach acid (pH ≈ 2) is 100,000 times more acidic than blood (pH ≈ 7.4). Black coffee (pH ≈ 5) is 100 times more acidic than pure water (pH = 7).

**Calculating pH:**
- Strong acid 0.01 M HCl: [H₃O⁺] = 0.01 M → pH = −log(0.01) = 2
- Strong base 0.001 M NaOH: [OH⁻] = 0.001 M → pOH = 3 → pH = 14 − 3 = 11
- Weak acid: need Ka and equilibrium calculation (ICE table)`,
    },

    // ── Visual 2 — pH scale interactive ─────────────────────────────────────────
    {
      type: 'js',
      instruction: `### The pH scale: from battery acid to drain cleaner

The interactive shows the pH scale with real substances and their [H⁺] concentrations. Click any substance to see its pH, concentration, and context. Notice the logarithmic nature — each step is 10×.`,
      html: `<canvas id="cv" width="700" height="320" style="cursor:pointer"></canvas>`,
      css: `body{margin:0;background:#0a0f1e;display:flex;justify-content:center}
canvas{display:block;width:100%;max-width:700px}`,
      startCode: `var canvas=document.getElementById('cv');
var ctx=canvas.getContext('2d');
var W=canvas.width,H=canvas.height;

var substances=[
  {ph:0,  name:'Battery acid',     color:'#ef4444',desc:'H₂SO₄ 1M. Dissolves metals, destroys tissue on contact.'},
  {ph:1,  name:'Stomach acid',     color:'#f97316',desc:'HCl ~0.1M. Denatures proteins, kills bacteria in food.'},
  {ph:2,  name:'Lemon juice',      color:'#eab308',desc:'Citric acid pH ≈ 2. [H⁺] = 0.01 M. Sour taste.'},
  {ph:3,  name:'Vinegar',          color:'#ca8a04',desc:'Acetic acid pH ≈ 2.4–3.4. Weak acid, partial ionisation.'},
  {ph:4,  name:'Tomato juice',     color:'#a16207',desc:'pH ≈ 4. Contains citric and malic acids.'},
  {ph:5,  name:'Black coffee',     color:'#78350f',desc:'pH ≈ 5. 100× more acidic than pure water.'},
  {ph:6,  name:'Urine',            color:'#65a30d',desc:'pH 4.5–8. Kidneys regulate urinary pH to excrete acid/base.'},
  {ph:7,  name:'Pure water',       color:'#16a34a',desc:'pH = 7.00 at 25°C. [H⁺] = [OH⁻] = 10⁻⁷ M. Neutral.'},
  {ph:8,  name:'Seawater',         color:'#0d9488',desc:'pH ≈ 8.1. Ocean acidification (from CO₂) is lowering this.'},
  {ph:8.4,name:'Blood',            color:'#0891b2',desc:'pH 7.35–7.45. Maintained by carbonate buffer. ±0.2 = danger.'},
  {ph:9,  name:'Baking soda',      color:'#2563eb',desc:'NaHCO₃ pH ≈ 8.3. Weak base — used in antacids.'},
  {ph:10, name:'Milk of magnesia', color:'#7c3aed',desc:'Mg(OH)₂ suspension. pH ≈ 10.5. Antacid.'},
  {ph:11, name:'Ammonia solution', color:'#9333ea',desc:'NH₃ pH ≈ 11. Weak base, partial ionisation.'},
  {ph:12, name:'Bleach',           color:'#c026d3',desc:'NaClO pH ≈ 11–12. Destroys organic molecules.'},
  {ph:14, name:'Drain cleaner',    color:'#db2777',desc:'NaOH 1M. pH = 14. [OH⁻] = 1M. Saponifies fats.'},
];

var selected=7; // pure water
var barX=40,barY=20,barH=H-80,barW=40;
var labelX=barX+barW+14;

canvas.onclick=function(e){
  var rect=canvas.getBoundingClientRect();
  var my=(e.clientY-rect.top)*(H/rect.height);
  var sub=Math.round((my-barY)/barH*14);
  sub=Math.max(0,Math.min(14,sub));
  selected=sub;
  // Find nearest substance
  var nearest=0,nearDist=999;
  substances.forEach(function(s,i){if(Math.abs(s.ph-sub)<nearDist){nearDist=Math.abs(s.ph-sub);nearest=i;}});
  selected=nearest;
  render();
};

function phToY(ph){return barY+(ph/14)*barH;}
function phToColor(ph){
  if(ph<3)return'#ef4444';
  if(ph<5)return'#f97316';
  if(ph<7)return'#eab308';
  if(ph===7)return'#4ade80';
  if(ph<10)return'#38bdf8';
  if(ph<12)return'#818cf8';
  return'#c084fc';
}

function render(){
  ctx.clearRect(0,0,W,H);
  ctx.fillStyle='#0a0f1e';ctx.fillRect(0,0,W,H);

  // Draw gradient bar
  var grad=ctx.createLinearGradient(0,barY,0,barY+barH);
  grad.addColorStop(0,'#ef4444');
  grad.addColorStop(0.5,'#4ade80');
  grad.addColorStop(1,'#c084fc');
  ctx.fillStyle=grad;ctx.fillRect(barX,barY,barW,barH);
  ctx.strokeStyle='rgba(255,255,255,0.2)';ctx.lineWidth=1;ctx.strokeRect(barX,barY,barW,barH);

  // pH tick marks
  for(var p=0;p<=14;p++){
    var ty=phToY(p);
    ctx.beginPath();ctx.moveTo(barX-6,ty);ctx.lineTo(barX,ty);
    ctx.strokeStyle='rgba(255,255,255,0.4)';ctx.lineWidth=1;ctx.stroke();
    ctx.fillStyle='rgba(255,255,255,0.5)';ctx.font='10px monospace';ctx.textAlign='right';
    ctx.fillText(p,barX-9,ty+4);
  }

  // Substance dots and labels on bar
  substances.forEach(function(s,i){
    var sy=phToY(s.ph);
    var isSelected=i===selected;
    // Dot on bar
    ctx.beginPath();ctx.arc(barX+barW+6,sy,isSelected?8:5,0,Math.PI*2);
    ctx.fillStyle=isSelected?'#fff':s.color+'cc';ctx.fill();
    // Short line
    ctx.beginPath();ctx.moveTo(barX+barW+11,sy);ctx.lineTo(barX+barW+18,sy);
    ctx.strokeStyle=isSelected?'#fff':'rgba(255,255,255,0.25)';ctx.lineWidth=isSelected?2:1;ctx.stroke();
    // Name
    ctx.fillStyle=isSelected?'#fff':'rgba(255,255,255,0.5)';
    ctx.font=isSelected?'bold 11px monospace':'10px monospace';
    ctx.textAlign='left';
    ctx.fillText(s.name,barX+barW+22,sy+4);
  });

  // Selected substance info panel
  var sel=substances[selected];
  var panelX=300,panelY=30,panelW=W-panelX-20,panelH=160;
  ctx.fillStyle=sel.color+'18';ctx.beginPath();ctx.roundRect(panelX,panelY,panelW,panelH,10);ctx.fill();
  ctx.strokeStyle=sel.color+'66';ctx.lineWidth=1.5;ctx.beginPath();ctx.roundRect(panelX,panelY,panelW,panelH,10);ctx.stroke();

  ctx.fillStyle=sel.color;ctx.font='bold 18px monospace';ctx.textAlign='left';
  ctx.fillText(sel.name,panelX+14,panelY+28);
  ctx.fillStyle='rgba(255,255,255,0.8)';ctx.font='bold 14px monospace';
  ctx.fillText('pH = '+sel.ph,panelX+14,panelY+50);

  var hConc=Math.pow(10,-sel.ph);
  var hStr=hConc>=0.001?hConc.toPrecision(2)+' M':'1.0\u00d710^'+(-sel.ph)+' M';
  ctx.fillStyle='rgba(255,255,255,0.6)';ctx.font='12px monospace';
  ctx.fillText('[H\u2083O\u207a] = '+hStr,panelX+14,panelY+70);
  var ohConc=Math.pow(10,-(14-sel.ph));
  var ohStr=ohConc>=0.001?ohConc.toPrecision(2)+' M':'1.0\u00d710^'+(-(14-sel.ph))+' M';
  ctx.fillText('[OH\u207b] = '+ohStr,panelX+14,panelY+88);

  // Description
  var words=sel.desc.split(' ');
  var lines=[],line='';
  words.forEach(function(w){
    if((line+w).length>45){lines.push(line.trim());line='';}
    line+=w+' ';
  });
  if(line.trim())lines.push(line.trim());
  ctx.fillStyle='rgba(255,255,255,0.55)';ctx.font='11px monospace';
  lines.forEach(function(l,li){ctx.fillText(l,panelX+14,panelY+110+li*16);});

  // [H+] meter
  var meterX=panelX,meterY=panelY+panelH+14,meterW=panelW,meterH=50;
  ctx.fillStyle='rgba(255,255,255,0.05)';ctx.fillRect(meterX,meterY,meterW,meterH);
  ctx.strokeStyle='rgba(255,255,255,0.1)';ctx.lineWidth=1;ctx.strokeRect(meterX,meterY,meterW,meterH);
  ctx.fillStyle='rgba(255,255,255,0.4)';ctx.font='10px monospace';ctx.textAlign='center';
  ctx.fillText('Acidity vs pure water (pH 7)',meterX+meterW/2,meterY+14);
  var ratio=Math.pow(10,7-sel.ph);
  var ratioStr=ratio>=1?ratio.toFixed(0)+'× more acidic':(1/ratio).toFixed(0)+'× more basic';
  ctx.fillStyle=sel.color;ctx.font='bold 14px monospace';
  ctx.fillText(ratioStr,meterX+meterW/2,meterY+36);

  // Axis label
  ctx.fillStyle='rgba(255,255,255,0.3)';ctx.font='10px monospace';ctx.textAlign='center';
  ctx.fillText('pH',barX+barW/2,barY+barH+14);
  ctx.fillStyle='rgba(255,255,255,0.35)';ctx.font='10px monospace';ctx.textAlign='left';
  ctx.fillText('Acidic',barX-36,barY+10);
  ctx.fillText('Neutral',barX-36,barY+barH/2+4);
  ctx.fillText('Basic',barX-36,barY+barH-4);
  ctx.fillStyle='rgba(255,255,255,0.25)';ctx.font='9px monospace';ctx.textAlign='center';
  ctx.fillText('\u2190 click to select',barX+barW/2,H-8);
}
render();`,
      outputHeight: 360,
    },

    // ── Challenge 2 ─────────────────────────────────────────────────────────────
    {
      type: 'challenge',
      instruction: `A solution of 0.050 M HNO₃ (a strong acid) is prepared. What is the pH?`,
      options: [
        { label: 'A', text: 'pH = 1.30' },
        { label: 'B', text: 'pH = 2.00' },
        { label: 'C', text: 'pH = 0.050' },
        { label: 'D', text: 'pH = 4.70' },
      ],
      check: (label) => label === 'A',
      successMessage: "Correct! HNO₃ is a strong acid — it ionises completely. So [H₃O⁺] = 0.050 M exactly. pH = −log(0.050) = −log(5.0 × 10⁻²) = −(log 5.0 + log 10⁻²) = −(0.699 − 2) = −(−1.301) = 1.30.",
      failMessage: "HNO₃ is a strong acid, so [H₃O⁺] = [HNO₃]₀ = 0.050 M. pH = −log[H₃O⁺] = −log(0.050) = −log(5.0 × 10⁻²) = 2 − log(5.0) = 2 − 0.699 = 1.30. Be careful: pH = 2.00 would correspond to [H₃O⁺] = 0.010 M (ten times lower concentration).",
      html: '', css: `body{margin:0;padding:0;font-family:sans-serif}`, startCode: '',
      outputHeight: 300,
    },

    // ── Section 5 ───────────────────────────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `### Buffer Solutions: Resisting pH Change

A buffer is a solution that resists changes in pH when small amounts of acid or base are added. Buffers are essential in biology (blood, cells, tissues all use them), in pharmaceutical formulations, and in chemical analysis.

A buffer consists of a **weak acid and its conjugate base** (or equivalently, a weak base and its conjugate acid) in comparable concentrations.

**How a buffer works:**

Imagine a solution containing acetic acid (CH₃COOH) and sodium acetate (CH₃COO⁻Na⁺):

If you add H⁺ (acid): CH₃COO⁻ + H⁺ → CH₃COOH (the base component absorbs the acid)
If you add OH⁻ (base): CH₃COOH + OH⁻ → CH₃COO⁻ + H₂O (the acid component absorbs the base)

Both components are consumed, but the pH barely changes because the ratio [CH₃COO⁻]/[CH₃COOH] changes only slightly for small additions.

**The Henderson-Hasselbalch equation** gives the pH of a buffer directly:

$$\\text{pH} = \\text{p}K_a + \\log\\left(\\frac{[\\text{A}^-]}{[\\text{HA}]}\\right)$$

At equal concentrations of acid and conjugate base ([A⁻] = [HA]), log(1) = 0, so pH = pKa. A buffer works best when pH ≈ pKa and when [A⁻]/[HA] is between 0.1 and 10 (i.e., pH within ±1 of pKa).

**The carbonate buffer in blood:**
H₂CO₃ ⇌ H⁺ + HCO₃⁻, pKa = 6.1

Blood pH ≈ 7.4, so [HCO₃⁻]/[H₂CO₃] = 10^(7.4 − 6.1) = 10^1.3 ≈ 20. The bicarbonate concentration is 20 times higher than carbonic acid. This ratio is maintained by the lungs (which exhale CO₂, removing H₂CO₃) and by the kidneys (which excrete or retain HCO₃⁻). It is one of the most precisely regulated chemical systems in nature.`,
    },

    // ── Visual 3 — Buffer action simulation ─────────────────────────────────────
    {
      type: 'js',
      instruction: `### Buffer vs. unbuffered: pH response to added acid

The chart shows pH as acid is added to two solutions — a buffer (acetic acid/acetate) and pure water. Drag the slider to add acid. The buffer resists pH change dramatically while pure water's pH drops immediately. The flat region of the buffer curve is the buffering range.`,
      html: `<div style="padding:10px 14px 0;background:#0a0f1e;display:flex;align-items:center;gap:12px">
  <span style="color:rgba(255,255,255,0.5);font-size:12px;font-family:monospace;white-space:nowrap">Acid added: <span id="acid-lbl" style="color:#f87171;font-weight:700;font-size:15px">0 mmol</span></span>
  <input type="range" id="acid-sl" min="0" max="100" value="0" style="flex:1">
  <span style="color:rgba(255,255,255,0.3);font-size:11px;font-family:monospace">0 — 10 mmol HCl</span>
</div>
<canvas id="cv" width="700" height="260"></canvas>`,
      css: `body{margin:0;background:#0a0f1e;font-family:monospace}
canvas{display:block;width:100%;max-width:700px}`,
      startCode: `var canvas=document.getElementById('cv');
var ctx=canvas.getContext('2d');
var W=canvas.width,H=canvas.height;

var acidSl=document.getElementById('acid-sl');
var acidLbl=document.getElementById('acid-lbl');

// Buffer: 50mL of 0.1M acetic acid + 0.1M acetate (pKa = 4.76)
// Volume = 50mL, moles HA = 0.005, moles A- = 0.005
var PKA=4.76;
var HA_INIT=0.005,A_INIT=0.005; // moles
var VOL=0.050; // litres (50 mL)

function bufferPH(addedHClMmol){
  var addedMol=addedHClMmol/1000;
  // H+ reacts with A- first
  var newA=Math.max(0,A_INIT-addedMol);
  var newHA=HA_INIT+Math.min(addedMol,A_INIT);
  var excess=Math.max(0,addedMol-A_INIT);
  if(newHA<=0)return 0;
  if(excess>0){
    // Buffer exhausted
    var hConc=excess/VOL;
    return -Math.log10(hConc);
  }
  return PKA+Math.log10(newA/newHA);
}

function waterPH(addedHClMmol){
  if(addedHClMmol===0)return 7.0;
  var hConc=(addedHClMmol/1000)/VOL;
  return -Math.log10(hConc);
}

function phToColor(ph){
  if(ph<4)return'#ef4444';
  if(ph<6)return'#f97316';
  if(ph<7)return'#eab308';
  if(ph<8)return'#4ade80';
  return'#38bdf8';
}

function render(){
  ctx.clearRect(0,0,W,H);
  ctx.fillStyle='#0a0f1e';ctx.fillRect(0,0,W,H);

  var addedMmol=parseFloat(acidSl.value)/10; // 0-10 mmol
  acidLbl.textContent=addedMmol.toFixed(1)+' mmol';

  var chartX=55,chartY=16,chartW=W-90,chartH=H-48;
  var minPH=0,maxPH=8;

  function toScreen(mmol,ph){
    return{x:chartX+(mmol/10)*chartW,y:chartY+chartH-(ph-minPH)/(maxPH-minPH)*chartH};
  }

  // Axes
  ctx.strokeStyle='rgba(255,255,255,0.15)';ctx.lineWidth=1;
  ctx.beginPath();ctx.moveTo(chartX,chartY);ctx.lineTo(chartX,chartY+chartH);ctx.stroke();
  ctx.beginPath();ctx.moveTo(chartX,chartY+chartH);ctx.lineTo(chartX+chartW,chartY+chartH);ctx.stroke();

  // Grid
  for(var p=0;p<=8;p++){
    var gy=chartY+chartH-(p-minPH)/(maxPH-minPH)*chartH;
    ctx.beginPath();ctx.moveTo(chartX,gy);ctx.lineTo(chartX+chartW,gy);
    ctx.strokeStyle=p===7?'rgba(255,255,255,0.15)':'rgba(255,255,255,0.05)';ctx.stroke();
    ctx.fillStyle='rgba(255,255,255,0.4)';ctx.font='10px monospace';ctx.textAlign='right';
    ctx.fillText(p,chartX-5,gy+4);
  }

  // pKa reference line
  var pkaY=chartY+chartH-(PKA-minPH)/(maxPH-minPH)*chartH;
  ctx.strokeStyle='rgba(250,204,21,0.3)';ctx.lineWidth=1;ctx.setLineDash([4,4]);
  ctx.beginPath();ctx.moveTo(chartX,pkaY);ctx.lineTo(chartX+chartW,pkaY);ctx.stroke();ctx.setLineDash([]);
  ctx.fillStyle='rgba(250,204,21,0.6)';ctx.font='10px monospace';ctx.textAlign='left';
  ctx.fillText('pKa = '+PKA,chartX+4,pkaY-5);

  // Draw buffer curve
  ctx.beginPath();
  for(var i=0;i<=100;i++){
    var mm=i*0.1;
    var ph=bufferPH(mm);
    var pt=toScreen(mm,ph);
    if(i===0)ctx.moveTo(pt.x,pt.y);else ctx.lineTo(pt.x,pt.y);
  }
  ctx.strokeStyle='#4ade80';ctx.lineWidth=2.5;ctx.stroke();

  // Draw water curve
  ctx.beginPath();
  for(var j=0;j<=100;j++){
    var mm2=j*0.1;
    var ph2=Math.max(0,waterPH(mm2));
    var pt2=toScreen(mm2,Math.min(ph2,maxPH));
    if(j===0)ctx.moveTo(pt2.x,pt2.y);else ctx.lineTo(pt2.x,pt2.y);
  }
  ctx.strokeStyle='#f87171';ctx.lineWidth=2;ctx.stroke();

  // Current position dots
  var bph=bufferPH(addedMmol);
  var wph=Math.max(0,waterPH(addedMmol));
  var bpt=toScreen(addedMmol,Math.max(0,Math.min(bph,maxPH)));
  var wpt=toScreen(addedMmol,Math.min(wph,maxPH));

  ctx.beginPath();ctx.arc(bpt.x,bpt.y,7,0,Math.PI*2);
  ctx.fillStyle='#4ade80';ctx.shadowColor='#4ade80';ctx.shadowBlur=10;ctx.fill();ctx.shadowBlur=0;
  ctx.beginPath();ctx.arc(wpt.x,wpt.y,7,0,Math.PI*2);
  ctx.fillStyle='#f87171';ctx.shadowColor='#f87171';ctx.shadowBlur=10;ctx.fill();ctx.shadowBlur=0;

  // pH labels
  ctx.fillStyle='#4ade80';ctx.font='bold 11px monospace';ctx.textAlign='left';
  ctx.fillText('Buffer pH = '+bph.toFixed(2),bpt.x+12,bpt.y);
  ctx.fillStyle='#f87171';
  ctx.fillText('Water pH = '+wph.toFixed(2),wpt.x+12,wpt.y+14);

  // Legend
  ctx.fillStyle='#4ade80';ctx.font='bold 11px monospace';ctx.textAlign='left';
  ctx.fillText('Buffer (0.1M acetic acid + 0.1M acetate)',chartX+10,chartY+16);
  ctx.fillStyle='#f87171';
  ctx.fillText('Pure water',chartX+10,chartY+32);

  // Buffering range annotation
  ctx.strokeStyle='rgba(74,222,128,0.25)';ctx.lineWidth=1;ctx.setLineDash([3,3]);
  var bufRangeY1=chartY+chartH-(5.76-minPH)/(maxPH-minPH)*chartH;
  var bufRangeY2=chartY+chartH-(3.76-minPH)/(maxPH-minPH)*chartH;
  ctx.fillStyle='rgba(74,222,128,0.06)';ctx.fillRect(chartX,bufRangeY1,chartW,bufRangeY2-bufRangeY1);
  ctx.setLineDash([]);

  // Axes labels
  ctx.fillStyle='rgba(255,255,255,0.4)';ctx.font='11px monospace';ctx.textAlign='center';
  ctx.fillText('HCl added (mmol)',chartX+chartW/2,chartY+chartH+16);
  ctx.save();ctx.translate(16,chartY+chartH/2);ctx.rotate(-Math.PI/2);ctx.fillText('pH',0,0);ctx.restore();

  for(var xi=0;xi<=10;xi++){
    var xx=chartX+(xi/10)*chartW;
    ctx.fillStyle='rgba(255,255,255,0.35)';ctx.font='10px monospace';ctx.textAlign='center';
    ctx.fillText(xi,xx,chartY+chartH+16);
  }
}

acidSl.oninput=render;
render();`,
      outputHeight: 320,
    },

    // ── Challenge 3 ─────────────────────────────────────────────────────────────
    {
      type: 'challenge',
      instruction: `A buffer is prepared from 0.20 M formic acid (HCOOH, pKa = 3.75) and 0.20 M sodium formate (HCOONa). What is the pH of this buffer, and why is it effective at resisting pH changes?`,
      options: [
        { label: 'A', text: 'pH = 7.00, because it is a neutral buffer' },
        { label: 'B', text: 'pH = 3.75, because [HA] = [A⁻] and log(1) = 0 in the Henderson-Hasselbalch equation; it resists pH change because both the acid component (HCOOH) and base component (HCOO⁻) are present to neutralise added base or acid' },
        { label: 'C', text: 'pH = 1.88, because the pH is half the pKa for equal concentrations' },
        { label: 'D', text: 'pH = 3.75, but it is not effective because weak acids make poor buffers' },
      ],
      check: (label) => label === 'B',
      successMessage: "Correct! Henderson-Hasselbalch: pH = pKa + log([A⁻]/[HA]) = 3.75 + log(0.20/0.20) = 3.75 + log(1) = 3.75 + 0 = 3.75. This buffer is most effective near pH 3.75 because equal concentrations of acid and conjugate base means both can absorb added acid (HCOO⁻ + H⁺ → HCOOH) or base (HCOOH + OH⁻ → HCOO⁻ + H₂O) without large pH changes.",
      failMessage: "Use the Henderson-Hasselbalch equation: pH = pKa + log([A⁻]/[HA]) = 3.75 + log(0.20/0.20) = 3.75 + log(1.0) = 3.75 + 0 = 3.75. Equal concentrations of acid and conjugate base → pH = pKa exactly. The buffer works because HCOO⁻ can absorb added H⁺ (shifts equilibrium right) and HCOOH can absorb added OH⁻ (shifts equilibrium left). Both reserves are equal and substantial.",
      html: '', css: `body{margin:0;padding:0;font-family:sans-serif}`, startCode: '',
      outputHeight: 300,
    },

    // ── Section 6 ───────────────────────────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `### Acid-Base Chemistry in Biology and Medicine

Acid-base equilibria are so central to biology that every major physiological system has acid-base management built in.

**Respiration and pH.** Every cell produces CO₂ as a metabolic byproduct. CO₂ dissolves in blood to form carbonic acid: CO₂ + H₂O ⇌ H₂CO₃ ⇌ H⁺ + HCO₃⁻. If CO₂ accumulates, [H⁺] rises and blood pH falls — a condition called **respiratory acidosis**. Conversely, hyperventilation (breathing too fast) removes CO₂ too quickly, raising blood pH — **respiratory alkalosis**. The brainstem monitors blood CO₂ and adjusts breathing rate accordingly, using this equilibrium as a feedback sensor.

**Enzyme activity.** Virtually every enzyme has an optimal pH range — usually within 0.5–1 unit of physiological pH. The active site contains ionisable amino acid residues (histidine, aspartate, glutamate, lysine, cysteine) whose charge state depends on pH. At wrong pH, these residues are in the wrong ionisation state and the enzyme loses catalytic activity. Pepsin in the stomach is active at pH 1.5–2; salivary amylase works optimally at pH 6.7–7.0; trypsin in the small intestine requires pH 7.5–8.5.

**Drug absorption.** Most drugs are either weak acids or weak bases. The Henderson-Hasselbalch equation determines what fraction is in the neutral, lipid-soluble form vs. the ionised, water-soluble form. Only the neutral form crosses cell membranes. Aspirin (pKa ≈ 3.5) is mostly neutral in stomach acid (pH 1–2) and thus absorbed there. Basic drugs like morphine (pKa ≈ 8) are mostly ionised in the stomach and absorbed in the alkaline small intestine. Pharmaceutical chemists carefully tune pKa values to optimise drug absorption profiles.

**Acid-base titration.** Adding a strong base to a weak acid solution traces a characteristic S-curve on a pH vs. volume plot. The inflection point is the equivalence point — where moles of base = moles of acid. The pH at the half-equivalence point equals pKa. This technique lets you determine the concentration and identity of unknown acids and bases — it's used in food chemistry, water quality monitoring, and pharmaceutical quality control.`,
    },

    // ── Visual 4 — Titration curve ───────────────────────────────────────────────
    {
      type: 'js',
      instruction: `### Acid-base titration curve: weak acid with strong base

The chart shows the pH profile as 0.1 M NaOH is added to 25 mL of 0.1 M acetic acid. Identify the key points: the initial pH, the buffering region, the half-equivalence point (where pH = pKa), and the steep equivalence point jump. Hover over the curve to read values.`,
      html: `<canvas id="cv" width="700" height="300" style="cursor:crosshair"></canvas>`,
      css: `body{margin:0;background:#0a0f1e;display:flex;justify-content:center}
canvas{display:block;width:100%;max-width:700px}`,
      startCode: `var canvas=document.getElementById('cv');
var ctx=canvas.getContext('2d');
var W=canvas.width,H=canvas.height;

var mouseX=-1,mouseY=-1;

canvas.onmousemove=function(e){
  var rect=canvas.getBoundingClientRect();
  mouseX=(e.clientX-rect.left)*(W/rect.width);
  mouseY=(e.clientY-rect.top)*(H/rect.height);
  render();
};
canvas.onmouseleave=function(){mouseX=-1;render();};

var PKA=4.76;
var CA=0.1,VA=25; // 0.1M acetic acid, 25mL
var CB=0.1; // 0.1M NaOH

// Calculate pH at each point using ICE
function getPH(volNaOH){
  var molesA=CA*VA/1000;
  var molesB=CB*volNaOH/1000;
  var excess=molesB-molesA;
  var totalVol=(VA+volNaOH)/1000;

  if(volNaOH===0){
    // Pure weak acid: [H+] = sqrt(Ka*Ca)
    var Ka=Math.pow(10,-PKA);
    var h=Math.sqrt(Ka*CA);
    return -Math.log10(h);
  }
  if(excess<0){
    // Buffer region: HA and A-
    var molesHA=molesA-molesB;
    var molesAm=molesB;
    return PKA+Math.log10(molesAm/molesHA);
  }
  if(Math.abs(excess)<0.00001){
    // Equivalence point: salt of weak acid
    var Kb=1e-14/Math.pow(10,-PKA);
    var concSalt=molesA/totalVol;
    var oh=Math.sqrt(Kb*concSalt);
    return 14+Math.log10(oh);
  }
  // Past equivalence: excess NaOH
  var ohConc=excess/totalVol;
  return 14+Math.log10(ohConc);
}

var chartX=55,chartY=16,chartW=W-90,chartH=H-50;
var maxVol=50,minPH=0,maxPH=14;

function toScreen(vol,ph){
  return{x:chartX+(vol/maxVol)*chartW,y:chartY+chartH*(1-(ph-minPH)/(maxPH-minPH))};
}

function fromScreen(sx){
  return(sx-chartX)/chartW*maxVol;
}

function render(){
  ctx.clearRect(0,0,W,H);
  ctx.fillStyle='#0a0f1e';ctx.fillRect(0,0,W,H);

  // Axes
  ctx.strokeStyle='rgba(255,255,255,0.15)';ctx.lineWidth=1;
  ctx.beginPath();ctx.moveTo(chartX,chartY);ctx.lineTo(chartX,chartY+chartH);ctx.stroke();
  ctx.beginPath();ctx.moveTo(chartX,chartY+chartH);ctx.lineTo(chartX+chartW,chartY+chartH);ctx.stroke();

  // Grid and labels
  for(var p=0;p<=14;p+=2){
    var gy=chartY+chartH*(1-p/14);
    ctx.beginPath();ctx.moveTo(chartX,gy);ctx.lineTo(chartX+chartW,gy);
    ctx.strokeStyle=p===7?'rgba(255,255,255,0.15)':'rgba(255,255,255,0.05)';ctx.stroke();
    ctx.fillStyle='rgba(255,255,255,0.4)';ctx.font='10px monospace';ctx.textAlign='right';
    ctx.fillText(p,chartX-5,gy+4);
  }
  for(var v=0;v<=50;v+=10){
    var gx=chartX+(v/maxVol)*chartW;
    ctx.beginPath();ctx.moveTo(gx,chartY+chartH);ctx.lineTo(gx,chartY+chartH+4);
    ctx.strokeStyle='rgba(255,255,255,0.2)';ctx.stroke();
    ctx.fillStyle='rgba(255,255,255,0.4)';ctx.font='10px monospace';ctx.textAlign='center';
    ctx.fillText(v,gx,chartY+chartH+14);
  }

  // Draw curve
  ctx.beginPath();
  for(var i=0;i<=200;i++){
    var vol=i*(maxVol/200);
    var ph=Math.max(0,Math.min(14,getPH(vol)));
    var pt=toScreen(vol,ph);
    if(i===0)ctx.moveTo(pt.x,pt.y);else ctx.lineTo(pt.x,pt.y);
  }
  ctx.strokeStyle='#38bdf8';ctx.lineWidth=2.5;ctx.stroke();

  // Key point annotations
  var halfEqPt=toScreen(12.5,PKA);
  var eqPt=toScreen(25,getPH(25));
  var initPt=toScreen(0,getPH(0));

  // Equivalence point
  ctx.beginPath();ctx.arc(eqPt.x,eqPt.y,6,0,Math.PI*2);
  ctx.fillStyle='#facc15';ctx.fill();
  ctx.fillStyle='#facc15';ctx.font='bold 10px monospace';ctx.textAlign='left';
  ctx.fillText('Equivalence point',eqPt.x+10,eqPt.y);
  ctx.fillText('pH = '+getPH(25).toFixed(1)+' (pH > 7, salt of weak acid)',eqPt.x+10,eqPt.y+13);

  // Half-equivalence point
  ctx.beginPath();ctx.arc(halfEqPt.x,halfEqPt.y,6,0,Math.PI*2);
  ctx.fillStyle='#4ade80';ctx.fill();
  ctx.fillStyle='#4ade80';ctx.font='bold 10px monospace';ctx.textAlign='left';
  ctx.fillText('\u00bd eq. point: pH = pKa = '+PKA,halfEqPt.x+10,halfEqPt.y+4);

  // Initial pH
  ctx.beginPath();ctx.arc(initPt.x,initPt.y,5,0,Math.PI*2);
  ctx.fillStyle='#a78bfa';ctx.fill();
  ctx.fillStyle='#a78bfa';ctx.font='10px monospace';ctx.textAlign='left';
  ctx.fillText('Start: pH = '+getPH(0).toFixed(2),initPt.x+8,initPt.y+4);

  // pKa line
  var pkaY=chartY+chartH*(1-PKA/14);
  ctx.strokeStyle='rgba(74,222,128,0.3)';ctx.lineWidth=1;ctx.setLineDash([3,3]);
  ctx.beginPath();ctx.moveTo(chartX,pkaY);ctx.lineTo(chartX+chartW,pkaY);ctx.stroke();ctx.setLineDash([]);

  // Buffering region bracket
  var buf1=toScreen(5,getPH(5));
  var buf2=toScreen(20,getPH(20));
  ctx.strokeStyle='rgba(56,189,248,0.3)';ctx.lineWidth=1;
  ctx.beginPath();ctx.moveTo(buf1.x,buf1.y-8);ctx.lineTo(buf2.x,buf2.y-8);ctx.stroke();
  ctx.fillStyle='rgba(56,189,248,0.5)';ctx.font='9px monospace';ctx.textAlign='center';
  ctx.fillText('Buffering region',( buf1.x+buf2.x)/2,(buf1.y+buf2.y)/2-18);

  // Mouse hover
  if(mouseX>chartX&&mouseX<chartX+chartW){
    var hoverVol=fromScreen(mouseX);
    var hoverPH=Math.max(0,Math.min(14,getPH(hoverVol)));
    var hoverPt=toScreen(hoverVol,hoverPH);

    ctx.strokeStyle='rgba(255,255,255,0.15)';ctx.lineWidth=1;ctx.setLineDash([3,3]);
    ctx.beginPath();ctx.moveTo(mouseX,chartY);ctx.lineTo(mouseX,chartY+chartH);ctx.stroke();
    ctx.beginPath();ctx.moveTo(chartX,hoverPt.y);ctx.lineTo(chartX+chartW,hoverPt.y);ctx.stroke();
    ctx.setLineDash([]);

    ctx.beginPath();ctx.arc(hoverPt.x,hoverPt.y,5,0,Math.PI*2);
    ctx.fillStyle='#fff';ctx.fill();

    ctx.fillStyle='rgba(0,0,0,0.75)';ctx.beginPath();ctx.roundRect(mouseX+10,hoverPt.y-30,155,40,5);ctx.fill();
    ctx.strokeStyle='rgba(255,255,255,0.2)';ctx.lineWidth=1;ctx.beginPath();ctx.roundRect(mouseX+10,hoverPt.y-30,155,40,5);ctx.stroke();
    ctx.fillStyle='#fff';ctx.font='bold 11px monospace';ctx.textAlign='left';
    ctx.fillText('Vol NaOH: '+hoverVol.toFixed(1)+' mL',mouseX+16,hoverPt.y-14);
    ctx.fillText('pH = '+hoverPH.toFixed(2),mouseX+16,hoverPt.y+2);
  }

  // Axis labels
  ctx.fillStyle='rgba(255,255,255,0.4)';ctx.font='11px monospace';ctx.textAlign='center';
  ctx.fillText('Volume of 0.1M NaOH added (mL)',chartX+chartW/2,chartY+chartH+30);
  ctx.save();ctx.translate(14,chartY+chartH/2);ctx.rotate(-Math.PI/2);ctx.fillText('pH',0,0);ctx.restore();
  ctx.fillStyle='rgba(255,255,255,0.6)';ctx.font='bold 11px monospace';ctx.textAlign='center';
  ctx.fillText('Titration: 25 mL of 0.1M CH\u2083COOH + 0.1M NaOH',chartX+chartW/2,chartY-2);
}
render();`,
      outputHeight: 340,
    },

    // ── Challenge 4 ─────────────────────────────────────────────────────────────
    {
      type: 'challenge',
      instruction: `During intense exercise, muscles produce lactic acid, temporarily lowering blood pH. The blood carbonate buffer (H₂CO₃/HCO₃⁻) responds, and the lungs increase breathing rate. Which sequence correctly describes the chemical events?`,
      options: [
        { label: 'A', text: 'Lactic acid adds H⁺ → HCO₃⁻ absorbs H⁺ → forms H₂CO₃ → H₂CO₃ decomposes to CO₂ + H₂O → increased CO₂ stimulates faster breathing → CO₂ is exhaled → equilibrium shifts left, consuming H⁺ and restoring pH' },
        { label: 'B', text: 'Lactic acid adds H⁺ → lungs absorb the H⁺ directly → pH restores' },
        { label: 'C', text: 'Lactic acid reacts with O₂ to form CO₂, which raises pH' },
        { label: 'D', text: 'The kidneys immediately neutralise all lactic acid by producing NaOH' },
      ],
      check: (label) => label === 'A',
      successMessage: "Correct! This is Le Chatelier's principle + buffer chemistry in action. The added H⁺ (from lactic acid) shifts the HCO₃⁻ + H⁺ ⇌ H₂CO₃ equilibrium right, consuming H⁺ and forming H₂CO₃. H₂CO₃ rapidly decomposes to CO₂ (carbonic anhydrase enzyme). Rising blood CO₂ is detected by the brainstem, triggering deeper, faster breathing. Exhaled CO₂ removes product, pulling the equilibrium further left — ultimately consuming the added H⁺. pH is restored, usually within seconds to minutes.",
      failMessage: "The lungs don't absorb H⁺ directly, and the kidneys are too slow for exercise (they respond over hours to days). The correct sequence is chemical: added H⁺ is absorbed by HCO₃⁻ (buffer action), forming H₂CO₃, which becomes CO₂. Blood CO₂ rises, stimulating the brainstem to increase breathing rate. Exhaled CO₂ removes the product of the buffer reaction, pulling equilibrium further left and restoring blood pH.",
      html: '', css: `body{margin:0;padding:0;font-family:sans-serif}`, startCode: '',
      outputHeight: 300,
    },

    // ── Closing ──────────────────────────────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `### Acids, Bases, and the Chemistry That Runs Life

We began this course with a burning match and asked: what is chemistry? The answer, across fourteen lessons, has been: chemistry is atoms rearranging their bonds, driven by the tendency toward greater stability.

Acid-base chemistry is that story told through proton transfer. A proton moves from a weaker bond to a stronger one. The equilibrium position — encoded in Ka — tells you how far the transfer goes. The pH tells you the result. The buffer tells you how resistant the system is to being pushed away from that result.

Every concept in this course has prepared you for this moment:
- **Atomic structure** explained why some atoms hold protons tightly (high electronegativity → low pKa)
- **Bonding** explained what makes an O-H bond donate a proton
- **Molecular geometry** explained why water is polar and acts as both acid and base
- **Equilibrium** gave us K, Q, and Le Chatelier — the framework for Ka, Kb, and buffers
- **Intermolecular forces** explained why solvation affects acid strength
- **Thermodynamics** explained why reactions go in one direction

Acid-base chemistry brings it all together. Blood pH 7.4 is maintained by the carbonate buffer — a Le Chatelier equilibrium driven by respiration. Drug absorption is a Henderson-Hasselbalch calculation. Enzyme catalysis depends on precise ionisation states of active-site residues. Ocean acidification (rising CO₂ dissolving in seawater) is shifting a global acid-base equilibrium, with consequences for calcifying organisms from coral to shellfish.

Chemistry is not a collection of facts. It is a set of tools — a few deep principles — for understanding why matter behaves the way it does. You now have those tools.`,
    },

  ],
};

export default {
  id: 'chem-4-4-acids-and-bases',
  slug: 'acids-and-bases',
  chapter: 'chem.4',
  order: 4,
  title: 'Acids and Bases',
  subtitle: 'Proton transfer, pH, and the chemistry that runs through all of biology.',
  tags: ['chemistry', 'acids', 'bases', 'pH', 'Ka', 'buffer', 'Henderson-Hasselbalch', 'Bronsted-Lowry', 'titration', 'carbonate-buffer'],
  hook: {
    question: 'Why does blood pH stay at exactly 7.4 even as your muscles produce acid during exercise — and what happens when the system fails?',
    realWorldContext: 'Acid-base chemistry governs blood pH, enzyme activity, drug absorption, ocean acidification, and the sour taste of vinegar. The same equilibrium framework — K, Q, Le Chatelier — applies to all of it, now focused on proton transfer.',
    previewVisualizationId: 'ScienceNotebook',
  },
  intuition: {
    prose: [
      'Brønsted-Lowry: acid = proton donor, base = proton acceptor. Every acid-base reaction produces a conjugate pair.',
      'Strong acids/bases: completely ionise. Weak acids/bases: partial equilibrium, characterised by Ka or Kb.',
      'pH = −log[H₃O⁺]. Kw = [H₃O⁺][OH⁻] = 10⁻¹⁴. pH + pOH = 14.',
      'Buffer = weak acid + conjugate base. Resists pH change. pH = pKa + log([A⁻]/[HA]) (Henderson-Hasselbalch).',
      'Biological examples: blood carbonate buffer, enzyme pH optima, drug absorption, respiratory pH control.',
    ],
    callouts: [
      { type: 'important', title: 'The pH of blood', body: 'Blood pH 7.35–7.45 is maintained by the carbonate buffer (H₂CO₃/HCO₃⁻), coordinated with breathing rate. A drop to pH 7.2 is severe acidosis; a rise to 7.6 is severe alkalosis. Both are life-threatening.' },
    ],
    visualizations: [{ id: 'ScienceNotebook', title: 'Acids and Bases', props: { lesson: LESSON_CHEM_4_4 } }],
  },
  math: { prose: [], callouts: [], visualizations: [] },
  rigor: { prose: [], callouts: [], visualizations: [] },
  examples: [],
  challenges: [],
  mentalModel: [
    'Arrhenius: acid → H⁺, base → OH⁻ (water only). Brønsted-Lowry: acid = H⁺ donor, base = H⁺ acceptor (any solvent). Lewis: acid = e⁻ pair acceptor.',
    'Strong acid/base: 100% ionised. Weak acid: Ka = [H₃O⁺][A⁻]/[HA]; smaller Ka = weaker acid; pKa = −log Ka.',
    'Kw = [H₃O⁺][OH⁻] = 10⁻¹⁴ at 25°C. pH = −log[H₃O⁺]. pH + pOH = 14.',
    'Buffer: weak acid + conjugate base. pH = pKa + log([A⁻]/[HA]). Effective within ±1 pH unit of pKa.',
    'Titration curve: S-shaped. Half-equivalence point: pH = pKa. Equivalence point: pH > 7 for weak acid + strong base.',
    'Blood buffer: CO₂ + H₂O ⇌ H₂CO₃ ⇌ H⁺ + HCO₃⁻. Lungs regulate [CO₂]; kidneys regulate [HCO₃⁻].',
  ],
  checkpoints: ['read-intuition'],
  quiz: [],
};

export { LESSON_CHEM_4_4 };
