export default {
  id: 'ch3-trig-000',
  slug: 'angles-foundations',
  chapter: 'precalc-3',
  order: 1,
  title: 'Angles: The Foundation of Trigonometry',
  subtitle: 'What an angle actually is, how we measure it two different ways, and why radians are the natural choice for calculus',
  tags: ['angles', 'degrees', 'radians', 'complementary', 'supplementary', 'acute', 'obtuse', 'reflex', 'angle measurement'],
  aliases: 'angle degree radian convert complementary supplementary vertical acute right obtuse straight reflex degrees minutes seconds arc length',

  hook: {
    question: 'Degrees are completely arbitrary — someone decided a full turn is 360, and that number stuck for thousands of years. Radians are different. They are the only angle measure that makes calculus formulas simple. Why?',
    realWorldContext: 'The Babylonians chose 360 for a full circle around 2000 BCE, probably because 360 has many divisors and approximates the days in a year. Radians were not formalised until the 19th century — but they are the reason $\\frac{d}{dx}\\sin x = \\cos x$ holds without any ugly constants. In engineering, rotational speed in radians per second connects directly to frequency in a way degrees cannot.',
    previewVisualizationId: 'AngleMeasurementViz',
  },

  intuition: {
    prose: [
      'An angle is formed by two rays sharing a common endpoint called the vertex. The angle measures the rotation from one ray (the initial side) to the other (the terminal side). Direction matters: counterclockwise is positive by convention, clockwise is negative.',
      'Degrees divide a full rotation into 360 equal parts. This is arbitrary but convenient — 360 is divisible by 2, 3, 4, 5, 6, 8, 9, 10, 12, 15, 18, 20, 24, 30, 36, 40, 45, 60, 72, 90, 120, 180. Almost any fraction of a circle comes out to a whole number of degrees.',
      'Radians measure angles by arc length. One radian is the angle subtended by an arc equal in length to the radius. Since the circumference is $2\\pi r$, a full circle subtends $2\\pi$ radians. This is not a convention — it follows directly from the definition of $\\pi$. Radians are dimensionless: they are a ratio of lengths.',
      'The calculus reason radians win: $\\lim_{\\theta \\to 0} \\frac{\\sin\\theta}{\\theta} = 1$ only when $\\theta$ is in radians. This limit is the foundation of every trig derivative. In degrees, the limit gives $\\pi/180$ instead — a constant that would infect every derivative formula forever.',
    ],
    callouts: [
      {
        type: 'definition',
        title: 'Angle classification by size',
        body: '\\text{Acute: } 0° < \\theta < 90° \\qquad \\text{Right: } \\theta = 90° \\\\ \\text{Obtuse: } 90° < \\theta < 180° \\qquad \\text{Straight: } \\theta = 180° \\\\ \\text{Reflex: } 180° < \\theta < 360° \\qquad \\text{Full: } \\theta = 360°',
      },
      {
        type: 'definition',
        title: 'Angle pair relationships',
        body: '\\text{Complementary: sum} = 90° \\qquad \\text{Supplementary: sum} = 180° \\\\ \\text{Vertical angles: opposite angles when two lines cross — always equal} \\\\ \\text{Co-interior (same-side): sum} = 180° \\text{ when lines are parallel}',
      },
      {
        type: 'insight',
        title: 'Why the radian is natural',
        body: 's = r\\theta \\quad (\\theta \\text{ in radians}) \\\\ \\text{Arc length} = \\text{radius} \\times \\text{angle. No conversion factor needed.} \\\\ \\text{In degrees: } s = \\frac{\\pi r \\theta}{180} \\text{ — that } \\pi/180 \\text{ never goes away.}',
      },
      {
        type: 'theorem',
        title: 'Degree ↔ Radian conversion',
        body: '\\theta_{\\text{rad}} = \\theta_{\\deg} \\times \\frac{\\pi}{180} \\qquad \\theta_{\\deg} = \\theta_{\\text{rad}} \\times \\frac{180}{\\pi} \\\\ \\text{Key values: } 30° = \\frac{\\pi}{6}, \\; 45° = \\frac{\\pi}{4}, \\; 60° = \\frac{\\pi}{3}, \\; 90° = \\frac{\\pi}{2}, \\; 180° = \\pi',
      },
    ],
    visualizations: [
      {
        id: 'AngleMeasurementViz',
        title: 'Angle Measurement — Degrees and Radians Live',
        mathBridge: 'Drag the angle. Watch degrees and radians update simultaneously. See the arc length change as you move — the radian is literally defined by that arc.',
        caption: 'One radian is the angle where the arc length equals the radius. Drag to feel it.',
      },
            { id: 'VideoCarousel', title: 'Introduction to Angles', props: { videos: [
          { url: "", title: 'TR-01 — Introduction to Angles' },
          { url: "", title: 'TR-02 — Types of Angles' },
          { url: "", title: 'TR-03 — Angle Relationships' },
        ]},
      },
      { id: 'VideoCarousel', title: 'Angle Measurement in Degrees', props: { videos: [
          { url: "", title: 'TR-04 — Angle Measurement in Degrees' },
          { url: "", title: 'TR-04Z — Degrees, Minutes & Seconds' },
        ]},
      },
      { id: 'VideoCarousel', title: 'Introduction to Radians', props: { videos: [
          { url: "", title: 'TR-05 — Introduction to Radians' },
          { url: "", title: 'TR-06 — Angle Measurement in Radians' },
        ]},
      },
    ],
  },

  math: {
    prose: [
      'Degrees-minutes-seconds (DMS) notation subdivides degrees the same way hours subdivide time: $1° = 60^\\prime$ (arcminutes) and $1^\\prime = 60^{\\prime\\prime}$ (arcseconds). GPS coordinates use decimal degrees; astronomical measurements often use DMS. Converting: $37°22^\\prime 48^{\\prime\\prime} = 37 + 22/60 + 48/3600 = 37.38°$.',
      'An angle in standard position has its vertex at the origin and its initial side along the positive $x$-axis. The terminal side determines the angle. Coterminal angles have the same terminal side but differ by full rotations: $\\theta$ and $\\theta + 360°k$ (or $\\theta + 2\\pi k$) are coterminal for any integer $k$.',
      'The arc length formula $s = r\\theta$ (radians) and area of a sector $A = \\frac{1}{2}r^2\\theta$ (radians) are direct consequences of the radian definition. These formulas are used constantly in physics and engineering — rotational kinetic energy, moment of inertia, angular velocity.',
    ],
    callouts: [
      {
        type: 'definition',
        title: 'Standard position and coterminal angles',
        body: '\\text{Standard position: vertex at origin, initial side along positive }x\\text{-axis} \\\\ \\text{Coterminal: } \\theta + 360°k \\text{ or } \\theta + 2\\pi k \\text{ for any integer } k \\\\ \\text{e.g. } 390°, 30°, -330° \\text{ are all coterminal}',
      },
      {
        type: 'theorem',
        title: 'Arc length and sector area (radians only)',
        body: 's = r\\theta \\qquad A = \\tfrac{1}{2}r^2\\theta \\qquad (\\theta \\text{ must be in radians}) \\\\ \\text{Angular velocity: } \\omega = \\frac{\\theta}{t} \\text{ rad/s} \\qquad \\text{Linear speed: } v = r\\omega',
      },
      {
        type: 'warning',
        title: 'The most common radian error',
        body: 's = r\\theta \\text{ requires } \\theta \\text{ in radians — not degrees.} \\\\ \\text{An arc of a circle with } r=5, \\theta=60°: \\\\ \\text{Wrong: } s = 5 \\times 60 = 300 \\qquad \\text{Right: } s = 5 \\times \\frac{\\pi}{3} \\approx 5.24',
      },
    ],
  },

  rigor: {
    title: 'Why $\\lim_{\\theta \\to 0} \\sin\\theta/\\theta = 1$ requires radians — a geometric proof',
    visualizationId: 'AngleMeasurementViz',
    proofSteps: [
      {
        expression: '\\text{Consider a unit circle. Small angle } \\theta > 0 \\text{ (radians).}',
        annotation: 'We compare three areas: triangle OAB, circular sector OAB, and triangle OAT where T is on the tangent.',
      },
      {
        expression: '\\text{Area}(\\triangle OAB) = \\tfrac{1}{2}\\sin\\theta \\leq \\text{Area(sector)} = \\tfrac{1}{2}\\theta \\leq \\text{Area}(\\triangle OAT) = \\tfrac{1}{2}\\tan\\theta',
        annotation: 'The sector is sandwiched between the two triangles. All areas use the unit circle ($r=1$), so the arc length of the sector equals $\\theta$ exactly (radian definition).',
      },
      {
        expression: '\\sin\\theta \\leq \\theta \\leq \\tan\\theta',
        annotation: 'Multiply through by 2. Valid for small positive $\\theta$.',
      },
      {
        expression: '1 \\leq \\frac{\\theta}{\\sin\\theta} \\leq \\frac{1}{\\cos\\theta}',
        annotation: 'Divide by $\\sin\\theta > 0$.',
      },
      {
        expression: '\\cos\\theta \\leq \\frac{\\sin\\theta}{\\theta} \\leq 1',
        annotation: 'Take reciprocals (reversing inequalities). As $\\theta \\to 0$, $\\cos\\theta \\to 1$.',
      },
      {
        expression: '\\lim_{\\theta \\to 0} \\frac{\\sin\\theta}{\\theta} = 1 \\qquad \\blacksquare',
        annotation: 'Squeeze theorem: both bounds go to 1, so the middle does too. If $\\theta$ were in degrees, the arc length would be $\\pi\\theta/180$, giving limit $\\pi/180$ — polluting every calculus formula that follows.',
      },
    ],
  },

  examples: [
    {
      id: 'ch3-trig-000-ex1',
      title: 'Converting between degrees and radians',
      problem: '\\text{Convert: (a) } 135° \\text{ to radians, (b) } \\frac{7\\pi}{4} \\text{ to degrees.}',
      steps: [
        {
          expression: '135° \\times \\frac{\\pi}{180} = \\frac{135\\pi}{180} = \\frac{3\\pi}{4}',
          annotation: 'Multiply by $\\pi/180$. Simplify the fraction: $\\gcd(135,180)=45$, so $135/180 = 3/4$.',
        },
        {
          expression: '\\frac{7\\pi}{4} \\times \\frac{180}{\\pi} = \\frac{7 \\times 180}{4} = \\frac{1260}{4} = 315°',
          annotation: 'Multiply by $180/\\pi$. The $\\pi$ cancels.',
        },
      ],
      conclusion: '$\\pi$ always cancels in radian-to-degree conversion. If it does not cancel cleanly, leave the answer in terms of $\\pi$.',
    },
    {
      id: 'ch3-trig-000-ex2',
      title: 'Arc length and sector area',
      problem: '\\text{A circle has radius 8 cm. Find (a) the arc length and (b) sector area for a central angle of } 150°.',
      steps: [
        {
          expression: '150° = 150 \\times \\frac{\\pi}{180} = \\frac{5\\pi}{6} \\text{ rad}',
          annotation: 'Convert to radians first — the formulas require it.',
        },
        {
          expression: 's = r\\theta = 8 \\times \\frac{5\\pi}{6} = \\frac{40\\pi}{6} = \\frac{20\\pi}{3} \\approx 20.9 \\text{ cm}',
          annotation: 'Arc length formula.',
        },
        {
          expression: 'A = \\tfrac{1}{2}r^2\\theta = \\tfrac{1}{2}(64)\\cdot\\frac{5\\pi}{6} = \\frac{320\\pi}{12} = \\frac{80\\pi}{3} \\approx 83.8 \\text{ cm}^2',
          annotation: 'Sector area formula.',
        },
      ],
      conclusion: 'Both formulas are clean in radians. In degrees they would each need a $\\pi/180$ factor — one more reason radians are the natural choice.',
    },
    {
      id: 'ch3-trig-000-ex3',
      title: 'Finding coterminal angles',
      problem: '\\text{Find a positive and a negative angle coterminal with } \\frac{2\\pi}{3}.',
      steps: [
        {
          expression: '\\frac{2\\pi}{3} + 2\\pi = \\frac{2\\pi}{3} + \\frac{6\\pi}{3} = \\frac{8\\pi}{3}',
          annotation: 'Add one full rotation for a positive coterminal angle.',
        },
        {
          expression: '\\frac{2\\pi}{3} - 2\\pi = \\frac{2\\pi}{3} - \\frac{6\\pi}{3} = -\\frac{4\\pi}{3}',
          annotation: 'Subtract one full rotation for a negative coterminal angle.',
        },
      ],
      conclusion: 'Infinitely many coterminal angles exist. The one in $[0, 2\\pi)$ is the "principal" representative. To find it, add or subtract $2\\pi$ repeatedly until the result lands in range.',
    },
  ],

  challenges: [
    {
      id: 'ch3-trig-000-ch1',
      difficulty: 'medium',
      problem: '\\text{A wheel of radius 30 cm rotates at 120 rpm. Find the linear speed of a point on the rim in m/s.}',
      hint: 'Convert rpm to radians per second first: 1 revolution = $2\\pi$ rad.',
      walkthrough: [
        {
          expression: '\\omega = 120 \\times 2\\pi = 240\\pi \\text{ rad/min} = \\frac{240\\pi}{60} = 4\\pi \\text{ rad/s}',
          annotation: 'Angular velocity in rad/s.',
        },
        {
          expression: 'v = r\\omega = 0.30 \\times 4\\pi = 1.2\\pi \\approx 3.77 \\text{ m/s}',
          annotation: 'Linear speed = radius × angular velocity. Convert radius to metres.',
        },
      ],
      answer: 'v = 1.2\\pi \\approx 3.77 \\text{ m/s}',
    },
    {
      id: 'ch3-trig-000-ch2',
      difficulty: 'hard',
      problem: '\\text{Two supplementary angles are in the ratio } 2:7. \\text{ Find each in degrees and radians.}',
      hint: 'If the angles are $2k$ and $7k$, they sum to $180°$.',
      walkthrough: [
        {
          expression: '2k + 7k = 180° \\Rightarrow 9k = 180° \\Rightarrow k = 20°',
          annotation: 'Set up and solve.',
        },
        {
          expression: '2k = 40° = \\frac{2\\pi}{9} \\text{ rad} \\qquad 7k = 140° = \\frac{7\\pi}{9} \\text{ rad}',
          annotation: 'The two angles, in both units.',
        },
      ],
      answer: '40° \\text{ and } 140°',
    },
  ],

  calcBridge: {
    teaser: 'Every derivative and integral formula for trig functions assumes radians. $\\frac{d}{dx}\\sin x = \\cos x$ is only true in radians. The arc length and sector area formulas from this lesson reappear in calculus when computing arc lengths of curves and areas of polar regions.',
    linkedLessons: ['trig-identities-deep-dive', 'trig-in-calculus'],
  },
}
