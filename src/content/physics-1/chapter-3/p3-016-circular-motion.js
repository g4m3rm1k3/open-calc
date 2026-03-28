export default {
  id: 'p1-ch3-016',
  slug: 'circular-motion',
  chapter: 'p3',
  order: 5,
  title: 'Uniform Circular Motion',
  subtitle: 'Constant speed, changing direction — the language of rotation is period, frequency, and angular velocity.',
  tags: ['circular-motion', 'angular-velocity', 'period', 'frequency', 'rotation'],

  hook: {
    question: 'A car drives at constant speed around a circular track. Is it accelerating?',
    realWorldContext: 'Circular motion describes everything from car turns to planetary orbits to electron paths in magnetic fields. The key insight — that constant speed does not mean zero acceleration — is one of the most important conceptual shifts in mechanics. Mastering the vocabulary (ω, T, f) and the v = ωr relation sets up centripetal acceleration, which is the next lesson.',
    previewVisualizationId: 'CircularMotionIntuition',
  },

  intuition: {
    prose: [
      'In uniform circular motion the object moves at constant speed, but its direction continuously changes. Direction change means velocity change — and any velocity change means acceleration. So yes, the car is accelerating even at constant speed.',
      'The period T is the time to complete one full revolution. Frequency f = 1/T counts revolutions per second (unit: Hz). Angular velocity ω = 2π/T measures how many radians are swept per second.',
      'The linear (tangential) speed v is related to ω and radius r by v = ωr. A larger radius means more distance covered per radian, so v is larger at larger r for the same ω.',
    ],
    callouts: [
      {
        type: 'definition',
        title: 'Period, frequency, angular velocity',
        body: 'T = \\text{time per revolution} \\qquad f = \\frac{1}{T}\\;(\\text{Hz}) \\qquad \\omega = \\frac{2\\pi}{T} = 2\\pi f\\;(\\text{rad/s})',
      },
      {
        type: 'definition',
        title: 'Linear speed and arc length',
        body: 'v = \\frac{2\\pi r}{T} = \\omega r \\qquad s = r\\theta \\;(\\theta\\text{ in radians})',
      },
      {
        type: 'insight',
        title: 'Constant speed ≠ no acceleration',
        body: 'Speed is the magnitude of velocity; acceleration requires only that the velocity vector changes — which happens continuously in circular motion even if |v| is constant.',
      },
    ],
    visualizations: [
      {
        id: 'SVGDiagram',
        props: { type: 'circular-motion' },
        title: 'Uniform circular motion — velocity always tangent',
        caption: 'The velocity vector (tangent to the circle) changes direction at every instant. This continuous direction change is the acceleration — it always points inward toward the center.',
      },
      {
        id: 'SVGDiagram',
        props: { type: 'vector-components' },
        title: 'Velocity direction changes between two nearby positions',
        caption: 'At two nearby points on the circle, the velocity vectors point in slightly different directions. The difference Δv points inward — toward the center of the circle.',
      },
      {
        id: 'CircularMotionIntuition',
        title: 'Period, frequency, and speed explorer',
        mathBridge: 'Adjust T and r to see how v and ω change. Verify v = ωr = 2πr/T by comparing the displayed values.',
        caption: 'Larger r or smaller T both increase linear speed v.',
      },
    ],
  },

  math: {
    prose: [
      'The angular velocity ω is the most compact way to describe rotation. Once you know ω and r, you can find v, arc length, and — in the next lesson — centripetal acceleration.',
      'Unit conversions: 1 revolution = 2π rad. So N rpm = N × (2π/60) rad/s. Always convert rpm to rad/s before using v = ωr or a = ω²r.',
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'Key circular motion relations',
        body: '\\omega = \\frac{2\\pi}{T} = 2\\pi f \\qquad v = \\omega r \\qquad s = r\\theta',
      },
      {
        type: 'warning',
        title: 'Radians required',
        body: 'The arc length formula s = rθ and the relation v = ωr require θ in radians and ω in rad/s. Convert degrees to radians before applying these formulas.',
      },
    ],
    visualizations: [],
  },

  rigor: {
    prose: [
      'The relation v = ωr is derived by differentiating the arc length formula s = rθ with respect to time.',
      'Here r is constant (circular path), so ds/dt = r(dθ/dt). The left side is the linear speed v = ds/dt; the right side is r times the angular velocity ω = dθ/dt. The result v = ωr follows immediately.',
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'Derivation of v = ωr',
        body: 's = r\\theta \\xrightarrow{\\tfrac{d}{dt}} \\frac{ds}{dt} = r\\frac{d\\theta}{dt} \\Rightarrow v = r\\omega',
      },
    ],
    visualizationId: 'CircularMotionDerivation',
    proofSteps: [
      {
        title: 'Arc length formula',
        expression: 's = r\\theta \\quad (\\theta\\text{ in radians, }r = \\text{const})',
        annotation: 'The arc length swept is radius times angle swept.',
      },
      {
        title: 'Differentiate both sides with respect to t',
        expression: '\\frac{ds}{dt} = r\\,\\frac{d\\theta}{dt}',
        annotation: 'r is constant so it factors out of the derivative.',
      },
      {
        title: 'Identify physical quantities',
        expression: 'v = \\frac{ds}{dt}, \\quad \\omega = \\frac{d\\theta}{dt}',
        annotation: 'ds/dt is the linear speed; dθ/dt is the angular velocity.',
      },
      {
        title: 'Write the result',
        expression: 'v = \\omega r',
        annotation: 'Linear speed equals angular velocity times radius. This is the fundamental connection between linear and rotational kinematics.',
      },
    ],
    title: 'Derivation: v = ωr from arc length differentiation',
    visualizations: [
      {
        id: 'CircularMotionDerivation',
        title: 'Arc length and angular sweep',
        mathBridge: 'As the angle θ increases by Δθ in time Δt, the arc length increases by rΔθ. Dividing by Δt gives v = rω in the limit.',
        caption: 'Differentiation converts the geometric arc-length relation into the kinematic speed relation.',
      },
    ],
  },

  examples: [
    {
      id: 'ch3-016-ex1',
      title: 'Car on a circular track',
      problem: 'A car drives around a circular track of radius r = 50\\,\\text{m} and completes one lap in T = 20\\,\\text{s}. Find the angular velocity \\omega, linear speed v, and frequency f.',
      steps: [
        {
          expression: '\\omega = \\frac{2\\pi}{T} = \\frac{2\\pi}{20} = \\frac{\\pi}{10} \\approx 0.314\\,\\text{rad/s}',
          annotation: 'Angular velocity from period.',
        },
        {
          expression: 'v = \\omega r = \\frac{\\pi}{10} \\times 50 = 5\\pi \\approx 15.7\\,\\text{m/s}',
          annotation: 'Linear speed from v = ωr.',
        },
        {
          expression: 'f = \\frac{1}{T} = \\frac{1}{20} = 0.05\\,\\text{Hz}',
          annotation: 'Frequency: 0.05 revolutions per second (one lap every 20 s).',
        },
      ],
      conclusion: 'ω = π/10 ≈ 0.314 rad/s, v = 5π ≈ 15.7 m/s, f = 0.05 Hz.',
    },
    {
      id: 'ch3-016-ex2',
      title: 'Converting RPM to rad/s and finding speed',
      problem: 'A fan blade of length r = 0.4\\,\\text{m} rotates at 300\\,\\text{rpm}. Find \\omega in rad/s and the tip speed v.',
      steps: [
        {
          expression: '\\omega = 300\\,\\frac{\\text{rev}}{\\text{min}} \\times \\frac{2\\pi\\,\\text{rad}}{\\text{rev}} \\times \\frac{1\\,\\text{min}}{60\\,\\text{s}} = \\frac{300 \\times 2\\pi}{60} = 10\\pi \\approx 31.4\\,\\text{rad/s}',
          annotation: 'Convert rpm to rad/s using 1 rev = 2π rad and 1 min = 60 s.',
        },
        {
          expression: 'v = \\omega r = 10\\pi \\times 0.4 = 4\\pi \\approx 12.6\\,\\text{m/s}',
          annotation: 'Tip speed using v = ωr.',
        },
      ],
      conclusion: 'ω = 10π ≈ 31.4 rad/s and tip speed v = 4π ≈ 12.6 m/s.',
    },
  ],

  challenges: [
    {
      id: 'ch3-016-ch1',
      difficulty: 'medium',
      problem: 'A satellite orbits Earth in a circular orbit at radius r = 7000\\,\\text{km} = 7 \\times 10^6\\,\\text{m} with period T = 6000\\,\\text{s}. Find \\omega, v, and f.',
      hint: 'Apply ω = 2π/T and v = ωr directly. Keep units consistent.',
      walkthrough: [
        {
          expression: '\\omega = \\frac{2\\pi}{6000} \\approx 1.047 \\times 10^{-3}\\,\\text{rad/s}',
          annotation: 'Angular velocity of the orbit.',
        },
        {
          expression: 'v = \\omega r = 1.047 \\times 10^{-3} \\times 7 \\times 10^6 \\approx 7330\\,\\text{m/s} \\approx 7.33\\,\\text{km/s}',
          annotation: 'Orbital speed — typical for low Earth orbit.',
        },
        {
          expression: 'f = \\frac{1}{6000} \\approx 1.67 \\times 10^{-4}\\,\\text{Hz}',
          annotation: 'About 14 orbits per day.',
        },
      ],
      answer: 'ω ≈ 1.05 × 10⁻³ rad/s, v ≈ 7.33 km/s, f ≈ 1.67 × 10⁻⁴ Hz.',
    },
    {
      id: 'ch3-016-ch2',
      difficulty: 'easy',
      problem: 'A wheel rotates at \\omega = 20\\,\\text{rad/s}. Find the period T, frequency f, and the linear speed of a point on the rim at r = 0.3\\,\\text{m}.',
      hint: 'Use T = 2π/ω and v = ωr.',
      walkthrough: [
        {
          expression: 'T = \\frac{2\\pi}{\\omega} = \\frac{2\\pi}{20} = \\frac{\\pi}{10} \\approx 0.314\\,\\text{s}',
          annotation: 'Period from angular velocity.',
        },
        {
          expression: 'f = \\frac{1}{T} = \\frac{10}{\\pi} \\approx 3.18\\,\\text{Hz}',
          annotation: 'About 3.18 revolutions per second.',
        },
        {
          expression: 'v = \\omega r = 20 \\times 0.3 = 6\\,\\text{m/s}',
          annotation: 'Linear rim speed.',
        },
      ],
      answer: 'T ≈ 0.314 s, f ≈ 3.18 Hz, v = 6 m/s.',
    },
  ],
}
