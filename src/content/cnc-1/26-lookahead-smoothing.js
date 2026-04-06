export default {
  id: 'cnc-lookahead-smoothing',
  slug: 'lookahead-and-smoothing',
  chapter: 'cnc-1',
  order: 27,
  title: 'Lookahead and Path Smoothing',
  subtitle: 'G61, G64, Following Error, and the Block Processing Bottleneck',
  tags: [
    'G61', 'G64', 'G09', 'G61.1', 'lookahead', 'smoothing', 'corner blending',
    'exact stop', 'following error', 'servo lag', 'block cycle time',
    'S-curve', 'HSM', 'high-speed machining', 'AICC', 'NURBS',
  ],

  semantics: {
    core: [
      {
        symbol: 'G61',
        meaning: 'Exact Stop mode (modal). The machine decelerates to zero feedrate at the programmed endpoint of every block before starting the next. No path blending. Guarantees the tool reaches the exact programmed coordinate. Slow on multi-segment paths.',
      },
      {
        symbol: 'G61.1',
        meaning: 'Exact Stop Check mode (Fanuc, modal). A softer version of G61. The machine checks that the position error is within an in-position window before proceeding — it may not fully reach zero velocity, but it must be within the tolerance band. Faster than G61, still more accurate than G64.',
      },
      {
        symbol: 'G09',
        meaning: 'Exact Stop Check (non-modal, one-shot). Applies exact stop check behavior to a single block only. The next block returns to the previous modal mode (G61 or G64). Write G09 on the same line as a critical move: `G09 G01 X50.`',
      },
      {
        symbol: 'G64',
        meaning: 'Continuous Path mode (modal). The controller blends adjacent blocks, maintaining feedrate through corners wherever acceleration limits allow. May deviate slightly from the exact programmed path at transitions. Default on most controls. Required for HSM.',
      },
      {
        symbol: 'G64 P_',
        meaning: 'Continuous Path with tolerance band (Fanuc 0i, 30i). The P value (mm) sets the maximum permissible path deviation during blending. Larger P = smoother motion = more deviation from programmed path. `G64 P0.005` is common for precision finish work.',
      },
      {
        symbol: 'Lookahead buffer',
        meaning: 'The number of upcoming program blocks the controller pre-reads before executing the current block. Allows the controller to pre-compute deceleration ramps before reaching corners. Older Fanuc controls: 4–16 blocks. Modern 30i/31i: 200–2000+ blocks.',
      },
      {
        symbol: 'Following error (servo lag)',
        meaning: 'The instantaneous distance between the commanded position (where the controller says the axis should be) and the actual encoder position (where it really is). At any non-zero feedrate, following error is always nonzero. It is proportional to velocity: E = v / Kv.',
      },
      {
        symbol: 'Kv (position loop gain)',
        meaning: 'The servo amplifier\'s position loop gain coefficient. Units: (m/min) per mm of error — or equivalently, (1/min) × (1/1000). Higher Kv = less following error at the same feedrate, but more risk of instability. Typical values: 20–50 m/min/mm.',
      },
      {
        symbol: 'Block cycle time (BCT)',
        meaning: 'The time the controller needs to process one G-code block: parse it, run interpolation, update the servo trajectory. On Fanuc Series 0: ~16 ms. Series 16/18: ~4 ms. 30i/31i: ~0.5–1 ms. If the tool reaches the end of a block before the next block is processed, the machine jerks or stalls — the "block processing bottleneck".',
      },
      {
        symbol: 'S-curve acceleration',
        meaning: 'An acceleration profile where the jerk (rate of change of acceleration) is limited, creating a smooth S-shape instead of an abrupt trapezoidal ramp. Reduces mechanical shock on axes and reduces surface finish marks caused by vibration. Standard on high-end controls (Fanuc 30i, Siemens 840D).',
      },
      {
        symbol: 'NURBS interpolation (G5.1, G6.1)',
        meaning: 'Non-Uniform Rational B-Spline interpolation. The CNC controller interpolates directly along a smooth spline curve defined by control points and knot vectors, rather than from thousands of tiny G01 segments. Produces the smoothest possible path with the fewest program blocks.',
      },
    ],
    rulesOfThumb: [
      'G64 is correct for almost all contouring, profiling, and pocketing. G61 is for probing, boring, and any operation where the tool must physically reach a coordinate before proceeding.',
      'G09 (non-modal exact stop check) is the precision tool. Use it on individual critical corners within a G64 program without slowing the whole path.',
      'The block processing bottleneck is the hidden enemy of high-speed machining. If your CAM segments are 0.05mm and the controller takes 4ms per block, you cannot run faster than F0.05/0.004 = 750 mm/min — regardless of what F value you program.',
      'Following error is always proportional to feedrate. Doubling the feed doubles the servo lag. On a sharp corner at high feed, the lag means the tool starts turning before it fully reaches the corner — creating corner rounding.',
    ]
  },

  hook: {
    question: 'You program F3000 and the machine moves at F800. You check the feedrate display on the controller — it reads 3000. Where did the speed go?',
    realWorldContext:
      'This is one of the most confusing experiences in CNC. The program says F3000, the controller display says F3000, but the machine sounds like it\'s constantly braking. ' +
      'The cause is almost always one of two things: the G-code mode is G61 (exact stop, so the machine brakes to zero at every segment endpoint), ' +
      'or the block cycle time bottleneck is limiting the achievable speed — the controller cannot process the short CAM segments fast enough to sustain the commanded feedrate. ' +
      'Understanding what happens inside the controller between "read the block" and "move the axis" is the foundation of high-speed machining. ' +
      'Peter Smid calls this the most underappreciated topic in CNC programming. It separates programmers who know G-codes from programmers who understand the machine.',
    previewVisualizationId: 'ScienceNotebook',
  },

  intuition: {
    visualizations: [
      {
        id: 'ScienceNotebook',
        props: {
          lesson: {
            title: 'G61 vs G64 — Velocity Profile & Path Comparison',
            cells: [
              {
                type: 'js',
                title: 'G61 vs G64 — Velocity Profile Along a Multi-Corner Path',
                html: `<canvas id="c" width="680" height="320" style="display:block;max-width:100%;border-radius:8px;background:#0f172a"></canvas>
<div style="display:flex;gap:10px;justify-content:center;margin-top:10px;flex-wrap:wrap">
  <button id="btnG61" style="padding:7px 16px;border-radius:5px;border:none;background:#f87171;color:#0f172a;font:bold 12px monospace;cursor:pointer">G61 — Exact Stop</button>
  <button id="btnG64" style="padding:7px 16px;border-radius:5px;border:none;background:#38bdf8;color:#0f172a;font:bold 12px monospace;cursor:pointer">G64 — Continuous</button>
  <button id="btnG641" style="padding:7px 16px;border-radius:5px;border:none;background:#a78bfa;color:#0f172a;font:bold 12px monospace;cursor:pointer">G61.1 — Check Mode</button>
</div>`,
                css: `body{margin:0;background:#0f172a;padding:12px;font-family:monospace;display:flex;flex-direction:column;align-items:center}`,
                startCode: `
const c = document.getElementById('c');
const W = c.width, H = c.height;
const ctx = c.getContext('2d');

// 7 waypoints — mix of sharp and shallow corners
const wp = [
  {x:40,y:110},{x:130,y:110},{x:170,y:75},
  {x:230,y:130},{x:290,y:75},{x:370,y:110},{x:460,y:110}
];
const chartTop=180, chartH=100, chartL=40, chartR=W-20;

function sharpness(a,b,c){
  const d1x=b.x-a.x,d1y=b.y-a.y,d2x=c.x-b.x,d2y=c.y-b.y;
  const l1=Math.hypot(d1x,d1y),l2=Math.hypot(d2x,d2y);
  if(l1<1e-4||l2<1e-4)return 0;
  const dot=(d1x*d2x+d1y*d2y)/(l1*l2);
  return 1-Math.max(-1,Math.min(1,dot));
}

const sh=[0];
for(let i=1;i<wp.length-1;i++) sh.push(sharpness(wp[i-1],wp[i],wp[i+1]));
sh.push(0);

const segL=[];let totL=0;
for(let i=1;i<wp.length;i++){const l=Math.hypot(wp[i].x-wp[i-1].x,wp[i].y-wp[i-1].y);segL.push(l);totL+=l;}
const cum=[0];for(const l of segL)cum.push(cum[cum.length-1]+l);
const nx=d=>(d/totL)*(chartR-chartL)+chartL;

let mode='G64', animId, frame=0;

const MODES={
  G61: {color:'#f87171',label:'G61 EXACT STOP',sub:'Decelerates to 0 at every corner',vel:i=>0},
  'G61.1':{color:'#a78bfa',label:'G61.1 EXACT STOP CHECK',sub:'Slows to near-0 within tolerance window',vel:i=>Math.max(0,0.08*(1-sh[i]))},
  G64: {color:'#38bdf8',label:'G64 CONTINUOUS',sub:'Blends through corners — feedrate stays high',vel:i=>Math.max(0.22,1-sh[i]*0.62)},
};

function velAt(i){
  if(i===0||i===wp.length-1)return 0;
  return MODES[mode].vel(i);
}

function draw(){
  ctx.clearRect(0,0,W,H);
  ctx.fillStyle='#0f172a';ctx.fillRect(0,0,W,H);
  const t=(frame%240)/240;
  const m=MODES[mode];

  // --- PATH HALF ---
  // dim unexecuted path
  ctx.strokeStyle='#1e293b';ctx.lineWidth=1.5;ctx.beginPath();
  wp.forEach((p,i)=>i===0?ctx.moveTo(p.x,p.y):ctx.lineTo(p.x,p.y));ctx.stroke();

  // tool position
  const td=t*totL;
  let seg=0,da=0;
  for(let i=0;i<segL.length;i++){if(da+segL[i]>=td||i===segL.length-1){seg=i;break;}da+=segL[i];}
  const st=segL[seg]>0?(td-da)/segL[seg]:0;
  const tp={x:wp[seg].x+(wp[seg+1].x-wp[seg].x)*st,y:wp[seg].y+(wp[seg+1].y-wp[seg].y)*st};

  // executed path (bright)
  ctx.strokeStyle=m.color;ctx.lineWidth=2;ctx.beginPath();
  for(let i=0;i<=seg+1&&i<wp.length;i++){
    const p=i<=seg?wp[i]:(i===seg+1?tp:null);if(!p)break;
    i===0?ctx.moveTo(p.x,p.y):ctx.lineTo(p.x,p.y);
  }
  ctx.stroke();

  // corner markers
  wp.slice(1,-1).forEach((p,i)=>{
    ctx.fillStyle=sh[i+1]>0.5?'#fbbf24':'#334155';
    ctx.beginPath();ctx.arc(p.x,p.y,4,0,Math.PI*2);ctx.fill();
  });

  // tool dot
  ctx.fillStyle='#ffffff';ctx.beginPath();ctx.arc(tp.x,tp.y,6,0,Math.PI*2);ctx.fill();
  ctx.fillStyle=m.color;ctx.beginPath();ctx.arc(tp.x,tp.y,4,0,Math.PI*2);ctx.fill();

  // corner angle labels for sharp corners
  ctx.fillStyle='#fbbf24';ctx.font='8px monospace';ctx.textAlign='center';
  wp.slice(1,-1).forEach((p,i)=>{
    if(sh[i+1]>0.3){const deg=Math.round(Math.acos(1-sh[i+1])*180/Math.PI);ctx.fillText(deg+'°',p.x,p.y-10);}
  });

  // --- VELOCITY CHART ---
  ctx.fillStyle='#0a1628';ctx.fillRect(chartL,chartTop,chartR-chartL,chartH);
  // grid
  ctx.strokeStyle='#1e293b';ctx.lineWidth=0.5;
  [0.25,0.5,0.75].forEach(f=>{
    ctx.beginPath();ctx.moveTo(chartL,chartTop+chartH*(1-f));ctx.lineTo(chartR,chartTop+chartH*(1-f));ctx.stroke();
  });
  // labels
  ctx.fillStyle='#334155';ctx.font='8px monospace';ctx.textAlign='right';
  ctx.fillText('F',chartL-2,chartTop+4);
  ctx.fillText('0',chartL-2,chartTop+chartH);
  ctx.fillStyle='#475569';
  ctx.fillText('100%',chartL-2,chartTop+4);
  ctx.fillText('50%',chartL-2,chartTop+chartH/2+4);

  // velocity curve
  const vels=wp.map((_,i)=>velAt(i));
  ctx.strokeStyle=m.color;ctx.lineWidth=2;ctx.beginPath();
  for(let i=0;i<wp.length;i++){
    const px=nx(cum[i]);const vy=chartTop+chartH-vels[i]*chartH;
    i===0?ctx.moveTo(px,vy):ctx.lineTo(px,vy);
  }
  ctx.stroke();
  // corner dots on chart
  for(let i=1;i<wp.length-1;i++){
    ctx.fillStyle=sh[i]>0.5?'#fbbf24':'#64748b';
    ctx.beginPath();ctx.arc(nx(cum[i]),chartTop+chartH-vels[i]*chartH,3,0,Math.PI*2);ctx.fill();
  }
  // tool position cursor on chart
  const cx2=nx(td);
  ctx.strokeStyle=m.color+'80';ctx.lineWidth=1;ctx.setLineDash([3,3]);
  ctx.beginPath();ctx.moveTo(cx2,chartTop);ctx.lineTo(cx2,chartTop+chartH);ctx.stroke();
  ctx.setLineDash([]);

  // avg feed area fill
  const avg=vels.reduce((a,b)=>a+b,0)/vels.length;
  ctx.fillStyle=m.color+'18';
  ctx.beginPath();
  for(let i=0;i<wp.length;i++){const px=nx(cum[i]);const vy=chartTop+chartH-vels[i]*chartH;i===0?ctx.moveTo(px,vy):ctx.lineTo(px,vy);}
  ctx.lineTo(chartR,chartTop+chartH);ctx.lineTo(chartL,chartTop+chartH);ctx.closePath();ctx.fill();

  // labels
  ctx.fillStyle=m.color;ctx.font='bold 13px monospace';ctx.textAlign='left';
  ctx.fillText(m.label,chartL,chartTop-8);
  ctx.fillStyle='#94a3b8';ctx.font='9px monospace';
  ctx.fillText(m.sub,chartL,chartTop-20);
  ctx.textAlign='right';
  ctx.fillText('Avg feed: '+Math.round(avg*100)+'% of F max',chartR,chartTop-8);

  frame++;
  animId=requestAnimationFrame(draw);
}

document.getElementById('btnG61').onclick=()=>{mode='G61';frame=0;};
document.getElementById('btnG64').onclick=()=>{mode='G64';frame=0;};
document.getElementById('btnG641').onclick=()=>{mode='G61.1';frame=0;};
draw();
                `,
              },
              {
                type: 'js',
                title: 'Block Cycle Time Bottleneck — Why Short Segments Kill Feedrate',
                html: `<canvas id="c2" width="680" height="300" style="display:block;max-width:100%;border-radius:8px;background:#0f172a"></canvas>
<div style="display:flex;gap:8px;justify-content:center;margin-top:10px;flex-wrap:wrap">
  <label style="color:#94a3b8;font:11px monospace;display:flex;align-items:center;gap:6px">
    Seg length (mm): <input id="segLen" type="range" min="0.05" max="2" step="0.05" value="0.2" style="width:100px">
    <span id="segLenVal" style="color:#38bdf8;min-width:36px">0.20</span>
  </label>
  <label style="color:#94a3b8;font:11px monospace;display:flex;align-items:center;gap:6px">
    Controller BCT (ms): <input id="bct" type="range" min="0.5" max="16" step="0.5" value="4" style="width:100px">
    <span id="bctVal" style="color:#fbbf24;min-width:36px">4.0</span>
  </label>
  <label style="color:#94a3b8;font:11px monospace;display:flex;align-items:center;gap:6px">
    Programmed F: <input id="feed" type="range" min="500" max="5000" step="100" value="2000" style="width:100px">
    <span id="feedVal" style="color:#4ade80;min-width:48px">2000</span>
  </label>
</div>`,
                css: `body{margin:0;background:#0f172a;padding:12px;font-family:monospace;display:flex;flex-direction:column;align-items:center}`,
                startCode: `
const c=document.getElementById('c2');
const W=c.width,H=c.height;
const ctx=c.getContext('2d');

const slSeg=document.getElementById('segLen');
const slBCT=document.getElementById('bct');
const slFeed=document.getElementById('feed');
const vSeg=document.getElementById('segLenVal');
const vBCT=document.getElementById('bctVal');
const vFeed=document.getElementById('feedVal');

[slSeg,slBCT,slFeed].forEach(s=>s.oninput=draw);

function draw(){
  const segMm=parseFloat(slSeg.value);
  const bctMs=parseFloat(slBCT.value);
  const progF=parseFloat(slFeed.value);
  vSeg.textContent=segMm.toFixed(2);
  vBCT.textContent=bctMs.toFixed(1);
  vFeed.textContent=progF.toFixed(0);

  // Max feedrate before BCT bottleneck
  // BCT limits: tool must not exceed one segment per BCT interval
  const fMaxBCT = (segMm / bctMs) * 60000; // mm/min
  const fActual = Math.min(progF, fMaxBCT);
  const limited = fActual < progF * 0.98;

  ctx.clearRect(0,0,W,H);
  ctx.fillStyle='#0f172a';ctx.fillRect(0,0,W,H);

  const barW=W-80,barX=60,barY1=60,barY2=130,barH=36;

  // --- BAR 1: Programmed Feed ---
  ctx.fillStyle='#1e293b';ctx.fillRect(barX,barY1,barW,barH);
  ctx.fillStyle='#4ade80';
  ctx.fillRect(barX,barY1,barW,barH);
  ctx.fillStyle='#0f172a';ctx.font='bold 13px monospace';ctx.textAlign='center';
  ctx.fillText('Programmed: F'+progF,barX+barW/2,barY1+barH/2+5);
  ctx.fillStyle='#94a3b8';ctx.font='9px monospace';ctx.textAlign='left';
  ctx.fillText('Programmed feedrate',barX,barY1-8);

  // --- BAR 2: Actual Achievable Feed ---
  ctx.fillStyle='#1e293b';ctx.fillRect(barX,barY2,barW,barH);
  const ratio=Math.min(1,fActual/progF);
  ctx.fillStyle=limited?'#f87171':'#38bdf8';
  ctx.fillRect(barX,barY2,barW*ratio,barH);
  ctx.fillStyle='#f1f5f9';ctx.font='bold 13px monospace';ctx.textAlign='center';
  ctx.fillText('Actual: F'+Math.round(fActual)+(limited?' ← CAPPED':' ✓'),barX+barW/2,barY2+barH/2+5);
  ctx.fillStyle='#94a3b8';ctx.font='9px monospace';ctx.textAlign='left';
  ctx.fillText('Achievable with these settings',barX,barY2-8);

  // --- Calculation display ---
  const bY=200;
  ctx.fillStyle='#1e293b';ctx.fillRect(20,bY,W-40,85);
  ctx.strokeStyle='#334155';ctx.lineWidth=1;ctx.strokeRect(20,bY,W-40,85);

  ctx.fillStyle='#94a3b8';ctx.font='9px monospace';ctx.textAlign='left';
  const lh=16;
  ctx.fillText('Segment length:  '+segMm+' mm',30,bY+lh);
  ctx.fillText('Block cycle time: '+bctMs+' ms  ('+bctMs/1000+' s)',30,bY+lh*2);
  ctx.fillStyle='#fbbf24';
  ctx.fillText('F_max = ('+segMm+' mm / '+bctMs+' ms) × 60,000 = '+Math.round(fMaxBCT)+' mm/min',30,bY+lh*3);
  if(limited){
    ctx.fillStyle='#f87171';
    ctx.fillText('⚠  BOTTLENECK: programmed F'+progF+' > F_max '+Math.round(fMaxBCT)+' — machine runs at F'+Math.round(fActual),30,bY+lh*4);
    ctx.fillText('   Fix: increase segment length, upgrade controller, or reduce feed.',30,bY+lh*5);
  }else{
    ctx.fillStyle='#4ade80';
    ctx.fillText('✓  No bottleneck: controller processes blocks fast enough for this feed.',30,bY+lh*4);
  }

  // --- Controller comparison table ---
  const controllers=[
    {name:'Fanuc 0M / 3M',bct:16,color:'#f87171'},
    {name:'Fanuc 16i / 18i',bct:4,color:'#fbbf24'},
    {name:'Fanuc 30i / 31i',bct:1,color:'#38bdf8'},
    {name:'Siemens 840D SL',bct:0.5,color:'#4ade80'},
  ];
  const tY=H-10;
  ctx.fillStyle='#475569';ctx.font='8px monospace';ctx.textAlign='left';
  ctx.fillText('Controller BCT reference:',20,tY-controllers.length*13-5);
  controllers.forEach((ct,i)=>{
    const fLim=(segMm/ct.bct)*60000;
    ctx.fillStyle=ct.color;
    ctx.fillText(ct.name+': '+ct.bct+'ms BCT → F_max '+Math.round(fLim)+' mm/min @ '+segMm+'mm segments',20,tY-i*13);
  });
}
draw();
                `,
              },
              {
                type: 'js',
                title: 'Following Error — The Servo Lag That Rounds Every Corner',
                html: `<canvas id="c3" width="680" height="280" style="display:block;max-width:100%;border-radius:8px;background:#0f172a"></canvas>
<div style="display:flex;gap:8px;justify-content:center;margin-top:10px;flex-wrap:wrap">
  <label style="color:#94a3b8;font:11px monospace;display:flex;align-items:center;gap:6px">
    Feedrate F (mm/min): <input id="fv" type="range" min="100" max="5000" step="100" value="1000" style="width:110px">
    <span id="fvVal" style="color:#38bdf8;min-width:42px">1000</span>
  </label>
  <label style="color:#94a3b8;font:11px monospace;display:flex;align-items:center;gap:6px">
    Kv (m/min per mm): <input id="kv" type="range" min="10" max="60" step="2" value="30" style="width:110px">
    <span id="kvVal" style="color:#fbbf24;min-width:24px">30</span>
  </label>
</div>`,
                css: `body{margin:0;background:#0f172a;padding:12px;font-family:monospace;display:flex;flex-direction:column;align-items:center}`,
                startCode: `
const c=document.getElementById('c3');
const W=c.width,H=c.height;
const ctx=c.getContext('2d');
const sfv=document.getElementById('fv'),skv=document.getElementById('kv');
const vfv=document.getElementById('fvVal'),vkv=document.getElementById('kvVal');
[sfv,skv].forEach(s=>s.oninput=draw);

function draw(){
  const F=parseFloat(sfv.value);   // mm/min
  const Kv=parseFloat(skv.value);  // m/min per mm of error => effectively Kv [mm/min per mm]
  vfv.textContent=F; vkv.textContent=Kv;

  // Following error = (F mm/min) / (Kv * 1000 mm/min per mm) = F/(Kv*1000) mm
  const E = F / (Kv * 1000); // mm

  ctx.clearRect(0,0,W,H);
  ctx.fillStyle='#0f172a';ctx.fillRect(0,0,W,H);

  const cx=W*0.35, cy=H*0.42, scale=2.2;

  // Programmed path: an L-shaped corner
  const corner={x:cx,y:cy};
  const start={x:cx-80*scale,y:cy};
  const end={x:cx,y:cy-60*scale};

  ctx.strokeStyle='#334155';ctx.lineWidth=1;ctx.setLineDash([4,4]);
  ctx.beginPath();ctx.moveTo(start.x,start.y);ctx.lineTo(corner.x,corner.y);ctx.lineTo(end.x,end.y);ctx.stroke();
  ctx.setLineDash([]);
  ctx.fillStyle='#334155';ctx.font='9px monospace';ctx.textAlign='center';
  ctx.fillText('Programmed path',cx+60,cy-30);

  // Actual path (with following error rounding the corner)
  const eScale=Math.min(E*scale*40,30); // visual rounding radius
  const rounded=[
    {x:start.x,y:start.y},
    {x:corner.x-eScale*1.2,y:corner.y},
    {x:corner.x-eScale*0.3,y:corner.y-eScale*0.3},
    {x:corner.x,y:corner.y-eScale*1.2},
    {x:end.x,y:end.y},
  ];
  ctx.strokeStyle='#38bdf8';ctx.lineWidth=2;
  ctx.beginPath();
  ctx.moveTo(rounded[0].x,rounded[0].y);
  ctx.lineTo(rounded[1].x,rounded[1].y);
  ctx.bezierCurveTo(corner.x,corner.y,corner.x,corner.y,rounded[3].x,rounded[3].y);
  ctx.lineTo(rounded[4].x,rounded[4].y);
  ctx.stroke();
  ctx.fillStyle='#38bdf8';ctx.font='9px monospace';ctx.textAlign='left';
  ctx.fillText('Actual path (servo lag)',cx+4,cy-eScale*1.2-8);

  // Corner error annotation
  ctx.strokeStyle='#fbbf24';ctx.lineWidth=1;ctx.setLineDash([2,2]);
  ctx.beginPath();ctx.moveTo(corner.x,corner.y);ctx.lineTo(corner.x-eScale*0.3,corner.y-eScale*0.3);ctx.stroke();
  ctx.setLineDash([]);
  ctx.fillStyle='#fbbf24';ctx.textAlign='right';
  ctx.fillText('Corner rounding ≈ E = '+E.toFixed(3)+' mm',corner.x-2,corner.y+20);

  // Formulas and readout
  const fy=H*0.72,lh=18;
  ctx.fillStyle='#1e293b';ctx.fillRect(20,fy,W-40,H*0.28-10);
  ctx.strokeStyle='#334155';ctx.lineWidth=1;ctx.strokeRect(20,fy,W-40,H*0.28-10);
  ctx.fillStyle='#94a3b8';ctx.font='9px monospace';ctx.textAlign='left';
  ctx.fillText('Following Error formula:  E = F / (Kv × 1000)',30,fy+lh);
  ctx.fillStyle='#fbbf24';
  ctx.fillText('E = '+F+' mm/min  /  ('+Kv+' × 1000) = '+E.toFixed(4)+' mm',30,fy+lh*2);
  ctx.fillStyle='#94a3b8';
  ctx.fillText('At this feed, the servo lags '+E.toFixed(3)+'mm behind the commanded position.',30,fy+lh*3);
  if(E>0.03){ctx.fillStyle='#f87171';ctx.fillText('⚠  E > 0.03mm — corner rounding likely visible. Reduce feed or increase Kv.',30,fy+lh*4);}
  else{ctx.fillStyle='#4ade80';ctx.fillText('✓  E within typical tolerance for finish work.',30,fy+lh*4);}
}
draw();
                `,
              },
            ],
          },
        },
        title: 'G61/G64, Block Cycle Time, and Following Error',
        caption: 'Three interactive animations: (1) velocity profiles for G61, G61.1, and G64 on the same multi-corner path; (2) the block cycle time bottleneck — how short CAM segments and slow controllers cap achievable feedrate; (3) following error (servo lag) — how feedrate and Kv combine to round every corner.',
      },
      {
        id: 'CNCLab',
        props: {
          initialCode:
            '(G61 vs G64 — Mode Switch Demo)\n' +
            '(G61: exact stop at every corner)\n' +
            '(G64: continuous blend through corners)\n' +
            '(G09: one-shot exact stop on a single block)\n' +
            '\n' +
            'G21 G90 G17 G40 G49 G80\n' +
            'T1 M06\n' +
            'G43 H1\n' +
            'S1500 M03\n' +
            'G54\n' +
            '\n' +
            '(--- CONTOURING: G64 ---)\n' +
            'G64\n' +
            'G00 X0 Y0 Z5.\n' +
            'G01 Z-2. F120\n' +
            'G01 X60. F1500\n' +
            'G01 X60. Y40.\n' +
            'G01 X0 Y40.\n' +
            'G01 X0 Y0\n' +
            '\n' +
            '(One-shot exact stop on critical corner:)\n' +
            'G64\n' +
            'G01 X30. Y0\n' +
            'G09 G01 X30. Y20.   (G09 = exact stop THIS block only)\n' +
            'G01 X60. Y20.\n' +
            'G00 Z50.\n' +
            'M30',
        },
        title: 'G61 / G64 / G09 Lab',
        caption: 'Try switching between G61 and G64 at the top of the square contour. Also note G09 on one block — the exact stop check applies only to that move, then G64 resumes. The backplot path looks identical; the speed difference is invisible in a simulator but dramatic on a real machine.',
      },
    ],
    prose: [
      '**The Controller\'s Job Between Blocks**: Think of the CNC controller as reading a book — it reads blocks one at a time. After reading a block, it must parse the G-codes, evaluate any macro expressions, compute the interpolation trajectory for every axis, and queue the motion for the servo drives. This takes time — the **block cycle time (BCT)**. On a Fanuc Series 0 from the 1990s, BCT was about 16 milliseconds. A modern Fanuc 30i can process a block in 0.5 milliseconds. That 32× difference is why older machines struggle with HSM toolpaths that newer ones handle easily.',

      '**The Block Processing Bottleneck (Peter Smid\'s "Hidden Wall")**: Here is the math most textbooks skip. At F2000 mm/min, the tool travels 33.3 mm/s. If each CAM segment is 0.2mm long, the tool covers one segment in 0.2/33.3 = 6ms. But if the controller needs 8ms to process each block, the tool reaches the end of the segment before the next motion command is ready. The machine stalls — or the controller hardware-limits the feedrate to what it can sustain. This is why the BCT bottleneck formula matters:\n```\nF_max = (segment_length × 60,000) / BCT_ms   [mm/min]\n```\nAt 0.2mm segments and 4ms BCT: F_max = (0.2 × 60,000) / 4 = 3000 mm/min. Program F5000 and the machine physically cannot comply — it runs at 3000 regardless of what the display shows.',

      '**G64 — Continuous Path Mode**: In G64, the lookahead buffer allows the controller to pre-read upcoming blocks and build a continuous velocity profile. Adjacent moves are "blended" — at a shallow corner, the machine barely slows. At a sharp corner, it slows proportionally. At a reversal (180°), it still must stop. The key insight is that G64 never violates servo acceleration limits; it uses the lookahead to *schedule* decelerations in advance rather than reacting to them.',

      '**G61 — Exact Stop Mode**: In G61, the machine decelerates to zero and waits within the "in-position" window (a tight position tolerance, typically 0.001–0.005mm) at the endpoint of every block. Only when the axis is confirmed to be within tolerance does the next block begin executing. This is the correct mode for: probing (probe must be stationary at trigger), boring retract (tool must be centered before retracting to avoid scratching the bore wall), tapping (spindle-to-feed synchronization must be verified at depth), and any fixture probing or measurement cycle.',

      '**G61.1 — Exact Stop Check Mode**: Smid distinguishes carefully between G61 and G61.1. G61 is "exact stop" — the machine actually touches zero velocity. G61.1 is "exact stop check" — the machine continues as soon as the position error falls within the in-position tolerance band, which may happen slightly before velocity reaches zero. G61.1 is faster than G61 for the same tolerance, and is the preferred mode for precision contouring where sharp corners must be exact but where demanding that velocity reach true zero is overkill.',

      '**G09 — The Precision Scalpel**: G09 is non-modal (one-shot). It applies exact stop check behavior to a single block, then the program reverts to whatever modal mode (G61 or G64) was active before. Write `G09 G01 X50. Y30.` to hit that specific point exactly within a otherwise-continuous G64 program. This is the cleanest way to guarantee a critical position — a pocket corner, a datum probe point, a thread start — without slowing the entire toolpath.',

      '**Following Error: Why Every Corner Rounds at High Speed**: The servo drive uses a **position loop** to compare commanded position to actual encoder position. The difference — called **following error** or **position error** — is the input to the position controller. At steady-state, following error is always nonzero at any nonzero feedrate:\n```\nE = F / (Kv × 1000)\n```\nWhere F is feedrate in mm/min and Kv is the position loop gain in (m/min)/mm. At F = 3000 mm/min and Kv = 30, following error = 3000/(30×1000) = 0.1mm. The servo physically lags 0.1mm behind the commanded position. At a 90° corner, this lag means the tool begins turning the corner before it has fully reached the corner point — creating a visible radius even in G64. Higher Kv = less error, but too high and the servo oscillates (instability). This is a machine parameter set by the builder\'s service engineer.',

      '**S-Curve Acceleration: Why Surface Finish Changes at High Feed**: Most shop-floor machines use trapezoidal velocity profiles: the feedrate ramps up linearly to the commanded value, holds, then ramps down linearly. The discontinuity in acceleration at the start and end of each ramp transmits an impulse to the machine structure. At high feedrates, this impulse excites resonant frequencies and causes micro-vibrations that show up as periodic surface marks. **S-curve acceleration** limits the rate of change of acceleration (jerk) so the velocity profile is smooth — no abrupt corners. This is standard on Fanuc 30i and Siemens 840D. On older machines with trapezoidal ramps, slightly reducing feed on finish passes (even if within BCT limits) often improves surface finish.',

      '**NURBS Interpolation (G5.1 / G6.1)**: The ultimate solution to the short-segment problem. Instead of approximating a curve with thousands of tiny G01 segments, the CAM system describes the surface mathematically as a NURBS (Non-Uniform Rational B-Spline). The CNC program contains only the control points, weights, and knot vectors — typically a few dozen numbers per curve. The controller\'s internal interpolator computes the actual motion directly on the smooth curve, producing zero segmentation error, dramatically fewer program blocks, and genuinely smooth velocity profiles at the highest feedrates. `G5.1 Q1` activates AI nano contour control with NURBS on Fanuc 30i. Available only on high-end controllers with the NURBS option.',

      '**HSM Recipe — What to Set for True High-Speed Machining**: Real HSM programs combine: G64 (continuous mode), a BCT-appropriate segment length from the CAM post, the correct G64 P_ tolerance for the pass type, AICC or nano smoothing if available, and the right feedrate for the actual Kv of the machine. Missing any one of these — especially running G61 on CAM-generated surface paths, or ignoring the BCT bottleneck — collapses actual cutting speed to a fraction of commanded feed.',
    ],
  },

  math: {
    prose: [
      '**Block cycle time bottleneck — maximum feedrate:**',
      '$F_{\\text{max}} = \\dfrac{L_{\\text{seg}} \\times 60{,}000}{\\text{BCT}_{\\text{ms}}}$ [mm/min]',
      'Where $L_{\\text{seg}}$ is the CAM segment length in mm and BCT is the controller block cycle time in milliseconds.',
      'Example: $L_{\\text{seg}} = 0.1$ mm, BCT = 4 ms (Fanuc 16i): $F_{\\text{max}} = 0.1 \\times 60{,}000 / 4 = 1500$ mm/min.',
      '',
      '**Following error (servo position error):**',
      '$E = \\dfrac{F}{K_v \\times 1000}$ [mm]',
      'Where $F$ is feedrate in mm/min and $K_v$ is the position loop gain in (m/min)/mm.',
      'At F = 3000 mm/min, Kv = 30 (m/min)/mm: $E = 3000 / 30{,}000 = 0.1$ mm.',
      'Doubling feedrate doubles following error and doubles corner rounding.',
      '',
      '**Corner blend-through speed in G64:**',
      '$v_{\\text{corner}} = v_{\\text{max}} \\cdot \\cos\\!\\left(\\dfrac{\\Delta\\theta}{2}\\right)$',
      'At $\\Delta\\theta = 0°$ (collinear): $v_{\\text{corner}} = v_{\\text{max}}$ — no deceleration.',
      'At $\\Delta\\theta = 90°$: $v_{\\text{corner}} \\approx 0.707\\, v_{\\text{max}}$.',
      'At $\\Delta\\theta = 180°$ (reversal): $v_{\\text{corner}} = 0$ — must stop.',
      '',
      '**Deceleration distance before a corner:**',
      '$d_{\\text{dec}} = \\dfrac{v^2 - v_{\\text{corner}}^2}{2 \\, a_{\\text{max}}}$ [mm]',
      'This is the distance the controller needs to schedule the deceleration ramp. If the lookahead buffer does not extend far enough ahead to cover $d_{\\text{dec}}$, the machine cannot reach the corner at the correct speed and must brake abruptly.',
    ],
  },

  rigor: {
    prose: [
      '**In-position check and G61 vs G61.1 precision**: The in-position band is a machine parameter (Fanuc parameter #1826). The default is typically 0.004–0.010mm. G61 requires the axis to be within this band *and* at near-zero velocity. G61.1 requires only that the position error is within the band. The practical difference is 5–40ms per corner — small on one corner, significant across thousands of corners in a complex program.',

      '**Fanuc lookahead depth by series**: Fanuc 0: ~4–8 blocks. Fanuc 16/18/21: ~16 blocks. Fanuc 30i/31i with AICC II: 200–2000 blocks depending on the option. Each generation roughly doubles the sustainable feedrate on a given CAM toolpath. This is why upgrading a controller (not just the machine) is a productivity investment.',

      '**Siemens 840D: SOFT, COMPCAD, and TOP_SURFACE**: Siemens uses G64 equivalent (DYNFINISH, DYNPOS, DYNNORM modes) plus geometric tolerance via G64 with SOFT. COMPCAD is the equivalent of Fanuc AICC — it smooths CAM-generated paths on the controller before execution. TOP_SURFACE applies spline fitting to short-segment paths in real time. These are invoked in the part program or via machine parameter — comparable in capability to Fanuc AICC II.',

      '**Surface finish consequences of mode choice**: G61 on a contoured surface leaves "dwell marks" — tiny flat spots at every programmed corner where the tool paused while stationary. These are visible (and measurable) on reflective surfaces like aluminum. G64 eliminates dwell marks but, if the P tolerance is too large, leaves path deviation visible as facets. The optimal setting is: G64 with a P value ≤ the maximum chordal error from the CAM tolerance — matching the controller tolerance to the CAM tolerance so the controller doesn\'t introduce additional deviation beyond what was already in the toolpath.',

      '**Feed forward: reducing following error without changing Kv**: Many controllers support a velocity feed-forward parameter. Instead of waiting for position error to accumulate and then correcting, the controller adds a fraction of the *commanded velocity* directly to the servo output — pre-compensating for the lag before it occurs. With 100% feed-forward, following error drops to near zero even at high feedrates. Feed-forward is a parameter (not a G-code) and must be tuned carefully — too much causes overshoot.',
    ],
  },

  examples: [
    {
      id: 'ex-la-bct',
      title: 'Finding the BCT Bottleneck on a Specific Machine',
      problem: 'A Fanuc 16i (BCT ≈ 4 ms) runs a 3D surface program with 0.05mm CAM segments at programmed F3000. What is the actual achievable feedrate?',
      steps: [
        { expression: 'F_max = (0.05 mm × 60,000) / 4 ms', annotation: 'Apply the BCT bottleneck formula.' },
        { expression: 'F_max = 3000 / 4 = 750 mm/min', annotation: 'The controller can only process one 0.05mm block every 4ms, capping speed at 750 mm/min.' },
        { expression: 'Programmed F3000 → actual F750', annotation: 'The machine runs at 25% of the programmed feedrate. The display may still show F3000.' },
        { expression: 'Fix option 1: increase CAM segment to 0.2mm → F_max = 3000 mm/min', annotation: 'Larger segments allow higher sustainable feedrate.' },
        { expression: 'Fix option 2: upgrade to Fanuc 30i (BCT ≈ 1ms) → F_max = 3000 mm/min at 0.05mm', annotation: 'Faster controller eliminates the bottleneck without changing the CAM output.' },
      ],
      conclusion: 'The BCT bottleneck is why identical programs run 4× faster on newer controllers. Always compute F_max before assuming the machine can run a given CAM feedrate.',
    },
    {
      id: 'ex-la-following-error',
      title: 'Following Error on a Precision Corner',
      problem: 'A die mold machine has Kv = 25 (m/min)/mm. A finish pass runs at F1500 mm/min. What is the corner rounding error, and should G61.1 be used?',
      steps: [
        { expression: 'E = F / (Kv × 1000)', annotation: 'Following error formula.' },
        { expression: 'E = 1500 / (25 × 1000) = 0.060 mm', annotation: '60 microns of servo lag — visible on a precision mold.' },
        { expression: 'G61.1 forces error to ≤ in-position band (≈ 0.005mm) at corners', annotation: 'G61.1 waits until the servo catches up before blending into the next move.' },
        { expression: 'Penalty: ~10–20ms per corner × 500 corners = ~5–10 seconds extra cycle time', annotation: 'Acceptable cost for a precision die or form tool.' },
        { expression: 'Alternative: feed-forward compensation reduces E without speed penalty', annotation: 'Machine parameter change, requires servo tuning by a Fanuc field engineer.' },
      ],
      conclusion: 'For Kv = 25 and F1500, following error is 0.060mm — too large for die work. G61.1 at precision corners is the correct program-level fix. Feed-forward is the machine-level fix.',
    },
    {
      id: 'ex-la-g09',
      title: 'Using G09 for One Critical Datum Point',
      problem: 'A pocket has 7 blend radius corners (G64 is fine) and 1 sharp datum corner that must be hit exactly for fixturing. Write the code.',
      steps: [
        { expression: 'G64  (continuous mode for the whole pocket)', annotation: 'G64 modal — speeds through the 6 blend corners.' },
        { expression: 'G01 X0 Y0 F800   (approach to datum corner)', annotation: 'Normal blended move.' },
        { expression: 'G09 G01 X50. Y0  (exact stop check on THIS block)', annotation: 'G09 applies only here. Machine waits within in-position tolerance before continuing.' },
        { expression: 'G01 X50. Y50.    (G64 resumes — G09 was one-shot)', annotation: 'Next block blends normally. G64 is still modal.' },
      ],
      conclusion: 'G09 is the precision scalpel: exact position on one critical point without penalizing the rest of the path. No mode-switch overhead.',
    },
  ],

  assessment: {
    questions: [
      {
        id: 'cnc-la-1',
        type: 'choice',
        text: 'G61 mode causes the machine to:',
        options: [
          'Blend motion smoothly through corners at maximum speed',
          'Decelerate to zero velocity at the endpoint of every block, then check position before starting the next',
          'Skip short segments to avoid the block cycle time limit',
          'Enable NURBS spline interpolation',
        ],
        answer: 'Decelerate to zero velocity at the endpoint of every block, then check position before starting the next',
      },
      {
        id: 'cnc-la-2',
        type: 'choice',
        text: 'What is the key difference between G61 and G61.1?',
        options: [
          'G61 is modal; G61.1 is non-modal (one-shot)',
          'G61 waits for true zero velocity; G61.1 continues once position error is within tolerance',
          'G61 applies only to linear moves; G61.1 applies to arc moves',
          'G61.1 is a Siemens code; G61 is Fanuc only',
        ],
        answer: 'G61 waits for true zero velocity; G61.1 continues once position error is within tolerance',
      },
      {
        id: 'cnc-la-3',
        type: 'choice',
        text: 'G09 is:',
        options: [
          'Modal exact stop — stays active until G64 cancels it',
          'Non-modal (one-shot) exact stop check — applies to the next block only',
          'Equivalent to G61.1 but for arc moves only',
          'A canned probing cycle requiring G80 to cancel',
        ],
        answer: 'Non-modal (one-shot) exact stop check — applies to the next block only',
      },
      {
        id: 'cnc-la-4',
        type: 'choice',
        text: 'A Fanuc 16i has a block cycle time of 4ms. CAM generates 0.1mm segments. What is the maximum feedrate before the BCT bottleneck?',
        options: ['750 mm/min', '1500 mm/min', '3000 mm/min', '6000 mm/min'],
        answer: '1500 mm/min',
      },
      {
        id: 'cnc-la-5',
        type: 'choice',
        text: 'Following error (servo lag) is proportional to:',
        options: [
          'Spindle RPM',
          'Feedrate — higher feed = more lag',
          'Corner angle — sharper corners = more lag',
          'Tool length offset',
        ],
        answer: 'Feedrate — higher feed = more lag',
      },
      {
        id: 'cnc-la-6',
        type: 'choice',
        text: 'At a 90° corner in G64, the blend-through speed is approximately:',
        options: [
          '100% of F_max (no deceleration)',
          '70.7% of F_max',
          '50% of F_max',
          '0% — must stop at 90°',
        ],
        answer: '70.7% of F_max',
      },
      {
        id: 'cnc-la-7',
        type: 'choice',
        text: 'Dwell marks on a contoured surface are caused by:',
        options: [
          'G64 tolerance band being set too small',
          'G61 (or G61.1) causing the tool to pause at every corner while stationary',
          'NURBS interpolation rounding the path',
          'Feedrate overshoot at corners',
        ],
        answer: 'G61 (or G61.1) causing the tool to pause at every corner while stationary',
      },
      {
        id: 'cnc-la-8',
        type: 'choice',
        text: 'What is the advantage of NURBS/spline interpolation over short-segment G01 toolpaths?',
        options: [
          'NURBS does not require the controller to have a lookahead buffer',
          'The controller interpolates on a smooth mathematical curve — eliminating segment-count limitations and producing genuine smooth motion with far fewer blocks',
          'NURBS paths always run at exactly the programmed feedrate',
          'NURBS works only in G61 mode',
        ],
        answer: 'The controller interpolates on a smooth mathematical curve — eliminating segment-count limitations and producing genuine smooth motion with far fewer blocks',
      },
    ]
  },

  mentalModel: [
    'G64 = continuous/blend. G61 = exact stop. G61.1 = exact stop check. G09 = one-shot exact stop check.',
    'BCT bottleneck: F_max = (segment_length × 60,000) / BCT_ms. Short segments + slow controller = capped feedrate.',
    'Following error: E = F / (Kv × 1000). More speed = more servo lag = more corner rounding.',
    'Corner blend speed: v_corner = v_max × cos(Δθ/2). 90° → 70% speed. 180° → must stop.',
    'Dwell marks = G61 on contoured surfaces. Fix: use G64 with appropriate P tolerance.',
    'G09 on one line = exact stop on that move only. G64 continues after. The precision scalpel.',
    'NURBS (G5.1): smooth curve interpolation — eliminates the short-segment problem at the source.',
    'HSM recipe: G64 + correct BCT-limited segment length + AICC/lookahead option + correct Kv.',
  ],
}
