// Chemistry · Chapter 1 · Lesson 8
// Photoelectron Spectroscopy and Periodic Trends

const LESSON_CHEM_1_8 = {
  title: 'Photoelectron Spectroscopy & Periodic Trends',
  subtitle: 'How we actually SEE electron configuration in a real measurement, and why the periodic table has patterns at all.',
  sequential: true,

  cells: [

    {
      type: 'markdown',
      instruction: `### Proving electron configuration is real

Everything in the last lesson — shells, subshells, orbitals, the 4s/3d exception — might sound like a story chemists tell to organize the periodic table. It's not. There's a direct experimental measurement that confirms it: **photoelectron spectroscopy (PES)**.

The idea: blast an atom with a high-energy photon. If the photon carries more energy than an electron's binding energy, the electron gets knocked clean out of the atom. Measure the kinetic energy of the ejected electron, and since you know the photon's energy, you can calculate exactly how tightly that electron was bound:

**Binding energy = photon energy − kinetic energy of ejected electron**

Do this for millions of atoms, and electrons get knocked out from every occupied subshell. The result is a spectrum — a plot of binding energy vs. the *number* of electrons found at that energy. It's a direct photograph of an atom's electron configuration.`,
    },

    // ── Visual 1 — Interactive PES spectrum ──────────────────────────────────
    {
      type: 'js',
      instruction: `**Click an element** to see its actual photoelectron spectrum — each peak is a subshell, its height (relative to the pattern 2:2:6...) tells you how many electrons are in it, and its position tells you how tightly bound those electrons are.`,
      html: `<div class="scene">
  <div class="ctrl-row" id="elBtns"></div>
  <svg id="pesSvg" viewBox="0 0 480 200" style="width:100%;display:block;border-radius:10px;background:var(--color-background-secondary,#f8fafc);border:1px solid var(--color-border-tertiary,#e2e8f0)"></svg>
  <div class="hint">Binding energy increases to the LEFT (convention in real PES spectra) — inner electrons are far more tightly bound.</div>
</div>`,
      css: `body{margin:0;padding:14px;font-family:sans-serif}
.scene{display:flex;flex-direction:column;gap:10px}
.ctrl-row{display:flex;gap:8px;flex-wrap:wrap}
.ebtn{padding:6px 14px;border-radius:8px;border:1px solid var(--color-border-secondary,#cbd5e1);background:var(--color-background-primary,#fff);color:var(--color-text-primary);font-size:13px;font-weight:600;cursor:pointer}
.ebtn.active{background:#3b82f6;color:#fff;border-color:#3b82f6}
.hint{font-size:11.5px;color:var(--color-text-secondary,#64748b);font-style:italic}`,
      startCode: `var NS='http://www.w3.org/2000/svg';
var svg=document.getElementById('pesSvg');
var btnWrap=document.getElementById('elBtns');
// approximate relative binding energies (arbitrary units, decreasing outward) + electron counts per subshell
var DATA={
  'Li (Z=3)': [ {sub:'1s',be:58,n:2}, {sub:'2s',be:5.5,n:1} ],
  'C (Z=6)': [ {sub:'1s',be:296,n:2}, {sub:'2s',be:19.4,n:2}, {sub:'2p',be:10.6,n:2} ],
  'O (Z=8)': [ {sub:'1s',be:557,n:2}, {sub:'2s',be:32,n:2}, {sub:'2p',be:14,n:4} ],
  'Ne (Z=10)': [ {sub:'1s',be:870,n:2}, {sub:'2s',be:48,n:2}, {sub:'2p',be:21.6,n:6} ],
  'Na (Z=11)': [ {sub:'1s',be:1071,n:2}, {sub:'2s',be:63.5,n:2}, {sub:'2p',be:30.5,n:6}, {sub:'3s',be:5.1,n:1} ],
};
Object.keys(DATA).forEach(function(k,i){
  var b=document.createElement('button'); b.className='ebtn'; b.textContent=k;
  b.onclick=function(){ draw(k); highlight(i); };
  btnWrap.appendChild(b);
});
function highlight(i){ Array.prototype.forEach.call(btnWrap.children, function(b,j){ b.classList.toggle('active', i===j); }); }
function el(tag,attrs,txt){
  var e=document.createElementNS(NS,tag);
  for(var k in attrs) e.setAttribute(k,attrs[k]);
  if(txt!=null) e.textContent=txt;
  svg.appendChild(e); return e;
}
function draw(key){
  svg.innerHTML='';
  var peaks=DATA[key];
  var maxBE=Math.max.apply(null,peaks.map(function(p){return p.be;}));
  var maxN=Math.max.apply(null,peaks.map(function(p){return p.n;}));
  // x axis: log-ish scale, high BE on the left
  peaks.forEach(function(p){
    var frac=Math.log(p.be+1)/Math.log(maxBE+1);
    var x=440-frac*400+20; // high BE -> small x (left)
    var h=10+ (p.n/maxN)*110;
    el('line',{x1:x,y1:150,x2:x,y2:150-h,stroke:'#3b82f6','stroke-width':6,'stroke-linecap':'round'});
    el('text',{x:x,y:168,'text-anchor':'middle','font-size':12,'font-weight':700,fill:'var(--color-text-primary,#1e293b)'},p.sub);
    el('text',{x:x,y:150-h-8,'text-anchor':'middle','font-size':11,fill:'var(--color-text-secondary,#64748b)'},p.n+'e⁻');
  });
  el('line',{x1:20,y1:150,x2:460,y2:150,stroke:'var(--color-text-secondary,#94a3b8)','stroke-width':1});
  el('text',{x:30,y:14,'font-size':11,fill:'var(--color-text-secondary,#64748b)'},'← higher binding energy (closer to nucleus)');
  el('text',{x:450,y:14,'text-anchor':'end','font-size':11,fill:'var(--color-text-secondary,#64748b)'},'lower binding energy →');
}
draw(Object.keys(DATA)[0]); highlight(0);`,
      outputHeight: 300,
    },

    {
      type: 'markdown',
      instruction: `### Reading the pattern

Look at oxygen's spectrum above: three peaks, with relative electron counts 2 : 2 : 4. That's exactly the configuration 1s² 2s² 2p⁴ — read straight off a real measurement, with zero appeal to "trust the theory." This is the actual evidence that convinced chemists shells and subshells are physically real, not just a bookkeeping trick.

Notice something else: within the same shell, s electrons are always bound more tightly than p electrons (compare 2s vs. 2p in every spectrum) — this is why the Aufbau order isn't simply "shell by shell." And every element's innermost 1s electrons are bound drastically more tightly than anything else, because they sit closest to the full pull of the nucleus with essentially nothing shielding them.`,
    },

    {
      type: 'markdown',
      instruction: `### Why the periodic table has trends at all

Two competing effects, both consequences of electron configuration, explain almost every periodic trend you'll ever need:

- **Nuclear charge (Z)** increases left-to-right across a period — more protons pull electrons in harder.
- **Shielding** from inner-shell electrons increases top-to-bottom down a group — outer electrons feel a weaker net pull because inner electrons partially block ("shield") the nuclear charge.

The combination is called **effective nuclear charge (Z_eff)** — roughly, the net positive pull an outer electron actually feels after inner-shell shielding is accounted for. Z_eff increases across a period (more protons, same shielding) and stays roughly constant down a group (more protons, but also more shielding — they largely cancel).`,
    },

    // ── Visual 2 — Periodic trends grid ──────────────────────────────────────
    {
      type: 'js',
      instruction: `**Pick a trend** to see how it changes across a small grid of main-group elements. The arrows show the direction each property increases.`,
      html: `<div class="scene">
  <div class="ctrl-row" id="trendBtns"></div>
  <svg id="trendSvg" viewBox="0 0 480 220" style="width:100%;display:block;border-radius:10px;background:var(--color-background-secondary,#f8fafc);border:1px solid var(--color-border-tertiary,#e2e8f0)"></svg>
</div>`,
      css: `body{margin:0;padding:14px;font-family:sans-serif}
.scene{display:flex;flex-direction:column;gap:10px}
.ctrl-row{display:flex;gap:8px;flex-wrap:wrap}
.tbtn{padding:6px 12px;border-radius:8px;border:1px solid var(--color-border-secondary,#cbd5e1);background:var(--color-background-primary,#fff);color:var(--color-text-primary);font-size:12.5px;font-weight:600;cursor:pointer}
.tbtn.active{background:#8b5cf6;color:#fff;border-color:#8b5cf6}`,
      startCode: `var NS='http://www.w3.org/2000/svg';
var svg=document.getElementById('trendSvg');
var btnWrap=document.getElementById('trendBtns');
// grid: rows = periods 2,3 ; cols = groups 1,2,13,14,15,16,17,18 (simplified to 6 cols)
var ELS=[
  ['Li','Be','B','C','N','O'],
  ['Na','Mg','Al','Si','P','S'],
];
// relative values (illustrative, roughly real trend direction), higher = bigger circle/darker
var TRENDS={
  'Atomic radius': { data:[[152,112,85,77,75,73],[186,160,143,118,110,104]], unit:'pm', desc:'Atomic radius DECREASES left-to-right (more nuclear pull, same shell) and INCREASES top-to-bottom (new shells added).' },
  'Ionization energy': { data:[[520,899,801,1086,1402,1314],[496,738,578,786,1012,1000]], unit:'kJ/mol', desc:'Ionization energy (energy to remove an electron) INCREASES left-to-right (higher Z_eff) and DECREASES top-to-bottom (outer electron farther away, more shielded).' },
  'Electronegativity': { data:[[0.98,1.57,2.04,2.55,3.04,3.44],[0.93,1.31,1.61,1.90,2.19,2.58]], unit:'Pauling scale', desc:'Electronegativity (pull on shared electrons in a bond) INCREASES left-to-right and DECREASES top-to-bottom — same underlying cause as ionization energy.' },
};
Object.keys(TRENDS).forEach(function(k,i){
  var b=document.createElement('button'); b.className='tbtn'; b.textContent=k;
  b.onclick=function(){ draw(k); highlight(i); };
  btnWrap.appendChild(b);
});
function highlight(i){ Array.prototype.forEach.call(btnWrap.children, function(b,j){ b.classList.toggle('active', i===j); }); }
function el(tag,attrs,txt){
  var e=document.createElementNS(NS,tag);
  for(var k in attrs) e.setAttribute(k,attrs[k]);
  if(txt!=null) e.textContent=txt;
  svg.appendChild(e); return e;
}
function draw(key){
  svg.innerHTML='';
  var t=TRENDS[key];
  var flat=t.data[0].concat(t.data[1]);
  var mn=Math.min.apply(null,flat), mx=Math.max.apply(null,flat);
  var cellW=70, cellH=70, x0=30, y0=25;
  ELS.forEach(function(row,ri){
    row.forEach(function(sym,ci){
      var val=t.data[ri][ci];
      var frac=(val-mn)/(mx-mn);
      var r=10+frac*22;
      var cx=x0+ci*cellW+cellW/2, cy=y0+ri*cellH+cellH/2;
      el('circle',{cx:cx,cy:cy,r:r,fill:'#8b5cf6','fill-opacity':0.25+frac*0.55,stroke:'#8b5cf6','stroke-width':1.5});
      el('text',{x:cx,y:cy+4,'text-anchor':'middle','font-size':13,'font-weight':700,fill:'var(--color-text-primary,#1e293b)'},sym);
    });
  });
  el('text',{x:x0,y:y0+2*cellH+18,'font-size':11,fill:'var(--color-text-secondary,#64748b)'},'→ increasing period (row)   ↓ increasing group (column) shown left-to-right / top-to-bottom');
  el('text',{x:x0,y:y0+2*cellH+36,'font-size':11,'font-weight':600,fill:'#8b5cf6'},'Bigger, darker circle = higher '+key.toLowerCase()+' ('+t.unit+')');
}
var first=Object.keys(TRENDS)[0];
draw(first); highlight(0);
var descBox=document.createElement('div');
descBox.style.fontSize='12.5px'; descBox.style.color='var(--color-text-secondary,#64748b)'; descBox.style.marginTop='4px'; descBox.style.lineHeight='1.5';
document.querySelector('.scene').appendChild(descBox);
function updateDesc(key){ descBox.textContent=TRENDS[key].desc; }
updateDesc(first);
Object.keys(TRENDS).forEach(function(k,i){ btnWrap.children[i].addEventListener('click', function(){ updateDesc(k); }); });`,
      outputHeight: 340,
    },

    {
      type: 'markdown',
      instruction: `### Check your understanding`,
    },

    {
      type: 'challenge',
      instruction: `A PES spectrum for an unknown element shows exactly two peaks with relative electron counts 2 : 3. What is the element's electron configuration and which element is it?`,
      options: [
        { label: 'A', text: '1s² 2s³ — no such element exists with this configuration' },
        { label: 'B', text: '1s² 2p³ — nitrogen' },
        { label: 'C', text: '1s² 2s³ 2p⁰... this is impossible since s subshells hold only 2 electrons max' },
        { label: 'D', text: '1s² 2s³ — boron' },
      ],
      check: (label) => label === 'B',
      successMessage: 'Correct. A 2:3 ratio of electron counts across two peaks means 1s² and then a subshell holding 3 electrons — since s holds max 2, that second subshell must be 2p³. Total electrons = 5 = nitrogen.',
      failMessage: 'An s subshell can hold at most 2 electrons, so a peak with 3 electrons can\'t be an s subshell — it must be a p subshell (max 6). The configuration is 1s² 2p³, which is 5 total electrons: nitrogen.',
      html: '', css: `body{margin:0;padding:0;font-family:sans-serif}`, startCode: '', outputHeight: 340,
    },

    {
      type: 'challenge',
      instruction: `Why does ionization energy generally INCREASE as you move left to right across a period, even though you're not adding any new electron shells?`,
      options: [
        { label: 'A', text: 'Because atoms get physically larger across a period, making electrons easier to remove' },
        { label: 'B', text: 'Because nuclear charge (protons) increases while shielding from inner electrons stays about the same, so effective nuclear charge increases and outer electrons are held more tightly' },
        { label: 'C', text: 'Because electrons are being added to a new, higher shell each time' },
        { label: 'D', text: 'Ionization energy actually decreases across a period, not increases' },
      ],
      check: (label) => label === 'B',
      successMessage: 'Correct. Across a period, electrons are added to the SAME outer shell while protons keep increasing — shielding barely changes, so effective nuclear charge (Z_eff) rises, pulling outer electrons in tighter and making them harder to remove.',
      failMessage: 'Across a period, atoms actually get SMALLER (not larger) and no new shell is added — electrons are added to the same outer shell while the number of protons increases. Since shielding stays about the same, effective nuclear charge rises, making outer electrons harder to remove (higher ionization energy).',
      html: '', css: `body{margin:0;padding:0;font-family:sans-serif}`, startCode: '', outputHeight: 360,
    },

    {
      type: 'challenge',
      instruction: `Which pair of elements would you expect to have the MOST similar chemical behavior, based on effective nuclear charge and valence configuration?`,
      options: [
        { label: 'A', text: 'Li and Na (same group, different periods)' },
        { label: 'B', text: 'Li and Be (same period, adjacent groups)' },
        { label: 'C', text: 'Li and F (same period, opposite ends)' },
        { label: 'D', text: 'Na and Cl (same period, opposite ends)' },
      ],
      check: (label) => label === 'A',
      successMessage: 'Correct. Li and Na are in the same group (column) — they share the same valence electron count and configuration pattern ([noble gas] ns¹), which is why elements in the same column react so similarly, even though Z_eff isn\'t identical.',
      failMessage: 'Chemical similarity tracks valence configuration, which is shared down a GROUP (column), not across a period (row). Li and Na are both [noble gas] ns¹ — same group — so they behave most similarly of the choices given.',
      html: '', css: `body{margin:0;padding:0;font-family:sans-serif}`, startCode: '', outputHeight: 340,
    },

  ],
}

