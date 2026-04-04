// ─────────────────────────────────────────────────────────────────────────────
// Chemistry · Chapter 1 · Lesson 1
// What Is an Atom?
//
// Design principle: The atom is not a given — it was a discovery, and a
// controversial one. Start with the historical problem (why does matter
// behave in fixed ratios?), then build the atom as the only explanation
// that works. The student should feel the atom as a necessary idea, not
// an arbitrary fact to memorise.
// ─────────────────────────────────────────────────────────────────────────────

const LESSON_CHEM_1_1 = {
  title: 'What Is an Atom?',
  subtitle: 'The particle that explains why matter behaves the way it does.',
  sequential: true,

  cells: [

    // ── 0. Opening ────────────────────────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `### The strangest thing about matter

Take two grams of hydrogen gas and sixteen grams of oxygen gas. Ignite them. You get eighteen grams of water. Every time. No more, no less.

Take four grams of hydrogen and thirty-two grams of oxygen. Ignite them. You still get eighteen grams of water — plus sixteen grams of leftover oxygen. The extra oxygen just sits there unused.

This is bizarre if you think about it carefully. Why should hydrogen and oxygen combine in exactly those proportions? Why not a little more hydrogen, a little less oxygen? Why is it always the same fixed ratio, no matter how much you start with?

For most of human history, nobody had a satisfying answer. Then, in the early 1800s, a schoolteacher in Manchester named John Dalton proposed something radical: **matter is made of indivisible particles**. He called them atoms, from the Greek word for "uncuttable."

If atoms are real, then fixed ratios make perfect sense. You cannot have half an atom. Reactions combine whole atoms, in whole-number ratios, which is exactly what the experiments showed.

The atom was not discovered by looking at one. It was discovered by taking the experimental patterns seriously and asking: what kind of world would produce these patterns?`,
    },

    // ── 1. The fixed-ratio puzzle ─────────────────────────────────────────────
    {
      type: 'js',
      instruction: `Before Dalton, the best explanation for why substances combine in fixed ratios was essentially "that's just how it works." Dalton's insight was that this is not a brute fact — it is a consequence of something deeper.

If matter comes in discrete, indivisible units, then combinations of matter must also come in discrete units. You can combine one hydrogen atom with one oxygen atom, or two hydrogens with one oxygen, but you cannot combine one-and-a-half hydrogens with anything.

The animation below shows Dalton's key experiment. Water always forms when hydrogen and oxygen combine in a 2:1 ratio of atoms. Change the amounts — you get the same water molecules, just with leftover atoms.

This was the first real evidence that atoms exist: not from seeing them (nobody could), but from counting the ratios in which substances combine.`,
      html: `<div class="scene">
  <div class="header">
    <div class="exp-label">Dalton's fixed-ratio experiment</div>
    <div class="controls-row">
      <label class="ctrl-label">Hydrogen atoms: <span id="h-count">4</span></label>
      <input type="range" id="h-slider" min="1" max="10" value="4">
      <label class="ctrl-label">Oxygen atoms: <span id="o-count">4</span></label>
      <input type="range" id="o-slider" min="1" max="10" value="4">
    </div>
  </div>
  <canvas id="ratio-cv" width="560" height="220"></canvas>
  <div class="result-row">
    <div class="result-box" id="water-box">Water molecules: <span id="water-n">0</span></div>
    <div class="result-box leftover" id="leftover-box">Leftover: <span id="leftover-txt">—</span></div>
  </div>
  <div class="insight" id="insight-txt"></div>
</div>`,
      css: `body{margin:0;padding:14px;background:transparent;font-family:sans-serif}
.scene{display:flex;flex-direction:column;gap:10px}
.header{display:flex;flex-direction:column;gap:8px}
.exp-label{font-size:12px;font-weight:500;color:var(--color-text-secondary,#64748b);text-transform:uppercase;letter-spacing:.08em}
.controls-row{display:flex;flex-wrap:wrap;gap:12px;align-items:center}
.ctrl-label{font-size:12px;color:var(--color-text-primary,#1e293b);display:flex;align-items:center;gap:6px}
input[type=range]{width:100px}
canvas{border-radius:10px;display:block;width:100%}
.result-row{display:grid;grid-template-columns:1fr 1fr;gap:10px}
.result-box{padding:10px 14px;border-radius:8px;border:1px solid var(--color-border-tertiary,#e2e8f0);font-size:13px;color:var(--color-text-primary,#1e293b);background:var(--color-background-secondary,#f8fafc)}
.result-box span{font-weight:500}
.leftover{border-color:var(--color-border-secondary,#fca5a5);background:var(--color-background-secondary,#fff7ed)}
.insight{font-size:12px;color:var(--color-text-secondary,#64748b);line-height:1.65;padding:8px 12px;border-left:2px solid var(--color-border-secondary,#94a3b8);border-radius:0 6px 6px 0}`,
      startCode: `var cv = document.getElementById('ratio-cv');
var ctx = cv.getContext('2d');
var hSlider = document.getElementById('h-slider');
var oSlider = document.getElementById('o-slider');

function draw(H, O) {
  ctx.clearRect(0, 0, cv.width, cv.height);

  var water = Math.min(Math.floor(H / 2), O);
  var usedH = water * 2;
  var usedO = water;
  var leftH = H - usedH;
  var leftO = O - usedO;

  document.getElementById('h-count').textContent = H;
  document.getElementById('o-count').textContent = O;
  document.getElementById('water-n').textContent = water;

  var leftoverStr = '';
  if (leftH > 0) leftoverStr += leftH + ' H';
  if (leftH > 0 && leftO > 0) leftoverStr += ', ';
  if (leftO > 0) leftoverStr += leftO + ' O';
  if (!leftoverStr) leftoverStr = 'none';
  document.getElementById('leftover-txt').textContent = leftoverStr;

  var insight = '';
  if (H === usedH && O === usedO) {
    insight = 'Perfect ratio: every atom is used. H:O = 2:1 by atom count.';
  } else if (leftH > 0) {
    insight = 'Excess hydrogen. Oxygen runs out first — it is the limiting reagent. The leftover H atoms have nothing to bond with.';
  } else {
    insight = 'Excess oxygen. Hydrogen runs out first — it is the limiting reagent. The leftover O atoms have nothing to bond with.';
  }
  document.getElementById('insight-txt').textContent = insight;

  // Draw reactant atoms
  var pad = 20;
  var atomR = 10;

  // H atoms
  for (var i = 0; i < H; i++) {
    var used = i < usedH;
    var x = pad + i * 26;
    var y = 30;
    ctx.beginPath();
    ctx.arc(x, y, atomR, 0, Math.PI * 2);
    ctx.fillStyle = used ? '#60a5fa' : '#cbd5e1';
    ctx.fill();
    ctx.fillStyle = used ? '#1e40af' : '#64748b';
    ctx.font = '500 9px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('H', x, y);
  }
  ctx.fillStyle = '#94a3b8';
  ctx.font = '11px sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('Hydrogen atoms', pad, 52);

  // O atoms
  for (var j = 0; j < O; j++) {
    var usedO2 = j < usedO;
    var ox = pad + j * 30;
    var oy = 80;
    ctx.beginPath();
    ctx.arc(ox, oy, atomR + 2, 0, Math.PI * 2);
    ctx.fillStyle = usedO2 ? '#f87171' : '#cbd5e1';
    ctx.fill();
    ctx.fillStyle = usedO2 ? '#7f1d1d' : '#64748b';
    ctx.font = '500 9px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('O', ox, oy);
  }
  ctx.fillStyle = '#94a3b8';
  ctx.font = '11px sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('Oxygen atoms', pad, 106);

  // Arrow
  ctx.fillStyle = '#94a3b8';
  ctx.font = '18px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('→', cv.width / 2, 125);

  // Water molecules
  for (var w = 0; w < water; w++) {
    var wx = pad + w * 52;
    var wy = 160;
    // O
    ctx.beginPath();
    ctx.arc(wx + 10, wy, 11, 0, Math.PI * 2);
    ctx.fillStyle = '#ef4444';
    ctx.fill();
    ctx.fillStyle = 'white';
    ctx.font = '500 8px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('O', wx + 10, wy);
    // H left
    ctx.beginPath();
    ctx.arc(wx, wy + 12, 7, 0, Math.PI * 2);
    ctx.fillStyle = '#60a5fa';
    ctx.fill();
    ctx.fillStyle = 'white';
    ctx.font = '500 7px monospace';
    ctx.fillText('H', wx, wy + 12);
    // H right
    ctx.beginPath();
    ctx.arc(wx + 20, wy + 12, 7, 0, Math.PI * 2);
    ctx.fillStyle = '#60a5fa';
    ctx.fill();
    ctx.fillStyle = 'white';
    ctx.fillText('H', wx + 20, wy + 12);
  }
  if (water > 0) {
    ctx.fillStyle = '#94a3b8';
    ctx.font = '11px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('Water molecules (H\u2082O)', pad, 200);
  }
}

function update() {
  draw(parseInt(hSlider.value), parseInt(oSlider.value));
}
hSlider.oninput = update;
oSlider.oninput = update;
update();
console.log('Fixed ratios arise naturally if matter comes in discrete, indivisible units.');`,
      outputHeight: 480,
    },

    // ── 2. What an atom actually is ───────────────────────────────────────────
    {
      type: 'js',
      instruction: `So what is an atom?

Dalton imagined it as a solid, indivisible sphere — like a tiny billiard ball. That picture was good enough to explain the ratio experiments, but it was wrong in almost every other detail.

We now know that atoms are not solid. They are almost entirely empty space. The mass is concentrated in a tiny nucleus at the centre — so small that if the atom were the size of a football stadium, the nucleus would be a marble on the pitch. Surrounding this nucleus is a diffuse cloud of electrons.

This might seem like a minor correction, but it changes everything. An atom that is mostly empty space is an atom that can interact with other atoms in complex ways. The electrons on the outside of one atom can interact with the electrons on the outside of another. That interaction is chemistry.

The interactive below shows the scale relationship between the nucleus and the electron cloud. The numbers are accurate — the atom really is this empty.`,
      html: `<div class="scene">
  <div class="scale-intro">Scale of a hydrogen atom — drag the slider to reveal</div>
  <div class="slider-row">
    <span class="sl-label">Nucleus</span>
    <input type="range" id="zoom-slider" min="0" max="100" value="0" style="flex:1">
    <span class="sl-label">Full atom</span>
  </div>
  <canvas id="scale-cv" width="560" height="300"></canvas>
  <div class="fact-row">
    <div class="fact-card">
      <div class="fact-num">99.9999%</div>
      <div class="fact-desc">of an atom's volume is empty space</div>
    </div>
    <div class="fact-card">
      <div class="fact-num">99.97%</div>
      <div class="fact-desc">of an atom's mass is in the nucleus</div>
    </div>
    <div class="fact-card">
      <div class="fact-num">100,000×</div>
      <div class="fact-desc">the atom is wider than its nucleus</div>
    </div>
  </div>
  <div class="analogy">If an atom were the size of a football stadium, the nucleus would be a marble on the pitch. The electrons would be gnats somewhere in the stands.</div>
</div>`,
      css: `body{margin:0;padding:14px;background:transparent;font-family:sans-serif}
.scene{display:flex;flex-direction:column;gap:12px}
.scale-intro{font-size:12px;font-weight:500;color:var(--color-text-secondary,#64748b);text-transform:uppercase;letter-spacing:.08em}
.slider-row{display:flex;align-items:center;gap:10px}
.sl-label{font-size:11px;color:var(--color-text-secondary,#64748b)}
canvas{border-radius:10px;display:block;width:100%}
.fact-row{display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px}
.fact-card{border:1px solid var(--color-border-tertiary,#e2e8f0);border-radius:8px;padding:10px 12px;background:var(--color-background-secondary,#f8fafc);text-align:center}
.fact-num{font-size:16px;font-weight:500;color:var(--color-text-primary,#1e293b)}
.fact-desc{font-size:11px;color:var(--color-text-secondary,#64748b);margin-top:3px;line-height:1.4}
.analogy{background:var(--color-background-secondary,#f8fafc);border-left:3px solid var(--color-border-secondary,#94a3b8);padding:10px 14px;border-radius:0 8px 8px 0;font-size:13px;color:var(--color-text-primary,#1e293b);line-height:1.65;font-style:italic}`,
      startCode: `var cv = document.getElementById('scale-cv');
var ctx = cv.getContext('2d');
var slider = document.getElementById('zoom-slider');

function draw(t) {
  ctx.clearRect(0, 0, cv.width, cv.height);
  var cx = cv.width / 2, cy = cv.height / 2;

  // Electron cloud radius: grows with t
  var cloudR = 10 + t * 1.3;

  // Draw electron cloud
  if (t > 10) {
    var alpha = Math.min((t - 10) / 40, 0.7);
    var gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, cloudR);
    gradient.addColorStop(0, 'rgba(147,197,253,' + alpha + ')');
    gradient.addColorStop(0.6, 'rgba(96,165,250,' + (alpha * 0.4) + ')');
    gradient.addColorStop(1, 'rgba(59,130,246,0)');
    ctx.beginPath();
    ctx.arc(cx, cy, cloudR, 0, Math.PI * 2);
    ctx.fillStyle = gradient;
    ctx.fill();

    // Dashed boundary
    ctx.beginPath();
    ctx.arc(cx, cy, cloudR, 0, Math.PI * 2);
    ctx.setLineDash([5, 4]);
    ctx.strokeStyle = 'rgba(96,165,250,0.4)';
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.setLineDash([]);
  }

  // Nucleus — always visible but tiny relative to full atom
  var nucleusR = t < 5 ? 8 + t * 8 : 12;
  ctx.beginPath();
  ctx.arc(cx, cy, nucleusR, 0, Math.PI * 2);
  ctx.fillStyle = '#f97316';
  ctx.fill();

  // Labels
  ctx.fillStyle = '#1e293b';
  ctx.font = '500 12px sans-serif';
  ctx.textAlign = 'center';

  if (t < 30) {
    ctx.fillText('Nucleus', cx, cy + nucleusR + 18);
    ctx.font = '11px sans-serif';
    ctx.fillStyle = '#64748b';
    ctx.fillText('Almost all the mass. Incredibly dense.', cx, cy + nucleusR + 34);
  }

  if (t > 50) {
    var labelY = cy - cloudR - 12;
    if (labelY < 14) labelY = cy + cloudR + 18;
    ctx.fillStyle = '#2563eb';
    ctx.font = '500 12px sans-serif';
    ctx.fillText('Electron cloud', cx, labelY);
    ctx.font = '11px sans-serif';
    ctx.fillStyle = '#64748b';
    ctx.fillText('Almost no mass. Almost all the volume.', cx, labelY + 16);
  }

  // Scale indicator
  if (t > 5) {
    var ratio = Math.round(t * 1000);
    ctx.fillStyle = '#94a3b8';
    ctx.font = '10px monospace';
    ctx.textAlign = 'right';
    ctx.fillText('atom / nucleus ratio: ~' + ratio + 'x', cv.width - 12, cv.height - 8);
  }
}

slider.oninput = function() { draw(parseInt(slider.value)); };
draw(0);
console.log('An atom is almost entirely empty space. Its mass is in a tiny nucleus; its chemistry is in the electron cloud.');`,
      outputHeight: 500,
    },

    // ── 3. How we know atoms exist ────────────────────────────────────────────
    {
      type: 'js',
      instruction: `The atom was a theory for most of human history. Nobody had ever seen one. The first direct evidence that atoms were real — not just a useful mathematical fiction — came in 1905, from Albert Einstein.

Einstein was studying Brownian motion: the jittery, random movement of tiny pollen grains suspended in water. The grains moved in a way that nobody could explain. They never stopped. They changed direction constantly. There was no visible reason for it.

Einstein's insight: the pollen grains are being hit by individual water molecules. The collisions are random and countless, but occasionally more hits come from one direction than another, giving the grain a net push. He calculated exactly what the statistics of that motion should look like if atoms were real — and the prediction matched the observations perfectly.

By 1905, the atom had gone from "a useful idea" to "something that must exist."

Today we can actually image individual atoms using techniques like scanning tunnelling microscopy. The picture is the same atom Dalton and Einstein reasoned about — just finally made visible.`,
      html: `<div class="scene">
  <div class="section-label">Brownian motion — pollen grain buffeted by invisible molecules</div>
  <canvas id="brown-cv" width="560" height="240"></canvas>
  <button id="reset-btn">Reset path</button>
  <div class="timeline">
    <div class="tl-item">
      <div class="tl-year">1803</div>
      <div class="tl-event">Dalton proposes atomic theory to explain fixed ratios</div>
    </div>
    <div class="tl-item">
      <div class="tl-year">1827</div>
      <div class="tl-event">Brown observes unexplained jitter in pollen grains (Brownian motion)</div>
    </div>
    <div class="tl-item">
      <div class="tl-year">1897</div>
      <div class="tl-event">Thomson discovers the electron — atoms have internal structure</div>
    </div>
    <div class="tl-item">
      <div class="tl-year">1905</div>
      <div class="tl-event">Einstein calculates Brownian motion from atomic collisions — atoms must be real</div>
    </div>
    <div class="tl-item">
      <div class="tl-year">1981</div>
      <div class="tl-event">IBM images individual atoms with scanning tunnelling microscope</div>
    </div>
  </div>
</div>`,
      css: `body{margin:0;padding:14px;background:transparent;font-family:sans-serif}
.scene{display:flex;flex-direction:column;gap:12px}
.section-label{font-size:12px;font-weight:500;color:var(--color-text-secondary,#64748b);text-transform:uppercase;letter-spacing:.08em}
canvas{border-radius:10px;display:block;width:100%;background:var(--color-background-secondary,#f8fafc)}
button{align-self:flex-start;padding:6px 14px;border-radius:7px;border:1px solid var(--color-border-secondary,#e2e8f0);background:transparent;color:var(--color-text-secondary,#64748b);cursor:pointer;font-size:12px}
.timeline{display:flex;flex-direction:column;gap:0}
.tl-item{display:grid;grid-template-columns:60px 1fr;gap:12px;padding:8px 0;border-bottom:0.5px solid var(--color-border-tertiary,#f1f5f9)}
.tl-item:last-child{border-bottom:none}
.tl-year{font-size:12px;font-weight:500;color:var(--color-text-secondary,#64748b);font-family:monospace;padding-top:1px}
.tl-event{font-size:12px;color:var(--color-text-primary,#1e293b);line-height:1.55}`,
      startCode: `var cv = document.getElementById('brown-cv');
var ctx = cv.getContext('2d');
var cx = cv.width / 2, cy = cv.height / 2;
var px = cx, py = cy;
var path = [{x: cx, y: cy}];
var animId = null;

function drawFrame() {
  ctx.clearRect(0, 0, cv.width, cv.height);

  // Background grid (faint, representing water)
  ctx.strokeStyle = 'rgba(148,163,184,0.12)';
  ctx.lineWidth = 1;
  for (var gx = 0; gx < cv.width; gx += 30) {
    ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, cv.height); ctx.stroke();
  }
  for (var gy = 0; gy < cv.height; gy += 30) {
    ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(cv.width, gy); ctx.stroke();
  }

  // Random water molecule hits (tiny dots flashing)
  for (var m = 0; m < 12; m++) {
    var mx = px + (Math.random() - 0.5) * 80;
    var my = py + (Math.random() - 0.5) * 80;
    ctx.beginPath();
    ctx.arc(mx, my, 1.5, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(96,165,250,0.4)';
    ctx.fill();
  }

  // Draw path
  if (path.length > 1) {
    ctx.beginPath();
    ctx.moveTo(path[0].x, path[0].y);
    for (var i = 1; i < path.length; i++) {
      ctx.lineTo(path[i].x, path[i].y);
    }
    ctx.strokeStyle = 'rgba(251,146,60,0.5)';
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }

  // Pollen grain
  ctx.beginPath();
  ctx.arc(px, py, 9, 0, Math.PI * 2);
  ctx.fillStyle = '#f59e0b';
  ctx.fill();
  ctx.strokeStyle = '#d97706';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Labels
  ctx.fillStyle = '#94a3b8';
  ctx.font = '11px sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('Pollen grain (visible)', px + 14, py - 4);
  ctx.fillStyle = '#93c5fd';
  ctx.fillText('Water molecules (invisible)', cx - 80, cy + 90);

  // Step
  var dx = (Math.random() - 0.5) * 18;
  var dy = (Math.random() - 0.5) * 18;
  px = Math.max(14, Math.min(cv.width - 14, px + dx));
  py = Math.max(14, Math.min(cv.height - 14, py + dy));
  path.push({x: px, y: py});
  if (path.length > 200) path.shift();
}

function animate() {
  drawFrame();
  animId = setTimeout(animate, 80);
}

document.getElementById('reset-btn').onclick = function() {
  px = cx; py = cy; path = [{x: cx, y: cy}];
};
animate();
console.log('Brownian motion: the random jitter of visible particles, caused by collisions with invisible molecules. Einstein proved atoms must be real to explain this.');`,
      outputHeight: 560,
    },

    // ── 4. The atom's size ────────────────────────────────────────────────────
    {
      type: 'js',
      instruction: `One last thing to sit with before we go deeper into atomic structure: the scale of an atom.

The diameter of a hydrogen atom is about 0.1 nanometres. One nanometre is one billionth of a metre. So a hydrogen atom is one ten-billionth of a metre across.

Numbers like that are impossible to intuit directly. So here is a comparison that might help. If you lined up a hundred million hydrogen atoms side by side, they would span about one centimetre — the width of your thumbnail.

A single cell in your body contains roughly ten trillion atoms. The full stop at the end of this sentence contains more atoms than there are stars in the Milky Way.

What is striking about this is not just the smallness. It is the implications. Everything you have ever touched, smelled, tasted, seen — every material object in the universe — is made of these particles. The variety of matter around you is not variety in the particles themselves, but in how they are arranged and how they interact.

The cell below makes the scale concrete.`,
      html: `<div class="scene">
  <div class="section-label">Atom size comparisons</div>
  <canvas id="size-cv" width="560" height="260"></canvas>
  <div class="comparison-list">
    <div class="comp-item">
      <div class="comp-icon thumb"></div>
      <div class="comp-text"><strong>Thumbnail width</strong> — contains about 10⁸ (100 million) atoms side by side</div>
    </div>
    <div class="comp-item">
      <div class="comp-icon cell"></div>
      <div class="comp-text"><strong>Human cell</strong> — contains roughly 10¹³ atoms</div>
    </div>
    <div class="comp-item">
      <div class="comp-icon dot"></div>
      <div class="comp-text"><strong>This full stop (.)</strong> — contains more atoms than stars in the Milky Way (~10¹⁷)</div>
    </div>
  </div>
</div>`,
      css: `body{margin:0;padding:14px;background:transparent;font-family:sans-serif}
.scene{display:flex;flex-direction:column;gap:12px}
.section-label{font-size:12px;font-weight:500;color:var(--color-text-secondary,#64748b);text-transform:uppercase;letter-spacing:.08em}
canvas{border-radius:10px;display:block;width:100%;background:var(--color-background-secondary,#f8fafc)}
.comparison-list{display:flex;flex-direction:column;gap:8px}
.comp-item{display:flex;align-items:flex-start;gap:12px;padding:10px;border:1px solid var(--color-border-tertiary,#e2e8f0);border-radius:8px;background:var(--color-background-secondary,#f8fafc)}
.comp-icon{width:28px;height:28px;border-radius:4px;flex-shrink:0;margin-top:1px}
.thumb{background:#fbbf24;border-radius:6px 6px 12px 12px}
.cell{background:#a3e635;border-radius:50%}
.dot{width:14px;height:14px;background:#475569;border-radius:50%;margin:7px}
.comp-text{font-size:13px;color:var(--color-text-primary,#1e293b);line-height:1.55}
.comp-text strong{font-weight:500}`,
      startCode: `var cv = document.getElementById('size-cv');
var ctx = cv.getContext('2d');

ctx.clearRect(0, 0, cv.width, cv.height);

// Visual scale bar comparing objects
var items = [
  { label: 'Hydrogen atom', size: 0.1, unit: '0.1 nm', color: '#60a5fa', barW: 4 },
  { label: 'Water molecule (H\u2082O)', size: 0.3, unit: '0.3 nm', color: '#34d399', barW: 12 },
  { label: 'DNA double helix (width)', size: 2, unit: '2 nm', color: '#a78bfa', barW: 24 },
  { label: 'Ribosome', size: 25, unit: '25 nm', color: '#fb923c', barW: 50 },
  { label: 'Bacterium', size: 1000, unit: '~1 \u03bcm', color: '#f43f5e', barW: 100 },
];

var baseY = 24, rowH = 42;
items.forEach(function(item, i) {
  var y = baseY + i * rowH;

  // Bar
  ctx.beginPath();
  ctx.roundRect(14, y, item.barW, 20, 4);
  ctx.fillStyle = item.color;
  ctx.fill();

  // Size label
  ctx.fillStyle = '#64748b';
  ctx.font = '11px monospace';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(item.unit, 14 + item.barW + 8, y + 10);

  // Name
  ctx.fillStyle = '#1e293b';
  ctx.font = '12px sans-serif';
  ctx.fillText(item.label, 14 + item.barW + 8 + 56, y + 10);
});

// Annotation
ctx.fillStyle = '#94a3b8';
ctx.font = '10px sans-serif';
ctx.textAlign = 'left';
ctx.fillText('Bar widths are proportional to relative sizes (log scale)', 14, cv.height - 10);
console.log('A hydrogen atom is 0.1 nm. 100 million side by side span 1 cm. Everything is made of these.');`,
      outputHeight: 500,
    },

    // ── Before challenges ─────────────────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `### Four ideas to carry forward

Before the challenges, make sure you have these four ideas clearly in mind:

**1. Why atoms explain fixed ratios.** If matter comes in discrete units, combinations of matter must come in whole-number ratios. You cannot use half an atom. This is not an assumption — it is the only explanation for what Dalton observed.

**2. What an atom looks like.** A tiny, dense nucleus containing almost all the mass. Surrounding it, a vast cloud of electrons that occupies almost all the volume. The atom is mostly empty space.

**3. How we know atoms exist.** Einstein showed that Brownian motion — the jitter of pollen grains in water — can only be explained if water is made of discrete particles colliding with the grain. The statistical prediction matched the observed jitter. Atoms must be real.

**4. The scale.** One hundred million hydrogen atoms side by side span one centimetre. A full stop contains more atoms than there are stars in the Milky Way. This smallness is why chemistry took so long to figure out — the objects of study are invisible.`,
    },

    // ── Challenge 1 ───────────────────────────────────────────────────────────
    {
      type: 'challenge',
      instruction: 'Challenge 1 — Fixed ratios. You have 6 hydrogen atoms and 2 oxygen atoms. Water needs H₂O — two hydrogen atoms for every one oxygen. How many water molecules can you make, and how many atoms are left over? Set waterMolecules and leftover correctly.',
      html: `<div class="chal"><div id="c1">Set waterMolecules and leftover above.</div></div>`,
      css: `body{margin:0;padding:14px;background:transparent;font-family:sans-serif}
.chal{display:grid;place-items:center;min-height:80px}
#c1{padding:12px 18px;border:1px solid var(--color-border-tertiary);border-radius:10px;text-align:center;font-size:13px;color:var(--color-text-primary);max-width:440px;line-height:1.65}`,
      startCode: `// H = 6, O = 2. Each water molecule needs 2H + 1O.
// Work through it: how many molecules before you run out of something?

const H = 6;
const O = 2;

const waterMolecules = 0;   // change this
const leftover = '?';       // change to a string like '2 H' or '1 O' or 'none'

// Test
const expectedWater = Math.min(Math.floor(H / 2), O);
const usedH = expectedWater * 2;
const usedO = expectedWater;
const leftH = H - usedH;
const leftO = O - usedO;
const expectedLeftover = leftH > 0 ? leftH + ' H' : leftO > 0 ? leftO + ' O' : 'none';

const correct = waterMolecules === expectedWater && leftover === expectedLeftover;

const el = document.getElementById('c1');
if (waterMolecules === 0 && leftover === '?') {
  el.textContent = 'Set both variables. Water needs 2H + 1O per molecule.';
} else if (correct) {
  el.textContent = 'Correct! 2 water molecules use 4H + 2O. The remaining 2H atoms have no oxygen to bond with.';
  el.style.borderColor = window.__theme.ok.border; el.style.color = window.__theme.ok.color; el.style.background = window.__theme.ok.bg;
} else {
  el.textContent = 'Not quite. You have 6H and 2O. Each water needs 2H and 1O. What runs out first?';
  el.style.borderColor = window.__theme.err.border; el.style.color = window.__theme.err.color; el.style.background = window.__theme.err.bg;
}
console.log('Water molecules:', waterMolecules, '| Leftover:', leftover);`,
      solutionCode: `const H = 6; const O = 2;
const waterMolecules = 2;
const leftover = '2 H';
const el = document.getElementById('c1');
el.textContent = 'Correct! 2 water molecules use 4H + 2O. The remaining 2H atoms have no oxygen to bond with.';
el.style.borderColor = window.__theme.ok.border; el.style.color = window.__theme.ok.color; el.style.background = window.__theme.ok.bg;`,
      check: (code) => /waterMolecules\s*=\s*2[^0-9]/.test(code) && /leftover\s*=\s*['"]2 H['"]/.test(code),
      successMessage: 'Correct. Oxygen runs out first — it is the limiting reagent. This kind of counting is fundamental to all of chemistry.',
      failMessage: 'Work through it: 1 water needs 2H + 1O. With 2 oxygens, you can make at most 2 water molecules, using 4H. That leaves 2H with nothing to bond with.',
      outputHeight: 180,
    },

    // ── Challenge 2 ───────────────────────────────────────────────────────────
    {
      type: 'challenge',
      instruction: 'Challenge 2 — Atomic structure. Three statements about atoms — some true, some false. Change each to true or false.',
      html: `<div class="chal"><div id="c2">Set all three variables above.</div></div>`,
      css: `body{margin:0;padding:14px;background:transparent;font-family:sans-serif}
.chal{display:grid;place-items:center;min-height:80px}
#c2{padding:12px 18px;border:1px solid var(--color-border-tertiary);border-radius:10px;text-align:center;font-size:13px;color:var(--color-text-primary);max-width:480px;line-height:1.65}`,
      startCode: `// Statement A: Most of an atom's mass is in the electron cloud.
// Statement B: An atom is mostly empty space.
// Statement C: Dalton thought atoms had an internal structure (nucleus + electrons).

const statementA = '?';  // true or false
const statementB = '?';  // true or false
const statementC = '?';  // true or false

const correct = statementA === false && statementB === true && statementC === false;

const el = document.getElementById('c2');
if (statementA === '?' || statementB === '?' || statementC === '?') {
  el.textContent = 'Replace each ? with true or false (not a string — the actual boolean values).';
} else if (correct) {
  el.textContent = 'All three correct. A: mass is in the nucleus, not the electron cloud. B: atoms are ~99.9999% empty space. C: Dalton imagined atoms as solid, indivisible spheres — the nucleus was discovered much later.';
  el.style.borderColor = window.__theme.ok.border; el.style.color = window.__theme.ok.color; el.style.background = window.__theme.ok.bg;
} else {
  var feedback = [];
  if (statementA !== false) feedback.push('A is false: almost all mass is in the tiny nucleus, not the electron cloud');
  if (statementB !== true) feedback.push('B is true: the atom is over 99.9999% empty space');
  if (statementC !== false) feedback.push('C is false: Dalton had no idea about internal structure — he imagined a solid sphere');
  el.textContent = feedback.join('. ') + '.';
  el.style.borderColor = window.__theme.err.border; el.style.color = window.__theme.err.color; el.style.background = window.__theme.err.bg;
}`,
      solutionCode: `const statementA = false;
const statementB = true;
const statementC = false;
const el = document.getElementById('c2');
el.textContent = 'All three correct. Mass is in the nucleus. Atoms are mostly empty space. Dalton imagined solid spheres — internal structure came much later.';
el.style.borderColor = window.__theme.ok.border; el.style.color = window.__theme.ok.color; el.style.background = window.__theme.ok.bg;`,
      check: (code) => /statementA\s*=\s*false/.test(code) && /statementB\s*=\s*true/.test(code) && /statementC\s*=\s*false/.test(code),
      successMessage: 'Correct on all three. The internal structure of the atom was a 20th-century discovery — Dalton had no idea. He just needed "indivisible particle" to explain the ratios.',
      failMessage: 'Review: most mass is in the tiny nucleus (not the cloud). The atom is mostly empty space. Dalton had no concept of internal structure — that came a century later.',
      outputHeight: 180,
    },

    // ── Challenge 3 ───────────────────────────────────────────────────────────
    {
      type: 'challenge',
      instruction: "Challenge 3 — Evidence for atoms. Einstein explained Brownian motion by assuming atoms are real. What specifically did he calculate that matched the experiments? Change the answer to 'A', 'B', or 'C'.",
      html: `<div class="chal"><div id="c3">Change answer to A, B, or C.</div></div>`,
      css: `body{margin:0;padding:14px;background:transparent;font-family:sans-serif}
.chal{display:grid;place-items:center;min-height:80px}
#c3{padding:12px 18px;border:1px solid var(--color-border-tertiary);border-radius:10px;text-align:center;font-size:13px;color:var(--color-text-primary);max-width:480px;line-height:1.65}`,
      startCode: `// A — He calculated the colour of the pollen grains, which matched experimental observations
// B — He calculated the statistical pattern of the jitter (how far grains move over time),
//     which matched observations only if water consists of discrete molecules
// C — He directly calculated the size of water molecules from their weight

const answer = '?';

const messages = {
  A: 'Not quite. Colour is unrelated to atomic theory. Einstein calculated the movement pattern, not optical properties.',
  B: 'Correct. Einstein calculated the expected statistical pattern of random jitter if water molecules are real and discrete. The prediction matched the observed Brownian motion exactly — this was the first compelling quantitative evidence for atoms.',
  C: 'Close but not quite. He could infer information about molecular size from his equations, but the key test was whether the statistical pattern of movement matched — and it did.'
};

const el = document.getElementById('c3');
const correct = answer === 'B';
if (answer === '?') {
  el.textContent = 'A, B, or C?';
} else {
  el.textContent = messages[answer];
  el.style.borderColor = correct ? window.__theme.ok.border : window.__theme.err.border;
  el.style.color = correct ? window.__theme.ok.color : window.__theme.err.color;
  el.style.background = correct ? window.__theme.ok.bg : window.__theme.err.bg;
}`,
      solutionCode: `const answer = 'B';
const el = document.getElementById('c3');
el.textContent = 'Correct. Einstein calculated the expected statistical pattern of random jitter if water molecules are real and discrete. The prediction matched exactly — the first compelling quantitative proof that atoms exist.';
el.style.borderColor = window.__theme.ok.border; el.style.color = window.__theme.ok.color; el.style.background = window.__theme.ok.bg;`,
      check: (code) => /answer\s*=\s*['"]B['"]/.test(code),
      successMessage: "Correct. The power of this is that Einstein calculated what must happen IF atoms exist, then the experiment confirmed it. This is the scientific method: theory makes a specific, testable prediction.",
      failMessage: "Einstein's contribution was calculating the statistical pattern of Brownian motion from atomic collision theory. The match between prediction and observation was the proof.",
      outputHeight: 180,
    },

  ],
};

export default {
  id: 'chem-1-1-what-is-an-atom',
  slug: 'what-is-an-atom',
  chapter: 'chem1',
  order: 1,
  title: 'What Is an Atom?',
  subtitle: 'The particle that explains why matter behaves the way it does.',
  tags: ['chemistry', 'atom', 'dalton', 'nucleus', 'electron', 'brownian-motion', 'scale'],

  hook: {
    question: 'Why does water always form from exactly 2 parts hydrogen and 1 part oxygen — never 2.1 or 1.8?',
    realWorldContext:
      'The answer to this question forced scientists to accept that matter must be made of discrete, indivisible particles. The atom was not discovered by seeing one — it was discovered by taking experimental ratios seriously.',
    previewVisualizationId: 'JSNotebook',
  },

  intuition: {
    prose: [
      'Atoms explain why matter combines in fixed, whole-number ratios — you cannot have half an atom.',
      'An atom is mostly empty space: a tiny dense nucleus containing almost all the mass, surrounded by a vast electron cloud.',
      'We know atoms are real because Einstein calculated exactly what Brownian motion should look like if water is made of discrete particles — and the prediction matched.',
    ],
    callouts: [
      {
        type: 'important',
        title: 'The atom as a necessary idea',
        body: 'Dalton did not assume atoms. He reasoned: the only model of matter that explains fixed combination ratios is discrete, indivisible particles. The atom was the only explanation that worked.',
      },
    ],
    visualizations: [
      {
        id: 'JSNotebook',
        title: 'What Is an Atom: Interactive Lesson',
        props: {
          lesson: LESSON_CHEM_1_1,
        },
      },
    ],
  },

  math: { prose: [], callouts: [], visualizations: [] },
  rigor: { prose: [], callouts: [], visualizations: [] },
  examples: [],
  challenges: [],

  mentalModel: [
    'Atoms explain fixed combination ratios: discrete particles can only combine in whole numbers.',
    'Structure: tiny dense nucleus (almost all mass) + vast electron cloud (almost all volume).',
    'An atom is roughly 100,000 times wider than its nucleus — it is mostly empty space.',
    'Einstein proved atoms are real by predicting the statistical pattern of Brownian motion.',
    '100 million hydrogen atoms side by side span 1 cm. Scale matters for intuition.',
  ],

  checkpoints: ['read-intuition'],
  quiz: [],
};
