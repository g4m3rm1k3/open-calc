export default {
  id: 'geo-6-2',
  slug: 'circles',
  chapter: 'geometry-6',
  title: 'Circles: Arcs, Chords, and Sectors',
  subtitle: 'How the circle\'s perfect symmetry produces exact formulas for every part of it',
  tags: ['geometry', 'circles', 'arc-length', 'sector-area', 'chord', 'inscribed-angle', 'central-angle'],
  hook: {
    question: 'How much pizza do you get with a 60° slice? And how long is its crust?',
    realWorldContext: 'Arc length and sector area determine the material in a pie slice, the sweep of a windshield wiper, the length of a curved road, and the coverage area of a rotating sprinkler. Every engineering problem involving circular motion comes down to these two formulas.',
  },
  intuition: {
    blocks: [
      {
        type: 'prose',
        paragraphs: [
          '**Circle anatomy.** A circle of radius $r$ has circumference $C = 2\\pi r$ (the total perimeter) and area $A = \\pi r^2$. These formulas are the foundation for every partial-circle calculation.',
          'A **central angle** has its vertex at the center. An **arc** is the portion of the circle between two points — the arc\'s length is proportional to the central angle. A **chord** is a straight-line segment connecting two points on the circle. A **sector** is the "pie slice" region bounded by two radii and an arc.',
        ],
      },
      {
        type: 'prose',
        paragraphs: [
          '**Arc length.** An arc of central angle $\\theta$ (in degrees) is $\\frac{\\theta}{360°}$ of the full circle. Its length is that fraction of the circumference:',
        ],
      },
      {
        type: 'math',
        tex: '\\ell = \\frac{\\theta}{360°} \\times 2\\pi r = \\frac{\\theta \\pi r}{180°}',
        caption: 'Arc length — fraction of circumference. In radians: ℓ = rθ (the cleanest form)',
      },
      {
        type: 'prose',
        paragraphs: [
          '**Sector area.** The sector (pie slice) is the same fraction of the full disk area:',
        ],
      },
      {
        type: 'math',
        tex: 'A_{\\text{sector}} = \\frac{\\theta}{360°} \\times \\pi r^2',
        caption: 'Sector area — fraction of circle area. In radians: A = ½r²θ',
      },
      {
        type: 'prose',
        paragraphs: [
          'In radians, these formulas become $\\ell = r\\theta$ and $A = \\frac{1}{2}r^2\\theta$ — much simpler, which is why radians are the preferred unit in calculus and physics.',
        ],
      },
      {
        type: 'viz',
        id: 'G2_6_ArcSectorPi',
        title: 'Arc Length and Sector Area',
        mathBridge: 'Adjust the central angle from $0°$ to $360°$. The arc length grows proportionally — at $180°$ it is exactly half the circumference, at $360°$ it equals the full circumference. The sector area grows as the square of the angle fraction — watch how $\\frac{1}{2}$ the circle has $\\frac{1}{2}$ the area. Try $\\theta = 60°$: arc $= \\frac{60}{360} \\times 2\\pi r = \\frac{\\pi r}{3}$.',
      },
      {
        type: 'prose',
        paragraphs: [
          '**Central angles and inscribed angles.** The **inscribed angle theorem** is one of the most useful circle theorems: an inscribed angle (vertex ON the circle) is exactly half the central angle that subtends the same arc.',
        ],
      },
      {
        type: 'math',
        tex: '\\text{Inscribed angle} = \\frac{1}{2} \\times \\text{Central angle (same arc)}',
        caption: 'The inscribed angle theorem — any angle inscribed in a semicircle is exactly 90°',
      },
      {
        type: 'prose',
        paragraphs: [
          'A special case: any angle inscribed in a **semicircle** (the arc being a diameter, central angle $180°$) equals $\\frac{1}{2} \\times 180° = 90°$. This is Thales\' Theorem: every angle inscribed in a semicircle is a right angle.',
          '**Chord relationships.** A chord cuts the circle into two arcs. Key theorems:',
          '— **Equal chords subtend equal arcs** (and vice versa).',
          '— **Perpendicular bisector of a chord passes through the center.** This is how you find the center of a circle given three points on it.',
          '— **Two chords that intersect inside a circle:** if chords $AB$ and $CD$ intersect at $P$, then $AP \\cdot PB = CP \\cdot PD$ (the "intersecting chords theorem").',
        ],
      },
      {
        type: 'math',
        tex: 'AP \\cdot PB = CP \\cdot PD',
        caption: 'Intersecting chords — the product of the two segments is equal for both chords',
      },
      {
        type: 'viz',
        id: 'G2_1_CircleTheorems1',
        title: 'Circle Theorems: Central and Inscribed Angles',
        mathBridge: 'Move the inscribed angle vertex around the circle. It always equals half the central angle, regardless of where the vertex is on the circle. Slide the point to the endpoint of the diameter: the inscribed angle becomes exactly 90°, confirming Thales\' Theorem.',
      },
      {
        type: 'viz',
        id: 'G2_2_CircleTheorems2',
        title: 'Circle Theorems: Chords and Tangents',
        mathBridge: 'Drag the two chords inside the circle. The products $AP \\cdot PB$ and $CP \\cdot PD$ are always equal, no matter where you position the chords. This is the intersecting chords theorem in action.',
      },
    ],
  },
  mentalModel: [
    'Arc and sector are the same fraction of the full circle: arc length = (θ/360°)×2πr, sector area = (θ/360°)×πr²',
    'In radians: arc = rθ, sector area = ½r²θ — the natural unit for circle calculations',
    'Inscribed angle theorem: inscribed angle = ½ central angle on the same arc. Inscribed in semicircle = 90° (Thales)',
    'Intersecting chords: AP·PB = CP·PD — the products of each chord\'s two segments are always equal',
  ],
  quiz: [
    {
      id: 'q1',
      type: 'choice',
      text: 'A circle has radius $6$ cm. What is the arc length of a $90°$ sector?',
      options: ['$3\\pi$ cm', '$6\\pi$ cm', '$9\\pi$ cm'],
      correct: 0,
    },
    {
      id: 'q2',
      type: 'choice',
      text: 'A circle has radius $10$ cm. What is the area of a $120°$ sector?',
      options: ['$\\frac{100\\pi}{3}$ cm²', '$40\\pi$ cm²', '$50\\pi$ cm²'],
      correct: 0,
    },
    {
      id: 'q3',
      type: 'choice',
      text: 'An inscribed angle intercepts an arc of $140°$. The inscribed angle measures…',
      options: ['$140°$', '$70°$', '$280°$'],
      correct: 1,
    },
    {
      id: 'q4',
      type: 'choice',
      text: "Thales' Theorem states that any angle inscribed in a semicircle is…",
      options: ['$60°$', '$90°$', '$180°$'],
      correct: 1,
    },
    {
      id: 'q5',
      type: 'choice',
      text: 'Two chords intersect inside a circle. One chord is split into segments $3$ and $8$. The other chord is split into segments $4$ and $x$. What is $x$?',
      options: ['6', '4', '12'],
      correct: 0,
    },
    {
      id: 'q6',
      type: 'choice',
      text: 'Why does the perpendicular bisector of any chord always pass through the center?',
      options: [
        'By convention — it is defined that way',
        'The center is equidistant from all points on the circle, so it lies on the perpendicular bisector of any chord (the set of equidistant points from the chord\'s endpoints)',
        'This is only true for diameters',
      ],
      correct: 1,
    },
    {
      id: 'q7',
      type: 'choice',
      text: 'A central angle of $\\frac{\\pi}{3}$ radians has arc length $r \\cdot \\frac{\\pi}{3}$. If $r = 9$ cm, the arc length is…',
      options: ['$3\\pi$ cm', '$6\\pi$ cm', '$9$ cm'],
      correct: 0,
    },
    {
      id: 'q8',
      type: 'choice',
      text: 'Two arcs in the same circle are equal in length if and only if…',
      options: [
        'Their chords are perpendicular',
        'Their central angles are equal',
        'The arcs both lie in the same semicircle',
      ],
      correct: 1,
    },
    {
      id: 'q9',
      type: 'choice',
      text: 'A windshield wiper of length $40$ cm sweeps through $150°$. What area does it clean?',
      options: ['$\\frac{2000\\pi}{3}$ cm²', '$100\\pi$ cm²', '$\\frac{1000\\pi}{3}$ cm²'],
      correct: 0,
    },
    {
      id: 'q10',
      type: 'choice',
      text: 'The sector area formula $A = \\frac{1}{2}r^2\\theta$ (in radians) resembles the triangle area $\\frac{1}{2}bh$. Why?',
      options: [
        'A sector can be cut and rearranged into a triangle of the same area',
        'As the angle gets very small, the sector becomes a thin triangle with base $r\\theta$ (the arc) and height $r$ — the areas converge',
        'The two formulas are not related',
      ],
      correct: 1,
    },
  ],
};
