// Chemistry · Chapter 1 · Lesson 0
// Why Chemistry?
// Updated for ScienceNotebook — challenges use options[] + check(label)

const LESSON_CHEM_1_0 = {
  title: 'Why Chemistry?',
  subtitle: 'Every question about the physical world is a chemistry question.',
  sequential: true,

  cells: [

    {
      type: 'markdown',
      instruction: `### Before you memorise anything

Chemistry has a reputation for being a subject full of things to memorise — symbols, formulas, rules, exceptions to the rules. That reputation is mostly deserved, and it is mostly the fault of how chemistry is taught.

We are not doing it that way.

This course starts with questions, not answers. The questions are ones you have probably wondered about at some point — why does ice float? why does wood burn but gold doesn't? why does salt dissolve in water but oil doesn't? These are not trivial questions. They are exactly the questions chemistry exists to answer.

By the time you finish this course, you will be able to explain all of them — not by reciting a memorised answer, but by reasoning from a small set of deeply understood ideas.

**For each cell in this lesson:** read the question first. Sit with it for a moment. Then interact with the visual and see what chemistry has to say.`,
    },

    // ── Visual 1 — Ice ────────────────────────────────────────────────────────
    {
      type: 'js',
      instruction: `Here is a fact so ordinary that most people never think about it: **ice floats on water**.

That sounds unremarkable until you consider what it means. Ice is water — the same substance, just colder. Almost every other substance in existence is denser as a solid than as a liquid. Lead sinks in liquid lead. Butter sinks in melted butter. The solid form of nearly everything is heavier per unit of volume than its liquid form.

Ice is the glaring exception. And this peculiarity is not a curiosity — it is the reason complex life can exist on Earth. If ice sank, lakes and oceans would freeze from the bottom up in winter. There would be no liquid water under the ice. The oceans would eventually become solid.

The reason ice floats is completely explainable by how water molecules arrange themselves when they freeze. Toggle between ice and liquid water below to see the difference.`,
      html: `<div class="scene">
  <div class="controls-row">
    <button id="btnIce" class="tog active">Ice (solid)</button>
    <button id="btnWater" class="tog">Liquid water</button>
  </div>
  <canvas id="cv" width="520" height="280"></canvas>
  <div class="caption" id="cap">In ice, water molecules lock into a rigid hexagonal lattice with open space between them — making it less dense than liquid water.</div>
</div>`,
      css: `body{margin:0;padding:14px;font-family:sans-serif}
.scene{display:flex;flex-direction:column;gap:10px}
.controls-row{display:flex;gap:8px}
.tog{padding:7px 16px;border-radius:8px;border:1px solid var(--color-border-secondary,#e2e8f0);background:transparent;color:var(--color-text-secondary,#64748b);cursor:pointer;font-size:12px;transition:all .2s}
.tog.active{background:var(--color-background-info,#eff6ff);border-color:#93c5fd;color:var(--color-text-info,#1d4ed8);font-weight:500}
canvas{border-radius:10px;display:block;width:100%}
.caption{font-size:12px;color:var(--color-text-secondary,#64748b);line-height:1.65}`,
      startCode: `var cv=document.getElementById('cv'),ctx=cv.getContext('2d');
var captions={
  ice:'In ice, water molecules lock into a rigid hexagonal lattice with open space between them — making it less dense than liquid water.',
  water:'In liquid water, molecules are more tightly packed and constantly moving. The same number of molecules occupies less space than in ice.'
};
function mol(x,y,a,oc){
  ctx.save();ctx.translate(x,y);ctx.rotate(a);
  ctx.beginPath();ctx.arc(0,0,7,0,Math.PI*2);ctx.fillStyle=oc;ctx.fill();
  ctx.beginPath();ctx.arc(-8,7,4,0,Math.PI*2);ctx.fillStyle='#e2e8f0';ctx.fill();
  ctx.beginPath();ctx.arc(8,7,4,0,Math.PI*2);ctx.fillStyle='#e2e8f0';ctx.fill();
  ctx.restore();
}
function drawIce(){
  ctx.clearRect(0,0,cv.width,cv.height);
  ctx.fillStyle='#f0f9ff';ctx.beginPath();ctx.roundRect(0,0,cv.width,130,8);ctx.fill();
  ctx.fillStyle='#bfdbfe';ctx.beginPath();ctx.roundRect(0,132,cv.width,148,8);ctx.fill();
  for(var r=0;r<4;r++)for(var c=0;c<7;c++){var x=50+c*66+(r%2)*33,y=18+r*30;if(x<cv.width-20)mol(x,y,0,'#7dd3fc');}
  ctx.fillStyle='#60a5fa';ctx.font='500 11px sans-serif';ctx.textAlign='left';
  ctx.fillText('Ice — open lattice (less dense)',12,120);
  for(var r2=0;r2<5;r2++)for(var c2=0;c2<11;c2++){var x2=24+c2*44+(r2%2)*22,y2=150+r2*25;if(x2<cv.width-12)mol(x2,y2,Math.random()*.8-.4,'#3b82f6');}
  ctx.fillStyle='#1d4ed8';ctx.fillText('Water — tighter packing (more dense)',12,268);
}
function drawWater(){
  ctx.clearRect(0,0,cv.width,cv.height);
  ctx.fillStyle='#dbeafe';ctx.beginPath();ctx.roundRect(0,0,cv.width,cv.height,8);ctx.fill();
  for(var i=0;i<72;i++)mol(24+Math.random()*(cv.width-48),18+Math.random()*(cv.height-36),Math.random()*Math.PI*2,'#2563eb');
  ctx.fillStyle='#1e3a5f';ctx.font='500 11px sans-serif';ctx.textAlign='left';
  ctx.fillText('Same molecules — more tightly packed, constantly moving',12,cv.height-10);
}
var mode='ice';
document.getElementById('btnIce').onclick=function(){mode='ice';this.className='tog active';document.getElementById('btnWater').className='tog';drawIce();document.getElementById('cap').textContent=captions.ice};
document.getElementById('btnWater').onclick=function(){mode='water';this.className='tog active';document.getElementById('btnIce').className='tog';drawWater();document.getElementById('cap').textContent=captions.water};
drawIce();`,
      outputHeight: 390,
    },

    // ── Visual 2 — Burning ────────────────────────────────────────────────────
    {
      type: 'js',
      instruction: `**Why does wood burn but gold doesn't?**

"Gold doesn't react with oxygen" is technically correct, but it just pushes the question back: why not?

The answer is in the electrons. Atoms have a tiny nucleus at the centre surrounded by electrons arranged in shells. The outermost electrons — the ones on the edge — determine almost everything about how that atom behaves chemically.

Carbon atoms (the main component of wood) have outer electrons that are loosely held and ready to form new bonds with oxygen. Gold atoms have their outer electrons in an unusually stable configuration — they have almost no tendency to bond with anything.

Every chemical reaction is fundamentally about the electrons on the outsides of atoms either grabbing or releasing each other.`,
      html: `<div class="pair">
  <div class="atom-card">
    <div class="aname">Carbon</div>
    <div class="asym">C</div>
    <canvas id="c-cv" width="170" height="170"></canvas>
    <div class="verdict burns">Burns readily</div>
    <div class="adetail">4 outer electrons — available to bond with oxygen</div>
  </div>
  <div class="atom-card">
    <div class="aname">Gold</div>
    <div class="asym">Au</div>
    <canvas id="g-cv" width="170" height="170"></canvas>
    <div class="verdict stable">Does not burn</div>
    <div class="adetail">Outer electrons in unusually stable configuration</div>
  </div>
</div>
<div class="keyidea">The outer electrons of an atom determine its chemical personality.</div>`,
      css: `body{margin:0;padding:14px;font-family:sans-serif}
.pair{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:12px}
.atom-card{border:1px solid var(--color-border-tertiary,#e2e8f0);border-radius:12px;padding:12px;display:flex;flex-direction:column;align-items:center;gap:6px;background:var(--color-background-secondary,#f8fafc)}
.aname{font-size:11px;color:var(--color-text-secondary);text-transform:uppercase;letter-spacing:.08em}
.asym{font-size:28px;font-weight:500;color:var(--color-text-primary);font-family:monospace}
canvas{border-radius:8px;display:block}
.verdict{font-size:12px;font-weight:500;padding:3px 10px;border-radius:6px}
.burns{background:#fef3c7;color:#92400e}
.stable{background:#d1fae5;color:#065f46}
.adetail{font-size:11px;color:var(--color-text-secondary);text-align:center;line-height:1.5}
.keyidea{background:var(--color-background-info,#eff6ff);border-left:3px solid var(--color-text-info,#3b82f6);padding:10px 14px;border-radius:0 8px 8px 0;font-size:13px;color:var(--color-text-info,#1d4ed8);line-height:1.6}`,
      startCode: `function drawAtom(id,shells,nc,ec,lbl){
  var cv=document.getElementById(id),ctx=cv.getContext('2d'),cx=85,cy=85;
  ctx.clearRect(0,0,170,170);
  ctx.beginPath();ctx.arc(cx,cy,14,0,Math.PI*2);ctx.fillStyle=nc;ctx.fill();
  ctx.fillStyle='white';ctx.font='500 11px monospace';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(lbl,cx,cy);
  var radii=[32,52,68,80];
  shells.forEach(function(count,i){
    var r=radii[i];
    ctx.beginPath();ctx.arc(cx,cy,r,0,Math.PI*2);ctx.strokeStyle='rgba(148,163,184,0.3)';ctx.lineWidth=1;ctx.stroke();
    for(var e=0;e<count;e++){
      var a=(e/count)*Math.PI*2-Math.PI/2,ex=cx+r*Math.cos(a),ey=cy+r*Math.sin(a);
      ctx.beginPath();ctx.arc(ex,ey,i===shells.length-1?5:3.5,0,Math.PI*2);
      ctx.fillStyle=i===shells.length-1?ec:'rgba(148,163,184,0.6)';ctx.fill();
    }
  });
}
drawAtom('c-cv',[2,4],'#374151','#f59e0b','C');
drawAtom('g-cv',[2,8,1],'#92400e','#10b981','Au');`,
      outputHeight: 360,
    },

    // ── Visual 3 — Dissolution ────────────────────────────────────────────────
    {
      type: 'js',
      instruction: `**Why does salt dissolve in water but oil doesn't?**

A water molecule has a slight electrical imbalance — one end is slightly negative, one end slightly positive. We call this being *polar*.

Salt is made of charged particles (ions). Charged things attract polar things, so water molecules pull the salt ions apart and surround them. The salt dissolves because the water *wants* to interact with it.

Oil molecules are nonpolar — electrically symmetrical with no charged regions. Water molecules have no reason to interact with them and simply exclude them. The oil molecules cluster together away from the water.

Chemists summarise this as: **"like dissolves like."** Polar dissolves polar. Nonpolar dissolves nonpolar. These four words explain thousands of real-world observations.`,
      html: `<div class="demos">
  <div class="demo">
    <div class="dlabel">Salt + water</div>
    <canvas id="salt-cv" width="220" height="190"></canvas>
    <div class="verdict dissolves">Dissolves ✓</div>
    <div class="dreason">Charged ions attract polar water</div>
  </div>
  <div class="demo">
    <div class="dlabel">Oil + water</div>
    <canvas id="oil-cv" width="220" height="190"></canvas>
    <div class="verdict separates">Separates ✗</div>
    <div class="dreason">Nonpolar oil and polar water repel</div>
  </div>
</div>
<div class="rule">"Like dissolves like" — polar dissolves in polar. Nonpolar in nonpolar.</div>`,
      css: `body{margin:0;padding:14px;font-family:sans-serif}
.demos{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:12px}
.demo{border:1px solid var(--color-border-tertiary,#e2e8f0);border-radius:12px;padding:12px;display:flex;flex-direction:column;align-items:center;gap:7px;background:var(--color-background-secondary,#f8fafc)}
.dlabel{font-size:12px;font-weight:500;color:var(--color-text-primary)}
canvas{border-radius:8px;display:block}
.verdict{font-size:12px;font-weight:500;padding:3px 10px;border-radius:6px}
.dissolves{background:#d1fae5;color:#065f46}
.separates{background:#fee2e2;color:#991b1b}
.dreason{font-size:11px;color:var(--color-text-secondary);text-align:center;line-height:1.5}
.rule{background:var(--color-background-secondary,#f8fafc);border-left:3px solid var(--color-border-secondary,#94a3b8);padding:10px 14px;border-radius:0 8px 8px 0;font-size:13px;color:var(--color-text-primary);line-height:1.6;font-style:italic}`,
      startCode: `function wm(ctx,x,y){ctx.beginPath();ctx.arc(x,y,5,0,Math.PI*2);ctx.fillStyle='#3b82f6';ctx.fill();ctx.beginPath();ctx.arc(x-7,y+6,3,0,Math.PI*2);ctx.fillStyle='#93c5fd';ctx.fill();ctx.beginPath();ctx.arc(x+7,y+6,3,0,Math.PI*2);ctx.fillStyle='#93c5fd';ctx.fill();}
var s=document.getElementById('salt-cv'),sc=s.getContext('2d');
sc.fillStyle='#dbeafe';sc.fillRect(0,0,220,190);
for(var i=0;i<24;i++)wm(sc,14+(i%6)*34+(Math.floor(i/6)%2)*17,18+Math.floor(i/6)*46);
var ions=[{x:58,y:38,c:'#f97316',s:'Na⁺'},{x:148,y:68,c:'#8b5cf6',s:'Cl⁻'},{x:88,y:118,c:'#f97316',s:'Na⁺'},{x:172,y:38,c:'#8b5cf6',s:'Cl⁻'},{x:38,y:158,c:'#f97316',s:'Na⁺'},{x:195,y:148,c:'#8b5cf6',s:'Cl⁻'}];
ions.forEach(function(ion){sc.beginPath();sc.arc(ion.x,ion.y,9,0,Math.PI*2);sc.fillStyle=ion.c;sc.fill();sc.fillStyle='white';sc.font='8px monospace';sc.textAlign='center';sc.textBaseline='middle';sc.fillText(ion.s,ion.x,ion.y);});

var o=document.getElementById('oil-cv'),oc=o.getContext('2d');
oc.fillStyle='#fef9c3';oc.fillRect(0,0,220,90);
oc.fillStyle='#dbeafe';oc.fillRect(0,95,220,95);
oc.strokeStyle='rgba(148,163,184,0.4)';oc.lineWidth=1.5;oc.beginPath();oc.moveTo(0,92);oc.lineTo(220,92);oc.stroke();
for(var j=0;j<10;j++){var ox=18+(j%5)*38,oy=18+Math.floor(j/5)*38;oc.strokeStyle='#b45309';oc.lineWidth=2;oc.beginPath();oc.moveTo(ox,oy);oc.lineTo(ox+26,oy);oc.stroke();for(var k=0;k<4;k++){oc.beginPath();oc.arc(ox+k*9,oy,4,0,Math.PI*2);oc.fillStyle='#fbbf24';oc.fill();}}
for(var m=0;m<15;m++)wm(oc,14+(m%5)*40+(Math.floor(m/5)%2)*20,105+Math.floor(m/5)*28);
oc.fillStyle='#92400e';oc.font='10px sans-serif';oc.textAlign='center';oc.fillText('Oil (nonpolar)',110,83);
oc.fillStyle='#1d4ed8';oc.fillText('Water (polar)',110,186);`,
      outputHeight: 390,
    },

    // ── Visual 4 — Course map ─────────────────────────────────────────────────
    {
      type: 'js',
      instruction: `Every question we looked at has the same structure: a visible, everyday phenomenon, and beneath it, at a scale too small to see, something specific happening with atoms and electrons that completely determines what we observe.

Chemistry is the bridge between the invisible atomic world and the visible world you live in.

The map below shows the territory of this course. Every topic is a piece of the same story.`,
      html: `<div class="map">
  <div class="maptitle">The shape of this course</div>
  <div class="chapters">
    <div class="chapter ch1"><div class="ch-label">Chapter 1</div><div class="ch-name">The invisible world</div><div class="ch-topics">Atoms · Electrons · Elements · The periodic table</div></div>
    <div class="arrow">↓</div>
    <div class="chapter ch2"><div class="ch-label">Chapter 2</div><div class="ch-name">Why atoms bond</div><div class="ch-topics">Ionic bonds · Covalent bonds · Molecular geometry · Water</div></div>
    <div class="arrow">↓</div>
    <div class="chapter ch3"><div class="ch-label">Chapter 3</div><div class="ch-name">Matter in bulk</div><div class="ch-topics">States of matter · Intermolecular forces · Solutions</div></div>
    <div class="arrow">↓</div>
    <div class="chapter ch4"><div class="ch-label">Chapter 4</div><div class="ch-name">Chemical reactions</div><div class="ch-topics">Bonds breaking and forming · Energy · Acids and bases</div></div>
  </div>
  <div class="thread">One thread runs through all of it: <em>electrons on the outsides of atoms</em></div>
</div>`,
      css: `body{margin:0;padding:14px;font-family:sans-serif}
.map{display:flex;flex-direction:column;gap:8px}
.maptitle{font-size:11px;font-weight:500;color:var(--color-text-secondary);text-transform:uppercase;letter-spacing:.08em}
.chapters{display:flex;flex-direction:column;gap:4px}
.chapter{border-radius:10px;padding:11px 14px;border:1px solid var(--color-border-tertiary)}
.ch-label{font-size:10px;text-transform:uppercase;letter-spacing:.1em;margin-bottom:2px}
.ch-name{font-size:14px;font-weight:500;color:var(--color-text-primary);margin-bottom:3px}
.ch-topics{font-size:11px;color:var(--color-text-secondary)}
.ch1{background:#f0fdf4;border-color:#86efac}.ch1 .ch-label{color:#15803d}
.ch2{background:#eff6ff;border-color:#93c5fd}.ch2 .ch-label{color:#1d4ed8}
.ch3{background:#faf5ff;border-color:#c4b5fd}.ch3 .ch-label{color:#7c3aed}
.ch4{background:#fff7ed;border-color:#fdba74}.ch4 .ch-label{color:#c2410c}
.arrow{text-align:center;font-size:16px;color:var(--color-text-secondary);line-height:1}
.thread{background:var(--color-background-secondary);border:1px solid var(--color-border-tertiary);padding:11px 14px;border-radius:10px;font-size:13px;color:var(--color-text-primary);line-height:1.6}
.thread em{font-style:normal;font-weight:500;color:var(--color-text-info,#2563eb)}`,
      startCode: `// Static display — no JS needed`,
      outputHeight: 400,
    },

    // ── Before challenges ─────────────────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `### Check your understanding

Three questions based on what you have just seen. Read each question, think about your answer, then select it. The feedback will explain the reasoning — not just whether you were right.`,
    },

    // ── Challenge 1 ───────────────────────────────────────────────────────────
    {
      type: 'challenge',
      instruction: `**If ice sank instead of floating**, what would happen to lakes in winter?`,
      options: [
        { label: 'A', text: 'Lakes would freeze from the top down, with a layer of ice insulating the liquid water below — the same as what happens now.' },
        { label: 'B', text: 'Lakes would freeze from the bottom up. Each layer of ice would sink, exposing new surface water to freeze, until the whole lake became solid.' },
        { label: 'C', text: 'Lakes would not freeze at all, because the sinking ice would keep the water too cold to solidify.' },
      ],
      check: (label) => label === 'B',
      successMessage: 'Correct. Ice sinking means continuous freezing from the surface down — each layer sinks, more surface water freezes, until the lake is solid. Life in cold-climate lakes survives winter only because ice floats and acts as an insulating lid.',
      failMessage: 'Think it through: if ice is denser than water, it sinks when it forms. The surface then freezes again, that sinks too. This repeats until the whole lake is solid. Option A describes what actually happens now — not what would happen if ice sank.',
      html: '',
      css: `body{margin:0;padding:0;font-family:sans-serif}`,
      startCode: '',
      outputHeight: 260,
    },

    // ── Challenge 2 ───────────────────────────────────────────────────────────
    {
      type: 'challenge',
      instruction: `You have four substances: **sugar, vegetable oil, salt, and wax**. Water is polar. Which two will dissolve in water? (Apply "like dissolves like.")`,
      options: [
        { label: 'A', text: 'Sugar and vegetable oil — both are common food substances.' },
        { label: 'B', text: 'Salt and wax — both are solid at room temperature.' },
        { label: 'C', text: 'Sugar and salt — both are polar or ionic, which interacts with polar water.' },
        { label: 'D', text: 'Vegetable oil and wax — both are nonpolar, so they avoid water equally.' },
      ],
      check: (label) => label === 'C',
      successMessage: 'Correct. Sugar has polar -OH groups that interact with polar water. Salt is ionic — charged particles that water molecules pull apart and surround. Oil and wax are both nonpolar — they are excluded by water.',
      failMessage: 'Apply the rule: polar dissolves in polar, nonpolar in nonpolar. Water is polar. Sugar is polar (has many -OH groups). Salt is ionic (charged). Vegetable oil and wax are both nonpolar carbon chains with no charged regions.',
      html: '',
      css: `body{margin:0;padding:0;font-family:sans-serif}`,
      startCode: '',
      outputHeight: 310,
    },

    // ── Challenge 3 ───────────────────────────────────────────────────────────
    {
      type: 'challenge',
      instruction: `What is the best one-sentence description of what chemistry is?`,
      options: [
        { label: 'A', text: 'The study of the periodic table and the symbols and masses of elements.' },
        { label: 'B', text: 'The bridge between the invisible atomic world and the observable phenomena of the physical world.' },
        { label: 'C', text: 'The science of mixing substances together to create new ones.' },
        { label: 'D', text: 'The branch of physics that deals with very small particles.' },
      ],
      check: (label) => label === 'B',
      successMessage: 'Correct. Chemistry explains the visible world by describing what atoms and electrons are doing at a scale too small to see. The periodic table, mixing substances, and small particles are all parts of chemistry — but the bridge between invisible and visible is the core idea.',
      failMessage: 'A is just one tool. C describes reactions but misses the explanatory goal. D mixes up chemistry with particle physics. The defining purpose of chemistry is explaining observable phenomena (ice floating, burning, dissolving) through atomic-scale behaviour.',
      html: '',
      css: `body{margin:0;padding:0;font-family:sans-serif}`,
      startCode: '',
      outputHeight: 310,
    },

  ],
}

export default {
  id: 'chem-1-0-why-chemistry',
  slug: 'why-chemistry',
  chapter: 'chem1',
  order: 0,
  title: 'Why Chemistry?',
  subtitle: 'Every question about the physical world is a chemistry question.',
  tags: ['chemistry', 'foundations', 'atoms', 'phenomena'],
  hook: {
    question: "Why does ice float, wood burn, and salt dissolve — but oil doesn't?",
    realWorldContext: 'These are not trivial questions. They are the questions chemistry was built to answer.',
    previewVisualizationId: 'ScienceNotebook',
  },
  intuition: {
    prose: [
      'Chemistry explains the visible world by describing what is happening at a scale too small to see.',
      'Every observable phenomenon is a consequence of specific atomic and molecular behaviour.',
    ],
    callouts: [{ type: 'important', title: 'The core pattern', body: 'Visible phenomenon → invisible atomic explanation. This pattern repeats in every lesson.' }],
    visualizations: [{ id: 'ScienceNotebook', title: 'Why Chemistry', props: { lesson: LESSON_CHEM_1_0 } }],
  },
  math: { prose: [], callouts: [], visualizations: [] },
  rigor: { prose: [], callouts: [], visualizations: [] },
  examples: [], challenges: [],
  mentalModel: [
    'Chemistry bridges the invisible atomic world and the visible phenomena we observe.',
    'Ice floats because its molecular lattice is less dense than liquid water.',
    'Burning is electrons reacting with oxygen — outer electrons determine reactivity.',
    '"Like dissolves like" — polar dissolves in polar, nonpolar in nonpolar.',
  ],
  checkpoints: ['read-intuition'],
  quiz: [],
}

export { LESSON_CHEM_1_0 }
