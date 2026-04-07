// Chemistry · Chapter 2 · Lesson 3
// Molecular Geometry — VSEPR Theory

const LESSON_CHEM_2_3 = {
  title: 'Molecular Geometry',
  subtitle: 'Why molecules have shapes — and why shape determines everything.',
  sequential: true,

  cells: [

    // ── Section 1 ───────────────────────────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `### Why Does Shape Matter?

You might assume that once you know which atoms are bonded together, you know everything important about a molecule. But two molecules can have the exact same atoms bonded in the exact same order and still behave completely differently — because their three-dimensional shapes are different.

Water (H₂O) is bent. If it were linear, like CO₂, it would be nonpolar and have a boiling point around −80°C. Life as we know it would be impossible. The bend is not a quirk — it is a precise geometric consequence of the electrons around the oxygen atom, and it is responsible for every unusual property of water: its high boiling point, its surface tension, its ability to dissolve almost anything.

Carbon dioxide (CO₂) is linear. Methane (CH₄) is a perfect tetrahedron. Ammonia (NH₃) is a trigonal pyramid. Each shape is not arbitrary — each is the inevitable result of one principle: **electron pairs repel each other and spread as far apart as possible.**

This is **VSEPR theory** — Valence Shell Electron Pair Repulsion. It was developed by Ronald Gillespie and Ronald Nyholm in the 1950s, and it lets you predict the three-dimensional shape of almost any molecule from nothing more than its Lewis structure. It is one of the most useful predictive tools in all of chemistry.`,
    },

    // ── Section 2 ───────────────────────────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `### The Core Idea: Electrons Repel

The logic of VSEPR starts with a simple physical fact: electrons are all negatively charged, so regions of electron density repel each other. The electron pairs around a central atom — whether they are bonding pairs (shared with another atom) or lone pairs (unshared) — will arrange themselves to be as far apart from each other as possible.

The number of **electron groups** around the central atom determines the **electron geometry**. An electron group is any region of electron density: a single bond counts as one group, a double bond counts as one group (the extra electrons are still in the same region of space), a triple bond counts as one group, and a lone pair counts as one group.

Once you know how many electron groups there are, geometry follows automatically:

- **2 groups**: spread 180° apart → **linear**
- **3 groups**: spread 120° apart in a plane → **trigonal planar**
- **4 groups**: spread to the corners of a tetrahedron → **tetrahedral** (109.5°)
- **5 groups**: trigonal bipyramidal (90° and 120°)
- **6 groups**: octahedral (90°)

But here is the critical subtlety: the **molecular geometry** — the shape you see when you look only at where the atoms are — depends on how many of those electron groups are lone pairs versus bonding pairs. Lone pairs are invisible in the molecular shape, but they take up space and push bonding pairs closer together.

This is why water is bent, not linear: oxygen has 4 electron groups (2 bonds + 2 lone pairs), giving a tetrahedral electron geometry — but two of those groups are lone pairs, so the molecular shape, defined only by the atoms, is bent.`,
    },

    // ── Visual 1 — Electron group geometry table ──────────────────────────────
    {
      type: 'js',
      instruction: `### Electron geometry from electron group count

The canvas below shows how 2 through 6 electron groups arrange themselves in three-dimensional space. These are the base geometries — actual molecular shapes are derived from these by replacing some bonding groups with lone pairs.`,
      html: `<canvas id="cv" width="700" height="340"></canvas>`,
      css: `body{margin:0;background:#0a0f1e;display:flex;justify-content:center}
canvas{display:block;width:100%;max-width:700px}`,
      startCode: `var canvas=document.getElementById('cv');
var ctx=canvas.getContext('2d');
var W=canvas.width,H=canvas.height;

ctx.fillStyle='#0a0f1e';
ctx.fillRect(0,0,W,H);

var geometries=[
  {n:2,name:'Linear',angle:'180°',color:'#38bdf8',
   points:[{x:-1,y:0},{x:1,y:0}]},
  {n:3,name:'Trigonal\\nPlanar',angle:'120°',color:'#4ade80',
   points:[{x:0,y:-1},{x:0.866,y:0.5},{x:-0.866,y:0.5}]},
  {n:4,name:'Tetrahedral',angle:'109.5°',color:'#a78bfa',
   points:[{x:0,y:-1},{x:0.943,y:0.333},{x:-0.471,y:0.333},{x:-0.471,y:0.333}]},
  {n:5,name:'Trigonal\\nBipyramidal',angle:'90°/120°',color:'#fb923c',
   points:[{x:0,y:-1},{x:0.866,y:0},{x:-0.866,y:0},{x:0,y:1},{x:0,y:0}]},
  {n:6,name:'Octahedral',angle:'90°',color:'#f87171',
   points:[{x:0,y:-1},{x:1,y:0},{x:0,y:1},{x:-1,y:0},{x:0.5,y:-0.5},{x:-0.5,y:0.5}]},
];

// Draw each as a 2D schematic in its column
var colW=W/5;
geometries.forEach(function(geo,i){
  var cx=colW*i+colW/2;
  var cy=160;
  var r=54;

  // Column label at top
  ctx.fillStyle=geo.color;
  ctx.font='bold 13px monospace';
  ctx.textAlign='center';
  ctx.fillText(geo.n+' groups',cx,28);

  // Draw simplified 2D arrangement
  var pts=[];
  if(geo.n===2){
    pts=[{x:cx-r,y:cy},{x:cx+r,y:cy}];
  } else if(geo.n===3){
    for(var k=0;k<3;k++){
      var a=k*(Math.PI*2/3)-Math.PI/2;
      pts.push({x:cx+Math.cos(a)*r,y:cy+Math.sin(a)*r});
    }
  } else if(geo.n===4){
    // Tetrahedral shown as 2D: top, bottom-left, bottom-right + dashed back
    pts=[
      {x:cx,y:cy-r},
      {x:cx-r*0.85,y:cy+r*0.5},
      {x:cx+r*0.85,y:cy+r*0.5},
      {x:cx,y:cy+r*0.15,dash:true}
    ];
  } else if(geo.n===5){
    pts=[
      {x:cx,y:cy-r},
      {x:cx,y:cy+r},
      {x:cx-r,y:cy},
      {x:cx+r,y:cy},
      {x:cx-r*0.4,y:cy-r*0.4,dash:true}
    ];
  } else if(geo.n===6){
    pts=[
      {x:cx,y:cy-r},{x:cx+r,y:cy},{x:cx,y:cy+r},{x:cx-r,y:cy},
      {x:cx-r*0.38,y:cy-r*0.38,dash:true},{x:cx+r*0.38,y:cy+r*0.38,dash:true}
    ];
  }

  // Central atom
  ctx.beginPath();ctx.arc(cx,cy,10,0,Math.PI*2);
  ctx.fillStyle=geo.color+'44';ctx.fill();
  ctx.strokeStyle=geo.color;ctx.lineWidth=2;ctx.stroke();
  ctx.fillStyle=geo.color;ctx.font='bold 9px monospace';
  ctx.textAlign='center';ctx.textBaseline='middle';
  ctx.fillText('A',cx,cy);

  // Bonds and outer atoms
  pts.forEach(function(pt){
    ctx.beginPath();ctx.moveTo(cx,cy);ctx.lineTo(pt.x,pt.y);
    ctx.strokeStyle=pt.dash?geo.color+'55':geo.color+'88';
    ctx.lineWidth=1.5;
    ctx.setLineDash(pt.dash?[4,3]:[]);
    ctx.stroke();ctx.setLineDash([]);
    ctx.beginPath();ctx.arc(pt.x,pt.y,8,0,Math.PI*2);
    ctx.fillStyle=pt.dash?'#1e293b':'#1e293b';ctx.fill();
    ctx.strokeStyle=pt.dash?geo.color+'44':geo.color+'cc';
    ctx.lineWidth=1.5;ctx.stroke();
  });

  // Name
  var lines=geo.name.split('\\n');
  ctx.fillStyle='rgba(255,255,255,0.85)';
  ctx.font='bold 12px monospace';ctx.textAlign='center';
  lines.forEach(function(l,li){ctx.fillText(l,cx,cy+r+22+li*16);});

  // Angle
  ctx.fillStyle=geo.color+'cc';
  ctx.font='11px monospace';
  ctx.fillText(geo.angle,cx,cy+r+22+lines.length*16+4);
});

// Bottom label
ctx.fillStyle='rgba(255,255,255,0.35)';
ctx.font='11px monospace';ctx.textAlign='center';
ctx.fillText('Electron group geometries — all bonding pairs shown; lone pairs would occupy the same positions',W/2,H-12);`,
      outputHeight: 360,
    },

    // ── Section 3 ───────────────────────────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `### Lone Pairs Change the Shape

Here is the insight that makes VSEPR powerful: **lone pairs are fatter than bonding pairs.**

A bonding pair is shared between two nuclei — both nuclei pull the electron density toward themselves, compressing the electron cloud into a narrow region between the atoms. A lone pair, by contrast, belongs entirely to one atom. It spreads out more, occupying more angular space around the central atom.

This means lone pairs repel their neighbours more strongly than bonding pairs do. The result: lone pairs compress the bond angles between the bonding pairs.

The effect is consistent and measurable. In methane (CH₄), four identical bonding pairs sit at perfect tetrahedral angles of 109.5°. In ammonia (NH₃), one lone pair replaces one bonding pair — the lone pair pushes the three N–H bonds closer together, reducing the bond angle to 107°. In water (H₂O), two lone pairs replace two bonding pairs — the two lone pairs push the two O–H bonds even closer together, reducing the bond angle to 104.5°.

The sequence methane → ammonia → water shows the lone pair compression effect perfectly:

| Molecule | Bonding pairs | Lone pairs | Bond angle | Shape |
|----------|--------------|------------|------------|-------|
| CH₄ | 4 | 0 | 109.5° | Tetrahedral |
| NH₃ | 3 | 1 | 107° | Trigonal pyramidal |
| H₂O | 2 | 2 | 104.5° | Bent |

All three have 4 electron groups. All three have tetrahedral **electron geometry**. But their **molecular geometries** differ because of how many lone pairs are present. This distinction — between electron geometry and molecular geometry — is the heart of VSEPR.`,
    },

    // ── Visual 2 — Interactive VSEPR explorer ──────────────────────────────────
    {
      type: 'js',
      instruction: `### Explore molecular geometry interactively

Click any molecule to see its 3D shape, bond angles, electron groups, and lone pair positions. Notice how the same electron geometry (tetrahedral for the bottom row) gives different molecular shapes depending on the number of lone pairs.`,
      html: `<div style="padding:0">
  <div id="mol-tabs" style="display:flex;gap:8px;padding:14px 14px 0 14px;flex-wrap:wrap;background:#0a0f1e"></div>
  <canvas id="cv" width="700" height="360"></canvas>
</div>`,
      css: `body{margin:0;background:#0a0f1e;font-family:monospace}
canvas{display:block;width:100%;max-width:700px}`,
      startCode: `var canvas=document.getElementById('cv');
var ctx=canvas.getContext('2d');
var W=canvas.width,H=canvas.height;
var t=0;

var molecules=[
  {
    name:'BeCl₂',formula:'Cl–Be–Cl',color:'#38bdf8',
    shape:'Linear',elGeom:'Linear',
    bondAngle:'180°',bondPairs:2,lonePairs:0,
    desc:'2 bonding pairs, 0 lone pairs. Electron pairs maximise separation at 180°. Be has only 4 electrons — an exception to the octet rule.',
    atoms:[
      {sym:'Cl',angle:180,r:110,lp:0},
      {sym:'Be',angle:0,r:0,lp:0,center:true},
      {sym:'Cl',angle:0,r:110,lp:0}
    ]
  },
  {
    name:'BF₃',formula:'Trigonal planar',color:'#4ade80',
    shape:'Trigonal Planar',elGeom:'Trigonal Planar',
    bondAngle:'120°',bondPairs:3,lonePairs:0,
    desc:'3 bonding pairs, 0 lone pairs. All three F atoms spread into a flat triangle around B. Bond angles are exactly 120°.',
    atoms:[
      {sym:'F',angle:-90,r:110,lp:0},
      {sym:'F',angle:30,r:110,lp:0},
      {sym:'F',angle:150,r:110,lp:0},
      {sym:'B',angle:0,r:0,lp:0,center:true}
    ]
  },
  {
    name:'CH₄',formula:'Methane',color:'#a78bfa',
    shape:'Tetrahedral',elGeom:'Tetrahedral',
    bondAngle:'109.5°',bondPairs:4,lonePairs:0,
    desc:'4 bonding pairs, 0 lone pairs. Perfect tetrahedral geometry. This is the baseline — no lone pairs to compress the bond angles.',
    atoms:[
      {sym:'H',angle:-90,r:100,lp:0},
      {sym:'H',angle:30,r:100,lp:0},
      {sym:'H',angle:150,r:100,lp:0},
      {sym:'H',angle:270,r:70,lp:0,dash:true},
      {sym:'C',angle:0,r:0,lp:0,center:true}
    ]
  },
  {
    name:'NH₃',formula:'Ammonia',color:'#fb923c',
    shape:'Trigonal Pyramidal',elGeom:'Tetrahedral',
    bondAngle:'107°',bondPairs:3,lonePairs:1,
    desc:'3 bonding pairs, 1 lone pair. Electron geometry is tetrahedral, but one position is occupied by a lone pair. The lone pair pushes the N–H bonds closer → 107° (down from 109.5°).',
    atoms:[
      {sym:'H',angle:-100,r:100,lp:0},
      {sym:'H',angle:20,r:100,lp:0},
      {sym:'H',angle:140,r:100,lp:0},
      {sym:'N',angle:0,r:0,lp:1,center:true}
    ]
  },
  {
    name:'H₂O',formula:'Water',color:'#f87171',
    shape:'Bent',elGeom:'Tetrahedral',
    bondAngle:'104.5°',bondPairs:2,lonePairs:2,
    desc:'2 bonding pairs, 2 lone pairs. Two lone pairs compress the H–O–H bond angle to 104.5°. The bent shape gives water a large dipole moment — the reason for all its unusual properties.',
    atoms:[
      {sym:'H',angle:-128,r:95,lp:0},
      {sym:'H',angle:-52,r:95,lp:0},
      {sym:'O',angle:0,r:0,lp:2,center:true}
    ]
  },
  {
    name:'CO₂',formula:'O=C=O',color:'#34d399',
    shape:'Linear',elGeom:'Linear',
    bondAngle:'180°',bondPairs:2,lonePairs:0,
    desc:'2 electron groups (each C=O double bond counts as one group). Despite 16 valence electrons, the two double bonds repel each other to opposite sides → perfectly linear. CO₂ has no dipole moment.',
    atoms:[
      {sym:'O',angle:180,r:110,lp:2},
      {sym:'C',angle:0,r:0,lp:0,center:true},
      {sym:'O',angle:0,r:110,lp:2}
    ]
  },
];

var selected=0;
var tabEls=[];
var tabContainer=document.getElementById('mol-tabs');
molecules.forEach(function(mol,i){
  var btn=document.createElement('button');
  btn.textContent=mol.name;
  btn.style.cssText='padding:6px 12px;border-radius:8px;border:1.5px solid;font-family:monospace;font-size:12px;font-weight:600;cursor:pointer;transition:all .15s;background:transparent;color:rgba(255,255,255,0.4);border-color:rgba(255,255,255,0.15)';
  btn.onclick=function(){
    selected=i;
    tabEls.forEach(function(b,j){
      b.style.color=j===selected?molecules[j].color:'rgba(255,255,255,0.4)';
      b.style.background=j===selected?molecules[j].color+'22':'transparent';
      b.style.borderColor=j===selected?molecules[j].color+'cc':'rgba(255,255,255,0.15)';
    });
  };
  tabContainer.appendChild(btn);
  tabEls.push(btn);
});
// Set initial active
tabEls[0].style.color=molecules[0].color;
tabEls[0].style.background=molecules[0].color+'22';
tabEls[0].style.borderColor=molecules[0].color+'cc';

function drawLonePairCloud(cx,cy,angle,color){
  var lx=cx+Math.cos(angle)*52;
  var ly=cy+Math.sin(angle)*52;
  var grd=ctx.createRadialGradient(lx,ly,0,lx,ly,28);
  grd.addColorStop(0,color+'66');
  grd.addColorStop(1,'rgba(0,0,0,0)');
  ctx.fillStyle=grd;
  ctx.beginPath();ctx.arc(lx,ly,28,0,Math.PI*2);ctx.fill();
  // Two dots
  var perp=angle+Math.PI/2;
  [1,-1].forEach(function(s){
    ctx.beginPath();
    ctx.arc(lx+Math.cos(perp)*7*s,ly+Math.sin(perp)*7*s,4,0,Math.PI*2);
    ctx.fillStyle=color+'cc';ctx.fill();
  });
  ctx.fillStyle=color+'88';ctx.font='9px monospace';ctx.textAlign='center';ctx.textBaseline='middle';
  ctx.fillText('lp',lx,ly+20);
}

function draw(){
  ctx.clearRect(0,0,W,H);
  ctx.fillStyle='#0a0f1e';ctx.fillRect(0,0,W,H);

  var mol=molecules[selected];
  var color=mol.color;
  var cx=W*0.36,cy=H/2-10;
  var degToRad=Math.PI/180;

  // Draw bonds and atoms
  mol.atoms.forEach(function(atom){
    if(atom.center)return;
    var ax=cx+Math.cos(atom.angle*degToRad)*atom.r;
    var ay=cy+Math.sin(atom.angle*degToRad)*atom.r;

    // Bond line
    ctx.beginPath();ctx.moveTo(cx,cy);ctx.lineTo(ax,ay);
    ctx.strokeStyle=atom.dash?color+'44':color+'88';
    ctx.lineWidth=atom.dash?1.5:2.5;
    ctx.setLineDash(atom.dash?[5,4]:[]);
    ctx.stroke();ctx.setLineDash([]);

    // Outer atom
    ctx.beginPath();ctx.arc(ax,ay,18,0,Math.PI*2);
    ctx.fillStyle='#0f172a';ctx.fill();
    ctx.strokeStyle=color;ctx.lineWidth=2;ctx.stroke();
    ctx.fillStyle=color;ctx.font='bold 12px monospace';
    ctx.textAlign='center';ctx.textBaseline='middle';
    ctx.fillText(atom.sym,ax,ay);
  });

  // Lone pairs on center atom
  var centerAtom=mol.atoms.filter(function(a){return a.center;})[0];
  if(centerAtom&&centerAtom.lp>0){
    var bondAngles=mol.atoms.filter(function(a){return !a.center;}).map(function(a){return a.angle*degToRad;});
    // Place lone pairs opposite to bond centroid
    var lpAngles=[];
    if(centerAtom.lp===1){
      // One lone pair: find the gap
      lpAngles=[bondAngles.reduce(function(s,a){return s+a;},0)/bondAngles.length+Math.PI];
    } else if(centerAtom.lp===2){
      var avg=bondAngles.reduce(function(s,a){return s+a;},0)/bondAngles.length;
      lpAngles=[avg+Math.PI-0.3,avg+Math.PI+0.3];
    }
    lpAngles.forEach(function(a){drawLonePairCloud(cx,cy,a,color);});
  }

  // Outer lone pairs (e.g. Cl, O in CO2)
  mol.atoms.forEach(function(atom){
    if(atom.center||!atom.lp)return;
    var ax=cx+Math.cos(atom.angle*degToRad)*atom.r;
    var ay=cy+Math.sin(atom.angle*degToRad)*atom.r;
    var outAngle=atom.angle*degToRad;
    drawLonePairCloud(ax,ay,outAngle,color);
  });

  // Central atom (drawn on top)
  ctx.beginPath();ctx.arc(cx,cy,20,0,Math.PI*2);
  ctx.fillStyle='#0f172a';ctx.fill();
  ctx.strokeStyle=color;ctx.lineWidth=2.5;ctx.stroke();
  var centerSym=centerAtom?centerAtom.sym:'?';
  // Derive center symbol from molecule
  var syms={'BeCl₂':'Be','BF₃':'B','CH₄':'C','NH₃':'N','H₂O':'O','CO₂':'C'};
  ctx.fillStyle=color;ctx.font='bold 13px monospace';
  ctx.textAlign='center';ctx.textBaseline='middle';
  ctx.fillText(syms[mol.name]||'?',cx,cy);

  // Right panel: info
  var rx=W*0.62;
  ctx.fillStyle=color;ctx.font='bold 18px monospace';ctx.textAlign='left';
  ctx.fillText(mol.name,rx,52);

  ctx.fillStyle='rgba(255,255,255,0.85)';ctx.font='bold 14px monospace';
  ctx.fillText('Molecular shape: '+mol.shape,rx,80);
  ctx.fillStyle='rgba(255,255,255,0.5)';ctx.font='12px monospace';
  ctx.fillText('Electron geometry: '+mol.elGeom,rx,98);
  ctx.fillText('Bond angle: '+mol.bondAngle,rx,116);

  // Electron group breakdown
  ctx.fillStyle='rgba(255,255,255,0.4)';ctx.font='11px monospace';
  ctx.fillText('Bonding pairs: '+mol.bondPairs+'   Lone pairs: '+mol.lonePairs,rx,136);

  // Description — word wrap
  var words=mol.desc.split(' ');
  var lines=[],line='';
  var maxW=240;
  words.forEach(function(w){
    var test=line+w+' ';
    ctx.font='12px monospace';
    if(ctx.measureText(test).width>maxW&&line!==''){lines.push(line.trim());line='';}
    line+=w+' ';
  });
  if(line.trim())lines.push(line.trim());
  ctx.fillStyle='rgba(255,255,255,0.65)';ctx.font='12px monospace';
  lines.forEach(function(l,li){ctx.fillText(l,rx,164+li*17);});

  // Lone pair repulsion note
  if(mol.lonePairs>0){
    var noteY=164+lines.length*17+14;
    ctx.fillStyle=color+'cc';ctx.font='bold 11px monospace';
    ctx.fillText('\u25b2 Lone pairs compress bond angles',rx,noteY);
  }

  // Animated rotation hint at bottom
  ctx.fillStyle='rgba(255,255,255,0.25)';ctx.font='11px monospace';ctx.textAlign='center';
  ctx.fillText('Select a molecule above to explore its geometry',W/2,H-14);

  t++;
  requestAnimationFrame(draw);
}
draw();`,
      outputHeight: 420,
    },

    // ── Challenge 1 ─────────────────────────────────────────────────────────────
    {
      type: 'challenge',
      instruction: `Ammonia (NH₃) and methane (CH₄) both have 4 electron groups around the central atom. Methane has bond angles of 109.5°. Ammonia's bond angles are 107°. Why are ammonia's angles smaller?`,
      options: [
        { label: 'A', text: 'Nitrogen is larger than carbon, so the bonds are pushed further apart' },
        { label: 'B', text: "Ammonia's lone pair repels the bonding pairs more strongly than a bonding pair would, compressing the H–N–H angles" },
        { label: 'C', text: "Ammonia has fewer hydrogen atoms, which makes the molecule smaller overall" },
        { label: 'D', text: 'The N–H bond is longer than the C–H bond, which reduces the angle' },
      ],
      check: (label) => label === 'B',
      successMessage: "Correct! Lone pairs are not shared between two nuclei, so they spread out more and repel neighbouring bonding pairs more strongly. This lone-pair compression reduces the H–N–H angle from the ideal 109.5° to 107°.",
      failMessage: "The key is the nature of lone pairs. A lone pair belongs entirely to nitrogen — it isn't pulled toward a second nucleus the way a bonding pair is. This makes it fatter and more repulsive, pushing the N–H bonds closer together.",
      html: '', css: `body{margin:0;padding:0;font-family:sans-serif}`, startCode: '',
      outputHeight: 300,
    },

    // ── Section 4 ───────────────────────────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `### How to Predict Molecular Geometry: The Method

VSEPR gives you a clear, repeatable procedure for predicting the shape of any molecule.

**Step 1: Draw the Lewis structure.** Identify the central atom and count all valence electrons.

**Step 2: Count electron groups around the central atom.** Remember: single bond = 1 group, double bond = 1 group, triple bond = 1 group, lone pair = 1 group. The number of electrons in a group doesn't change how many groups there are.

**Step 3: Determine the electron geometry** from the group count (2 = linear, 3 = trigonal planar, 4 = tetrahedral, 5 = trigonal bipyramidal, 6 = octahedral).

**Step 4: Identify lone pairs** on the central atom. These are groups that don't have an atom attached.

**Step 5: Determine molecular geometry** by looking only at where the atoms (not lone pairs) are located.

Let's work through sulfur dioxide (SO₂) as an example:
- S has 6 valence electrons, each O has 6. Total: 18.
- Lewis structure: S is central, double-bonded to one O (=O) and single-bonded to the other with a formal negative charge. S also has one lone pair.
- Electron groups around S: 3 (one double bond, one single bond, one lone pair).
- Electron geometry: trigonal planar.
- One lone pair → molecular geometry: **bent** (like water, but from a trigonal planar base).
- Predicted bond angle: slightly less than 120° (lone pair compression). Actual: 119°.

With practice, this procedure becomes fast and automatic.`,
    },

    // ── Visual 3 — 3D rotating molecules ──────────────────────────────────────
    {
      type: 'js',
      instruction: `### Four key molecular shapes in 3D

These four molecules represent the most important geometries you will encounter. The wireframe display shows the 3D structure rotating — pay attention to which bonds are in the plane of the screen, which come toward you, and which go away from you. Chemists use wedge-dash notation to show this on paper.`,
      html: `<canvas id="cv" width="700" height="360"></canvas>`,
      css: `body{margin:0;background:#0a0f1e;display:flex;justify-content:center}
canvas{display:block;width:100%;max-width:700px}`,
      startCode: `var canvas=document.getElementById('cv');
var ctx=canvas.getContext('2d');
var W=canvas.width,H=canvas.height;
var t=0;

function project(x,y,z,cx,cy,scale,rotY,rotX){
  var cosY=Math.cos(rotY),sinY=Math.sin(rotY);
  var rx=x*cosY-z*sinY,rz=x*sinY+z*cosY;
  var cosX=Math.cos(rotX),sinX=Math.sin(rotX);
  var ry2=y*cosX-rz*sinX,rz2=y*sinX+rz*cosX;
  var fov=3.5,perspective=fov/(fov+rz2);
  return{x:cx+rx*scale*perspective,y:cy+ry2*scale*perspective,z:rz2};
}

var mols=[
  {
    name:'CH₄ — Tetrahedral',color:'#a78bfa',angle:'109.5°',
    center:{sym:'C'},
    outer:[
      {sym:'H',pos:{x:0,y:1,z:0},color:'#e2e8f0'},
      {sym:'H',pos:{x:0.943,y:-0.333,z:0},color:'#e2e8f0'},
      {sym:'H',pos:{x:-0.471,y:-0.333,z:0.816},color:'#e2e8f0'},
      {sym:'H',pos:{x:-0.471,y:-0.333,z:-0.816},color:'#e2e8f0'}
    ]
  },
  {
    name:'NH₃ — Trigonal Pyramidal',color:'#fb923c',angle:'107°',
    center:{sym:'N'},
    outer:[
      {sym:'H',pos:{x:0,y:0.5,z:-0.9},color:'#e2e8f0'},
      {sym:'H',pos:{x:0.78,y:0.5,z:0.45},color:'#e2e8f0'},
      {sym:'H',pos:{x:-0.78,y:0.5,z:0.45},color:'#e2e8f0'}
    ],
    lp:{pos:{x:0,y:-1,z:0}}
  },
  {
    name:'H₂O — Bent',color:'#f87171',angle:'104.5°',
    center:{sym:'O'},
    outer:[
      {sym:'H',pos:{x:-0.8,y:0.6,z:0},color:'#e2e8f0'},
      {sym:'H',pos:{x:0.8,y:0.6,z:0},color:'#e2e8f0'}
    ],
    lp2:[{pos:{x:-0.4,y:-0.9,z:0.3}},{pos:{x:0.4,y:-0.9,z:0.3}}]
  },
  {
    name:'CO₂ — Linear',color:'#34d399',angle:'180°',
    center:{sym:'C'},
    outer:[
      {sym:'O',pos:{x:-1.2,y:0,z:0},color:'#f87171'},
      {sym:'O',pos:{x:1.2,y:0,z:0},color:'#f87171'}
    ],
    double:true
  }
];

var colW=W/4;

function draw(){
  ctx.clearRect(0,0,W,H);
  ctx.fillStyle='#0a0f1e';ctx.fillRect(0,0,W,H);

  mols.forEach(function(mol,mi){
    var cx=colW*mi+colW/2;
    var cy=H/2;
    var scale=62;
    var rotY=t*0.012+mi*0.7;
    var rotX=0.25;

    // Center atom projected
    var cp=project(0,0,0,cx,cy,scale,rotY,rotX);

    // Sort outer atoms by depth for correct overlap
    var projected=mol.outer.map(function(atom){
      var p=project(atom.pos.x,atom.pos.y,atom.pos.z,cx,cy,scale,rotY,rotX);
      return{sym:atom.sym,color:atom.color||mol.color,px:p.x,py:p.y,depth:p.z};
    });
    projected.sort(function(a,b){return a.depth-b.depth;});

    // Draw bonds
    mol.outer.forEach(function(atom){
      var p=project(atom.pos.x,atom.pos.y,atom.pos.z,cx,cy,scale,rotY,rotX);
      ctx.beginPath();ctx.moveTo(cp.x,cp.y);ctx.lineTo(p.x,p.y);
      ctx.strokeStyle=mol.color+'77';ctx.lineWidth=mol.double?3:2;ctx.stroke();
      if(mol.double){
        // Offset second bond
        var dx=p.x-cp.x,dy=p.y-cp.y;
        var len=Math.sqrt(dx*dx+dy*dy);
        var ox=-dy/len*4,oy=dx/len*4;
        ctx.beginPath();ctx.moveTo(cp.x+ox,cp.y+oy);ctx.lineTo(p.x+ox,p.y+oy);
        ctx.strokeStyle=mol.color+'44';ctx.lineWidth=1.5;ctx.stroke();
      }
    });

    // Lone pair visualization
    if(mol.lp){
      var lpp=project(mol.lp.pos.x,mol.lp.pos.y,mol.lp.pos.z,cx,cy,scale,rotY,rotX);
      var grd=ctx.createRadialGradient(lpp.x,lpp.y,0,lpp.x,lpp.y,20);
      grd.addColorStop(0,mol.color+'55');grd.addColorStop(1,'rgba(0,0,0,0)');
      ctx.fillStyle=grd;ctx.beginPath();ctx.arc(lpp.x,lpp.y,20,0,Math.PI*2);ctx.fill();
    }
    if(mol.lp2){
      mol.lp2.forEach(function(lp){
        var lpp=project(lp.pos.x,lp.pos.y,lp.pos.z,cx,cy,scale,rotY,rotX);
        var grd=ctx.createRadialGradient(lpp.x,lpp.y,0,lpp.x,lpp.y,16);
        grd.addColorStop(0,mol.color+'44');grd.addColorStop(1,'rgba(0,0,0,0)');
        ctx.fillStyle=grd;ctx.beginPath();ctx.arc(lpp.x,lpp.y,16,0,Math.PI*2);ctx.fill();
      });
    }

    // Draw atoms by depth
    projected.forEach(function(atom){
      ctx.beginPath();ctx.arc(atom.px,atom.py,11,0,Math.PI*2);
      ctx.fillStyle='#0f172a';ctx.fill();
      ctx.strokeStyle=atom.color;ctx.lineWidth=1.5;ctx.stroke();
      ctx.fillStyle=atom.color;ctx.font='bold 9px monospace';
      ctx.textAlign='center';ctx.textBaseline='middle';
      ctx.fillText(atom.sym,atom.px,atom.py);
    });

    // Center atom on top
    ctx.beginPath();ctx.arc(cp.x,cp.y,14,0,Math.PI*2);
    ctx.fillStyle='#0f172a';ctx.fill();
    ctx.strokeStyle=mol.color;ctx.lineWidth=2;ctx.stroke();
    ctx.fillStyle=mol.color;ctx.font='bold 11px monospace';
    ctx.textAlign='center';ctx.textBaseline='middle';
    ctx.fillText(mol.center.sym,cp.x,cp.y);

    // Labels
    ctx.fillStyle=mol.color;ctx.font='bold 11px monospace';ctx.textAlign='center';
    var nameParts=mol.name.split(' \u2014 ');
    ctx.fillText(nameParts[0],cx,cy+90);
    ctx.fillStyle='rgba(255,255,255,0.6)';ctx.font='11px monospace';
    ctx.fillText(nameParts[1],cx,cy+105);
    ctx.fillStyle=mol.color+'cc';ctx.font='bold 12px monospace';
    ctx.fillText(mol.angle,cx,cy+122);
  });

  ctx.fillStyle='rgba(255,255,255,0.25)';ctx.font='11px monospace';ctx.textAlign='center';
  ctx.fillText('Molecules rotate in real time \u2014 clouds show lone pair positions',W/2,H-12);

  t++;
  requestAnimationFrame(draw);
}
draw();`,
      outputHeight: 380,
    },

    // ── Challenge 2 ─────────────────────────────────────────────────────────────
    {
      type: 'challenge',
      instruction: `Carbon dioxide (CO₂) and water (H₂O) both contain one central atom bonded to two other atoms. CO₂ is linear; H₂O is bent. What is the key structural difference that explains this?`,
      options: [
        { label: 'A', text: 'CO₂ has double bonds and H₂O has single bonds, and double bonds always produce linear molecules' },
        { label: 'B', text: "The central oxygen in water has 2 lone pairs that push the O–H bonds together; carbon in CO₂ has no lone pairs" },
        { label: 'C', text: 'CO₂ molecules are larger, which forces them to be linear' },
        { label: 'D', text: 'Water has 3 atoms and CO₂ has 3 atoms, so they should have the same shape' },
      ],
      check: (label) => label === 'B',
      successMessage: "Correct! Carbon in CO₂ has 2 electron groups (both bonding) and no lone pairs → linear. Oxygen in H₂O has 4 electron groups (2 bonding + 2 lone pairs) → tetrahedral electron geometry, but the lone pairs compress the molecular shape to bent. The lone pairs are the deciding factor.",
      failMessage: "Double bonds don't automatically mean linear. The key is lone pairs. Carbon in CO₂ has no lone pairs — its 2 electron groups spread to 180°. Oxygen in H₂O has 2 lone pairs in addition to its 2 bonds. Those lone pairs take up space and push the H–O–H angle down to 104.5°.",
      html: '', css: `body{margin:0;padding:0;font-family:sans-serif}`, startCode: '',
      outputHeight: 300,
    },

    // ── Section 5 ───────────────────────────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `### Shape and Polarity: Why Geometry Determines Behaviour

Knowing a molecule's shape unlocks something crucial: whether the molecule is polar overall, even if its individual bonds are polar.

A bond can be polar (unequal electron sharing) without the *molecule* being polar. This happens when the bond dipoles cancel each other out because of the molecule's geometry.

**Carbon dioxide (CO₂)** is the perfect example. Each C=O bond is polar — oxygen is more electronegative than carbon, so each bond has a dipole moment pointing from C toward O. But CO₂ is linear. The two dipoles point in exactly opposite directions, so they cancel perfectly. The molecule has zero net dipole moment. CO₂ is nonpolar overall, despite having polar bonds.

**Water (H₂O)** is the counterexample. Each O–H bond is polar, with the dipole pointing from H toward O. But water is bent, not linear. The two dipoles point in similar directions (both toward the oxygen corner), and they add together rather than cancelling. Water has a large net dipole moment. This polarity is responsible for hydrogen bonding, water's high boiling point, and its role as the universal solvent.

The rule: **a molecule is nonpolar if either (a) all its bonds are nonpolar, or (b) the molecule's geometry causes all bond dipoles to cancel.**

This is why shape is not just an aesthetic detail — it determines polarity, polarity determines intermolecular forces, and intermolecular forces determine melting point, boiling point, solubility, and biological function. The bent shape of water is ultimately why life exists in liquid form.`,
    },

    // ── Visual 4 — Dipole cancellation ────────────────────────────────────────
    {
      type: 'js',
      instruction: `### Dipole cancellation: CO₂ vs H₂O

The arrows below represent bond dipoles (pointing toward the more electronegative atom). Watch what happens when you compare the linear geometry of CO₂ (dipoles cancel → nonpolar) with the bent geometry of H₂O (dipoles add → polar).`,
      html: `<canvas id="cv" width="700" height="300"></canvas>`,
      css: `body{margin:0;background:#0a0f1e;display:flex;justify-content:center}
canvas{display:block;width:100%;max-width:700px}`,
      startCode: `var canvas=document.getElementById('cv');
var ctx=canvas.getContext('2d');
var W=canvas.width,H=canvas.height;
var t=0;

function drawArrow(x1,y1,x2,y2,color,width){
  var dx=x2-x1,dy=y2-y1;
  var len=Math.sqrt(dx*dx+dy*dy);
  var nx=dx/len,ny=dy/len;
  ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);
  ctx.strokeStyle=color;ctx.lineWidth=width||2;ctx.stroke();
  // Arrowhead
  var hs=10;
  ctx.beginPath();
  ctx.moveTo(x2-nx*hs+ny*hs*0.5,y2-ny*hs-nx*hs*0.5);
  ctx.lineTo(x2,y2);
  ctx.lineTo(x2-nx*hs-ny*hs*0.5,y2-ny*hs+nx*hs*0.5);
  ctx.strokeStyle=color;ctx.lineWidth=width||2;ctx.stroke();
}

function drawAtomCircle(x,y,sym,color,r){
  r=r||18;
  ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);
  ctx.fillStyle='#0f172a';ctx.fill();
  ctx.strokeStyle=color;ctx.lineWidth=2;ctx.stroke();
  ctx.fillStyle=color;ctx.font='bold 12px monospace';
  ctx.textAlign='center';ctx.textBaseline='middle';
  ctx.fillText(sym,x,y);
}

function draw(){
  ctx.clearRect(0,0,W,H);
  ctx.fillStyle='#0a0f1e';ctx.fillRect(0,0,W,H);

  var pulse=Math.sin(t*0.04)*0.15+0.85;

  // ── Left: CO₂ ──
  var lx=W/4,ly=H/2;

  ctx.fillStyle='#34d399';ctx.font='bold 15px monospace';ctx.textAlign='center';
  ctx.fillText('CO₂ — Linear',lx,38);

  // Atoms
  var o1x=lx-120,o2x=lx+120,cy2=ly;
  // Bonds
  ctx.beginPath();ctx.moveTo(o1x+18,ly);ctx.lineTo(lx-18,ly);
  ctx.strokeStyle='#34d39988';ctx.lineWidth=3;ctx.stroke();
  ctx.beginPath();ctx.moveTo(lx+18,ly);ctx.lineTo(o2x-18,ly);
  ctx.strokeStyle='#34d39988';ctx.lineWidth=3;ctx.stroke();

  drawAtomCircle(o1x,ly,'O','#f87171');
  drawAtomCircle(lx,ly,'C','#34d399');
  drawAtomCircle(o2x,ly,'O','#f87171');

  // Bond dipoles (toward O)
  var dlen=42*pulse;
  drawArrow(lx-30,ly-28,o1x+30,ly-28,'#f97316',2);
  drawArrow(lx+30,ly-28,o2x-30,ly-28,'#f97316',2);

  ctx.fillStyle='#f97316';ctx.font='11px monospace';ctx.textAlign='center';
  ctx.fillText('\u03b4\u2212',o1x,ly-44);ctx.fillText('\u03b4+',lx-10,ly-44);
  ctx.fillText('\u03b4\u2212',o2x,ly-44);ctx.fillText('\u03b4+',lx+10,ly-44);

  // Net dipole = 0
  ctx.fillStyle='rgba(255,255,255,0.6)';ctx.font='12px monospace';ctx.textAlign='center';
  ctx.fillText('Dipoles cancel \u2192 Net dipole = 0',lx,ly+65);
  ctx.fillStyle='#34d399';ctx.font='bold 13px monospace';
  ctx.fillText('NONPOLAR',lx,ly+85);

  // Cancel symbol
  ctx.strokeStyle='#f87171';ctx.lineWidth=2;
  ctx.beginPath();ctx.moveTo(lx-16,ly+100);ctx.lineTo(lx+16,ly+112);ctx.stroke();
  ctx.beginPath();ctx.arc(lx,ly+106,14,0,Math.PI*2);ctx.stroke();

  // ── Right: H₂O ──
  var rx=3*W/4,ry=H/2+10;

  ctx.fillStyle='#f87171';ctx.font='bold 15px monospace';ctx.textAlign='center';
  ctx.fillText('H₂O — Bent',rx,38);

  var bendA=52*Math.PI/180;
  var bondLen=100;
  var h1x=rx-Math.sin(bendA)*bondLen;
  var h1y=ry+Math.cos(bendA)*bondLen*0.7;
  var h2x=rx+Math.sin(bendA)*bondLen;
  var h2y=ry+Math.cos(bendA)*bondLen*0.7;

  // Bonds
  ctx.beginPath();ctx.moveTo(rx,ry);ctx.lineTo(h1x,h1y);
  ctx.strokeStyle='#f8717188';ctx.lineWidth=2.5;ctx.stroke();
  ctx.beginPath();ctx.moveTo(rx,ry);ctx.lineTo(h2x,h2y);
  ctx.strokeStyle='#f8717188';ctx.lineWidth=2.5;ctx.stroke();

  drawAtomCircle(h1x,h1y,'H','#e2e8f0',14);
  drawAtomCircle(h2x,h2y,'H','#e2e8f0',14);
  drawAtomCircle(rx,ry,'O','#f87171');

  // Bond dipoles (toward O) — with pulse
  var d1mx=(rx+h1x)/2-(ry-h1y)*0.12;
  var d1my=(ry+h1y)/2;
  var d2mx=(rx+h2x)/2+(ry-h2y)*0.12;
  var d2my=(ry+h2y)/2;
  drawArrow(h1x+8,h1y-8,rx-10,ry+8,'#f97316',2);
  drawArrow(h2x-8,h2y-8,rx+10,ry+8,'#f97316',2);

  // Net dipole (upward, toward O)
  drawArrow(rx,ry+30,rx,ry-52,'#facc15',3);
  ctx.fillStyle='#facc15';ctx.font='bold 11px monospace';ctx.textAlign='left';
  ctx.fillText('Net',rx+8,ry-30);ctx.fillText('dipole',rx+8,ry-16);

  // Lone pairs suggestion
  var grd=ctx.createRadialGradient(rx,ry-30,0,rx,ry-30,22);
  grd.addColorStop(0,'rgba(248,113,113,0.25)');grd.addColorStop(1,'rgba(0,0,0,0)');
  ctx.fillStyle=grd;ctx.beginPath();ctx.arc(rx,ry-30,22,0,Math.PI*2);ctx.fill();

  ctx.fillStyle='rgba(255,255,255,0.6)';ctx.font='12px monospace';ctx.textAlign='center';
  ctx.fillText('Dipoles add \u2192 Large net dipole',rx,ry+110);
  ctx.fillStyle='#f87171';ctx.font='bold 13px monospace';
  ctx.fillText('POLAR',rx,ry+128);

  // Divider
  ctx.strokeStyle='rgba(255,255,255,0.08)';ctx.lineWidth=1;
  ctx.beginPath();ctx.moveTo(W/2,20);ctx.lineTo(W/2,H-20);ctx.stroke();

  t++;requestAnimationFrame(draw);
}
draw();`,
      outputHeight: 320,
    },

    // ── Challenge 3 ─────────────────────────────────────────────────────────────
    {
      type: 'challenge',
      instruction: `A student claims that any molecule with polar bonds must be a polar molecule. Which example best disproves this claim?`,
      options: [
        { label: 'A', text: 'H₂ — nonpolar bonds, nonpolar molecule' },
        { label: 'B', text: 'HCl — polar bond, polar molecule (supports the claim)' },
        { label: 'C', text: 'CO₂ — polar C=O bonds, but linear geometry causes dipoles to cancel, so the molecule is nonpolar' },
        { label: 'D', text: 'NaCl — ionic compound, not relevant to covalent polarity' },
      ],
      check: (label) => label === 'C',
      successMessage: "Correct! CO₂ has two polar C=O bonds, but the molecule is linear — the two bond dipoles point in exactly opposite directions and cancel. Net dipole = 0. CO₂ is a nonpolar molecule, despite having polar bonds. Geometry is what matters.",
      failMessage: "The claim needs a counterexample: a molecule with polar bonds that is NOT polar overall. CO₂ is the answer — its C=O bonds are polar, but the linear geometry makes the two bond dipoles cancel exactly, giving a net dipole of zero.",
      html: '', css: `body{margin:0;padding:0;font-family:sans-serif}`, startCode: '',
      outputHeight: 300,
    },

    // ── Section 6 ───────────────────────────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `### Beyond Simple Molecules: VSEPR in Action

VSEPR extends naturally to more complex situations. A few important cases:

**Multiple central atoms.** In ethane (CH₃–CH₃), each carbon is a separate central atom with its own tetrahedral geometry. In ethylene (CH₂=CH₂), each carbon has 3 electron groups (1 double bond + 2 single bonds) → trigonal planar at each carbon. The double bond makes both carbons and all four hydrogens coplanar — a flat molecule.

**Expanded octets.** Elements in the third row and below (phosphorus, sulfur, chlorine) can have more than 8 electrons in their valence shell, because they have access to d orbitals. Phosphorus pentachloride (PCl₅) has 5 bonding pairs → trigonal bipyramidal. Sulfur hexafluoride (SF₆) has 6 bonding pairs → octahedral.

**Real bond angles vs. predicted.** VSEPR predicts angles to within a few degrees, but real bond angles are influenced by the sizes of atoms, the type of bond (single vs. double), and the electronegativity of the substituents. The predictions are reliable enough to be chemically useful even without these corrections.

**Biological relevance.** The geometry of molecules determines how they fit together. Enzymes bind specific substrates partly because of shape complementarity. Drugs work (or don't work) partly because their geometry allows them to fit into a binding site. The bent geometry of water, the tetrahedral geometry of carbon, the trigonal pyramidal geometry of nitrogen in ammonia — these shapes are not abstract chemistry facts. They are the physical reason that biological molecules do what they do.`,
    },

    // ── Challenge 4 ─────────────────────────────────────────────────────────────
    {
      type: 'challenge',
      instruction: `Sulfur dioxide (SO₂) has a central S atom with 2 bonding pairs and 1 lone pair. Predict its molecular geometry.`,
      options: [
        { label: 'A', text: 'Linear — 2 bonds means 180° separation' },
        { label: 'B', text: 'Trigonal planar — 3 electron groups spread to 120°' },
        { label: 'C', text: 'Bent — 3 electron groups (trigonal planar electron geometry), but the lone pair makes the molecular shape bent' },
        { label: 'D', text: 'Tetrahedral — sulfur always forms 4 bonds' },
      ],
      check: (label) => label === 'C',
      successMessage: "Correct! SO₂ has 3 electron groups: one S=O double bond, one S–O single bond (or resonance structure), and one lone pair. Electron geometry: trigonal planar. Molecular geometry (atoms only): bent. The lone pair compresses the O–S–O angle to about 119°.",
      failMessage: "Count the electron groups around S: 2 bonds + 1 lone pair = 3 groups. Three groups → trigonal planar electron geometry. But the lone pair is not an atom — so the molecular shape (where the atoms are) is bent, not trigonal planar. The lone pair occupies one corner of the triangle invisibly.",
      html: '', css: `body{margin:0;padding:0;font-family:sans-serif}`, startCode: '',
      outputHeight: 300,
    },

    // ── Closing ──────────────────────────────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `### The Logic of Molecular Shape

VSEPR reduces the three-dimensional structure of molecules to a simple, mechanical procedure:

1. Count electron groups around the central atom.
2. Arrange them to maximise separation.
3. Identify how many are lone pairs.
4. The molecular shape is what the atoms form — lone pairs are invisible but present.

The deeper insight is that **electron geometry is always the parent**. Molecular geometry is derived from it by removing lone pairs. The tetrahedral electron geometry is the parent of three molecular shapes: tetrahedral (0 lone pairs), trigonal pyramidal (1 lone pair), and bent (2 lone pairs). All three have 4 electron groups; only the number of lone pairs differs.

And the deepest insight is that shape controls polarity. Polarity controls intermolecular forces. Intermolecular forces control every bulk property of matter — melting point, boiling point, viscosity, solubility, surface tension. The bent geometry of water, which follows directly from the two lone pairs on oxygen, which follows directly from oxygen having 6 valence electrons, is the reason oceans exist, blood can flow, and life emerged on Earth.

In the next lesson, we'll explore the water molecule in full depth — its polarity, its hydrogen bonds, and the extraordinary properties that make it the molecule that makes life possible.`,
    },

  ],
};

export default {
  id: 'chem-2-3-molecular-geometry',
  slug: 'molecular-geometry',
  chapter: 'chem.2',
  order: 3,
  title: 'Molecular Geometry',
  subtitle: 'Why molecules have shapes — and why shape determines everything.',
  tags: ['chemistry', 'VSEPR', 'molecular-geometry', 'bond-angles', 'lone-pairs', 'polarity', 'tetrahedral', 'bent', 'linear'],
  hook: {
    question: 'Why is water bent instead of linear — and why does that tiny geometric detail make life possible?',
    realWorldContext: "Water's bent shape gives it a large dipole moment, which causes hydrogen bonding, which causes its anomalously high boiling point, which is why Earth has liquid oceans. One molecular geometry decision cascades into the conditions for all of life.",
    previewVisualizationId: 'ScienceNotebook',
  },
  intuition: {
    prose: [
      'Electron pairs repel each other and spread as far apart as possible — this is VSEPR theory.',
      'The number of electron groups (bonds + lone pairs) around a central atom determines electron geometry.',
      'Lone pairs take up more space than bonding pairs, compressing bond angles.',
      'Molecular geometry is determined by where the atoms are, ignoring lone pairs.',
      'Molecular shape determines whether bond dipoles cancel (nonpolar) or add (polar).',
    ],
    callouts: [
      { type: 'important', title: 'Electron geometry vs. molecular geometry', body: 'Always count all electron groups (including lone pairs) to find electron geometry first. Then remove lone pairs to find molecular geometry. The molecular geometry is what you see; the electron geometry is what controls it.' },
    ],
    visualizations: [{ id: 'ScienceNotebook', title: 'Molecular Geometry', props: { lesson: LESSON_CHEM_2_3 } }],
  },
  math: { prose: [], callouts: [], visualizations: [] },
  rigor: { prose: [], callouts: [], visualizations: [] },
  examples: [],
  challenges: [],
  mentalModel: [
    'VSEPR: electron groups repel → spread to maximise separation.',
    'Electron geometry depends on total electron group count (bonds + lone pairs).',
    'Lone pairs repel more than bonding pairs → compress bond angles.',
    'Molecular geometry = electron geometry minus lone pairs.',
    '4 electron groups → tetrahedral electron geometry → tetrahedral (0 lp), trigonal pyramidal (1 lp), or bent (2 lp) molecular geometry.',
    'Shape determines whether bond dipoles cancel → polarity → intermolecular forces → bulk properties.',
  ],
  checkpoints: ['read-intuition'],
  quiz: [],
};

export { LESSON_CHEM_2_3 };
