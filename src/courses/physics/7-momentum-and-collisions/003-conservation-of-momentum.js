export default {
  id: 'p1-ch6-003',
  slug: 'momentum-conservation',
  chapter: 'p6',
  order: 3,
  title: 'Conservation of Momentum and Collisions',
  subtitle: 'Elastic, inelastic, and perfectly inelastic — one law, three types of collision.',
  tags: ['conservation of momentum', 'elastic collision', 'inelastic collision', 'perfectly inelastic', 'coefficient of restitution'],

  hook: {
    question:
      'Two identical billiard balls: one is moving at 3 m/s east, the other is stationary. They collide head-on. After the collision, predict what happens: (a) both move east at 1.5 m/s, (b) the first stops and the second moves at 3 m/s, (c) the first bounces back and both move. Which is correct — and what decides between them?',
    realWorldContext:
      'Collisions govern everything from particle physics experiments to car accident reconstruction. The type of collision (elastic vs inelastic) determines how much kinetic energy is lost. Forensic engineers use momentum conservation to reconstruct accidents — the final positions of vehicles uniquely determine their pre-collision speeds.',
    previewVisualizationId: 'SVGDiagram',
  },

  intuition: {
    prose: [
      '**The answer is (b)** — the moving ball stops and the stationary ball moves at the original speed. This is the elastic collision between equal masses, and it is a striking result: the first ball completely transfers all its momentum. It feels magical but follows directly from two conditions: conservation of momentum AND conservation of kinetic energy.',

      '**Three collision types — one conservation law:**',
      '1. **Elastic:** Momentum conserved AND KE conserved. Atoms, billiard balls (approximately), Newton\'s cradle. Objects bounce off with the same total energy.',
      '2. **Inelastic:** Momentum conserved, KE partially lost. Most real-world collisions (cars, balls with deformation). Energy goes to heat, sound, and deformation.',
      '3. **Perfectly inelastic:** Objects stick together after collision. Maximum kinetic energy is lost (some must remain to conserve momentum). A bullet embedding in a block, two cars latching bumpers.',

      '**The key insight:** In ALL three types, momentum is conserved (as long as no external force acts). What distinguishes them is what happens to kinetic energy. You cannot conserve momentum and also lose all kinetic energy — some KE must survive to carry the momentum.',
    ],
    callouts: [
      {
        type: 'sequencing',
        title: 'Lesson 3 of 3 — Collisions: where momentum meets energy',
        body:
          '**Chapter 5:** Energy is conserved in closed systems (KE + PE = const for conservative forces).\n**Chapter 6 so far:** Momentum is a vector conserved when net external force = 0.\n**This lesson:** Collisions combine both — momentum always conserved; energy conserved only in elastic collisions.\n**Chapter 7 next:** Rotation — the same laws of mechanics, but for spinning objects.',
      },
      {
        type: 'definition',
        title: 'Three collision types',
        body:
          '**Elastic:** \\(p_1 + p_2 = \\text{const}\\) AND \\(KE_1 + KE_2 = \\text{const}\\)\n**Inelastic:** \\(p_1 + p_2 = \\text{const}\\), \\(KE\\) decreases\n**Perfectly inelastic:** Objects stick: \\((m_1 + m_2)v_f = m_1v_{1i} + m_2v_{2i}\\)',
      },
      {
        type: 'warning',
        title: 'Momentum is always conserved — energy may not be',
        body:
          'Never apply energy conservation to a collision unless told it is elastic. Most collisions are inelastic. Momentum conservation always holds; kinetic energy conservation does not.',
      },
      {
        type: 'insight',
        title: 'Elastic collision formula for equal masses',
        body:
          'Equal masses, elastic: \\(v_{1f} = v_{2i}\\) and \\(v_{2f} = v_{1i}\\). The velocities exchange. This is Newton\'s cradle — each ball stops and passes its momentum to the next.',
      },
    ],
    visualizations: [
      {
        id: 'SVGDiagram',
        props: { type: 'collision-types' },
        title: 'Three collision types — before and after',
        caption:
          'Elastic: arrows swap (equal masses) or recalculate. Inelastic: shorter arrows after (energy lost). Perfectly inelastic: single combined arrow after. In all cases, the vector sum of momentum arrows is the same before and after.',
      },
    ],
  },

  math: {
    prose: [
      '**Conservation of momentum (all collision types):**',
      '\\(m_1v_{1i} + m_2v_{2i} = m_1v_{1f} + m_2v_{2f}\\)',
      '**For elastic collisions (add the energy equation):**',
      '\\(\\tfrac{1}{2}m_1v_{1i}^2 + \\tfrac{1}{2}m_2v_{2i}^2 = \\tfrac{1}{2}m_1v_{1f}^2 + \\tfrac{1}{2}m_2v_{2f}^2\\)',
      '**Elastic collision result (solving both equations simultaneously):**',
      '\\(v_{1f} = \\dfrac{m_1 - m_2}{m_1 + m_2}v_{1i} + \\dfrac{2m_2}{m_1+m_2}v_{2i}\\)',
      '\\(v_{2f} = \\dfrac{2m_1}{m_1 + m_2}v_{1i} + \\dfrac{m_2-m_1}{m_1+m_2}v_{2i}\\)',
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'Perfectly inelastic collision',
        body: '(m_1 + m_2)v_f = m_1 v_{1i} + m_2 v_{2i}',
      },
      {
        type: 'insight',
        title: 'Coefficient of restitution (elasticity measure)',
        body:
          '\\(e = \\dfrac{v_{2f} - v_{1f}}{v_{1i} - v_{2i}}\\) where \\(0 \\leq e \\leq 1\\). \\(e = 1\\): perfectly elastic. \\(e = 0\\): perfectly inelastic. A rubber ball on concrete has \\(e \\approx 0.7\\); a clay ball has \\(e \\approx 0\\).',
      },
    ],
    visualizations: [
      {
        id: 'SVGDiagram',
        props: { type: 'elastic-head-on' },
        title: 'Elastic head-on: the velocity exchange formula',
        caption:
          'Drag the mass ratio slider. When m₁ = m₂: velocities exchange (Newton\'s cradle). When m₁ >> m₂: the heavy ball barely slows; the light ball flies off fast.',
      },
    ],
  },

  rigor: {
    title: 'Elastic collision formulas: solving two equations simultaneously',
    prose: [
      'We have two unknowns (v₁f, v₂f) and two equations (momentum + energy). Solve simultaneously.',
    ],
    proofSteps: [
      {
        expression: 'm_1 v_{1i} + m_2 v_{2i} = m_1 v_{1f} + m_2 v_{2f} \\quad (1)',
        annotation: 'Momentum conservation.',
      },
      {
        expression: '\\tfrac{1}{2}m_1 v_{1i}^2 + \\tfrac{1}{2}m_2 v_{2i}^2 = \\tfrac{1}{2}m_1 v_{1f}^2 + \\tfrac{1}{2}m_2 v_{2f}^2 \\quad (2)',
        annotation: 'Energy conservation (elastic only).',
      },
      {
        expression: 'm_1(v_{1i} - v_{1f}) = m_2(v_{2f} - v_{2i}) \\quad (\\text{from 1})',
        annotation: 'Rearrange equation 1: group masses.',
      },
      {
        expression: 'm_1(v_{1i}^2 - v_{1f}^2) = m_2(v_{2f}^2 - v_{2i}^2) \\quad (\\text{from 2})',
        annotation: 'Rearrange equation 2: difference of squares → (a−b)(a+b).',
      },
      {
        expression: 'v_{1i} + v_{1f} = v_{2f} + v_{2i} \\quad (\\text{divide eq 2 by eq 1})',
        annotation: 'Key result: in elastic collision, relative approach speed = relative separation speed.',
      },
      {
        expression:
          'v_{1f} = \\frac{m_1-m_2}{m_1+m_2}v_{1i} + \\frac{2m_2}{m_1+m_2}v_{2i}, \\quad v_{2f} = \\frac{2m_1}{m_1+m_2}v_{1i} + \\frac{m_2-m_1}{m_1+m_2}v_{2i}',
        annotation: 'Substitute back to get the closed-form elastic collision result.',
      },
    ],
  },

  examples: [
    {
      id: 'ch6-003-ex1',
      title: 'Perfectly inelastic — cars merge in collision',
      problem:
        '\\text{Car A (1500 kg, 20 m/s east) rear-ends Car B (1200 kg, 10 m/s east, same direction). They lock bumpers. Find final velocity and energy lost.}',
      steps: [
        {
          expression: '(1500)(20) + (1200)(10) = (2700)v_f',
          annotation: 'Perfectly inelastic: objects stick together.',
        },
        {
          expression: '30000 + 12000 = 2700v_f \\Rightarrow v_f = 42000/2700 \\approx 15.6\\,\\text{m/s}',
          annotation: 'Final velocity of combined system.',
        },
        {
          expression: 'KE_i = \\tfrac{1}{2}(1500)(400) + \\tfrac{1}{2}(1200)(100) = 300000 + 60000 = 360000\\,\\text{J}',
          annotation: 'Initial kinetic energy.',
        },
        {
          expression: 'KE_f = \\tfrac{1}{2}(2700)(15.6)^2 \\approx 328000\\,\\text{J}',
          annotation: 'Final kinetic energy.',
        },
        {
          expression: '\\Delta KE = 360000 - 328000 = 32000\\,\\text{J lost}',
          annotation: '32 kJ became heat, sound, and deformation.',
        },
      ],
      conclusion: 'Final speed ≈ 15.6 m/s. 32 kJ lost to inelastic deformation.',
    },
    {
      id: 'ch6-003-ex2',
      title: 'Elastic collision — billiard balls',
      problem:
        '\\text{Ball 1 (0.5 kg, 6 m/s) hits stationary Ball 2 (0.5 kg). Elastic. Find final velocities.}',
      steps: [
        {
          expression: 'v_{1f} = \\frac{0.5-0.5}{0.5+0.5}(6) + 0 = 0\\,\\text{m/s}',
          annotation: 'Equal masses: first ball stops completely.',
        },
        {
          expression: 'v_{2f} = \\frac{2(0.5)}{0.5+0.5}(6) + 0 = 6\\,\\text{m/s}',
          annotation: 'Second ball moves at first ball\'s original speed. Complete velocity transfer.',
        },
      ],
      conclusion: 'Ball 1 stops; Ball 2 moves at 6 m/s. Newton\'s cradle in action.',
    },
  ],

  challenges: [
    {
      id: 'ch6-003-ch1',
      difficulty: 'easy',
      problem:
        '\\text{A 3 kg block (4 m/s) collides with a 1 kg stationary block. They stick together. Find final speed.}',
      hint: 'Perfectly inelastic: (m₁ + m₂)v_f = m₁v₁ᵢ.',
      walkthrough: [
        { expression: '(3+1)v_f = 3(4) \\Rightarrow v_f = 3\\,\\text{m/s}', annotation: 'Momentum conservation.' },
      ],
      answer: 'v_f = 3 m/s.',
    },
    {
      id: 'ch6-003-ch2',
      difficulty: 'medium',
      problem:
        '\\text{Ball A (2 kg, 5 m/s east) collides elastically with Ball B (3 kg, stationary). Find both final velocities.}',
      hint: 'Use the elastic collision formulas. m₁ = 2, m₂ = 3, v₁ᵢ = 5, v₂ᵢ = 0.',
      walkthrough: [
        {
          expression: 'v_{1f} = \\frac{2-3}{2+3}(5) = \\frac{-1}{5}(5) = -1\\,\\text{m/s}',
          annotation: 'Ball A bounces back! (Lighter ball hitting heavier ball rebounds.)',
        },
        {
          expression: 'v_{2f} = \\frac{2(2)}{2+3}(5) = \\frac{4}{5}(5) = 4\\,\\text{m/s}',
          annotation: 'Ball B moves forward at 4 m/s.',
        },
      ],
      answer: 'v₁f = −1 m/s (bounces back), v₂f = 4 m/s (forward).',
    },
    {
      id: 'ch6-003-ch3',
      difficulty: 'hard',
      problem:
        '\\text{A 5 kg block at rest on a frictionless surface is hit by a 0.05 kg bullet at 600 m/s. The bullet passes through, exiting at 200 m/s. Find the block\'s final speed, and check energy budget.}',
      hint: 'Momentum conservation for block speed. Then compare KE before and after.',
      walkthrough: [
        {
          expression: '(0.05)(600) + 0 = (0.05)(200) + 5v_f \\Rightarrow 30 = 10 + 5v_f \\Rightarrow v_f = 4\\,\\text{m/s}',
          annotation: 'Momentum conservation.',
        },
        {
          expression: 'KE_i = \\tfrac{1}{2}(0.05)(600)^2 = 9000\\,\\text{J}',
          annotation: 'Initial KE (bullet).',
        },
        {
          expression: 'KE_f = \\tfrac{1}{2}(0.05)(200)^2 + \\tfrac{1}{2}(5)(16) = 1000 + 40 = 1040\\,\\text{J}',
          annotation: 'Final KE.',
        },
        {
          expression: '\\text{Energy lost} = 9000 - 1040 = 7960\\,\\text{J}',
          annotation: 'About 88% of KE is lost — mostly as heat from friction in the block.',
        },
      ],
      answer: 'Block speed = 4 m/s. KE lost ≈ 7960 J (88%).',
    },
  ],

  quiz: [
    {
      id: 'p6-003-q1',
      type: 'choice',
      text: 'Two equal masses collide elastically, one initially at rest. After the collision:',
      options: [
        'Both move at half the original speed',
        'The moving mass stops; the stationary mass moves at the original speed',
        'The moving mass continues, the stationary one bounces back',
        'Both stop',
      ],
      answer: 'The moving mass stops; the stationary mass moves at the original speed',
      hints: ['Apply p and KE conservation for equal masses m₁=m₂. Result: v₁_f = 0, v₂_f = v₁_i.'],
      reviewSection: 'Intuition — billiard ball example',
    },
    {
      id: 'p6-003-q2',
      type: 'choice',
      text: 'In a perfectly inelastic collision, the lost kinetic energy goes to:',
      options: [
        'Potential energy',
        'Heat, sound, and permanent deformation',
        'Momentum of the system',
        'The kinetic energy is not lost',
      ],
      answer: 'Heat, sound, and permanent deformation',
      hints: ['Perfectly inelastic = objects stick together. KE is converted to thermal/acoustic/deformation energy. Momentum is still conserved.'],
      reviewSection: 'Math — perfectly inelastic collisions',
    },
    {
      id: 'p6-003-q3',
      type: 'input',
      text: 'A 3 kg ball at 8 m/s east collides perfectly inelastically with a 5 kg ball at rest. Find the final speed in m/s.',
      answer: '3',
      hints: ['p_i = 3×8 = 24 kg·m/s. v_f = p_i/(m₁+m₂) = 24/8 = 3 m/s.'],
      reviewSection: 'Math — perfectly inelastic formula',
    },
    {
      id: 'p6-003-q4',
      type: 'choice',
      text: 'Momentum is conserved in ALL collision types. What distinguishes elastic from inelastic?',
      options: [
        'Elastic conserves momentum; inelastic does not',
        'Elastic conserves BOTH momentum and kinetic energy; inelastic only conserves momentum',
        'Inelastic conserves kinetic energy; elastic does not',
        'Elastic requires equal masses',
      ],
      answer: 'Elastic conserves BOTH momentum and kinetic energy; inelastic only conserves momentum',
      hints: ['Conservation of momentum: always (isolated system). Conservation of KE: only in elastic collisions.'],
      reviewSection: 'Math — elastic vs inelastic',
    },
    {
      id: 'p6-003-q5',
      type: 'input',
      text: 'A 1500 kg car at 12 m/s rear-ends a stationary 1200 kg car. They stick together. Find the combined speed in m/s.',
      answer: '6.67',
      hints: ['1500×12 = (1500+1200)×v_f. v_f = 18000/2700 = 6.67 m/s.'],
      reviewSection: 'Math — perfectly inelastic collision',
    },
    {
      id: 'p6-003-q6',
      type: 'choice',
      text: 'In an elastic collision, if mass 1 is much larger than mass 2 (m₁ >> m₂), what happens?',
      options: [
        'Mass 1 stops, mass 2 moves at m₁/m₂ times original speed',
        'Mass 1 barely changes speed; mass 2 bounces off at approximately 2× the original relative speed',
        'Both objects stop',
        'Both objects move at the same speed',
      ],
      answer: 'Mass 1 barely changes speed; mass 2 bounces off at approximately 2× the original relative speed',
      hints: ['Think of a tennis ball hitting a wall: the wall barely moves, but the ball bounces back at nearly the same speed. v₂_f ≈ 2v₁_i when m₁ >> m₂.'],
      reviewSection: 'Math — elastic collision special cases',
    },
    {
      id: 'p6-003-q7',
      type: 'input',
      text: 'In an elastic collision: m₁ = 4 kg at 6 m/s, m₂ = 4 kg at rest. Find v₁_f in m/s.',
      answer: '0',
      hints: ['Equal masses, elastic: v₁_f = 0, v₂_f = v₁_i. The first ball stops completely.'],
      reviewSection: 'Math — elastic equal-mass special case',
    },
    {
      id: 'p6-003-q8',
      type: 'choice',
      text: 'Momentum conservation is valid only when:',
      options: [
        'The collision is elastic',
        'All forces are conservative',
        'There is no net external force on the system during the collision',
        'Both objects have the same mass',
      ],
      answer: 'There is no net external force on the system during the collision',
      hints: ['Newton\'s Third Law causes internal forces to cancel (dp_total/dt = F_ext). If F_ext ≈ 0 (short collision), momentum is conserved regardless of collision type.'],
      reviewSection: 'Math — conditions for conservation',
    },
    {
      id: 'p6-003-q9',
      type: 'choice',
      text: 'A bullet (0.01 kg) moving at 400 m/s embeds in a 2 kg block. The block+bullet system\'s final speed is closest to:',
      options: ['0.5 m/s', '2 m/s', '4 m/s', '20 m/s'],
      answer: '2 m/s',
      hints: ['p_i = 0.01×400 = 4 kg·m/s. v_f = 4/(0.01+2) ≈ 4/2.01 ≈ 1.99 ≈ 2 m/s.'],
      reviewSection: 'Examples — bullet-in-block',
    },
    {
      id: 'p6-003-q10',
      type: 'choice',
      text: 'Why can\'t ALL kinetic energy be lost in a collision (perfectly inelastic, objects stop completely)?',
      options: [
        'Energy conservation forbids it',
        'Momentum conservation: if objects stop, total final p = 0; this requires initial p = 0 too',
        'Inelastic collisions always have some rebound',
        'It would violate Newton\'s Second Law',
      ],
      answer: 'Momentum conservation: if objects stop, total final p = 0; this requires initial p = 0 too',
      hints: ['p is conserved. If p_i ≠ 0, p_f ≠ 0. Objects can\'t all stop unless they started with zero total momentum. Some KE must remain to carry the final momentum.'],
      reviewSection: 'Intuition — key insight about KE and momentum',
    },
  ],

  misconceptions: [
    {
      id: 'p6-003-m1',
      misconception: 'In any collision, both momentum and kinetic energy are conserved.',
      correction: 'Only momentum is ALWAYS conserved in isolated collisions. Kinetic energy is conserved only in elastic collisions. In all real (inelastic) collisions, some kinetic energy converts to heat, sound, or deformation.',
      correctionExample: 'Two 1 kg clay balls at ±5 m/s collide and stick. p_i = 0, p_f = 0 (conserved). KE_i = 25 J, KE_f = 0 J (all lost). Momentum conserved, KE not conserved.',
    },
    {
      id: 'p6-003-m2',
      misconception: 'A heavier object always wins in a collision — it always moves forward after.',
      correction: 'The outcome depends on initial velocities, masses, and collision type. In an elastic collision, a lighter object CAN stop a heavier one if the lighter one is moving fast enough. Momentum is m₁v₁ + m₂v₂ — both mass and velocity matter.',
      correctionExample: 'A 5 kg ball at 10 m/s hits a stationary 1 kg ball elastically: v₁_f = (5-1)/(5+1)×10 = 6.67 m/s (heavier ball slows). The lighter ball moves at (2×5)/(5+1)×10 = 16.67 m/s. The heavy ball doesn\'t stop but does slow down significantly.',
    },
  ],

  transferPrompts: [
    {
      id: 'p6-003-tp1',
      prompt: 'Forensic accident reconstruction: two cars of known mass are found 15 m apart in specific directions after a collision. Using conservation of momentum (two equations for 2D) and the final positions/friction, investigators can calculate the pre-collision speeds. What data would you need and which equations would you apply?',
      connection: 'Σp_x: m₁v₁ₓ + m₂v₂ₓ = (m₁+m₂)V_x. Σp_y: m₁v₁_y + m₂v₂_y = (m₁+m₂)V_y. Post-collision speeds come from friction deceleration (energy methods). Two vector equations give two unknowns (pre-crash speeds).',
    },
    {
      id: 'p6-003-tp2',
      prompt: 'Newton\'s Cradle has 5 balls. When 2 balls are pulled and released, exactly 2 fly out the other side at the same speed. This is surprising — why don\'t 4 balls fly out at half the speed? Use BOTH conservation of momentum AND conservation of kinetic energy to explain why.',
      connection: 'For n balls hit: p_i = n×m×v. For k balls flying out: p_f = k×m×V. KE_i = ½nm×v². For both p and KE to be conserved: n = k and V = v. Any other combination fails one condition. Both laws together uniquely force k = n.',
    },
  ],

  debugging: [
    {
      id: 'p6-003-db1',
      scenario: 'A student uses the elastic collision formula and gets v₁_f = 5 m/s and v₂_f = 3 m/s. They don\'t check their answer.',
      error: 'Not verifying that both momentum AND kinetic energy are conserved. One or both might be wrong due to arithmetic errors.',
      fix: 'Always verify: (1) m₁v₁_i + m₂v₂_i = m₁v₁_f + m₂v₂_f (momentum). (2) ½m₁v₁_i² + ½m₂v₂_i² = ½m₁v₁_f² + ½m₂v₂_f² (KE). Both must hold for an elastic collision answer to be correct.',
    },
    {
      id: 'p6-003-db2',
      scenario: 'For a perfectly inelastic collision, a student writes v_f = (v₁ + v₂)/(m₁ + m₂) instead of v_f = (m₁v₁ + m₂v₂)/(m₁ + m₂).',
      error: 'Forgot to multiply velocities by their respective masses before summing. This would only be correct if m₁ = m₂ = 1 kg.',
      fix: 'Conservation of momentum: m₁v₁ + m₂v₂ = (m₁+m₂)v_f. Solve: v_f = (m₁v₁ + m₂v₂)/(m₁+m₂). Always weight each velocity by its mass.',
    },
  ],

  mastery: {
    targetLevel: 'Apply momentum conservation to all collision types; solve elastic collisions using both p and KE conservation; distinguish elastic from inelastic by what is conserved.',
    checklistItems: [
      'Can solve perfectly inelastic collisions: v_f = (m₁v₁ + m₂v₂)/(m₁+m₂)',
      'Can solve elastic collisions using both conservation equations simultaneously',
      'Can verify answers by checking momentum AND kinetic energy',
      'Can explain why all kinetic energy cannot be lost when initial momentum is non-zero',
    ],
    commonStruggles: [
      'Applying elastic formulas to inelastic collisions (or vice versa)',
      'Not checking momentum conservation after getting velocity answers',
    ],
    nextSteps: 'Chapter 7 introduces rotational mechanics — torque, moment of inertia, and angular momentum. Rotational momentum (angular momentum L = Iω) has its own conservation law: L is conserved when no net external torque acts.',
  },

  semantics: {
    core: [
      { symbol: 'p_i = p_f', meaning: 'conservation of momentum — total p unchanged in isolated systems' },
      { symbol: 'Elastic', meaning: 'collision where both momentum AND kinetic energy are conserved' },
      { symbol: 'Inelastic', meaning: 'collision where only momentum is conserved; KE is partially lost' },
      { symbol: 'Perfectly inelastic', meaning: 'objects stick together; maximum possible KE is lost (some must remain to carry p)' },
      { symbol: 'v_f = (m₁v₁+m₂v₂)/(m₁+m₂)', meaning: 'final velocity for a perfectly inelastic collision' },
    ],
    rulesOfThumb: [
      'Momentum is ALWAYS conserved in isolated collisions — elastic, inelastic, or perfectly inelastic.',
      'Check: elastic collision → verify ΔKE = 0 after solving.',
      'Equal masses elastic: the first stops, the second takes the original speed.',
      'Perfectly inelastic KE loss is maximum — but never 100% unless p_initial = 0.',
      'In 2D: conserve x-momentum and y-momentum as separate equations.',
    ],
  },

  notebooks: {
    python: {
      type: 'PythonNotebook',
      cells: [
        {
          cellTitle: 'All Three Collision Types',
          type: 'code',
          language: 'python',
          code: `import numpy as np

def elastic_collision(m1, v1, m2, v2):
    """Returns (v1_f, v2_f) for elastic 1D collision."""
    v1_f = ((m1-m2)*v1 + 2*m2*v2) / (m1+m2)
    v2_f = ((m2-m1)*v2 + 2*m1*v1) / (m1+m2)
    return v1_f, v2_f

def inelastic_collision(m1, v1, m2, v2, e=0.5):
    """Returns (v1_f, v2_f) for inelastic collision with restitution coef e."""
    v_cm = (m1*v1 + m2*v2) / (m1+m2)
    v1_f = v_cm - e*(v1-v2)*m2/(m1+m2)
    v2_f = v_cm + e*(v1-v2)*m1/(m1+m2)
    return v1_f, v2_f

def perfectly_inelastic(m1, v1, m2, v2):
    """Returns v_f for perfectly inelastic (stick together)."""
    return (m1*v1 + m2*v2) / (m1+m2)

m1, v1 = 3.0, 6.0
m2, v2 = 2.0, -1.0

v1e, v2e = elastic_collision(m1, v1, m2, v2)
v1i, v2i = inelastic_collision(m1, v1, m2, v2, e=0.5)
vpi = perfectly_inelastic(m1, v1, m2, v2)

p_i = m1*v1 + m2*v2
KE_i = 0.5*m1*v1**2 + 0.5*m2*v2**2

print(f"Initial: p = {p_i:.1f} kg·m/s, KE = {KE_i:.1f} J")
print()
print("Elastic:            v1_f={:.2f}, v2_f={:.2f}  | Δp={:.4f}, ΔKE={:.4f}".format(
    v1e, v2e, (m1*v1e+m2*v2e)-p_i, (0.5*m1*v1e**2+0.5*m2*v2e**2)-KE_i))
print("Inelastic (e=0.5):  v1_f={:.2f}, v2_f={:.2f}  | Δp={:.4f}, ΔKE={:.4f}".format(
    v1i, v2i, (m1*v1i+m2*v2i)-p_i, (0.5*m1*v1i**2+0.5*m2*v2i**2)-KE_i))
print("Perfectly inelastic: v_f={:.2f}               | Δp={:.4f}, ΔKE={:.4f}".format(
    vpi, (m1+m2)*vpi-p_i, 0.5*(m1+m2)*vpi**2-KE_i))`,
          prose: [
            '`elastic_collision` implements v₁_f = ((m₁−m₂)v₁ + 2m₂v₂)/(m₁+m₂) — derived by solving both p and KE conservation simultaneously. The Δp and ΔKE printouts verify: both ≈ 0 for elastic.',
            '`perfectly_inelastic` is just weighted average velocity: v_f = (m₁v₁ + m₂v₂)/(m₁+m₂). Momentum is conserved (Δp ≈ 0) but KE is lost (ΔKE < 0).',
            'Comparing the three rows shows: all three conserve momentum (Δp ≈ 0); only elastic conserves KE (ΔKE ≈ 0). This is the fundamental distinction between collision types.',
          ],
        },
        {
          cellTitle: 'Elastic Collision — Equal Masses',
          type: 'code',
          language: 'python',
          code: `import numpy as np
import matplotlib.pyplot as plt

def elastic_1d(m1, v1, m2, v2):
    v1_f = ((m1-m2)*v1 + 2*m2*v2) / (m1+m2)
    v2_f = ((m2-m1)*v2 + 2*m1*v1) / (m1+m2)
    return v1_f, v2_f

# Equal masses: the classic complete transfer
m = 1.0
test_cases = [
    (m, 5.0, m, 0.0,   "Equal masses, one at rest"),
    (m, 5.0, m, -2.0,  "Equal masses, both moving"),
    (2*m, 5.0, m, 0.0, "Heavy hits light at rest"),
    (m, 5.0, 4*m, 0.0, "Light hits heavy at rest"),
]

print(f"{'Case':<35} | v1_i  v2_i | v1_f   v2_f  | p conserved?")
print("-" * 70)
for m1, v1, m2, v2, name in test_cases:
    v1f, v2f = elastic_1d(m1, v1, m2, v2)
    dp = abs((m1*v1f + m2*v2f) - (m1*v1 + m2*v2))
    print(f"{name:<35} | {v1:5.1f} {v2:5.1f} | {v1f:6.2f} {v2f:6.2f} | {'Yes' if dp < 1e-10 else f'No: {dp:.2e}'}") `,
          prose: [
            'The equal-mass case (row 1) shows the perfect momentum transfer: v₁_f = 0, v₂_f = v₁_i. This is Newton\'s cradle physics.',
            'The heavy-hits-light case (row 3) shows the heavy object barely slowing while the light one shoots forward — like a bowling ball hitting a table tennis ball.',
            'The light-hits-heavy case (row 4) shows the light object bouncing back and the heavy one barely moving — like a ball bouncing off a wall. Momentum IS conserved despite the dramatic asymmetry.',
          ],
        },
        {
          cellTitle: 'Collision KE Loss vs Collision Type',
          type: 'code',
          language: 'python',
          code: `import numpy as np
import matplotlib.pyplot as plt

m1, v1 = 3.0, 5.0
m2, v2 = 0.0, 0.0  # target at rest for simplicity

KE_i = 0.5*m1*v1**2

# Vary coefficient of restitution from 0 (perfectly inelastic) to 1 (elastic)
e_values = np.linspace(0, 1, 100)
KE_losses = []

for e in e_values:
    v_cm = (m1*v1) / (m1+m2)
    v1_f = v_cm - e*(v1-v2)*m2/(m1+m2)
    v2_f = v_cm + e*(v1-v2)*m1/(m1+m2)
    KE_f = 0.5*m1*v1_f**2 + 0.5*m2*v2_f**2
    KE_losses.append((KE_i - KE_f)/KE_i * 100)

fig, ax = plt.subplots(figsize=(8, 5))
ax.plot(e_values, KE_losses, 'b-', linewidth=2)
ax.axhline(y=0, color='k', linestyle='--')
ax.fill_between(e_values, KE_losses, alpha=0.3, color='red', label='KE lost')
ax.set_xlabel('Coefficient of Restitution e (0=perfectly inelastic, 1=elastic)')
ax.set_ylabel('% Kinetic Energy Lost')
ax.set_title('KE Loss vs Collision Type')
ax.legend(); ax.grid(True)
plt.tight_layout()
plt.show()

print(f"e=0 (perfectly inelastic): {KE_losses[0]:.1f}% KE lost")
print(f"e=1 (elastic):             {KE_losses[-1]:.4f}% KE lost (should be ~0)")`,
          prose: [
            '`e` is the coefficient of restitution: e=1 means perfectly elastic (no KE loss), e=0 means perfectly inelastic (maximum KE loss). Real collisions have 0 < e < 1.',
            'At e=0, the KE loss is maximal but not 100% — because some KE must remain to carry the final momentum. At e=1, KE loss is essentially zero (elastic).',
            'The plot shows a linear decrease in KE loss as e increases from 0 to 1. This parametrizes the continuum between the two extremes — most real-world collisions sit somewhere in the middle.',
          ],
        },
        {
          cellTitle: 'Challenge — 2D Collision',
          type: 'code',
          language: 'python',
          challengeType: 'write',
          prompt: 'Ball 1 (m=2 kg) moves at (4, 0) m/s and hits Ball 2 (m=1 kg) at rest. After a perfectly inelastic collision: (1) Find the combined velocity vector. (2) Find the KE before and after. (3) Find the % KE lost. (4) Verify momentum is conserved in both x and y.',
          starterCode: `import numpy as np

m1 = 2; v1 = np.array([4.0, 0.0])  # kg, m/s
m2 = 1; v2 = np.array([0.0, 0.0])

# TODO: v_f = (m1*v1 + m2*v2) / (m1 + m2)  (vector formula)
# TODO: KE_i = 0.5*m1*np.dot(v1,v1) + 0.5*m2*np.dot(v2,v2)
# TODO: KE_f = 0.5*(m1+m2)*np.dot(v_f, v_f)
# TODO: print v_f, KE_i, KE_f, % KE lost
# TODO: verify p_x: m1*v1[0] + m2*v2[0] == (m1+m2)*v_f[0]`,
        },
      ],
    },
    matlab: {
      type: 'OpenMatNotebook',
      cells: [
        {
          cellTitle: 'Three Collision Types',
          type: 'code',
          language: 'matlab',
          code: `% Three collision types: all conserve p, only elastic conserves KE
m1 = 3; v1 = 6; m2 = 2; v2 = -1;
p_i = m1*v1 + m2*v2;
KE_i = 0.5*m1*v1^2 + 0.5*m2*v2^2;

% Elastic
v1e = ((m1-m2)*v1 + 2*m2*v2) / (m1+m2);
v2e = ((m2-m1)*v2 + 2*m1*v1) / (m1+m2);
p_e = m1*v1e + m2*v2e; KE_e = 0.5*m1*v1e^2 + 0.5*m2*v2e^2;

% Perfectly inelastic
vf = (m1*v1 + m2*v2) / (m1+m2);
p_pi = (m1+m2)*vf; KE_pi = 0.5*(m1+m2)*vf^2;

fprintf('Initial:              p=%.1f, KE=%.1f J\\n', p_i, KE_i)
fprintf('Elastic:              p=%.1f, KE=%.1f J (v1=%.2f, v2=%.2f)\\n', p_e, KE_e, v1e, v2e)
fprintf('Perfectly inelastic:  p=%.1f, KE=%.1f J (v=%.2f)\\n', p_pi, KE_pi, vf)
fprintf('Elastic KE change:    %.6f J (should be 0)\\n', KE_e - KE_i)
fprintf('Inelastic KE lost:    %.2f J (%.0f%%)\\n', KE_i-KE_pi, 100*(KE_i-KE_pi)/KE_i)`,
          prose: [
            '`v1e` and `v2e` implement the elastic collision formulas. The fprintf shows Δp ≈ 0 for both types and ΔKE ≈ 0 only for elastic — confirming the fundamental difference.',
            'The perfectly inelastic formula `vf = (m1*v1 + m2*v2) / (m1+m2)` is momentum conservation with a single final velocity. MATLAB computes this in one line.',
            'The KE loss percentage quantifies inelasticity. Running different m1, m2, v1, v2 values in this script lets you explore when more or less KE is lost.',
          ],
        },
        {
          cellTitle: 'Equal-Mass Elastic Collision',
          type: 'code',
          language: 'matlab',
          code: `% Equal-mass elastic: complete momentum transfer
m = 1;
cases = {m, 5, m, 0, 'Equal masses, one at rest';
         m, 5, m, -2, 'Equal masses, both moving';
         2*m, 5, m, 0, 'Heavy hits light';
         m, 5, 4*m, 0, 'Light hits heavy'};

fprintf('%35s | v1_f  v2_f | p OK?\\n', 'Case')
fprintf('%s\\n', repmat('-', 1, 70))
for i = 1:size(cases, 1)
    m1 = cases{i,1}; v1 = cases{i,2};
    m2 = cases{i,3}; v2 = cases{i,4};
    v1f = ((m1-m2)*v1 + 2*m2*v2)/(m1+m2);
    v2f = ((m2-m1)*v2 + 2*m1*v1)/(m1+m2);
    dp = abs((m1*v1f+m2*v2f) - (m1*v1+m2*v2));
    fprintf('%35s | %5.2f %5.2f | %s\\n', cases{i,5}, v1f, v2f, ...
            ternary(dp<1e-10, 'Yes', 'No'))
end
function r = ternary(c, a, b); if c; r = a; else; r = b; end; end`,
          prose: [
            'The cell array `cases` stores multiple test scenarios — MATLAB\'s way of building a test matrix with mixed types. Each row is iterated in the for loop.',
            'For equal masses (rows 1-2): v1f = 0 and v2f takes the original v1 — perfect transfer. For unequal masses (rows 3-4): partial transfer with predictable asymmetry.',
            'The `dp < 1e-10` check verifies momentum conservation to floating-point precision. All cases should print "Yes" — confirming the elastic formulas are correct.',
          ],
        },
        {
          cellTitle: 'KE Loss vs Restitution',
          type: 'code',
          language: 'matlab',
          code: `% KE loss vs coefficient of restitution
m1 = 3; v1 = 5; m2 = 1; v2 = 0;
KE_i = 0.5*m1*v1^2 + 0.5*m2*v2^2;

e_vals = linspace(0, 1, 100);
KE_loss_pct = zeros(size(e_vals));

for k = 1:length(e_vals)
    e = e_vals(k);
    v_cm = (m1*v1 + m2*v2) / (m1+m2);
    v1f = v_cm - e*(v1-v2)*m2/(m1+m2);
    v2f = v_cm + e*(v1-v2)*m1/(m1+m2);
    KE_f = 0.5*m1*v1f^2 + 0.5*m2*v2f^2;
    KE_loss_pct(k) = 100*(KE_i - KE_f)/KE_i;
end

figure;
plot(e_vals, KE_loss_pct, 'b-', 'LineWidth', 2)
xlabel('Coefficient of Restitution e'); ylabel('% KE Lost')
title('KE Loss vs Collision Type (0=inelastic, 1=elastic)')
grid on
fprintf('e=0 (perfectly inelastic): %.1f%% KE lost\\n', KE_loss_pct(1))
fprintf('e=1 (elastic):             %.4f%% KE lost\\n', KE_loss_pct(end))`,
          prose: [
            '`e_vals = linspace(0, 1, 100)` sweeps from perfectly inelastic (e=0) to elastic (e=1). For each e, the collision formulas give v1f and v2f, then KE loss is computed.',
            'At e=0, KE loss is maximum but not 100% — because some KE is needed to carry the final momentum. At e=1, KE loss is effectively zero (floating-point noise).',
            'Real materials have characteristic e values: steel on steel ≈ 0.6, rubber ≈ 0.8, clay ≈ 0.1. This plot shows exactly how much energy each type of material dissipates.',
          ],
        },
        {
          cellTitle: 'Challenge — Ballistic Pendulum',
          type: 'code',
          language: 'matlab',
          challengeType: 'write',
          prompt: 'A bullet (m=0.01 kg) embeds in a block (M=1 kg) hanging on a string (perfectly inelastic). The block+bullet swings to height h = 0.08 m. (1) Use energy conservation to find the combined speed just after impact. (2) Use momentum conservation to find the bullet\'s original speed. (3) Calculate the % KE lost. This is the ballistic pendulum technique for measuring bullet speed.',
          starterCode: `% Ballistic pendulum
m_bullet = 0.01;  % kg
M_block  = 1.0;   % kg
h = 0.08;         % m swing height
g = 9.8;

% TODO: Step 1: v_combined from energy: (m+M)*g*h = ½(m+M)*v² → v = sqrt(2gh)
% TODO: Step 2: bullet speed from momentum: m_bullet * v_bullet = (m+M)*v_combined
% TODO: Step 3: KE_before = ½*m*v_bullet^2; KE_after = ½*(m+M)*v_combined^2
% TODO: % KE lost
% TODO: fprintf all results`,
        },
      ],
    },
  },
}
