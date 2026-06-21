import geoPlatonicUrl from '../diagrams/geo-platonic-solids.svg?url'
import quizPlatonicUrl from '../diagrams/quiz-geo-platonic.svg?url'

const LESSON_GEO_4_6 = {
  title: 'Platonic Solids',
  subject: 'Geometry',
  sequential: true,

  cells: [
    {
      type: 'markdown',
      instruction: `### The Five Perfect Solids

A **Platonic solid** has:
- All faces congruent regular polygons
- The same number of faces meeting at every vertex

Only **5** exist:

| Name | Face | V | E | F | Faces/vertex |
|---|---|---|---|---|---|
| Tetrahedron | equilateral △ | 4 | 6 | 4 | 3 |
| Cube | square | 8 | 12 | 6 | 3 |
| Octahedron | equilateral △ | 6 | 12 | 8 | 4 |
| Dodecahedron | regular pentagon | 20 | 30 | 12 | 3 |
| Icosahedron | equilateral △ | 12 | 30 | 20 | 5 |

**Why only 5?** The interior angles at each vertex must sum to less than 360° (otherwise the solid would be flat or impossible):
- Triangles (60°): 3, 4, or 5 per vertex → tetrahedron, octahedron, icosahedron
- Squares (90°): only 3 per vertex → cube
- Pentagons (108°): only 3 per vertex → dodecahedron
- Hexagons (120°): 3 per vertex gives exactly 360° → flat tessellation, not a solid

**Dual pairs:** Swap V and F to get the dual. Cube ↔ Octahedron. Dodecahedron ↔ Icosahedron. Tetrahedron is self-dual.

![Platonic solids diagram](${geoPlatonicUrl})`,
    },

    {
      type: 'js',
      instruction: 'Select any of the five Platonic solids. See its counts, duality relationship, and angle-sum-at-vertex proof that no others can exist.',
      html: `<div style="text-align:center;font-family:monospace;font-size:13px;margin-bottom:8px">
<select id="plat" style="padding:4px 8px;font-size:13px">
  <option value="tetra">Tetrahedron</option>
  <option value="cube">Cube</option>
  <option value="octa">Octahedron</option>
  <option value="dodeca">Dodecahedron</option>
  <option value="icosa">Icosahedron</option>
</select>
</div>
<canvas id="plc" width="580" height="340" style="border-radius:8px;display:block;margin:auto"></canvas>
<div id="plinfo" style="font-family:monospace;font-size:12px;padding:8px;background:#1e293b;color:#93c5fd;border-radius:6px;margin-top:6px;min-height:80px"></div>`,
      css: `#plc{background:#f8fafc}`,
      startCode: `const cv=document.getElementById('plc');
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

const plinfo=document.getElementById('plinfo');
const W=cv.width,H=cv.height;
const platSel=document.getElementById('plat');

const solids={
  tetra:{name:'Tetrahedron',V:4,E:6,F:4,face:'equilateral triangle',angle:60,perVertex:3,dual:'itself',col:'#dc2626',
    fact:'Smallest Platonic solid; dual of itself; used in chemistry for tetrahedral molecular geometry.'},
  cube:{name:'Cube',V:8,E:12,F:6,face:'square',angle:90,perVertex:3,dual:'Octahedron',col:'#1e3a5f',
    fact:'Hexahedron; dual of octahedron; the only Platonic solid that tiles 3D space.'},
  octa:{name:'Octahedron',V:6,E:12,F:8,face:'equilateral triangle',angle:60,perVertex:4,dual:'Cube',col:'#166534',
    fact:'Dual of the cube; both have same E=12. Two square pyramids glued at bases.'},
  dodeca:{name:'Dodecahedron',V:20,E:30,F:12,face:'regular pentagon',angle:108,perVertex:3,dual:'Icosahedron',col:'#b45309',
    fact:'Plato associated it with the cosmos. Pentagons appear in nature (viruses, fullerenes).'},
  icosa:{name:'Icosahedron',V:12,E:30,F:20,face:'equilateral triangle',angle:60,perVertex:5,dual:'Dodecahedron',col:'#7c3aed',
    fact:'Most sphere-like of the 5; used in geodesic domes. 5 triangles meet at each vertex.'},
};

function draw(){
  ctx.clearRect(0,0,W,H);
  const s=solids[platSel.value];
  const cx=W/2,cy=H/2;
  const col=s.col;

  // Draw large schematic boxes for V, E, F
  const bw=100,bh=80,gap=24;
  const sx=(W-3*bw-2*gap)/2;
  const sy=50;
  [['Vertices',s.V,col],[' Edges',s.E,'#374151'],['  Faces',s.F,'#7c3aed']].forEach(([label,n,c],i)=>{
    const x=sx+i*(bw+gap),y=sy;
    ctx.fillStyle=c+'22';ctx.strokeStyle=c;ctx.lineWidth=2;
    ctx.beginPath();ctx.roundRect(x,y,bw,bh,10);ctx.fill();ctx.stroke();
    ctx.fillStyle=c;ctx.font='bold 38px monospace';ctx.textAlign='center';
    ctx.fillText(n,x+bw/2,y+bh/2+10);
    ctx.font='11px monospace';ctx.fillText(label.trim(),x+bw/2,y+bh+16);
  });
  // Minus and plus
  ctx.fillStyle=TEXT;ctx.font='bold 28px monospace';
  ctx.textAlign='center';
  ctx.fillText('−',sx+bw+gap/2,sy+bh/2+10);
  ctx.fillText('+',sx+2*(bw+gap)-gap/2,sy+bh/2+10);
  // Euler check
  const euler=s.V-s.E+s.F;
  ctx.fillStyle=GREEN;ctx.font='bold 16px Georgia';
  ctx.fillText(s.V+' − '+s.E+' + '+s.F+' = '+euler+(euler===2?' ✓':''),cx,sy+bh+40);

  // Angle sum at vertex
  const totalAngle=s.angle*s.perVertex;
  const barY=sy+bh+72,barW=300;
  ctx.fillStyle=GRID;ctx.fillRect((W-barW)/2,barY,barW,20);
  const fillW=barW*totalAngle/360;
  ctx.fillStyle=totalAngle<360?col+'aa':'#dc2626aa';
  ctx.fillRect((W-barW)/2,barY,fillW,20);
  ctx.strokeStyle=TEXT;ctx.lineWidth=1;ctx.strokeRect((W-barW)/2,barY,barW,20);
  ctx.fillStyle=TEXT;ctx.font='12px monospace';ctx.textAlign='center';
  ctx.fillText('Angle sum at vertex: '+s.perVertex+'×'+s.angle+'° = '+totalAngle+'° '+(totalAngle<360?'< 360° ✓ (gap allows folding)':'≥ 360° → cannot close'),cx,barY+34);

  // Dual
  ctx.fillStyle=col;ctx.font='bold 13px Georgia';
  ctx.fillText('Dual solid: '+s.dual,cx,barY+58);
  ctx.fillStyle=TEXT;ctx.font='12px monospace';
  ctx.fillText('Face type: '+s.face,cx,barY+76);

  plinfo.textContent=s.fact+'\\n\\nEuler: '+s.V+'−'+s.E+'+'+s.F+'='+euler+
    '  ·  '+s.perVertex+' '+s.face+'s meet at each vertex  ·  interior angle='+s.angle+'°';
}
platSel.onchange=draw;
draw();`,
      outputHeight: 430,
    },

    {
      type: 'js',
      instruction: 'See the duality relationship: the dual of a Platonic solid is found by placing a vertex at the centre of each face. Cube and octahedron are duals — observe how their V and F counts swap.',
      html: `<canvas id="dc" width="580" height="280" style="border-radius:8px;display:block;margin:auto"></canvas>`,
      css: `#dc{background:#f8fafc}`,
      startCode: `const cv=document.getElementById('dc');
const ctx=cv.getContext('2d');
const W=cv.width,H=cv.height;

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

ctx.clearRect(0,0,W,H);

const pairs=[
  {a:{name:'Tetrahedron',V:4,E:6,F:4,col:'#dc2626'},b:{name:'Tetrahedron (dual)',V:4,E:6,F:4,col:'#dc262688'},dual:true},
  {a:{name:'Cube',V:8,E:12,F:6,col:'#1e3a5f'},b:{name:'Octahedron',V:6,E:12,F:8,col:'#166534'},dual:false},
  {a:{name:'Dodecahedron',V:20,E:30,F:12,col:'#b45309'},b:{name:'Icosahedron',V:12,E:30,F:20,col:'#7c3aed'},dual:false},
];

ctx.fillStyle=TEXT;ctx.font='bold 13px Georgia';ctx.textAlign='center';
ctx.fillText('Dual Pairs: swapping V and F gives the partner solid (E stays the same)',W/2,20);

pairs.forEach((pair,i)=>{
  const y=50+i*72;
  const {a,b}=pair;
  // A box
  ctx.fillStyle=a.col+'22';ctx.strokeStyle=a.col;ctx.lineWidth=2;
  ctx.beginPath();ctx.roundRect(20,y,220,58,8);ctx.fill();ctx.stroke();
  ctx.fillStyle=a.col;ctx.font='bold 12px monospace';ctx.textAlign='left';
  ctx.fillText(a.name,30,y+18);
  ctx.font='12px monospace';ctx.fillText('V='+a.V+'  E='+a.E+'  F='+a.F,30,y+38);

  // Arrow
  ctx.fillStyle=TEXT;ctx.font='bold 20px monospace';ctx.textAlign='center';
  ctx.fillText(pair.dual?'↔ (self)':'↔',W/2,y+32);

  // B box
  ctx.fillStyle=b.col+'22';ctx.strokeStyle=b.col;ctx.lineWidth=2;
  ctx.beginPath();ctx.roundRect(W-240,y,220,58,8);ctx.fill();ctx.stroke();
  ctx.fillStyle=b.col;ctx.font='bold 12px monospace';ctx.textAlign='left';
  ctx.fillText(b.name,W-230,y+18);
  ctx.font='12px monospace';ctx.fillText('V='+b.V+'  E='+b.E+'  F='+b.F,W-230,y+38);

  // Swap arrows for V/F
  if(!pair.dual){
    ctx.fillStyle='#94a3b8';ctx.font='10px monospace';ctx.textAlign='center';
    ctx.fillText('V: '+a.V+' ↔ '+b.V,W/2,y+18);
    ctx.fillText('F: '+a.F+' ↔ '+b.F,W/2,y+48);
  }
});`,
      outputHeight: 320,
    },

    {
      type: 'challenge',
      instruction: 'An icosahedron has 12 vertices, 30 edges, and 20 faces. (a) Verify Euler\'s formula. (b) What is its dual? (c) At each vertex, 5 equilateral triangles meet. What is the angle sum at a vertex, and why must it be less than 360°?',
      hint: 'For (b): dual swaps V and F — check which Platonic solid has those counts. For (c): each triangle has interior angles of 60°.',
      solution: `(a) V − E + F = 12 − 30 + 20 = 2 ✓

(b) The dual: place a new vertex at the centre of each of the 20 faces → 20 new vertices;
    connect them through shared edges → 30 edges; the 12 original vertices become 12 faces.
    A solid with V=20, E=30, F=12 is the DODECAHEDRON.

(c) 5 triangles meet at each vertex: angle sum = 5 × 60° = 300° < 360°.
    The "angular deficit" = 360° − 300° = 60° allows the surface to curve into 3D.
    If the sum reached 360°, the surface would be flat (like a triangular tessellation of the plane).`,
    },

    {
      type: 'challenge',
      instruction: 'Prove that no Platonic solid can have hexagonal faces. (Hint: what is the interior angle of a regular hexagon? What happens when 3 hexagons meet at a vertex?)',
      hint: 'Interior angle of regular hexagon = (6-2)×180/6 = 120°. Three hexagons: 3×120° = 360°.',
      solution: `Interior angle of a regular hexagon = (6−2)×180°/6 = 120°.

If three regular hexagons meet at a vertex:
  angle sum = 3 × 120° = 360°

This means the surface is flat — it tiles the plane (the standard hexagonal tiling).
You cannot "close up" a 3D solid because there is no angular deficit.

Trying 2 hexagons: 2×120° = 240° < 360°, but you need at least 3 faces at a vertex to form a solid.

Therefore, no Platonic solid can have regular hexagonal faces. ✓`,
    },
  ],

  intuition: {
    blocks: [
      {
        type: 'prose',
        text: "The five Platonic solids were studied by ancient Greek mathematicians. Plato associated them with the classical elements (fire=tetrahedron, earth=cube, air=octahedron, water=icosahedron, cosmos=dodecahedron). Euclid's Elements ends with a proof that exactly five exist.",
      },
      {
        type: 'image',
        src: geoPlatonicUrl,
        alt: 'All five Platonic solids',
        caption: 'The five Platonic solids. Note the dual pairs: cube↔octahedron, dodecahedron↔icosahedron, tetrahedron↔itself.',
      },
      {
        type: 'callout',
        variant: 'tip',
        text: 'Memorise the table row by row: face type × count. "4 triangles, 4 vertices, 6 edges" — the tetrahedron. Then octahedron DOUBLES the faces (8) and same edges (12). Cube: 6 faces, 8 vertices. Dodecahedron/icosahedron: both have 30 edges, just swapped 12↔20 V and F.',
      },
    ],
  },

  quiz: [
    {
      q: 'Which Platonic solid has 20 triangular faces?',
      img: quizPlatonicUrl,
      choices: ['Icosahedron', 'Octahedron', 'Dodecahedron', 'Tetrahedron'],
      answer: 0,
      explanation: 'The icosahedron has 20 equilateral triangular faces, 12 vertices, and 30 edges.',
    },
    {
      q: 'The dual of the cube is:',
      img: quizPlatonicUrl,
      choices: ['Octahedron', 'Tetrahedron', 'Icosahedron', 'Dodecahedron'],
      answer: 0,
      explanation: 'Place a vertex at the centre of each of the 6 cube faces → 6 vertices, connect them → get an octahedron (6V, 12E, 8F).',
    },
    {
      q: 'Which Platonic solid is self-dual?',
      img: quizPlatonicUrl,
      choices: ['Tetrahedron', 'Cube', 'Icosahedron', 'Dodecahedron'],
      answer: 0,
      explanation: 'Tetrahedron has V=4, F=4 — swapping gives the same counts. Its dual is itself.',
    },
    {
      q: 'Why are hexagonal faces impossible in a Platonic solid?',
      img: quizPlatonicUrl,
      choices: ['3 hexagons give angle sum 360° — too flat', '4 hexagons fit around a point', 'Hexagons have too many sides', 'Hexagons violate Euler\'s formula'],
      answer: 0,
      explanation: '3 regular hexagons at a vertex: 3×120°=360°. No angular deficit means the surface is flat — it tiles the plane, not a sphere.',
    },
    {
      q: 'Dodecahedron: V=20, E=30. How many faces?',
      img: quizPlatonicUrl,
      choices: ['12', '20', '30', '8'],
      answer: 0,
      explanation: 'F = 2 − V + E = 2 − 20 + 30 = 12. (12 pentagonal faces.)',
    },
    {
      q: 'How many equilateral triangles meet at each vertex of an octahedron?',
      img: quizPlatonicUrl,
      choices: ['4', '3', '5', '6'],
      answer: 0,
      explanation: '4 triangles × 60° = 240° < 360° — octahedron has 4 triangles per vertex.',
    },
    {
      q: 'The dodecahedron and icosahedron are duals. This means:',
      img: quizPlatonicUrl,
      choices: ['Their V and F counts swap (both have E=30)', 'They have the same shape', 'They have the same number of faces', 'One fits inside the other'],
      answer: 0,
      explanation: 'Dodecahedron: V=20, F=12. Icosahedron: V=12, F=20. Same E=30. Duals swap V and F.',
    },
    {
      q: 'Which Platonic solid tiles (fills) 3D space by itself?',
      img: quizPlatonicUrl,
      choices: ['Cube', 'Tetrahedron', 'Octahedron', 'Dodecahedron'],
      answer: 0,
      explanation: 'Cubes tile 3D space perfectly. No other Platonic solid does.',
    },
    {
      q: 'An octahedron has V=6, F=8. How many edges?',
      choices: ['12', '10', '8', '14'],
      answer: 0,
      explanation: 'E = V + F − 2 = 6 + 8 − 2 = 12.',
    },
    {
      q: 'At each vertex of a dodecahedron, 3 regular pentagons meet. The angle sum is:',
      choices: ['324°', '360°', '300°', '240°'],
      answer: 0,
      explanation: 'Interior angle of regular pentagon = 108°. Three pentagons: 3×108° = 324° < 360° ✓.',
    },
  ],
};

LESSON_GEO_4_6.intuition.blocks.push({ type: 'viz', id: 'ScienceNotebook', props: { lesson: { cells: LESSON_GEO_4_6.cells, title: LESSON_GEO_4_6.title, subject: LESSON_GEO_4_6.subject, sequential: LESSON_GEO_4_6.sequential } } });

const GEO_4_6_DEFAULT = {
  cells: LESSON_GEO_4_6.cells,
  id: 'geo-4-6',
  title: 'Platonic Solids',
  slug: 'platonic-solids',
  subject: 'Geometry',
  chapter: 4,
  order: 6,
  tags: ['Platonic solids', 'tetrahedron', 'cube', 'octahedron', 'dodecahedron', 'icosahedron', 'duality'],
  intuition: LESSON_GEO_4_6.intuition,
  quiz: LESSON_GEO_4_6.quiz.map(function(item, i) {
    return { id: 'q'+(i+1), type: 'choice', text: item.q, options: item.choices, correct: item.answer, explanation: item.explanation };
  }),
};

export default GEO_4_6_DEFAULT;
export { LESSON_GEO_4_6 };
