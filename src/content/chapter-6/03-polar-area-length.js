export default {
  id: 'ch6-polar-area-length',
  slug: 'polar-area-length',
  chapter: 6,
  order: 3,
  title: 'Polar Area and Arc Length',
  subtitle: 'Integrate sectors and curved motion directly in theta-space',
  tags: ['polar', 'area', 'arc length', 'sector method', 'cardioid', 'rose curve', 'integration applications'],

  hook: {
    question: 'How do you reliably calculate enclosed areas when a curve is defined as r = f(θ) instead of y = f(x)?',
    realWorldContext:
      'Radar sweeps, camera fields of view, directional antenna lobes, planetary orbital sectors, and sound-directivity microphones are intrinsically modeled in polar form. ' +
      'In these physical spaces, forcing a Cartesian conversion is geometrically unnatural, mathematically difficult, and computationally inefficient compared to integrating directly in polar coordinates. ' +
      'Polar area and arc-length formulas make rotational modeling actionable in fields from wireless communications to deep-space astronomy.',
    previewVisualizationId: 'PolarCurve',
  },

  intuition: {
    prose: [
      'In classical Cartesian integration, your fundamental geometric building block is a rectangle: height times width ($f(x) \\,dx$). In polar integration, your fundamental piece is a wedge-shaped sector: defined by a radius and an angle.',
      'A circular sector of radius $r$ spanned by a tiny angle $d\\theta$ has an area of exactly $\\frac{1}{2} r^2 \\,d\\theta$. As $d\\theta$ shrinks to an infinitesimal width, this discrete approximation becomes mathematically exact, birthing the polar area integral.',
      'Thus, for any boundary curve $r = f(\\theta)$, the total area enclosed between the rays $\\theta = \\alpha$ and $\\theta = \\beta$ is $A = \\frac{1}{2} \\int_\\alpha^\\beta [r(\\theta)]^2 \\,d\\theta$. Same Riemann-sum logic, entirely new geometric primitive.',
      'To find the area trapped between two polar curves, you evaluate the outer radius contribution minus the inner radius contribution at each angle. Because sector area scales quadratically, the differential area is $\\frac{1}{2} (r_{\\text{outer}}^2 - r_{\\text{inner}}^2) \\,d\\theta$.',
      'The arc length of a polar boundary follows directly from parametric motion. If we define $x(\\theta) = r\\cos\\theta$ and $y(\\theta) = r\\sin\\theta$, the classical speed integral $ds = \\sqrt{(dx/d\\theta)^2 + (dy/d\\theta)^2} \\,d\\theta$ simplifies beautifully via trigonometry into $\\sqrt{r^2 + (dr/d\\theta)^2} \\,d\\theta$.',
      'This polar length formula has an incredibly intuitive physical interpretation: the $r^2$ term captures the purely angular sweep (moving along a circle), while the $(dr/d\\theta)^2$ term captures the purely radial stretching. If you walk on a perfect circle, $dr/d\\theta = 0$, and length is just $r\\Delta\\theta$.',
      'In applied problems, integrating is usually trivial. The true difficulty lies in correctly selecting the $\\theta$-interval, predicting where curves self-intersect, and detecting when $r$ passes through the origin. Rough sketching and symmetry checks are absolutely mandatory.',
    ],
    callouts: [
      {
        type: 'strategy',
        title: 'The Three-Step Polar Workflow',
        body: '1) Sketch or plot boundary intersections. 2) Determine the exact $\\theta$-bounds that trace exactly one complete region or petal (using graphical symmetry when possible). 3) Integrate utilizing the formulas: Area requires $r^2$, Length requires $r^2 + (dr/d\\theta)^2$.',
      },
      {
        type: 'warning',
        title: 'Choose Correct Theta Bounds',
        body: 'Most critical errors stem from selecting overlapping intervals, specifically for complex roses and limaçons where curves rapidly retrace themselves. A mathematically flawless integral evaluated over incorrect interval bounds is completely useless.',
      },
      {
        type: 'real-world',
        title: 'Antenna Design and Sound Pickup',
        body: 'Directional transmission gain patterns are computationally stored as polar functions. The total signal footprint is an area integral; the physical perimeter (like boundary wiring) necessitates a polar arc-length integral.',
      },
    ],
    visualizations: [
      {
        id: 'PolarCoordinateMorph',
      },
      {
        id: 'PolarCurve',
        title: 'Polar Region Builder',
        caption: 'Track how intelligently adjusting the $\\theta$ bounds accurately changes the evaluated enclosed area.',
      },
    ],
  },

  math: {
    prose: [
      'The polar area of a continuous region traced exactly once from $\\theta = \\alpha$ to $\\theta = \\beta$ is bounded by $A = \\frac{1}{2} \\int_\\alpha^\\beta [r(\\theta)]^2 \\,d\\theta$.',
      'The area trapped between an outer boundary $r_o$ and an inner boundary $r_i$ over a shared range is $A = \\frac{1}{2} \\int_\\alpha^\\beta \\left([r_o(\\theta)]^2 - [r_i(\\theta)]^2\\right) \\,d\\theta$. Always graph to verify which curve is genuinely exterior.',
      'If an enclosed region exhibits graphical symmetry, it is vastly safer to compute the integral of one symmetric half (or quadrant) and multiply. This avoids hidden domain errors where overlapping loops incorrectly inflate the calculation.',
      'The arc length traced by $r = f(\\theta)$ across $[\\alpha, \\beta]$ is given by $L = \\int_\\alpha^\\beta \\sqrt{r^2 + \\left(\\frac{dr}{d\\theta}\\right)^2} \\,d\\theta$.',
      'To discover intersection limits, first analytically solve $r_1(\\theta) = r_2(\\theta)$. Additionally, you must cross-check for delayed collisions precisely at the origin (the pole), which occur when both equations separately equal zero at completely different angle values.',
    ],
    callouts: [
      {
        type: 'formula',
        title: 'Polar Area',
        body: 'A = \\frac{1}{2}\\int_{\\alpha}^{\\beta} r^2 \\,d\\theta',
      },
      {
        type: 'formula',
        title: 'Polar Arc Length',
        body: 'L = \\int_{\\alpha}^{\\beta} \\sqrt{r^2 + \\left(\\frac{dr}{d\\theta}\\right)^2} \\,d\\theta',
      },
      {
        type: 'definition',
        title: 'Single-Tracing Interval',
        body: 'You must restrict $\\theta$ bounds to trace a given boundary strictly once. Many polar shapes geometrically overlap themselves, so the default $0 \\to 2\\pi$ sweep is frequently disastrous.',
      },
    ],
    visualizations: [],
  },

  rigor: {
    prose: [
      'The foundational area formula is derived via a Riemann-sum of infinitesimal sectors. Partition the angle $[\\alpha, \\beta]$ into granular $\\Delta \\theta_i$ steps. Inside each slice, visually approximate the shape as a discrete circular sector of radius $r(\\theta_i^*)$, yielding area $\\frac{1}{2}[r(\\theta_i^*)]^2 \\Delta \\theta_i$. In the formal limit, this explicitly converges to $A = \\frac{1}{2} \\int r^2 \\,d\\theta$.',
      'The arc length is a geometric manipulation of standard parametric length: $L = \\int \\sqrt{(dx/d\\theta)^2 + (dy/d\\theta)^2} \\,d\\theta$ where $x = r\\cos\\theta$ and $y = r\\sin\\theta$. Differentiating by product rule and expanding completely cancels the cross-terms, factoring precisely into $\\int \\sqrt{r^2 + (dr/d\\theta)^2} \\,d\\theta$.',
      'For compound areas between curves, the internal integrand $(r_{\\text{outer}}^2 - r_{\\text{inner}}^2)$ is strictly constrained to be nonnegative over the chosen integration interval. If the outer and inner geometries physically exchange roles midpoint, the interval MUST be split into disparate integrals.',
    ],
    callouts: [],
    visualizations: [],
  },

  examples: [
    {
      id: 'ch6-polar-area-length-ex1',
      title: 'Area of One Cardioid',
      problem: '\\text{Find the total enclosed area of the standard cardioid } r = 1 + \\cos\\theta.',
      steps: [
        { expression: 'A = \\frac{1}{2}\\int_0^{2\\pi} (1 + \\cos\\theta)^2 \\,d\\theta', annotation: 'The cardioid contour is traced completely and exactly once over [0, 2π].' },
        { expression: '= \\frac{1}{2}\\int_0^{2\\pi} (1 + 2\\cos\\theta + \\cos^2\\theta) \\,d\\theta', annotation: 'Expand the squared binomial.' },
        { expression: '\\cos^2\\theta = \\frac{1 + \\cos(2\\theta)}{2}', annotation: 'You must employ the power-reduction identity to integrate the squared cosine.' },
        { expression: 'A = \\frac{1}{2}\\left( 2\\pi + 0 + \\pi \\right) = \\frac{3\\pi}{2}', annotation: 'Single and double cosine oscillations perfectly average to zero over a full 2π period.' },
      ],
      conclusion: 'The total enclosed area equals 3π/2.',
    },
    {
      id: 'ch6-polar-area-length-ex2',
      title: 'Area of a Single Rose Petal',
      problem: '\\text{Find the cross-sectional area of exactly one petal of the rose curve } r = \\cos(3\\theta).',
      steps: [
        { expression: '\\cos(3\\theta) = 0 \\implies \\theta = \\pm\\frac{\\pi}{6}', annotation: 'Locate the roots closest to the origin to isolate a single continuous petal loop natively centered horizontally.' },
        { expression: 'A_{\\text{petal}} = \\frac{1}{2}\\int_{-\\pi/6}^{\\pi/6} \\cos^2(3\\theta) \\,d\\theta', annotation: 'Construct the direct polar area integral over the identified bounds.' },
        { expression: 'A_{\\text{petal}} = \\frac{1}{6}\\int_{-\\pi/2}^{\\pi/2} \\cos^2(u) \\,du = \\frac{1}{6}\\left(\\frac{\\pi}{2}\\right) = \\frac{\\pi}{12}', annotation: 'Apply u-substitution (u = 3θ) and leverage symmetric geometric properties.' },
      ],
      conclusion: 'The area of a single petal is π/12; consequently, the full 3-petal rose occupies an area of π/4.',
    },
    {
      id: 'ch6-polar-area-length-ex3',
      title: 'Arc Length of a Circle in Polar Form',
      problem: '\\text{Find the boundary arc length of the constant } r = a \\text{ across } 0 \\le \\theta \\le 2\\pi.',
      steps: [
        { expression: '\\frac{dr}{d\\theta} = 0', annotation: 'The derivative of a constant radius is identically zero.' },
        { expression: 'L = \\int_0^{2\\pi} \\sqrt{a^2 + 0} \\,d\\theta = \\int_0^{2\\pi} a \\,d\\theta', annotation: 'Plug into the generalized length formula.' },
        { expression: 'L = 2\\pi a', annotation: 'Integrates natively across the bound limits.' },
      ],
      conclusion: 'As strictly required, the polar calculus arc-length formula gracefully degenerates into the classic Euclidean variable circumference relationship C = 2πr.',
    },
  ],

  challenges: [
    {
      id: 'ch6-polar-area-length-ch1',
      difficulty: 'medium',
      problem: '\\text{Find the area bounded between } r = 2\\cos\\theta \\text{ and } r = 1 \\text{ strictly inside the domain where the offset circle lies exterior to the unit circle.}',
      hint: 'First explicitly solve 2cos(θ) = 1 to map intersections, then evaluate A = (1/2) \\int [O^2 - I^2] dθ on that symmetric interval span.',
      walkthrough: [
        { expression: '2\\cos\\theta = 1 \\implies \\theta = \\pm\\frac{\\pi}{3}', annotation: 'Identify bounding intersection angles.' },
        { expression: 'A = \\frac{1}{2}\\int_{-\\pi/3}^{\\pi/3} \\left( (2\\cos\\theta)^2 - 1^2 \\right) \\,d\\theta', annotation: 'Subtract the interior squared radius from the exterior squared radius.' },
      ],
      answer: '\\frac{2\\pi}{3} + \\frac{\\sqrt{3}}{2}',
    },
  ],

  crossRefs: [
    { lessonSlug: 'polar-coordinates', label: 'Polar Coordinates', context: 'Solid fundamental graphing and axis symmetry tracking are hard prerequisites for identifying correct intersection bounds.' },
    { lessonSlug: 'parametric-equations', label: 'Parametric Equations', context: 'Geometrically, a polar arc length integration is simply parametric arc length evaluated with θ mapped as the independent progression parameter.' },
    { lessonSlug: 'definite-integral', label: 'Definite Integrals', context: 'These advanced polar templates are fundamentally specialized definite-integral setups equipped with rotating geometric measure transformations.' },
  ],

  checkpoints: ['read-intuition', 'read-math', 'read-rigor', 'completed-example-1', 'completed-example-2', 'solved-challenge'],
}
