// Digital Fundamentals · Chapter 1 · Lesson 0
// Analog vs Digital — enhanced masterclass version

export const LESSON_DF_1_0 = {
  title: 'Analog vs Digital',
  subtitle: 'Why the world switched from continuous signals to discrete ones.',
  sequential: true,

  cells: [

    // ── Section 1 ──────────────────────────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `### Two Ways to Represent the World

Everything around you — sound, temperature, light, voltage, position — is a continuously varying physical quantity. The temperature outside isn't exactly 23°C or 24°C. It's somewhere in between: 23.47°C, or more precisely 23.4712°C, or with infinite decimal places if you had an infinitely precise thermometer.

This is the **analog world**: quantities that vary continuously, taking any value within a range, with infinite potential precision.

A **digital system** deliberately simplifies this. It maps the continuous world onto a finite set of discrete values. Modern digital electronics use exactly two: 0 and 1. Every piece of information in every computer, phone, or digital sensor you've ever used is ultimately a sequence of these two symbols.

That sounds like a catastrophic loss of information. And in a strict sense, it is — you're throwing away the infinite precision of the real world and replacing it with a coarse approximation. So why does virtually all modern technology choose digital?

The reason isn't precision. It's something more fundamental — and understanding it will change how you think about every digital system you build or use.`,
    },

    // ── Section 2 — The key insight upfront ─────────────────────────────────────
    {
      type: 'markdown',
      instruction: `### The Real Reason: Noise

Every real-world signal picks up random interference. Electromagnetic fields from power lines, thermal noise from resistors, vibrations from the environment, imperfect components — all of these add random variation to your signal. This is **noise**, and it's unavoidable in any physical system.

On an analog signal, noise directly corrupts the information. If you're representing temperature as a voltage and noise adds 0.1V, you have a temperature error. There's no way to separate signal from noise — they're both just voltage.

On a digital signal with two valid values (0 and 1), the receiver only needs to answer one question: "is this closer to 0 or closer to 1?" As long as the noise doesn't push a 0 past the midpoint threshold into 1-territory, **the noise has zero effect on the recovered value**. You get the original information back perfectly.

This is not a small difference. This is the difference between a telephone call that gets noisier every time you pass through an amplifier (analog), and a digital call where every amplifier can regenerate a perfect copy of the original signal. It's the difference between a vinyl record that degrades with every play (analog), and a digital file that can be copied a trillion times with zero degradation.

**The core trade-off:** digital sacrifices infinite analog precision in exchange for perfect noise immunity and perfect reproducibility. In practice, using enough bits gives you more precision than you can measure — so the precision loss is irrelevant, but the noise immunity is transformative.`,
    },

    // ── Visual 1 — Analog wave vs Digital signal ──────────────────────────────
    {
      type: 'js',
      instruction: `### Sampling and Quantization: How Analog Becomes Digital

Converting an analog signal to digital requires two steps:

**Sampling:** measure the signal at regular time intervals. The sampling rate determines how many measurements per second you take. CD audio uses 44,100 samples per second — far more than needed to capture any frequency the human ear can hear.

**Quantization:** round each measurement to the nearest discrete level. With n bits, you have 2ⁿ levels. More bits = finer granularity = closer to the original.

Adjust both sliders. Watch what happens to the digital reconstruction as you change sample rate and bit depth. Find the point where the digital signal becomes indistinguishable from the analog original.`,
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
.clabel{font-size:12px;color:var(--color-text-primary,#1e293b);white-space:nowrap}
canvas{border-radius:10px;display:block;width:100%}
.caption{font-size:12px;color:var(--color-text-secondary,#64748b);line-height:1.65;padding:6px 10px;border-left:2px solid var(--color-border-secondary,#e2e8f0)}`,
      startCode: `var cv=document.getElementById('cv'),ctx=cv.getContext('2d');
var H=cv.height,W=cv.width,MID=H/4,MID2=3*H/4,AMP=H/4-20;
var sr=document.getElementById('sr'),br=document.getElementById('br');
function draw(){
  var samples=+sr.value,bits=+br.value,levels=Math.pow(2,bits);
  document.getElementById('sn').textContent=samples;
  document.getElementById('bn').textContent=bits;
  document.getElementById('lvls').textContent=levels;
  ctx.clearRect(0,0,W,H);
  // divider
  ctx.strokeStyle='rgba(148,163,184,0.25)';ctx.lineWidth=1;
  ctx.beginPath();ctx.moveTo(0,H/2);ctx.lineTo(W,H/2);ctx.stroke();
  // labels
  ctx.fillStyle='#94a3b8';ctx.font='500 11px sans-serif';ctx.textAlign='left';
  ctx.fillText('ANALOG (continuous)',10,18);
  ctx.fillText('DIGITAL (sampled & quantised)',10,H/2+18);
  // analog curve
  ctx.beginPath();ctx.strokeStyle='#3b82f6';ctx.lineWidth=2.5;
  for(var x=0;x<W;x++){var t=x/W*2*Math.PI*2,y=MID-AMP*Math.sin(t);if(x===0)ctx.moveTo(x,y);else ctx.lineTo(x,y);}
  ctx.stroke();
  // digital — sample & quantise
  var pts=[];
  for(var i=0;i<samples;i++){
    var sx=i*W/samples,st=sx/W*2*Math.PI*2,sv=Math.sin(st);
    var qv=Math.round((sv+1)/2*(levels-1))/(levels-1)*2-1;
    pts.push({x:sx,y:MID2-AMP*qv,w:W/samples});
  }
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
  document.getElementById('cap').textContent='At '+samples+' samples/cycle with '+bits+'-bit depth ('+levels+' levels): ~'+Math.max(0,accuracy)+'% fidelity. CD audio: 44,100 samples/sec at 16-bit (65,536 levels). Human hearing threshold: ~20 Hz–20 kHz.';
}
sr.oninput=draw;br.oninput=draw;draw();`,
      outputHeight: 420,
    },

    // ── Section 3 — Nyquist and bit depth intuition ───────────────────────────
    {
      type: 'markdown',
      instruction: `### Two Numbers That Define Digital Quality

Any digital representation of an analog signal is defined by exactly two parameters:

**Sample rate (Hz):** how many measurements per second. The **Nyquist-Shannon sampling theorem** proves that to accurately reconstruct a signal containing frequencies up to f Hz, you need to sample at least 2f times per second. Human hearing tops out at about 20,000 Hz, so CD audio samples at 44,100 Hz — comfortably above the 40,000 Hz minimum. Sample below the Nyquist rate and you get **aliasing**: high frequencies fold back and appear as phantom lower frequencies, distorting the signal.

**Bit depth:** how many bits represent each sample. With n bits, you have 2ⁿ discrete levels. The difference between the actual continuous value and the nearest discrete level is called **quantization error** — it's a form of distortion baked into every digital recording. Each additional bit halves the quantization error and doubles the number of levels:

| Bit depth | Levels | Dynamic range |
|-----------|--------|---------------|
| 8-bit     | 256    | ~48 dB        |
| 16-bit    | 65,536 | ~96 dB        |
| 24-bit    | 16,777,216 | ~144 dB  |

CD audio (16-bit) gives a dynamic range of 96 dB — the ratio between the loudest and quietest sounds it can represent is about 63,000:1. That's far greater than a quiet room vs. a rock concert. The quantization error is inaudible.

The key insight: you don't need infinite precision. You need *enough* precision to exceed the measurement capability of your sensors and the perception capability of your users. Digital systems achieve this with a handful of bits.`,
    },

    // ── Visual 2 — Noise immunity ────────────────────────────────────────────
    {
      type: 'js',
      instruction: `### The Noise Immunity Advantage

Here is the real engineering reason digital systems dominate. Drag the noise slider and watch what happens to analog vs. digital signals under identical noise conditions.

The digital receiver recovers a perfect signal even with significant noise — until the noise exceeds the decision threshold. The analog signal is corrupted immediately and proportionally.`,
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
.clabel{font-size:12px;color:var(--color-text-primary,#1e293b)}
canvas{border-radius:10px;display:block;width:100%}
.verdict{padding:9px 14px;border-radius:8px;font-size:13px;line-height:1.6;background:var(--color-background-secondary,#f8fafc);border:1px solid var(--color-border-tertiary,#e2e8f0)}`,
      startCode: `var cv=document.getElementById('cv'),ctx=cv.getContext('2d');
var W=cv.width,H=cv.height,ns=document.getElementById('ns'),PERIOD=80;
function noise(n){return(Math.random()-.5)*2*n;}
function draw(){
  var n=+ns.value/100;
  document.getElementById('nl').textContent=Math.round(n*100)+'%';
  ctx.clearRect(0,0,W,H);
  ctx.strokeStyle='rgba(148,163,184,0.2)';ctx.lineWidth=1;
  ctx.beginPath();ctx.moveTo(0,H/2);ctx.lineTo(W,H/2);ctx.stroke();
  ctx.fillStyle='#94a3b8';ctx.font='500 11px sans-serif';ctx.textAlign='left';
  ctx.fillText('ANALOG',8,16);ctx.fillText('DIGITAL',8,H/2+16);
  var AMP=H/4-24;
  // analog sine + noise
  ctx.beginPath();ctx.strokeStyle='#3b82f6';ctx.lineWidth=1.5;
  for(var x=0;x<W;x++){
    var t=x/W*4*Math.PI,raw=-Math.cos(t),noisy=raw+noise(n)*1.5;
    var y=H/4-AMP*Math.max(-1,Math.min(1,noisy));
    if(x===0)ctx.moveTo(x,y);else ctx.lineTo(x,y);
  }
  ctx.stroke();
  // analog error zone
  if(n>0.3){
    ctx.fillStyle='rgba(239,68,68,0.15)';ctx.fillRect(0,H/4-AMP,W,AMP*2);
    ctx.fillStyle='#ef4444';ctx.font='500 11px sans-serif';ctx.textAlign='center';
    ctx.fillText('⚠ Signal corrupted — noise indistinguishable from data',W/2,H/4+AMP-8);
  }
  // threshold line
  var threshold=H*3/4;
  ctx.strokeStyle='rgba(148,163,184,0.3)';ctx.lineWidth=0.75;ctx.setLineDash([4,4]);
  ctx.beginPath();ctx.moveTo(0,threshold);ctx.lineTo(W,threshold);ctx.stroke();ctx.setLineDash([]);
  ctx.fillStyle='#64748b';ctx.font='10px sans-serif';ctx.textAlign='right';
  ctx.fillText('threshold (midpoint)',W-4,threshold-4);
  // noisy digital received
  ctx.beginPath();ctx.strokeStyle='rgba(251,146,60,0.7)';ctx.lineWidth=1.5;
  for(var x2=0;x2<W;x2++){
    var bit=Math.floor(x2/PERIOD)%2===0?1:-1;
    var nv=bit+noise(n)*1.5;
    var y2=threshold-AMP*Math.max(-1.5,Math.min(1.5,nv));
    if(x2===0)ctx.moveTo(x2,y2);else ctx.lineTo(x2,y2);
  }
  ctx.stroke();
  // recovered clean digital
  var drawH=H-12,drawL=H/2+12;
  ctx.beginPath();ctx.strokeStyle='#10b981';ctx.lineWidth=2.5;
  for(var x3=0;x3<W;x3++){
    var bit3=Math.floor(x3/PERIOD)%2===0,py3=bit3?drawL+8:drawH-8;
    if(x3===0)ctx.moveTo(x3,py3);
    var nb=Math.floor((x3+1)/PERIOD)%2===0,ny3=nb?drawL+8:drawH-8;
    if(Math.floor(x3/PERIOD)!==Math.floor((x3+1)/PERIOD)){ctx.lineTo(x3,py3);ctx.lineTo(x3,ny3);}
    else ctx.lineTo(x3,py3);
  }
  ctx.stroke();
  ctx.fillStyle='#10b981';ctx.font='500 10px sans-serif';ctx.textAlign='left';
  ctx.fillText('RECOVERED (perfect)',8,H-28);
  ctx.fillStyle='rgba(251,146,60,0.8)';ctx.fillText('RECEIVED (with noise)',8,H/2+36);
  var vd=n<0.35
    ?'✓ Clean recovery: noise is below threshold. Digital receiver reads 0s and 1s perfectly despite interference. This is why digital audio copies never degrade.'
    :n<0.6
    ?'⚠ Borderline: noise is approaching the decision threshold. Occasional bit errors may occur. Error correction codes (used in Wi-Fi, SSDs, and DVDs) detect and fix these.'
    :'✗ Bit errors occurring: noise has crossed the threshold. Error-correcting codes would normally prevent data loss here, but at extreme noise the channel is too degraded.';
  var vc=n<0.35?'#10b981':n<0.6?'#f59e0b':'#ef4444';
  var vdEl=document.getElementById('vd');vdEl.textContent=vd;vdEl.style.borderColor=vc;vdEl.style.color=vc;
}
ns.oninput=draw;draw();`,
      outputHeight: 400,
    },

    // ── Section 4 — Why two states ────────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `### Why Two States? Why Not Three, or Ten?

Digital systems could use more than two states. A ternary system with three states (LOW, MEDIUM, HIGH) would be more information-dense: each "trit" carries log₂(3) ≈ 1.58 bits of information. Some early Soviet computers (Setun, 1958) used balanced ternary. So why did binary win?

**Transistor physics.** A transistor is most reliable in two states: fully off (no current flowing) and fully on (maximum current flowing). These two extremes are stable and robust. Maintaining three or more distinct voltage levels requires tighter manufacturing tolerances and is much more sensitive to temperature variation. Binary maps cleanly to transistor physics.

**Noise margin.** With two states, the decision threshold is at the midpoint. Any noise smaller than half the voltage swing is tolerated. With three states, the gap between adjacent levels is only a third of the voltage swing — a noisier, tighter margin.

**Mathematical completeness.** Shannon proved in 1937 that binary logic (AND, OR, NOT gates) is computationally complete — any computation can be expressed using only these operations. You don't need more states to compute anything. Binary is the simplest complete system.

**Error correction.** Binary error-correcting codes (Hamming codes, Reed-Solomon, LDPC) are mathematically elegant and practically efficient. Extending them to higher bases is possible but more complex.

The result: two states win because they're the simplest system that's computationally complete, maximally reliable with available physics, and best suited for error correction.`,
    },

    // ── Visual 3 — Real-world examples ───────────────────────────────────────
    {
      type: 'js',
      instruction: `### Analog and Digital in the World Around You

The same information can be represented either way. Click each pair to understand what was gained and what was traded in the transition from analog to digital.`,
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
.ex-card{border:1.5px solid var(--color-border-tertiary,#e2e8f0);border-radius:10px;padding:12px;cursor:pointer;transition:all .15s;background:var(--color-background-secondary,#f8fafc)}
.ex-card:hover,.ex-card.active{border-color:var(--color-text-info,#3b82f6);background:var(--color-background-info,#eff6ff)}
.ex-row{display:flex;align-items:center;justify-content:space-between;margin-bottom:6px}
.ex-label{font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:.08em}
.ex-label.a{color:#f59e0b}.ex-label.d{color:#3b82f6}
.ex-val{font-size:18px}
.ex-arrow{font-size:13px;color:var(--color-text-tertiary,#94a3b8)}
.ex-name{font-size:12px;font-weight:500;color:var(--color-text-primary,#1e293b)}
.detail{border:1px solid var(--color-border-tertiary,#e2e8f0);border-radius:10px;padding:14px;background:var(--color-background-secondary,#f8fafc);min-height:60px}
.det-title{font-size:13px;font-weight:600;color:var(--color-text-primary,#1e293b);margin-bottom:6px}
.det-body{font-size:12px;color:var(--color-text-primary,#1e293b);line-height:1.65;margin-bottom:8px}
.det-tradeoff{font-size:11px;color:var(--color-text-secondary,#64748b);border-top:1px solid var(--color-border-tertiary,#e2e8f0);padding-top:8px;line-height:1.6}`,
      startCode: `var data=[
  {name:'Audio',aIcon:'📀',dIcon:'💿',aLabel:'Vinyl / Tape',dLabel:'MP3 / AAC',
   body:'A vinyl record is a physical analog of the sound wave — a groove whose shape directly mirrors pressure variations in the original recording. A needle traces it and reproduces the wave. Digital audio samples that wave 44,100 times per second and stores 16-bit numbers for each sample.',
   trade:'Vinyl: infinite resolution, but degrades with every play. Digital: fixed resolution (65,536 levels per sample), but perfectly copyable with zero degradation and compressible for streaming.'},
  {name:'Temperature',aIcon:'🌡',dIcon:'📊',aLabel:'Mercury thermometer',dLabel:'Digital sensor',
   body:'A mercury thermometer shows temperature as a continuous column height — a physical analog of thermal energy. A digital sensor samples a thermistor resistance at intervals, converts to a number (e.g., 12-bit ADC → 4,096 levels), and outputs to a display or microcontroller.',
   trade:'Analog: direct physical representation, no power required. Digital: can log data, transmit wirelessly, set alerts, trigger actions, and be read by software — at the cost of quantization resolution.'},
  {name:'Photography',aIcon:'📷',dIcon:'🖼',aLabel:'Film camera',dLabel:'Digital camera',
   body:'Film records light via continuous chemical reaction — silver halide crystals darken proportionally to light intensity with resolution limited only by grain size. A digital sensor is a grid of photodetectors (pixels); each outputs one number per color channel.',
   trade:'Film: extremely high effective resolution, organic tonal range. Digital: instant preview, unlimited copies with zero degradation, post-processing in software, no chemistry or darkroom required.'},
  {name:'Clocks',aIcon:'🕰',dIcon:'🔢',aLabel:'Analogue clock',dLabel:'Digital clock',
   body:'An analogue clock shows time as continuous angular position of hands — at 3:30 the minute hand is halfway between 3 and 4. A digital clock shows discrete numbers that jump by one unit per tick. The information is identical; the representation differs.',
   trade:'Analogue: easy to read relative time and estimate intervals at a glance. Digital: unambiguous, machine-readable, essential for software timers and precise scheduling.'},
  {name:'Communication',aIcon:'☎',dIcon:'📱',aLabel:'Landline telephone',dLabel:'VoIP / Digital call',
   body:'Analog telephone transmits voice as a continuously varying electrical voltage that mirrors sound pressure. Digital telephony samples voice at 8,000 Hz (G.711 standard), encodes each sample as 8 bits, and transmits 64 kbps streams that can be packet-switched, compressed, encrypted, and error-corrected.',
   trade:'Analog: simpler, no codec delay. Digital: compression (Opus, AAC-LD can deliver better quality at lower bandwidth), encryption, noise regeneration at every relay, and mixing with data traffic.'},
  {name:'Video',aIcon:'🎞',dIcon:'📺',aLabel:'Analogue TV (PAL)',dLabel:'HDTV / H.265',
   body:'PAL television broadcast a continuous varying electrical signal that electron guns reproduced directly on phosphor. Digital video breaks each frame into pixels, each pixel into bit-depth colour values, compresses using discrete cosine transforms and motion prediction, then transmits as bits.',
   trade:'Analogue: simple, low latency, no decoder needed. Digital: perfect frame quality at any distance, compressible (H.265 achieves HD video at 2–4 Mbps), transmittable over the internet, recorded without quality loss.'},
];
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
exEl.children[0].click();`,
      outputHeight: 420,
    },

    // ── Section 5 — Binary and bits ───────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `### Bits, Bytes, and the Scale of Digital Storage

A **bit** (binary digit) is the smallest unit of digital information — a single 0 or 1. With n bits, you can represent 2ⁿ distinct values.

**Why powers of 2?** Because each bit doubles the number of representable states. One bit: 2 states. Two bits: 4 states (00, 01, 10, 11). Three bits: 8 states. Ten bits: 1,024 states. This exponential growth is what makes digital systems so powerful — a small number of bits can encode an enormous number of values.

| Bits | States | Common use |
|------|--------|------------|
| 1    | 2      | Single binary decision |
| 4    | 16     | Hex digit, nibble |
| 8    | 256    | 1 byte, ASCII character |
| 16   | 65,536 | Audio sample (CD quality) |
| 24   | 16,777,216 | One RGB pixel (8 bits per channel) |
| 32   | ~4 billion | IPv4 address space |
| 64   | ~18 quintillion | Modern integer, IPv6 partial |
| 256  | 2²⁵⁶ | AES encryption key — secure against brute force for billions of years |

**Storage units:**
- 1 byte = 8 bits
- 1 kilobyte (KB) ≈ 10³ bytes
- 1 megabyte (MB) ≈ 10⁶ bytes (one high-resolution photo)
- 1 gigabyte (GB) ≈ 10⁹ bytes (about 3 hours of HD video)
- 1 terabyte (TB) ≈ 10¹² bytes (large hard drive)

A 5-minute song at CD quality: 44,100 samples/sec × 2 channels × 16 bits/sample × 300 seconds = 423,360,000 bits ≈ 53 MB uncompressed. MP3 at 128 kbps: about 5.8 MB — roughly 10× compression with inaudible quality loss.

Every number in the table above is a direct consequence of the choice to use 2 states per digit. Everything in digital engineering flows from the exponent in 2ⁿ.`,
    },

    // ── Visual 4 — Bit depth and information ─────────────────────────────────
    {
      type: 'js',
      instruction: `### How Bit Depth Affects Image Quality

Images are a perfect illustration of bit depth. Each pixel has color channels (R, G, B), and each channel is stored as n bits. With 8 bits per channel, you have 256 shades per channel and 256³ ≈ 16.7 million possible colors per pixel. With 1 bit per channel, you have only 2 colors — black or white.

The canvas below shows the same gradient image at different bit depths. Watch what happens as you reduce the bits: you see **banding** — the smooth gradient breaks into discrete visible steps. This is quantization error made visible.`,
      html: `<div class="scene">
  <div class="ctrl-row">
    <span class="clabel">Bits per channel: <strong id="bit-lbl">8</strong> bits = <strong id="levels-lbl">256</strong> levels per channel</span>
    <input type="range" id="bit-sl" min="1" max="8" value="8" style="flex:1">
  </div>
  <canvas id="cv" width="540" height="180"></canvas>
  <div class="caption" id="bit-cap"></div>
</div>`,
      css: `body{margin:0;padding:12px;font-family:sans-serif}
.scene{display:flex;flex-direction:column;gap:10px}
.ctrl-row{display:flex;align-items:center;gap:10px;flex-wrap:wrap}
.clabel{font-size:12px;color:var(--color-text-primary,#1e293b)}
canvas{border-radius:10px;display:block;width:100%}
.caption{font-size:12px;color:var(--color-text-secondary,#64748b);line-height:1.65;padding:6px 10px;border-left:2px solid var(--color-border-secondary,#e2e8f0)}`,
      startCode: `var cv=document.getElementById('cv'),ctx=cv.getContext('2d');
var W=cv.width,H=cv.height;
var sl=document.getElementById('bit-sl');
var bitLbl=document.getElementById('bit-lbl');
var levLbl=document.getElementById('levels-lbl');
var capEl=document.getElementById('bit-cap');

function quantize(val,bits){
  var levels=Math.pow(2,bits);
  return Math.round(val*(levels-1))/(levels-1);
}

function draw(){
  var bits=parseInt(sl.value);
  var levels=Math.pow(2,bits);
  bitLbl.textContent=bits;
  levLbl.textContent=levels;
  ctx.clearRect(0,0,W,H);

  // Top half: gradient (left=blue→right=red, top=bright→bottom=dark)
  for(var x=0;x<W;x++){
    for(var y=0;y<H;y++){
      var r=quantize(x/W,bits);
      var g=quantize(0.3*(1-y/H),bits);
      var b=quantize((1-x/W)*(1-y/H*0.5),bits);
      var ri=Math.round(r*255),gi=Math.round(g*255),bi=Math.round(b*255);
      ctx.fillStyle='rgb('+ri+','+gi+','+bi+')';
      ctx.fillRect(x,y,1,1);
    }
  }

  // Banding annotation at low bits
  if(bits<=3){
    ctx.fillStyle='rgba(255,255,255,0.75)';ctx.font='bold 13px sans-serif';ctx.textAlign='center';
    ctx.fillText('Quantization banding visible at '+bits+'-bit ('+levels+' levels)',W/2,H/2);
  }

  // Color count
  var totalColors=Math.pow(levels,3);
  var colorStr=totalColors>=1e6?(totalColors/1e6).toFixed(1)+'M':totalColors>=1000?(totalColors/1000).toFixed(0)+'K':totalColors;
  capEl.textContent=bits+'-bit per channel: '+levels+' shades × '+levels+' × '+levels+' = '+colorStr+' total colors. '+(bits>=8?'Smooth gradients — banding invisible.':bits>=4?'Subtle banding visible in smooth areas.':'Heavy banding — harsh posterization effect.');
}

sl.oninput=draw;
draw();`,
      outputHeight: 280,
    },

    // ── Challenge section ─────────────────────────────────────────────────────
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
      successMessage: 'Correct. Digital means discrete: the sound wave is sampled at regular intervals (44,100 times per second for CD-quality) and each sample is stored as a number. A vinyl groove is a continuous physical analog of the pressure wave — no sampling, no numbers. Where it\'s stored is irrelevant.',
      failMessage: 'The defining property of digital is discrete representation — information is encoded as a sequence of numbers. Where the file is stored doesn\'t determine its nature. A vinyl groove is continuous; an MP3 is a sequence of 44,100 numbers per second. File size and age have nothing to do with it.',
      html: '', css: `body{margin:0;padding:0;font-family:sans-serif}`, startCode: '', outputHeight: 270,
    },

    {
      type: 'challenge',
      instruction: `Digital systems are more noise-resistant than analog because:`,
      options: [
        { label: 'A', text: 'Digital signals travel faster through wires, so noise has less time to affect them.' },
        { label: 'B', text: 'Digital signals use higher voltages, which overwhelm any noise.' },
        { label: 'C', text: 'The receiver only needs to ask "above or below threshold?" — as long as noise doesn\'t cross the threshold, it has zero effect on the recovered value.' },
        { label: 'D', text: 'Digital circuits are made of better materials that don\'t pick up noise.' },
      ],
      check: (label) => label === 'C',
      successMessage: 'Correct. The threshold decision is everything. Digital receivers don\'t measure exact voltage — they classify each bit as 0 or 1. Any noise smaller than the voltage gap to the threshold is invisible in the recovered signal. This is why you can copy a digital file a trillion times with zero degradation.',
      failMessage: 'Speed and voltage level are irrelevant to noise immunity. The key is the threshold decision: because there are only two valid values, any noise that doesn\'t push the signal past the midpoint threshold is invisible to the receiver. The recovered signal is identical to the original regardless of how much noise was added — up to the threshold.',
      html: '', css: `body{margin:0;padding:0;font-family:sans-serif}`, startCode: '', outputHeight: 260,
    },

    {
      type: 'challenge',
      instruction: `A temperature sensor outputs a voltage between 0V and 5V that varies continuously with temperature. A microcontroller reads it with a 10-bit ADC. How many distinct temperature levels can the microcontroller distinguish?`,
      options: [
        { label: 'A', text: '10 levels — one per bit.' },
        { label: 'B', text: '100 levels — 10 × 10.' },
        { label: 'C', text: '1,024 levels — 2¹⁰.' },
        { label: 'D', text: 'Infinite levels — the ADC just records whatever the sensor outputs.' },
      ],
      check: (label) => label === 'C',
      successMessage: 'Correct. With n bits you represent 2ⁿ distinct values. 2¹⁰ = 1,024. The 10-bit ADC divides the 0–5V range into 1,024 equal steps (~4.9 mV each). This is quantization — the continuous analog voltage becomes one of 1,024 discrete numbers.',
      failMessage: 'With n bits you get 2ⁿ distinct values. 2¹⁰ = 1,024. Each additional bit exactly doubles the resolution: 8-bit = 256, 10-bit = 1,024, 12-bit = 4,096, 16-bit = 65,536. The ADC doesn\'t record infinite precision — it rounds to the nearest of its 1,024 possible levels.',
      html: '', css: `body{margin:0;padding:0;font-family:sans-serif}`, startCode: '', outputHeight: 260,
    },

    {
      type: 'challenge',
      instruction: `An audio engineer records a mono track at 48,000 Hz sample rate and 24-bit depth for 2 minutes. What is the uncompressed file size in megabytes?`,
      options: [
        { label: 'A', text: '≈ 1.7 MB' },
        { label: 'B', text: '≈ 17 MB' },
        { label: 'C', text: '≈ 17 MB — but this calculation is: 48,000 samples/sec × 3 bytes/sample × 120 seconds.' },
        { label: 'D', text: '≈ 170 MB' },
      ],
      check: (label) => label === 'C',
      successMessage: 'Correct. 48,000 samples/second × 3 bytes per sample (24 bits = 3 bytes) × 120 seconds = 17,280,000 bytes ≈ 17.3 MB. This is exactly the kind of calculation audio engineers, game developers, and firmware engineers do when estimating storage or bandwidth requirements.',
      failMessage: 'Work through it: 48,000 samples/second. 24 bits per sample = 3 bytes per sample. 2 minutes = 120 seconds. Total bytes = 48,000 × 3 × 120 = 17,280,000 bytes ≈ 17.3 MB. Learning to calculate storage and bandwidth from first principles is a core engineering skill.',
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
  tags: ['digital', 'analog', 'signals', 'binary', 'noise', 'sampling', 'ADC', 'bit-depth', 'Nyquist'],
  hook: {
    question: 'Why do we convert everything — music, photos, temperature — into streams of 0s and 1s?',
    realWorldContext: 'Every digital device translates the continuous physical world into discrete numbers before processing it. Understanding why reveals the engineering tradeoffs behind every digital system you\'ll ever build.',
  },
  intuition: {
    prose: [
      'Analog = continuous. Digital = discrete. Same information, fundamentally different representation.',
      'Noise is the key advantage: digital signals are recovered perfectly as long as noise doesn\'t cross the decision threshold. Analog signals are corrupted immediately.',
      'Sampling rate and bit depth define digital quality. Nyquist theorem: sample at 2× the highest frequency you want to capture.',
      'Two states win because transistors are maximally reliable fully-off or fully-on, and binary logic is computationally complete.',
      'With n bits: 2ⁿ distinct values. Each additional bit doubles the resolution.',
    ],
    callouts: [
      {
        type: 'important',
        title: 'The core trade-off',
        body: 'Digital sacrifices infinite analog precision for perfect reproducibility and noise immunity. In practice, enough bits gives you more precision than any sensor can measure — so the loss is irrelevant, but the gain (zero degradation, reliable transmission) is transformative.',
      },
      {
        type: 'definition',
        title: 'Nyquist-Shannon Sampling Theorem',
        body: 'To accurately reconstruct a signal with maximum frequency f Hz, you must sample at least 2f times per second. Sample below this rate and you get aliasing — phantom frequencies that weren\'t in the original signal.',
      },
    ],
    visualizations: [{ id: 'AnalogVsDigital', title: 'Analog vs Digital' }],
  },
  math: { prose: [], callouts: [], visualizations: [] },
  rigor: { prose: [], callouts: [], visualizations: [] },
  examples: [], challenges: [],
  mentalModel: [
    'Analog: continuous, infinite resolution, degrades with noise and with every copy.',
    'Digital: discrete numbers, fixed resolution, noise-immune up to threshold, perfect copies.',
    'Sampling rate determines temporal resolution (how fast). Bit depth determines amplitude resolution (how fine).',
    'With n bits: 2ⁿ levels. Each extra bit doubles precision.',
    'Two states (binary): maximally reliable transistors + complete Boolean logic + elegant error correction.',
  ],
  checkpoints: ['read-intuition'],
  quiz: [],
}
