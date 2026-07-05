// Chemistry · Chapter 1 · Lesson 5
// Mass Spectrometry and Isotopic Abundance

const LESSON_CHEM_1_5 = {
  title: 'Mass Spectrometry and Isotopic Abundance',
  subtitle: 'The periodic table\'s atomic masses are averages — here\'s how we measure the numbers that go into them.',
  sequential: true,

  cells: [

    {
      type: 'markdown',
      instruction: `### An average that no single atom actually has

Look up chlorine on the periodic table and you'll find its atomic mass listed as 35.45 u. But if you go find an actual chlorine atom, weigh it precisely, you will *never* get 35.45. You'll get either about 35 or about 37 — never anything in between.

That's because chlorine atoms come in two flavors: **chlorine-35** (17 protons, 18 neutrons) and **chlorine-37** (17 protons, 20 neutrons). Same element — same number of protons, same chemistry — but different mass, because they have different numbers of neutrons. These are called **isotopes**.

The 35.45 on the periodic table isn't the mass of any real atom. It's a **weighted average** across all the chlorine atoms that exist naturally, weighted by how common each isotope actually is. To calculate that average precisely, chemists needed a way to separate isotopes and measure exactly how abundant each one is. That instrument is the **mass spectrometer**.`,
    },

    // ── Visual 1 — How a mass spectrometer works ────────────────────────────────
    {
      type: 'js',
      instruction: `**Click each stage** to see what happens to the sample as it moves through the instrument. A mass spectrometer doesn't weigh atoms directly — it deflects them, and how *much* they deflect reveals their mass.`,
      html: `<div class="scene">
  <div class="stage-btns" id="stageBtns"></div>
  <svg id="msSvg" viewBox="0 0 560 190" style="width:100%;display:block;border-radius:10px;background:var(--color-background-secondary,#0a0f1e);border:1px solid var(--color-border-tertiary,#1e293b)"></svg>
  <div class="stage-desc" id="stageDesc"></div>
</div>`,
      css: `body{margin:0;padding:14px;font-family:sans-serif}
.scene{display:flex;flex-direction:column;gap:10px}
.stage-btns{display:flex;gap:6px;flex-wrap:wrap}
.sbtn{padding:6px 12px;border-radius:7px;border:1.5px solid var(--color-border-secondary,#e2e8f0);background:transparent;color:var(--color-text-secondary,#64748b);cursor:pointer;font-size:11.5px;font-weight:600;transition:all .15s}
.sbtn.active{border-color:#38bdf8;background:rgba(56,189,248,0.12);color:#0ea5e9}
.stage-desc{font-size:12.5px;color:var(--color-text-primary,#1e293b);line-height:1.65;min-height:40px}`,
      startCode: `var NS='http://www.w3.org/2000/svg';
var svg=document.getElementById('msSvg');
var stages=[
  {label:'1. Ionize', desc:'The sample is bombarded with high-energy electrons, knocking an electron off each atom. Neutral atoms can\\'t be steered by a magnetic field — only charged ions can.'},
  {label:'2. Accelerate', desc:'An electric field accelerates the newly formed ions to a high, consistent speed, firing them down the tube as a narrow beam.'},
  {label:'3. Deflect', desc:'A magnetic field bends the beam\\'s path. Lighter ions bend more; heavier ions bend less — mass is measured indirectly, through how much a known force fails to move it.'},
  {label:'4. Detect', desc:'A detector records where each ion lands. Position tells you mass. The number of ions landing at each position tells you relative abundance — this is what builds the spectrum.'},
];
var btnRow=document.getElementById('stageBtns');
stages.forEach(function(s,i){
  var b=document.createElement('button');
  b.className='sbtn'; b.textContent=s.label; b.dataset.i=i;
  b.onclick=function(){ setStage(i); };
  btnRow.appendChild(b);
});

function el(tag,attrs){
  var n=document.createElementNS(NS,tag);
  for(var k in attrs) n.setAttribute(k,attrs[k]);
  svg.appendChild(n);
  return n;
}

svg.innerHTML='';
el('rect',{x:0,y:0,width:560,height:190,fill:'transparent'});

// Tube
el('rect',{x:20,y:70,width:520,height:16,rx:8,fill:'none',stroke:'#334155','stroke-width':1.5});
// Zone dividers + labels
var zones=[[20,'Source'],[160,'Accel.'],[320,'Magnet'],[460,'Detector']];
zones.forEach(function(z){
  el('line',{x1:z[0],y1:60,x2:z[0],y2:96,stroke:'#334155','stroke-width':1,'stroke-dasharray':'3,2'});
});

// Beam paths for two masses, only shown after stage 2
var lightPath=el('path',{d:'M170,78 Q 340,20 460,55', fill:'none', stroke:'#38bdf8','stroke-width':2, opacity:0});
var heavyPath=el('path',{d:'M170,78 Q 340,55 460,72', fill:'none', stroke:'#f59e0b','stroke-width':2, opacity:0});
var lightLabel=el('text',{x:470,y:50,'font-size':10,fill:'#38bdf8','font-family':'monospace',opacity:0});
lightLabel.textContent='light ion (deflects more)';
var heavyLabel=el('text',{x:470,y:88,'font-size':10,fill:'#f59e0b','font-family':'monospace',opacity:0});
heavyLabel.textContent='heavy ion (deflects less)';

var ionDot=el('circle',{cx:40,cy:78,r:5,fill:'#94a3b8'});
var chargeLabel=el('text',{x:40,y:60,'text-anchor':'middle','font-size':11,fill:'#94a3b8','font-family':'monospace'});
chargeLabel.textContent='';

var detBars=[];
[455,475,495,515].forEach(function(x,i){
  var b=el('rect',{x:x,y:130,width:12,height:0,fill:i%2?'#f59e0b':'#38bdf8',opacity:0});
  detBars.push(b);
});

function setStage(i){
  Array.prototype.forEach.call(btnRow.children,function(b,bi){ b.className='sbtn'+(bi===i?' active':''); });
  document.getElementById('stageDesc').textContent=stages[i].desc;
  if(i===0){
    ionDot.setAttribute('cx',40); ionDot.setAttribute('fill','#94a3b8');
    chargeLabel.textContent=''; chargeLabel.setAttribute('x',40);
    lightPath.setAttribute('opacity',0); heavyPath.setAttribute('opacity',0);
    lightLabel.setAttribute('opacity',0); heavyLabel.setAttribute('opacity',0);
    detBars.forEach(function(b){b.setAttribute('opacity',0);b.setAttribute('height',0);});
  } else if(i===1){
    ionDot.setAttribute('cx',90); ionDot.setAttribute('fill','#e2e8f0');
    chargeLabel.textContent='+'; chargeLabel.setAttribute('x',90);
    lightPath.setAttribute('opacity',0); heavyPath.setAttribute('opacity',0);
    lightLabel.setAttribute('opacity',0); heavyLabel.setAttribute('opacity',0);
    detBars.forEach(function(b){b.setAttribute('opacity',0);b.setAttribute('height',0);});
  } else if(i===2){
    ionDot.setAttribute('cx',170); ionDot.setAttribute('fill','#e2e8f0');
    chargeLabel.textContent='+'; chargeLabel.setAttribute('x',170);
    lightPath.setAttribute('opacity',1); heavyPath.setAttribute('opacity',1);
    lightLabel.setAttribute('opacity',1); heavyLabel.setAttribute('opacity',1);
    detBars.forEach(function(b){b.setAttribute('opacity',0);b.setAttribute('height',0);});
  } else {
    ionDot.setAttribute('cx',460); ionDot.setAttribute('fill','#e2e8f0');
    chargeLabel.textContent=''; chargeLabel.setAttribute('x',460);
    lightPath.setAttribute('opacity',1); heavyPath.setAttribute('opacity',1);
    lightLabel.setAttribute('opacity',1); heavyLabel.setAttribute('opacity',1);
    var heights=[10,45,25,8];
    detBars.forEach(function(b,idx){
      b.setAttribute('opacity',0.85);
      b.setAttribute('y',130-heights[idx]);
      b.setAttribute('height',heights[idx]);
    });
  }
}
setStage(0);`,
      outputHeight: 340,
    },

    {
      type: 'markdown',
      instruction: `### Reading a mass spectrum

The output of a mass spectrometer is a **spectrum**: a graph with mass-to-charge ratio on the horizontal axis and relative abundance (as a percentage) on the vertical axis. Each peak is one isotope. The peak's position tells you its mass; the peak's height tells you how common it is.

To find the **average atomic mass** — the number printed on the periodic table — multiply each isotope's mass by its fractional abundance (percentage ÷ 100), then add the results together. This is a weighted average, exactly like calculating a weighted course grade from several exam scores of different importance.

average atomic mass = Σ (isotope mass × fractional abundance)`,
    },

    // ── Visual 2 — Interactive spectrum + weighted average ──────────────────────
    {
      type: 'js',
      instruction: `**Pick an element** to see its real isotopic spectrum and watch the weighted-average calculation build the periodic table value from scratch.`,
      html: `<div class="scene">
  <div class="ctrl-row">
    <label class="clabel">Element: <select id="elSel"></select></label>
  </div>
  <svg id="specSvg" viewBox="0 0 480 220" style="width:100%;display:block;border-radius:10px;background:var(--color-background-secondary,#f8fafc);border:1px solid var(--color-border-tertiary,#e2e8f0)"></svg>
  <div class="calc-box" id="calcBox"></div>
</div>`,
      css: `body{margin:0;padding:14px;font-family:sans-serif}
.scene{display:flex;flex-direction:column;gap:10px}
.ctrl-row{display:flex;align-items:center;gap:10px}
.clabel{font-size:12px;color:var(--color-text-primary)}
select{padding:5px 8px;border-radius:6px;border:1px solid var(--color-border-secondary,#cbd5e1);background:var(--color-background-primary,#fff);color:var(--color-text-primary);font-size:12px}
.calc-box{font-size:12.5px;color:var(--color-text-primary);line-height:1.9;font-family:monospace;background:var(--color-background-info,#eff6ff);border-radius:8px;padding:10px 14px;border:1px solid #93c5fd}`,
      startCode: `var ELEMENTS=[
  {name:'Chlorine', sym:'Cl', isotopes:[{mass:34.969, abund:75.77},{mass:36.966, abund:24.23}], tableMass:35.45},
  {name:'Boron', sym:'B', isotopes:[{mass:10.013, abund:19.9},{mass:11.009, abund:80.1}], tableMass:10.81},
  {name:'Copper', sym:'Cu', isotopes:[{mass:62.930, abund:69.15},{mass:64.928, abund:30.85}], tableMass:63.55},
  {name:'Magnesium', sym:'Mg', isotopes:[{mass:23.985,abund:78.99},{mass:24.986,abund:10.00},{mass:25.983,abund:11.01}], tableMass:24.31},
  {name:'Neon', sym:'Ne', isotopes:[{mass:19.992,abund:90.48},{mass:20.994,abund:0.27},{mass:21.991,abund:9.25}], tableMass:20.18},
];
var sel=document.getElementById('elSel');
ELEMENTS.forEach(function(e,i){
  var o=document.createElement('option'); o.value=i; o.textContent=e.sym+' — '+e.name;
  sel.appendChild(o);
});

var NS='http://www.w3.org/2000/svg';
var svg=document.getElementById('specSvg');
var PL=50,PR=20,PT=20,PB=40,W=480,H=220;
var GW=W-PL-PR, GH=H-PT-PB;

function draw(idx){
  svg.innerHTML='';
  var data=ELEMENTS[idx];
  var minM=Math.min.apply(null,data.isotopes.map(function(i){return i.mass;}))-1.5;
  var maxM=Math.max.apply(null,data.isotopes.map(function(i){return i.mass;}))+1.5;
  function el(tag,attrs,txt){
    var n=document.createElementNS(NS,tag);
    for(var k in attrs) n.setAttribute(k,attrs[k]);
    if(txt!=null) n.textContent=txt;
    svg.appendChild(n); return n;
  }
  el('rect',{x:0,y:0,width:W,height:H,fill:'transparent'});
  // Axes
  el('line',{x1:PL,y1:PT,x2:PL,y2:PT+GH,stroke:'var(--color-border-secondary,#94a3b8)','stroke-width':1});
  el('line',{x1:PL,y1:PT+GH,x2:PL+GW,y2:PT+GH,stroke:'var(--color-border-secondary,#94a3b8)','stroke-width':1});
  el('text',{x:14,y:PT+6,'font-size':10,fill:'var(--color-text-secondary,#64748b)'},'%');
  el('text',{x:PL+GW,y:PT+GH+32,'text-anchor':'end','font-size':10,fill:'var(--color-text-secondary,#64748b)'},'mass (u)');
  // y gridlines
  [0,25,50,75,100].forEach(function(v){
    var y=PT+GH-(v/100)*GH;
    el('line',{x1:PL-4,y1:y,x2:PL+GW,y2:y,stroke:'var(--color-border-tertiary,#e2e8f0)','stroke-width':0.5});
    el('text',{x:PL-8,y:y+3,'text-anchor':'end','font-size':9,fill:'var(--color-text-secondary,#64748b)'},v);
  });
  function xPos(m){ return PL+((m-minM)/(maxM-minM))*GW; }
  data.isotopes.forEach(function(iso,i){
    var x=xPos(iso.mass);
    var y=PT+GH-(iso.abund/100)*GH;
    el('line',{x1:x,y1:PT+GH,x2:x,y2:y,stroke:'#3b82f6','stroke-width':6,opacity:0.8});
    el('text',{x:x,y:y-8,'text-anchor':'middle','font-size':10,'font-family':'monospace',fill:'var(--color-text-primary,#1e293b)'},iso.mass.toFixed(3));
    el('text',{x:x,y:PT+GH+16,'text-anchor':'middle','font-size':9,fill:'var(--color-text-secondary,#64748b)'},iso.abund+'%');
  });

  var weighted=data.isotopes.reduce(function(sum,iso){ return sum+iso.mass*(iso.abund/100); },0);
  var terms=data.isotopes.map(function(iso){
    return '('+iso.mass.toFixed(3)+' × '+(iso.abund/100).toFixed(4)+')';
  }).join(' + ');
  document.getElementById('calcBox').innerHTML =
    'average atomic mass = '+terms+'<br>'+
    '                    = '+weighted.toFixed(3)+' u &nbsp; (periodic table: '+data.tableMass+' u)';
}
sel.onchange=function(){ draw(+sel.value); };
draw(0);`,
      outputHeight: 400,
    },

    {
      type: 'markdown',
      instruction: `### Check your understanding`,
    },

    {
      type: 'challenge',
      instruction: `Boron has two isotopes: boron-10 (mass 10.013 u, abundance 19.9%) and boron-11 (mass 11.009 u, abundance 80.1%). Which calculation correctly finds boron's average atomic mass?`,
      options: [
        { label: 'A', text: '(10.013 + 11.009) ÷ 2 = 10.511 u' },
        { label: 'B', text: '(10.013 × 0.199) + (11.009 × 0.801) = 10.811 u' },
        { label: 'C', text: '10.013 × 0.801 + 11.009 × 0.199 = 10.211 u' },
        { label: 'D', text: '10.013 + 11.009 = 21.022 u' },
      ],
      check: (label) => label === 'B',
      successMessage: 'Correct. Each isotope\'s mass is multiplied by its own fractional abundance (percentage ÷ 100), and the results are added — a weighted average, not a simple average. This is exactly why boron\'s periodic table mass (10.81) sits much closer to 11 than to 10: boron-11 is far more abundant.',
      failMessage: 'This must be a weighted average — simply averaging the two masses (option A) ignores how much more common one isotope is than the other. Multiply each mass by ITS OWN abundance fraction, not the other isotope\'s.',
      html: '', css: `body{margin:0;padding:0;font-family:sans-serif}`, startCode: '', outputHeight: 320,
    },

    {
      type: 'challenge',
      instruction: `In a mass spectrometer, why do lighter ions deflect more than heavier ions when passing through the same magnetic field?`,
      options: [
        { label: 'A', text: 'Lighter ions carry more electric charge, so the magnetic force on them is stronger.' },
        { label: 'B', text: 'For the same force from the magnetic field, a lighter ion (less mass) undergoes greater acceleration and curves more — heavier ions resist the same force more (more inertia).' },
        { label: 'C', text: 'Lighter ions travel slower through the accelerator, giving the magnet more time to act on them.' },
        { label: 'D', text: 'The magnetic field is deliberately made stronger for lighter elements.' },
      ],
      check: (label) => label === 'B',
      successMessage: 'Correct. This is Newton\'s second law in action: the same magnetic force produces more curvature (more acceleration) on a smaller mass. That\'s the entire physical principle the instrument depends on — deflection amount reveals mass.',
      failMessage: 'Charge is the same for singly-ionized atoms, and the field strength doesn\'t change between elements. The real reason is inertia: F = ma means the same force (F) produces more acceleration (a) when mass (m) is smaller — lighter ions curve more.',
      html: '', css: `body{margin:0;padding:0;font-family:sans-serif}`, startCode: '', outputHeight: 340,
    },

    {
      type: 'challenge',
      instruction: `An element has two isotopes. If the periodic table's average atomic mass is very close to the mass of isotope A and far from isotope B, what does that tell you?`,
      options: [
        { label: 'A', text: 'Isotope A is far more naturally abundant than isotope B.' },
        { label: 'B', text: 'Isotope A has more protons than isotope B.' },
        { label: 'C', text: 'Isotope B does not actually exist in nature.' },
        { label: 'D', text: 'Isotope A is radioactive and isotope B is stable.' },
      ],
      check: (label) => label === 'A',
      successMessage: 'Correct. A weighted average sits closer to whichever value has more "weight" — in this case, whichever isotope is more common. Boron is a real example: its average (10.81) sits close to boron-11 because boron-11 makes up about 80% of natural boron.',
      failMessage: 'Isotopes of the same element always have the same number of protons (that\'s what makes them the same element) — the difference is only in neutrons. A weighted average leaning toward one value simply means that value carries more weight, i.e. that isotope is more abundant.',
      html: '', css: `body{margin:0;padding:0;font-family:sans-serif}`, startCode: '', outputHeight: 320,
    },

  ],
}

