// Chemistry · Chapter 4 · Lesson 0
// What Is a Chemical Reaction

const LESSON_CHEM_4_0 = {
  title: 'What Is a Chemical Reaction?',
  subtitle: 'Bonds breaking, bonds forming — and why mass never disappears.',
  sequential: true,

  cells: [

    // ── Section 1 ───────────────────────────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `### Something Fundamental Is Happening

Strike a match. The head flares into orange flame, then dies to a slow burn along the wooden stick. The wood blackens, shrinks, becomes ash and smoke. The solid stick is gone. Where did it go?

Drop a piece of magnesium ribbon into acid. It dissolves rapidly, bubbling furiously, and the solution heats up. The shiny metal has vanished. The acid has changed character.

Mix baking soda and vinegar. The mixture foams violently, the container grows cold. Something is escaping as gas. Something new has formed.

All of these are **chemical reactions** — processes in which substances are transformed into new substances with different properties. The atoms present at the start are still present at the end, but they have been rearranged. Old bonds have broken. New bonds have formed. The substances before and after are fundamentally different.

This is distinct from a **physical change**, in which the form of a substance changes but its chemical identity does not. Ice melting to water is a physical change — the H₂O molecules are unchanged, just rearranged. Dissolving salt in water is a physical change — the ions separate but remain Na⁺ and Cl⁻. Physical changes are reversible by physical means. Chemical reactions typically produce new substances that can only be converted back by further chemical reactions.

The distinction matters because it defines what chemistry is: the science of transforming matter by rearranging the bonds between atoms.`,
    },

    // ── Section 2 ───────────────────────────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `### What Actually Happens in a Chemical Reaction

At the molecular level, a chemical reaction is exactly one thing: **bonds break and new bonds form.**

Consider the simplest possible reaction — hydrogen gas reacting with fluorine gas to form hydrogen fluoride:

H₂ + F₂ → 2 HF

The H–H bond breaks. The F–F bond breaks. Two new H–F bonds form. The atoms are the same — 2 hydrogens, 2 fluorines — but their connectivity has changed completely. The properties of the products are utterly different from the properties of the reactants.

Breaking bonds requires energy — you have to overcome the electrostatic attraction holding the atoms together. Forming bonds releases energy — the new arrangement is more stable than the separated atoms. The **net energy change** of the reaction depends on whether more energy is released by bond formation than is consumed by bond breaking.

In the H₂ + F₂ reaction, the H–F bonds formed are much stronger than the H–H and F–F bonds broken — a lot of energy is released. This is an exothermic reaction and it is violent: the reaction of hydrogen and fluorine is explosive.

In other reactions — like photosynthesis, where plants use sunlight to convert CO₂ and H₂O into glucose — the bonds formed are weaker than the bonds broken, and energy must be continuously supplied (from light) to keep the reaction going.

**The atoms never disappear.** They are rearranged, but every atom present in the reactants must appear in the products. This is the **law of conservation of mass** — first stated by Antoine Lavoisier in 1789 and one of the foundational laws of chemistry.`,
    },

    // ── Visual 1 — Bond breaking and forming animation ─────────────────────────
    {
      type: 'js',
      instruction: `### H₂ + F₂ → 2 HF: bonds breaking and forming

The animation shows the reaction at the molecular level. Watch the H–H and F–F bonds break, then see H–F bonds form. The bond energy values show that the energy released by forming two H–F bonds (2 × 569 kJ/mol) far exceeds the energy needed to break H–H (436 kJ/mol) and F–F (159 kJ/mol). Net: −574 kJ/mol released.`,
      html: `<canvas id="cv" width="700" height="300"></canvas>`,
      css: `body{margin:0;background:#0a0f1e;display:flex;justify-content:center}
canvas{display:block;width:100%;max-width:700px}`,
      startCode: `var canvas=document.getElementById('cv');
var ctx=canvas.getContext('2d');
var W=canvas.width,H=canvas.height;
var t=0;

// Phases: 0-60 reactants, 60-120 bonds breaking, 120-180 atoms separate, 180-240 bonds forming, 240-300 products, loop
var CYCLE=300;

function drawAtom(x,y,sym,color,r){
  r=r||18;
  var grd=ctx.createRadialGradient(x-r*0.3,y-r*0.3,r*0.1,x,y,r);
  grd.addColorStop(0,lightenColor(color,0.4));grd.addColorStop(1,color);
  ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fillStyle=grd;ctx.fill();
  ctx.strokeStyle='rgba(255,255,255,0.3)';ctx.lineWidth=1.5;ctx.stroke();
  ctx.fillStyle='#fff';ctx.font='bold '+(r>14?'13':'10')+'px monospace';
  ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(sym,x,y);
}

function lightenColor(hex,amt){
  var r=parseInt(hex.slice(1,3),16),g=parseInt(hex.slice(3,5),16),b=parseInt(hex.slice(5,7),16);
  r=Math.min(255,Math.round(r+(255-r)*amt));g=Math.min(255,Math.round(g+(255-g)*amt));b=Math.min(255,Math.round(b+(255-b)*amt));
  return'#'+r.toString(16).padStart(2,'0')+g.toString(16).padStart(2,'0')+b.toString(16).padStart(2,'0');
}

function drawBond(x1,y1,x2,y2,color,alpha,wobble){
  wobble=wobble||0;
  ctx.beginPath();
  ctx.moveTo(x1+Math.sin(t*0.2)*wobble,y1+Math.cos(t*0.17)*wobble*0.5);
  ctx.lineTo(x2+Math.sin(t*0.2+1)*wobble,y2+Math.cos(t*0.17+1)*wobble*0.5);
  ctx.strokeStyle=color;ctx.lineWidth=4;ctx.globalAlpha=alpha;ctx.stroke();ctx.globalAlpha=1;
}

function easeInOut(t){return t<0.5?2*t*t:1-Math.pow(-2*t+2,2)/2;}
function lerp(a,b,t){return a+(b-a)*t;}

function draw(){
  ctx.clearRect(0,0,W,H);
  ctx.fillStyle='#0a0f1e';ctx.fillRect(0,0,W,H);

  var phase=t%CYCLE;
  var cy=H/2;

  // Atom positions at different phases
  // Reactants: H2 at left-center, F2 at right-center
  var H1rx=180,H2rx=230,Fy=cy,H1ry=cy-10,H2ry=cy+10;
  var F1rx=470,F2rx=520,F1ry=cy-10,F2ry=cy+10;
  // Products: HF on left side, HF on right side
  var H1px=180,F1px=230,H2px=470,F2px=520;

  var H1x,H1y,H2x,H2y,F1x,F1y,F2x,F2y;
  var hBondAlpha=1,fBondAlpha=1,hf1Alpha=0,hf2Alpha=0;
  var hBondWobble=0,fBondWobble=0;

  if(phase<60){
    // Reactants steady — vibrate gently
    var vib=Math.sin(t*0.12)*2;
    H1x=H1rx+vib;H1y=H1ry;H2x=H2rx-vib;H2y=H2ry;
    F1x=F1rx+vib;F1y=F1ry;F2x=F2rx-vib;F2y=F2ry;
    hBondAlpha=1;fBondAlpha=1;hf1Alpha=0;hf2Alpha=0;
    hBondWobble=1.5;fBondWobble=1.5;
  } else if(phase<120){
    // Bonds breaking: atoms spread apart
    var bp=easeInOut((phase-60)/60);
    H1x=lerp(H1rx,130,bp);H1y=lerp(H1ry,cy-40,bp);
    H2x=lerp(H2rx,280,bp);H2y=lerp(H2ry,cy+40,bp);
    F1x=lerp(F1rx,420,bp);F1y=lerp(F1ry,cy-40,bp);
    F2x=lerp(F2rx,570,bp);F2y=lerp(F2ry,cy+40,bp);
    hBondAlpha=1-bp;fBondAlpha=1-bp;hf1Alpha=0;hf2Alpha=0;
    hBondWobble=4*bp;fBondWobble=4*bp;
  } else if(phase<180){
    // Atoms separate and migrate toward products
    var sp=easeInOut((phase-120)/60);
    // H1 goes left, F1 comes to H1; H2 goes right, F2 comes to H2
    H1x=lerp(130,160,sp);H1y=lerp(cy-40,cy,sp);
    F1x=lerp(420,230,sp);F1y=lerp(cy-40,cy,sp);
    H2x=lerp(280,470,sp);H2y=lerp(cy+40,cy,sp);
    F2x=lerp(570,540,sp);F2y=lerp(cy+40,cy,sp);
    hBondAlpha=0;fBondAlpha=0;hf1Alpha=0;hf2Alpha=0;
  } else if(phase<240){
    // New H-F bonds forming
    var fp=easeInOut((phase-180)/60);
    H1x=160;H1y=cy;F1x=230;F1y=cy;
    H2x=470;H2y=cy;F2x=540;F2y=cy;
    hBondAlpha=0;fBondAlpha=0;hf1Alpha=fp;hf2Alpha=fp;
    // Snap together
    H1x=lerp(160,180,fp);F1x=lerp(230,230,fp);
    H2x=lerp(470,470,fp);F2x=lerp(540,520,fp);
  } else {
    // Products vibrating
    var pv=Math.sin(t*0.12)*2;
    H1x=180+pv;H1y=cy;F1x=230-pv;F1y=cy;
    H2x=470+pv;H2y=cy;F2x=520-pv;F2y=cy;
    hBondAlpha=0;fBondAlpha=0;hf1Alpha=1;hf2Alpha=1;
  }

  // Draw bonds
  if(hBondAlpha>0.01) drawBond(H1x,H1y,H2x,H2y,'#facc15',hBondAlpha,hBondWobble);
  if(fBondAlpha>0.01) drawBond(F1x,F1y,F2x,F2y,'#4ade80',fBondAlpha,fBondWobble);
  if(hf1Alpha>0.01) drawBond(H1x,H1y,F1x,F1y,'#38bdf8',hf1Alpha,0);
  if(hf2Alpha>0.01) drawBond(H2x,H2y,F2x,F2y,'#38bdf8',hf2Alpha,0);

  // Draw atoms
  drawAtom(H1x,H1y,'H','#e2e8f0',16);
  drawAtom(H2x,H2y,'H','#e2e8f0',16);
  drawAtom(F1x,F1y,'F','#4ade80',19);
  drawAtom(F2x,F2y,'F','#4ade80',19);

  // Phase label
  var phaseLabels=['H\u2082 + F\u2082  (reactants)','H\u2013H and F\u2013F bonds breaking...','Atoms rearranging...','New H\u2013F bonds forming...','2 HF  (products)'];
  var pi=phase<60?0:phase<120?1:phase<180?2:phase<240?3:4;
  ctx.fillStyle='rgba(255,255,255,0.7)';ctx.font='bold 14px monospace';ctx.textAlign='center';
  ctx.fillText(phaseLabels[pi],W/2,28);

  // Bond energy annotations
  if(phase<90){
    ctx.fillStyle='#facc15';ctx.font='11px monospace';ctx.textAlign='center';
    ctx.fillText('H\u2013H: 436 kJ/mol',(H1x+H2x)/2,Math.min(H1y,H2y)-24);
    ctx.fillStyle='#4ade80';
    ctx.fillText('F\u2013F: 159 kJ/mol',(F1x+F2x)/2,Math.min(F1y,F2y)-24);
  }
  if(phase>200&&phase<280){
    ctx.fillStyle='#38bdf8';ctx.font='11px monospace';ctx.textAlign='center';
    ctx.fillText('H\u2013F: 569 kJ/mol each',(H1x+F1x)/2,H1y-26);
  }

  // Energy summary at bottom
  ctx.fillStyle='rgba(255,255,255,0.35)';ctx.font='11px monospace';ctx.textAlign='center';
  ctx.fillText('Energy in: 436 + 159 = 595 kJ/mol    Energy out: 2 \u00d7 569 = 1138 kJ/mol    Net: \u22121138+595 = \u2212543 kJ/mol released',W/2,H-12);

  t++;requestAnimationFrame(draw);
}
draw();`,
      outputHeight: 320,
    },

    // ── Section 3 ───────────────────────────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `### Conservation of Mass: Lavoisier's Law

Before Antoine Lavoisier, chemists routinely observed what seemed like violations of common sense. When you burn wood, the ash weighs less than the wood. When you calcine (heat) a metal, it gains weight. How could matter appear and disappear?

Lavoisier solved the puzzle by carefully weighing everything — including the air involved. He showed that burning requires oxygen from the air. The "lost" weight of burning wood is actually carbon and hydrogen leaving as CO₂ and H₂O vapour, which weigh more than the oxygen consumed. The ash is lighter because most of the wood has escaped into the air, not because mass was destroyed.

His conclusion: **in any chemical reaction, the total mass of the reactants equals the total mass of the products.** Matter is neither created nor destroyed — only rearranged.

In equation form:
$$\\sum m_{\\text{reactants}} = \\sum m_{\\text{products}}$$

This law is the reason we **balance chemical equations**. A balanced equation has the same number of each type of atom on both sides — because atoms are conserved. If you write:

H₂ + O₂ → H₂O (unbalanced)

There are 2 oxygen atoms on the left but only 1 on the right. This equation violates conservation of mass. The correct balanced equation is:

2 H₂ + O₂ → 2 H₂O

Now both sides have 4 H and 2 O. The numbers in front of molecules (coefficients) are adjusted to achieve balance — we never change the subscripts inside a formula, because that would change what substance we're describing.`,
    },

    // ── Visual 2 — Equation balancer ───────────────────────────────────────────
    {
      type: 'js',
      instruction: `### Atom counting: balanced vs. unbalanced equations

The interactive below shows several reactions. Select one to see the atom count on each side. Green means balanced; red means unbalanced. Notice how adjusting coefficients in front of whole molecules (never subscripts inside them) brings both sides into balance.`,
      html: `<div style="padding:10px 14px 0;background:#0a0f1e;display:flex;gap:8px;flex-wrap:wrap" id="eq-btns"></div>
<canvas id="cv" width="700" height="300"></canvas>`,
      css: `body{margin:0;background:#0a0f1e;font-family:monospace}
canvas{display:block;width:100%;max-width:700px}`,
      startCode: `var canvas=document.getElementById('cv');
var ctx=canvas.getContext('2d');
var W=canvas.width,H=canvas.height;

var equations=[
  {
    label:'H₂ + O₂ → H₂O',
    balanced:false,
    lhs:[{mol:'H\u2082',coeff:1,atoms:{H:2}},{mol:'O\u2082',coeff:1,atoms:{O:2}}],
    rhs:[{mol:'H\u2082O',coeff:1,atoms:{H:2,O:1}}],
    fix:'2H\u2082 + O\u2082 \u2192 2H\u2082O',
    fixLhs:[{mol:'H\u2082',coeff:2,atoms:{H:2}},{mol:'O\u2082',coeff:1,atoms:{O:2}}],
    fixRhs:[{mol:'H\u2082O',coeff:2,atoms:{H:2,O:1}}],
    color:'#38bdf8'
  },
  {
    label:'N₂ + H₂ → NH₃',
    balanced:false,
    lhs:[{mol:'N\u2082',coeff:1,atoms:{N:2}},{mol:'H\u2082',coeff:1,atoms:{H:2}}],
    rhs:[{mol:'NH\u2083',coeff:1,atoms:{N:1,H:3}}],
    fix:'N\u2082 + 3H\u2082 \u2192 2NH\u2083',
    fixLhs:[{mol:'N\u2082',coeff:1,atoms:{N:2}},{mol:'H\u2082',coeff:3,atoms:{H:2}}],
    fixRhs:[{mol:'NH\u2083',coeff:2,atoms:{N:1,H:3}}],
    color:'#4ade80'
  },
  {
    label:'CH₄ + O₂ → CO₂ + H₂O',
    balanced:false,
    lhs:[{mol:'CH\u2084',coeff:1,atoms:{C:1,H:4}},{mol:'O\u2082',coeff:1,atoms:{O:2}}],
    rhs:[{mol:'CO\u2082',coeff:1,atoms:{C:1,O:2}},{mol:'H\u2082O',coeff:1,atoms:{H:2,O:1}}],
    fix:'CH\u2084 + 2O\u2082 \u2192 CO\u2082 + 2H\u2082O',
    fixLhs:[{mol:'CH\u2084',coeff:1,atoms:{C:1,H:4}},{mol:'O\u2082',coeff:2,atoms:{O:2}}],
    fixRhs:[{mol:'CO\u2082',coeff:1,atoms:{C:1,O:2}},{mol:'H\u2082O',coeff:2,atoms:{H:2,O:1}}],
    color:'#fb923c'
  },
  {
    label:'Fe + O₂ → Fe₂O₃',
    balanced:false,
    lhs:[{mol:'Fe',coeff:1,atoms:{Fe:1}},{mol:'O\u2082',coeff:1,atoms:{O:2}}],
    rhs:[{mol:'Fe\u2082O\u2083',coeff:1,atoms:{Fe:2,O:3}}],
    fix:'4Fe + 3O\u2082 \u2192 2Fe\u2082O\u2083',
    fixLhs:[{mol:'Fe',coeff:4,atoms:{Fe:1}},{mol:'O\u2082',coeff:3,atoms:{O:2}}],
    fixRhs:[{mol:'Fe\u2082O\u2083',coeff:2,atoms:{Fe:2,O:3}}],
    color:'#f87171'
  },
];

var selected=0;
var showFixed=false;

var btnContainer=document.getElementById('eq-btns');
var eqBtns=[];
equations.forEach(function(eq,i){
  var btn=document.createElement('button');
  btn.textContent=eq.label;
  btn.style.cssText='padding:5px 10px;border-radius:7px;border:1.5px solid;font-family:monospace;font-size:11px;font-weight:600;cursor:pointer;';
  btn.style.borderColor=i===0?eq.color:'rgba(255,255,255,0.2)';
  btn.style.background=i===0?eq.color+'22':'transparent';
  btn.style.color=i===0?eq.color:'rgba(255,255,255,0.4)';
  btn.onclick=function(){
    selected=i;showFixed=false;
    eqBtns.forEach(function(b,j){
      b.style.borderColor=j===selected?equations[j].color:'rgba(255,255,255,0.2)';
      b.style.background=j===selected?equations[j].color+'22':'transparent';
      b.style.color=j===selected?equations[j].color:'rgba(255,255,255,0.4)';
    });
    render();
  };
  btnContainer.appendChild(btn);
  eqBtns.push(btn);
});

// Toggle fix button
var fixBtn=document.createElement('button');
fixBtn.textContent='Balance it \u2192';
fixBtn.style.cssText='padding:5px 14px;border-radius:7px;border:1.5px solid #facc15;background:rgba(250,204,21,0.15);color:#facc15;font-family:monospace;font-size:11px;font-weight:700;cursor:pointer;margin-left:8px;';
fixBtn.onclick=function(){showFixed=!showFixed;this.textContent=showFixed?'\u2190 Show unbalanced':'Balance it \u2192';render();};
btnContainer.appendChild(fixBtn);

function countAtoms(sides){
  var counts={};
  sides.forEach(function(s){
    Object.keys(s.atoms).forEach(function(el){
      counts[el]=(counts[el]||0)+s.atoms[el]*s.coeff;
    });
  });
  return counts;
}

function render(){
  ctx.clearRect(0,0,W,H);
  ctx.fillStyle='#0a0f1e';ctx.fillRect(0,0,W,H);

  var eq=equations[selected];
  var lhs=showFixed?eq.fixLhs:eq.lhs;
  var rhs=showFixed?eq.fixRhs:eq.rhs;
  var lCounts=countAtoms(lhs);
  var rCounts=countAtoms(rhs);
  var allEls=Object.keys(Object.assign({},lCounts,rCounts));
  var isBalanced=allEls.every(function(el){return lCounts[el]===rCounts[el];});

  var color=eq.color;

  // Draw equation string
  function eqStr(sides){
    return sides.map(function(s){return(s.coeff>1?s.coeff:'')+s.mol;}).join(' + ');
  }
  var eqText=eqStr(lhs)+' \u2192 '+eqStr(rhs);
  ctx.fillStyle=isBalanced?'#4ade80':'#f87171';
  ctx.font='bold 17px monospace';ctx.textAlign='center';
  ctx.fillText(eqText,W/2,48);

  // Balance status badge
  ctx.fillStyle=isBalanced?'rgba(74,222,128,0.15)':'rgba(248,113,113,0.15)';
  ctx.beginPath();ctx.roundRect(W/2-70,56,140,26,6);ctx.fill();
  ctx.strokeStyle=isBalanced?'#4ade80':'#f87171';ctx.lineWidth=1.5;
  ctx.beginPath();ctx.roundRect(W/2-70,56,140,26,6);ctx.stroke();
  ctx.fillStyle=isBalanced?'#4ade80':'#f87171';ctx.font='bold 12px monospace';ctx.textAlign='center';
  ctx.fillText(isBalanced?'\u2713 BALANCED':'\u2717 UNBALANCED',W/2,73);

  // Atom count table
  var tableY=100;
  var cols=['Element','Left side','Right side','Match'];
  var colW=W/4;
  // Header
  cols.forEach(function(c,i){
    ctx.fillStyle='rgba(255,255,255,0.45)';ctx.font='bold 11px monospace';ctx.textAlign='center';
    ctx.fillText(c,colW*i+colW/2,tableY);
  });
  ctx.strokeStyle='rgba(255,255,255,0.1)';ctx.lineWidth=1;
  ctx.beginPath();ctx.moveTo(20,tableY+8);ctx.lineTo(W-20,tableY+8);ctx.stroke();

  allEls.forEach(function(el,i){
    var rowY=tableY+28+i*32;
    var lc=lCounts[el]||0,rc=rCounts[el]||0;
    var match=lc===rc;
    // Row background
    ctx.fillStyle=match?'rgba(74,222,128,0.06)':'rgba(248,113,113,0.06)';
    ctx.fillRect(20,rowY-16,W-40,28);

    ctx.fillStyle='rgba(255,255,255,0.7)';ctx.font='bold 13px monospace';ctx.textAlign='center';
    ctx.fillText(el,colW/2,rowY);
    ctx.fillStyle=color;ctx.font='bold 16px monospace';
    ctx.fillText(lc,colW+colW/2,rowY);
    ctx.fillText(rc,colW*2+colW/2,rowY);
    ctx.fillStyle=match?'#4ade80':'#f87171';ctx.font='bold 14px monospace';
    ctx.fillText(match?'\u2713':'\u2717 ('+lc+' vs '+rc+')',colW*3+colW/2,rowY);
  });

  // Bottom hint
  if(!isBalanced){
    ctx.fillStyle='rgba(250,204,21,0.6)';ctx.font='11px monospace';ctx.textAlign='center';
    ctx.fillText('Click "Balance it" to see the correct coefficients',W/2,H-12);
  } else {
    ctx.fillStyle='rgba(74,222,128,0.6)';ctx.font='11px monospace';ctx.textAlign='center';
    ctx.fillText(eq.fix,W/2,H-12);
  }
}
render();`,
      outputHeight: 360,
    },

    // ── Challenge 1 ─────────────────────────────────────────────────────────────
    {
      type: 'challenge',
      instruction: `When balancing a chemical equation, which operation is allowed?`,
      options: [
        { label: 'A', text: 'Changing subscripts inside a chemical formula (e.g. changing H₂O to H₃O)' },
        { label: 'B', text: 'Adding new atoms to either side to make the count work out' },
        { label: 'C', text: 'Changing the coefficients in front of whole molecules (e.g. 2H₂O, 3CO₂)' },
        { label: 'D', text: 'Removing atoms from the reactant side if they don\'t appear in products' },
      ],
      check: (label) => label === 'C',
      successMessage: "Correct! Coefficients (the numbers in front of formulas) tell you how many of each molecule are involved. You can adjust these freely to balance atoms. Changing subscripts would change the identity of the substance — H₂O₂ (hydrogen peroxide) is completely different from H₂O (water), even though they contain the same elements.",
      failMessage: "The only valid balancing operation is changing the coefficients (the numbers in front of complete formulas). Changing subscripts would change what substance you're describing — that's not balancing, that's changing the chemistry. And atoms can't be added or removed — that would violate conservation of mass.",
      html: '', css: `body{margin:0;padding:0;font-family:sans-serif}`, startCode: '',
      outputHeight: 300,
    },

    // ── Section 4 ───────────────────────────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `### Types of Chemical Reactions

Chemists have catalogued millions of reactions, but most fall into a handful of recognisable patterns. Knowing these patterns lets you predict products from reactants — a core skill in chemistry.

**Synthesis (combination):** Two or more reactants combine to form a single product.
2 Na + Cl₂ → 2 NaCl
Fe + S → FeS

**Decomposition:** A single compound breaks down into two or more simpler substances. The reverse of synthesis.
2 H₂O₂ → 2 H₂O + O₂ (hydrogen peroxide decomposing)
CaCO₃ → CaO + CO₂ (limestone heated)

**Single replacement (displacement):** An element displaces another element from a compound.
Zn + 2 HCl → ZnCl₂ + H₂ (zinc displaces hydrogen from acid)
Fe + CuSO₄ → FeSO₄ + Cu (iron displaces copper — classic rust-prevention chemistry)

**Double replacement (metathesis):** Two compounds exchange partners.
NaCl + AgNO₃ → NaNO₃ + AgCl↓ (silver chloride precipitates)
HCl + NaOH → NaCl + H₂O (acid-base neutralisation)

**Combustion:** A substance reacts with oxygen, releasing heat and light. Hydrocarbons combust to produce CO₂ and H₂O.
CH₄ + 2 O₂ → CO₂ + 2 H₂O
Complete combustion produces CO₂; incomplete (limited O₂) produces CO and soot.

**Acid-base:** Transfer of a proton (H⁺) from acid to base. This is a subtype of double replacement but important enough to have its own category. We'll cover this in depth in Lesson 4.4.

Recognising the reaction type is the first step toward predicting products, understanding mechanisms, and designing synthetic routes.`,
    },

    // ── Visual 3 — Reaction types overview ─────────────────────────────────────
    {
      type: 'js',
      instruction: `### Five reaction type patterns

Each panel shows the schematic pattern for one reaction type. The coloured circles represent different atom types; the bonds between them show which connections break and which form.`,
      html: `<canvas id="cv" width="700" height="320"></canvas>`,
      css: `body{margin:0;background:#0a0f1e;display:flex;justify-content:center}
canvas{display:block;width:100%;max-width:700px}`,
      startCode: `var canvas=document.getElementById('cv');
var ctx=canvas.getContext('2d');
var W=canvas.width,H=canvas.height;
var t=0;

var types=[
  {name:'Synthesis',color:'#38bdf8',
   desc:'A + B \u2192 AB',
   example:'2Na + Cl\u2082 \u2192 2NaCl'},
  {name:'Decomposition',color:'#f87171',
   desc:'AB \u2192 A + B',
   example:'2H\u2082O\u2082 \u2192 2H\u2082O + O\u2082'},
  {name:'Single Replace.',color:'#4ade80',
   desc:'A + BC \u2192 AC + B',
   example:'Zn + 2HCl \u2192 ZnCl\u2082 + H\u2082'},
  {name:'Double Replace.',color:'#fb923c',
   desc:'AB + CD \u2192 AD + CB',
   example:'NaCl + AgNO\u2083 \u2192 AgCl + NaNO\u2083'},
  {name:'Combustion',color:'#facc15',
   desc:'CₓHᵧ + O\u2082 \u2192 CO\u2082 + H\u2082O',
   example:'CH\u2084 + 2O\u2082 \u2192 CO\u2082 + 2H\u2082O'},
];

var colW=W/5;

function atom(x,y,color,label,r){
  r=r||12;
  ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);
  ctx.fillStyle='#0f172a';ctx.fill();
  ctx.strokeStyle=color;ctx.lineWidth=2;ctx.stroke();
  ctx.fillStyle=color;ctx.font='bold '+(r>10?'9':'7')+'px monospace';
  ctx.textAlign='center';ctx.textBaseline='middle';
  ctx.fillText(label,x,y);
}

function bond(x1,y1,x2,y2,color){
  ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);
  ctx.strokeStyle=color+'88';ctx.lineWidth=2;ctx.stroke();
}

function arrow(x1,y,x2){
  ctx.beginPath();ctx.moveTo(x1,y);ctx.lineTo(x2,y);
  ctx.strokeStyle='rgba(255,255,255,0.3)';ctx.lineWidth=1.5;ctx.stroke();
  ctx.beginPath();ctx.moveTo(x2-7,y-4);ctx.lineTo(x2,y);ctx.lineTo(x2-7,y+4);
  ctx.strokeStyle='rgba(255,255,255,0.3)';ctx.lineWidth=1.5;ctx.stroke();
}

function draw(){
  ctx.clearRect(0,0,W,H);
  ctx.fillStyle='#0a0f1e';ctx.fillRect(0,0,W,H);

  var cy=H/2-20;
  var pulse=Math.sin(t*0.04)*3;

  types.forEach(function(type,i){
    var cx=i*colW+colW/2;
    var c=type.color;

    // Column
    ctx.fillStyle=c+'0a';ctx.fillRect(i*colW+1,1,colW-2,H-2);
    ctx.strokeStyle=c+'22';ctx.lineWidth=1;ctx.strokeRect(i*colW+1,1,colW-2,H-2);

    // Title
    ctx.fillStyle=c;ctx.font='bold 11px monospace';ctx.textAlign='center';
    ctx.fillText(type.name,cx,22);
    ctx.fillStyle='rgba(255,255,255,0.35)';ctx.font='9px monospace';
    ctx.fillText(type.desc,cx,36);

    var ax=18,ay=cx-ax; // offset

    if(i===0){
      // Synthesis: A + B -> AB
      atom(cx-28,cy,'#38bdf8','A',11);
      atom(cx+16,cy,'#f97316','B',11);
      arrow(cx-12,cy-28,cx+8,cy-28);
      atom(cx+pulse*0.3,cy+44,'#38bdf8','A',11);
      bond(cx+pulse*0.3,cy+44,cx+16+pulse*0.3,cy+44,'#38bdf8');
      atom(cx+16+pulse*0.3,cy+44,'#f97316','B',11);
      ctx.fillStyle='rgba(255,255,255,0.4)';ctx.font='10px monospace';ctx.textAlign='center';
      ctx.fillText('\u2192',cx,cy+14);
    } else if(i===1){
      // Decomposition: AB -> A + B
      atom(cx-6+pulse*0.3,cy-30,'#38bdf8','A',11);
      bond(cx-6+pulse*0.3,cy-30,cx+10+pulse*0.3,cy-30,'#38bdf8');
      atom(cx+10+pulse*0.3,cy-30,'#f97316','B',11);
      ctx.fillStyle='rgba(255,255,255,0.4)';ctx.font='10px monospace';ctx.textAlign='center';
      ctx.fillText('\u2192',cx,cy);
      atom(cx-22,cy+36,'#38bdf8','A',11);
      atom(cx+22,cy+36,'#f97316','B',11);
      arrow(cx-14,cy+20,cx-6,cy+28);
      arrow(cx+14,cy+20,cx+6,cy+28);
    } else if(i===2){
      // Single replace: A + BC -> AC + B
      atom(cx-28,cy-28,'#4ade80','A',10);
      atom(cx+10,cy-28,'#38bdf8','B',10);
      bond(cx+10,cy-28,cx+22,cy-28,'#38bdf8');
      atom(cx+22,cy-28,'#f97316','C',10);
      ctx.fillStyle='rgba(255,255,255,0.4)';ctx.font='10px monospace';ctx.textAlign='center';
      ctx.fillText('\u2192',cx,cy);
      atom(cx-18,cy+34,'#4ade80','A',10);
      bond(cx-18,cy+34,cx-6,cy+34,'#4ade80');
      atom(cx-6,cy+34,'#f97316','C',10);
      atom(cx+22,cy+34,'#38bdf8','B',10);
    } else if(i===3){
      // Double replace: AB + CD -> AD + CB
      atom(cx-26,cy-28,'#fb923c','A',10);
      bond(cx-26,cy-28,cx-14,cy-28,'#fb923c');
      atom(cx-14,cy-28,'#38bdf8','B',10);
      atom(cx+8,cy-28,'#4ade80','C',10);
      bond(cx+8,cy-28,cx+20,cy-28,'#4ade80');
      atom(cx+20,cy-28,'#a78bfa','D',10);
      ctx.fillStyle='rgba(255,255,255,0.4)';ctx.font='10px monospace';ctx.textAlign='center';
      ctx.fillText('\u2192',cx,cy);
      atom(cx-26,cy+34,'#fb923c','A',10);
      bond(cx-26,cy+34,cx-14,cy+34,'#fb923c');
      atom(cx-14,cy+34,'#a78bfa','D',10);
      atom(cx+8,cy+34,'#4ade80','C',10);
      bond(cx+8,cy+34,cx+20,cy+34,'#4ade80');
      atom(cx+20,cy+34,'#38bdf8','B',10);
    } else {
      // Combustion: CxHy + O2 -> CO2 + H2O
      atom(cx-20,cy-30,'#facc15','C',10);
      atom(cx-8,cy-30,'#e2e8f0','H',10);
      bond(cx-20,cy-30,cx-8,cy-30,'#facc15');
      atom(cx+12,cy-30,'#f87171','O',10);
      bond(cx+12,cy-30,cx+24,cy-30,'#f87171');
      atom(cx+24,cy-30,'#f87171','O',10);
      ctx.fillStyle='rgba(255,255,255,0.4)';ctx.font='10px monospace';ctx.textAlign='center';
      ctx.fillText('\u2192',cx,cy);
      // CO2
      atom(cx-16,cy+30,'#f87171','O',10);
      bond(cx-16,cy+30,cx-4,cy+30,'#facc15');
      atom(cx-4,cy+30,'#facc15','C',10);
      bond(cx-4,cy+30,cx+8,cy+30,'#f87171');
      atom(cx+8,cy+30,'#f87171','O',10);
      // H2O
      atom(cx+20,cy+30,'#e2e8f0','H',8);
      bond(cx+20,cy+30,cx+28,cy+30,'#e2e8f0');
      atom(cx+28,cy+30,'#f87171','O',8);
    }

    // Example text
    ctx.fillStyle='rgba(255,255,255,0.35)';ctx.font='8px monospace';ctx.textAlign='center';
    ctx.fillText(type.example,cx,H-14);
  });

  t++;requestAnimationFrame(draw);
}
draw();`,
      outputHeight: 340,
    },

    // ── Challenge 2 ─────────────────────────────────────────────────────────────
    {
      type: 'challenge',
      instruction: `Iron reacts with copper sulfate solution: Fe + CuSO₄ → FeSO₄ + Cu. A student observes that a piece of iron left in blue copper sulfate solution turns reddish-brown and the solution fades. What type of reaction is this, and what is the reddish-brown substance?`,
      options: [
        { label: 'A', text: 'Synthesis reaction; the reddish-brown is iron oxide (rust)' },
        { label: 'B', text: 'Single replacement reaction; iron displaces copper, and the reddish-brown coating is metallic copper' },
        { label: 'C', text: 'Decomposition reaction; copper sulfate decomposes into copper and sulfate' },
        { label: 'D', text: 'Combustion reaction; iron burns in the copper sulfate solution' },
      ],
      check: (label) => label === 'B',
      successMessage: "Correct! This is a classic single replacement (displacement) reaction. Iron (Fe) is more reactive than copper (Cu) and displaces it from solution. Fe loses 2 electrons → Fe²⁺ enters solution as FeSO₄ (colourless). Cu²⁺ from CuSO₄ gains 2 electrons → Cu metal deposits on the iron surface as a reddish-brown coating. The blue colour of Cu²⁺ fades as it is consumed.",
      failMessage: "The pattern here is A + BC → AC + B: a free element (Fe) displaces another element (Cu) from a compound (CuSO₄). This is single replacement. The reddish-brown coating is metallic copper depositing on the iron — copper ions from solution gaining electrons and becoming solid copper metal.",
      html: '', css: `body{margin:0;padding:0;font-family:sans-serif}`, startCode: '',
      outputHeight: 300,
    },

    // ── Section 5 ───────────────────────────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `### Evidence of Chemical Reactions

How do you know a chemical reaction has occurred rather than just a physical change? Chemists look for several types of evidence:

**Colour change.** The colour of a substance is determined by how its electrons absorb light — which depends on its molecular structure. A new substance has different electron arrangements and therefore different colours. The fading of blue copper sulfate as iron is added is a colour change indicating new substances forming.

**Gas production.** Bubbles of gas forming in a liquid often indicate a reaction. Adding acid to a carbonate produces CO₂ bubbles. Electrolysis of water produces H₂ and O₂ bubbles. Note that boiling water produces bubbles too — but those are water vapour, not a new substance.

**Precipitate formation.** When two solutions are mixed and a solid forms that doesn't dissolve (a precipitate), a reaction has occurred. The classic example: mixing clear solutions of sodium chloride and silver nitrate immediately produces a white precipitate of silver chloride (AgCl), which is insoluble in water.

**Temperature change.** Exothermic reactions release heat — the solution warms. Endothermic reactions absorb heat — the solution cools. A temperature change during mixing indicates a chemical reaction (though simple dissolution can also produce temperature changes, as we saw with ammonium nitrate).

**Light emission.** Some reactions produce light — combustion, chemiluminescence (glow sticks), bioluminescence (fireflies). The light comes from electrons in excited states falling back to lower energy levels.

These are indicators, not proof — some physical changes can mimic them. But observing multiple indicators together makes it very likely that a chemical reaction has occurred.`,
    },

    // ── Visual 4 — Evidence types ───────────────────────────────────────────────
    {
      type: 'js',
      instruction: `### Five indicators of chemical reactions — animated

Each panel shows one indicator at the particle level. Watch: colour change (electron structure changing), precipitate (insoluble product forming), gas production (new gaseous product), temperature change (energy released or absorbed), and light emission (excited electron relaxation).`,
      html: `<canvas id="cv" width="700" height="280"></canvas>`,
      css: `body{margin:0;background:#0a0f1e;display:flex;justify-content:center}
canvas{display:block;width:100%;max-width:700px}`,
      startCode: `var canvas=document.getElementById('cv');
var ctx=canvas.getContext('2d');
var W=canvas.width,H=canvas.height;
var t=0;

var panelW=W/5;

// Particles for each panel
var colorParticles=[];
for(var i=0;i<12;i++) colorParticles.push({x:panelW*0.15+Math.random()*panelW*0.7,y:40+Math.random()*(H-80),vy:-0.3-Math.random()*0.3});

var precipParticles=[];
for(var j=0;j<16;j++) precipParticles.push({x:panelW+panelW*0.1+Math.random()*panelW*0.8,y:30+Math.random()*(H-60),settled:false,vy:0.5+Math.random()*0.5});

var gasParticles=[];
for(var k=0;k<10;k++) gasParticles.push({x:panelW*2+panelW*0.2+Math.random()*panelW*0.6,y:H-40-Math.random()*60,vy:-0.8-Math.random()});

var tempParticles=[];
for(var l=0;l<14;l++) tempParticles.push({x:panelW*3+panelW*0.1+Math.random()*panelW*0.8,y:40+Math.random()*(H-80),vx:(Math.random()-0.5)*1,vy:(Math.random()-0.5)*1,phase:Math.random()*Math.PI*2});

var lightParticles=[];
for(var m=0;m<8;m++) lightParticles.push({x:panelW*4+panelW/2,y:H/2,angle:m*(Math.PI*2/8),dist:0,maxDist:45+Math.random()*20,phase:Math.random()*Math.PI*2});

function draw(){
  ctx.clearRect(0,0,W,H);
  ctx.fillStyle='#0a0f1e';ctx.fillRect(0,0,W,H);

  var titles=['Colour Change','Precipitate','Gas Produced','Temperature \u0394','Light Emitted'];
  var colors=['#38bdf8','#e2e8f0','#4ade80','#f87171','#facc15'];
  var examples=['Cu\u00b2\u207a(blue)\u2192Cu(red)','AgCl \u2193 forms','CO\u2082 bubbles','Exothermic heat','Chemiluminescence'];

  titles.forEach(function(title,i){
    var bx=i*panelW;
    ctx.fillStyle=colors[i]+'0c';ctx.fillRect(bx+1,1,panelW-2,H-2);
    ctx.strokeStyle=colors[i]+'22';ctx.lineWidth=1;ctx.strokeRect(bx+1,1,panelW-2,H-2);
    ctx.fillStyle=colors[i];ctx.font='bold 10px monospace';ctx.textAlign='center';
    ctx.fillText(title,bx+panelW/2,18);
    ctx.fillStyle='rgba(255,255,255,0.3)';ctx.font='8px monospace';
    ctx.fillText(examples[i],bx+panelW/2,H-10);
  });

  // ── Panel 1: Colour change ──
  var cPhase=((t%240)/240);
  colorParticles.forEach(function(p){
    p.y+=p.vy;if(p.y<20)p.y=H-40;
    var blueToRed=cPhase;
    var r=Math.round(lerp(0,200,blueToRed)),g=Math.round(lerp(100,30,blueToRed)),b=Math.round(lerp(240,30,blueToRed));
    var pcolor='rgb('+r+','+g+','+b+')';
    ctx.beginPath();ctx.arc(p.x,p.y,7,0,Math.PI*2);
    ctx.fillStyle='#0f172a';ctx.fill();ctx.strokeStyle=pcolor;ctx.lineWidth=2;ctx.stroke();
  });

  // ── Panel 2: Precipitate ──
  precipParticles.forEach(function(p){
    if(!p.settled){p.y+=p.vy;if(p.y>H-20-Math.random()*30)p.settled=true;}
    var alpha=p.settled?1:0.7;
    ctx.beginPath();ctx.arc(p.x,p.y,6,0,Math.PI*2);
    ctx.fillStyle='rgba(226,232,240,'+alpha*0.9+')';ctx.fill();
    ctx.strokeStyle='rgba(226,232,240,'+alpha+')';ctx.lineWidth=1.5;ctx.stroke();
  });
  // Solution colour fading
  ctx.fillStyle='rgba(56,189,248,'+(0.15*(1-((t%180)/180)))+')';
  ctx.fillRect(panelW+2,2,panelW-4,H-4);

  // ── Panel 3: Gas bubbles ──
  gasParticles.forEach(function(p){
    p.y+=p.vy;p.x+=Math.sin(t*0.05+p.y*0.1)*0.5;
    if(p.y<0){p.y=H-30;p.x=panelW*2+panelW*0.2+Math.random()*panelW*0.6;}
    var size=6+(H-p.y)*0.02;
    ctx.beginPath();ctx.arc(p.x,p.y,size,0,Math.PI*2);
    ctx.fillStyle='rgba(74,222,128,0.15)';ctx.fill();
    ctx.strokeStyle='rgba(74,222,128,0.6)';ctx.lineWidth=1.5;ctx.stroke();
    ctx.fillStyle='rgba(74,222,128,0.5)';ctx.font='7px monospace';ctx.textAlign='center';ctx.textBaseline='middle';
    ctx.fillText('CO\u2082',p.x,p.y);
  });
  // Liquid at bottom
  ctx.fillStyle='rgba(56,189,248,0.12)';ctx.fillRect(panelW*2+2,H-50,panelW-4,48);

  // ── Panel 4: Temperature / fast particles ──
  var speed=1.5+Math.sin(t*0.02)*0.8;
  tempParticles.forEach(function(p){
    p.x+=p.vx*speed;p.y+=p.vy*speed;
    p.vx+=(Math.random()-0.5)*0.08;p.vy+=(Math.random()-0.5)*0.08;
    var maxS=2.5*speed;
    var spd=Math.sqrt(p.vx*p.vx+p.vy*p.vy);
    if(spd>maxS){p.vx*=maxS/spd;p.vy*=maxS/spd;}
    if(p.x<panelW*3+8){p.x=panelW*3+8;p.vx=Math.abs(p.vx);}
    if(p.x>panelW*4-8){p.x=panelW*4-8;p.vx=-Math.abs(p.vx);}
    if(p.y<8){p.y=8;p.vy=Math.abs(p.vy);}
    if(p.y>H-8){p.y=H-8;p.vy=-Math.abs(p.vy);}
    var hot=speed>2;
    ctx.beginPath();ctx.arc(p.x,p.y,7,0,Math.PI*2);
    ctx.fillStyle='#0f172a';ctx.fill();
    ctx.strokeStyle=hot?'#f87171':'#38bdf8';ctx.lineWidth=2;ctx.stroke();
    // Velocity trail
    ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(p.x-p.vx*3,p.y-p.vy*3);
    ctx.strokeStyle=(hot?'rgba(248,113,113,':'rgba(56,189,248,')+0.3+')';ctx.lineWidth=1;ctx.stroke();
  });
  ctx.fillStyle=(speed>2?'#f87171':'#38bdf8')+'55';ctx.font='10px monospace';ctx.textAlign='center';
  ctx.fillText(speed>2?'\u0394T = +18\u00b0C':'\u0394T = \u22125\u00b0C',panelW*3+panelW/2,H/2);

  // ── Panel 5: Light emission ──
  lightParticles.forEach(function(p){
    p.dist=(p.dist+1.2)%p.maxDist;
    var frac=p.dist/p.maxDist;
    var lx=panelW*4+panelW/2+Math.cos(p.angle+t*0.01)*p.dist;
    var ly=H/2+Math.sin(p.angle+t*0.01)*p.dist;
    ctx.beginPath();ctx.arc(lx,ly,3*(1-frac)+1,0,Math.PI*2);
    ctx.fillStyle='rgba(250,204,21,'+(1-frac)+')';
    ctx.shadowColor='#facc15';ctx.shadowBlur=8;
    ctx.fill();ctx.shadowBlur=0;
  });
  // Central excited atom
  var excPulse=0.5+0.5*Math.abs(Math.sin(t*0.08));
  var grd=ctx.createRadialGradient(panelW*4+panelW/2,H/2,0,panelW*4+panelW/2,H/2,18);
  grd.addColorStop(0,'rgba(250,204,21,'+excPulse+')');grd.addColorStop(1,'rgba(250,204,21,0)');
  ctx.fillStyle=grd;ctx.beginPath();ctx.arc(panelW*4+panelW/2,H/2,18,0,Math.PI*2);ctx.fill();
  ctx.beginPath();ctx.arc(panelW*4+panelW/2,H/2,10,0,Math.PI*2);
  ctx.fillStyle='#facc15';ctx.fill();
  ctx.fillStyle='#1e293b';ctx.font='bold 8px monospace';ctx.textAlign='center';ctx.textBaseline='middle';
  ctx.fillText('e\u207b*',panelW*4+panelW/2,H/2);

  t++;requestAnimationFrame(draw);
}

function lerp(a,b,t){return a+(b-a)*t;}
draw();`,
      outputHeight: 300,
    },

    // ── Section 6 ───────────────────────────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `### Stoichiometry: The Arithmetic of Reactions

A balanced chemical equation is more than a description — it is a quantitative recipe. The coefficients tell you the molar ratios in which reactants are consumed and products are formed.

Consider the combustion of methane:
CH₄ + 2 O₂ → CO₂ + 2 H₂O

The coefficients say: 1 mole of CH₄ reacts with exactly 2 moles of O₂ to produce exactly 1 mole of CO₂ and exactly 2 moles of H₂O. These ratios are exact and always hold.

**Stoichiometry** is the use of these molar ratios to calculate quantities. Given any amount of one substance, you can calculate the amount of any other substance involved — as long as the equation is balanced.

**Example:** How many grams of CO₂ are produced when 16.0 g of CH₄ burns completely?
1. Moles of CH₄ = 16.0 g ÷ 16.04 g/mol = 0.998 mol
2. Moles of CO₂ produced = 0.998 mol CH₄ × (1 mol CO₂ / 1 mol CH₄) = 0.998 mol CO₂
3. Mass of CO₂ = 0.998 mol × 44.01 g/mol = **43.9 g**

The molar ratio from the balanced equation (1 mol CO₂ per 1 mol CH₄) is the conversion factor that links the two substances.

**Limiting reactant:** In practice, you rarely have reactants in exactly the stoichiometric ratio. The **limiting reactant** is the one that runs out first and determines how much product can form. The **excess reactant** is the one left over. Identifying the limiting reactant is the key step in all yield calculations — and in understanding why some reactions "stop" even when some reactants remain.`,
    },

    // ── Challenge 3 ─────────────────────────────────────────────────────────────
    {
      type: 'challenge',
      instruction: `In the reaction N₂ + 3 H₂ → 2 NH₃, you start with 2.0 mol N₂ and 4.5 mol H₂. Which is the limiting reactant, and how many moles of NH₃ can be produced?`,
      options: [
        { label: 'A', text: 'N₂ is limiting; 4.0 mol NH₃ produced' },
        { label: 'B', text: 'H₂ is limiting; 3.0 mol NH₃ produced' },
        { label: 'C', text: 'Both are limiting equally; 3.5 mol NH₃ produced' },
        { label: 'D', text: 'N₂ is limiting; 3.0 mol NH₃ produced' },
      ],
      check: (label) => label === 'B',
      successMessage: "Correct! Check both reactants: 2.0 mol N₂ could produce 2.0 × 2 = 4.0 mol NH₃ (if H₂ is sufficient). 4.5 mol H₂ could produce 4.5 × (2/3) = 3.0 mol NH₃ (if N₂ is sufficient). H₂ produces less NH₃, so H₂ is limiting. Maximum yield = 3.0 mol NH₃. The remaining N₂ = 2.0 − (4.5/3) × 1 = 2.0 − 1.5 = 0.5 mol N₂ left over.",
      failMessage: "To find the limiting reactant, calculate how much product each reactant could make independently. 2.0 mol N₂ × (2 mol NH₃ / 1 mol N₂) = 4.0 mol NH₃. 4.5 mol H₂ × (2 mol NH₃ / 3 mol H₂) = 3.0 mol NH₃. H₂ produces less — it runs out first. H₂ is limiting; maximum yield is 3.0 mol NH₃.",
      html: '', css: `body{margin:0;padding:0;font-family:sans-serif}`, startCode: '',
      outputHeight: 300,
    },

    // ── Challenge 4 ─────────────────────────────────────────────────────────────
    {
      type: 'challenge',
      instruction: `Lavoisier burned phosphorus in a sealed container on a balance. He observed that the total mass of the sealed container did not change before and after the reaction, even though the phosphorus was converted to phosphorus pentoxide (P₄O₁₀). What fundamental law does this demonstrate?`,
      options: [
        { label: 'A', text: 'The law of definite proportions — compounds always have fixed ratios of elements' },
        { label: 'B', text: 'The law of conservation of mass — the total mass of reactants equals the total mass of products; matter is neither created nor destroyed' },
        { label: 'C', text: 'The law of multiple proportions — elements can combine in multiple whole-number ratios' },
        { label: 'D', text: 'The ideal gas law — the pressure inside the container rose because gases were produced' },
      ],
      check: (label) => label === 'B',
      successMessage: "Correct! Lavoisier's sealed-container experiments directly demonstrated conservation of mass. The phosphorus and oxygen (from the air inside) rearranged into phosphorus pentoxide — all atoms present before were still present after, just in new combinations. Total mass unchanged. This became one of the foundations of modern chemistry.",
      failMessage: "The key observation is that total mass is unchanged. The phosphorus and oxygen atoms don't disappear — they rearrange into a new compound (P₄O₁₀). Because no atoms are created or destroyed, mass is conserved. Lavoisier proved this by carefully sealing his experiments and weighing everything, including the air.",
      html: '', css: `body{margin:0;padding:0;font-family:sans-serif}`, startCode: '',
      outputHeight: 300,
    },

    // ── Closing ──────────────────────────────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `### Chemical Reactions: The Foundation of Everything That Follows

A chemical reaction is, at its core, a rearrangement of bonds. Old bonds break, releasing atoms. New bonds form, stabilising them in new configurations. The atoms themselves are immortal — they travel from molecule to molecule across reactions, across organisms, across geological time.

The law of conservation of mass means that equations must balance — every atom on the left must appear on the right. Balanced equations are quantitative recipes: their coefficients give the molar ratios that allow stoichiometry, the arithmetic of chemistry. Stoichiometry lets you calculate how much product forms from given reactants, identify limiting reactants, and predict the outcome of reactions before running them.

Reaction types — synthesis, decomposition, single replacement, double replacement, combustion — are patterns that recur across millions of specific reactions. Recognising the pattern helps predict the products.

And the evidence indicators — colour changes, precipitates, gas evolution, temperature changes, light — are the observational language for detecting when chemistry has occurred.

The next lessons will go deeper: into the energy of reactions, the rates of reactions, the equilibria that control them, and the acid-base chemistry that runs through all of biology. But they all build on this foundation: bonds break, bonds form, atoms are conserved, and the outcome depends on the quantitative relationship between what you start with and what can form.`,
    },

  ],
};

export default {
  id: 'chem-4-0-what-is-a-chemical-reaction',
  slug: 'what-is-a-chemical-reaction',
  chapter: 'chem.4',
  order: 0,
  title: 'What Is a Chemical Reaction?',
  subtitle: 'Bonds breaking, bonds forming — and why mass never disappears.',
  tags: ['chemistry', 'chemical-reactions', 'conservation-of-mass', 'balancing-equations', 'stoichiometry', 'reaction-types', 'limiting-reactant', 'Lavoisier'],
  hook: {
    question: 'When wood burns to ash, where does the mass go? And how can chemists calculate exactly how much product a reaction will make before running it?',
    realWorldContext: 'Every chemical reaction — from the metabolism in your cells to the combustion in an engine — is atoms rearranging from one set of bonds to another. Conservation of mass means every atom is accounted for, and balanced equations let you calculate the arithmetic of those rearrangements.',
    previewVisualizationId: 'ScienceNotebook',
  },
  intuition: {
    prose: [
      'A chemical reaction = bonds break and new bonds form. Atoms are rearranged, not created or destroyed.',
      'Law of conservation of mass: total mass of reactants = total mass of products.',
      'Balanced equations reflect conservation of mass: same number of each atom on both sides.',
      'Stoichiometry: molar ratios from balanced equations let you calculate amounts of reactants and products.',
      'Limiting reactant: the reactant that runs out first, determining maximum yield.',
    ],
    callouts: [
      { type: 'important', title: 'Balancing rules', body: 'Only change coefficients (numbers in front of formulas). Never change subscripts inside a formula — that changes the substance identity. H₂O₂ is not the same as H₂O.' },
    ],
    visualizations: [{ id: 'ScienceNotebook', title: 'What Is a Chemical Reaction?', props: { lesson: LESSON_CHEM_4_0 } }],
  },
  math: { prose: [], callouts: [], visualizations: [] },
  rigor: { prose: [], callouts: [], visualizations: [] },
  examples: [],
  challenges: [],
  mentalModel: [
    'Chemical reaction: bonds break, bonds form, atoms rearrange. Different substances before and after.',
    'Conservation of mass (Lavoisier): Σm_reactants = Σm_products. No atoms appear or disappear.',
    'Balanced equation: same atom count each side. Change coefficients only, never subscripts.',
    'Reaction types: synthesis (A+B→AB), decomposition (AB→A+B), single replacement (A+BC→AC+B), double replacement (AB+CD→AD+CB), combustion (fuel+O₂→CO₂+H₂O).',
    'Evidence: colour change, precipitate, gas, temperature change, light.',
    'Stoichiometry: molar ratios from coefficients. n(product) = n(reactant) × (coeff ratio).',
    'Limiting reactant: whichever reactant would produce less product independently. Excess reactant remains.',
  ],
  checkpoints: ['read-intuition'],
  quiz: [],
};

export { LESSON_CHEM_4_0 };
