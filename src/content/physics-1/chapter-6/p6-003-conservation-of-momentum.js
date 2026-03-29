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
      'Two identical billiard balls: one is moving at 3 m/s east, the other is stationary. ' +
      'They collide head-on. After the collision, predict what happens: ' +
      '(a) both move east at 1.5 m/s, (b) the first stops and the second moves at 3 m/s, ' +
      '(c) the first bounces back and both move. Which is correct — and what decides between them?',
    realWorldContext:
      'Collisions govern everything from particle physics experiments to car accident reconstruction. ' +
      'The type of collision (elastic vs inelastic) determines how much kinetic energy is lost. ' +
      'Forensic engineers use momentum conservation to reconstruct accidents — ' +
      'the final positions of vehicles uniquely determine their pre-collision speeds.',
    previewVisualizationId: 'SVGDiagram',
  },

  intuition: {
    prose: [
      '**The answer is (b)** — the moving ball stops and the stationary ball moves at the original speed. ' +
        'This is the elastic collision between equal masses, and it is a striking result: the first ball completely transfers all its momentum. ' +
        'It feels magical but follows directly from two conditions: conservation of momentum AND conservation of kinetic energy.',

      '**Three collision types — one conservation law:**',
      '1. **Elastic:** Momentum conserved AND KE conserved. Atoms, billiard balls (approximately), Newton\'s cradle. ' +
        'Objects bounce off with the same total energy.',
      '2. **Inelastic:** Momentum conserved, KE partially lost. Most real-world collisions (cars, balls with deformation). ' +
        'Energy goes to heat, sound, and deformation.',
      '3. **Perfectly inelastic:** Objects stick together after collision. Maximum kinetic energy is lost (some must remain to conserve momentum). ' +
        'A bullet embedding in a block, two cars latching bumpers.',

      '**The key insight:** In ALL three types, momentum is conserved (as long as no external force acts). ' +
        'What distinguishes them is what happens to kinetic energy. ' +
        'You cannot conserve momentum and also lose all kinetic energy — some KE must survive to carry the momentum.',
    ],
    callouts: [
      {
        type: 'sequencing',
        title: 'Lesson 3 of 3 — Collisions: where momentum meets energy',
        body:
          '**Chapter 5:** Energy is conserved in closed systems (KE + PE = const for conservative forces).\n' +
          '**Chapter 6 so far:** Momentum is a vector conserved when net external force = 0.\n' +
          '**This lesson:** Collisions combine both — momentum always conserved; energy conserved only in elastic collisions.\n' +
          '**Chapter 7 next:** Rotation — the same laws of mechanics, but for spinning objects.',
      },
      {
        type: 'definition',
        title: 'Three collision types',
        body:
          '**Elastic:** \\(p_1 + p_2 = \\text{const}\\) AND \\(KE_1 + KE_2 = \\text{const}\\)\n' +
          '**Inelastic:** \\(p_1 + p_2 = \\text{const}\\), \\(KE\\) decreases\n' +
          '**Perfectly inelastic:** Objects stick: \\((m_1 + m_2)v_f = m_1v_{1i} + m_2v_{2i}\\)',
      },
      {
        type: 'warning',
        title: 'Momentum is always conserved — energy may not be',
        body:
          'Never apply energy conservation to a collision unless told it is elastic. ' +
          'Most collisions are inelastic. Momentum conservation always holds; kinetic energy conservation does not.',
      },
      {
        type: 'insight',
        title: 'Elastic collision formula for equal masses',
        body:
          'Equal masses, elastic: \\(v_{1f} = v_{2i}\\) and \\(v_{2f} = v_{1i}\\). ' +
          'The velocities exchange. This is Newton\'s cradle — each ball stops and passes its momentum to the next.',
      },
    ],
    visualizations: [
      {
        id: 'SVGDiagram',
        props: { type: 'collision-types' },
        title: 'Three collision types — before and after',
        caption:
          'Elastic: arrows swap (equal masses) or recalculate. ' +
          'Inelastic: shorter arrows after (energy lost). ' +
          'Perfectly inelastic: single combined arrow after. ' +
          'In all cases, the vector sum of momentum arrows is the same before and after.',
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
          '\\(e = \\dfrac{v_{2f} - v_{1f}}{v_{1i} - v_{2i}}\\) where \\(0 \\leq e \\leq 1\\). ' +
          '\\(e = 1\\): perfectly elastic. \\(e = 0\\): perfectly inelastic. ' +
          'A rubber ball on concrete has \\(e \\approx 0.7\\); a clay ball has \\(e \\approx 0\\).',
      },
    ],
    visualizations: [
      {
        id: 'SVGDiagram',
        props: { type: 'elastic-head-on' },
        title: 'Elastic head-on: the velocity exchange formula',
        caption:
          'Drag the mass ratio slider. When m₁ = m₂: velocities exchange (Newton\'s cradle). ' +
          'When m₁ >> m₂: the heavy ball barely slows; the light ball flies off fast.',
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
        '\\text{Car A (1500 kg, 20 m/s east) rear-ends Car B (1200 kg, 10 m/s east, same direction). ' +
        'They lock bumpers. Find final velocity and energy lost.}',
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
        '\\text{A 5 kg block at rest on a frictionless surface is hit by a 0.05 kg bullet at 600 m/s. ' +
        'The bullet passes through, exiting at 200 m/s. Find the block\'s final speed, and check energy budget.}',
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
}
