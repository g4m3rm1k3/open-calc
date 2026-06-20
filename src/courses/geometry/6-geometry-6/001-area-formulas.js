export default {
  id: 'geo-6-1',
  slug: 'area-formulas',
  chapter: 'geometry-6',
  title: 'Mastering Area Formulas',
  subtitle: 'Every polygon area derives from one idea — and that idea is a rectangle',
  tags: ['geometry', 'area', 'triangle', 'parallelogram', 'trapezoid', 'regular-polygon'],
  hook: {
    question: 'If you only know the area formula for a rectangle, can you derive all the others?',
    realWorldContext: 'Flooring, paint coverage, land surveys, fabric cutting — every area calculation in the real world reduces to a formula. Understanding where these formulas come from (not just memorizing them) means you can never forget them.',
  },
  intuition: {
    blocks: [
      {
        type: 'prose',
        paragraphs: [
          '**All area formulas derive from the rectangle.** A rectangle with width $w$ and height $h$ has area $A = wh$. Every other polygon area formula is obtained by cutting rectangles, rearranging pieces, or comparing to a rectangle. This is not a coincidence — it is the foundational idea behind all area measurement.',
        ],
      },
      {
        type: 'math',
        tex: 'A_{\\text{rectangle}} = w \\times h = bh',
        caption: 'The starting point for all area formulas',
      },
      {
        type: 'prose',
        paragraphs: [
          '**Parallelogram.** A parallelogram has a base $b$ and a height $h$ (the perpendicular distance between the base and the opposite side — NOT the slant side length). If you cut a right triangle from one end and attach it to the other, you get a rectangle of the same base and height. Therefore:',
        ],
      },
      {
        type: 'math',
        tex: 'A_{\\text{parallelogram}} = b \\times h',
        caption: 'Same formula as a rectangle — the slant does not change the area',
      },
      {
        type: 'prose',
        paragraphs: [
          '**Triangle.** A triangle is exactly half a parallelogram. Any triangle can be duplicated and rotated to form a parallelogram with the same base and height. So the triangle\'s area is half the parallelogram\'s:',
        ],
      },
      {
        type: 'math',
        tex: 'A_{\\text{triangle}} = \\frac{1}{2} b h',
        caption: 'Half the parallelogram — and h is always the perpendicular height, never the slant side',
      },
      {
        type: 'viz',
        id: 'G2_5_AreaFormulas',
        title: 'Area Formula Explorer',
        mathBridge: 'Watch the triangle and parallelogram transform. When you duplicate and rotate a triangle, it locks into a parallelogram of equal base and height — that\'s where the $\\frac{1}{2}$ comes from. Try a right triangle, an obtuse triangle, and an acute triangle: all give $\\frac{1}{2}bh$. The formula is blind to the type of triangle.',
      },
      {
        type: 'prose',
        paragraphs: [
          '**Trapezoid.** A trapezoid has two parallel sides (called **bases**) $b_1$ and $b_2$, and a perpendicular height $h$ between them. Duplicate the trapezoid, rotate it $180°$, and attach it to get a parallelogram with base $b_1 + b_2$ and height $h$. The original trapezoid is half that parallelogram:',
        ],
      },
      {
        type: 'math',
        tex: 'A_{\\text{trapezoid}} = \\frac{1}{2}(b_1 + b_2)h',
        caption: 'Average the two bases, multiply by height — or think of it as half a parallelogram',
      },
      {
        type: 'prose',
        paragraphs: [
          'Notice the pattern: the trapezoid formula averages the two bases. A parallelogram is a special trapezoid where $b_1 = b_2 = b$, giving $\\frac{1}{2}(b + b)h = bh$. A triangle is a trapezoid where $b_2 = 0$, giving $\\frac{1}{2}(b + 0)h = \\frac{1}{2}bh$. One formula contains all three.',
          '**Rhombus.** A rhombus (all sides equal) has diagonals $d_1$ and $d_2$ that are perpendicular bisectors of each other. The four triangles formed by the diagonals fill the rhombus exactly — their total area is $4 \\times \\frac{1}{2} \\cdot \\frac{d_1}{2} \\cdot \\frac{d_2}{2} = \\frac{d_1 d_2}{2}$:',
        ],
      },
      {
        type: 'math',
        tex: 'A_{\\text{rhombus}} = \\frac{d_1 \\cdot d_2}{2}',
        caption: 'Half the product of the diagonals — works for any quadrilateral with perpendicular diagonals',
      },
      {
        type: 'prose',
        paragraphs: [
          '**Regular polygon.** A regular polygon with $n$ sides of length $s$ can be divided into $n$ congruent isosceles triangles from the center. The **apothem** $a$ is the perpendicular distance from the center to the midpoint of each side (the height of each triangle). Each triangle has base $s$ and height $a$, so:',
        ],
      },
      {
        type: 'math',
        tex: 'A_{\\text{regular polygon}} = \\frac{1}{2} \\times \\text{perimeter} \\times a = \\frac{1}{2} P a',
        caption: 'n triangles each with area ½·s·a, summed: ½·(ns)·a = ½Pa',
      },
      {
        type: 'prose',
        paragraphs: [
          'As $n \\to \\infty$, the perimeter $P \\to 2\\pi r$ (the circumference) and the apothem $a \\to r$ (the radius), so $A \\to \\frac{1}{2}(2\\pi r)(r) = \\pi r^2$ — the area of a circle. The circle formula is the limit of the polygon formula.',
        ],
      },
    ],
  },
  mentalModel: [
    'All polygon areas derive from the rectangle: parallelogram = rearranged rectangle; triangle = ½ parallelogram; trapezoid = ½(b₁+b₂)h',
    'Height always means perpendicular distance — never the slant side. Wrong height = wrong area.',
    'Regular polygon area = ½ × perimeter × apothem. As n→∞ this becomes πr² (the circle)',
    'The trapezoid formula ½(b₁+b₂)h generalizes: set b₂=0 for a triangle, b₁=b₂=b for a parallelogram',
  ],
  quiz: [
    {
      id: 'q1',
      type: 'choice',
      text: 'A parallelogram has base $10$ cm and slant height $6$ cm. The perpendicular height is $5$ cm. What is its area?',
      options: ['60 cm²', '50 cm²', '30 cm²'],
      correct: 1,
    },
    {
      id: 'q2',
      type: 'choice',
      text: 'Why is the area formula for a parallelogram $bh$ and not $b \\times \\text{slant side}$?',
      options: [
        'Slant side and height are always equal in a parallelogram',
        'Area measures how much flat surface is covered — perpendicular height is the correct dimension, not the slant',
        'The formula was defined that way by convention',
      ],
      correct: 1,
    },
    {
      id: 'q3',
      type: 'choice',
      text: 'A triangle has base $12$ m and height $7$ m. Its area is…',
      options: ['84 m²', '42 m²', '21 m²'],
      correct: 1,
    },
    {
      id: 'q4',
      type: 'choice',
      text: 'A trapezoid has parallel sides of $5$ and $9$ cm, and height $4$ cm. Its area is…',
      options: ['56 cm²', '28 cm²', '36 cm²'],
      correct: 1,
    },
    {
      id: 'q5',
      type: 'choice',
      text: 'The trapezoid area formula $\\frac{1}{2}(b_1 + b_2)h$ reduces to $\\frac{1}{2}bh$ when…',
      options: [
        '$b_1 = b_2$',
        '$b_2 = 0$ (one base shrinks to zero, making it a triangle)',
        '$h = 0$',
      ],
      correct: 1,
    },
    {
      id: 'q6',
      type: 'choice',
      text: 'A rhombus has diagonals of $8$ and $10$ cm. Its area is…',
      options: ['80 cm²', '40 cm²', '18 cm²'],
      correct: 1,
    },
    {
      id: 'q7',
      type: 'choice',
      text: 'The apothem of a regular polygon is…',
      options: [
        'The length of each side',
        'The perpendicular distance from the center to the midpoint of a side',
        'The distance from one vertex to the opposite vertex',
      ],
      correct: 1,
    },
    {
      id: 'q8',
      type: 'choice',
      text: 'A regular hexagon has perimeter $48$ cm and apothem $4\\sqrt{3}$ cm. Its area is…',
      options: ['$96\\sqrt{3}$ cm²', '$48\\sqrt{3}$ cm²', '$192\\sqrt{3}$ cm²'],
      correct: 0,
    },
    {
      id: 'q9',
      type: 'choice',
      text: 'As the number of sides $n$ of a regular polygon increases without bound, its area formula $\\frac{1}{2}Pa$ approaches…',
      options: ['$2\\pi r$', '$\\pi r^2$', '$4\\pi r^2$'],
      correct: 1,
    },
    {
      id: 'q10',
      type: 'choice',
      text: 'A triangle is described as "half a parallelogram." What transformation proves this?',
      options: [
        'Rotating the triangle 180° around the midpoint of one side creates a congruent triangle that together with the original forms a parallelogram',
        'Scaling the triangle by a factor of 2',
        'Reflecting the triangle over its base',
      ],
      correct: 0,
    },
  ],
};
