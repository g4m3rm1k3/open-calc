import geoRightTriTrigUrl from '../diagrams/geo-right-triangle-trig.svg?url'
import quizRightTriTrigUrl from '../diagrams/quiz-geo-right-triangle-trig.svg?url'

const LESSON_GEO_5_4 = {
  title: 'Right Triangle Trigonometry',
  subject: 'Geometry',
  sequential: true,

  cells: [
    {
      type: 'markdown',
      instruction: `### SOH-CAH-TOA: The Three Ratios That Rule Right Triangles

Label the sides **relative to the angle θ** — this label shifts when θ shifts.

| Side | Meaning |
|---|---|
| **Hypotenuse** | Always opposite the right angle — longest side |
| **Opposite** | The leg across from θ |
| **Adjacent** | The leg next to θ (not the hypotenuse) |

$$\\sin\\theta = \\frac{\\text{opp}}{\\text{hyp}} \\qquad \\cos\\theta = \\frac{\\text{adj}}{\\text{hyp}} \\qquad \\tan\\theta = \\frac{\\text{opp}}{\\text{adj}}$$

**Finding a side**: multiply the known side by the trig ratio.
**Finding an angle**: use the inverse ($\\sin^{-1}$, $\\cos^{-1}$, $\\tan^{-1}$).

**Pythagorean identity** (divide $a^2+b^2=c^2$ by $c^2$): $\\sin^2\\theta + \\cos^2\\theta = 1$`,
    },

    {
      type: 'js',
      instruction: `### Live SOH-CAH-TOA Explorer

Drag the angle slider. The right triangle redraws and all six trig ratios update instantly. Watch how "opposite" and "adjacent" **swap roles** when you look at the other acute angle — the hypotenuse never changes.`,
      html: `<div style="padding:8px 14px;background:var(--color-background-secondary,#f8fafc);display:flex;gap:16px;align-items:center;flex-wrap:wrap">
  <label style="font-family:Georgia,serif;font-size:13px">Angle θ: <input type="range" id="theta" min="5" max="85" value="35" style="width:180px"> <span id="thetaV" style="font-weight:700;color:#7c3aed;min-width:32px;display:inline-block">35°</span></label>
  <label style="font-family:Georgia,serif;font-size:13px">Hypotenuse: <input type="range" id="hyp" min="3" max="10" value="6" style="width:120px"> <span id="hypV" style="color:#1e3a5f;font-weight:700">6</span></label>
  <label style="font-family:Georgia,serif;font-size:12px"><input type="checkbox" id="showOther"> Show other angle (90°-θ)</label>
</div>
<canvas id="cv" width="700" height="260"></canvas>
<div id="info" style="padding:10px 16px;font-family:Georgia,serif;font-size:13px;background:var(--color-background-secondary,#f8fafc);border-top:1px solid var(--color-border-primary,#e2e8f0);line-height:2;display:grid;grid-template-columns:1fr 1fr;gap:4px 20px"></div>`,
      css: `body{margin:0;background:var(--color-background-secondary,#f8fafc)}canvas{display:block}`,
      startCode: `var cv=document.getElementById('cv'),ctx=cv.getContext('2d');
var W=cv.width,H=cv.height;


// dark-mode palette
var isDark=document.documentElement.classList.contains('dark');
var BG=isDark?'#1e293b':'#fafaf8';
var TEXT=isDark?'#e2e8f0':'#1e293b';
var MUTED=isDark?'#94a3b8':'#64748b';
var GRID=isDark?'#334155':'#e2e8f0';
var NAVY=isDark?'#93c5fd':'#1e3a5f';
var GREEN=isDark?'#4ade80':'#1a3a2a';
var AMBER=isDark?'#fb923c':'#92400e';
var PURPLE=isDark?'#a78bfa':'#7c3aed';
var RED=isDark?'#f87171':'#dc2626';
var BORDER=isDark?'#475569':'#d1d5db';

function draw(){
  ctx.clearRect(0,0,W,H);ctx.fillStyle=BG;ctx.fillRect(0,0,W,H);
  var deg=parseInt(document.getElementById('theta').value);
  var hyp=parseInt(document.getElementById('hyp').value);
  var showOther=document.getElementById('showOther').checked;
  document.getElementById('thetaV').textContent=deg+'°';
  document.getElementById('hypV').textContent=hyp;
  var activeAngle=showOther?(90-deg):deg;
  var rad=activeAngle*Math.PI/180;
  var opp=hyp*Math.sin(rad), adj=hyp*Math.cos(rad);
  var SCALE=36, ox=140, oy=220;
  var bx=ox+adj*SCALE, by=oy;
  var cx=bx, cy=oy-opp*SCALE;

  // Adjacent (green)
  ctx.beginPath();ctx.moveTo(ox,oy);ctx.lineTo(bx,by);
  ctx.strokeStyle=GREEN;ctx.lineWidth=3;ctx.stroke();
  // Opposite (red)
  ctx.beginPath();ctx.moveTo(bx,by);ctx.lineTo(cx,cy);
  ctx.strokeStyle='#dc2626';ctx.lineWidth=3;ctx.stroke();
  // Hypotenuse (blue)
  ctx.beginPath();ctx.moveTo(ox,oy);ctx.lineTo(cx,cy);
  ctx.strokeStyle=NAVY;ctx.lineWidth=3;ctx.stroke();

  // Right angle box
  var s=14;ctx.beginPath();ctx.moveTo(bx-s,by);ctx.lineTo(bx-s,cy+s);ctx.lineTo(bx,cy+s);
  ctx.strokeStyle=TEXT;ctx.lineWidth=1.8;ctx.stroke();

  // Angle arc
  var arcR=44;
  ctx.beginPath();ctx.arc(ox,oy,-0,(-rad),0,true);
  // simpler: draw arc from A
  ctx.beginPath();ctx.arc(ox,oy,arcR,-Math.PI/2+Math.PI/2,0,false);
  // Correct arc for angle from horizontal
  ctx.beginPath();ctx.arc(ox,oy,arcR,0,-rad,true);
  ctx.strokeStyle=PURPLE;ctx.lineWidth=2;ctx.stroke();

  // Labels
  ctx.font='bold 14px Georgia';ctx.textAlign='center';
  ctx.fillStyle=PURPLE;ctx.fillText(activeAngle+'°',ox+60,oy-10);
  ctx.fillStyle=GREEN;ctx.fillText('adj = '+adj.toFixed(2),ox+adj*SCALE/2,oy+22);
  ctx.fillStyle=RED;ctx.fillText('opp = '+opp.toFixed(2),bx+52,oy-opp*SCALE/2);
  ctx.fillStyle=NAVY;ctx.font='13px Georgia';
  var mx=(ox+cx)/2,my=(oy+cy)/2;
  ctx.save();ctx.translate(mx,my);ctx.rotate(-rad);ctx.fillText('hyp = '+hyp,0,-12);ctx.restore();
  // Vertices
  [{p:[ox,oy],l:'A'},{p:[bx,by],l:'B'},{p:[cx,cy],l:'C'}].forEach(function(v){
    ctx.beginPath();ctx.arc(v.p[0],v.p[1],5,0,Math.PI*2);ctx.fillStyle=NAVY;ctx.fill();
    ctx.fillStyle=TEXT;ctx.font='bold 13px Georgia';ctx.textAlign='center';
    ctx.fillText(v.l,v.p[0]+(v.l==='B'?16:v.l==='C'?16:-16),v.p[1]+(v.l==='A'?18:v.l==='B'?18:-10));
  });

  // Trig ratios panel
  var s_=Math.sin(rad),c_=Math.cos(rad),t_=Math.tan(rad);
  var infoEl=document.getElementById('info');
  infoEl.innerHTML=
    '<span><b style="color:#7c3aed">θ = '+activeAngle+'°</b></span>'
    +'<span>Pythagorean check: '+opp.toFixed(2)+'² + '+adj.toFixed(2)+'² = '+(opp*opp+adj*adj).toFixed(1)+' = '+hyp+'²</span>'
    +'<span><b style="color:#dc2626">sin θ</b> = opp/hyp = '+opp.toFixed(3)+'/'+hyp+' = <b>'+s_.toFixed(4)+'</b></span>'
    +'<span><b style="color:#7c3aed">csc θ</b> = hyp/opp = <b>'+(1/s_).toFixed(4)+'</b></span>'
    +'<span><b style="color:#166534">cos θ</b> = adj/hyp = '+adj.toFixed(3)+'/'+hyp+' = <b>'+c_.toFixed(4)+'</b></span>'
    +'<span><b style="color:#7c3aed">sec θ</b> = hyp/adj = <b>'+(1/c_).toFixed(4)+'</b></span>'
    +'<span><b style="color:#b45309">tan θ</b> = opp/adj = <b>'+t_.toFixed(4)+'</b></span>'
    +'<span><b style="color:#7c3aed">cot θ</b> = adj/opp = <b>'+(1/t_).toFixed(4)+'</b></span>';
}

['theta','hyp','showOther'].forEach(function(id){
  document.getElementById(id).addEventListener('input',draw);
  document.getElementById(id).addEventListener('change',draw);
});
draw();`,
      outputHeight: 440,
    },

    {
      type: 'js',
      instruction: `### Find the Missing Side or Angle

This is the core skill: given one side and one angle (or two sides), find everything else. Select what you know, enter the values, and the solver shows you the exact trig setup — not just the answer but the method.`,
      html: `<div style="padding:10px 16px;background:var(--color-background-secondary,#f8fafc);display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px;align-items:end">
  <div>
    <div style="font-family:Georgia,serif;font-size:12px;color:#374151;margin-bottom:4px">I know the angle θ</div>
    <input type="number" id="knownAngle" placeholder="e.g. 38" style="width:100%;padding:6px;border-radius:5px;border:1.5px solid #1e3a5f;font-family:Georgia,serif;font-size:14px">
  </div>
  <div>
    <div style="font-family:Georgia,serif;font-size:12px;color:#374151;margin-bottom:4px">I know this side</div>
    <select id="knownSide" style="width:100%;padding:6px;border-radius:5px;border:1.5px solid #1e3a5f;font-family:Georgia,serif;font-size:13px">
      <option value="hyp">Hypotenuse</option>
      <option value="opp">Opposite</option>
      <option value="adj">Adjacent</option>
    </select>
  </div>
  <div>
    <div style="font-family:Georgia,serif;font-size:12px;color:#374151;margin-bottom:4px">Its length</div>
    <input type="number" id="knownLen" placeholder="e.g. 10" style="width:100%;padding:6px;border-radius:5px;border:1.5px solid #1e3a5f;font-family:Georgia,serif;font-size:14px">
  </div>
</div>
<div style="padding:4px 16px 8px;background:var(--color-background-secondary,#f8fafc)">
  <div style="font-family:Georgia,serif;font-size:12px;color:#374151;margin-bottom:4px">Or: I know two sides (enter both, leave angle blank)</div>
  <div style="display:flex;gap:10px;flex-wrap:wrap">
    <label style="font-family:Georgia,serif;font-size:12px">Side 1: <select id="side1" style="padding:4px;border-radius:4px;border:1px solid #94a3b8"><option value="opp">opp</option><option value="adj">adj</option><option value="hyp">hyp</option></select> = <input type="number" id="side1v" placeholder="length" style="width:70px;padding:4px;border-radius:4px;border:1px solid #94a3b8"></label>
    <label style="font-family:Georgia,serif;font-size:12px">Side 2: <select id="side2" style="padding:4px;border-radius:4px;border:1px solid #94a3b8"><option value="hyp">hyp</option><option value="adj">adj</option><option value="opp">opp</option></select> = <input type="number" id="side2v" placeholder="length" style="width:70px;padding:4px;border-radius:4px;border:1px solid #94a3b8"></label>
    <button id="solveBtn" style="padding:6px 18px;background:#1e3a5f;color:#fff;border:none;border-radius:6px;font-family:Georgia,serif;font-size:13px;cursor:pointer">Solve →</button>
  </div>
</div>
<canvas id="cv" width="700" height="200"></canvas>
<div id="steps" style="padding:10px 16px;font-family:Georgia,serif;font-size:13px;background:var(--color-background-secondary,#f8fafc);border-top:1px solid var(--color-border-primary,#e2e8f0);line-height:2;min-height:60px"></div>`,
      css: `body{margin:0;background:var(--color-background-secondary,#f8fafc)}canvas{display:block}`,
      startCode: `var cv=document.getElementById('cv'),ctx=cv.getContext('2d');
var W=cv.width,H=cv.height;

// dark-mode palette
var isDark=document.documentElement.classList.contains('dark');
var BG=isDark?'#1e293b':'#fafaf8';
var TEXT=isDark?'#e2e8f0':'#1e293b';
var MUTED=isDark?'#94a3b8':'#64748b';
var GRID=isDark?'#334155':'#e2e8f0';
var NAVY=isDark?'#93c5fd':'#1e3a5f';
var GREEN=isDark?'#4ade80':'#1a3a2a';
var AMBER=isDark?'#fb923c':'#92400e';
var PURPLE=isDark?'#a78bfa':'#7c3aed';
var RED=isDark?'#f87171':'#dc2626';
var BORDER=isDark?'#475569':'#d1d5db';

var result={deg:0,opp:0,adj:0,hyp:0};

function drawTriangle(deg,opp,adj,hyp,labelTarget){
  ctx.clearRect(0,0,W,H);ctx.fillStyle=BG;ctx.fillRect(0,0,W,H);
  if(!hyp||hyp<=0)return;
  var maxDim=Math.max(opp,adj);
  var SCALE=Math.min(120/maxDim,20);
  var ox=120,oy=H-40;
  var bx=ox+adj*SCALE,by=oy,cx=bx,cy=oy-opp*SCALE;
  var colors={hyp:'#1e3a5f',opp:'#dc2626',adj:'#166534'};
  [[ox,oy,cx,cy,'hyp'],[bx,by,cx,cy,'opp'],[ox,oy,bx,by,'adj']].forEach(function(s){
    ctx.beginPath();ctx.moveTo(s[0],s[1]);ctx.lineTo(s[2],s[3]);
    ctx.strokeStyle=colors[s[4]];ctx.lineWidth=s[4]===labelTarget?4:2.5;ctx.stroke();
  });
  var ra=14;ctx.beginPath();ctx.moveTo(bx-ra,by);ctx.lineTo(bx-ra,cy+ra);ctx.lineTo(bx,cy+ra);ctx.strokeStyle=TEXT;ctx.lineWidth=1.5;ctx.stroke();
  var rad=deg*Math.PI/180;
  ctx.beginPath();ctx.arc(ox,oy,36,0,-rad,true);ctx.strokeStyle=PURPLE;ctx.lineWidth=2;ctx.stroke();
  ctx.fillStyle=PURPLE;ctx.font='bold 13px Georgia';ctx.textAlign='center';ctx.fillText(deg.toFixed(1)+'°',ox+56,oy-10);
  ctx.fillStyle=GREEN;ctx.fillText('adj='+adj.toFixed(2),ox+adj*SCALE/2,oy+18);
  ctx.fillStyle=RED;ctx.fillText('opp='+opp.toFixed(2),bx+40,oy-opp*SCALE/2);
  ctx.fillStyle=NAVY;ctx.font='12px Georgia';ctx.fillText('hyp='+hyp.toFixed(2),(ox+cx)/2-20,(oy+cy)/2-10);
}

function solve(){
  var angleVal=parseFloat(document.getElementById('knownAngle').value);
  var sideType=document.getElementById('knownSide').value;
  var sideLen=parseFloat(document.getElementById('knownLen').value);
  var s1type=document.getElementById('side1').value;
  var s1val=parseFloat(document.getElementById('side1v').value);
  var s2type=document.getElementById('side2').value;
  var s2val=parseFloat(document.getElementById('side2v').value);
  var steps='',deg=0,opp=0,adj=0,hyp=0,target='';

  if(!isNaN(angleVal)&&!isNaN(sideLen)){
    var rad=angleVal*Math.PI/180;
    deg=angleVal;
    if(sideType==='hyp'){hyp=sideLen;opp=hyp*Math.sin(rad);adj=hyp*Math.cos(rad);target='hyp';
      steps='<b>Known:</b> θ='+deg+'°, hyp='+hyp+'<br>'
        +'opp = hyp × sin θ = '+hyp+' × sin('+deg+'°) = <b>'+opp.toFixed(4)+'</b><br>'
        +'adj = hyp × cos θ = '+hyp+' × cos('+deg+'°) = <b>'+adj.toFixed(4)+'</b>';}
    else if(sideType==='opp'){opp=sideLen;hyp=opp/Math.sin(rad);adj=hyp*Math.cos(rad);target='opp';
      steps='<b>Known:</b> θ='+deg+'°, opp='+opp+'<br>'
        +'hyp = opp / sin θ = '+opp+' / sin('+deg+'°) = <b>'+hyp.toFixed(4)+'</b><br>'
        +'adj = hyp × cos θ = <b>'+adj.toFixed(4)+'</b>';}
    else{adj=sideLen;hyp=adj/Math.cos(rad);opp=hyp*Math.sin(rad);target='adj';
      steps='<b>Known:</b> θ='+deg+'°, adj='+adj+'<br>'
        +'hyp = adj / cos θ = '+adj+' / cos('+deg+'°) = <b>'+hyp.toFixed(4)+'</b><br>'
        +'opp = hyp × sin θ = <b>'+opp.toFixed(4)+'</b>';}
  } else if(!isNaN(s1val)&&!isNaN(s2val)){
    var vals={};vals[s1type]=s1val;vals[s2type]=s2val;
    if(vals.opp&&vals.hyp){opp=vals.opp;hyp=vals.hyp;adj=Math.sqrt(hyp*hyp-opp*opp);deg=Math.asin(opp/hyp)*180/Math.PI;
      steps='sin θ = opp/hyp = '+opp+'/'+hyp+' = '+(opp/hyp).toFixed(4)+'<br>θ = sin⁻¹('+(opp/hyp).toFixed(4)+') = <b>'+deg.toFixed(2)+'°</b><br>adj = √(hyp²-opp²) = <b>'+adj.toFixed(4)+'</b>';target='opp';}
    else if(vals.adj&&vals.hyp){adj=vals.adj;hyp=vals.hyp;opp=Math.sqrt(hyp*hyp-adj*adj);deg=Math.acos(adj/hyp)*180/Math.PI;
      steps='cos θ = adj/hyp = '+adj+'/'+hyp+'<br>θ = cos⁻¹('+(adj/hyp).toFixed(4)+') = <b>'+deg.toFixed(2)+'°</b><br>opp = √(hyp²-adj²) = <b>'+opp.toFixed(4)+'</b>';target='adj';}
    else if(vals.opp&&vals.adj){opp=vals.opp;adj=vals.adj;hyp=Math.sqrt(opp*opp+adj*adj);deg=Math.atan(opp/adj)*180/Math.PI;
      steps='tan θ = opp/adj = '+opp+'/'+adj+'<br>θ = tan⁻¹('+(opp/adj).toFixed(4)+') = <b>'+deg.toFixed(2)+'°</b><br>hyp = √(opp²+adj²) = <b>'+hyp.toFixed(4)+'</b>';target='opp';}
    else{steps='Enter two different sides.';}
  } else {steps='Enter an angle + one side, or any two sides.';}
  document.getElementById('steps').innerHTML=steps;
  if(deg&&opp&&adj&&hyp)drawTriangle(deg,opp,adj,hyp,target);
}

document.getElementById('solveBtn').addEventListener('click',solve);
['knownAngle','knownLen'].forEach(function(id){document.getElementById(id).addEventListener('keyup',solve);});
`,
      outputHeight: 460,
    },

    {
      type: 'js',
      instruction: `### Angle of Elevation and Depression

Real-world trig always involves a horizontal reference. **Angle of elevation** = looking up; **angle of depression** = looking down. Both are measured from the horizontal line, not from vertical. Drag the observer position and see how the setup changes.`,
      html: `<div style="padding:8px 14px;background:var(--color-background-secondary,#f8fafc);display:flex;gap:16px;align-items:center;flex-wrap:wrap">
  <label style="font-family:Georgia,serif;font-size:13px">Distance to base: <input type="range" id="dist" min="3" max="16" value="8" style="width:130px"> <span id="distV" style="color:#166534;font-weight:700">8</span> m</label>
  <label style="font-family:Georgia,serif;font-size:13px">Height: <input type="range" id="ht" min="2" max="12" value="5" style="width:130px"> <span id="htV" style="color:#dc2626;font-weight:700">5</span> m</label>
  <select id="scenarioEl" style="padding:5px 10px;border-radius:6px;border:1.5px solid #1e3a5f;font-family:Georgia,serif;font-size:13px">
    <option value="elev">Angle of Elevation (looking up at tower)</option>
    <option value="dep">Angle of Depression (looking down from cliff)</option>
  </select>
</div>
<canvas id="cv" width="700" height="230"></canvas>
<div id="info" style="padding:10px 16px;font-family:Georgia,serif;font-size:13px;background:var(--color-background-secondary,#f8fafc);border-top:1px solid var(--color-border-primary,#e2e8f0);line-height:1.9"></div>`,
      css: `body{margin:0;background:var(--color-background-secondary,#f8fafc)}canvas{display:block}`,
      startCode: `var cv=document.getElementById('cv'),ctx=cv.getContext('2d');
var W=cv.width,H=cv.height;


// dark-mode palette
var isDark=document.documentElement.classList.contains('dark');
var BG=isDark?'#1e293b':'#fafaf8';
var TEXT=isDark?'#e2e8f0':'#1e293b';
var MUTED=isDark?'#94a3b8':'#64748b';
var GRID=isDark?'#334155':'#e2e8f0';
var NAVY=isDark?'#93c5fd':'#1e3a5f';
var GREEN=isDark?'#4ade80':'#1a3a2a';
var AMBER=isDark?'#fb923c':'#92400e';
var PURPLE=isDark?'#a78bfa':'#7c3aed';
var RED=isDark?'#f87171':'#dc2626';
var BORDER=isDark?'#475569':'#d1d5db';

function draw(){
  ctx.clearRect(0,0,W,H);ctx.fillStyle=BG;ctx.fillRect(0,0,W,H);
  var d=parseInt(document.getElementById('dist').value);
  var h=parseInt(document.getElementById('ht').value);
  var scenario=document.getElementById('scenarioEl').value;
  document.getElementById('distV').textContent=d;
  document.getElementById('htV').textContent=h;
  var SCALE=12;
  var elevAngle=Math.atan(h/d)*180/Math.PI;

  if(scenario==='elev'){
    // Observer at left ground level, tower at right
    var ox=80,oy=180;
    var bx=ox+d*SCALE,by=oy;
    var tx=bx,ty=oy-h*SCALE;
    // Ground line extended
    ctx.beginPath();ctx.moveTo(40,oy);ctx.lineTo(W-40,oy);ctx.strokeStyle='#94a3b8';ctx.lineWidth=1.5;ctx.setLineDash([6,4]);ctx.stroke();ctx.setLineDash([]);
    // Tower
    ctx.beginPath();ctx.moveTo(tx,by);ctx.lineTo(tx,ty);ctx.strokeStyle=NAVY;ctx.lineWidth=4;ctx.stroke();
    // Distance on ground
    ctx.beginPath();ctx.moveTo(ox,oy);ctx.lineTo(bx,by);ctx.strokeStyle=GREEN;ctx.lineWidth=2.5;ctx.stroke();
    // Line of sight
    ctx.beginPath();ctx.moveTo(ox,oy);ctx.lineTo(tx,ty);ctx.strokeStyle='#dc2626';ctx.lineWidth=2;ctx.setLineDash([5,4]);ctx.stroke();ctx.setLineDash([]);
    // Height label
    ctx.strokeStyle=NAVY;ctx.beginPath();ctx.moveTo(tx+4,by);ctx.lineTo(tx+4,ty);ctx.lineWidth=1.5;ctx.stroke();
    // Angle arc
    ctx.beginPath();ctx.arc(ox,oy,48,0,-Math.atan(h/d),true);ctx.strokeStyle=PURPLE;ctx.lineWidth=2;ctx.stroke();
    // Labels
    ctx.fillStyle=PURPLE;ctx.font='bold 13px Georgia';ctx.textAlign='center';ctx.fillText(elevAngle.toFixed(1)+'°',ox+66,oy-12);
    ctx.fillStyle=GREEN;ctx.fillText(d+' m',ox+d*SCALE/2,oy+18);
    ctx.fillStyle=NAVY;ctx.fillText(h+' m',tx+28,oy-h*SCALE/2);
    ctx.fillStyle=NAVY;ctx.font='bold 12px Georgia';ctx.fillText('Tower',tx,ty-12);
    ctx.fillStyle=TEXT;ctx.fillText('Observer',ox,oy+28);
    // Elevation arc label
    ctx.fillStyle=PURPLE;ctx.font='11px Georgia';ctx.fillText('angle of elevation',ox+90,oy-28);
    document.getElementById('info').innerHTML=
      'tan θ = opposite / adjacent = height / distance = '+h+'/'+d+' = '+(h/d).toFixed(3)
      +'<br><b>θ = tan⁻¹('+h+'/'+d+') = '+elevAngle.toFixed(2)+'°</b>'
      +'&emsp;|&emsp;Line of sight = hypotenuse = √('+d+'² + '+h+'²) = '+Math.sqrt(d*d+h*h).toFixed(2)+' m';
  } else {
    // Observer on cliff (top-left), looks down at boat (bottom-right)
    var cliffH=h*SCALE,cliffX=80;
    var groundY=180,topY=groundY-cliffH;
    var boatX=cliffX+d*SCALE,boatY=groundY;
    // Cliff
    ctx.fillStyle='#94a3b8';ctx.fillRect(40,topY,cliffX-20,cliffH+4);ctx.strokeStyle=TEXT;ctx.lineWidth=1;ctx.strokeRect(40,topY,cliffX-20,cliffH+4);
    ctx.beginPath();ctx.moveTo(40,groundY+4);ctx.lineTo(W-40,groundY+4);ctx.strokeStyle='#94a3b8';ctx.lineWidth=2;ctx.stroke();
    // Horizontal reference from cliff top
    ctx.beginPath();ctx.moveTo(cliffX,topY);ctx.lineTo(W-40,topY);ctx.strokeStyle='#94a3b8';ctx.lineWidth=1.5;ctx.setLineDash([6,4]);ctx.stroke();ctx.setLineDash([]);
    // Vertical cliff face
    ctx.beginPath();ctx.moveTo(cliffX,topY);ctx.lineTo(cliffX,groundY);ctx.strokeStyle=TEXT;ctx.lineWidth=2;ctx.stroke();
    // Horizontal distance
    ctx.beginPath();ctx.moveTo(cliffX,groundY);ctx.lineTo(boatX,boatY);ctx.strokeStyle=GREEN;ctx.lineWidth=2.5;ctx.stroke();
    // Line of sight
    ctx.beginPath();ctx.moveTo(cliffX,topY);ctx.lineTo(boatX,boatY);ctx.strokeStyle='#dc2626';ctx.lineWidth=2;ctx.setLineDash([5,4]);ctx.stroke();ctx.setLineDash([]);
    // Angle of depression arc (below horizontal at cliff top)
    ctx.beginPath();ctx.arc(cliffX,topY,44,0,Math.atan(h/d));ctx.strokeStyle=PURPLE;ctx.lineWidth=2;ctx.stroke();
    // Labels
    ctx.fillStyle=PURPLE;ctx.font='bold 13px Georgia';ctx.textAlign='center';ctx.fillText(elevAngle.toFixed(1)+'°',cliffX+62,topY+20);
    ctx.fillStyle=GREEN;ctx.fillText(d+' m',cliffX+d*SCALE/2,groundY+18);
    ctx.fillStyle=TEXT;ctx.fillText('h='+h+' m',cliffX-28,topY+cliffH/2);
    ctx.fillText('Observer',cliffX,topY-12);
    ctx.fillText('Boat',boatX,boatY+18);
    ctx.fillStyle=PURPLE;ctx.font='11px Georgia';ctx.fillText('angle of depression',cliffX+95,topY+18);
    document.getElementById('info').innerHTML=
      'Angle of depression = angle of elevation (alternate interior angles with parallel horizontal lines)'
      +'<br>tan θ = height / horizontal = '+h+'/'+d+' → <b>θ = '+elevAngle.toFixed(2)+'°</b>'
      +'&emsp;|&emsp;Distance = √('+d+'²+'+h+'²) = '+Math.sqrt(d*d+h*h).toFixed(2)+' m';
  }
}

['dist','ht','scenarioEl'].forEach(function(id){
  document.getElementById(id).addEventListener('input',draw);
  document.getElementById(id).addEventListener('change',draw);
});
draw();`,
      outputHeight: 380,
    },

    {
      type: 'challenge',
      instruction: `In Triangle 1 of the diagram (sides 3, 4, 5), what is $\\sin\\theta$ where $\\theta$ is the angle at vertex A?`,
      options: [
        { label: 'A', text: '$\\sin\\theta = \\frac{4}{5}$' },
        { label: 'B', text: '$\\sin\\theta = \\frac{3}{5}$' },
        { label: 'C', text: '$\\sin\\theta = \\frac{3}{4}$' },
        { label: 'D', text: '$\\sin\\theta = \\frac{4}{3}$' },
      ],
      check: (label) => label === 'B',
      successMessage: 'Correct. From angle A: opposite = BC = 3, hypotenuse = AC = 5. sin θ = opp/hyp = 3/5. The side adjacent to A is AB = 4, so cos θ = 4/5 and tan θ = 3/4.',
      failMessage: 'From angle A: opposite = the side across from A = BC = 3. Hypotenuse = the longest side = AC = 5. sin θ = opp/hyp = 3/5. Watch out: sin uses opposite, cos uses adjacent.',
      html: '', css: 'body{margin:0}', startCode: '', outputHeight: 260,
    },

    {
      type: 'challenge',
      instruction: `A ladder leans against a wall. The ladder is $10$ m long and makes a $65°$ angle with the ground. How high up the wall does the ladder reach?`,
      options: [
        { label: 'A', text: '$10 \\cos 65° \\approx 4.23$ m' },
        { label: 'B', text: '$10 \\tan 65° \\approx 21.4$ m' },
        { label: 'C', text: '$10 \\sin 65° \\approx 9.06$ m' },
        { label: 'D', text: '$\\frac{10}{\\sin 65°} \\approx 11.03$ m' },
      ],
      check: (label) => label === 'C',
      successMessage: 'Correct. The wall height is opposite the 65° angle. The ladder (10 m) is the hypotenuse. opp = hyp × sin θ = 10 × sin 65° ≈ 10 × 0.906 ≈ 9.06 m.',
      failMessage: 'The height of the wall is opposite the 65° angle. The ladder is the hypotenuse. Use sin: opp = hyp × sin θ = 10 × sin 65° ≈ 9.06 m. cos 65° would give the ground distance, not the height.',
      html: '', css: 'body{margin:0}', startCode: '', outputHeight: 260,
    },
  ],
};

