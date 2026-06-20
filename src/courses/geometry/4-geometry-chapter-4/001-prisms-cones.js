export default {
  id: 'geo-4-1',
  slug: 'prisms-cones',
  chapter: 'geometry-4',
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
