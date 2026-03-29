export default {
  id: 'p1-ch4-008',
  slug: 'pulley-systems',
  chapter: 'p4',
  order: 7,
  title: 'Pulley Systems & the Atwood Machine',
  subtitle: 'Apply Newton\'s second law to each mass separately, then solve the system — the classic constraint problem.',
  tags: ['pulley', 'atwood-machine', 'tension', 'constraint', 'system-of-equations', 'dynamics'],

  hook: {
    question: 'If you hang a 3 kg mass and a 1 kg mass over a frictionless pulley, what is the tension in the rope?',
    realWorldContext: 'Pulleys redirect force. Cranes, elevators, and window-washing rigs all use pulley systems. The Atwood machine — two masses over a single pulley — is the textbook model because it isolates one subtle idea: when two objects are connected, their accelerations are equal in magnitude. You can\'t solve the system by looking at just one mass. You must write Newton\'s second law for each mass separately, then solve together.',
    previewVisualizationId: 'AtwoodMachineSim',
  },

  intuition: {
    prose: [
      'Imagine two tug-of-war teams, one on each end of a rope over a pulley. If both teams are equally matched, nobody moves. If one team is stronger, the heavier side wins — but both sides move at the same speed (the rope doesn\'t stretch). The pulley just changes the direction of force.',
      'A pulley has one powerful property: the tension T in an ideal (massless, frictionless) rope is the same everywhere. The rope pulls m₁ upward with T and pulls m₂ upward with T — the same T. This is the rope\'s "constraint" — it links the two masses.',
      'The key insight: m₁ and m₂ have the same magnitude of acceleration. If m₁ descends by 1 m, m₂ rises by exactly 1 m. The rope just steers the shared motion.',
      'So the system has two unknowns: acceleration a and tension T. You get two equations by applying F = ma to each mass separately. Two equations, two unknowns — the system is fully solvable.',
    ],
    callouts: [
      {
        type: 'insight',
        title: 'The constraint',
        body: 'Because the rope is inextensible, both masses have the same acceleration magnitude: |a₁| = |a₂| = a. This "constraint equation" is what connects the two Newton\'s-law equations into a solvable system.',
      },
      {
        type: 'warning',
        title: 'The tension is NOT equal to either weight',
        body: 'Students often set T = m₁g or T = m₂g. This is wrong — it would only be true if the system were in static equilibrium (a = 0). In a moving Atwood machine, T lies strictly between m₂g and m₁g.',
      },
    ],
    visualizations: [
      {
        id: 'SVGDiagram',
        props: { type: 'pulley-system' },
        title: 'Atwood machine: tension T acts upward on both masses',
        caption: 'Weight W₁ = m₁g pulls m₁ down; tension T pulls it up. Weight W₂ = m₂g pulls m₂ down; tension T pulls it up. Same T, same rope — the masses are coupled.',
      },
      {
        id: 'AtwoodMachineSim',
        title: 'Interactive: adjust m₁ and m₂, watch acceleration and tension update live',
        props: {},
        caption: 'Set m₁ = m₂ and observe a → 0. Increase the imbalance and watch the system accelerate.',
      },
    ],
  },

  math: {
    prose: [
      'Step 1 — Free body diagram for each mass separately. For m₁ (the heavier mass, taking down as positive): net downward force = m₁g − T. Newton\'s 2nd law: m₁g − T = m₁a.',
      'Step 2 — Free body diagram for m₂ (taking upward as positive, since it rises): net upward force = T − m₂g. Newton\'s 2nd law: T − m₂g = m₂a.',
      'Step 3 — Notice both equations share the same a and the same T. Add the two equations to eliminate T:',
      'm₁g − T + T − m₂g = m₁a + m₂a  →  (m₁ − m₂)g = (m₁ + m₂)a',
      'Solving for acceleration: a = (m₁ − m₂)g / (m₁ + m₂)',
      'Substituting back into either equation to find T: T = m₁(g − a) = m₁g − m₁·(m₁−m₂)g/(m₁+m₂)',
      'Simplifying: T = 2m₁m₂g / (m₁ + m₂)',
      'Sanity checks: (1) If m₁ = m₂ = m: a = 0 and T = mg. Correct — balanced system, rope is taut but nothing moves. (2) If m₂ → 0: a → g and T → 0. Correct — m₁ is in free fall, rope goes slack. (3) T is always less than m₁g and greater than m₂g when the system moves.',
    ],
    keyFormulas: [
      { label: 'Atwood acceleration', formula: 'a = \\dfrac{(m_1 - m_2)g}{m_1 + m_2}', note: 'Positive when m₁ > m₂ (m₁ descends)' },
      { label: 'Rope tension', formula: 'T = \\dfrac{2m_1 m_2 g}{m_1 + m_2}', note: 'Same tension throughout the rope' },
      { label: 'Newton\'s 2nd for m₁', formula: 'm_1 g - T = m_1 a', note: 'Downward positive for m₁' },
      { label: 'Newton\'s 2nd for m₂', formula: 'T - m_2 g = m_2 a', note: 'Upward positive for m₂' },
    ],
  },

  rigor: {
    title: 'Deriving the Atwood formulas from Newton\'s 2nd Law',
    content: [
      {
        type: 'paragraph',
        text: 'Define positive directions carefully: let positive be the direction of expected motion (m₁ downward, m₂ upward). This makes both accelerations the same scalar a > 0.',
      },
      {
        type: 'derivation',
        steps: [
          { expression: 'm_1 g - T = m_1 a \\quad (1)', annotation: 'Newton\'s 2nd for m₁: net downward force = m₁a' },
          { expression: 'T - m_2 g = m_2 a \\quad (2)', annotation: 'Newton\'s 2nd for m₂: net upward force = m₂a' },
          { expression: '(1)+(2):\\; m_1 g - m_2 g = (m_1 + m_2)a', annotation: 'Add equations to eliminate T' },
          { expression: 'a = \\frac{(m_1 - m_2)g}{m_1 + m_2}', annotation: 'Acceleration of the system' },
          { expression: 'T = m_2(g + a) = m_2 g + m_2 \\cdot \\frac{(m_1-m_2)g}{m_1+m_2}', annotation: 'From equation (2): T = m₂(g + a)' },
          { expression: 'T = \\frac{m_2 g(m_1+m_2) + m_2 g(m_1-m_2)}{m_1+m_2} = \\frac{2m_1 m_2 g}{m_1+m_2}', annotation: 'Simplify to final tension formula' },
        ],
        answer: 'Both results follow from applying F=ma twice and solving the 2-equation linear system. The arithmetic is algebra — the physics is all in setting up the two free body diagrams correctly.',
      },
    ],
    visualizationId: 'AtwoodDerivation',
  },

  checkpoints: [
    { id: 'p4-008-cp1', question: 'In an Atwood machine with m₁ = 4 kg and m₂ = 2 kg, what is the acceleration of the system? (g = 9.8 m/s²)', answer: '3.27 m/s²' },
    { id: 'p4-008-cp2', question: 'Using the same masses as above, what is the tension in the rope?', answer: '26.1 N' },
    { id: 'p4-008-cp3', question: 'If m₁ = m₂ = 5 kg, what is the acceleration? What is the tension?', answer: 'a = 0 m/s², T = 49 N' },
  ],

  quiz: [
    {
      id: 'p4-008-q1',
      type: 'choice',
      text: 'In an ideal Atwood machine, what is true about the tension T throughout the rope?',
      options: [
        'T equals m₁g (the heavier side)',
        'T equals m₂g (the lighter side)',
        'T is the same throughout the rope and lies between m₂g and m₁g',
        'T changes depending on which side you measure',
      ],
      answer: 'T is the same throughout the rope and lies between m₂g and m₁g',
      hints: ['An ideal pulley is massless and frictionless — it cannot create or absorb tension.'],
      reviewSection: 'Pulley Systems & the Atwood Machine',
    },
    {
      id: 'p4-008-q2',
      type: 'input',
      text: 'An Atwood machine has m₁ = 5 kg and m₂ = 3 kg. What is the acceleration? (g = 10 m/s², give answer in m/s²)',
      answer: '2.5',
      hints: ['Use a = (m₁ − m₂)g / (m₁ + m₂)', 'Numerator: (5−3)×10 = 20. Denominator: 5+3 = 8.'],
      reviewSection: 'The Key Formulas',
    },
    {
      id: 'p4-008-q3',
      type: 'input',
      text: 'With m₁ = 5 kg and m₂ = 3 kg (g = 10 m/s²), what is the tension T in the rope? (in N)',
      answer: '37.5',
      hints: ['T = 2m₁m₂g/(m₁+m₂)', '2×5×3×10 / (5+3) = 300/8 = 37.5'],
      reviewSection: 'The Key Formulas',
    },
    {
      id: 'p4-008-q4',
      type: 'choice',
      text: 'Why can\'t you solve the Atwood machine by looking at just one mass alone?',
      options: [
        'Because gravity only acts on the heavier mass',
        'Because the tension T is unknown — it connects both masses and must be solved for simultaneously',
        'Because pulleys reverse the direction of acceleration',
        'Because Newton\'s 2nd law doesn\'t apply to connected systems',
      ],
      answer: 'Because the tension T is unknown — it connects both masses and must be solved for simultaneously',
      hints: ['Tension is the same throughout the rope, so it appears in both equations.'],
      reviewSection: 'The Constraint',
    },
    {
      id: 'p4-008-q5',
      type: 'choice',
      text: 'If m₁ = m₂ in an Atwood machine, what happens?',
      options: [
        'Both masses fall with acceleration g',
        'The system accelerates slowly',
        'a = 0 and T = mg (the system is in equilibrium)',
        'The rope goes slack',
      ],
      answer: 'a = 0 and T = mg (the system is in equilibrium)',
      hints: ['Plug m₁ = m₂ into a = (m₁−m₂)g/(m₁+m₂).'],
      reviewSection: 'Sanity Checks',
    },
    {
      id: 'p4-008-q6',
      type: 'input',
      text: 'An Atwood machine has m₁ = 6 kg and m₂ = 6 kg (g = 9.8 m/s²). What is the tension T? (in N)',
      answer: '58.8',
      hints: ['When m₁ = m₂ = m, T = 2m²g/(2m) = mg', 'T = 6 × 9.8 = 58.8 N'],
      reviewSection: 'Sanity Checks',
    },
    {
      id: 'p4-008-q7',
      type: 'choice',
      text: 'When writing Newton\'s 2nd law for each mass in the Atwood machine, you choose "down positive" for m₁ and "up positive" for m₂. Why?',
      options: [
        'So that both masses have the same positive acceleration scalar a',
        'So that gravity is negative for both masses',
        'Because tension is always positive',
        'There is no reason — either sign convention works equally well',
      ],
      answer: 'So that both masses have the same positive acceleration scalar a',
      hints: ['If m₁ > m₂, m₁ descends and m₂ rises. Choosing their individual positive directions this way makes |a₁| = |a₂| = a.'],
      reviewSection: 'The Derivation',
    },
    {
      id: 'p4-008-q8',
      type: 'input',
      text: 'A 2 kg mass and a 1 kg mass are connected over a pulley. How far does the heavier mass fall in 2 seconds? (g = 10 m/s², start from rest, answer in m)',
      answer: '6.67',
      hints: ['First find a = (2−1)×10/(2+1) = 10/3 ≈ 3.33 m/s²', 'Then use Δx = ½at² = ½ × (10/3) × 4'],
      reviewSection: 'Applying the Formulas',
    },
    {
      id: 'p4-008-q9',
      type: 'choice',
      text: 'As the mass difference (m₁ − m₂) increases (with m₁ + m₂ held constant), what happens to the acceleration?',
      options: [
        'Acceleration decreases',
        'Acceleration stays the same',
        'Acceleration increases toward g',
        'Acceleration increases without limit',
      ],
      answer: 'Acceleration increases toward g',
      hints: ['a = (m₁−m₂)g/(m₁+m₂). As m₁−m₂ approaches m₁+m₂, a approaches g.'],
      reviewSection: 'The Key Formulas',
    },
    {
      id: 'p4-008-q10',
      type: 'input',
      text: 'In an Atwood machine with m₁ = 4 kg and m₂ = 4 kg, the system is at rest. What is the net force on m₁? (in N)',
      answer: '0',
      hints: ['ΣF = m₁g − T. When m₁ = m₂, T = m₁g, so ΣF = 0.'],
      reviewSection: 'Sanity Checks',
    },
  ],

  viz: [
    { id: 'SVGDiagram', props: { type: 'pulley-system' }, title: 'Atwood machine: forces on each mass' },
    { id: 'AtwoodMachineSim', props: {}, title: 'Interactive Atwood machine' },
  ],
}
