// Chemistry · Chapter 1 · Lesson 7
// Electron Configuration

const LESSON_CHEM_1_7 = {
  title: 'Electron Configuration',
  subtitle: 'The address system that tells you exactly where every electron in an atom lives.',
  sequential: true,

  cells: [

    {
      type: 'markdown',
      instruction: `### Electrons don't just orbit — they live in neighborhoods

Back in lesson 3 you met the shell model: electrons occupy shells at increasing distance from the nucleus (n = 1, 2, 3, ...). That picture is a good start, but it's not precise enough to explain real chemistry — why oxygen forms 2 bonds and carbon forms 4, why some elements are magnetic and others aren't, why the periodic table has the exact shape it does (2 columns, then 6, then a jump to include 10 more in the middle).

The real picture breaks each shell into **subshells** (labeled s, p, d, f), and each subshell into **orbitals** — three-dimensional regions of space where an electron is likely to be found. Every orbital holds at most 2 electrons. Writing out which orbitals are filled, in order, for a given atom is called its **electron configuration**, and it's the single most useful piece of information for predicting how an element behaves.`,
    },

    // ── Visual 1 — Subshell / orbital capacity map ──────────────────────────────
    {
      type: 'js',
      instruction: `**Click a shell (n = 1 to 4)** to see which subshells it contains, how many orbitals each subshell has, and its total electron capacity.`,
      html: `<div class="scene">
  <div class="ctrl-row" id="shellBtns"></div>
  <svg id="shellSvg" viewBox="0 0 480 190" style="width:100%;display:block;border-radius:10px;background:var(--color-background-secondary,#f8fafc);border:1px solid var(--color-border-tertiary,#e2e8f0)"></svg>
  <div class="capline" id="capLine"></div>
</div>`,
      css: `body{margin:0;padding:14px;font-family:sans-serif}
.scene{display:flex;flex-direction:column;gap:10px}
.ctrl-row{display:flex;gap:8px}
.sbtn{padding:6px 14px;border-radius:8px;border:1px solid var(--color-border-secondary,#cbd5e1);background:var(--color-background-primary,#fff);color:var(--color-text-primary);font-size:13px;font-weight:600;cursor:pointer}
.sbtn.active{background:#3b82f6;color:#fff;border-color:#3b82f6}
.capline{font-size:13px;font-weight:600;color:var(--color-text-primary,#1e293b);text-align:center}`,
      startCode: `var NS='http://www.w3.org/2000/svg';
var svg=document.getElementById('shellSvg');
var btnWrap=document.getElementById('shellBtns');
var SUB={s:1,p:3,d:5,f:7};
var SUBCOLOR={s:'#3b82f6',p:'#10b981',d:'#f59e0b',f:'#ef4444'};
var SHELLS={
  1:['s'],
  2:['s','p'],
  3:['s','p','d'],
  4:['s','p','d','f'],
};
[1,2,3,4].forEach(function(n){
  var b=document.createElement('button'); b.className='sbtn'; b.textContent='n = '+n;
  b.onclick=function(){ draw(n); highlight(n); };
  btnWrap.appendChild(b);
});
function highlight(n){
  Array.prototype.forEach.call(btnWrap.children, function(b,i){ b.classList.toggle('active', i===n-1); });
}
function el(tag,attrs,txt){
  var e=document.createElementNS(NS,tag);
  for(var k in attrs) e.setAttribute(k,attrs[k]);
  if(txt!=null) e.textContent=txt;
  svg.appendChild(e); return e;
}
function draw(n){
  svg.innerHTML='';
  var subs=SHELLS[n];
  var boxW=440/subs.length;
  var total=0;
  subs.forEach(function(s,i){
    var x=20+i*boxW;
    var orbitals=SUB[s];
    var cap=orbitals*2;
    total+=cap;
    el('rect',{x:x,y:30,width:boxW-14,height:80,rx:8,fill:SUBCOLOR[s],'fill-opacity':0.15,stroke:SUBCOLOR[s],'stroke-width':1.5});
    el('text',{x:x+(boxW-14)/2,y:58,'text-anchor':'middle','font-size':20,'font-weight':700,fill:SUBCOLOR[s]},n+s);
    el('text',{x:x+(boxW-14)/2,y:78,'text-anchor':'middle','font-size':11,fill:'var(--color-text-secondary,#64748b)'},orbitals+' orbital'+(orbitals>1?'s':''));
    el('text',{x:x+(boxW-14)/2,y:96,'text-anchor':'middle','font-size':11,fill:'var(--color-text-secondary,#64748b)'},'holds '+cap+' e⁻');
    for(var o=0;o<orbitals;o++){
      el('rect',{x:x+8+o*16,y:118,width:12,height:12,rx:2,fill:'none',stroke:SUBCOLOR[s],'stroke-width':1.5});
    }
  });
  el('text',{x:240,y:170,'text-anchor':'middle','font-size':13,'font-weight':700,fill:'var(--color-text-primary,#1e293b)'},'Shell n='+n+' total capacity: '+total+' electrons (2n² = '+(2*n*n)+')');
  document.getElementById('capLine').textContent='Each small box is one orbital (max 2 electrons each, opposite spins).';
}
draw(1); highlight(1);`,
      outputHeight: 300,
    },

    {
      type: 'markdown',
      instruction: `### Filling order: the Aufbau principle

Electrons fill the lowest-energy orbitals first — this is the **Aufbau principle** ("Aufbau" is German for "building up"). The tricky part is that energy order isn't simply 1s, 2s, 2p, 3s, 3p, 3d, 4s... — the 4s subshell is actually slightly *lower* energy than 3d, so it fills first. The standard memory aid is the diagonal rule, read off a diagram of diagonal arrows through the subshells.

Two more rules finish the picture:

- **Pauli exclusion principle**: no two electrons in the same atom can have identical quantum numbers — practically, this is why each orbital holds at most 2 electrons, and they must have opposite spins.
- **Hund's rule**: within a subshell with multiple orbitals of equal energy (like the 3 p orbitals), electrons fill each orbital singly, with parallel spins, before any orbital gets a second electron. Atoms "spread out" before they "pair up."`,
    },

    // ── Visual 2 — Build the configuration atom by atom ─────────────────────────
    {
      type: 'js',
      instruction: `**Step through the periodic table one element at a time** and watch the electron configuration build up, following the Aufbau filling order.`,
      html: `<div class="scene">
  <div class="ctrl-row">
    <button id="prevBtn" class="navbtn">◀ Prev</button>
    <div class="zlabel" id="zLabel"></div>
    <button id="nextBtn" class="navbtn">Next ▶</button>
  </div>
  <div class="config" id="configLine"></div>
  <svg id="fillSvg" viewBox="0 0 480 150" style="width:100%;display:block;border-radius:10px;background:var(--color-background-secondary,#f8fafc);border:1px solid var(--color-border-tertiary,#e2e8f0)"></svg>
</div>`,
      css: `body{margin:0;padding:14px;font-family:sans-serif}
.scene{display:flex;flex-direction:column;gap:10px}
.ctrl-row{display:flex;align-items:center;gap:14px}
.navbtn{padding:6px 14px;border-radius:8px;border:1px solid var(--color-border-secondary,#cbd5e1);background:var(--color-background-primary,#fff);color:var(--color-text-primary);font-size:13px;font-weight:600;cursor:pointer}
.zlabel{font-size:14px;font-weight:700;color:var(--color-text-primary,#1e293b);flex:1;text-align:center}
.config{font-family:monospace;font-size:15px;font-weight:600;color:#3b82f6;text-align:center;min-height:22px}`,
      startCode: `var NS='http://www.w3.org/2000/svg';
var svg=document.getElementById('fillSvg');
var ORDER=[
  {sub:'1s',cap:2},{sub:'2s',cap:2},{sub:'2p',cap:6},{sub:'3s',cap:2},{sub:'3p',cap:6},
  {sub:'4s',cap:2},{sub:'3d',cap:10},{sub:'4p',cap:6},{sub:'5s',cap:2},{sub:'4d',cap:10},{sub:'5p',cap:6},
];
var NAMES=['','Hydrogen','Helium','Lithium','Beryllium','Boron','Carbon','Nitrogen','Oxygen','Fluorine','Neon',
  'Sodium','Magnesium','Aluminum','Silicon','Phosphorus','Sulfur','Chlorine','Argon',
  'Potassium','Calcium','Scandium','Titanium','Vanadium','Chromium','Manganese','Iron','Cobalt','Nickel','Copper','Zinc',
  'Gallium','Germanium','Arsenic','Selenium','Bromine','Krypton'];
var SYM=['','H','He','Li','Be','B','C','N','O','F','Ne','Na','Mg','Al','Si','P','S','Cl','Ar',
  'K','Ca','Sc','Ti','V','Cr','Mn','Fe','Co','Ni','Cu','Zn','Ga','Ge','As','Se','Br','Kr'];
var MAXZ=36;
var z=1;

function configFor(z){
  var remaining=z, out=[];
  for(var i=0;i<ORDER.length && remaining>0;i++){
    var n=Math.min(ORDER[i].cap, remaining);
    out.push({sub:ORDER[i].sub, n:n, full:ORDER[i].cap});
    remaining-=n;
  }
  return out;
}

function el(tag,attrs,txt){
  var e=document.createElementNS(NS,tag);
  for(var k in attrs) e.setAttribute(k,attrs[k]);
  if(txt!=null) e.textContent=txt;
  svg.appendChild(e); return e;
}

var SUPER=['⁰','¹','²','³','⁴','⁵','⁶','⁷','⁸','⁹'];
function toSuper(n){ return String(n).split('').map(function(d){ return SUPER[+d]; }).join(''); }

function render(){
  document.getElementById('zLabel').textContent='Z = '+z+'  '+SYM[z]+'  ('+NAMES[z]+')';
  var cfg=configFor(z);
  document.getElementById('configLine').textContent=cfg.map(function(c){ return c.sub+toSuper(c.n); }).join(' ');

  svg.innerHTML='';
  var boxW=440/cfg.length;
  cfg.forEach(function(c,i){
    var x=20+i*boxW;
    var frac=c.n/c.full;
    el('rect',{x:x,y:40,width:boxW-8,height:60,rx:6,fill:'none',stroke:'var(--color-border-secondary,#94a3b8)','stroke-width':1.5});
    el('rect',{x:x,y:40+60*(1-frac),width:boxW-8,height:60*frac,rx:6,fill:'#3b82f6','fill-opacity':0.55});
    el('text',{x:x+(boxW-8)/2,y:118,'text-anchor':'middle','font-size':12,'font-weight':700,fill:'var(--color-text-primary,#1e293b)'},c.sub);
    el('text',{x:x+(boxW-8)/2,y:132,'text-anchor':'middle','font-size':10,fill:'var(--color-text-secondary,#64748b)'},c.n+'/'+c.full);
  });
}
document.getElementById('nextBtn').onclick=function(){ if(z<MAXZ){ z++; render(); } };
document.getElementById('prevBtn').onclick=function(){ if(z>1){ z--; render(); } };
render();`,
      outputHeight: 300,
    },

    {
      type: 'markdown',
      instruction: `### Shorthand: noble gas core notation

Full configurations get long fast — iron (Z = 26) is 1s² 2s² 2p⁶ 3s² 3p⁶ 4s² 3d⁶. Chemists almost always abbreviate using the previous **noble gas** as a stand-in for the filled "core," writing only the **valence** (outermost, chemically active) electrons explicitly:

Fe: [Ar] 4s² 3d⁶ — since Ar (Z = 18) has exactly the configuration 1s² 2s² 2p⁶ 3s² 3p⁶.

This isn't just a shortcut — it's a statement about chemistry. Everything below the noble-gas core is buried deep and essentially never participates in bonding. The valence electrons on top are the ones that determine how the atom reacts, which is why elements in the same column of the periodic table (same valence configuration) behave so similarly: fluorine ([He] 2s² 2p⁵) and chlorine ([Ne] 3s² 3p⁵) both have 7 valence electrons and both react almost the same way.`,
    },

    {
      type: 'markdown',
      instruction: `### Check your understanding`,
    },

    {
      type: 'challenge',
      instruction: `Following the Aufbau filling order (1s, 2s, 2p, 3s, 3p, 4s, 3d, ...), which subshell fills immediately AFTER 3p is completely full?`,
      options: [
        { label: 'A', text: '3d' },
        { label: 'B', text: '4s' },
        { label: 'C', text: '4p' },
        { label: 'D', text: '3f' },
      ],
      check: (label) => label === 'B',
      successMessage: 'Correct. Even though 3d "sounds" like it should come right after 3p, 4s is actually slightly lower in energy and fills first — this is the classic exception the diagonal rule captures.',
      failMessage: 'It feels like 3d should come next since it\'s still shell 3, but 4s is actually lower in energy than 3d and fills first. (Also, there is no 3f — f subshells don\'t exist until n = 4.)',
      html: '', css: `body{margin:0;padding:0;font-family:sans-serif}`, startCode: '', outputHeight: 320,
    },

    {
      type: 'challenge',
      instruction: `A subshell has 5 orbitals. What is its maximum electron capacity, and what letter does it use?`,
      options: [
        { label: 'A', text: '2 electrons, s subshell' },
        { label: 'B', text: '6 electrons, p subshell' },
        { label: 'C', text: '10 electrons, d subshell' },
        { label: 'D', text: '14 electrons, f subshell' },
      ],
      check: (label) => label === 'C',
      successMessage: 'Correct. Each orbital holds 2 electrons (Pauli exclusion), so 5 orbitals × 2 = 10 electrons — that\'s the d subshell.',
      failMessage: 'Every orbital holds a maximum of 2 electrons. 5 orbitals × 2 electrons/orbital = 10 electrons, which is the capacity of a d subshell.',
      html: '', css: `body{margin:0;padding:0;font-family:sans-serif}`, startCode: '', outputHeight: 320,
    },

    {
      type: 'challenge',
      instruction: `Chlorine (Z = 17) has full configuration 1s² 2s² 2p⁶ 3s² 3p⁵. What is its noble-gas-core shorthand configuration?`,
      options: [
        { label: 'A', text: '[Ne] 3s² 3p⁵' },
        { label: 'B', text: '[Ar] 3s² 3p⁵' },
        { label: 'C', text: '[He] 3s² 3p⁵' },
        { label: 'D', text: '[Ne] 3p⁷' },
      ],
      check: (label) => label === 'A',
      successMessage: 'Correct. Neon (Z = 10) has configuration 1s² 2s² 2p⁶ — exactly chlorine\'s core. What\'s left, 3s² 3p⁵, is chlorine\'s 7 valence electrons.',
      failMessage: 'You need the noble gas whose full configuration matches everything up through 2p⁶ — that\'s neon (Z = 10, 1s² 2s² 2p⁶), not argon (which is chlorine itself plus one more electron of 3p). The shorthand is [Ne] 3s² 3p⁵.',
      html: '', css: `body{margin:0;padding:0;font-family:sans-serif}`, startCode: '', outputHeight: 340,
    },

  ],
}

