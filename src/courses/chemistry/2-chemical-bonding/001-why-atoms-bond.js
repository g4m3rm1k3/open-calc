// Chemistry · Chapter 2 · Lesson 0
// Why Atoms Bond

const LESSON_CHEM_2_0 = {
  title: 'Why Atoms Bond',
  subtitle: 'Atoms do not bond because they want to — they bond because bonding lowers their energy.',
  sequential: true,

  cells: [

    {
      type: 'markdown',
      instruction: `### Chapter 2: Why Atoms Bond

You have now met the three particles inside an atom, and you have seen how the periodic table maps the pattern of outer electron shells. This chapter is where the real chemistry begins.

In Chapter 1 we kept saying: *atoms with incomplete outer shells are reactive*. But reactive just means "tends to interact." It does not explain the mechanism. What actually happens when two atoms come close together? What drives them to connect? What holds them together once they do?

The short answer is: **energy**.

An atom with an incomplete outer shell is in a higher energy state than it could be. When it bonds with another atom, the resulting arrangement has lower energy than the two atoms did separately. Lower energy means more stable. More stable means the arrangement persists. That persistence is what we call a chemical bond.

This chapter covers three types of bond:

**Ionic bonds** — one atom transfers one or more electrons to another. The result is two oppositely charged ions that attract each other electrostatically. Table salt is the canonical example.

**Covalent bonds** — two atoms share electrons. Neither fully takes from the other; both use the shared pair to partially fill their outer shells. Water and methane are examples.

**Metallic bonds** — electrons are not owned by any particular atom but flow freely through a lattice of positive ions. This is what makes metals conduct electricity and be malleable.

This first lesson establishes the underlying reason all three types exist: the drive toward lower energy. Once you see that, each bond type is just a different strategy for achieving the same goal.`,
    },

    {
      type: 'js',
      instruction: `### Energy and stability — the real reason atoms bond

Think about a ball on a hill. At the top it has high potential energy. Roll it down and it reaches a valley — lower energy, stable, no tendency to move further without an external push.

Atoms work the same way. An isolated sodium atom has one lonely electron in its outer shell. That configuration has higher energy than sodium could have. A nearby chlorine atom has seven electrons in its outer shell — one slot empty, also higher energy than it could be.

When they interact, the sodium electron moves to chlorine's outer shell. Both atoms now have full outer shells. The combined system has significantly lower energy than the two isolated atoms did. That energy difference is released — as heat and light when the reaction occurs. The lower-energy state is stable, and the two ions stay together.

**The interactive below shows this energy landscape.** Drag the sodium atom toward the chlorine atom and watch the energy curve. The dip in the middle is the bond — the lowest energy point, where the system is most stable.`,
      html: `<div class="scene">
  <div class="top-label">Drag Na toward Cl to see the energy landscape</div>
  <canvas id="bond-cv" width="540" height="280"></canvas>
  <div class="energy-display">
    <div class="e-item">
      <div class="e-label">Distance</div>
      <div class="e-val" id="dist-val">Far apart</div>
    </div>
    <div class="e-item">
      <div class="e-label">System energy</div>
      <div class="e-val" id="energy-val">High</div>
    </div>
    <div class="e-item">
      <div class="e-label">State</div>
      <div class="e-val" id="state-val">Separate atoms</div>
    </div>
  </div>
  <input type="range" id="dist-slider" min="0" max="100" value="0" style="width:100%">
  <div class="slider-labels"><span>Far</span><span>Bond distance</span><span>Too close</span></div>
</div>`,
      css: `body{margin:0;padding:14px;font-family:sans-serif}
.scene{display:flex;flex-direction:column;gap:10px}
.top-label{font-size:12px;color:var(--color-text-secondary,#64748b);font-weight:500}
canvas{border-radius:10px;display:block;width:100%}
.energy-display{display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px}
.e-item{border:1px solid var(--color-border-tertiary,#e2e8f0);border-radius:8px;padding:9px 12px;background:var(--color-background-secondary,#f8fafc)}
.e-label{font-size:10px;text-transform:uppercase;letter-spacing:.08em;color:var(--color-text-secondary,#64748b);margin-bottom:3px}
.e-val{font-size:13px;font-weight:500;color:var(--color-text-primary,#1e293b);font-family:monospace}
.slider-labels{display:flex;justify-content:space-between;font-size:11px;color:var(--color-text-secondary,#64748b)}`,
      startCode: `var cv=document.getElementById('bond-cv'),ctx=cv.getContext('2d');
var slider=document.getElementById('dist-slider');

function getEnergy(t){
  var r=3-t/50*2.2;
  if(r<0.5)r=0.5;
  var E=4*(Math.pow(1/r,12)-Math.pow(1/r,6));
  return E;
}

function draw(t){
  ctx.clearRect(0,0,cv.width,cv.height);
  var W=cv.width,H=cv.height;

  ctx.fillStyle='var(--color-background-secondary,#f8fafc)';
  ctx.beginPath();ctx.roundRect(0,0,W,H,8);ctx.fill();

  var midY=H*0.55;
  var scaleY=60;

  ctx.beginPath();
  for(var i=0;i<=100;i++){
    var E=getEnergy(i);
    var x=40+i*(W-80)/100;
    var y=midY-E*scaleY;
    if(y<10)y=10;if(y>H-30)y=H-30;
    if(i===0)ctx.moveTo(x,y);else ctx.lineTo(x,y);
  }
  ctx.strokeStyle='#6366f1';ctx.lineWidth=2.5;ctx.stroke();

  ctx.strokeStyle='rgba(148,163,184,0.4)';ctx.lineWidth=1;
  ctx.beginPath();ctx.moveTo(35,10);ctx.lineTo(35,H-20);ctx.stroke();
  ctx.beginPath();ctx.moveTo(35,midY);ctx.lineTo(W-10,midY);ctx.stroke();

  ctx.fillStyle='#94a3b8';ctx.font='10px sans-serif';ctx.textAlign='center';
  ctx.fillText('Repulsion (too close)',W*0.2,20);
  ctx.fillText('→ Distance between atoms →',W*0.6,H-6);
  ctx.fillStyle='#6366f1';ctx.font='10px sans-serif';ctx.textAlign='right';
  ctx.fillText('High energy',32,18);
  ctx.fillStyle='#4ade80';ctx.fillText('Low energy (bond)',32,midY+4+scaleY*0.8);

  var curE=getEnergy(t);
  var curX=40+t*(W-80)/100;
  var curY=midY-curE*scaleY;
  if(curY<10)curY=10;if(curY>H-30)curY=H-30;

  ctx.setLineDash([4,3]);
  ctx.strokeStyle='rgba(251,191,36,0.6)';ctx.lineWidth=1;
  ctx.beginPath();ctx.moveTo(curX,curY+8);ctx.lineTo(curX,H-20);ctx.stroke();
  ctx.setLineDash([]);

  ctx.beginPath();ctx.arc(curX,curY,7,0,Math.PI*2);
  var isNearBond=t>35&&t<65;
  ctx.fillStyle=isNearBond?'#4ade80':'#f87171';
  ctx.fill();ctx.strokeStyle='white';ctx.lineWidth=2;ctx.stroke();

  var naX=80+t*1.2;
  var clX=W-90;
  if(naX>clX-30)naX=clX-30;

  ctx.beginPath();ctx.arc(naX,H-50,16,0,Math.PI*2);
  ctx.fillStyle='#f87171';ctx.fill();
  ctx.fillStyle='white';ctx.font='500 10px monospace';ctx.textAlign='center';ctx.textBaseline='middle';
  ctx.fillText('Na',naX,H-50);

  ctx.beginPath();ctx.arc(clX,H-50,20,0,Math.PI*2);
  ctx.fillStyle='#4ade80';ctx.fill();
  ctx.fillStyle='#052e16';ctx.font='500 10px monospace';
  ctx.fillText('Cl',clX,H-50);

  if(t>40&&t<80){
    var alpha=Math.min((t-40)/20,1)*Math.min((80-t)/20,1);
    var ex=naX+(clX-naX)*((t-40)/40);
    ctx.beginPath();ctx.arc(ex,H-68,5,0,Math.PI*2);
    ctx.fillStyle='rgba(56,189,248,'+alpha+')';ctx.fill();
    ctx.font='9px sans-serif';ctx.fillStyle='rgba(56,189,248,'+alpha+')';ctx.textAlign='center';
    ctx.fillText('e\u207B',ex,H-80);
  }

  if(t>60){
    var alpha2=Math.min((t-60)/20,1);
    ctx.fillStyle='rgba(248,113,113,'+alpha2+')';ctx.font='10px sans-serif';ctx.textAlign='center';
    ctx.fillText('Na\u207A',naX,H-72);
    ctx.fillStyle='rgba(74,222,128,'+alpha2+')';
    ctx.fillText('Cl\u207B',clX,H-76);
  }

  var dist=t<20?'Far apart':t<40?'Approaching':t<60?'Bond forming':t<75?'Bond distance (stable)':'Too close \u2014 repulsion';
  var energyTxt=curE>0.5?'Very high':curE>0?'High':curE>-0.5?'Moderate':curE<-0.8?'Minimum (bonded)':'Low';
  var state=t<30?'Separate atoms':t<55?'Electron transferring':t<70?'Ionic bond formed':'Nuclei repelling';
  document.getElementById('dist-val').textContent=dist;
  document.getElementById('energy-val').textContent=energyTxt;
  document.getElementById('state-val').textContent=state;
}

slider.oninput=function(){draw(+slider.value);};
draw(0);`,
      outputHeight: 500,
    },

    {
      type: 'markdown',
      instruction: `### What you just saw

The energy curve has a characteristic shape:
- **Far apart**: energy is near zero. The atoms do not feel each other.
- **Approaching**: energy decreases as the atoms attract. This is the region where the bond forms.
- **Bond distance**: the energy minimum. This is the equilibrium bond length — the distance at which the atoms naturally sit. The system is most stable here.
- **Too close**: energy rises steeply as the electron clouds and nuclei repel each other. You cannot push atoms through each other.

The depth of that energy well tells you how strong the bond is. A deep well means a lot of energy must be supplied to pull the atoms apart — a strong bond. A shallow well means a weak bond.

This picture — approach, energy minimum, repulsion if pushed too close — is universal. Every bond, ionic or covalent, has this shape. What varies is the depth of the well and the distance at which it occurs.

One more thing to notice: the energy released when a bond forms is exactly the energy required to break it. Bond formation releases energy. Bond breaking requires energy input. This is why burning (breaking and reforming bonds) releases heat — the new bonds formed (in CO₂ and H₂O) are lower energy than the original bonds in wood and oxygen. The energy difference is released as heat and light.`,
    },

    {
      type: 'js',
      instruction: `### Ionic vs covalent — two strategies for the same goal

When two atoms bond, they are both trying to achieve a lower-energy configuration — ideally a full outer shell. But there are two fundamentally different ways to do this:

**Strategy 1 — Transfer.** One atom gives its outer electron(s) to the other. This works best when one atom has very few valence electrons (easy to give away) and the other has nearly a full shell (easy to fill). The donor becomes a positive ion; the acceptor becomes a negative ion. They attract electrostatically. This is an **ionic bond**.

**Strategy 2 — Share.** Both atoms contribute one or more electrons to a shared pair that both atoms count toward their outer shell. Neither atom loses its electrons — they occupy a region between the two nuclei, attracted to both. This is a **covalent bond**.

Which strategy wins depends on the electronegativity difference between the two atoms. A large difference (one atom pulls much harder) leads to transfer → ionic. A small difference (atoms pull similarly) leads to sharing → covalent.

The interactive below lets you combine pairs of atoms and see which bond type forms and why.`,
      html: `<div class="scene">
  <div class="pair-selector">
    <div class="pair-label">Choose a pair:</div>
    <div class="pair-buttons" id="pair-btns"></div>
  </div>
  <div class="bond-display">
    <canvas id="bond-type-cv" width="400" height="220"></canvas>
    <div class="bond-info" id="bond-info"></div>
  </div>
  <div class="eneg-bar-wrap">
    <div class="eneg-label">Electronegativity difference: <span id="eneg-diff">—</span></div>
    <div class="eneg-track">
      <div class="eneg-fill" id="eneg-fill"></div>
      <div class="eneg-zones">
        <span>Nonpolar covalent</span>
        <span>Polar covalent</span>
        <span>Ionic</span>
      </div>
    </div>
  </div>
</div>`,
      css: `body{margin:0;padding:14px;font-family:sans-serif}
.scene{display:flex;flex-direction:column;gap:14px}
.pair-selector{display:flex;align-items:center;gap:10px;flex-wrap:wrap}
.pair-label{font-size:12px;font-weight:500;color:var(--color-text-secondary,#64748b)}
.pair-buttons{display:flex;gap:6px;flex-wrap:wrap}
.pair-btn{padding:6px 14px;border-radius:8px;border:1.5px solid var(--color-border-secondary,#e2e8f0);background:var(--color-background-secondary,#f8fafc);cursor:pointer;font-size:12px;font-family:monospace;font-weight:600;color:var(--color-text-primary,#1e293b);transition:all .15s}
.pair-btn.active{border-color:#38bdf8;background:rgba(56,189,248,0.12);color:#0ea5e9}
.bond-display{display:grid;grid-template-columns:400px 1fr;gap:14px;align-items:center}
canvas{border-radius:10px;display:block;background:radial-gradient(ellipse at 50% 50%,#0a1535 0%,#050b18 100%)}
.bond-info{display:flex;flex-direction:column;gap:8px}
.bi-type{font-size:18px;font-weight:600;color:var(--color-text-primary,#1e293b)}
.bi-sub{font-size:12px;color:var(--color-text-secondary,#64748b)}
.bi-desc{font-size:13px;color:var(--color-text-primary,#1e293b);line-height:1.65}
.bi-example{font-size:12px;color:var(--color-text-secondary,#64748b);font-style:italic}
.eneg-bar-wrap{display:flex;flex-direction:column;gap:6px}
.eneg-label{font-size:12px;color:var(--color-text-primary,#1e293b);font-weight:500}
.eneg-label span{font-family:monospace;color:#38bdf8}
.eneg-track{position:relative;height:20px;border-radius:10px;background:linear-gradient(to right,#a78bfa,#38bdf8,#f97316);overflow:hidden}
.eneg-fill{position:absolute;right:0;top:0;height:100%;background:rgba(0,0,0,0.5);transition:width .4s}
.eneg-zones{position:absolute;inset:0;display:flex;justify-content:space-around;align-items:center}
.eneg-zones span{font-size:9px;color:rgba(255,255,255,0.9);font-weight:600;letter-spacing:.02em}`,
      startCode: `var PAIRS = [
  {
    label:'H \u2014 H', a:{sym:'H',eneg:2.20,color:'#e2e8f0',r:14},
    b:{sym:'H',eneg:2.20,color:'#e2e8f0',r:14},
    type:'Nonpolar covalent',
    diff:0.00,
    desc:'Identical atoms share electrons perfectly equally. The electron pair sits exactly between the two nuclei. No dipole \u2014 completely symmetrical.',
    example:'H\u2082 gas \u2014 the simplest molecule'
  },
  {
    label:'C \u2014 H', a:{sym:'C',eneg:2.55,color:'#94a3b8',r:16},
    b:{sym:'H',eneg:2.20,color:'#e2e8f0',r:14},
    type:'Nonpolar covalent',
    diff:0.35,
    desc:'Very similar electronegativities \u2014 electrons shared nearly equally. C-H bonds are the backbone of organic chemistry. Virtually no dipole.',
    example:'Methane (CH\u2084), all hydrocarbons'
  },
  {
    label:'O \u2014 H', a:{sym:'O',eneg:3.44,color:'#f87171',r:16},
    b:{sym:'H',eneg:2.20,color:'#e2e8f0',r:14},
    type:'Polar covalent',
    diff:1.24,
    desc:'Oxygen pulls electrons significantly harder than hydrogen. The shared electrons spend more time near oxygen, giving it a partial negative charge (\u03b4\u2212) and hydrogen a partial positive charge (\u03b4+). This polarity is what makes water stick to itself.',
    example:'Water (H\u2082O) \u2014 the most important polar bond'
  },
  {
    label:'N \u2014 H', a:{sym:'N',eneg:3.04,color:'#60a5fa',r:16},
    b:{sym:'H',eneg:2.20,color:'#e2e8f0',r:14},
    type:'Polar covalent',
    diff:0.84,
    desc:'Nitrogen pulls electrons harder than hydrogen \u2014 the bond is polar but less extreme than O-H. Ammonia (NH\u2083) has a permanent dipole and can form hydrogen bonds.',
    example:'Ammonia (NH\u2083), amino groups in proteins'
  },
  {
    label:'Na \u2014 Cl', a:{sym:'Na',eneg:0.93,color:'#f97316',r:18},
    b:{sym:'Cl',eneg:3.16,color:'#4ade80',r:18},
    type:'Ionic',
    diff:2.23,
    desc:'Massive electronegativity difference \u2014 sodium has almost no pull on its outer electron while chlorine desperately wants one more. The electron transfers almost completely. Na becomes Na\u207A, Cl becomes Cl\u207B. Electrostatic attraction holds them together.',
    example:'Table salt (NaCl)'
  },
  {
    label:'Mg \u2014 O', a:{sym:'Mg',eneg:1.31,color:'#a3e635',r:18},
    b:{sym:'O',eneg:3.44,color:'#f87171',r:16},
    type:'Ionic',
    diff:2.13,
    desc:'Magnesium loses 2 electrons (Mg\u00b2\u207A), oxygen gains 2 (O\u00b2\u207B). Very strong ionic bond \u2014 MgO has an extremely high melting point of 2852\u00b0C.',
    example:'Magnesium oxide (MgO) \u2014 used in furnace linings'
  },
];

var cv=document.getElementById('bond-type-cv'),ctx=cv.getContext('2d');
var btns=document.getElementById('pair-btns');
var selected=0;

PAIRS.forEach(function(p,i){
  var btn=document.createElement('button');
  btn.className='pair-btn'+(i===0?' active':'');
  btn.textContent=p.label;
  btn.onclick=function(){
    selected=i;
    document.querySelectorAll('.pair-btn').forEach(function(b,j){b.classList.toggle('active',j===i);});
    render(i);
  };
  btns.appendChild(btn);
});

function drawBond(pair){
  ctx.clearRect(0,0,400,220);
  var cx=200,cy=110;
  var isIonic=pair.type==='Ionic';
  var isPolar=pair.type==='Polar covalent';

  var aX=cx-70,bX=cx+70;

  if(!isIonic){
    var cloudAlpha=isPolar?0.18:0.28;
    var cloudOffset=isPolar?12:0;
    var g=ctx.createRadialGradient(cx+cloudOffset,cy,0,cx+cloudOffset,cy,52);
    g.addColorStop(0,'rgba(56,189,248,'+(cloudAlpha+0.1)+')');
    g.addColorStop(1,'rgba(56,189,248,0)');
    ctx.fillStyle=g;
    ctx.beginPath();ctx.ellipse(cx+cloudOffset,cy,60,30,0,0,Math.PI*2);ctx.fill();

    ctx.beginPath();ctx.arc(cx-8+cloudOffset,cy,4,0,Math.PI*2);
    ctx.fillStyle='#38bdf8';ctx.fill();
    ctx.beginPath();ctx.arc(cx+8+cloudOffset,cy,4,0,Math.PI*2);
    ctx.fillStyle='#38bdf8';ctx.fill();
  }

  ctx.beginPath();
  ctx.moveTo(aX+pair.a.r,cy);ctx.lineTo(bX-pair.b.r,cy);
  ctx.strokeStyle=isIonic?'rgba(251,191,36,0.5)':'rgba(56,189,248,0.5)';
  ctx.lineWidth=isIonic?2:3;
  ctx.setLineDash(isIonic?[6,4]:[]);
  ctx.stroke();ctx.setLineDash([]);

  ctx.beginPath();ctx.arc(aX,cy,pair.a.r,0,Math.PI*2);
  ctx.fillStyle=pair.a.color;ctx.fill();
  ctx.fillStyle='rgba(0,0,0,0.5)';ctx.font='500 10px monospace';
  ctx.textAlign='center';ctx.textBaseline='middle';
  ctx.fillText(pair.a.sym,aX,cy);

  ctx.beginPath();ctx.arc(bX,cy,pair.b.r,0,Math.PI*2);
  ctx.fillStyle=pair.b.color;ctx.fill();
  ctx.fillStyle='rgba(0,0,0,0.5)';
  ctx.fillText(pair.b.sym,bX,cy);

  if(isIonic){
    ctx.strokeStyle='#38bdf8';ctx.lineWidth=1.5;
    ctx.beginPath();ctx.moveTo(aX+pair.a.r+4,cy-8);ctx.lineTo(bX-pair.b.r-4,cy-8);ctx.stroke();
    ctx.fillStyle='#38bdf8';
    ctx.beginPath();ctx.moveTo(bX-pair.b.r-4,cy-8);ctx.lineTo(bX-pair.b.r-12,cy-13);ctx.lineTo(bX-pair.b.r-12,cy-3);ctx.closePath();ctx.fill();
    ctx.font='10px sans-serif';ctx.textAlign='center';ctx.fillText('e\u207B transfer',cx,cy-18);
    ctx.font='11px sans-serif';ctx.fillStyle='#f97316';ctx.fillText(pair.a.sym+'\u207A',aX,cy+pair.a.r+14);
    ctx.fillStyle='#4ade80';ctx.fillText(pair.b.sym+'\u207B',bX,cy+pair.b.r+14);
  }

  if(isPolar){
    ctx.font='12px sans-serif';
    ctx.fillStyle='rgba(96,165,250,0.8)';ctx.textAlign='center';
    ctx.fillText('\u03b4+',aX,cy+pair.a.r+14);
    ctx.fillStyle='rgba(248,113,113,0.8)';
    ctx.fillText('\u03b4\u2212',bX,cy+pair.b.r+14);
    ctx.strokeStyle='rgba(251,191,36,0.7)';ctx.lineWidth=2;
    ctx.beginPath();ctx.moveTo(aX+pair.a.r+8,cy+22);ctx.lineTo(bX-pair.b.r-8,cy+22);ctx.stroke();
    ctx.fillStyle='rgba(251,191,36,0.7)';
    ctx.beginPath();ctx.moveTo(bX-pair.b.r-8,cy+22);ctx.lineTo(bX-pair.b.r-16,cy+17);ctx.lineTo(bX-pair.b.r-16,cy+27);ctx.closePath();ctx.fill();
    ctx.font='9px sans-serif';ctx.textAlign='center';ctx.fillStyle='rgba(251,191,36,0.7)';
    ctx.fillText('dipole',cx,cy+36);
  }
}

function render(i){
  var p=PAIRS[i];
  drawBond(p);

  var typeColor=p.type==='Ionic'?'#f97316':p.type==='Polar covalent'?'#38bdf8':'#a78bfa';
  document.getElementById('bond-info').innerHTML=
    '<div class="bi-type" style="color:'+typeColor+'">'+p.type+'</div>'+
    '<div class="bi-sub">\u0394EN = '+p.diff.toFixed(2)+'</div>'+
    '<div class="bi-desc">'+p.desc+'</div>'+
    '<div class="bi-example">Example: '+p.example+'</div>';

  var maxDiff=3.5;
  var fillPct=(1-p.diff/maxDiff)*100;
  document.getElementById('eneg-fill').style.width=fillPct+'%';
  document.getElementById('eneg-diff').textContent=p.diff.toFixed(2);
}
render(0);`,
      outputHeight: 520,
    },

    {
      type: 'markdown',
      instruction: `### The electronegativity rule of thumb

The electronegativity difference between two bonding atoms predicts the bond type:

- **ΔEN < 0.5**: Nonpolar covalent. Electrons shared almost equally. No significant dipole.
- **ΔEN 0.5–1.7**: Polar covalent. Electrons shared unequally. The more electronegative atom carries a partial negative charge (δ−).
- **ΔEN > 1.7**: Ionic. Electron transfer is so complete that we treat it as two ions.

These cutoffs are guidelines, not hard rules. The transition from polar covalent to ionic is gradual, not sudden. Even in "ionic" sodium chloride, the electron is not 100% transferred — it is just transferred enough that the ionic model is a useful approximation.

The practical consequence: molecules with polar bonds have uneven electron distributions, which makes them interact with each other in specific ways — hydrogen bonding, dipole-dipole forces, solubility behaviour. Everything in Chapter 3 about why substances have different properties traces back to whether their bonds are polar or not.

For now, remember the gradient: **nonpolar ↔ polar covalent ↔ ionic** is a continuous spectrum of electron-sharing, from perfectly equal to fully transferred.`,
    },

    {
      type: 'js',
      instruction: `### Bond strength — why some bonds are harder to break

Not all bonds are equal. The energy required to break a bond — the **bond dissociation energy** — varies enormously between bond types and between different atoms.

The chart below shows bond dissociation energies for common bonds. A few things to notice:

- Triple bonds are much stronger than double bonds, which are stronger than single bonds between the same atoms
- The N≡N triple bond in nitrogen gas is exceptionally strong — this is why atmospheric nitrogen is so unreactive, and why breaking it to make fertiliser requires extreme conditions
- O-H bonds in water are stronger than you might expect — this contributes to water's unusual properties
- C-C bonds are moderately strong and can be strung together in chains — the foundation of organic chemistry`,
      html: `<div class="scene">
  <div class="chart-label">Bond dissociation energies (kJ/mol) — energy needed to break one mole of bonds</div>
  <canvas id="bde-cv" width="520" height="340"></canvas>
  <div class="bde-note">Higher bars = stronger bonds = more energy required to break = more energy released when formed.</div>
</div>`,
      css: `body{margin:0;padding:14px;font-family:sans-serif}
.scene{display:flex;flex-direction:column;gap:10px}
.chart-label{font-size:11px;font-weight:500;color:var(--color-text-secondary,#64748b);text-transform:uppercase;letter-spacing:.06em}
canvas{border-radius:10px;display:block;width:100%}
.bde-note{font-size:12px;color:var(--color-text-secondary,#64748b);line-height:1.6;border-left:2px solid var(--color-border-secondary,#e2e8f0);padding-left:10px}`,
      startCode: `var cv=document.getElementById('bde-cv'),ctx=cv.getContext('2d');
var W=cv.width,H=cv.height;

var bonds=[
  {label:'H\u2014H',  energy:436, color:'#a78bfa', type:'single'},
  {label:'C\u2014H',  energy:413, color:'#a78bfa', type:'single'},
  {label:'C\u2014C',  energy:347, color:'#94a3b8', type:'single'},
  {label:'C=C',  energy:614, color:'#60a5fa', type:'double'},
  {label:'C\u2261C',  energy:839, color:'#38bdf8', type:'triple'},
  {label:'N\u2014N',  energy:163, color:'#fbbf24', type:'single'},
  {label:'N=N',  energy:418, color:'#fb923c', type:'double'},
  {label:'N\u2261N',  energy:945, color:'#f97316', type:'triple'},
  {label:'O\u2014H',  energy:463, color:'#f87171', type:'single'},
  {label:'O=O',  energy:498, color:'#ef4444', type:'double'},
  {label:'C=O',  energy:799, color:'#4ade80', type:'double'},
  {label:'Na\u2014Cl',energy:410, color:'#fde68a', type:'ionic'},
];

var maxE=1000;
var padL=54,padR=14,padT=20,padB=40;
var chartW=W-padL-padR,chartH=H-padT-padB;
var barW=(chartW/bonds.length)*0.65;
var gap=(chartW/bonds.length)*0.35;

ctx.clearRect(0,0,W,H);

ctx.strokeStyle='rgba(148,163,184,0.3)';ctx.lineWidth=1;
[200,400,600,800,1000].forEach(function(v){
  var y=padT+chartH-(v/maxE)*chartH;
  ctx.beginPath();ctx.moveTo(padL,y);ctx.lineTo(W-padR,y);ctx.stroke();
  ctx.fillStyle='#94a3b8';ctx.font='10px monospace';ctx.textAlign='right';
  ctx.fillText(v,padL-4,y+3);
});

bonds.forEach(function(b,i){
  var x=padL+i*(chartW/bonds.length)+gap/2;
  var barH=(b.energy/maxE)*chartH;
  var y=padT+chartH-barH;

  ctx.beginPath();ctx.roundRect(x,y,barW,barH,3);
  ctx.fillStyle=b.color+'cc';ctx.fill();
  ctx.strokeStyle=b.color;ctx.lineWidth=1;ctx.stroke();

  if(barH>22){
    ctx.fillStyle='rgba(0,0,0,0.6)';ctx.font='500 9px monospace';
    ctx.textAlign='center';
    ctx.fillText(b.energy,x+barW/2,y+13);
  }

  ctx.fillStyle='var(--color-text-primary,#1e293b)';ctx.font='500 10px monospace';
  ctx.textAlign='center';
  ctx.fillText(b.label,x+barW/2,H-6);
});

ctx.save();ctx.translate(12,H/2);ctx.rotate(-Math.PI/2);
ctx.fillStyle='#94a3b8';ctx.font='10px sans-serif';ctx.textAlign='center';
ctx.fillText('kJ / mol',0,0);ctx.restore();

var nIdx=bonds.findIndex(function(b){return b.label==='N\u2261N';});
var nx=padL+nIdx*(chartW/bonds.length)+gap/2;
ctx.strokeStyle='rgba(249,115,22,0.5)';ctx.lineWidth=1.5;ctx.setLineDash([3,3]);
ctx.strokeRect(nx-3,padT,barW+6,chartH);ctx.setLineDash([]);
ctx.fillStyle='#f97316';ctx.font='9px sans-serif';ctx.textAlign='center';
ctx.fillText('Strongest',nx+barW/2,padT-4);`,
      outputHeight: 440,
    },

    {
      type: 'markdown',
      instruction: `### Check your understanding`,
    },

    {
      type: 'challenge',
      instruction: `Why does bond formation release energy rather than require it?`,
      options: [
        { label: 'A', text: 'Bonds are formed by adding energy to atoms, which is later stored in the bond and released when used.' },
        { label: 'B', text: 'When atoms bond, the combined system reaches a lower energy state than the separated atoms. The difference in energy is released — usually as heat or light.' },
        { label: 'C', text: 'Bond formation releases energy because the atoms become heavier when bonded, and extra mass converts to energy via E=mc².' },
        { label: 'D', text: 'Bond formation does not release energy — it always requires energy input.' },
      ],
      check: (label) => label === 'B',
      successMessage: 'Correct. The bonded state is lower energy than the separated atoms. The energy difference must go somewhere — it is released to the surroundings. This is why reactions that form strong bonds from weaker ones (like combustion) release so much heat.',
      failMessage: 'Think about the energy landscape: the bonded state sits in an energy valley — lower energy than the separated atoms. Moving from high energy to low energy releases the difference. Breaking a bond is the reverse: you must put energy in to climb back out of the valley.',
      html: '', css: `body{margin:0;padding:0;font-family:sans-serif}`, startCode: '',
      outputHeight: 280,
    },

    {
      type: 'challenge',
      instruction: `The electronegativity of oxygen is 3.44 and hydrogen is 2.20. The electronegativity of carbon is 2.55. Which bond is more polar: O-H or C-H?`,
      options: [
        { label: 'A', text: 'C-H, because carbon is a larger atom and its electrons are farther from the nucleus.' },
        { label: 'B', text: 'O-H, because the electronegativity difference is larger (1.24 vs 0.35), so the electrons are pulled more unevenly toward oxygen.' },
        { label: 'C', text: 'Both bonds are equally polar because they both involve hydrogen.' },
        { label: 'D', text: 'C-H, because carbon forms more bonds than oxygen.' },
      ],
      check: (label) => label === 'B',
      successMessage: "Correct. O-H: ΔEN = 3.44 − 2.20 = 1.24. C-H: ΔEN = 2.55 − 2.20 = 0.35. The larger the electronegativity difference, the more unequally electrons are shared, and the more polar the bond. This is why water (with O-H bonds) is polar and dissolves ionic compounds, while hydrocarbons (with C-H bonds) are nonpolar and don't mix with water.",
      failMessage: "Polarity is determined by electronegativity difference, not atomic size or bond count. O-H has ΔEN = 1.24; C-H has ΔEN = 0.35. The O-H bond is about 3.5x more polar than C-H. This difference explains why water behaves so differently from methane.",
      html: '', css: `body{margin:0;padding:0;font-family:sans-serif}`, startCode: '',
      outputHeight: 290,
    },

    {
      type: 'challenge',
      instruction: `The N≡N triple bond in nitrogen gas has a dissociation energy of 945 kJ/mol — the strongest bond in the chart. Yet nitrogen makes up 78% of Earth's atmosphere and is largely unreactive. How do these facts fit together?`,
      options: [
        { label: 'A', text: 'They contradict each other. A highly reactive element should have weak bonds.' },
        { label: 'B', text: 'The strong bond is exactly why nitrogen is unreactive. Breaking N≡N requires 945 kJ/mol — more than almost any other bond. So nitrogen stays as N₂ rather than reacting with other substances, because the energy cost of breaking the bond is too high under normal conditions.' },
        { label: 'C', text: 'Nitrogen is reactive — it just reacts so quickly that it has all already reacted and settled into its stable form.' },
        { label: 'D', text: 'Bond strength and reactivity are unrelated. Nitrogen is unreactive because it has too many electrons.' },
      ],
      check: (label) => label === 'B',
      successMessage: "Correct — and this is a crucial insight. Strong bonds mean low reactivity, not high reactivity. Breaking N≡N requires an enormous energy input (945 kJ/mol), which is why nitrogen only reacts under extreme conditions: lightning discharges, the Haber process at 400°C and 200 atm with an iron catalyst, or specialised nitrogen-fixing bacteria with their own enzyme. The strength of the bond is the barrier to reaction.",
      failMessage: "Strong bond = hard to break = low reactivity. Reactivity depends on whether the energy barrier to breaking existing bonds and forming new ones can be overcome. N≡N has the highest bond energy of any common molecule — it simply costs too much energy to break under normal conditions. This is what makes the atmosphere stable.",
      html: '', css: `body{margin:0;padding:0;font-family:sans-serif}`, startCode: '',
      outputHeight: 300,
    },

    {
      type: 'challenge',
      instruction: `Sodium chloride (NaCl) is ionic. Methane (CH₄) is covalent. What is the key difference between the two atoms in NaCl that leads to ionic bonding, compared to the atoms in CH₄?`,
      options: [
        { label: 'A', text: 'NaCl contains a metal and a nonmetal. CH₄ contains only nonmetals. Metals always form ionic bonds.' },
        { label: 'B', text: 'NaCl has a large electronegativity difference (Na: 0.93, Cl: 3.16, ΔEN = 2.23) — so large that the electron transfers completely. CH₄ has a tiny difference (C: 2.55, H: 2.20, ΔEN = 0.35), so electrons are shared nearly equally.' },
        { label: 'C', text: 'NaCl dissolves in water, which makes it ionic. CH₄ does not dissolve in water.' },
        { label: 'D', text: 'Sodium has more protons than carbon, making its nucleus strong enough to pull electrons from chlorine.' },
      ],
      check: (label) => label === 'B',
      successMessage: "Correct — though option A is a useful shorthand, it is not the underlying reason. The real reason is electronegativity difference. When ΔEN is large enough, the more electronegative atom pulls electrons so strongly that transfer (not sharing) occurs. Na's outer electron is held so loosely (low electronegativity) and Cl wants another electron so badly (high electronegativity, 7 valence electrons) that the electron essentially migrates completely. C and H have similar electronegativities, so sharing is the preferred arrangement.",
      failMessage: "The metal/nonmetal rule is a useful shortcut but not the underlying cause. The cause is electronegativity difference. ΔEN = 2.23 for NaCl → electron transfer → ionic. ΔEN = 0.35 for C-H → equal sharing → covalent. The same principle applies to all bonds: the larger the pull difference, the more the electrons shift toward one atom.",
      html: '', css: `body{margin:0;padding:0;font-family:sans-serif}`, startCode: '',
      outputHeight: 310,
    },

  ],
}