export default {
  id: 'chem-1-8-pes-and-periodic-trends',
  slug: 'pes-and-periodic-trends',
  chapter: 'chem.1',
  order: 8,
  title: 'Photoelectron Spectroscopy & Periodic Trends',
  subtitle: 'How we actually SEE electron configuration in a real measurement, and why the periodic table has patterns at all.',
  tags: ['chemistry', 'photoelectron-spectroscopy', 'periodic-trends', 'ionization-energy', 'effective-nuclear-charge'],
  hook: {
    question: 'How do we actually know electron shells and subshells are real, and not just a convenient story?',
    realWorldContext: 'Photoelectron spectroscopy directly measures the binding energy of every electron in an atom — the resulting spectrum is a literal photograph of electron configuration.',
    previewVisualizationId: 'ScienceNotebook',
  },
  intuition: {
    prose: [
      'PES knocks electrons out of an atom with high-energy photons and measures their kinetic energy; binding energy = photon energy − kinetic energy.',
      'Each peak in a PES spectrum is one subshell; its position shows binding energy (position along the axis) and its height shows electron count — directly confirming electron configuration.',
      'Effective nuclear charge (Z_eff) = nuclear pull felt by outer electrons after inner-shell shielding — it increases across a period and stays roughly constant down a group.',
      'Atomic radius, ionization energy, and electronegativity all trace back to Z_eff: radius shrinks and ionization energy/electronegativity rise left-to-right across a period.',
    ],
    callouts: [{ type: 'important', title: 'PES is the proof, not just a picture', body: 'Electron configuration isn\'t a theoretical convenience — PES spectra are a direct experimental measurement that confirms exactly how many electrons sit in each subshell.' }],
    visualizations: [{ id: 'ScienceNotebook', title: 'PES & Periodic Trends', props: { lesson: LESSON_CHEM_1_8 } }],
  },
  math: { prose: [], callouts: [], visualizations: [] },
  rigor: { prose: [], callouts: [], visualizations: [] },
  examples: [], challenges: [],
  mentalModel: [
    'PES peak position = binding energy (how tightly held); peak height = number of electrons in that subshell.',
    'Effective nuclear charge (Z_eff) = actual pull felt by outer electrons after inner-shell shielding.',
    'Z_eff rises across a period (more protons, same shielding) → smaller radius, higher ionization energy, higher electronegativity.',
    'Z_eff stays roughly flat down a group (more protons, but also more shielding) → same valence config → similar chemistry within a column.',
  ],
  checkpoints: ['read-intuition'],
  quiz: [
    {
      id: 'q1',
      type: 'choice',
      text: '"Binding energy = photon energy − kinetic energy of ejected electron." In a PES experiment, what does the height of a peak in the resulting spectrum represent?',
      options: [
        'The binding energy of that subshell',
        'The number of electrons in that subshell',
        'The atomic number of the element',
      ],
      correct: 1,
    },
    {
      id: 'q2',
      type: 'choice',
      text: '"Effective nuclear charge increases across a period." Why does ionization energy generally increase from left to right across a period?',
      options: [
        'A new electron shell is added at every element',
        'Effective nuclear charge increases (more protons, same shielding), pulling outer electrons in more tightly',
        'Atoms get physically larger, so electrons are easier to remove',
      ],
      correct: 1,
    },
    {
      id: 'q3',
      type: 'choice',
      text: '"Z_eff stays roughly flat down a group." Why don\'t elements in the same column have wildly different ionization energies despite having very different atomic numbers?',
      options: [
        'They actually do have wildly different ionization energies',
        'Extra protons going down a group are largely offset by extra shielding from added inner shells, keeping Z_eff — and therefore ionization energy — relatively similar',
        'Ionization energy has nothing to do with nuclear charge',
      ],
      correct: 1,
    },
    {
      id: 'q4',
      type: 'choice',
      text: '"Atomic radius shrinks... left-to-right across a period." Which of these correctly ranks atomic radius from LARGEST to SMALLEST: Na, Mg, Al (all period 3)?',
      options: [
        'Al > Mg > Na',
        'Na > Mg > Al',
        'They are all equal since they\'re in the same period',
      ],
      correct: 1,
    },
  ],
}

export { LESSON_CHEM_1_8 }
