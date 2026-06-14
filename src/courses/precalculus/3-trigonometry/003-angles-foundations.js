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
      '**Where you are in the story:** You are stepping into Trigonometry fresh from Precalc-2 (Algebra), where you built fluency with functions, equations, and the coordinate plane. Algebra gave you the tools to manipulate symbols; now Trigonometry gives those symbols geometric meaning. Before you can work with sine and cosine, you need to understand what an angle actually is and why mathematicians chose a particular unit to measure it. That gap — between "angles as turns" and "angles as lengths" — is exactly what this lesson fills.',
      'An angle is formed by two rays sharing a common endpoint called the vertex. The angle measures the rotation from one ray (the initial side) to the other (the terminal side). Direction matters: counterclockwise is positive by convention, clockwise is negative.',
      'Degrees divide a full rotation into 360 equal parts. This is arbitrary but convenient — 360 is divisible by 2, 3, 4, 5, 6, 8, 9, 10, 12, 15, 18, 20, 24, 30, 36, 40, 45, 60, 72, 90, 120, 180. Almost any fraction of a circle comes out to a whole number of degrees.',
      'Radians measure angles by arc length. One radian is the angle subtended by an arc equal in length to the radius. Since the circumference is $2\\pi r$, a full circle subtends $2\\pi$ radians. This is not a convention — it follows directly from the definition of $\\pi$. Radians are dimensionless: they are a ratio of lengths.',
      'The calculus reason radians win: $\\lim_{\\theta \\to 0} \\frac{\\sin\\theta}{\\theta} = 1$ only when $\\theta$ is in radians. This limit is the foundation of every trig derivative. In degrees, the limit gives $\\pi/180$ instead — a constant that would infect every derivative formula forever.',
      '**The Cosmic Constant**: While 360 is a human choice (based on the Babylonian calendar), $2\\pi$ is a property of the Universe itself. Radians represent the "True Language" of circles—where the distance traveled along the edge is directly linked to the angle turned at the center.',
      '**Circular Measure**: If you unrolled a circle onto a flat line, the distance you walked would be the "Arc Length." Trigonometry is the study of how that linear walk translates into rotational position. The radian is the only unit that keeps this relationship scale-free.',
      '**Where this is heading:** Now that you understand angle measurement and why radians exist, the next lesson (Triangle Geometry) builds the geometric scaffolding — similar triangles, the Pythagorean theorem, and Thales\' theorem — that makes the trig ratios well-defined. Every trig ratio you will learn is secretly a similar-triangle relationship, and the radian definition you just mastered ensures arc length and sector area formulas work without conversion factors.',
    ],
    callouts: [
      {
        type: 'sequencing',
        title: 'Precalc-3 arc — Lesson 1 of 11',
        body: '← (Precalc-2: Algebra) | **Angles & Radians** | Triangle Geometry →',
      },
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
      {
        type: 'insight',
        title: 'Linguistic Learner: The Language of the Radius',
        body: '\\text{The word "Radian" is a portmanteau of "Radius" and "Angle."} \\\\ \\text{It literally tells you "How many Radii" make up the arc. This makes it a unitless ratio—the pure geometry of rotation.}',
      },
      {
        type: 'insight',
        title: 'Logical Learner: The Cosmic Constant',
        body: '\\text{A circle has no "Human" divisions.} \\\\ \\text{Using } 2\\pi \\text{ instead of } 360 \\text{ removes all arbitrary history and aligns the math with the physical ratio of geometry itself.}',
      },
      {
        type: 'insight',
        title: 'Physical Learner: The Spinning Wheel',
        body: '\\text{In physics, an angle is a "Phase."} \\\\ \\text{Radians connect Linear Speed (m/s) to Angular Velocity (rad/s) with a single factor of } R. \\\\ \\text{Without radians, every physics formula for rotation would require a conversion constant.}',
      },
      {
        type: 'insight',
        title: 'Visual Learner: The Universal Map',
        body: '\\text{The radian is a string equal to the radius, laid along the curve.} \\\\ \\text{Visualizing this "Bendable Ruler" is the key to understanding why } S = R\\theta \\text{ is so elegant. One radius of arc = one radian.}',
      },
    ],
    visualizations: [
      {
        id: 'AngleMeasurementViz',
        title: 'Angle Measurement — Degrees and Radians Live',
        mathBridge: 'Before interacting, notice that the arc on the circle is highlighted alongside the angle indicator. Step 1: Drag the angle slider slowly from 0° to 360° and watch how degrees and radians update simultaneously. Step 2: Pause near 57° (approximately 1 radian) — observe that the arc length at that angle exactly equals the radius of the circle. Step 3: Continue dragging and compare the degree and radian readouts at 90°, 180°, and 270°. The key lesson: the radian is not an arbitrary unit — it is defined by the arc length equaling the radius, making it the natural measure for circular geometry.',
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
      {
        type: 'theorem',
        title: 'The Ratio of Arcs Proof ($s = r\\theta$)',
        body: '\\text{By definition, the circumference of a circle is } 2\\pi r. \\\\ \\text{The arc length proportion is } \\frac{s}{2\\pi r} = \\frac{\\theta}{2\\pi}. \\\\ \\text{Solving for } s \\text{ yields } s = r\\theta. \\\\ \\text{This confirms radians are the proportional unit of rotation.}',
      },
      {
        type: 'theorem',
        title: 'Slicing the Pie Proof ($A = \\frac{1}{2}r^2\\theta$)',
        body: '\\text{The area of a full circle is } \\pi r^2. \\\\ \\text{A sector is a proportional slice of that area: } \\frac{\\text{Area}}{\\pi r^2} = \\frac{\\theta}{2\\pi}. \\\\ \\text{Simplifying gives } \\text{Area} = \\frac{\\pi r^2 \\theta}{2\\pi} = \\frac{1}{2}r^2\\theta.',
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
      {
        expression: '\\text{--- Part II: The Sector Area Proof ---}',
        annotation: 'Let us prove the area formula $A = \\frac{1}{2}r^2\\theta$ using part-to-whole ratios.',
      },
      {
        expression: '\\frac{\\text{Sector Area}}{\\text{Total Circle Area}} = \\frac{\\text{Central Angle}}{\\text{Total Circle Angle}}',
        annotation: 'Step 1: Set up the fundamental proportion of a circle.'
      },
      {
        expression: '\\frac{\\text{Area}}{\\pi r^2} = \\frac{\\theta}{2\\pi}',
        annotation: 'Step 2: Use the radian definition of $2\\pi$ for a full rotation.'
      },
      {
        expression: '\\text{Area} = \\frac{\\pi r^2 \\theta}{2\\pi}',
        annotation: 'Step 3: Multiply both sides by $\\pi r^2$.'
      },
      {
        expression: '\\text{Area} = \\frac{1}{2}r^2\\theta \\qquad \\blacksquare',
        annotation: 'Step 4: Cancel $\\pi$ and simplify. The formula is a direct consequence of the definition of the radian.'
      }
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
          hint: 'Multiply by the conversion factor $\\pi/180$. Cancel the GCD from numerator and denominator to simplify.',
        },
        {
          expression: '\\frac{7\\pi}{4} \\times \\frac{180}{\\pi} = \\frac{7 \\times 180}{4} = \\frac{1260}{4} = 315°',
          annotation: 'Multiply by $180/\\pi$. The $\\pi$ cancels.',
          hint: 'Multiply by $180/\\pi$ to reverse the conversion. The $\\pi$ cancels cleanly whenever the radian measure is a rational multiple of $\\pi$.',
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
          hint: 'Always convert degrees to radians before using $s = r\\theta$ or $A = \\frac{1}{2}r^2\\theta$. These formulas are derived from the radian definition and break if you substitute degrees.',
        },
        {
          expression: 's = r\\theta = 8 \\times \\frac{5\\pi}{6} = \\frac{40\\pi}{6} = \\frac{20\\pi}{3} \\approx 20.9 \\text{ cm}',
          annotation: 'Arc length formula.',
          hint: 'Substitute into $s = r\\theta$ directly. Simplify the fraction by cancelling the common factor of 2.',
        },
        {
          expression: 'A = \\tfrac{1}{2}r^2\\theta = \\tfrac{1}{2}(64)\\cdot\\frac{5\\pi}{6} = \\frac{320\\pi}{12} = \\frac{80\\pi}{3} \\approx 83.8 \\text{ cm}^2',
          annotation: 'Sector area formula.',
          hint: 'Substitute $r^2 = 64$ and the radian angle into $A = \\frac{1}{2}r^2\\theta$. Simplify $320/12$ by dividing by 4.',
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
          hint: 'Add $2\\pi$ (one full rotation). Convert $2\\pi$ to thirds to add the fractions: $2\\pi = 6\\pi/3$.',
        },
        {
          expression: '\\frac{2\\pi}{3} - 2\\pi = \\frac{2\\pi}{3} - \\frac{6\\pi}{3} = -\\frac{4\\pi}{3}',
          annotation: 'Subtract one full rotation for a negative coterminal angle.',
          hint: 'Subtract $2\\pi$ (one full rotation). The result is negative, which is valid — negative angles are clockwise rotations.',
        },
      ],
      conclusion: 'Infinitely many coterminal angles exist. The one in $[0, 2\\pi)$ is the "principal" representative. To find it, add or subtract $2\\pi$ repeatedly until the result lands in range.',
    },
    {
      id: 'ex-angles-gps',
      title: 'Navigating the Globe: DMS to Decimal',
      problem: '\\text{Convert } 48^\\circ 51^\\prime 24^{\\prime\\prime} \\text{ (the latitude of Paris) to decimal degrees.}',
      steps: [
        {
          expression: '48 + \\frac{51}{60} + \\frac{24}{3600}',
          annotation: 'Step 1: Convert minutes to 1/60th of a degree and seconds to 1/3600th.',
          hint: 'Treat the conversion like hours to decimal: 1 minute = 1/60 degree, 1 second = 1/3600 degree. Write each part as a fraction before computing.',
        },
        {
          expression: '48 + 0.85 + 0.00667 = 48.85667^\\circ',
          annotation: 'Step 2: Sum the parts to find the decimal equivalent.',
          hint: 'Evaluate each fraction as a decimal and sum. Carry enough decimal places to match GPS precision requirements.',
        }
      ],
      conclusion: 'DMS is the historical legacy of Babylonian navigation. Digital systems (GPS) prefer decimal degrees for easier computation.'
    },
    {
      id: 'ex-angles-gears',
      title: 'Angular Synchrony: Connected Gears',
      problem: '\\text{A small gear (r=2) is connected to a large gear (r=8). If the small gear turns } 120^\\circ, \\text{ how far does the large gear turn?}',
      steps: [
        {
          expression: '120^\\circ = \\frac{2\\pi}{3} \\text{ rad}',
          annotation: 'Step 1: Convert to radians for rotation modeling.',
          hint: 'Convert degrees to radians by multiplying by $\\pi/180$. Gear problems always use arc length, which requires radians.',
        },
        {
          expression: 's = r_1 \\theta_1 = 2 \\cdot \\frac{2\\pi}{3} = \\frac{4\\pi}{3}',
          annotation: 'Step 2: Calculate the arc length travel along the small gear.',
          hint: 'The contact arc on the small gear must equal the contact arc on the large gear — this is what it means for gears to mesh. Compute $s = r_1\theta_1$ first.',
        },
        {
          expression: '\\frac{4\\pi}{3} = 8 \\cdot \\theta_2 \\implies \\theta_2 = \\frac{4\\pi}{24} = \\frac{\\pi}{6} \\text{ rad}',
          annotation: 'Step 3: The arc length travel is identical for the large gear. Solve for the large angle.',
          hint: 'Set the two arc lengths equal: $r_1\\theta_1 = r_2\\theta_2$. Then divide both sides by $r_2 = 8$ to isolate $\\theta_2$.',
        },
        {
          expression: '\\theta_2 = 30^\\circ',
          annotation: 'Step 4: Convert back to degrees for the final answer.',
          hint: 'Multiply by $180/\\pi$ to convert back. Notice the larger gear turns less — it moves fewer degrees for the same arc length traveled.',
        }
      ],
      conclusion: 'Large gears turn less but with more torque. The ratio of angles is the inverse of the ratio of radii.'
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
    {
      id: 'ch3-trig-000-ch3',
      difficulty: 'harder',
      problem: '\\text{The Earth has a radius of } 6400 \\text{ km and rotates once every } 24 \\text{ hours. Calculate the linear speed (km/h) of a person standing on the equator.}',
      hint: 'Find the angular velocity in radians per hour first. One rotation = $2\\pi$ radians.',
      walkthrough: [
        {
          expression: '\\omega = \\frac{2\\pi \\text{ rad}}{24 \\text{ hours}} = \\frac{\\pi}{12} \\text{ rad/h}',
          annotation: 'Step 1: Calculate the angular speed of the planet.'
        },
        {
          expression: 'v = r\\omega = 6400 \\times \\frac{\\pi}{12} = \\frac{1600\\pi}{3} \\approx 1675 \\text{ km/h}',
          annotation: 'Step 2: Linear speed = radius × angular velocity. Multiply and simplify.'
        }
      ],
      answer: '\\approx 1675 \\text{ km/h}'
    }
  ],

  calcBridge: {
    teaser: 'Every derivative and integral formula for trig functions assumes radians. $\\frac{d}{dx}\\sin x = \\cos x$ is only true in radians. The arc length and sector area formulas from this lesson reappear in calculus when computing arc lengths of curves and areas of polar regions.',
    linkedLessons: ['trig-identities-deep-dive', 'trig-in-calculus'],
  },

  crossRefs: [
    { slug: 'triangle-geometry', reason: 'Pythagorean theorem and similar triangles underpin why trig ratios are scale-free — directly built on the angle foundations here.' },
    { slug: 'trig-ratios-right-triangles', reason: 'The radian definition of angles feeds directly into the unit circle, which defines all six trig ratios.' },
    { slug: 'trig-in-calculus', reason: 'The limit $\\lim_{\\theta\\to 0}\\sin\\theta/\\theta = 1$ proved here is the cornerstone of every trig derivative in calculus.' },
  ],

  checkpoints: [
    'Can you convert any degree measure to radians and back without a calculator?',
    'Why does $s = r\\theta$ require $\\theta$ in radians — what breaks if you use degrees?',
    'What makes two angles coterminal, and how do you find the principal angle in $[0, 2\\pi)$?',
    'How do you convert degrees-minutes-seconds to decimal degrees?',
    'What is the geometric meaning of one radian?',
  ],

  semantics: {
    symbols: [
      { symbol: '\\theta', meaning: 'Angle measure (usually in radians in calculus contexts)' },
      { symbol: 's', meaning: 'Arc length along a circle' },
      { symbol: 'r', meaning: 'Radius of the circle' },
      { symbol: '\\omega', meaning: 'Angular velocity in radians per second' },
      { symbol: 'v', meaning: 'Linear (tangential) speed at the rim' },
      { symbol: 'k', meaning: 'Any integer, used to generate coterminal angles' },
    ],
    rulesOfThumb: [
      'If a formula has trig functions and no explicit degree symbol, assume radians.',
      'To convert degrees to radians, multiply by $\\pi/180$; to go the other way, multiply by $180/\\pi$.',
      'Coterminal angles differ by integer multiples of $2\\pi$ (radians) or $360°$.',
      'Arc length and sector area formulas are only correct in radians — always convert first.',
      'One radian ≈ 57.3°; memorize this to quickly sanity-check conversions.',
    ],
  },

  spiral: {
    recoveryPoints: [
      { topic: 'Fractions and ratios', where: 'Precalc-2 — Algebraic fractions', why: 'The conversion factor $\\pi/180$ requires confident fraction manipulation.' },
      { topic: 'Circle circumference and area', where: 'Precalc-1 — Geometry review', why: 'Arc length and sector area formulas are proportional slices of $C = 2\\pi r$ and $A = \\pi r^2$.' },
      { topic: 'Function composition', where: 'Precalc-2 — Functions', why: 'Angular velocity composed with radius gives linear speed — a composition of quantities.' },
    ],
    futureLinks: [
      { topic: 'Trig derivatives', where: 'Trig in Calculus (Lesson 10)', why: '$\\frac{d}{dx}\\sin x = \\cos x$ is only valid in radians; the proof uses the limit established here.' },
      { topic: 'Arc length in calculus', where: 'Calculus — Integration applications', why: 'The $s = r\\theta$ formula generalizes to $\\int_a^b\\sqrt{1+(f\'(x))^2}\\,dx$ for arbitrary curves.' },
      { topic: 'Polar coordinates', where: 'Polar Coordinates (Lesson 8)', why: 'Polar equations use $r$ and $\\theta$ directly — the same variables whose relationship this lesson establishes.' },
    ],
  },

  assessment: [
    {
      question: 'Convert $\\frac{5\\pi}{4}$ radians to degrees.',
      answer: '$225°$',
      difficulty: 'quick-fire',
    },
    {
      question: 'A sector has radius 6 and central angle $\\frac{\\pi}{3}$. What is its arc length?',
      answer: '$s = 6 \\cdot \\frac{\\pi}{3} = 2\\pi$',
      difficulty: 'quick-fire',
    },
    {
      question: 'Name a positive coterminal angle to $-\\frac{\\pi}{4}$.',
      answer: '$-\\frac{\\pi}{4} + 2\\pi = \\frac{7\\pi}{4}$',
      difficulty: 'quick-fire',
    },
  ],

  mentalModel: [
    'An angle is a rotation, not a shape — direction (CW vs CCW) matters.',
    'Degrees are a human convention; radians are a geometric fact derived from $\\pi$.',
    'One radian = the angle that makes an arc exactly as long as the radius.',
    'Coterminal angles are the same rotation reached by different winding counts.',
    'Every calculus formula for trig silently assumes radians — that is the whole point.',
  ],

  quiz: [
    {
      id: 'q-angles-1',
      type: 'input',
      text: 'Convert $270°$ to radians. Give your answer in terms of $\\pi$.',
      answer: '\\frac{3\\pi}{2}',
      hints: ['Multiply by $\\pi/180$ and simplify.', '$270/180 = 3/2$, so the answer is $\\frac{3\\pi}{2}$.'],
      reviewSection: 'Intuition tab — why radians win',
    },
    {
      id: 'q-angles-2',
      type: 'choice',
      text: 'Which of the following is coterminal with $\\frac{\\pi}{6}$?',
      options: ['$\\frac{13\\pi}{6}$', '$\\frac{7\\pi}{6}$', '$\\frac{5\\pi}{6}$', '$\\frac{2\\pi}{3}$'],
      answer: '$\\frac{13\\pi}{6}$',
      hints: ['Add $2\\pi$ to the original angle.', '$\\frac{\\pi}{6} + 2\\pi = \\frac{\\pi}{6} + \\frac{12\\pi}{6} = \\frac{13\\pi}{6}$.'],
      reviewSection: 'Math tab — standard position and coterminal angles',
    },
    {
      id: 'q-angles-3',
      type: 'input',
      text: 'A circle has radius 10 cm. Find the arc length for a central angle of $\\frac{3\\pi}{5}$ radians.',
      answer: '6\\pi',
      hints: ['Use $s = r\\theta$.', '$s = 10 \\times \\frac{3\\pi}{5} = \\frac{30\\pi}{5} = 6\\pi$.'],
      reviewSection: 'Math tab — arc length and sector area',
    },
    {
      id: 'q-angles-4',
      type: 'choice',
      text: 'Why does $\\lim_{\\theta\\to 0}\\frac{\\sin\\theta}{\\theta} = 1$ only when $\\theta$ is in radians?',
      options: [
        'Because in radians, arc length equals the radius times the angle, so $\\sin\\theta \\approx \\theta$ for small $\\theta$.',
        'Because degrees are larger units than radians.',
        'Because the sine function is defined differently in degrees.',
        'Because calculators default to radian mode.',
      ],
      answer: 'Because in radians, arc length equals the radius times the angle, so $\\sin\\theta \\approx \\theta$ for small $\\theta$.',
      hints: ['Think about what the arc length is for a small angle on the unit circle.', 'In radians, arc = angle. In degrees, arc = $\\pi\\theta/180$, introducing a $\\pi/180$ factor into the limit.'],
      reviewSection: 'Rigor tab — squeeze theorem proof',
    },
    {
      id: 'q-angles-5',
      type: 'input',
      text: 'Convert $52°15\'30\'\'$ to decimal degrees. Round to 4 decimal places.',
      answer: '52.2583',
      hints: ['Divide minutes by 60 and seconds by 3600, then add.', '$52 + 15/60 + 30/3600 = 52 + 0.25 + 0.00833... \\approx 52.2583$.'],
      reviewSection: 'Examples tab — navigating the globe: DMS to decimal',
    },
    {
      id: 'q-angles-6',
      type: 'choice',
      text: 'A wheel of radius 5 cm rotates through an angle of $\\frac{\\pi}{4}$ radians. What is the arc length swept?',
      options: ['$\\frac{5\\pi}{4}$ cm', '$\\frac{\\pi}{20}$ cm', '$5\\pi$ cm', '$\\frac{\\pi}{4}$ cm'],
      answer: '$\\frac{5\\pi}{4}$ cm',
      hints: ['Apply $s = r\\theta$.', '$s = 5 \\times \\frac{\\pi}{4} = \\frac{5\\pi}{4}$.'],
      reviewSection: 'Examples tab — arc length and sector area',
    },
    {
      id: 'q-angles-7',
      type: 'input',
      text: 'Find the sector area of a circle with radius 6 and central angle $\\frac{\\pi}{3}$ radians.',
      answer: '6\\pi',
      hints: ['Use $A = \\frac{1}{2}r^2\\theta$.', '$A = \\frac{1}{2}(36)\\cdot\\frac{\\pi}{3} = \\frac{36\\pi}{6} = 6\\pi$.'],
      reviewSection: 'Math tab — arc length and sector area',
    },
    {
      id: 'q-angles-8',
      type: 'choice',
      text: 'Two supplementary angles are in ratio 1:3. What is the larger angle in radians?',
      options: ['$\\frac{3\\pi}{4}$', '$\\frac{\\pi}{4}$', '$\\frac{2\\pi}{3}$', '$\\frac{\\pi}{3}$'],
      answer: '$\\frac{3\\pi}{4}$',
      hints: ['Let the angles be $k$ and $3k$. They sum to $180° = \\pi$.', '$4k = \\pi$, so $k = \\pi/4$ and the larger angle is $3\\pi/4$.'],
      reviewSection: 'Challenges tab — supplementary angle ratio',
    },
    {
      id: 'q-angles-9',
      type: 'input',
      text: 'A gear of radius 3 is meshed with a gear of radius 9. If the small gear turns $\\frac{2\\pi}{3}$ radians, how many radians does the large gear turn?',
      answer: '\\frac{2\\pi}{9}',
      hints: ['Arc lengths must match at the contact point: $r_1\\theta_1 = r_2\\theta_2$.', '$3 \\times \\frac{2\\pi}{3} = 9 \\times \\theta_2 \\Rightarrow \\theta_2 = \\frac{2\\pi}{9}$.'],
      reviewSection: 'Examples tab — angular synchrony: connected gears',
    },
    {
      id: 'q-angles-10',
      type: 'choice',
      text: 'Which statement correctly describes the geometric meaning of one radian?',
      options: [
        'It is the angle subtended when the arc length equals the radius.',
        'It is $1/360$ of a full circle.',
        'It is the angle at the center of a regular hexagon.',
        'It is the angle whose sine equals 1.',
      ],
      answer: 'It is the angle subtended when the arc length equals the radius.',
      hints: ['Think about the definition of the radian from the arc length formula.', 'From $s = r\\theta$: when $s = r$, we get $\\theta = 1$ radian.'],
      reviewSection: 'Intuition tab — why radians win',
    },
  ],
}
