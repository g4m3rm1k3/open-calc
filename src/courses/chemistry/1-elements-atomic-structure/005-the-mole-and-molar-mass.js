// Chemistry · Chapter 1 · Lesson 4
// The Mole and Molar Mass

const LESSON_CHEM_1_4 = {
  title: 'The Mole and Molar Mass',
  subtitle: 'How chemists count atoms they can never see — by weighing them instead.',
  sequential: true,

  cells: [

    {
      type: 'markdown',
      instruction: `### A problem you can't solve by counting

Here's a strange practical problem. You have a small pile of iron filings — maybe half a gram — and you need to know exactly how many iron atoms are in it, because the reaction you're about to run needs a precise ratio of atoms, not grams.

You cannot count them. An iron atom is about 250 picometers across. There is no tweezers fine enough, no microscope fast enough, no lifetime long enough to count atoms one at a time in even a speck of visible matter. A single grain of table salt contains more atoms than there are grains of sand on every beach on Earth.

And yet chemists count atoms precisely, every single day, in every lab in the world. They do it with a scale. This lesson is about how — and why weighing something is exactly the same thing as counting it, once you know the trick.`,
    },

    // ── Visual 1 — Counting by weighing (jellybean analogy) ────────────────────
    {
      type: 'js',
      instruction: `**The trick is old — jelly-bean-guessing-contest old.** If every jelly bean weighs the same amount, you don't have to count the jar. You weigh the jar, weigh one jelly bean (or weigh ten and divide by ten), and divide.

count = total mass ÷ mass of one item

**Drag the slider** to change how many "atoms" are in the sample. Notice the count and the total mass move together — always in the same fixed ratio, because each one weighs the same.`,
      html: `<div class="scene">
  <div class="ctrl-row">
    <span class="clabel">Sample size: <strong id="cn">12</strong> atoms</span>
    <input type="range" id="cs" min="1" max="40" value="12" style="flex:1">
  </div>
  <svg id="dotSvg" viewBox="0 0 480 170" style="width:100%;display:block;border-radius:10px;background:var(--color-background-secondary,#f8fafc);border:1px solid var(--color-border-tertiary,#e2e8f0)"></svg>
  <div class="results">
    <div class="rbox">Mass of one atom: <strong>3.5 × 10⁻²³ g</strong></div>
    <div class="rbox hi">Total mass: <strong id="totalMass">4.2 × 10⁻²² g</strong></div>
  </div>
  <div class="insight">You will never count these atoms one at a time. But mass ÷ (mass of one atom) gives you the count exactly — no counting required.</div>
</div>`,
      css: `body{margin:0;padding:14px;font-family:sans-serif}
.scene{display:flex;flex-direction:column;gap:10px}
.ctrl-row{display:flex;align-items:center;gap:10px}
.clabel{font-size:12px;color:var(--color-text-primary);white-space:nowrap}
.results{display:grid;grid-template-columns:1fr 1fr;gap:10px}
.rbox{padding:9px 14px;border-radius:8px;border:1px solid var(--color-border-tertiary,#e2e8f0);font-size:12.5px;color:var(--color-text-primary);background:var(--color-background-secondary,#f8fafc)}
.hi{border-color:#93c5fd;background:var(--color-background-info,#eff6ff);color:var(--color-text-info,#1d4ed8)}
.insight{font-size:12px;color:var(--color-text-secondary);line-height:1.65;padding:8px 12px;border-left:2px solid var(--color-border-secondary);border-radius:0 6px 6px 0}`,
      startCode: `var svg=document.getElementById('dotSvg');
var slider=document.getElementById('cs');
var NS='http://www.w3.org/2000/svg';
var MAX=40, cols=10, rows=4, r=11, gapX=44, gapY=36, offX=30, offY=28;
var unitMass=3.5e-23;

var dots=[];
for(var i=0;i<MAX;i++){
  var c=document.createElementNS(NS,'circle');
  var col=i%cols, row=Math.floor(i/cols);
  c.setAttribute('cx', offX+col*gapX);
  c.setAttribute('cy', offY+row*gapY);
  c.setAttribute('r', r);
  c.setAttribute('fill', '#94a3b8');
  svg.appendChild(c);
  dots.push(c);
}

function fmtSci(n){
  var e=Math.floor(Math.log10(n));
  var m=n/Math.pow(10,e);
  return m.toFixed(1)+' × 10'+String(e).split('').map(function(ch){
    var sup={'-':'⁻','0':'⁰','1':'¹','2':'²','3':'³','4':'⁴','5':'⁵','6':'⁶','7':'⁷','8':'⁸','9':'⁹'};
    return sup[ch]||ch;
  }).join('');
}

function draw(n){
  document.getElementById('cn').textContent=n;
  for(var i=0;i<MAX;i++){
    var active=i<n;
    dots[i].setAttribute('fill', active?'#3b82f6':'#cbd5e1');
    dots[i].setAttribute('opacity', active?1:0.35);
  }
  var total=n*unitMass;
  document.getElementById('totalMass').textContent=fmtSci(total)+' g';
}
slider.oninput=function(){draw(+slider.value)};
draw(12);`,
      outputHeight: 350,
    },

    {
      type: 'markdown',
      instruction: `### Scaling the trick up to atoms

That's the whole idea. The only thing left is to scale it up from 12 jelly beans to a number big enough that ordinary amounts of matter — a glass of water, a nail, a breath of air — contain a *countable* (if enormous) number of atoms.

Chemists picked a specific number for this counting unit: **6.022 × 10²³**. This is called **Avogadro's number**, and a collection of that many particles is called **one mole** (abbreviated **mol**). A mole isn't a unit of mass or volume — it's a unit of *count*, exactly like "a dozen" means 12 of anything. A dozen eggs, a dozen atoms, a mole of eggs, a mole of atoms — the word just names how many.

Why that particular number, and not a rounder one like 10²³? Because it was chosen so that **the mass of one mole of a substance, in grams, equals that substance's atomic or molecular mass in atomic mass units (u)** — the same number you read straight off the periodic table. One mole of carbon-12 atoms has a mass of exactly 12 grams, by definition. That's not a coincidence chemists stumbled into; it's the reason Avogadro's number has the value it does.

This connects three things that seem unrelated at first: a **count** (moles), a **mass** (grams), and the **periodic table** (atomic mass). The bridge between them is called **molar mass** — the mass of one mole of a substance, in grams per mole (g/mol). For an element, molar mass is just the atomic mass from the periodic table with "grams per mole" attached instead of "atomic mass units."`,
    },

    // ── Visual 2 — Molar mass conversion bridge ─────────────────────────────────
    {
      type: 'js',
      instruction: `**The mole is the hub that connects mass, count, and the periodic table.** Pick an element, enter a mass in grams, and watch the conversion happen in both directions at once.

mass (g) ↔ moles (mol) ↔ number of particles`,
      html: `<div class="scene">
  <div class="ctrl-row">
    <label class="clabel">Element:
      <select id="elSel"></select>
    </label>
    <label class="clabel">Mass (g): <input type="number" id="massIn" value="10" step="any" style="width:80px"></label>
  </div>
  <svg id="bridgeSvg" viewBox="0 0 520 200" style="width:100%;display:block;border-radius:10px;background:var(--color-background-secondary,#f8fafc);border:1px solid var(--color-border-tertiary,#e2e8f0)"></svg>
</div>`,
      css: `body{margin:0;padding:14px;font-family:sans-serif}
.scene{display:flex;flex-direction:column;gap:12px}
.ctrl-row{display:flex;align-items:center;gap:16px;flex-wrap:wrap}
.clabel{font-size:12px;color:var(--color-text-primary);display:flex;align-items:center;gap:6px}
select,input{padding:5px 8px;border-radius:6px;border:1px solid var(--color-border-secondary,#cbd5e1);background:var(--color-background-primary,#fff);color:var(--color-text-primary);font-size:12px}`,
      startCode: `var ELS=[
  {sym:'H', name:'Hydrogen', mass:1.008},
  {sym:'C', name:'Carbon', mass:12.011},
  {sym:'N', name:'Nitrogen', mass:14.007},
  {sym:'O', name:'Oxygen', mass:15.999},
  {sym:'Na', name:'Sodium', mass:22.990},
  {sym:'Mg', name:'Magnesium', mass:24.305},
  {sym:'Al', name:'Aluminium', mass:26.982},
  {sym:'S', name:'Sulfur', mass:32.065},
  {sym:'Cl', name:'Chlorine', mass:35.453},
  {sym:'Ca', name:'Calcium', mass:40.078},
  {sym:'Fe', name:'Iron', mass:55.845},
  {sym:'Cu', name:'Copper', mass:63.546},
];
var sel=document.getElementById('elSel');
ELS.forEach(function(el,i){
  var o=document.createElement('option');
  o.value=i; o.textContent=el.sym+' — '+el.name+' ('+el.mass+' g/mol)';
  sel.appendChild(o);
});
sel.value=2; // Nitrogen, so a 10g default gives a clean-ish number

var svg=document.getElementById('bridgeSvg');
var NS='http://www.w3.org/2000/svg';
function el(tag,attrs,text){
  var n=document.createElementNS(NS,tag);
  for(var k in attrs) n.setAttribute(k,attrs[k]);
  if(text!=null) n.textContent=text;
  svg.appendChild(n);
  return n;
}

svg.innerHTML='';
el('rect',{x:0,y:0,width:520,height:200,fill:'transparent'});

var boxW=130,boxH=64,cy=70;
var boxes=[
  {x:20,  label:'Mass', unit:'grams', color:'#3b82f6'},
  {x:195, label:'Moles', unit:'mol', color:'#8b5cf6'},
  {x:388, label:'Particles', unit:'atoms', color:'#10b981'},
];
var boxEls={};
boxes.forEach(function(b){
  var g=document.createElementNS(NS,'g');
  svg.appendChild(g);
  var r=document.createElementNS(NS,'rect');
  r.setAttribute('x',b.x); r.setAttribute('y',cy-boxH/2); r.setAttribute('width',boxW); r.setAttribute('height',boxH);
  r.setAttribute('rx',10); r.setAttribute('fill','var(--color-background-primary,#fff)'); r.setAttribute('stroke',b.color); r.setAttribute('stroke-width','2');
  g.appendChild(r);
  var t1=document.createElementNS(NS,'text');
  t1.setAttribute('x',b.x+boxW/2); t1.setAttribute('y',cy-8); t1.setAttribute('text-anchor','middle');
  t1.setAttribute('font-size','11'); t1.setAttribute('fill','var(--color-text-secondary,#64748b)'); t1.setAttribute('font-family','sans-serif');
  t1.textContent=b.label;
  g.appendChild(t1);
  var t2=document.createElementNS(NS,'text');
  t2.setAttribute('x',b.x+boxW/2); t2.setAttribute('y',cy+16); t2.setAttribute('text-anchor','middle');
  t2.setAttribute('font-size','15'); t2.setAttribute('font-weight','700'); t2.setAttribute('fill',b.color); t2.setAttribute('font-family','monospace');
  g.appendChild(t2);
  boxEls[b.label]=t2;
});

// Arrows + factor labels
[[0,1,'÷ molar mass','× molar mass'],[1,2,'× 6.022×10²³','÷ 6.022×10²³']].forEach(function(pair){
  var a=boxes[pair[0]], b=boxes[pair[1]];
  var x1=a.x+boxW, x2=b.x;
  var mid=(x1+x2)/2;
  var line1=document.createElementNS(NS,'line');
  line1.setAttribute('x1',x1); line1.setAttribute('y1',cy-14); line1.setAttribute('x2',x2-4); line1.setAttribute('y2',cy-14);
  line1.setAttribute('stroke','var(--color-text-secondary,#94a3b8)'); line1.setAttribute('stroke-width','1.5'); line1.setAttribute('marker-end','url(#arrow)');
  svg.appendChild(line1);
  var t=document.createElementNS(NS,'text');
  t.setAttribute('x',mid); t.setAttribute('y',cy-20); t.setAttribute('text-anchor','middle'); t.setAttribute('font-size','9'); t.setAttribute('font-family','monospace');
  t.setAttribute('fill','var(--color-text-secondary,#64748b)'); t.textContent=pair[2];
  svg.appendChild(t);
  var line2=document.createElementNS(NS,'line');
  line2.setAttribute('x1',x2); line2.setAttribute('y1',cy+14); line2.setAttribute('x2',x1+4); line2.setAttribute('y2',cy+14);
  line2.setAttribute('stroke','var(--color-text-secondary,#94a3b8)'); line2.setAttribute('stroke-width','1.5'); line2.setAttribute('marker-end','url(#arrow2)');
  svg.appendChild(line2);
  var t3=document.createElementNS(NS,'text');
  t3.setAttribute('x',mid); t3.setAttribute('y',cy+30); t3.setAttribute('text-anchor','middle'); t3.setAttribute('font-size','9'); t3.setAttribute('font-family','monospace');
  t3.setAttribute('fill','var(--color-text-secondary,#64748b)'); t3.textContent=pair[3];
  svg.appendChild(t3);
});

var defs=document.createElementNS(NS,'defs');
[['arrow','#94a3b8',0],['arrow2','#94a3b8',180]].forEach(function(m){
  var marker=document.createElementNS(NS,'marker');
  marker.setAttribute('id',m[0]); marker.setAttribute('markerWidth','6'); marker.setAttribute('markerHeight','6');
  marker.setAttribute('refX','5'); marker.setAttribute('refY','3'); marker.setAttribute('orient','auto');
  var path=document.createElementNS(NS,'path');
  path.setAttribute('d','M0,0 L6,3 L0,6 Z'); path.setAttribute('fill',m[1]);
  marker.appendChild(path);
  defs.appendChild(marker);
});
svg.insertBefore(defs, svg.firstChild);

var molarLabel=el('text',{x:260,y:150,'text-anchor':'middle','font-size':11,'font-family':'monospace',fill:'var(--color-text-primary,#1e293b)'});
var workLabel=el('text',{x:260,y:172,'text-anchor':'middle','font-size':10,'font-family':'sans-serif',fill:'var(--color-text-secondary,#64748b)'});

var AVOGADRO=6.022e23;
function fmtSci(n){
  if(n===0) return '0';
  var e=Math.floor(Math.log10(Math.abs(n)));
  var m=n/Math.pow(10,e);
  return m.toFixed(3)+'e'+e;
}
function update(){
  var elData=ELS[+sel.value];
  var mass=parseFloat(document.getElementById('massIn').value)||0;
  var moles=mass/elData.mass;
  var particles=moles*AVOGADRO;
  boxEls['Mass'].textContent=mass+' g';
  boxEls['Moles'].textContent=moles.toFixed(4)+' mol';
  boxEls['Particles'].textContent=fmtSci(particles);
  molarLabel.textContent='Molar mass of '+elData.sym+' = '+elData.mass+' g/mol';
  workLabel.textContent=mass+' g ÷ '+elData.mass+' g/mol = '+moles.toFixed(4)+' mol × 6.022×10²³ = '+fmtSci(particles)+' atoms';
}
sel.onchange=update;
document.getElementById('massIn').oninput=update;
update();`,
      outputHeight: 340,
    },

    {
      type: 'markdown',
      instruction: `### Worked example

**Question:** How many moles are in 36.0 g of water (H₂O)? How many molecules is that?

**Step 1 — find the molar mass of H₂O.** Add up the atomic masses: 2 hydrogens (2 × 1.008) + 1 oxygen (15.999) = 18.015 g/mol.

**Step 2 — convert mass to moles.** moles = mass ÷ molar mass = 36.0 g ÷ 18.015 g/mol = **1.998 mol** (essentially 2.00 mol).

**Step 3 — convert moles to molecules, if asked.** molecules = moles × 6.022×10²³ = 1.998 × 6.022×10²³ = **1.203 × 10²⁴ molecules**.

Notice the pattern: **grams and molar mass get you to moles. Moles and Avogadro's number get you to a particle count.** Every mole problem in chemistry is some version of this same two-step bridge.`,
    },

    {
      type: 'markdown',
      instruction: `### Check your understanding`,
    },

    {
      type: 'challenge',
      instruction: `You have 46.0 g of sodium (Na, molar mass 22.99 g/mol). How many moles of sodium is this?`,
      options: [
        { label: 'A', text: '0.500 mol' },
        { label: 'B', text: '2.00 mol' },
        { label: 'C', text: '46.0 mol' },
        { label: 'D', text: '1057.5 mol' },
      ],
      check: (label) => label === 'B',
      successMessage: 'Correct. moles = mass ÷ molar mass = 46.0 g ÷ 22.99 g/mol ≈ 2.00 mol. Two moles of sodium, conveniently, since 46.0 is almost exactly double the molar mass.',
      failMessage: 'moles = mass ÷ molar mass. Here that\'s 46.0 g ÷ 22.99 g/mol. Divide mass by molar mass, not the other way around — a common slip.',
      html: '', css: `body{margin:0;padding:0;font-family:sans-serif}`, startCode: '', outputHeight: 300,
    },

    {
      type: 'challenge',
      instruction: `Which statement correctly describes why Avogadro's number has the specific value 6.022 × 10²³, rather than some other large number?`,
      options: [
        { label: 'A', text: 'It was chosen arbitrarily as a round, memorable number for chemistry students.' },
        { label: 'B', text: 'It is exactly the number of atoms in one gram of hydrogen.' },
        { label: 'C', text: 'It is defined so that the mass of one mole of a substance, in grams, equals that substance\'s atomic/molecular mass in atomic mass units.' },
        { label: 'D', text: 'It is the number of atoms a human can theoretically count in one lifetime.' },
      ],
      check: (label) => label === 'C',
      successMessage: 'Correct. Avogadro\'s number is defined precisely so that "grams per mole" and "atomic mass units per atom" have the same numeric value — that\'s what makes the periodic table directly useful for mole calculations.',
      failMessage: 'The value isn\'t arbitrary or about human counting limits. It\'s fixed by a deliberate design choice: one mole of a substance has a mass in grams numerically equal to its atomic mass in u. That\'s the entire reason the periodic table\'s masses are useful for counting atoms.',
      html: '', css: `body{margin:0;padding:0;font-family:sans-serif}`, startCode: '', outputHeight: 320,
    },

    {
      type: 'challenge',
      instruction: `A sample contains 3.011 × 10²³ atoms of carbon. How many moles of carbon is this, and what is the mass?  (Carbon's molar mass is 12.011 g/mol.)`,
      options: [
        { label: 'A', text: '0.500 mol, 6.01 g' },
        { label: 'B', text: '1.00 mol, 12.011 g' },
        { label: 'C', text: '2.00 mol, 24.02 g' },
        { label: 'D', text: '3.011 mol, 36.16 g' },
      ],
      check: (label) => label === 'A',
      successMessage: 'Correct. 3.011×10²³ is exactly half of Avogadro\'s number (6.022×10²³), so moles = 0.500 mol. Mass = moles × molar mass = 0.500 × 12.011 = 6.01 g.',
      failMessage: 'First find moles: divide the particle count by Avogadro\'s number — 3.011×10²³ ÷ 6.022×10²³ = 0.500 mol. Then convert to mass: 0.500 mol × 12.011 g/mol = 6.01 g.',
      html: '', css: `body{margin:0;padding:0;font-family:sans-serif}`, startCode: '', outputHeight: 320,
    },

  ],
}

