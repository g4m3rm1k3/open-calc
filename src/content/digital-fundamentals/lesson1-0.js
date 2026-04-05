// Digital Fundamentals · Chapter 1 · Lesson 0
// Analog vs Digital
// ScienceNotebook format — visuals + challenges

export const LESSON_DF_1_0 = {
  title: 'Analog vs Digital',
  subtitle: 'Why the world switched from continuous signals to discrete ones.',
  sequential: true,

  cells: [

    {
      type: 'markdown',
      instruction: `### Two ways to represent information

Every piece of information around you — sound, temperature, light, time — exists as a continuously varying physical quantity. The temperature outside right now is not exactly 23°C or 24°C; it is 23.47°C, or more precisely 23.4712°C, or even more precisely some value with infinite decimal places.

This is **analog**: quantities that vary continuously and can take any value within a range.

A **digital** system deliberately throws away that infinite precision. It takes the continuous world and maps it onto a small set of discrete values. Modern digital electronics use just two: 0 and 1.

That sounds like a loss. It is a loss. So why does almost all modern technology use digital representation? The answer is not about accuracy — it is about something more fundamental. Work through this lesson and the reason will become obvious.`,
    },

    // ── Visual 1 — Analog wave vs Digital signal ──────────────────────────────
    {
      type: 'js',
      instruction: `The most direct way to see the difference is to look at the same information represented both ways.

Below is a sound wave. The **top panel** shows it as an analog signal — a smooth, continuous curve where every tiny variation in air pressure is captured. The **bottom panel** shows it as a digital signal — the same wave sampled at regular intervals and rounded to the nearest step.

**Toggle the sampling resolution** with the slider. Watch what happens at low vs high sample rates.`,
      html: `<div class="scene">
  <div class="ctrl-row">
    <span class="clabel">Samples per cycle: <strong id="sn">8</strong></span>
    <input type="range" id="sr" min="4" max="64" value="8" step="4" style="flex:1">
    <span class="clabel" style="white-space:nowrap">Bit depth: <strong id="bn">3</strong> bits (<strong id="lvls">8</strong> levels)</span>
    <input type="range" id="br" min="1" max="8" value="3" style="width:80px">
  </div>
  <canvas id="cv" width="540" height="320"></canvas>
  <div class="caption" id="cap"></div>
</div>`,
      css: `body{margin:0;padding:12px;font-family:sans-serif}
.scene{display:flex;flex-direction:column;gap:10px}
.ctrl-row{display:flex;align-items:center;gap:10px;flex-wrap:wrap}
.clabel{font-size:12px;color:var(--color-text-primary);white-space:nowrap}
canvas{border-radius:10px;display:block;width:100%}
.caption{font-size:12px;color:var(--color-text-secondary);line-height:1.65;padding:6px 10px;border-left:2px solid var(--color-border-secondary)}`,
      startCode: `var cv=document.getElementById('cv'),ctx=cv.getContext('2d');
var H=cv.height,W=cv.width,MID=H/4,MID2=3*H/4,AMP=H/4-20;
var sr=document.getElementById('sr'),br=document.getElementById('br');
function draw(){
  var samples=+sr.value, bits=+br.value, levels=Math.pow(2,bits);
  document.getElementById('sn').textContent=samples;
  document.getElementById('bn').textContent=bits;
  document.getElementById('lvls').textContent=levels;
  ctx.clearRect(0,0,W,H);
  // divider
  ctx.strokeStyle='rgba(148,163,184,0.25)';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(0,H/2);ctx.lineTo(W,H/2);ctx.stroke();
  // labels
  ctx.fillStyle='#94a3b8';ctx.font='500 11px sans-serif';ctx.textAlign='left';
  ctx.fillText('ANALOG (continuous)',10,18);ctx.fillText('DIGITAL (sampled & quantised)',10,H/2+18);
  // analog curve
  ctx.beginPath();ctx.strokeStyle='#3b82f6';ctx.lineWidth=2.5;
  for(var x=0;x<W;x++){var t=x/W*2*Math.PI*2,y=MID-AMP*Math.sin(t);if(x===0)ctx.moveTo(x,y);else ctx.lineTo(x,y);}
  ctx.stroke();
  // digital — sample & quantise
  var pts=[];
  for(var i=0;i<samples;i++){var sx=i*W/samples,st=sx/W*2*Math.PI*2,sv=Math.sin(st),qv=Math.round((sv+1)/2*(levels-1))/(levels-1)*2-1,qy=MID2-AMP*qv;pts.push({x:sx,y:qy,w:W/samples});}
  // draw step function
  ctx.fillStyle='rgba(16,185,129,0.15)';ctx.strokeStyle='#10b981';ctx.lineWidth=2;
  for(var p=0;p<pts.length;p++){
    var px=pts[p].x,py=pts[p].y,pw=pts[p].w;
    ctx.beginPath();ctx.rect(px,py,pw,MID2+AMP-py+10);ctx.fill();
    ctx.beginPath();ctx.moveTo(px,py);ctx.lineTo(px+pw,py);ctx.stroke();
    if(p<pts.length-1){ctx.beginPath();ctx.moveTo(px+pw,py);ctx.lineTo(px+pw,pts[p+1].y);ctx.stroke();}
    ctx.beginPath();ctx.arc(px+pw/2,py,3,0,Math.PI*2);ctx.fillStyle='#10b981';ctx.fill();
  }
  // quantisation level grid
  ctx.strokeStyle='rgba(148,163,184,0.12)';ctx.lineWidth=0.75;ctx.setLineDash([3,4]);
  for(var l=0;l<levels;l++){var ly=MID2+AMP-l*(2*AMP/(levels-1));ctx.beginPath();ctx.moveTo(0,ly);ctx.lineTo(W,ly);ctx.stroke();}
  ctx.setLineDash([]);
  var accuracy=Math.round((1-1/(levels))*(1-4/samples)*100);
  document.getElementById('cap').textContent='At '+samples+' samples/cycle with '+bits+'-bit depth ('+levels+' levels): ~'+Math.max(0,accuracy)+'% fidelity. CD audio uses 44,100 samples/sec at 16 bits (65,536 levels).';
}
sr.oninput=draw;br.oninput=draw;draw();`,
      outputHeight: 420,
    },

    // ── Visual 2 — Noise immunity: the key advantage ──────────────────────────
    {
      type: 'js',
      instruction: `Here is the real reason digital won. **Noise**.

Every real-world signal picks up random interference — from electromagnetic fields, heat, physical vibrations, imperfect components. On an analog signal, noise directly corrupts the information: you cannot tell which part is signal and which part is noise.

On a digital signal, this is different. Because there are only two valid values (0 and 1), the receiver only needs to ask: "is this closer to 0 or closer to 1?" As long as the noise is not large enough to push a 0 all the way past the decision threshold into 1-territory, the noise has **no effect** on the recovered signal.

**Drag the noise slider** and watch what happens to analog vs digital.`,
      html: `<div class="scene">
  <div class="ctrl-row">
    <span class="clabel">Noise level: <strong id="nl">0%</strong></span>
    <input type="range" id="ns" min="0" max="100" value="0" style="flex:1">
  </div>
  <canvas id="cv" width="540" height="300"></canvas>
  <div class="verdict" id="vd"></div>
</div>`,
      css: `body{margin:0;padding:12px;font-family:sans-serif}
.scene{display:flex;flex-direction:column;gap:10px}
.ctrl-row{display:flex;align-items:center;gap:10px}
.clabel{font-size:12px;color:var(--color-text-primary)}
canvas{border-radius:10px;display:block;width:100%}
.verdict{padding:9px 14px;border-radius:8px;font-size:13px;line-height:1.6;background:var(--color-background-secondary);border:1px solid var(--color-border-tertiary)}`,
      startCode: `var cv=document.getElementById('cv'),ctx=cv.getContext('2d');
var W=cv.width,H=cv.height,ns=document.getElementById('ns'),BITS=8,PERIOD=80;
function noise(n){return(Math.random()-.5)*2*n;}
function draw(){
  var n=+ns.value/100;
  document.getElementById('nl').textContent=Math.round(n*100)+'%';
  ctx.clearRect(0,0,W,H);
  ctx.strokeStyle='rgba(148,163,184,0.2)';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(0,H/2);ctx.lineTo(W,H/2);ctx.stroke();
  ctx.fillStyle='#94a3b8';ctx.font='500 11px sans-serif';ctx.textAlign='left';
  ctx.fillText('ANALOG',8,16);ctx.fillText('DIGITAL',8,H/2+16);
  var AMP=H/4-24;
  // analog sine + noise
  ctx.beginPath();ctx.strokeStyle='#3b82f6';ctx.lineWidth=1.5;
  for(var x=0;x<W;x++){var t=x/W*4*Math.PI,raw=-Math.cos(t),noisy=raw+noise(n)*1.5,y=H/4-AMP*Math.max(-1,Math.min(1,noisy));if(x===0)ctx.moveTo(x,y);else ctx.lineTo(x,y);}
  ctx.stroke();
  // analog error zone
  if(n>0.3){ctx.fillStyle='rgba(239,68,68,0.15)';ctx.fillRect(0,H/4-AMP,W,AMP*2);ctx.fillStyle='#ef4444';ctx.font='500 11px sans-serif';ctx.textAlign='center';ctx.fillText('⚠ Signal corrupted — noise indistinguishable from data',W/2,H/4+AMP-8);}
  // digital — square wave + noise, then thresholded
  var threshold=H*3/4;var THRESH=0;
  ctx.strokeStyle='rgba(148,163,184,0.3)';ctx.lineWidth=0.75;ctx.setLineDash([4,4]);ctx.beginPath();ctx.moveTo(0,threshold-AMP*THRESH);ctx.lineTo(W,threshold-AMP*THRESH);ctx.stroke();ctx.setLineDash([]);
  ctx.fillStyle='#64748b';ctx.font='10px sans-serif';ctx.textAlign='right';ctx.fillText('threshold',W-4,threshold-AMP*THRESH-4);
  // noisy digital
  ctx.beginPath();ctx.strokeStyle='rgba(251,146,60,0.7)';ctx.lineWidth=1.5;
  for(var x2=0;x2<W;x2++){var bit=Math.floor(x2/PERIOD)%2===0?1:-1,nv=bit+noise(n)*1.5,y2=threshold-AMP*Math.max(-1.5,Math.min(1.5,nv));if(x2===0)ctx.moveTo(x2,y2);else ctx.lineTo(x2,y2);}
  ctx.stroke();
  // recovered clean digital
  ctx.beginPath();ctx.strokeStyle='#10b981';ctx.lineWidth=2.5;
  var drawH=H-12,drawL=H/2+12;
  for(var x3=0;x3<W;x3++){var bit3=Math.floor(x3/PERIOD)%2===0,py3=bit3?drawL+8:drawH-8;if(x3===0)ctx.moveTo(x3,py3);var nb=Math.floor((x3+1)/PERIOD)%2===0,ny3=nb?drawL+8:drawH-8;if(Math.floor(x3/PERIOD)!==Math.floor((x3+1)/PERIOD)){ctx.lineTo(x3,py3);ctx.lineTo(x3,ny3);}else ctx.lineTo(x3,py3);}
  ctx.stroke();
  ctx.fillStyle='#10b981';ctx.font='500 10px sans-serif';ctx.textAlign='left';ctx.fillText('RECOVERED (perfect)',8,H-28);
  ctx.fillStyle='rgba(251,146,60,0.8)';ctx.fillText('RECEIVED (with noise)',8,H/2+36);
  var vd=n<0.35?'✓ Clean recovery: noise is below threshold. The digital receiver reads 0s and 1s perfectly despite interference.':n<0.6?'⚠ Borderline: noise is approaching the threshold. A few bits may flip.':'✗ Bit errors occurring: noise has crossed the threshold. Error correction (like in CDs and USB) handles this next.';
  var vc=n<0.35?'#10b981':n<0.6?'#f59e0b':'#ef4444';
  var vdEl=document.getElementById('vd');vdEl.textContent=vd;vdEl.style.borderColor=vc;vdEl.style.color=vc;
}
ns.oninput=draw;draw();`,
      outputHeight: 400,
    },

    // ── Visual 3 — Real-world analog vs digital examples ──────────────────────
    {
      type: 'js',
      instruction: `Analog and digital exist side-by-side everywhere. Understanding the boundary between them explains why certain technologies work the way they do.

The examples below show common pairs: the same information, once analog and once digital. Click any item to see what the transition gained and what was traded away.`,
      html: `<div class="scene">
  <div class="examples" id="ex"></div>
  <div class="detail" id="det">
    <div class="det-title" id="dt-title"></div>
    <div class="det-body" id="dt-body"></div>
    <div class="det-tradeoff" id="dt-trade"></div>
  </div>
</div>`,
      css: `body{margin:0;padding:12px;font-family:sans-serif}
.scene{display:flex;flex-direction:column;gap:12px}
.examples{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}
.ex-card{border:1.5px solid var(--color-border-tertiary);border-radius:10px;padding:12px;cursor:pointer;transition:all .15s;background:var(--color-background-secondary)}
.ex-card:hover,.ex-card.active{border-color:var(--color-text-info,#3b82f6);background:var(--color-background-info,#eff6ff)}
.ex-row{display:flex;align-items:center;justify-content:space-between;margin-bottom:6px}
.ex-label{font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:.08em}
.ex-label.a{color:#f59e0b}.ex-label.d{color:#3b82f6}
.ex-val{font-size:18px}
.ex-arrow{font-size:13px;color:var(--color-text-tertiary)}
.ex-name{font-size:12px;font-weight:500;color:var(--color-text-primary)}
.detail{border:1px solid var(--color-border-tertiary);border-radius:10px;padding:14px;background:var(--color-background-secondary);min-height:60px}
.det-title{font-size:13px;font-weight:600;color:var(--color-text-primary);margin-bottom:6px}
.det-body{font-size:12px;color:var(--color-text-primary);line-height:1.65;margin-bottom:8px}
.det-tradeoff{font-size:11px;color:var(--color-text-secondary);border-top:1px solid var(--color-border-tertiary);padding-top:8px;line-height:1.6}`,
      startCode: `var data=[
  {name:'Audio',aIcon:'📀',dIcon:'💿',aLabel:'Vinyl / Tape',dLabel:'MP3 / AAC',
   body:'A vinyl record is a physical analog of the sound wave — a groove whose shape directly mirrors the pressure variations of the original recording. Play it back and a needle traces the groove, reproducing the wave. Digital audio samples that wave 44,100 times per second and stores 16-bit numbers.',
   trade:'Vinyl: infinite resolution, but degrades with each play and picks up dust/scratches. Digital: fixed resolution, but perfectly copyable with zero degradation and compressible for streaming.'},
  {name:'Temperature',aIcon:'🌡',dIcon:'📊',aLabel:'Mercury thermometer',dLabel:'Digital sensor',
   body:'A mercury thermometer shows temperature as a continuous column height — a physical analog of thermal energy. A digital sensor samples the resistance of a thermistor at intervals and converts it to a number that a display or computer can use.',
   trade:'Analog: direct physical representation, no batteries required. Digital: can log data over time, transmit wirelessly, set alerts, and be read by software.'},
  {name:'Photography',aIcon:'📷',dIcon:'🖼',aLabel:'Film camera',dLabel:'Digital camera',
   body:'Film records light using a continuous chemical reaction — silver halide crystals darken in proportion to light intensity with essentially infinite resolution. A digital sensor is a grid of light-measuring cells (pixels); each one records a single number.',
   trade:'Film: extremely high resolution, organic tonal range. Digital: instant review, unlimited copies, software processing, easy sharing, no darkroom required.'},
  {name:'Clocks',aIcon:'🕰',dIcon:'🔢',aLabel:'Analogue clock',dLabel:'Digital clock',
   body:'An analogue clock shows time as the continuous angular position of hands — at 3:30 the minute hand is exactly halfway between 3 and 4. A digital clock shows time as discrete numbers that jump once per unit.',
   trade:'Analogue: easy to read relative time ("about quarter past"). Digital: unambiguous exact value, essential when talking to computers or setting timers.'},
  {name:'Sound (live)',aIcon:'🎤',dIcon:'🔊',aLabel:'Acoustic instrument',dLabel:'MIDI / DAW',
   body:'An acoustic guitar produces sound by physical string vibration — the air pressure wave is continuous and complex. MIDI converts performance data (note on/off, velocity, timing) to numbers; playback synthesises sound from those numbers.',
   trade:'Acoustic: natural harmonics, touch sensitivity, no technology needed. Digital: perfectly editable, copyable, transposable, and reproducible anywhere.'},
  {name:'Video',aIcon:'🎞',dIcon:'📺',aLabel:'Analogue TV (PAL)',dLabel:'HDTV / H.265',
   body:'PAL television broadcast a continuous varying electrical signal that electron guns directly reproduced on a phosphor screen. Digital video breaks each frame into pixels and each pixel into bit-depth colour values, then compresses with mathematical transforms.',
   trade:'Analogue: simple, robust, no latency. Digital: perfectly sharp at any scale, transmittable over the internet, compressible, copyable without quality loss.'},
];
var active=null;
var exEl=document.getElementById('ex');
data.forEach(function(d,i){
  var card=document.createElement('div');card.className='ex-card';
  card.innerHTML='<div class="ex-row"><span class="ex-label a">Analog</span><span class="ex-arrow">→</span><span class="ex-label d">Digital</span></div><div class="ex-row"><span class="ex-val">'+d.aIcon+'</span><span class="ex-arrow">→</span><span class="ex-val">'+d.dIcon+'</span></div><div class="ex-name">'+d.name+'</div>';
  card.onclick=function(){
    document.querySelectorAll('.ex-card').forEach(function(c){c.classList.remove('active');});
    card.classList.add('active');
    document.getElementById('dt-title').textContent=d.name+': '+d.aLabel+' → '+d.dLabel;
    document.getElementById('dt-body').textContent=d.body;
    document.getElementById('dt-trade').textContent='Trade-offs: '+d.trade;
  };
  exEl.appendChild(card);
});
// auto-click first
exEl.children[0].click();`,
      outputHeight: 400,
    },

    // ── Markdown bridge ────────────────────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `### Why 0 and 1?

Digital systems could use more than two states — a signal could be LOW, MEDIUM, or HIGH (three states, base-3 arithmetic). Early computers actually experimented with this. The reason modern electronics settled on just two states comes down to physics:

- **Reliability**: A transistor switching between fully-off and fully-on is extremely reliable. Distinguishing three or more voltage levels with the same reliability requires tighter manufacturing tolerances and is much more sensitive to temperature and noise.

- **Logic simplicity**: Two-state logic maps directly onto Boolean algebra (AND, OR, NOT), which turns out to be sufficient to compute anything computable. Claude Shannon proved this in 1937. Every calculation your computer makes — from adding numbers to rendering a 3D scene — is binary logic all the way down.

- **Error correction**: With only two values, detecting and correcting transmission errors is mathematically elegant and practical. This is why data sent over Wi-Fi, stored on an SSD, or read from a Blu-Ray disc arrives without errors despite physical imperfections.

The next lesson goes deeper into how binary numbers work. For now, the key insight is: **two states are enough, and two states are maximally reliable**.`,
    },

    // ── Challenges ─────────────────────────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `### Check your understanding`,
    },

    {
      type: 'challenge',
      instruction: `A vinyl record and an MP3 file both store music. Which statement best explains why an MP3 is a digital representation?`,
      options: [
        { label: 'A', text: 'An MP3 is stored on a computer, and all computers are digital.' },
        { label: 'B', text: 'The music is represented as a sequence of discrete numbers (samples taken at fixed intervals) rather than a continuous physical groove.' },
        { label: 'C', text: 'An MP3 is smaller in file size than a vinyl record, so it must be digital.' },
        { label: 'D', text: 'Digital means modern, and MP3 is newer than vinyl.' },
      ],
      check: (label) => label === 'B',
      successMessage: 'Correct. Digital means discrete: the sound wave is sampled at regular intervals (44,100 times per second for CD-quality) and each sample is stored as a number. Vinyl\'s groove is a continuous physical analog of the pressure wave — no sampling, no numbers.',
      failMessage: 'The defining property of digital is discrete representation — the information is broken into a sequence of numbers. Where it is stored (computer, disc, phone) is irrelevant. A vinyl groove is a continuous physical analog; an MP3 is a sequence of 44,100 numbers per second.',
      html: '', css: `body{margin:0;padding:0;font-family:sans-serif}`, startCode: '', outputHeight: 270,
    },

    {
      type: 'challenge',
      instruction: `Digital systems are more noise-resistant than analog systems because:`,
      options: [
        { label: 'A', text: 'Digital signals travel faster through wires, so noise has less time to affect them.' },
        { label: 'B', text: 'Digital signals use higher voltages, which overwhelm any noise.' },
        { label: 'C', text: 'The receiver only needs to decide "is this above or below the threshold?" — as long as noise does not cross the threshold, it has no effect on the recovered value.' },
        { label: 'D', text: 'Digital circuits are made of better materials that do not pick up noise.' },
      ],
      check: (label) => label === 'C',
      successMessage: 'Correct. The key insight is the decision threshold. Noise distorts the signal, but the digital receiver ignores the exact voltage — it just classifies each bit as 0 or 1. Any noise that does not push the signal past the threshold is invisible in the recovered data. This is why you can copy a digital file billions of times with no degradation.',
      failMessage: 'Speed and voltage are irrelevant to noise immunity. The real reason is the threshold decision: because there are only two valid values, the receiver can recover the correct value even when the signal is corrupted by noise — as long as the noise is not large enough to cross the midpoint threshold.',
      html: '', css: `body{margin:0;padding:0;font-family:sans-serif}`, startCode: '', outputHeight: 260,
    },

    {
      type: 'challenge',
      instruction: `A temperature sensor outputs a voltage between 0V and 5V that varies continuously with temperature. A microcontroller reads this with a 10-bit ADC (Analog-to-Digital Converter). How many distinct temperature levels can the microcontroller distinguish?`,
      options: [
        { label: 'A', text: '10 levels — one per bit.' },
        { label: 'B', text: '100 levels — 10 × 10.' },
        { label: 'C', text: '1,024 levels — 2¹⁰.' },
        { label: 'D', text: 'Infinite levels — the ADC is just recording whatever the sensor says.' },
      ],
      check: (label) => label === 'C',
      successMessage: 'Correct. With 10 bits you can represent 2¹⁰ = 1,024 distinct values (0 through 1,023). A 10-bit ADC divides the 0–5V range into 1,024 equal steps, each about 4.9 mV wide. This is the quantisation process — the continuous analog voltage becomes a discrete digital number.',
      failMessage: 'With n bits you represent 2ⁿ distinct values. 2¹⁰ = 1,024. The number of bits determines the resolution: each additional bit exactly doubles the number of distinguishable levels. 1 bit = 2, 8 bit = 256, 10 bit = 1,024, 16 bit = 65,536.',
      html: '', css: `body{margin:0;padding:0;font-family:sans-serif}`, startCode: '', outputHeight: 260,
    },

  ],
}

