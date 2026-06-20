import geoPointUrl from '../diagrams/geo-point.svg?url'
import geoLineUrl from '../diagrams/geo-line.svg?url'
import geoPlaneUrl from '../diagrams/geo-plane.svg?url'
import geoTwoPointsUrl from '../diagrams/geo-two-points-one-line.svg?url'
import geoCollinearUrl from '../diagrams/geo-collinear.svg?url'
import geoSegmentRayUrl from '../diagrams/geo-segment-ray-line.svg?url'
import geoIntersectionsUrl from '../diagrams/geo-intersections.svg?url'
import geoSkewLinesUrl from '../diagrams/geo-skew-lines.svg?url'
import quizCollinearUrl from '../diagrams/quiz-collinear.svg?url'
import quizSegmentRayUrl from '../diagrams/quiz-segment-ray-line.svg?url'

const LESSON_GEO_1_2 = {
  title: 'Points, Lines, and Planes',
  subject: 'Geometry',
  sequential: true,

  cells: [
    {
      type: 'markdown',
      instruction: `### The Three Undefined Terms

Geometry starts with three concepts it never defines: **point** (a location, 0 dimensions), **line** (infinite, straight, 1 dimension), and **plane** (infinite, flat, 2 dimensions). Everything else in geometry — segments, rays, angles, polygons — is built on these three primitives.

From these, postulates state the key relationships:
- **Two distinct points** determine exactly one line.
- **Three non-collinear points** determine exactly one plane.
- **Two lines** in the same plane either intersect at one point or are parallel.`,
    },

    {
      type: 'js',
      instruction: `### Point Plotter — Build Lines and Planes

Click anywhere in the canvas to place points (up to 3). Watch what the postulates guarantee:
- After **2 points**: the unique line through them appears.
- After **3 points**: if they are collinear they lie on one line; if non-collinear they define a unique plane (shaded triangle).

Click **Reset** to start again.`,
      html: `<canvas id="cv" width="700" height="340" style="cursor:crosshair;display:block"></canvas>
<div style="display:flex;justify-content:space-between;align-items:center;padding:8px 14px;background:var(--color-background-primary,#fff);border-top:1px solid var(--color-border-primary,#e2e8f0)">
<div id="msg" style="font-family:Georgia,serif;font-size:13px;color:var(--color-text-primary,#1e293b);line-height:1.5;flex:1"></div>
<button id="resetBtn" style="padding:6px 16px;border-radius:8px;border:1.5px solid #1e3a5f;background:transparent;color:#1e3a5f;font-family:Georgia,serif;font-size:12px;font-weight:700;cursor:pointer;margin-left:12px">Reset</button>
</div>`,
      css: `body{margin:0;background:var(--color-background-secondary,#f8fafc);font-family:Georgia,serif}canvas{display:block}`,
      startCode: `var cv=document.getElementById('cv'),ctx=cv.getContext('2d');
var W=cv.width,H=cv.height;
var pts=[];
var labels=['A','B','C'];
var colors=['#1e3a5f','#1a3a2a','#7c3aed'];

function collinear(a,b,c){
  return Math.abs((b.x-a.x)*(c.y-a.y)-(c.x-a.x)*(b.y-a.y))<800;
}

function draw(){
  ctx.clearRect(0,0,W,H);
  ctx.fillStyle='#fafaf8';ctx.fillRect(0,0,W,H);

  var msg='';

  if(pts.length===2){
    // Draw the unique line
    var dx=pts[1].x-pts[0].x,dy=pts[1].y-pts[0].y;
    var len=Math.hypot(dx,dy)||1;
    var ux=dx/len,uy=dy/len;
    ctx.strokeStyle='rgba(30,58,95,0.35)';ctx.lineWidth=2;ctx.setLineDash([6,4]);
    ctx.beginPath();
    ctx.moveTo(pts[0].x-ux*600,pts[0].y-uy*600);
    ctx.lineTo(pts[0].x+ux*600,pts[0].y+uy*600);
    ctx.stroke();ctx.setLineDash([]);
    msg='<strong>Postulate I:</strong> Through A and B there is exactly one line (shown dashed). Place a third point.';
  }

  if(pts.length===3){
    var isColl=collinear(pts[0],pts[1],pts[2]);
    if(isColl){
      var dx=pts[1].x-pts[0].x,dy=pts[1].y-pts[0].y;
      var len=Math.hypot(dx,dy)||1;var ux=dx/len,uy=dy/len;
      ctx.strokeStyle='#1e3a5f';ctx.lineWidth=2.5;ctx.setLineDash([]);
      ctx.beginPath();
      ctx.moveTo(pts[0].x-ux*600,pts[0].y-uy*600);
      ctx.lineTo(pts[0].x+ux*600,pts[0].y+uy*600);
      ctx.stroke();
      msg='<strong style="color:#1e3a5f">Collinear!</strong> A, B, C all lie on the same line — they do not determine a unique plane (infinitely many planes contain this line). Reset and try non-collinear points.';
    } else {
      ctx.beginPath();
      ctx.moveTo(pts[0].x,pts[0].y);
      ctx.lineTo(pts[1].x,pts[1].y);
      ctx.lineTo(pts[2].x,pts[2].y);
      ctx.closePath();
      ctx.fillStyle='rgba(124,58,237,0.12)';ctx.fill();
      ctx.strokeStyle='#7c3aed';ctx.lineWidth=2;ctx.stroke();
      msg='<strong style="color:#7c3aed">Non-collinear!</strong> A, B, C are not on one line — they determine exactly one unique plane (shaded). This is why architecture uses triangles: 3 non-collinear points = rigidity.';
    }
  }

  // Draw points
  pts.forEach(function(p,i){
    ctx.beginPath();ctx.arc(p.x,p.y,8,0,Math.PI*2);
    ctx.fillStyle=colors[i];ctx.fill();
    ctx.fillStyle='#fff';ctx.font='bold 12px sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';
    ctx.fillText(labels[i],p.x,p.y);
    ctx.textBaseline='alphabetic';
  });

  if(pts.length===0)msg='Click anywhere to place point A.';
  if(pts.length===1)msg='Point A placed. Click to place point B.';

  document.getElementById('msg').innerHTML=msg;
}

cv.addEventListener('click',function(e){
  if(pts.length>=3)return;
  var r=cv.getBoundingClientRect();
  pts.push({x:(e.clientX-r.left)*(W/r.width),y:(e.clientY-r.top)*(H/r.height)});
  draw();
});

document.getElementById('resetBtn').onclick=function(){pts=[];draw();};
draw();`,
      outputHeight: 420,
    },

    {
      type: 'js',
      instruction: `### Classify: Segment, Ray, or Line?

For each geometric object A, B, C below — decide if it is a **segment** (two endpoints), a **ray** (one endpoint, one arrow), or a **line** (two arrows, infinite both ways). Click your answer to reveal whether you're right.`,
      html: `<div id="quiz-cl" style="padding:14px;display:flex;flex-direction:column;gap:12px"></div>`,
      css: `body{margin:0;background:var(--color-background-secondary,#f8fafc);font-family:Georgia,serif}`,
      startCode: `var items=[
  {label:'A',desc:'Two solid endpoints at each end, finite length',correct:'Segment',
   note:'A segment is finite — it has exactly two endpoints and the set of points between them. Written AB̄.'},
  {label:'B',desc:'One solid endpoint on the left, arrow on the right pointing forever',correct:'Ray',
   note:'A ray starts at one endpoint and extends infinitely in one direction. Written AB→ (starting at A through B).'},
  {label:'C',desc:'Arrows on both ends, extends forever in both directions',correct:'Line',
   note:'A line has no endpoints — it extends infinitely in both directions. Written ↔AB.'},
  {label:'D',desc:'Solid dot at left end, two tick marks in the middle, no endpoint on right (arrow)',correct:'Ray',
   note:'The two tick marks show equal lengths (a fact marked on the ray) — but the shape is still a ray: one endpoint, one infinite end.'},
];

var opts=['Segment','Ray','Line'];
var container=document.getElementById('quiz-cl');

items.forEach(function(item){
  var card=document.createElement('div');
  card.style.cssText='border:1px solid var(--color-border-primary,#e2e8f0);border-radius:10px;overflow:hidden;background:var(--color-background-primary,#fff);';
  var head=document.createElement('div');
  head.style.cssText='padding:10px 14px;display:flex;align-items:center;gap:12px;border-bottom:1px solid var(--color-border-primary,#e2e8f0);';
  head.innerHTML='<div style="min-width:26px;height:26px;border-radius:13px;background:#1e3a5f;color:#fff;font-size:11px;font-weight:700;display:flex;align-items:center;justify-content:center;font-family:sans-serif">'+item.label+'</div>'
    +'<div style="font-size:13px;font-style:italic;color:var(--color-text-primary,#1e293b)">'+item.desc+'</div>';
  var btns=document.createElement('div');
  btns.style.cssText='padding:10px 14px;display:flex;gap:8px;';
  var fb=document.createElement('div');
  fb.style.cssText='padding:0 14px 10px;font-size:12px;line-height:1.65;display:none;';
  var answered=false;
  opts.forEach(function(opt){
    var b=document.createElement('button');
    b.textContent=opt;
    b.style.cssText='padding:6px 14px;border-radius:8px;border:1.5px solid #e2e8f0;background:#f8fafc;font-family:Georgia,serif;font-size:12px;font-weight:700;cursor:pointer;color:#374151;';
    b.onclick=function(){
      if(answered)return;
      answered=true;
      var right=opt===item.correct;
      b.style.background=right?'#dcfce7':'#fee2e2';
      b.style.borderColor=right?'#86efac':'#fca5a5';
      b.style.color=right?'#166534':'#991b1b';
      fb.style.display='block';
      fb.innerHTML='<strong style="color:'+(right?'#166534':'#991b1b')+'">'+(right?'Correct':'Incorrect — it\'s a '+item.correct)+'. </strong>'+item.note;
    };
    btns.appendChild(b);
  });
  card.appendChild(head);card.appendChild(btns);card.appendChild(fb);
  container.appendChild(card);
});`,
      outputHeight: 420,
    },

    {
      type: 'challenge',
      instruction: `Line ℓ and line m lie in the same plane. They are NOT parallel. How many points can they share?`,
      options: [
        { label: 'A', text: 'Zero — all lines in the same plane avoid each other.' },
        { label: 'B', text: 'Exactly one — two non-parallel lines in the same plane intersect in exactly one point (Postulate I guarantees the intersection is unique).' },
        { label: 'C', text: 'Possibly two or more.' },
      ],
      check: (l) => l === 'B',
      successMessage: 'Correct. In the same plane, two non-parallel lines must intersect — and by Postulate I (two points determine exactly one line), they can share at most one point. If they shared two points, Postulate I would give a contradiction.',
      failMessage: 'Non-parallel lines in the same plane must intersect — they can\'t avoid each other (that\'s what "parallel" means). And Postulate I guarantees the intersection is exactly one point: if they shared two, you\'d have two distinct lines through the same two points, contradicting Postulate I.',
      html: '', css: 'body{margin:0}', startCode: '', outputHeight: 260,
    },

    {
      type: 'challenge',
      instruction: `Line ℓ passes through point A and point B. Line m also passes through A and B. What can you conclude?`,
      options: [
        { label: 'A', text: 'The lines are parallel.' },
        { label: 'B', text: 'Lines ℓ and m are the same line — Postulate I says there is exactly one line through two given points.' },
        { label: 'C', text: 'The lines intersect at two points.' },
      ],
      check: (l) => l === 'B',
      successMessage: 'Correct. Postulate I: through any two distinct points, there is exactly one straight line. If ℓ and m both pass through A and B, they cannot be different lines — they must be the same line.',
      failMessage: 'Postulate I is decisive here: there is exactly one line through two given points. If two "different" lines both pass through A and B, they are actually the same line, not two.',
      html: '', css: 'body{margin:0}', startCode: '', outputHeight: 260,
    },
  ],
};

