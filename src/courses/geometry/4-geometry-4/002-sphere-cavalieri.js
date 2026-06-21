import geoCavalieriUrl from '../diagrams/geo-cavalieri-principle.svg?url'

const LESSON_GEO_4_2 = {
  title: "The Sphere and Cavalieri's Principle",
  subject: 'Geometry',
  sequential: true,

  cells: [
    {
      type: 'markdown',
      instruction: `### Cavalieri's Principle: Same Slices, Same Volume

If you have two 3D solids and at **every height** the cross-sectional areas are equal, then the volumes are equal — regardless of the shape.

This is the key insight behind pre-calculus volume proofs. It says: you don't need to know the 3D shape; you only need to know the cross-section area $A(h)$ at each height $h$. If two solids always match at every slice, they have the same volume.

Classic example: a right cylinder and a leaning (oblique) cylinder of the same base and height. Every horizontal slice is the same circle. By Cavalieri: same volume. This is why slanted prisms and cylinders use the same formula as upright ones.`,
    },

    {
      type: 'js',
      instruction: `### Cavalieri's Principle: Slanted = Same Volume

Drag the "lean" slider to slant the stack of discs. Every horizontal cross-section stays the same circle — only the position shifts. Since all slices match, the total volume cannot change. This is why $V = \\pi r^2 h$ works for oblique cylinders.`,
      html: `<div style="padding:8px 14px;background:var(--color-background-secondary,#f8fafc);display:flex;align-items:center;gap:12px">
  <span style="font-family:Georgia,serif;font-size:13px">Lean:</span>
  <input type="range" id="lean" min="0" max="60" value="0" style="width:180px">
  <span id="leanVal" style="font-family:Georgia,serif;font-size:13px">0°</span>
  <span style="font-family:Georgia,serif;font-size:12px;color:#64748b;margin-left:16px">Volume stays constant: V = πr²h</span>
</div>
<canvas id="cv" width="700" height="290"></canvas>`,
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

var leanEl=document.getElementById('lean');
var NLAYERS=10,R=55,LAYER_H=18;

function draw(){
  ctx.clearRect(0,0,W,H);
  ctx.fillStyle=BG;ctx.fillRect(0,0,W,H);

  var lean=parseInt(leanEl.value);
  document.getElementById('leanVal').textContent=lean+'°';
  var leanPx=lean*1.8; // pixels of shift per layer

  var cx=W/2,baseY=H-30;
  var totalH=NLAYERS*LAYER_H;

  // Draw stacked layers
  for(var i=NLAYERS-1;i>=0;i--){
    var yOff=-(i+0.5)*LAYER_H;
    var xOff=(i/NLAYERS)*leanPx;
    var y=baseY+yOff;
    var x=cx+xOff;
    var hue=(i/NLAYERS)*60+200; // blue to purple
    ctx.fillStyle='hsla('+hue+',60%,55%,0.7)';
    ctx.strokeStyle=NAVY;ctx.lineWidth=1;
    ctx.beginPath();ctx.ellipse(x,y,R,R*0.28,0,0,Math.PI*2);
    ctx.fill();ctx.stroke();
  }

  // Labels
  ctx.fillStyle=NAVY;ctx.font='bold 13px Georgia';ctx.textAlign='center';
  ctx.fillText('V = πr²h = π·'+R+'²·'+totalH+' (constant)',cx,H-8);

  // Each slice arrow
  var midLayer=Math.floor(NLAYERS/2);
  var mx=cx+(midLayer/NLAYERS)*leanPx;
  var my=baseY-(midLayer+0.5)*LAYER_H;
  ctx.strokeStyle='#dc2626';ctx.lineWidth=1.5;
  ctx.setLineDash([4,3]);
  ctx.beginPath();ctx.moveTo(mx,my-LAYER_H/2);ctx.lineTo(mx,my+LAYER_H/2);ctx.stroke();
  ctx.setLineDash([]);
  ctx.fillStyle=RED;ctx.font='10px Georgia';ctx.textAlign='center';
  ctx.fillText('same area πr²',mx+R+28,my);
}

leanEl.addEventListener('input',draw);
draw();`,
      outputHeight: 370,
    },

    {
      type: 'js',
      instruction: `### Archimedes' Sphere Proof: Cross-Sections at Height h

At height $h$ from the base of a hemisphere of radius $r$: the cross-section is a disk of area $\\pi(r^2 - h^2)$. A cylinder of radius $r$ and height $r$ with a cone removed has the same cross-section area. Drag the height slider to verify at any level — they always match.`,
      html: `<div style="padding:8px 14px;background:var(--color-background-secondary,#f8fafc);display:flex;align-items:center;gap:12px">
  <span style="font-family:Georgia,serif;font-size:13px">Height h:</span>
  <input type="range" id="heightSlider" min="0" max="100" value="40" style="width:200px">
  <span id="hval" style="font-family:Georgia,serif;font-size:13px;min-width:60px">h = 0.4r</span>
</div>
<canvas id="cv" width="700" height="300"></canvas>
<div id="info" style="padding:8px 16px;font-family:Georgia,serif;font-size:13px;text-align:center;background:var(--color-background-secondary,#f8fafc);border-top:1px solid var(--color-border-primary,#e2e8f0)"></div>`,
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

var slider=document.getElementById('heightSlider');
var R=100; // radius in pixels, represents r=1

function draw(){
  ctx.clearRect(0,0,W,H);
  ctx.fillStyle=BG;ctx.fillRect(0,0,W,H);

  var hFrac=parseInt(slider.value)/100; // 0 to 1
  document.getElementById('hval').textContent='h = '+hFrac.toFixed(1)+'r';

  // === HEMISPHERE (left side) ===
  var hcx=W/4,hcy=H/2+30;
  ctx.strokeStyle=NAVY;ctx.lineWidth=2;
  ctx.beginPath();ctx.arc(hcx,hcy,R,Math.PI,0,false);ctx.stroke();
  ctx.strokeStyle='#94a3b8';ctx.lineWidth=1;
  ctx.beginPath();ctx.moveTo(hcx-R,hcy);ctx.lineTo(hcx+R,hcy);ctx.stroke();

  // Cross-section of hemisphere at height h
  var hPx=hFrac*R;
  var diskR=Math.sqrt(Math.max(0,R*R-hPx*hPx));
  var sliceY=hcy-hPx;

  ctx.strokeStyle='#dc2626';ctx.lineWidth=2.5;
  ctx.beginPath();ctx.moveTo(hcx-diskR,sliceY);ctx.lineTo(hcx+diskR,sliceY);ctx.stroke();
  ctx.fillStyle='#dc262644';
  ctx.beginPath();ctx.ellipse(hcx,sliceY,diskR,diskR*0.2,0,0,Math.PI*2);ctx.fill();
  ctx.strokeStyle='#dc2626';ctx.stroke();

  // Height annotation
  ctx.strokeStyle=GREEN;ctx.lineWidth=1.5;
  ctx.setLineDash([4,3]);
  ctx.beginPath();ctx.moveTo(hcx+R+10,hcy);ctx.lineTo(hcx+R+10,sliceY);ctx.stroke();
  ctx.setLineDash([]);
  ctx.fillStyle=GREEN;ctx.font='12px Georgia';ctx.textAlign='left';
  ctx.fillText('h',hcx+R+14,hcy-hPx/2+4);
  ctx.fillStyle=NAVY;ctx.font='bold 12px Georgia';ctx.textAlign='center';
  ctx.fillText('Hemisphere',hcx,hcy+R+20);
  ctx.fillStyle=RED;ctx.font='11px Georgia';
  ctx.fillText('disk r = √(r²−h²)',hcx,sliceY-14);

  // === CYLINDER MINUS CONE (right side) ===
  var ccx=3*W/4,ccy=H/2+30;

  // Cylinder outline
  ctx.strokeStyle=NAVY;ctx.lineWidth=2;
  ctx.strokeRect(ccx-R,ccy-R,R*2,R);

  // Cone outline (removed from inside)
  ctx.strokeStyle='#94a3b8';ctx.lineWidth=1.5;
  ctx.beginPath();ctx.moveTo(ccx,ccy-R);ctx.lineTo(ccx-R,ccy);ctx.stroke();
  ctx.beginPath();ctx.moveTo(ccx,ccy-R);ctx.lineTo(ccx+R,ccy);ctx.stroke();

  // Cross-section at height h: cylinder width R, minus cone width h at that level
  var coneRadAtH=hFrac*R; // cone radius at height h from base
  var outerR=R;
  var annulusW=outerR-coneRadAtH;

  var csliceY=ccy-hPx;
  // Left annulus
  ctx.fillStyle='#dc262444';
  ctx.beginPath();ctx.rect(ccx-outerR,csliceY-3,annulusW,6);ctx.fill();
  // Right annulus
  ctx.beginPath();ctx.rect(ccx+coneRadAtH,csliceY-3,annulusW,6);ctx.fill();
  ctx.strokeStyle='#dc2626';ctx.lineWidth=2.5;
  ctx.beginPath();ctx.moveTo(ccx-outerR,csliceY);ctx.lineTo(ccx-coneRadAtH,csliceY);ctx.stroke();
  ctx.beginPath();ctx.moveTo(ccx+coneRadAtH,csliceY);ctx.lineTo(ccx+outerR,csliceY);ctx.stroke();

  ctx.fillStyle=NAVY;ctx.font='bold 12px Georgia';ctx.textAlign='center';
  ctx.fillText('Cylinder − Cone',ccx,ccy+20);
  ctx.fillStyle=RED;ctx.font='11px Georgia';
  ctx.fillText('area = π(r²−h²) ✓',ccx,csliceY-14);

  // Area comparison
  var aHemi=Math.PI*(1-hFrac*hFrac);
  document.getElementById('info').innerHTML=
    'At h = '+hFrac.toFixed(2)+'r:  Hemisphere area = π(r²−h²) = <b>π·(1−'+hFrac.toFixed(2)+'²) = '+aHemi.toFixed(3)+'π</b>'
    +'&emsp; = Cylinder−Cone area ✓  <span style="color:#1a3a2a">Always equal by Pythagoras!</span>';
}

slider.addEventListener('input',draw);
draw();`,
      outputHeight: 400,
    },

    {
      type: 'challenge',
      instruction: `A sphere has radius $6$ cm. What is its volume and surface area?`,
      options: [
        { label: 'A', text: 'V = $288\\pi$ cm³; SA = $144\\pi$ cm²' },
        { label: 'B', text: 'V = $\\ 36\\pi$ cm³; SA = $\\ 36\\pi$ cm²' },
        { label: 'C', text: 'V = $\\ 72\\pi$ cm³; SA = $\\ 72\\pi$ cm²' },
        { label: 'D', text: 'V = $288\\pi$ cm³; SA = $72\\pi$ cm²' },
      ],
      check: (label) => label === 'A',
      successMessage: 'Correct. V = ⁴⁄₃πr³ = ⁴⁄₃·π·216 = 288π cm³. SA = 4πr² = 4·π·36 = 144π cm².',
      failMessage: 'V = ⁴⁄₃πr³ = ⁴⁄₃·π·6³ = ⁴⁄₃·π·216 = 288π cm³. SA = 4πr² = 4·π·36 = 144π cm².',
      html: '', css: 'body{margin:0}', startCode: '', outputHeight: 260,
    },

    {
      type: 'challenge',
      instruction: `Two containers have the same height and the same base area at every level (but one is an oblique cylinder, one is a right cylinder). You fill the oblique one with sand. Pouring it into the upright one — what happens?`,
      options: [
        { label: 'A', text: 'The sand overflows — the oblique cylinder holds more.' },
        { label: 'B', text: 'The sand fills the upright cylinder exactly — Cavalieri\'s Principle guarantees equal volumes when cross-sections match.' },
        { label: 'C', text: 'The sand only fills it to ⅔ — the different angles reduce volume.' },
        { label: 'D', text: 'You cannot compare them without calculus.' },
      ],
      check: (label) => label === 'B',
      successMessage: "Correct. Cavalieri's Principle: at every height, both containers have the same circular cross-section (same radius). Equal cross-sections at every level → equal volumes. The lean doesn't matter.",
      failMessage: "Cavalieri's Principle says: if two solids have equal cross-sectional areas at every height, they have equal volume. Both cylinders have the same radius r at every height h, so both have volume πr²h.",
      html: '', css: 'body{margin:0}', startCode: '', outputHeight: 260,
    },
  ],
};

