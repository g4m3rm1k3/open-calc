// Chemistry · Chapter 2 · Lesson 4
// Water — The Molecule That Makes Life Possible

const LESSON_CHEM_2_4 = {
  title: 'Water',
  subtitle: 'The molecule that makes life possible — and why it breaks all the rules.',
  sequential: true,

  cells: [

    // ── Section 1 ───────────────────────────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `### The Most Important Molecule in the Universe

Water is so familiar that it takes effort to see how strange it is.

At room temperature, a molecule the size of water — just three atoms, molecular mass 18 — should be a gas. Hydrogen sulfide (H₂S), water's chemical cousin with a nearly identical structure, boils at −60°C. If water behaved like other small molecules, it would boil at around −80°C. Earth's oceans would not exist. The atmosphere would contain no liquid water. Life as we know it would be impossible.

Instead, water boils at 100°C — nearly 180°C higher than it "should." It has a surface tension strong enough for insects to walk on. It dissolves more substances than almost any other liquid. It expands when it freezes, making ice float — a property almost unique in nature, and one that keeps aquatic life alive in winter. It absorbs and releases enormous amounts of heat, moderating Earth's climate.

Every one of these anomalies traces back to a single structural feature: the **bent geometry** of the water molecule and the polarity it creates. And that polarity enables something special — a type of intermolecular attraction called the **hydrogen bond**, which is weaker than a covalent bond but far stronger than ordinary intermolecular forces.

Understanding water means understanding the molecule from the inside out: its electron structure, its shape, its polarity, and what happens when water molecules meet each other.`,
    },

    // ── Section 2 ───────────────────────────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `### The Water Molecule: Structure and Polarity

Start with the Lewis structure. Oxygen has 6 valence electrons; each hydrogen has 1. Total: 8 electrons. Two O–H bonds use 4 electrons (2 shared pairs). The remaining 4 electrons form 2 lone pairs on oxygen.

Four electron groups around oxygen → tetrahedral electron geometry. Two of those groups are lone pairs → bent molecular geometry. The H–O–H bond angle is 104.5° — slightly compressed from the ideal tetrahedral 109.5° by the two lone pairs.

Each O–H bond is polar. Oxygen is far more electronegative than hydrogen (ΔEN = 1.24), so the shared electrons are pulled strongly toward oxygen. Each hydrogen carries a partial positive charge (δ+) and the oxygen end carries a partial negative charge (δ−).

Because the molecule is bent — not linear — the two bond dipoles point in similar directions and add together rather than cancelling. The result is a large **molecular dipole moment**: the oxygen end is the negative pole and the hydrogen end is the positive pole.

This dipole is not subtle. Water has one of the largest dipole moments of any common molecule (1.85 Debye). It is the foundation of everything unusual about water:

- The negative oxygen of one water molecule is strongly attracted to the positive hydrogen of a neighbouring water molecule.
- This attraction is the **hydrogen bond** — and it changes everything.`,
    },

    // ── Visual 1 — Water molecule structure ────────────────────────────────────
    {
      type: 'js',
      instruction: `### The water molecule: geometry, lone pairs, and dipole

The canvas shows a water molecule with its two lone pairs, bond angle, partial charges, and the resulting molecular dipole moment arrow. The lone pairs are shown as electron density clouds — they are real, spatially significant, and responsible for the bent shape.`,
      html: `<canvas id="cv" width="700" height="320"></canvas>`,
      css: `body{margin:0;background:#0a0f1e;display:flex;justify-content:center}
canvas{display:block;width:100%;max-width:700px}`,
      startCode: `var canvas=document.getElementById('cv');
var ctx=canvas.getContext('2d');
var W=canvas.width,H=canvas.height;
var t=0;

function draw(){
  ctx.clearRect(0,0,W,H);
  ctx.fillStyle='#0a0f1e';ctx.fillRect(0,0,W,H);

  var cx=W/2-30,cy=H/2+10;
  var bondLen=100;
  var bondAngle=52.25*(Math.PI/180); // half of 104.5

  var h1x=cx-Math.sin(bondAngle)*bondLen;
  var h1y=cy+Math.cos(bondAngle)*bondLen*0.75;
  var h2x=cx+Math.sin(bondAngle)*bondLen;
  var h2y=cy+Math.cos(bondAngle)*bondLen*0.75;

  var pulse=Math.sin(t*0.03)*0.12+0.88;

  // ── Lone pair clouds (above oxygen) ──
  var lp1x=cx-32,lp1y=cy-46;
  var lp2x=cx+32,lp2y=cy-46;
  [lp1x,lp2x].forEach(function(lx,li){
    var ly=[lp1y,lp2y][li];
    var grd=ctx.createRadialGradient(lx,ly,0,lx,ly,30);
    grd.addColorStop(0,'rgba(56,189,248,'+(0.45*pulse)+')');
    grd.addColorStop(1,'rgba(56,189,248,0)');
    ctx.fillStyle=grd;
    ctx.beginPath();ctx.arc(lx,ly,30,0,Math.PI*2);ctx.fill();
    // Two dots
    ctx.beginPath();ctx.arc(lx-6,ly,3.5,0,Math.PI*2);
    ctx.fillStyle='#38bdf8cc';ctx.fill();
    ctx.beginPath();ctx.arc(lx+6,ly,3.5,0,Math.PI*2);
    ctx.fillStyle='#38bdf8cc';ctx.fill();
  });
  ctx.fillStyle='rgba(56,189,248,0.55)';
  ctx.font='10px monospace';ctx.textAlign='center';
  ctx.fillText('lone pair',lp1x-2,lp1y-36);
  ctx.fillText('lone pair',lp2x+2,lp2y-36);

  // ── Bonds ──
  ctx.beginPath();ctx.moveTo(cx,cy);ctx.lineTo(h1x,h1y);
  ctx.strokeStyle='rgba(248,113,113,0.7)';ctx.lineWidth=3;ctx.stroke();
  ctx.beginPath();ctx.moveTo(cx,cy);ctx.lineTo(h2x,h2y);
  ctx.strokeStyle='rgba(248,113,113,0.7)';ctx.lineWidth=3;ctx.stroke();

  // ── Bond angle arc ──
  var a1=Math.atan2(h1y-cy,h1x-cx);
  var a2=Math.atan2(h2y-cy,h2x-cx);
  ctx.beginPath();ctx.arc(cx,cy,36,a1,a2);
  ctx.strokeStyle='rgba(255,255,255,0.25)';ctx.lineWidth=1.5;ctx.stroke();
  ctx.fillStyle='rgba(255,255,255,0.5)';ctx.font='bold 12px monospace';ctx.textAlign='center';
  ctx.fillText('104.5°',cx+8,cy+52);

  // ── Partial charges on bonds ──
  var mid1x=(cx+h1x)/2,mid1y=(cy+h1y)/2;
  var mid2x=(cx+h2x)/2,mid2y=(cy+h2y)/2;
  ctx.fillStyle='#f97316';ctx.font='bold 13px monospace';ctx.textAlign='center';
  ctx.fillText('\u03b4\u2212',cx-18,cy-8);
  ctx.fillText('\u03b4+',h1x-10,h1y+18);
  ctx.fillText('\u03b4+',h2x+10,h2y+18);

  // ── Atoms ──
  // O
  var oGrd=ctx.createRadialGradient(cx,cy,0,cx,cy,28);
  oGrd.addColorStop(0,'#f87171');oGrd.addColorStop(1,'rgba(248,113,113,0.3)');
  ctx.beginPath();ctx.arc(cx,cy,22,0,Math.PI*2);
  ctx.fillStyle=oGrd;ctx.fill();
  ctx.strokeStyle='#f87171';ctx.lineWidth=2;ctx.stroke();
  ctx.fillStyle='#fff';ctx.font='bold 14px monospace';ctx.textAlign='center';ctx.textBaseline='middle';
  ctx.fillText('O',cx,cy);

  // H atoms
  [h1x,h2x].forEach(function(hx,hi){
    var hy=[h1y,h2y][hi];
    ctx.beginPath();ctx.arc(hx,hy,14,0,Math.PI*2);
    ctx.fillStyle='#1e293b';ctx.fill();
    ctx.strokeStyle='#e2e8f0';ctx.lineWidth=2;ctx.stroke();
    ctx.fillStyle='#e2e8f0';ctx.font='bold 12px monospace';
    ctx.fillText('H',hx,hy);
  });

  // ── Dipole moment arrow ──
  var dipY=cy+25;
  var dipLen=72*pulse;
  ctx.beginPath();ctx.moveTo(cx,dipY);ctx.lineTo(cx,dipY-dipLen);
  ctx.strokeStyle='#facc15';ctx.lineWidth=3;ctx.stroke();
  // Arrowhead
  ctx.beginPath();ctx.moveTo(cx-8,dipY-dipLen+14);ctx.lineTo(cx,dipY-dipLen);ctx.lineTo(cx+8,dipY-dipLen+14);
  ctx.strokeStyle='#facc15';ctx.lineWidth=3;ctx.stroke();
  ctx.fillStyle='#facc15';ctx.font='bold 11px monospace';ctx.textAlign='left';ctx.textBaseline='middle';
  ctx.fillText('\u03bc = 1.85 D',cx+10,dipY-dipLen+8);
  ctx.fillStyle='rgba(255,255,255,0.45)';ctx.font='10px monospace';
  ctx.fillText('(dipole moment)',cx+10,dipY-dipLen+22);

  // ── Right panel: key facts ──
  var rx=W*0.7;
  ctx.textBaseline='alphabetic';
  ctx.fillStyle='rgba(255,255,255,0.7)';ctx.font='bold 13px monospace';ctx.textAlign='left';
  ctx.fillText('Key geometry facts',rx,52);

  var facts=[
    {label:'Formula',val:'H₂O'},
    {label:'Electron groups',val:'4 (2 bonds + 2 lone pairs)'},
    {label:'Electron geometry',val:'Tetrahedral'},
    {label:'Molecular geometry',val:'Bent'},
    {label:'Bond angle',val:'104.5°'},
    {label:'O electronegativity',val:'3.44'},
    {label:'H electronegativity',val:'2.20'},
    {label:'\u0394EN (O\u2013H)',val:'1.24 → polar bond'},
    {label:'Dipole moment',val:'1.85 Debye'},
  ];
  facts.forEach(function(f,i){
    ctx.fillStyle='rgba(255,255,255,0.4)';ctx.font='10px monospace';
    ctx.fillText(f.label,rx,76+i*20);
    ctx.fillStyle='rgba(248,113,113,0.9)';ctx.font='bold 11px monospace';
    ctx.fillText(f.val,rx+136,76+i*20);
  });

  t++;requestAnimationFrame(draw);
}
draw();`,
      outputHeight: 340,
    },

    // ── Section 3 ───────────────────────────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `### Hydrogen Bonds: A Special Kind of Attraction

The dipole of water leads to something remarkable. When two water molecules are near each other, the δ+ hydrogen of one molecule is attracted to the δ− oxygen of another. This attraction is called a **hydrogen bond**.

Hydrogen bonds are not covalent bonds. No electrons are shared. They are electrostatic — an attraction between opposite partial charges. But they are unusually strong for an intermolecular force, because:

1. **Hydrogen is tiny.** With no inner electrons and no lone pairs of its own, the hydrogen nucleus (a single proton) is nearly bare. When bonded to a highly electronegative atom, the positive charge is concentrated in a very small volume — creating a strong, localised δ+ that interacts powerfully with lone pairs on nearby electronegative atoms.

2. **Oxygen is highly electronegative.** Its lone pairs are compact and negatively charged, forming excellent hydrogen bond acceptors.

The geometry of hydrogen bonds is nearly linear — the O–H···O angle is close to 180°. This directionality gives water a highly ordered local structure.

The energy of a single hydrogen bond is about **20 kJ/mol** — roughly 5–10% the strength of a covalent O–H bond (460 kJ/mol). This seems weak, but each water molecule can form up to **four hydrogen bonds** simultaneously: two as a donor (one from each O–H bond) and two as an acceptor (one to each lone pair). In liquid water, almost all possible hydrogen bonds are formed at any given moment, creating a dense, cooperative network.

It is this network — not any individual hydrogen bond — that gives water its extraordinary properties.`,
    },

    // ── Visual 2 — Hydrogen bond network ───────────────────────────────────────
    {
      type: 'js',
      instruction: `### Hydrogen bond network in liquid water

Each water molecule (O in red, H in grey) can form up to 4 hydrogen bonds. The dashed lines show hydrogen bonds — shorter, weaker, and more directional than covalent bonds. The network is constantly breaking and reforming on a timescale of picoseconds, but at any instant nearly every possible hydrogen bond is occupied.`,
      html: `<canvas id="cv" width="700" height="360"></canvas>`,
      css: `body{margin:0;background:#0a0f1e;display:flex;justify-content:center}
canvas{display:block;width:100%;max-width:700px}`,
      startCode: `var canvas=document.getElementById('cv');
var ctx=canvas.getContext('2d');
var W=canvas.width,H=canvas.height;
var t=0;

// Place water molecules in a loose network
var mols=[
  {x:200,y:120,angle:0.3},
  {x:340,y:90,angle:-0.8},
  {x:460,y:140,angle:1.2},
  {x:150,y:230,angle:2.1},
  {x:290,y:210,angle:-0.2},
  {x:430,y:240,angle:0.9},
  {x:540,y:180,angle:-1.4},
  {x:200,y:310,angle:1.7},
  {x:360,y:300,angle:-1.1},
  {x:490,y:310,angle:0.4},
];

// Hydrogen bond pairs (indices of molecules that are H-bonded)
var hbonds=[
  [0,1],[1,2],[0,3],[1,4],[2,6],[3,4],[4,5],[5,6],[3,7],[4,8],[5,9],[7,8],[8,9]
];

function getHPos(mol,side){
  // Returns H atom positions for a water molecule
  var ba=52.25*(Math.PI/180);
  var bl=28;
  var baseAngle=mol.angle+Math.PI/2;
  var h1x=mol.x+Math.cos(baseAngle-ba)*bl;
  var h1y=mol.y+Math.sin(baseAngle-ba)*bl;
  var h2x=mol.x+Math.cos(baseAngle+ba)*bl;
  var h2y=mol.y+Math.sin(baseAngle+ba)*bl;
  return side===0?{x:h1x,y:h1y}:{x:h2x,y:h2y};
}

function drawWaterMolecule(mol,highlight){
  var ba=52.25*(Math.PI/180);
  var bl=28;
  var baseAngle=mol.angle+Math.PI/2;
  var h1x=mol.x+Math.cos(baseAngle-ba)*bl;
  var h1y=mol.y+Math.sin(baseAngle-ba)*bl;
  var h2x=mol.x+Math.cos(baseAngle+ba)*bl;
  var h2y=mol.y+Math.sin(baseAngle+ba)*bl;

  // Bonds
  ctx.beginPath();ctx.moveTo(mol.x,mol.y);ctx.lineTo(h1x,h1y);
  ctx.strokeStyle=highlight?'#f87171':'rgba(248,113,113,0.65)';ctx.lineWidth=2;ctx.stroke();
  ctx.beginPath();ctx.moveTo(mol.x,mol.y);ctx.lineTo(h2x,h2y);
  ctx.strokeStyle=highlight?'#f87171':'rgba(248,113,113,0.65)';ctx.lineWidth=2;ctx.stroke();

  // Lone pair suggestion (opposite side from H)
  var lpAngle=baseAngle-Math.PI;
  var lp1x=mol.x+Math.cos(lpAngle-0.4)*22;
  var lp1y=mol.y+Math.sin(lpAngle-0.4)*22;
  var lp2x=mol.x+Math.cos(lpAngle+0.4)*22;
  var lp2y=mol.y+Math.sin(lpAngle+0.4)*22;
  [lp1x,lp2x].forEach(function(lx,li){
    var ly=[lp1y,lp2y][li];
    ctx.beginPath();ctx.arc(lx,ly,2.5,0,Math.PI*2);
    ctx.fillStyle='rgba(56,189,248,0.6)';ctx.fill();
  });

  // O
  ctx.beginPath();ctx.arc(mol.x,mol.y,10,0,Math.PI*2);
  ctx.fillStyle=highlight?'#f87171':'#be3a3a';ctx.fill();
  ctx.fillStyle='#fff';ctx.font='bold 8px monospace';
  ctx.textAlign='center';ctx.textBaseline='middle';
  ctx.fillText('O',mol.x,mol.y);

  // H atoms
  [[h1x,h1y],[h2x,h2y]].forEach(function(h){
    ctx.beginPath();ctx.arc(h[0],h[1],7,0,Math.PI*2);
    ctx.fillStyle=highlight?'#e2e8f0':'#94a3b8';ctx.fill();
    ctx.fillStyle='#1e293b';ctx.font='bold 7px monospace';
    ctx.fillText('H',h[0],h[1]);
  });
}

function draw(){
  ctx.clearRect(0,0,W,H);
  ctx.fillStyle='#0a0f1e';ctx.fillRect(0,0,W,H);

  // Subtle drift
  mols.forEach(function(mol,i){
    mol.x+=Math.sin(t*0.008+i*1.3)*0.15;
    mol.y+=Math.cos(t*0.009+i*0.9)*0.15;
    mol.angle+=Math.sin(t*0.006+i*2.1)*0.002;
  });

  // Draw hydrogen bonds first
  hbonds.forEach(function(pair){
    var a=mols[pair[0]],b=mols[pair[1]];
    // Find closest H on a to O of b, or O of a to closest H on b
    var h0=getHPos(a,0),h1=getHPos(a,1);
    var d0=Math.sqrt(Math.pow(h0.x-b.x,2)+Math.pow(h0.y-b.y,2));
    var d1=Math.sqrt(Math.pow(h1.x-b.x,2)+Math.pow(h1.y-b.y,2));
    var hPos=d0<d1?h0:h1;

    // Pulse opacity
    var opacPulse=0.5+0.25*Math.sin(t*0.04+pair[0]*0.7);

    ctx.beginPath();ctx.moveTo(hPos.x,hPos.y);ctx.lineTo(b.x,b.y);
    ctx.strokeStyle='rgba(56,189,248,'+opacPulse+')';
    ctx.lineWidth=1.5;ctx.setLineDash([5,4]);ctx.stroke();ctx.setLineDash([]);

    // Small label midpoint
    var mx=(hPos.x+b.x)/2,my=(hPos.y+b.y)/2;
    ctx.fillStyle='rgba(56,189,248,0.35)';ctx.font='9px monospace';ctx.textAlign='center';
  });

  // Draw molecules
  mols.forEach(function(mol,i){drawWaterMolecule(mol,false);});

  // Legend
  ctx.strokeStyle='rgba(248,113,113,0.8)';ctx.lineWidth=2;ctx.setLineDash([]);
  ctx.beginPath();ctx.moveTo(30,H-52);ctx.lineTo(60,H-52);ctx.stroke();
  ctx.fillStyle='rgba(255,255,255,0.6)';ctx.font='12px monospace';ctx.textAlign='left';
  ctx.fillText('Covalent O\u2013H bond',66,H-48);

  ctx.strokeStyle='rgba(56,189,248,0.7)';ctx.lineWidth=1.5;ctx.setLineDash([5,4]);
  ctx.beginPath();ctx.moveTo(30,H-28);ctx.lineTo(60,H-28);ctx.stroke();ctx.setLineDash([]);
  ctx.fillStyle='rgba(255,255,255,0.6)';ctx.font='12px monospace';
  ctx.fillText('Hydrogen bond (O\u2013H\u00b7\u00b7\u00b7O)',66,H-24);

  ctx.fillStyle='rgba(56,189,248,0.5)';ctx.font='9px monospace';
  ctx.fillText('\u25cf lone pair',200,H-24);

  ctx.fillStyle='rgba(255,255,255,0.3)';ctx.font='11px monospace';ctx.textAlign='right';
  ctx.fillText('Each molecule can donate 2 H-bonds and accept 2 \u2192 up to 4 total',W-14,H-10);

  t++;requestAnimationFrame(draw);
}
draw();`,
      outputHeight: 380,
    },

    // ── Challenge 1 ─────────────────────────────────────────────────────────────
    {
      type: 'challenge',
      instruction: `Each water molecule can form up to 4 hydrogen bonds. Which statement correctly explains why?`,
      options: [
        { label: 'A', text: 'Water has 4 covalent bonds — one for each hydrogen bond' },
        { label: 'B', text: 'Water has 2 O–H bonds (hydrogen bond donors) and 2 lone pairs on oxygen (hydrogen bond acceptors)' },
        { label: 'C', text: 'Hydrogen bonds form between any two water molecules that are close to each other' },
        { label: 'D', text: 'Oxygen can share up to 4 electrons at a time with neighbouring atoms' },
      ],
      check: (label) => label === 'B',
      successMessage: "Correct! Each O–H bond makes the H slightly positive (δ+) — it can donate a hydrogen bond to a nearby lone pair. Oxygen's two lone pairs are slightly negative (δ−) — each can accept a hydrogen bond from a neighbouring molecule's δ+ hydrogen. Two donors + two acceptors = up to 4 hydrogen bonds per molecule.",
      failMessage: "Think about what each part of the molecule can do. The O–H bonds make hydrogen δ+ — these hydrogens can be donated to lone pairs on other molecules (H-bond donors). The lone pairs on O are δ− — they can accept H-bonds from other molecules' hydrogens (H-bond acceptors). 2 + 2 = 4.",
      html: '', css: `body{margin:0;padding:0;font-family:sans-serif}`, startCode: '',
      outputHeight: 300,
    },

    // ── Section 4 ───────────────────────────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `### Anomalous Properties: Where the Rules Break Down

The hydrogen bond network is responsible for a list of water properties that each seem unremarkable until you compare them to other similar molecules:

**High boiling point.** As noted, water "should" boil around −80°C based on its size. It boils at 100°C. The extra 180°C of thermal stability comes from the energy required to break the hydrogen bond network before molecules can escape into the gas phase. Every molecule leaving the liquid surface must break roughly 3–4 hydrogen bonds. At 20 kJ/mol each, this adds a substantial energy barrier.

**High specific heat capacity.** Water absorbs 4.18 joules per gram per degree Celsius — roughly four times more than iron or rock. Most of the heat added to liquid water goes into breaking and reforming hydrogen bonds, not into speeding up molecular motion (which is what temperature actually measures). This makes water an extraordinary thermal buffer — it resists temperature change. It's why coastal climates are mild, why mammals can maintain stable body temperatures, and why the ocean drives global climate patterns.

**High latent heat of vaporisation.** It takes 2,260 J to evaporate 1 gram of water — more than five times the energy to heat it from 0°C to 100°C. This is why sweating cools you so effectively. Each gram of sweat that evaporates carries away 2,260 J of heat from your body.

**Surface tension.** Water's surface tension (72 mN/m) is the highest of any common liquid except mercury. The hydrogen bond network pulls surface molecules inward and sideways, creating a resistant "skin." Insects walk on it. Leaves stay dry in light rain. Soap breaks it by inserting molecules that disrupt hydrogen bonding.

**The density anomaly: ice floats.** This deserves its own section.`,
    },

    // ── Visual 3 — Anomalous properties comparison ─────────────────────────────
    {
      type: 'js',
      instruction: `### How unusual is water? Comparison with similar molecules

The chart compares the boiling points of the Group 16 hydrides (H₂O, H₂S, H₂Se, H₂Te). The trend from H₂Te down to H₂S is smooth — a normal decrease with molecular size. Water is a dramatic outlier, sitting far above the extrapolated trend. This is the hydrogen bond effect, made visible.`,
      html: `<canvas id="cv" width="700" height="320"></canvas>`,
      css: `body{margin:0;background:#0a0f1e;display:flex;justify-content:center}
canvas{display:block;width:100%;max-width:700px}`,
      startCode: `var canvas=document.getElementById('cv');
var ctx=canvas.getContext('2d');
var W=canvas.width,H=canvas.height;

ctx.fillStyle='#0a0f1e';ctx.fillRect(0,0,W,H);

// Data: Group 16 hydrides
var molecules=[
  {name:'H₂Te',mass:130,bp:-2,color:'#94a3b8'},
  {name:'H₂Se',mass:81, bp:-41,color:'#94a3b8'},
  {name:'H₂S', mass:34, bp:-60,color:'#94a3b8'},
  {name:'H₂O', mass:18, bp:100,color:'#f87171'},
];

// Chart area
var chartX=80,chartY=30,chartW=W-160,chartH=230;
var minMass=10,maxMass=140,minBP=-80,maxBP=120;

function toScreen(mass,bp){
  var x=chartX+((mass-minMass)/(maxMass-minMass))*chartW;
  var y=chartY+chartH-((bp-minBP)/(maxBP-minBP))*chartH;
  return{x:x,y:y};
}

// Axes
ctx.strokeStyle='rgba(255,255,255,0.2)';ctx.lineWidth=1;
ctx.beginPath();ctx.moveTo(chartX,chartY);ctx.lineTo(chartX,chartY+chartH);ctx.stroke();
ctx.beginPath();ctx.moveTo(chartX,chartY+chartH);ctx.lineTo(chartX+chartW,chartY+chartH);ctx.stroke();

// Grid lines
[-80,-60,-40,-20,0,20,40,60,80,100].forEach(function(bp){
  var y=toScreen(0,bp).y;
  ctx.beginPath();ctx.moveTo(chartX,y);ctx.lineTo(chartX+chartW,y);
  ctx.strokeStyle=bp===0?'rgba(255,255,255,0.2)':'rgba(255,255,255,0.07)';
  ctx.lineWidth=1;ctx.stroke();
  ctx.fillStyle='rgba(255,255,255,0.4)';ctx.font='10px monospace';ctx.textAlign='right';
  ctx.fillText(bp+'°C',chartX-6,y+4);
});

// Axis labels
ctx.fillStyle='rgba(255,255,255,0.5)';ctx.font='11px monospace';ctx.textAlign='center';
ctx.fillText('Molecular mass (u)',chartX+chartW/2,chartY+chartH+26);
ctx.save();ctx.translate(22,chartY+chartH/2);ctx.rotate(-Math.PI/2);
ctx.fillText('Boiling point (°C)',0,0);ctx.restore();

// Title
ctx.fillStyle='rgba(255,255,255,0.7)';ctx.font='bold 13px monospace';ctx.textAlign='center';
ctx.fillText('Boiling points of Group 16 hydrides — water is a massive outlier',W/2,chartY+chartH+50);

// Draw trend line for H2S, H2Se, H2Te (extrapolated to H2O mass)
var trend=[
  {mass:34,bp:-60},{mass:81,bp:-41},{mass:130,bp:-2}
];
// Linear extrapolation
var n=trend.length;
var sumX=0,sumY=0,sumXY=0,sumX2=0;
trend.forEach(function(p){sumX+=p.mass;sumY+=p.bp;sumXY+=p.mass*p.bp;sumX2+=p.mass*p.mass;});
var slope=(n*sumXY-sumX*sumY)/(n*sumX2-sumX*sumX);
var intercept=(sumY-slope*sumX)/n;

ctx.beginPath();
var startM=15,endM=140;
var sp=toScreen(startM,slope*startM+intercept);
var ep2=toScreen(endM,slope*endM+intercept);
ctx.moveTo(sp.x,sp.y);ctx.lineTo(ep2.x,ep2.y);
ctx.strokeStyle='rgba(148,163,184,0.35)';ctx.lineWidth=1.5;ctx.setLineDash([6,4]);ctx.stroke();ctx.setLineDash([]);

// Extrapolated water value
var extBP=slope*18+intercept;
var extPt=toScreen(18,extBP);
ctx.beginPath();ctx.arc(extPt.x,extPt.y,6,0,Math.PI*2);
ctx.fillStyle='rgba(148,163,184,0.4)';ctx.fill();
ctx.strokeStyle='rgba(148,163,184,0.6)';ctx.lineWidth=1.5;ctx.stroke();
ctx.fillStyle='rgba(148,163,184,0.7)';ctx.font='10px monospace';ctx.textAlign='left';
ctx.fillText('expected \u2248 '+Math.round(extBP)+'°C',extPt.x+10,extPt.y+4);

// Data points
molecules.forEach(function(mol){
  var pt=toScreen(mol.mass,mol.bp);
  // Glow for water
  if(mol.name==='H₂O'){
    var grd=ctx.createRadialGradient(pt.x,pt.y,0,pt.x,pt.y,24);
    grd.addColorStop(0,'rgba(248,113,113,0.5)');grd.addColorStop(1,'rgba(0,0,0,0)');
    ctx.fillStyle=grd;ctx.beginPath();ctx.arc(pt.x,pt.y,24,0,Math.PI*2);ctx.fill();
  }
  ctx.beginPath();ctx.arc(pt.x,pt.y,8,0,Math.PI*2);
  ctx.fillStyle=mol.color;ctx.fill();
  ctx.fillStyle=mol.name==='H₂O'?'#f87171':'rgba(255,255,255,0.8)';
  ctx.font=mol.name==='H₂O'?'bold 13px monospace':'12px monospace';
  ctx.textAlign='center';
  ctx.fillText(mol.name,pt.x,pt.y-18);
  ctx.fillStyle='rgba(255,255,255,0.55)';ctx.font='11px monospace';
  ctx.fillText(mol.bp+'°C',pt.x,pt.y+22);
});

// Annotation arrow from expected to actual
var actualPt=toScreen(18,100);
ctx.beginPath();
ctx.moveTo(extPt.x,extPt.y-8);
ctx.lineTo(actualPt.x,actualPt.y+14);
ctx.strokeStyle='rgba(248,113,113,0.5)';ctx.lineWidth=1.5;ctx.setLineDash([3,3]);ctx.stroke();ctx.setLineDash([]);
ctx.fillStyle='rgba(248,113,113,0.8)';ctx.font='bold 11px monospace';ctx.textAlign='left';
ctx.fillText('+\u2248180°C',actualPt.x+10,(extPt.y+actualPt.y)/2);
ctx.fillStyle='rgba(255,255,255,0.45)';ctx.font='10px monospace';
ctx.fillText('from hydrogen',actualPt.x+10,(extPt.y+actualPt.y)/2+14);
ctx.fillText('bonding',actualPt.x+10,(extPt.y+actualPt.y)/2+26);`,
      outputHeight: 340,
    },

    // ── Section 5 ───────────────────────────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `### Why Ice Floats: The Density Anomaly

Almost every liquid contracts as it cools — the molecules slow down, pack closer together, and the solid that forms is denser than the liquid. Ice should sink in water. Every other common substance has a solid that sinks in its own liquid.

But ice floats. This is not a minor exception — it is one of the most consequential physical facts in the history of life on Earth.

Here is why it happens. In liquid water, the hydrogen bond network is dynamic — constantly breaking and reforming, with molecules shifting and sliding past each other. The network is real but disordered. On average, molecules are about 2.9 Å apart.

As water cools toward 0°C, the network becomes more persistent. At 4°C, water reaches its maximum density — the molecules are as closely packed as the hydrogen bond network allows in the liquid state.

Below 4°C, something unexpected happens: as water approaches freezing, the hydrogen bonds begin locking into a permanent, crystalline arrangement. The crystal structure of ice is a hexagonal lattice — each oxygen is hydrogen-bonded to exactly 4 others in a tetrahedral arrangement. This structure is extraordinarily open. The hexagonal rings contain large empty spaces. Ice is **less dense than liquid water** by about 9%.

When a lake freezes in winter, the ice forms at the surface and stays there. It insulates the water below. The water beneath the ice stays at roughly 4°C — cold, but liquid. Fish survive. Aquatic ecosystems persist. If ice sank, lakes would freeze solid from the bottom up, killing everything in them.

The density anomaly of water — a direct consequence of the geometry of hydrogen bonding — is one of the reasons life was able to evolve and survive on Earth.`,
    },

    // ── Visual 4 — Ice vs liquid water structure ───────────────────────────────
    {
      type: 'js',
      instruction: `### Ice vs. liquid water: structure comparison

The left panel shows the ordered hexagonal lattice of ice — each molecule locked into 4 hydrogen bonds, with large open spaces between the hexagonal rings. The right panel shows liquid water — hydrogen bonds present but dynamic, molecules more randomly arranged and closer together on average. The open structure of ice is why it is less dense.`,
      html: `<canvas id="cv" width="700" height="330"></canvas>`,
      css: `body{margin:0;background:#0a0f1e;display:flex;justify-content:center}
canvas{display:block;width:100%;max-width:700px}`,
      startCode: `var canvas=document.getElementById('cv');
var ctx=canvas.getContext('2d');
var W=canvas.width,H=canvas.height;
var t=0;

// Ice: hexagonal lattice positions
function hexLattice(){
  var positions=[];
  var dx=54,dy=47;
  var rows=4,cols=4;
  for(var row=0;row<rows;row++){
    for(var col=0;col<cols;col++){
      var x=60+col*dx+(row%2)*dx*0.5;
      var y=60+row*dy;
      positions.push({x:x,y:y,angle:row*0.4+col*0.7});
    }
  }
  return positions;
}

var iceMols=hexLattice();

// Ice H-bond connections (nearest neighbours in hex lattice)
var iceHbonds=[];
iceMols.forEach(function(a,i){
  iceMols.forEach(function(b,j){
    if(i>=j)return;
    var dx=a.x-b.x,dy=a.y-b.y;
    var dist=Math.sqrt(dx*dx+dy*dy);
    if(dist>45&&dist<62)iceHbonds.push([i,j]);
  });
});

// Liquid: random-ish positions with gentle drift
var liqMols=[];
for(var i=0;i<13;i++){
  liqMols.push({
    x:380+Math.random()*270,y:40+Math.random()*260,
    angle:Math.random()*Math.PI*2,
    vx:(Math.random()-0.5)*0.18,vy:(Math.random()-0.5)*0.18,
    va:(Math.random()-0.5)*0.006
  });
}

function drawMol(x,y,angle,color){
  var ba=52.25*(Math.PI/180),bl=16;
  var baseAngle=angle+Math.PI/2;
  var h1x=x+Math.cos(baseAngle-ba)*bl,h1y=y+Math.sin(baseAngle-ba)*bl;
  var h2x=x+Math.cos(baseAngle+ba)*bl,h2y=y+Math.sin(baseAngle+ba)*bl;
  ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(h1x,h1y);
  ctx.strokeStyle=color+'99';ctx.lineWidth=1.8;ctx.stroke();
  ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(h2x,h2y);
  ctx.strokeStyle=color+'99';ctx.lineWidth=1.8;ctx.stroke();
  ctx.beginPath();ctx.arc(x,y,8,0,Math.PI*2);
  ctx.fillStyle='#f87171';ctx.fill();
  [h1x,h2x].forEach(function(hx,hi){
    var hy=[h1y,h2y][hi];
    ctx.beginPath();ctx.arc(hx,hy,5,0,Math.PI*2);
    ctx.fillStyle='#94a3b8';ctx.fill();
  });
}

function draw(){
  ctx.clearRect(0,0,W,H);
  ctx.fillStyle='#0a0f1e';ctx.fillRect(0,0,W,H);

  // Panel divider
  ctx.strokeStyle='rgba(255,255,255,0.08)';ctx.lineWidth=1;
  ctx.beginPath();ctx.moveTo(355,10);ctx.lineTo(355,H-10);ctx.stroke();

  // ── ICE panel ──
  ctx.fillStyle='rgba(147,197,253,0.15)';ctx.fillRect(10,10,340,H-20);
  ctx.fillStyle='#93c5fd';ctx.font='bold 14px monospace';ctx.textAlign='center';
  ctx.fillText('Ice — ordered lattice',178,28);
  ctx.fillStyle='rgba(255,255,255,0.4)';ctx.font='11px monospace';
  ctx.fillText('hexagonal structure \u2192 less dense',178,44);

  // Ice H-bonds
  iceHbonds.forEach(function(pair){
    var a=iceMols[pair[0]],b=iceMols[pair[1]];
    ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);
    ctx.strokeStyle='rgba(147,197,253,0.5)';ctx.lineWidth=1.2;ctx.setLineDash([4,3]);ctx.stroke();ctx.setLineDash([]);
  });

  iceMols.forEach(function(mol){drawMol(mol.x,mol.y,mol.angle,'#93c5fd');});

  ctx.fillStyle='rgba(147,197,253,0.6)';ctx.font='11px monospace';ctx.textAlign='center';
  ctx.fillText('density: 0.917 g/cm\u00b3',178,H-20);

  // ── LIQUID panel ──
  ctx.fillStyle='rgba(248,113,113,0.07)';ctx.fillRect(360,10,330,H-20);
  ctx.fillStyle='#f87171';ctx.font='bold 14px monospace';ctx.textAlign='center';
  ctx.fillText('Liquid water — dynamic',525,28);
  ctx.fillStyle='rgba(255,255,255,0.4)';ctx.font='11px monospace';
  ctx.fillText('H-bonds break & reform constantly',525,44);

  // Liquid H-bonds (dynamic — between nearby molecules)
  liqMols.forEach(function(a,i){
    liqMols.forEach(function(b,j){
      if(i>=j)return;
      var dx=a.x-b.x,dy=a.y-b.y;
      var dist=Math.sqrt(dx*dx+dy*dy);
      if(dist<70){
        var opac=Math.max(0,(70-dist)/70)*0.6;
        opac*=0.5+0.5*Math.sin(t*0.05+i*1.3);
        ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);
        ctx.strokeStyle='rgba(248,113,113,'+opac+')';ctx.lineWidth=1.2;ctx.setLineDash([4,3]);ctx.stroke();ctx.setLineDash([]);
      }
    });
  });

  liqMols.forEach(function(mol){
    mol.x+=mol.vx;mol.y+=mol.vy;mol.angle+=mol.va;
    if(mol.x<372||mol.x>680)mol.vx*=-1;
    if(mol.y<52||mol.y>H-30)mol.vy*=-1;
    drawMol(mol.x,mol.y,mol.angle,'#f87171');
  });

  ctx.fillStyle='rgba(248,113,113,0.6)';ctx.font='11px monospace';ctx.textAlign='center';
  ctx.fillText('density: 1.000 g/cm\u00b3 (at 4\u00b0C)',525,H-20);

  // Floating ice reminder
  ctx.fillStyle='rgba(255,255,255,0.3)';ctx.font='11px monospace';ctx.textAlign='center';
  ctx.fillText('Ice is 9% less dense than liquid water \u2192 it floats',W/2,H-4);

  t++;requestAnimationFrame(draw);
}
draw();`,
      outputHeight: 350,
    },

    // ── Challenge 2 ─────────────────────────────────────────────────────────────
    {
      type: 'challenge',
      instruction: `Water reaches its maximum density at 4°C, not at 0°C (its freezing point). Which explanation is correct?`,
      options: [
        { label: 'A', text: 'Below 4°C, hydrogen bonds begin forming a rigid hexagonal lattice that is more open (less dense) than the disordered liquid' },
        { label: 'B', text: 'Water molecules shrink at lower temperatures, reducing the overall density' },
        { label: 'C', text: 'At 4°C, water molecules move faster and pack more tightly' },
        { label: 'D', text: 'The density anomaly is caused by dissolved air leaving solution below 4°C' },
      ],
      check: (label) => label === 'A',
      successMessage: "Correct! As water cools below 4°C, hydrogen bonds increasingly lock molecules into the open hexagonal ice lattice structure. Even before full freezing, this ordering expands the volume (reduces density). At 0°C, the full crystalline lattice is 9% less dense than liquid water at 4°C.",
      failMessage: "The key is what happens to the hydrogen bond network below 4°C. As temperature drops toward freezing, H-bonds start forming the permanent hexagonal lattice structure of ice. This lattice has large open spaces — it takes up more volume per molecule than the disordered liquid, so density decreases.",
      html: '', css: `body{margin:0;padding:0;font-family:sans-serif}`, startCode: '',
      outputHeight: 300,
    },

    // ── Section 6 ───────────────────────────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `### Water as the Universal Solvent

Water dissolves more substances than any other common liquid. This is not because water is chemically aggressive — it is because water molecules are polar and can interact favourably with both ionic compounds and polar molecules.

**Dissolving ionic compounds.** When NaCl is placed in water, the δ− oxygen ends of water molecules are attracted to Na⁺ ions, and the δ+ hydrogen ends are attracted to Cl⁻ ions. These attractions are strong enough to pull ions out of the crystal lattice and into solution. Each ion becomes surrounded by a cage of water molecules — a process called **hydration**. The hydration energy (the energy released when water molecules surround ions) approximately compensates for the lattice energy required to break the crystal apart.

**Dissolving polar molecules.** Polar molecules like ethanol, glucose, and acetone have partial charges that interact favourably with water's partial charges. "Like dissolves like" — the polar water molecules can form favourable interactions with other polar molecules, pulling them into solution.

**The hydrophobic effect.** Nonpolar molecules (oils, fats, alkanes) cannot form hydrogen bonds with water. When a nonpolar molecule is forced into water, it disrupts the hydrogen bond network — water molecules around it lose some of their hydrogen bonding partners. This is entropically unfavourable (it creates order in the surrounding water), and the system minimises this disruption by pushing nonpolar molecules together. This is the **hydrophobic effect** — not an attraction between nonpolar molecules, but a consequence of water's preference to maintain its hydrogen bond network.

The hydrophobic effect drives the folding of proteins (nonpolar amino acid side chains cluster in the interior, away from water), the formation of cell membranes (phospholipid bilayers form spontaneously because of it), and the self-assembly of many biological structures. It is one of the most important forces in all of biology — and it arises entirely from the properties of water.`,
    },

    // ── Challenge 3 ─────────────────────────────────────────────────────────────
    {
      type: 'challenge',
      instruction: `Oil and water don't mix. The hydrophobic effect is often described as "oil being repelled by water." Which is the more accurate description of what actually happens?`,
      options: [
        { label: 'A', text: 'Oil molecules are repelled by water molecules because of charge repulsion between them' },
        { label: 'B', text: "Oil molecules cluster together not because they attract each other strongly, but because water molecules strongly prefer to hydrogen-bond with each other, effectively pushing oil out" },
        { label: 'C', text: 'Oil is less dense than water, so it always rises to the top regardless of molecular interactions' },
        { label: 'D', text: 'Water molecules form covalent bonds with each other that exclude oil molecules' },
      ],
      check: (label) => label === 'B',
      successMessage: "Correct! The hydrophobic effect is driven by water's preference for its own hydrogen bond network. Inserting a nonpolar molecule disrupts that network. The system minimises disruption by clustering nonpolar molecules together — reducing the total surface area in contact with water. It's an entropy effect driven by water, not a direct attraction between oil molecules.",
      failMessage: "There's no charge repulsion between oil and water — oil is simply nonpolar and can't participate in hydrogen bonding. The driving force is that water strongly prefers to hydrogen-bond with other water molecules. Nonpolar solutes disrupt this network, and the system minimises the disruption by aggregating nonpolar molecules together.",
      html: '', css: `body{margin:0;padding:0;font-family:sans-serif}`, startCode: '',
      outputHeight: 300,
    },

    // ── Challenge 4 ─────────────────────────────────────────────────────────────
    {
      type: 'challenge',
      instruction: `Water has a specific heat capacity of 4.18 J/g·°C — much higher than most substances. What is the molecular explanation for this?`,
      options: [
        { label: 'A', text: 'Water molecules are heavier than most molecules, so they require more energy to speed up' },
        { label: 'B', text: 'Water is a liquid, and liquids always have higher specific heat than solids or gases' },
        { label: 'C', text: 'Much of the heat added to water goes into breaking and reforming hydrogen bonds rather than increasing molecular speed (temperature), so more energy is needed per degree of warming' },
        { label: 'D', text: 'The covalent O–H bonds in water absorb heat energy before the molecules can speed up' },
      ],
      check: (label) => label === 'C',
      successMessage: "Correct! Temperature is a measure of average kinetic energy — molecular speed. When you heat water, much of the energy goes into disrupting hydrogen bonds, not speeding up molecules. Only the energy that goes into molecular kinetic energy registers as a temperature increase. Because so much energy is absorbed by the H-bond network, it takes a lot of heat to raise water's temperature.",
      failMessage: "Molecular mass alone doesn't explain specific heat — iron is much heavier than water but has a far lower specific heat. The key is the hydrogen bond network. Adding heat to water partially breaks H-bonds (absorbing energy without raising temperature) and partially speeds up molecules (raising temperature). The H-bond disruption 'soaks up' extra energy, making the apparent heat capacity high.",
      html: '', css: `body{margin:0;padding:0;font-family:sans-serif}`, startCode: '',
      outputHeight: 300,
    },

    // ── Closing ──────────────────────────────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `### Water: One Molecule, Cascading Consequences

The story of water begins with a single structural fact: oxygen has 6 valence electrons. Two go into bonds with hydrogen. Four remain as two lone pairs. The lone pairs force a bent geometry. The bent geometry prevents dipole cancellation. The large dipole enables hydrogen bonding. The hydrogen bond network raises the boiling point, increases heat capacity, reduces the density of ice, and drives the hydrophobic effect.

Every remarkable property of water — and there are many — is a consequence of that chain. One oxygen. Six valence electrons. A bent molecule. Everything follows.

Chemistry is like this. The macroscopic world of oceans, climates, organisms, and materials is built from molecular-scale decisions: how many electrons an atom has, what geometry they force, what interactions they enable. The bent shape of water is not a detail. It is one of the foundational facts of our planet.

We've now completed the bonding chapter. We've seen ionic bonds (electron transfer, crystal lattices), covalent bonds (electron sharing, molecular structures), molecular geometry (VSEPR, shapes from electron repulsion), and water (polarity and hydrogen bonding taken to their logical extreme).

In the next chapter, we'll zoom out from individual molecules and ask: what happens when you have trillions of them together? That's the world of states of matter — solids, liquids, and gases — and the intermolecular forces that determine which state a substance prefers.`,
    },

  ],
};

export default {
  id: 'chem-2-4-water',
  slug: 'water',
  chapter: 'chem.2',
  order: 4,
  title: 'Water',
  subtitle: 'The molecule that makes life possible — and why it breaks all the rules.',
  tags: ['chemistry', 'water', 'hydrogen-bonds', 'polarity', 'anomalous-properties', 'hydrophobic-effect', 'density-anomaly', 'specific-heat'],
  hook: {
    question: "Why does water boil at 100°C when it 'should' boil at −80°C — and why does this matter for life on Earth?",
    realWorldContext: "Every anomalous property of water — its high boiling point, its ability to dissolve almost anything, the fact that ice floats — traces to one structural feature: the bent geometry of H₂O and the hydrogen bond network it creates.",
    previewVisualizationId: 'ScienceNotebook',
  },
  intuition: {
    prose: [
      "Water's bent geometry (104.5°) creates a large molecular dipole moment — oxygen is δ− and each hydrogen is δ+.",
      'The dipole enables hydrogen bonds: the δ+ hydrogen of one molecule is attracted to a lone pair on the δ− oxygen of a neighbour.',
      'Each water molecule can form up to 4 hydrogen bonds (2 donor, 2 acceptor), creating a dense cooperative network.',
      'This network raises boiling point ~180°C above expectation, gives water high heat capacity, causes ice to float, and drives the hydrophobic effect.',
    ],
    callouts: [
      { type: 'important', title: 'Hydrogen bond vs. covalent bond', body: 'A hydrogen bond (O–H···O) is about 20 kJ/mol — roughly 5% the strength of a covalent O–H bond (460 kJ/mol). But each molecule forms up to 4 simultaneously, and the cooperative network makes the collective effect enormous.' },
    ],
    visualizations: [{ id: 'ScienceNotebook', title: 'Water', props: { lesson: LESSON_CHEM_2_4 } }],
  },
  math: { prose: [], callouts: [], visualizations: [] },
  rigor: { prose: [], callouts: [], visualizations: [] },
  examples: [],
  challenges: [],
  mentalModel: [
    'Water is bent (104.5°) because O has 2 lone pairs that compress the H–O–H angle from the tetrahedral ideal.',
    'Bent geometry + polar O–H bonds = large molecular dipole (1.85 D).',
    'Hydrogen bond: δ+ H attracted to lone pair of δ− O on a neighbouring molecule. ~20 kJ/mol each.',
    'Up to 4 H-bonds per molecule: 2 O–H bonds donate, 2 lone pairs accept.',
    'H-bond network raises boiling point, increases specific heat, reduces ice density (ice floats), and creates the hydrophobic effect.',
    'Hydrophobic effect: nonpolar molecules disrupt H-bond network → water pushes them together to minimise disruption.',
  ],
  checkpoints: ['read-intuition'],
  quiz: [],
};

export { LESSON_CHEM_2_4 };
