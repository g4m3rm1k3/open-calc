export default {
  id: 'p1-ch3-018',
  slug: 'centripetal-accel',
  chapter: 'p3',
  order: 6,
  title: 'Centripetal Acceleration',
  subtitle: 'In circular motion, acceleration points inward — its magnitude is v²/r = ω²r.',
  tags: ['centripetal-acceleration', 'circular-motion', 'Newton-second-law', 'net-force'],

  hook: {
    question: 'A ball on a string swings in a horizontal circle. You cut the string — which way does the ball fly?',
    realWorldContext: 'Centripetal acceleration is behind every curve you navigate in a car, every banked highway ramp, every satellite orbit, and every centrifuge in a biology lab. The word "centripetal" means "center-seeking" — understanding why the acceleration must point inward unlocks the entire dynamics of circular motion.',
    previewVisualizationId: 'CentripetalViz',
  },

  intuition: {
    prose: [
      'In circular motion, the velocity vector is always tangent to the circle. From one instant to the next, the velocity changes direction (though not magnitude). The rate of that direction change is the centripetal acceleration, and it always points toward the center.',
      'The magnitude of centripetal acceleration is aᶜ = v²/r. Faster speed means more rapid direction change; smaller radius also means more rapid direction change. Both increase aᶜ.',
      'Centripetal acceleration is not a new type of force — it is the net acceleration that results from whatever real forces happen to be acting (tension, gravity, normal force, friction). The net force causing circular motion is F_net = maᶜ = mv²/r, always directed inward.',
    ],
    callouts: [
      {
        type: 'definition',
        title: 'Centripetal acceleration',
        body: 'a_c = \\frac{v^2}{r} = \\omega^2 r \\quad (\\text{directed toward center})',
      },
      {
        type: 'definition',
        title: 'Net centripetal force',
        body: 'F_{\\text{net}} = m a_c = \\frac{mv^2}{r} \\quad (\\text{this IS the net force — not an additional force})',
      },
      {
        type: 'insight',
        title: 'Perpendicular to velocity → changes direction, not speed',
        body: 'Because a_c \\perp v, the acceleration changes only the direction of v, never its magnitude. Speed stays constant; direction continuously changes.',
      },
      {
        type: 'warning',
        title: '"Centrifugal force" is not a real force',
        body: 'In an inertial frame, there is no outward centrifugal force. The apparent outward push you feel in a turning car is your inertia resisting the inward acceleration — not a real force on you.',
      },
    ],
    visualizations: [
      {
        id: 'SVGDiagram',
        props: { type: 'circular-motion' },
        title: 'Centripetal acceleration points inward at every point',
        caption: 'Velocity (tangent, blue) and centripetal acceleration (inward, red) are always perpendicular. The inward acceleration continuously curves the path into a circle.',
      },
      {
        id: 'CentripetalViz',
        title: 'Centripetal acceleration explorer',
        mathBridge: 'Adjust v and r to see how aᶜ = v²/r changes. Note that doubling v quadruples aᶜ, while doubling r halves it.',
        caption: 'Centripetal acceleration scales as v² — speed matters more than radius.',
      },
    ],
  },

  math: {
    prose: [
      'The two forms of centripetal acceleration are equivalent: aᶜ = v²/r and aᶜ = ω²r. You can switch between them using v = ωr.',
      'For problems, identify the real force(s) providing the centripetal acceleration (tension, gravity, friction, normal force), set their net inward component equal to mv²/r, and solve.',
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'Both forms of aᶜ',
        body: 'a_c = \\frac{v^2}{r} = \\omega^2 r \\qquad \\text{(use v form when speed is known; \\omega form when angular velocity is known)}',
      },
      {
        type: 'insight',
        title: 'Quick unit check',
        body: '\\frac{v^2}{r} = \\frac{(\\text{m/s})^2}{\\text{m}} = \\frac{\\text{m}^2/\\text{s}^2}{\\text{m}} = \\text{m/s}^2 \\checkmark',
      },
    ],
    visualizations: [],
  },

  rigor: {
    prose: [
      'The formula aᶜ = v²/r is derived by comparing the velocity vectors at two nearby points on the circle and taking the limit as the time interval approaches zero.',
      'The key geometric insight is that the triangle formed by the two velocity vectors (Δv) is similar to the triangle formed by the two position vectors (Δs). This gives |Δv|/v = |Δs|/r. Dividing both sides by Δt and taking the limit gives a = v²/r.',
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'Similar-triangles derivation',
        body: '\\frac{|\\Delta v|}{v} = \\frac{|\\Delta s|}{r} \\Rightarrow \\frac{|\\Delta v|}{\\Delta t} = \\frac{v}{r}\\cdot\\frac{|\\Delta s|}{\\Delta t} \\xrightarrow{\\Delta t\\to 0} a_c = \\frac{v^2}{r}',
      },
    ],
    visualizationId: 'CentripetalDerivation',
    proofSteps: [
      {
        title: 'Draw velocity vectors at two nearby points',
        expression: '\\mathbf{v}_1 \\text{ and } \\mathbf{v}_2\\text{ on the circle, separated by angle }\\Delta\\theta',
        annotation: 'Both vectors have magnitude v (uniform circular motion) but differ in direction by Δθ.',
      },
      {
        title: 'Form the velocity difference triangle',
        expression: '|\\Delta \\mathbf{v}| \\approx v\\,\\Delta\\theta \\quad (\\text{for small }\\Delta\\theta)',
        annotation: 'The magnitude of the change in velocity equals v times the angle swept (arc length on a circle of radius v).',
      },
      {
        title: 'Arc length on position circle',
        expression: '|\\Delta s| = r\\,\\Delta\\theta',
        annotation: 'The arc traveled on the physical circle of radius r in the same angle Δθ.',
      },
      {
        title: 'Divide both expressions by Δt',
        expression: '\\frac{|\\Delta \\mathbf{v}|}{\\Delta t} = v\\,\\frac{\\Delta\\theta}{\\Delta t} \\quad\\text{and}\\quad \\frac{|\\Delta s|}{\\Delta t} = r\\,\\frac{\\Delta\\theta}{\\Delta t}',
        annotation: 'Both contain dθ/dt = ω in the limit.',
      },
      {
        title: 'Take the limit Δt → 0',
        expression: 'a_c = v\\,\\omega = v \\cdot \\frac{v}{r} = \\frac{v^2}{r}',
        annotation: 'Using ω = v/r from the circular motion relation v = ωr.',
      },
      {
        title: 'Direction of acceleration',
        expression: '\\mathbf{a}_c \\text{ points from the object toward the center (inward)}',
        annotation: 'As Δθ → 0, the direction of Δv points exactly toward the center of the circle.',
      },
    ],
    title: 'Derivation: aᶜ = v²/r from similar triangles and the limit',
    visualizations: [
      {
        id: 'CentripetalDerivation',
        title: 'Similar triangles: position arc and velocity arc',
        mathBridge: 'The position triangle (arc Δs on circle of radius r) and the velocity triangle (arc |Δv| on circle of radius v) are geometrically similar. The ratio Δv/Δs = v/r yields aᶜ = v²/r in the limit.',
        caption: 'Geometry of the limit: two similar isoceles triangles give the centripetal formula.',
      },
    ],
  },

  examples: [
    {
      id: 'ch3-018-ex1',
      title: 'Car on a curved road',
      problem: 'A car travels at v = 20\\,\\text{m/s} around a circular curve of radius r = 100\\,\\text{m}. Find the centripetal acceleration a_c.',
      steps: [
        {
          expression: 'a_c = \\frac{v^2}{r} = \\frac{(20)^2}{100} = \\frac{400}{100} = 4\\,\\text{m/s}^2',
          annotation: 'Direct application of the centripetal acceleration formula.',
        },
        {
          expression: 'F_c = m a_c = m \\times 4\\,\\text{m/s}^2',
          annotation: 'The net inward force (from friction in this case) must provide 4 N per kg of car mass.',
        },
      ],
      conclusion: 'The centripetal acceleration is 4 m/s² directed toward the center of the curve.',
    },
    {
      id: 'ch3-018-ex2',
      title: 'Earth\'s surface centripetal acceleration',
      problem: 'Find the centripetal acceleration of a person standing on the equator. Use R_{\\text{Earth}} = 6.4 \\times 10^6\\,\\text{m} and T = 24\\,\\text{h} = 86400\\,\\text{s}.',
      steps: [
        {
          expression: '\\omega = \\frac{2\\pi}{T} = \\frac{2\\pi}{86400} \\approx 7.27 \\times 10^{-5}\\,\\text{rad/s}',
          annotation: 'Earth\'s angular velocity.',
        },
        {
          expression: 'a_c = \\omega^2 r = (7.27 \\times 10^{-5})^2 \\times 6.4 \\times 10^6 \\approx 0.034\\,\\text{m/s}^2',
          annotation: 'Using the ω²r form since ω is known. This is about 0.35% of g — Earth\'s spin barely affects your weight.',
        },
      ],
      conclusion: 'A person on the equator has centripetal acceleration ≈ 0.034 m/s² — much smaller than g = 9.8 m/s².',
    },
  ],

  challenges: [
    {
      id: 'ch3-018-ch1',
      difficulty: 'medium',
      problem: 'A ball on a string moves in a horizontal circle. The centripetal acceleration is a_c = 25\\,\\text{m/s}^2 and the speed is v = 10\\,\\text{m/s}. Find the radius r of the circle.',
      hint: 'Rearrange aᶜ = v²/r to solve for r.',
      walkthrough: [
        {
          expression: 'a_c = \\frac{v^2}{r} \\Rightarrow r = \\frac{v^2}{a_c} = \\frac{(10)^2}{25} = \\frac{100}{25} = 4\\,\\text{m}',
          annotation: 'Solve directly for r.',
        },
      ],
      answer: 'The radius of the circular path is r = 4 m.',
    },
    {
      id: 'ch3-018-ch2',
      difficulty: 'hard',
      problem: 'A pilot pulls out of a dive in a circular arc of radius r = 500\\,\\text{m} at speed v = 100\\,\\text{m/s}. Use g = 10\\,\\text{m/s}^2. Find a_c in m/s² and express it as a multiple of g (the "g-force"). If the pilot has mass 80\\,\\text{kg}, find the net upward force on the pilot.',
      hint: 'Find aᶜ = v²/r first, divide by g to get g-force, then use F = maᶜ.',
      walkthrough: [
        {
          expression: 'a_c = \\frac{v^2}{r} = \\frac{(100)^2}{500} = \\frac{10000}{500} = 20\\,\\text{m/s}^2',
          annotation: 'Centripetal acceleration.',
        },
        {
          expression: '\\text{g-force} = \\frac{a_c}{g} = \\frac{20}{10} = 2g',
          annotation: 'The pilot experiences 2 times their normal weight pushing upward through the seat.',
        },
        {
          expression: 'F_{\\text{net}} = m a_c = 80 \\times 20 = 1600\\,\\text{N}',
          annotation: 'Net inward (upward) force required.',
        },
      ],
      answer: 'aᶜ = 20 m/s² = 2g. The net upward force on the 80 kg pilot is 1600 N.',
    },
  ],
}
