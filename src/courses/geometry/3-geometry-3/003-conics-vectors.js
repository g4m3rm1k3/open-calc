import geoConicSectionsUrl from '../diagrams/geo-conic-sections.svg?url'

const LESSON_GEO_3_3 = {
  title: 'Conic Sections and Vectors',
  subject: 'Geometry',
  sequential: true,

  cells: [
    {
      type: 'markdown',
      instruction: `### One Cone, Four Famous Curves

Slice a double cone with a flat plane. The intersection is always one of four shapes:
- **Circle**: cut perpendicular to the axis (eccentricity $e = 0$)
- **Ellipse**: cut at a tilt, not parallel to a side ($0 < e < 1$)
- **Parabola**: cut parallel to exactly one side of the cone ($e = 1$)
- **Hyperbola**: cut steeply enough to intersect both nappes ($e > 1$)

All four are described by a single general equation $Ax^2 + Bxy + Cy^2 + Dx + Ey + F = 0$. The discriminant $B^2 - 4AC$ determines which conic you have.`,
    },

    {
      type: 'js',
      instruction: `### Conics on the Coordinate Plane

Select a conic and adjust its parameters. Notice how the shape changes continuously — the ellipse becomes a circle when a = b, and stretches into a hyperbola when the sign in the equation switches from + to −.`,
      html: `<div style="padding:8px 14px;background:var(--color-background-secondary,#f8fafc);display:flex;gap:14px;flex-wrap:wrap;align-items:center">
  <select id="conicType" style="padding:5px 10px;border-radius:6px;border:1.5px solid #1e3a5f;font-family:Georgia,serif;font-size:13px">
    <option value="circle">Circle</option>
    <option value="ellipse">Ellipse</option>
    <option value="parabola">Parabola</option>
    <option value="hyperbola">Hyperbola</option>
  </select>
  <label style="font-family:Georgia,serif;font-size:12px">a: <input type="range" id="paramA" min="1" max="6" value="3" style="width:80px"> <span id="aVal">3</span></label>
  <label style="font-family:Georgia,serif;font-size:12px">b: <input type="range" id="paramB" min="1" max="6" value="2" style="width:80px"> <span id="bVal">2</span></label>
</div>
<canvas id="cv" width="700" height="310"></canvas>
<div id="eq" style="padding:8px 16px;font-family:Georgia,serif;font-size:14px;text-align:center;background:var(--color-background-secondary,#f8fafc);border-top:1px solid var(--color-border-primary,#e2e8f0)"></div>`,
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

var GRID=40,OX=W/2,OY=H/2;
var typeEl=document.getElementById('conicType');
var pA=document.getElementById('paramA'),pB=document.getElementById('paramB');
var aV=document.getElementById('aVal'),bV=document.getElementById('bVal');

function draw(){
  ctx.clearRect(0,0,W,H);
  ctx.fillStyle=BG;ctx.fillRect(0,0,W,H);
  ctx.strokeStyle=GRID;ctx.lineWidth=1;
  for(var x=OX%GRID;x<W;x+=GRID){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,H);ctx.stroke();}
  for(var y=OY%GRID;y<H;y+=GRID){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.stroke();}
  ctx.strokeStyle='#94a3b8';ctx.lineWidth=1.5;
  ctx.beginPath();ctx.moveTo(OX,0);ctx.lineTo(OX,H);ctx.stroke();
  ctx.beginPath();ctx.moveTo(0,OY);ctx.lineTo(W,OY);ctx.stroke();

  var a=parseInt(pA.value),b=parseInt(pB.value);
  aV.textContent=a;bV.textContent=b;
  var type=typeEl.value;
  var aPx=a*GRID,bPx=b*GRID;

  ctx.strokeStyle=NAVY;ctx.lineWidth=2.5;

  if(type==='circle'){
    ctx.beginPath();ctx.arc(OX,OY,aPx,0,Math.PI*2);ctx.stroke();
    document.getElementById('eq').innerHTML='<b>Circle: x² + y² = '+a+'² = '+(a*a)+'</b>';
  }
  if(type==='ellipse'){
    ctx.beginPath();ctx.ellipse(OX,OY,aPx,bPx,0,0,Math.PI*2);ctx.stroke();
    // Foci
    var c=Math.sqrt(Math.max(0,a*a-b*b))*GRID;
    [[OX-c,OY],[OX+c,OY]].forEach(function(f){
      ctx.beginPath();ctx.arc(f[0],f[1],5,0,Math.PI*2);
      ctx.fillStyle=RED;ctx.fill();
    });
    ctx.fillStyle=RED;ctx.font='11px Georgia';ctx.textAlign='center';
    ctx.fillText('F₁',OX-c,OY-12);ctx.fillText('F₂',OX+c,OY-12);
    document.getElementById('eq').innerHTML='<b>Ellipse: x²/'+a+'² + y²/'+b+'² = 1</b>&emsp;<span style="color:#dc2626">c = √(a²−b²) = '+Math.sqrt(Math.max(0,a*a-b*b)).toFixed(2)+'</span>';
  }
  if(type==='parabola'){
    ctx.beginPath();
    for(var px=-W/2;px<=W/2;px+=2){
      var y=(px/GRID)*(px/GRID)/(4*(b));
      var cy=OY-y*GRID;
      if(px===-W/2)ctx.moveTo(OX+px,cy);else ctx.lineTo(OX+px,cy);
    }
    ctx.stroke();
    // Focus
    ctx.beginPath();ctx.arc(OX,OY-b*GRID,5,0,Math.PI*2);ctx.fillStyle=RED;ctx.fill();
    ctx.fillStyle=RED;ctx.font='11px Georgia';ctx.textAlign='center';ctx.fillText('Focus (0,'+b+')',OX,OY-b*GRID-12);
    // Directrix
    ctx.setLineDash([5,4]);ctx.strokeStyle='#dc2626';ctx.lineWidth=1.5;
    ctx.beginPath();ctx.moveTo(0,OY+b*GRID);ctx.lineTo(W,OY+b*GRID);ctx.stroke();
    ctx.setLineDash([]);ctx.fillText('directrix y=−'+b,OX+140,OY+b*GRID-6);
    document.getElementById('eq').innerHTML='<b>Parabola: x² = 4·'+b+'·y = '+4*b+'y</b>&emsp;Opens upward, focus at (0, '+b+')';
  }
  if(type==='hyperbola'){
    ctx.beginPath();
    for(var gx=1;gx<=W/2/GRID+1;gx+=0.05){
      var gy=b*Math.sqrt((gx*gx)/(a*a)-1);
      if(isNaN(gy))continue;
      if(gx===1)ctx.moveTo(OX+gx*GRID,OY-gy*GRID);else ctx.lineTo(OX+gx*GRID,OY-gy*GRID);
    }
    for(var gx2=1;gx2<=W/2/GRID+1;gx2+=0.05){
      var gy2=b*Math.sqrt((gx2*gx2)/(a*a)-1);
      if(isNaN(gy2))continue;
      ctx.lineTo(OX+gx2*GRID,OY+gy2*GRID);
    }
    ctx.stroke();
    ctx.beginPath();
    for(var gx3=1;gx3<=W/2/GRID+1;gx3+=0.05){
      var gy3=b*Math.sqrt((gx3*gx3)/(a*a)-1);
      if(isNaN(gy3))continue;
      if(gx3===1)ctx.moveTo(OX-gx3*GRID,OY-gy3*GRID);else ctx.lineTo(OX-gx3*GRID,OY-gy3*GRID);
    }
    for(var gx4=1;gx4<=W/2/GRID+1;gx4+=0.05){
      var gy4=b*Math.sqrt((gx4*gx4)/(a*a)-1);
      if(isNaN(gy4))continue;
      ctx.lineTo(OX-gx4*GRID,OY+gy4*GRID);
    }
    ctx.stroke();
    document.getElementById('eq').innerHTML='<b>Hyperbola: x²/'+a+'² − y²/'+b+'² = 1</b>&emsp;Two branches, asymptotes y = ±('+b+'/'+a+')x';
  }
}

[typeEl,pA,pB].forEach(function(el){el.addEventListener('change',draw);el.addEventListener('input',draw);});
draw();`,
      outputHeight: 430,
    },

    {
      type: 'js',
      instruction: `### Vectors: Direction + Magnitude

A vector has both magnitude and direction. Drag the tips of vectors **u** and **v**. The dot product, angle between them, and magnitudes update live. When the dot product is exactly 0, the vectors are perpendicular — this is the algebraic test.`,
      html: `<canvas id="cv" width="700" height="320"></canvas>
<div id="info" style="padding:10px 16px;font-family:Georgia,serif;font-size:13px;background:var(--color-background-secondary,#f8fafc);border-top:1px solid var(--color-border-primary,#e2e8f0);line-height:1.8"></div>`,
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

var GRID=40,OX=W/2,OY=H/2;
var vecs=[{x:4,y:2,col:'#1e3a5f',lbl:'u'},{x:-1,y:3,col:'#dc2626',lbl:'v'}];
var drag=-1;

function toPx(gx,gy){return{x:OX+gx*GRID,y:OY-gy*GRID};}
function toGr(px,py){return{x:Math.round((px-OX)/GRID),y:Math.round((OY-py)/GRID)};}

function drawArrow(x1,y1,x2,y2,col){
  ctx.strokeStyle=col;ctx.lineWidth=2.5;
  ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke();
  var ang=Math.atan2(y2-y1,x2-x1);
  ctx.fillStyle=col;
  ctx.beginPath();
  ctx.moveTo(x2,y2);
  ctx.lineTo(x2-14*Math.cos(ang-0.35),y2-14*Math.sin(ang-0.35));
  ctx.lineTo(x2-14*Math.cos(ang+0.35),y2-14*Math.sin(ang+0.35));
  ctx.closePath();ctx.fill();
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

  var u=vecs[0],v=vecs[1];
  var upx=toPx(u.x,u.y),vpx=toPx(v.x,v.y);
  drawArrow(OX,OY,upx.x,upx.y,u.col);
  drawArrow(OX,OY,vpx.x,vpx.y,v.col);

  ctx.font='bold 13px Georgia';ctx.textAlign='left';
  ctx.fillStyle=u.col;ctx.fillText('u = ⟨'+u.x+', '+u.y+'⟩',upx.x+8,upx.y-8);
  ctx.fillStyle=v.col;ctx.fillText('v = ⟨'+v.x+', '+v.y+'⟩',vpx.x+8,vpx.y-8);

  // Handles
  [upx,vpx].forEach(function(p,i){
    ctx.beginPath();ctx.arc(p.x,p.y,8,0,Math.PI*2);
    ctx.fillStyle=vecs[i].col;ctx.fill();
  });

  var dot=u.x*v.x+u.y*v.y;
  var magU=Math.sqrt(u.x*u.x+u.y*u.y);
  var magV=Math.sqrt(v.x*v.x+v.y*v.y);
  var cosA=magU&&magV?dot/(magU*magV):0;
  var ang=Math.acos(Math.max(-1,Math.min(1,cosA)))*180/Math.PI;
  var isPerp=Math.abs(dot)<0.05;

  document.getElementById('info').innerHTML=
    '|u| = √('+u.x+'²+'+u.y+'²) = '+magU.toFixed(2)
    +'&emsp;|v| = √('+v.x+'²+'+v.y+'²) = '+magV.toFixed(2)
    +'<br>u · v = '+u.x+'·'+v.x+' + '+u.y+'·'+v.y+' = <b style="color:'+(isPerp?'#1a3a2a':'#1e293b')+'">'+dot+'</b>'
    +(isPerp?' ← <b style="color:#1a3a2a">Perpendicular! ⊥</b>':'')
    +'&emsp;Angle between: <b>'+ang.toFixed(1)+'°</b>';
}

cv.addEventListener('mousedown',function(e){
  var r=cv.getBoundingClientRect(),px=(e.clientX-r.left)*(W/r.width),py=(e.clientY-r.top)*(H/r.height);
  vecs.forEach(function(v,i){
    var p=toPx(v.x,v.y);
    if(Math.hypot(px-p.x,py-p.y)<16)drag=i;
  });
});
cv.addEventListener('mousemove',function(e){
  if(drag===-1)return;
  var r=cv.getBoundingClientRect();
  var g=toGr((e.clientX-r.left)*(W/r.width),(e.clientY-r.top)*(H/r.height));
  vecs[drag]={x:g.x,y:g.y,col:vecs[drag].col,lbl:vecs[drag].lbl};
  draw();
});
cv.addEventListener('mouseup',function(){drag=-1;});
draw();`,
      outputHeight: 420,
    },

    {
      type: 'challenge',
      instruction: `Vectors $\\vec{u} = \\langle 3, -2 \\rangle$ and $\\vec{v} = \\langle 4, 6 \\rangle$. Is their dot product zero? Are they perpendicular?`,
      options: [
        { label: 'A', text: 'Dot product = 0. Yes, perpendicular.' },
        { label: 'B', text: 'Dot product = 12 − 12 = 0. Yes, perpendicular.' },
        { label: 'C', text: 'Dot product = 3·4 + (−2)·6 = 12 − 12 = 0. Yes, perpendicular!' },
        { label: 'D', text: 'Dot product = 3·4 + (−2)·6 = 12 + 12 = 24. Not perpendicular.' },
      ],
      check: (label) => label === 'C',
      successMessage: 'Correct. 3·4 + (−2)·6 = 12 − 12 = 0. The dot product is zero, confirming the vectors are perpendicular. This algebraic test works in any number of dimensions.',
      failMessage: 'Compute: 3·4 = 12, (−2)·6 = −12. Sum: 12 + (−12) = 0. The dot product is zero, so the vectors are perpendicular. Sign matters — (−2)·6 is negative twelve, not positive.',
      html: '', css: 'body{margin:0}', startCode: '', outputHeight: 260,
    },

    {
      type: 'challenge',
      instruction: `An ellipse has semi-major axis $a = 5$ and semi-minor axis $b = 3$. What is the distance $c$ from the center to each focus?`,
      options: [
        { label: 'A', text: '$c = 4$ (because $c^2 = a^2 - b^2 = 25 - 9 = 16$)' },
        { label: 'B', text: '$c = \\sqrt{34}$' },
        { label: 'C', text: '$c = 8$' },
        { label: 'D', text: '$c = 2$' },
      ],
      check: (label) => label === 'A',
      successMessage: 'Correct. For an ellipse: c² = a² − b² = 25 − 9 = 16, so c = 4. The foci are 4 units from the center along the major axis. The sum of focal distances for any point on this ellipse equals 2a = 10.',
      failMessage: 'Use the ellipse focal formula: c² = a² − b² = 5² − 3² = 25 − 9 = 16. So c = 4. (Note: for a hyperbola the formula is c² = a² + b². For an ellipse the foci are inside the ellipse, so c < a.)',
      html: '', css: 'body{margin:0}', startCode: '', outputHeight: 260,
    },
  ],
};

