// Chemistry · Chapter 1 · Lesson 2
// Inside the Atom — extended version
//
// One long lesson. Builds the atom layer by layer, earns every concept
// before introducing the next, ends with the valence electron insight
// that makes the periodic table feel inevitable rather than memorised.

const LESSON_CHEM_1_2 = {
  title: 'Inside the Atom',
  subtitle: 'Three particles. One tiny nucleus. A vast cloud of electrons. Everything else follows.',
  sequential: true,

  cells: [

    // ── 0. Opening ────────────────────────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `### Three questions, three particles

Every atom contains three types of particle. Before we name them, here are the three questions they answer — because understanding why a particle exists is more useful than memorising what it is called.

**Question 1:** What makes a carbon atom different from an oxygen atom? They weigh different amounts and behave completely differently, but they are both atoms. What is the distinguishing feature?

**Question 2:** Why do some atoms of the same element have slightly different masses? Carbon is always carbon — it always behaves like carbon — but some carbon atoms weigh 12 units and others weigh 14. How can that be?

**Question 3:** Why do atoms interact with other atoms at all? If an atom is a complete, self-contained thing, what drives it to bond with its neighbours?

The answers, in order: **protons**, **neutrons**, **electrons**.

Each one is not a piece of trivia — it is the answer to a specific question. We will build the atom from scratch, one particle type at a time, so that by the end each particle has earned its place in the model.`,
    },

    // ── 1. The nucleus — protons ──────────────────────────────────────────────
    {
      type: 'js',
      instruction: `### Part 1: Protons — the identity card of matter

A proton is a positively charged particle. Every atom has a nucleus, and every nucleus contains protons.

The number of protons is called the **atomic number**. It is the most important number in all of chemistry, because it is what makes an atom the atom it is. Hydrogen has 1 proton. Carbon has 6. Oxygen has 8. Gold has 79.

Change the number of protons and you do not have a modified atom — you have a completely different element. This is not a convention. It is a physical fact baked into the structure of matter.

The slider below moves through the first 36 elements. As you drag it, watch:
- The nucleus rebuild with each new count of protons
- The element identity snap to something completely different at each integer
- The atomic mass track the proton count roughly (it is always a bit more — we will see why shortly)

Notice also the **category colours**. Elements in the same colour group share chemical properties. By the end of this lesson you will understand exactly why.`,
      html: `<div class="scene">
  <div class="top-row">
    <div class="slider-col">
      <div class="slider-label">Atomic number (protons): <span id="pnum" class="pnum">1</span></div>
      <input type="range" id="pslider" min="1" max="36" value="1" style="width:100%">
      <div class="category-badge" id="cat-badge"></div>
    </div>
    <div class="el-badge" id="el-badge">
      <div class="el-n" id="el-n">1</div>
      <div class="el-sym" id="el-sym">H</div>
      <div class="el-name" id="el-name">Hydrogen</div>
      <div class="el-mass" id="el-mass">1.008 u</div>
    </div>
  </div>
  <div class="canvas-row">
    <canvas id="nucleus-cv" width="280" height="280"></canvas>
    <div class="facts-col">
      <div class="fact-label">About this element</div>
      <div class="fact-text" id="fact-text"></div>
      <div class="fact-label" style="margin-top:12px">Electron configuration</div>
      <div class="shells-display" id="shells-disp"></div>
      <div class="fact-label" style="margin-top:12px">Valence electrons</div>
      <div class="valence-bar" id="val-bar"></div>
    </div>
  </div>
</div>`,
      css: `body{margin:0;padding:16px;font-family:sans-serif}
.scene{display:flex;flex-direction:column;gap:14px}
.top-row{display:grid;grid-template-columns:1fr auto;gap:16px;align-items:center}
.slider-col{display:flex;flex-direction:column;gap:6px}
.slider-label{font-size:13px;color:var(--color-text-primary,#1e293b);font-weight:500}
.pnum{font-size:20px;font-weight:700;color:var(--color-text-info,#2563eb);font-family:monospace}
.category-badge{display:inline-block;font-size:11px;font-weight:600;padding:4px 12px;border-radius:20px;letter-spacing:.04em;margin-top:2px}
.el-badge{border-radius:12px;padding:14px 18px;border:1px solid var(--color-border-secondary,#e2e8f0);text-align:center;min-width:110px;transition:all .2s}
.el-n{font-size:11px;color:var(--color-text-secondary,#64748b)}
.el-sym{font-size:46px;font-weight:600;font-family:monospace;line-height:1.1;color:var(--color-text-primary,#1e293b)}
.el-name{font-size:13px;color:var(--color-text-secondary,#64748b)}
.el-mass{font-size:11px;color:var(--color-text-secondary,#64748b);font-family:monospace;margin-top:2px}
.canvas-row{display:grid;grid-template-columns:280px 1fr;gap:16px;align-items:start}
canvas{border-radius:12px;display:block;background:radial-gradient(ellipse at 40% 35%,#0d1f3e 0%,#050b18 100%)}
.facts-col{display:flex;flex-direction:column;gap:4px}
.fact-label{font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:var(--color-text-secondary,#64748b)}
.fact-text{font-size:13px;color:var(--color-text-primary,#1e293b);line-height:1.65}
.shells-display{font-size:13px;font-family:monospace;color:var(--color-text-info,#2563eb);letter-spacing:.05em}
.valence-bar{display:flex;gap:5px;flex-wrap:wrap;margin-top:3px}
.ve-dot{width:18px;height:18px;border-radius:50%;background:#38bdf8;border:1.5px solid #0ea5e9}
.ve-empty{width:18px;height:18px;border-radius:50%;border:1.5px dashed #94a3b8}`,
      startCode: `var ELEMENTS = [
  {n:1, sym:'H', name:'Hydrogen', mass:'1.008', shells:[1], cat:'nonmetal', catColor:'#a78bfa', catBg:'rgba(167,139,250,0.15)', fact:'Most abundant element in the universe — 75% of all visible matter. Powers the Sun through nuclear fusion.'},
  {n:2, sym:'He',name:'Helium',   mass:'4.003', shells:[2], cat:'noble gas', catColor:'#38bdf8', catBg:'rgba(56,189,248,0.15)', fact:'Second most abundant element. Cannot be solidified at normal pressure. Discovered in the Sun before it was found on Earth.'},
  {n:3, sym:'Li',name:'Lithium',  mass:'6.941', shells:[2,1], cat:'alkali metal', catColor:'#f87171', catBg:'rgba(248,113,113,0.15)', fact:'Lightest metal. Used in every lithium-ion battery. Floats on water and reacts violently with it.'},
  {n:4, sym:'Be',name:'Beryllium',mass:'9.012', shells:[2,2], cat:'alkaline earth', catColor:'#fb923c', catBg:'rgba(251,146,60,0.15)', fact:'Transparent to X-rays. So stiff and light it is used in aerospace alloys and X-ray windows.'},
  {n:5, sym:'B', name:'Boron',    mass:'10.811',shells:[2,3], cat:'metalloid', catColor:'#a3e635', catBg:'rgba(163,230,53,0.15)', fact:'Hard as diamond in some crystalline forms. The backbone of borax (laundry detergent).'},
  {n:6, sym:'C', name:'Carbon',   mass:'12.011',shells:[2,4], cat:'nonmetal', catColor:'#a78bfa', catBg:'rgba(167,139,250,0.15)', fact:'Forms more compounds than any other element. The backbone of all known life. Diamond and graphite are both pure carbon.'},
  {n:7, sym:'N', name:'Nitrogen', mass:'14.007',shells:[2,5], cat:'nonmetal', catColor:'#a78bfa', catBg:'rgba(167,139,250,0.15)', fact:'78% of Earth\'s atmosphere. The N≡N triple bond is one of the strongest in chemistry — which is why N₂ is so unreactive.'},
  {n:8, sym:'O', name:'Oxygen',   mass:'15.999',shells:[2,6], cat:'nonmetal', catColor:'#a78bfa', catBg:'rgba(167,139,250,0.15)', fact:'Third most abundant element in the universe. Liquid oxygen is pale blue. Every breath you take is roughly 21% oxygen.'},
  {n:9, sym:'F', name:'Fluorine', mass:'18.998',shells:[2,7], cat:'halogen', catColor:'#4ade80', catBg:'rgba(74,222,128,0.15)', fact:'Most electronegative element of all. Reacts with nearly everything — including some noble gases. The F in PTFE (Teflon).'},
  {n:10,sym:'Ne',name:'Neon',     mass:'20.180',shells:[2,8], cat:'noble gas', catColor:'#38bdf8', catBg:'rgba(56,189,248,0.15)', fact:'Completely inert — full outer shell. The most intense red-orange glow of any element in a discharge tube.'},
  {n:11,sym:'Na',name:'Sodium',   mass:'22.990',shells:[2,8,1], cat:'alkali metal', catColor:'#f87171', catBg:'rgba(248,113,113,0.15)', fact:'Stored under oil because it ignites in air. Essential electrolyte in human nerve signalling. Half of table salt.'},
  {n:12,sym:'Mg',name:'Magnesium',mass:'24.305',shells:[2,8,2], cat:'alkaline earth', catColor:'#fb923c', catBg:'rgba(251,146,60,0.15)', fact:'Burns with a blinding white flame that water and CO₂ cannot extinguish. Central atom in chlorophyll.'},
  {n:13,sym:'Al',name:'Aluminium',mass:'26.982',shells:[2,8,3], cat:'post-transition', catColor:'#6ee7b7', catBg:'rgba(110,231,183,0.15)', fact:'Once more valuable than gold. The Washington Monument\'s cap is aluminium. Most abundant metal in Earth\'s crust.'},
  {n:14,sym:'Si',name:'Silicon',  mass:'28.086',shells:[2,8,4], cat:'metalloid', catColor:'#a3e635', catBg:'rgba(163,230,53,0.15)', fact:'Second most abundant element in Earth\'s crust. The entire electronics industry runs on silicon semiconductors.'},
  {n:15,sym:'P', name:'Phosphorus',mass:'30.974',shells:[2,8,5], cat:'nonmetal', catColor:'#a78bfa', catBg:'rgba(167,139,250,0.15)', fact:'Name means "light-bearer" — white phosphorus glows in the dark. Essential in DNA and ATP (the cell\'s energy currency).'},
  {n:16,sym:'S', name:'Sulfur',   mass:'32.065',shells:[2,8,6], cat:'nonmetal', catColor:'#a78bfa', catBg:'rgba(167,139,250,0.15)', fact:'The smell of struck matches. Burns with a blue flame. Critical in vulcanising rubber and producing sulfuric acid.'},
  {n:17,sym:'Cl',name:'Chlorine', mass:'35.453',shells:[2,8,7], cat:'halogen', catColor:'#4ade80', catBg:'rgba(74,222,128,0.15)', fact:'Used as a chemical weapon in WWI. Now used to make drinking water safe. The Cl in table salt.'},
  {n:18,sym:'Ar',name:'Argon',    mass:'39.948',shells:[2,8,8], cat:'noble gas', catColor:'#38bdf8', catBg:'rgba(56,189,248,0.15)', fact:'1% of every breath you take is argon, completely inert. Used as a shielding gas in welding and in incandescent bulbs.'},
  {n:19,sym:'K', name:'Potassium',mass:'39.098',shells:[2,8,8,1], cat:'alkali metal', catColor:'#f87171', catBg:'rgba(248,113,113,0.15)', fact:'Symbol K from Latin "kalium". Essential electrolyte for heart function — potassium deficiency causes arrhythmia.'},
  {n:20,sym:'Ca',name:'Calcium',  mass:'40.078',shells:[2,8,8,2], cat:'alkaline earth', catColor:'#fb923c', catBg:'rgba(251,146,60,0.15)', fact:'Most abundant metal in the human body — about 1 kg in an average adult, mostly in bones and teeth.'},
  {n:26,sym:'Fe',name:'Iron',     mass:'55.845',shells:[2,8,14,2], cat:'transition metal', catColor:'#93c5fd', catBg:'rgba(147,197,253,0.15)', fact:'Earth\'s core is mostly iron. Hemoglobin in your blood carries oxygen using iron. The most-used metal in history.'},
  {n:29,sym:'Cu',name:'Copper',   mass:'63.546',shells:[2,8,18,1], cat:'transition metal', catColor:'#93c5fd', catBg:'rgba(147,197,253,0.15)', fact:'Best non-precious electrical conductor. The Statue of Liberty is copper — it started shiny brown. Used since 8000 BCE.'},
  {n:30,sym:'Zn',name:'Zinc',     mass:'65.38', shells:[2,8,18,2], cat:'transition metal', catColor:'#93c5fd', catBg:'rgba(147,197,253,0.15)', fact:'Essential dietary mineral — about 10mg needed daily. Used in galvanising steel to prevent rust.'},
  {n:35,sym:'Br',name:'Bromine',  mass:'79.904',shells:[2,8,18,7], cat:'halogen', catColor:'#4ade80', catBg:'rgba(74,222,128,0.15)', fact:'One of only two elements liquid at room temperature. Red-brown fuming liquid. Used in flame retardants.'},
  {n:36,sym:'Kr',name:'Krypton',  mass:'83.798',shells:[2,8,18,8], cat:'noble gas', catColor:'#38bdf8', catBg:'rgba(56,189,248,0.15)', fact:'Named after Greek "hidden". The metre was once defined by a krypton-86 emission line. Used in flash photography.'},
];

var indexed = {};
ELEMENTS.forEach(function(el){ indexed[el.n] = el; });
// Fill gaps with placeholders for 21-25, 27-28, 31-34
for(var i=1;i<=36;i++){
  if(!indexed[i]){
    var prev=indexed[i-1]||{shells:[2,8],cat:'transition metal',catColor:'#93c5fd',catBg:'rgba(147,197,253,0.15)'};
    indexed[i]={n:i,sym:'?',name:'Element '+i,mass:'—',shells:prev.shells,cat:prev.cat,catColor:prev.catColor,catBg:prev.catBg,fact:'A transition metal.'};
  }
}

var cv=document.getElementById('nucleus-cv'),ctx=cv.getContext('2d');
var slider=document.getElementById('pslider');

function drawNucleus(n, color) {
  ctx.clearRect(0,0,280,280);
  var cx=140,cy=140;
  var count=Math.min(n,80);
  var r=Math.max(16, 6+Math.cbrt(count)*10);

  // Glow halo
  var grd=ctx.createRadialGradient(cx,cy,r*0.5,cx,cy,r+28);
  grd.addColorStop(0,color+'55'); grd.addColorStop(1,'transparent');
  ctx.fillStyle=grd; ctx.beginPath(); ctx.arc(cx,cy,r+28,0,Math.PI*2); ctx.fill();

  // Protons packed
  for(var i=0;i<count;i++){
    var phi=Math.acos(1-2*(i+0.5)/count);
    var theta=Math.PI*(1+Math.sqrt(5))*i;
    var pr=r*0.78*Math.cbrt(i/count+0.12);
    var px=cx+pr*Math.sin(phi)*Math.cos(theta);
    var py=cy+pr*Math.sin(phi)*Math.sin(theta);
    ctx.beginPath(); ctx.arc(px,py,Math.max(4,7-count*0.05),0,Math.PI*2);
    ctx.fillStyle=color; ctx.fill();
    if(count<=20){
      ctx.fillStyle='rgba(0,0,0,0.45)';
      ctx.font='500 '+(count<=12?7:6)+'px monospace';
      ctx.textAlign='center'; ctx.textBaseline='middle';
      ctx.fillText('p+',px,py);
    }
  }
  // Count label
  ctx.fillStyle='rgba(255,255,255,0.45)';
  ctx.font='11px sans-serif'; ctx.textAlign='center';
  ctx.fillText(n+' proton'+(n!==1?'s':''), cx, 268);
}

function update(){
  var n=+slider.value, el=indexed[n];
  document.getElementById('pnum').textContent=n;
  document.getElementById('el-n').textContent='Z = '+n;
  document.getElementById('el-sym').textContent=el.sym;
  document.getElementById('el-name').textContent=el.name;
  document.getElementById('el-mass').textContent=el.mass+' u';
  document.getElementById('fact-text').textContent=el.fact;

  var badge=document.getElementById('cat-badge');
  badge.textContent=el.cat.charAt(0).toUpperCase()+el.cat.slice(1);
  badge.style.background=el.catBg; badge.style.color=el.catColor;
  badge.style.border='1px solid '+el.catColor+'55';

  var elBadge=document.getElementById('el-badge');
  elBadge.style.borderColor=el.catColor+'88';
  elBadge.style.background=el.catBg;

  // Shells display
  document.getElementById('shells-disp').textContent='['+el.shells.join(', ')+']';

  // Valence bar
  var valEl=document.getElementById('val-bar');
  var outerShell=el.shells[el.shells.length-1];
  var maxInShell=[2,8,18,32][el.shells.length-1]||8;
  var maxShow=Math.min(maxInShell,8);
  var html='';
  for(var e=0;e<outerShell;e++) html+='<div class="ve-dot" title="electron"></div>';
  for(var s=outerShell;s<maxShow;s++) html+='<div class="ve-empty" title="empty slot"></div>';
  valEl.innerHTML=html;

  drawNucleus(n, el.catColor);
}
slider.oninput=update;
update();`,
      outputHeight: 520,
    },

    // ── 2. The pattern in protons ─────────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `### What you just saw

Drag through the first 18 elements slowly and watch the **valence electron bar** at the bottom right. Something remarkable happens:

- Elements 1–2: outer shell fills from 1 → 2 (full). Helium is inert.
- Elements 3–10: a new shell. Fills from 1 → 8 (full). Neon is inert.
- Elements 11–18: another new shell. Fills from 1 → 8 (full). Argon is inert.

Every time the outer shell fills completely, you get a noble gas — an element that does not react with anything. Every time a new shell starts with just 1 electron, you get an alkali metal — one of the most reactive elements in existence.

This is not a coincidence. It is the pattern behind the entire periodic table.

Every row in the table (a **period**) tracks the filling of a new shell. Every column (a **group**) contains elements with the same number of valence electrons. Lithium, sodium, and potassium all have 1 valence electron. They all behave similarly: they are all silvery metals that react violently with water. Fluorine, chlorine, and bromine all have 7 valence electrons. They all behave similarly: they are corrosive, reactive gases or liquids.

We have not yet explained *why* valence electrons control reactivity. That comes in the next part. But first we need the second particle: the neutron.`,
    },

    // ── 3. Neutrons and isotopes ──────────────────────────────────────────────
    {
      type: 'js',
      instruction: `### Part 2: Neutrons — isotopes and why some atoms are radioactive

Every nucleus also contains **neutrons** — uncharged particles with nearly the same mass as a proton.

Here is the problem neutrons solve: we said carbon always has 6 protons, so it is always carbon. But not all carbon atoms have the same mass. Some weigh exactly 12 atomic mass units. Others weigh 13. Others weigh 14. How can atoms of the same element have different masses?

The answer: different numbers of neutrons. **Isotopes** are atoms of the same element (same proton count) with different neutron counts. Chemically identical. Different masses.

The notation is simple: **Carbon-12** means mass number 12 = 6 protons + 6 neutrons. **Carbon-14** means 6 protons + 8 neutrons.

Not all isotopes are stable. When a nucleus has too many or too few neutrons relative to its protons, the strong nuclear force cannot hold it together indefinitely. These nuclei are **radioactive** — they spontaneously decay, emitting particles or energy, until they reach a stable configuration.

Carbon-14 is radioactive with a half-life of 5,730 years. Every living thing absorbs carbon-14 from the atmosphere while alive. When it dies, the carbon-14 begins decaying at this known rate. Measuring how much carbon-14 remains tells us precisely when the organism died. This is **radiocarbon dating** — a direct consequence of understanding isotopes.

Explore carbon's isotopes below. Toggle between them and watch stability change.`,
      html: `<div class="scene">
  <div class="iso-row" id="iso-buttons"></div>
  <div class="iso-main">
    <canvas id="iso-cv" width="300" height="300"></canvas>
    <div class="iso-detail" id="iso-detail"></div>
  </div>
  <div class="iso-insight">
    <div class="insight-label">Key insight</div>
    <div class="insight-text">Same number of protons (same element, same chemistry). Different number of neutrons (different mass, different stability). Neutrons affect mass but <em>not</em> chemical behaviour.</div>
  </div>
</div>`,
      css: `body{margin:0;padding:16px;font-family:sans-serif}
.scene{display:flex;flex-direction:column;gap:14px}
.iso-row{display:flex;gap:8px;flex-wrap:wrap}
.iso-btn{padding:8px 16px;border-radius:8px;border:1.5px solid var(--color-border-secondary,#e2e8f0);background:var(--color-background-secondary,#f8fafc);cursor:pointer;font-size:13px;font-family:monospace;font-weight:600;color:var(--color-text-primary,#1e293b);transition:all .15s}
.iso-btn.active{border-color:#38bdf8;background:rgba(56,189,248,0.12);color:#0ea5e9}
.iso-btn.radioactive.active{border-color:#f87171;background:rgba(248,113,113,0.12);color:#ef4444}
.iso-main{display:grid;grid-template-columns:300px 1fr;gap:16px;align-items:center}
canvas{border-radius:12px;display:block;background:radial-gradient(ellipse at 40% 35%,#0d1f3e 0%,#050b18 100%)}
.iso-detail{display:flex;flex-direction:column;gap:10px}
.iso-name-big{font-size:22px;font-weight:600;font-family:monospace;color:var(--color-text-primary,#1e293b)}
.iso-formula{font-size:14px;color:var(--color-text-secondary,#64748b);font-family:monospace}
.stability-badge{display:inline-flex;align-items:center;gap:6px;padding:6px 12px;border-radius:8px;font-size:13px;font-weight:600;width:fit-content}
.stable-badge{background:#d1fae5;color:#065f46;border:1px solid #10b981}
.radioactive-badge{background:#fee2e2;color:#991b1b;border:1px solid #ef4444}
.iso-halflife{font-size:13px;color:var(--color-text-secondary,#64748b);font-family:monospace}
.iso-note{font-size:13px;color:var(--color-text-primary,#1e293b);line-height:1.65}
.iso-abundance{font-size:12px;color:var(--color-text-secondary,#64748b);font-family:monospace}
.iso-insight{background:var(--color-background-secondary,#f8fafc);border:1px solid var(--color-border-tertiary,#e2e8f0);border-radius:10px;padding:14px 16px}
.insight-label{font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:var(--color-text-secondary,#64748b);margin-bottom:6px}
.insight-text{font-size:13px;color:var(--color-text-primary,#1e293b);line-height:1.65}
.insight-text em{font-style:italic;color:var(--color-text-info,#2563eb)}`,
      startCode: `var isotopes = [
  {name:'Carbon-10',neutrons:4,stable:false,halflife:'19 seconds',abundance:'Artificial',note:'Far too few neutrons for 6 protons. The strong nuclear force cannot hold the nucleus together. Decays almost instantly.'},
  {name:'Carbon-11',neutrons:5,stable:false,halflife:'20 minutes',abundance:'Artificial',note:'Used in PET scan imaging in medicine. Decays quickly enough to limit radiation exposure after a scan.'},
  {name:'Carbon-12',neutrons:6,stable:true,halflife:'Stable forever',abundance:'98.89% of all carbon',note:'The reference standard. The atomic mass unit is defined as exactly 1/12 the mass of a C-12 atom. Almost all carbon on Earth is this isotope.'},
  {name:'Carbon-13',neutrons:7,stable:true,halflife:'Stable forever',abundance:'1.11% of all carbon',note:'Used in NMR spectroscopy (the technique behind MRI). Scientists use it to trace metabolic pathways in biological research.'},
  {name:'Carbon-14',neutrons:8,stable:false,halflife:'5,730 years',abundance:'Trace (1 in 10¹²)',note:'The basis of radiocarbon dating. Produced in the upper atmosphere by cosmic rays. Living things absorb it continuously; after death, it decays at this known rate.'},
  {name:'Carbon-15',neutrons:9,stable:false,halflife:'2.4 seconds',abundance:'Artificial',note:'Too many neutrons. Decays by emitting an electron (beta decay), converting a neutron to a proton. Product: Nitrogen-15.'},
];

var cv=document.getElementById('iso-cv'),ctx=cv.getContext('2d');
var btns=document.getElementById('iso-buttons');
var selected=2;

function drawIsotope(idx){
  var iso=isotopes[idx];
  var protons=6, neutrons=iso.neutrons, total=protons+neutrons;
  ctx.clearRect(0,0,300,300);
  var cx=150,cy=150,r=Math.max(20,8+Math.cbrt(total)*9);

  // Glow
  var gc=iso.stable?'#4ade80':'#f87171';
  var grd=ctx.createRadialGradient(cx,cy,r*.5,cx,cy,r+24);
  grd.addColorStop(0,gc+'44'); grd.addColorStop(1,'transparent');
  ctx.fillStyle=grd; ctx.beginPath(); ctx.arc(cx,cy,r+24,0,Math.PI*2); ctx.fill();

  for(var i=0;i<total;i++){
    var isProton=i<protons;
    var phi=Math.acos(1-2*(i+0.5)/total);
    var theta=Math.PI*(1+Math.sqrt(5))*i;
    var pr=r*0.78*Math.cbrt(i/total+0.1);
    var px=cx+pr*Math.sin(phi)*Math.cos(theta);
    var py=cy+pr*Math.sin(phi)*Math.sin(theta);
    ctx.beginPath(); ctx.arc(px,py,8,0,Math.PI*2);
    ctx.fillStyle=isProton?'#f97316':'#60a5fa'; ctx.fill();
    ctx.fillStyle='rgba(0,0,0,0.4)';
    ctx.font='500 7px monospace'; ctx.textAlign='center'; ctx.textBaseline='middle';
    ctx.fillText(isProton?'p+':'n°',px,py);
  }

  // Stability ring
  ctx.beginPath(); ctx.arc(cx,cy,r+10,0,Math.PI*2);
  ctx.strokeStyle=iso.stable?'rgba(74,222,128,0.5)':'rgba(248,113,113,0.5)';
  ctx.lineWidth=2; ctx.setLineDash(iso.stable?[]:[5,3]); ctx.stroke(); ctx.setLineDash([]);

  // Labels
  ctx.fillStyle='rgba(255,255,255,0.5)'; ctx.font='500 12px sans-serif'; ctx.textAlign='left';
  ctx.fillText(protons+' p+', 14, 28);
  ctx.fillStyle='rgba(96,165,250,0.7)';
  ctx.fillText(iso.neutrons+' n°', 14, 44);

  // Legend
  ctx.font='11px sans-serif'; ctx.textAlign='right';
  ctx.fillStyle='#f97316'; ctx.fillText('● proton',286,280);
  ctx.fillStyle='#60a5fa'; ctx.fillText('● neutron',286,294);
}

function renderDetail(idx){
  var iso=isotopes[idx];
  document.getElementById('iso-detail').innerHTML=
    '<div class="iso-name-big">'+iso.name+'</div>'+
    '<div class="iso-formula">6 protons + '+iso.neutrons+' neutrons = mass '+( 6+iso.neutrons )+'</div>'+
    '<div class="stability-badge '+(iso.stable?'stable-badge':'radioactive-badge')+'">'+(iso.stable?'✓ Stable':'⚡ Radioactive')+'</div>'+
    '<div class="iso-halflife">Half-life: '+iso.halflife+'</div>'+
    '<div class="iso-abundance">Natural abundance: '+iso.abundance+'</div>'+
    '<div class="iso-note">'+iso.note+'</div>';
}

isotopes.forEach(function(iso,i){
  var btn=document.createElement('button');
  btn.className='iso-btn'+(i===selected?' active':'')+(iso.stable?'':' radioactive');
  btn.textContent=iso.name;
  btn.onclick=function(){
    selected=i;
    document.querySelectorAll('.iso-btn').forEach(function(b,j){
      b.classList.toggle('active',j===i);
    });
    drawIsotope(i); renderDetail(i);
  };
  btns.appendChild(btn);
});

drawIsotope(selected); renderDetail(selected);`,
      outputHeight: 580,
    },

    // ── 4. Electron shells — the deep dive ────────────────────────────────────
    {
      type: 'markdown',
      instruction: `### Part 3: Electrons — where all chemistry happens

Electrons are where the story gets interesting. Not because they are the most massive (they are by far the lightest — about 1/1836 the mass of a proton), but because they are the particles that actually interact with the outside world.

The nucleus sits at the centre, essentially sealed off. Protons and neutrons stay there. But electrons occupy the entire enormous cloud surrounding the nucleus, and it is the electrons on the *outermost* edge of that cloud that determine everything: whether an atom bonds, how many bonds it forms, whether it pulls electrons toward itself or pushes them away.

**Electron shells** are the energy levels electrons occupy. Think of them like floors in a building: electrons fill from the lowest floor upward. The first shell can hold at most 2 electrons. The second can hold at most 8. The third can hold up to 18, though in the first three periods it fills to 8 before the fourth shell begins.

The key rule — the rule that explains all of bonding — is this:

> **Atoms are most stable when their outermost shell is completely full.**

A full outer shell means the atom has no tendency to interact with anything. This is why noble gases (helium, neon, argon) are completely inert. Their outer shells are already full.

Every other element has an incomplete outer shell. And every incomplete outer shell is a drive toward completing it — either by sharing electrons with another atom (a covalent bond) or by transferring electrons to or from another atom (an ionic bond).

The electrons in the outermost shell are called **valence electrons**. The number of valence electrons an atom has is the single most predictive piece of information about its chemistry.`,
    },

    // ── 5. Electron shell interactive ────────────────────────────────────────
    {
      type: 'js',
      instruction: `This interactive builds each atom's electron configuration step by step as you add electrons one at a time, shell by shell.

Start from hydrogen (1 electron) and drag toward argon (18 electrons). Watch:
- How electrons fill the first shell to capacity (2), then begin a new shell
- How the outer shell fills from 1 toward 8, then resets as a new shell begins
- How the **reactivity indicator** tracks the outer shell — atoms with almost-full or almost-empty outer shells are most reactive

The dashed circles on the outer shell show empty slots — positions that could hold an electron but don't. Atoms with many empty slots have a strong tendency to attract electrons from other atoms.`,
      html: `<div class="scene">
  <div class="slider-row">
    <span class="sl-lab">Electrons: <span id="ecount">1</span></span>
    <input type="range" id="eslider" min="1" max="18" value="1" style="flex:1">
    <span class="sl-lab" id="el-id">H — Hydrogen</span>
  </div>
  <div class="main-row">
    <canvas id="shell-cv" width="300" height="300"></canvas>
    <div class="info-col">
      <div class="info-section">
        <div class="info-label">Shell configuration</div>
        <div class="shell-config" id="shell-config">[1]</div>
      </div>
      <div class="info-section">
        <div class="info-label">Valence electrons</div>
        <div class="val-dots" id="val-dots"></div>
        <div class="val-note" id="val-note"></div>
      </div>
      <div class="info-section">
        <div class="info-label">Stability</div>
        <div class="stability-meter" id="stab-meter"></div>
        <div class="stab-note" id="stab-note"></div>
      </div>
      <div class="info-section">
        <div class="info-label">Tendency</div>
        <div class="tendency-text" id="tend-text"></div>
      </div>
    </div>
  </div>
</div>`,
      css: `body{margin:0;padding:16px;font-family:sans-serif}
.scene{display:flex;flex-direction:column;gap:14px}
.slider-row{display:flex;align-items:center;gap:12px}
.sl-lab{font-size:13px;color:var(--color-text-primary,#1e293b);font-weight:500;white-space:nowrap}
#ecount{font-size:18px;font-weight:700;color:#38bdf8;font-family:monospace}
.main-row{display:grid;grid-template-columns:300px 1fr;gap:16px;align-items:start}
canvas{border-radius:12px;display:block;background:radial-gradient(ellipse at 50% 50%,#0d1f3e 0%,#050b18 100%)}
.info-col{display:flex;flex-direction:column;gap:12px}
.info-section{display:flex;flex-direction:column;gap:4px}
.info-label{font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:var(--color-text-secondary,#64748b)}
.shell-config{font-size:18px;font-family:monospace;font-weight:600;color:#38bdf8}
.val-dots{display:flex;gap:5px;flex-wrap:wrap}
.vd{width:16px;height:16px;border-radius:50%;background:#38bdf8;border:1.5px solid #0ea5e9}
.ve{width:16px;height:16px;border-radius:50%;border:1.5px dashed rgba(148,163,184,0.5)}
.val-note{font-size:12px;color:var(--color-text-secondary,#64748b)}
.stability-meter{height:10px;border-radius:5px;background:var(--color-background-secondary,#f1f5f9);overflow:hidden;margin-top:2px}
.stab-fill{height:100%;border-radius:5px;transition:width .3s,background .3s}
.stab-note{font-size:12px;color:var(--color-text-secondary,#64748b);margin-top:2px}
.tendency-text{font-size:12px;color:var(--color-text-primary,#1e293b);line-height:1.6;border-left:2px solid var(--color-border-secondary,#e2e8f0);padding-left:10px}`,
      startCode: `var ATOMS = [
  {e:1, sym:'H',  name:'Hydrogen',   shells:[1],     val:1, tend:'Has 1 valence electron. Usually shares it to reach a full first shell of 2. Forms 1 bond.'},
  {e:2, sym:'He', name:'Helium',     shells:[2],     val:2, tend:'Outer shell is full (max 2 for first shell). Completely stable. Does not react.'},
  {e:3, sym:'Li', name:'Lithium',    shells:[2,1],   val:1, tend:'1 valence electron. Very eager to give it away, exposing the full shell below. Highly reactive.'},
  {e:4, sym:'Be', name:'Beryllium',  shells:[2,2],   val:2, tend:'2 valence electrons. Tends to lose both, forming Be²⁺. Less reactive than lithium.'},
  {e:5, sym:'B',  name:'Boron',      shells:[2,3],   val:3, tend:'3 valence electrons. Forms 3 bonds. Unusual — one of the few elements happy with fewer than 8.'},
  {e:6, sym:'C',  name:'Carbon',     shells:[2,4],   val:4, tend:'4 valence electrons, 4 empty slots. Exactly halfway to a full shell. Forms 4 bonds. The basis of all organic chemistry.'},
  {e:7, sym:'N',  name:'Nitrogen',   shells:[2,5],   val:5, tend:'5 valence electrons, 3 empty slots. Forms 3 bonds. N₂ gas has a triple bond — very stable.'},
  {e:8, sym:'O',  name:'Oxygen',     shells:[2,6],   val:6, tend:'6 valence electrons, 2 empty slots. Forms 2 bonds. Very electronegative — pulls electrons toward itself.'},
  {e:9, sym:'F',  name:'Fluorine',   shells:[2,7],   val:7, tend:'7 valence electrons, 1 empty slot. Needs just 1 more. Most electronegative element. Forms exactly 1 bond.'},
  {e:10,sym:'Ne', name:'Neon',       shells:[2,8],   val:8, tend:'Full outer shell. Completely stable. This is the target state — 8 electrons in the outer shell — that drives all bonding.'},
  {e:11,sym:'Na', name:'Sodium',     shells:[2,8,1], val:1, tend:'1 valence electron in a new third shell. Same situation as lithium — one lone electron, very eager to give it away.'},
  {e:12,sym:'Mg', name:'Magnesium',  shells:[2,8,2], val:2, tend:'2 valence electrons. Tends to lose both. Reacts with water and acids, less violently than sodium.'},
  {e:13,sym:'Al', name:'Aluminium',  shells:[2,8,3], val:3, tend:'3 valence electrons. Tends to lose all 3, forming Al³⁺. Relatively reactive but forms a protective oxide layer.'},
  {e:14,sym:'Si', name:'Silicon',    shells:[2,8,4], val:4, tend:'4 valence electrons — same as carbon. Forms 4 bonds. Basis of semiconductors and glass.'},
  {e:15,sym:'P',  name:'Phosphorus', shells:[2,8,5], val:5, tend:'5 valence electrons. Forms 3 or 5 bonds. Essential in DNA and ATP.'},
  {e:16,sym:'S',  name:'Sulfur',     shells:[2,8,6], val:6, tend:'6 valence electrons. Usually forms 2 bonds (like oxygen). Can also form 4 or 6 in special cases.'},
  {e:17,sym:'Cl', name:'Chlorine',   shells:[2,8,7], val:7, tend:'7 valence electrons — same as fluorine. Needs 1 more. Forms 1 bond. Very reactive, less extreme than fluorine.'},
  {e:18,sym:'Ar', name:'Argon',      shells:[2,8,8], val:8, tend:'Full outer shell. Completely stable. Noble gas. Note the pattern: every 8 electrons in the outer shell = inert element.'},
];

var cv=document.getElementById('shell-cv'),ctx=cv.getContext('2d');
var slider=document.getElementById('eslider');

function drawShells(atom){
  ctx.clearRect(0,0,300,300);
  var cx=150,cy=150;

  // Nucleus
  var nc=atom.shells.length>=3?'#f97316':atom.shells.length===2?'#fb923c':'#fbbf24';
  ctx.beginPath(); ctx.arc(cx,cy,16,0,Math.PI*2); ctx.fillStyle=nc; ctx.fill();
  ctx.fillStyle='white'; ctx.font='500 10px monospace'; ctx.textAlign='center'; ctx.textBaseline='middle';
  ctx.fillText(atom.sym,cx,cy);

  // Shell radii
  var radii=[44,74,100];
  var maxPerShell=[2,8,18];
  atom.shells.forEach(function(count,si){
    var r=radii[si];
    var maxS=maxPerShell[si];
    var isOuter=si===atom.shells.length-1;

    // Ring
    ctx.beginPath(); ctx.arc(cx,cy,r,0,Math.PI*2);
    ctx.strokeStyle=isOuter?'rgba(56,189,248,0.45)':'rgba(148,163,184,0.2)';
    ctx.lineWidth=isOuter?1.5:1; ctx.stroke();

    // Filled electrons
    var displayMax=Math.min(maxS,8);
    for(var e=0;e<count;e++){
      var angle=(e/displayMax)*Math.PI*2-Math.PI/2;
      var ex=cx+r*Math.cos(angle), ey=cy+r*Math.sin(angle);
      ctx.beginPath(); ctx.arc(ex,ey,isOuter?5.5:4,0,Math.PI*2);
      ctx.fillStyle=isOuter?'#38bdf8':'rgba(148,163,184,0.65)'; ctx.fill();
    }

    // Empty slots on outer shell only
    if(isOuter && count<displayMax){
      for(var s=count;s<displayMax;s++){
        var a2=(s/displayMax)*Math.PI*2-Math.PI/2;
        var sx=cx+r*Math.cos(a2), sy=cy+r*Math.sin(a2);
        ctx.beginPath(); ctx.arc(sx,sy,5.5,0,Math.PI*2);
        ctx.strokeStyle='rgba(56,189,248,0.22)'; ctx.lineWidth=1;
        ctx.setLineDash([2,2]); ctx.stroke(); ctx.setLineDash([]);
      }
    }

    // Shell label
    ctx.fillStyle='rgba(255,255,255,0.3)'; ctx.font='10px sans-serif';
    ctx.textAlign='left';
    ctx.fillText('n='+(si+1)+': '+count, cx+r+6, cy-(si*14));
  });
}

function getReactivity(atom){
  var val=atom.val, shells=atom.shells;
  var maxShell=[2,8,18][shells.length-1]||8;
  // Noble gas = full
  if(val===maxShell||val===2&&shells.length===1) return {level:0,label:'Inert (full outer shell)',color:'#4ade80'};
  // Alkali / halide extremes
  if(val===1||val===7) return {level:95,label:'Highly reactive',color:'#f87171'};
  if(val===2||val===6) return {level:70,label:'Reactive',color:'#fb923c'};
  if(val===3||val===5) return {level:45,label:'Moderately reactive',color:'#fbbf24'};
  return {level:30,label:'Moderate',color:'#a3e635'};
}

function update(){
  var n=+slider.value, atom=ATOMS[n-1];
  document.getElementById('ecount').textContent=n;
  document.getElementById('el-id').textContent=atom.sym+' — '+atom.name;
  document.getElementById('shell-config').textContent='['+atom.shells.join(', ')+']';

  var outerCount=atom.shells[atom.shells.length-1];
  var maxOuter=Math.min([2,8,18][atom.shells.length-1]||8,8);
  var dots='';
  for(var e=0;e<outerCount;e++) dots+='<div class="vd"></div>';
  for(var s=outerCount;s<maxOuter;s++) dots+='<div class="ve"></div>';
  document.getElementById('val-dots').innerHTML=dots;
  document.getElementById('val-note').textContent=outerCount+' valence electron'+(outerCount!==1?'s':'')+' ('+( maxOuter-outerCount )+' empty slot'+(maxOuter-outerCount!==1?'s':'')+')';

  var react=getReactivity(atom);
  document.getElementById('stab-meter').innerHTML='<div class="stab-fill" style="width:'+react.level+'%;background:'+react.color+'"></div>';
  document.getElementById('stab-note').textContent=react.label;
  document.getElementById('tend-text').textContent=atom.tend;

  drawShells(atom);
}
slider.oninput=update;
update();`,
      outputHeight: 560,
    },

    // ── 6. The octet rule ─────────────────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `### The octet rule — and why it is not quite a rule

By now you have seen the pattern clearly: atoms with full outer shells are stable and inert. Atoms with incomplete outer shells are reactive, and the nature of their reactivity depends on whether they are closer to empty (and tend to give electrons away) or closer to full (and tend to take electrons).

This observation is formalised as the **octet rule**: most atoms achieve their lowest energy state by having 8 electrons in their outer shell. "Octet" simply means eight.

The octet rule explains almost everything about simple bonding:
- Sodium (1 valence electron) gives it to chlorine (7 valence electrons). Na becomes Na⁺ (full shell below), Cl becomes Cl⁻ (now has 8). They are attracted to each other. **Table salt.**
- Carbon (4 valence electrons) shares 4 electrons with 4 hydrogen atoms (1 each). Both carbon and each hydrogen end up with full shells. **Methane.**
- Oxygen (6 valence electrons) shares 2 electrons with 2 hydrogen atoms. All atoms end up with full shells. **Water.**

The octet rule has important exceptions — hydrogen wants only 2 (a full first shell), some elements can hold more than 8, and a few are stable with fewer. But as a first principle, it accounts for the structure of almost every molecule you will encounter in this course.

The deeper reason it works is quantum mechanics and the mathematics of electron orbitals — which is beyond the scope of this course. What matters now is the consequence: **incomplete outer shells create chemical reactions**.

This is the thread that runs through all of chemistry.`,
    },

    // ── 7. Summary visual ─────────────────────────────────────────────────────
    {
      type: 'js',
      instruction: `### Overview: The Three Particles
Each of the three particles you have met today plays a specific, critical role in the behavior of matter.`,
      html: `<div class="summary">
  <div class="particle-row">
    <div class="p-icon p-proton">p+</div>
    <div class="p-body">
      <div class="p-name">Proton</div>
      <div class="p-where">Location: nucleus · Charge: +1 · Mass: 1 u</div>
      <div class="p-role">The count of protons is the atomic number — the identity of an element. Change it and you have a different element. The proton count also determines the positive charge of the nucleus, which determines how strongly it holds electrons.</div>
    </div>
  </div>

  <div class="particle-row">
    <div class="p-icon p-neutron">n°</div>
    <div class="p-body">
      <div class="p-name">Neutron</div>
      <div class="p-where">Location: nucleus · Charge: 0 · Mass: ~1 u</div>
      <div class="p-role">Determines the isotope. Same element, different neutron count = same chemical behaviour, different mass. When a nucleus has too many or too few neutrons, it is unstable — radioactive isotopes decay until they reach a stable ratio.</div>
    </div>
  </div>

  <div class="particle-row highlight">
    <div class="p-icon p-electron">e−</div>
    <div class="p-body">
      <div class="p-name">Electron</div>
      <div class="p-where">Location: shells around nucleus · Charge: −1 · Mass: ~0 u</div>
      <div class="p-role">Determines all chemical behaviour. Electrons in the outermost shell (valence electrons) interact with neighbouring atoms. Atoms are most stable with a full outer shell — the drive to achieve this is the cause of every chemical bond.</div>
    </div>
  </div>

  <div class="key-row">
    <div class="key-item">
      <div class="key-label">Protons define</div>
      <div class="key-value">Which element</div>
    </div>
    <div class="key-arrow">→</div>
    <div class="key-item">
      <div class="key-label">Neutrons define</div>
      <div class="key-value">The mass</div>
    </div>
    <div class="key-arrow">→</div>
    <div class="key-item highlight-key">
      <div class="key-label">Electrons define</div>
      <div class="key-value">All chemistry</div>
    </div>
  </div>
</div>`,
      css: `body{margin:0;padding:16px;font-family:sans-serif}
.summary{display:flex;flex-direction:column;gap:12px}
.particle-row{display:grid;grid-template-columns:56px 1fr;gap:14px;padding:14px;border-radius:10px;border:1px solid var(--color-border-tertiary,#e2e8f0);background:var(--color-background-secondary,#f8fafc);align-items:flex-start}
.particle-row.highlight{border-color:#93c5fd;background:rgba(56,189,248,0.07)}
.p-icon{width:48px;height:48px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:700;font-family:monospace;flex-shrink:0}
.p-proton{background:#fed7aa;color:#c2410c;border:2px solid #f97316}
.p-neutron{background:#e0e7ff;color:#3730a3;border:2px solid #6366f1}
.p-electron{background:#bfdbfe;color:#1d4ed8;border:2px solid #3b82f6}
.p-name{font-size:16px;font-weight:600;color:var(--color-text-primary,#1e293b);margin-bottom:2px}
.p-where{font-size:11px;color:var(--color-text-secondary,#64748b);font-family:monospace;margin-bottom:6px}
.p-role{font-size:13px;color:var(--color-text-primary,#1e293b);line-height:1.65}
.key-row{display:grid;grid-template-columns:1fr auto 1fr auto 1fr;gap:8px;align-items:center;padding:14px;border-radius:10px;background:var(--color-background-info,#eff6ff);border:1px solid #93c5fd}
.key-item{text-align:center}
.key-label{font-size:10px;text-transform:uppercase;letter-spacing:.1em;color:var(--color-text-secondary,#64748b);margin-bottom:3px}
.key-value{font-size:14px;font-weight:600;color:var(--color-text-info,#1d4ed8)}
.highlight-key .key-value{color:#0ea5e9;font-size:16px}
.key-arrow{font-size:20px;color:#93c5fd;text-align:center}`,
      startCode: `// Static display — no JS needed`,
      outputHeight: 540,
    },

    // ── Challenge Section ─────────────────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `### Check your understanding`,
    },

    {
      type: 'challenge',
      instruction: `Atom A has **8 protons, 8 neutrons, and 8 electrons**. Atom B has **8 protons, 10 neutrons, and 8 electrons**. Which statement is true?`,
      options: [
        { label: 'A', text: 'Different elements — they have different total particle counts.' },
        { label: 'B', text: 'Same element, same chemistry. They are isotopes — oxygen-16 and oxygen-18. Different mass, identical chemical behaviour.' },
        { label: 'C', text: 'Same element, but Atom B will be more reactive because it has more mass.' },
        { label: 'D', text: 'Cannot be the same element — different masses means different elements.' },
      ],
      check: (label) => label === 'B',
      successMessage: 'Correct. Both have 8 protons — both are oxygen. Atom A is oxygen-16, Atom B is oxygen-18. Same chemical behaviour, different mass.',
      failMessage: 'Element identity is determined by proton count alone. Both have 8 protons, so both are oxygen.',
      html: '', css: ``, startCode: '',
      outputHeight: 200,
    },

  ],
};

export default {
  id: 'chem-1-2-inside-the-atom',
  slug: 'inside-the-atom',
  chapter: 'chem.1',
  order: 2,
  title: 'Inside the Atom',
  subtitle: 'Three particles. One tiny nucleus. A vast cloud of electrons. Everything else follows.',
  tags: ['chemistry','protons','neutrons','electrons','atomic-number','isotopes','valence','shells','octet-rule'],
  hook: {
    question: 'What makes carbon different from oxygen, why do some atoms of the same element weigh different amounts, and why do atoms bond at all?',
    realWorldContext: 'Three particles answer three questions. By the end of this lesson, every chemical property you encounter will trace back to one of them.',
    previewVisualizationId: 'InsideTheAtom',
  },
  intuition: {
    prose: [
      'Protons define the element — the atomic number is the identity of matter.',
      'Neutrons determine the isotope (mass variant) but have almost no effect on chemical behaviour.',
      'Electrons, especially the valence electrons in the outermost shell, determine everything about bonding and reactivity.',
      'The octet rule: atoms are most stable with a full outer shell of 8 electrons. This drive is the cause of every chemical bond.',
    ],
    callouts: [{ type: 'important', title: 'The one sentence that explains the periodic table', body: 'Elements in the same column have the same number of valence electrons — and therefore the same chemical personality.' }],
    visualizations: [{ id: 'InsideTheAtom', title: 'Inside the Atom' }],
  },
  math: { prose: [], callouts: [], visualizations: [] },
  rigor: { prose: [], callouts: [], visualizations: [] },
  examples: [], 
  challenges: [],
  mentalModel: [
    'Protons = atomic number = element identity. Same proton count = same element, always.',
    'Neutrons determine isotopes — same chemistry, different mass. Unstable isotopes are radioactive.',
    'Electrons fill shells from the innermost outward. The outermost shell holds valence electrons.',
    'Atoms are most stable with a full outer shell (the octet rule). Incomplete shells create reactivity.',
    'The periodic table is organised by valence electrons — same column = same outer shell count = same chemical behaviour.',
  ],
  checkpoints: ['read-intuition'],
  quiz: [],
}
