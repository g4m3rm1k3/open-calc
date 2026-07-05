// Chemistry · Chapter 1 · Lesson 6
// Empirical and Molecular Formulas

const LESSON_CHEM_1_6 = {
  title: 'Empirical and Molecular Formulas',
  subtitle: 'How chemists figure out the formula of a compound nobody has ever written down before.',
  sequential: true,

  cells: [

    {
      type: 'markdown',
      instruction: `### Reverse-engineering a formula

Imagine you're a chemist in a lab, and you've just made a brand-new compound nobody has ever isolated before. You don't get to look up its formula — there's nothing to look up. All you have is the compound itself, and a set of instruments that can burn it, weigh it, and tell you what elements come out.

This is the actual historical situation chemists faced for most of the last 300 years, and it's still exactly what happens today when a new compound is synthesized. The way out is **percent composition**: burn or break down a known mass of the compound, measure the mass of each element that comes out, and work backward to a formula.

The formula you get this way is called the **empirical formula** — the simplest whole-number ratio of atoms in the compound. It's not always the *actual* formula (the **molecular formula**), but it's always a whole-number multiple of it.`,
    },

    // ── Visual 1 — Percent composition → empirical formula ──────────────────────
    {
      type: 'js',
      instruction: `**Step through the process** used to turn a lab measurement (percent composition) into an empirical formula. Pick a compound to see real numbers.`,
      html: `<div class="scene">
  <div class="ctrl-row"><label class="clabel">Compound: <select id="cmpdSel"></select></label></div>
  <div class="steps" id="stepsWrap"></div>
</div>`,
      css: `body{margin:0;padding:14px;font-family:sans-serif}
.scene{display:flex;flex-direction:column;gap:12px}
.ctrl-row{display:flex;align-items:center;gap:10px}
.clabel{font-size:12px;color:var(--color-text-primary)}
select{padding:5px 8px;border-radius:6px;border:1px solid var(--color-border-secondary,#cbd5e1);background:var(--color-background-primary,#fff);color:var(--color-text-primary);font-size:12px}
.steps{display:flex;flex-direction:column;gap:8px}
table{border-collapse:collapse;width:100%;font-size:12px}
th,td{padding:6px 10px;text-align:right;border-bottom:1px solid var(--color-border-tertiary,#e2e8f0)}
th:first-child,td:first-child{text-align:left}
th{color:var(--color-text-secondary,#64748b);font-weight:600;font-size:10px;text-transform:uppercase;letter-spacing:.04em}
td{color:var(--color-text-primary,#1e293b);font-family:monospace}
.result{margin-top:4px;padding:10px 14px;border-radius:8px;background:var(--color-background-info,#eff6ff);border:1px solid #93c5fd;font-size:13px;font-weight:600;color:var(--color-text-info,#1d4ed8);font-family:monospace}`,
      startCode: `var COMPOUNDS=[
  {name:'Glucose-derived sample', percents:[{sym:'C',mass:12.011,pct:40.00},{sym:'H',mass:1.008,pct:6.71},{sym:'O',mass:15.999,pct:53.29}]},
  {name:'A nitrogen-oxygen compound', percents:[{sym:'N',mass:14.007,pct:30.45},{sym:'O',mass:15.999,pct:69.55}]},
  {name:'An iron oxide sample', percents:[{sym:'Fe',mass:55.845,pct:69.94},{sym:'O',mass:15.999,pct:30.06}]},
  {name:'A hydrocarbon sample', percents:[{sym:'C',mass:12.011,pct:85.63},{sym:'H',mass:1.008,pct:14.37}]},
];
var sel=document.getElementById('cmpdSel');
COMPOUNDS.forEach(function(c,i){
  var o=document.createElement('option'); o.value=i; o.textContent=c.name;
  sel.appendChild(o);
});

function renderTable(rows, cols, getCell){
  var t=document.createElement('table');
  var thead=document.createElement('tr');
  cols.forEach(function(c){ var th=document.createElement('th'); th.textContent=c; thead.appendChild(th); });
  t.appendChild(thead);
  rows.forEach(function(r,ri){
    var tr=document.createElement('tr');
    cols.forEach(function(c,ci){ var td=document.createElement('td'); td.textContent=getCell(r,ci); tr.appendChild(td); });
    t.appendChild(tr);
  });
  return t;
}

function build(idx){
  var wrap=document.getElementById('stepsWrap');
  wrap.innerHTML='';
  var data=COMPOUNDS[idx];

  var h1=document.createElement('div'); h1.style.fontSize='11px'; h1.style.color='var(--color-text-secondary,#64748b)'; h1.style.textTransform='uppercase'; h1.style.letterSpacing='.06em';
  h1.textContent='Step 1 — assume a 100 g sample, so each percent becomes grams';
  wrap.appendChild(h1);
  wrap.appendChild(renderTable(data.percents, ['Element','Mass (g)'], function(r,ci){ return ci===0 ? r.sym : r.pct.toFixed(2); }));

  var h2=document.createElement('div'); h2.style.fontSize='11px'; h2.style.color='var(--color-text-secondary,#64748b)'; h2.style.textTransform='uppercase'; h2.style.letterSpacing='.06em'; h2.style.marginTop='6px';
  h2.textContent='Step 2 — convert grams to moles (divide by molar mass)';
  wrap.appendChild(h2);
  var moles=data.percents.map(function(r){ return r.pct/r.mass; });
  wrap.appendChild(renderTable(data.percents, ['Element','Moles'], function(r,ci){
    var i=data.percents.indexOf(r);
    return ci===0 ? r.sym : moles[i].toFixed(4);
  }));

  var h3=document.createElement('div'); h3.style.fontSize='11px'; h3.style.color='var(--color-text-secondary,#64748b)'; h3.style.textTransform='uppercase'; h3.style.letterSpacing='.06em'; h3.style.marginTop='6px';
  h3.textContent='Step 3 — divide every mole value by the smallest one';
  wrap.appendChild(h3);
  var minMol=Math.min.apply(null,moles);
  var ratios=moles.map(function(m){ return m/minMol; });
  wrap.appendChild(renderTable(data.percents, ['Element','Ratio'], function(r,ci){
    var i=data.percents.indexOf(r);
    return ci===0 ? r.sym : ratios[i].toFixed(2);
  }));

  var formula=data.percents.map(function(r,i){
    var n=Math.round(ratios[i]);
    return r.sym+(n>1?n:'');
  }).join('');
  var res=document.createElement('div'); res.className='result';
  res.textContent='Empirical formula ≈ '+formula;
  wrap.appendChild(res);
}
sel.onchange=function(){ build(+sel.value); };
build(0);`,
      outputHeight: 460,
    },

    {
      type: 'markdown',
      instruction: `### Empirical formula vs. molecular formula

Notice the empirical formula only tells you a *ratio* — CH₂O could mean an actual molecule of CH₂O (formaldehyde), or C₂H₄O₂ (acetic acid — vinegar), or C₆H₁₂O₆ (glucose). All three have the exact same 1:2:1 ratio of C:H:O, and the exact same percent composition. Percent composition alone can never distinguish them.

To find the true **molecular formula**, you need one more piece of information: the compound's actual molar mass (measured separately, often by mass spectrometry — the same instrument from the last lesson). Then:

n = molar mass (molecular) ÷ molar mass (empirical)

molecular formula = empirical formula × n

If the empirical formula is CH₂O (empirical molar mass 30.03 g/mol) and the real molar mass turns out to be 180.16 g/mol, then n = 180.16 ÷ 30.03 = 6 — so the molecular formula is (CH₂O)₆ = C₆H₁₂O₆. That's glucose.`,
    },

    // ── Visual 2 — Empirical × n = Molecular ────────────────────────────────────
    {
      type: 'js',
      instruction: `**Drag the slider** to change n and watch the same empirical formula become different real molecules — all with identical percent composition, but very different molar masses and identities.`,
      html: `<div class="scene">
  <div class="ctrl-row">
    <span class="clabel">Empirical formula: <strong>CH₂O</strong> (molar mass 30.03 g/mol)</span>
  </div>
  <div class="ctrl-row">
    <span class="clabel">n = <strong id="nVal">1</strong></span>
    <input type="range" id="nSlider" min="1" max="6" value="1" style="flex:1">
  </div>
  <svg id="formSvg" viewBox="0 0 480 120" style="width:100%;display:block;border-radius:10px;background:var(--color-background-secondary,#f8fafc);border:1px solid var(--color-border-tertiary,#e2e8f0)"></svg>
  <div class="idbox" id="idBox"></div>
</div>`,
      css: `body{margin:0;padding:14px;font-family:sans-serif}
.scene{display:flex;flex-direction:column;gap:10px}
.ctrl-row{display:flex;align-items:center;gap:10px}
.clabel{font-size:12.5px;color:var(--color-text-primary)}
.idbox{font-size:12.5px;color:var(--color-text-secondary,#64748b);line-height:1.6;font-style:italic}`,
      startCode: `var NS='http://www.w3.org/2000/svg';
var svg=document.getElementById('formSvg');
var slider=document.getElementById('nSlider');
var EMP_MASS=30.03;
var IDENT={1:'Formaldehyde — a gas, used in preservatives',2:'Acetic acid — the acid in vinegar',3:'Glyceraldehyde — a simple sugar',4:'Erythrose — a 4-carbon sugar',5:'Ribose — the sugar backbone of RNA',6:'Glucose — the sugar your cells run on'};

function el(tag,attrs,txt){
  var n=document.createElementNS(NS,tag);
  for(var k in attrs) n.setAttribute(k,attrs[k]);
  if(txt!=null) n.textContent=txt;
  svg.appendChild(n); return n;
}
var SUB=['₀','₁','₂','₃','₄','₅','₆','₇','₈','₉'];
function toSub(num){ return String(num).split('').map(function(d){ return SUB[+d]; }).join(''); }

function draw(n){
  svg.innerHTML='';
  document.getElementById('nVal').textContent=n;
  el('rect',{x:0,y:0,width:480,height:120,fill:'transparent'});
  var c=n, h=2*n, o=n;
  var formula='C'+(c>1?toSub(c):'')+'H'+(h>1?toSub(h):'')+'O'+(o>1?toSub(o):'');
  el('text',{x:120,y:50,'text-anchor':'middle','font-size':26,'font-family':'monospace','font-weight':700,fill:'#3b82f6'},'(CH₂O)'+(n>1?('×'+n):''));
  el('text',{x:340,y:50,'text-anchor':'middle','font-size':26,'font-family':'monospace','font-weight':700,fill:'#10b981'},formula);
  el('text',{x:120,y:75,'text-anchor':'middle','font-size':11,fill:'var(--color-text-secondary,#64748b)'},'empirical × '+n);
  el('text',{x:340,y:75,'text-anchor':'middle','font-size':11,fill:'var(--color-text-secondary,#64748b)'},'molar mass = '+(EMP_MASS*n).toFixed(2)+' g/mol');
  el('line',{x1:200,y1:45,x2:280,y2:45,stroke:'var(--color-text-secondary,#94a3b8)','stroke-width':1.5,'marker-end':'url(#fa)'});
  var defs=document.createElementNS(NS,'defs');
  var marker=document.createElementNS(NS,'marker');
  marker.setAttribute('id','fa'); marker.setAttribute('markerWidth','6'); marker.setAttribute('markerHeight','6'); marker.setAttribute('refX','5'); marker.setAttribute('refY','3'); marker.setAttribute('orient','auto');
  var path=document.createElementNS(NS,'path'); path.setAttribute('d','M0,0 L6,3 L0,6 Z'); path.setAttribute('fill','var(--color-text-secondary,#94a3b8)');
  marker.appendChild(path); defs.appendChild(marker); svg.insertBefore(defs,svg.firstChild);
  document.getElementById('idBox').textContent=IDENT[n];
}
slider.oninput=function(){ draw(+slider.value); };
draw(1);`,
      outputHeight: 260,
    },

    {
      type: 'markdown',
      instruction: `### Composition of mixtures

Everything above assumed you're analyzing a **pure substance** — one compound, one fixed ratio of elements. But most real-world samples are **mixtures**: several substances physically combined, each keeping its own identity, in a ratio that can vary from sample to sample.

Seawater is a mixture (water + dissolved salts, in a ratio that varies by location). Air is a mixture (mostly N₂ and O₂, with trace gases). Brass is a mixture — an alloy — of copper and zinc, and the exact ratio determines its color and hardness.

For a mixture, "percent composition" means **percent by mass of each component substance** — not percent by mass of each element, and not a fixed, reproducible ratio the way it is for a pure compound. If you're told a solution is "3.5% NaCl by mass," that means exactly what it says: in 100 g of solution, 3.5 g is dissolved NaCl and 96.5 g is everything else (mostly water) — nothing more can be inferred about the compound's internal atomic ratios, because a mixture doesn't have one.`,
    },

    {
      type: 'markdown',
      instruction: `### Check your understanding`,
    },

    {
      type: 'challenge',
      instruction: `A compound is found to be 40.0% carbon, 6.7% hydrogen, and 53.3% oxygen by mass. After converting to moles and dividing by the smallest value, you get a ratio of C : H : O = 1 : 2 : 1. What is the empirical formula?`,
      options: [
        { label: 'A', text: 'C₆H₁₂O₆' },
        { label: 'B', text: 'CH₂O' },
        { label: 'C', text: 'C₂H₄O₂' },
        { label: 'D', text: 'CHO' },
      ],
      check: (label) => label === 'B',
      successMessage: 'Correct. A 1:2:1 ratio of C:H:O gives the empirical formula CH₂O directly — the simplest whole-number ratio. (This happens to be the same percent composition as glucose, acetic acid, and formaldehyde — which is exactly why percent composition alone can\'t tell them apart.)',
      failMessage: 'The empirical formula IS the ratio, written directly as subscripts: C₁H₂O₁ = CH₂O. Options A and C are molecular formulas that share this same ratio (they\'re both whole-number multiples of CH₂O), but the empirical formula itself is the simplest version.',
      html: '', css: `body{margin:0;padding:0;font-family:sans-serif}`, startCode: '', outputHeight: 320,
    },

    {
      type: 'challenge',
      instruction: `A compound has empirical formula CH₂ (empirical molar mass 14.03 g/mol) and an experimentally measured molar mass of 84.18 g/mol. What is its molecular formula?`,
      options: [
        { label: 'A', text: 'CH₂ (n = 1)' },
        { label: 'B', text: 'C₃H₆ (n = 3)' },
        { label: 'C', text: 'C₆H₁₂ (n = 6)' },
        { label: 'D', text: 'C₁₂H₂₄ (n = 12)' },
      ],
      check: (label) => label === 'C',
      successMessage: 'Correct. n = molecular molar mass ÷ empirical molar mass = 84.18 ÷ 14.03 = 6.0. Molecular formula = (CH₂)₆ = C₆H₁₂ — cyclohexane.',
      failMessage: 'Find n first: n = 84.18 ÷ 14.03 ≈ 6. Then multiply every subscript in the empirical formula by that n: (CH₂)₆ = C₆H₁₂.',
      html: '', css: `body{margin:0;padding:0;font-family:sans-serif}`, startCode: '', outputHeight: 320,
    },

    {
      type: 'challenge',
      instruction: `Why can't you determine the molecular formula of a compound from its percent composition alone?`,
      options: [
        { label: 'A', text: 'Percent composition measurements are always too imprecise to be useful.' },
        { label: 'B', text: 'Percent composition only fixes the ratio of atoms (the empirical formula) — any whole-number multiple of that ratio has the identical percent composition, so an independent molar mass measurement is needed to pick out which multiple is correct.' },
        { label: 'C', text: 'Percent composition only applies to mixtures, not pure compounds.' },
        { label: 'D', text: 'It can be determined — molecular formula and empirical formula are always the same thing.' },
      ],
      check: (label) => label === 'B',
      successMessage: 'Correct. This is the core limitation: percent composition is a ratio, and infinitely many molecules share the same ratio (CH₂O, C₂H₄O₂, C₆H₁₂O₆, ...). You need a separate, independent measurement — the actual molar mass — to know which multiple you actually have.',
      failMessage: 'The issue isn\'t precision or mixtures — it\'s that percent composition is mathematically a ratio, and many different real molecules share the exact same ratio. You need the compound\'s actual molar mass (a separate measurement) to determine n and pin down the true molecular formula.',
      html: '', css: `body{margin:0;padding:0;font-family:sans-serif}`, startCode: '', outputHeight: 340,
    },

  ],
}

