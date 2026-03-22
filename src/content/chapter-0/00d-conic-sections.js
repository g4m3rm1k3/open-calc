export default {
  id: 'ch0-conic-sections',
  slug: 'conic-sections',
  chapter: 0,
  order: 0.3,
  title: 'Conic Sections Foundations',
  subtitle: 'Quadratic geometry for algebra fluency and calculus readiness',
  tags: ['conics', 'parabola', 'ellipse', 'hyperbola', 'circle', 'focus-directrix', 'completing the square', 'quadratic forms'],

  hook: {
    question: 'Why do satellites, lenses, and trajectories keep producing the same four curve families?',
    realWorldContext:
      'Conics model orbit paths, optical reflection geometry, and optimization constraints. ' +
      'Calculus keeps returning to these shapes in derivatives, integrals, and coordinate transforms, so conic fluency is a force multiplier.',
    previewVisualizationId: 'FunctionPlotter',
  },

  intuition: {
    prose: [
      'Conic sections are what you get by slicing a cone with a plane: circle, ellipse, parabola, or hyperbola.',
      'Each family has two views: an algebraic quadratic equation and a geometric distance rule. Both matter.',
      'Circle: fixed distance from one center. Ellipse: fixed sum of distances to two foci. Hyperbola: fixed absolute difference of distances to two foci. Parabola: equal distance to focus and directrix.',
      'Completing the square is the decoder that turns expanded equations into standard forms where centers, vertices, and axes are visible.',
      'This is not isolated algebra. Conic structure appears in optimization constraints, implicit differentiation, and substitution patterns in integration.',
    ],
    callouts: [
      {
        type: 'strategy',
        title: 'Conic Identification Workflow',
        body: 'Group x/y terms, complete squares, normalize right side, then read type from signs and denominator structure.',
      },
      {
        type: 'real-world',
        title: 'Parabolic Reflection',
        body: 'Parabolic mirrors send rays from a focus into near-parallel beams. This drives headlight and dish design.',
      },
    ],
    visualizations: [
      { id: 'VideoEmbed', title: "Graphing Ellipses & Circles", props: { url: "https://www.youtube.com/embed/Ux8gEMccP9w" } },
      { id: 'VideoEmbed', title: "Graphing Hyperbolas in Standard Form", props: { url: "https://www.youtube.com/embed/dn1o6lpu_Sk" } },
      { id: 'VideoEmbed', title: "Graphing Parabolas in Standard Form", props: { url: "https://www.youtube.com/embed/icfex6aaWVk" } },
      { id: 'VideoEmbed', title: "Finding Equations of Conics from Given Conditions", props: { url: "https://www.youtube.com/embed/aPo_Hakv36o" } },
    ],
  },

  math: {
    prose: [
      'Circle: (x-h)^2 + (y-k)^2 = r^2.',
      'Parabola (vertical): (x-h)^2 = 4p(y-k), where p controls focal distance and opening direction.',
      'Ellipse: (x-h)^2/a^2 + (y-k)^2/b^2 = 1, with a >= b and c^2 = a^2 - b^2.',
      'Hyperbola: (x-h)^2/a^2 - (y-k)^2/b^2 = 1 (or swapped). Focal relation is c^2 = a^2 + b^2.',
      'General quadratic Ax^2 + Bxy + Cy^2 + Dx + Ey + F = 0 (without rotation details) is often classified by sign pattern after completing squares; for B=0, same-sign squared terms imply ellipse type, opposite-sign imply hyperbola type, one squared variable implies parabola type.',
      'Eccentricity unifies all conics: e=0 circle, 0<e<1 ellipse, e=1 parabola, e>1 hyperbola.',
    ],
    callouts: [
      {
        type: 'definition',
        title: 'Eccentricity',
        body: 'e = distance to focus / distance to directrix. It classifies the conic family and measures deviation from circular behavior.',
      },
      {
        type: 'tip',
        title: 'Complete-Square Pattern',
        body: 'x^2+bx = (x+b/2)^2 - (b/2)^2. Apply separately in x and y groups.',
      },
    ],
    visualizations: [
      { id: 'VideoEmbed', title: "Application of Ellipses", props: { url: "https://www.youtube.com/embed/1Ve7MTeniYs" } },
      { id: 'VideoEmbed', title: "Application of Hyperbolas", props: { url: "https://www.youtube.com/embed/XACQ95mTll0" } },
      { id: 'VideoEmbed', title: "Applications of Parabolas in Standard Form", props: { url: "https://www.youtube.com/embed/tZbrlvcd94E" } },
    ],
  },

  rigor: {
    prose: [
      'Conic classification is really a statement about quadratic forms. After translation (and sometimes rotation), every conic reduces to a canonical sign pattern.',
      'If both squared terms have the same sign, level sets are ellipse-type; with opposite signs, hyperbola-type; with one squared variable, parabola-type.',
      'Focus-directrix definitions can be converted to algebraic forms by equating distances and squaring carefully, giving geometric proofs of standard equations.',
    ],
    callouts: [],
    visualizations: [
      { id: 'VideoEmbed', title: "Rotated Conic Section Identifying & Graphing 4 Examples", props: { url: "https://www.youtube.com/embed/hFtNJQIi--k" } },
    ],
  },

  examples: [
    {
      id: 'ch0-conics-ex1',
      title: 'Classify by Completing the Square',
      problem: 'Classify x^2 - 4x + y^2 + 6y - 12 = 0 and write standard form.',
      steps: [
        { expression: 'x^2-4x + y^2+6y = 12', annotation: 'Move constant to the right.' },
        { expression: '(x-2)^2-4 + (y+3)^2-9 = 12', annotation: 'Complete both squares.' },
        { expression: '(x-2)^2 + (y+3)^2 = 25', annotation: 'Collect constants.' },
      ],
      conclusion: 'Circle with center (2,-3) and radius 5.',
    },
    {
      id: 'ch0-conics-ex2',
      title: 'Parabola from Focus/Directrix',
      problem: 'Find equation of parabola with focus (0,2) and directrix y=-2.',
      steps: [
        { expression: 'sqrt(x^2+(y-2)^2)=|y+2|', annotation: 'Distance to focus equals distance to directrix.' },
        { expression: 'x^2+(y-2)^2=(y+2)^2', annotation: 'Square both sides.' },
        { expression: 'x^2=8y', annotation: 'Simplify to standard parabola form.' },
      ],
      conclusion: 'Parabola opens upward with vertex at (0,0) and p=2.',
    },
  ],

  challenges: [
    {
      id: 'ch0-conics-ch1',
      difficulty: 'easy',
      problem: 'Put x^2 - y^2 - 6x - 4y = 3 into standard form and identify the conic.',
      hint: 'Complete x and y squares separately and keep the minus sign attached to the y-group.',
      walkthrough: [
        { expression: '(x^2-6x) - (y^2+4y)=3', annotation: 'Group terms.' },
        { expression: '(x-3)^2-9 - ((y+2)^2-4)=3', annotation: 'Complete squares.' },
        { expression: '(x-3)^2 - (y+2)^2 = 8', annotation: 'Simplify.' },
      ],
      answer: 'Hyperbola centered at (3,-2).',
    },
    {
      id: 'ch0-conics-ch2',
      difficulty: 'medium',
      problem: 'For ellipse x^2/9 + y^2/4 = 1, find foci and eccentricity.',
      hint: 'Use c^2=a^2-b^2 with a^2=9, b^2=4.',
      walkthrough: [
        { expression: 'a=3, b=2', annotation: 'Read denominators.' },
        { expression: 'c^2=9-4=5 => c=sqrt(5)', annotation: 'Compute focal distance.' },
        { expression: 'foci=(+-sqrt(5),0), e=c/a=sqrt(5)/3', annotation: 'Focus and eccentricity.' },
      ],
      answer: 'Foci (+-sqrt(5),0), eccentricity sqrt(5)/3.',
    },
  ],

  crossRefs: [
    { lessonSlug: 'geometry-review', label: 'Coordinate Geometry Review', context: 'Conics extend line/circle geometry into full quadratic curves.' },
    { lessonSlug: 'completing-the-square', label: 'Completing the Square', context: 'Main algebraic transformation used to identify conic type.' },
    { lessonSlug: 'optimization', label: 'Optimization', context: 'Quadratic and conic structure appears in many constrained optimization setups.' },
  ],

  checkpoints: ['read-intuition', 'read-math', 'read-rigor', 'completed-example-1', 'completed-example-2', 'solved-challenge'],
}
