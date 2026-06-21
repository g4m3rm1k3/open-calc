import distanceFormulaUrl from '../diagrams/distance-formula.svg?url'

const LESSON_GEO_3_1 = {
  title: 'Coordinate Geometry',
  subject: 'Geometry',
  sequential: true,

  cells: [
    {
      type: 'markdown',
      instruction: `### Descartes' Idea: Give Every Point an Address

In 1637, René Descartes was lying in bed watching a fly crawl across his ceiling. He realized he could describe the fly's position exactly using just two numbers — its distance from one wall and its distance from another. That insight created the coordinate plane, and it united two ancient branches of mathematics: algebra and geometry.

The payoff: every geometric shape can now be written as an equation, and every algebraic equation has a picture. The distance between two points, the slope of a line, the center of a circle — all become calculations you can perform without a ruler.

The first calculation: **distance**. How far apart are two points?`,
    },

    {
      type: 'js',
      instruction: `### Distance Formula: The Hidden Right Triangle

Every pair of points hides a right triangle. The horizontal leg is Δx, the vertical leg is Δy, and the straight-line distance is the hypotenuse. Click anywhere to place two points, then drag them to see Pythagoras in action.`,
      html: `<canvas id="cv" width="700" height="340"></canvas>
<div id="info" style="padding:10px 16px;font-family:Georgia,serif;background:var(--color-background-secondary,#f8fafc);border-top:1px solid var(--color-border-primary,#e2e8f0);font-size:13px;min-height:44px"></div>`,
      css: `body{margin:0;background:var(--color-background-secondary,#f8fafc)}canvas{display:block;cursor:crosshair}`,
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

var pts=[{x:180,y:240},{x:480,y:120}];
var drag=-1;
var GRID=40;

function toGrid(px,py){return{x:Math.round((px-W/2)/GRID),y:Math.round((H/2-py)/GRID)};}
function toCanvas(gx,gy){return{x:W/2+gx*GRID,y:H/2-gy*GRID};}

function draw(){
  ctx.clearRect(0,0,W,H);
  ctx.fillStyle=BG;ctx.fillRect(0,0,W,H);
  // Grid
  ctx.strokeStyle=GRID;ctx.lineWidth=1;
  for(var x=W/2%GRID;x<W;x+=GRID){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,H);ctx.stroke();}
  for(var y=H/2%GRID;y<H;y+=GRID){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.stroke();}
  // Axes
  ctx.strokeStyle='#94a3b8';ctx.lineWidth=1.5;
  ctx.beginPath();ctx.moveTo(W/2,0);ctx.lineTo(W/2,H);ctx.stroke();
  ctx.beginPath();ctx.moveTo(0,H/2);ctx.lineTo(W,H/2);ctx.stroke();
  // Axis labels
  ctx.fillStyle='#94a3b8';ctx.font='10px sans-serif';ctx.textAlign='center';
  for(var i=-8;i<=8;i++){if(i===0)continue;
    var cx2=W/2+i*GRID,cy2=H/2;
    ctx.fillText(i,cx2,cy2+14);
  }
  for(var j=-4;j<=4;j++){if(j===0)continue;
    ctx.fillText(j,W/2-18,H/2-j*GRID+4);
  }

  var A=pts[0],B=pts[1];
  var gA=toGrid(A.x,A.y),gB=toGrid(B.x,B.y);
  var dx=Math.abs(gB.x-gA.x),dy=Math.abs(gB.y-gA.y);
  var d=Math.sqrt(dx*dx+dy*dy);

  // Right triangle legs
  ctx.setLineDash([5,4]);
  ctx.strokeStyle='#3b82f6';ctx.lineWidth=2;
  ctx.beginPath();ctx.moveTo(A.x,A.y);ctx.lineTo(B.x,A.y);ctx.stroke();
  ctx.strokeStyle='#ef4444';
  ctx.beginPath();ctx.moveTo(B.x,A.y);ctx.lineTo(B.x,B.y);ctx.stroke();
  ctx.setLineDash([]);

  // Hypotenuse
  ctx.strokeStyle=GREEN;ctx.lineWidth=2.5;
  ctx.beginPath();ctx.moveTo(A.x,A.y);ctx.lineTo(B.x,B.y);ctx.stroke();

  // Δx label
  ctx.fillStyle='#3b82f6';ctx.font='bold 12px Georgia';ctx.textAlign='center';
  ctx.fillText('Δx = '+dx,(A.x+B.x)/2,A.y+(A.y<B.y?-10:20));
  // Δy label
  ctx.fillStyle='#ef4444';ctx.textAlign='left';
  ctx.fillText('Δy = '+dy,B.x+8,(A.y+B.y)/2);
  // Distance label
  ctx.fillStyle=GREEN;ctx.font='bold 13px Georgia';ctx.textAlign='center';
  ctx.fillText('d = √('+dx+'²+'+dy+'²) = '+d.toFixed(2),(A.x+B.x)/2,(A.y+B.y)/2-14);

  // Points
  [{p:A,g:gA,col:'#1e3a5f',lbl:'A'},{p:B,g:gB,col:'#7c3aed',lbl:'B'}].forEach(function(obj){
    ctx.beginPath();ctx.arc(obj.p.x,obj.p.y,8,0,Math.PI*2);
    ctx.fillStyle=obj.col;ctx.fill();
    ctx.fillStyle=obj.col;ctx.font='bold 13px Georgia';ctx.textAlign='left';
    ctx.fillText(obj.lbl+' ('+obj.g.x+','+obj.g.y+')',obj.p.x+12,obj.p.y-6);
  });

  document.getElementById('info').innerHTML=
    '<strong>d = √(Δx² + Δy²) = √('+dx+'² + '+dy+'²) = √'+( dx*dx+dy*dy)+' ≈ '+d.toFixed(3)+'</strong>'
    +'&emsp;|&emsp;Midpoint M = ('+(((gA.x+gB.x)/2).toFixed(1))+', '+((gA.y+gB.y)/2).toFixed(1)+')';
}

function nearest(px,py){
  var best=-1,bd=99999;
  pts.forEach(function(p,i){var d=Math.hypot(px-p.x,py-p.y);if(d<bd){bd=d;best=i;}});
  return bd<20?best:-1;
}
cv.addEventListener('mousedown',function(e){
  var r=cv.getBoundingClientRect(),px=(e.clientX-r.left)*(W/r.width),py=(e.clientY-r.top)*(H/r.height);
  drag=nearest(px,py);
  if(drag===-1){pts[0]={x:px,y:py};drag=0;}
  draw();
});
cv.addEventListener('mousemove',function(e){
  if(drag===-1)return;
  var r=cv.getBoundingClientRect();
  pts[drag]={x:(e.clientX-r.left)*(W/r.width),y:(e.clientY-r.top)*(H/r.height)};
  draw();
});
cv.addEventListener('mouseup',function(){drag=-1;});
draw();`,
      outputHeight: 420,
    },

    {
      type: 'js',
      instruction: `### Slope, Parallel and Perpendicular Lines

Slope is rise ÷ run. Two key relationships: **parallel lines share a slope**; **perpendicular lines have slopes that multiply to −1**. Drag the two lines to verify both rules. The product m₁ × m₂ updates in real time.`,
      html: `<canvas id="cv" width="700" height="320"></canvas>
<div id="info" style="padding:10px 16px;font-family:Georgia,serif;background:var(--color-background-secondary,#f8fafc);border-top:1px solid var(--color-border-primary,#e2e8f0);font-size:13px"></div>`,
      css: `body{margin:0;background:var(--color-background-secondary,#f8fafc)}canvas{display:block;cursor:ew-resize}`,
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

var line1={m:1,b:0,col:'#1e3a5f'};
var line2={m:-1,b:0,col:'#dc2626'};
var drag=null;

function lineY(line,x){return H/2-line.m*(x-W/2)+line.b;}

function draw(){
  ctx.clearRect(0,0,W,H);
  ctx.fillStyle=BG;ctx.fillRect(0,0,W,H);
  var GRID=40;
  ctx.strokeStyle=GRID;ctx.lineWidth=1;
  for(var x=W/2%GRID;x<W;x+=GRID){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,H);ctx.stroke();}
  for(var y=H/2%GRID;y<H;y+=GRID){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.stroke();}
  ctx.strokeStyle='#94a3b8';ctx.lineWidth=1.5;
  ctx.beginPath();ctx.moveTo(W/2,0);ctx.lineTo(W/2,H);ctx.stroke();
  ctx.beginPath();ctx.moveTo(0,H/2);ctx.lineTo(W,H/2);ctx.stroke();

  [line1,line2].forEach(function(l,i){
    ctx.strokeStyle=l.col;ctx.lineWidth=2.5;
    ctx.beginPath();ctx.moveTo(0,lineY(l,0));ctx.lineTo(W,lineY(l,W));ctx.stroke();
    var mid=W/2+(i===0?-80:80);
    var lx=mid,ly=lineY(l,mid);
    ctx.fillStyle=l.col;ctx.font='bold 13px Georgia';ctx.textAlign='center';
    ctx.fillText('m'+(i+1)+' = '+l.m.toFixed(2),lx,ly-14);
  });

  var prod=line1.m*line2.m;
  var isPerp=Math.abs(prod+1)<0.05;
  var isPar=Math.abs(line1.m-line2.m)<0.05;
  var status=isPerp?'⊥ PERPENDICULAR (m₁×m₂ = −1)':isPar?'∥ PARALLEL (m₁ = m₂)':'m₁ × m₂ = '+prod.toFixed(3);
  var statusCol=isPerp?'#1a3a2a':isPar?'#1e3a5f':'#64748b';
  ctx.fillStyle=statusCol;ctx.font='bold 14px Georgia';ctx.textAlign='center';
  ctx.fillText(status,W/2,H-18);

  document.getElementById('info').innerHTML=
    'Line 1 slope: <strong style="color:#1e3a5f">'+line1.m.toFixed(2)+'</strong>'
    +'&emsp;Line 2 slope: <strong style="color:#dc2626">'+line2.m.toFixed(2)+'</strong>'
    +'&emsp;Product: <strong style="color:'+statusCol+'">'+prod.toFixed(3)+'</strong>'
    +(isPerp?' ✓ Perpendicular!':isPar?' ∥ Parallel!':'')
    +'<br><span style="color:#94a3b8;font-size:11px">Drag anywhere left/right to rotate line 1 (blue); shift+drag for line 2 (red)</span>';
}

var lastX=null,shiftDown=false;
document.addEventListener('keydown',function(e){if(e.key==='Shift')shiftDown=true;});
document.addEventListener('keyup',function(e){if(e.key==='Shift')shiftDown=false;});
cv.addEventListener('mousedown',function(e){drag=true;lastX=e.clientX;});
cv.addEventListener('mouseup',function(){drag=null;});
cv.addEventListener('mousemove',function(e){
  if(!drag)return;
  var dx=(e.clientX-lastX)*0.02;
  lastX=e.clientX;
  if(shiftDown){line2.m=Math.max(-6,Math.min(6,line2.m+dx));}
  else{line1.m=Math.max(-6,Math.min(6,line1.m+dx));}
  draw();
});
draw();`,
      outputHeight: 390,
    },

    {
      type: 'markdown',
      instruction: `### Coordinate Geometry Proofs

The real power of coordinates is that you can **prove** geometric properties by computing. Instead of drawing and arguing from a diagram, you compute slopes, distances, and midpoints, then check conditions algebraically.

**Classic technique — proving a quadrilateral is a rectangle:**
1. Find the slope of each side.
2. Check that opposite sides have equal slopes (→ parallelogram).
3. Check that adjacent sides have slopes multiplying to −1 (→ right angles → rectangle).

This replaces a multi-step geometric proof with four slope calculations and two multiplications.`,
    },

    {
      type: 'js',
      instruction: `### Classify a Quadrilateral by Coordinates

Drag the four vertices. The calculator checks slopes of all four sides, determines if opposite sides are parallel (parallelogram), and whether adjacent slopes multiply to −1 (rectangle). Try making a tilted rectangle and watch it confirm the classification.`,
      html: `<canvas id="cv" width="700" height="340"></canvas>
<div id="info" style="padding:10px 16px;font-family:Georgia,serif;background:var(--color-background-secondary,#f8fafc);border-top:1px solid var(--color-border-primary,#e2e8f0);font-size:13px;line-height:1.7"></div>`,
      css: `body{margin:0;background:var(--color-background-secondary,#f8fafc)}canvas{display:block;cursor:crosshair}`,
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

var GRID=50,OX=W/2,OY=H/2;
var verts=[{x:-3,y:-2},{x:2,y:-2},{x:3,y:2},{x:-2,y:2}];
var drag=-1;

function toPx(gx,gy){return{x:OX+gx*GRID,y:OY-gy*GRID};}
function toGr(px,py){return{x:Math.round((px-OX)/GRID),y:Math.round((OY-py)/GRID)};}

function slope(a,b){
  var dx=b.x-a.x,dy=b.y-a.y;
  if(Math.abs(dx)<0.001)return Infinity;
  return dy/dx;
}

function draw(){
  ctx.clearRect(0,0,W,H);
  ctx.fillStyle=BG;ctx.fillRect(0,0,W,H);
  ctx.strokeStyle=GRID;ctx.lineWidth=1;
  for(var x=OX%GRID;x<W;x+=GRID){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,H);ctx.stroke();}
  for(var y=OY%GRID;y<H;y+=GRID){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.stroke();}
  ctx.strokeStyle='#94a3b8';ctx.lineWidth=1.5;
  ctx.beginPath();ctx.moveTo(OX,0);ctx.lineTo(OX,H);ctx.stroke();
  ctx.beginPath();ctx.moveTo(0,OY);ctx.lineTo(W,OY);ctx.stroke();

  var px=verts.map(function(v){return toPx(v.x,v.y);});
  // Fill
  ctx.beginPath();ctx.moveTo(px[0].x,px[0].y);
  px.forEach(function(p){ctx.lineTo(p.x,p.y);});
  ctx.closePath();ctx.fillStyle='#1e3a5f18';ctx.fill();

  // Sides
  var colors=['#1e3a5f','#dc2626','#1a3a2a','#7c3aed'];
  var labels=['AB','BC','CD','DA'];
  var slopes=[];
  for(var i=0;i<4;i++){
    var a=px[i],b=px[(i+1)%4];
    var ga=verts[i],gb=verts[(i+1)%4];
    ctx.strokeStyle=colors[i];ctx.lineWidth=2.5;
    ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke();
    slopes.push(slope(ga,gb));
    var mx=(a.x+b.x)/2,my=(a.y+b.y)/2;
    var m=slopes[i];
    var mStr=Math.abs(m)===Infinity?'∞':m.toFixed(2);
    ctx.fillStyle=colors[i];ctx.font='bold 11px Georgia';ctx.textAlign='center';
    ctx.fillText(labels[i]+' m='+mStr,mx+(i%2?12:-12),my+(i<2?-10:10));
  }

  // Vertices
  var vtxLabels=['A','B','C','D'];
  px.forEach(function(p,i){
    ctx.beginPath();ctx.arc(p.x,p.y,7,0,Math.PI*2);
    ctx.fillStyle=colors[i];ctx.fill();
    ctx.fillStyle=colors[i];ctx.font='bold 12px Georgia';ctx.textAlign='center';
    ctx.fillText(vtxLabels[i]+'('+verts[i].x+','+verts[i].y+')',p.x,p.y-14);
  });

  // Classification
  var abcd=slopes;
  var oppPar1=Math.abs(abcd[0]-abcd[2])<0.05||(Math.abs(abcd[0])===Infinity&&Math.abs(abcd[2])===Infinity);
  var oppPar2=Math.abs(abcd[1]-abcd[3])<0.05||(Math.abs(abcd[1])===Infinity&&Math.abs(abcd[3])===Infinity);
  var isParallel=oppPar1&&oppPar2;
  var adj12=Math.abs(abcd[0]*abcd[1]+1)<0.08;
  var adj23=Math.abs(abcd[1]*abcd[2]+1)<0.08;
  var isRect=isParallel&&adj12&&adj23;

  var classify=isRect?'RECTANGLE ✓':isParallel?'PARALLELOGRAM (not rectangle)':'General Quadrilateral';
  ctx.fillStyle=isRect?'#1a3a2a':'#1e3a5f';ctx.font='bold 13px Georgia';ctx.textAlign='center';
  ctx.fillText(classify,W/2,H-12);

  document.getElementById('info').innerHTML=
    'Slopes: AB=<b>'+fmt(abcd[0])+'</b>, BC=<b>'+fmt(abcd[1])+'</b>, CD=<b>'+fmt(abcd[2])+'</b>, DA=<b>'+fmt(abcd[3])+'</b>'
    +'<br>AB∥CD: '+(oppPar1?'✓':'✗')+' &nbsp; BC∥DA: '+(oppPar2?'✓':'✗')
    +' &nbsp; AB⊥BC (m₁m₂=−1): '+(adj12?'✓':'✗')
    +'<br><b style="color:'+(isRect?'#1a3a2a':'#1e3a5f')+'">Classification: '+classify+'</b>';
}
function fmt(m){return Math.abs(m)===Infinity?'∞':m.toFixed(2);}

function nearestVert(px,py){
  var best=-1,bd=999;
  verts.forEach(function(v,i){
    var p=toPx(v.x,v.y),d=Math.hypot(px-p.x,py-p.y);
    if(d<bd){bd=d;best=i;}
  });
  return bd<24?best:-1;
}
cv.addEventListener('mousedown',function(e){
  var r=cv.getBoundingClientRect();
  drag=nearestVert((e.clientX-r.left)*(W/r.width),(e.clientY-r.top)*(H/r.height));
});
cv.addEventListener('mousemove',function(e){
  if(drag===-1)return;
  var r=cv.getBoundingClientRect();
  var g=toGr((e.clientX-r.left)*(W/r.width),(e.clientY-r.top)*(H/r.height));
  verts[drag]=g;draw();
});
cv.addEventListener('mouseup',function(){drag=-1;});
draw();`,
      outputHeight: 440,
    },

    {
      type: 'challenge',
      instruction: `A triangle has vertices A(0,0), B(4,0), and C(2,3). What is the length of the median from C to the midpoint of AB?`,
      options: [
        { label: 'A', text: 'Length = 3' },
        { label: 'B', text: 'Length = √13' },
        { label: 'C', text: 'Length = √5' },
        { label: 'D', text: 'Length = 2' },
      ],
      check: (label) => label => label === 'A',
      successMessage: 'Correct. Midpoint of AB = (2,0). Distance from C(2,3) to M(2,0) = √((2-2)²+(3-0)²) = √9 = 3.',
      failMessage: 'Find the midpoint of AB first: M = ((0+4)/2, (0+0)/2) = (2,0). Then use the distance formula from C(2,3) to M(2,0): d = √((2-2)²+(3-0)²) = √9 = 3.',
      html: '', css: 'body{margin:0}', startCode: '', outputHeight: 260,
    },

    {
      type: 'challenge',
      instruction: `Prove that the quadrilateral with vertices P(0,0), Q(4,0), R(5,3), S(1,3) is a parallelogram using only coordinate methods (no measuring).`,
      options: [
        { label: 'A', text: 'It looks like a parallelogram from the diagram.' },
        { label: 'B', text: 'Slope of PQ = 0; slope of SR = 0. Slope of QR = (3-0)/(5-4) = 3; slope of PS = (3-0)/(1-0) = 3. Since PQ∥SR and QR∥PS (equal slopes), the quadrilateral is a parallelogram by definition.' },
        { label: 'C', text: 'PQ = QR by the distance formula, so it must be a parallelogram.' },
        { label: 'D', text: 'The diagonals are equal length, proving it is a parallelogram.' },
      ],
      check: (label) => label === 'B',
      successMessage: 'Correct. This is a coordinate proof: compute all four slopes, verify that opposite pairs are equal. Equal slopes means parallel lines. Two pairs of parallel sides → parallelogram. No diagrams, no angles — just four division calculations.',
      failMessage: 'A coordinate proof requires computing slopes, distances, or midpoints — not visual inspection. Compute slope of each side: PQ: (0-0)/(4-0)=0; SR: (3-3)/(1-5)=0 → PQ∥SR. QR: (3-0)/(5-4)=3; PS: (3-0)/(1-0)=3 → QR∥PS. Both pairs of opposite sides parallel → parallelogram.',
      html: '', css: 'body{margin:0}', startCode: '', outputHeight: 260,
    },
  ],
};

export default {
  id: 'geo-3-1',
  slug: 'coordinate-geometry',
  chapter: 'geometry-3',
  subject: 'Geometry',
  title: 'Coordinate Geometry',
  subtitle: 'How algebra and geometry become the same language',
  tags: ['geometry', 'coordinates', 'distance', 'slope', 'midpoint'],
  hook: {
    question: 'How do you find the exact distance between two points on a map?',
    realWorldContext: 'Every GPS, every game engine, every physics simulation answers this question thousands of times per second. The answer turns out to be the Pythagorean theorem wearing new clothes — once you see it, you cannot unsee it.',
  },
  intuition: {
    blocks: [
      {
        type: 'prose',
        paragraphs: [
          '**The coordinate plane is geometry with an address system.** René Descartes realized that every point in the plane could be pinned down by exactly two numbers — its horizontal position $x$ and its vertical position $y$. That single idea unified algebra and geometry: geometric shapes became equations, and equations became pictures.',
          'The payoff is enormous. Distance, angle, parallelism, perpendicularity — all of these can now be *computed*, not just drawn. And the first computation you need is distance.',
        ],
      },
      {
        type: 'prose',
        paragraphs: [
          '**A hidden right triangle.** Draw any two points on the plane. Now draw a horizontal line from the left point and a vertical line from the right point until they meet. You have just built a right triangle. The horizontal leg has length $|x_2 - x_1|$. The vertical leg has length $|y_2 - y_1|$. The straight-line distance between the two original points is the hypotenuse.',
        ],
      },
      {
        type: 'image',
        src: distanceFormulaUrl,
        alt: 'Two points A(2,1) and B(6,4) on a coordinate plane with the right triangle between them showing Δx=4, Δy=3, d=5',
        caption: 'The right triangle hiding inside any two points. The distance is always the hypotenuse.',
      },
      {
        type: 'prose',
        paragraphs: [
          'Apply the Pythagorean theorem $a^2 + b^2 = c^2$ with $a = \\Delta x$ and $b = \\Delta y$, and solve for $c$:',
        ],
      },
      {
        type: 'math',
        tex: 'd = \\sqrt{(x_2 - x_1)^2 + (y_2 - y_1)^2}',
        caption: 'The Distance Formula — Pythagoras on a coordinate grid',
      },
      {
        type: 'prose',
        paragraphs: [
          'This is not a new formula. It **is** the Pythagorean theorem. The squaring removes the need for absolute values (squaring a negative gives a positive). The square root inverts the squaring to recover the length. There is nothing to memorize that you do not already know — just recognize the triangle.',
        ],
      },
      {
        type: 'viz',
        id: 'G3_1_CoordinatePlane',
        title: 'Distance Formula Explorer',
        mathBridge: 'Drag either point. Watch how $\\Delta x$ and $\\Delta y$ change — the readout is always $\\sqrt{\\Delta x^2 + \\Delta y^2}$. Try making a 3-4-5 triangle: place one point at the origin and the other at (3, 4). The distance should be exactly 5.',
      },
      {
        type: 'prose',
        paragraphs: [
          '**The Midpoint Formula.** To find the point exactly halfway between two points, average the $x$-coordinates and average the $y$-coordinates separately. Think of it as walking halfway along the horizontal leg and halfway along the vertical leg:',
        ],
      },
      {
        type: 'math',
        tex: 'M = \\left(\\frac{x_1 + x_2}{2},\\ \\frac{y_1 + y_2}{2}\\right)',
        caption: 'The Midpoint Formula — one average for each coordinate',
      },
      {
        type: 'prose',
        paragraphs: [
          'For example, the midpoint of $(2, 1)$ and $(6, 4)$ is $\\left(\\frac{2+6}{2}, \\frac{1+4}{2}\\right) = (4, 2.5)$. If you plot that point, it sits exactly in the center of the segment connecting them.',
        ],
      },
      {
        type: 'prose',
        paragraphs: [
          '**Slope** measures the steepness and direction of a line. It is the ratio of *how much $y$ changes* to *how much $x$ changes* as you move from any one point on the line to any other:',
        ],
      },
      {
        type: 'math',
        tex: 'm = \\frac{\\Delta y}{\\Delta x} = \\frac{y_2 - y_1}{x_2 - x_1}',
        caption: 'Slope — rise over run',
      },
      {
        type: 'prose',
        paragraphs: [
          'Slope carries direction and steepness in a single number. A **positive slope** rises from left to right. A **negative slope** falls. A **zero slope** is perfectly horizontal. An **undefined slope** is vertical — the denominator $\\Delta x = 0$ causes division by zero, which signals that the line has no "run" at all.',
          '**Parallel lines** have the same slope — they lean at identical angles and therefore never meet. **Perpendicular lines** have slopes that are negative reciprocals of each other: if one line has slope $m$, the perpendicular line has slope $-\\frac{1}{m}$. Their slopes multiply to $-1$:',
        ],
      },
      {
        type: 'math',
        tex: 'm_1 \\cdot m_2 = -1 \\quad \\Longleftrightarrow \\quad \\text{lines are perpendicular}',
        caption: 'The perpendicularity condition — slopes multiply to −1',
      },
      {
        type: 'viz',
        id: 'G3_2_LinesInPlane',
        title: 'Slope and Line Relations',
        mathBridge: 'Adjust the slopes of both lines. Notice: when their product equals $-1$, the lines are exactly perpendicular. Try slope $2$ and slope $-\\tfrac{1}{2}$ — they form a perfect right angle.',
      },
      {
        type: 'viz',
        id: 'ScienceNotebook',
        props: { lesson: LESSON_GEO_3_1 },
        mathBridge: 'Work through the notebook: drag two points to see the hidden right triangle and watch $d = \\sqrt{\\Delta x^2 + \\Delta y^2}$ update live. Then use the slope explorer to find the exact moment two lines become perpendicular (product = −1). Finally, drag the quadrilateral vertices until the classifier says RECTANGLE — notice which slope conditions must be satisfied simultaneously.',
      },
    ],
  },
  mentalModel: [
    'The distance formula IS the Pythagorean theorem — every pair of points hides a right triangle',
    'Midpoint = average of each coordinate separately — split the horizontal and vertical distances in half',
    'Slope = rise ÷ run — positive rises, negative falls, zero is flat, undefined is vertical',
    'Parallel lines share a slope — perpendicular lines have slopes that multiply to −1',
  ],
  quiz: [
    {
      id: 'q0',
      type: 'choice',
      text: 'Descartes unified algebra and geometry by showing that every point in the plane can be described by…',
      options: [
        'A single number representing its distance from the origin',
        'Two numbers (x, y) — its horizontal and vertical positions',
        'Three numbers for the three dimensions of space',
      ],
      correct: 1,
    },
    {
      id: 'q1',
      type: 'choice',
      text: 'The distance formula $d = \\sqrt{(x_2-x_1)^2 + (y_2-y_1)^2}$ is a direct application of which theorem?',
      options: [
        'The quadratic formula',
        'The Pythagorean theorem',
        'The slope formula',
      ],
      correct: 1,
    },
    {
      id: 'q2',
      type: 'choice',
      text: 'What is the slope of a perfectly horizontal line?',
      options: ['Undefined', '0', '1'],
      correct: 1,
    },
    {
      id: 'q3',
      type: 'choice',
      text: 'Line A has slope 2. A line perpendicular to A has slope…',
      options: ['2', '−½', '½'],
      correct: 1,
    },
    {
      id: 'q4',
      type: 'choice',
      text: 'What is the midpoint of (2, 4) and (8, 10)?',
      options: ['(5, 7)', '(6, 6)', '(10, 14)'],
      correct: 0,
    },
    {
      id: 'q5',
      type: 'choice',
      text: 'A line has a negative slope. What does that tell you about the line?',
      options: [
        'It rises from left to right',
        'It falls from left to right',
        'It passes through the origin',
      ],
      correct: 1,
    },
    {
      id: 'q6',
      type: 'choice',
      text: 'A vertical line has an undefined slope because…',
      options: [
        'Its rise is zero',
        'Its run is zero, causing division by zero in rise ÷ run',
        'It has no y-intercept',
      ],
      correct: 1,
    },
    {
      id: 'q7',
      type: 'choice',
      text: 'Two lines are parallel if and only if…',
      options: [
        'Their slopes add to zero',
        'They have the same slope but different y-intercepts',
        'They share exactly one point',
      ],
      correct: 1,
    },
    {
      id: 'q8',
      type: 'choice',
      text: 'What is the distance between (0, 0) and (3, 4)?',
      options: ['7', '5', '√7'],
      correct: 1,
    },
    {
      id: 'q9',
      type: 'choice',
      text: 'Why does squaring $(x_2 - x_1)$ in the distance formula remove the need for absolute value signs?',
      options: [
        'Squaring always gives a positive result, so direction does not matter',
        'The square root undoes the squaring',
        'The formula only works when $x_2 > x_1$',
      ],
      correct: 0,
    },
    {
      id: 'q10',
      type: 'choice',
      text: 'You know two points on a line segment. Which formula finds the exact center of that segment?',
      options: [
        'The slope formula',
        'The midpoint formula',
        'The distance formula',
      ],
      correct: 1,
    },
  ],
};

export { LESSON_GEO_3_1 };
