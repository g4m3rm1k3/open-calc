// Three.js · Chapter 0 · Lesson 2
// Vectors for Graphics

const LESSON_3JS_0_2 = {
  title: 'Vectors for Graphics',
  subtitle: 'The mathematical language of position, direction, colour, and light.',
  sequential: true,

  cells: [

    // ── Cell 1: What is a vector? ─────────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `### Vectors — The Language of 3D Graphics

Everything in a 3D scene is a vector:

| Quantity | Example vector | What it represents |
|---|---|---|
| Position | \`(3.0, 1.5, -5.0)\` | Where an object lives in the world |
| Direction | \`(0.0, 1.0, 0.0)\` | Which way is "up" |
| Surface normal | \`(0.577, 0.577, 0.577)\` | Which way a face is pointing |
| Vertex colour | \`(1.0, 0.5, 0.0)\` | RGB orange (values 0→1) |
| UV coordinate | \`(0.25, 0.75)\` | A texture address |
| Light direction | \`(-0.7, 0.7, 0.0)\` | Where light comes from |

A vector is simply an ordered list of numbers. In 3D graphics we use **vec2**, **vec3**, and **vec4** — 2, 3, and 4 numbers respectively. Each number is a component.

**The three operations you will use in virtually every shader:**

1. **Magnitude (length):** \`|A| = √(x² + y² + z²)\` — how long the vector is
2. **Normalisation:** \`Â = A ÷ |A|\` — rescale so the length is exactly 1.0
3. **Dot product:** \`A · B = axbx + ayby + azbz\` — encodes the angle between two directions

**Why normalisation is so critical:** The lighting equation works correctly only when the normal and light direction are both unit vectors (length = 1). If you forget to normalise, the brightness value becomes \`|N||L|cosθ\` instead of \`cosθ\` — wrong by a scale factor that changes every frame as objects move.

**Three.js equivalents:**
\`\`\`js
const v = new THREE.Vector3(1, 2, 3)
v.length()      // |v| = √14 ≈ 3.742
v.normalize()   // mutates v in-place to unit vector
a.dot(b)        // dot product
a.cross(b)      // cross product (mutates a — use a.clone().cross(b) to be safe)
\`\`\``,
    },

    // ── Cell 2: Vector Playground ─────────────────────────────────────────────
    {
      type: 'js',
      instruction: `### Vector Playground\n\n**Drag the tips** of vectors A (blue) and B (orange). Watch addition, subtraction, magnitude, and normalisation update live. Toggle the result buttons to overlay A+B or A-B. Click **Normalise** to constrain a vector to the unit circle.`,
      html: `<div style="display:flex;flex-direction:column;align-items:center;gap:8px;padding:8px 0;background:#0a0f1e">
  <div style="display:flex;gap:6px;flex-wrap:wrap;justify-content:center">
    <button id="btn-sum"  style="padding:5px 14px;border-radius:7px;border:1.5px solid #38bdf8;background:transparent;color:#38bdf8;font-family:monospace;font-size:11px;cursor:pointer">Show A + B</button>
    <button id="btn-diff" style="padding:5px 14px;border-radius:7px;border:1.5px solid #fb923c;background:transparent;color:#fb923c;font-family:monospace;font-size:11px;cursor:pointer">Show A − B</button>
    <button id="btn-normA" style="padding:5px 14px;border-radius:7px;border:1.5px solid #a78bfa;background:transparent;color:#a78bfa;font-family:monospace;font-size:11px;cursor:pointer">Normalise A</button>
    <button id="btn-normB" style="padding:5px 14px;border-radius:7px;border:1.5px solid #f472b6;background:transparent;color:#f472b6;font-family:monospace;font-size:11px;cursor:pointer">Normalise B</button>
  </div>
  <canvas id="cv" width="700" height="320"></canvas>
</div>`,
      css: `body{margin:0;background:#0a0f1e;display:flex;justify-content:center}
canvas{display:block;cursor:crosshair}`,
      startCode: `var canvas=document.getElementById('cv');
var ctx=canvas.getContext('2d');
var CW=canvas.width,CH=canvas.height;
var OX=CW/2,OY=CH/2;  // origin pixel
var SCALE=55;          // pixels per unit

var ax=2.0,ay=-1.0;
var bx=0.5,by=2.0;
var showSum=false,showDiff=false;
var normA=false,normB=false;

// Dragging state
var drag=null; // 'a' or 'b'

function toCanvas(vx,vy){return {x:OX+vx*SCALE, y:OY-vy*SCALE};}
function toWorld(cx,cy){return {x:(cx-OX)/SCALE, y:-(cy-OY)/SCALE};}
function len(x,y){return Math.sqrt(x*x+y*y);}
function norm(x,y){var l=len(x,y);return l<0.001?{x:0,y:0}:{x:x/l,y:y/l};}

canvas.onmousedown=function(e){
  var r=canvas.getBoundingClientRect();
  var mx=(e.clientX-r.left)*(CW/r.width);
  var my=(e.clientY-r.top)*(CH/r.height);
  var ca=toCanvas(ax,ay),cb=toCanvas(bx,by);
  var da=Math.hypot(mx-ca.x,my-ca.y),db=Math.hypot(mx-cb.x,my-cb.y);
  if(da<16)drag='a'; else if(db<16)drag='b';
};
canvas.onmousemove=function(e){
  if(!drag)return;
  var r=canvas.getBoundingClientRect();
  var mx=(e.clientX-r.left)*(CW/r.width);
  var my=(e.clientY-r.top)*(CH/r.height);
  var w=toWorld(mx,my);
  if(drag==='a'){
    if(normA){var n=norm(w.x,w.y);ax=n.x;ay=n.y;} else {ax=w.x;ay=w.y;}
  } else {
    if(normB){var n=norm(w.x,w.y);bx=n.x;by=n.y;} else {bx=w.x;by=w.y;}
  }
  draw();
};
canvas.onmouseup=function(){drag=null;};
canvas.onmouseleave=function(){drag=null;};

document.getElementById('btn-sum').onclick=function(){showSum=!showSum;draw();};
document.getElementById('btn-diff').onclick=function(){showDiff=!showDiff;draw();};
document.getElementById('btn-normA').onclick=function(){normA=!normA;if(normA){var n=norm(ax,ay);ax=n.x;ay=n.y;}draw();};
document.getElementById('btn-normB').onclick=function(){normB=!normB;if(normB){var n=norm(bx,by);bx=n.x;by=n.y;}draw();};

function arrow(x1,y1,x2,y2,color,lw){
  var dx=x2-x1,dy=y2-y1,len2=Math.sqrt(dx*dx+dy*dy);
  if(len2<2)return;
  ctx.strokeStyle=color;ctx.fillStyle=color;ctx.lineWidth=lw||2;
  ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke();
  var hlen=10,hangle=0.45;
  var angle=Math.atan2(dy,dx);
  ctx.beginPath();
  ctx.moveTo(x2,y2);
  ctx.lineTo(x2-hlen*Math.cos(angle-hangle),y2-hlen*Math.sin(angle-hangle));
  ctx.lineTo(x2-hlen*Math.cos(angle+hangle),y2-hlen*Math.sin(angle+hangle));
  ctx.closePath();ctx.fill();
}

function draw(){
  ctx.clearRect(0,0,CW,CH);
  ctx.fillStyle='#0a0f1e';ctx.fillRect(0,0,CW,CH);

  // Grid
  var gridColor='rgba(255,255,255,0.07)';
  ctx.strokeStyle=gridColor;ctx.lineWidth=1;
  for(var gx=-6;gx<=6;gx++){var px=OX+gx*SCALE;ctx.beginPath();ctx.moveTo(px,0);ctx.lineTo(px,CH);ctx.stroke();}
  for(var gy=-3;gy<=3;gy++){var py=OY-gy*SCALE;ctx.beginPath();ctx.moveTo(0,py);ctx.lineTo(CW,py);ctx.stroke();}
  // Axes
  ctx.strokeStyle='rgba(255,255,255,0.2)';ctx.lineWidth=1.5;
  ctx.beginPath();ctx.moveTo(0,OY);ctx.lineTo(CW,OY);ctx.stroke();
  ctx.beginPath();ctx.moveTo(OX,0);ctx.lineTo(OX,CH);ctx.stroke();
  // Axis labels
  ctx.fillStyle='rgba(255,255,255,0.2)';ctx.font='9px monospace';ctx.textAlign='center';
  for(var n=-5;n<=5;n++){if(n===0)continue;
    ctx.fillText(n,OX+n*SCALE,OY+12);
    ctx.textAlign='right';ctx.fillText(n,OX-5,OY-n*SCALE+4);ctx.textAlign='center';
  }

  // Unit circle (when normalisation active)
  if(normA||normB){
    ctx.strokeStyle='rgba(255,255,255,0.12)';ctx.lineWidth=1;ctx.setLineDash([4,4]);
    ctx.beginPath();ctx.arc(OX,OY,SCALE,0,Math.PI*2);ctx.stroke();
    ctx.setLineDash([]);
  }

  // Sum/diff vectors
  var ca=toCanvas(ax,ay),cb=toCanvas(bx,by);
  var sx=ax+bx,sy=ay+by;
  var dx=ax-bx,dy=ay-by;
  if(showSum){
    var cs=toCanvas(sx,sy);
    // Parallelogram sides (dashed)
    ctx.strokeStyle='rgba(52,211,153,0.3)';ctx.lineWidth=1;ctx.setLineDash([4,4]);
    ctx.beginPath();ctx.moveTo(ca.x,ca.y);ctx.lineTo(cs.x,cs.y);ctx.stroke();
    ctx.beginPath();ctx.moveTo(cb.x,cb.y);ctx.lineTo(cs.x,cs.y);ctx.stroke();
    ctx.setLineDash([]);
    arrow(OX,OY,cs.x,cs.y,'#34d399',2.5);
    ctx.fillStyle='#34d399';ctx.font='bold 10px monospace';ctx.textAlign='left';
    ctx.fillText('A+B=('+sx.toFixed(1)+','+sy.toFixed(1)+')',cs.x+8,cs.y-6);
  }
  if(showDiff){
    var cd=toCanvas(dx,dy);
    arrow(OX,OY,cd.x,cd.y,'#f472b6',2.5);
    ctx.fillStyle='#f472b6';ctx.font='bold 10px monospace';ctx.textAlign='left';
    ctx.fillText('A-B=('+dx.toFixed(1)+','+dy.toFixed(1)+')',cd.x+8,cd.y-6);
  }

  // Vector A
  arrow(OX,OY,ca.x,ca.y,'#38bdf8',2.5);
  ctx.beginPath();ctx.arc(ca.x,ca.y,7,0,Math.PI*2);
  ctx.fillStyle='#38bdf8';ctx.shadowColor='#38bdf8';ctx.shadowBlur=10;ctx.fill();ctx.shadowBlur=0;
  ctx.fillStyle='#38bdf8';ctx.font='bold 11px monospace';ctx.textAlign='left';
  ctx.fillText('A=('+ax.toFixed(2)+', '+ay.toFixed(2)+')',ca.x+10,ca.y-8);

  // Vector B
  arrow(OX,OY,cb.x,cb.y,'#fb923c',2.5);
  ctx.beginPath();ctx.arc(cb.x,cb.y,7,0,Math.PI*2);
  ctx.fillStyle='#fb923c';ctx.shadowColor='#fb923c';ctx.shadowBlur=10;ctx.fill();ctx.shadowBlur=0;
  ctx.fillStyle='#fb923c';ctx.font='bold 11px monospace';ctx.textAlign='left';
  ctx.fillText('B=('+bx.toFixed(2)+', '+by.toFixed(2)+')',cb.x+10,cb.y-8);

  // Info panel (right side)
  var la=len(ax,ay),lb=len(bx,by);
  var na=norm(ax,ay),nb=norm(bx,by);
  var dot=ax*bx+ay*by;
  var cosT=la<0.001||lb<0.001?0:dot/(la*lb);
  var ang=Math.acos(Math.max(-1,Math.min(1,cosT)))*180/Math.PI;

  var ipx=CW-200,ipy=10,ipw=188,iph=200;
  ctx.fillStyle='rgba(10,15,30,0.9)';ctx.strokeStyle='rgba(255,255,255,0.12)';ctx.lineWidth=1;
  ctx.beginPath();ctx.roundRect(ipx,ipy,ipw,iph,8);ctx.fill();ctx.stroke();

  var rows=[
    {label:'|A|',val:la.toFixed(3),color:'#38bdf8'},
    {label:'|B|',val:lb.toFixed(3),color:'#fb923c'},
    {label:'\u00C2',val:'('+na.x.toFixed(2)+','+na.y.toFixed(2)+')',color:'#a78bfa'},
    {label:'\u0042\u0302',val:'('+nb.x.toFixed(2)+','+nb.y.toFixed(2)+')',color:'#f472b6'},
    {label:'A\u00B7B',val:dot.toFixed(3),color:'#4ade80'},
    {label:'angle',val:ang.toFixed(1)+'\u00B0',color:'rgba(255,255,255,0.6)'},
  ];
  ctx.font='10px monospace';
  rows.forEach(function(row,i){
    ctx.fillStyle='rgba(255,255,255,0.4)';ctx.textAlign='left';ctx.fillText(row.label,ipx+10,ipy+22+i*28);
    ctx.fillStyle=row.color;ctx.textAlign='right';ctx.fillText(row.val,ipx+ipw-10,ipy+22+i*28);
  });

  // Title
  ctx.fillStyle='rgba(255,255,255,0.4)';ctx.font='bold 10px monospace';ctx.textAlign='center';
  ctx.fillText('Vector Playground \u2014 drag tips of A and B',CW/2,CH-8);
}
draw();`,
      outputHeight: 420,
    },

    // ── Cell 3: Challenge — magnitude and normalisation ───────────────────────
    {
      type: 'challenge',
      instruction: `Vector **A = (3, 4)**. What is its magnitude |A|, and what is its normalised form **Â**? (Only two decimal places needed.)`,
      options: [
        { label: 'A', text: '|A| = 7.0,  Â = (0.43, 0.57) — sum of components divided by their total' },
        { label: 'B', text: '|A| = 5.0,  Â = (0.60, 0.80) — using the Pythagorean theorem' },
        { label: 'C', text: '|A| = 3.5,  Â = (0.86, 1.14) — average value of the two components' },
        { label: 'D', text: '|A| = 25.0, Â = (0.12, 0.16) — sum of squares, divided directly' },
      ],
      check: (label) => label === 'B',
      successMessage: 'Correct! |A| = √(3² + 4²) = √(9 + 16) = √25 = 5.0. Then Â = A / |A| = (3/5, 4/5) = (0.60, 0.80). You can verify: |Â| = √(0.6² + 0.8²) = √(0.36 + 0.64) = √1 = 1.0. The normalised vector always has length exactly 1 — that is the entire point of normalisation. This is a classic 3-4-5 Pythagorean triple.',
      failMessage: 'Apply the Pythagorean theorem: |A| = √(x² + y²) = √(3² + 4²) = √(9 + 16) = √25 = 5. Then divide each component by this length: Â = (3/5, 4/5) = (0.60, 0.80). Check: √(0.6² + 0.8²) = √1 = 1. Always verify normalisation by checking the result has length 1.',
      html: '',
      css: `body{margin:0;padding:0}`,
      startCode: '',
      outputHeight: 280,
    },

    // ── Cell 4: The dot product — geometric meaning ───────────────────────────
    {
      type: 'markdown',
      instruction: `### The Dot Product — Why It Powers All of Lighting

The dot product of two vectors A and B is:

**Algebraic:** \`A · B = ax·bx + ay·by + az·bz\`

**Geometric:** \`A · B = |A| · |B| · cosθ\`

Where θ is the angle between A and B. These two definitions are equivalent — the algebraic formula *computes* the geometric relationship.

**The critical insight for graphics:** When both vectors are unit vectors (length = 1), the geometric formula simplifies to:

\`A · B = cosθ\`

This is why normalisation is so important. The diffuse lighting equation is literally:

\`brightness = max(0, N · L)\`

Where N is the surface normal (normalised) and L is the direction toward the light (normalised). No trig. No acos. No lookup tables. Just three multiplications and two additions — and you get the exact physical brightness of a Lambertian surface.

**What the value means:**
| N · L value | Angle | Meaning |
|---|---|---|
| **1.0** | 0° | Surface faces directly at the light — maximum brightness |
| **0.707** | 45° | Surface at 45° to the light — 70.7% brightness |
| **0.0** | 90° | Surface perpendicular to light — exactly at the terminator |
| **< 0** | > 90° | Surface faces away from light — use \`max(0, N·L)\` to clamp to zero |

**The dot product also gives projection:** The scalar projection of B onto A (how much of B points in A's direction) is \`B · Â\` — multiply B's dot with the unit version of A. This is used in normal mapping, shadow calculations, and dozens of other shader techniques.`,
    },

    // ── Cell 5: Dot Product Light Meter ──────────────────────────────────────
    {
      type: 'js',
      instruction: `### Dot Product — Light Meter\n\n**Drag the light direction** (orange) around the circle. The surface normal N points up (fixed). Watch how the diffuse brightness (**max(0, N·L)**) changes exactly as cosθ — and drops to zero the moment the light goes past 90°.`,
      html: `<canvas id="cv" width="700" height="320" style="cursor:grab"></canvas>`,
      css: `body{margin:0;background:#0a0f1e;display:flex;justify-content:center}
canvas{display:block}`,
      startCode: `var canvas=document.getElementById('cv');
var ctx=canvas.getContext('2d');
var CW=canvas.width,CH=canvas.height;

// N is fixed pointing up. L is draggable.
var Nx=0,Ny=1;       // unit normal (up)
var angle=Math.PI/4; // light angle (starts at 45 deg)
var dragging=false;

// Circle centres
var circX=220,circY=165,circR=110;
var barX=440,barY=40,barW=60,barH=240;

function getLxy(){return {x:Math.cos(angle-(Math.PI/2)),y:Math.sin(angle-(Math.PI/2))};}

canvas.onmousedown=function(e){
  var r=canvas.getBoundingClientRect();
  var mx=(e.clientX-r.left)*(CW/r.width);
  var my=(e.clientY-r.top)*(CH/r.height);
  var L=getLxy();
  var lpx=circX+L.x*circR,lpy=circY-L.y*circR;
  if(Math.hypot(mx-lpx,my-lpy)<20)dragging=true;
};
canvas.onmousemove=function(e){
  if(!dragging)return;
  var r=canvas.getBoundingClientRect();
  var mx=(e.clientX-r.left)*(CW/r.width)-circX;
  var my=-((e.clientY-r.top)*(CH/r.height)-circY);
  angle=Math.atan2(my,mx)+Math.PI/2;
  draw();
};
canvas.onmouseup=function(){dragging=false;};
canvas.onmouseleave=function(){dragging=false;};

function arrow(x1,y1,x2,y2,color,lw){
  var dx=x2-x1,dy=y2-y1,l=Math.sqrt(dx*dx+dy*dy);
  if(l<2)return;
  ctx.strokeStyle=color;ctx.fillStyle=color;ctx.lineWidth=lw||2.5;
  ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke();
  var h=11,a=0.42,ang=Math.atan2(dy,dx);
  ctx.beginPath();
  ctx.moveTo(x2,y2);
  ctx.lineTo(x2-h*Math.cos(ang-a),y2-h*Math.sin(ang-a));
  ctx.lineTo(x2-h*Math.cos(ang+a),y2-h*Math.sin(ang+a));
  ctx.closePath();ctx.fill();
}

function draw(){
  ctx.clearRect(0,0,CW,CH);
  ctx.fillStyle='#0a0f1e';ctx.fillRect(0,0,CW,CH);

  var L=getLxy();
  var dot=Nx*L.x+Ny*L.y; // = cosθ since both unit vectors
  var brightness=Math.max(0,dot);

  // ── Circle area ──────────────────────────────────────────────────
  // Surface line
  ctx.strokeStyle='rgba(255,255,255,0.25)';ctx.lineWidth=2;
  ctx.beginPath();ctx.moveTo(circX-circR-10,circY);ctx.lineTo(circX+circR+10,circY);ctx.stroke();
  ctx.fillStyle='rgba(255,255,255,0.1)';
  ctx.beginPath();ctx.rect(circX-circR-10,circY,circR*2+20,50);ctx.fill();
  ctx.fillStyle='rgba(255,255,255,0.2)';ctx.font='10px monospace';ctx.textAlign='center';
  ctx.fillText('surface',circX,circY+30);

  // Shaded half-circle (lit side)
  var surfaceBright=Math.max(0.05,brightness);
  ctx.fillStyle='rgba(251,146,60,'+surfaceBright.toFixed(2)+')';
  ctx.beginPath();ctx.arc(circX,circY,circR,Math.PI,0);ctx.fill();

  // Circle outline
  ctx.strokeStyle='rgba(255,255,255,0.15)';ctx.lineWidth=1;ctx.setLineDash([4,4]);
  ctx.beginPath();ctx.arc(circX,circY,circR,0,Math.PI*2);ctx.stroke();ctx.setLineDash([]);

  // N arrow (fixed, up)
  arrow(circX,circY,circX,circY-circR,'#38bdf8',3);
  ctx.fillStyle='#38bdf8';ctx.font='bold 11px monospace';ctx.textAlign='center';
  ctx.fillText('N (normal)',circX,circY-circR-14);

  // L arrow (draggable)
  var lpx=circX+L.x*circR,lpy=circY-L.y*circR;
  arrow(circX,circY,lpx,lpy,'#fb923c',3);
  ctx.beginPath();ctx.arc(lpx,lpy,9,0,Math.PI*2);
  ctx.fillStyle='#fb923c';ctx.shadowColor='#fb923c';ctx.shadowBlur=12;ctx.fill();ctx.shadowBlur=0;
  ctx.fillStyle='#fb923c';ctx.font='bold 11px monospace';ctx.textAlign='center';
  ctx.fillText('L (light)',lpx,lpy-16);

  // Angle arc
  ctx.strokeStyle='rgba(255,255,255,0.3)';ctx.lineWidth=1;
  var startA=-(Math.PI/2),endA=-(Math.PI/2-Math.acos(Math.max(-1,Math.min(1,dot))));
  if(L.x<0)endA=-(Math.PI/2+Math.acos(Math.max(-1,Math.min(1,dot))));
  ctx.beginPath();ctx.arc(circX,circY,36,startA,endA,L.x<0);ctx.stroke();
  var midA=(startA+endA)/2;
  ctx.fillStyle='rgba(255,255,255,0.5)';ctx.font='9px monospace';ctx.textAlign='center';
  var angDeg=(Math.acos(Math.max(-1,Math.min(1,dot)))*180/Math.PI).toFixed(0);
  ctx.fillText(angDeg+'\u00b0',circX+50*Math.cos(midA),circY+50*Math.sin(midA));

  // ── Brightness bar ────────────────────────────────────────────────
  // Bar background
  ctx.fillStyle='rgba(255,255,255,0.06)';ctx.strokeStyle='rgba(255,255,255,0.12)';ctx.lineWidth=1;
  ctx.beginPath();ctx.roundRect(barX,barY,barW,barH,6);ctx.fill();ctx.stroke();

  // Filled amount
  var filledH=brightness*barH;
  var barGrad=ctx.createLinearGradient(0,barY+barH,0,barY);
  barGrad.addColorStop(0,'#fb923c');barGrad.addColorStop(1,'#fde68a');
  ctx.fillStyle=barGrad;
  ctx.beginPath();ctx.roundRect(barX,barY+barH-filledH,barW,filledH,6);ctx.fill();

  // Bar label
  ctx.fillStyle='rgba(255,255,255,0.5)';ctx.font='bold 9px monospace';ctx.textAlign='center';
  ctx.fillText('brightness',barX+barW/2,barY-10);
  ctx.fillStyle=brightness>0?'#fde68a':'rgba(255,255,255,0.3)';ctx.font='bold 13px monospace';
  ctx.fillText(brightness.toFixed(3),barX+barW/2,barY+barH+18);

  // ── Info panel ────────────────────────────────────────────────────
  var ipx=540,ipy=30,ipw=148,iph=180;
  ctx.fillStyle='rgba(10,15,30,0.9)';ctx.strokeStyle='rgba(255,255,255,0.1)';ctx.lineWidth=1;
  ctx.beginPath();ctx.roundRect(ipx,ipy,ipw,iph,8);ctx.fill();ctx.stroke();
  ctx.textAlign='left';
  var rows2=[
    {l:'N',v:'('+Nx.toFixed(2)+', '+Ny.toFixed(2)+')',c:'#38bdf8'},
    {l:'L',v:'('+L.x.toFixed(2)+', '+L.y.toFixed(2)+')',c:'#fb923c'},
    {l:'N \u00b7 L',v:dot.toFixed(3),c:'#4ade80'},
    {l:'angle \u03b8',v:angDeg+'\u00b0',c:'rgba(255,255,255,0.6)'},
    {l:'max(0,N\u00b7L)',v:brightness.toFixed(3),c:'#fde68a'},
  ];
  rows2.forEach(function(row,i){
    ctx.fillStyle='rgba(255,255,255,0.4)';ctx.font='9px monospace';
    ctx.fillText(row.l,ipx+10,ipy+24+i*30);
    ctx.fillStyle=row.c;ctx.font='bold 10px monospace';
    ctx.fillText(row.v,ipx+10,ipy+38+i*30);
  });

  // Title
  ctx.fillStyle='rgba(255,255,255,0.35)';ctx.font='bold 10px monospace';ctx.textAlign='center';
  ctx.fillText('Dot Product Light Meter \u2014 drag the orange L arrow',CW/2,CH-8);
}
draw();`,
      outputHeight: 390,
    },

    // ── Cell 6: Challenge — lighting brightness ───────────────────────────────
    {
      type: 'challenge',
      instruction: `A surface has its normal pointing straight up: **N = (0, 1, 0)**. A light source direction is **L = (0.707, 0.707, 0)** (normalised — pointing up and to the right at 45°). What is the diffuse brightness of the surface, using the formula **brightness = max(0, N · L)**?`,
      options: [
        { label: 'A', text: '0.0 — the light is not directly above the surface so it contributes nothing' },
        { label: 'B', text: '1.0 — one component of L aligns with N so full brightness is achieved' },
        { label: 'C', text: '0.707 — N·L = 0×0.707 + 1×0.707 + 0×0 = 0.707 ≈ cos(45°)' },
        { label: 'D', text: '0.5 — the light is at 45° so exactly half the maximum brightness' },
      ],
      check: (label) => label === 'C',
      successMessage: 'Correct! N·L = (0)(0.707) + (1)(0.707) + (0)(0) = 0 + 0.707 + 0 = 0.707. Since both vectors are unit vectors, this equals cos(45°) ≈ 0.707. The surface is 70.7% as bright as it would be if the light were directly above (which would give N·L = 1.0). This is the Lambert cosine law — the physical basis of diffuse shading.',
      failMessage: 'Compute the dot product component by component: N·L = N.x*L.x + N.y*L.y + N.z*L.z = 0*0.707 + 1*0.707 + 0*0 = 0.707. Because N and L are both unit vectors, this equals cos(45°). It is NOT 0.5 — the cosine of 45° is √2/2 ≈ 0.707, not 0.5. The cosine of 60° would be 0.5.',
      html: '',
      css: `body{margin:0;padding:0}`,
      startCode: '',
      outputHeight: 280,
    },

    // ── Cell 7: The cross product ─────────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `### The Cross Product — Building Surface Normals

The cross product takes two vectors and returns a **third vector perpendicular to both**:

\`A × B = (ay·bz − az·by,  az·bx − ax·bz,  ax·by − ay·bx)\`

The direction of A × B is determined by the **right-hand rule**: point your fingers in the direction of A, curl them toward B, and your thumb points in the direction of A × B.

**The magnitude** has a beautiful geometric meaning:

\`|A × B| = |A| · |B| · sinθ\`

This equals the **area of the parallelogram** spanned by A and B.

**Why graphics programmers care so much about cross products:**

1. **Surface normals from triangle edges:** Given triangle vertices P0, P1, P2, the normal is:
   \`edge1 = P1 − P0,  edge2 = P2 − P0,  normal = normalize(edge1 × edge2)\`
   This is how every 3D model gets its initial normals — computed from triangle geometry.

2. **The View/Camera right vector:** Given a camera forward direction and world up,
   \`right = normalize(forward × worldUp)\`
   This gives you the camera's horizontal axis without any trigonometry.

3. **Perpendicular forces in physics:** Normal forces, torque, angular momentum — all cross products.

**The winding order connection:** The cross product also tells you which side of a triangle you're looking at. Counter-clockwise winding (from your perspective) gives a normal pointing toward you. Clockwise gives it pointing away. This is the mathematical basis of back-face culling.

**Special case:** If A and B are parallel (same or opposite direction), then sinθ = 0, so |A × B| = 0. The cross product is the zero vector. This means you can't compute a cross product between parallel vectors — and it's why degenerate (zero-area) triangles are problematic in 3D meshes.`,
    },

    // ── Cell 8: Cross Product Visualiser ─────────────────────────────────────
    {
      type: 'js',
      instruction: `### Cross Product in 3D\n\n**Drag the sliders** to change the direction of vectors A and B in 3D space. The cross product **A × B** (shown in green) always points perpendicular to both. Watch its magnitude shrink to zero as A and B approach parallel — and flip direction when you cross past parallel.`,
      html: `<div style="display:flex;flex-direction:column;align-items:center;gap:8px;padding:8px 0;background:#0a0f1e">
  <div style="display:flex;gap:16px;flex-wrap:wrap;justify-content:center">
    <label style="color:#38bdf8;font-family:monospace;font-size:11px;display:flex;flex-direction:column;align-items:center;gap:4px">
      A angle (XY plane)<input id="angA" type="range" min="-180" max="180" value="30" style="width:130px;accent-color:#38bdf8">
    </label>
    <label style="color:#38bdf8;font-family:monospace;font-size:11px;display:flex;flex-direction:column;align-items:center;gap:4px">
      A tilt (elevation)<input id="tilA" type="range" min="-90" max="90" value="20" style="width:130px;accent-color:#38bdf8">
    </label>
    <label style="color:#fb923c;font-family:monospace;font-size:11px;display:flex;flex-direction:column;align-items:center;gap:4px">
      B angle (XY plane)<input id="angB" type="range" min="-180" max="180" value="120" style="width:130px;accent-color:#fb923c">
    </label>
    <label style="color:#fb923c;font-family:monospace;font-size:11px;display:flex;flex-direction:column;align-items:center;gap:4px">
      B tilt (elevation)<input id="tilB" type="range" min="-90" max="90" value="-10" style="width:130px;accent-color:#fb923c">
    </label>
  </div>
  <canvas id="cv" width="700" height="290"></canvas>
</div>`,
      css: `body{margin:0;background:#0a0f1e;display:flex;justify-content:center}
canvas{display:block}`,
      startCode: `var canvas=document.getElementById('cv');
var ctx=canvas.getContext('2d');
var CW=canvas.width,CH=canvas.height;

var OX=240,OY=CH/2;
var SCALE=90;

// Isometric projection
function iso(x,y,z){
  // Simple cavalier oblique projection
  var px=OX+x*SCALE+z*SCALE*0.35;
  var py=OY-y*SCALE+z*SCALE*0.25;
  return {x:px,y:py};
}

function spherical(angleDeg,tiltDeg){
  var a=angleDeg*Math.PI/180,t=tiltDeg*Math.PI/180;
  return {x:Math.cos(t)*Math.cos(a), y:Math.sin(t), z:Math.cos(t)*Math.sin(a)};
}

function cross3(a,b){
  return {
    x:a.y*b.z-a.z*b.y,
    y:a.z*b.x-a.x*b.z,
    z:a.x*b.y-a.y*b.x
  };
}

function len3(v){return Math.sqrt(v.x*v.x+v.y*v.y+v.z*v.z);}
function norm3(v){var l=len3(v);return l<0.001?{x:0,y:0,z:0}:{x:v.x/l,y:v.y/l,z:v.z/l};}
function dot3(a,b){return a.x*b.x+a.y*b.y+a.z*b.z;}

function arrow3D(v1,v2,color,lw){
  var p1=iso(v1.x,v1.y,v1.z),p2=iso(v2.x,v2.y,v2.z);
  var dx=p2.x-p1.x,dy=p2.y-p1.y,l=Math.sqrt(dx*dx+dy*dy);
  if(l<2)return;
  ctx.strokeStyle=color;ctx.fillStyle=color;ctx.lineWidth=lw||2.5;
  ctx.beginPath();ctx.moveTo(p1.x,p1.y);ctx.lineTo(p2.x,p2.y);ctx.stroke();
  var h=10,a=0.42,ang=Math.atan2(dy,dx);
  ctx.beginPath();
  ctx.moveTo(p2.x,p2.y);
  ctx.lineTo(p2.x-h*Math.cos(ang-a),p2.y-h*Math.sin(ang-a));
  ctx.lineTo(p2.x-h*Math.cos(ang+a),p2.y-h*Math.sin(ang+a));
  ctx.closePath();ctx.fill();
}

function draw(){
  ctx.clearRect(0,0,CW,CH);
  ctx.fillStyle='#0a0f1e';ctx.fillRect(0,0,CW,CH);

  var angA=+document.getElementById('angA').value;
  var tilA=+document.getElementById('tilA').value;
  var angB=+document.getElementById('angB').value;
  var tilB=+document.getElementById('tilB').value;
  var A=spherical(angA,tilA);
  var B=spherical(angB,tilB);
  var C=cross3(A,B);
  var cLen=len3(C);
  var Cn=norm3(C);

  // Draw grid on XZ plane (y=0)
  ctx.strokeStyle='rgba(255,255,255,0.06)';ctx.lineWidth=1;
  for(var gi=-2;gi<=2;gi++){
    var pa=iso(gi,0,-2),pb=iso(gi,0,2);ctx.beginPath();ctx.moveTo(pa.x,pa.y);ctx.lineTo(pb.x,pb.y);ctx.stroke();
    var pc=iso(-2,0,gi),pd=iso(2,0,gi);ctx.beginPath();ctx.moveTo(pc.x,pc.y);ctx.lineTo(pd.x,pd.y);ctx.stroke();
  }

  // World axes
  var O={x:0,y:0,z:0};
  arrow3D(O,{x:1.4,y:0,z:0},'rgba(255,100,100,0.4)',1);
  arrow3D(O,{x:0,y:1.4,z:0},'rgba(100,255,100,0.4)',1);
  arrow3D(O,{x:0,y:0,z:1.4},'rgba(100,100,255,0.4)',1);
  var ax=iso(1.5,0,0),ay=iso(0,1.5,0),az=iso(0,0,1.5);
  ctx.font='bold 9px monospace';ctx.textAlign='center';
  ctx.fillStyle='rgba(255,100,100,0.5)';ctx.fillText('X',ax.x,ax.y);
  ctx.fillStyle='rgba(100,255,100,0.5)';ctx.fillText('Y',ay.x,ay.y-6);
  ctx.fillStyle='rgba(100,100,255,0.5)';ctx.fillText('Z',az.x+8,az.y);

  // Parallelogram fill
  var pA=iso(A.x,A.y,A.z),pB=iso(B.x,B.y,B.z),pAB=iso(A.x+B.x,A.y+B.y,A.z+B.z);
  ctx.fillStyle='rgba(255,255,255,0.06)';
  ctx.beginPath();ctx.moveTo(OX,OY);ctx.lineTo(pA.x,pA.y);ctx.lineTo(pAB.x,pAB.y);ctx.lineTo(pB.x,pB.y);ctx.closePath();ctx.fill();

  // A and B vectors
  arrow3D(O,A,'#38bdf8',3);
  arrow3D(O,B,'#fb923c',3);

  // Cross product (scaled for visibility)
  if(cLen>0.01){
    arrow3D(O,{x:Cn.x,y:Cn.y,z:Cn.z},'#4ade80',3);
  }

  // Labels
  ctx.font='bold 11px monospace';
  ctx.fillStyle='#38bdf8';ctx.textAlign='left';
  ctx.fillText('A',pA.x+8,pA.y);
  ctx.fillStyle='#fb923c';
  ctx.fillText('B',pB.x+8,pB.y);
  if(cLen>0.01){
    var pc=iso(Cn.x,Cn.y,Cn.z);
    ctx.fillStyle='#4ade80';ctx.fillText('A\u00d7B',pc.x+8,pc.y);
  }

  // Info panel
  var dot=dot3(A,B);
  var angBetween=(Math.acos(Math.max(-1,Math.min(1,dot)))*180/Math.PI).toFixed(1);
  var ipx=CW-210,ipy=20,ipw=198,iph=220;
  ctx.fillStyle='rgba(10,15,30,0.9)';ctx.strokeStyle='rgba(255,255,255,0.1)';ctx.lineWidth=1;
  ctx.beginPath();ctx.roundRect(ipx,ipy,ipw,iph,8);ctx.fill();ctx.stroke();
  ctx.textAlign='left';
  var items=[
    {l:'A',v:'('+A.x.toFixed(2)+', '+A.y.toFixed(2)+', '+A.z.toFixed(2)+')',c:'#38bdf8'},
    {l:'B',v:'('+B.x.toFixed(2)+', '+B.y.toFixed(2)+', '+B.z.toFixed(2)+')',c:'#fb923c'},
    {l:'A\u00d7B',v:'('+C.x.toFixed(2)+', '+C.y.toFixed(2)+', '+C.z.toFixed(2)+')',c:'#4ade80'},
    {l:'|A\u00d7B|',v:cLen.toFixed(3)+(cLen<0.05?' \u2190 near 0!':''),c:cLen<0.05?'#f87171':'#4ade80'},
    {l:'A\u00b7B',v:dot.toFixed(3),c:'#a78bfa'},
    {l:'angle',v:angBetween+'\u00b0',c:'rgba(255,255,255,0.6)'},
    {l:'area',v:cLen.toFixed(3)+' sq units',c:'rgba(255,255,255,0.4)'},
  ];
  ctx.font='bold 9px monospace';
  items.forEach(function(it,i){
    ctx.fillStyle='rgba(255,255,255,0.35)';ctx.fillText(it.l,ipx+10,ipy+24+i*28);
    ctx.fillStyle=it.c;ctx.fillText(it.v,ipx+50,ipy+24+i*28);
  });

  // Title
  ctx.fillStyle='rgba(255,255,255,0.3)';ctx.font='bold 10px monospace';ctx.textAlign='center';
  ctx.fillText('Cross Product — drag sliders to rotate A and B',CW/2,CH-8);
}

var ids=['angA','tilA','angB','tilB'];
ids.forEach(function(id){document.getElementById(id).oninput=draw;});
draw();`,
      outputHeight: 440,
    },

    // ── Cell 9: Challenge — parallel cross product ────────────────────────────
    {
      type: 'challenge',
      instruction: `Vectors **A = (1, 0, 0)** and **B = (3, 0, 0)** point in the same direction. What is **|A × B|** — and what does this tell you about the parallelogram they form?`,
      options: [
        { label: 'A', text: '|A × B| = 3.0 — B is 3× longer than A, so the cross product scales proportionally' },
        { label: 'B', text: '|A × B| = 0.0 — parallel vectors have sinθ = sin(0°) = 0, so the cross product is the zero vector' },
        { label: 'C', text: '|A × B| = 1.0 — the cross product always returns a unit vector regardless of input lengths' },
        { label: 'D', text: '|A × B| = undefined — you cannot take the cross product of two parallel vectors' },
      ],
      check: (label) => label === 'B',
      successMessage: 'Correct! |A × B| = |A||B|sinθ = 1 × 3 × sin(0°) = 1 × 3 × 0 = 0. The two parallel vectors form a degenerate parallelogram with zero area — a flat line. The cross product is the zero vector (0, 0, 0). This is why degenerate triangles (where all three points are collinear) have no computable normal — the cross product of their edges is zero.',
      failMessage: '|A × B| = |A||B|sinθ. When A and B point in the same direction, θ = 0° and sin(0°) = 0. So |A × B| = |A| × |B| × 0 = 0. It is not undefined — it is a computable zero. The cross product A × B = (0,0,0). This means the two vectors span a parallelogram of zero area.',
      html: '',
      css: `body{margin:0;padding:0}`,
      startCode: '',
      outputHeight: 280,
    },

  ],
};

