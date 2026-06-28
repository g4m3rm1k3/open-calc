import geoPythagProofUrl from '../diagrams/calc-geo-pythag-proof.svg?url'
import geoSimilarTriUrl from '../diagrams/calc-geo-similar-tri.svg?url'
import geoCircleAreaUrl from '../diagrams/calc-geo-circle-area.svg?url'

export default {
  id: 'geometry-visual-proofs',
  slug: 'geometry-visual-proofs',
  title: 'Geometry: Seeing Why It\'s True',
  tags: ['geometry', 'proofs', 'visual', 'area', 'circles', 'triangles'],
  chapter: 0,
  order: 8,

  hook: {
    question: 'Why is the area of a circle πr²? Where does that formula actually COME from?',
    context: `Most of us memorize formulas without understanding WHY they work.
      But geometry has something special: many of its deepest truths can be SEEN —
      proofs that need almost no words, just a picture. These are called visual proofs or
      "proof without words." They build genuine understanding, not just formula recall.`,
    realWorld: `Carpenters use triangle similarity. Engineers use the Pythagorean theorem constantly
      — every structural calculation, every circuit board layout. Architects use circle geometry
      in arches and domes. Understanding the WHY means you can adapt formulas you half-remember.`,
  },

  intuition: {
    summary: `Geometric truths can often be proven by rearranging shapes — cutting, rotating,
      and recombining areas. Seeing these manipulations makes the formulas unforgettable.`,
    blocks: [
      { type: "image", src: geoPythagProofUrl, alt: "Pythagorean theorem area rearrangement proof", caption: "Visual proof of a² + b² = c²: rearrange the same four triangles two ways inside an equal square — the remaining areas must be equal." },
      { type: "image", src: geoSimilarTriUrl, alt: "Similar triangles with proportional sides labeled", caption: "Similar triangles have equal angles and proportional sides. If sides scale by k, area scales by k²." },
      { type: "image", src: geoCircleAreaUrl, alt: "Circle unrolled into a rectangle to show area formula", caption: "A circle's area: slice into sectors, rearrange into a near-rectangle with width πr and height r. Area = πr × r = πr²." },
    ],
    perspectives: [
      {
        style: 'visual-proof',
        title: 'Why πr² works: Unrolling a Circle',
        explanation: `Slice a circle into many thin "pizza slices." Rearrange them alternating
          up/down into a shape that approaches a rectangle. The rectangle's width approaches
          half the circumference (πr) and height is r. Area = πr × r = πr². The more slices,
          the more perfect the rectangle.`,
        visualizationId: 'CircleUnrollViz',
      },
      {
        style: 'visual-proof',
        title: 'Pythagorean Theorem: The Square Rearrangement',
        explanation: `Draw a square with side (a+b). Inside it, place 4 right triangles (each with
          legs a and b) in the corners. The shape left in the middle is a square with side c (the hypotenuse).
          Rearrange the triangles differently — two rectangles appear, leaving two squares: a² and b².
          Same big square, same triangles, so: c² = a² + b².`,
        visualizationId: 'PythagoreanViz',
      },
      {
        style: 'visual-proof',
        title: 'Triangle Area: Why ½ base × height',
        explanation: `Any triangle is exactly half a parallelogram. You can always copy the triangle,
          rotate it 180°, and attach it to make a parallelogram. A parallelogram's area is base × height.
          So the triangle is always exactly half: ½ × base × height.`,
        visualizationId: 'TriangleAreaViz',
      },
      {
        style: 'algebraic',
        title: 'Similar Triangles: The Scaling Law',
        explanation: `When you scale a shape by factor k, all lengths multiply by k.
          Areas multiply by k². That's why similar triangles have proportional sides but
          their areas grow as the SQUARE of the scale factor. This underlies all of
          trigonometry and coordinate geometry.`,
      },
    ],
  },

  math: {
    formalDefinition: `Two figures are similar (∼) if one is a scaled, rotated, or reflected version
      of the other — all angles equal, all side ratios equal.`,
    keyFormulas: [
      { name: 'Circle Area', formula: 'A = \\pi r^2' },
      { name: 'Circle Circumference', formula: 'C = 2\\pi r' },
      { name: 'Triangle Area', formula: 'A = \\frac{1}{2} b h' },
      { name: "Heron's Formula", formula: 'A = \\sqrt{s(s-a)(s-b)(s-c)}, \\quad s = \\frac{a+b+c}{2}' },
      { name: 'Pythagorean Theorem', formula: 'a^2 + b^2 = c^2' },
      { name: 'Law of Cosines', formula: 'c^2 = a^2 + b^2 - 2ab\\cos(C)' },
      { name: 'Law of Sines', formula: '\\frac{a}{\\sin A} = \\frac{b}{\\sin B} = \\frac{c}{\\sin C}' },
      { name: 'Similar Triangle Ratio', formula: '\\frac{a_1}{a_2} = \\frac{b_1}{b_2} = \\frac{c_1}{c_2} = k' },
    ],
    theorems: [
      {
        name: 'Thales\' Theorem',
        statement: 'Any angle inscribed in a semicircle is a right angle.',
      },
      {
        name: 'Inscribed Angle Theorem',
        statement: 'An inscribed angle is half the central angle that subtends the same arc.',
      },
      {
        name: 'Exterior Angle Theorem',
        statement: 'An exterior angle of a triangle equals the sum of the two non-adjacent interior angles.',
      },
    ],
  },

  rigor: {
    visualizationId: 'PythagoreanViz',
    title: 'Visual Proof: Pythagorean Theorem',
    proofSteps: [
      { expression: '\\text{Big square side: } (a + b)', annotation: 'Start with a square whose side is a+b.' },
      { expression: '\\text{Total area} = (a+b)^2 = a^2 + 2ab + b^2', annotation: 'Expand: the big square\'s area.' },
      { expression: '\\text{4 triangles area} = 4 \\cdot \\frac{1}{2}ab = 2ab', annotation: 'Four right triangles fill the corners.' },
      { expression: '\\text{Inner square area} = (a+b)^2 - 2ab = a^2 + b^2', annotation: 'Subtract triangles from big square.' },
      { expression: '\\text{But inner square has side } c \\Rightarrow c^2 = a^2 + b^2', annotation: 'The inner square\'s side is the hypotenuse c. QED.' },
    ],
  },

  examples: [
    {
      id: 'ch0-8-ex1',
      title: 'Finding Missing Side with Pythagorean Theorem',
      problem: 'A right triangle has legs 5 and 12. Find the hypotenuse.',
      steps: [
        { expression: 'a^2 + b^2 = c^2', annotation: 'Apply the Pythagorean theorem.' },
        { expression: '5^2 + 12^2 = c^2', annotation: 'Substitute the known legs.' },
        { expression: '25 + 144 = 169 = c^2', annotation: 'Calculate.' },
        { expression: 'c = \\sqrt{169} = 13', annotation: 'This is a classic 5-12-13 Pythagorean triple.' },
      ],
    },
    {
      id: 'ch0-8-ex2',
      title: 'Similar Triangles — Finding Unknown Lengths',
      problem: 'Triangle ABC ~ Triangle DEF. AB=6, BC=8, DE=9. Find EF.',
      steps: [
        { expression: '\\frac{AB}{DE} = \\frac{BC}{EF}', annotation: 'Corresponding sides of similar triangles are proportional.' },
        { expression: '\\frac{6}{9} = \\frac{8}{EF}', annotation: 'Substitute known values.' },
        { expression: 'EF = \\frac{8 \\times 9}{6} = 12', annotation: 'Cross-multiply and solve.' },
      ],
    },
    {
      id: 'ch0-8-ex3',
      title: 'Inscribed Angle',
      problem: 'A central angle subtends an arc of 80°. What is the inscribed angle on the same arc?',
      steps: [
        { expression: '\\text{Inscribed angle} = \\frac{1}{2} \\times \\text{central angle}', annotation: 'Inscribed Angle Theorem.' },
        { expression: '= \\frac{1}{2} \\times 80° = 40°', annotation: 'The inscribed angle is always half the central angle.' },
      ],
    },
  ],

  challenges: [
    {
      id: 'ch0-8-c1',
      difficulty: 'medium',
      problem: 'A square has diagonal length 10. What is its side length and area?',
      hint: 'The diagonal of a square forms a right triangle with two equal legs.',
      walkthrough: [
        { expression: 'd = s\\sqrt{2} \\Rightarrow s = \\frac{d}{\\sqrt{2}}', annotation: 'For a square with side s, diagonal = s√2.' },
        { expression: 's = \\frac{10}{\\sqrt{2}} = 5\\sqrt{2}', annotation: 'Substitute d=10.' },
        { expression: 'A = s^2 = (5\\sqrt{2})^2 = 50', annotation: 'Area is 50 square units.' },
      ],
      answer: 'Side = 5√2 ≈ 7.07 units, Area = 50 square units',
    },
    {
      id: 'ch0-8-c2',
      difficulty: 'hard',
      problem: 'Prove that the three medians of a triangle always meet at one point (the centroid).',
      hint: 'Use vectors or coordinate geometry — place the triangle at convenient coordinates.',
      walkthrough: [
        { expression: 'A=(0,0),\\ B=(2b,0),\\ C=(2c,2d)', annotation: 'Place triangle with convenient coordinates.' },
        { expression: 'M_{AB}=(b,0),\\ M_{BC}=(b+c,d),\\ M_{AC}=(c,d)', annotation: 'Find midpoints of each side.' },
        { expression: 'G = \\left(\\frac{0+2b+2c}{3}, \\frac{0+0+2d}{3}\\right)', annotation: 'Each median\'s 2/3 point gives the same G. All three medians meet there.' },
      ],
      answer: 'The centroid G divides each median in ratio 2:1 from vertex to midpoint.',
    },
  ],
  quiz: [
    {
      id: 'q1',
      type: 'choice',
      text: 'The area formula for a circle A = πr² can be derived by "unrolling" the circle. What does that mean?',
      options: [
        'Cutting the circle into two half-circles and placing them side by side to form a rectangle with sides π and r',
        'Slicing the circle into thin concentric rings, straightening each ring into a thin rectangle of length 2πr, and stacking them — the stack forms a triangle with base 2πr and height r, giving area (1/2)(2πr)(r) = πr²',
        'Drawing a square around the circle and subtracting the four corner regions using the formula for circular segments',
      ],
      correct: 1,
    },
    {
      id: 'q2',
      type: 'choice',
      text: 'The Pythagorean theorem a² + b² = c² is proven by rearranging four copies of the same right triangle. What does this prove?',
      options: [
        'That the sum of the four triangle areas equals the area of the square on the hypotenuse',
        'That the area of the square built on the hypotenuse equals the sum of areas of squares built on the two legs — the same four triangles can be rearranged inside both arrangements, so the remaining areas (the squares) must be equal',
        'That the perimeter of a right triangle is always greater than the hypotenuse alone',
      ],
      correct: 1,
    },
    {
      id: 'q3',
      type: 'choice',
      text: 'Why does the area of a triangle equal (1/2) × base × height?',
      options: [
        'Because a triangle is half as thick as a parallelogram, so its area is halved by default',
        'Any triangle can be completed into a parallelogram by placing an identical copy rotated 180°; the parallelogram has area base × height, so the triangle is exactly half of that',
        'The 1/2 comes from averaging the base and height to get the "average side length" of the triangle',
      ],
      correct: 1,
    },
    {
      id: 'q4',
      type: 'choice',
      text: 'Two triangles are similar. One has a base of 4 and the other has a base of 6. If the first triangle has a height of 3, what is the height of the second?',
      options: [
        '5 — you add 2 to the height because you added 2 to the base',
        '4.5 — corresponding sides are proportional; 6/4 = 1.5, so the height is 3 × 1.5 = 4.5',
        '7 — the height grows by the sum of base and scale factor',
      ],
      correct: 1,
    },
  ],
}