export default {
  id: 'chem-1-7-electron-configuration',
  slug: 'electron-configuration',
  chapter: 'chem.1',
  order: 7,
  title: 'Electron Configuration',
  subtitle: 'The address system that tells you exactly where every electron in an atom lives.',
  tags: ['chemistry', 'electron-configuration', 'aufbau', 'quantum-numbers', 'orbitals'],
  hook: {
    question: 'Why does the periodic table have columns of 2, then 6, then a weird jump to include 10 more?',
    realWorldContext: 'The shape of the periodic table is a direct readout of subshell capacities (s=2, p=6, d=10, f=14) — it\'s not arbitrary, it\'s electron configuration made visible.',
    previewVisualizationId: 'ScienceNotebook',
  },
  intuition: {
    prose: [
      'Each shell (n) breaks into subshells (s, p, d, f); each subshell breaks into orbitals; each orbital holds at most 2 electrons.',
      'The Aufbau principle: electrons fill the lowest-energy subshells first, following the order 1s, 2s, 2p, 3s, 3p, 4s, 3d, 4p, ... (note 4s fills before 3d).',
      'The Pauli exclusion principle limits each orbital to 2 electrons (opposite spins); Hund\'s rule says electrons spread across equal-energy orbitals singly before pairing up.',
      'Noble-gas-core shorthand ([Ne] 3s² 3p⁵ for chlorine) isolates the valence electrons — the ones that actually do the chemistry.',
    ],
    callouts: [{ type: 'important', title: 'The 4s/3d exception', body: '4s fills before 3d despite being a "lower" shell number — this single exception explains a lot of transition-metal chemistry (and why some transition metal ions lose 4s electrons first when forming cations).' }],
    visualizations: [{ id: 'ScienceNotebook', title: 'Electron Configuration', props: { lesson: LESSON_CHEM_1_7 } }],
  },
  math: { prose: [], callouts: [], visualizations: [] },
  rigor: { prose: [], callouts: [], visualizations: [] },
  examples: [], challenges: [],
  mentalModel: [
    'Shell → subshell (s,p,d,f) → orbital → electron: each orbital holds max 2 electrons.',
    'Subshell capacities: s=2, p=6, d=10, f=14 — this directly shapes the periodic table\'s column groupings.',
    'Aufbau fills lowest energy first; watch for the 4s-before-3d (and similar) exceptions.',
    'Noble-gas-core shorthand isolates valence electrons — same valence configuration = same column = similar chemistry.',
  ],
  checkpoints: ['read-intuition'],
  quiz: [
    {
      id: 'q1',
      type: 'choice',
      text: '"Each orbital holds at most 2 electrons." A p subshell has 3 orbitals. What is its maximum electron capacity?',
      options: ['3 electrons', '6 electrons', '9 electrons'],
      correct: 1,
    },
    {
      id: 'q2',
      type: 'choice',
      text: '"Aufbau fills lowest energy first... watch for exceptions." In the standard filling order, which subshell fills before 3d?',
      options: ['3p', '4s', '4p'],
      correct: 1,
    },
    {
      id: 'q3',
      type: 'choice',
      text: '"Hund\'s rule: electrons spread across equal-energy orbitals singly before pairing up." If a p subshell (3 orbitals) has 2 electrons total, how are they arranged according to Hund\'s rule?',
      options: [
        'Both electrons paired in the same orbital',
        'One electron each in two different orbitals, with parallel spins',
        'It doesn\'t matter — any arrangement is equally likely',
      ],
      correct: 1,
    },
    {
      id: 'q4',
      type: 'choice',
      text: '"Noble-gas-core shorthand isolates valence electrons." Sodium (Z = 11) has full configuration 1s² 2s² 2p⁶ 3s¹. What is its noble-gas-core shorthand?',
      options: ['[He] 2s² 2p⁶ 3s¹', '[Ne] 3s¹', '[Ar] 3s¹'],
      correct: 1,
    },
  ],
}

export { LESSON_CHEM_1_7 }
