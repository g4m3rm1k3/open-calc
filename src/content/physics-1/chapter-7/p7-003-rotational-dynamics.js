export default {
  id: 'p1-ch7-003',
  slug: 'rotational-dynamics',
  chapter: 'p7',
  order: 3,
  title: 'Rotational Dynamics: τ = Iα',
  subtitle: 'Newton\'s Second Law for rotation — same structure, different cast.',
  tags: ['rotational dynamics', 'tau = I alpha', 'Newton second law rotation', 'angular acceleration', 'moment of inertia'],

  hook: {
    question:
      'Two cylinders — one solid, one hollow — have the same mass and radius. ' +
      'Both roll from rest down the same ramp. Which reaches the bottom first? ' +
      'Intuition says: same mass, same gravity, same ramp — they should tie. ' +
      'They don\'t. One wins every time. Which one, and why?',
    realWorldContext:
      'Rotational dynamics governs every spinning system: flywheels in engines, ' +
      'figure skaters pulling in their arms, a diver tucking into a somersault, ' +
      'the wobble of a spinning top, and the torque specs for every bolt in a car engine. ' +
      'The equation τ = Iα is Newton\'s Second Law dressed for rotation — same logic, same structure.',
    previewVisualizationId: 'OscillationViz',
  },

  intuition: {
    prose: [
      '**The answer:** The solid cylinder wins. Both accelerate down the ramp under gravity, ' +
        'but rotating objects have to "share" their energy between translational and rotational kinetic energy. ' +
        'The hollow cylinder has more of its mass concentrated at the rim (larger moment of inertia I), ' +
        'so it needs more energy to spin up — leaving less for translational speed. ' +
        'Same mass, different distribution → different rotational inertia → different acceleration.',

      '**Newton\'s Second Law for rotation:** Just as \\(F = ma\\) relates force to linear acceleration, ' +
        '\\(\\tau = I\\alpha\\) relates torque to angular acceleration. ' +
        'The mass \\(m\\) is replaced by the **moment of inertia** \\(I\\), ' +
        'which measures not just how much mass but WHERE that mass is relative to the rotation axis.',

      '**Why location matters:** A kilogram at the rim of a wheel is much harder to start spinning than a kilogram at the center. ' +
        'The center mass barely moves when the wheel rotates; the rim mass has to travel a full circle. ' +
        'Moment of inertia \\(I = \\sum m_i r_i^2\\) weights each bit of mass by its squared distance from the axis. ' +
        'Double the distance → quadruple the contribution to rotational inertia.',

      '**The full analogy:** Linear: F → a → motion. Rotational: τ → α → rotation. ' +
        'The mass m in linear is replaced by I in rotation. ' +
        'KE = ½mv² in linear becomes ½Iω² in rotation. ' +
        'Everything you know about linear dynamics translates — just swap the symbols.',
    ],
    callouts: [
      {
        type: 'sequencing',
        title: 'Lesson 3 of 4 — The rotational Newton\'s Second Law',
        body:
          '**Lesson 2:** Torque τ = rF sin θ — the cause of rotational change.\n' +
          '**This lesson:** τ = Iα — torque produces angular acceleration. I is the rotational inertia.\n' +
          '**Next:** Moment of inertia — how to calculate I for different mass distributions.',
      },
      {
        type: 'theorem',
        title: 'Newton\'s Second Law for Rotation',
        body: '\\tau_{\\text{net}} = I\\alpha \\qquad [\\text{τ in N·m, I in kg·m², α in rad/s²}]',
      },
      {
        type: 'definition',
        title: 'Moment of inertia (point masses)',
        body: 'I = \\sum_i m_i r_i^2 \\qquad [\\text{SI: kg·m}^2]',
      },
      {
        type: 'insight',
        title: 'Rotational kinetic energy',
        body:
          'KE_{\\text{rot}} = \\tfrac{1}{2}I\\omega^2 \\quad \\text{(mirrors } \\tfrac{1}{2}mv^2\\text{)}\n\n' +
          'For a rolling object: \\(KE_{\\text{total}} = \\tfrac{1}{2}mv^2 + \\tfrac{1}{2}I\\omega^2\\)',
      },
      {
        type: 'connection',
        title: 'Calculus: L = Iω and τ = dL/dt',
        body:
          'Angular momentum \\(L = I\\omega\\). Newton\'s 2nd for rotation: \\(\\tau = dL/dt\\). ' +
          'For constant I: \\(\\tau = I(d\\omega/dt) = I\\alpha\\). ' +
          'Mirrors the linear \\(F = dp/dt = ma\\) structure exactly.',
      },
    ],
    visualizations: [
      {
        id: 'OscillationViz',
        title: 'Torque accelerates rotation',
        mathBridge:
          'Apply a torque. Watch α = τ/I — larger I means smaller α for the same τ. ' +
          'A hollow cylinder (I = mr²) accelerates slower than a solid cylinder (I = ½mr²) under equal torque.',
        caption: 'τ = Iα: more inertia → less angular acceleration for the same torque.',
        props: { showTorque: true },
      },
    ],
  },

  math: {
    prose: [
      'For a rigid body rotating about a fixed axis, the net torque produces angular acceleration:',
      '\\(\\tau_{\\text{net}} = I\\alpha\\)',
      'For a rolling object (both translating and rotating):',
      '\\(\\vec{a} = \\vec{F}_{\\text{net}}/m\\) (translational)',
      '\\(\\alpha = \\tau_{\\text{net}}/I\\) (rotational)',
      'And the rolling constraint: \\(a = r\\alpha\\) (no slipping).',
      'The rotational kinetic energy: \\(KE_{\\text{rot}} = \\tfrac{1}{2}I\\omega^2\\)',
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'Rolling without slipping',
        body: 'v_{\\text{cm}} = r\\omega \\quad \\text{and} \\quad a_{\\text{cm}} = r\\alpha',
      },
      {
        type: 'insight',
        title: 'The parallel axis theorem',
        body:
          'I about any axis = I about center of mass + Md²\\\\' +
          '\\(I = I_{\\text{cm}} + Md^2\\)\\\\' +
          'where d = distance from cm to the new axis. Rotating about a non-center axis always increases I.',
      },
    ],
    visualizations: [
      {
        id: 'SVGDiagram',
        props: { type: 'rolling-cylinder' },
        title: 'Rolling: translational + rotational energy',
        caption:
          'Energy bar splits into translational (½mv²) and rotational (½Iω²) portions. ' +
          'The hollow cylinder allocates more energy to rotation, leaving less for speed at the bottom.',
      },
    ],
  },

  rigor: {
    title: 'Deriving τ = Iα for a rigid body',
    proofSteps: [
      {
        expression: '\\text{Consider particle } i \\text{ at radius } r_i \\text{ with tangential force } F_{t,i}',
        annotation: 'Decompose a rigid body into mass elements.',
      },
      {
        expression: 'F_{t,i} = m_i a_{t,i} = m_i r_i \\alpha',
        annotation: 'Newton\'s second law for each particle tangentially. All share the same α (rigid body).',
      },
      {
        expression: '\\tau_i = r_i F_{t,i} = m_i r_i^2 \\alpha',
        annotation: 'Torque from particle i about the axis.',
      },
      {
        expression: '\\tau_{\\text{net}} = \\sum_i \\tau_i = \\left(\\sum_i m_i r_i^2\\right)\\alpha = I\\alpha',
        annotation: 'Sum over all particles. The bracketed term is the definition of moment of inertia I. QED.',
      },
    ],
  },

  examples: [
    {
      id: 'ch7-003-ex1',
      title: 'Disk accelerated by a torque',
      problem:
        '\\text{A solid disk (m = 5 kg, r = 0.3 m) starts from rest and reaches ω = 40 rad/s in 8 s. ' +
        'Find the net torque required.}',
      steps: [
        {
          expression: 'I = \\tfrac{1}{2}mr^2 = \\tfrac{1}{2}(5)(0.09) = 0.225\\,\\text{kg·m}^2',
          annotation: 'Moment of inertia for a solid disk: I = ½mr².',
        },
        {
          expression: '\\alpha = \\frac{\\Delta\\omega}{\\Delta t} = \\frac{40}{8} = 5\\,\\text{rad/s}^2',
          annotation: 'Angular acceleration.',
        },
        {
          expression: '\\tau = I\\alpha = (0.225)(5) = 1.125\\,\\text{N·m}',
          annotation: 'Net torque needed.',
        },
      ],
      conclusion: 'τ = 1.125 N·m. Small torque because the disk is light and the acceleration isn\'t large.',
    },
    {
      id: 'ch7-003-ex2',
      title: 'Rolling cylinder down a ramp — energy method',
      problem:
        '\\text{A solid cylinder (m = 2 kg, r = 0.1 m) rolls without slipping from rest down a 0.5 m high ramp. ' +
        'Find its speed at the bottom.}',
      steps: [
        {
          expression: 'mgh = \\tfrac{1}{2}mv^2 + \\tfrac{1}{2}I\\omega^2',
          annotation: 'Energy conservation: gravitational PE → translational KE + rotational KE.',
        },
        {
          expression: 'I = \\tfrac{1}{2}mr^2 \\quad \\text{and} \\quad \\omega = v/r \\Rightarrow \\tfrac{1}{2}I\\omega^2 = \\tfrac{1}{4}mv^2',
          annotation: 'Solid cylinder: I = ½mr². Rolling constraint: ω = v/r.',
        },
        {
          expression: 'mgh = \\tfrac{1}{2}mv^2 + \\tfrac{1}{4}mv^2 = \\tfrac{3}{4}mv^2',
          annotation: 'Combine: mass cancels.',
        },
        {
          expression: 'v = \\sqrt{\\frac{4gh}{3}} = \\sqrt{\\frac{4(9.8)(0.5)}{3}} = \\sqrt{6.53} \\approx 2.56\\,\\text{m/s}',
          annotation: 'Speed at bottom. Compare to sliding (no rotation): v = √(2gh) = 3.13 m/s. Rolling is slower.',
        },
      ],
      conclusion: 'v ≈ 2.56 m/s. 18% slower than sliding — energy "tied up" in rotation.',
    },
  ],

  challenges: [
    {
      id: 'ch7-003-ch1',
      difficulty: 'easy',
      problem: '\\text{A flywheel (I = 2 kg·m²) accelerates from rest to 30 rad/s in 6 s. Find the torque.}',
      hint: 'α = Δω/Δt; τ = Iα.',
      walkthrough: [
        { expression: '\\alpha = 30/6 = 5\\,\\text{rad/s}^2; \\quad \\tau = (2)(5) = 10\\,\\text{N·m}', annotation: 'Direct application of τ = Iα.' },
      ],
      answer: 'τ = 10 N·m.',
    },
    {
      id: 'ch7-003-ch2',
      difficulty: 'medium',
      problem:
        '\\text{A hollow sphere (I = ⅔mr²) and solid sphere (I = ⅖mr²) roll from rest down the same ramp. ' +
        'Which is faster at the bottom? Find the ratio of their speeds.}',
      hint: 'Use energy conservation. v² = 2gh / (1 + I/(mr²)). Compare the denominators.',
      walkthrough: [
        {
          expression: 'v^2 = \\frac{2gh}{1 + I/(mr^2)}',
          annotation: 'General rolling result from energy conservation.',
        },
        {
          expression: 'v_{\\text{solid}}^2 = \\frac{2gh}{1 + 2/5} = \\frac{2gh}{7/5} = \\frac{10gh}{7}',
          annotation: 'Solid sphere: I = ⅖mr².',
        },
        {
          expression: 'v_{\\text{hollow}}^2 = \\frac{2gh}{1 + 2/3} = \\frac{2gh}{5/3} = \\frac{6gh}{5}',
          annotation: 'Hollow sphere: I = ⅔mr².',
        },
        {
          expression: '\\frac{v_{\\text{solid}}}{v_{\\text{hollow}}} = \\sqrt{\\frac{10/7}{6/5}} = \\sqrt{\\frac{50}{42}} \\approx 1.09',
          annotation: 'Solid sphere is about 9% faster.',
        },
      ],
      answer: 'Solid sphere wins by ≈ 9%. Less rotational inertia → more translational speed.',
    },
    {
      id: 'ch7-003-ch3',
      difficulty: 'hard',
      problem:
        '\\text{An Atwood machine: two masses } m_1 = 3\\text{ kg and } m_2 = 5\\text{ kg hang over a solid disk pulley ' +
        '(M = 2 kg, R = 0.1 m). Find the acceleration. (Hint: include pulley inertia.)}',
      hint: 'Net force = (m₂ − m₁)g. Total "effective mass" includes pulley: m₁ + m₂ + I/R² = m₁ + m₂ + M/2.',
      walkthrough: [
        {
          expression: 'I_{\\text{disk}} = \\tfrac{1}{2}MR^2 = \\tfrac{1}{2}(2)(0.01) = 0.01\\,\\text{kg·m}^2',
          annotation: 'Pulley moment of inertia.',
        },
        {
          expression: '(m_2 - m_1)g = (m_1 + m_2 + I/R^2)a',
          annotation: 'Net force = total inertia × acceleration. I/R² converts rotational to translational.',
        },
        {
          expression: 'a = \\frac{(5-3)(9.8)}{3+5+0.01/0.01} = \\frac{19.6}{3+5+1} = \\frac{19.6}{9} \\approx 2.18\\,\\text{m/s}^2',
          annotation: 'I/R² = 0.01/0.01 = 1 kg (equivalent translational mass of pulley).',
        },
      ],
      answer: 'a ≈ 2.18 m/s² (less than without pulley mass, which gives 2.45 m/s²).',
    },
  ],
}
