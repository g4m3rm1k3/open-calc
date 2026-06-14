// FILE: src/content/chapter-6/01-polar-coordinates.js
export default {
  id: 'ch6-polar',
  slug: 'polar-coordinates',
  chapter: 6,
  order: 1,
  title: 'Polar Coordinates',
  subtitle: 'A new coordinate system where distance and angle replace x and y — unlocking curves that Cartesian coordinates make awkward',
  tags: ['polar', 'coordinates', 'cardioid', 'rose curve', 'limaçon', 'spiral', 'lemniscate', 'r theta', 'conversion'],
  aliases: 'r theta graphing polar graph cardioid rose limacon spiral convert to cartesian convert from cartesian',

  hook: {
    question: 'How would you describe the shape of a seashell, a spiral galaxy, or the petals of a flower using y = f(x)? Why does a different coordinate system make these shapes almost trivially simple?',
    realWorldContext: 'Radar screens display targets by distance and angle — that is polar coordinates. Microphone pickup patterns are described as polar curves (cardioid microphones are literally named after the cardioid r = 1 + cos(theta)). Satellite dishes, antenna radiation patterns, and the orbits of planets under gravity are all naturally polar. The Archimedean spiral r = a*theta describes the grooves on a vinyl record, and logarithmic spirals r = ae^(b*theta) appear in nautilus shells, hurricane wind fields, and the arms of spiral galaxies. When the geometry has a natural center and rotational character, polar coordinates are the right language.',
    previewVisualizationId: 'PolarCurve',
  },

  intuition: {
    prose: [
      'Cartesian coordinates describe a point by how far right (x) and how far up (y) it is from the origin. Polar coordinates describe the same point by how far away (r) and at what angle (theta) it is from the origin. Both systems label every point in the plane; neither is "better" in general. But some curves have simple equations in one system and horrific equations in the other. A circle centered at the origin is x^2 + y^2 = a^2 in Cartesian — manageable. In polar it is simply r = a — one symbol. A spiral is nightmarish in Cartesian but trivially r = theta in polar.',
      'The conversion formulas are immediate from trigonometry. If a point is at distance r from the origin at angle theta from the positive x-axis, then its Cartesian coordinates are x = r*cos(theta) and y = r*sin(theta). Going the other way: r = sqrt(x^2 + y^2) and tan(theta) = y/x (with appropriate quadrant adjustments). These are not new — they are the same relationships you used in trigonometry class. The new idea is using (r, theta) as the primary coordinates.',
      'A polar equation r = f(theta) describes a curve by specifying how far from the origin the point is at each angle. To plot it, think of a searchlight beam sweeping counterclockwise: at each angle theta, the curve reaches out to distance f(theta). When f(theta) < 0, the point is plotted in the opposite direction — through the origin and out the other side. This sign convention takes some practice but is essential for understanding curves like rose curves where r alternates sign.',
      'The cardioid r = 1 + cos(theta) is the quintessential polar curve. At theta = 0, r = 2 (farthest from origin). At theta = pi/2, r = 1. At theta = pi, r = 0 (the curve passes through the origin). The shape resembles a heart, hence the name. Cardioid microphones use this pattern because they pick up sound strongly from the front (theta = 0) and reject sound from the rear (theta = pi) — the polar equation directly encodes the sensitivity at each angle.',
      'Rose curves r = cos(n*theta) produce stunning petal patterns. When n is odd, the curve has n petals. When n is even, it has 2n petals. Each petal is traced as theta sweeps through an interval of width pi/n. The petals are equally spaced around the origin, and their tips lie on the circle r = 1. These curves appear in vibration patterns of circular membranes (like drumheads) and in the radiation patterns of phased array antennas.',
      'Limacons r = a + b*cos(theta) generalize the cardioid. When a = b, you get a cardioid. When a > b, the curve is a dimpled or convex limacon (no inner loop). When a < b, the curve has an inner loop — the curve crosses through the origin twice, creating a loop inside the outer boundary. The ratio a/b controls the shape continuously from a circle (a >> b) through a cardioid (a = b) to a looped limacon (a < b).',
      'Symmetry tests simplify graphing. If replacing theta with -theta leaves the equation unchanged, the curve is symmetric about the polar axis (x-axis). If replacing theta with pi - theta leaves it unchanged, the curve is symmetric about the line theta = pi/2 (y-axis). If replacing r with -r leaves it unchanged, the curve is symmetric about the origin. These tests can halve or quarter the work of plotting a polar curve.',
    ],
    callouts: [
      {
        type: 'prior-knowledge',
        title: 'Polar Is Parametric in Disguise',
        body: 'Every polar curve r = f(theta) is a parametric curve with parameter theta: x = f(theta)*cos(theta), y = f(theta)*sin(theta). All the parametric machinery — slopes, arc length, tangent lines — applies directly.',
      },
      {
        type: 'real-world',
        title: 'Cardioid Microphones',
        body: 'A cardioid microphone\'s sensitivity pattern is r = 1 + cos(theta). It picks up maximum sound from the front (r = 2 at theta = 0) and zero sound from the rear (r = 0 at theta = pi). Supercardioid and hypercardioid patterns are other polar curves with tighter forward lobes. Audio engineers choose microphone patterns by reading polar plots.',
      },
      {
        type: 'warning',
        title: 'Negative r Does Not Mean "No Point"',
        body: 'When r = f(theta) gives a negative value, the point is plotted at distance |r| in the direction theta + pi — through the origin. This is why r = cos(2*theta) traces 4 petals even though cos(2*theta) is negative half the time. Ignoring negative r misses half the curve.',
      },
      {
        type: 'tip',
        title: 'Start with a Table',
        body: 'Before sketching any polar curve, evaluate r at theta = 0, pi/6, pi/4, pi/3, pi/2, and so on. Identify where r = 0 (the curve passes through the origin), where r is maximized, and where r becomes negative. Then connect the dots in order of increasing theta.',
      },
      {
        type: 'geometric',
        title: 'The Lemniscate of Bernoulli',
        body: 'The lemniscate r^2 = a^2 cos(2*theta) is the set of points where the product of distances from two foci (at (+-a/sqrt(2), 0)) is constant and equal to a^2/2. In Cartesian form this is (x^2 + y^2)^2 = a^2(x^2 - y^2) — far more complicated. The polar form reveals the symmetry instantly.',
      },
    ],
    visualizations: [
                  { id: 'PolarCurve', title: 'Polar Curve Plotter', caption: 'Enter a polar equation r = f(theta) and watch the curve sweep out as theta increases. Toggle common curves: cardioid, rose, limacon, spiral, lemniscate.' },
    ],
  },

  math: {
    prose: [
      'The relationship between polar and Cartesian coordinates is given by the conversion formulas $x = r\\cos\\theta$, $y = r\\sin\\theta$ and the inverse $r = \\sqrt{x^2 + y^2}$, $\\theta = \\arctan(y/x)$ (with quadrant adjustment). To convert a polar equation to Cartesian, use these substitutions: $r^2 = x^2 + y^2$, $r\\cos\\theta = x$, $r\\sin\\theta = y$. For example, $r = 2\\cos\\theta$ becomes $r^2 = 2r\\cos\\theta$, which is $x^2 + y^2 = 2x$, or $(x-1)^2 + y^2 = 1$ — a circle of radius 1 centered at $(1, 0)$.',
      'The slope of the tangent line to $r = f(\\theta)$ comes from treating the curve parametrically. Since $x = r\\cos\\theta = f(\\theta)\\cos\\theta$ and $y = r\\sin\\theta = f(\\theta)\\sin\\theta$, we get $\\frac{dy}{dx} = \\frac{dy/d\\theta}{dx/d\\theta}$ where $\\frac{dy}{d\\theta} = f\'(\\theta)\\sin\\theta + f(\\theta)\\cos\\theta$ and $\\frac{dx}{d\\theta} = f\'(\\theta)\\cos\\theta - f(\\theta)\\sin\\theta$. This formula handles all polar curves uniformly.',
      'A polar curve passes through the origin when $r = f(\\theta_0) = 0$. At such a point, the tangent line has slope $\\tan(\\theta_0)$ — the tangent line is simply the ray $\\theta = \\theta_0$. This elegant fact simplifies the analysis of curves near the origin. For the rose $r = \\cos(n\\theta)$, the curve passes through the origin when $\\theta = \\frac{\\pi}{2n} + \\frac{k\\pi}{n}$, and the tangent lines at the origin are exactly these rays.',
      'Common polar curves and their equations: Circle centered at origin: $r = a$. Circle through origin: $r = 2a\\cos\\theta$ or $r = 2a\\sin\\theta$. Cardioid: $r = a(1 + \\cos\\theta)$. Rose with $n$ petals (odd $n$) or $2n$ petals (even $n$): $r = a\\cos(n\\theta)$. Archimedean spiral: $r = a\\theta$. Logarithmic spiral: $r = ae^{b\\theta}$. Lemniscate: $r^2 = a^2\\cos(2\\theta)$. Limacon: $r = a + b\\cos\\theta$.',
      'Symmetry tests in polar coordinates: (1) Replace $\\theta$ by $-\\theta$; if the equation is unchanged, the curve is symmetric about the polar axis. (2) Replace $\\theta$ by $\\pi - \\theta$; if unchanged, symmetric about the line $\\theta = \\pi/2$. (3) Replace $r$ by $-r$ (or equivalently $\\theta$ by $\\theta + \\pi$); if unchanged, symmetric about the origin. A curve may have symmetry that none of these tests detect — the tests are sufficient but not necessary.',
    ],
    callouts: [
      {
        type: 'formula',
        title: 'Polar-to-Cartesian Conversion',
        body: '\\[x = r\\cos\\theta, \\quad y = r\\sin\\theta \\qquad r = \\sqrt{x^2+y^2}, \\quad \\tan\\theta = \\frac{y}{x}\\]',
      },
      {
        type: 'formula',
        title: 'Slope of a Polar Curve',
        body: '\\[\\frac{dy}{dx} = \\frac{f\'(\\theta)\\sin\\theta + f(\\theta)\\cos\\theta}{f\'(\\theta)\\cos\\theta - f(\\theta)\\sin\\theta}\\]',
      },
      {
        type: 'theorem',
        title: 'Tangent at the Origin',
        body: 'If $f(\\theta_0) = 0$ and $f\'(\\theta_0) \\neq 0$, the tangent line to $r = f(\\theta)$ at the origin is the line $\\theta = \\theta_0$ (i.e., $y = x\\tan\\theta_0$).',
      },
    ],
    visualizations: [
      {
        id: 'ImplicitDiffProof',
        title: 'Proof: x² + y² = r²  →  dy/dx = −x/y',
        caption: 'In polar coordinates r² = x² + y² is the fundamental conversion. This proof shows what happens when you differentiate that circle implicitly — the slope dy/dx = −x/y is perpendicular to the radius, a fact that polar geometry makes obvious.',
      },
    ],
  },

  rigor: {
    prose: [
      'Polar coordinates are not a bijection between $(r, \\theta)$ and points in $\\mathbb{R}^2$. The origin is represented by $(0, \\theta)$ for every $\\theta$. Each point away from the origin has infinitely many representations: $(r, \\theta)$, $(r, \\theta + 2k\\pi)$ for any integer $k$, and $(-r, \\theta + \\pi + 2k\\pi)$. This non-uniqueness complicates intersection-finding: two polar curves $r = f(\\theta)$ and $r = g(\\theta)$ may intersect at a point represented by different $(r, \\theta)$ values on each curve. The origin is especially treacherous — both curves may pass through the origin at different $\\theta$ values.',
      'To find all intersections of $r = f(\\theta)$ and $r = g(\\theta)$, solve (a) $f(\\theta) = g(\\theta)$ for common parameter values, (b) $f(\\theta) = -g(\\theta + \\pi)$ for points where one curve uses a negative $r$ representation, and (c) check the origin separately by testing whether $f(\\theta_1) = 0$ and $g(\\theta_2) = 0$ for any $\\theta_1, \\theta_2$.',
      'The differentiability of a polar curve at $\\theta_0$ where $f(\\theta_0) = 0$ requires care. The parametric representation is $(f(\\theta)\\cos\\theta, f(\\theta)\\sin\\theta)$, and both components vanish at $\\theta_0$. If $f\'(\\theta_0) \\neq 0$, the parametric velocity vector at $\\theta_0$ is $(f\'(\\theta_0)\\cos\\theta_0, f\'(\\theta_0)\\sin\\theta_0) = f\'(\\theta_0)(\\cos\\theta_0, \\sin\\theta_0)$, which is nonzero. So the curve passes through the origin with a well-defined tangent direction $\\theta_0$.',
    ],
    callouts: [],
    visualizations: [],
  },

  examples: [
    {
      id: 'ch6-polar-ex1',
      title: 'Converting a Circle to Polar',
      problem: '\\text{Convert } (x-2)^2 + y^2 = 4 \\text{ to polar coordinates.}',
      steps: [
        { expression: 'x^2 - 4x + 4 + y^2 = 4', annotation: 'Expand the Cartesian equation.' },
        { expression: 'x^2 + y^2 = 4x', annotation: 'Simplify by canceling the 4 from both sides.' },
        { expression: 'r^2 = 4r\\cos\\theta', annotation: 'Substitute r^2 = x^2 + y^2 and x = r*cos(theta).' },
        { expression: 'r = 4\\cos\\theta', annotation: 'Divide both sides by r (valid for r != 0; r = 0 corresponds to theta = pi/2, which is already on the curve).' },
      ],
      conclusion: 'The circle of radius 2 centered at (2, 0) has the elegant polar equation r = 4cos(theta). It is traced completely as theta goes from 0 to pi. This pattern generalizes: any circle passing through the origin has a simple polar equation.',
    },
    {
      id: 'ch6-polar-ex2',
      title: 'Graphing a Rose Curve',
      problem: '\\text{Sketch } r = \\cos(3\\theta) \\text{ and determine the number of petals.}',
      steps: [
        { expression: 'r = 0 \\Rightarrow \\cos(3\\theta) = 0 \\Rightarrow 3\\theta = \\frac{\\pi}{2} + k\\pi \\Rightarrow \\theta = \\frac{\\pi}{6} + \\frac{k\\pi}{3}', annotation: 'Find where the curve passes through the origin.' },
        { expression: '\\theta = 0: r = 1, \\quad \\theta = \\pi/6: r = 0, \\quad \\theta = \\pi/3: r = -1', annotation: 'Evaluate r at key angles. The negative value at theta = pi/3 places the point in the opposite direction.' },
        { expression: '\\text{First petal: } 0 \\le \\theta \\le \\pi/3, \\quad \\text{peak at } \\theta = 0', annotation: 'The first petal extends along the positive x-axis with maximum r = 1.' },
        { expression: 'n = 3 \\text{ (odd)} \\Rightarrow 3 \\text{ petals}', annotation: 'For r = cos(n*theta) with odd n, there are n petals equally spaced.' },
      ],
      conclusion: 'The rose r = cos(3*theta) has 3 petals, each of length 1, centered at angles 0, 2pi/3, and 4pi/3. The full curve is traced as theta goes from 0 to pi. An even value like r = cos(4*theta) would produce 8 petals.',
    },
    {
      id: 'ch6-polar-ex3',
      title: 'Tangent Line to a Cardioid',
      problem: '\\text{Find the slope of the tangent to } r = 1 + \\cos\\theta \\text{ at } \\theta = \\pi/3.',
      steps: [
        { expression: 'f(\\theta) = 1 + \\cos\\theta, \\quad f\'(\\theta) = -\\sin\\theta', annotation: 'Identify f and its derivative.' },
        { expression: '\\frac{dy}{dx} = \\frac{f\'\\sin\\theta + f\\cos\\theta}{f\'\\cos\\theta - f\\sin\\theta} = \\frac{-\\sin\\theta\\sin\\theta + (1+\\cos\\theta)\\cos\\theta}{-\\sin\\theta\\cos\\theta - (1+\\cos\\theta)\\sin\\theta}', annotation: 'Apply the polar slope formula.' },
        { expression: '\\text{Numerator} = -\\sin^2\\theta + \\cos\\theta + \\cos^2\\theta = \\cos(2\\theta) + \\cos\\theta', annotation: 'Use cos^2 - sin^2 = cos(2theta) and simplify.' },
        { expression: '\\text{Denominator} = -\\sin\\theta\\cos\\theta - \\sin\\theta - \\sin\\theta\\cos\\theta = -\\sin(2\\theta) - \\sin\\theta', annotation: 'Combine like terms using 2sin(theta)cos(theta) = sin(2theta).' },
        { expression: '\\theta = \\pi/3: \\quad \\frac{\\cos(2\\pi/3)+\\cos(\\pi/3)}{-\\sin(2\\pi/3)-\\sin(\\pi/3)} = \\frac{-1/2+1/2}{-\\sqrt{3}/2-\\sqrt{3}/2} = \\frac{0}{-\\sqrt{3}} = 0', annotation: 'Substitute theta = pi/3. The slope is 0 — horizontal tangent.' },
      ],
      conclusion: 'The cardioid r = 1 + cos(theta) has a horizontal tangent at theta = pi/3, where the point is (r, theta) = (3/2, pi/3). The point in Cartesian is (3/4, 3sqrt(3)/4). Horizontal tangents occur where the numerator vanishes and the denominator does not.',
    },
    {
      id: 'ch6-polar-ex4',
      title: 'Identifying a Limacon with Inner Loop',
      problem: '\\text{Sketch } r = 1 + 2\\cos\\theta \\text{ and identify its features.}',
      steps: [
        { expression: 'a = 1,\\; b = 2: \\quad a < b \\Rightarrow \\text{inner loop}', annotation: 'Since a/b = 1/2 < 1, the limacon has an inner loop.' },
        { expression: 'r = 0 \\Rightarrow \\cos\\theta = -1/2 \\Rightarrow \\theta = 2\\pi/3 \\text{ and } 4\\pi/3', annotation: 'The curve passes through the origin at these angles. Between them (2pi/3 < theta < 4pi/3), r < 0 — this traces the inner loop.' },
        { expression: 'r_{\\max} = 1 + 2 = 3 \\text{ at } \\theta = 0', annotation: 'Maximum distance from origin occurs at theta = 0.' },
        { expression: 'r_{\\min} = 1 - 2 = -1 \\text{ at } \\theta = \\pi', annotation: 'At theta = pi, r = -1 (the innermost point of the inner loop, plotted at distance 1 in the direction theta = 0).' },
      ],
      conclusion: 'The limacon r = 1 + 2cos(theta) has an outer loop reaching to r = 3 and an inner loop. The inner loop is traced when r goes negative, between theta = 2pi/3 and 4pi/3. The inner loop\'s tip is at distance 1 from the origin along the positive x-axis.',
    },
  ],

  challenges: [
    {
      id: 'ch6-polar-ch1',
      difficulty: 'hard',
      problem: 'Find all intersection points of r = sin(theta) and r = cos(theta). Be careful — do not miss the origin.',
      hint: 'Set sin(theta) = cos(theta) to find simultaneous solutions. Then check whether both curves pass through the origin (possibly at different theta values).',
      walkthrough: [
        { expression: '\\sin\\theta = \\cos\\theta \\Rightarrow \\tan\\theta = 1 \\Rightarrow \\theta = \\pi/4', annotation: 'Solve for simultaneous solutions. At theta = pi/4, r = sin(pi/4) = sqrt(2)/2.' },
        { expression: '\\text{Point: } (r,\\theta) = (\\sqrt{2}/2,\\; \\pi/4) \\text{ i.e. } (x,y) = (1/2,\\, 1/2)', annotation: 'Convert to Cartesian to confirm.' },
        { expression: 'r = \\sin\\theta = 0 \\text{ at } \\theta = 0; \\quad r = \\cos\\theta = 0 \\text{ at } \\theta = \\pi/2', annotation: 'Both curves pass through the origin, but at different theta values. This intersection is invisible to the algebraic method.' },
      ],
      answer: '\\text{Two intersection points: } (1/2,\\, 1/2) \\text{ and the origin } (0, 0).',
    },
    {
      id: 'ch6-polar-ch2',
      difficulty: 'medium',
      problem: 'Convert the Archimedean spiral r = theta to Cartesian coordinates. Then find the Cartesian distance between the spiral points at theta = pi and theta = 2pi.',
      hint: 'Use x = r*cos(theta), y = r*sin(theta) for each point. The Cartesian equation itself is messy — focus on the two specific points.',
      walkthrough: [
        { expression: '\\theta = \\pi: \\quad r = \\pi, \\; x = \\pi\\cos\\pi = -\\pi, \\; y = \\pi\\sin\\pi = 0', annotation: 'Point at theta = pi is (-pi, 0).' },
        { expression: '\\theta = 2\\pi: \\quad r = 2\\pi, \\; x = 2\\pi\\cos 2\\pi = 2\\pi, \\; y = 2\\pi\\sin 2\\pi = 0', annotation: 'Point at theta = 2pi is (2pi, 0).' },
        { expression: 'd = \\sqrt{(2\\pi - (-\\pi))^2 + 0^2} = 3\\pi', annotation: 'Distance formula.' },
      ],
      answer: 'd = 3\\pi \\approx 9.42',
    },
    {
      id: 'ch6-polar-ch3',
      difficulty: 'medium',
      problem: 'Determine the symmetry of r = sin(2*theta) and count its petals.',
      hint: 'Test replacing theta with -theta, pi - theta, and r with -r. Then evaluate r at several angles to sketch the curve.',
      walkthrough: [
        { expression: 'r(-\\theta) = \\sin(-2\\theta) = -\\sin(2\\theta) = -r(\\theta)', annotation: 'Replacing theta with -theta changes the sign. This means the curve is symmetric about the origin (since (-r, -theta) represents the same point as (r, theta)).' },
        { expression: 'r(\\pi - \\theta) = \\sin(2\\pi - 2\\theta) = -\\sin(2\\theta) = -r(\\theta)', annotation: 'Also gives a symmetry — the curve is symmetric about the y-axis as well.' },
        { expression: 'n = 2 \\text{ (even)} \\Rightarrow 2n = 4 \\text{ petals}', annotation: 'For r = sin(n*theta) with even n, there are 2n petals.' },
      ],
      answer: '\\text{4 petals, symmetric about both axes and the origin.}',
    },
  ],

  crossRefs: [
    { lessonSlug: 'parametric-equations', label: 'Parametric Equations', context: 'Every polar curve is parametric with parameter theta. The parametric derivative formula applies directly.' },
    { lessonSlug: 'polar-area-length', label: 'Polar Area & Arc Length', context: 'The next lesson develops integration in polar coordinates to find areas and lengths of the curves studied here.' },
    { lessonSlug: 'trig-review', label: 'Trigonometry Review', context: 'Polar coordinates rely heavily on trigonometric identities for conversion, simplification, and graphing.' },
  ],

  checkpoints: [
    'read-intuition',
    'read-math',
    'read-rigor',
    'completed-example-1',
    'completed-example-2',
    'completed-example-3',
    'completed-example-4',
    'attempted-challenge-hard',
    'attempted-challenge-medium-1',
    'attempted-challenge-medium-2',
  ],
}
