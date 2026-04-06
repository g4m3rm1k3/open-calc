// Chemistry · Chapter 1 · Lesson 3
// Elements and the Periodic Table

const LESSON_CHEM_1_3 = {
  title: 'Elements and the Periodic Table',
  subtitle: 'Why there are exactly 118 elements — and why they arrange themselves the way they do.',
  sequential: true,

  cells: [

    {
      type: 'markdown',
      instruction: `### A map of all matter

There are 118 known elements. Every substance in the universe — every gas, liquid, solid, every star, every cell in your body — is made from combinations of these 118 building blocks.

That number is not arbitrary. Each element occupies a unique position defined by its proton count, and the proton count can only be a whole number: 1, 2, 3, and so on. Hydrogen has 1 proton. Helium has 2. There is no element with 1.5 protons. The elements are discrete, countable, and finite.

For most of human history, nobody knew how many elements there were or whether there was any pattern to them. Ancient Greeks thought everything was made of earth, water, fire, and air. By the 1860s, chemists had discovered about 60 elements but had no idea why they behaved the way they did or how many more might exist.

Then Dmitri Mendeleev did something remarkable. He arranged the known elements in order of atomic mass and noticed that **chemical properties repeated at regular intervals**. Every eight elements (roughly), you hit something with similar behaviour to an element eight positions back. He called these repeating intervals **periods**.

He trusted the pattern so completely that when it predicted the existence of undiscovered elements, he left gaps in his table and described what those elements should be like — before anyone had found them. Within 15 years, three of those predicted elements were discovered, matching his descriptions almost exactly. The periodic table was not a catalogue. It was a predictive theory.

Today we know the pattern arises not from atomic mass but from atomic number — the proton count. And the repeating periods arise from electron shells filling up, exactly as we saw in the last lesson.`,
    },

    {
      type: 'js',
      instruction: `### The full periodic table — interactive

Every element, colour-coded by category. Click any element to see its full profile: atomic number, mass, electron configuration, key properties, and what makes it chemically distinctive.

The layout itself carries information. Every **row** (period) is a new electron shell beginning to fill. Every **column** (group) contains elements with the same number of valence electrons — which is why elements in the same column behave so similarly.

Look at Group 1 (far left column): hydrogen, lithium, sodium, potassium, rubidium, caesium. All have 1 valence electron. All are highly reactive. All react violently with water. That is not coincidence — it is the same outer-shell structure expressing itself in atom after atom.

Look at Group 18 (far right): helium, neon, argon, krypton, xenon. All have full outer shells. All are completely inert. The column is a fingerprint of electron configuration.`,
      html: `<div id="pt-root">
  <div id="pt-legend"></div>
  <div id="pt-grid"></div>
  <div id="pt-panel" class="panel-hidden"></div>
</div>`,
      css: `body{margin:0;padding:12px;font-family:sans-serif;background:var(--color-background-primary,#fff)}
#pt-root{display:flex;flex-direction:column;gap:10px}
#pt-legend{display:flex;flex-wrap:wrap;gap:6px}
.leg-item{display:flex;align-items:center;gap:4px;font-size:10px;color:var(--color-text-secondary,#64748b)}
.leg-swatch{width:10px;height:10px;border-radius:2px;flex-shrink:0}
#pt-grid{display:grid;grid-template-columns:repeat(18,1fr);gap:2px}
.el-cell{border-radius:4px;padding:3px 2px;cursor:pointer;text-align:center;border:1px solid transparent;transition:transform .1s,border-color .1s;min-width:0}
.el-cell:hover{transform:scale(1.15);z-index:10;position:relative}
.el-cell.selected{border-color:#fbbf24!important;transform:scale(1.18);z-index:20;position:relative}
.el-cell .cn{font-size:7px;line-height:1;opacity:.7}
.el-cell .cs{font-size:11px;font-weight:700;line-height:1.2;font-family:monospace}
.el-cell .cm{font-size:6px;line-height:1;opacity:.6}
.gap-cell{min-width:0}
.lan-label,.act-label{font-size:8px;color:var(--color-text-secondary,#64748b);text-align:center;display:flex;align-items:center;justify-content:center}
#pt-panel{border-radius:12px;border:1px solid var(--color-border-secondary,#e2e8f0);background:var(--color-background-secondary,#f8fafc);padding:16px;display:grid;grid-template-columns:auto 1fr;gap:16px;align-items:start}
.panel-hidden{display:none!important}
.panel-badge{border-radius:10px;padding:14px 18px;text-align:center;min-width:90px}
.badge-n{font-size:11px;opacity:.8}
.badge-sym{font-size:44px;font-weight:700;font-family:monospace;line-height:1}
.badge-name{font-size:13px;opacity:.85}
.badge-mass{font-size:11px;font-family:monospace;opacity:.7;margin-top:2px}
.panel-info{display:flex;flex-direction:column;gap:8px}
.pi-cat{font-size:11px;font-weight:600;padding:2px 10px;border-radius:12px;display:inline-block;width:fit-content;margin-bottom:2px}
.pi-row{display:grid;grid-template-columns:1fr 1fr;gap:6px}
.pi-item{background:var(--color-background-primary,#fff);border-radius:6px;padding:7px 10px;border:1px solid var(--color-border-tertiary,#e2e8f0)}
.pi-label{font-size:9px;text-transform:uppercase;letter-spacing:.08em;color:var(--color-text-secondary,#64748b);margin-bottom:2px}
.pi-val{font-size:12px;font-family:monospace;color:var(--color-text-primary,#1e293b)}
.pi-fact{font-size:12px;color:var(--color-text-primary,#1e293b);line-height:1.65;border-left:3px solid #94a3b8;padding-left:10px}
.shells-row{display:flex;gap:4px;flex-wrap:wrap}
.sh-badge{font-size:11px;font-family:monospace;background:var(--color-background-info,#eff6ff);color:var(--color-text-info,#2563eb);padding:2px 8px;border-radius:5px}
.val-dots-row{display:flex;gap:4px}
.vd{width:14px;height:14px;border-radius:50%;background:#38bdf8;border:1.5px solid #0ea5e9}
.ve{width:14px;height:14px;border-radius:50%;border:1.5px dashed #94a3b8}`,
      startCode: `var CATS = {
  'alkali':     {label:'Alkali metal',     bg:'#7f1d1d',border:'#ef4444',text:'#fca5a5'},
  'alkaline':   {label:'Alkaline earth',   bg:'#7c2d12',border:'#f97316',text:'#fdba74'},
  'transition': {label:'Transition metal', bg:'#1e3a5f',border:'#3b82f6',text:'#93c5fd'},
  'post':       {label:'Post-transition',  bg:'#14532d',border:'#22c55e',text:'#86efac'},
  'metalloid':  {label:'Metalloid',        bg:'#365314',border:'#84cc16',text:'#bef264'},
  'nonmetal':   {label:'Nonmetal',         bg:'#1e1b4b',border:'#8b5cf6',text:'#c4b5fd'},
  'halogen':    {label:'Halogen',          bg:'#4c1d95',border:'#a78bfa',text:'#ddd6fe'},
  'noble':      {label:'Noble gas',        bg:'#0c4a6e',border:'#38bdf8',text:'#7dd3fc'},
  'lanthanide': {label:'Lanthanide',       bg:'#1a1a2e',border:'#6366f1',text:'#a5b4fc'},
  'actinide':   {label:'Actinide',         bg:'#2d1b00',border:'#d97706',text:'#fde68a'},
};

var ELS = [
  {n:1,  sym:'H',  name:'Hydrogen',     mass:'1.008',  cat:'nonmetal',  shells:[1],        row:1, col:1,  eneg:2.20, radius:53,  melt:-259, fact:'Most abundant element. Powers the Sun. Forms water when burned.'},
  {n:2,  sym:'He', name:'Helium',       mass:'4.003',  cat:'noble',     shells:[2],        row:1, col:18, eneg:null, radius:31,  melt:null, fact:'Cannot be solidified at normal pressure. Discovered in the Sun before Earth.'},
  {n:3,  sym:'Li', name:'Lithium',      mass:'6.941',  cat:'alkali',    shells:[2,1],      row:2, col:1,  eneg:0.98, radius:167, melt:181,  fact:'Lightest metal. Powers every lithium-ion battery.'},
  {n:4,  sym:'Be', name:'Beryllium',    mass:'9.012',  cat:'alkaline',  shells:[2,2],      row:2, col:2,  eneg:1.57, radius:112, melt:1287, fact:'Transparent to X-rays. Used in aerospace and nuclear reactor windows.'},
  {n:5,  sym:'B',  name:'Boron',        mass:'10.811', cat:'metalloid', shells:[2,3],      row:2, col:13, eneg:2.04, radius:87,  melt:2076, fact:'Nearly as hard as diamond in crystalline form.'},
  {n:6,  sym:'C',  name:'Carbon',       mass:'12.011', cat:'nonmetal',  shells:[2,4],      row:2, col:14, eneg:2.55, radius:67,  melt:3827, fact:'Forms more compounds than any other element. Diamond and graphite are both pure carbon.'},
  {n:7,  sym:'N',  name:'Nitrogen',     mass:'14.007', cat:'nonmetal',  shells:[2,5],      row:2, col:15, eneg:3.04, radius:56,  melt:-210, fact:'78% of Earth\'s atmosphere. The N≡N triple bond is one of the strongest known.'},
  {n:8,  sym:'O',  name:'Oxygen',       mass:'15.999', cat:'nonmetal',  shells:[2,6],      row:2, col:16, eneg:3.44, radius:48,  melt:-219, fact:'Third most abundant element in the universe. Liquid oxygen is pale blue.'},
  {n:9,  sym:'F',  name:'Fluorine',     mass:'18.998', cat:'halogen',   shells:[2,7],      row:2, col:17, eneg:3.98, radius:42,  melt:-220, fact:'Most electronegative element. Reacts with nearly everything including glass.'},
  {n:10, sym:'Ne', name:'Neon',         mass:'20.180', cat:'noble',     shells:[2,8],      row:2, col:18, eneg:null, radius:38,  melt:-249, fact:'Completely inert. The most intense red-orange glow of any discharge tube element.'},
  {n:11, sym:'Na', name:'Sodium',       mass:'22.990', cat:'alkali',    shells:[2,8,1],    row:3, col:1,  eneg:0.93, radius:186, melt:98,   fact:'Explodes in water. Essential nerve signal electrolyte. Half of table salt.'},
  {n:12, sym:'Mg', name:'Magnesium',    mass:'24.305', cat:'alkaline',  shells:[2,8,2],    row:3, col:2,  eneg:1.31, radius:160, melt:650,  fact:'Burns with white flame that CO₂ cannot extinguish. Central atom in chlorophyll.'},
  {n:13, sym:'Al', name:'Aluminium',    mass:'26.982', cat:'post',      shells:[2,8,3],    row:3, col:13, eneg:1.61, radius:143, melt:660,  fact:'Once more valuable than gold. Most abundant metal in Earth\'s crust.'},
  {n:14, sym:'Si', name:'Silicon',      mass:'28.086', cat:'metalloid', shells:[2,8,4],    row:3, col:14, eneg:1.90, radius:117, melt:1414, fact:'Basis of the entire semiconductor and solar cell industry.'},
  {n:15, sym:'P',  name:'Phosphorus',   mass:'30.974', cat:'nonmetal',  shells:[2,8,5],    row:3, col:15, eneg:2.19, radius:98,  melt:44,   fact:'Glows in the dark. Essential in DNA backbone and ATP energy molecule.'},
  {n:16, sym:'S',  name:'Sulfur',       mass:'32.065', cat:'nonmetal',  shells:[2,8,6],    row:3, col:16, eneg:2.58, radius:88,  melt:113,  fact:'The smell of struck matches. Burns blue. Critical in rubber vulcanisation.'},
  {n:17, sym:'Cl', name:'Chlorine',     mass:'35.453', cat:'halogen',   shells:[2,8,7],    row:3, col:17, eneg:3.16, radius:79,  melt:-101, fact:'Chemical weapon in WWI. Now makes drinking water safe worldwide.'},
  {n:18, sym:'Ar', name:'Argon',        mass:'39.948', cat:'noble',     shells:[2,8,8],    row:3, col:18, eneg:null, radius:71,  melt:-189, fact:'1% of every breath you take. Completely inert welding shield gas.'},
  {n:19, sym:'K',  name:'Potassium',    mass:'39.098', cat:'alkali',    shells:[2,8,8,1],  row:4, col:1,  eneg:0.82, radius:227, melt:64,   fact:'Essential for heart rhythm. Symbol K from Latin kalium.'},
  {n:20, sym:'Ca', name:'Calcium',      mass:'40.078', cat:'alkaline',  shells:[2,8,8,2],  row:4, col:2,  eneg:1.00, radius:197, melt:842,  fact:'Most abundant metal in the human body — 1 kg in an average adult.'},
  {n:21, sym:'Sc', name:'Scandium',     mass:'44.956', cat:'transition',shells:[2,8,9,2],  row:4, col:3,  eneg:1.36, radius:162, melt:1541, fact:'Named after Scandinavia. Used in high-intensity sports stadium lighting.'},
  {n:22, sym:'Ti', name:'Titanium',     mass:'47.867', cat:'transition',shells:[2,8,10,2], row:4, col:4,  eneg:1.54, radius:147, melt:1668, fact:'As strong as steel but 45% lighter. Fully biocompatible with human tissue.'},
  {n:23, sym:'V',  name:'Vanadium',     mass:'50.942', cat:'transition',shells:[2,8,11,2], row:4, col:5,  eneg:1.63, radius:134, melt:1910, fact:'Named after Vanadis (Norse goddess). Compounds span nearly every rainbow colour.'},
  {n:24, sym:'Cr', name:'Chromium',     mass:'51.996', cat:'transition',shells:[2,8,13,1], row:4, col:6,  eneg:1.66, radius:128, melt:1907, fact:'Name means "colour" in Greek. Used in chrome plating and stainless steel.'},
  {n:25, sym:'Mn', name:'Manganese',    mass:'54.938', cat:'transition',shells:[2,8,13,2], row:4, col:7,  eneg:1.55, radius:127, melt:1246, fact:'Vast manganese nodules cover large areas of the deep ocean floor.'},
  {n:26, sym:'Fe', name:'Iron',         mass:'55.845', cat:'transition',shells:[2,8,14,2], row:4, col:8,  eneg:1.83, radius:126, melt:1538, fact:'Earth\'s core is mostly iron. Hemoglobin carries oxygen using an iron atom.'},
  {n:27, sym:'Co', name:'Cobalt',       mass:'58.933', cat:'transition',shells:[2,8,15,2], row:4, col:9,  eneg:1.88, radius:125, melt:1495, fact:'Vitamin B12 contains cobalt — essential for nerve function.'},
  {n:28, sym:'Ni', name:'Nickel',       mass:'58.693', cat:'transition',shells:[2,8,16,2], row:4, col:10, eneg:1.91, radius:124, melt:1455, fact:'Meteoric iron often contains 5-25% nickel — used by ancient people for tools.'},
  {n:29, sym:'Cu', name:'Copper',       mass:'63.546', cat:'transition',shells:[2,8,18,1], row:4, col:11, eneg:1.90, radius:128, melt:1085, fact:'Best non-precious electrical conductor. The Statue of Liberty started shiny brown.'},
  {n:30, sym:'Zn', name:'Zinc',         mass:'65.38',  cat:'transition',shells:[2,8,18,2], row:4, col:12, eneg:1.65, radius:122, melt:420,  fact:'Essential mineral (10mg/day). Galvanises steel to prevent rust.'},
  {n:31, sym:'Ga', name:'Gallium',      mass:'69.723', cat:'post',      shells:[2,8,18,3], row:4, col:13, eneg:1.81, radius:122, melt:30,   fact:'Melts in your hand — melting point 29.8°C. Used in LEDs and semiconductors.'},
  {n:32, sym:'Ge', name:'Germanium',    mass:'72.630', cat:'metalloid', shells:[2,8,18,4], row:4, col:14, eneg:2.01, radius:120, melt:938,  fact:'Predicted by Mendeleev 15 years before its discovery as "eka-silicon".'},
  {n:33, sym:'As', name:'Arsenic',      mass:'74.922', cat:'metalloid', shells:[2,8,18,5], row:4, col:15, eneg:2.18, radius:119, melt:817,  fact:'Historic poison. Napoleon may have died from arsenic in his wallpaper dye.'},
  {n:34, sym:'Se', name:'Selenium',     mass:'78.971', cat:'nonmetal',  shells:[2,8,18,6], row:4, col:16, eneg:2.55, radius:120, melt:221,  fact:'Essential but toxic in large doses. Used in solar cells and photocopiers.'},
  {n:35, sym:'Br', name:'Bromine',      mass:'79.904', cat:'halogen',   shells:[2,8,18,7], row:4, col:17, eneg:2.96, radius:114, melt:-7,   fact:'One of only two elements liquid at room temperature. Red-brown fuming liquid.'},
  {n:36, sym:'Kr', name:'Krypton',      mass:'83.798', cat:'noble',     shells:[2,8,18,8], row:4, col:18, eneg:null, radius:88,  melt:-157, fact:'The metre was once defined by a krypton-86 emission line.'},
  {n:37, sym:'Rb', name:'Rubidium',     mass:'85.468', cat:'alkali',    shells:[2,8,18,8,1],row:5,col:1,  eneg:0.82, radius:248, melt:39,   fact:'So reactive it spontaneously ignites in air.'},
  {n:38, sym:'Sr', name:'Strontium',    mass:'87.620', cat:'alkaline',  shells:[2,8,18,8,2],row:5,col:2,  eneg:0.95, radius:215, melt:777,  fact:'Makes red colour in fireworks. Sr-90 from nuclear fallout accumulates in bones.'},
  {n:47, sym:'Ag', name:'Silver',       mass:'107.868',cat:'transition',shells:[2,8,18,18,1],row:5,col:11,eneg:1.93,radius:144, melt:962,  fact:'Best electrical conductor of all elements. Used in high-spec electronics.'},
  {n:50, sym:'Sn', name:'Tin',          mass:'118.710',cat:'post',      shells:[2,8,18,18,4],row:5,col:14,eneg:1.96,radius:141, melt:232,  fact:'Pure tin makes a crackling "tin cry" when bent — crystal twinning.'},
  {n:53, sym:'I',  name:'Iodine',       mass:'126.904',cat:'halogen',   shells:[2,8,18,18,7],row:5,col:17,eneg:2.66,radius:133, melt:114,  fact:'Sublimes to purple vapour at room temperature. Essential for thyroid function.'},
  {n:54, sym:'Xe', name:'Xenon',        mass:'131.293',cat:'noble',     shells:[2,8,18,18,8],row:5,col:18,eneg:2.60,radius:108, melt:-112, fact:'First noble gas to form a stable compound — disproved "inert gas" assumption in 1962.'},
  {n:55, sym:'Cs', name:'Caesium',      mass:'132.905',cat:'alkali',    shells:[2,8,18,18,8,1],row:6,col:1,eneg:0.79,radius:265,melt:28,  fact:'Atomic clocks use caesium — accurate to 1 second in 300 million years.'},
  {n:56, sym:'Ba', name:'Barium',       mass:'137.327',cat:'alkaline',  shells:[2,8,18,18,8,2],row:6,col:2,eneg:0.89,radius:222,melt:727, fact:'Barium meal is drunk before X-raying the digestive tract — completely opaque to X-rays.'},
  {n:79, sym:'Au', name:'Gold',         mass:'196.967',cat:'transition',shells:[2,8,18,32,18,1],row:6,col:11,eneg:2.54,radius:144,melt:1064,fact:'All gold ever mined would fit in a 22-metre cube. Relativistic effects give it its yellow colour.'},
  {n:80, sym:'Hg', name:'Mercury',      mass:'200.592',cat:'transition',shells:[2,8,18,32,18,2],row:6,col:12,eneg:2.00,radius:150,melt:-39, fact:'Only metal liquid at room temperature. Lead floats in it.'},
  {n:82, sym:'Pb', name:'Lead',         mass:'207.200',cat:'post',      shells:[2,8,18,32,18,4],row:6,col:14,eneg:2.33,radius:175,melt:328, fact:'Roman lead pipes and wine vessels may have contributed to the fall of Rome.'},
  {n:86, sym:'Rn', name:'Radon',        mass:'222',    cat:'noble',     shells:[2,8,18,32,18,8],row:6,col:18,eneg:2.20,radius:120,melt:-71, fact:'Second leading cause of lung cancer — seeps into basements from uranium in soil.'},
  {n:87, sym:'Fr', name:'Francium',     mass:'223',    cat:'alkali',    shells:[2,8,18,32,18,8,1],row:7,col:1,eneg:0.70,radius:348,melt:27, fact:'Most unstable naturally occurring element. At any moment only ~20g exists on Earth.'},
  {n:88, sym:'Ra', name:'Radium',       mass:'226',    cat:'alkaline',  shells:[2,8,18,32,18,8,2],row:7,col:2,eneg:0.90,radius:215,melt:700, fact:'Discovered by Marie Curie. Her notebooks are still radioactive and kept in lead boxes.'},
  {n:92, sym:'U',  name:'Uranium',      mass:'238.029',cat:'actinide',  shells:[2,8,18,32,21,9,2],row:7,col:null,eneg:1.38,radius:196,melt:1135,fact:'1g of U-235 releases the same energy as 3 tonnes of coal.'},
];

// Sparse representative lanthanides/actinides for the separation rows
var LANTHANIDES = [
  {n:57,sym:'La',name:'Lanthanum',  mass:'138.9',cat:'lanthanide',shells:[2,8,18,18,9,2], eneg:1.10,fact:'First lanthanide. Used in camera lenses and hybrid car batteries.'},
  {n:58,sym:'Ce',name:'Cerium',     mass:'140.1',cat:'lanthanide',shells:[2,8,18,19,9,2], eneg:1.12,fact:'Most abundant rare earth. Polishes almost all optical glass.'},
  {n:60,sym:'Nd',name:'Neodymium',  mass:'144.2',cat:'lanthanide',shells:[2,8,18,22,8,2], eneg:1.14,fact:'Strongest permanent magnets (NdFeB). A 25g magnet can lift 9kg.'},
  {n:63,sym:'Eu',name:'Europium',   mass:'152.0',cat:'lanthanide',shells:[2,8,18,25,8,2], eneg:null, fact:'Euro banknotes glow red under UV light due to europium phosphors — anti-counterfeiting.'},
];
var ACTINIDES = [
  {n:89,sym:'Ac',name:'Actinium',   mass:'227',  cat:'actinide',shells:[2,8,18,32,18,9,2],eneg:1.10,fact:'Intensely radioactive — glows blue in the dark from ionising the surrounding air.'},
  {n:90,sym:'Th',name:'Thorium',    mass:'232.0',cat:'actinide',shells:[2,8,18,32,18,10,2],eneg:1.30,fact:'Potential nuclear fuel — more abundant than uranium, produces less long-lived waste.'},
  {n:94,sym:'Pu',name:'Plutonium',  mass:'244',  cat:'actinide',shells:[2,8,18,32,24,8,2],eneg:1.28,fact:'Warm to the touch from its own radioactive decay. Used in nuclear weapons and spacecraft RTGs.'},
];

function catStyle(cat){return CATS[cat]||{label:cat,bg:'#1f2937',border:'#6b7280',text:'#d1d5db'};}

// Build legend
var legEl=document.getElementById('pt-legend');
Object.keys(CATS).forEach(function(k){
  var c=CATS[k];
  var div=document.createElement('div');div.className='leg-item';
  div.innerHTML='<div class="leg-swatch" style="background:'+c.bg+';border:1px solid '+c.border+'"></div>'+c.label;
  legEl.appendChild(div);
});

// Build 7-row × 18-col grid with f-block separation
var grid=document.getElementById('pt-grid');
// Place elements by row/col
var byPos={};
ELS.forEach(function(el){if(el.row&&el.col)byPos[el.row+','+el.col]=el;});

var selectedEl=null;

function showPanel(el){
  selectedEl=el;
  document.querySelectorAll('.el-cell').forEach(function(c){c.classList.remove('selected');});
  var cell=document.querySelector('[data-n="'+el.n+'"]');
  if(cell)cell.classList.add('selected');

  var c=catStyle(el.cat);
  var panel=document.getElementById('pt-panel');
  panel.classList.remove('panel-hidden');

  var outerShell=el.shells[el.shells.length-1];
  var maxOuter=Math.min([2,8,18,32][el.shells.length-1]||8,8);
  var dots='';
  for(var e=0;e<outerShell;e++)dots+='<div class="vd"></div>';
  for(var s=outerShell;s<maxOuter;s++)dots+='<div class="ve"></div>';

  panel.innerHTML=
    '<div class="panel-badge" style="background:'+c.bg+';border:1px solid '+c.border+'">'+
      '<div class="badge-n" style="color:'+c.text+'">'+el.n+'</div>'+
      '<div class="badge-sym" style="color:'+c.text+'">'+el.sym+'</div>'+
      '<div class="badge-name" style="color:'+c.text+'">'+el.name+'</div>'+
      '<div class="badge-mass" style="color:'+c.text+'">'+el.mass+' u</div>'+
    '</div>'+
    '<div class="panel-info">'+
      '<span class="pi-cat" style="background:'+c.bg+';color:'+c.text+';border:1px solid '+c.border+'55">'+c.label+'</span>'+
      '<div class="pi-row">'+
        '<div class="pi-item"><div class="pi-label">Shells</div><div class="pi-val">['+el.shells.join(', ')+']</div></div>'+
        '<div class="pi-item"><div class="pi-label">Electronegativity</div><div class="pi-val">'+(el.eneg||'—')+'</div></div>'+
        '<div class="pi-item"><div class="pi-label">Atomic radius</div><div class="pi-val">'+(el.radius||'—')+' pm</div></div>'+
        '<div class="pi-item"><div class="pi-label">Melting point</div><div class="pi-val">'+(el.melt!==null&&el.melt!==undefined?el.melt+'°C':'—')+'</div></div>'+
      '</div>'+
      '<div><div class="pi-label" style="margin-bottom:4px">Valence electrons</div><div class="val-dots-row">'+dots+'</div></div>'+
      '<div class="pi-fact">'+el.fact+'</div>'+
    '</div>';
}

function makeCell(el){
  var c=catStyle(el.cat);
  var cell=document.createElement('div');
  cell.className='el-cell';
  cell.setAttribute('data-n',el.n);
  cell.style.background=c.bg;
  cell.style.borderColor=c.border+'66';
  cell.innerHTML=
    '<div class="cn" style="color:'+c.text+'">'+el.n+'</div>'+
    '<div class="cs" style="color:'+c.text+'">'+el.sym+'</div>';
  cell.onclick=function(){showPanel(el);};
  return cell;
}

function makeGap(span){
  var d=document.createElement('div');
  d.className='gap-cell';
  d.style.gridColumn='span '+(span||1);
  return d;
}

// Rows 1-7 main table
for(var row=1;row<=7;row++){
  for(var col=1;col<=18;col++){
    var el=byPos[row+','+col];
    if(el){
      grid.appendChild(makeCell(el));
    } else if(row<=2){
      // Rows 1-2: cols 3-12 are gaps (f/d blocks not filled yet)
      if(row===1&&col===2){
        var g=makeGap(16); grid.appendChild(g); col=17;
      } else {
        var g2=document.createElement('div');g2.className='gap-cell';grid.appendChild(g2);
      }
    } else if(row>=4&&row<=7&&col===3){
      // Transition block starts at col 3 for rows 4+
      var te=byPos[row+','+col];
      if(te){grid.appendChild(makeCell(te));}
      else{grid.appendChild(document.createElement('div'));}
    } else if((row===6||row===7)&&(col>=3&&col<=3)){
      // Lanthanide/Actinide placeholder already handled above
      var ph=document.createElement('div');ph.className='el-cell';
      ph.style.background='#1f2937';ph.style.border='1px dashed #374151';
      ph.style.fontSize='7px';ph.style.color='#6b7280';ph.style.display='flex';ph.style.alignItems='center';ph.style.justifyContent='center';
      ph.textContent=row===6?'57-71':'89-103';
      grid.appendChild(ph);
    } else {
      grid.appendChild(document.createElement('div'));
    }
  }
}

// Separator
var sep=document.createElement('div');
sep.style.gridColumn='1/19';sep.style.height='6px';
grid.appendChild(sep);

// Lanthanide row label + cells
var lanLabel=document.createElement('div');
lanLabel.className='lan-label';lanLabel.style.gridColumn='1/4';
lanLabel.textContent='Lanthanides';grid.appendChild(lanLabel);
for(var li=57;li<=71;li++){
  var lel=LANTHANIDES.find(function(x){return x.n===li;});
  if(lel){grid.appendChild(makeCell(lel));}
  else{
    var lph=document.createElement('div');lph.className='el-cell';
    lph.style.background='#1a1a2e';lph.style.border='1px solid #6366f144';
    lph.innerHTML='<div class="cn" style="color:#a5b4fc">'+li+'</div><div class="cs" style="color:#a5b4fc;font-size:9px">···</div>';
    grid.appendChild(lph);
  }
}

// Actinide row label + cells
var actLabel=document.createElement('div');
actLabel.className='act-label';actLabel.style.gridColumn='1/4';
actLabel.textContent='Actinides';grid.appendChild(actLabel);
for(var ai=89;ai<=103;ai++){
  var ael=ACTINIDES.find(function(x){return x.n===ai;});
  if(ael){grid.appendChild(makeCell(ael));}
  else{
    var aph=document.createElement('div');aph.className='el-cell';
    aph.style.background='#2d1b00';aph.style.border='1px solid #d9770644';
    aph.innerHTML='<div class="cn" style="color:#fde68a">'+ai+'</div><div class="cs" style="color:#fde68a;font-size:9px">···</div>';
    grid.appendChild(aph);
  }
}

// Click hydrogen by default
var firstEl=document.querySelector('[data-n="1"]');
if(firstEl)firstEl.click();`,
      outputHeight: 900,
    },

    {
      type: 'markdown',
      instruction: `### Reading the table

Three things to notice when you explore the periodic table:

**Periods (rows) track shell filling.** Period 1 has 2 elements — the first shell holds 2 electrons. Period 2 has 8 elements — the second shell holds 8. Period 3 has 8 again. Period 4 has 18 — the third shell can hold 18, and the 4s and 3d subshells both fill in this row. The length of each row is not arbitrary: it is exactly the number of electrons needed to fill the available shells.

**Groups (columns) share valence electrons.** Group 1 elements all have 1 valence electron. Group 17 (halogens) all have 7. Group 18 (noble gases) all have full shells. Elements in the same group have almost identical chemical behaviour — they bond the same way, form the same types of compounds, react with the same substances.

**Electronegativity increases left-to-right and bottom-to-top.** As you move right across a period, the nucleus gains protons but the electrons stay in the same shell — the positive charge pulls the electrons in tighter. Elements on the right side of the table (like fluorine and oxygen) pull bonding electrons strongly toward themselves. Elements on the left (like sodium and caesium) hold their electrons loosely and give them away readily. This gradient of electron-pulling power — electronegativity — will explain almost everything about how molecules form their shapes.

Click through some elements and compare:
- Lithium (3) vs Sodium (11) vs Potassium (19) — same group, same pattern, getting more reactive
- Fluorine (9) vs Chlorine (17) vs Bromine (35) — same group, all halogens, decreasing reactivity downward
- Neon (10) vs Argon (18) vs Krypton (36) — same group, all inert, no exceptions`,
    },

    {
      type: 'js',
      instruction: `### Mendeleev's prediction — the gap that proved the table

When Mendeleev published his table in 1869, he had to leave gaps for elements that had not yet been discovered. The most striking gap was between silicon (14) and tin (50) — based on the pattern, an element with atomic weight around 72 should exist, behaving like a heavier silicon.

He called it **eka-silicon** and described its properties: grayish metal, atomic weight ~72, density ~5.5 g/cm³, will form an oxide with formula EkO₂, will form a chloride EkCl₄.

In 1886, Clemens Winkler discovered **germanium**. Compare below.`,
      html: `<div class="prediction-box">
  <div class="pred-title">Mendeleev's prediction (1871) vs Discovery (1886)</div>
  <div class="pred-grid">
    <div class="pred-col pred-header"></div>
    <div class="pred-col pred-header">Eka-silicon (predicted)</div>
    <div class="pred-col pred-header">Germanium (actual)</div>

    <div class="pred-col pred-label">Atomic weight</div>
    <div class="pred-col pred-val">~72</div>
    <div class="pred-col pred-val match">72.6</div>

    <div class="pred-col pred-label">Density</div>
    <div class="pred-col pred-val">~5.5 g/cm³</div>
    <div class="pred-col pred-val match">5.35 g/cm³</div>

    <div class="pred-col pred-label">Appearance</div>
    <div class="pred-col pred-val">Dark gray metal</div>
    <div class="pred-col pred-val match">Gray-white metalloid</div>

    <div class="pred-col pred-label">Oxide formula</div>
    <div class="pred-col pred-val">EkO₂</div>
    <div class="pred-col pred-val match">GeO₂ ✓</div>

    <div class="pred-col pred-label">Oxide density</div>
    <div class="pred-col pred-val">~4.7 g/cm³</div>
    <div class="pred-col pred-val match">4.70 g/cm³</div>

    <div class="pred-col pred-label">Chloride formula</div>
    <div class="pred-col pred-val">EkCl₄</div>
    <div class="pred-col pred-val match">GeCl₄ ✓</div>

    <div class="pred-col pred-label">Chloride boiling point</div>
    <div class="pred-col pred-val">&lt;100°C</div>
    <div class="pred-col pred-val match">83.1°C ✓</div>
  </div>
  <div class="pred-note">The periodic table is not a catalogue. It is a predictive theory. Mendeleev's predictions were accurate to within a few percent — before the element had been found. This is what distinguishes a scientific model from a list of facts.</div>
</div>`,
      css: `body{margin:0;padding:16px;font-family:sans-serif}
.prediction-box{display:flex;flex-direction:column;gap:12px}
.pred-title{font-size:12px;font-weight:600;color:var(--color-text-secondary,#64748b);text-transform:uppercase;letter-spacing:.08em}
.pred-grid{display:grid;grid-template-columns:1fr 1fr 1fr;gap:1px;background:var(--color-border-tertiary,#e2e8f0);border-radius:10px;overflow:hidden;border:1px solid var(--color-border-tertiary,#e2e8f0)}
.pred-col{padding:9px 12px;background:var(--color-background-primary,#fff);font-size:13px}
.pred-header{background:var(--color-background-secondary,#f8fafc);font-weight:600;font-size:11px;color:var(--color-text-secondary,#64748b);text-transform:uppercase;letter-spacing:.06em}
.pred-label{color:var(--color-text-secondary,#64748b);font-size:12px}
.pred-val{font-family:monospace;color:var(--color-text-primary,#1e293b)}
.match{color:#065f46;background:#f0fdf4}
.pred-note{font-size:13px;color:var(--color-text-primary,#1e293b);line-height:1.7;background:var(--color-background-info,#eff6ff);border-left:3px solid var(--color-text-info,#3b82f6);padding:12px 16px;border-radius:0 8px 8px 0}`,
      startCode: `// Static display`,
      outputHeight: 480,
    },

    {
      type: 'markdown',
      instruction: `### Check your understanding`,
    },

    {
      type: 'challenge',
      instruction: `Lithium, sodium, and potassium are all in Group 1 of the periodic table. They all react violently with water. What is the single structural reason they share this behaviour?`,
      options: [
        { label: 'A', text: 'They are all metals, and all metals react with water.' },
        { label: 'B', text: 'They all have exactly 1 valence electron — a lone outer electron that is easily given away, releasing energy and forming a positive ion.' },
        { label: 'C', text: 'They are all in the same period, so they have the same number of electron shells.' },
        { label: 'D', text: 'They all have low atomic masses, and lighter elements react more violently.' },
      ],
      check: (label) => label === 'B',
      successMessage: 'Correct. One valence electron is the defining feature of Group 1. That lone electron sits in an outer shell far from the nucleus, loosely held, easily transferred to water molecules. The reaction releases hydrogen gas and heat. Lithium does this gently; caesium does it explosively — but the structural cause is identical.',
      failMessage: 'Not all metals react with water — gold and platinum are completely stable in it. Atomic mass does not determine reactivity. The period tells you how many shells, not the outer shell count. The answer is the outer electron count: all Group 1 elements have exactly 1 valence electron.',
      html: '', css: `body{margin:0;padding:0;font-family:sans-serif}`, startCode: '',
      outputHeight: 300,
    },

    {
      type: 'challenge',
      instruction: `Mendeleev left a gap in his 1871 table and predicted an undiscovered element he called "eka-silicon." He predicted its atomic weight (~72), density (~5.5 g/cm³), and the formulas of its compounds. When germanium was discovered in 1886, it matched almost exactly. What does this demonstrate about the periodic table?`,
      options: [
        { label: 'A', text: 'Mendeleev was lucky. Scientists occasionally make correct guesses about undiscovered elements.' },
        { label: 'B', text: 'The periodic table is a complete and final list of all elements that will ever exist.' },
        { label: 'C', text: 'The periodic table encodes a real pattern in nature — it is a predictive theory, not just a catalogue. The regularities in element properties are consequences of underlying atomic structure.' },
        { label: 'D', text: 'All elements were known by 1871; Mendeleev just misidentified some of them.' },
      ],
      check: (label) => label === 'C',
      successMessage: "Correct. A lucky guess does not predict density, melting point, oxide formula, and chloride boiling point simultaneously to within a few percent. Mendeleev's predictions worked because the table captured a real structural pattern — which we now understand as the filling of electron shells. The table is not a list; it is a theory about the structure of matter.",
      failMessage: "Seven independent predictions accurate to within a few percent is not luck — that is a model that captures something real about nature. The periodic table is a predictive theory grounded in electron shell structure, not a catalogue or a list of known elements.",
      html: '', css: `body{margin:0;padding:0;font-family:sans-serif}`, startCode: '',
      outputHeight: 310,
    },

    {
      type: 'challenge',
      instruction: `Fluorine (Group 17, Period 2) has an electronegativity of 3.98 — the highest of any element. Caesium (Group 1, Period 6) has the lowest at 0.79. What does this difference mean in practice?`,
      options: [
        { label: 'A', text: 'Fluorine is heavier than caesium, so it pulls harder on electrons due to gravity.' },
        { label: 'B', text: 'Fluorine has 7 valence electrons and strongly pulls bonding electrons toward itself. Caesium has 1 valence electron held loosely far from the nucleus, and readily gives it away. When these two bond, the electron transfer is almost complete — it forms one of the most ionic bonds possible.' },
        { label: 'C', text: 'Electronegativity measures how quickly an element reacts — fluorine reacts fastest, caesium slowest.' },
        { label: 'D', text: 'Fluorine has a smaller atomic number, so its nucleus is closer to the bonding electrons.' },
      ],
      check: (label) => label === 'B',
      successMessage: "Correct. Electronegativity is the measure of how strongly an atom pulls bonding electrons toward itself. Fluorine — top right of the table, 7 valence electrons, small atom, strong nuclear pull — is the ultimate electron acceptor. Caesium — bottom left, 1 valence electron, large atom, weak nuclear hold on that outer electron — is the ultimate electron donor. CsF (caesium fluoride) is one of the most ionic compounds that exists.",
      failMessage: "Gravity plays no role at atomic scales — electromagnetic force is many orders of magnitude stronger. Electronegativity is not reaction speed. Fluorine's high electronegativity comes from having 7 valence electrons in a small atom with a strongly positive nucleus — it pulls bonding electrons powerfully toward itself.",
      html: '', css: `body{margin:0;padding:0;font-family:sans-serif}`, startCode: '',
      outputHeight: 320,
    },

    {
      type: 'challenge',
      instruction: `Period 2 of the periodic table has 8 elements (lithium through neon). Period 4 has 18 elements (potassium through krypton). Why the difference?`,
      options: [
        { label: 'A', text: 'More elements had been discovered by the time period 4 was catalogued, so it appears longer.' },
        { label: 'B', text: 'Period 4 elements are heavier, and heavier elements require more space in the table.' },
        { label: 'C', text: 'In Period 2, only the second electron shell (max 8) is filling. In Period 4, both the 4s shell and the 3d subshell fill — the d-block transition metals add 10 extra elements. The length of each period equals the number of electrons filling available shells.' },
        { label: 'D', text: 'Mendeleev originally made Period 4 longer by mistake, and it has remained that way by convention.' },
      ],
      check: (label) => label === 'C',
      successMessage: "Correct. Each period corresponds to filling a new set of electron shells. Period 1: fills the 1s shell (2 electrons = 2 elements). Period 2: fills 2s and 2p (8 electrons = 8 elements). Period 4: fills 4s, then 3d (the transition metals), then 4p — totalling 18 electrons = 18 elements. The table's shape is a direct map of electron shell structure.",
      failMessage: "The table's layout is not historical accident or convention — it is determined by physics. The length of each period equals the number of electrons needed to fill the available shells at that energy level. Period 4 is longer because the 3d subshell (10 electrons) fills during this period, adding the entire block of transition metals.",
      html: '', css: `body{margin:0;padding:0;font-family:sans-serif}`, startCode: '',
      outputHeight: 310,
    },

  ],
}

