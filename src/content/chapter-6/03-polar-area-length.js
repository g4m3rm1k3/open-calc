export default {
  id: 'ch6-polar-area-length',
  slug: 'polar-area-length',
  chapter: 6,
  order: 3,
  title: 'Polar Area and Arc Length',
  subtitle: 'Integrate sectors and curved motion directly in theta-space',
  tags: ['polar', 'area', 'arc length', 'sector method', 'cardioid', 'rose curve', 'integration applications'],

  hook: {
    question: 'How do you find area when a curve is given as r = f(theta) instead of y = f(x)?',
    realWorldContext:
      'Radar sweeps, camera fields of view, antenna lobes, orbital sectors, and sound-directivity patterns are naturally modeled in polar form. ' +
      'In all of these, forcing a Cartesian conversion is usually harder and less accurate than integrating directly in polar coordinates. ' +
      'Polar area and arc-length formulas are what make these models actionable in engineering, astronomy, and data visualization.',
    previewVisualizationId: 'PolarCurve',
  },

  intuition: {
    prose: [
      'In Cartesian integration, your tiny area piece is usually a rectangle: height times width. In polar integration, your tiny piece is a sector: radius and angle. That geometry change is the entire story.',
      'A sector of radius r and small angle dtheta has area approximately one-half r squared dtheta. As dtheta shrinks, this approximation becomes exact in the limit, which gives the polar area formula.',
      'So for r = f(theta), the enclosed area from theta = alpha to theta = beta is A = (1/2) integral of r(theta)^2 dtheta. It is the same Riemann-sum idea as before, but now the measure element is dtheta and the local geometry is wedge-shaped.',
      'For area between polar curves, think outer radius minus inner radius at each angle. Since sector area scales with radius squared, the differential area is one-half times outer squared minus inner squared, all times dtheta.',
      'Arc length in polar form comes from parametric motion. Write x(theta)=r cos(theta), y(theta)=r sin(theta). Then speed in theta-space gives ds = sqrt((dx/dtheta)^2 + (dy/dtheta)^2) dtheta, which simplifies to sqrt(r^2 + (dr/dtheta)^2) dtheta.',
      'This formula has a powerful interpretation: the first term r^2 captures angular sweep, and the second term captures radial change. If radius is constant (circle), only angular sweep contributes. If angle is nearly fixed while r changes fast, radial motion dominates length.',
      'In practical modeling, the hardest part is rarely integration itself. It is choosing the correct theta-interval and identifying where curves intersect or where r changes sign. Sketching and symmetry checks are mandatory, not optional.',
    ],
    callouts: [
      {
        type: 'strategy',
        title: 'Three-Step Polar Workflow',
        body: '1) Sketch or sample key angles. 2) Determine exact theta-bounds for one region/petal and use symmetry when possible. 3) Integrate with the correct formula: area uses r^2, length uses r^2 + (dr/dtheta)^2.',
      },
      {
        type: 'warning',
        title: 'Choose Correct Theta Bounds',
        body: 'Most errors come from wrong interval choices, especially for roses and limacons where curves retrace. A correct integral on a wrong interval is still wrong.',
      },
      {
        type: 'real-world',
        title: 'Antenna Design and Sound Pickup',
        body: 'Directional gain patterns are stored as polar functions. Total coverage in a sector is a polar area integral; boundary wiring or beam perimeter estimates are polar arc-length integrals.',
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
      'Polar area of one region traced once on theta in [alpha, beta]: A = (1/2) integral from alpha to beta of r(theta)^2 dtheta.',
      'Area between two curves r_outer and r_inner over a common theta-range: A = (1/2) integral of (r_outer^2 - r_inner^2) dtheta. Always verify which curve is outer on that interval.',
      'If a curve is symmetric, compute one symmetric piece and multiply. This is often the cleanest way to avoid over-counting loops or petals.',
      'Arc length for r=f(theta) on [alpha,beta]: L = integral sqrt(r(theta)^2 + (dr/dtheta)^2) dtheta.',
      'Derivation sketch: x = r cos(theta), y = r sin(theta); differentiate with respect to theta; then combine squared derivatives. Cross terms cancel, leaving r^2 + (dr/dtheta)^2 under the square root.',
      'When intersection angles are needed, solve r1(theta)=r2(theta), then check for additional intersections at the origin caused by zero-radius values occurring at different angles.',
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
      {
        type: 'definition',
        title: 'Single-Tracing Interval',
        body: 'Use theta bounds that trace a region exactly once. Many polar curves are periodic or self-overlapping, so full 0 to 2pi is not always appropriate.',
      },
    ],
    visualizations: [],
  },

  rigor: {
    prose: [
      'The area formula comes from a Riemann-sum of sectors. Partition [alpha,beta] into small angle pieces Delta theta_i. On each, approximate the region with a sector of radius r(theta_i*), area about (1/2)r(theta_i*)^2 Delta theta_i. Summing and taking the limit gives A=(1/2) integral r^2 dtheta.',
      'Arc length is a direct consequence of parametric length: L = integral sqrt((dx/dtheta)^2 + (dy/dtheta)^2) dtheta with x=r cos(theta), y=r sin(theta). After differentiation and simplification, this becomes integral sqrt(r^2 + (dr/dtheta)^2) dtheta.',
      'For area between curves, the integrand outer^2-inner^2 must be nonnegative on the chosen interval. If outer and inner swap roles, split the interval at swap points before integrating.',
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
        { expression: 'A = (1/2)\\int_0^{2\\pi}(1+cos(theta))^2 dtheta', annotation: 'Cardioid is traced exactly once on 0 to 2pi.' },
        { expression: '= (1/2)\\int_0^{2\\pi}(1 + 2cos(theta) + cos^2(theta)) dtheta', annotation: 'Expand the square.' },
        { expression: 'cos^2(theta)=\\frac{1+cos(2theta)}{2}', annotation: 'Use power-reduction to integrate cos squared.' },
        { expression: 'A=(1/2)\\left(2\\pi + 0 + \\pi\\right)=3\\pi/2', annotation: 'Cosine terms average to zero over full period.' },
      ],
      conclusion: 'Enclosed area is 3pi/2.',
    },
    {
      id: 'ch6-polar-area-length-ex2',
      title: 'Area of One Rose Petal',
      problem: 'Find the area of one petal of r = cos(3theta).',
      steps: [
        { expression: 'r=0 when cos(3theta)=0 => theta=\\pm\\pi/6 around the petal centered at 0', annotation: 'One petal is traced on [-pi/6, pi/6].' },
        { expression: 'A_{petal}=(1/2)\\int_{-\\pi/6}^{\\pi/6} cos^2(3theta) dtheta', annotation: 'Apply polar area formula.' },
        { expression: 'Let u=3theta => dtheta=du/3', annotation: 'Simple substitution.' },
        { expression: 'A_{petal}=(1/6)\\int_{-\\pi/2}^{\\pi/2} cos^2(u) du = (1/6)\\cdot(\\pi/2)=\\pi/12', annotation: 'Use symmetry and known integral of cos squared.' },
      ],
      conclusion: 'Area of one petal is pi/12, so total rose area is 3 times this value.',
    },
    {
      id: 'ch6-polar-area-length-ex3',
      title: 'Arc Length of a Circle in Polar Form',
      problem: 'Find the arc length of r = a for 0 <= theta <= 2pi.',
      steps: [
        { expression: 'dr/dtheta = 0', annotation: 'Constant radius.' },
        { expression: 'L=\\int_0^{2\\pi}\\sqrt{a^2+0} dtheta=\\int_0^{2\\pi} a dtheta', annotation: 'Substitute into length formula.' },
        { expression: 'L=2\\pi a', annotation: 'Recovers the circumference formula.' },
      ],
      conclusion: 'The polar arc-length formula is consistent with classical geometry.',
    },
  ],

  challenges: [
    {
      id: 'ch6-polar-area-length-ch1',
      difficulty: 'medium',
      problem: 'Find the area between r=2cos(theta) and r=1 on angles where the circle lies outside the unit circle.',
      hint: 'Solve 2cos(theta)=1 first, then use A=(1/2) integral (r_outer^2-r_inner^2) dtheta on the correct symmetric interval.',
      walkthrough: [
        { expression: '2cos(theta)=1 => theta=\\pm\\pi/3', annotation: 'Intersection angles.' },
        { expression: 'A=(1/2)\\int_{-\\pi/3}^{\\pi/3}((2cos(theta))^2-1^2)dtheta', annotation: 'Outer minus inner squared.' },
      ],
      answer: '2pi/3 + sqrt(3)/2',
    },
  ],

  crossRefs: [
    { lessonSlug: 'polar-coordinates', label: 'Polar Coordinates', context: 'Graphing and symmetry are prerequisites for correct bounds.' },
    { lessonSlug: 'parametric-equations', label: 'Parametric Equations', context: 'Polar arc length is parametric arc length with theta as parameter.' },
    { lessonSlug: 'definite-integral', label: 'Definite Integrals', context: 'Polar formulas are specialized definite-integral setups with geometric measure changes.' },
  ],

  checkpoints: ['read-intuition', 'read-math', 'read-rigor', 'completed-example-1', 'completed-example-2', 'solved-challenge'],
}