export default {
  id: 'geo-3-3',
  slug: 'conics-vectors',
  chapter: 'geometry-3',
  subject: 'Geometry',
  title: 'Conic Sections and Vectors',
  subtitle: 'Four curves from one cone, and direction with magnitude',
  tags: ['geometry', 'conics', 'vectors'],
  hook: {
    question: 'Why do planets orbit in ellipses rather than perfect circles?',
    realWorldContext: 'Kepler discovered in 1609 that planetary orbits are ellipses. The same mathematics describes satellite dishes (paraboloids), cooling towers (hyperbolas), and the trajectory of every thrown object. Conic sections are not obscure — they appear wherever curves meet physics.',
  },
  intuition: {
    blocks: [
      {
        type: 'prose',
        paragraphs: [
          '**One cone, four curves.** A double cone extending infinitely in both directions can be sliced by a flat plane. Depending on the angle of the cut, the intersection is exactly one of four shapes: a circle, an ellipse, a parabola, or a hyperbola. These are the *conic sections*, and all four are described by algebraic equations of degree two.',
          'The angle of the cutting plane determines which curve you get: perpendicular to the axis gives a circle; tilted slightly gives an ellipse; tilted so the plane is parallel to exactly one side of the cone gives a parabola; tilted so the plane cuts both nappes of the cone gives a hyperbola.',
        ],
      },
      {
        type: 'math',
        tex: '\\text{Circle:}\\ (x-h)^2+(y-k)^2=r^2 \\qquad \\text{Ellipse:}\\ \\frac{(x-h)^2}{a^2}+\\frac{(y-k)^2}{b^2}=1',
        caption: 'Standard forms — circle is an ellipse with a = b = r',
      },
      {
        type: 'math',
        tex: '\\text{Parabola:}\\ y=a(x-h)^2+k \\qquad \\text{Hyperbola:}\\ \\frac{(x-h)^2}{a^2}-\\frac{(y-k)^2}{b^2}=1',
        caption: 'The minus sign in the hyperbola equation is what causes two separate branches',
      },
      {
        type: 'image',
        src: geoConicSectionsUrl,
        alt: 'Four conic sections side by side: circle (slice perpendicular to axis), ellipse (tilted slice, two foci), parabola (parallel to slant edge, one focus and directrix), hyperbola (two branches, two foci).',
        caption: 'One cone, four curves. The cutting plane angle determines the conic. Circle: e=0. Ellipse: 0<e<1. Parabola: e=1. Hyperbola: e>1.',
      },
      {
        type: 'prose',
        paragraphs: [
          '**Ellipses** have two focal points. The defining property is that the sum of distances from any point on the ellipse to the two foci is constant. This is why a whisper at one focus of an elliptical room can be heard clearly at the other focus — sound waves reflecting off the wall converge there exactly.',
          '**Parabolas** have one focus and one directrix (a line). Every point on the parabola is equidistant from the focus and the directrix. This property means parallel incoming signals (like satellite signals or light from infinity) all reflect to the focus — which is why satellite dishes and telescope mirrors are paraboloids.',
          '**Hyperbolas** have two foci as well, but the *difference* of distances to the foci is constant. They appear in LORAN navigation, sonic booms, and cooling tower profiles.',
        ],
      },
      {
        type: 'viz',
        id: 'G3_5_ConicSections',
        title: 'Conic Sections Explorer',
        mathBridge: 'Adjust the cutting plane angle to see each conic section emerge. Notice the transition from circle to ellipse to parabola to hyperbola — the eccentricity $e$ tracks how "stretched" each curve is. A circle has $e = 0$; an ellipse has $0 < e < 1$; a parabola has $e = 1$; a hyperbola has $e > 1$.',
      },
      {
        type: 'prose',
        paragraphs: [
          '**Vectors: direction with magnitude.** A vector is a quantity that has both a size (magnitude) and a direction. On the coordinate plane, a vector $\\vec{v} = \\langle a, b \\rangle$ points $a$ units horizontally and $b$ units vertically from its tail to its tip.',
          'The **magnitude** (length) of a vector is computed exactly like the distance formula:',
        ],
      },
      {
        type: 'math',
        tex: '|\\vec{v}| = \\sqrt{a^2 + b^2}',
        caption: 'Vector magnitude — the distance formula from the origin to (a, b)',
      },
      {
        type: 'prose',
        paragraphs: [
          '**Vector addition** places vectors head to tail: $\\vec{u} + \\vec{v} = \\langle u_x + v_x,\\ u_y + v_y \\rangle$. This is why you add velocity components to find the resultant velocity of a boat crossing a current.',
          '**Scalar multiplication** stretches or shrinks a vector: $c\\,\\vec{v} = \\langle ca, cb \\rangle$. A negative scalar reverses direction.',
          'The **dot product** combines two vectors into a single number that encodes the angle between them:',
        ],
      },
      {
        type: 'math',
        tex: '\\vec{u} \\cdot \\vec{v} = u_x v_x + u_y v_y = |\\vec{u}||\\vec{v}|\\cos\\theta',
        caption: 'Dot product — the cosine formula: if the dot product is 0, the vectors are perpendicular',
      },
      {
        type: 'prose',
        paragraphs: [
          'The dot product equals zero when $\\cos\\theta = 0$, i.e., when $\\theta = 90°$ — the vectors are perpendicular. This is the algebraic test for perpendicularity in any dimension, not just 2D. A vector with magnitude 1 is called a **unit vector**; dividing any vector by its magnitude produces a unit vector in the same direction.',
        ],
      },
      {
        type: 'viz',
        id: 'G3_6_Vectors',
        title: 'Vectors and the Dot Product',
        mathBridge: 'Drag the tips of $\\vec{u}$ and $\\vec{v}$. The dot product and angle update in real time. Set the vectors perpendicular — the dot product will read exactly $0$. Notice the geometric interpretation: the dot product measures how much one vector "projects onto" the other, scaled by the other\'s length.',
      },
      {
        type: 'viz',
        id: 'ScienceNotebook',
        props: { lesson: LESSON_GEO_3_3 },
        mathBridge: 'Use the conic explorer to transition from circle → ellipse → parabola → hyperbola by changing the type and parameters. Notice how the equation changes at each step. Then use the vector explorer: drag two vectors until their dot product reads exactly 0 — what angle does the display show? Try to find a pair where one vector is twice the other (scalar multiplication).',
      },
    ],
  },
  mentalModel: [
    'Conic sections are slices of a cone — the cut angle determines whether you get a circle, ellipse, parabola, or hyperbola',
    'Ellipse: sum of focal distances is constant. Parabola: focus–point = directrix–point. Hyperbola: difference of focal distances is constant',
    'A vector has magnitude (distance formula) and direction — add component-wise, scale each component',
    'Dot product = 0 means perpendicular; the angle formula $\\cos\\theta = \\vec{u}\\cdot\\vec{v}/(|\\vec{u}||\\vec{v}|)$ works in any dimension',
  ],
  quiz: [
    {
      id: 'q1',
      type: 'choice',
      text: 'Which conic section results when a plane cuts a cone parallel to exactly one side of the cone?',
      options: ['Ellipse', 'Parabola', 'Hyperbola'],
      correct: 1,
    },
    {
      id: 'q2',
      type: 'choice',
      text: 'An ellipse is defined as the set of points where the _______ of distances to two foci is constant.',
      options: ['product', 'difference', 'sum'],
      correct: 2,
    },
    {
      id: 'q3',
      type: 'choice',
      text: 'The eccentricity of a parabola equals…',
      options: ['0', '1', 'Greater than 1'],
      correct: 1,
    },
    {
      id: 'q4',
      type: 'choice',
      text: 'Why does a satellite dish work? Its cross-section is a parabola because…',
      options: [
        'Parabolas are the strongest structural shape',
        'All incoming parallel rays reflect to the single focus of the parabola',
        'Parabolas have two foci that amplify signals',
      ],
      correct: 1,
    },
    {
      id: 'q5',
      type: 'choice',
      text: 'The vector $\\vec{v} = \\langle 3, 4 \\rangle$ has magnitude…',
      options: ['7', '5', '12'],
      correct: 1,
    },
    {
      id: 'q6',
      type: 'choice',
      text: 'The dot product $\\langle 2, -3 \\rangle \\cdot \\langle 3, 2 \\rangle$ equals…',
      options: ['0', '12', '-6'],
      correct: 0,
    },
    {
      id: 'q7',
      type: 'choice',
      text: 'Two vectors have a dot product of $0$. This means they are…',
      options: ['Parallel', 'Perpendicular', 'Equal in length'],
      correct: 1,
    },
    {
      id: 'q8',
      type: 'choice',
      text: 'The sum of vectors $\\langle 1, 3 \\rangle + \\langle 4, -1 \\rangle$ equals…',
      options: ['$\\langle 5, 2 \\rangle$', '$\\langle 4, -3 \\rangle$', '$\\langle 3, 4 \\rangle$'],
      correct: 0,
    },
    {
      id: 'q9',
      type: 'choice',
      text: 'What equation identifies a hyperbola?',
      options: [
        '$\\frac{x^2}{a^2} + \\frac{y^2}{b^2} = 1$ (plus sign)',
        '$\\frac{x^2}{a^2} - \\frac{y^2}{b^2} = 1$ (minus sign)',
        '$y = ax^2 + bx + c$',
      ],
      correct: 1,
    },
    {
      id: 'q10',
      type: 'choice',
      text: 'A unit vector is defined as a vector with…',
      options: ['Magnitude 0', 'Magnitude 1', 'Direction along the x-axis'],
      correct: 1,
    },
  ],
};

export { LESSON_GEO_3_3 };