export default {
  id: 'chem-1-4-the-mole-and-molar-mass',
  slug: 'the-mole-and-molar-mass',
  chapter: 'chem.1',
  order: 4,
  title: 'The Mole and Molar Mass',
  subtitle: 'How chemists count atoms they can never see — by weighing them instead.',
  tags: ['chemistry', 'mole', 'molar-mass', 'avogadro', 'stoichiometry-foundation'],
  hook: {
    question: 'How do you count something too small to ever see, one at a time?',
    realWorldContext: 'Every stoichiometry calculation in chemistry — every reaction, every recipe for a compound — starts from this one idea: weigh it, then convert.',
    previewVisualizationId: 'ScienceNotebook',
  },
  intuition: {
    prose: [
      'You cannot count atoms directly, but if every atom of an element has the same mass, you can find the count by weighing the sample and dividing by the mass of one atom.',
      'A mole (6.022 × 10²³ particles) is a counting unit, exactly like "a dozen" — it just names a very large, very specific number.',
      'Molar mass (g/mol) is the bridge between a measurable quantity (mass) and a countable quantity (moles) — and it\'s just the periodic table\'s atomic mass with different units.',
    ],
    callouts: [{ type: 'important', title: 'The two-step bridge', body: 'mass ↔ moles uses molar mass. moles ↔ particles uses Avogadro\'s number. Every mole conversion in chemistry is one or both of these steps.' }],
    visualizations: [{ id: 'ScienceNotebook', title: 'The Mole and Molar Mass', props: { lesson: LESSON_CHEM_1_4 } }],
  },
  math: { prose: [], callouts: [], visualizations: [] },
  rigor: { prose: [], callouts: [], visualizations: [] },
  examples: [], challenges: [],
  mentalModel: [
    'Counting by weighing: count = total mass ÷ mass of one item. This works for atoms exactly as it works for jelly beans.',
    'A mole is a count: 6.022 × 10²³ particles, chosen so that molar mass in g/mol matches atomic mass in u.',
    'mass ↔ moles: divide/multiply by molar mass. moles ↔ particles: multiply/divide by Avogadro\'s number.',
    'Molar mass of a compound = sum of the atomic masses of every atom in its formula.',
  ],
  checkpoints: ['read-intuition'],
  quiz: [
    {
      id: 'q1',
      type: 'choice',
      text: '"Counting by weighing." Why can you find the number of atoms in a sample just by weighing it?',
      options: [
        'Because a scale can detect individual atoms moving',
        'Because every atom of a given element has the same mass, so total mass ÷ mass of one atom gives the exact count',
        'Because chemists have memorized how many atoms are in every possible mass',
      ],
      correct: 1,
    },
    {
      id: 'q2',
      type: 'choice',
      text: '"A mole is a counting unit, like a dozen." What does one mole of any substance contain?',
      options: [
        'Exactly one gram of that substance',
        '6.022 × 10²³ particles of that substance, regardless of what the substance is',
        'A number of particles that depends on the substance\'s molar mass',
      ],
      correct: 1,
    },
    {
      id: 'q3',
      type: 'choice',
      text: '"Molar mass is the bridge between mass and moles." If you have a measured mass in grams, what do you do to find moles?',
      options: [
        'Multiply the mass by the molar mass',
        'Divide the mass by the molar mass',
        'Multiply the mass by Avogadro\'s number',
      ],
      correct: 1,
    },
    {
      id: 'q4',
      type: 'choice',
      text: 'You want to convert from moles to number of particles. What do you multiply by?',
      options: [
        'The molar mass (g/mol)',
        'Avogadro\'s number (6.022 × 10²³)',
        'The atomic number',
      ],
      correct: 1,
    },
  ],
}

export { LESSON_CHEM_1_4 }
