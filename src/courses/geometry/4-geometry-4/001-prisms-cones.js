import geo3dVolumeUrl from '../diagrams/geo-3d-volume-formulas.svg?url'

const LESSON_GEO_4_1 = {
  title: 'Prisms, Cylinders, and Cones',
  subject: 'Geometry',
  sequential: true,

  cells: [
    {
      type: 'markdown',
      instruction: `### Volume = Stacked Area

Every 3D solid whose cross-section is **constant** has volume = base area × height. Think of stacking coins: each coin has area $A$, and stacking $h$ worth of coins gives total volume $A \\times h$. This is the heart of every prism and cylinder formula.

Solids that **taper** to a point are different. The cross-section shrinks as you go up, averaging to $\\frac{1}{3}$ of the base — which is why every cone and pyramid has the $\\frac{1}{3}$ factor.`,
    },

    {
      type: 'js',
      instruction: `### Cylinder and Prism Volume Explorer

Adjust radius (or side) and height. The formula $V = A_{\\text{base}} \\times h$ is always visible. Switch between cylinder and rectangular prism — same logic, different base shape.`,
      html: `<div style="padding:8px 14px;background:var(--color-background-secondary,#f8fafc);display:flex;gap:16px;flex-wrap:wrap;align-items:center">
  <select id="shapeType" style="padding:5px 10px;border-radius:6px;border:1.5px solid #1e3a5f;font-family:Georgia,serif;font-size:13px">
    <option value="cylinder">Cylinder</option>
    <option value="prism">Rectangular Prism</option>
    <option value="triangular">Triangular Prism</option>
  </select>
  <label style="font-family:Georgia,serif;font-size:12px">dim1: <input type="range" id="d1" min="1" max="6" value="3" style="width:90px"> <span id="d1v">3</span></label>
  <label style="font-family:Georgia,serif;font-size:12px">dim2: <input type="range" id="d2" min="1" max="6" value="4" style="width:90px"> <span id="d2v">4</span></label>
  <label style="font-family:Georgia,serif;font-size:12px">height: <input type="range" id="h1" min="1" max="8" value="5" style="width:90px"> <span id="h1v">5</span></label>
</div>
<canvas id="cv" width="700" height="280"></canvas>
<div id="info" style="padding:10px 16px;font-family:Georgia,serif;font-size:14px;text-align:center;background:var(--color-background-secondary,#f8fafc);border-top:1px solid var(--color-border-primary,#e2e8f0)"></div>`,
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

var SCALE=28;

function draw(){
  ctx.clearRect(0,0,W,H);
  ctx.fillStyle=BG;ctx.fillRect(0,0,W,H);
  var type=document.getElementById('shapeType').value;
  var d1=parseInt(document.getElementById('d1').value);
  var d2=parseInt(document.getElementById('d2').value);
  var h=parseInt(document.getElementById('h1').value);
  document.getElementById('d1v').textContent=d1;
  document.getElementById('d2v').textContent=d2;
  document.getElementById('h1v').textContent=h;

  var cx=W/2-60,cy=H/2+30;
  var hPx=h*SCALE,d1Px=d1*SCALE,d2Px=d2*SCALE;
  var skewX=20,skewY=-12; // isometric offset

  function isoTop(x,y){return{x:cx+x-y*0.5+skewX,y:cy-x*0.2-y*0.3+skewY};}
  function isoBot(x,y,dh){return{x:cx+x-y*0.5+skewX,y:cy-x*0.2-y*0.3+skewY+dh};}

  var baseArea,formula,volStr;
  if(type==='cylinder'){
    var r=d1Px/2;
    baseArea=Math.PI*d1*d1/4;
    formula='V = πr²·h = π·'+d1+'²/4·'+h+' ≈ '+(baseArea*h).toFixed(1)+' units³';
    // Draw cylinder
    ctx.strokeStyle=NAVY;ctx.lineWidth=2;
    ctx.fillStyle='#1e3a5f22';
    // Bottom ellipse
    ctx.beginPath();ctx.ellipse(cx,cy,r,r*0.35,0,0,Math.PI*2);ctx.fill();ctx.stroke();
    // Top ellipse
    ctx.beginPath();ctx.ellipse(cx,cy-hPx,r,r*0.35,0,0,Math.PI*2);
    ctx.fillStyle='#1e3a5f44';ctx.fill();ctx.stroke();
    // Sides
    ctx.fillStyle='#1e3a5f18';
    ctx.beginPath();ctx.moveTo(cx-r,cy);ctx.lineTo(cx-r,cy-hPx);ctx.ellipse(cx,cy-hPx,r,r*0.35,0,Math.PI,0,true);ctx.lineTo(cx+r,cy);ctx.ellipse(cx,cy,r,r*0.35,0,0,Math.PI);ctx.closePath();ctx.fill();ctx.stroke();
    // Labels
    ctx.fillStyle=RED;ctx.font='bold 12px Georgia';ctx.textAlign='center';
    ctx.fillText('r = '+d1,cx,cy+22);
    ctx.fillText('h = '+h,cx+r+30,cy-hPx/2);
  } else {
    var w1=d1Px,w2=(type==='triangular'?d1Px*0.5:d2Px);
    baseArea=(type==='triangular'?0.5*d1*d2:d1*d2);
    formula=(type==='triangular'?'V = ½·'+d1+'·'+d2+'·'+h+' = '+(0.5*d1*d2*h).toFixed(1):'V = '+d1+'·'+d2+'·'+h+' = '+(d1*d2*h).toFixed(1))+' units³';
    var corners=[{x:-w1/2,y:0},{x:w1/2,y:0},{x:w1/2,y:w2},{x:-w1/2,y:w2}];
    if(type==='triangular')corners=[{x:-w1/2,y:0},{x:w1/2,y:0},{x:0,y:w2}];
    function drawFace(pts,dh,col){
      ctx.beginPath();
      pts.forEach(function(p,i){
        var q=isoBot(p.x,p.y,dh);
        if(i===0)ctx.moveTo(q.x,q.y);else ctx.lineTo(q.x,q.y);
      });
      ctx.closePath();ctx.fillStyle=col;ctx.fill();ctx.strokeStyle=NAVY;ctx.lineWidth=1.5;ctx.stroke();
    }
    drawFace(corners,0,'#1e3a5f22');
    drawFace(corners,-hPx,'#1e3a5f44');
    corners.forEach(function(p,i){
      var b=isoBot(p.x,p.y,0),t=isoBot(p.x,p.y,-hPx);
      ctx.strokeStyle=NAVY;ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(b.x,b.y);ctx.lineTo(t.x,t.y);ctx.stroke();
    });
  }

  // Height arrow
  ctx.strokeStyle=MUTED;ctx.lineWidth=1.5;
  ctx.setLineDash([4,3]);
  ctx.beginPath();ctx.moveTo(cx+d1Px/2+40,cy);ctx.lineTo(cx+d1Px/2+40,cy-hPx);ctx.stroke();
  ctx.setLineDash([]);
  ctx.fillStyle=MUTED;ctx.font='11px Georgia';ctx.textAlign='left';
  ctx.fillText('h = '+h,cx+d1Px/2+44,cy-hPx/2+4);

  document.getElementById('info').innerHTML='<b style="color:#1e3a5f">'+formula+'</b>&emsp;<span style="color:#64748b">Base area = '+(baseArea.toFixed(2))+' | Height = '+h+' | Volume = '+(baseArea*h).toFixed(2)+'</span>';
}

['shapeType','d1','d2','h1'].forEach(function(id){
  document.getElementById(id).addEventListener('input',draw);
  document.getElementById(id).addEventListener('change',draw);
});
draw();`,
      outputHeight: 380,
    },

    {
      type: 'js',
      instruction: `### The One-Third Factor: Three Cones = One Cylinder

A cone has exactly **⅓** the volume of the cylinder with the same base and height. This animation fills the cone with water and pours it into the cylinder — watch how many pourings are needed.`,
      html: `<canvas id="cv" width="700" height="300"></canvas>
<div style="display:flex;justify-content:center;gap:12px;padding:8px;background:var(--color-background-secondary,#f8fafc)">
  <button id="pourBtn" style="padding:7px 20px;border-radius:8px;border:none;background:#1e3a5f;color:#fff;font-family:Georgia,serif;font-size:13px;font-weight:700;cursor:pointer">Pour →</button>
  <button id="resetBtn" style="padding:7px 20px;border-radius:8px;border:1.5px solid #1e3a5f;background:transparent;color:#1e3a5f;font-family:Georgia,serif;font-size:13px;font-weight:700;cursor:pointer">Reset</button>
</div>
<div id="msg" style="padding:8px 16px;font-family:Georgia,serif;font-size:14px;text-align:center;background:var(--color-background-secondary,#f8fafc);border-top:1px solid var(--color-border-primary,#e2e8f0)"></div>`,
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

var pourCount=0;
var coneLevel=1.0; // 1 = full, 0 = empty
var cylLevel=0.0;
var R=60,CONEH=140,CYLH=140;
var coneCX=180,cylCX=500,baseY=H-40;

function drawScene(){
  ctx.clearRect(0,0,W,H);
  ctx.fillStyle=BG;ctx.fillRect(0,0,W,H);

  // Cone outline
  ctx.strokeStyle=NAVY;ctx.lineWidth=2.5;
  ctx.beginPath();
  ctx.moveTo(coneCX-R,baseY);
  ctx.lineTo(coneCX,baseY-CONEH);
  ctx.lineTo(coneCX+R,baseY);
  ctx.closePath();ctx.stroke();

  // Water in cone (fills from bottom tip up)
  if(coneLevel>0){
    var wH=CONEH*coneLevel;
    var wR=R*coneLevel;
    ctx.fillStyle='#3b82f6aa';
    ctx.beginPath();
    ctx.moveTo(coneCX-wR,baseY-wH);
    ctx.lineTo(coneCX,baseY-CONEH);
    ctx.lineTo(coneCX+wR,baseY-wH);
    ctx.closePath();ctx.fill();
  }

  // Cylinder outline
  ctx.strokeStyle=NAVY;ctx.lineWidth=2.5;
  ctx.strokeRect(cylCX-R,baseY-CYLH,R*2,CYLH);

  // Water in cylinder
  if(cylLevel>0){
    var wh=CYLH*cylLevel;
    ctx.fillStyle='#3b82f6aa';
    ctx.fillRect(cylCX-R+2,baseY-wh,R*2-4,wh);
  }

  // Labels
  ctx.fillStyle=NAVY;ctx.font='bold 13px Georgia';ctx.textAlign='center';
  ctx.fillText('Cone',coneCX,baseY+18);
  ctx.fillText('V = ⅓πr²h',coneCX,baseY+32);
  ctx.fillText('Cylinder',cylCX,baseY+18);
  ctx.fillText('V = πr²h',cylCX,baseY+32);
  ctx.fillText('r',coneCX+R+10,baseY-5);
  ctx.fillText('r',cylCX+R+10,baseY-CYLH/2);

  // Pour count
  ctx.fillStyle=pourCount===3?'#1a3a2a':'#374151';
  ctx.font='bold 14px Georgia';ctx.textAlign='center';
  ctx.fillText('Pourings: '+pourCount+'/3',W/2,baseY+50);

  var msgs=['Cone is full. Press Pour! (V = ⅓πr²h)',
    'Poured 1×. Cylinder is ⅓ full.',
    'Poured 2×. Cylinder is ⅔ full.',
    'Poured 3×. Cylinder is exactly FULL! 3 × (⅓πr²h) = πr²h ✓'];
  document.getElementById('msg').innerHTML='<b>'+msgs[pourCount]+'</b>';
}

document.getElementById('pourBtn').onclick=function(){
  if(pourCount>=3)return;
  pourCount++;
  coneLevel=1.0;
  cylLevel=pourCount/3;
  // animate: empty cone
  var frames=0;
  function anim(){
    frames++;
    coneLevel=Math.max(0,1-frames/30);
    drawScene();
    if(frames<30)requestAnimationFrame(anim);
  }
  requestAnimationFrame(anim);
};
document.getElementById('resetBtn').onclick=function(){pourCount=0;coneLevel=1;cylLevel=0;drawScene();};
drawScene();`,
      outputHeight: 380,
    },

    {
      type: 'challenge',
      instruction: `A cone has radius $r = 4$ cm and height $h = 9$ cm. What is its volume, and what is its slant height?`,
      options: [
        { label: 'A', text: 'Volume = $48\\pi$ cm³; slant height = $\\sqrt{97}$ cm' },
        { label: 'B', text: 'Volume = $144\\pi$ cm³; slant height = $\\sqrt{97}$ cm' },
        { label: 'C', text: 'Volume = $48\\pi$ cm³; slant height = $13$ cm' },
        { label: 'D', text: 'Volume = $48\\pi$ cm³; slant height = $\\sqrt{65}$ cm' },
      ],
      check: (label) => label === 'A',
      successMessage: 'Correct. V = ⅓πr²h = ⅓·π·16·9 = 48π cm³. Slant height: ℓ = √(r²+h²) = √(16+81) = √97 cm.',
      failMessage: 'Volume: V = ⅓πr²h = ⅓·π·4²·9 = ⅓·π·144 = 48π. Slant height: ℓ = √(r²+h²) = √(4²+9²) = √(16+81) = √97.',
      html: '', css: 'body{margin:0}', startCode: '', outputHeight: 260,
    },

    {
      type: 'challenge',
      instruction: `A triangular prism has a right-triangle base with legs $5$ cm and $12$ cm, and length $10$ cm. What is its volume?`,
      options: [
        { label: 'A', text: '300 cm³' },
        { label: 'B', text: '600 cm³' },
        { label: 'C', text: '150 cm³' },
        { label: 'D', text: '60 cm³' },
      ],
      check: (label) => label === 'A',
      successMessage: 'Correct. Base area = ½ × 5 × 12 = 30 cm². Volume = 30 × 10 = 300 cm³.',
      failMessage: 'The base is a right triangle: area = ½ × leg₁ × leg₂ = ½ × 5 × 12 = 30 cm². Volume = base area × length = 30 × 10 = 300 cm³.',
      html: '', css: 'body{margin:0}', startCode: '', outputHeight: 260,
    },
  ],
};