export default {
  id: 'df-1-0-analog-vs-digital',
  slug: 'analog-vs-digital',
  chapter: 'df.1',
  order: 0,
  title: 'Analog vs Digital',
  subtitle: 'Why the world switched from continuous signals to discrete ones.',
  tags: ['digital', 'analog', 'signals', 'binary', 'noise', 'sampling', 'ADC'],
  hook: {
    question: 'Why do we convert everything — music, photos, temperature — into streams of 0s and 1s?',
    realWorldContext: 'Every digital device you own translates the continuous physical world into discrete numbers before processing it.',
    previewVisualizationId: 'AnalogVsDigital',
  },
  intuition: {
    prose: [
      'Analog = continuous. Digital = discrete. Same information, different representation.',
      'Noise is the key: digital signals can be perfectly recovered even when corrupted, because the receiver only asks "0 or 1?".',
      'Two states win because transistors are maximally reliable fully-off or fully-on, and Boolean algebra computes everything.',
    ],
    callouts: [{ type: 'important', title: 'The core trade-off', body: 'Digital sacrifices infinite precision for perfect reproducibility and noise immunity. In practice, enough bits gives you more precision than you can measure.' }],
    visualizations: [{ id: 'AnalogVsDigital', title: 'Analog vs Digital' }],
  },
  math: { prose: [], callouts: [], visualizations: [] },
  rigor: { prose: [], callouts: [], visualizations: [] },
  examples: [], challenges: [],
  mentalModel: [
    'Analog: continuous, infinite resolution, degrades with noise.',
    'Digital: discrete numbers, fixed resolution, noise-immune up to threshold.',
    'With n bits: 2ⁿ distinct levels. Each extra bit doubles precision.',
    'Two states (binary) win: maximally reliable transistors + complete Boolean logic.',
  ],
  checkpoints: ['read-intuition'],
  quiz: [],
}
