// Chemistry · Chapter 2 · Lesson 1
// Ionic Bonds

const LESSON_CHEM_2_1 = {
  title: 'Ionic Bonds',
  subtitle: 'How atoms steal electrons — and build the salt on your table.',
  sequential: true,

  cells: [

    // ── Section 1 ───────────────────────────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `### Why Would an Atom Give Away an Electron?

Atoms don't bond out of generosity. They bond because bonding makes them more stable. To understand why sodium hands chlorine an electron — apparently for free — you need to understand what "stable" means for an atom.

Think back to electron shells. The outermost shell is the one that matters. Atoms with **full outer shells** (like the noble gases: helium, neon, argon) are chemically inert. They don't react, they don't bond, they just exist in serene stability.

**Sodium (Na)** has 11 electrons: 2 in the first shell, 8 in the second, and 1 lonely electron in the third shell. That outer shell is almost empty. It would take enormous energy to fill it with 7 more electrons — but it takes very little energy to strip that single outer electron away, leaving sodium with a full second shell and the same electron configuration as neon.

**Chlorine (Cl)** has 17 electrons: 2, 8, and 7 in its outer shell. It's one electron away from a full outer shell — the same configuration as argon. Chlorine is desperately electron-hungry.

The result is almost inevitable: sodium loses its outer electron, chlorine gains it. Both reach noble-gas stability. But now sodium has one more proton than it has electrons, so it carries a **+1 charge** — we call it Na⁺. And chlorine has one more electron than protons, carrying a **−1 charge** — we call it Cl⁻.

Opposite charges attract. Na⁺ and Cl⁻ are pulled toward each other with significant electrostatic force. That attraction *is* the ionic bond.`,
    },

    // ── Visual 1 — Electron transfer animation ──────────────────────────────────
    {
      type: 'js',
      instruction: `### Electron transfer — watch it happen

The animation below cycles through approach, electron transfer, and the resulting ionic attraction. Na gives away its outer electron; both atoms reach noble-gas configurations and become oppositely charged ions.`,
      html: `<canvas id="cv" width="700" height="320"></canvas>`,
      css: `body{margin:0;background:#0a0f1e;display:flex;justify-content:center}
canvas{display:block;width:100%;max-width:700px}`,
      startCode: `var canvas=document.getElementById('cv');
var ctx=canvas.getContext('2d');
var W=canvas.width,H=canvas.height;
var t=0;

var NAColor='#f97316',CLColor='#a78bfa',ELColor='#facc15',bgColor='#0a0f1e';

function drawAtom(x,y,r,color,label,charge,shells){
  ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);
  ctx.fillStyle=color;ctx.fill();
  ctx.fillStyle='#fff';ctx.font='bold 14px monospace';
  ctx.textAlign='center';ctx.textBaseline='middle';
  ctx.fillText(label,x,y);
  for(var s=0;s<shells.length;s++){
    var shellR=r+24+s*26;
    ctx.beginPath();ctx.arc(x,y,shellR,0,Math.PI*2);
    ctx.strokeStyle='rgba(255,255,255,0.15)';ctx.lineWidth=1;ctx.stroke();
    var count=shells[s];
    for(var e=0;e<count;e++){
      var angle=(e/count)*Math.PI*2+t*(s%2===0?0.4:-0.3);
      var ex=x+Math.cos(angle)*shellR,ey=y+Math.sin(angle)*shellR;
      ctx.beginPath();ctx.arc(ex,ey,4,0,Math.PI*2);
      ctx.fillStyle=ELColor;ctx.fill();
    }
  }
  if(charge!==''){
    ctx.fillStyle=charge==='+'?'#f97316':'#a78bfa';
    ctx.beginPath();ctx.arc(x+r+10,y-r-10,14,0,Math.PI*2);ctx.fill();
    ctx.fillStyle='#fff';ctx.font='bold 13px monospace';
    ctx.fillText(charge,x+r+10,y-r-10);
  }
}

function getTransferElectron(prog){
  var naX=180,naY=H/2,clX=520,clY=H/2;
  var startX=naX+90,startY=naY-20,endX=clX-90,endY=clY+20;
  var cx1=W/2,cy1=H/2-80;
  var bx=(1-prog)*(1-prog)*startX+2*(1-prog)*prog*cx1+prog*prog*endX;
  var by=(1-prog)*(1-prog)*startY+2*(1-prog)*prog*cy1+prog*prog*endY;
  return{x:bx,y:by};
}

function draw(){
  ctx.clearRect(0,0,W,H);
  ctx.fillStyle=bgColor;ctx.fillRect(0,0,W,H);
  var cycle=t%6;
  var naX,clX;
  var baseNaX=180,baseClX=520;
  if(cycle<1.5){var approach=cycle/1.5;naX=baseNaX+approach*30;clX=baseClX-approach*30;}
  else if(cycle<3.5){naX=baseNaX+30;clX=baseClX-30;}
  else{var drift=(cycle-3.5)/2.5;naX=baseNaX+30-drift*40;clX=baseClX-30+drift*40;}
  var naY=H/2,clY=H/2;
  var isIon=cycle>=3.0;
  var showTransfer=cycle>=1.5&&cycle<3.5;
  var naShells=isIon?[2,8]:[2,8,1];
  var clShells=isIon?[2,8,8]:[2,8,7];
  drawAtom(naX,naY,28,NAColor,'Na',isIon?'+':'',naShells);
  drawAtom(clX,clY,28,CLColor,'Cl',isIon?'\u2212':'',clShells);
  if(showTransfer){
    var ep=getTransferElectron(Math.min(1,(cycle-1.5)/2.0));
    ctx.beginPath();ctx.arc(ep.x,ep.y,5,0,Math.PI*2);
    ctx.fillStyle=ELColor;ctx.shadowColor=ELColor;ctx.shadowBlur=12;ctx.fill();ctx.shadowBlur=0;
    for(var tr=1;tr<=5;tr++){
      var trProg=Math.max(0,(cycle-1.5)/2.0-tr*0.04);
      var tep=getTransferElectron(Math.min(1,trProg));
      ctx.beginPath();ctx.arc(tep.x,tep.y,3,0,Math.PI*2);
      ctx.fillStyle='rgba(250,204,21,'+(0.3-tr*0.05)+')';ctx.fill();
    }
  }
  if(isIon&&cycle>3.5){
    var midX=(naX+clX)/2,arrowY=H/2+95;
    ctx.strokeStyle='rgba(255,255,255,0.5)';ctx.lineWidth=2;ctx.setLineDash([5,4]);
    ctx.beginPath();ctx.moveTo(naX+28,arrowY);ctx.lineTo(clX-28,arrowY);ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle='rgba(255,255,255,0.6)';
    ctx.beginPath();ctx.moveTo(naX+36,arrowY-5);ctx.lineTo(naX+28,arrowY);ctx.lineTo(naX+36,arrowY+5);ctx.fill();
    ctx.beginPath();ctx.moveTo(clX-36,arrowY-5);ctx.lineTo(clX-28,arrowY);ctx.lineTo(clX-36,arrowY+5);ctx.fill();
    ctx.fillStyle='rgba(255,255,255,0.55)';ctx.font='12px monospace';ctx.textAlign='center';
    ctx.fillText('electrostatic attraction',midX,arrowY+20);
  }
  ctx.font='bold 13px monospace';ctx.textAlign='center';
  ctx.fillStyle=NAColor;ctx.fillText(isIon?'Na\u207A (sodium ion)':'Na (sodium)',naX,H-30);
  ctx.fillStyle=CLColor;ctx.fillText(isIon?'Cl\u207B (chloride ion)':'Cl (chlorine)',clX,H-30);
  var pl=cycle<1.5?'Sodium and chlorine approach...':cycle<3.0?'Electron transfers to chlorine':'Na\u207A and Cl\u207B attract each other';
  ctx.fillStyle='rgba(255,255,255,0.7)';ctx.font='13px monospace';ctx.textAlign='center';
  ctx.fillText(pl,W/2,28);
  t+=0.015;
  requestAnimationFrame(draw);
}
draw();`,
      outputHeight: 340,
    },

    // ── Section 2 ───────────────────────────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `### From Atoms to Ions: The Language of Charge

Once an atom gains or loses electrons, it becomes an **ion**. The terminology is simple:

- **Cation** — a positively charged ion. It *lost* electrons. Na⁺ is a sodium cation. The name stays the same as the element: "sodium ion."
- **Anion** — a negatively charged ion. It *gained* electrons. Cl⁻ is a chloride anion. Notice the name changes slightly: chlorine → chloride. Sulfur → sulfide. Oxygen → oxide. The "−ide" ending is the convention for monatomic anions.

The amount of charge tells you how many electrons were transferred. Magnesium (Mg) has 2 outer electrons and loses both, forming Mg²⁺. Oxygen has 6 outer electrons and needs 2 more to fill its shell, so it gains 2 electrons and becomes O²⁻.

The periodic table organises elements partly by how many electrons they tend to lose or gain:
- **Group 1** (Na, K, Li…): always form +1 cations
- **Group 2** (Mg, Ca…): always form +2 cations
- **Group 16** (O, S…): always form −2 anions
- **Group 17** (F, Cl, Br…): always form −1 anions

This predictability is one of the most powerful features of the periodic table. Once you know where an element sits, you know what ion it forms.`,
    },

    // ── Challenge 1 ─────────────────────────────────────────────────────────────
    {
      type: 'challenge',
      instruction: `Magnesium (Mg) is in Group 2 of the periodic table, with 2 valence electrons. When it forms an ionic bond with oxygen (which needs 2 electrons to complete its shell), what ions are produced?`,
      options: [
        { label: 'A', text: 'Mg⁻ and O⁺' },
        { label: 'B', text: 'Mg²⁺ and O²⁻' },
        { label: 'C', text: 'Mg⁺ and O⁻' },
        { label: 'D', text: 'Mg²⁻ and O²⁺' },
      ],
      check: (label) => label === 'B',
      successMessage: 'Correct! Mg loses its 2 valence electrons (→ Mg²⁺) and O gains 2 electrons to fill its outer shell (→ O²⁻). This forms magnesium oxide, MgO.',
      failMessage: 'Think about it this way: Mg has 2 electrons in its outer shell it wants to shed. O needs 2 electrons to complete its shell. Mg loses 2 → becomes positive. O gains 2 → becomes negative.',
      html: '', css: `body{margin:0;padding:0;font-family:sans-serif}`, startCode: '',
      outputHeight: 300,
    },

    // ── Section 3 ───────────────────────────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `### Why Salt Forms Crystals, Not Molecules

Here's something subtle about ionic bonding that surprises many students: **NaCl is not a molecule.** There's no single Na⁺ bonded to a single Cl⁻, the way two hydrogen atoms form H₂.

Instead, ionic compounds form **crystal lattices** — enormous three-dimensional arrays where every Na⁺ is surrounded by six Cl⁻ neighbours, and every Cl⁻ is surrounded by six Na⁺ neighbours. The electrostatic attraction doesn't stop at one neighbour; it extends in all directions through the whole structure.

This is because the electrostatic force has no preferred direction. Na⁺ is attracted to every Cl⁻ nearby, not just one. The lowest energy arrangement turns out to be the one where cations and anions alternate in a perfect cubic grid — which is exactly what X-ray crystallography shows when you look at real salt.

The "NaCl" formula is called a **formula unit** — it tells you the simplest ratio of ions, not a discrete molecule. A single grain of table salt contains roughly 10¹⁸ (a billion billion) ion pairs.

This architecture has dramatic consequences for the properties of ionic compounds.`,
    },

    // ── Visual 2 — Crystal lattice ───────────────────────────────────────────────
    {
      type: 'js',
      instruction: `### The NaCl crystal lattice — rotating 3D view

Every Na⁺ is surrounded by exactly 6 Cl⁻ neighbours (above, below, left, right, front, back), and vice versa. This repeating pattern extends throughout the entire crystal.`,
      html: `<canvas id="cv" width="700" height="360"></canvas>`,
      css: `body{margin:0;background:#0a0f1e;display:flex;justify-content:center}
canvas{display:block;width:100%;max-width:700px}`,
      startCode: `var canvas=document.getElementById('cv');
var ctx=canvas.getContext('2d');
var W=canvas.width,H=canvas.height;
var t=0;

function iso(x,y,z){
  var scale=38;
  var px=W/2+(x-z)*scale*0.866;
  var py=H/2-30+(x+z)*scale*0.5-y*scale;
  return{x:px,y:py};
}

var grid=[];
for(var gx=0;gx<4;gx++)for(var gy=0;gy<4;gy++)for(var gz=0;gz<4;gz++){
  var isNa=(gx+gy+gz)%2===0;
  grid.push({gx:gx-1.5,gy:gy-1.5,gz:gz-1.5,isNa:isNa});
}

function draw(){
  ctx.clearRect(0,0,W,H);
  ctx.fillStyle='#0a0f1e';ctx.fillRect(0,0,W,H);
  var angle=t*0.15;
  var cosA=Math.cos(angle),sinA=Math.sin(angle);
  var rotated=grid.map(function(g){
    var rx=g.gx*cosA-g.gz*sinA,rz=g.gx*sinA+g.gz*cosA;
    var proj=iso(rx,g.gy,rz);
    return{px:proj.x,py:proj.y,isNa:g.isNa,depth:rx+rz+g.gy,ogx:g.gx,ogy:g.gy,ogz:g.gz};
  });
  rotated.sort(function(a,b){return a.depth-b.depth;});

  for(var i=0;i<grid.length;i++){
    var a=grid[i];
    for(var j=i+1;j<grid.length;j++){
      var b=grid[j];
      var dx=Math.abs(a.gx-b.gx),dy=Math.abs(a.gy-b.gy),dz=Math.abs(a.gz-b.gz);
      if(dx+dy+dz===1){
        var ra={gx:a.gx*cosA-a.gz*sinA,gy:a.gy,gz:a.gx*sinA+a.gz*cosA};
        var rb={gx:b.gx*cosA-b.gz*sinA,gy:b.gy,gz:b.gx*sinA+b.gz*cosA};
        var pa=iso(ra.gx,ra.gy,ra.gz),pb=iso(rb.gx,rb.gy,rb.gz);
        ctx.beginPath();ctx.moveTo(pa.x,pa.y);ctx.lineTo(pb.x,pb.y);
        ctx.strokeStyle='rgba(255,255,255,0.1)';ctx.lineWidth=1;ctx.stroke();
      }
    }
  }

  for(var k=0;k<rotated.length;k++){
    var node=rotated[k];
    var r=node.isNa?11:15;
    var color=node.isNa?'#f97316':'#a78bfa';
    var label=node.isNa?'Na\u207A':'Cl\u207B';
    ctx.beginPath();ctx.arc(node.px,node.py,r+5,0,Math.PI*2);
    var grd=ctx.createRadialGradient(node.px,node.py,r*0.5,node.px,node.py,r+6);
    grd.addColorStop(0,'rgba(140,140,140,0.2)');grd.addColorStop(1,'rgba(0,0,0,0)');
    ctx.fillStyle=grd;ctx.fill();
    ctx.beginPath();ctx.arc(node.px,node.py,r,0,Math.PI*2);
    ctx.fillStyle=color;ctx.fill();
    ctx.fillStyle='#fff';ctx.font='bold 8px monospace';
    ctx.textAlign='center';ctx.textBaseline='middle';
    ctx.fillText(label,node.px,node.py);
  }

  ctx.fillStyle='#f97316';ctx.beginPath();ctx.arc(W-120,H-60,8,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='rgba(255,255,255,0.7)';ctx.font='12px monospace';ctx.textAlign='left';
  ctx.fillText('Na\u207A (sodium)',W-107,H-57);
  ctx.fillStyle='#a78bfa';ctx.beginPath();ctx.arc(W-120,H-38,10,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='rgba(255,255,255,0.7)';
  ctx.fillText('Cl\u207B (chloride)',W-107,H-35);
  ctx.fillStyle='rgba(255,255,255,0.55)';ctx.textAlign='center';ctx.font='13px monospace';
  ctx.fillText('NaCl crystal lattice \u2014 each ion surrounded by 6 of the opposite charge',W/2,H-14);

  t+=1;requestAnimationFrame(draw);
}
draw();`,
      outputHeight: 380,
    },

    // ── Challenge 2 ─────────────────────────────────────────────────────────────
    {
      type: 'challenge',
      instruction: `In the NaCl crystal lattice, how many chloride ions (Cl⁻) directly surround each sodium ion (Na⁺)?`,
      options: [
        { label: 'A', text: '4 — one at each corner of a square' },
        { label: 'B', text: '8 — one at each corner of a cube' },
        { label: 'C', text: '6 — one on each face of an octahedron' },
        { label: 'D', text: '12 — maximum packing arrangement' },
      ],
      check: (label) => label === 'C',
      successMessage: "Correct! Six — above, below, left, right, front, and back. The cubic NaCl lattice gives each ion exactly 6 nearest neighbours of opposite charge. This is called a coordination number of 6.",
      failMessage: "Visualize a single Na⁺ sitting at the centre. Cl⁻ ions occupy the positions directly above, below, to the left, right, in front, and behind — that's the 6 faces of an octahedron. The coordination number is 6.",
      html: '', css: `body{margin:0;padding:0;font-family:sans-serif}`, startCode: '',
      outputHeight: 300,
    },

    // ── Section 4 ───────────────────────────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `### Properties of Ionic Compounds: What the Lattice Predicts

The crystal lattice structure directly explains the strange and fascinating properties of ionic compounds.

**High melting and boiling points.** To melt NaCl, you have to supply enough energy to break ions away from the lattice. But every ion is held in place by six opposite-charge neighbours, and those neighbours have their own neighbours, all of them tugging back. The electrostatic attraction is strong and extends throughout the entire crystal. Result: NaCl melts at **801°C** and boils at **1413°C**. Compare that to water (0°C and 100°C) or ethanol (−114°C and 78°C).

**Brittle despite being hard.** Ionic crystals are hard — you can't scratch NaCl easily — but smash them with a hammer and they **shatter cleanly along flat planes**. In the crystal, every layer alternates +−+−. If you apply a shearing force and shift one layer by one position, suddenly + ions are aligned next to + ions all along the plane. Massive repulsion — the crystal snaps rather than bends.

**Dissolving in water and conducting electricity.** Water molecules are polar — they have slightly positive and slightly negative ends. The positive ends are attracted to Cl⁻, and the negative ends to Na⁺. These attractions pull ions out of the lattice one by one. Once dissolved, the free ions carry electric charge through the solution. But solid NaCl does not conduct electricity because the ions are locked in place.`,
    },

    // ── Visual 3 — Dissolving animation ─────────────────────────────────────────
    {
      type: 'js',
      instruction: `### Dissolution — ions leaving the lattice

Watch as water molecules (polar O shown in blue, H in grey) pull individual ions out of the crystal and into solution. Free ions in solution carry electric current; locked ions in the solid cannot.`,
      html: `<canvas id="cv" width="700" height="320"></canvas>`,
      css: `body{margin:0;background:#0a0f1e;display:flex;justify-content:center}
canvas{display:block;width:100%;max-width:700px}`,
      startCode: `var canvas=document.getElementById('cv');
var ctx=canvas.getContext('2d');
var W=canvas.width,H=canvas.height;
var t=0;

var crystalIons=[];
for(var row=0;row<3;row++)for(var col=0;col<4;col++){
  crystalIons.push({
    homeX:80+col*36,homeY:140+row*36,isNa:(row+col)%2===0,
    released:false,releaseTime:60+(row*4+col)*28+Math.random()*20,
    x:0,y:0,vx:0,vy:0,targetX:0,targetY:0
  });
}
crystalIons.forEach(function(ion){ion.x=ion.homeX;ion.y=ion.homeY;});

var waterMols=[];
for(var w=0;w<18;w++){
  waterMols.push({x:400+Math.random()*260,y:60+Math.random()*240,angle:Math.random()*Math.PI*2,speed:0.5+Math.random()*0.5});
}

function drawWaterMol(x,y,angle){
  ctx.beginPath();ctx.arc(x,y,7,0,Math.PI*2);
  ctx.fillStyle='#38bdf8';ctx.fill();
  ctx.fillStyle='#fff';ctx.font='7px monospace';ctx.textAlign='center';ctx.textBaseline='middle';
  ctx.fillText('O',x,y);
  [angle+0.5,angle-0.5].forEach(function(ha){
    var hx=x+Math.cos(ha)*13,hy=y+Math.sin(ha)*13;
    ctx.beginPath();ctx.moveTo(x+Math.cos(ha)*7,y+Math.sin(ha)*7);ctx.lineTo(hx,hy);
    ctx.strokeStyle='rgba(255,255,255,0.3)';ctx.lineWidth=1;ctx.stroke();
    ctx.beginPath();ctx.arc(hx,hy,4,0,Math.PI*2);
    ctx.fillStyle='#e2e8f0';ctx.fill();
    ctx.fillStyle='#334155';ctx.font='6px monospace';ctx.fillText('H',hx,hy);
  });
}

function drawIon(x,y,isNa){
  var r=isNa?9:12,color=isNa?'#f97316':'#a78bfa';
  ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fillStyle=color;ctx.fill();
  ctx.fillStyle='#fff';ctx.font='bold 8px monospace';ctx.textAlign='center';ctx.textBaseline='middle';
  ctx.fillText(isNa?'Na+':'Cl-',x,y);
}

function draw(){
  ctx.clearRect(0,0,W,H);ctx.fillStyle='#0a0f1e';ctx.fillRect(0,0,W,H);

  ctx.strokeStyle='rgba(255,255,255,0.1)';ctx.lineWidth=1;ctx.setLineDash([5,5]);
  ctx.beginPath();ctx.moveTo(350,20);ctx.lineTo(350,H-20);ctx.stroke();ctx.setLineDash([]);

  ctx.fillStyle='rgba(255,255,255,0.5)';ctx.font='12px monospace';ctx.textAlign='center';
  ctx.fillText('Crystal lattice',175,32);
  ctx.fillText('Dissolved in water (solution)',525,32);

  ctx.fillStyle='rgba(14,116,144,0.15)';ctx.fillRect(355,45,335,255);
  waterMols.forEach(function(wm){
    wm.angle+=0.012;wm.x+=Math.cos(wm.angle*0.3)*0.4;wm.y+=Math.sin(wm.angle*0.5)*0.3;
    wm.x=Math.max(365,Math.min(685,wm.x));wm.y=Math.max(55,Math.min(295,wm.y));
    drawWaterMol(wm.x,wm.y,wm.angle);
  });

  for(var i=0;i<crystalIons.length;i++)for(var j=i+1;j<crystalIons.length;j++){
    var a=crystalIons[i],b=crystalIons[j];
    if(a.released||b.released)continue;
    if(Math.abs(a.homeX-b.homeX)+Math.abs(a.homeY-b.homeY)===36){
      ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);
      ctx.strokeStyle='rgba(255,255,255,0.18)';ctx.lineWidth=1.5;ctx.stroke();
    }
  }

  crystalIons.forEach(function(ion){
    if(!ion.released&&t>ion.releaseTime){
      ion.released=true;ion.vx=1.5+Math.random()*1.5;ion.vy=(Math.random()-0.5)*2;
      ion.targetX=410+Math.random()*250;ion.targetY=80+Math.random()*200;
    }
    if(ion.released){
      var dx=ion.targetX-ion.x,dy=ion.targetY-ion.y;
      ion.x+=dx*0.025;ion.y+=dy*0.025;
      if(Math.abs(dx)<5&&Math.abs(dy)<5){ion.targetX=410+Math.random()*250;ion.targetY=80+Math.random()*200;}
    }
    drawIon(ion.x,ion.y,ion.isNa);
  });

  ctx.fillStyle='rgba(255,255,255,0.45)';ctx.font='11px monospace';ctx.textAlign='center';
  ctx.fillText('Water molecules pull ions out of the lattice \u2014 free ions conduct electricity',W/2,H-10);
  t++;requestAnimationFrame(draw);
}
draw();`,
      outputHeight: 340,
    },

    // ── Challenge 3 ─────────────────────────────────────────────────────────────
    {
      type: 'challenge',
      instruction: `A student tests two white powders with a conductivity meter in water. Powder A conducts electricity when dissolved. Powder B does not conduct. Which powder is most likely an ionic compound?`,
      options: [
        { label: 'A', text: 'Powder A, because dissolved ions carry electric charge' },
        { label: 'B', text: 'Powder B, because ionic compounds resist electricity' },
        { label: 'C', text: "Both could be ionic — the test doesn't distinguish them" },
        { label: 'D', text: 'Neither — only metals conduct electricity in water' },
      ],
      check: (label) => label === 'A',
      successMessage: 'Correct! When an ionic compound dissolves, it releases free-moving ions. Those ions carry charge through the solution, completing the circuit. This is the definition of electrolytic conduction.',
      failMessage: "Remember: ionic compounds release mobile ions when dissolved. Mobile charged particles = electrical conduction. Powder A conducts because its dissolved ions can carry charge. Powder B lacks free ions — likely a molecular (covalent) compound.",
      html: '', css: `body{margin:0;padding:0;font-family:sans-serif}`, startCode: '',
      outputHeight: 300,
    },

    // ── Section 5 ───────────────────────────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `### What Makes a Bond "Ionic"? Electronegativity

How do we know when a bond is ionic versus something else? The answer involves **electronegativity** — a measure of how strongly an atom attracts electrons toward itself.

The concept was formalised by Linus Pauling in the 1930s. He assigned every element a number (the Pauling scale) where fluorine sits at 4.0. Metals sit at the low end (sodium is 0.93, potassium is 0.82) — they give electrons away easily.

When two atoms form a bond, we look at the **difference in electronegativity**:

- **ΔEN < 0.4**: electrons shared nearly equally → **nonpolar covalent bond** (like H₂ or Cl₂)
- **0.4 ≤ ΔEN < 1.7**: unequal sharing → **polar covalent bond** (like H₂O or HCl)
- **ΔEN ≥ 1.7**: essentially complete electron transfer → **ionic bond** (like NaCl, where ΔEN = 3.16 − 0.93 = 2.23)

These cutoffs are guidelines, not hard walls — the ionic/covalent distinction is a continuous spectrum. Even NaCl has some small degree of electron sharing. But the electronegativity difference correctly predicts the character of most bonds.`,
    },

    // ── Visual 4 — Electronegativity scale (static) ──────────────────────────────
    {
      type: 'js',
      instruction: `### Bond character vs. electronegativity difference

The gradient bar below shows how bond type changes continuously with ΔEN. Common molecules are plotted at their actual values. H₂ sits at 0 (identical atoms, perfect sharing); LiF sits near 3.0 (essentially complete transfer).`,
      html: `<canvas id="cv" width="700" height="280"></canvas>`,
      css: `body{margin:0;background:#0a0f1e;display:flex;justify-content:center}
canvas{display:block;width:100%;max-width:700px}`,
      startCode: `var canvas=document.getElementById('cv'),ctx=canvas.getContext('2d');
var W=canvas.width,H=canvas.height;
ctx.fillStyle='#0a0f1e';ctx.fillRect(0,0,W,H);

ctx.fillStyle='rgba(255,255,255,0.8)';ctx.font='bold 14px monospace';ctx.textAlign='center';
ctx.fillText('Bond Character vs. Electronegativity Difference (\u0394EN)',W/2,28);

var barX=60,barY=70,barW=W-120,barH=40;
var grad=ctx.createLinearGradient(barX,0,barX+barW,0);
grad.addColorStop(0,'#22d3ee');grad.addColorStop(0.35,'#818cf8');grad.addColorStop(1,'#f97316');
ctx.fillStyle=grad;ctx.beginPath();ctx.roundRect(barX,barY,barW,barH,8);ctx.fill();

ctx.fillStyle='rgba(255,255,255,0.9)';ctx.font='11px monospace';ctx.textAlign='center';
ctx.fillText('Nonpolar',barX+barW*0.1,barY+22);
ctx.fillText('Covalent',barX+barW*0.1,barY+36);
ctx.fillText('Polar Covalent',barX+barW*0.42,barY+22);
ctx.fillText('Ionic',barX+barW*0.88,barY+22);

var ticks=[0,0.4,1.7,3.3],maxDEN=3.3;
ticks.forEach(function(v){
  var tx=barX+(v/maxDEN)*barW;
  ctx.beginPath();ctx.moveTo(tx,barY+barH);ctx.lineTo(tx,barY+barH+10);
  ctx.strokeStyle='rgba(255,255,255,0.5)';ctx.lineWidth=1.5;ctx.stroke();
  ctx.fillStyle='rgba(255,255,255,0.6)';ctx.font='11px monospace';ctx.textAlign='center';
  ctx.fillText(v.toFixed(1),tx,barY+barH+22);
});

ctx.fillStyle='rgba(255,255,255,0.5)';ctx.font='11px monospace';ctx.textAlign='center';
ctx.fillText('\u0394EN (electronegativity difference)',W/2,barY+barH+40);

var examples=[
  {name:'H\u2082',den:0,y:170},{name:'HCl',den:0.96,y:170},
  {name:'H\u2082O',den:1.24,y:210},{name:'NaCl',den:2.23,y:170},
  {name:'MgO',den:2.3,y:210},{name:'LiF',den:3.0,y:170}
];
examples.forEach(function(ex){
  var ex_x=barX+(ex.den/maxDEN)*barW;
  ctx.beginPath();ctx.arc(ex_x,barY+barH/2,5,0,Math.PI*2);ctx.fillStyle='#fff';ctx.fill();
  ctx.beginPath();ctx.moveTo(ex_x,barY+barH);ctx.lineTo(ex_x,ex.y-14);
  ctx.strokeStyle='rgba(255,255,255,0.3)';ctx.lineWidth=1;ctx.setLineDash([3,3]);ctx.stroke();ctx.setLineDash([]);
  ctx.fillStyle='rgba(255,255,255,0.85)';ctx.font='bold 12px monospace';ctx.textAlign='center';
  ctx.fillText(ex.name,ex_x,ex.y);
  ctx.fillStyle='rgba(255,255,255,0.45)';ctx.font='10px monospace';
  ctx.fillText('\u0394EN='+ex.den,ex_x,ex.y+14);
});`,
      outputHeight: 300,
    },

    // ── Section 6 ───────────────────────────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `### Ionic Compounds All Around You

Table salt is the most famous ionic compound, but ionic bonds are everywhere:

**Calcium carbonate (CaCO₃)** — limestone, chalk, marble, and the shells of clams and oysters. It's Ca²⁺ and the polyatomic anion CO₃²⁻ (carbonate). When you take antacid tablets for heartburn, you're often swallowing CaCO₃ to neutralise stomach acid.

**Potassium chloride (KCl)** — looks like table salt, tastes slightly bitter, and is sold as a low-sodium salt substitute. Medically it's used in IV fluids to maintain the body's potassium balance. Your heart's electrical rhythm depends on K⁺ ions moving across cell membranes.

**Iron(III) oxide (Fe₂O₃)** — rust. The reddish-brown coating that forms on iron is an ionic compound: Fe³⁺ and O²⁻. The "III" in parentheses tells you iron is in the +3 oxidation state — some transition metals like iron can form multiple different ions.

**Sodium bicarbonate (NaHCO₃)** — baking soda. Na⁺ paired with the bicarbonate anion HCO₃⁻. When you add it to an acidic batter, it releases CO₂ gas, making the batter rise.

Each of these has high melting points, brittle crystal structures, and conducts electricity when dissolved — all consequences of the ionic lattice.`,
    },

    // ── Challenge 4 ─────────────────────────────────────────────────────────────
    {
      type: 'challenge',
      instruction: `The electronegativity of calcium (Ca) is 1.0 and the electronegativity of fluorine (F) is 4.0. Which statement best describes the bond in calcium fluoride (CaF₂)?`,
      options: [
        { label: 'A', text: 'Nonpolar covalent — the electrons are shared equally' },
        { label: 'B', text: 'Polar covalent — the electrons are shared unequally' },
        { label: 'C', text: 'Ionic — electrons transfer essentially completely from Ca to F' },
        { label: 'D', text: 'Metallic — electrons form a shared sea around both atoms' },
      ],
      check: (label) => label === 'C',
      successMessage: "Correct! ΔEN = 4.0 − 1.0 = 3.0, well above the 1.7 threshold for ionic bonding. Fluorine is so electronegative it pulls both of calcium's outer electrons away entirely. CaF₂ is a classic ionic compound, forming beautiful purple crystals (fluorite).",
      failMessage: "Calculate the electronegativity difference first: 4.0 − 1.0 = 3.0. With ΔEN ≥ 1.7, the bond is ionic — the electron transfer is essentially complete. Fluorine (the most electronegative element) completely strips calcium of its electrons.",
      html: '', css: `body{margin:0;padding:0;font-family:sans-serif}`, startCode: '',
      outputHeight: 300,
    },

    // ── Closing ──────────────────────────────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `### Putting It Together: The Ionic Bond at a Glance

Ionic bonding follows a clear logic once you see the pattern:

1. **One atom has low ionisation energy** — usually a metal on the left of the periodic table. It gives electrons away easily.
2. **Another atom has high electron affinity** — usually a nonmetal on the right. It eagerly accepts electrons.
3. **Electron transfer occurs** — the metal loses one or more electrons to the nonmetal.
4. **Both atoms reach noble-gas electron configurations** and become stable ions.
5. **Opposite charges attract** — the electrostatic force between ions is the ionic bond.
6. **Ions arrange into a crystal lattice** — not discrete molecules, but an infinite 3D grid optimised to minimise repulsion and maximise attraction.

The lattice structure explains everything: the hardness, the brittleness, the high melting points, the electrical conductivity when dissolved, and the clean cubic cleavage planes you see when you split a salt crystal.

In the next lesson we'll look at a completely different strategy atoms use to bond: instead of stealing electrons, they *share* them. That's covalent bonding — and it opens up the entire world of organic chemistry, DNA, and the molecules of life.`,
    },

  ],
}

export default {
  id: 'chem-2-1-ionic-bonds',
  slug: 'ionic-bonds',
  chapter: 'chem.2',
  order: 1,
  title: 'Ionic Bonds',
  subtitle: 'How atoms steal electrons — and build the salt on your table.',
  tags: ['chemistry', 'bonding', 'ionic', 'NaCl', 'crystal-lattice', 'electronegativity', 'ions'],
  hook: {
    question: 'Why does sodium willingly hand an electron to chlorine — and what holds the result together as a crystal?',
    realWorldContext: 'Table salt is a perfect ionic crystal. Every grain contains around 10¹⁸ ion pairs locked in a cubic lattice by pure electrostatic force — no covalent sharing, no molecular handshake.',
    previewVisualizationId: 'ScienceNotebook',
  },
  intuition: {
    prose: [
      'Ionic bonds form when one atom has very low electronegativity (easily gives away electrons) and another has very high electronegativity (eagerly accepts them).',
      'The atom that loses electrons becomes a positively charged cation; the atom that gains electrons becomes a negatively charged anion.',
      'Ionic compounds form crystal lattices — infinite 3D grids where each ion is surrounded by opposite-charge neighbours.',
      'The lattice explains hardness, brittleness, high melting points, and electrical conductivity when dissolved.',
    ],
    callouts: [{ type: 'important', title: 'Not a molecule', body: 'NaCl is not a molecule — it is a formula unit showing the simplest ion ratio. A grain of salt contains ~10¹⁸ ion pairs, all held together by electrostatic attraction in a crystal lattice.' }],
    visualizations: [{ id: 'ScienceNotebook', title: 'Ionic Bonds', props: { lesson: LESSON_CHEM_2_1 } }],
  },
  math: { prose: [], callouts: [], visualizations: [] },
  rigor: { prose: [], callouts: [], visualizations: [] },
  examples: [], challenges: [],
  mentalModel: [
    'Ionic bond: large ΔEN → one atom strips electrons from the other → oppositely charged ions form.',
    'Cation = lost electrons (positive). Anion = gained electrons (negative).',
    'Ions do not bond in pairs — they form crystal lattices, each ion surrounded by 6 of opposite charge.',
    'High melting points: breaking the lattice requires overcoming many simultaneous electrostatic attractions.',
    'Brittle: shearing the lattice aligns same-charge layers → repulsion snaps the crystal.',
    'Conducts when dissolved: free ions carry charge. Solid does not: ions are locked in the lattice.',
    'ΔEN ≥ 1.7 → ionic bond. ΔEN < 0.4 → nonpolar covalent. In between → polar covalent.',
  ],
  checkpoints: ['read-intuition'],
  quiz: [],
}

export { LESSON_CHEM_2_1 }