export default {
  id: 'geo-4-2',
  slug: 'sphere-cavalieri',
  chapter: 'geometry-4',
  subject: 'Geometry',
  title: 'The Sphere and Cavalieri\'s Principle',
  subtitle: 'How Archimedes found sphere volume without calculus — and the slicing principle that makes it work',
  tags: ['geometry', 'sphere', 'cavalieri', 'surface-area', 'archimedes'],
  hook: {
    question: 'How did Archimedes discover the volume of a sphere — 2,000 years before calculus was invented?',
    realWorldContext: 'The sphere is the most efficient shape in nature: it encloses the maximum volume for a given surface area. Every bubble, ball bearing, and planet is drawn toward this shape. Archimedes was so proud of his sphere theorem that he requested a sphere-in-cylinder diagram be engraved on his tombstone.',
  },
  intuition: {
    blocks: [
      {
        type: 'prose',
        paragraphs: [
          '**Cavalieri\'s Principle.** Two solids have equal volume if, at every height, their horizontal cross-sections have equal area. You do not need to know the shape — only the cross-sectional areas at every level.',
          'This principle, stated by Bonaventura Cavalieri in 1635, is essentially pre-calculus integration: volume is the "sum" of infinitely many cross-sectional slices. Cavalieri formalized what Archimedes had already used implicitly in 250 BCE.',
        ],
      },
      {
        type: 'image',
        src: geoCavalieriUrl,
        alt: 'Two stacks of coins: one straight (cylinder), one slanted (oblique cylinder). Both have the same height h and the same disk cross-section area at every level. Cavalieri\'s principle guarantees equal volumes.',
        caption: 'Cavalieri: push the stack sideways — every horizontal slice still has the same area. So the volume cannot change. This is how we know oblique cylinders and prisms have the same volume formula as right ones.',
      },
      {
        type: 'prose',
        paragraphs: [
          '**Archimedes\' brilliant comparison.** To find the volume of a sphere of radius $r$, Archimedes compared it to a shape whose volume he already knew: a cylinder with a cone removed (a "cylindrical shell with a cone excavated from each end").',
          'Consider a hemisphere of radius $r$ sitting next to a cylinder of radius $r$ and height $r$ with a cone of the same dimensions removed from it. At height $h$ from the base:',
          '— The hemisphere\'s cross-section is a disk of radius $\\sqrt{r^2 - h^2}$ (by Pythagoras), so its area is $\\pi(r^2 - h^2)$.',
          '— The cylinder-minus-cone cross-section: the outer cylinder has area $\\pi r^2$, and the removed cone at height $h$ has radius $h$ (since the cone tapers linearly), so its area is $\\pi r^2 - \\pi h^2 = \\pi(r^2 - h^2)$.',
          'The cross-sectional areas are always equal! By Cavalieri\'s Principle, the two solids have equal volume.',
        ],
      },
      {
        type: 'math',
        tex: 'V_{\\text{hemisphere}} = V_{\\text{cylinder}} - V_{\\text{cone}} = \\pi r^2 h - \\frac{1}{3}\\pi r^2 h = \\frac{2}{3}\\pi r^3',
        caption: "Archimedes' comparison: hemisphere = cylinder minus cone, both of radius r and height r",
      },
      {
        type: 'math',
        tex: 'V_{\\text{sphere}} = 2 \\times \\frac{2}{3}\\pi r^3 = \\frac{4}{3}\\pi r^3',
        caption: 'Doubling the hemisphere gives the full sphere volume',
      },
      {
        type: 'viz',
        id: 'G4_3_Sphere',
        title: "Archimedes' Sphere Theorem",
        mathBridge: 'Watch the cross-section slicing at each height $h$. The hemisphere disk area (blue) and the cylinder-minus-cone area (red) are always equal — Cavalieri\'s Principle in action. Adjust the height slider to verify at any level. The volume of the sphere follows: $\\frac{4}{3}\\pi r^3$.',
      },
      {
        type: 'prose',
        paragraphs: [
          '**Surface area of a sphere.** Archimedes also proved that the surface area of a sphere equals the lateral surface area of the smallest cylinder that fits around it. That cylinder has radius $r$ and height $2r$, so its lateral surface is $2\\pi r \\cdot 2r = 4\\pi r^2$.',
        ],
      },
      {
        type: 'math',
        tex: 'SA_{\\text{sphere}} = 4\\pi r^2',
        caption: 'Equal to the lateral surface of the circumscribed cylinder — another Archimedes discovery',
      },
      {
        type: 'prose',
        paragraphs: [
          'The number $4\\pi$ appears because the sphere\'s surface covers exactly four great circles: if you project the sphere onto a flat disk, it takes four such disks to cover the full spherical surface.',
          '**Cross-sections of common solids.** Cavalieri\'s Principle extends to every 3D shape. Knowing the cross-sectional area formula $A(h)$ as a function of height $h$ allows you to find any volume by "adding up" (integrating) the slices:',
        ],
      },
      {
        type: 'math',
        tex: 'V = \\int_0^H A(h)\\,dh',
        caption: 'The calculus generalization of Cavalieri — sum all cross-section areas over the height',
      },
      {
        type: 'prose',
        paragraphs: [
          'Even without calculus, Cavalieri\'s Principle allows comparison: if two solids always have equal cross-sectional areas, they have equal volume. A skewed cylinder (like a leaning stack of coins) has the same volume as an upright cylinder with the same base and height — because at every level, the circular cross-sections are the same.',
        ],
      },
      {
        type: 'viz',
        id: 'G4_4_CrossSections',
        title: "Cavalieri's Principle in 3D",
        mathBridge: 'Skew the solid horizontally. The cross-sectional area at every height does not change — only the position shifts. By Cavalieri\'s Principle, the volume is unchanged. This confirms the formula $V = A_{\\text{base}} \\times h$ applies even to leaning prisms and cylinders.',
      },
      {
        type: 'viz',
        id: 'ScienceNotebook',
        props: { lesson: LESSON_GEO_4_2 },
        mathBridge: 'Use the lean slider to see Cavalieri in action — the disc stack shifts but volume never changes. Then move the height slider on Archimedes\' proof and watch both cross-section areas stay equal at every level. Try h = 0 (full radius disk) and h = r (zero area at the top) — both sides always match.',
      },
    ],
  },
  mentalModel: [
    "Cavalieri's Principle: equal cross-section areas at every height → equal volumes. The slicing idea behind integration.",
    'Sphere volume: Archimedes compared a hemisphere to a cylinder-minus-cone and showed equal cross-sections at every height → V = ⁴⁄₃πr³',
    'Sphere surface area = 4πr² — equal to the lateral surface of the circumscribed cylinder',
    'Skewed solids have the same volume as upright ones with the same base and height — cross-sections never change under shearing',
  ],
  quiz: [
    {
      id: 'q1',
      type: 'choice',
      text: "Cavalieri's Principle states that two solids have equal volume when…",
      options: [
        'They have the same surface area',
        'At every height, their cross-sectional areas are equal',
        'They are made of the same material',
      ],
      correct: 1,
    },
    {
      id: 'q2',
      type: 'choice',
      text: 'A sphere has radius $3$ cm. Its volume is…',
      options: ['$36\\pi$ cm³', '$9\\pi$ cm³', '$12\\pi$ cm³'],
      correct: 0,
    },
    {
      id: 'q3',
      type: 'choice',
      text: 'Archimedes proved sphere volume by comparing a hemisphere to…',
      options: [
        'Two stacked cones',
        'A cylinder with a cone removed, of the same radius and height',
        'A cube with the same side length as the radius',
      ],
      correct: 1,
    },
    {
      id: 'q4',
      type: 'choice',
      text: 'The surface area of a sphere with radius $5$ cm is…',
      options: ['$20\\pi$ cm²', '$100\\pi$ cm²', '$50\\pi$ cm²'],
      correct: 1,
    },
    {
      id: 'q5',
      type: 'choice',
      text: 'Why does a leaning (skewed) cylinder have the same volume as an upright cylinder of the same base and height?',
      options: [
        'They are both cylinders, so the formula applies regardless of angle',
        "By Cavalieri's Principle — at every height, the circular cross-sections have the same area, so the total volumes must be equal",
        'The leaning changes the surface area but not the volume formula',
      ],
      correct: 1,
    },
    {
      id: 'q6',
      type: 'choice',
      text: 'The surface area of a sphere equals the lateral surface of which cylinder?',
      options: [
        'A cylinder with the same radius and half the sphere height',
        'The smallest cylinder that fits around the sphere — radius $r$, height $2r$',
        'A cylinder with the same volume as the sphere',
      ],
      correct: 1,
    },
    {
      id: 'q7',
      type: 'choice',
      text: 'At height $h$ from the base of a hemisphere of radius $r$, the cross-section disk has area…',
      options: [
        '$\\pi h^2$',
        '$\\pi(r^2 - h^2)$',
        '$\\pi r^2$',
      ],
      correct: 1,
    },
    {
      id: 'q8',
      type: 'choice',
      text: "The hemisphere in Archimedes' proof has the same cross-sectional area as which shape?",
      options: [
        'A pyramid of the same height',
        'A cylinder of radius $r$ and height $r$ with a cone of the same dimensions removed',
        'A cone of radius $r$ and height $2r$',
      ],
      correct: 1,
    },
    {
      id: 'q9',
      type: 'choice',
      text: 'A sphere has the same volume as how many of the circumscribed cylinders (radius $r$, height $2r$)?',
      options: [
        'Two-thirds ($\\frac{2}{3}$ of one cylinder)',
        'Half ($\\frac{1}{2}$ of one cylinder)',
        'One full cylinder',
      ],
      correct: 0,
    },
    {
      id: 'q10',
      type: 'choice',
      text: "Cavalieri's Principle is essentially the geometric version of which calculus operation?",
      options: [
        'Differentiation — finding the rate of change of volume',
        'Integration — summing infinitely thin cross-sectional slices over the height',
        'The chain rule — composing area and height functions',
      ],
      correct: 1,
    },
  ],
};

export { LESSON_GEO_4_2 };
