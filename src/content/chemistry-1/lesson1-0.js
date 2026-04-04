// ─────────────────────────────────────────────────────────────────────────────
// Chemistry · Chapter 1 · Lesson 0
// Why Chemistry?
//
// Design principle: Start with observable phenomena the student already
// knows and cares about. Chemistry answers questions they already have
// but never thought to ask. Build the motivation before building the model.
// ─────────────────────────────────────────────────────────────────────────────

const LESSON_CHEM_1_0 = {
  title: 'Why Chemistry?',
  subtitle: 'Every question about the physical world is a chemistry question.',
  sequential: true,

  cells: [

    // ── 0. Opening ────────────────────────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `### Before you memorise anything

Chemistry has a reputation for being a subject full of things to memorise — symbols, formulas, rules, exceptions to the rules. That reputation is mostly deserved, and it is mostly the fault of how chemistry is taught.

We are not doing it that way.

This course starts with questions, not answers. The questions are ones you have probably wondered about at some point — why does ice float? why does wood burn but gold doesn't? why does salt dissolve in water but oil doesn't? These are not trivial questions. They are exactly the questions chemistry exists to answer.

By the time you finish this course, you will be able to explain all of them — not by reciting a memorised answer, but by reasoning from a small set of deeply understood ideas.

**For each cell in this lesson:** read the question first. Sit with it for a moment. Then run the cell and see what chemistry has to say.`,
    },

    // ── 1. The ice question ───────────────────────────────────────────────────
    {
      type: 'js',
      instruction: `Here is a fact so ordinary that most people never think about it: ice floats on water.

That sounds unremarkable until you consider what it means. Ice is water — the same substance, just colder. Almost every other substance in existence is denser as a solid than as a liquid. If you melt lead, the liquid lead sinks. If you melt butter, liquid butter sinks. The solid form of nearly everything is heavier per unit of volume than its liquid form.

Ice is the glaring exception. Solid water is *less dense* than liquid water. And this peculiarity is not a curiosity — it is the reason complex life can exist on Earth. If ice sank, lakes and oceans would freeze from the bottom up. There would be no liquid water under the ice in winter. The oceans would become solid.

The reason ice floats is completely explainable by the structure of water molecules and how they arrange themselves when they freeze. That is a chemistry question.

Run the cell. The animation shows what is happening at the molecular level.`,
      html: `<div class="scene">
  <div class="label" id="lbl">Ice floating on water</div>
  <canvas id="cv" width="560" height="300"></canvas>
  <div class="controls">
    <button id="btnIce" class="active">Ice (solid)</button>
    <button id="btnWater">Liquid water</button>
  </div>
  <div class="caption" id="cap">In ice, water molecules lock into a rigid hexagonal lattice with open space between them — making it less dense than liquid water.</div>
</div>`,
      css: `body{margin:0;padding:16px;background:transparent;font-family:sans-serif}
.scene{display:flex;flex-direction:column;gap:10px}
.label{font-size:13px;font-weight:500;color:var(--color-text-primary,#1e293b)}
canvas{border-radius:10px;display:block;width:100%;max-width:560px}
.controls{display:flex;gap:8px}
button{padding:7px 16px;border-radius:8px;border:1px solid var(--color-border-secondary,#e2e8f0);background:transparent;color:var(--color-text-secondary,#64748b);cursor:pointer;font-size:12px;transition:all .2s}
button.active{background:var(--color-background-info,#eff6ff);border-color:var(--color-border-secondary,#93c5fd);color:var(--color-text-info,#1d4ed8);font-weight:500}
.caption{font-size:12px;color:var(--color-text-secondary,#64748b);line-height:1.65;max-width:540px}`,
      startCode: `const cv = document.getElementById('cv');
const ctx = cv.getContext('2d');
const btnIce = document.getElementById('btnIce');
const btnWater = document.getElementById('btnWater');
const cap = document.getElementById('cap');
let mode = 'ice';

const captions = {
  ice: 'In ice, water molecules lock into a rigid hexagonal lattice with open space between them — making it less dense than liquid water.',
  water: 'In liquid water, molecules are more tightly packed and constantly moving. The same number of molecules takes up less space than in ice.'
};

function drawMolecule(x, y, angle, color) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  ctx.beginPath();
  ctx.arc(0, 0, 7, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();
  ctx.beginPath();
  ctx.arc(-8, 7, 4, 0, Math.PI * 2);
  ctx.fillStyle = '#e2e8f0';
  ctx.fill();
  ctx.beginPath();
  ctx.arc(8, 7, 4, 0, Math.PI * 2);
  ctx.fillStyle = '#e2e8f0';
  ctx.fill();
  ctx.restore();
}

function drawIce() {
  ctx.clearRect(0, 0, cv.width, cv.height);
  ctx.fillStyle = '#f0f9ff';
  ctx.beginPath();
  ctx.roundRect(0, 0, cv.width, 140, 10);
  ctx.fill();
  ctx.fillStyle = '#bfdbfe';
  ctx.beginPath();
  ctx.roundRect(0, 140, cv.width, 160, 10);
  ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.6)';
  ctx.fillRect(0, 140, cv.width, 4);

  // Ice lattice — open hexagonal grid, spaced far apart
  var cols = 7, rows = 4;
  var ox = 50, oy = 20, xgap = 68, ygap = 32;
  for (var r = 0; r < rows; r++) {
    for (var c = 0; c < cols; c++) {
      var x = ox + c * xgap + (r % 2) * 34;
      var y = oy + r * ygap;
      if (x < cv.width - 30)
        drawMolecule(x, y, 0, '#7dd3fc');
    }
  }

  // Water below — tightly packed
  var ox2 = 30, oy2 = 162, xgap2 = 42, ygap2 = 26;
  for (var r2 = 0; r2 < 5; r2++) {
    for (var c2 = 0; c2 < 12; c2++) {
      var x2 = ox2 + c2 * xgap2 + (r2 % 2) * 21;
      var y2 = oy2 + r2 * ygap2;
      if (x2 < cv.width - 20)
        drawMolecule(x2, y2, Math.random() * 0.8 - 0.4, '#3b82f6');
    }
  }

  ctx.fillStyle = '#0c4a6e';
  ctx.font = '500 12px sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('Ice (less dense — floats)', 14, 125);
  ctx.fillStyle = '#1e3a5f';
  ctx.fillText('Liquid water (more dense)', 14, 165);
}

function drawWater() {
  ctx.clearRect(0, 0, cv.width, cv.height);
  ctx.fillStyle = '#dbeafe';
  ctx.beginPath();
  ctx.roundRect(0, 0, cv.width, cv.height, 10);
  ctx.fill();

  var positions = [];
  for (var i = 0; i < 80; i++) {
    positions.push({
      x: 30 + Math.random() * (cv.width - 60),
      y: 20 + Math.random() * (cv.height - 40),
      a: Math.random() * Math.PI * 2
    });
  }
  positions.forEach(function(p) {
    drawMolecule(p.x, p.y, p.a, '#2563eb');
  });

  ctx.fillStyle = '#1e3a5f';
  ctx.font = '500 12px sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('Liquid water: same molecules, more tightly packed', 14, cv.height - 10);
}

function render() {
  if (mode === 'ice') drawIce();
  else drawWater();
  cap.textContent = captions[mode];
}

btnIce.onclick = function() {
  mode = 'ice';
  btnIce.className = 'active';
  btnWater.className = '';
  render();
};
btnWater.onclick = function() {
  mode = 'water';
  btnWater.className = 'active';
  btnIce.className = '';
  render();
};
render();
console.log('Ice floats because its molecules arrange in a less dense lattice than liquid water.');`,
      outputHeight: 420,
    },

    // ── 2. The burning question ───────────────────────────────────────────────
    {
      type: 'js',
      instruction: `Why does wood burn but gold doesn't?

You could say "gold doesn't react with oxygen" and that would be technically correct. But it just pushes the question back: why does wood react with oxygen but gold doesn't?

The answer lives in the electrons of each atom. Atoms are mostly empty space with a tiny nucleus at the centre, surrounded by electrons arranged in shells. The outermost electrons — the ones on the edge of the atom — determine almost everything about how that atom behaves chemically.

Carbon atoms (the main component of wood) have outer electrons that are loosely held and ready to form new bonds with oxygen. When you add heat to start the process, the carbon-oxygen reaction releases enough energy to sustain itself. That is fire.

Gold atoms have their outer electrons in an unusual configuration that makes them remarkably reluctant to bond with anything. The same heat that ignites wood leaves gold perfectly unchanged.

Every chemical reaction — rusting, burning, cooking, digestion — is fundamentally about electrons on the outsides of atoms either grabbing or releasing each other.

The cell below lets you explore the outer electrons of carbon vs gold.`,
      html: `<div class="scene">
  <div class="pair">
    <div class="atom-card" id="carbon-card">
      <div class="atom-name">Carbon</div>
      <div class="atom-symbol">C</div>
      <canvas id="c-cv" width="180" height="180"></canvas>
      <div class="atom-verdict burns">Burns readily</div>
      <div class="atom-detail">4 outer electrons — eager to bond with oxygen</div>
    </div>
    <div class="atom-card" id="gold-card">
      <div class="atom-name">Gold</div>
      <div class="atom-symbol">Au</div>
      <canvas id="g-cv" width="180" height="180"></canvas>
      <div class="atom-verdict stable">Does not burn</div>
      <div class="atom-detail">1 outer electron — unusually stable, unreactive</div>
    </div>
  </div>
  <div class="key-idea">The outer electrons of an atom determine its chemical personality.</div>
</div>`,
      css: `body{margin:0;padding:16px;background:transparent;font-family:sans-serif}
.scene{display:flex;flex-direction:column;gap:14px}
.pair{display:grid;grid-template-columns:1fr 1fr;gap:12px}
.atom-card{border:1px solid var(--color-border-tertiary,#e2e8f0);border-radius:12px;padding:14px;display:flex;flex-direction:column;align-items:center;gap:6px;background:var(--color-background-secondary,#f8fafc)}
.atom-name{font-size:11px;color:var(--color-text-secondary,#64748b);text-transform:uppercase;letter-spacing:.08em}
.atom-symbol{font-size:28px;font-weight:500;color:var(--color-text-primary,#1e293b);font-family:monospace;line-height:1}
canvas{display:block;border-radius:8px}
.atom-verdict{font-size:12px;font-weight:500;padding:4px 10px;border-radius:6px}
.burns{background:#fef3c7;color:#92400e}
.stable{background:#d1fae5;color:#065f46}
.atom-detail{font-size:11px;color:var(--color-text-secondary,#64748b);text-align:center;line-height:1.5}
.key-idea{background:var(--color-background-info,#eff6ff);border-left:3px solid var(--color-text-info,#3b82f6);padding:10px 14px;border-radius:0 8px 8px 0;font-size:13px;color:var(--color-text-info,#1d4ed8);line-height:1.6}`,
      startCode: `function drawAtom(cvId, shells, nucleusColor, electronColor, label) {
  var cv = document.getElementById(cvId);
  var ctx = cv.getContext('2d');
  var cx = 90, cy = 90;
  ctx.clearRect(0, 0, 180, 180);

  // Nucleus
  ctx.beginPath();
  ctx.arc(cx, cy, 14, 0, Math.PI * 2);
  ctx.fillStyle = nucleusColor;
  ctx.fill();
  ctx.fillStyle = 'white';
  ctx.font = '500 11px monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(label, cx, cy);

  // Shells and electrons
  var radii = [32, 52, 68, 80];
  shells.forEach(function(count, i) {
    var r = radii[i];
    // Shell ring
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(148,163,184,0.3)';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Electrons on this shell
    for (var e = 0; e < count; e++) {
      var angle = (e / count) * Math.PI * 2 - Math.PI / 2;
      var ex = cx + r * Math.cos(angle);
      var ey = cy + r * Math.sin(angle);
      ctx.beginPath();
      ctx.arc(ex, ey, 4, 0, Math.PI * 2);
      ctx.fillStyle = electronColor;
      ctx.fill();
    }
  });

  // Outer electron highlight for last shell
  var lastCount = shells[shells.length - 1];
  var lastR = radii[shells.length - 1];
  for (var e2 = 0; e2 < lastCount; e2++) {
    var a = (e2 / lastCount) * Math.PI * 2 - Math.PI / 2;
    var ox = cx + lastR * Math.cos(a);
    var oy = cy + lastR * Math.sin(a);
    ctx.beginPath();
    ctx.arc(ox, oy, 5, 0, Math.PI * 2);
    ctx.strokeStyle = electronColor;
    ctx.lineWidth = 2;
    ctx.stroke();
  }
}

// Carbon: shells [2, 4] — 4 outer electrons
drawAtom('c-cv', [2, 4], '#374151', '#f59e0b', 'C');
// Gold: shells [2, 8, 18, 32, 18, 1] — simplified to show key shells
drawAtom('g-cv', [2, 8, 1], '#92400e', '#10b981', 'Au');
console.log('Outer electrons determine chemical behaviour. Carbon: 4 outer. Gold: 1 outer (unusually stable).');`,
      outputHeight: 400,
    },

    // ── 3. The salt question ──────────────────────────────────────────────────
    {
      type: 'js',
      instruction: `Why does salt dissolve in water but oil doesn't?

This one is particularly striking. If you drop a grain of salt into water, it vanishes in seconds. The solid crystal structure disintegrates completely into the liquid, as if it was never there. But if you pour oil into water and shake vigorously, the moment you stop, the two liquids separate back out perfectly. You could shake a jar of oil and water for a year and never get them to mix permanently.

Salt and oil are both perfectly ordinary substances. Water is the same water in both cases. So why the total difference?

The answer is polarity. A water molecule has a slight electrical imbalance — one end is slightly negative, one end slightly positive. Salt is made of charged particles (ions). Charged things attract polar things, so water pulls the salt ions apart and surrounds them. It *wants* to interact with the salt.

Oil molecules are nonpolar — electrically symmetrical, no charged regions anywhere. Water molecules have no reason to interact with them and simply exclude them. The oil molecules cluster together away from the water.

Chemists summarise this as: "like dissolves like." Polar dissolves polar. Nonpolar dissolves nonpolar. These four words explain thousands of real-world observations.`,
      html: `<div class="scene">
  <div class="demo-pair">
    <div class="demo">
      <div class="demo-label">Salt + water</div>
      <canvas id="salt-cv" width="240" height="200"></canvas>
      <div class="demo-result dissolves">Dissolves ✓</div>
      <div class="demo-reason">Charged ions attract polar water molecules</div>
    </div>
    <div class="demo">
      <div class="demo-label">Oil + water</div>
      <canvas id="oil-cv" width="240" height="200"></canvas>
      <div class="demo-result separates">Separates ✗</div>
      <div class="demo-reason">Nonpolar oil has nothing to attract polar water</div>
    </div>
  </div>
  <div class="rule">"Like dissolves like" — polar substances dissolve in polar solvents. Nonpolar in nonpolar.</div>
</div>`,
      css: `body{margin:0;padding:16px;background:transparent;font-family:sans-serif}
.scene{display:flex;flex-direction:column;gap:14px}
.demo-pair{display:grid;grid-template-columns:1fr 1fr;gap:12px}
.demo{border:1px solid var(--color-border-tertiary,#e2e8f0);border-radius:12px;padding:12px;display:flex;flex-direction:column;align-items:center;gap:7px;background:var(--color-background-secondary,#f8fafc)}
.demo-label{font-size:12px;font-weight:500;color:var(--color-text-primary,#1e293b)}
canvas{border-radius:8px;display:block}
.demo-result{font-size:12px;font-weight:500;padding:3px 10px;border-radius:6px}
.dissolves{background:#d1fae5;color:#065f46}
.separates{background:#fee2e2;color:#991b1b}
.demo-reason{font-size:11px;color:var(--color-text-secondary,#64748b);text-align:center;line-height:1.5}
.rule{background:var(--color-background-secondary,#f8fafc);border-left:3px solid var(--color-border-secondary,#94a3b8);padding:10px 14px;border-radius:0 8px 8px 0;font-size:13px;color:var(--color-text-primary,#1e293b);line-height:1.6;font-style:italic}`,
      startCode: `function drawSaltWater(cvId) {
  var cv = document.getElementById(cvId);
  var ctx = cv.getContext('2d');
  ctx.clearRect(0, 0, 240, 200);
  // Water background
  ctx.fillStyle = '#dbeafe';
  ctx.fillRect(0, 0, 240, 200);

  // Water molecules (polar — small bent shape)
  for (var i = 0; i < 28; i++) {
    var x = 15 + (i % 7) * 32;
    var y = 20 + Math.floor(i / 7) * 50 + (i % 2) * 10;
    ctx.fillStyle = '#3b82f6';
    ctx.beginPath(); ctx.arc(x, y, 5, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#93c5fd';
    ctx.beginPath(); ctx.arc(x - 7, y + 6, 3, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(x + 7, y + 6, 3, 0, Math.PI * 2); ctx.fill();
  }
  // Salt ions — distributed throughout
  var ions = [{x:60,y:40,c:'#f97316',s:'Na⁺'},{x:150,y:70,c:'#8b5cf6',s:'Cl⁻'},{x:90,y:120,c:'#f97316',s:'Na⁺'},{x:180,y:40,c:'#8b5cf6',s:'Cl⁻'},{x:40,y:160,c:'#f97316',s:'Na⁺'},{x:200,y:150,c:'#8b5cf6',s:'Cl⁻'}];
  ions.forEach(function(ion) {
    ctx.beginPath(); ctx.arc(ion.x, ion.y, 9, 0, Math.PI * 2);
    ctx.fillStyle = ion.c; ctx.fill();
    ctx.fillStyle = 'white'; ctx.font = '9px monospace'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(ion.s, ion.x, ion.y);
  });
}

function drawOilWater(cvId) {
  var cv = document.getElementById(cvId);
  var ctx = cv.getContext('2d');
  ctx.clearRect(0, 0, 240, 200);
  // Oil layer top
  ctx.fillStyle = '#fef9c3';
  ctx.fillRect(0, 0, 240, 95);
  // Water layer bottom
  ctx.fillStyle = '#dbeafe';
  ctx.fillRect(0, 100, 240, 100);
  // Interface line
  ctx.strokeStyle = 'rgba(148,163,184,0.5)'; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.moveTo(0, 98); ctx.lineTo(240, 98); ctx.stroke();

  // Oil molecules (nonpolar chains) in top
  for (var i = 0; i < 12; i++) {
    var x = 20 + (i % 6) * 35;
    var y = 20 + Math.floor(i / 6) * 40;
    ctx.strokeStyle = '#b45309'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + 24, y); ctx.stroke();
    for (var j = 0; j < 4; j++) {
      ctx.fillStyle = '#fbbf24';
      ctx.beginPath(); ctx.arc(x + j * 8, y, 4, 0, Math.PI * 2); ctx.fill();
    }
  }
  // Water molecules in bottom
  for (var k = 0; k < 18; k++) {
    var wx = 15 + (k % 6) * 36;
    var wy = 115 + Math.floor(k / 6) * 28;
    ctx.fillStyle = '#3b82f6';
    ctx.beginPath(); ctx.arc(wx, wy, 5, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#93c5fd';
    ctx.beginPath(); ctx.arc(wx - 7, wy + 6, 3, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(wx + 7, wy + 6, 3, 0, Math.PI * 2); ctx.fill();
  }
  ctx.fillStyle = '#92400e'; ctx.font = '500 11px sans-serif'; ctx.textAlign = 'center';
  ctx.fillText('Oil (nonpolar)', 120, 88);
  ctx.fillStyle = '#1d4ed8';
  ctx.fillText('Water (polar)', 120, 195);
}

drawSaltWater('salt-cv');
drawOilWater('oil-cv');
console.log('"Like dissolves like" — polarity determines what mixes with what.');`,
      outputHeight: 420,
    },

    // ── 4. What chemistry actually is ────────────────────────────────────────
    {
      type: 'js',
      instruction: `Every question we have looked at — why ice floats, why wood burns, why salt dissolves — has the same structure of explanation.

There is a visible, everyday phenomenon. And beneath it, at a scale far too small to see, something specific is happening with atoms and electrons that completely determines what we observe.

Chemistry is the study of matter — what it is made of, how it behaves, and how it changes. But more precisely, chemistry is the bridge between the invisible atomic world and the visible world you live in.

When you understand that bridge, you stop seeing the physical world as a collection of arbitrary facts and start seeing it as a set of inevitable consequences of atomic behaviour.

The goal of this course is to build that understanding, one layer at a time.

The map below shows the territory we will cover. Every topic is a piece of the same story.`,
      html: `<div class="map-wrap">
  <div class="map-title">The shape of this course</div>
  <div class="chapters">
    <div class="chapter ch1">
      <div class="ch-label">Chapter 1</div>
      <div class="ch-name">The invisible world</div>
      <div class="ch-topics">Atoms · Electrons · Elements · The periodic table</div>
    </div>
    <div class="arrow-down">↓</div>
    <div class="chapter ch2">
      <div class="ch-label">Chapter 2</div>
      <div class="ch-name">Why atoms bond</div>
      <div class="ch-topics">Ionic bonds · Covalent bonds · Molecular geometry · Water</div>
    </div>
    <div class="arrow-down">↓</div>
    <div class="chapter ch3">
      <div class="ch-label">Chapter 3</div>
      <div class="ch-name">Matter in bulk</div>
      <div class="ch-topics">States of matter · Intermolecular forces · Solutions</div>
    </div>
    <div class="arrow-down">↓</div>
    <div class="chapter ch4">
      <div class="ch-label">Chapter 4</div>
      <div class="ch-name">Chemical reactions</div>
      <div class="ch-topics">Bonds breaking and forming · Energy · Acids and bases</div>
    </div>
  </div>
  <div class="thread">One thread runs through all of it: <em>electrons on the outsides of atoms</em></div>
</div>`,
      css: `body{margin:0;padding:16px;background:transparent;font-family:sans-serif}
.map-wrap{display:flex;flex-direction:column;gap:10px}
.map-title{font-size:13px;font-weight:500;color:var(--color-text-secondary,#64748b);text-transform:uppercase;letter-spacing:.08em}
.chapters{display:flex;flex-direction:column;gap:4px}
.chapter{border-radius:10px;padding:12px 16px;border:1px solid var(--color-border-tertiary,#e2e8f0)}
.ch-label{font-size:10px;text-transform:uppercase;letter-spacing:.1em;margin-bottom:2px}
.ch-name{font-size:15px;font-weight:500;color:var(--color-text-primary,#1e293b);margin-bottom:4px}
.ch-topics{font-size:12px;color:var(--color-text-secondary,#64748b)}
.ch1{background:#f0fdf4;border-color:#86efac}.ch1 .ch-label{color:#15803d}
.ch2{background:#eff6ff;border-color:#93c5fd}.ch2 .ch-label{color:#1d4ed8}
.ch3{background:#faf5ff;border-color:#c4b5fd}.ch3 .ch-label{color:#7c3aed}
.ch4{background:#fff7ed;border-color:#fdba74}.ch4 .ch-label{color:#c2410c}
.arrow-down{text-align:center;font-size:18px;color:var(--color-text-secondary,#94a3b8);line-height:1}
.thread{background:var(--color-background-secondary,#f8fafc);border:1px solid var(--color-border-tertiary,#e2e8f0);padding:12px 16px;border-radius:10px;font-size:13px;color:var(--color-text-primary,#1e293b);line-height:1.6}
.thread em{font-style:normal;font-weight:500;color:var(--color-text-info,#2563eb)}`,
      startCode: `console.log('Chemistry: the bridge between the invisible atomic world and the world you can see.');`,
      outputHeight: 480,
    },

    // ── Before challenges ─────────────────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `### Before the challenges

These questions are not testing memorisation. They are testing whether you understood the *reasoning* in each slide.

If you are unsure about an answer, go back and re-read the relevant slide before answering. The goal is not to guess — it is to understand well enough that the answer feels obvious.

There are no formulas to recall here. Just four ideas:
1. Ice floats because its molecular structure creates open space, making it less dense than liquid water
2. Burning requires electrons that are available to bond with oxygen — carbon has them, gold doesn't
3. Polar substances dissolve in polar solvents, nonpolar in nonpolar ("like dissolves like")
4. Chemistry explains the visible world by describing what is happening at the atomic scale`,
    },

    // ── Challenge 1 ───────────────────────────────────────────────────────────
    {
      type: 'challenge',
      instruction: 'Challenge 1 — The consequence of ice sinking. If water were like most substances and became denser when it froze (so ice sank), what would happen to lakes in winter? Change the answer variable to the letter of the correct consequence.',
      html: `<div class="chal"><div id="res">Choose A, B, or C.</div></div>`,
      css: `body{margin:0;padding:16px;background:transparent;font-family:sans-serif}
.chal{display:grid;place-items:center;min-height:80px}
#res{padding:12px 18px;border:1px solid var(--color-border-tertiary,#e2e8f0);border-radius:10px;text-align:center;font-size:13px;color:var(--color-text-primary,#1e293b);max-width:440px;line-height:1.6}`,
      startCode: `// A — Lakes would freeze from the top down, with a layer of ice insulating the liquid water below
// B — Lakes would freeze from the bottom up, eventually becoming solid all the way through
// C — Lakes would not freeze at all, because denser ice would displace too much water

// The correct answer is B. If ice sank, cold water at the surface would freeze, sink,
// and more surface water would freeze and sink — until the entire lake was solid.
// The ice floating that we have now acts as an insulating lid, protecting liquid water below.

const answer = '?'; // change to 'A', 'B', or 'C'

const correct = answer === 'B';
const messages = {
  A: 'Not quite. That describes what actually happens now — ice forms on top and insulates the water below. The question asks about what would happen if ice sank instead.',
  B: 'Correct. Ice sinking means the surface keeps freezing, ice keeps sinking, until the whole lake is solid. Life in cold-climate lakes survives winter only because ice floats.',
  C: 'Not quite. If ice were denser than water, it would still form — it would just sink to the bottom. The lake would eventually freeze completely.'
};
const el = document.getElementById('res');
el.textContent = answer === '?' ? 'Change answer to A, B, or C above.' : (messages[answer] || 'Choose A, B, or C.');
el.style.borderColor = answer === '?' ? 'var(--color-border-tertiary)' : correct ? window.__theme.ok.border : window.__theme.err.border;
el.style.color = answer === '?' ? 'var(--color-text-primary)' : correct ? window.__theme.ok.color : window.__theme.err.color;
el.style.background = answer === '?' ? 'transparent' : correct ? window.__theme.ok.bg : window.__theme.err.bg;
console.log('Answer:', answer, '| Correct:', correct);`,
      solutionCode: `const answer = 'B';
const correct = true;
document.getElementById('res').textContent = 'Correct. Ice sinking means the surface keeps freezing, ice keeps sinking, until the whole lake is solid. Life in cold-climate lakes survives winter only because ice floats.';
document.getElementById('res').style.borderColor = window.__theme.ok.border;
document.getElementById('res').style.color = window.__theme.ok.color;
document.getElementById('res').style.background = window.__theme.ok.bg;`,
      check: (code) => /answer\s*=\s*['"]B['"]/.test(code),
      successMessage: "Correct. This is why complex aquatic ecosystems can survive polar winters. Ice is one of nature's most important insulators.",
      failMessage: "Ice sinking means continuous freezing from the surface down — each layer of ice sinks, exposing new surface water to freeze. The lake becomes solid.",
      outputHeight: 180,
    },

    // ── Challenge 2 ───────────────────────────────────────────────────────────
    {
      type: 'challenge',
      instruction: "Challenge 2 — Like dissolves like. You have four substances: sugar, vegetable oil, salt, and wax. Water is polar. Which two will dissolve in water? Change dissolved to an array containing the correct two.",
      html: `<div class="chal"><div id="res2">Set dissolved to the two that dissolve in water.</div></div>`,
      css: `body{margin:0;padding:16px;background:transparent;font-family:sans-serif}
.chal{display:grid;place-items:center;min-height:80px}
#res2{padding:12px 18px;border:1px solid var(--color-border-tertiary,#e2e8f0);border-radius:10px;text-align:center;font-size:13px;color:var(--color-text-primary,#1e293b);max-width:440px;line-height:1.6}`,
      startCode: `// Substances: 'sugar', 'vegetable oil', 'salt', 'wax'
// Water is polar.
// Sugar is polar (has many -OH groups). Salt is ionic (charged ions).
// Vegetable oil is nonpolar. Wax is nonpolar.
// Polar and ionic dissolve in polar water. Nonpolar does not.

const dissolved = ['?', '?']; // replace with the two correct substances

const correct_set = new Set(['sugar', 'salt']);
const your_set = new Set(dissolved);
const correct = correct_set.size === your_set.size &&
  [...correct_set].every(x => your_set.has(x));

const el = document.getElementById('res2');
if (dissolved.includes('?')) {
  el.textContent = 'Replace the question marks with two substance names.';
} else if (correct) {
  el.textContent = 'Correct! Sugar (polar, -OH groups) and salt (ionic, charged particles) both interact with polar water molecules. Oil and wax are nonpolar — water excludes them.';
  el.style.borderColor = window.__theme.ok.border; el.style.color = window.__theme.ok.color; el.style.background = window.__theme.ok.bg;
} else {
  el.textContent = 'Not quite. Apply the rule: polar and ionic dissolve in polar water. Which of the four substances are polar or ionic?';
  el.style.borderColor = window.__theme.err.border; el.style.color = window.__theme.err.color; el.style.background = window.__theme.err.bg;
}`,
      solutionCode: `const dissolved = ['sugar', 'salt'];
document.getElementById('res2').textContent = 'Correct! Sugar (polar) and salt (ionic) both dissolve in polar water. Oil and wax are nonpolar — water excludes them.';
document.getElementById('res2').style.borderColor = window.__theme.ok.border;
document.getElementById('res2').style.color = window.__theme.ok.color;
document.getElementById('res2').style.background = window.__theme.ok.bg;`,
      check: (code) => {
        const lower = code.toLowerCase();
        return lower.includes("'sugar'") && lower.includes("'salt'") &&
               !lower.includes("'vegetable oil'") && !lower.includes("'wax'");
      },
      successMessage: "Correct. Sugar and salt are both compatible with polar water — sugar through its polar -OH groups, salt through its ionic charges. Oil and wax are nonpolar and are excluded.",
      failMessage: "Apply 'like dissolves like'. Water is polar. Sugar has polar -OH groups. Salt has charged ions. Oil and wax are nonpolar chains with no charged regions.",
      outputHeight: 180,
    },

    // ── Challenge 3 ───────────────────────────────────────────────────────────
    {
      type: 'challenge',
      instruction: "Challenge 3 — Synthesis. Write one sentence inside console.log that completes this thought: Chemistry explains the visible world by... Use the ideas from this lesson, not a memorised definition.",
      html: `<div class="chal"><div id="res3">Write your sentence above, then run.</div></div>`,
      css: `body{margin:0;padding:16px;background:transparent;font-family:sans-serif}
.chal{display:grid;place-items:center;min-height:80px}
#res3{padding:12px 18px;border:1px solid var(--color-border-tertiary,#e2e8f0);border-radius:10px;text-align:center;font-size:13px;color:var(--color-text-primary,#1e293b);max-width:440px;line-height:1.6}`,
      startCode: `// Complete the thought in your own words.
// Your sentence should use at least two of: atom, electron, bond, polar, molecule

console.log('Chemistry explains the visible world by ...');`,
      solutionCode: `console.log('Chemistry explains the visible world by describing what atoms and their electrons are doing at a scale too small to see — and showing how those invisible interactions determine everything observable.');
document.getElementById('res3').textContent = 'Well put. The bridge from invisible to visible is exactly what chemistry is.';
document.getElementById('res3').style.borderColor = window.__theme.ok.border;
document.getElementById('res3').style.color = window.__theme.ok.color;
document.getElementById('res3').style.background = window.__theme.ok.bg;`,
      check: (code) => {
        const lower = code.toLowerCase();
        const hasLog = lower.includes('console.log');
        const hasTerm = ['atom', 'electron', 'bond', 'polar', 'molecule'].filter(t => lower.includes(t)).length >= 2;
        const notDefault = !lower.includes('chemistry explains the visible world by ...');
        return hasLog && hasTerm && notDefault;
      },
      successMessage: "Lesson 1.0 complete. You have seen the pattern: a visible phenomenon, an invisible explanation. That pattern repeats across all of chemistry.",
      failMessage: "Your sentence must use at least two of these terms: atom, electron, bond, polar, molecule. Replace the '...' with your own words.",
      outputHeight: 180,
    },

  ],
};

export default {
  id: 'chem-1-0-why-chemistry',
  slug: 'why-chemistry',
  chapter: 'chem1',
  order: 0,
  title: 'Why Chemistry?',
  subtitle: 'Every question about the physical world is a chemistry question.',
  tags: ['chemistry', 'foundations', 'matter', 'atoms', 'phenomena'],

  hook: {
    question: 'Why does ice float, wood burn, and salt dissolve — but oil doesn\'t?',
    realWorldContext:
      'These are not trivial questions. They are the questions chemistry was built to answer. This lesson builds the motivation before building the model.',
    previewVisualizationId: 'JSNotebook',
  },

  intuition: {
    prose: [
      'Chemistry explains the visible world by describing what is happening at a scale too small to see.',
      'Every observable phenomenon — ice floating, fire, dissolution — is a consequence of specific atomic and molecular behaviour.',
    ],
    callouts: [
      {
        type: 'important',
        title: 'The core pattern',
        body: 'Visible phenomenon → invisible atomic explanation. This pattern repeats in every lesson.',
      },
    ],
    visualizations: [
      {
        id: 'JSNotebook',
        title: 'Why Chemistry: Interactive Introduction',
        props: {
          lesson: LESSON_CHEM_1_0,
        },
      },
    ],
  },

  math: { prose: [], callouts: [], visualizations: [] },
  rigor: { prose: [], callouts: [], visualizations: [] },
  examples: [],
  challenges: [],

  mentalModel: [
    'Chemistry bridges the invisible atomic world and the visible phenomena we observe.',
    'Ice floats because its molecular lattice is less dense than liquid water — a structural consequence, not a coincidence.',
    'Burning is electrons reacting with oxygen — atoms with available outer electrons react, others do not.',
    '"Like dissolves like" — polar dissolves in polar, nonpolar in nonpolar.',
    'All chemical behaviour ultimately comes down to electrons on the outsides of atoms.',
  ],

  checkpoints: ['read-intuition'],
  quiz: [],
};
