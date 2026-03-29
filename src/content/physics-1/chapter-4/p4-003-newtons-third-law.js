export default {
  id: 'p1-ch4-003',
  slug: 'newtons-third-law',
  chapter: 'p4',
  order: 2,
  title: "Newton's Third Law: Action & Reaction",
  subtitle: 'Every force has an equal and opposite partner — but the two forces act on different objects.',
  tags: ['newtons-laws', 'action-reaction', 'force-pairs', 'momentum', 'dynamics'],

  hook: {
    question: 'If the ground pushes up on you with the same force you push down on it, why do YOU move upward when you jump — not the Earth?',
    realWorldContext: "Newton's Third Law is the most misunderstood of the three laws. Students often think equal-and-opposite forces cancel each other out, making motion impossible. They don't — because they act on DIFFERENT objects. Rockets in space, walking, swimming, and the recoil of a gun all operate through Third Law pairs. Getting this right is essential before tackling any system involving multiple interacting objects.",
    previewVisualizationId: 'ThirdLawIntuition',
  },

  intuition: {
    prose: [
      "Newton's Third Law: for every action force, there is a reaction force equal in magnitude and opposite in direction. Forces always come in pairs — you cannot have a single isolated force.",
      'The critical constraint: the two paired forces act on DIFFERENT objects. Force A acts on object B; the reaction force acts on object A. Never on the same object.',
      "Why doesn't the equal reaction force cancel the action? Because they act on separate systems. When you push a wall, your push acts on the wall; the wall's push (reaction) acts on you. They cannot cancel each other — they affect different objects.",
      "The Earth-jump example: you push down on Earth with ~700 N. Earth pushes you up with 700 N. You accelerate upward by 700/70 = 10 m/s². Earth accelerates 'downward' by 700/(6×10²⁴) ≈ 10⁻²² m/s² — utterly imperceptible.",
    ],
    callouts: [
      {
        type: 'definition',
        title: "Newton's Third Law",
        body: '\\vec{F}_{A\\text{ on }B} = -\\vec{F}_{B\\text{ on }A} \\qquad \\text{(equal magnitude, opposite direction, on different objects)}',
      },
      {
        type: 'insight',
        title: 'Third Law pair checklist',
        body: "A valid Third Law pair: (1) equal magnitude, (2) opposite direction, (3) same type of force (both contact or both gravitational), (4) act on DIFFERENT objects. If any condition fails, it's not a Third Law pair.",
      },
      {
        type: 'insight',
        title: 'Common misconception: balanced forces vs. action-reaction',
        body: "A book on a table: gravity (Earth on book, down) and normal force (table on book, up) are NOT a Third Law pair — they are different force types acting on the SAME object and happen to cancel. The Third Law pairs are: Earth pulls book down ↔ book pulls Earth up; table pushes book up ↔ book pushes table down.",
      },
    ],
    visualizations: [
      {
        id: 'SVGDiagram',
        props: { type: 'action-reaction' },
        title: 'Rocket propulsion: action-reaction pair',
        caption: "The rocket pushes exhaust gas backward (action). The exhaust gas pushes the rocket forward (reaction). The rocket accelerates forward; the exhaust accelerates backward. No external surface is needed — Newton's Third Law works in the vacuum of space.",
      },
      {
        id: 'ThirdLawIntuition',
        title: 'Walking: pushing back, moving forward',
        mathBridge: 'Your foot pushes backward on the ground (action). The ground pushes your foot forward (reaction). The forward reaction force is what accelerates you. Without that reaction, you could not walk — ice skaters on frictionless ice cannot push backward effectively.',
        caption: "You don't walk by pulling yourself forward — you walk by pushing backward on the ground.",
      },
    ],
  },

  math: {
    prose: [
      'The Third Law pair has a simple algebraic statement: F_{A on B} = −F_{B on A}. The magnitudes are equal; the signs are opposite.',
      "When analyzing systems with multiple objects, you apply Newton's Second Law to each object separately. The Third Law tells you the forces that connect them are equal and opposite.",
      "For two objects m₁ and m₂ in contact, the contact force that m₁ exerts on m₂ is equal and opposite to the contact force m₂ exerts on m₁. This is how you 'chain' the equations of motion for connected objects.",
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'Third Law statement',
        body: '|\\vec{F}_{A\\text{ on }B}| = |\\vec{F}_{B\\text{ on }A}|, \\quad \\vec{F}_{A\\text{ on }B} + \\vec{F}_{B\\text{ on }A} = 0',
      },
      {
        type: 'insight',
        title: 'Momentum and the Third Law',
        body: "The Third Law is the reason momentum is conserved in a closed system. Internal forces (Third Law pairs within the system) always cancel: Σ(internal forces) = 0. Only external forces change the system's total momentum.",
      },
    ],
    visualizations: [],
  },

  rigor: {
    prose: [
      "Newton's Third Law is deeply connected to conservation of momentum. Consider an isolated system of two particles. The internal forces F₁₂ and F₂₁ obey the Third Law: F₁₂ = −F₂₁.",
      "By the Second Law: F₁₂ = m₁a₁ = m₁(dv₁/dt) and F₂₁ = m₂a₂ = m₂(dv₂/dt). Adding: F₁₂ + F₂₁ = d(m₁v₁)/dt + d(m₂v₂)/dt = d(p_total)/dt = 0.",
      "Therefore d(p_total)/dt = 0 → p_total = constant. The Third Law directly implies conservation of momentum — without it, momentum conservation would not follow from the laws of motion.",
      "Impulse-momentum preview: integrating F·dt = Δp over a collision, the Third Law guarantees that the impulse on object 1 is equal and opposite to the impulse on object 2. Total momentum change = 0.",
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'Third Law → momentum conservation',
        body: 'F_{12} = -F_{21} \\quad\\Rightarrow\\quad \\frac{d}{dt}(\\vec{p}_1 + \\vec{p}_2) = \\vec{F}_{12} + \\vec{F}_{21} = 0 \\quad\\Rightarrow\\quad \\vec{p}_{\\text{total}} = \\text{const}',
      },
    ],
    visualizationId: 'ThirdLawDerivation',
    proofSteps: [
      {
        title: 'State the Third Law',
        expression: '\\vec{F}_{1\\text{ on }2} = -\\vec{F}_{2\\text{ on }1}',
        annotation: 'Forces are equal in magnitude, opposite in direction.',
      },
      {
        title: "Apply Newton's Second Law to each object",
        expression: '\\vec{F}_{1\\text{ on }2} = m_2 \\vec{a}_2 = m_2 \\frac{d\\vec{v}_2}{dt}, \\quad \\vec{F}_{2\\text{ on }1} = m_1 \\frac{d\\vec{v}_1}{dt}',
        annotation: 'Each object responds to its own net force.',
      },
      {
        title: 'Sum the two force equations',
        expression: 'm_1 \\frac{d\\vec{v}_1}{dt} + m_2 \\frac{d\\vec{v}_2}{dt} = \\vec{F}_{2\\text{ on }1} + \\vec{F}_{1\\text{ on }2} = 0',
        annotation: 'The internal forces cancel because of the Third Law.',
      },
      {
        title: 'Recognize this as total momentum derivative',
        expression: '\\frac{d}{dt}(m_1 \\vec{v}_1 + m_2 \\vec{v}_2) = \\frac{d\\vec{p}_{\\text{total}}}{dt} = 0',
        annotation: 'Total momentum is the quantity whose derivative is zero.',
      },
      {
        title: 'Conclusion: momentum is conserved',
        expression: '\\vec{p}_{\\text{total}} = m_1 \\vec{v}_1 + m_2 \\vec{v}_2 = \\text{constant}',
        annotation: "Conservation of momentum is a direct consequence of Newton's Third Law applied to an isolated system.",
      },
    ],
    title: "Derivation: Conservation of Momentum from Newton's Third Law",
    visualizations: [
      {
        id: 'ThirdLawDerivation',
        title: 'Third Law pairs and momentum conservation',
        mathBridge: 'When internal force pairs cancel (Third Law), dp_total/dt = 0. This is the calculus statement of momentum conservation — and it follows directly from the Third Law.',
        caption: 'Third Law → internal forces cancel → total momentum is constant.',
      },
    ],
  },

  examples: [
    {
      id: 'ch4-003-ex1',
      title: 'Identifying Third Law pairs for a book on a table',
      problem: "A 1 kg book rests on a table. List all Third Law force pairs. Identify which forces are balanced forces on a single object and which are Third Law pairs.",
      steps: [
        {
          expression: '\\text{Forces on the book: } W_{\\text{Earth on book}} = 10\\,\\text{N (down)}, \\quad N_{\\text{table on book}} = 10\\,\\text{N (up)}',
          annotation: 'These two forces act on the SAME object (book) and happen to cancel. They are NOT a Third Law pair — gravity and normal force are different types.',
        },
        {
          expression: '\\text{Third Law pair 1: } W_{\\text{Earth on book}} \\leftrightarrow W_{\\text{book on Earth}} \\;(10\\,\\text{N up on Earth})',
          annotation: "Both gravitational forces. Earth pulls book down; book pulls Earth up — same magnitude, opposite direction, on different objects.",
        },
        {
          expression: '\\text{Third Law pair 2: } N_{\\text{table on book}} \\leftrightarrow N_{\\text{book on table}} \\;(10\\,\\text{N down on table})',
          annotation: 'Both contact/normal forces. Table pushes book up; book pushes table down.',
        },
      ],
      conclusion: "There are 2 Third Law pairs. The balanced forces on the book (gravity + normal) are NOT a Third Law pair — they are different types of forces on the same object. Always distinguish 'balanced forces on one object' from 'Third Law pairs on different objects.'",
    },
    {
      id: 'ch4-003-ex2',
      title: 'Rocket propulsion in space',
      problem: 'A 500 kg rocket in deep space ejects exhaust gas at 800 m/s backward. The thrust (reaction force on rocket) is 4000 N. Find the rocket\'s acceleration. Then explain using the Third Law.',
      steps: [
        {
          expression: 'F_{\\text{thrust}} = 4000\\,\\text{N \\;(forward, reaction force on rocket)}',
          annotation: 'The reaction force from the ejected gas pushes the rocket forward.',
        },
        {
          expression: 'a = \\frac{F}{m} = \\frac{4000}{500} = 8\\,\\text{m/s}^2 \\;(\\text{forward})',
          annotation: "Apply Newton's Second Law to the rocket alone.",
        },
        {
          expression: '\\text{Third Law: } F_{\\text{rocket on gas}} = 4000\\,\\text{N backward}; \\quad F_{\\text{gas on rocket}} = 4000\\,\\text{N forward}',
          annotation: 'Equal in magnitude, opposite in direction, on different objects.',
        },
      ],
      conclusion: "The rocket accelerates at 8 m/s² forward. No ground or air is needed — the reaction force of the ejected gas IS the thrust. This works in vacuum because Newton's Third Law doesn't require a medium.",
    },
  ],

  challenges: [
    {
      id: 'ch4-003-ch1',
      difficulty: 'easy',
      problem: 'A 70 kg person stands on a scale in an elevator at rest. (a) What does the scale read? (b) The elevator accelerates upward at 2 m/s². What does the scale read now? Use g = 10 m/s².',
      hint: 'The scale reads the Normal force, not the weight. Use ΣF = ma on the person for part (b).',
      walkthrough: [
        {
          expression: '\\text{(a) At rest: } N = mg = 70 \\times 10 = 700\\,\\text{N}',
          annotation: 'Equilibrium: N = mg. The scale reads 700 N (≈70 kg).',
        },
        {
          expression: '\\text{(b) } \\sum F_y = N - mg = ma \\quad\\Rightarrow\\quad N = m(g+a) = 70(10+2) = 840\\,\\text{N}',
          annotation: 'Net upward force accelerates the person upward. N must exceed mg.',
        },
      ],
      answer: '(a) 700 N; (b) 840 N. The person feels "heavier" when accelerating upward.',
    },
    {
      id: 'ch4-003-ch2',
      difficulty: 'medium',
      problem: "Two skaters on frictionless ice: skater A (60 kg) pushes skater B (40 kg) with 120 N for 0.5 s. Find: (a) the force on A from B, (b) acceleration of each, (c) velocity of each after 0.5 s, (d) confirm momentum is conserved.",
      hint: 'Third Law: force on A from B = −120 N. Apply F = ma to each separately. Then check total momentum before and after.',
      walkthrough: [
        {
          expression: 'F_{\\text{B on A}} = -120\\,\\text{N} \\;(\\text{opposite to push})',
          annotation: "Third Law: reaction force on A equals 120 N in the opposite direction.",
        },
        {
          expression: 'a_A = \\frac{-120}{60} = -2\\,\\text{m/s}^2, \\quad a_B = \\frac{+120}{40} = +3\\,\\text{m/s}^2',
          annotation: 'Apply F = ma to each skater.',
        },
        {
          expression: 'v_A = 0 + (-2)(0.5) = -1\\,\\text{m/s}, \\quad v_B = 0 + 3(0.5) = 1.5\\,\\text{m/s}',
          annotation: 'Use v = v₀ + at with v₀ = 0 for both (started at rest).',
        },
        {
          expression: 'p_{\\text{before}} = 0, \\quad p_{\\text{after}} = 60(-1) + 40(1.5) = -60 + 60 = 0\\,\\checkmark',
          annotation: 'Total momentum is conserved: 0 before and 0 after. Third Law ensures this.',
        },
      ],
      answer: 'Force on A = 120 N (backward); aₐ = −2 m/s², a_B = 3 m/s²; vₐ = −1 m/s, v_B = 1.5 m/s; momentum is conserved (both equal zero).',
    },
  ],

  viz: [
    { id: 'SVGDiagram', props: { type: 'action-reaction' }, title: 'Action-reaction force pairs' },
  ],
}