export default {
  id: 'three-js-0-2-vectors',
  slug: 'vectors-for-graphics',
  chapter: 'three-js.0',
  order: 2,
  title: 'Vectors for Graphics',
  subtitle: 'The mathematical language of position, direction, colour, and light.',
  tags: ['three-js', 'vectors', 'dot-product', 'cross-product', 'normalisation', 'linear-algebra', 'foundations'],
  hook: {
    question: 'A light shines from above at 45°. A surface faces sideways. How bright is it? The answer is one multiplication — but only if you understand what a direction is as a number.',
    realWorldContext: 'The dot product between a surface normal and a light direction is the entire diffuse lighting equation. Every 3D renderer — from Minecraft to Pixar — runs this calculation billions of times per second.',
  },
  intuition: {
    prose: [
      'Magnitude: |A| = √(x²+y²+z²). Normalise: Â = A/|A|. Always normalize before lighting.',
      'Dot product A·B = |A||B|cosθ. For unit vectors: A·B = cosθ. brightness = max(0, N·L).',
      'Cross product A×B gives a vector perpendicular to both. |A×B| = area of parallelogram.',
      'Parallel vectors: sin(0°)=0, so |A×B|=0. Cross product of parallel vectors is the zero vector.',
    ],
    callouts: [
      { type: 'tip', title: 'The lighting shortcut', body: 'If N and L are already unit vectors, diffuse brightness = max(0, N·L). No trig functions, no acos. Just three multiplications and two additions.' },
    ],
    visualizations: [{ id: 'ScienceNotebook', title: 'Vectors for Graphics', props: { lesson: LESSON_3JS_0_2 } }],
  },
  math: { prose: [], callouts: [], visualizations: [] },
  rigor: { prose: [], callouts: [], visualizations: [] },
  examples: [], challenges: [],
  mentalModel: [
    'magnitude: |A| = sqrt(x²+y²+z²). normalize: Â = A/|A|. Normalized vectors have length=1.',
    'Dot product = |A||B|cosθ. Unit vectors: A·B = cosθ. Diffuse lighting: max(0, N·L).',
    'Cross product = vector ⊥ to both inputs. |A×B| = |A||B|sinθ = parallelogram area.',
    'Parallel vectors: cross product = zero vector. Degenerate triangle has no computable normal.',
    'THREE.Vector3: .length(), .normalize(), .dot(v), .clone().cross(v)',
  ],
  checkpoints: ['read-intuition'],
  quiz: [],
};

export { LESSON_3JS_0_2 };
