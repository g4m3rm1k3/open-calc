export default {
  id: 'p1-ch4-001',
  slug: 'newtons-first-law',
  chapter: 'p4',
  order: 0,
  title: "Newton's First Law: Inertia",
  subtitle: 'Objects in motion stay in motion — and objects at rest stay at rest — unless acted on by an unbalanced force.',
  tags: ['newtons-laws', 'inertia', 'equilibrium', 'force', 'dynamics'],

  hook: {
    question: 'Why do passengers lurch forward when a bus suddenly brakes — even though nothing pushed them forward?',
    realWorldContext: "Every seatbelt, every spacecraft trajectory, and every magic tablecloth trick exploits Newton's First Law. Before Newton, Aristotle convinced nearly everyone that objects naturally slow down and stop — that motion requires a continuous push. Newton (and Galileo before him) showed this was completely backwards. Understanding WHY objects keep moving is the foundation of all dynamics.",
    previewVisualizationId: 'InertiaIntuition',
  },

  intuition: {
    prose: [
      "Aristotle's view: a moving object eventually stops because 'motion requires a mover.' This seemed obvious — push a box, it slides, then stops. The problem is that Aristotle was explaining friction, not motion itself.",
      "Galileo's insight (polished surfaces, reduced friction): the LESS friction you have, the FARTHER an object travels before stopping. Extrapolate to zero friction — the object never stops. Motion is the natural state, not rest.",
      "Newton formalized this: in the absence of a net force, an object's velocity vector remains constant. Constant velocity means constant speed AND constant direction. Any change in either — speeding up, slowing down, or turning — requires a net force.",
      "Inertia is the property of matter that resists changes to velocity. More mass = more inertia = harder to accelerate or decelerate. A loaded freight train is nearly impossible to stop quickly; a ping-pong ball stops almost instantly.",
    ],
    callouts: [
      {
        type: 'definition',
        title: "Newton's First Law (Law of Inertia)",
        body: "An object at rest remains at rest, and an object in motion remains in motion at constant velocity, unless acted upon by a net external force.",
      },
      {
        type: 'definition',
        title: 'Inertia',
        body: "The tendency of an object to resist any change in its state of motion. Inertia is measured by mass — the more massive the object, the greater its inertia.",
      },
      {
        type: 'insight',
        title: 'Aristotle vs. Newton',
        body: "Aristotle: objects naturally come to rest. Newton: objects naturally MAINTAIN their motion. Friction is the force that stops objects on Earth — remove it, and motion continues forever.",
      },
      {
        type: 'insight',
        title: 'What is an inertial reference frame?',
        body: "Newton's First Law defines an inertial reference frame: any frame where an object with no net force moves at constant velocity. A non-accelerating lab is inertial; an accelerating car is not.",
      },
    ],
    visualizations: [
      {
        id: 'SVGDiagram',
        props: { type: 'inertia-objects' },
        title: 'Objects in deep space with no net force',
        caption: "Far from all gravitational sources, these objects travel in perfectly straight lines at constant speed indefinitely. There is nothing to slow them down, speed them up, or change their direction — Newton's First Law in its purest form.",
      },
      {
        id: 'InertiaIntuition',
        title: 'Seatbelt scenario: sudden deceleration',
        mathBridge: 'When the car decelerates, the passenger continues forward at the original velocity v₀ until the seatbelt exerts a backward force. Without the belt, the passenger would continue at v₀ — First Law in action.',
        caption: "The passenger is not 'thrown forward' — they simply continue at the speed they had before braking. The car stops; the passenger (without a seatbelt) does not.",
      },
    ],
  },

  math: {
    prose: [
      "The mathematical content of the First Law is clean: if ΣF = 0, then a = 0, and therefore v = constant. In the absence of net force, velocity does not change.",
      "For position: if v = v₀ = constant, then integrating once gives x(t) = x₀ + v₀t. This is a linear function of time — a straight line on an x-t graph. The slope IS the (constant) velocity.",
      "This is the simplest possible kinematics case: uniform motion. Every more-complex case (acceleration, changing forces) builds on this base by adding nonzero net forces.",
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'First Law in equations',
        body: '\\sum \\vec{F} = 0 \\quad\\Rightarrow\\quad \\vec{a} = 0 \\quad\\Rightarrow\\quad \\vec{v} = \\vec{v}_0 = \\text{constant}',
      },
      {
        type: 'theorem',
        title: 'Position under constant velocity',
        body: 'x(t) = x_0 + v_0 t \\qquad \\text{(linear in time when } a = 0\\text{)}',
      },
      {
        type: 'insight',
        title: 'Balanced forces ≠ no forces',
        body: "An object can have many forces acting on it and still be in First Law conditions — as long as they sum to zero (balanced). A book on a table has gravity pulling down and the normal force pushing up; ΣF = 0, so the book doesn't accelerate.",
      },
    ],
    visualizations: [],
  },

  rigor: {
    prose: [
      "The First Law is both a physical statement and a definition. Physically, it asserts that all isolated objects (no external forces) maintain constant velocity — this has been confirmed to extraordinary precision in particle physics and space missions.",
      "Mathematically, 'no net force' means ΣF = 0. From Newton's Second Law (F = ma), this gives a = 0. Zero acceleration means dv/dt = 0, so v is constant with respect to time.",
      "Integrating dv/dt = 0 once: v(t) = C₁ = v₀. Integrating the velocity equation dx/dt = v₀: x(t) = v₀t + C₂ = x₀ + v₀t. This is a linear function — the position graph is a straight line with slope v₀.",
      "Calculus connection: the First Law says that when ΣF = 0, the second derivative of position is zero (d²x/dt² = 0). The general solution to d²x/dt² = 0 is a first-degree polynomial: x(t) = x₀ + v₀t. Constant velocity IS the solution to a zero-force differential equation.",
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'Derivation from zero-force condition',
        body: '\\frac{d^2x}{dt^2} = \\frac{a}{1} = \\frac{\\sum F}{m} = 0 \\quad\\Rightarrow\\quad \\frac{dx}{dt} = v_0 \\quad\\Rightarrow\\quad x(t) = x_0 + v_0 t',
      },
    ],
    visualizationId: 'InertiaDerivation',
    proofSteps: [
      {
        title: 'Assume no net force',
        expression: '\\sum \\vec{F} = 0',
        annotation: 'Either no forces act, or all forces cancel (vector sum is zero).',
      },
      {
        title: "Apply Newton's Second Law",
        expression: '\\vec{a} = \\frac{\\sum \\vec{F}}{m} = \\frac{0}{m} = 0',
        annotation: 'If net force is zero, acceleration is zero regardless of mass.',
      },
      {
        title: 'Integrate acceleration to get velocity',
        expression: '\\vec{v}(t) = \\int \\vec{a}\\,dt = \\int 0\\,dt = \\vec{v}_0',
        annotation: 'Velocity is constant — equal to whatever it was at t = 0.',
      },
      {
        title: 'Integrate velocity to get position',
        expression: 'x(t) = \\int v_0\\,dt = x_0 + v_0 t',
        annotation: 'Position is a linear function of time. The x-t graph is a straight line.',
      },
      {
        title: 'Conclusion',
        expression: '\\text{If } \\sum F = 0: \\quad x(t) = x_0 + v_0 t, \\quad v = v_0, \\quad a = 0',
        annotation: 'Constant velocity is the unique motion when no net force acts.',
      },
    ],
    title: "Derivation: First Law from the calculus of Newton's Second Law",
    visualizations: [
      {
        id: 'InertiaDerivation',
        title: 'From zero force to linear position',
        mathBridge: 'Setting d²x/dt² = 0 and integrating twice yields the linear position equation x(t) = x₀ + v₀t. The First Law is the zero-force special case of the Second Law.',
        caption: 'Zero second derivative → linear function. This is the calculus foundation of inertia.',
      },
    ],
  },

  examples: [
    {
      id: 'ch4-001-ex1',
      title: 'Spacecraft in deep space',
      problem: 'A spacecraft traveling at 3000 m/s fires its engines briefly to escape a planet, then shuts them off. Far from all gravitational sources, no forces act on it. Describe its motion for the next 10 hours.',
      steps: [
        {
          expression: '\\sum \\vec{F} = 0 \\quad \\text{(engines off, deep space)}',
          annotation: 'No thrust, no gravity — the net force is exactly zero.',
        },
        {
          expression: '\\vec{a} = 0 \\quad\\Rightarrow\\quad \\vec{v} = 3000\\,\\text{m/s} = \\text{constant}',
          annotation: "By Newton's First Law, velocity remains constant at 3000 m/s.",
        },
        {
          expression: 'd = v \\cdot t = 3000\\,\\frac{\\text{m}}{\\text{s}} \\times (10 \\times 3600\\,\\text{s}) = 1.08 \\times 10^8\\,\\text{m}',
          annotation: 'Convert 10 hours to seconds, multiply by constant speed.',
        },
      ],
      conclusion: 'The spacecraft travels 108,000 km in a perfectly straight line at exactly 3000 m/s — no fuel required. Voyager 1 does exactly this in the space between star systems.',
    },
    {
      id: 'ch4-001-ex2',
      title: 'Book on a table — identifying balanced forces',
      problem: 'A 2 kg textbook sits motionless on a horizontal table. Identify all forces acting on it, determine whether they are balanced, and justify using Newton\'s First Law. Use g = 10 m/s².',
      steps: [
        {
          expression: 'W = mg = 2 \\times 10 = 20\\,\\text{N}\\;(\\text{downward})',
          annotation: "Weight: Earth's gravitational pull on the book.",
        },
        {
          expression: 'N = 20\\,\\text{N}\\;(\\text{upward})',
          annotation: "Normal force from the table surface — Newton's Third Law response to the book pressing on the table.",
        },
        {
          expression: '\\sum F_y = N - W = 20 - 20 = 0\\,\\text{N}',
          annotation: 'Net vertical force is zero. No horizontal forces act.',
        },
        {
          expression: '\\sum \\vec{F} = 0 \\quad\\Rightarrow\\quad a = 0',
          annotation: "By Newton's First Law, the book remains at rest. This is consistent with observation.",
        },
      ],
      conclusion: "The book has two forces acting on it (weight down, normal up) that are equal and opposite, giving ΣF = 0. Newton's First Law predicts zero acceleration — exactly what we observe.",
    },
  ],

  challenges: [
    {
      id: 'ch4-001-ch1',
      difficulty: 'easy',
      problem: 'A hockey puck slides on frictionless ice at 8 m/s. What is its speed after 5 seconds? What is its acceleration? How far does it travel in 5 s?',
      hint: 'On frictionless ice, what is the net force? Apply the First Law.',
      walkthrough: [
        {
          expression: '\\sum F = 0 \\quad\\Rightarrow\\quad a = 0',
          annotation: 'No friction, no air resistance — net force is zero.',
        },
        {
          expression: 'v = 8\\,\\text{m/s} \\;(\\text{unchanged}), \\quad a = 0\\,\\text{m/s}^2',
          annotation: 'Velocity stays constant at 8 m/s by the First Law.',
        },
        {
          expression: 'd = v_0 t = 8 \\times 5 = 40\\,\\text{m}',
          annotation: 'Uniform motion: distance = constant speed × time.',
        },
      ],
      answer: 'Speed = 8 m/s (unchanged), acceleration = 0 m/s², distance = 40 m.',
    },
    {
      id: 'ch4-001-ch2',
      difficulty: 'medium',
      problem: "A 5 kg box sits on a table. Someone pushes it horizontally with 20 N but it doesn't move. (a) What is the net force on the box? (b) What is the friction force? (c) Is the box in First Law conditions?",
      hint: "If the box doesn't accelerate, what must ΣF equal? Use that to find friction.",
      walkthrough: [
        {
          expression: 'a = 0 \\;(\\text{box stationary}) \\quad\\Rightarrow\\quad \\sum F = ma = 0',
          annotation: "Zero acceleration means zero net force, by Newton's Second Law.",
        },
        {
          expression: 'F_{\\text{push}} + F_{\\text{friction}} = 0 \\quad\\Rightarrow\\quad F_{\\text{friction}} = -20\\,\\text{N}',
          annotation: 'Static friction exactly cancels the applied push. It equals 20 N backward.',
        },
        {
          expression: '\\sum F = 0 \\quad\\Rightarrow\\quad \\text{Yes, the box is in First Law (equilibrium) conditions}',
          annotation: 'Multiple forces act, but they balance. First Law applies.',
        },
      ],
      answer: 'Net force = 0 N, friction force = 20 N (opposing push), yes the box is in First Law equilibrium.',
    },
    {
      id: 'ch4-001-ch3',
      difficulty: 'hard',
      problem: "An object at position x₀ = 5 m has velocity v₀ = −3 m/s (moving left). No net force acts. Write x(t), find when it crosses x = 0, and identify what the x-t graph looks like.",
      hint: 'Use x(t) = x₀ + v₀t with the given values. Set x = 0 and solve for t.',
      walkthrough: [
        {
          expression: 'x(t) = x_0 + v_0 t = 5 + (-3)t = 5 - 3t',
          annotation: 'Linear position equation — valid because a = 0 (no net force).',
        },
        {
          expression: '0 = 5 - 3t \\quad\\Rightarrow\\quad t = \\tfrac{5}{3} \\approx 1.67\\,\\text{s}',
          annotation: 'Set x = 0 and solve. The object crosses the origin at t ≈ 1.67 s.',
        },
        {
          expression: '\\text{x-t graph: straight line, slope} = v_0 = -3\\,\\text{m/s, y-intercept} = 5\\,\\text{m}',
          annotation: 'Zero acceleration → linear (not parabolic) position graph.',
        },
      ],
      answer: 'x(t) = 5 − 3t; crosses x = 0 at t = 5/3 ≈ 1.67 s; the x-t graph is a downward-sloping straight line.',
    },
  ],
}