export default {
  id: 'chem-2-0-why-atoms-bond',
  slug: 'why-atoms-bond',
  chapter: 'chem.2',
  order: 0,
  title: 'Why Atoms Bond',
  subtitle: 'Atoms bond because bonding lowers their energy. Everything else follows from that.',
  tags: ['chemistry', 'bonding', 'ionic', 'covalent', 'electronegativity', 'bond-energy', 'energy'],
  hook: {
    question: 'What actually happens when two atoms form a bond — and why does the bond stay together?',
    realWorldContext: 'Every chemical reaction is a rearrangement of bonds. Understanding why bonds form and how strong they are explains everything from why fire releases heat to why nitrogen is safe to breathe.',
    previewVisualizationId: 'ScienceNotebook',
  },
  intuition: {
    prose: [
      'Atoms bond because the bonded state is lower energy than the separated state — and systems naturally move toward lower energy.',
      'Ionic bonds form when electronegativity difference is large — one atom transfers electrons to the other.',
      'Covalent bonds form when electronegativity difference is small — atoms share electrons.',
      'Bond strength (dissociation energy) determines how much energy is released when the bond forms and how much is needed to break it.',
    ],
    callouts: [{ type: 'important', title: 'The energy principle', body: 'Bond formation releases energy. Bond breaking requires energy. Every chemical reaction is a balance of these two.' }],
    visualizations: [{ id: 'ScienceNotebook', title: 'Why Atoms Bond', props: { lesson: LESSON_CHEM_2_0 } }],
  },
  math: { prose: [], callouts: [], visualizations: [] },
  rigor: { prose: [], callouts: [], visualizations: [] },
  examples: [], challenges: [],
  mentalModel: [
    'Bonds form because the bonded state has lower energy than separated atoms.',
    'The energy released when a bond forms equals the energy needed to break it.',
    'Ionic bond: large ΔEN → electron transfer → oppositely charged ions attract.',
    'Covalent bond: small ΔEN → electron sharing → both atoms count shared pair toward their shell.',
    'Bond strength = dissociation energy. Strong bond = hard to break = low reactivity (N≡N).',
    'Polar covalent: intermediate ΔEN → unequal sharing → partial charges (δ+ and δ−).',
  ],
  checkpoints: ['read-intuition'],
  quiz: [],
}

export { LESSON_CHEM_2_0 }