export default {
  id: 'geo-4-1',
  slug: 'prisms-cones',
  chapter: 'geometry-4',
  subject: 'Geometry',
  title: 'Prisms, Cylinders, and Cones',
  subtitle: 'Why volume is base area times height — and why cones are exactly one-third of cylinders',
  tags: ['geometry', '3d', 'volume', 'prisms', 'cylinders', 'cones'],
  hook: {
    question: 'Why is a cone exactly one-third the volume of a cylinder with the same base and height?',
    realWorldContext: 'Concrete is sold by the cubic meter, fuel tanks are specified in liters, and grain silos are measured in cubic feet. Every engineer and contractor needs to compute volumes precisely. The elegant one-third factor between a cone and a cylinder is not an accident — it has a beautiful geometric proof.',
  },
  intuition: {
    blocks: [
      {
        type: 'prose',
        paragraphs: [
          '**Volume is layered area.** Every 3D solid whose cross-section stays constant as you slice horizontally has volume equal to the base area times the height. This is Cavalieri\'s principle in its simplest form: stack infinitely thin layers, each with area $A$, for a total height $h$.',
        ],
      },
      {
        type: 'image',
        src: geo3dVolumeUrl,
        alt: 'Four 3D shapes: Prism/Cylinder (V=Bh, V=πr²h), Cone (V=⅓πr²h), Pyramid (V=⅓Bh), Sphere (V=⁴/₃πr³, SA=4πr²).',
        caption: 'Every volume formula for solids with a base: V = (Base Area) × Height (prism/cylinder) or V = ⅓ × Base × Height (cone/pyramid). Sphere: V = ⁴⁄₃πr³.',
      },
      {
        type: 'math',
        tex: 'V_{\\text{prism}} = A_{\\text{base}} \\times h \\qquad V_{\\text{cylinder}} = \\pi r^2 h',
        caption: 'Prism and cylinder — constant cross-section means V = Ah',
      },
      {
        type: 'prose',
        paragraphs: [
          'A **prism** is any solid with two congruent parallel polygonal faces (the bases) connected by rectangular lateral faces. A triangular prism, rectangular box (cuboid), and hexagonal prism all follow $V = A_{\\text{base}} \\times h$.',
          'A **cylinder** is a prism with circular bases: the cross-section is always $\\pi r^2$, so $V = \\pi r^2 h$.',
          '**Surface area of a cylinder** requires the two circular caps plus the lateral face. If you unroll the lateral surface, it becomes a rectangle with width $2\\pi r$ (the circumference) and height $h$:',
        ],
      },
      {
        type: 'math',
        tex: 'SA_{\\text{cylinder}} = 2\\pi r^2 + 2\\pi r h = 2\\pi r(r + h)',
        caption: 'Two caps plus the unrolled lateral rectangle',
      },
      {
        type: 'viz',
        id: 'G4_1_PrismsCylinders',
        title: 'Prism and Cylinder Volumes',
        mathBridge: 'Adjust the base shape, radius or side lengths, and height. The volume readout always equals the base area times the height. Try changing from a square base to a circular base — notice that the formula is the same structure in both cases. Observe how the "unrolled" cylinder lateral face forms a rectangle.',
      },
      {
        type: 'prose',
        paragraphs: [
          '**Pyramids and cones taper to a point.** A pyramid is a prism that narrows: the base is a polygon, the apex is a single point above it, and the lateral faces are triangles. A cone is a cylinder that narrows: circular base, single apex above.',
          'The cross-sectional area of a pyramid or cone *decreases* as you move toward the apex. At height $y$ from the base, the cross-section is a scaled version of the base with scale factor $\\left(1 - \\frac{y}{h}\\right)$, so its area is $A_{\\text{base}} \\cdot \\left(1 - \\frac{y}{h}\\right)^2$. Integrating (summing all these layers) gives:',
        ],
      },
      {
        type: 'math',
        tex: 'V_{\\text{pyramid}} = \\frac{1}{3} A_{\\text{base}} \\cdot h \\qquad V_{\\text{cone}} = \\frac{1}{3} \\pi r^2 h',
        caption: 'The one-third factor — the tapering cross-section averages to 1/3 of the base area',
      },
      {
        type: 'prose',
        paragraphs: [
          'The factor $\\frac{1}{3}$ is exact, not approximate. Here is a classic demonstration: fill a conical cup completely with water, then pour it into a cylindrical cup of the same base and height. You can do this exactly three times before the cylinder is full. The cone\'s volume is precisely $\\frac{1}{3}$ of the cylinder\'s.',
          '**Slant height** is the distance from the apex of a cone to a point on the base edge — it is NOT the same as the vertical height $h$. By the Pythagorean theorem, slant height $\\ell = \\sqrt{r^2 + h^2}$. The lateral surface area of a cone "unrolls" to a sector of a circle:',
        ],
      },
      {
        type: 'math',
        tex: 'SA_{\\text{cone}} = \\pi r^2 + \\pi r \\ell \\quad \\text{where}\\ \\ell = \\sqrt{r^2 + h^2}',
        caption: 'Cone surface area — base circle plus the unrolled lateral sector',
      },
      {
        type: 'viz',
        id: 'G4_2_PyramidsCones',
        title: 'The One-Third Factor in Pyramids and Cones',
        mathBridge: 'Watch the cone fill with water and pour into the cylinder. Count the pourings — it takes exactly three. Adjust the height and radius: the ratio always stays at $\\frac{1}{3}$. This is not an approximation; the $\\frac{1}{3}$ comes from the integral of $(1 - y/h)^2$ over the full height.',
      },
      {
        type: 'viz',
        id: 'ScienceNotebook',
        props: { lesson: LESSON_GEO_4_1 },
        mathBridge: 'Use the volume explorer to see how base area × height works for different prism types. Then click Pour on the cone animation — watch it take exactly three cones to fill the cylinder. Try the challenges: slant height uses the Pythagorean theorem, not the vertical height.',
      },
    ],
  },
  mentalModel: [
    'Volume = base area × height for any prism or cylinder — the cross-section is constant throughout',
    'Pyramids and cones taper: their cross-sections shrink as $(1 - y/h)^2$, making their volume exactly ⅓ of the corresponding prism/cylinder',
    'Slant height ℓ = √(r²+h²) by Pythagoras — needed for cone lateral surface area, not the same as vertical height',
    'Cylinder SA = 2πr² + 2πrh (two caps + unrolled rectangle); cone SA = πr² + πrℓ (base + unrolled sector)',
  ],
  quiz: [
    {
      id: 'q1',
      type: 'choice',
      text: 'A cylinder has radius $5$ cm and height $10$ cm. Its volume is…',
      options: ['$50\\pi$ cm³', '$250\\pi$ cm³', '$500\\pi$ cm³'],
      correct: 1,
    },
    {
      id: 'q2',
      type: 'choice',
      text: 'Why is the volume of a cone $\\frac{1}{3}$ that of the corresponding cylinder?',
      options: [
        'It is an approximation that works for most practical sizes',
        'The cross-section shrinks as $(1 - y/h)^2$ from base to apex, and integrating gives a factor of ⅓',
        'The cone has ⅓ fewer faces than the cylinder',
      ],
      correct: 1,
    },
    {
      id: 'q3',
      type: 'choice',
      text: 'A rectangular prism has a base 4 m by 3 m and a height of 6 m. Its volume is…',
      options: ['36 m³', '72 m³', '144 m³'],
      correct: 1,
    },
    {
      id: 'q4',
      type: 'choice',
      text: 'A cone has radius $3$ cm and height $4$ cm. Its slant height is…',
      options: ['5 cm', '7 cm', '3.5 cm'],
      correct: 0,
    },
    {
      id: 'q5',
      type: 'choice',
      text: 'The surface area formula $2\\pi r^2 + 2\\pi r h$ applies to which shape?',
      options: ['A sphere', 'A cone', 'A closed cylinder'],
      correct: 2,
    },
    {
      id: 'q6',
      type: 'choice',
      text: 'A pyramid has a square base with side $6$ m and height $10$ m. Its volume is…',
      options: ['360 m³', '120 m³', '180 m³'],
      correct: 1,
    },
    {
      id: 'q7',
      type: 'choice',
      text: 'You unroll the lateral surface of a cylinder. The resulting shape is…',
      options: [
        'A circle',
        'A rectangle with width $2\\pi r$ and height $h$',
        'A sector (pie slice)',
      ],
      correct: 1,
    },
    {
      id: 'q8',
      type: 'choice',
      text: 'A cone has the same base and height as a cylinder. You pour the cone full of water into the cylinder. How many such pourings fill the cylinder exactly?',
      options: ['2', '3', '4'],
      correct: 1,
    },
    {
      id: 'q9',
      type: 'choice',
      text: 'Slant height differs from vertical height because…',
      options: [
        'They are the same when the cone is upright',
        'Slant height is the hypotenuse of the right triangle formed by r, h, and ℓ',
        'Slant height only applies to pyramids',
      ],
      correct: 1,
    },
    {
      id: 'q10',
      type: 'choice',
      text: 'Which formula gives the lateral surface area of a cone (excluding the base)?',
      options: ['$\\pi r h$', '$\\pi r \\ell$ where $\\ell$ is slant height', '$2\\pi r h$'],
      correct: 1,
    },
  ],
};

export { LESSON_GEO_4_1 };
