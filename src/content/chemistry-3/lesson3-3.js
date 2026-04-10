// Chemistry · Chapter 3 · Lesson 3
// Concentration and Molarity

const LESSON_CHEM_3_3 = {
  title: 'Concentration and Molarity',
  subtitle: 'How chemists measure "how much is dissolved" — and why the mole is the key unit.',
  sequential: true,

  cells: [

    // ── Section 1 ───────────────────────────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `### Why "A Pinch of Salt" Isn't Good Enough

A recipe might call for a pinch of salt. A doctor prescribing medication needs to know exactly how many milligrams per kilogram of body weight. A chemist running a reaction needs to know precisely how many molecules of each reactant are present.

Vague descriptions of "how much is dissolved" are fine in the kitchen but useless in science. Chemistry requires precise, quantitative measures of concentration — measures that allow you to calculate exactly how many particles of one substance will interact with particles of another.

The challenge is that molecules are absurdly small. You can't count them directly. A teaspoon of salt contains roughly 10²² ions — a number so large it has no intuitive meaning. Chemistry solves this with a unit called the **mole**: one mole is exactly 6.022 × 10²³ particles (Avogadro's number). It's the chemist's "dozen" — a convenient counting unit scaled to the size of atoms.

**Concentration** tells you how many moles of solute are dissolved per litre of solution. The standard unit is the **molar concentration** (symbol M or mol/L), defined as:

$\\text{Molarity (M)} = \\frac{\\text{moles of solute}}{\\text{litres of solution}}$

A 1 M (one molar) solution of NaCl contains 1 mole of NaCl — that's 6.022 × 10²³ formula units — dissolved in enough water to make exactly 1 litre of solution.

This single number, molarity, is the currency of quantitative chemistry. Every calculation involving solutions — how much product a reaction produces, what pH a solution has, how a drug distributes through the body — starts here.`,
    },

    // ── Section 2 ───────────────────────────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `### The Mole: Chemistry's Counting Unit

Before going further with molarity, it's worth understanding why the mole exists and what it actually means.

Atoms and molecules have masses, but those masses are fantastically small. One hydrogen atom has a mass of 1.674 × 10⁻²⁴ grams. One carbon atom: 1.994 × 10⁻²³ grams. These numbers are impractical to work with directly.

Chemists solved this by defining a unit — the mole — such that the numerical value of an element's atomic mass in atomic mass units (u) equals the mass in grams of one mole of that element. This is called the **molar mass**.

- Carbon has atomic mass 12.011 u → molar mass = 12.011 g/mol → 1 mole of carbon = 12.011 g
- Hydrogen has atomic mass 1.008 u → molar mass = 1.008 g/mol
- Water (H₂O): 2(1.008) + 15.999 = 18.015 g/mol → 1 mole of water = 18.015 g
- NaCl: 22.990 + 35.453 = 58.443 g/mol → 1 mole of NaCl = 58.443 g

This means you can convert between grams (what you can weigh on a balance) and moles (what you need for stoichiometry) using a single number from the periodic table.

**The critical relationship:**

$\\text{moles} = \\frac{\\text{mass (g)}}{\\text{molar mass (g/mol)}}$

If you weigh out 58.443 g of NaCl, you have exactly 1 mole — 6.022 × 10²³ formula units. If you weigh out 29.22 g, you have 0.5 moles. This bridge between the macroscopic world you can measure and the molecular world that does the chemistry is what makes quantitative chemistry possible.`,
    },

    // ── Visual 1 — Mole concept interactive ────────────────────────────────────
    {
      type: 'js',
      instruction: `### From grams to moles to molecules

Use the slider to set a mass of a chosen compound. The display converts it to moles and then to individual molecules, showing how the mole bridges the weighable and the countable. Select different compounds to see how molar mass changes the conversion.`,
      html: `<div style="padding:14px 14px 0;background:#0a0f1e">
  <div style="display:flex;gap:8px;margin-bottom:10px;flex-wrap:wrap" id="compound-btns"></div>
  <div style="display:flex;align-items:center;gap:12px;margin-bottom:8px">
    <span style="color:rgba(255,255,255,0.6);font-size:13px;font-family:monospace;white-space:nowrap">Mass: <span id="mass-label" style="color:#38bdf8;font-weight:700;font-size:16px">58.4</span> g</span>
    <input type="range" id="mass-slider" min="1" max="500" value="58" step="1" style="flex:1">
  </div>
</div>
<canvas id="cv" width="700" height="220"></canvas>`,
      css: `body{margin:0;background:#0a0f1e;font-family:monospace}
canvas{display:block;width:100%;max-width:700px}`,
      startCode: `var canvas=document.getElementById('cv');
var ctx=canvas.getContext('2d');
var W=canvas.width,H=canvas.height;

var compounds=[
  {name:'NaCl', formula:'NaCl',  molarMass:58.44, color:'#f97316'},
  {name:'H₂O',  formula:'H₂O',  molarMass:18.02, color:'#38bdf8'},
  {name:'Glucose',formula:'C₆H₁₂O₆',molarMass:180.16,color:'#4ade80'},
  {name:'CO₂',  formula:'CO₂',  molarMass:44.01, color:'#94a3b8'},
  {name:'NaOH', formula:'NaOH', molarMass:40.00, color:'#a78bfa'},
];

var selectedCompound=0;
var slider=document.getElementById('mass-slider');
var massLabel=document.getElementById('mass-label');

// Build compound buttons
var btnContainer=document.getElementById('compound-btns');
var compBtns=[];
compounds.forEach(function(c,i){
  var btn=document.createElement('button');
  btn.textContent=c.name;
  btn.style.cssText='padding:5px 12px;border-radius:7px;border:1.5px solid;font-family:monospace;font-size:12px;font-weight:600;cursor:pointer;transition:all .15s;';
  btn.style.borderColor=i===0?c.color:'rgba(255,255,255,0.2)';
  btn.style.background=i===0?c.color+'22':'transparent';
  btn.style.color=i===0?c.color:'rgba(255,255,255,0.4)';
  btn.onclick=function(){
    selectedCompound=i;
    compBtns.forEach(function(b,j){
      b.style.borderColor=j===selectedCompound?compounds[j].color:'rgba(255,255,255,0.2)';
      b.style.background=j===selectedCompound?compounds[j].color+'22':'transparent';
      b.style.color=j===selectedCompound?compounds[j].color:'rgba(255,255,255,0.4)';
    });
    draw();
  };
  btnContainer.appendChild(btn);
  compBtns.push(btn);
});

function formatSci(n){
  if(n===0)return'0';
  var exp=Math.floor(Math.log10(Math.abs(n)));
  var mantissa=n/Math.pow(10,exp);
  return mantissa.toFixed(2)+' \u00d7 10\u207b\u00b2\u00b3'.replace('\u207b\u00b2\u00b3',
    exp>=0?superscript(exp):('\u207b'+superscript(-exp)));
}
function superscript(n){
  var sup=['\u2070','\u00b9','\u00b2','\u00b3','\u2074','\u2075','\u2076','\u2077','\u2078','\u2079'];
  return String(n).split('').map(function(d){return sup[parseInt(d)];}).join('');
}

slider.oninput=function(){draw();};

function draw(){
  ctx.clearRect(0,0,W,H);
  ctx.fillStyle='#0a0f1e';ctx.fillRect(0,0,W,H);

  var c=compounds[selectedCompound];
  var mass=parseFloat(slider.value);
  massLabel.textContent=mass.toFixed(1);
  var moles=mass/c.molarMass;
  var molecules=moles*6.022e23;

  // Three boxes
  var boxes=[
    {label:'Mass',value:mass.toFixed(2)+' g',sub:mass.toFixed(2)+' grams of '+c.name,color:'#facc15'},
    {label:'Moles',value:moles.toFixed(4)+' mol',sub:'= mass \u00f7 '+c.molarMass+' g/mol',color:c.color},
    {label:'Molecules',value:formatMolecules(molecules),sub:moles.toFixed(3)+' \u00d7 6.022\u00d710\u00b2\u00b3',color:'#a78bfa'},
  ];

  function formatMolecules(n){
    var exp=Math.floor(Math.log10(n));
    var mant=n/Math.pow(10,exp);
    return mant.toFixed(2)+'\u00d710'+toSuperscript(exp);
  }
  function toSuperscript(n){
    var s=String(n);
    var sup={'0':'\u2070','1':'\u00b9','2':'\u00b2','3':'\u00b3','4':'\u2074','5':'\u2075','6':'\u2076','7':'\u2077','8':'\u2078','9':'\u2079','-':'\u207b'};
    return s.split('').map(function(ch){return sup[ch]||ch;}).join('');
  }

  var bw=200,bh=120,gap=(W-bw*3)/4;

  boxes.forEach(function(box,i){
    var bx=gap+i*(bw+gap);
    var by=(H-bh)/2;

    // Box
    ctx.fillStyle=box.color+'18';
    ctx.beginPath();ctx.roundRect(bx,by,bw,bh,10);ctx.fill();
    ctx.strokeStyle=box.color;ctx.lineWidth=1.5;
    ctx.beginPath();ctx.roundRect(bx,by,bw,bh,10);ctx.stroke();

    ctx.fillStyle='rgba(255,255,255,0.45)';ctx.font='11px monospace';ctx.textAlign='center';
    ctx.fillText(box.label,bx+bw/2,by+18);
    ctx.fillStyle=box.color;ctx.font='bold 17px monospace';
    ctx.fillText(box.value,bx+bw/2,by+52);
    ctx.fillStyle='rgba(255,255,255,0.35)';ctx.font='10px monospace';
    ctx.fillText(box.sub,bx+bw/2,by+72);

    // Molar mass label in middle box
    if(i===1){
      ctx.fillStyle=box.color+'aa';ctx.font='bold 11px monospace';
      ctx.fillText('M = '+c.molarMass+' g/mol',bx+bw/2,by+92);
    }
  });

  // Arrows
  [0,1].forEach(function(i){
    var x1=gap+(i+1)*(bw+gap)-gap/2;
    var y=H/2;
    ctx.beginPath();ctx.moveTo(x1-12,y);ctx.lineTo(x1+12,y);
    ctx.strokeStyle='rgba(255,255,255,0.25)';ctx.lineWidth=2;ctx.stroke();
    ctx.beginPath();ctx.moveTo(x1+6,y-5);ctx.lineTo(x1+12,y);ctx.lineTo(x1+6,y+5);
    ctx.strokeStyle='rgba(255,255,255,0.25)';ctx.stroke();
  });

  // Formula
  ctx.fillStyle='rgba(255,255,255,0.3)';ctx.font='11px monospace';ctx.textAlign='center';
  ctx.fillText('n = m / M',gap+bw+gap/2,H-10);
  ctx.fillText('\u00d7 N\u2090',gap*2+bw*2+bw/2,H-10);
}
draw();`,
      outputHeight: 280,
    },

    // ── Section 3 ───────────────────────────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `### Calculating and Using Molarity

Molarity is defined as moles of solute per litre of solution. The formula rearranges in three useful ways:

$M = \\frac{n}{V} \\quad\\quad n = M \\times V \\quad\\quad V = \\frac{n}{M}$

where M is molarity (mol/L), n is moles of solute, and V is volume in litres.

**Worked example 1: Finding molarity.**
You dissolve 11.69 g of NaCl in enough water to make 200 mL (0.200 L) of solution. What is the molarity?

Step 1: Convert grams to moles.
Molar mass of NaCl = 22.99 + 35.45 = 58.44 g/mol
n = 11.69 g ÷ 58.44 g/mol = 0.200 mol

Step 2: Divide by volume in litres.
M = 0.200 mol ÷ 0.200 L = **1.00 M**

**Worked example 2: Finding moles from molarity.**
How many moles of HCl are in 250 mL of 0.50 M HCl?
n = M × V = 0.50 mol/L × 0.250 L = **0.125 mol**

**Worked example 3: Finding mass needed.**
You need to prepare 500 mL of 0.25 M glucose (C₆H₁₂O₆, molar mass 180.16 g/mol). What mass of glucose do you need?
n = M × V = 0.25 × 0.500 = 0.125 mol
mass = n × M = 0.125 mol × 180.16 g/mol = **22.5 g**

Notice that molarity refers to the volume of **solution**, not solvent. When you make a 1 M NaCl solution, you don't add 1 L of water to the salt — you dissolve the salt in some water and then add more water until the total volume reaches 1 L. This distinction matters because the solute itself takes up volume.`,
    },

    // ── Visual 2 — Molarity calculator ─────────────────────────────────────────
    {
      type: 'js',
      instruction: `### Interactive molarity calculator

Adjust mass and volume to calculate molarity, or set molarity and volume to find the required mass. The beaker visualization shows how particle density changes with concentration.`,
      html: `<div style="padding:14px 14px 0;background:#0a0f1e">
  <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:14px;margin-bottom:10px">
    <div>
      <div style="color:rgba(255,255,255,0.5);font-size:11px;font-family:monospace;margin-bottom:4px">MASS OF SOLUTE (g)</div>
      <input type="range" id="sl-mass" min="1" max="200" value="58" style="width:100%">
      <div style="color:#facc15;font-family:monospace;font-size:14px;font-weight:700;text-align:center" id="lbl-mass">58.4 g</div>
    </div>
    <div>
      <div style="color:rgba(255,255,255,0.5);font-size:11px;font-family:monospace;margin-bottom:4px">VOLUME (mL)</div>
      <input type="range" id="sl-vol" min="50" max="1000" value="500" style="width:100%">
      <div style="color:#38bdf8;font-family:monospace;font-size:14px;font-weight:700;text-align:center" id="lbl-vol">500 mL</div>
    </div>
    <div style="display:flex;flex-direction:column;justify-content:center;align-items:center">
      <div style="color:rgba(255,255,255,0.4);font-size:11px;font-family:monospace">MOLARITY</div>
      <div style="color:#4ade80;font-family:monospace;font-size:28px;font-weight:700" id="lbl-mol">1.00 M</div>
      <div style="color:rgba(255,255,255,0.3);font-size:10px;font-family:monospace" id="lbl-moles">= 1.000 mol</div>
    </div>
  </div>
</div>
<canvas id="cv" width="700" height="220"></canvas>`,
      css: `body{margin:0;background:#0a0f1e;font-family:monospace}
canvas{display:block;width:100%;max-width:700px}`,
      startCode: `var canvas=document.getElementById('cv');
var ctx=canvas.getContext('2d');
var W=canvas.width,H=canvas.height;

var MOLAR_MASS=58.44; // NaCl

var slMass=document.getElementById('sl-mass');
var slVol=document.getElementById('sl-vol');
var lblMass=document.getElementById('lbl-mass');
var lblVol=document.getElementById('lbl-vol');
var lblMol=document.getElementById('lbl-mol');
var lblMoles=document.getElementById('lbl-moles');

// Particle system
var particles=[];
var NUM_MAX=80;
for(var i=0;i<NUM_MAX;i++){
  particles.push({x:0,y:0,vx:(Math.random()-0.5)*0.8,vy:(Math.random()-0.5)*0.8,
    isNa:i%2===0,phase:Math.random()*Math.PI*2});
}

var t=0;

function getValues(){
  var mass=parseFloat(slMass.value);
  var volML=parseFloat(slVol.value);
  var moles=mass/MOLAR_MASS;
  var molarity=moles/(volML/1000);
  return{mass:mass,volML:volML,moles:moles,molarity:molarity};
}

function update(){
  var v=getValues();
  lblMass.textContent=v.mass.toFixed(1)+' g';
  lblVol.textContent=v.volML+' mL';
  lblMol.textContent=v.molarity.toFixed(3)+' M';
  lblMol.style.color=v.molarity<0.5?'#94a3b8':v.molarity<1.5?'#4ade80':v.molarity<3?'#fb923c':'#f87171';
  lblMoles.textContent='= '+v.moles.toFixed(3)+' mol NaCl';
}

slMass.oninput=update;slVol.oninput=update;
update();

function draw(){
  ctx.clearRect(0,0,W,H);
  ctx.fillStyle='#0a0f1e';ctx.fillRect(0,0,W,H);

  var v=getValues();
  var molarity=v.molarity;

  // ── Beaker ──
  var bx=W/2-90,by=18,bw=180,bh=H-36;
  // Water fill
  ctx.fillStyle='rgba(14,116,144,0.25)';
  ctx.fillRect(bx+4,by+10,bw-8,bh-14);
  // Beaker outline
  ctx.strokeStyle='rgba(255,255,255,0.3)';ctx.lineWidth=2;
  ctx.beginPath();ctx.moveTo(bx,by);ctx.lineTo(bx,by+bh);ctx.lineTo(bx+bw,by+bh);ctx.lineTo(bx+bw,by);ctx.stroke();

  // Solution color gradient by concentration
  var conc=Math.min(molarity/3,1);
  ctx.fillStyle='rgba(249,115,22,'+(conc*0.35)+')';
  ctx.fillRect(bx+4,by+10,bw-8,bh-14);

  // Active particles (count based on molarity)
  var activeCount=Math.round(Math.min(molarity/4,1)*NUM_MAX);
  activeCount=Math.max(2,Math.min(NUM_MAX,activeCount));

  particles.forEach(function(p,i){
    if(i>=activeCount)return;
    p.x+=p.vx;p.y+=p.vy;
    p.vx+=(Math.random()-0.5)*0.06;p.vy+=(Math.random()-0.5)*0.06;
    p.vx=Math.max(-1.2,Math.min(1.2,p.vx));p.vy=Math.max(-1.2,Math.min(1.2,p.vy));
    if(p.x<bx+10){p.x=bx+10;p.vx=Math.abs(p.vx);}
    if(p.x>bx+bw-10){p.x=bx+bw-10;p.vx=-Math.abs(p.vx);}
    if(p.y<by+14){p.y=by+14;p.vy=Math.abs(p.vy);}
    if(p.y>by+bh-12){p.y=by+bh-12;p.vy=-Math.abs(p.vy);}
    // Init position on first frame
    if(p.x===0){p.x=bx+20+Math.random()*(bw-40);p.y=by+20+Math.random()*(bh-34);}
    var pcolor=p.isNa?'#f97316':'#a78bfa';
    ctx.beginPath();ctx.arc(p.x,p.y,5,0,Math.PI*2);
    ctx.fillStyle='#0f172a';ctx.fill();
    ctx.strokeStyle=pcolor;ctx.lineWidth=1.5;ctx.stroke();
    ctx.fillStyle=pcolor;ctx.font='bold 5px monospace';
    ctx.textAlign='center';ctx.textBaseline='middle';
    ctx.fillText(p.isNa?'Na+':'Cl-',p.x,p.y);
  });

  // Molarity label on beaker
  ctx.fillStyle='rgba(255,255,255,0.6)';ctx.font='bold 13px monospace';ctx.textAlign='center';
  ctx.fillText(v.molarity.toFixed(3)+' M NaCl',bx+bw/2,by+bh+16);

  // Scale markings on beaker
  [0.25,0.5,0.75,1].forEach(function(frac){
    var my=by+bh-frac*(bh-24);
    ctx.strokeStyle='rgba(255,255,255,0.2)';ctx.lineWidth=1;
    ctx.beginPath();ctx.moveTo(bx,my);ctx.lineTo(bx+16,my);ctx.stroke();
    ctx.fillStyle='rgba(255,255,255,0.3)';ctx.font='9px monospace';ctx.textAlign='right';
    ctx.fillText(Math.round(frac*v.volML)+' mL',bx-4,my+4);
  });

  // Left side: formula reminder
  var fx=60;
  ctx.fillStyle='rgba(255,255,255,0.5)';ctx.font='bold 12px monospace';ctx.textAlign='center';
  ctx.fillText('M = n / V',fx,40);
  ctx.fillStyle='rgba(255,255,255,0.3)';ctx.font='11px monospace';
  ctx.fillText('n = '+v.moles.toFixed(3)+' mol',fx,62);
  ctx.fillText('V = '+(v.volML/1000).toFixed(3)+' L',fx,78);
  ctx.fillStyle='#4ade80';ctx.font='bold 14px monospace';
  ctx.fillText('M = '+v.molarity.toFixed(3),fx,100);

  // Right side: concentration scale
  var sx=W-70;
  ctx.fillStyle='rgba(255,255,255,0.4)';ctx.font='10px monospace';ctx.textAlign='center';
  ctx.fillText('concentration',sx,30);
  var scaleH=H-70;
  var scaleY=40;
  var scaleGrad=ctx.createLinearGradient(0,scaleY+scaleH,0,scaleY);
  scaleGrad.addColorStop(0,'rgba(148,163,184,0.4)');
  scaleGrad.addColorStop(0.5,'rgba(74,222,128,0.6)');
  scaleGrad.addColorStop(1,'rgba(248,113,113,0.7)');
  ctx.fillStyle=scaleGrad;
  ctx.fillRect(sx-12,scaleY,24,scaleH);
  // Marker
  var markerY=scaleY+scaleH-Math.min(molarity/4,1)*scaleH;
  ctx.fillStyle='#fff';
  ctx.beginPath();ctx.moveTo(sx-18,markerY);ctx.lineTo(sx-12,markerY-4);ctx.lineTo(sx-12,markerY+4);ctx.fill();
  ctx.fillStyle='rgba(255,255,255,0.5)';ctx.font='9px monospace';ctx.textAlign='right';
  ctx.fillText('0 M',sx-20,scaleY+scaleH+4);
  ctx.fillText('4 M',sx-20,scaleY+4);

  t++;requestAnimationFrame(draw);
}
draw();`,
      outputHeight: 300,
    },

    // ── Challenge 1 ─────────────────────────────────────────────────────────────
    {
      type: 'challenge',
      instruction: `You dissolve 4.00 g of sodium hydroxide (NaOH, molar mass 40.00 g/mol) in enough water to make 500 mL of solution. What is the molarity?`,
      options: [
        { label: 'A', text: '0.100 M' },
        { label: 'B', text: '0.200 M' },
        { label: 'C', text: '0.400 M' },
        { label: 'D', text: '0.800 M' },
      ],
      check: (label) => label === 'B',
      successMessage: "Correct! Step 1: moles = 4.00 g ÷ 40.00 g/mol = 0.100 mol. Step 2: M = 0.100 mol ÷ 0.500 L = 0.200 M. Always convert mL to L before dividing.",
      failMessage: "Two steps: (1) moles = mass ÷ molar mass = 4.00 ÷ 40.00 = 0.100 mol. (2) M = moles ÷ volume in litres = 0.100 mol ÷ 0.500 L = 0.200 M. Watch the mL → L conversion.",
      html: '', css: `body{margin:0;padding:0;font-family:sans-serif}`, startCode: '',
      outputHeight: 300,
    },

    // ── Section 4 ───────────────────────────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `### Dilution: Spreading the Same Moles Over More Volume

One of the most common tasks in a chemistry lab is preparing a dilute solution from a concentrated stock solution. You might have a 12 M hydrochloric acid stock solution (concentrated HCl) and need to prepare 500 mL of 0.10 M HCl for an experiment.

The key insight is simple: **dilution doesn't change the number of moles of solute**. Adding more water spreads the same solute over a larger volume, reducing the concentration — but the moles stay the same.

This gives the **dilution equation**:

$M_1 V_1 = M_2 V_2$

Where M₁ and V₁ are the initial molarity and volume, and M₂ and V₂ are the final molarity and volume. The product M × V always equals moles, and moles are conserved.

**Worked example:**
How much 12 M HCl stock solution do you need to prepare 500 mL of 0.10 M HCl?

$V_1 = \\frac{M_2 V_2}{M_1} = \\frac{0.10 \\text{ M} \\times 0.500 \\text{ L}}{12 \\text{ M}} = 0.00417 \\text{ L} = 4.17 \\text{ mL}$

So you measure out 4.17 mL of concentrated HCl and dilute it to a total volume of 500 mL.

**Safety note:** When diluting concentrated acids, always add acid to water — never water to acid. Adding water to concentrated acid can cause violent, exothermic splashing. The mnemonic: "Do as you oughta — add acid to water."

The dilution equation works for any solute in any solvent. It is used constantly in biochemistry (diluting stock proteins and enzymes), medicine (diluting drug solutions to therapeutic concentrations), and analytical chemistry (preparing calibration standards).`,
    },

    // ── Visual 3 — Dilution animation ──────────────────────────────────────────
    {
      type: 'js',
      instruction: `### Dilution: same moles, larger volume

The animation shows a concentrated solution being diluted. The number of solute particles stays exactly the same — they simply spread out into a larger volume, reducing the particle density (concentration). Adjust the dilution factor to see how M₁V₁ = M₂V₂ holds throughout.`,
      html: `<div style="padding:14px 14px 0;background:#0a0f1e">
  <div style="display:flex;align-items:center;gap:12px">
    <span style="color:rgba(255,255,255,0.6);font-size:13px;font-family:monospace;white-space:nowrap">Dilution factor: <span id="dil-label" style="color:#fb923c;font-weight:700;font-size:16px">2×</span></span>
    <input type="range" id="dil-slider" min="1" max="10" value="2" step="0.5" style="flex:1">
    <span style="color:rgba(255,255,255,0.3);font-size:11px;font-family:monospace">1× — 10×</span>
  </div>
</div>
<canvas id="cv" width="700" height="240"></canvas>`,
      css: `body{margin:0;background:#0a0f1e;font-family:monospace}
canvas{display:block;width:100%;max-width:700px}`,
      startCode: `var canvas=document.getElementById('cv');
var ctx=canvas.getContext('2d');
var W=canvas.width,H=canvas.height;
var t=0;

var dilSlider=document.getElementById('dil-slider');
var dilLabel=document.getElementById('dil-label');

var BASE_MOLARITY=2.0;
var BASE_VOL=200; // mL

// Particles in left (concentrated) beaker - fixed 24
var leftParticles=[];
for(var i=0;i<24;i++){
  leftParticles.push({x:0,y:0,vx:(Math.random()-0.5)*0.7,vy:(Math.random()-0.5)*0.7,isNa:i%2===0});
}

var t2=0;
dilSlider.oninput=function(){
  dilLabel.textContent=parseFloat(dilSlider.value).toFixed(1)+'\u00d7';
};

function drawBeaker(bx,by,bw,bh,molarity,volume,particles,label){
  var conc=Math.min(molarity/4,1);
  ctx.fillStyle='rgba(14,116,144,0.2)';ctx.fillRect(bx+3,by+8,bw-6,bh-12);
  ctx.fillStyle='rgba(249,115,22,'+(conc*0.35)+')';ctx.fillRect(bx+3,by+8,bw-6,bh-12);
  ctx.strokeStyle='rgba(255,255,255,0.25)';ctx.lineWidth=2;
  ctx.beginPath();ctx.moveTo(bx,by);ctx.lineTo(bx,by+bh);ctx.lineTo(bx+bw,by+bh);ctx.lineTo(bx+bw,by);ctx.stroke();

  // Particles
  if(particles){
    particles.forEach(function(p,i){
      if(p.x===0){p.x=bx+12+Math.random()*(bw-24);p.y=by+12+Math.random()*(bh-22);}
      p.x+=p.vx;p.y+=p.vy;
      p.vx+=(Math.random()-0.5)*0.05;p.vy+=(Math.random()-0.5)*0.05;
      p.vx=Math.max(-1,Math.min(1,p.vx));p.vy=Math.max(-1,Math.min(1,p.vy));
      if(p.x<bx+8){p.x=bx+8;p.vx=Math.abs(p.vx);}
      if(p.x>bx+bw-8){p.x=bx+bw-8;p.vx=-Math.abs(p.vx);}
      if(p.y<by+10){p.y=by+10;p.vy=Math.abs(p.vy);}
      if(p.y>by+bh-10){p.y=by+bh-10;p.vy=-Math.abs(p.vy);}
      var pcolor=p.isNa?'#f97316':'#a78bfa';
      ctx.beginPath();ctx.arc(p.x,p.y,5,0,Math.PI*2);
      ctx.fillStyle='#0f172a';ctx.fill();ctx.strokeStyle=pcolor;ctx.lineWidth=1.5;ctx.stroke();
    });
  }

  ctx.fillStyle='rgba(255,255,255,0.7)';ctx.font='bold 12px monospace';ctx.textAlign='center';
  ctx.fillText(label,bx+bw/2,by+bh+16);
  ctx.fillStyle='rgba(255,255,255,0.4)';ctx.font='11px monospace';
  ctx.fillText(molarity.toFixed(3)+' M',bx+bw/2,by+bh+30);
  ctx.fillText(volume.toFixed(0)+' mL',bx+bw/2,by+bh+44);
}

function draw(){
  ctx.clearRect(0,0,W,H);
  ctx.fillStyle='#0a0f1e';ctx.fillRect(0,0,W,H);

  var dilFactor=parseFloat(dilSlider.value);
  var M1=BASE_MOLARITY;
  var V1=BASE_VOL;
  var V2=V1*dilFactor;
  var M2=M1*V1/V2;

  var beakerH=H-60;

  // Left beaker (concentrated)
  var lbw=130,lbh=beakerH,lbx=60,lby=14;
  drawBeaker(lbx,lby,lbw,lbh,M1,V1,leftParticles,'Stock solution');

  // Arrow
  var arrowX=lbx+lbw+30;
  ctx.fillStyle='rgba(255,255,255,0.4)';ctx.font='bold 20px monospace';ctx.textAlign='center';
  ctx.fillText('\u2192',arrowX,H/2-10);
  ctx.fillStyle='rgba(255,255,255,0.3)';ctx.font='10px monospace';
  ctx.fillText('add water',arrowX,H/2+8);
  ctx.fillText('M\u2081V\u2081=M\u2082V\u2082',arrowX,H/2+22);

  // Right beaker (diluted) — same particles spread over larger visual beaker
  var rbScale=Math.min(dilFactor,3)/3;
  var rbw=Math.round(130+rbScale*180);
  var rbh=beakerH;
  var rbx=arrowX+40;
  var rby=14;

  // Build diluted particles (same 24, spread over wider area)
  var dilParticles=leftParticles.map(function(p){
    return{x:p.x+(rbx-lbx),y:p.y,vx:p.vx,vy:p.vy,isNa:p.isNa};
  });
  drawBeaker(rbx,rby,rbw,rbh,M2,V2,null,'Diluted solution');

  // Draw particles spread in right beaker
  leftParticles.forEach(function(p){
    // Map left beaker x to right beaker x
    var fx=(p.x-lbx)/(lbw);
    var rx=rbx+fx*rbw;
    var pcolor=p.isNa?'#f97316':'#a78bfa';
    ctx.beginPath();ctx.arc(rx,p.y,5,0,Math.PI*2);
    ctx.fillStyle='#0f172a';ctx.fill();ctx.strokeStyle=pcolor+'aa';ctx.lineWidth=1.5;ctx.stroke();
  });

  // M1V1 = M2V2 confirmation
  ctx.fillStyle='rgba(255,255,255,0.5)';ctx.font='bold 12px monospace';ctx.textAlign='center';
  ctx.fillText('M\u2081V\u2081 = '+M1.toFixed(2)+' \u00d7 '+V1+' = '+( M1*V1/1000 ).toFixed(3)+' mol',W/2,H-2);

  t++;requestAnimationFrame(draw);
}
draw();`,
      outputHeight: 310,
    },

    // ── Challenge 2 ─────────────────────────────────────────────────────────────
    {
      type: 'challenge',
      instruction: `You need to prepare 250 mL of 0.40 M sulfuric acid (H₂SO₄) from a 9.0 M stock solution. What volume of stock solution do you need?`,
      options: [
        { label: 'A', text: '5.6 mL' },
        { label: 'B', text: '11.1 mL' },
        { label: 'C', text: '22.5 mL' },
        { label: 'D', text: '56.3 mL' },
      ],
      check: (label) => label === 'B',
      successMessage: "Correct! Using M₁V₁ = M₂V₂: V₁ = M₂V₂/M₁ = (0.40 × 0.250) / 9.0 = 0.100/9.0 = 0.0111 L = 11.1 mL. Measure out 11.1 mL of the 9.0 M stock and dilute to a total volume of 250 mL.",
      failMessage: "Use M₁V₁ = M₂V₂. Rearrange for V₁: V₁ = (M₂ × V₂) / M₁ = (0.40 M × 0.250 L) / 9.0 M = 0.0111 L = 11.1 mL. Remember to keep volumes in consistent units (both in litres, or both in mL).",
      html: '', css: `body{margin:0;padding:0;font-family:sans-serif}`, startCode: '',
      outputHeight: 300,
    },

    // ── Section 5 ───────────────────────────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `### Other Concentration Units

Molarity is the most common concentration unit in chemistry, but it's not the only one. Different situations call for different measures.

**Mass percent (% w/w):** mass of solute divided by total mass of solution, multiplied by 100. "3% hydrogen peroxide" means 3 g of H₂O₂ per 100 g of solution. Used in commercial products, geology, and food science. Advantage: doesn't change with temperature (unlike volume-based measures).

$\\text{mass percent} = \\frac{\\text{mass of solute}}{\\text{mass of solution}} \\times 100\\%$

**Parts per million (ppm) and parts per billion (ppb):** for very dilute solutions. 1 ppm = 1 mg of solute per kg of solution (roughly 1 mg/L for dilute aqueous solutions). Used in water quality testing, air pollution monitoring, and trace mineral analysis. Blood lead levels are reported in µg/dL; safe drinking water is <10 µg/L for lead — that's 10 ppb.

**Molality (m):** moles of solute per kilogram of **solvent** (not solution). Written as lowercase m to distinguish from molarity (uppercase M). Used in calculations involving boiling point elevation and freezing point depression because molality doesn't depend on temperature (no volume involved).

$m = \\frac{\\text{moles of solute}}{\\text{kg of solvent}}$

**Mole fraction (χ):** moles of component divided by total moles of all components. Used in gas laws and thermodynamics. The mole fractions of all components in a mixture always sum to exactly 1.

In this course, molarity (M) is the most important. But recognising the other units is essential for reading the scientific literature, understanding safety data sheets, and interpreting water quality reports.`,
    },

    // ── Visual 4 — Concentration units comparison ───────────────────────────────
    {
      type: 'js',
      instruction: `### The same solution, four different concentration units

A 1.00 M NaCl aqueous solution — expressed four ways. Each unit measures "concentration" but emphasises a different ratio. The visual shows how the same physical solution maps to each expression.`,
      html: `<canvas id="cv" width="700" height="300"></canvas>`,
      css: `body{margin:0;background:#0a0f1e;display:flex;justify-content:center}
canvas{display:block;width:100%;max-width:700px}`,
      startCode: `var canvas=document.getElementById('cv');
var ctx=canvas.getContext('2d');
var W=canvas.width,H=canvas.height;

ctx.fillStyle='#0a0f1e';ctx.fillRect(0,0,W,H);

// 1.00 M NaCl in water
// Molar mass NaCl = 58.44 g/mol
// In 1 L solution: 58.44 g NaCl, approx 976 g water (density ~1.035 g/mL)
// Mass solution ~ 1035 g, mass solute = 58.44 g
var massNaCl=58.44;
var massSolution=1035;
var massSolvent=massSolution-massNaCl;
var molesNaCl=1.0;
var molesWater=massSolvent/18.015;
var totalMoles=molesNaCl+molesWater;

var units=[
  {
    name:'Molarity',symbol:'M',
    value:'1.000 M',
    formula:'mol solute / L solution',
    highlight:'mol NaCl\u00f7L solution',
    color:'#38bdf8',
    explanation:'1.000 mol NaCl in enough water to make exactly 1.000 L of solution',
    numerator:'1.000 mol NaCl',
    denominator:'1.000 L solution'
  },
  {
    name:'Mass Percent',symbol:'% w/w',
    value:((massNaCl/massSolution)*100).toFixed(2)+'%',
    formula:'g solute / g solution \u00d7 100',
    color:'#facc15',
    explanation:massNaCl.toFixed(1)+'g NaCl in '+massSolution.toFixed(0)+'g of solution',
    numerator:massNaCl.toFixed(1)+' g NaCl',
    denominator:massSolution.toFixed(0)+' g solution'
  },
  {
    name:'Molality',symbol:'m',
    value:(molesNaCl/(massSolvent/1000)).toFixed(3)+' m',
    formula:'mol solute / kg solvent',
    color:'#4ade80',
    explanation:molesNaCl.toFixed(3)+' mol NaCl per '+( massSolvent/1000 ).toFixed(3)+' kg water',
    numerator:'1.000 mol NaCl',
    denominator:(massSolvent/1000).toFixed(3)+' kg H₂O'
  },
  {
    name:'Mole Fraction',symbol:'\u03c7',
    value:(molesNaCl/totalMoles).toFixed(4),
    formula:'mol solute / total mol',
    color:'#a78bfa',
    explanation:molesNaCl.toFixed(2)+' mol NaCl / '+(totalMoles).toFixed(1)+' total mol',
    numerator:'1.000 mol NaCl',
    denominator:totalMoles.toFixed(2)+' mol total'
  },
];

var colW=W/4;
units.forEach(function(u,i){
  var cx=i*colW+colW/2;
  var topY=24;

  // Column background
  ctx.fillStyle=u.color+'0e';ctx.fillRect(i*colW+2,2,colW-4,H-4);
  ctx.strokeStyle=u.color+'33';ctx.lineWidth=1;ctx.strokeRect(i*colW+2,2,colW-4,H-4);

  // Unit name
  ctx.fillStyle=u.color;ctx.font='bold 13px monospace';ctx.textAlign='center';
  ctx.fillText(u.name,cx,topY+14);
  ctx.fillStyle=u.color+'88';ctx.font='11px monospace';
  ctx.fillText('('+u.symbol+')',cx,topY+28);

  // Value (large)
  ctx.fillStyle='rgba(255,255,255,0.9)';ctx.font='bold 18px monospace';ctx.textAlign='center';
  ctx.fillText(u.value,cx,topY+58);

  // Fraction visual
  var fracY=topY+90;
  var fracW=colW-24;
  // Numerator box
  ctx.fillStyle=u.color+'22';ctx.beginPath();ctx.roundRect(cx-fracW/2,fracY,fracW,32,5);ctx.fill();
  ctx.strokeStyle=u.color+'55';ctx.lineWidth=1;ctx.beginPath();ctx.roundRect(cx-fracW/2,fracY,fracW,32,5);ctx.stroke();
  ctx.fillStyle=u.color+'cc';ctx.font='10px monospace';ctx.textAlign='center';ctx.textBaseline='middle';
  ctx.fillText(u.numerator,cx,fracY+16);

  // Fraction line
  ctx.strokeStyle=u.color+'88';ctx.lineWidth=1.5;
  ctx.beginPath();ctx.moveTo(cx-fracW/2+4,fracY+36);ctx.lineTo(cx+fracW/2-4,fracY+36);ctx.stroke();

  // Denominator box
  ctx.fillStyle='rgba(255,255,255,0.06)';ctx.beginPath();ctx.roundRect(cx-fracW/2,fracY+40,fracW,32,5);ctx.fill();
  ctx.strokeStyle='rgba(255,255,255,0.15)';ctx.lineWidth=1;ctx.beginPath();ctx.roundRect(cx-fracW/2,fracY+40,fracW,32,5);ctx.stroke();
  ctx.fillStyle='rgba(255,255,255,0.5)';ctx.font='10px monospace';ctx.textBaseline='middle';
  ctx.fillText(u.denominator,cx,fracY+56);

  // Formula label
  ctx.fillStyle='rgba(255,255,255,0.3)';ctx.font='9px monospace';ctx.textBaseline='alphabetic';
  ctx.fillText(u.formula,cx,H-28);

  // Explanation
  var words=u.explanation.split(' ');
  var lines=[],line='';
  var maxW=fracW-4;
  words.forEach(function(w){
    ctx.font='9px monospace';
    if(ctx.measureText(line+w+' ').width>maxW&&line){lines.push(line.trim());line='';}
    line+=w+' ';
  });
  if(line.trim())lines.push(line.trim());
  ctx.fillStyle='rgba(255,255,255,0.4)';ctx.font='9px monospace';
  lines.forEach(function(l,li){ctx.fillText(l,cx,H-14-( lines.length-1-li)*12);});
});

// Title
ctx.fillStyle='rgba(255,255,255,0.55)';ctx.font='bold 12px monospace';ctx.textAlign='center';ctx.textBaseline='alphabetic';
ctx.fillText('1.00 M NaCl(aq) — four ways to express the same concentration',W/2,H-48);`,
      outputHeight: 320,
    },

    // ── Section 6 ───────────────────────────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `### Concentration in Context: Physiological and Environmental Relevance

Concentration isn't just a laboratory concept — it governs biological function, environmental safety, and drug efficacy.

**Blood chemistry.** Normal blood glucose is 4.0–5.9 mM (millimolar). Diabetic hyperglycemia starts above 11 mM. The blood maintains sodium concentration at almost exactly 135–145 mM — deviations of even 10 mM cause dangerous neurological symptoms. Potassium is held at 3.5–5.0 mM — outside this range, the heart's electrical rhythm fails. The precision with which the body regulates ion concentrations is a remarkable piece of chemistry.

**Intravenous fluids.** Normal saline (0.9% NaCl, w/v) is roughly isotonic with blood plasma — meaning it has the same effective particle concentration as blood. Infuse a solution with too low a concentration and red blood cells swell and burst (osmotic lysis). Too high and they shrivel. The concept of isotonicity is applied concentration chemistry.

**Water quality.** The EPA limit for lead in drinking water is 15 ppb (µg/L). For arsenic, 10 ppb. These numbers reflect toxicological research translated into concentration units. Measuring and enforcing these limits requires analytical techniques (atomic absorption spectroscopy, ICP-MS) that are fundamentally about detecting and quantifying concentration.

**Drug dosing.** The therapeutic index of a drug — the ratio between its toxic dose and its effective dose — is a concentration concept. "Aspirin: 325 mg tablet" is a mass dosage; your body metabolises it and achieves a peak plasma concentration (measured in µg/mL) that determines the effect. Understanding pharmacokinetics — how drugs distribute and clear — requires constant conversion between mass doses and molar concentrations.`,
    },

    // ── Challenge 3 ─────────────────────────────────────────────────────────────
    {
      type: 'challenge',
      instruction: `Normal blood sodium concentration is approximately 140 mM (millimolar). How many moles of Na⁺ ions are in 5.0 litres of blood (approximately the total blood volume of an adult)?`,
      options: [
        { label: 'A', text: '0.0070 mol' },
        { label: 'B', text: '0.070 mol' },
        { label: 'C', text: '0.70 mol' },
        { label: 'D', text: '7.0 mol' },
      ],
      check: (label) => label === 'C',
      successMessage: "Correct! 140 mM = 0.140 M. n = M × V = 0.140 mol/L × 5.0 L = 0.70 mol Na⁺. That's about 16 grams of sodium ions — held at precisely this concentration by kidneys, hormones, and membrane pumps.",
      failMessage: "Convert units first: 140 mM = 0.140 mol/L. Then n = M × V = 0.140 mol/L × 5.0 L = 0.70 mol. Watch the milli- prefix: 1 mM = 0.001 M = 10⁻³ M.",
      html: '', css: `body{margin:0;padding:0;font-family:sans-serif}`, startCode: '',
      outputHeight: 300,
    },

    // ── Challenge 4 ─────────────────────────────────────────────────────────────
    {
      type: 'challenge',
      instruction: `A student prepares a solution by dissolving 10.0 g of glucose (C₆H₁₂O₆, molar mass 180.16 g/mol) in 90.0 g of water. Which concentration unit does NOT require knowing the density of the solution to calculate?`,
      options: [
        { label: 'A', text: 'Molarity (mol/L) — needs volume of solution' },
        { label: 'B', text: 'Molality (mol/kg solvent) — uses mass of solvent, which is given directly' },
        { label: 'C', text: 'Both require density' },
        { label: 'D', text: 'Neither requires density' },
      ],
      check: (label) => label === 'B',
      successMessage: "Correct! Molality = moles solute / kg solvent = (10.0/180.16) / 0.0900 = 0.0555/0.0900 = 0.617 m. No density needed — mass of solvent is given directly. For molarity, you'd need to know the total volume of the solution, which requires density. This is why molality is used in colligative property calculations — it's temperature-independent.",
      failMessage: "Molality uses mass of solvent (given as 90.0 g = 0.0900 kg) — no density needed. Molarity = moles/litre, and you don't know the volume of 100 g of this solution without its density. Molality avoids this: m = mol ÷ kg solvent = (10.0/180.16) ÷ 0.0900 = 0.617 m.",
      html: '', css: `body{margin:0;padding:0;font-family:sans-serif}`, startCode: '',
      outputHeight: 300,
    },

    // ── Closing ──────────────────────────────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `### Concentration: The Quantitative Bridge

Concentration is the bridge between the visible world of grams and litres and the invisible world of molecules and reactions.

The mole translates mass into particle count. Molarity translates moles into something you can measure volumetrically in the lab. The dilution equation lets you prepare any concentration from any stock. The variety of concentration units reflects the variety of ways different fields need to express "how much" — from molar for reactions to ppm for water quality to mM for physiology.

The calculations themselves are straightforward — multiply, divide, convert units. What makes them powerful is that they connect to real consequences: a 0.1 M error in a pharmaceutical preparation is the difference between a dose and an overdose. A 10 ppb difference in water arsenic is the boundary between safe and regulated. A shift of 5 mM in blood sodium is a medical emergency.

We have now completed Chapter 3. Starting from the molecular picture of matter and the competition between thermal energy and intermolecular forces, we've built up to states of matter, phase transitions, solutions, and quantitative concentration. Chapter 4 will turn to reactions themselves — how chemical bonds break and form, why some reactions release energy and others absorb it, and what determines how fast a reaction goes.`,
    },

  ],
};

