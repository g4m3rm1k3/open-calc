import geo3dVolumeUrl from '../diagrams/geo-3d-volume-formulas.svg?url'

const LESSON_GEO_6_3 = {
  title: 'Volume and Surface Area of 3D Shapes',
  subject: 'Geometry',
  sequential: true,

  cells: [
    {
      type: 'markdown',
      instruction: `### Two Families, Every Solid

| Family | Formula | Examples |
|---|---|---|
| Constant cross-section | $V = A_{\\text{base}} \\cdot h$ | Prism, cylinder |
| Tapers to a point | $V = \\frac{1}{3} A_{\\text{base}} \\cdot h$ | Pyramid, cone |
| Sphere (neither) | $V = \\frac{4}{3}\\pi r^3$ | Ball, bubble |

The surface area is always the sum of the faces. For curved shapes, unroll the lateral surface: a cylinder's side becomes a rectangle ($2\\pi r \\times h$), a cone's side becomes a sector ($\\pi r \\ell$ where $\\ell = \\sqrt{r^2+h^2}$).`,
    },

    {
      type: 'js',
      instruction: `### 3D Shape Volume and Surface Area Calculator

Select a shape and adjust its dimensions. The formulas, computed volume, and surface area all update in real time. Switch between shapes to see how the same two families apply.`,
      html: `<div style="padding:8px 14px;background:var(--color-background-secondary,#f8fafc);display:flex;gap:12px;flex-wrap:wrap;align-items:center">
  <select id="shape3d" style="padding:5px 10px;border-radius:6px;border:1.5px solid #1e3a5f;font-family:Georgia,serif;font-size:13px">
    <option value="box">Rectangular Box</option>
    <option value="cylinder">Cylinder</option>
    <option value="cone">Cone</option>
    <option value="pyramid">Square Pyramid</option>
    <option value="sphere">Sphere</option>
  </select>
  <label style="font-family:Georgia,serif;font-size:12px" id="l1lbl">l: <input type="range" id="d1" min="1" max="10" value="4" style="width:90px"> <span id="d1v">4</span></label>
  <label style="font-family:Georgia,serif;font-size:12px" id="l2lbl">w: <input type="range" id="d2" min="1" max="10" value="3" style="width:90px"> <span id="d2v">3</span></label>
  <label style="font-family:Georgia,serif;font-size:12px" id="l3lbl">h: <input type="range" id="d3" min="1" max="10" value="5" style="width:90px"> <span id="d3v">5</span></label>
</div>
<canvas id="cv" width="700" height="240"></canvas>
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

var SCALE=20;

function draw(){
  ctx.clearRect(0,0,W,H);
  ctx.fillStyle=BG;ctx.fillRect(0,0,W,H);

  var shape=document.getElementById('shape3d').value;
  var d1=parseInt(document.getElementById('d1').value);
  var d2=parseInt(document.getElementById('d2').value);
  var d3=parseInt(document.getElementById('d3').value);
  document.getElementById('d1v').textContent=d1;
  document.getElementById('d2v').textContent=d2;
  document.getElementById('d3v').textContent=d3;

  var vol=0,sa=0,label='',family='';
  var l=d1,w=d2,h=d3,r=d1;

  if(shape==='box'){
    vol=l*w*h;sa=2*(l*w+l*h+w*h);
    label='V = '+l+'×'+w+'×'+h+' = '+vol+'\\nSA = 2('+l+'·'+w+' + '+l+'·'+h+' + '+w+'·'+h+') = '+sa;
    family='Prism family (constant cross-section)';
    // Draw box
    var bx=W/2-80,by=H/2-20;
    var s=Math.min(l*SCALE,140),t=Math.min(w*SCALE,80),ht=Math.min(h*SCALE,120);
    ctx.strokeStyle=NAVY;ctx.lineWidth=2;ctx.fillStyle='#1e3a5f15';
    // Front face
    ctx.fillRect(bx,by-ht,s,ht);ctx.strokeRect(bx,by-ht,s,ht);
    // Top face
    ctx.beginPath();ctx.moveTo(bx,by-ht);ctx.lineTo(bx+t*0.6,by-ht-t*0.4);ctx.lineTo(bx+s+t*0.6,by-ht-t*0.4);ctx.lineTo(bx+s,by-ht);ctx.closePath();ctx.fillStyle='#1e3a5f25';ctx.fill();ctx.stroke();
    // Right face
    ctx.beginPath();ctx.moveTo(bx+s,by);ctx.lineTo(bx+s+t*0.6,by-t*0.4);ctx.lineTo(bx+s+t*0.6,by-ht-t*0.4);ctx.lineTo(bx+s,by-ht);ctx.closePath();ctx.fillStyle='#1e3a5f30';ctx.fill();ctx.stroke();
    // Labels
    ctx.fillStyle=RED;ctx.font='bold 11px Georgia';ctx.textAlign='center';
    ctx.fillText('l='+l,bx+s/2,by+16);ctx.fillText('w='+w,bx+s+t*0.3+20,by-t*0.2+10);
    ctx.fillText('h='+h,bx-24,by-ht/2);
  } else if(shape==='cylinder'){
    vol=Math.PI*r*r*h;sa=2*Math.PI*r*r+2*Math.PI*r*h;
    label='V = π·'+r+'²·'+h+' = π·'+(r*r)+'·'+h+' ≈ '+vol.toFixed(1);
    family='Prism family (V = πr²h)';
    var cy=H/2+20,rx=Math.min(r*SCALE,80),hy=Math.min(h*SCALE,140);
    ctx.strokeStyle=NAVY;ctx.lineWidth=2;
    ctx.beginPath();ctx.ellipse(W/2,cy,rx,rx*0.3,0,0,Math.PI*2);ctx.fillStyle='#1e3a5f25';ctx.fill();ctx.stroke();
    ctx.beginPath();ctx.ellipse(W/2,cy-hy,rx,rx*0.3,0,0,Math.PI*2);ctx.fillStyle='#1e3a5f44';ctx.fill();ctx.stroke();
    ctx.fillStyle='#1e3a5f15';
    ctx.beginPath();ctx.moveTo(W/2-rx,cy);ctx.lineTo(W/2-rx,cy-hy);ctx.ellipse(W/2,cy-hy,rx,rx*0.3,0,Math.PI,0,true);ctx.lineTo(W/2+rx,cy);ctx.ellipse(W/2,cy,rx,rx*0.3,0,0,Math.PI);ctx.closePath();ctx.fill();ctx.stroke();
    ctx.fillStyle=RED;ctx.font='bold 11px Georgia';ctx.textAlign='center';
    ctx.fillText('r='+r,W/2+rx+24,cy+4);ctx.fillText('h='+h,W/2+rx+24,cy-hy/2);
  } else if(shape==='cone'){
    vol=Math.PI*r*r*h/3;var sl=Math.sqrt(r*r+h*h);sa=Math.PI*r*r+Math.PI*r*sl;
    label='V = ⅓·π·'+r+'²·'+h+' ≈ '+vol.toFixed(1)+'\\nSA = πr²+πrℓ where ℓ=√(r²+h²)='+sl.toFixed(2);
    family='Pyramid family (V = ⅓πr²h)';
    var cy2=H/2+30,rx2=Math.min(r*SCALE,80),hy2=Math.min(h*SCALE,140);
    ctx.strokeStyle=NAVY;ctx.lineWidth=2;ctx.fillStyle='#1e3a5f15';
    ctx.beginPath();ctx.moveTo(W/2,cy2-hy2);ctx.lineTo(W/2-rx2,cy2);ctx.ellipse(W/2,cy2,rx2,rx2*0.3,0,Math.PI,0);ctx.closePath();ctx.fill();ctx.stroke();
    ctx.beginPath();ctx.ellipse(W/2,cy2,rx2,rx2*0.3,0,0,Math.PI*2);ctx.fill();ctx.stroke();
    ctx.fillStyle=RED;ctx.font='bold 11px Georgia';ctx.textAlign='center';
    ctx.fillText('r='+r,W/2+rx2+24,cy2+4);ctx.fillText('h='+h,W/2+4,cy2-hy2/2);
  } else if(shape==='pyramid'){
    vol=l*l*h/3;sa=l*l+2*l*Math.sqrt((l/2)*(l/2)+h*h);
    label='V = ⅓·'+l+'²·'+h+' = '+vol.toFixed(1);
    family='Pyramid family (V = ⅓Bh, B = s²)';
  } else if(shape==='sphere'){
    vol=4/3*Math.PI*r*r*r;sa=4*Math.PI*r*r;
    label='V = ⁴⁄₃·π·'+r+'³ ≈ '+vol.toFixed(1)+'\\nSA = 4·π·'+r+'² ≈ '+sa.toFixed(1);
    family='Sphere (neither family — Archimedes formula)';
    ctx.beginPath();ctx.arc(W/2,H/2,Math.min(r*SCALE,100),0,Math.PI*2);
    ctx.fillStyle='#1e3a5f22';ctx.fill();ctx.strokeStyle=NAVY;ctx.lineWidth=2.5;ctx.stroke();
    ctx.fillStyle=RED;ctx.font='bold 12px Georgia';ctx.textAlign='center';ctx.fillText('r='+r,W/2,H/2+4);
  }

  ['d2','d3'].forEach(function(id){
    var vis=(shape==='box');
    document.getElementById(id).parentElement.style.display=vis?'':'none';
  });
  document.getElementById('l1lbl').style.display='';

  document.getElementById('info').innerHTML=
    '<b style="color:#1e3a5f">'+family+'</b><br>'
    +label.replace('\\n','<br>')
    +'&emsp;|&emsp;<b>Volume ≈ '+vol.toFixed(2)+'</b>&emsp;Surface Area ≈ '+sa.toFixed(2);
}

['shape3d','d1','d2','d3'].forEach(function(id){
  document.getElementById(id).addEventListener('change',draw);
  document.getElementById(id).addEventListener('input',draw);
});
draw();`,
      outputHeight: 390,
    },

    {
      type: 'js',
      instruction: `### Scaling Laws: Length, Area, Volume

When you scale a 3D shape by factor $k$: length scales by $k$, surface area by $k^2$, volume by $k^3$. Adjust the scale factor to see the dramatic difference between area and volume growth.`,
      html: `<div style="padding:8px 14px;background:var(--color-background-secondary,#f8fafc);display:flex;align-items:center;gap:12px">
  <span style="font-family:Georgia,serif;font-size:13px">Scale factor k:</span>
  <input type="range" id="kSlider" min="0.5" max="4" step="0.1" value="1" style="width:200px">
  <span id="kLbl" style="font-family:Georgia,serif;font-size:14px;font-weight:700;color:#1e3a5f">k = 1</span>
</div>
<canvas id="cv" width="700" height="240"></canvas>`,
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

var kEl=document.getElementById('kSlider');
var kLbl=document.getElementById('kLbl');

function draw(){
  ctx.clearRect(0,0,W,H);
  ctx.fillStyle=BG;ctx.fillRect(0,0,W,H);

  var k=parseFloat(kEl.value);
  kLbl.textContent='k = '+k.toFixed(1);

  // Bar chart for original vs scaled
  var categories=[
    {label:'Length',orig:1,scaled:k,unit:'k',color:'#1e3a5f'},
    {label:'Area',orig:1,scaled:k*k,unit:'k²',color:'#dc2626'},
    {label:'Volume',orig:1,scaled:k*k*k,unit:'k³',color:'#1a3a2a'},
  ];

  var maxVal=Math.max(k*k*k,4);
  var barW=80,gap=80,startX=80,barH=160,baseY=H-40;

  categories.forEach(function(cat,i){
    var x=startX+i*(barW*2+gap);
    // Original bar
    var oh=barH/maxVal;
    ctx.fillStyle=cat.color+'55';
    ctx.fillRect(x,baseY-oh,barW,oh);
    ctx.strokeStyle=cat.color;ctx.lineWidth=1.5;
    ctx.strokeRect(x,baseY-oh,barW,oh);
    // Scaled bar
    var sh=cat.scaled*barH/maxVal;
    ctx.fillStyle=cat.color+'bb';
    ctx.fillRect(x+barW,baseY-sh,barW,sh);
    ctx.strokeRect(x+barW,baseY-sh,barW,sh);
    // Labels
    ctx.fillStyle=cat.color;ctx.font='bold 12px Georgia';ctx.textAlign='center';
    ctx.fillText(cat.label,x+barW,baseY+16);
    ctx.fillText('×'+cat.scaled.toFixed(2),x+barW+barW/2,baseY-sh-8);
    ctx.fillStyle='#94a3b8';ctx.font='11px Georgia';
    ctx.fillText('scale: '+cat.unit,x+barW,baseY+30);
  });

  // Legend
  ctx.fillStyle=TEXT;ctx.font='11px Georgia';ctx.textAlign='left';
  ctx.fillStyle='#94a3b8';ctx.fillRect(W-160,20,20,14);ctx.fillText('Original (k=1)',W-134,32);
  ctx.fillStyle=TEXT;ctx.fillRect(W-160,40,20,14);ctx.fillText('Scaled (k='+k.toFixed(1)+')',W-134,52);

  ctx.fillStyle='#1e293b';ctx.font='bold 11px Georgia';ctx.textAlign='left';
  ctx.fillText('k='+k.toFixed(1)+': length×'+k.toFixed(1)+', area×'+( k*k).toFixed(2)+', volume×'+(k*k*k).toFixed(2),20,20);
}

kEl.addEventListener('input',draw);
draw();`,
      outputHeight: 320,
    },

    {
      type: 'challenge',
      instruction: `A cylindrical can has radius $3$ cm and height $10$ cm. A new can doubles all dimensions. By what factor does the volume increase, and what is the new volume?`,
      options: [
        { label: 'A', text: 'Volume increases by factor 2; new volume = $180\\pi$ cm³' },
        { label: 'B', text: 'Volume increases by factor 8; new volume = $720\\pi$ cm³' },
        { label: 'C', text: 'Volume increases by factor 4; new volume = $360\\pi$ cm³' },
        { label: 'D', text: 'Volume increases by factor 8; new volume = $72\\pi$ cm³' },
      ],
      check: (label) => label === 'B',
      successMessage: 'Correct. Original: V = π·3²·10 = 90π. Scaled by k=2: volume scales by k³=8. New volume = 8·90π = 720π cm³. Check: π·6²·20 = π·36·20 = 720π ✓',
      failMessage: 'When all dimensions are doubled (k=2), volume scales by k³ = 8. Original V = π·3²·10 = 90π. New V = 8 × 90π = 720π cm³. Alternatively: V = π·6²·20 = 720π.',
      html: '', css: 'body{margin:0}', startCode: '', outputHeight: 260,
    },

    {
      type: 'challenge',
      instruction: `Of all 3D shapes with the same surface area, which one encloses the maximum volume?`,
      options: [
        { label: 'A', text: 'A cube, because it has equal sides' },
        { label: 'B', text: 'A sphere, because the isoperimetric inequality says a sphere maximizes volume for a given surface area' },
        { label: 'C', text: 'A cylinder, because it has circular bases' },
        { label: 'D', text: 'It depends on the surface area' },
      ],
      check: (label) => label === 'B',
      successMessage: 'Correct. The isoperimetric inequality states: among all 3D shapes with a given surface area, the sphere encloses the maximum volume. This is why soap bubbles are spherical — surface tension minimizes area for a given volume.',
      failMessage: 'The isoperimetric inequality: for a fixed surface area, the sphere gives the maximum volume. Nature exploits this — soap bubbles are spheres because surface tension minimizes area while enclosing the given amount of air.',
      html: '', css: 'body{margin:0}', startCode: '', outputHeight: 260,
    },
  ],
};

export default {
  id: 'geo-6-3',
  slug: 'volume-3d',
  chapter: 'geometry-6',
  subject: 'Geometry',
  title: 'Volume and Surface Area of 3D Shapes',
  subtitle: 'How to measure the inside and outside of any common solid',
  tags: ['geometry', 'volume', 'surface-area', '3D', 'prism', 'cylinder', 'cone', 'sphere', 'pyramid'],
  hook: {
    question: 'You have a rectangular box, a can, a cone, and a ball — how much material went into each, and how much can each hold?',
    realWorldContext: 'Packaging engineers minimize surface area (material cost) while maximizing volume (contents). Architects compute concrete volumes for construction. Pharmacists calculate capsule volumes. Every 3D object in the real world has both a volume (how much it holds) and a surface area (how much material covers it).',
  },
  intuition: {
    blocks: [
      {
        type: 'prose',
        paragraphs: [
          '**The organizing principle.** Every common 3D solid fits into one of two families: **prism-like** (constant cross-section, $V = A_{\\text{base}} \\times h$) or **pyramid-like** (tapers to a point, $V = \\frac{1}{3} A_{\\text{base}} \\times h$). Memorize the family, not the specific formulas.',
        ],
      },
      {
        type: 'image',
        src: geo3dVolumeUrl,
        alt: 'Four 3D solids with their volume formulas. Top-left: prism/cylinder V=Bh and V=πr²h (constant cross-section family). Top-right: cone V=⅓πr²h. Bottom-left: pyramid V=⅓Bh. Bottom-right: sphere V=⁴⁄₃πr³ and SA=4πr².',
        caption: 'The two volume families: constant cross-section (V = Bh) vs tapering (V = ⅓Bh). The ⅓ factor is the geometric signature of every solid that tapers to a point.',
      },
      {
        type: 'math',
        tex: 'V_{\\text{prism/cylinder}} = A_{\\text{base}} \\cdot h \\qquad\\qquad V_{\\text{pyramid/cone}} = \\tfrac{1}{3} A_{\\text{base}} \\cdot h',
        caption: 'Two families. The ⅓ factor always appears in the tapering (pyramid/cone) family.',
      },
      {
        type: 'prose',
        paragraphs: [
          '**Rectangular prism (box).** Base area $= lw$, so $V = lwh$. Surface area: 6 rectangular faces in three pairs — top/bottom ($lw$ each), front/back ($lh$ each), sides ($wh$ each):',
        ],
      },
      {
        type: 'math',
        tex: 'V_{\\text{box}} = lwh \\qquad SA_{\\text{box}} = 2(lw + lh + wh)',
        caption: 'The box — most common 3D shape in everyday engineering',
      },
      {
        type: 'prose',
        paragraphs: [
          '**Cylinder.** Base area $= \\pi r^2$, so $V = \\pi r^2 h$. Surface area: two circular caps plus the lateral face (which unrolls into a rectangle of width $2\\pi r$ and height $h$):',
        ],
      },
      {
        type: 'math',
        tex: 'V_{\\text{cylinder}} = \\pi r^2 h \\qquad SA_{\\text{cylinder}} = 2\\pi r^2 + 2\\pi r h',
        caption: 'Cylinder — prism family with circular base',
      },
      {
        type: 'prose',
        paragraphs: [
          '**Cone.** Base area $= \\pi r^2$, so $V = \\frac{1}{3}\\pi r^2 h$. For surface area, the lateral face unrolls into a sector with slant height $\\ell = \\sqrt{r^2 + h^2}$. The lateral area of that sector is $\\pi r \\ell$:',
        ],
      },
      {
        type: 'math',
        tex: 'V_{\\text{cone}} = \\tfrac{1}{3}\\pi r^2 h \\qquad SA_{\\text{cone}} = \\pi r^2 + \\pi r \\ell \\quad (\\ell = \\sqrt{r^2+h^2})',
        caption: 'Cone — pyramid family with circular base. Slant height ℓ is NOT the same as h.',
      },
      {
        type: 'viz',
        id: 'G4_1_PrismsCylinders',
        title: 'Prisms and Cylinders',
        mathBridge: 'Compare the prism and cylinder side by side. Both are in the $V = A_{\\text{base}} \\times h$ family. Change the height and watch volume scale linearly. Change the radius: volume scales with $r^2$. Surface area grows more slowly than volume because volume is 3D and surface area is 2D.',
      },
      {
        type: 'viz',
        id: 'G4_2_PyramidsCones',
        title: 'Pyramids and Cones',
        mathBridge: 'The cone holds exactly $\\frac{1}{3}$ of the cylinder volume. Pour it out: three full cones fill the cylinder. For any pyramid, three of them pack perfectly into the corresponding prism. The $\\frac{1}{3}$ factor is not an approximation — it is exact.',
      },
      {
        type: 'prose',
        paragraphs: [
          '**Sphere.** The sphere stands alone — it is neither a prism nor a pyramid. Its volume and surface area formulas come from Archimedes:',
        ],
      },
      {
        type: 'math',
        tex: 'V_{\\text{sphere}} = \\tfrac{4}{3}\\pi r^3 \\qquad SA_{\\text{sphere}} = 4\\pi r^2',
        caption: 'Sphere — the most efficient shape (maximum volume per unit surface area)',
      },
      {
        type: 'prose',
        paragraphs: [
          '**Comparing shapes.** For equal volumes, a sphere has the smallest surface area of any solid — this is the **isoperimetric inequality**, and it is why bubbles are spherical (minimizing surface energy) and why cells are roughly spherical.',
          '**Scaling laws.** When you scale a 3D shape by a factor of $k$: length scales by $k$, surface area scales by $k^2$, volume scales by $k^3$. This is why large animals have proportionally thinner legs than small animals (more volume relative to cross-section), and why ice melts faster when crushed (more surface area per unit volume).',
        ],
      },
      {
        type: 'math',
        tex: '\\text{Scale by }k:\\quad \\text{length}\\times k,\\quad \\text{area}\\times k^2,\\quad \\text{volume}\\times k^3',
        caption: 'The scaling laws — one of the most important facts in applied geometry',
      },
      {
        type: 'viz',
        id: 'G4_3_Sphere',
        title: 'The Sphere',
        mathBridge: 'Adjust the sphere radius. Volume grows as $r^3$ (cubic growth) while surface area grows as $r^2$ (quadratic growth). At small $r$, surface dominates; at large $r$, volume grows faster. This gap between $r^2$ and $r^3$ is why the volume-to-surface ratio increases with size — a key fact in biology and engineering.',
      },
      {
        type: 'viz',
        id: 'ScienceNotebook',
        props: { lesson: LESSON_GEO_6_3 },
        mathBridge: 'Build and calculate 3D shape volumes interactively. Drag sliders to see how changing one dimension (radius, height, side) affects volume and surface area. The scaling law cell shows why tripling a radius makes volume 27× larger — the $k^3$ law makes scaling intuitive.',
      },
    ],
  },
  mentalModel: [
    'Two families: prism/cylinder use V=A·h; pyramid/cone use V=⅓A·h. The ⅓ always goes with tapering shapes',
    'Surface area = sum of all faces. For curved shapes: unroll the lateral surface to find its flat area (rectangle for cylinder, sector for cone)',
    'Sphere: V=⁴⁄₃πr³, SA=4πr². Derived by Archimedes using the comparison to a cylinder-minus-cone',
    'Scaling by k: length×k, area×k², volume×k³. Doubling all dimensions makes volume 8× larger but surface area only 4× larger',
  ],
  quiz: [
    {
      id: 'q1',
      type: 'choice',
      text: 'A rectangular box is $4$ cm × $5$ cm × $6$ cm. Its volume is…',
      options: ['$60$ cm³', '$120$ cm³', '$148$ cm³'],
      correct: 1,
    },
    {
      id: 'q2',
      type: 'choice',
      text: 'A cylinder has radius $3$ cm and height $10$ cm. Its volume is…',
      options: ['$30\\pi$ cm³', '$90\\pi$ cm³', '$300\\pi$ cm³'],
      correct: 1,
    },
    {
      id: 'q3',
      type: 'choice',
      text: 'A cone has radius $6$ cm and height $8$ cm. Its volume is…',
      options: ['$288\\pi$ cm³', '$96\\pi$ cm³', '$48\\pi$ cm³'],
      correct: 1,
    },
    {
      id: 'q4',
      type: 'choice',
      text: 'A sphere has radius $3$ cm. Its volume is…',
      options: ['$36\\pi$ cm³', '$12\\pi$ cm³', '$9\\pi$ cm³'],
      correct: 0,
    },
    {
      id: 'q5',
      type: 'choice',
      text: 'A cone has the same base and height as a cylinder. The cone\'s volume is what fraction of the cylinder\'s?',
      options: ['$\\frac{1}{2}$', '$\\frac{1}{3}$', '$\\frac{2}{3}$'],
      correct: 1,
    },
    {
      id: 'q6',
      type: 'choice',
      text: 'A cylinder has radius $5$ cm and height $12$ cm. Its total surface area is…',
      options: ['$170\\pi$ cm²', '$120\\pi$ cm²', '$60\\pi$ cm²'],
      correct: 0,
    },
    {
      id: 'q7',
      type: 'choice',
      text: 'You scale a sphere\'s radius from $2$ cm to $6$ cm (tripling it). Its volume increases by a factor of…',
      options: ['3', '9', '27'],
      correct: 2,
    },
    {
      id: 'q8',
      type: 'choice',
      text: 'A cone has radius $5$ cm and height $12$ cm. Its slant height is…',
      options: ['13 cm', '17 cm', '$\\sqrt{119}$ cm'],
      correct: 0,
    },
    {
      id: 'q9',
      type: 'choice',
      text: 'Why is the sphere the most efficient shape for enclosing volume?',
      options: [
        'It is the shape that contains the most volume for a given surface area — proved by the isoperimetric inequality',
        'It is the easiest shape to manufacture',
        'It is efficient only for very large objects',
      ],
      correct: 0,
    },
    {
      id: 'q10',
      type: 'choice',
      text: 'A cube has side $4$ cm. You double all sides to $8$ cm. How many times larger is the new volume?',
      options: ['2', '4', '8'],
      correct: 2,
    },
  ],
};

export { LESSON_GEO_6_3 };
