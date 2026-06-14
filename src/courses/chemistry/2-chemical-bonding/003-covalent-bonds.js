// Chemistry · Chapter 2 · Lesson 2
// Covalent Bonds

const LESSON_CHEM_2_2 = {
  title: 'Covalent Bonds',
  subtitle: 'When atoms share instead of steal — and how sharing builds the molecules of life.',
  sequential: true,

  cells: [

    // ── Section 1 ────────────────────────────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `### Why Would Two Atoms Share Electrons?

Recall the octet rule: atoms are most stable when their outermost shell is completely full. For most atoms, that means 8 electrons in the outer shell.

Now consider two hydrogen atoms approaching each other. Each has 1 electron and wants 2 (a full first shell). Neither is electronegative enough to steal the other's electron outright. So what happens?

They **share**. Each hydrogen contributes its 1 electron to a shared pair between them. Now, from each hydrogen's perspective, both electrons are "accessible" — they spend time near both nuclei. Both hydrogens effectively experience 2 electrons around them. Both have a full first shell. Both are more stable than before.

The shared pair of electrons is held between the two nuclei by electrostatic attraction: both positive nuclei are attracted to the negative electron cloud between them. This attraction is what holds the atoms together — it is the covalent bond.

Crucially, this only works because both atoms gain stability. Covalent bonding is not charity — it is a mutually beneficial arrangement. Each atom gets to "count" the shared electrons as its own for the purpose of filling its outer shell.

This sharing strategy works particularly well between **nonmetals** — elements like carbon, nitrogen, oxygen, hydrogen, and the halogens. These elements have moderate to high electronegativities, meaning neither one is desperate enough to completely steal from the other. Instead, they share and both win.`,
    },

    // ── Visual 1 — H₂ bond formation ─────────────────────────────────────────────
    {
      type: 'js',
      instruction: `### H₂ bond formation — watch the electrons merge

Two hydrogen atoms approach each other. As they get close, their electron clouds overlap and the shared pair settles between the nuclei. The energy curve on the right shows the system reaching its lowest energy at the bond length (~74 pm).`,
      html: `<canvas id="cv" width="700" height="300"></canvas>`,
      css: `body{margin:0;background:#0a0f1e;display:flex;justify-content:center}
canvas{display:block;width:100%;max-width:700px}`,
      startCode: `var canvas=document.getElementById('cv');
var ctx=canvas.getContext('2d');
var W=canvas.width,H=canvas.height;
var t=0;

function drawH2(){
  ctx.clearRect(0,0,W,H);
  ctx.fillStyle='#0a0f1e';ctx.fillRect(0,0,W,H);
  var cycle=(t*0.008)%(Math.PI*2);
  var sep=120+60*Math.abs(Math.sin(cycle*0.5));
  var cx=W/2,cy=H/2;
  var leftX=cx-sep/2,rightX=cx+sep/2;
  ctx.fillStyle='rgba(255,255,255,0.65)';ctx.font='13px monospace';ctx.textAlign='center';
  if(sep>155){ctx.fillText('Two separate hydrogen atoms \u2014 each wants 1 more electron',cx,28);}
  else if(sep>135){ctx.fillText('Atoms approach \u2014 electrons begin to overlap',cx,28);}
  else{ctx.fillText('H\u2013H covalent bond formed \u2014 shared electron pair',cx,28);}
  var cloudR=42;
  ctx.globalAlpha=0.12;
  ctx.beginPath();ctx.arc(leftX,cy,cloudR+Math.max(0,(170-sep)*0.3),0,Math.PI*2);
  ctx.fillStyle='#38bdf8';ctx.fill();
  ctx.beginPath();ctx.arc(rightX,cy,cloudR+Math.max(0,(170-sep)*0.3),0,Math.PI*2);
  ctx.fillStyle='#38bdf8';ctx.fill();
  ctx.globalAlpha=1;
  if(sep<165){
    var density=Math.max(0,(165-sep)/45);
    var midGrd=ctx.createRadialGradient(cx,cy,0,cx,cy,30);
    midGrd.addColorStop(0,'rgba(56,189,248,'+(density*0.55)+')');
    midGrd.addColorStop(1,'rgba(56,189,248,0)');
    ctx.fillStyle=midGrd;ctx.beginPath();ctx.arc(cx,cy,30,0,Math.PI*2);ctx.fill();
  }
  [leftX,rightX].forEach(function(x){
    ctx.beginPath();ctx.arc(x,cy,18,0,Math.PI*2);ctx.fillStyle='#facc15';ctx.fill();
    ctx.fillStyle='#1e293b';ctx.font='bold 13px monospace';ctx.textAlign='center';ctx.textBaseline='middle';
    ctx.fillText('H',x,cy);
  });
  ctx.textBaseline='alphabetic';
  var eAngle=t*0.06;
  if(sep>145){
    var e1x=leftX+Math.cos(eAngle)*28,e1y=cy+Math.sin(eAngle)*20;
    var e2x=rightX+Math.cos(eAngle+Math.PI)*28,e2y=cy+Math.sin(eAngle+Math.PI)*20;
    [{x:e1x,y:e1y},{x:e2x,y:e2y}].forEach(function(e){
      ctx.beginPath();ctx.arc(e.x,e.y,5,0,Math.PI*2);
      ctx.fillStyle='#38bdf8';ctx.shadowColor='#38bdf8';ctx.shadowBlur=8;ctx.fill();ctx.shadowBlur=0;
    });
  } else {
    var sharedAngle=t*0.08;
    var spread=(sep-120)*0.3;
    var ex1=cx+Math.cos(sharedAngle)*spread,ey1=cy+Math.sin(sharedAngle*1.3)*14;
    var ex2=cx+Math.cos(sharedAngle+Math.PI)*spread,ey2=cy+Math.sin(sharedAngle*1.3+Math.PI)*14;
    [{x:ex1,y:ey1},{x:ex2,y:ey2}].forEach(function(e){
      ctx.beginPath();ctx.arc(e.x,e.y,5,0,Math.PI*2);
      ctx.fillStyle='#38bdf8';ctx.shadowColor='#38bdf8';ctx.shadowBlur=10;ctx.fill();ctx.shadowBlur=0;
    });
  }
  if(sep<140){
    ctx.strokeStyle='rgba(255,255,255,0.25)';ctx.lineWidth=1;ctx.setLineDash([4,4]);
    ctx.beginPath();ctx.moveTo(leftX+18,cy+40);ctx.lineTo(rightX-18,cy+40);ctx.stroke();ctx.setLineDash([]);
    ctx.fillStyle='rgba(255,255,255,0.5)';ctx.font='11px monospace';ctx.textAlign='center';
    ctx.fillText('H\u2013H  (bond length \u2248 74 pm)',cx,cy+56);
    ctx.fillStyle='rgba(56,189,248,0.8)';
    ctx.fillText('Each H counts 2 electrons \u2192 full first shell \u2713',cx,cy+76);
  }
  var ex=W-130,ey_base=cy+80;
  ctx.fillStyle='rgba(255,255,255,0.35)';ctx.font='10px monospace';ctx.textAlign='right';
  ctx.fillText('Energy',ex+10,ey_base-120);
  ctx.strokeStyle='rgba(255,255,255,0.15)';ctx.lineWidth=1;
  ctx.beginPath();ctx.moveTo(ex-50,ey_base-130);ctx.lineTo(ex-50,ey_base+10);ctx.stroke();
  ctx.beginPath();ctx.moveTo(ex-55,ey_base);ctx.lineTo(ex+10,ey_base);ctx.stroke();
  ctx.beginPath();ctx.strokeStyle='#4ade80';ctx.lineWidth=2;
  for(var px=0;px<=90;px++){
    var dist=(90-px)/20+0.5;
    var energy=-1/dist+1/(dist*dist*8);
    var drawX=ex-50+px,drawY=ey_base-50+energy*80;
    if(px===0)ctx.moveTo(drawX,drawY);else ctx.lineTo(drawX,drawY);
  }
  ctx.stroke();
  var currentDist=(sep-120)/80;
  var curveX=ex-50+(1-currentDist)*90;
  var curEnergy=-1/(currentDist*1.5+0.5)+1/(Math.pow(currentDist*1.5+0.5,2)*8);
  var curveY=ey_base-50+curEnergy*80;
  ctx.beginPath();ctx.arc(curveX,curveY,4,0,Math.PI*2);ctx.fillStyle='#facc15';ctx.fill();
  ctx.fillStyle='rgba(255,255,255,0.35)';ctx.font='10px monospace';ctx.textAlign='center';
  ctx.fillText('Potential energy',ex-20,ey_base+22);ctx.fillText('vs. distance',ex-20,ey_base+34);
  t++;requestAnimationFrame(drawH2);
}
drawH2();`,
      outputHeight: 320,
    },

    // ── Section 2 ────────────────────────────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `### Lewis Structures: Drawing Electron Sharing

In the early 20th century, the chemist Gilbert Lewis invented a simple notation for visualizing how electrons are arranged in molecules. **Lewis structures** (also called Lewis dot diagrams) show:

- Each atom's **valence electrons** as dots
- **Shared pairs** as lines between atoms (one line = one shared pair = one bond)
- **Lone pairs** (unshared electrons) as dots next to atoms

The rules for drawing Lewis structures follow a clear logic:

**Step 1:** Count the total valence electrons. Each atom contributes its valence electron count to the pool.

**Step 2:** Connect atoms with single bonds (one shared pair each). Start with the central atom (usually the one that appears least often, or carbon).

**Step 3:** Complete the octets of outer atoms first using lone pairs.

**Step 4:** If the central atom still doesn't have a full octet, form double or triple bonds by converting lone pairs to shared pairs.

This procedure isn't arbitrary — it's following the physics of what actually happens. Atoms arrange their electrons to maximize stability for everyone in the molecule.

Let's work through the most important examples: H₂, F₂, H₂O, O₂, N₂, and CO₂. Each one reveals something new about how electron sharing works.`,
    },

    // ── Visual 2 — Lewis Structure Explorer ──────────────────────────────────────
    {
      type: 'js',
      instruction: `### Lewis structure explorer — click each molecule

Select a molecule to see its Lewis structure, bond type, and explanation of how the electrons are arranged.`,
      html: `<div id="mol-tabs" style="display:flex;gap:8px;padding:14px 14px 0 14px;flex-wrap:wrap;background:#0a0f1e"></div>
<canvas id="cv" width="700" height="340"></canvas>`,
      css: `body{margin:0;background:#0a0f1e;font-family:monospace}
canvas{display:block;width:100%;max-width:700px}`,
      startCode: `var canvas=document.getElementById('cv');
var ctx=canvas.getContext('2d');
var W=canvas.width,H=canvas.height;

var molecules=[
  {name:'H\u2082',formula:'H\u2013H',bondOrder:1,bondType:'Single bond',color:'#facc15',
   desc:'Each H has 1 valence electron. They share 1 pair \u2192 each sees 2 electrons \u2192 full first shell.',
   valenceTotal:2,atoms:[{sym:'H',x:0.3,lone:[]},{sym:'H',x:0.7,lone:[]}]},
  {name:'F\u2082',formula:'F\u2013F',bondOrder:1,bondType:'Single bond',color:'#4ade80',
   desc:'Each F has 7 valence electrons. They share 1 pair. Each F also keeps 3 lone pairs to itself.',
   valenceTotal:14,atoms:[{sym:'F',x:0.3,lone:[3]},{sym:'F',x:0.7,lone:[3]}]},
  {name:'H\u2082O',formula:'H\u2013O\u2013H',bondOrder:1,bondType:'2 \u00d7 Single bond',color:'#38bdf8',
   desc:'O shares 1 electron with each H (2 bonds). The remaining 4 electrons on O become 2 lone pairs.',
   valenceTotal:8,atoms:[{sym:'H',x:0.22,lone:[]},{sym:'O',x:0.5,lone:[2]},{sym:'H',x:0.78,lone:[]}]},
  {name:'O\u2082',formula:'O=O',bondOrder:2,bondType:'Double bond',color:'#f87171',
   desc:'Each O has 6 valence electrons. A single bond leaves each O with only 7. O\u2082 needs a double bond.',
   valenceTotal:12,atoms:[{sym:'O',x:0.3,lone:[2]},{sym:'O',x:0.7,lone:[2]}]},
  {name:'N\u2082',formula:'N\u2261N',bondOrder:3,bondType:'Triple bond',color:'#a78bfa',
   desc:'Each N has 5 valence electrons. A triple bond gives each N 8 electrons and 1 lone pair. N\u2082 is extraordinarily stable.',
   valenceTotal:10,atoms:[{sym:'N',x:0.3,lone:[1]},{sym:'N',x:0.7,lone:[1]}]},
  {name:'CO\u2082',formula:'O=C=O',bondOrder:2,bondType:'2 \u00d7 Double bond',color:'#fb923c',
   desc:'C needs 4 bonds; each O needs 2. Result: two C=O double bonds. Each O has 2 lone pairs. C has zero lone pairs.',
   valenceTotal:16,isCO2:true,atoms:[{sym:'O',x:0.18,lone:[2]},{sym:'C',x:0.5,lone:[]},{sym:'O',x:0.82,lone:[2]}]}
];

var selected=0;
var tabEls=[];
var tabContainer=document.getElementById('mol-tabs');
molecules.forEach(function(mol,i){
  var btn=document.createElement('button');
  btn.textContent=mol.name;
  btn.style.cssText='padding:7px 14px;border-radius:8px;border:1.5px solid;font-family:monospace;font-size:13px;font-weight:600;cursor:pointer;transition:all .15s;';
  btn.style.borderColor=mol.color+(i===0?'cc':'44');
  btn.style.color=i===0?mol.color:'rgba(255,255,255,0.45)';
  btn.style.background=i===0?mol.color+'22':'transparent';
  btn.onclick=function(){
    selected=i;
    tabEls.forEach(function(b,j){
      b.style.color=j===selected?molecules[j].color:'rgba(255,255,255,0.45)';
      b.style.background=j===selected?molecules[j].color+'22':'transparent';
      b.style.borderColor=molecules[j].color+(j===selected?'cc':'44');
    });
    render();
  };
  tabContainer.appendChild(btn);tabEls.push(btn);
});

function drawBond(x1,y1,x2,y2,order,color){
  var dx=x2-x1,dy=y2-y1,len=Math.sqrt(dx*dx+dy*dy);
  var nx=-dy/len,ny=dx/len;
  var offsets=order===1?[0]:order===2?[-5,5]:[-9,0,9];
  offsets.forEach(function(off){
    ctx.beginPath();ctx.moveTo(x1+nx*off,y1+ny*off);ctx.lineTo(x2+nx*off,y2+ny*off);
    ctx.strokeStyle=color;ctx.lineWidth=2.5;ctx.stroke();
  });
}

function drawLonePairs(x,y,count,color,atomR){
  var positions=[[0,-1],[0,1],[-1,0],[1,0]];
  for(var i=0;i<count&&i<4;i++){
    var px=x+positions[i][0]*(atomR+20);
    var py=y+positions[i][1]*(atomR+20);
    var perpX=positions[i][1]*5,perpY=-positions[i][0]*5;
    [1,-1].forEach(function(side){
      ctx.beginPath();ctx.arc(px+perpX*side,py+perpY*side,3.5,0,Math.PI*2);
      ctx.fillStyle=color;ctx.fill();
    });
  }
}

function render(){
  ctx.clearRect(0,0,W,H);ctx.fillStyle='#0a0f1e';ctx.fillRect(0,0,W,H);
  var mol=molecules[selected],color=mol.color,atomR=24,centerY=H/2-20;
  var positions=mol.atoms.map(function(a){return{x:a.x*W,y:centerY,sym:a.sym,lone:a.lone};});
  for(var i=0;i<positions.length-1;i++){
    var bo=mol.isCO2?2:mol.bondOrder;
    drawBond(positions[i].x+atomR,centerY,positions[i+1].x-atomR,centerY,bo,color+'cc');
  }
  positions.forEach(function(p){
    var grd=ctx.createRadialGradient(p.x,p.y,0,p.x,p.y,atomR+12);
    grd.addColorStop(0,color+'44');grd.addColorStop(1,'rgba(0,0,0,0)');
    ctx.fillStyle=grd;ctx.beginPath();ctx.arc(p.x,p.y,atomR+12,0,Math.PI*2);ctx.fill();
    ctx.beginPath();ctx.arc(p.x,p.y,atomR,0,Math.PI*2);ctx.fillStyle='#0f172a';ctx.fill();
    ctx.strokeStyle=color;ctx.lineWidth=2;ctx.stroke();
    ctx.fillStyle=color;ctx.font='bold 15px monospace';ctx.textAlign='center';ctx.textBaseline='middle';
    ctx.fillText(p.sym,p.x,p.y);
    p.lone.forEach(function(count){drawLonePairs(p.x,p.y,count,color,atomR);});
  });
  ctx.textBaseline='alphabetic';
  ctx.fillStyle='rgba(255,255,255,0.9)';ctx.font='bold 26px monospace';ctx.textAlign='center';
  ctx.fillText(mol.formula,W/2,H-120);
  ctx.fillStyle=color+'aa';ctx.beginPath();
  var bw=160,bh=26;ctx.roundRect(W/2-bw/2,H-100,bw,bh,6);ctx.fill();
  ctx.fillStyle='#fff';ctx.font='12px monospace';ctx.textAlign='center';
  ctx.fillText(mol.bondType,W/2,H-100+bh/2+1);
  var words=mol.desc.split(' '),lines=[],line='';
  words.forEach(function(w){if((line+w).length>82){lines.push(line.trim());line='';}line+=w+' ';});
  if(line.trim())lines.push(line.trim());
  ctx.fillStyle='rgba(255,255,255,0.6)';ctx.font='12px monospace';
  lines.forEach(function(l,i){ctx.fillText(l,W/2,H-68+i*17);});
  ctx.fillStyle='rgba(255,255,255,0.35)';ctx.font='11px monospace';ctx.textAlign='left';
  ctx.fillText('Total valence electrons: '+mol.valenceTotal,14,H-14);
}
render();`,
      outputHeight: 400,
    },

    // ── Challenge 1 ──────────────────────────────────────────────────────────────
    {
      type: 'challenge',
      instruction: `Carbon dioxide (CO₂) has two C=O double bonds. Which statement best explains why double bonds form here instead of single bonds?`,
      options: [
        { label: 'A', text: 'Single bonds would leave each oxygen with fewer than 8 electrons in its outer shell' },
        { label: 'B', text: 'Double bonds are always stronger than single bonds, so they are preferred' },
        { label: 'C', text: 'Carbon cannot form single bonds with oxygen' },
        { label: 'D', text: 'Double bonds form because CO₂ has an even number of electrons' },
      ],
      check: (label) => label === 'A',
      successMessage: 'Correct! With single bonds, each oxygen would only have 7 electrons — one short of a full octet. Moving a lone pair from each oxygen into a second shared bond gives both oxygens a full 8. Double bonds satisfy all three atoms.',
      failMessage: 'Think about what each atom needs. With single bonds, each oxygen has 6 of its own plus 1 shared = 7 electrons — not enough. Double bonds contribute 2 shared electrons to each oxygen, completing the octet for everyone.',
      html: '', css: `body{margin:0}`, startCode: '',
      outputHeight: 300,
    },

    // ── Section 3 ────────────────────────────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `### Single, Double, Triple: How Bond Order Changes Everything

The number of shared electron pairs between two atoms is called the **bond order**. A single bond (one shared pair) has bond order 1. A double bond (two shared pairs) has bond order 2. A triple bond (three shared pairs) has bond order 3.

Bond order has dramatic, predictable effects on two properties:

**Bond strength (bond dissociation energy):** More shared pairs means more electrons between the two nuclei, and more electrostatic attraction holding the nuclei together. Double bonds are roughly twice as strong as single bonds; triple bonds are roughly three times as strong.

For the nitrogen molecule (N≡N), this is why nitrogen gas is so chemically inert. The triple bond has a dissociation energy of 945 kJ/mol — it takes that much energy to break one mole of N≡N bonds. This is one of the strongest bonds in chemistry. Making nitrogen-containing fertilizers from N₂ gas (the Haber-Bosch process) was one of the great technological achievements of the 20th century precisely because breaking N≡N is so hard.

**Bond length:** More shared pairs also pull the two nuclei closer together. The electron density between the nuclei is higher, compressing the bond. Double bonds are shorter than single bonds; triple bonds are shorter still.

| Bond | Example | Length | Strength |
|------|---------|--------|----------|
| C–C single | ethane | 154 pm | 347 kJ/mol |
| C=C double | ethylene | 134 pm | 614 kJ/mol |
| C≡C triple | acetylene | 120 pm | 839 kJ/mol |
| N≡N triple | nitrogen | 110 pm | 945 kJ/mol |

The pattern is clean: more bonds = shorter + stronger.`,
    },

    // ── Visual 3 — Bond order comparison ─────────────────────────────────────────
    {
      type: 'js',
      instruction: `### C–C bond order comparison

Three columns show the same two carbon atoms with single, double, and triple bonds. Notice how the bond length (pm) shrinks and the bond energy (kJ/mol) rises with each additional shared pair. The animated electrons show the increasing electron density.`,
      html: `<canvas id="cv" width="700" height="320"></canvas>`,
      css: `body{margin:0;background:#0a0f1e;display:flex;justify-content:center}
canvas{display:block;width:100%;max-width:700px}`,
      startCode: `var canvas=document.getElementById('cv');
var ctx=canvas.getContext('2d');
var W=canvas.width,H=canvas.height;
var t=0;

var bonds=[
  {label:'C\u2013C',sub:'Single',order:1,length:154,energy:347,color:'#94a3b8',ex:'Ethane (C\u2082H\u2086)'},
  {label:'C=C',sub:'Double',order:2,length:134,energy:614,color:'#38bdf8',ex:'Ethylene (C\u2082H\u2084)'},
  {label:'C\u2261C',sub:'Triple',order:3,length:120,energy:839,color:'#a78bfa',ex:'Acetylene (C\u2082H\u2082)'}
];

function draw(){
  ctx.clearRect(0,0,W,H);ctx.fillStyle='#0a0f1e';ctx.fillRect(0,0,W,H);
  ctx.fillStyle='rgba(255,255,255,0.7)';ctx.font='bold 14px monospace';ctx.textAlign='center';
  ctx.fillText('Bond order comparison: C\u2013C bonds',W/2,26);
  var colW=W/3;
  bonds.forEach(function(bond,col){
    var cx=col*colW+colW/2;
    var atomR=20,halfLen=(bond.length/154)*65,bondY=110;
    // Left atom
    ctx.beginPath();ctx.arc(cx-halfLen-atomR,bondY,atomR,0,Math.PI*2);
    ctx.fillStyle=bond.color+'33';ctx.fill();ctx.strokeStyle=bond.color;ctx.lineWidth=2;ctx.stroke();
    ctx.fillStyle=bond.color;ctx.font='bold 12px monospace';ctx.textAlign='center';ctx.textBaseline='middle';
    ctx.fillText('C',cx-halfLen-atomR,bondY);
    // Right atom
    ctx.beginPath();ctx.arc(cx+halfLen+atomR,bondY,atomR,0,Math.PI*2);
    ctx.fillStyle=bond.color+'33';ctx.fill();ctx.strokeStyle=bond.color;ctx.lineWidth=2;ctx.stroke();
    ctx.fillStyle=bond.color;ctx.fillText('C',cx+halfLen+atomR,bondY);
    // Bond lines
    var offsets=bond.order===1?[0]:bond.order===2?[-5,5]:[-9,0,9];
    offsets.forEach(function(off){
      ctx.beginPath();ctx.moveTo(cx-halfLen,bondY+off);ctx.lineTo(cx+halfLen,bondY+off);
      ctx.strokeStyle=bond.color;ctx.lineWidth=2.5;ctx.stroke();
    });
    // Animated electrons
    for(var d=0;d<bond.order;d++){
      var eAngle=t*0.07+d*(Math.PI*2/bond.order);
      var ey=bondY+Math.sin(eAngle)*(bond.order===1?8:bond.order===2?14:18);
      var ex=cx+Math.cos(eAngle*0.6)*halfLen*0.7;
      ctx.beginPath();ctx.arc(ex,ey,3.5,0,Math.PI*2);ctx.fillStyle=bond.color+'cc';ctx.fill();
    }
    // Bond length arrow
    var arrowY=bondY+42;
    ctx.strokeStyle='rgba(255,255,255,0.3)';ctx.lineWidth=1;ctx.setLineDash([3,3]);
    ctx.beginPath();ctx.moveTo(cx-halfLen,arrowY);ctx.lineTo(cx+halfLen,arrowY);ctx.stroke();ctx.setLineDash([]);
    ctx.fillStyle='rgba(255,255,255,0.55)';ctx.font='11px monospace';
    ctx.textAlign='center';ctx.textBaseline='top';
    ctx.fillText(bond.length+' pm',cx,arrowY+4);
    // Labels
    ctx.fillStyle=bond.color;ctx.font='bold 18px monospace';ctx.textAlign='center';ctx.textBaseline='alphabetic';
    ctx.fillText(bond.label,cx,bondY+75);
    ctx.font='12px monospace';ctx.fillStyle='rgba(255,255,255,0.55)';
    ctx.fillText(bond.sub+' bond',cx,bondY+95);
    ctx.fillText(bond.ex,cx,bondY+112);
    // Energy bar
    var barMaxH=80,barH=(bond.energy/945)*barMaxH;
    var barX=cx-24,barY_base=H-30;
    ctx.fillStyle=bond.color+'33';ctx.fillRect(barX,barY_base-barMaxH,48,barMaxH);
    ctx.fillStyle=bond.color;ctx.fillRect(barX,barY_base-barH,48,barH);
    ctx.fillStyle='rgba(255,255,255,0.7)';ctx.font='11px monospace';ctx.textAlign='center';
    ctx.fillText(bond.energy+' kJ/mol',cx,barY_base-barH-12);
  });
  ctx.fillStyle='rgba(255,255,255,0.35)';ctx.font='11px monospace';ctx.textAlign='left';
  ctx.fillText('Bond energy (kJ/mol) \u2192',14,H-14);
  t++;requestAnimationFrame(draw);
}
draw();`,
      outputHeight: 340,
    },

    // ── Section 4 ────────────────────────────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `### Sigma (σ) and Pi (π) Bonds: The Anatomy of a Double Bond

So far we have described double and triple bonds as "two or three pairs of shared electrons." But there is something deeper going on: not all electron pairs in a multiple bond are the same.

Chemists distinguish between two types of bonds based on how the electron density is distributed:

**Sigma (σ) bonds** are formed by direct, head-on overlap of orbitals between two atoms. The electron density is concentrated *along* the line connecting the two nuclei — directly between them. Every single bond is a sigma bond. Every bond, no matter how many, contains exactly one sigma bond.

**Pi (π) bonds** are formed by sideways (parallel) overlap of orbitals *above and below* (or in front of and behind) the bond axis. The electron density is not between the nuclei — it's above and below the line connecting them. Pi bonds only appear in double and triple bonds. A double bond = one sigma + one pi. A triple bond = one sigma + two pi.

This distinction matters enormously in practice:

**Rotation:** Sigma bonds allow free rotation — the two atoms can spin around the bond axis without disrupting the head-on overlap. But pi bonds require the parallel orbital lobes to stay lined up. Rotation around a double bond would twist the pi bond out of alignment and break it. This is why **double bonds are rigid** — they lock the geometry of the atoms on either side. This rigidity is why some molecules have distinct geometric shapes (cis/trans isomers) and why double bonds in fatty acids change the shape and function of fats.

**Reactivity:** Pi bonds are generally more reactive than sigma bonds. The electron density exposed above and below the bond axis is more accessible to attack. This is why alkenes (with C=C double bonds) are much more chemically reactive than alkanes (with only C–C single bonds).`,
    },

    // ── Visual 4 — Sigma vs Pi ────────────────────────────────────────────────────
    {
      type: 'js',
      instruction: `### Sigma bond vs. pi bond geometry

Left panel: the σ bond — head-on orbital overlap, electron density directly between the nuclei, allows free rotation. Right panel: the π bond — sideways overlap with electron density above and below the axis, restricts rotation and is more reactive.`,
      html: `<canvas id="cv" width="700" height="340"></canvas>`,
      css: `body{margin:0;background:#0a0f1e;display:flex;justify-content:center}
canvas{display:block;width:100%;max-width:700px}`,
      startCode: `var canvas=document.getElementById('cv');
var ctx=canvas.getContext('2d');
var W=canvas.width,H=canvas.height;
var t=0;

function drawOrbital(cx,cy,rx,ry,angle,color,alpha){
  ctx.save();ctx.translate(cx,cy);ctx.rotate(angle);ctx.globalAlpha=alpha;
  var grd=ctx.createRadialGradient(0,0,0,0,0,Math.max(rx,ry));
  grd.addColorStop(0,color);grd.addColorStop(1,'rgba(0,0,0,0)');
  ctx.fillStyle=grd;ctx.beginPath();ctx.ellipse(0,0,rx,ry,0,0,Math.PI*2);ctx.fill();
  ctx.globalAlpha=1;ctx.restore();
}

function draw(){
  ctx.clearRect(0,0,W,H);ctx.fillStyle='#0a0f1e';ctx.fillRect(0,0,W,H);

  // Divider
  ctx.strokeStyle='rgba(255,255,255,0.08)';ctx.lineWidth=1;
  ctx.beginPath();ctx.moveTo(W/2,20);ctx.lineTo(W/2,H-20);ctx.stroke();

  // ── Left: Sigma ──
  var sigX=W/4,sigY=H/2-20;
  ctx.fillStyle='rgba(255,255,255,0.7)';ctx.font='bold 14px monospace';ctx.textAlign='center';
  ctx.fillText('\u03c3 (sigma) bond',sigX,26);
  ctx.font='11px monospace';ctx.fillStyle='rgba(255,255,255,0.45)';
  ctx.fillText('Head-on overlap \u00b7 direct overlap',sigX,44);
  ctx.fillText('Every bond has exactly 1 sigma bond',sigX,58);
  var na1x=sigX-70,na2x=sigX+70;
  var breathe=Math.sin(t*0.04)*5;
  drawOrbital(na1x,sigY,52+breathe,26,0,'#38bdf8cc',0.5);
  drawOrbital(na2x,sigY,52+breathe,26,0,'#38bdf8cc',0.5);
  drawOrbital(sigX,sigY,30,26,0,'#38bdf8',0.45);
  [na1x,na2x].forEach(function(nx){
    ctx.beginPath();ctx.arc(nx,sigY,14,0,Math.PI*2);ctx.fillStyle='#1e293b';ctx.fill();
    ctx.strokeStyle='#38bdf8';ctx.lineWidth=2;ctx.stroke();
    ctx.fillStyle='#38bdf8';ctx.font='bold 11px monospace';ctx.textAlign='center';ctx.textBaseline='middle';
    ctx.fillText('C',nx,sigY);
  });
  ctx.textBaseline='alphabetic';
  ctx.strokeStyle='rgba(255,255,255,0.2)';ctx.lineWidth=1;ctx.setLineDash([4,4]);
  ctx.beginPath();ctx.moveTo(sigX-110,sigY);ctx.lineTo(sigX+110,sigY);ctx.stroke();ctx.setLineDash([]);
  ctx.fillStyle='rgba(56,189,248,0.8)';ctx.font='11px monospace';ctx.textAlign='center';
  ctx.fillText('Electron density concentrated',sigX,sigY+60);
  ctx.fillText('directly between nuclei',sigX,sigY+74);
  ctx.fillText('\u2192 allows free rotation',sigX,sigY+94);

  // ── Right: Pi ──
  var piX=3*W/4,piY=H/2-20;
  ctx.fillStyle='rgba(255,255,255,0.7)';ctx.font='bold 14px monospace';ctx.textAlign='center';
  ctx.fillText('\u03c0 (pi) bond',piX,26);
  ctx.font='11px monospace';ctx.fillStyle='rgba(255,255,255,0.45)';
  ctx.fillText('Sideways overlap \u00b7 above and below',piX,44);
  ctx.fillText('Only in double and triple bonds',piX,58);
  var pb1x=piX-60,pb2x=piX+60;
  drawOrbital(pb1x,piY-36,35,22,0,'#a78bfacc',0.5);
  drawOrbital(pb2x,piY-36,35,22,0,'#a78bfacc',0.5);
  drawOrbital(piX,piY-36,20,22,0,'#a78bfa',0.55);
  drawOrbital(pb1x,piY+36,35,22,0,'#a78bfacc',0.5);
  drawOrbital(pb2x,piY+36,35,22,0,'#a78bfacc',0.5);
  drawOrbital(piX,piY+36,20,22,0,'#a78bfa',0.55);
  ctx.beginPath();ctx.moveTo(pb1x+14,piY);ctx.lineTo(pb2x-14,piY);
  ctx.strokeStyle='#38bdf8cc';ctx.lineWidth=3;ctx.stroke();
  [pb1x,pb2x].forEach(function(nx){
    ctx.beginPath();ctx.arc(nx,piY,14,0,Math.PI*2);ctx.fillStyle='#1e293b';ctx.fill();
    ctx.strokeStyle='#38bdf8';ctx.lineWidth=2;ctx.stroke();
    ctx.fillStyle='#38bdf8';ctx.font='bold 11px monospace';ctx.textAlign='center';ctx.textBaseline='middle';
    ctx.fillText('C',nx,piY);
  });
  ctx.textBaseline='alphabetic';
  ctx.fillStyle='#a78bfa';ctx.font='11px monospace';ctx.textAlign='center';
  ctx.fillText('\u03c0 lobe (above)',piX,piY-72);
  ctx.fillText('\u03c0 lobe (below)',piX,piY+88);
  ctx.fillStyle='#38bdf8';ctx.fillText('\u03c3 bond',piX,piY+18);
  ctx.fillStyle='rgba(167,139,250,0.8)';
  ctx.fillText('Electron density above & below axis',piX,piY+105);
  ctx.fillText('\u2192 restricts rotation, more reactive',piX,piY+120);

  t++;requestAnimationFrame(draw);
}
draw();`,
      outputHeight: 360,
    },

    // ── Challenge 2 ──────────────────────────────────────────────────────────────
    {
      type: 'challenge',
      instruction: `A carbon-carbon double bond (C=C) contains one sigma bond and one pi bond. What happens if you try to rotate one carbon relative to the other around the C=C bond?`,
      options: [
        { label: 'A', text: 'Nothing — double bonds allow the same free rotation as single bonds' },
        { label: 'B', text: 'The sigma bond breaks, releasing energy' },
        { label: 'C', text: 'The pi bond breaks because its sideways orbital overlap is disrupted by the rotation' },
        { label: 'D', text: 'Both bonds break and the molecule splits in two' },
      ],
      check: (label) => label === 'C',
      successMessage: 'Correct! The pi bond depends on parallel alignment of p orbitals above and below the bond axis. Rotation twists one set of p orbitals out of alignment, breaking the pi bond. This requires ~250 kJ/mol — which is why double bonds are rigid at normal temperatures.',
      failMessage: "The key is the pi bond geometry. Pi bonds form from parallel overlap of orbitals above and below the bond axis. Rotation would twist those orbitals out of alignment — the overlapping region disappears — breaking the pi bond. This is why double bonds don't rotate freely.",
      html: '', css: `body{margin:0}`, startCode: '',
      outputHeight: 300,
    },

    // ── Section 5 ────────────────────────────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `### Not All Sharing Is Equal: Polar Covalent Bonds

We said covalent bonds involve sharing electrons. But "sharing" does not always mean sharing equally.

When two identical atoms bond (H₂, O₂, N₂), the electrons are shared perfectly equally — both nuclei are identical, so neither pulls harder. This is a **nonpolar covalent bond**.

But when two *different* atoms bond, the atom with higher electronegativity pulls the shared electrons more strongly toward itself. The electron cloud is displaced toward one end of the bond. This creates a **polar covalent bond** — one with an unequal charge distribution.

The result is a **dipole**: one end of the bond is slightly negative (the more electronegative atom, denoted δ−) and the other end is slightly positive (denoted δ+). The Greek delta (δ) indicates partial, not complete, charge transfer — the electrons are still shared, just unequally.

Consider the hydrogen-fluorine bond (HF):
- Fluorine electronegativity: 4.0
- Hydrogen electronegativity: 2.2
- ΔEN = 1.8 — significantly polar

The electron cloud in HF is displaced strongly toward fluorine. Fluorine carries δ− and hydrogen carries δ+. This polarity makes HF a very reactive molecule and explains its acidic behavior in water.

The water molecule (H₂O) has two polar O–H bonds (ΔEN = 1.24). The bond polarity, combined with the bent geometry of water, gives the molecule a large permanent dipole moment — the root cause of water's extraordinary properties.

Polarity is the bridge between ionic bonding (complete electron transfer) and nonpolar covalent bonding (equal sharing). Most real bonds lie somewhere on this spectrum.`,
    },

    // ── Visual 5 — Polarity spectrum ──────────────────────────────────────────────
    {
      type: 'js',
      instruction: `### The bonding spectrum — from equal sharing to complete transfer

Every bond falls somewhere on a continuous spectrum based on the electronegativity difference (ΔEN) between the two atoms. Six common molecules are plotted at their actual ΔEN values. The animated HF molecule at the bottom shows the asymmetric electron cloud.`,
      html: `<canvas id="cv" width="700" height="300"></canvas>`,
      css: `body{margin:0;background:#0a0f1e;display:flex;justify-content:center}
canvas{display:block;width:100%;max-width:700px}`,
      startCode: `var canvas=document.getElementById('cv');
var ctx=canvas.getContext('2d');
var W=canvas.width,H=canvas.height;
var t=0;

var examples=[
  {name:'H\u2013H',den:0,color:'#94a3b8',desc:'H\u2082\\n\u0394EN = 0'},
  {name:'C\u2013H',den:0.35,color:'#a3e635',desc:'Methane\\n\u0394EN = 0.35'},
  {name:'H\u2013Cl',den:0.96,color:'#38bdf8',desc:'HCl\\n\u0394EN = 0.96'},
  {name:'O\u2013H',den:1.24,color:'#34d399',desc:'Water\\n\u0394EN = 1.24'},
  {name:'H\u2013F',den:1.78,color:'#a78bfa',desc:'HF\\n\u0394EN = 1.78'},
  {name:'Na\u2013Cl',den:2.23,color:'#f97316',desc:'Salt\\n\u0394EN = 2.23'}
];

function draw(){
  ctx.clearRect(0,0,W,H);ctx.fillStyle='#0a0f1e';ctx.fillRect(0,0,W,H);
  var maxDEN=3.0,barX=50,barY=68,barW=W-100,barH=36;
  var grad=ctx.createLinearGradient(barX,0,barX+barW,0);
  grad.addColorStop(0,'#94a3b8');grad.addColorStop(0.5,'#38bdf8');grad.addColorStop(1,'#f97316');
  ctx.fillStyle=grad;ctx.beginPath();ctx.roundRect(barX,barY,barW,barH,8);ctx.fill();
  ctx.fillStyle='#94a3b8';ctx.font='11px monospace';ctx.textAlign='center';
  ctx.fillText('Nonpolar Covalent',barX+barW*0.12,barY-26);
  ctx.fillText('(\u0394EN < 0.4)',barX+barW*0.12,barY-13);
  ctx.fillStyle='#38bdf8';ctx.fillText('Polar Covalent',barX+barW*0.5,barY-26);
  ctx.fillText('(0.4 \u2264 \u0394EN < 1.7)',barX+barW*0.5,barY-13);
  ctx.fillStyle='#f97316';ctx.fillText('Ionic',barX+barW*0.9,barY-26);
  ctx.fillText('(\u0394EN \u2265 1.7)',barX+barW*0.9,barY-13);
  ctx.fillStyle='rgba(255,255,255,0.7)';ctx.font='bold 14px monospace';ctx.textAlign='center';
  ctx.fillText('The bonding spectrum: from equal sharing to complete transfer',W/2,barY-50);
  examples.forEach(function(ex){
    var ex_x=barX+(ex.den/maxDEN)*barW,colY=barY+barH+10;
    ctx.beginPath();ctx.arc(ex_x,barY+barH/2,5,0,Math.PI*2);ctx.fillStyle='#fff';ctx.fill();
    ctx.strokeStyle=ex.color+'88';ctx.lineWidth=1;ctx.setLineDash([3,3]);
    ctx.beginPath();ctx.moveTo(ex_x,barY+barH);ctx.lineTo(ex_x,colY+8);ctx.stroke();ctx.setLineDash([]);
    var lines=ex.desc.split('\\n');
    ctx.fillStyle=ex.color;ctx.font='bold 11px monospace';ctx.textAlign='center';
    ctx.fillText(lines[0],ex_x,colY+20);
    ctx.fillStyle='rgba(255,255,255,0.45)';ctx.font='10px monospace';
    ctx.fillText(lines[1],ex_x,colY+34);
  });
  var hfX=W/2,hfY=H-68;
  var pulse=Math.sin(t*0.05)*0.15+0.85;
  var hx=hfX-50,fx=hfX+50;
  var cloudGrd=ctx.createLinearGradient(hx-20,0,fx+20,0);
  cloudGrd.addColorStop(0,'rgba(56,189,248,'+(0.05*pulse)+')');
  cloudGrd.addColorStop(0.3,'rgba(56,189,248,'+(0.15*pulse)+')');
  cloudGrd.addColorStop(1,'rgba(167,139,250,'+(0.45*pulse)+')');
  ctx.fillStyle=cloudGrd;ctx.beginPath();ctx.ellipse(hfX,hfY,70,22,0,0,Math.PI*2);ctx.fill();
  [{x:hx,sym:'H',color:'#38bdf8',charge:'\u03b4+'},{x:fx,sym:'F',color:'#a78bfa',charge:'\u03b4\u2212'}].forEach(function(a){
    ctx.beginPath();ctx.arc(a.x,hfY,16,0,Math.PI*2);ctx.fillStyle='#0f172a';ctx.fill();
    ctx.strokeStyle=a.color;ctx.lineWidth=2;ctx.stroke();
    ctx.fillStyle=a.color;ctx.font='bold 12px monospace';ctx.textAlign='center';ctx.textBaseline='middle';
    ctx.fillText(a.sym,a.x,hfY);
    ctx.fillStyle=a.color;ctx.font='11px monospace';ctx.textBaseline='bottom';
    ctx.fillText(a.charge,a.x,hfY-20);
  });
  ctx.textBaseline='alphabetic';
  ctx.beginPath();ctx.moveTo(hx+18,hfY+28);ctx.lineTo(fx-18,hfY+28);
  ctx.strokeStyle='#a78bfa88';ctx.lineWidth=1.5;ctx.stroke();
  ctx.fillStyle='#a78bfa88';ctx.beginPath();
  ctx.moveTo(fx-10,hfY+24);ctx.lineTo(fx-18,hfY+28);ctx.lineTo(fx-10,hfY+32);ctx.fill();
  ctx.fillStyle='rgba(255,255,255,0.4)';ctx.font='10px monospace';ctx.textAlign='center';
  ctx.fillText('dipole moment (electrons displaced toward F)',hfX,hfY+44);
  t++;requestAnimationFrame(draw);
}
draw();`,
      outputHeight: 320,
    },

    // ── Challenge 3 ──────────────────────────────────────────────────────────────
    {
      type: 'challenge',
      instruction: `In a molecule of HF (hydrogen fluoride), the electronegativity of F is 4.0 and of H is 2.2. Which atom carries the δ− (partial negative) charge, and why?`,
      options: [
        { label: 'A', text: 'Hydrogen, because it has fewer electrons' },
        { label: 'B', text: 'Fluorine, because it pulls the shared electrons closer to itself' },
        { label: 'C', text: 'Both carry equal partial charges because the bond is covalent' },
        { label: 'D', text: 'Neither — partial charges only form in ionic bonds' },
      ],
      check: (label) => label === 'B',
      successMessage: 'Correct! Fluorine has the highest electronegativity (4.0) and pulls the shared electron pair strongly toward itself. This gives it a partial negative charge (δ−) and leaves hydrogen with a partial positive charge (δ+).',
      failMessage: "Electronegativity measures how strongly an atom attracts electrons. Fluorine's electronegativity (4.0) is much higher than hydrogen's (2.2), so fluorine pulls the shared electrons toward itself, accumulating partial negative charge (δ−).",
      html: '', css: `body{margin:0}`, startCode: '',
      outputHeight: 300,
    },

    // ── Section 6 ────────────────────────────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `### Why Covalent Compounds Are So Different from Ionic Compounds

Compare table salt (NaCl, ionic) with water (H₂O, covalent) or sugar (C₁₂H₂₂O₁₁, covalent). The difference in properties is striking:

**Melting points:** NaCl melts at 801°C. Water melts at 0°C. Sugar decomposes around 186°C. Ionic compounds have high melting points because you must break strong electrostatic attractions extending through the whole crystal lattice. Covalent compounds have lower melting points because you only need to separate *individual molecules* from each other — the covalent bonds within the molecules remain intact.

**Electrical conductivity:** Pure water doesn't conduct electricity. Sugar dissolved in water doesn't conduct. NaCl dissolved in water conducts strongly. Covalent compounds generally don't produce ions when dissolved, so they can't carry charge.

**Hardness:** NaCl crystals are hard (brittle). Molecular covalent solids like wax or sugar are soft. The exception is **network covalent solids** — structures like diamond where covalent bonds extend through the entire solid in a continuous 3D network. Diamond is covalent *and* extraordinarily hard, because breaking it requires breaking C–C covalent bonds, not just separating molecules.

**Diversity:** There are only so many ionic compounds (limited by which cations and anions exist). But covalent compounds number in the tens of millions. Carbon alone can form single, double, and triple bonds; chains, rings, and cages; with dozens of other elements. The molecules of life — DNA, proteins, lipids, sugars — are all covalent. Ionic chemistry built rocks and salts. Covalent chemistry built life.`,
    },

    // ── Challenge 4 ──────────────────────────────────────────────────────────────
    {
      type: 'challenge',
      instruction: `Diamond and graphite are both made entirely of carbon atoms. Diamond is the hardest known natural material; graphite is so soft it's used as a lubricant. The key difference is that diamond has carbon atoms connected in a 3D network of covalent bonds, while graphite has carbon atoms in 2D sheets held together between layers by weaker forces. What does this tell you about covalent bonds?`,
      options: [
        { label: 'A', text: 'Covalent bonds are always weak — the softness of graphite proves this' },
        { label: 'B', text: "The strength of a material depends on covalent bonds within it AND how the molecules/units are arranged relative to each other" },
        { label: 'C', text: "Diamond's hardness comes from ionic bonds, not covalent bonds" },
        { label: 'D', text: 'Carbon can only form 2 bonds, which is why graphite is soft' },
      ],
      check: (label) => label === 'B',
      successMessage: "Correct! Both diamond and graphite have strong C–C covalent bonds within their structures. The difference is architecture: in diamond, every C atom is bonded to 4 others in a 3D cage — there's no direction you can slide or break without cutting covalent bonds. In graphite, the sheets slide easily past each other.",
      failMessage: 'Both diamond and graphite have strong C–C covalent bonds. The difference is structural arrangement. Diamond\'s 3D network has no weak directions. In graphite, only weak forces hold the layers together, so the sheets slide past each other easily.',
      html: '', css: `body{margin:0}`, startCode: '',
      outputHeight: 300,
    },

    // ── Closing ───────────────────────────────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `### The Logic of Covalent Bonding

Everything covered here traces back to one principle: **atoms share electrons to complete their outer shells**.

From that single idea flows the entire architecture of covalent chemistry:

The number of bonds an atom forms is determined by how many electrons it needs to complete its octet. Carbon needs 4 → forms 4 bonds. Nitrogen needs 3 → forms 3 bonds. Oxygen needs 2 → forms 2 bonds.

When a single bond doesn't complete all the octets, atoms form double or triple bonds, pulling more electron pairs into the shared space. More shared pairs = shorter bond, stronger bond, more restricted geometry.

Not all sharing is equal. Differences in electronegativity create polar bonds — partial charges that make molecules sticky, reactive, and able to interact with water. Polarity is the foundation of biochemistry.

And the sigma/pi distinction shows that bonds are three-dimensional arrangements of electron density with specific geometries. The shape of a pi bond is why double bonds resist rotation, which is why certain molecules have distinct geometric isomers, which is why the difference between a cis and trans fatty acid is the difference between olive oil and margarine.

In the next lesson, we'll zoom out from individual bonds to entire molecular shapes — and see how the electron geometry around each atom determines the three-dimensional structure of molecules.`,
    },

  ],
}

export default {
  id: 'chem-2-2-covalent-bonds',
  slug: 'covalent-bonds',
  chapter: 'chem.2',
  order: 2,
  title: 'Covalent Bonds',
  subtitle: 'When atoms share instead of steal — and how sharing builds the molecules of life.',
  tags: ['chemistry', 'bonding', 'covalent', 'lewis-structures', 'sigma', 'pi', 'double-bond', 'triple-bond', 'electronegativity'],
  hook: {
    question: 'If ionic bonding is a heist, what is covalent bonding — and why does it produce the almost infinite variety of molecules that make up life?',
    realWorldContext: 'Water, oxygen, DNA, proteins, gasoline — all held together by shared electron pairs. Covalent bonding is responsible for nearly every molecule in biology and organic chemistry.',
    previewVisualizationId: 'ScienceNotebook',
  },
  intuition: {
    prose: [
      'Covalent bonds form when atoms share electron pairs rather than transferring them outright.',
      'Each atom counts the shared electrons as its own, allowing both to complete their outer shells.',
      'Bond order (1, 2, or 3) determines bond strength and length: more shared pairs = shorter and stronger.',
      'Every bond has one sigma component (head-on overlap); double and triple bonds add pi components (sideways overlap) that restrict rotation.',
      'Unequal sharing between different atoms creates polar bonds with partial charges (δ+ and δ−).',
    ],
    callouts: [
      { type: 'important', title: 'Sigma vs. pi', body: 'Every bond — single, double, or triple — contains exactly one sigma bond (head-on overlap). Double bonds add one pi bond; triple bonds add two. Pi bonds restrict rotation and are more reactive than sigma bonds.' },
    ],
    visualizations: [{ id: 'ScienceNotebook', title: 'Covalent Bonds', props: { lesson: LESSON_CHEM_2_2 } }],
  },
  math: { prose: [], callouts: [], visualizations: [] },
  rigor: { prose: [], callouts: [], visualizations: [] },
  examples: [], challenges: [],
  mentalModel: [
    'Covalent bond: atoms share electrons so both reach a full outer shell.',
    'Bond order = number of shared pairs. Higher order = shorter + stronger bond.',
    'Single bond: 1 sigma. Double bond: 1 sigma + 1 pi. Triple bond: 1 sigma + 2 pi.',
    'Sigma bonds allow rotation; pi bonds restrict it (orbital alignment must be maintained).',
    'Nonpolar covalent: identical atoms, equal sharing (ΔEN ≈ 0).',
    'Polar covalent: different atoms, unequal sharing (0.4 ≤ ΔEN < 1.7), creates δ+ and δ−.',
    'Ionic: essentially complete transfer (ΔEN ≥ 1.7).',
    'Covalent compounds: discrete molecules, lower melting points, non-conductive when dissolved.',
    'Network covalent solids (diamond): 3D covalent network — extremely hard.',
  ],
  checkpoints: ['read-intuition'],
  quiz: [],
}

export { LESSON_CHEM_2_2 }
