export default {
  id: 'ch6-polar-area-length',
  slug: 'polar-area-length',
  chapter: 6,
  order: 3,
  title: 'Polar Area and Arc Length',
  subtitle: 'Compute area and curve length directly in polar form',
  tags: ['polar', 'area', 'arc length', 'sector', 'integration'],

  hook: {
    question: 'How do you find area when a curve is given as r = f(theta) instead of y = f(x)?',
    realWorldContext:
      'Radar sweeps, antenna lobes, and orbital sectors are naturally modeled in polar form. ' +
      'The polar area and arc-length formulas let you compute real regions and boundaries without converting to Cartesian equations.',
    previewVisualizationId: 'PolarCurve',
  },

  intuition: {
    prose: [
      'In Cartesian form, area comes from thin rectangles. In polar form, area comes from thin sectors.',
      'A thin sector with radius r and angle dtheta has area about (1/2)r^2 dtheta.',
      'Summing those sectors gives A = (1/2) integral r^2 dtheta between the angle bounds.',
      'For arc length, parametrize by theta: x = r cos(theta), y = r sin(theta).',
      'This gives ds = sqrt(r^2 + (dr/dtheta)^2) dtheta, so L = integral sqrt(r^2 + (dr/dtheta)^2) dtheta.',
    ],
    callouts: [
      {
        type: 'warning',
        title: 'Choose Correct Theta Bounds',
        body: 'Most mistakes come from integrating over the wrong angular interval. Sketch first, then integrate.',
      },
    ],
    visualizations: [
      {
        id: 'PolarCurve',
        title: 'Polar Region Builder',
        caption: 'Track how changing theta bounds changes enclosed area.',
      },
    ],
  },

  math: {
    prose: [
      'Polar area formula: A = (1/2) integral from alpha to beta of r(theta)^2 dtheta.',
      'Area between two polar curves r_outer and r_inner on [alpha, beta]:',
      'A = (1/2) integral (r_outer^2 - r_inner^2) dtheta.',
      'Polar arc length on [alpha, beta]:',
      'L = integral sqrt(r(theta)^2 + (r\'(theta))^2) dtheta.',
    ],
    callouts: [
      {
        type: 'formula',
        title: 'Polar Area',
        body: 'A = (1/2)\\int_{alpha}^{beta} r^2 dtheta',
      },
      {
        type: 'formula',
        title: 'Polar Arc Length',
        body: 'L = \\int_{alpha}^{beta} \\sqrt{r^2 + (dr/dtheta)^2} dtheta',
      },
    ],
    visualizations: [],
  },

  rigor: {
    prose: [
      'The area formula follows from the sector area identity A_sector = (1/2)r^2 theta and a Riemann-sum limit.',
      'Arc length follows by writing x(theta), y(theta) and applying the parametric arc-length formula.',
    ],
    callouts: [],
    visualizations: [],
  },

  examples: [
    {
      id: 'ch6-polar-area-length-ex1',
      title: 'Area of One Cardioid',
      problem: 'Find the area enclosed by r = 1 + cos(theta).',
      steps: [
        { expression: 'A = (1/2)\\int_0^{2\\pi} (1+cos(theta))^2 dtheta', annotation: 'Use full sweep 0 to 2pi.' },
        { expression: '= (1/2)\\int_0^{2\\pi} (1 + 2cos(theta) + cos^2(theta)) dtheta', annotation: 'Expand.' },
        { expression: '= (1/2)(2\\pi + 0 + \\pi) = (3\\pi)/2', annotation: 'Over 0 to 2pi, integral cos is 0 and integral cos^2 is pi.' },
      ],
      conclusion: 'Enclosed area is 3pi/2.',
    },
    {
      id: 'ch6-polar-area-length-ex2',
      title: 'Arc Length of a Circle in Polar Form',
      problem: 'Find the arc length of r = a for 0 <= theta <= 2pi.',
      steps: [
        { expression: 'dr/dtheta = 0', annotation: 'Radius is constant.' },
        { expression: 'L = \\int_0^{2\\pi} \\sqrt{a^2 + 0} dtheta = \\int_0^{2\\pi} a dtheta', annotation: 'Apply formula.' },
        { expression: 'L = 2\\pi a', annotation: 'Circumference recovered.' },
      ],
      conclusion: 'Polar arc-length formula matches the known circumference.',
    },
  ],

  challenges: [
    {
      id: 'ch6-polar-area-length-ch1',
      difficulty: 'medium',
      problem: 'Find the area of one petal of r = cos(3theta).',
      hint: 'Use symmetry and integrate over one petal interval where r >= 0.',
      walkthrough: [
        { expression: 'A = (1/2)\\int_{-\\pi/6}^{\\pi/6} cos^2(3theta) dtheta', annotation: 'One petal centered at theta=0.' },
      ],
      answer: 'pi/12',
    },
  ],

  crossRefs: [
    { lessonSlug: 'polar-coordinates', label: 'Polar Coordinates', context: 'Graphing and symmetry are prerequisites for correct bounds.' },
    { lessonSlug: 'parametric-equations', label: 'Parametric Equations', context: 'Polar arc length is parametric arc length with theta as parameter.' },
  ],

  checkpoints: ['read-intuition', 'read-math', 'completed-example-1', 'solved-challenge'],
}
