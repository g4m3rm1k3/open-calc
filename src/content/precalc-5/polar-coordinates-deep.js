export default {
  id: 'ch5-001',
  slug: 'polar-coordinates-deep',
  chapter: 5,
  order: 1,
  title: 'Polar Coordinates: Distance and Direction Instead of Right and Up',
  subtitle: 'Cartesian asks "how far right and up?" — polar asks "how far, and which direction?" Same point, two languages. Choosing the right one makes the math trivial or horrible.',
  tags: ['polar coordinates', 'polar form', 'converting polar rectangular', 'polar equations', 'graphing polar', 'r theta', 'cardioid', 'rose curve', 'limaçon'],
  aliases: 'polar coordinates r theta convert rectangular cartesian graphing polar equations cardioid rose limaçon symmetry radar',

  hook: {
    question: 'A radar operator sees a plane at distance 120 km, bearing 045°. Nobody converts that to $(x, y)$ before plotting — the distance-and-angle description IS the natural language. Why does the choice of coordinate system matter so much?',
    realWorldContext: 'Polar coordinates are native to anything that rotates or radiates outward: radar, sonar, radio antennas, robotic arms, turbines, circular saws. The equation of a circle centred at the origin is $x^2+y^2=r^2$ in Cartesian — complicated. In polar it is simply $r=5$ — trivial. The system whose equations are simplest is the one you should use. Choosing well is an engineering skill, not just a mathematical one.',
    previewVisualizationId: 'PolarConversionViz',
  },

  // ── PILLAR 1: What it IS ───────────────────────────────────────────────────
  intuition: {
    pillar: 1,
    pillarLabel: 'What it IS — two languages for the same point',
    prose: [
      'Every point in the plane has two addresses. The Cartesian address says: walk $x$ units right, then $y$ units up. The polar address says: face angle $\\theta$ from the positive $x$-axis, then walk $r$ units in that direction. Both addresses are complete — they locate the same point. The triangle connecting these two descriptions is an ordinary right triangle, and the conversion formulas are just the sides of that triangle.',
      'The conversion is not a formula to memorise — it is a right triangle to draw. Drop a perpendicular from your point to the $x$-axis. The hypotenuse is $r$ (the polar distance). The horizontal leg is $x$ (= $r\\cos\\theta$ by definition of cosine). The vertical leg is $y$ (= $r\\sin\\theta$ by definition of sine). Going the other way: $r$ is the hypotenuse of that triangle ($r = \\sqrt{x^2+y^2}$ by Pythagoras), and $\\theta$ is the angle at the origin ($\\tan\\theta = y/x$).',
      'A polar address is not unique, which surprises most students. Adding $360°$ to the angle returns to the same point. A negative $r$ means "walk in the opposite direction from $\\theta$." So $(3, 60°)$, $(3, 420°)$, and $(-3, 240°)$ all describe the same point. This non-uniqueness is a feature — it gives flexibility when writing polar equations.',
    ],
    callouts: [
      {
        type: 'insight',
        title: 'The right triangle IS the conversion — nothing to memorise',
        body: '\\text{Draw the point. Drop a perpendicular to the } x\\text{-axis.} \\\\ \\text{Hypotenuse} = r \\quad \\text{Horizontal leg} = x = r\\cos\\theta \\\\ \\text{Vertical leg} = y = r\\sin\\theta \\quad \\text{Angle at origin} = \\theta \\\\ \\text{These are the definitions of sin and cos in a right triangle.}',
      },
      {
        type: 'definition',
        title: 'Conversion formulas — read from the triangle',
        body: 'x = r\\cos\\theta \\qquad y = r\\sin\\theta \\\\ r = \\sqrt{x^2+y^2} \\qquad \\theta = \\arctan(y/x) \\;(\\text{+adjust for quadrant}) \\\\ r^2 = x^2+y^2 \\quad \\leftarrow \\text{ most useful for equation conversion}',
      },
      {
        type: 'warning',
        title: 'Quadrant trap: arctan only covers two quadrants',
        body: '\\arctan(y/x) \\text{ returns values in } (-90°, 90°) \\text{ only.} \\\\ \\text{For QII: } \\theta = \\arctan(y/x) + 180° \\\\ \\text{For QIII: } \\theta = \\arctan(y/x) + 180° \\\\ \\text{For QIV: } \\theta = \\arctan(y/x) + 360° \\text{ (if you want a positive angle)} \\\\ \\text{Rule: always draw the point and check which quadrant it is in.}',
      },
      {
        type: 'definition',
        title: 'Non-uniqueness — one point, many addresses',
        body: '(r, \\theta) = (r, \\theta + 2\\pi k) \\quad k \\in \\mathbb{Z} \\\\ (r, \\theta) = (-r, \\theta + \\pi) \\quad \\text{(negative }r\\text{: go backwards)} \\\\ \\text{The origin:} \\; r = 0 \\text{ for any } \\theta.',
      },
    ],
    visualizations: [
      {
        id: 'PolarConversionViz',
        title: 'Drag the Point — The Triangle Appears',
        mathBridge: 'Drag the point anywhere on the plane. The right triangle appears showing exactly how $r$, $\\theta$, $x$, $y$ relate. The conversion formulas update live.',
        caption: 'The triangle is not an illustration — it IS the conversion formula. There is nothing else going on.',
      },
    ],
  },

  // ── PILLAR 2: Why it's TRUE ────────────────────────────────────────────────
  rigor: {
    pillar: 2,
    pillarLabel: 'Why it\'s TRUE — proving r = 2cosθ is a circle',
    title: 'A polar equation that hides a circle: $r = 2\\cos\\theta$',
    prerequisiteRecap: {
      title: 'What you need to follow this proof',
      items: [
        { concept: 'Completing the square', statement: '$x^2 - 2ax = (x-a)^2 - a^2$. Completing the square converts a quadratic expression to vertex form.', linkedLesson: 'quadratics' },
        { concept: 'Circle equation in Cartesian', statement: '$(x-h)^2 + (y-k)^2 = r^2$ is a circle centred at $(h,k)$ with radius $r$.', linkedLesson: 'graphs-foundations' },
        { concept: 'Conversion substitutions', statement: '$r^2 = x^2+y^2$ and $r\\cos\\theta = x$. These are the only substitutions used below.', linkedLesson: null },
      ],
    },
    proofSteps: [
      {
        expression: 'r = 2\\cos\\theta',
        annotation: 'Start. This could be many shapes. We convert to Cartesian to identify it.',
        geometricAnchor: 'The graph exists — it passes through the origin at $\\theta=90°$ and through $(2,0)$ at $\\theta=0°$. We want to know what curve connects them.',
      },
      {
        expression: 'r \\cdot r = 2\\cos\\theta \\cdot r \\quad \\Rightarrow \\quad r^2 = 2r\\cos\\theta',
        annotation: 'Multiply both sides by $r$. This is the standard trick to create $r^2$ on the left and $r\\cos\\theta$ on the right.',
        geometricAnchor: 'Why multiply by $r$? Because $r^2 = x^2+y^2$ and $r\\cos\\theta = x$ are our substitution targets. We are engineering the equation to match those patterns.',
      },
      {
        expression: 'x^2 + y^2 = 2x',
        annotation: 'Substitute $r^2 = x^2+y^2$ and $r\\cos\\theta = x$. The polar form is gone — we have a Cartesian equation.',
        geometricAnchor: null,
      },
      {
        expression: 'x^2 - 2x + y^2 = 0 \\quad \\Rightarrow \\quad (x^2-2x+1) + y^2 = 1',
        annotation: 'Rearrange and complete the square on $x$. Add 1 to both sides.',
        geometricAnchor: 'Adding 1 to both sides: left side becomes $(x-1)^2$, right side becomes $1$. Completing the square reveals the hidden circle.',
      },
      {
        expression: '(x-1)^2 + y^2 = 1 \\qquad \\blacksquare',
        annotation: 'Circle centred at $(1,0)$ with radius $1$. It passes through the origin (substitute $(0,0)$: $(0-1)^2+0^2 = 1$ ✓).',
        geometricAnchor: 'The polar equation $r = 2\\cos\\theta$ looked arbitrary. It is actually a perfect circle — described from the perspective of a point ON the circle, not the centre.',
      },
    ],
  },

  // ── PILLAR 3: How the algebra CONNECTS ────────────────────────────────────
  math: {
    pillar: 3,
    pillarLabel: 'How the algebra CONNECTS — converting equations step by step',
    prose: [
      'Converting between Cartesian and polar equations uses four substitutions. The trick is recognising which substitution to use at each step — and knowing when to multiply by $r$ to create the right pattern.',
    ],
    annotatedDerivation: {
      title: 'Why the substitution table works — and when to use each entry',
      steps: [
        {
          expression: 'r^2 = x^2+y^2',
          plain: 'This is just the Pythagorean theorem applied to the right triangle. Use this whenever you see $x^2+y^2$ in Cartesian, or $r^2$ in polar.',
          prereq: null,
        },
        {
          expression: 'r\\cos\\theta = x \\quad \\Leftarrow \\quad x = r\\cos\\theta',
          plain: 'From the triangle: horizontal leg = hypotenuse × cosine of angle. Use this whenever you see $x$ in Cartesian, or $r\\cos\\theta$ in polar.',
          prereq: 'This is the definition of cosine: adjacent/hypotenuse. In the right triangle, $\\cos\\theta = x/r$, so $x = r\\cos\\theta$.',
        },
        {
          expression: 'r\\sin\\theta = y \\quad \\Leftarrow \\quad y = r\\sin\\theta',
          plain: 'Same idea for the vertical leg. Use whenever you see $y$ in Cartesian, or $r\\sin\\theta$ in polar.',
          prereq: null,
        },
        {
          expression: '\\text{The "multiply by }r\\text{" trick:}',
          plain: 'If you see $\\cos\\theta$ alone (not $r\\cos\\theta$), multiply both sides by $r$ to create $r\\cos\\theta = x$. This is the move that converts $r = 2\\cos\\theta$ into $r^2 = 2r\\cos\\theta$.',
          prereq: 'You are multiplying both sides by the same thing ($r$), which is valid as long as $r \\neq 0$ (the origin is checked separately).',
        },
      ],
      summary: 'Converting polar to Cartesian: replace $r^2 \\to x^2+y^2$, $r\\cos\\theta \\to x$, $r\\sin\\theta \\to y$. If you have $\\cos\\theta$ alone, multiply by $r$ first. Converting Cartesian to polar: replace $x \\to r\\cos\\theta$, $y \\to r\\sin\\theta$, $x^2+y^2 \\to r^2$.',
    },
    callouts: [
      {
        type: 'proof-map',
        title: 'Common polar curves and why they have those shapes',
        body: 'r = a: \\text{ every point distance }a\\text{ from origin} \\Rightarrow \\text{circle} \\\\ r = a\\cos\\theta: \\text{ circle through origin (just proved)} \\\\ r = a(1+\\cos\\theta): \\text{ cardioid — heart shape, }r=0\\text{ at }\\theta=180° \\\\ r = a\\cos(n\\theta): \\text{ rose — }n\\text{ petals (odd)}\\text{ or }2n\\text{ petals (even)}',
      },
      {
        type: 'warning',
        title: 'When to use polar vs Cartesian',
        body: '\\text{Use polar when the problem involves:} \\\\ \\bullet \\text{ circles centred at the origin} \\\\ \\bullet \\text{ distance from the origin (radars, waves, lenses)} \\\\ \\bullet \\text{ angular symmetry (roses, spirals, cardioids)} \\\\ \\text{Use Cartesian for lines, parabolas, anything with a clear x/y structure.}',
      },
    ],
    visualizations: [
      {
        id: 'PolarConversionViz',
        title: 'Switch to Polar Curves Mode — See Many Equations',
        mathBridge: 'Select different equations. Watch the curve trace as θ sweeps 0 to 2π. Pause and observe what $r$ is doing at each angle — the curve shape follows directly from how $r$ changes.',
        caption: 'Each curve shape is a consequence of the equation, not a coincidence. Trace slowly to see why.',
      },
    ],
  },

  // ── PILLAR 4: A different ANALOGY ─────────────────────────────────────────
  analogy: {
    pillar: 4,
    pillarLabel: 'A different lens — radar and navigation',
    title: 'Why engineers and navigators think in polar naturally',
    prose: [
      'Radar returns an echo with a time (which gives distance $r$) and a direction (which gives angle $\\theta$). The natural output is $(r, \\theta)$. Converting to $(x, y)$ for plotting would require a trigonometric computation for every single detected object — wasteful and error-prone. Polar coordinates are the native representation.',
      'Wind direction is always given as a bearing (degrees from north) and speed. Navigational charts show distance and bearing from a known point. Sonar maps the seafloor in range and bearing from the ship. All of these are polar systems. Every time you use "distance from here" and "direction from here" to locate something, you are thinking in polar.',
      'The key insight: polar coordinates are the natural choice when the problem has a natural centre (radar antenna, observer, star) and when distance from that centre matters more than position on a grid. Cartesian is natural when horizontal and vertical are the meaningful directions — shelves in a warehouse, streets in a grid city.',
    ],
    callouts: [
      {
        type: 'insight',
        title: 'Converting between representations — a real cost',
        body: '\\text{Every time you convert between polar and Cartesian, you pay:} \\\\ \\text{one square root, one arctangent, two multiplications.} \\\\ \\text{Radar systems processing thousands of objects per second} \\\\ \\text{stay in polar to avoid this cost entirely.} \\\\ \\text{Choosing the right coordinate system is an engineering decision.}',
      },
    ],
  },

  // ── PILLAR 5: PRACTICE ────────────────────────────────────────────────────
  examples: [
    {
      id: 'ch5-001-ex1',
      pillar: 5,
      title: 'Form 1: Point from polar to Cartesian',
      problem: '\\text{Convert } (4, 135°) \\text{ to Cartesian.}',
      steps: [
        {
          expression: 'x = 4\\cos135° = 4\\cdot(-\\tfrac{\\sqrt{2}}{2}) = -2\\sqrt{2} \\approx -2.83',
          annotation: '$\\cos135° = -\\sqrt{2}/2$ (QII, reference angle 45°).',
        },
        {
          expression: 'y = 4\\sin135° = 4\\cdot\\tfrac{\\sqrt{2}}{2} = 2\\sqrt{2} \\approx 2.83',
          annotation: '$\\sin135° = \\sqrt{2}/2$ (positive in QII).',
        },
      ],
      watchFor: 'Always evaluate the trig functions of the exact angle given. $\\cos135° \\neq \\cos45°$ — the signs differ because the quadrant differs.',
    },
    {
      id: 'ch5-001-ex2',
      pillar: 5,
      title: 'Form 2: Point from Cartesian to polar',
      problem: '\\text{Convert } (-3, -3) \\text{ to polar form.}',
      steps: [
        {
          expression: 'r = \\sqrt{9+9} = 3\\sqrt{2}',
          annotation: 'Always positive.',
        },
        {
          expression: '\\arctan(-3/-3) = \\arctan(1) = 45°',
          annotation: 'But the point $(-3,-3)$ is in QIII — arctan gives 45° which is in QI. Wrong quadrant.',
        },
        {
          expression: '\\theta = 45° + 180° = 225°',
          annotation: 'Add 180° to shift into QIII. Always draw the point and check.',
        },
      ],
      watchFor: 'The arctan of $y/x$ does NOT give the correct angle when the point is in QII or QIII. The signs of $x$ and $y$ individually tell you the quadrant — use them to adjust.',
    },
    {
      id: 'ch5-001-ex3',
      pillar: 5,
      title: 'Form 3: Polar equation to Cartesian',
      problem: '\\text{Convert } r = 4\\sin\\theta \\text{ to Cartesian.}',
      steps: [
        {
          expression: 'r \\cdot r = 4\\sin\\theta \\cdot r \\quad \\Rightarrow \\quad r^2 = 4r\\sin\\theta',
          annotation: 'Multiply by $r$ to create $r^2$ and $r\\sin\\theta$.',
        },
        {
          expression: 'x^2+y^2 = 4y \\quad \\Rightarrow \\quad x^2+(y-2)^2 = 4',
          annotation: 'Substitute, then complete the square on $y$. Circle centred at $(0,2)$, radius 2.',
        },
      ],
      watchFor: 'Multiplying by $r$ introduces the solution $r=0$ (the origin). Check whether the origin satisfies the original equation — if not, the multiplication introduced an extraneous point.',
    },
    {
      id: 'ch5-001-ex4',
      pillar: 5,
      title: 'Form 4: Cartesian equation to polar',
      problem: '\\text{Convert } y = 3x + 2 \\text{ to polar form.}',
      steps: [
        {
          expression: 'r\\sin\\theta = 3(r\\cos\\theta) + 2',
          annotation: 'Replace $y \\to r\\sin\\theta$, $x \\to r\\cos\\theta$.',
        },
        {
          expression: 'r\\sin\\theta - 3r\\cos\\theta = 2 \\quad \\Rightarrow \\quad r(\\sin\\theta - 3\\cos\\theta) = 2',
          annotation: 'Factor out $r$.',
        },
        {
          expression: 'r = \\frac{2}{\\sin\\theta - 3\\cos\\theta}',
          annotation: 'Solve for $r$. This is the polar form of a straight line not through the origin.',
        },
      ],
      watchFor: 'Straight lines not through the origin have messy polar equations. Straight lines through the origin are just $\\theta = \\text{constant}$ — much cleaner.',
    },
  ],

  challenges: [
    {
      id: 'ch5-001-ch1',
      difficulty: 'medium',
      problem: '\\text{Prove that } r = \\sin\\theta + \\cos\\theta \\text{ is a circle. Find its centre and radius.}',
      hint: 'Multiply by $r$, substitute, then complete the square on both $x$ and $y$.',
      watchFor: 'You need to complete the square twice — once for $x$ and once for $y$.',
      walkthrough: [
        { expression: 'r^2 = r\\sin\\theta + r\\cos\\theta \\Rightarrow x^2+y^2 = y+x', annotation: 'Multiply by $r$, substitute.' },
        { expression: '(x-\\tfrac{1}{2})^2 + (y-\\tfrac{1}{2})^2 = \\tfrac{1}{2}', annotation: 'Complete the square on both variables.' },
      ],
      answer: '\\text{Circle, centre }(\\tfrac{1}{2},\\tfrac{1}{2}), \\text{ radius }\\tfrac{\\sqrt{2}}{2}',
    },
  ],

  calcBridge: {
    teaser: 'In calculus, polar coordinates simplify area and arc length integrals for curves with radial symmetry. Area enclosed by a polar curve from $\\theta_1$ to $\\theta_2$: $A = \\frac{1}{2}\\int_{\\theta_1}^{\\theta_2} r^2\\,d\\theta$ — comes from summing thin triangular sectors. In multivariable calculus, polar (and its 3D version, cylindrical coordinates) transforms integrals over circular regions from $dA = dx\\,dy$ to $dA = r\\,dr\\,d\\theta$, often converting a hard integral into an easy one.',
    linkedLessons: ['complex-polar-demoivre', 'trig-ratios-right-triangles'],
  },
}