export default {
  id: 'chem-1-5-mass-spectrometry',
  slug: 'mass-spectrometry',
  chapter: 'chem.1',
  order: 5,
  title: 'Mass Spectrometry and Isotopic Abundance',
  subtitle: 'The periodic table\'s atomic masses are averages — here\'s how we measure the numbers that go into them.',
  tags: ['chemistry', 'isotopes', 'mass-spectrometry', 'atomic-mass', 'weighted-average'],
  hook: {
    question: 'The periodic table lists chlorine\'s mass as 35.45 — but no single chlorine atom has that mass. Where does that number come from?',
    realWorldContext: 'Every atomic mass on the periodic table is a measured, weighted average across an element\'s naturally occurring isotopes — and mass spectrometry is the instrument that measures it.',
    previewVisualizationId: 'ScienceNotebook',
  },
  intuition: {
    prose: [
      'Isotopes are atoms of the same element (same protons) with different numbers of neutrons, and therefore different masses.',
      'A mass spectrometer ionizes, accelerates, and magnetically deflects a sample — lighter ions deflect more, heavier ions deflect less, so deflection amount reveals mass.',
      'The periodic table\'s atomic mass is a weighted average of an element\'s isotope masses, weighted by how abundant each isotope actually is in nature.',
    ],
    callouts: [{ type: 'important', title: 'Weighted, not simple, average', body: 'average atomic mass = Σ (isotope mass × fractional abundance). The more abundant isotope pulls the average closer to its own mass.' }],
    visualizations: [{ id: 'ScienceNotebook', title: 'Mass Spectrometry and Isotopic Abundance', props: { lesson: LESSON_CHEM_1_5 } }],
  },
  math: { prose: [], callouts: [], visualizations: [] },
  rigor: { prose: [], callouts: [], visualizations: [] },
  examples: [], challenges: [],
  mentalModel: [
    'Isotopes: same protons, different neutrons, different mass, same chemistry.',
    'Mass spectrometer stages: ionize → accelerate → magnetically deflect → detect. Lighter ions deflect more (F=ma: same force, less mass, more curvature).',
    'A spectrum plots mass (x) vs. relative abundance (y) — one peak per isotope.',
    'average atomic mass = Σ (isotope mass × fractional abundance) — a weighted average, pulled toward the more abundant isotope.',
  ],
  checkpoints: ['read-intuition'],
  quiz: [
    {
      id: 'q1',
      type: 'choice',
      text: '"Isotopes: same protons, different neutrons." What is true of two isotopes of the same element?',
      options: [
        'They have different numbers of protons but the same mass',
        'They have the same number of protons (same element) but different numbers of neutrons, giving them different masses',
        'They are different elements entirely, just with similar names',
      ],
      correct: 1,
    },
    {
      id: 'q2',
      type: 'choice',
      text: '"Lighter ions deflect more." Why does a magnetic field curve a lighter ion\'s path more than a heavier ion\'s path?',
      options: [
        'Lighter ions have a stronger electric charge',
        'The same magnetic force produces greater acceleration on a smaller mass (F = ma), so lighter ions curve more',
        'Heavier ions move too fast for the magnet to affect them',
      ],
      correct: 1,
    },
    {
      id: 'q3',
      type: 'choice',
      text: '"A spectrum plots mass vs. abundance." In a mass spectrum, what does the HEIGHT of a peak represent?',
      options: [
        'The exact mass of that isotope',
        'How electrically charged that isotope is',
        'How abundant (common) that isotope is in a natural sample',
      ],
      correct: 2,
    },
    {
      id: 'q4',
      type: 'choice',
      text: '"average atomic mass = Σ (isotope mass × fractional abundance)." An element is 90% isotope X (mass 20) and 10% isotope Y (mass 22). Which is closest to the average atomic mass?',
      options: [
        '21.0 (a simple average of 20 and 22)',
        '20.2 (weighted toward the more abundant isotope X)',
        '22.0 (the heavier isotope\'s mass)',
      ],
      correct: 1,
    },
  ],
}

export { LESSON_CHEM_1_5 }