export default {
  id: 'geo-5-4',
  slug: 'right-triangle-trig',
  chapter: 'geometry-5',
  subject: 'Geometry',
  title: 'Right Triangle Trigonometry',
  subtitle: 'SOH-CAH-TOA: the three ratios that let you find any side or angle in a right triangle',
  tags: ['geometry', 'trigonometry', 'soh-cah-toa', 'sine', 'cosine', 'tangent', 'angle-of-elevation', 'angle-of-depression'],
  hook: {
    question: 'How do surveyors measure the height of a mountain without climbing it?',
    realWorldContext: 'Right triangle trigonometry is the engine behind GPS, architecture, engineering, navigation, and physics. Every time a bridge is designed, a satellite tracked, or a ramp built, someone is solving for a missing side or angle using sin, cos, or tan. This is the most-used geometry topic outside the classroom.',
  },
  intuition: {
    blocks: [
      {
        type: 'prose',
        paragraphs: [
          '**The key insight**: In similar right triangles, the ratios of sides are identical regardless of size. A 30° right triangle always has the same side ratios — doubling the triangle doubles all sides but leaves their ratios unchanged. Trigonometry names and tables these ratios.',
          'Label sides relative to the angle you care about: **opposite** faces it, **adjacent** is next to it, **hypotenuse** is always opposite the right angle (and always the longest side). The labels shift if you switch which acute angle you\'re working from.',
        ],
      },
      {
        type: 'image',
        src: geoRightTriTrigUrl,
        alt: 'Right triangle labeled with opposite, adjacent, and hypotenuse relative to angle θ. SOH-CAH-TOA box: sin=opp/hyp, cos=adj/hyp, tan=opp/adj. All six trig functions listed. Pythagorean identity sin²θ+cos²θ=1 at bottom.',
        caption: 'SOH-CAH-TOA. All six ratios come from three sides. Cosecant, secant, cotangent are just reciprocals of sin, cos, tan — rarely needed but good to know.',
      },
      {
        type: 'math',
        tex: '\\sin\\theta = \\frac{\\text{opp}}{\\text{hyp}} \\qquad \\cos\\theta = \\frac{\\text{adj}}{\\text{hyp}} \\qquad \\tan\\theta = \\frac{\\text{opp}}{\\text{adj}} = \\frac{\\sin\\theta}{\\cos\\theta}',
        caption: 'The three primary ratios. tan is the ratio of the other two — useful identity.',
      },
      {
        type: 'prose',
        paragraphs: [
          '**Finding a missing side**: rearrange the ratio formula. If you know hyp and θ, then opp = hyp × sin θ. If you know opp and θ, then hyp = opp ÷ sin θ.',
          '**Finding a missing angle**: use inverse trig. If sin θ = 0.6, then θ = sin⁻¹(0.6) ≈ 36.87°. Inverse trig buttons on a calculator are labeled sin⁻¹ (or arcsin), cos⁻¹, tan⁻¹.',
          '**Angle of elevation and depression**: both are measured from the horizontal. The angle of depression from one point equals the angle of elevation from the other — alternate interior angles with parallel horizontal lines.',
        ],
      },
      {
        type: 'math',
        tex: '\\text{Find side: } \\text{opp} = \\text{hyp}\\cdot\\sin\\theta \\qquad \\text{Find angle: } \\theta = \\sin^{-1}\\!\\left(\\frac{\\text{opp}}{\\text{hyp}}\\right)',
        caption: 'The two operations: multiply to find a side, inverse-trig to find the angle.',
      },
      {
        type: 'viz',
        id: 'ScienceNotebook',
        props: { lesson: LESSON_GEO_5_4 },
        mathBridge: 'Drag the angle slider to see all six trig ratios update live — watch how the values of sin and cos swap roles as θ approaches 0° or 90°. Use the solver to practice: enter any angle + one side and get the full worked solution with method shown.',
      },
    ],
  },
  mentalModel: [
    'SOH-CAH-TOA: sin=opp/hyp, cos=adj/hyp, tan=opp/adj. Labels are RELATIVE to the angle — they shift when the angle shifts',
    'To find a side: rearrange the ratio (opp = hyp·sinθ, adj = hyp·cosθ, etc.)',
    'To find an angle: use inverse trig — θ = sin⁻¹(opp/hyp), etc.',
    'Angle of elevation = angle of depression (alternate interior angles). Both measured from horizontal, never from vertical',
    'Pythagorean identity: sin²θ + cos²θ = 1 (divide a²+b²=c² by c²)',
  ],
  quiz: [
    {
      id: 'q1',
      type: 'choice',
      diagram: quizRightTriTrigUrl,
      diagramAlt: 'Three right triangles labeled Triangle 1 (3-4-5), Triangle 2 (angle=40°, adj=10, find opp=x), Triangle 3 (find angle, opp=7, hyp=12)',
      text: 'In Triangle 1, what is $\\cos\\theta$ at vertex A?',
      options: ['$\\frac{3}{5}$', '$\\frac{4}{5}$', '$\\frac{3}{4}$', '$\\frac{4}{3}$'],
      correct: 1,
    },
    {
      id: 'q2',
      type: 'choice',
      diagram: quizRightTriTrigUrl,
      diagramAlt: 'Three right triangles labeled Triangle 1 (3-4-5), Triangle 2 (angle=40°, adj=10, find opp=x), Triangle 3 (find angle, opp=7, hyp=12)',
      text: 'In Triangle 2, find the value of $x$ (the opposite side) when $\\theta = 40°$ and the adjacent side $= 10$.',
      options: [
        '$x = 10 \\sin 40° \\approx 6.43$',
        '$x = 10 \\tan 40° \\approx 8.39$',
        '$x = 10 \\cos 40° \\approx 7.66$',
        '$x = \\frac{10}{\\sin 40°} \\approx 15.56$',
      ],
      correct: 1,
    },
    {
      id: 'q3',
      type: 'choice',
      diagram: quizRightTriTrigUrl,
      diagramAlt: 'Three right triangles labeled Triangle 1 (3-4-5), Triangle 2 (angle=40°, adj=10, find opp=x), Triangle 3 (find angle, opp=7, hyp=12)',
      text: 'In Triangle 3, find angle $\\theta$ when opposite $= 7$ and hypotenuse $= 12$.',
      options: [
        '$\\theta = \\cos^{-1}(7/12) \\approx 54.3°$',
        '$\\theta = \\tan^{-1}(7/12) \\approx 30.3°$',
        '$\\theta = \\sin^{-1}(7/12) \\approx 35.7°$',
        '$\\theta = \\sin^{-1}(12/7)$ — undefined',
      ],
      correct: 2,
    },
    {
      id: 'q4',
      type: 'choice',
      text: 'A $15$ m ladder leans against a wall at $72°$ to the ground. How far is the base of the ladder from the wall?',
      options: [
        '$15 \\sin 72° \\approx 14.3$ m',
        '$15 \\cos 72° \\approx 4.6$ m',
        '$15 \\tan 72° \\approx 46.2$ m',
        '$\\frac{15}{\\tan 72°} \\approx 4.9$ m',
      ],
      correct: 1,
    },
    {
      id: 'q5',
      type: 'choice',
      text: 'From a point $50$ m from the base of a building, the angle of elevation to the top is $38°$. How tall is the building?',
      options: [
        '$50 \\cos 38° \\approx 39.4$ m',
        '$50 \\sin 38° \\approx 30.8$ m',
        '$50 \\tan 38° \\approx 39.1$ m',
        '$\\frac{50}{\\tan 38°} \\approx 64.0$ m',
      ],
      correct: 2,
    },
    {
      id: 'q6',
      type: 'choice',
      text: 'A right triangle has legs $5$ and $12$. What is $\\tan$ of the angle opposite the side of length $5$?',
      options: [
        '$\\frac{12}{13}$',
        '$\\frac{5}{12}$',
        '$\\frac{5}{13}$',
        '$\\frac{12}{5}$',
      ],
      correct: 1,
    },
    {
      id: 'q7',
      type: 'choice',
      text: 'Which equation correctly finds the hypotenuse $c$ given angle $\\theta = 28°$ and opposite side $= 9$?',
      options: [
        '$c = 9 \\times \\sin 28°$',
        '$c = \\frac{9}{\\sin 28°}$',
        '$c = 9 \\times \\cos 28°$',
        '$c = \\frac{9}{\\cos 28°}$',
      ],
      correct: 1,
    },
    {
      id: 'q8',
      type: 'choice',
      text: 'From a cliff $80$ m high, a ship is spotted at an angle of depression of $22°$. How far is the ship from the base of the cliff?',
      options: [
        '$80 \\tan 22° \\approx 32.3$ m',
        '$80 \\sin 22° \\approx 30.0$ m',
        '$\\frac{80}{\\tan 22°} \\approx 198.0$ m',
        '$\\frac{80}{\\sin 22°} \\approx 213.5$ m',
      ],
      correct: 2,
    },
    {
      id: 'q9',
      type: 'choice',
      text: 'If $\\sin\\theta = 0.8$, what is $\\cos\\theta$? (Use the Pythagorean identity.)',
      options: [
        '$0.2$',
        '$0.6$',
        '$0.64$',
        '$\\sqrt{0.36} = 0.6$',
      ],
      correct: 3,
    },
    {
      id: 'q10',
      type: 'choice',
      text: 'The angle of elevation from point A to the top of a tower is $40°$. From point B, $30$ m closer to the tower on the same horizontal line, it is $60°$. Which trig setup correctly models this situation?',
      options: [
        'Set up two equations: $\\tan 40° = h/(d+30)$ and $\\tan 60° = h/d$, then solve for $h$',
        'Use $h = 30 \\tan 40°$ directly',
        'Use $h = 30 \\sin 60°$ directly',
        'Set up $\\sin 40°/h = \\sin 60°/(h-30)$',
      ],
      correct: 0,
    },
  ],
};

export { LESSON_GEO_5_4 };