export default {
  id: 'chem-1-3-elements-and-the-periodic-table',
  slug: 'elements-and-the-periodic-table',
  chapter: 'chem.1',
  order: 3,
  title: 'Elements and the Periodic Table',
  subtitle: 'Why there are exactly 118 elements — and why they arrange themselves the way they do.',
  tags: ['chemistry','elements','periodic-table','mendeleev','groups','periods','electronegativity'],
  hook: {
    question: 'Why does the periodic table have the shape it has — and how did Mendeleev predict the existence of undiscovered elements with startling accuracy?',
    realWorldContext: 'The periodic table is not a list. It is a predictive theory about the structure of matter, grounded entirely in electron shell configurations.',
    previewVisualizationId: 'ScienceNotebook',
  },
  intuition: {
    prose: [
      'Each period (row) tracks the filling of a new electron shell — which is why period lengths are 2, 8, 8, 18, 18...',
      'Each group (column) contains elements with the same number of valence electrons — which is why they share chemical behaviour.',
      'Electronegativity increases right and upward — fluorine pulls electrons hardest, caesium gives them away most readily.',
      'Mendeleev\'s predictions of undiscovered elements were accurate because the table captured a real pattern in atomic structure.',
    ],
    callouts: [{ type: 'important', title: 'The table is a theory', body: 'Mendeleev predicted the properties of undiscovered elements with percent-level accuracy. This is what distinguishes a scientific model from a catalogue.' }],
    visualizations: [{ id: 'ScienceNotebook', title: 'Elements and the Periodic Table', props: { lesson: LESSON_CHEM_1_3 } }],
  },
  math: { prose: [], callouts: [], visualizations: [] },
  rigor: { prose: [], callouts: [], visualizations: [] },
  examples: [], challenges: [],
  mentalModel: [
    'There are 118 elements because proton counts are discrete whole numbers — no fractional atoms.',
    'Periods track shell filling: period length = electrons needed to fill available shells.',
    'Groups share valence electron count = shared chemical personality.',
    'Electronegativity gradient: increases right and upward. F is highest, Cs lowest.',
    'The table is predictive: Mendeleev left gaps and described undiscovered elements — correctly.',
  ],
  checkpoints: ['read-intuition'],
  quiz: [],
}

export { LESSON_CHEM_1_3 }
