// Chemistry · Chapter 3 · Lesson 1
// Intermolecular Forces

const LESSON_CHEM_3_1 = {
  title: 'Intermolecular Forces',
  subtitle: 'The invisible attractions between molecules — and why they determine everything about bulk matter.',
  sequential: true,

  cells: [

    // ── Section 1 ───────────────────────────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `### What Holds Molecules Together — Without Bonding Them?

Covalent and ionic bonds hold atoms together within a molecule or crystal. But what holds molecules together with each other? When water forms a liquid, what keeps the H₂O molecules near each other? When iodine forms a solid, what locks the I₂ molecules into a crystal?

The answer is **intermolecular forces** — attractions between separate molecules. These are not chemical bonds. No electrons are shared or transferred. They are purely electrostatic — attractions between regions of positive and negative charge that arise from the distribution of electrons within each molecule.

Intermolecular forces are weaker than covalent or ionic bonds, usually by a factor of 10 to 100. But they are real, measurable, and enormously consequential. The melting point of a solid, the boiling point of a liquid, the viscosity of a fluid, the solubility of a solute — all of these bulk properties are determined primarily by the type and strength of intermolecular forces between the particles involved.

There are three main types, in order of increasing strength:

1. **London dispersion forces** — present between all molecules, arising from temporary fluctuations in electron distribution
2. **Dipole-dipole forces** — present between polar molecules, arising from permanent charge separation
3. **Hydrogen bonds** — a special, unusually strong case of dipole-dipole attraction involving H bonded to F, O, or N

We will examine each type in depth, understand why it arises, and learn to predict when each is present and how strong it will be.`,
    },

    // ── Section 2 ───────────────────────────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `### London Dispersion Forces: The Universal Attraction

London dispersion forces (named after physicist Fritz London, who derived them quantum mechanically in 1930) are the most fundamental intermolecular force. They exist between every molecule — polar or nonpolar, large or small. They are the only intermolecular force between nonpolar molecules like N₂, O₂, CH₄, and the noble gases.

Here is the mechanism. Electrons in a molecule are not static — they move constantly. At any instant, the electron distribution is not perfectly uniform. One side of the molecule might have slightly more electron density than the other, creating a temporary, instantaneous dipole — even in a molecule that has no permanent dipole moment.

This instantaneous dipole induces a dipole in a neighbouring molecule: the temporary negative end of the first molecule repels electrons in the neighbour, creating a complementary temporary positive end in the neighbour nearby. The two temporary dipoles are now aligned — opposite charges facing each other — and attract.

A moment later, the electrons have moved, the dipoles have shifted, but new complementary dipoles form. The attraction is constantly fluctuating in direction but is always present on average.

**What determines strength?** Two factors:

**Polarisability** — how easily the electron cloud is distorted. Larger molecules with more electrons have more polarisable electron clouds. This makes their temporary dipoles larger and their London forces stronger. This is why larger noble gases (xenon vs. helium) have much higher boiling points. It's why larger alkanes (octane vs. methane) are liquid at room temperature.

**Molecular contact area** — molecules with larger surface areas have more points of contact. Long, flat molecules have stronger London forces than compact, spherical ones of the same molecular mass. This is why n-pentane (straight chain) has a higher boiling point than neopentane (spherical) despite being the same molecular formula (C₅H₁₂).`,
    },

    // ── Visual 1 — London dispersion mechanism ─────────────────────────────────
    {
      type: 'js',
      instruction: `### London dispersion: temporary dipoles in action

The animation shows two nonpolar molecules. Watch the electron cloud (blue) shift to one side, creating a temporary dipole — and how this immediately induces a complementary dipole in the neighbour, creating a net attractive force between them. The force arrow appears when the dipoles are aligned.`,
      html: `<canvas id="cv" width="700" height="300"></canvas>`,
      css: `body{margin:0;background:#0a0f1e;display:flex;justify-content:center}
canvas{display:block;width:100%;max-width:700px}`,
      startCode: `var canvas=document.getElementById('cv');
var ctx=canvas.getContext('2d');
var W=canvas.width,H=canvas.height;
var t=0;

function drawMolecule(cx,cy,r,electronOffset,label,induced){
  // Nucleus background
  ctx.beginPath();ctx.arc(cx,cy,r,0,Math.PI*2);
  ctx.fillStyle='rgba(30,41,59,0.9)';ctx.fill();
  ctx.strokeStyle='rgba(148,163,184,0.4)';ctx.lineWidth=1.5;ctx.stroke();

  // Electron cloud — shifted
  var eox=electronOffset*r*0.55;
  var grd=ctx.createRadialGradient(cx+eox,cy,0,cx+eox,cy,r*1.1);
  grd.addColorStop(0,'rgba(56,189,248,0.55)');
  grd.addColorStop(0.5,'rgba(56,189,248,0.2)');
  grd.addColorStop(1,'rgba(56,189,248,0)');
  ctx.fillStyle=grd;
  ctx.beginPath();ctx.arc(cx+eox*0.5,cy,r*1.05,0,Math.PI*2);ctx.fill();

  // Nucleus label
  ctx.fillStyle='rgba(255,255,255,0.7)';
  ctx.font='bold 13px monospace';ctx.textAlign='center';ctx.textBaseline='middle';
  ctx.fillText(label,cx,cy);

  // Partial charge labels
  var dThresh=0.25;
  if(Math.abs(electronOffset)>dThresh){
    var negSide=electronOffset>0?1:-1;
    ctx.fillStyle='rgba(248,113,113,0.9)';ctx.font='bold 14px monospace';
    ctx.fillText('\u03b4\u2212',cx+negSide*r*0.75,cy-r*0.65);
    ctx.fillStyle='rgba(56,189,248,0.9)';
    ctx.fillText('\u03b4+',cx-negSide*r*0.75,cy-r*0.65);
  }

  // "Induced" badge
  if(induced){
    ctx.fillStyle='rgba(167,139,250,0.6)';ctx.font='9px monospace';ctx.textAlign='center';
    ctx.fillText('induced',cx,cy+r+14);
  }
}

function drawArrow(x1,y1,x2,y2,color,alpha){
  ctx.globalAlpha=alpha;
  ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);
  ctx.strokeStyle=color;ctx.lineWidth=2.5;ctx.stroke();
  var dx=x2-x1,dy=y2-y1,len=Math.sqrt(dx*dx+dy*dy);
  var nx=dx/len,ny=dy/len,hs=10;
  ctx.beginPath();
  ctx.moveTo(x2-nx*hs+ny*hs*0.5,y2-ny*hs-nx*hs*0.5);
  ctx.lineTo(x2,y2);
  ctx.lineTo(x2-nx*hs-ny*hs*0.5,y2-ny*hs+nx*hs*0.5);
  ctx.strokeStyle=color;ctx.lineWidth=2.5;ctx.stroke();
  ctx.globalAlpha=1;
}

function draw(){
  ctx.clearRect(0,0,W,H);
  ctx.fillStyle='#0a0f1e';ctx.fillRect(0,0,W,H);

  var cy=H/2;
  var m1x=200,m2x=480,r=62;
  var gap=m2x-m1x-r*2; // space between molecules

  // Phase: electron oscillation
  var phase=t*0.025;
  var e1=Math.sin(phase); // -1 to 1, left molecule electron shift
  // Induced: opposite on near side
  var e2=-Math.sin(phase)*0.75;

  drawMolecule(m1x,cy,r,e1,'Ar',false);
  drawMolecule(m2x,cy,r,e2,'Ar',true);

  // Attraction arrow when dipoles aligned (|e1|>0.3)
  var align=Math.abs(e1);
  if(align>0.15){
    var gapMid=(m1x+r+m2x-r)/2;
    // Direction: left mol δ+ end faces right mol δ- end or vice versa
    var dir=e1>0?1:-1;
    var a1x=m1x+dir*r*0.9,a2x=m2x-dir*r*0.9;
    drawArrow(a1x+dir*8,cy,a2x-dir*8,cy,'#4ade80',(align-0.15)/0.85);
    ctx.fillStyle='rgba(74,222,128,'+(align*0.8)+')';
    ctx.font='11px monospace';ctx.textAlign='center';
    ctx.fillText('attraction',gapMid,cy-r-18);
  }

  // Gap label
  ctx.fillStyle='rgba(255,255,255,0.3)';ctx.font='10px monospace';ctx.textAlign='center';
  ctx.fillText('\u2190 '+Math.round(gap)+' pm gap \u2192',(m1x+m2x)/2,cy+r+28);

  // Phase label
  var phaseLabel=Math.abs(e1)<0.15?'Electrons symmetric — no dipole':
    e1>0?'Electrons shifted right — δ\u2212 on right, δ+ on left':'Electrons shifted left — δ\u2212 on left, δ+ on right';
  ctx.fillStyle='rgba(255,255,255,0.55)';ctx.font='12px monospace';ctx.textAlign='center';
  ctx.fillText(phaseLabel,W/2,30);

  // Bottom explanation
  ctx.fillStyle='rgba(255,255,255,0.35)';ctx.font='11px monospace';ctx.textAlign='center';
  ctx.fillText('Instantaneous dipole \u2192 induces complementary dipole \u2192 temporary attraction',W/2,H-14);

  t++;requestAnimationFrame(draw);
}
draw();`,
      outputHeight: 320,
    },

    // ── Section 3 ───────────────────────────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `### London Forces and Boiling Points: The Pattern

If London dispersion forces are the only intermolecular force, then stronger London forces mean higher boiling points. And since London force strength scales with the number of electrons (polarisability) and with molecular surface area, we can make clear predictions.

**The noble gases** provide the cleanest example. They are all monatomic and perfectly nonpolar — London forces only. Their boiling points rise steadily with atomic number (and thus electron count): He (−269°C), Ne (−246°C), Ar (−186°C), Kr (−153°C), Xe (−108°C). Each step adds more electrons, more polarisability, stronger London forces, higher boiling point.

**The alkanes** (CH₄, C₂H₆, C₃H₈, ...) follow the same pattern. Methane boils at −161°C. Butane (C₄H₁₀) boils at −1°C. Octane (C₈H₁₈) boils at 126°C. Longer chains have more electrons and more surface area — stronger London forces.

**Shape matters too.** n-Pentane (straight chain, C₅H₁₂) boils at 36°C. Neopentane (same formula, spherical shape) boils at 9°C. The spherical shape reduces surface area, reducing the number of London force contacts between neighbouring molecules.

This explains something that might otherwise seem like a strange coincidence: **iodine (I₂) is a solid at room temperature, while fluorine (F₂) is a gas.** Both are nonpolar diatomic halogens with no dipole. But iodine has 106 electrons; fluorine has only 18. Iodine's much larger electron cloud produces far stronger London forces — strong enough to keep I₂ molecules locked in a solid at room temperature.`,
    },

    // ── Visual 2 — IMF strength comparison ─────────────────────────────────────
    {
      type: 'js',
      instruction: `### Comparing intermolecular forces across molecules

The chart below plots boiling points for a range of molecules, coloured by their dominant intermolecular force. Hover over any bar to see the molecule and its forces. Notice how hydrogen bonding lifts water and ammonia far above what their molecular masses would predict.`,
      html: `<canvas id="cv" width="700" height="320"></canvas>`,
      css: `body{margin:0;background:#0a0f1e;display:flex;justify-content:center;cursor:default}
canvas{display:block;width:100%;max-width:700px}`,
      startCode: `var canvas=document.getElementById('cv');
var ctx=canvas.getContext('2d');
var W=canvas.width,H=canvas.height;

var molecules=[
  {name:'He',  bp:-269,mass:4,  force:'London',      color:'#94a3b8'},
  {name:'Ne',  bp:-246,mass:20, force:'London',       color:'#94a3b8'},
  {name:'Ar',  bp:-186,mass:40, force:'London',       color:'#94a3b8'},
  {name:'F₂',  bp:-188,mass:38, force:'London',       color:'#94a3b8'},
  {name:'CH₄', bp:-161,mass:16, force:'London',       color:'#94a3b8'},
  {name:'Xe',  bp:-108,mass:131,force:'London',       color:'#94a3b8'},
  {name:'Cl₂', bp:-34, mass:71, force:'London',       color:'#94a3b8'},
  {name:'HCl', bp:-85, mass:36, force:'Dipole-dipole',color:'#38bdf8'},
  {name:'HBr', bp:-67, mass:81, force:'Dipole-dipole',color:'#38bdf8'},
  {name:'HI',  bp:-35, mass:128,force:'Dipole-dipole',color:'#38bdf8'},
  {name:'SO₂', bp:-10, mass:64, force:'Dipole-dipole',color:'#38bdf8'},
  {name:'I₂',  bp:184, mass:254,force:'London',       color:'#94a3b8'},
  {name:'NH₃', bp:-33, mass:17, force:'H-bond',       color:'#4ade80'},
  {name:'HF',  bp:20,  mass:20, force:'H-bond',       color:'#4ade80'},
  {name:'H₂O', bp:100, mass:18, force:'H-bond',       color:'#f87171'},
  {name:'C₂H₅OH',bp:78,mass:46,force:'H-bond',       color:'#4ade80'},
];

// Sort by boiling point
molecules.sort(function(a,b){return a.bp-b.bp;});

var chartX=50,chartY=20,chartW=W-80,chartH=240;
var minBP=-290,maxBP=200;
var barW=chartW/molecules.length;

ctx.fillStyle='#0a0f1e';ctx.fillRect(0,0,W,H);

// Zero line
var zeroY=chartY+chartH*(1-(0-minBP)/(maxBP-minBP));
ctx.strokeStyle='rgba(255,255,255,0.2)';ctx.lineWidth=1;
ctx.beginPath();ctx.moveTo(chartX,zeroY);ctx.lineTo(chartX+chartW,zeroY);ctx.stroke();
ctx.fillStyle='rgba(255,255,255,0.35)';ctx.font='10px monospace';ctx.textAlign='right';
ctx.fillText('0°C',chartX-4,zeroY+4);

// Y axis labels
[-250,-200,-150,-100,-50,0,50,100,150,200].forEach(function(bp){
  var y=chartY+chartH*(1-(bp-minBP)/(maxBP-minBP));
  ctx.beginPath();ctx.moveTo(chartX-4,y);ctx.lineTo(chartX,y);
  ctx.strokeStyle='rgba(255,255,255,0.2)';ctx.stroke();
  if(bp%100===0){
    ctx.fillStyle='rgba(255,255,255,0.35)';ctx.font='10px monospace';ctx.textAlign='right';
    ctx.fillText(bp+'°',chartX-6,y+4);
  }
});

// Bars
molecules.forEach(function(mol,i){
  var barX=chartX+i*barW+barW*0.1;
  var bw=barW*0.8;
  var topY=chartY+chartH*(1-(mol.bp-minBP)/(maxBP-minBP));
  var barH=Math.abs(topY-zeroY);
  var startY=mol.bp>=0?topY:zeroY;

  // Bar
  ctx.fillStyle=mol.color+'cc';
  ctx.fillRect(barX,startY,bw,mol.bp>=0?barH:-barH);
  ctx.strokeStyle=mol.color;ctx.lineWidth=1;
  ctx.strokeRect(barX,startY,bw,mol.bp>=0?barH:-barH);

  // Name label
  ctx.fillStyle='rgba(255,255,255,0.7)';ctx.font='9px monospace';ctx.textAlign='center';
  ctx.save();ctx.translate(barX+bw/2,chartY+chartH+14);ctx.rotate(-Math.PI/3);
  ctx.fillText(mol.name,0,0);ctx.restore();
});

// Legend
var legendItems=[
  {color:'#94a3b8',label:'London only'},
  {color:'#38bdf8',label:'Dipole-dipole (+London)'},
  {color:'#4ade80',label:'Hydrogen bond'},
  {color:'#f87171',label:'Hydrogen bond (H₂O)'},
];
legendItems.forEach(function(item,i){
  var lx=chartX+i*175,ly=H-14;
  ctx.fillStyle=item.color;ctx.beginPath();ctx.arc(lx+6,ly-4,5,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='rgba(255,255,255,0.6)';ctx.font='10px monospace';ctx.textAlign='left';
  ctx.fillText(item.label,lx+14,ly);
});

// Title
ctx.fillStyle='rgba(255,255,255,0.6)';ctx.font='bold 12px monospace';ctx.textAlign='center';
ctx.fillText('Boiling points by dominant intermolecular force',W/2,chartY-6);`,
      outputHeight: 340,
    },

    // ── Challenge 1 ─────────────────────────────────────────────────────────────
    {
      type: 'challenge',
      instruction: `Iodine (I₂) is a solid at room temperature, but fluorine (F₂) is a gas. Both are nonpolar diatomic molecules with no dipole moment. What explains the dramatic difference in their physical states?`,
      options: [
        { label: 'A', text: 'Fluorine has ionic bonds; iodine has covalent bonds' },
        { label: 'B', text: 'Iodine has a much larger electron cloud (more electrons, more polarisable), producing far stronger London dispersion forces that keep it solid at room temperature' },
        { label: 'C', text: 'Iodine is more electronegative, creating stronger dipole-dipole forces' },
        { label: 'D', text: 'Fluorine forms hydrogen bonds with moisture in the air, making it a gas' },
      ],
      check: (label) => label === 'B',
      successMessage: "Correct! F₂ has 18 electrons; I₂ has 106. The much larger, more polarisable electron cloud in I₂ creates far stronger London dispersion forces. These forces are strong enough to keep I₂ molecules locked in a solid at 25°C. I₂ doesn't melt until 114°C — all from London forces alone.",
      failMessage: "Both F₂ and I₂ are covalent and nonpolar — no ionic bonds, no dipole, no hydrogen bonding possible. The only intermolecular force between them is London dispersion. The difference is electron count: I₂ has 106 electrons vs. F₂'s 18, giving I₂ a much more polarisable electron cloud and much stronger London forces.",
      html: '', css: `body{margin:0;padding:0;font-family:sans-serif}`, startCode: '',
      outputHeight: 300,
    },

    // ── Section 4 ───────────────────────────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `### Dipole-Dipole Forces: Permanent Attractions

Polar molecules have a permanent dipole moment — one end is permanently δ+ and the other is permanently δ−. When polar molecules are near each other, they orient themselves so that opposite partial charges face each other: the δ+ end of one molecule aligns with the δ− end of a neighbour.

This is a **dipole-dipole force** — an electrostatic attraction between permanent dipoles. It is stronger than London forces for molecules of similar size, because it is based on permanent charge separation rather than temporary fluctuations.

The strength of dipole-dipole forces depends on two things:
- **The magnitude of the dipole moment** — larger partial charges and greater charge separation mean stronger forces.
- **Temperature** — at higher temperatures, thermal motion disrupts the alignment of dipoles, reducing the effectiveness of the attraction. Dipole-dipole forces decrease with temperature more rapidly than London forces.

It is important to note that **polar molecules have both dipole-dipole forces and London forces**. The London forces are always present. Dipole-dipole is an additional contribution. When comparing polar vs. nonpolar molecules of similar size, the polar one has a higher boiling point — the extra dipole-dipole attraction adds to the baseline London forces.

A good example: HCl (polar, dipole-dipole + London) vs. Ar (nonpolar, London only). Both have molecular mass around 36–40 u. HCl boils at −85°C; Ar boils at −186°C. The extra dipole-dipole attraction in HCl raises its boiling point by about 100°C relative to what London forces alone would give.`,
    },

    // ── Visual 3 — Dipole alignment interactive ─────────────────────────────────
    {
      type: 'js',
      instruction: `### Dipole-dipole alignment and hydrogen bonding

The simulation below shows polar molecules orienting themselves in solution. The left panel shows generic dipole-dipole alignment. The right panel shows hydrogen bonding in water — a special, directional, stronger version. Toggle between them with the buttons.`,
      html: `<div style="padding:10px 14px 0 14px;background:#0a0f1e;display:flex;gap:8px">
  <button id="btn-dd" style="padding:6px 14px;border-radius:8px;border:1.5px solid #38bdf8;background:rgba(56,189,248,0.2);color:#38bdf8;font-family:monospace;font-size:12px;font-weight:700;cursor:pointer">Dipole-Dipole (HCl)</button>
  <button id="btn-hb" style="padding:6px 14px;border-radius:8px;border:1.5px solid rgba(255,255,255,0.2);background:transparent;color:rgba(255,255,255,0.4);font-family:monospace;font-size:12px;font-weight:700;cursor:pointer">Hydrogen Bonds (H₂O)</button>
</div>
<canvas id="cv" width="700" height="310"></canvas>`,
      css: `body{margin:0;background:#0a0f1e;font-family:monospace}
canvas{display:block;width:100%;max-width:700px}`,
      startCode: `var canvas=document.getElementById('cv');
var ctx=canvas.getContext('2d');
var W=canvas.width,H=canvas.height;
var t=0;
var mode='dd'; // 'dd' or 'hb'

document.getElementById('btn-dd').onclick=function(){
  mode='dd';
  this.style.borderColor='#38bdf8';this.style.background='rgba(56,189,248,0.2)';this.style.color='#38bdf8';
  var hb=document.getElementById('btn-hb');
  hb.style.borderColor='rgba(255,255,255,0.2)';hb.style.background='transparent';hb.style.color='rgba(255,255,255,0.4)';
};
document.getElementById('btn-hb').onclick=function(){
  mode='hb';
  this.style.borderColor='#4ade80';this.style.background='rgba(74,222,128,0.2)';this.style.color='#4ade80';
  var dd=document.getElementById('btn-dd');
  dd.style.borderColor='rgba(255,255,255,0.2)';dd.style.background='transparent';dd.style.color='rgba(255,255,255,0.4)';
};

// HCl molecules — arrange in pairs
var hclMols=[
  {x:120,y:80, angle:0},
  {x:240,y:80, angle:Math.PI},
  {x:120,y:170,angle:0},
  {x:240,y:170,angle:Math.PI},
  {x:120,y:260,angle:0},
  {x:240,y:260,angle:Math.PI},
  {x:380,y:80, angle:0},
  {x:500,y:80, angle:Math.PI},
  {x:380,y:170,angle:0},
  {x:500,y:170,angle:Math.PI},
  {x:380,y:260,angle:0},
  {x:500,y:260,angle:Math.PI},
];

// Water molecules grid
var waterMols=[];
var wRows=4,wCols=5;
for(var row=0;row<wRows;row++){
  for(var col=0;col<wCols;col++){
    waterMols.push({
      x:80+col*118,y:65+row*58,
      angle:(row+col)%2===0?Math.PI*0.5:Math.PI*1.5,
      wobble:Math.random()*Math.PI*2
    });
  }
}

function drawHCl(x,y,angle,highlight){
  var len=32;
  var clx=x+Math.cos(angle)*len,cly=y+Math.sin(angle)*len;
  var hx=x-Math.cos(angle)*len,hy=y-Math.sin(angle)*len;

  ctx.beginPath();ctx.moveTo(hx,hy);ctx.lineTo(clx,cly);
  ctx.strokeStyle='rgba(56,189,248,0.6)';ctx.lineWidth=2;ctx.stroke();

  // Cl (δ-)
  ctx.beginPath();ctx.arc(clx,cly,12,0,Math.PI*2);
  ctx.fillStyle='#1e293b';ctx.fill();ctx.strokeStyle='#4ade80';ctx.lineWidth=1.5;ctx.stroke();
  ctx.fillStyle='#4ade80';ctx.font='bold 9px monospace';ctx.textAlign='center';ctx.textBaseline='middle';
  ctx.fillText('Cl',clx,cly);
  ctx.fillStyle='rgba(248,113,113,0.8)';ctx.font='9px monospace';
  ctx.fillText('\u03b4\u2212',clx+16*Math.cos(angle),cly+16*Math.sin(angle));

  // H (δ+)
  ctx.beginPath();ctx.arc(hx,hy,8,0,Math.PI*2);
  ctx.fillStyle='#1e293b';ctx.fill();ctx.strokeStyle='#e2e8f0';ctx.lineWidth=1.5;ctx.stroke();
  ctx.fillStyle='#e2e8f0';ctx.font='bold 8px monospace';
  ctx.fillText('H',hx,hy);
  ctx.fillStyle='rgba(56,189,248,0.8)';ctx.font='9px monospace';
  ctx.fillText('\u03b4+',hx-16*Math.cos(angle),hy-16*Math.sin(angle));
}

function drawWater(x,y,angle){
  var ba=52.25*(Math.PI/180),bl=20;
  var baseA=angle+Math.PI/2;
  var h1x=x+Math.cos(baseA-ba)*bl,h1y=y+Math.sin(baseA-ba)*bl;
  var h2x=x+Math.cos(baseA+ba)*bl,h2y=y+Math.sin(baseA+ba)*bl;

  ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(h1x,h1y);
  ctx.strokeStyle='rgba(248,113,113,0.7)';ctx.lineWidth=2;ctx.stroke();
  ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(h2x,h2y);
  ctx.strokeStyle='rgba(248,113,113,0.7)';ctx.lineWidth=2;ctx.stroke();

  ctx.beginPath();ctx.arc(x,y,10,0,Math.PI*2);
  ctx.fillStyle='#1e293b';ctx.fill();ctx.strokeStyle='#f87171';ctx.lineWidth=1.5;ctx.stroke();
  ctx.fillStyle='#f87171';ctx.font='bold 8px monospace';ctx.textAlign='center';ctx.textBaseline='middle';
  ctx.fillText('O',x,y);

  [[h1x,h1y],[h2x,h2y]].forEach(function(h){
    ctx.beginPath();ctx.arc(h[0],h[1],6,0,Math.PI*2);
    ctx.fillStyle='#1e293b';ctx.fill();ctx.strokeStyle='#94a3b8';ctx.lineWidth=1;ctx.stroke();
    ctx.fillStyle='#94a3b8';ctx.font='bold 7px monospace';ctx.fillText('H',h[0],h[1]);
  });
  return{h1:{x:h1x,y:h1y},h2:{x:h2x,y:h2y}};
}

function draw(){
  ctx.clearRect(0,0,W,H);
  ctx.fillStyle='#0a0f1e';ctx.fillRect(0,0,W,H);

  if(mode==='dd'){
    // Draw dipole-dipole interactions
    // Draw attraction dashes between aligned pairs
    for(var i=0;i<hclMols.length;i+=2){
      var a=hclMols[i],b=hclMols[i+1];
      // Cl end of a, H end of b
      var clax=a.x+Math.cos(a.angle)*32,clay=a.y+Math.sin(a.angle)*32;
      var hbx=b.x-Math.cos(b.angle)*32,hby=b.y-Math.sin(b.angle)*32;
      var opac=0.4+0.2*Math.sin(t*0.05+i);
      ctx.beginPath();ctx.moveTo(clax,clay);ctx.lineTo(hbx,hby);
      ctx.strokeStyle='rgba(56,189,248,'+opac+')';ctx.lineWidth=1.5;ctx.setLineDash([4,3]);ctx.stroke();ctx.setLineDash([]);
    }
    hclMols.forEach(function(m){drawHCl(m.x,m.y,m.angle,false);});

    ctx.fillStyle='rgba(255,255,255,0.6)';ctx.font='bold 12px monospace';ctx.textAlign='center';
    ctx.fillText('Dipole-dipole forces in HCl',W/2,H-26);
    ctx.fillStyle='rgba(255,255,255,0.35)';ctx.font='11px monospace';
    ctx.fillText('\u03b4\u2212 end of one molecule attracted to \u03b4+ end of neighbour',W/2,H-10);

    // Force comparison box
    ctx.fillStyle='rgba(56,189,248,0.1)';ctx.fillRect(W-155,8,148,50);
    ctx.strokeStyle='rgba(56,189,248,0.3)';ctx.lineWidth=1;ctx.strokeRect(W-155,8,148,50);
    ctx.fillStyle='rgba(255,255,255,0.6)';ctx.font='bold 11px monospace';ctx.textAlign='center';
    ctx.fillText('HCl boiling point',W-81,24);
    ctx.fillStyle='#38bdf8';ctx.font='bold 14px monospace';
    ctx.fillText('\u221285\u00b0C',W-81,42);
    ctx.fillStyle='rgba(255,255,255,0.35)';ctx.font='10px monospace';
    ctx.fillText('(vs Ar: \u2212186\u00b0C)',W-81,56);

  } else {
    // Draw water molecules with hydrogen bonds
    var hpositions=waterMols.map(function(m){
      return drawWater(m.x,m.y,m.angle+Math.sin(t*0.01+m.wobble)*0.05);
    });

    // Draw H-bonds between nearby H and O
    waterMols.forEach(function(m,i){
      var hp=hpositions[i];
      [hp.h1,hp.h2].forEach(function(h){
        waterMols.forEach(function(m2,j){
          if(i===j)return;
          var dx=h.x-m2.x,dy=h.y-m2.y;
          var dist=Math.sqrt(dx*dx+dy*dy);
          if(dist<45&&dist>15){
            var opac=(1-dist/45)*0.7*(0.6+0.4*Math.sin(t*0.04+i*1.3));
            ctx.beginPath();ctx.moveTo(h.x,h.y);ctx.lineTo(m2.x,m2.y);
            ctx.strokeStyle='rgba(74,222,128,'+opac+')';
            ctx.lineWidth=1.5;ctx.setLineDash([4,3]);ctx.stroke();ctx.setLineDash([]);
          }
        });
      });
    });

    ctx.fillStyle='rgba(255,255,255,0.6)';ctx.font='bold 12px monospace';ctx.textAlign='center';
    ctx.fillText('Hydrogen bonds in H₂O',W/2,H-26);
    ctx.fillStyle='rgba(255,255,255,0.35)';ctx.font='11px monospace';
    ctx.fillText('\u03b4+ H donates to lone pair on \u03b4\u2212 O — directional, strong',W/2,H-10);

    ctx.fillStyle='rgba(74,222,128,0.1)';ctx.fillRect(W-155,8,148,50);
    ctx.strokeStyle='rgba(74,222,128,0.3)';ctx.lineWidth=1;ctx.strokeRect(W-155,8,148,50);
    ctx.fillStyle='rgba(255,255,255,0.6)';ctx.font='bold 11px monospace';ctx.textAlign='center';
    ctx.fillText('H₂O boiling point',W-81,24);
    ctx.fillStyle='#4ade80';ctx.font='bold 14px monospace';
    ctx.fillText('+100\u00b0C',W-81,42);
    ctx.fillStyle='rgba(255,255,255,0.35)';ctx.font='10px monospace';
    ctx.fillText('(expected: \u221280\u00b0C)',W-81,56);
  }

  t++;requestAnimationFrame(draw);
}
draw();`,
      outputHeight: 370,
    },

    // ── Section 5 ───────────────────────────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `### Hydrogen Bonds: The Special Case

A hydrogen bond is a particularly strong dipole-dipole attraction that forms specifically when a hydrogen atom bonded to **fluorine, oxygen, or nitrogen** is attracted to a lone pair on another **fluorine, oxygen, or nitrogen** atom.

The notation is: X–H···Y, where X is F, O, or N (the donor atom, bonded to H), the dashes represent the covalent bond, the dots represent the hydrogen bond, and Y is the F, O, or N with the lone pair (the acceptor).

Why are hydrogen bonds so much stronger than ordinary dipole-dipole forces? Two reasons:

**Extreme electronegativity difference.** F, O, and N are the three most electronegative elements. When hydrogen bonds to any of them, the electron density is pulled so strongly toward the electronegative atom that the hydrogen is nearly a bare proton — a single positive charge with almost no electron shielding. This creates an intense, localised δ+.

**Small size of hydrogen.** Because hydrogen has no inner electrons, the δ+ charge is concentrated in a tiny volume. This allows the hydrogen to approach the lone pair on the acceptor atom very closely — much closer than two larger atoms could get — dramatically increasing the electrostatic attraction.

The result: hydrogen bonds are about 5–10 times stronger than typical London or dipole-dipole forces between similar-sized molecules. Not as strong as covalent bonds (which are still 10–20 times stronger), but far above ordinary IMFs.

Hydrogen bonds are responsible for: water's anomalous boiling point, the secondary structure of proteins (α-helices and β-sheets held together by backbone N–H···O=C hydrogen bonds), the base pairing in DNA (A–T: 2 hydrogen bonds; G–C: 3 hydrogen bonds), the high boiling point of alcohols, and the structure of cellulose.`,
    },

    // ── Challenge 2 ─────────────────────────────────────────────────────────────
    {
      type: 'challenge',
      instruction: `Three molecules have similar molecular masses: H₂S (mass 34), HCl (mass 36), and H₂O (mass 18, but included for comparison). Their boiling points are −60°C, −85°C, and +100°C respectively. Which correctly explains why H₂O has by far the highest boiling point despite being the lightest?`,
      options: [
        { label: 'A', text: 'Water has the highest molecular mass of the three, giving it stronger London forces' },
        { label: 'B', text: 'Water has two O–H bonds — each H can hydrogen-bond — and two lone pairs on O — each can accept hydrogen bonds. Four hydrogen bonds per molecule create a far stronger network than the dipole-dipole forces in H₂S or HCl' },
        { label: 'C', text: 'Oxygen is more electronegative than sulfur or chlorine, making the O–H bond covalent and therefore stronger' },
        { label: 'D', text: 'Water molecules are larger than HCl molecules, increasing surface area and London force strength' },
      ],
      check: (label) => label === 'B',
      successMessage: "Correct! H₂S has dipole-dipole forces and London forces, but S is not electronegative enough for true hydrogen bonding. HCl has dipole-dipole forces. Water has hydrogen bonds — one from each O–H bond (donor) and one to each lone pair on O (acceptor) = up to 4 per molecule. Each H-bond is ~20 kJ/mol; the cooperative network of 4 raises water's boiling point dramatically.",
      failMessage: "Water is actually the lightest of the three. The key is hydrogen bonding. H₂S and HCl have dipole-dipole forces, but only F, O, and N form true hydrogen bonds. Water's oxygen is electronegative enough, and its hydrogen small enough, to form strong H-bonds — up to 4 per molecule. This cooperative network requires much more energy to break than the weaker forces in H₂S or HCl.",
      html: '', css: `body{margin:0;padding:0;font-family:sans-serif}`, startCode: '',
      outputHeight: 300,
    },

    // ── Section 6 ───────────────────────────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `### Putting It Together: Predicting Boiling Points

Given a molecule, you can now predict its boiling point — at least qualitatively — by working through a checklist:

**Step 1: Are there hydrogen bonds?**
Does the molecule contain O–H, N–H, or F–H bonds? If yes, hydrogen bonding is the dominant force. Expect a relatively high boiling point for the molecular mass.
Examples: H₂O (100°C), NH₃ (−33°C), HF (20°C), ethanol (78°C), acetic acid (118°C).

**Step 2: Is the molecule polar?**
Does the molecule have a net dipole moment? (Polar bonds + geometry that doesn't cancel.) If yes and no H-bonds, dipole-dipole forces are present in addition to London forces.
Examples: HCl (−85°C), SO₂ (−10°C), acetone (56°C), CHCl₃ (61°C).

**Step 3: London forces only?**
Nonpolar molecules (or noble gases) have only London forces. Compare them by size (electron count, molecular mass) and shape (surface area).
Examples: CH₄ (−161°C), Cl₂ (−34°C), I₂ (184°C), hexane (69°C).

**Step 4: Compare similar molecules.**
When comparing molecules of the same type, larger molecular mass / more electrons / larger surface area = stronger London forces = higher boiling point. Straight chains > branched chains (more surface area).

This framework correctly predicts the boiling point order for almost any set of molecules. The one systematic surprise is always hydrogen bonding — it lifts boiling points far above what size alone would predict.

A final note: all three forces are always evaluated together. A polar molecule has both dipole-dipole forces AND London forces. A hydrogen-bonding molecule also has London forces. The observed boiling point reflects the combined strength of all intermolecular forces present.`,
    },

    // ── Visual 4 — IMF decision tree ────────────────────────────────────────────
    {
      type: 'js',
      instruction: `### Identifying the dominant IMF: a decision flowchart

Follow the flowchart for any molecule to identify its dominant intermolecular force. The path you take tells you both the force type and what to expect for boiling point.`,
      html: `<canvas id="cv" width="700" height="340"></canvas>`,
      css: `body{margin:0;background:#0a0f1e;display:flex;justify-content:center}
canvas{display:block;width:100%;max-width:700px}`,
      startCode: `var canvas=document.getElementById('cv');
var ctx=canvas.getContext('2d');
var W=canvas.width,H=canvas.height;

ctx.fillStyle='#0a0f1e';ctx.fillRect(0,0,W,H);

function box(x,y,w,h,color,text,subtext){
  ctx.fillStyle=color+'22';
  ctx.beginPath();ctx.roundRect(x-w/2,y-h/2,w,h,8);ctx.fill();
  ctx.strokeStyle=color;ctx.lineWidth=1.5;
  ctx.beginPath();ctx.roundRect(x-w/2,y-h/2,w,h,8);ctx.stroke();
  ctx.fillStyle=color;ctx.font='bold 12px monospace';ctx.textAlign='center';ctx.textBaseline='middle';
  ctx.fillText(text,x,subtext?y-7:y);
  if(subtext){ctx.fillStyle=color+'aa';ctx.font='10px monospace';ctx.fillText(subtext,x,y+9);}
}

function arrow(x1,y1,x2,y2,label,labelSide){
  ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);
  ctx.strokeStyle='rgba(255,255,255,0.3)';ctx.lineWidth=1.5;ctx.stroke();
  var dx=x2-x1,dy=y2-y1,len=Math.sqrt(dx*dx+dy*dy);
  var nx=dx/len,ny=dy/len,hs=8;
  ctx.beginPath();
  ctx.moveTo(x2-nx*hs+ny*hs*0.5,y2-ny*hs-nx*hs*0.5);
  ctx.lineTo(x2,y2);
  ctx.lineTo(x2-nx*hs-ny*hs*0.5,y2-ny*hs+nx*hs*0.5);
  ctx.strokeStyle='rgba(255,255,255,0.3)';ctx.stroke();
  if(label){
    var mx=(x1+x2)/2+(labelSide||0)*18;
    var my=(y1+y2)/2;
    ctx.fillStyle='rgba(255,255,255,0.55)';ctx.font='bold 10px monospace';ctx.textAlign='center';
    ctx.fillText(label,mx,my);
  }
}

// Nodes
var startX=W/2,startY=38;
var q1X=W/2,q1Y=100;
var q2X=W/2,q2Y=185;
var hbX=160,hbY=272;
var ddX=W/2,ddY=272;
var ldX=560,ldY=272;

box(startX,startY,180,34,'#a78bfa','Start: any molecule','');
arrow(startX,startY+17,q1X,q1Y-26,'');
box(q1X,q1Y,280,38,'#facc15','Contains O–H, N–H, or F–H bonds?','');
arrow(q1X-140,q1Y,hbX,hbY-28,'YES',-1);
arrow(q1X,q1Y+19,q2X,q2Y-26,'NO');
box(q2X,q2Y,260,38,'#facc15','Molecule is polar?','(net dipole moment ≠ 0)');
arrow(q2X-130,q2Y,ddX-80,ddY-28,'YES',-1);
arrow(q2X+130,q2Y,ldX-80,ldY-28,'NO',1);

box(hbX,hbY,160,52,'#4ade80','Hydrogen Bond','dominant IMF');
box(ddX,ddY,180,52,'#38bdf8','Dipole-Dipole','(+ London forces)');
box(ldX,ldY,170,52,'#94a3b8','London Dispersion','only IMF');

// Strength indicators
ctx.fillStyle='#4ade80';ctx.font='10px monospace';ctx.textAlign='center';
ctx.fillText('Strongest / highest BP',hbX,hbY+36);
ctx.fillStyle='#38bdf8';
ctx.fillText('Intermediate BP',ddX,ddY+36);
ctx.fillStyle='#94a3b8';
ctx.fillText('Lowest BP (size-dependent)',ldX,ldY+36);

// Examples under each leaf
var exY=H-18;
ctx.fillStyle='rgba(74,222,128,0.6)';ctx.font='10px monospace';ctx.textAlign='center';
ctx.fillText('H₂O, HF, NH₃, ethanol',hbX,exY);
ctx.fillStyle='rgba(56,189,248,0.6)';
ctx.fillText('HCl, SO₂, acetone',ddX,exY);
ctx.fillStyle='rgba(148,163,184,0.6)';
ctx.fillText('CH₄, Ar, I₂, hexane',ldX,exY);`,
      outputHeight: 360,
    },

    // ── Challenge 3 ─────────────────────────────────────────────────────────────
    {
      type: 'challenge',
      instruction: `Arrange these three molecules in order of increasing boiling point: propane (C₃H₈, nonpolar), dimethyl ether (CH₃OCH₃, polar, no O–H bond), and propan-1-ol (CH₃CH₂CH₂OH, has O–H bond). All have similar molecular masses (~44–60 u).`,
      options: [
        { label: 'A', text: 'Propane < dimethyl ether < propan-1-ol' },
        { label: 'B', text: 'Dimethyl ether < propane < propan-1-ol' },
        { label: 'C', text: 'Propane < propan-1-ol < dimethyl ether' },
        { label: 'D', text: 'All three have the same boiling point — same molecular mass' },
      ],
      check: (label) => label === 'A',
      successMessage: "Correct! Propane (nonpolar) has only London forces — lowest boiling point (−42°C). Dimethyl ether is polar (has dipole-dipole + London) but no O–H bond for hydrogen bonding — intermediate (−24°C). Propan-1-ol has an O–H bond and can hydrogen bond — highest boiling point (97°C). IMF type matters far more than molecular mass.",
      failMessage: "Work through the IMF checklist. Propane: nonpolar → London only → lowest. Dimethyl ether: polar (dipole through C–O–C) but no O–H or N–H → dipole-dipole + London → middle. Propan-1-ol: has O–H → hydrogen bonding → highest. Actual boiling points: −42°C, −24°C, 97°C.",
      html: '', css: `body{margin:0;padding:0;font-family:sans-serif}`, startCode: '',
      outputHeight: 300,
    },

    // ── Challenge 4 ─────────────────────────────────────────────────────────────
    {
      type: 'challenge',
      instruction: `DNA uses hydrogen bonds between base pairs to hold the two strands of the double helix together. A–T base pairs have 2 hydrogen bonds; G–C base pairs have 3. What does this tell you about the stability of DNA regions rich in G–C pairs compared to A–T-rich regions?`,
      options: [
        { label: 'A', text: 'G–C-rich regions are less stable — more hydrogen bonds means more strain on the molecule' },
        { label: 'B', text: 'G–C-rich regions are more stable and require more energy (higher temperature) to separate the strands, because 3 hydrogen bonds per pair are stronger than 2' },
        { label: 'C', text: 'Stability is the same — hydrogen bond strength doesn\'t depend on the number of bonds' },
        { label: 'D', text: 'A–T regions are more stable because adenine and thymine are heavier than guanine and cytosine' },
      ],
      check: (label) => label === 'B',
      successMessage: "Correct! Each additional hydrogen bond adds ~20 kJ/mol of stabilisation energy. G–C pairs with 3 H-bonds are stronger than A–T pairs with 2. DNA regions rich in G–C require higher temperatures to denature (separate strands). This is measurable — the melting temperature (Tm) of DNA increases linearly with G–C content. PCR primer design takes this into account.",
      failMessage: "Each hydrogen bond adds stabilisation energy. G–C pairs have 3 H-bonds; A–T pairs have 2. More hydrogen bonds = more energy required to separate. G–C-rich DNA regions are more thermally stable — they require higher temperatures to melt. This is directly used in biology: scientists measure Tm to infer G–C content.",
      html: '', css: `body{margin:0;padding:0;font-family:sans-serif}`, startCode: '',
      outputHeight: 300,
    },

    // ── Closing ──────────────────────────────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `### Intermolecular Forces: The Hidden Architects of Matter

Intermolecular forces are invisible — you can't see them directly. But they are responsible for almost every physical property of matter that we encounter in daily life.

The fact that water is a liquid at room temperature (hydrogen bonds). The fact that octane is also a liquid (strong London forces from a large molecule). The fact that oxygen is a gas (weak London forces from a tiny molecule). The fact that DNA holds its information stably at body temperature but can be unzipped precisely at slightly higher temperatures (tuned hydrogen bond networks). The fact that soap cleans grease from water (amphiphilic molecules disrupting the hydrophobic effect). The fact that geckos can walk on ceilings (London dispersion forces between millions of microscopic hairs and the surface).

The hierarchy is consistent:
- **London dispersion**: universal, scales with electron count and surface area, weakest for small nonpolar molecules
- **Dipole-dipole**: present in polar molecules, stronger than London alone
- **Hydrogen bonds**: present when H is on F, O, or N — by far the strongest IMF, responsible for the most dramatic departures from size-based predictions

In the next lesson, we'll apply these forces to solutions — asking why some things dissolve and others don't, and what "like dissolves like" really means at the molecular level.`,
    },

  ],
};

export default {
  id: 'chem-3-1-intermolecular-forces',
  slug: 'intermolecular-forces',
  chapter: 'chem.3',
  order: 1,
  title: 'Intermolecular Forces',
  subtitle: 'The invisible attractions between molecules — and why they determine everything about bulk matter.',
  tags: ['chemistry', 'intermolecular-forces', 'London-dispersion', 'dipole-dipole', 'hydrogen-bonds', 'boiling-point', 'polarisability', 'IMF'],
  hook: {
    question: 'Why does water boil at 100°C when methane boils at −161°C — even though both are small molecules? And why can a gecko walk on a ceiling?',
    realWorldContext: 'The physical properties of every substance — melting point, boiling point, viscosity, solubility — are determined by the intermolecular forces between its molecules. Understanding these three forces gives you a predictive framework for the physical world.',
    previewVisualizationId: 'ScienceNotebook',
  },
  intuition: {
    prose: [
      'London dispersion forces: temporary dipoles in all molecules. Stronger with more electrons (polarisability) and more surface area.',
      'Dipole-dipole forces: permanent attraction between polar molecules. Adds to London forces.',
      'Hydrogen bonds: O–H, N–H, or F–H pointing at a lone pair on F, O, or N. 5–10× stronger than typical IMFs.',
      'Hierarchy: H-bond > dipole-dipole > London. But all are always present together.',
      'Higher IMF strength → higher boiling point, higher melting point, higher viscosity.',
    ],
    callouts: [
      { type: 'important', title: 'The checklist', body: '1. O–H, N–H, or F–H present? → Hydrogen bond dominant. 2. Polar molecule? → Dipole-dipole + London. 3. Nonpolar? → London only. Then compare size and shape for relative strength within a type.' },
    ],
    visualizations: [{ id: 'ScienceNotebook', title: 'Intermolecular Forces', props: { lesson: LESSON_CHEM_3_1 } }],
  },
  math: { prose: [], callouts: [], visualizations: [] },
  rigor: { prose: [], callouts: [], visualizations: [] },
  examples: [],
  challenges: [],
  mentalModel: [
    'London dispersion: instantaneous dipole → induced dipole → temporary attraction. Present in ALL molecules. Strength ∝ electron count × surface area.',
    'Dipole-dipole: permanent δ+/δ− alignment between polar molecules. Present when net dipole ≠ 0.',
    'Hydrogen bond: H on F/O/N attracted to lone pair on F/O/N. ~20 kJ/mol each. Up to 4 per water molecule.',
    'Predict boiling point: H-bond > dipole-dipole > London. Within a type: larger/longer molecule = stronger London = higher BP.',
    'All three forces coexist — polar molecules have both dipole-dipole AND London forces.',
    'Applications: DNA base pairing, protein folding, water anomalies, gecko adhesion, soap action.',
  ],
  checkpoints: ['read-intuition'],
  quiz: [],
};

export { LESSON_CHEM_3_1 };