export default {
  id: 'geo-1-2',
  slug: 'points-lines-planes',
  chapter: 'geometry-1',
  title: 'Points, Lines, and Planes',
  subtitle: 'The three undefined terms that all of geometry is built on',
  tags: ['geometry', 'points-lines-planes', 'undefined-terms', 'collinear', 'coplanar', 'postulates'],
  hook: {
    question: 'How do you define a "point" — and why does geometry refuse to?',
    realWorldContext: 'Every blueprint, circuit diagram, GPS map, and 3D model begins with points, lines, and planes. But unlike every other concept in geometry, these three cannot be defined — they are the bedrock on which all definitions rest. Euclid spent two thousand years being criticised for this choice. It turned out to be exactly right.',
  },
  intuition: {
    blocks: [

      // ── UNDEFINED TERMS INTRO ──────────────────────────────────────────────
      {
        type: 'prose',
        paragraphs: [
          '**Geometry has three terms it never defines.** In any logical system you must start somewhere — you cannot define every word without falling into an infinite loop (each definition would need more words to define). Geometry accepts three primitive concepts as understood by intuition, calls them **undefined terms**, and builds everything else on top of them.',
          'The three undefined terms are **point**, **line**, and **plane**.',
        ],
      },

      // ── POINT ────────────────────────────────────────────────────────────
      {
        type: 'prose',
        paragraphs: [
          '**A point** is a location in space. It has no size, no length, no width, no height — **zero dimensions**. We draw it as a dot, but the dot is just a visual aid; the actual point has no extent whatsoever. Points are named with capital letters: $A$, $B$, $P$.',
        ],
      },
      {
        type: 'image',
        src: geoPointUrl,
        alt: 'A single purple dot labelled A with annotations: zero dimensions, only a location',
        caption: 'A point: only a position. The dot we draw to represent it is just a convention.',
      },

      // ── LINE ──────────────────────────────────────────────────────────────
      {
        type: 'prose',
        paragraphs: [
          '**A line** is a set of points extending infinitely in both directions along a perfectly straight path. It has length but no width or height — **one dimension**. A line has no endpoints; it continues forever in both directions. Lines are named by any two points on them ($\\overleftrightarrow{BC}$) or by a single lowercase letter ($\\ell$).',
        ],
      },
      {
        type: 'image',
        src: geoLineUrl,
        alt: 'A line with arrows on both ends, two points B and C marked on it, labelled ℓ',
        caption: 'A line: infinite in both directions. The arrows show it never ends.',
      },

      // ── PLANE ────────────────────────────────────────────────────────────
      {
        type: 'prose',
        paragraphs: [
          '**A plane** is a flat surface extending infinitely in all directions. It has length and width but no height — **two dimensions**. Think of an infinite sheet of glass. Planes are named by three non-collinear points on them (plane $PQR$) or by a single script capital ($\\mathcal{P}$).',
        ],
      },
      {
        type: 'image',
        src: geoPlaneUrl,
        alt: 'A parallelogram representing a plane with three labeled points P, Q, R and the plane labeled 𝒫',
        caption: 'A plane: infinite, flat, and two-dimensional. We draw it as a parallelogram to show perspective.',
      },

      // ── POSTULATE: TWO POINTS → ONE LINE ─────────────────────────────────
      {
        type: 'prose',
        paragraphs: [
          '**Key postulates about these terms.** Once we name the undefined terms, we state how they relate — as postulates accepted without proof.',
          '**Postulate I:** Through any two distinct points there is exactly **one** straight line.',
        ],
      },
      {
        type: 'image',
        src: geoTwoPointsUrl,
        alt: 'Left: two points with exactly one line through them. Right: the same two points with rejected tilted lines marked with ✗',
        caption: 'Two points fix one unique line — no other straight line can pass through both.',
      },

      // ── COLLINEAR / COPLANAR ──────────────────────────────────────────────
      {
        type: 'prose',
        paragraphs: [
          '**Collinear and coplanar.** Points are **collinear** if they all lie on a single line. Points are **coplanar** if they all lie in a single plane.',
          '**Three non-collinear points** determine a unique plane — just as two non-coincident points determine a unique line. (Two points are not enough to fix a plane: infinitely many planes contain any single line.)',
        ],
      },
      {
        type: 'image',
        src: geoCollinearUrl,
        alt: 'Left: three collinear points A B C on one line. Right: three non-collinear points P Q R forming a triangle.',
        caption: 'Collinear: all on one line. Non-collinear: they span a triangle — and define a unique plane.',
      },

      // ── SEGMENTS AND RAYS ─────────────────────────────────────────────────
      {
        type: 'prose',
        paragraphs: [
          '**Segments and rays** are defined from the undefined line by adding constraints:',
          'A **line segment** $\\overline{AB}$ is the finite portion of a line between two endpoints $A$ and $B$, including both endpoints. It has a definite length.',
          'A **ray** $\\overrightarrow{AB}$ starts at endpoint $A$, passes through $B$, and continues infinitely in that direction only. It has one endpoint and one infinite end.',
        ],
      },
      {
        type: 'image',
        src: geoSegmentRayUrl,
        alt: 'Three rows: segment AB with two endpoints, ray AB with one endpoint and one arrow, line AB with arrows on both ends',
        caption: 'Segment: finite, two endpoints. Ray: one endpoint, infinite one way. Line: infinite both ways.',
      },

      // ── INTERSECTIONS ─────────────────────────────────────────────────────
      {
        type: 'prose',
        paragraphs: [
          '**Intersections.** When geometric objects share points, they intersect. The type of intersection depends on which objects meet:',
          '— **Two lines** in the same plane: meet at exactly **one point**, or are **parallel** (never meet).',
          '— **Two planes**: intersect in a **full line**, or are **parallel** (never meet).',
          '— **A line and a plane**: the line either **pierces** the plane at one point, lies **inside** it (sharing infinitely many points), or is **parallel** to it (never meets).',
        ],
      },
      {
        type: 'image',
        src: geoIntersectionsUrl,
        alt: 'Diagrams showing two lines meeting at point P, two planes meeting in a line, parallel lines not meeting, and a line piercing a plane at one point',
        caption: 'Every possible intersection type for lines and planes — the cases are exhaustive.',
      },

      // ── SKEW LINES ────────────────────────────────────────────────────────
      {
        type: 'prose',
        paragraphs: [
          '**Skew lines** exist only in three dimensions. Two lines are skew if they are **not parallel** and **do not intersect** — they simply pass each other in different planes. In 2D this is impossible: two non-parallel lines in the same plane must cross. In 3D, they can miss each other completely.',
          'Picture the top edge of a box and the front-right vertical edge. They never meet and point in different directions — that is skew.',
        ],
      },
      {
        type: 'image',
        src: geoSkewLinesUrl,
        alt: 'A 3D box with line m along the top back edge (red) and line n along the front right vertical (orange), showing they never meet and are not parallel',
        caption: 'Skew lines m and n: not parallel, do not intersect. They live in different planes. Only possible in 3D.',
      },

    ],
  },
  mentalModel: [
    'Three undefined terms — point (0D location), line (1D, infinite, straight), plane (2D, infinite, flat) — are the bedrock; everything else is defined from these',
    'Two points → exactly one line (Postulate I). Three non-collinear points → exactly one plane.',
    'Segment = finite, two endpoints. Ray = one endpoint, infinite one way. Line = infinite both ways.',
    'Skew lines: not parallel, do not intersect — only possible in 3D (in 2D, non-parallel lines must cross).',
  ],
  quiz: [
    {
      id: 'q1',
      type: 'choice',
      text: 'A "point" in geometry has zero dimensions. What does that mean practically?',
      options: [
        'It is too small to see with the naked eye',
        'It represents only a location — no size, length, or width',
        'It must be drawn with a dot that has a finite radius',
      ],
      correct: 1,
    },
    {
      id: 'q2',
      type: 'choice',
      text: 'How many distinct points are needed to define exactly one line?',
      options: ['1', '2', '3'],
      correct: 1,
    },
    {
      id: 'q3',
      type: 'choice',
      text: 'Three points are collinear. What is guaranteed?',
      options: [
        'They form a triangle',
        'They all lie on the same single line',
        'They lie in the same plane but not necessarily on one line',
      ],
      correct: 1,
    },
    {
      id: 'q4',
      type: 'choice',
      text: 'How many non-collinear points are required to determine a unique plane?',
      options: ['2', '3', '4'],
      correct: 1,
    },
    {
      id: 'q5',
      type: 'choice',
      text: 'Two distinct planes that are not parallel intersect in what shape?',
      options: ['A single point', 'A line', 'Another plane'],
      correct: 1,
    },
    {
      id: 'q6',
      type: 'choice',
      text: 'A postulate differs from a theorem in that a postulate…',
      options: [
        'Has been proven from simpler statements',
        'Is accepted as true without proof',
        'Only applies in Euclidean geometry',
      ],
      correct: 1,
    },
    {
      id: 'q7',
      type: 'choice',
      text: 'A ray starts at an endpoint and extends forever in one direction. How does it differ from a full line?',
      options: [
        'A ray has finite length',
        'A ray has one endpoint; a line has none',
        'A ray cannot be bisected',
      ],
      correct: 1,
    },
    {
      id: 'q8',
      type: 'choice',
      text: 'If a line intersects a plane and is NOT contained in or parallel to the plane, the intersection is…',
      options: ['A segment', 'A single point', 'A second line'],
      correct: 1,
    },
    {
      id: 'q9',
      type: 'choice',
      text: 'Two lines in the same plane are either parallel or they…',
      options: [
        'Are skew',
        'Intersect at exactly one point',
        'Must be perpendicular',
      ],
      correct: 1,
    },
    {
      id: 'q10',
      type: 'choice',
      text: 'Skew lines are lines that…',
      options: [
        'Are parallel and in different planes',
        'Are not parallel and do not intersect — they lie in different planes',
        'Intersect but are not perpendicular',
      ],
      correct: 1,
    },
  ],
};