export default {
  id: 'chem-3-3-concentration-and-molarity',
  slug: 'concentration-and-molarity',
  chapter: 'chem.3',
  order: 3,
  title: 'Concentration and Molarity',
  subtitle: 'How chemists measure "how much is dissolved" — and why the mole is the key unit.',
  tags: ['chemistry', 'molarity', 'concentration', 'mole', 'dilution', 'molality', 'mass-percent', 'stoichiometry', 'Avogadro'],
  hook: {
    question: 'How do you tell a doctor exactly how much drug is in a solution — and how do you prepare the right concentration from a stock bottle?',
    realWorldContext: 'Molarity is the unit that connects the weighable world (grams) to the reactive world (molecules). Every calculation in solution chemistry — drug dosing, water quality, biochemistry — starts with converting mass to moles to concentration.',
    previewVisualizationId: 'ScienceNotebook',
  },
  intuition: {
    prose: [
      'The mole (6.022 × 10²³) converts between grams (weighable) and particles (reactive). Molar mass in g/mol = atomic/molecular mass in u.',
      'Molarity M = moles of solute / litres of solution. The most important concentration unit in chemistry.',
      'Dilution: M₁V₁ = M₂V₂. Moles are conserved; adding water increases volume and decreases concentration.',
      'Other units: mass percent (food/industry), molality (colligative properties), ppm/ppb (trace analysis), mole fraction (thermodynamics).',
    ],
    callouts: [
      { type: 'important', title: 'Molarity vs. molality', body: 'Molarity (M) = mol/L solution — changes with temperature (volume changes). Molality (m) = mol/kg solvent — temperature-independent. Use molality for boiling point elevation and freezing point depression.' },
    ],
    visualizations: [{ id: 'ScienceNotebook', title: 'Concentration and Molarity', props: { lesson: LESSON_CHEM_3_3 } }],
  },
  math: { prose: [], callouts: [], visualizations: [] },
  rigor: { prose: [], callouts: [], visualizations: [] },
  examples: [],
  challenges: [],
  mentalModel: [
    'Mole = 6.022 × 10²³ particles. Molar mass (g/mol) = mass of 1 mole. n = mass / molar mass.',
    'Molarity M = n / V(L). Rearranges: n = MV, V = n/M.',
    'Dilution: M₁V₁ = M₂V₂. Same moles, larger volume = lower concentration.',
    'Add acid to water (never water to acid) when diluting concentrated acids.',
    'Mass% = g solute / g solution × 100. ppm = mg/kg. Molality m = mol / kg solvent. Mole fraction χ = mol component / total mol.',
    'Physiological concentrations: blood Na⁺ ~140 mM, glucose ~5 mM. Deviations of ~10% cause serious symptoms.',
  ],
  checkpoints: ['read-intuition'],
  quiz: [],
};

export { LESSON_CHEM_3_3 };
