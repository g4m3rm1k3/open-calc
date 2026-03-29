export default {
  id: 'p1-ch4-009',
  slug: 'circular-dynamics',
  chapter: 'p4',
  order: 8,
  title: 'Circular Motion Dynamics',
  subtitle: 'Centripetal force is not a new force — it is whatever real force points toward the center.',
  tags: ['circular-motion', 'centripetal-force', 'centripetal-acceleration', 'orbital-mechanics', 'banking'],

  hook: {
    question: 'A car rounds a curve at 60 km/h. What actually provides the force that keeps the car from going straight off the road?',
    realWorldContext: 'Circular motion is everywhere: satellites orbiting Earth, cars rounding curves, electrons in magnetic fields, cyclists on a velodrome. In every case, Newton\'s first law says the object should travel in a straight line — so something must constantly redirect it toward the center. That something is centripetal force. The word "centripetal" means "center-seeking," and the remarkable insight is that it\'s never a new mysterious force: it\'s always an existing force (gravity, normal, tension, friction) doing double duty as the redirector.',
    previewVisualizationId: 'SVGDiagram',
    previewVisualizationProps: { type: 'circular-motion' },
  },

  intuition: {
    prose: [
      'Tie a ball to a string and swing it in a circle over your head. Your hand pulls the string inward. That inward pull is the centripetal force — and if you let go, the ball flies outward in a straight line (Newton\'s 1st law). The string was constantly changing the ball\'s direction, not its speed.',
      'Changing direction means changing the velocity vector, even if the speed (magnitude) is constant. Changing velocity means acceleration. So circular motion at constant speed still involves acceleration — directed toward the center. This is centripetal acceleration: aₒ = v²/r.',
      'The required centripetal force is just F = maₒ = mv²/r. The question in every circular dynamics problem is: which physical force provides mv²/r? For a satellite: gravity. For a car on a curve: friction. For a ball on a string: tension. For a roller coaster at the top of a loop: gravity plus normal force.',
      'Common misconception: "centrifugal force" throwing you outward. This is a fictitious force that appears when you\'re sitting in the rotating frame. In the ground frame (the inertial frame), there is no outward force — there is only the absence of sufficient inward force. If friction can\'t supply enough centripetal force, the car goes straight (off the road), not outward.',
    ],
    callouts: [
      {
        type: 'insight',
        title: 'Centripetal force is the net inward force',
        body: 'It is never listed as a separate force on a free body diagram. Instead, identify the real forces, take their net inward component, and set it equal to mv²/r.',
      },
      {
        type: 'connection',
        title: 'Calc connection: circular position function',
        body: 'Position on a circle: r(t) = R[cos(ωt), sin(ωt)]. Velocity: v(t) = Rω[−sin(ωt), cos(ωt)]. Acceleration: a(t) = −Rω²[cos(ωt), sin(ωt)] = −ω²r(t). The acceleration is directed toward the center (negative r direction) with magnitude ω²R = v²/R. F = ma confirms: centripetal force = mω²R = mv²/R.',
      },
    ],
    visualizations: [
      {
        id: 'SVGDiagram',
        props: { type: 'circular-motion' },
        title: 'Centripetal acceleration is always directed toward the center',
        caption: 'Velocity v is tangent to the circle. Acceleration aₒ = v²/r points inward (centripetal). The angular velocity ω and period T complete the description.',
      },
    ],
  },

  math: {
    prose: [
      'For uniform circular motion (constant speed v, radius r): centripetal acceleration aₒ = v²/r = ω²r. Direction: always toward the center.',
      'Required centripetal force: Fₒ = maₒ = mv²/r = mω²r. This must be supplied by a real force or the net inward component of multiple forces.',
      'Four canonical examples:',
      '(1) Ball on a string (horizontal circle): Tension provides Fₒ entirely. T = mv²/r.',
      '(2) Car on a flat curve: Friction provides Fₒ. Maximum speed: f_s = mv²/r → v_max = √(μ_s r g).',
      '(3) Satellite in circular orbit: Gravity provides Fₒ. mg_orbit = mv²/r → v = √(GM/r) (orbital speed). Since g_orbit = GM/r², this gives the circular orbit velocity.',
      '(4) Ball on string (vertical circle, at the top): Weight + Normal force provide Fₒ. At top: mg + N = mv²/r. Minimum speed (N → 0): v_min = √(rg).',
      'Banked curve (no friction): Normal force\'s horizontal component provides Fₒ. N sin θ = mv²/r and N cos θ = mg → tan θ = v²/(rg). The ideal banking angle for speed v is θ = arctan(v²/rg).',
    ],
    keyFormulas: [
      { label: 'Centripetal acceleration', formula: 'a_c = \\dfrac{v^2}{r} = \\omega^2 r', note: 'Directed toward center' },
      { label: 'Centripetal force', formula: 'F_c = \\dfrac{mv^2}{r} = m\\omega^2 r', note: 'The net inward force required' },
      { label: 'Max speed on flat curve', formula: 'v_{\\max} = \\sqrt{\\mu_s r g}', note: 'Friction is the centripetal force' },
      { label: 'Orbital speed', formula: 'v_{\\text{orbit}} = \\sqrt{\\dfrac{GM}{r}}', note: 'Gravity is the centripetal force' },
      { label: 'Ideal banking angle', formula: '\\tan\\theta = \\dfrac{v^2}{rg}', note: 'No friction needed at this speed' },
    ],
  },

  rigor: {
    title: 'Deriving centripetal acceleration from the position function',
    content: [
      {
        type: 'paragraph',
        text: 'For a particle moving in a circle of radius R with angular velocity ω, the position vector is:',
      },
      {
        type: 'derivation',
        steps: [
          { expression: '\\vec{r}(t) = R\\cos(\\omega t)\\,\\hat{x} + R\\sin(\\omega t)\\,\\hat{y}', annotation: 'Circular motion parametrized by angle ωt' },
          { expression: '\\vec{v}(t) = \\frac{d\\vec{r}}{dt} = -R\\omega\\sin(\\omega t)\\,\\hat{x} + R\\omega\\cos(\\omega t)\\,\\hat{y}', annotation: 'Velocity is tangent to circle; |v| = Rω = const' },
          { expression: '\\vec{a}(t) = \\frac{d\\vec{v}}{dt} = -R\\omega^2\\cos(\\omega t)\\,\\hat{x} - R\\omega^2\\sin(\\omega t)\\,\\hat{y}', annotation: 'Acceleration from differentiating velocity' },
          { expression: '\\vec{a}(t) = -\\omega^2 \\vec{r}(t)', annotation: 'Acceleration is antiparallel to position vector — directed toward center' },
          { expression: '|\\vec{a}| = \\omega^2 R = \\frac{v^2}{R}', annotation: 'Magnitude of centripetal acceleration (using v = ωR)' },
          { expression: 'F_c = m|\\vec{a}| = \\frac{mv^2}{R}', annotation: 'Newton\'s 2nd law: centripetal force equals mass × centripetal acceleration' },
        ],
        answer: 'Centripetal acceleration emerges from differentiating the circular position function twice. It always points toward the center with magnitude v²/r = ω²r.',
      },
    ],
    visualizationId: 'CircularDynamicsDerivation',
  },

  checkpoints: [
    { id: 'p4-009-cp1', question: 'A car travels at 20 m/s around a curve of radius 50 m. What centripetal acceleration is required?', answer: '8 m/s²' },
    { id: 'p4-009-cp2', question: 'What provides the centripetal force for a satellite in circular orbit around Earth?', answer: 'Gravity' },
    { id: 'p4-009-cp3', question: 'A 2 kg ball is swung in a horizontal circle of radius 1.5 m at 4 m/s. What is the tension in the string?', answer: '21.3 N' },
  ],

  quiz: [
    {
      id: 'p4-009-q1',
      type: 'choice',
      text: 'Centripetal force is best described as:',
      options: [
        'A special new force that only exists in circular motion',
        'The outward force that pushes objects away from the center',
        'The net inward force required to maintain circular motion, provided by real forces (gravity, tension, friction, etc.)',
        'Always equal to the weight of the object',
      ],
      answer: 'The net inward force required to maintain circular motion, provided by real forces (gravity, tension, friction, etc.)',
      hints: ['Check your free body diagram — "centripetal force" never appears as its own arrow.'],
      reviewSection: 'What Provides the Centripetal Force?',
    },
    {
      id: 'p4-009-q2',
      type: 'input',
      text: 'A 1.5 kg ball moves in a circle of radius 2 m at 6 m/s. What centripetal force is required? (in N)',
      answer: '27',
      hints: ['Fc = mv²/r', '1.5 × 36 / 2 = 27 N'],
      reviewSection: 'The Centripetal Force Formula',
    },
    {
      id: 'p4-009-q3',
      type: 'input',
      text: 'A car rounds a flat curve of radius 80 m. The coefficient of static friction is 0.5. What is the maximum safe speed? (g = 10 m/s², give answer in m/s)',
      answer: '20',
      hints: ['v_max = √(μ_s × r × g)', '√(0.5 × 80 × 10) = √400 = 20 m/s'],
      reviewSection: 'Car on a Flat Curve',
    },
    {
      id: 'p4-009-q4',
      type: 'choice',
      text: 'An object moves in a circle at constant speed. Which statement is correct?',
      options: [
        'The object has zero acceleration because speed is constant',
        'The object accelerates because its velocity direction is changing',
        'The net force on the object is zero',
        'The object requires no force to maintain circular motion',
      ],
      answer: 'The object accelerates because its velocity direction is changing',
      hints: ['Acceleration = rate of change of velocity vector, not just speed.'],
      reviewSection: 'Why Circular Motion Involves Acceleration',
    },
    {
      id: 'p4-009-q5',
      type: 'input',
      text: 'A 500 kg satellite orbits at radius r = 7×10⁶ m. The gravitational acceleration at that altitude is 8.2 m/s². What orbital speed is needed? (in m/s, round to nearest whole number)',
      answer: '7573',
      hints: ['Gravity provides centripetal force: mg = mv²/r → v = √(gr)', '√(8.2 × 7×10⁶) = √(57,400,000) ≈ 7573 m/s'],
      reviewSection: 'Satellite Orbit',
    },
    {
      id: 'p4-009-q6',
      type: 'choice',
      text: 'At the top of a vertical loop, a ball on a string moves at minimum speed. What is the normal force at that point?',
      options: [
        'N = mg',
        'N = 2mg',
        'N = 0 (the string is barely taut)',
        'N = mv²/r − mg',
      ],
      answer: 'N = 0 (the string is barely taut)',
      hints: ['At minimum speed, the string goes slack (N → 0). At that point: mg = mv²_min/r → v_min = √(rg).'],
      reviewSection: 'Vertical Circle',
    },
    {
      id: 'p4-009-q7',
      type: 'input',
      text: 'A 0.5 kg ball is swung in a vertical circle of radius 1 m. At the top, the speed is 5 m/s. What is the tension in the string at the top? (g = 10 m/s², in N)',
      answer: '7.5',
      hints: ['At the top: T + mg = mv²/r (both tension and weight point toward center)', 'T = mv²/r − mg = 0.5×25/1 − 0.5×10 = 12.5 − 5 = 7.5 N'],
      reviewSection: 'Vertical Circle',
    },
    {
      id: 'p4-009-q8',
      type: 'choice',
      text: 'A road is banked at the ideal angle for 30 m/s. What is true if a car travels slower than 30 m/s on this banked curve?',
      options: [
        'The car travels in a perfect circle with no friction needed',
        'The car tends to slide down the bank; friction acts up the slope to maintain circular motion',
        'The car tends to slide up the bank; friction acts down the slope',
        'The car will always skid outward regardless of speed',
      ],
      answer: 'The car tends to slide down the bank; friction acts up the slope to maintain circular motion',
      hints: ['At ideal speed, N sin θ exactly provides mv²/r with no friction. Below ideal speed, gravity wins and pulls the car down the bank.'],
      reviewSection: 'Banked Curves',
    },
    {
      id: 'p4-009-q9',
      type: 'input',
      text: 'A highway curve has radius 200 m. What banking angle (in degrees) eliminates the need for friction at 25 m/s? (g = 10 m/s², round to 1 decimal)',
      answer: '17.4',
      hints: ['tan θ = v²/(rg) = 625/2000 = 0.3125', 'θ = arctan(0.3125) ≈ 17.4°'],
      reviewSection: 'Ideal Banking Angle',
    },
    {
      id: 'p4-009-q10',
      type: 'choice',
      text: 'If you double the speed of an object in circular motion while keeping the radius constant, by what factor does the required centripetal force change?',
      options: ['2×', '4×', '½×', '√2×'],
      answer: '4×',
      hints: ['Fc = mv²/r. Double v → v² is quadrupled → Fc is quadrupled.'],
      reviewSection: 'The Centripetal Force Formula',
    },
  ],

  viz: [
    { id: 'SVGDiagram', props: { type: 'circular-motion' }, title: 'Centripetal acceleration and angular velocity' },
  ],
}
