// Chemistry · Chapter 1 · Lesson 1
// What Is an Atom?
// Updated for ScienceNotebook — challenges use options[] + check(label)

const LESSON_CHEM_1_1 = {
  title: 'What Is an Atom?',
  subtitle: 'The particle that explains why matter behaves the way it does.',
  sequential: true,

  cells: [

    {
      type: 'markdown',
      instruction: `### The strangest thing about matter

Take two grams of hydrogen gas and sixteen grams of oxygen gas. Ignite them. You get eighteen grams of water. Every time. No more, no less.

Take four grams of hydrogen and thirty-two grams of oxygen. Ignite them. You still get eighteen grams of water — plus sixteen grams of leftover oxygen. The extra oxygen just sits there unused.

This is bizarre if you think about it carefully. Why should hydrogen and oxygen combine in exactly those proportions? Why not a little more hydrogen, a little less oxygen?

For most of human history, nobody had a satisfying answer. Then, in the early 1800s, a schoolteacher named John Dalton proposed something radical: matter is made of indivisible particles. He called them **atoms**, from the Greek word for "uncuttable."

If atoms are real, fixed ratios make perfect sense. You cannot have half an atom. Reactions combine whole atoms in whole-number ratios — which is exactly what the experiments showed.

The atom was not discovered by looking at one. It was discovered by taking the experimental patterns seriously and asking: what kind of world would produce these patterns?`,
    },

    // ── Visual 1 — Fixed ratio simulator ──────────────────────────────────────
    {
      type: 'js',
      instruction: `If matter comes in discrete, indivisible units, then combinations must come in discrete units too. You can combine 2 hydrogen atoms with 1 oxygen atom, or 4 hydrogens with 2 oxygens, but you cannot combine 1.5 hydrogens with anything.

**Drag the sliders** to change the number of hydrogen and oxygen atoms. Watch how many water molecules form — and what gets left over.`,
      html: `<div class="scene">
  <div class="controls">
    <div class="ctrl"><span class="clabel">Hydrogen atoms: <span id="hn">4</span></span><input type="range" id="hs" min="1" max="10" value="4"></div>
    <div class="ctrl"><span class="clabel">Oxygen atoms: <span id="on">4</span></span><input type="range" id="os" min="1" max="10" value="4"></div>
  </div>
  <canvas id="cv" width="520" height="210"></canvas>
  <div class="results">
    <div class="rbox" id="wbox">Water molecules: <strong id="wn">0</strong></div>
    <div class="rbox lo" id="lbox">Leftover: <strong id="lt">—</strong></div>
  </div>
  <div class="insight" id="ins"></div>
</div>`,
      css: `body{margin:0;padding:14px;font-family:sans-serif}
.scene{display:flex;flex-direction:column;gap:10px}
.controls{display:flex;flex-wrap:wrap;gap:12px}
.ctrl{display:flex;align-items:center;gap:8px}
.clabel{font-size:12px;color:var(--color-text-primary);white-space:nowrap}
input[type=range]{width:100px}
canvas{border-radius:10px;display:block;width:100%}
.results{display:grid;grid-template-columns:1fr 1fr;gap:10px}
.rbox{padding:9px 14px;border-radius:8px;border:1px solid var(--color-border-tertiary);font-size:13px;color:var(--color-text-primary);background:var(--color-background-secondary)}
.lo{border-color:#fdba74;background:var(--color-background-secondary)}
.insight{font-size:12px;color:var(--color-text-secondary);line-height:1.65;padding:8px 12px;border-left:2px solid var(--color-border-secondary);border-radius:0 6px 6px 0}`,
      startCode: `var cv=document.getElementById('cv'),ctx=cv.getContext('2d');
var hs=document.getElementById('hs'),os=document.getElementById('os');
function draw(H,O){
  ctx.clearRect(0,0,cv.width,cv.height);
  var water=Math.min(Math.floor(H/2),O);
  var usedH=water*2,usedO=water,leftH=H-usedH,leftO=O-usedO;
  document.getElementById('hn').textContent=H;document.getElementById('on').textContent=O;
  document.getElementById('wn').textContent=water;
  var lt=leftH>0?leftH+' H':leftO>0?leftO+' O':'none';
  document.getElementById('lt').textContent=lt;
  var insight=H===usedH&&O===usedO?'Perfect ratio — every atom is used. H:O = 2:1.':leftH>0?'Excess hydrogen. Oxygen runs out first. The leftover H atoms have nothing to bond with.':'Excess oxygen. Hydrogen runs out first. The leftover O atoms have nothing to bond with.';
  document.getElementById('ins').textContent=insight;
  var pad=18,r=9;
  for(var i=0;i<H;i++){var used=i<usedH,x=pad+i*26,y=28;ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fillStyle=used?'#60a5fa':'#cbd5e1';ctx.fill();ctx.fillStyle=used?'#1e40af':'#64748b';ctx.font='500 8px monospace';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText('H',x,y);}
  ctx.fillStyle='#94a3b8';ctx.font='11px sans-serif';ctx.textAlign='left';ctx.fillText('Hydrogen atoms',pad,50);
  for(var j=0;j<O;j++){var usedJ=j<usedO,ox=pad+j*30,oy=76;ctx.beginPath();ctx.arc(ox,oy,11,0,Math.PI*2);ctx.fillStyle=usedJ?'#f87171':'#cbd5e1';ctx.fill();ctx.fillStyle=usedJ?'#7f1d1d':'#64748b';ctx.font='500 8px monospace';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText('O',ox,oy);}
  ctx.fillStyle='#94a3b8';ctx.font='11px sans-serif';ctx.textAlign='left';ctx.fillText('Oxygen atoms',pad,100);
  ctx.fillStyle='#94a3b8';ctx.font='18px sans-serif';ctx.textAlign='center';ctx.fillText('→',cv.width/2,118);
  for(var w=0;w<water;w++){var wx=pad+w*52,wy=152;ctx.beginPath();ctx.arc(wx+10,wy,11,0,Math.PI*2);ctx.fillStyle='#ef4444';ctx.fill();ctx.fillStyle='white';ctx.font='500 8px monospace';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText('O',wx+10,wy);ctx.beginPath();ctx.arc(wx,wy+12,7,0,Math.PI*2);ctx.fillStyle='#60a5fa';ctx.fill();ctx.fillStyle='white';ctx.font='500 7px monospace';ctx.fillText('H',wx,wy+12);ctx.beginPath();ctx.arc(wx+20,wy+12,7,0,Math.PI*2);ctx.fillStyle='#60a5fa';ctx.fill();ctx.fillStyle='white';ctx.fillText('H',wx+20,wy+12);}
  if(water>0){ctx.fillStyle='#94a3b8';ctx.font='11px sans-serif';ctx.textAlign='left';ctx.fillText('Water molecules (H\u2082O)',pad,198);}
}
hs.oninput=function(){draw(+hs.value,+os.value)};
os.oninput=function(){draw(+hs.value,+os.value)};
draw(4,4);`,
      outputHeight: 440,
    },

    // ── Visual 2 — Atom scale ──────────────────────────────────────────────────
    {
      type: 'js',
      instruction: `So what is an atom? Dalton imagined a solid, indivisible sphere — like a tiny billiard ball. That was good enough to explain ratios, but wrong in almost every other detail.

We now know atoms are almost entirely **empty space**. The mass is concentrated in a tiny nucleus at the centre. Surrounding it is a vast, diffuse cloud of electrons.

**Drag the slider** from "Nucleus" to "Full atom" to see the scale relationship. The numbers are accurate.`,
      html: `<div class="scene">
  <div class="slider-row"><span class="sl">Nucleus</span><input type="range" id="zs" min="0" max="100" value="0" style="flex:1"><span class="sl">Full atom</span></div>
  <canvas id="cv" width="520" height="280"></canvas>
  <div class="facts">
    <div class="fact"><div class="fn">99.9999%</div><div class="fd">of an atom's volume is empty space</div></div>
    <div class="fact"><div class="fn">99.97%</div><div class="fd">of the mass is in the nucleus</div></div>
    <div class="fact"><div class="fn">100,000×</div><div class="fd">wider than its own nucleus</div></div>
  </div>
  <div class="analogy">If an atom were the size of a football stadium, the nucleus would be a marble on the pitch.</div>
</div>`,
      css: `body{margin:0;padding:14px;font-family:sans-serif}
.scene{display:flex;flex-direction:column;gap:10px}
.slider-row{display:flex;align-items:center;gap:10px}
.sl{font-size:11px;color:var(--color-text-secondary);white-space:nowrap}
canvas{border-radius:10px;display:block;width:100%}
.facts{display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px}
.fact{border:1px solid var(--color-border-tertiary);border-radius:8px;padding:9px 12px;background:var(--color-background-secondary);text-align:center}
.fn{font-size:15px;font-weight:500;color:var(--color-text-primary)}
.fd{font-size:11px;color:var(--color-text-secondary);margin-top:3px;line-height:1.4}
.analogy{background:var(--color-background-secondary);border-left:3px solid var(--color-border-secondary);padding:10px 14px;border-radius:0 8px 8px 0;font-size:13px;color:var(--color-text-primary);line-height:1.65;font-style:italic}`,
      startCode: `var cv=document.getElementById('cv'),ctx=cv.getContext('2d'),zs=document.getElementById('zs');
function draw(t){
  ctx.clearRect(0,0,cv.width,cv.height);
  var cx=cv.width/2,cy=cv.height/2;
  var cloudR=8+t*1.3;
  if(t>10){
    var a=Math.min((t-10)/40,0.65);
    var g=ctx.createRadialGradient(cx,cy,0,cx,cy,cloudR);
    g.addColorStop(0,'rgba(147,197,253,'+a+')');g.addColorStop(0.6,'rgba(96,165,250,'+(a*0.4)+')');g.addColorStop(1,'rgba(59,130,246,0)');
    ctx.beginPath();ctx.arc(cx,cy,cloudR,0,Math.PI*2);ctx.fillStyle=g;ctx.fill();
    ctx.beginPath();ctx.arc(cx,cy,cloudR,0,Math.PI*2);ctx.setLineDash([5,4]);ctx.strokeStyle='rgba(96,165,250,0.35)';ctx.lineWidth=1;ctx.stroke();ctx.setLineDash([]);
  }
  var nr=t<5?8+t*7:11;
  ctx.beginPath();ctx.arc(cx,cy,nr,0,Math.PI*2);ctx.fillStyle='#f97316';ctx.fill();
  ctx.fillStyle='var(--color-text-primary,#1e293b)';ctx.font='500 12px sans-serif';ctx.textAlign='center';
  if(t<30){ctx.fillText('Nucleus',cx,cy+nr+18);ctx.font='11px sans-serif';ctx.fillStyle='var(--color-text-secondary,#64748b)';ctx.fillText('Almost all the mass. Incredibly dense.',cx,cy+nr+33);}
  if(t>50){var ly=cy-cloudR-12;if(ly<14)ly=cy+cloudR+18;ctx.fillStyle='#2563eb';ctx.font='500 12px sans-serif';ctx.fillText('Electron cloud',cx,ly);ctx.font='11px sans-serif';ctx.fillStyle='var(--color-text-secondary,#64748b)';ctx.fillText('Almost no mass. Almost all the volume.',cx,ly+16);}
  if(t>5){ctx.fillStyle='#94a3b8';ctx.font='10px monospace';ctx.textAlign='right';ctx.fillText('atom / nucleus ratio: ~'+Math.round(t*900)+'x',cv.width-10,cv.height-8);}
}
zs.oninput=function(){draw(+zs.value)};draw(0);`,
      outputHeight: 460,
    },

    // ── Visual 3 — Brownian motion ─────────────────────────────────────────────
    {
      type: 'js',
      instruction: `The atom was a theory for most of human history. The first direct evidence it was real — not just a useful fiction — came from Albert Einstein in 1905.

He studied **Brownian motion**: the jittery, random movement of tiny pollen grains suspended in water. The grains moved constantly with no visible cause.

Einstein's insight: the pollen is being buffeted by individual water molecules. He calculated exactly what the statistics of that motion should look like if atoms were real — and the prediction matched observations perfectly.

The timeline below traces how the atom went from "useful idea" to "proven fact."`,
      html: `<div class="scene">
  <div class="slabel">Brownian motion — a pollen grain buffeted by invisible molecules</div>
  <canvas id="cv" width="520" height="220" style="cursor:default"></canvas>
  <button id="rst">Reset path</button>
  <div class="timeline">
    <div class="te"><div class="ty">1803</div><div class="tv">Dalton proposes atomic theory to explain fixed combination ratios</div></div>
    <div class="te"><div class="ty">1827</div><div class="tv">Brown observes unexplained jitter in pollen grains — Brownian motion</div></div>
    <div class="te"><div class="ty">1897</div><div class="tv">Thomson discovers the electron — atoms have internal structure</div></div>
    <div class="te"><div class="ty">1905</div><div class="tv">Einstein calculates Brownian motion from atomic collisions — atoms must be real</div></div>
    <div class="te"><div class="ty">1981</div><div class="tv">IBM images individual atoms with a scanning tunnelling microscope</div></div>
  </div>
</div>`,
      css: `body{margin:0;padding:14px;font-family:sans-serif}
.scene{display:flex;flex-direction:column;gap:10px}
.slabel{font-size:11px;font-weight:500;color:var(--color-text-secondary);text-transform:uppercase;letter-spacing:.08em}
canvas{border-radius:10px;display:block;width:100%;background:var(--color-background-secondary)}
button{align-self:flex-start;padding:5px 14px;border-radius:7px;border:1px solid var(--color-border-secondary);background:transparent;color:var(--color-text-secondary);cursor:pointer;font-size:12px}
.timeline{display:flex;flex-direction:column;gap:0}
.te{display:grid;grid-template-columns:52px 1fr;gap:12px;padding:7px 0;border-bottom:0.5px solid var(--color-border-tertiary)}
.te:last-child{border-bottom:none}
.ty{font-size:12px;font-weight:500;color:var(--color-text-secondary);font-family:monospace}
.tv{font-size:12px;color:var(--color-text-primary);line-height:1.55}`,
      startCode: `var cv=document.getElementById('cv'),ctx=cv.getContext('2d');
var cx=cv.width/2,cy=cv.height/2,px=cx,py=cy,path=[{x:cx,y:cy}],tid=null;
function frame(){
  ctx.clearRect(0,0,cv.width,cv.height);
  ctx.strokeStyle='rgba(148,163,184,0.1)';ctx.lineWidth=1;
  for(var gx=0;gx<cv.width;gx+=28){ctx.beginPath();ctx.moveTo(gx,0);ctx.lineTo(gx,cv.height);ctx.stroke();}
  for(var gy=0;gy<cv.height;gy+=28){ctx.beginPath();ctx.moveTo(0,gy);ctx.lineTo(cv.width,gy);ctx.stroke();}
  for(var m=0;m<10;m++){ctx.beginPath();ctx.arc(px+(Math.random()-.5)*70,py+(Math.random()-.5)*70,1.5,0,Math.PI*2);ctx.fillStyle='rgba(96,165,250,0.35)';ctx.fill();}
  if(path.length>1){ctx.beginPath();ctx.moveTo(path[0].x,path[0].y);for(var i=1;i<path.length;i++)ctx.lineTo(path[i].x,path[i].y);ctx.strokeStyle='rgba(251,146,60,0.5)';ctx.lineWidth=1.5;ctx.stroke();}
  ctx.beginPath();ctx.arc(px,py,9,0,Math.PI*2);ctx.fillStyle='#f59e0b';ctx.fill();ctx.strokeStyle='#d97706';ctx.lineWidth=1.5;ctx.stroke();
  ctx.fillStyle='#94a3b8';ctx.font='11px sans-serif';ctx.textAlign='left';ctx.fillText('Pollen grain (visible)',px+14,py-4);
  ctx.fillStyle='#93c5fd';ctx.fillText('Water molecules (invisible, causing the jitter)',cx-100,cy+95);
  px=Math.max(12,Math.min(cv.width-12,px+(Math.random()-.5)*16));
  py=Math.max(12,Math.min(cv.height-12,py+(Math.random()-.5)*16));
  path.push({x:px,y:py});if(path.length>220)path.shift();
}
tid=setInterval(frame,75);
document.getElementById('rst').onclick=function(){px=cx;py=cy;path=[{x:cx,y:cy}];};`,
      outputHeight: 540,
    },

    // ── Before challenges ─────────────────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `### Check your understanding`,
    },

    // ── Challenge 1 ───────────────────────────────────────────────────────────
    {
      type: 'challenge',
      instruction: `You have **6 hydrogen atoms** and **2 oxygen atoms**. Each water molecule needs 2H + 1O. How many water molecules can you make, and how many atoms are left over?`,
      options: [
        { label: 'A', text: '3 water molecules, with nothing left over.' },
        { label: 'B', text: '2 water molecules, with 2 hydrogen atoms left over.' },
        { label: 'C', text: '2 water molecules, with 1 oxygen atom left over.' },
        { label: 'D', text: '6 water molecules, using all available atoms.' },
      ],
      check: (label) => label === 'B',
      successMessage: 'Correct. 2 oxygen atoms → at most 2 water molecules (each needs 1 O). Those 2 molecules use 4 hydrogen atoms. 6 − 4 = 2 hydrogen atoms left over with nothing to bond with. Oxygen was the limiting factor.',
      failMessage: 'Work through it step by step. Each water needs 1 oxygen. You have 2 oxygens → maximum 2 water molecules. Each of those 2 molecules needs 2 hydrogens → 4 hydrogens used. You started with 6 → 2 left over.',
      html: '',
      css: `body{margin:0;padding:0;font-family:sans-serif}`,
      startCode: '',
      outputHeight: 290,
    },

    // ── Challenge 2 ───────────────────────────────────────────────────────────
    {
      type: 'challenge',
      instruction: `Which of these best describes the structure of an atom?`,
      options: [
        { label: 'A', text: 'A solid, indivisible sphere — like a tiny billiard ball — with mass distributed evenly throughout.' },
        { label: 'B', text: 'A tiny dense nucleus containing almost all the mass, surrounded by a vast cloud of electrons that occupies almost all the volume. The atom is mostly empty space.' },
        { label: 'C', text: 'A dense ball of electrons with a few protons distributed throughout, held together by electrical force.' },
        { label: 'D', text: 'Two equal halves — one containing protons and one containing electrons — separated by a thin membrane.' },
      ],
      check: (label) => label === 'B',
      successMessage: 'Correct. The atom is ~99.9999% empty space. Almost all the mass is in the tiny nucleus. The electron cloud is vast relative to the nucleus — if the atom were a football stadium, the nucleus would be a marble on the pitch.',
      failMessage: 'Option A describes Dalton\'s original model, which was useful for explaining ratios but wrong about structure. The nucleus (discovered in 1911) contains almost all the mass in an incredibly small volume, surrounded by a relatively enormous electron cloud.',
      html: '',
      css: `body{margin:0;padding:0;font-family:sans-serif}`,
      startCode: '',
      outputHeight: 310,
    },

    // ── Challenge 3 ───────────────────────────────────────────────────────────
    {
      type: 'challenge',
      instruction: `How did Einstein's 1905 paper on Brownian motion help prove that atoms are real?`,
      options: [
        { label: 'A', text: 'He used a new microscope to photograph individual atoms for the first time.' },
        { label: 'B', text: 'He calculated the weight of a hydrogen atom by weighing a container of hydrogen gas.' },
        { label: 'C', text: 'He calculated what the statistical pattern of pollen grain movement should look like if water consists of discrete molecules — and the prediction matched observations exactly.' },
        { label: 'D', text: 'He derived the formula E=mc² which mathematically required atoms to exist.' },
      ],
      check: (label) => label === 'C',
      successMessage: 'Correct. Einstein\'s approach was: IF atoms are real discrete particles, THEN Brownian motion must follow a specific statistical pattern. He calculated what that pattern should be. The prediction matched. That match was compelling quantitative evidence that atoms must exist — not just a useful model, but a physical reality.',
      failMessage: 'Einstein\'s contribution was theoretical prediction confirmed by experiment. He calculated the expected statistical behaviour of Brownian motion assuming water is made of discrete molecules — a specific, testable prediction. The fact that observations matched the prediction was the proof. Individual atoms weren\'t imaged until 1981.',
      html: '',
      css: `body{margin:0;padding:0;font-family:sans-serif}`,
      startCode: '',
      outputHeight: 320,
    },

  ],
}