export default {
  id: 'chem-1-6-empirical-and-molecular-formulas',
  slug: 'empirical-and-molecular-formulas',
  chapter: 'chem.1',
  order: 6,
  title: 'Empirical and Molecular Formulas',
  subtitle: 'How chemists figure out the formula of a compound nobody has ever written down before.',
  tags: ['chemistry', 'empirical-formula', 'molecular-formula', 'percent-composition', 'mixtures'],
  hook: {
    question: 'You\'ve just made a brand-new compound in the lab. Nothing to look up — how do you figure out its formula?',
    realWorldContext: 'This is a real historical (and modern) problem: burn or decompose a sample, weigh what comes out, and work backward to a formula using percent composition.',
    previewVisualizationId: 'ScienceNotebook',
  },
  intuition: {
    prose: [
      'Percent composition (measured by breaking a compound into its elements and weighing them) converts to moles, then to the simplest whole-number ratio — the empirical formula.',
      'The empirical formula only fixes a ratio. Many different real molecules share the same ratio and the same percent composition, so an independently measured molar mass is needed to find the true molecular formula.',
      'Molecular formula = empirical formula × n, where n = molecular molar mass ÷ empirical molar mass.',
      'Mixtures are different from pure compounds: their "percent composition" is percent by mass of each component substance, and that ratio can vary from sample to sample.',
    ],
    callouts: [{ type: 'important', title: 'Ratio vs. identity', body: 'CH₂O, C₂H₄O₂, and C₆H₁₂O₆ all have identical percent composition — same ratio, different molecules. Percent composition alone can never tell them apart.' }],
    visualizations: [{ id: 'ScienceNotebook', title: 'Empirical and Molecular Formulas', props: { lesson: LESSON_CHEM_1_6 } }],
  },
  math: { prose: [], callouts: [], visualizations: [] },
  rigor: { prose: [], callouts: [], visualizations: [] },
  examples: [], challenges: [],
  mentalModel: [
    'Percent composition → moles (divide by molar mass) → ratio (divide by smallest) → empirical formula.',
    'Empirical formula is a ratio, not necessarily the real formula — many molecules can share one.',
    'n = molecular molar mass ÷ empirical molar mass; molecular formula = empirical formula × n.',
    'Mixtures ≠ compounds: mixture composition (percent by mass of components) can vary; compound composition (percent by mass of elements) is fixed by the formula.',
  ],
  checkpoints: ['read-intuition'],
  quiz: [
    {
      id: 'q1',
      type: 'choice',
      text: '"Percent composition → moles → ratio → empirical formula." What is the correct order of steps to find an empirical formula from percent composition?',
      options: [
        'Convert percentages directly to formula subscripts',
        'Assume a 100 g sample (percents become grams), convert grams to moles using molar mass, then divide every mole value by the smallest one',
        'Multiply each percentage by Avogadro\'s number',
      ],
      correct: 1,
    },
    {
      id: 'q2',
      type: 'choice',
      text: '"Empirical formula is a ratio, not necessarily the real formula." Why can\'t percent composition alone tell you the molecular formula?',
      options: [
        'Because percent composition measurements are never accurate enough',
        'Because many different real molecules (whole-number multiples of the same ratio) share identical percent composition — you need an independent molar mass measurement to distinguish them',
        'Because percent composition only works for mixtures, not compounds',
      ],
      correct: 1,
    },
    {
      id: 'q3',
      type: 'choice',
      text: '"n = molecular molar mass ÷ empirical molar mass." If a compound\'s empirical formula is CH₂ (14 g/mol) and its real molar mass is 42 g/mol, what is n, and what is the molecular formula?',
      options: [
        'n = 2, formula C₂H₄',
        'n = 3, formula C₃H₆',
        'n = 42, formula C₄₂H₈₄',
      ],
      correct: 1,
    },
    {
      id: 'q4',
      type: 'choice',
      text: '"Mixtures ≠ compounds." A solution is described as "5% NaCl by mass." What does this tell you?',
      options: [
        'That NaCl itself has an unusual internal atomic ratio in this sample',
        'That in 100 g of this solution, 5 g is dissolved NaCl — a mixture ratio that could be different in a different sample of "salt water"',
        'Nothing useful — mixtures cannot be described by percent composition',
      ],
      correct: 1,
    },
  ],
}

export { LESSON_CHEM_1_6 }
