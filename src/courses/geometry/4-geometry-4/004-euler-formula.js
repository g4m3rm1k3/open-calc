import geoEulerUrl from '../diagrams/geo-euler-formula.svg?url'
import quizEulerUrl from '../diagrams/quiz-geo-euler.svg?url'

const LESSON_GEO_4_4 = {
  title: "Euler's Formula for Polyhedra",
  subject: 'Geometry',
  sequential: true,

  cells: [
    {
      type: 'markdown',
      instruction: `### V − E + F = 2

For any **convex polyhedron**:

$$V - E + F = 2$$

where $V$ = vertices, $E$ = edges, $F$ = faces. The number $V-E+F$ is called the **Euler characteristic** $\\chi$ (chi).

| Polyhedron | V | E | F | V−E+F |
|---|---|---|---|---|
| Tetrahedron | 4 | 6 | 4 | **2** |
| Cube | 8 | 12 | 6 | **2** |
| Octahedron | 6 | 12 | 8 | **2** |
| Dodecahedron | 20 | 30 | 12 | **2** |
| Icosahedron | 12 | 30 | 20 | **2** |

**Why it works (sketch):** Start with one face. Each time you add a face sharing an edge, you add 1 face, at least 1 edge, and 0 new vertices beyond the first — the balance stays constant.

![Euler's formula diagram](${geoEulerUrl})`,
    },

    {
      type: 'js',
      instruction: 'Select a polyhedron. Count its V, E, F interactively and verify V − E + F = 2.',
      html: `<div style="text-align:center;font-family:monospace;font-size:13px;margin-bottom:8px">
<select id="poly" style="padding:4px 8px;font-size:13px">
  <option value="tetra">Tetrahedron (4 faces)</option>
  <option value="cube">Cube (6 faces)</option>
  <option value="octa">Octahedron (8 faces)</option>
  <option value="prism">Triangular Prism</option>
  <option value="pyramid">Square Pyramid</option>
  <option value="dodeca">Dodecahedron (12 faces)</option>
</select>
</div>
<canvas id="ec" width="580" height="320" style="border-radius:8px;display:block;margin:auto"></canvas>
<div id="einfo" style="text-align:center;font-family:monospace;font-size:14px;margin-top:8px;font-weight:bold"></div>`,
      css: `#ec{background:#f8fafc}`,
      startCode: `const cv=document.getElementById('ec');
const ctx=cv.getContext('2d');

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

const info=document.getElementById('einfo');
const W=cv.width,H=cv.height;
const polySel=document.getElementById('poly');

const polyhedra={
  tetra:{name:'Tetrahedron',V:4,E:6,F:4,desc:'4 triangular faces'},
  cube:{name:'Cube',V:8,E:12,F:6,desc:'6 square faces'},
  octa:{name:'Octahedron',V:6,E:12,F:8,desc:'8 triangular faces'},
  prism:{name:'Triangular Prism',V:6,E:9,F:5,desc:'2 triangles + 3 rectangles'},
  pyramid:{name:'Square Pyramid',V:5,E:8,F:5,desc:'1 square + 4 triangles'},
  dodeca:{name:'Dodecahedron',V:20,E:30,F:12,desc:'12 pentagonal faces'},
};

function draw(){
  ctx.clearRect(0,0,W,H);
  const p=polyhedra[polySel.value];
  const cx=W/2, cy=H/2-20;
  const euler=p.V-p.E+p.F;

  // Draw a stylised diagram of vertices/edges/faces as a grid infographic
  const colV='#dc2626',colE='#166534',colF='#7c3aed';
  const boxW=140,boxH=100,gap=20;
  const startX=(W-3*boxW-2*gap)/2;
  const startY=cy-boxH/2;

  // V box
  ctx.fillStyle='#dc262618';ctx.strokeStyle=colV;ctx.lineWidth=2;
  ctx.beginPath();ctx.roundRect(startX,startY,boxW,boxH,10);ctx.fill();ctx.stroke();
  ctx.fillStyle=colV;ctx.font='bold 40px monospace';ctx.textAlign='center';
  ctx.fillText(p.V,startX+boxW/2,startY+boxH/2+8);
  ctx.font='13px monospace';ctx.fillText('Vertices',startX+boxW/2,startY+boxH+18);

  // E box
  ctx.fillStyle='#16653418';ctx.strokeStyle=colE;
  ctx.beginPath();ctx.roundRect(startX+boxW+gap,startY,boxW,boxH,10);ctx.fill();ctx.stroke();
  ctx.fillStyle=colE;ctx.font='bold 40px monospace';
  ctx.fillText(p.E,startX+boxW+gap+boxW/2,startY+boxH/2+8);
  ctx.font='13px monospace';ctx.fillText('Edges',startX+boxW+gap+boxW/2,startY+boxH+18);

  // F box
  ctx.fillStyle='#7c3aed18';ctx.strokeStyle=colF;
  ctx.beginPath();ctx.roundRect(startX+2*(boxW+gap),startY,boxW,boxH,10);ctx.fill();ctx.stroke();
  ctx.fillStyle=colF;ctx.font='bold 40px monospace';
  ctx.fillText(p.F,startX+2*(boxW+gap)+boxW/2,startY+boxH/2+8);
  ctx.font='13px monospace';ctx.fillText('Faces',startX+2*(boxW+gap)+boxW/2,startY+boxH+18);

  // Operators
  ctx.fillStyle=TEXT;ctx.font='bold 30px monospace';
  ctx.fillText('-',startX+boxW+gap/2,startY+boxH/2+10);
  ctx.fillText('+',startX+2*boxW+1.5*gap,startY+boxH/2+10);

  // Result
  ctx.font='bold 18px Georgia';ctx.textAlign='center';
  const colour=euler===2?'#166534':'#dc2626';
  ctx.fillStyle=colour;
  ctx.fillText(p.V+' − '+p.E+' + '+p.F+' = '+euler+(euler===2?' ✓':' ✗'),cx,startY+boxH+50);

  ctx.fillStyle=TEXT;ctx.font='13px monospace';
  ctx.fillText(p.name+': '+p.desc,cx,startY-20);

  info.textContent='Euler characteristic χ = '+euler+(euler===2?' — consistent with a convex polyhedron':'');
  info.style.color=colour;
}

polySel.onchange=draw;
draw();`,
      outputHeight: 400,
    },

    {
      type: 'js',
      instruction: 'Explore what happens to V − E + F for non-convex or holed polyhedra. A torus (donut) has χ = 0.',
      html: `<canvas id="ec2" width="580" height="300" style="border-radius:8px;display:block;margin:auto"></canvas>
<div id="e2info" style="text-align:center;font-family:monospace;font-size:13px;margin-top:6px"></div>`,
      css: `#ec2{background:#f8fafc}`,
      startCode: `const cv=document.getElementById('ec2');
const ctx=cv.getContext('2d');

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

const info=document.getElementById('e2info');
const W=cv.width,H=cv.height;

const shapes=[
  {name:'Sphere (triangulated)',V:2,E:3,F:2,note:'Simplest triangulation: χ=2',col:'#1e3a5f'},
  {name:'Torus (donut)',V:1,E:2,F:1,note:'1 vertex, 2 edges (loops), 1 face: χ=0',col:'#dc2626'},
  {name:'Double torus',V:1,E:4,F:1,note:'χ=−2 (genus 2)',col:'#7c3aed'},
  {name:'Cylinder (open)',V:0,E:0,F:0,note:'Not a closed polyhedron',col:'#166534'},
];
// Corrected values
shapes[0]={name:'Convex polyhedron (sphere)',V:4,E:6,F:4,note:'Like a tetrahedron: χ=2',col:'#1e3a5f'};
shapes[1]={name:'Torus mesh (simple)',V:4,E:8,F:4,note:'χ=4−8+4=0 (genus-1 surface)',col:'#dc2626'};
shapes[2]={name:'Double torus mesh',V:4,E:10,F:4,note:'χ=4−10+4=−2 (genus-2 surface)',col:'#7c3aed'};
shapes[3]={name:'Star polyhedron',V:8,E:12,F:6,note:'χ=2 (still convex topology)',col:'#166534'};

function draw(){
  ctx.clearRect(0,0,W,H);
  const row=80,startY=40,lw=W-60;
  ctx.fillStyle=TEXT;ctx.font='bold 14px monospace';ctx.textAlign='left';
  ctx.fillText('Surface type  →  V − E + F = χ',30,22);
  ctx.fillStyle='#94a3b8';ctx.font='11px monospace';
  ctx.fillText('Euler characteristic depends on the TOPOLOGY (holes), not just shape',30,38);

  shapes.forEach((s,i)=>{
    const y=startY+i*row;
    ctx.fillStyle=s.col+'22';ctx.strokeStyle=s.col;ctx.lineWidth=1.5;
    ctx.beginPath();ctx.roundRect(20,y,W-40,row-10,8);ctx.fill();ctx.stroke();
    ctx.fillStyle=s.col;ctx.font='bold 13px monospace';ctx.textAlign='left';
    ctx.fillText(s.name,30,y+22);
    ctx.font='13px monospace';
    ctx.fillText(s.V+' − '+s.E+' + '+s.F+' = '+(s.V-s.E+s.F),30,y+42);
    ctx.fillStyle=TEXT;ctx.font='12px monospace';
    ctx.fillText(s.note,30,y+62);
  });
  info.textContent='χ=2 → sphere topology · χ=0 → torus · χ=2−2g for genus-g surface';
}
draw();`,
      outputHeight: 360,
    },

    {
      type: 'challenge',
      instruction: 'A polyhedron has 10 faces and 15 edges. How many vertices does it have? Verify with an example.',
      hint: 'Use V − E + F = 2 → V = 2 + E − F = 2 + 15 − 10.',
      solution: `V − E + F = 2
V = 2 + E − F = 2 + 15 − 10 = 7

So the polyhedron has 7 vertices.

Example: a pentagonal prism has V=10, E=15, F=7 (not quite, but a pentagonal prism has 10-15+7=2 ✓).
A specific shape with V=7, E=15, F=10 would be a pentagonal bipyramid variant — you can verify: 7-15+10=2 ✓.`,
    },

    {
      type: 'challenge',
      instruction: 'The five Platonic solids all satisfy V − E + F = 2. Complete the table: tetrahedron (4,6,4), cube (8,12,6), octahedron (?,12,8), dodecahedron (20,?,12), icosahedron (12,30,?).',
      hint: 'Use V − E + F = 2 three times. Octahedron: V=2+12-8. Dodecahedron: E=V+F-2=20+12-2. Icosahedron: F=2-V+E=2-12+30.',
      solution: `Octahedron:  V = 2 + E − F = 2 + 12 − 8 = 6 ✓
Dodecahedron: E = V + F − 2 = 20 + 12 − 2 = 30 ✓
Icosahedron: F = 2 − V + E = 2 − 12 + 30 = 20 ✓

All five Platonic solids satisfy V − E + F = 2.`,
    },
  ],

  intuition: {
    blocks: [
      {
        type: 'prose',
        text: "Euler's formula says something deep: no matter how you sculpt a convex polyhedron — triangular, pentagonal, with a hundred faces or four — the alternating sum V−E+F is always 2. It's a topological invariant, not a metric one.",
      },
      {
        type: 'image',
        src: geoEulerUrl,
        alt: "Euler's formula diagram — tetrahedron, cube, octahedron",
        caption: 'Three very different shapes, same Euler characteristic: 4−6+4=2, 8−12+6=2, 6−12+8=2.',
      },
      {
        type: 'callout',
        variant: 'tip',
        text: 'If you know any two of V, E, F for a convex polyhedron, you know all three. This lets you solve "find V" or "find E" problems instantly without drawing the solid.',
      },
    ],
  },

  quiz: [
    {
      q: 'What does V − E + F equal for any convex polyhedron?',
      img: quizEulerUrl,
      choices: ['2', '0', '1', 'It varies'],
      answer: 0,
      explanation: "Euler's formula: V − E + F = 2 for all convex polyhedra.",
    },
    {
      q: 'A triangular prism has V=6, E=9. How many faces?',
      img: quizEulerUrl,
      choices: ['5', '6', '4', '9'],
      answer: 0,
      explanation: 'F = 2 − V + E = 2 − 6 + 9 = 5. (2 triangles + 3 rectangles)',
    },
    {
      q: 'A square pyramid has V=5, F=5. How many edges?',
      img: quizEulerUrl,
      choices: ['8', '6', '10', '4'],
      answer: 0,
      explanation: 'E = V + F − 2 = 5 + 5 − 2 = 8.',
    },
    {
      q: 'An octahedron has V=6, E=12, F=8. What is V−E+F?',
      img: quizEulerUrl,
      choices: ['2', '0', '4', '6'],
      answer: 0,
      explanation: '6 − 12 + 8 = 2 ✓',
    },
    {
      q: 'A polyhedron has 12 faces and 8 vertices. How many edges?',
      choices: ['18', '20', '16', '24'],
      answer: 0,
      explanation: 'E = V + F − 2 = 8 + 12 − 2 = 18.',
    },
    {
      q: 'The dodecahedron has 12 pentagonal faces and 20 vertices. How many edges?',
      choices: ['30', '24', '36', '20'],
      answer: 0,
      explanation: 'E = V + F − 2 = 20 + 12 − 2 = 30.',
    },
    {
      q: 'Which polyhedron has V=6, E=12, F=8?',
      img: quizEulerUrl,
      choices: ['Octahedron', 'Cube', 'Tetrahedron', 'Prism'],
      answer: 0,
      explanation: 'An octahedron has 6 vertices, 12 edges, and 8 triangular faces.',
    },
    {
      q: 'For a torus (donut shape), V − E + F =',
      choices: ['0', '2', '1', '−2'],
      answer: 0,
      explanation: 'A torus is genus-1, so χ = 2 − 2(1) = 0. Only convex (genus-0) polyhedra give χ=2.',
    },
    {
      q: 'A polyhedron has 20 triangular faces. If all faces are triangles and each edge is shared by exactly 2 faces, how many edges?',
      choices: ['30', '20', '40', '60'],
      answer: 0,
      explanation: '20 triangles × 3 edges / 2 (each shared) = 30 edges.',
    },
    {
      q: 'Using V−E+F=2, if a solid has 30 edges and 12 faces, find V.',
      choices: ['20', '18', '22', '16'],
      answer: 0,
      explanation: 'V = 2 + E − F = 2 + 30 − 12 = 20.',
    },
  ],
};

LESSON_GEO_4_4.intuition.blocks.push({ type: 'viz', id: 'ScienceNotebook', props: { lesson: { cells: LESSON_GEO_4_4.cells, title: LESSON_GEO_4_4.title, subject: LESSON_GEO_4_4.subject, sequential: LESSON_GEO_4_4.sequential } } });

const GEO_4_4_DEFAULT = {
  cells: LESSON_GEO_4_4.cells,
  id: 'geo-4-4',
  title: "Euler's Formula for Polyhedra",
  slug: 'euler-formula',
  subject: 'Geometry',
  chapter: 4,
  order: 4,
  tags: ["Euler's formula", 'polyhedra', 'vertices', 'edges', 'faces', 'topology'],
  intuition: LESSON_GEO_4_4.intuition,
  quiz: LESSON_GEO_4_4.quiz.map(function(item, i) {
    return { id: 'q'+(i+1), type: 'choice', text: item.q, options: item.choices, correct: item.answer, explanation: item.explanation };
  }),
};

export default GEO_4_4_DEFAULT;
export { LESSON_GEO_4_4 };