export default {
  id: 'chem-1-1-what-is-an-atom',
  slug: 'what-is-an-atom',
  chapter: 'chem1',
  order: 1,
  title: 'What Is an Atom?',
  subtitle: 'The particle that explains why matter behaves the way it does.',
  tags: ['chemistry', 'atom', 'dalton', 'nucleus', 'electron', 'brownian-motion'],
  hook: {
    question: 'Why does water always form from exactly 2 parts hydrogen and 1 part oxygen?',
    realWorldContext: 'The answer to this question forced scientists to accept that matter must be made of discrete, indivisible particles.',
    previewVisualizationId: 'ScienceNotebook',
  },
  intuition: {
    prose: [
      'Atoms explain why matter combines in fixed, whole-number ratios — you cannot have half an atom.',
      'An atom is mostly empty space: a tiny dense nucleus surrounded by a vast electron cloud.',
      'Einstein proved atoms are real by predicting the exact statistical pattern of Brownian motion.',
    ],
    callouts: [{ type: 'important', title: 'The atom as a necessary idea', body: 'Dalton did not assume atoms. He reasoned: discrete particles are the only model that explains fixed combination ratios.' }],
    visualizations: [{ id: 'ScienceNotebook', title: 'What Is an Atom', props: { lesson: LESSON_CHEM_1_1 } }],
  },
  math: { prose: [], callouts: [], visualizations: [] },
  rigor: { prose: [], callouts: [], visualizations: [] },
  examples: [], challenges: [],
  mentalModel: [
    'Atoms explain fixed combination ratios: discrete particles can only combine in whole numbers.',
    'Structure: tiny dense nucleus (almost all mass) + vast electron cloud (almost all volume).',
    'An atom is ~100,000× wider than its nucleus — it is mostly empty space.',
    'Einstein proved atoms are real by predicting the statistical pattern of Brownian motion.',
  ],
  checkpoints: ['read-intuition'],
  quiz: [],
}

export { LESSON_CHEM_1_1 }
