export default {
  id: 'p1-ch8-001',
  slug: 'hookes-law',
  chapter: 'p8',
  order: 1,
  title: "Hooke's Law: The Restoring Force",
  subtitle: 'Springs push back proportionally to how far you push them — until they don\'t.',
  tags: ['Hooke\'s Law', 'spring constant', 'restoring force', 'elastic limit', 'F = -kx', 'spring energy'],

  hook: {
    question:
      'You stretch a spring gently — it pulls back. ' +
      'You stretch it twice as far — it pulls back twice as hard. ' +
      'Three times as far — three times as hard. ' +
      'But then you stretch it too far — and suddenly it doesn\'t spring back at all. ' +
      'What is the law governing the first part, and what breaks it in the second?',
    realWorldContext:
      'Hooke\'s Law is the foundation of every spring, every elastic material, and every oscillating system. ' +
      'Suspension bridges sway with it. Atomic bonds obey it near equilibrium. ' +
      'Every musical instrument string vibrates because of it. ' +
      'Even the bonds between atoms in a solid act like tiny springs — ' +
      'which is why solids have a Young\'s modulus and why sound travels through them.',
    previewVisualizationId: 'SpringOscillation',
  },

  intuition: {
    prose: [
      '**The law:** Within the elastic limit, the restoring force of a spring is proportional to its displacement: \\(F = -kx\\). ' +
        'The minus sign is crucial — it means the force always acts opposite to the displacement, pushing or pulling the spring back toward equilibrium.',

      '**The elastic limit:** The linear relationship holds only up to a certain extension. ' +
        'Beyond this, the material deforms permanently (plastic deformation) and Hooke\'s Law fails. ' +
        'A rubber band, a spring, a steel beam — all are Hookean for small deformations and non-Hookean for large ones. ' +
        'Physics begins with the linear region.',

      '**The spring constant k:** A stiff spring has a large k (requires more force per metre of stretch). ' +
        'A soft spring has a small k. Units: N/m. ' +
        'A car suspension spring might have k ≈ 20,000 N/m; a watch spring k ≈ 0.001 N/m; an atomic bond k ≈ 10 N/m.',

      '**Why the minus sign creates oscillation:** If you displace a mass from equilibrium, Hooke\'s Law restores it. ' +
        'But it overshoots — and the restoring force pulls it back again. ' +
        'This alternation between restoring force and overshoot is the origin of all oscillatory motion. ' +
        'Hooke\'s Law is the starting point for the next three lessons.',
    ],
    callouts: [
      {
        type: 'sequencing',
        title: 'Lesson 1 of 4 — Chapter 8: Oscillations & Waves',
        body:
          '**Chapter 5:** Spring PE = ½kx² — work done against Hooke\'s Law, stored as elastic energy.\n' +
          '**This chapter:** Hooke\'s Law as a restoring force that creates oscillatory motion.\n' +
          '**This lesson:** F = −kx — the linear restoring force.\n' +
          '**Next:** Simple Harmonic Motion — the oscillation that results.',
      },
      {
        type: 'theorem',
        title: 'Hooke\'s Law',
        body: 'F = -kx \\qquad [\\text{SI: k in N/m, x in m, F in N}]',
      },
      {
        type: 'definition',
        title: 'Spring constant k',
        body:
          'k measures the stiffness: force per unit displacement. ' +
          'Large k = stiff spring (hard to stretch). ' +
          'Small k = soft spring (easy to stretch). ' +
          'Units: N/m.',
      },
      {
        type: 'warning',
        title: 'The minus sign is not optional',
        body:
          'F = −kx, not F = kx. ' +
          'The restoring force points opposite to x. ' +
          'If x > 0 (stretched), F < 0 (pulls back). ' +
          'If x < 0 (compressed), F > 0 (pushes back). ' +
          'Dropping the minus sign predicts a force that accelerates the spring away from equilibrium — the wrong physics entirely.',
      },
      {
        type: 'connection',
        title: 'Calculus connection: F = −dPE/dx confirms the minus sign',
        body:
          'Spring PE = ½kx². Differentiating: \\(F = -\\dfrac{d}{dx}(\\tfrac{1}{2}kx^2) = -kx\\). ' +
          'The minus sign in Hooke\'s Law comes directly from the negative gradient of the PE curve. ' +
          'The parabolic PE well always curves upward — force always points toward the minimum.',
      },
    ],
    visualizations: [
      {
        id: 'SpringOscillation',
        title: 'Stretch the spring — feel the restoring force',
        mathBridge:
          'Drag the mass to stretch or compress the spring. ' +
          'Watch the force arrow: it always points back toward equilibrium (x = 0). ' +
          'The force magnitude is proportional to displacement. Release and watch it oscillate.',
        caption: 'F = −kx: force is linear in displacement and always restorative.',
        props: { showForce: true, interactive: true },
      },
      {
        id: 'FunctionPlotter',
        title: 'F-x graph: slope = −k',
        mathBridge:
          'Plot F = −kx. The slope is −k. ' +
          'Double k → steeper slope → stiffer spring. ' +
          'The area under a triangle on this graph = work = ½kx² (spring PE).',
        caption: 'Linear F-x relationship. The slope gives k directly.',
        props: { expression: '-200*x', variable: 'x', xMin: -0.2, xMax: 0.2, label: 'F (N)' },
      },
    ],
  },

  math: {
    prose: [
      'For a spring with constant \\(k\\) displaced \\(x\\) from equilibrium:',
      'Force: \\(F = -kx\\)',
      'Elastic PE (from Lesson 5.3): \\(PE = \\tfrac{1}{2}kx^2\\)',
      'For springs in series and parallel:',
      'Series: \\(\\dfrac{1}{k_{\\text{eff}}} = \\dfrac{1}{k_1} + \\dfrac{1}{k_2}\\) (softer — two springs share the load)',
      'Parallel: \\(k_{\\text{eff}} = k_1 + k_2\\) (stiffer — both springs share the displacement)',
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'Springs in series vs parallel',
        body:
          '\\text{Series: } \\frac{1}{k_{\\text{eff}}} = \\sum_i \\frac{1}{k_i} \\quad (\\text{softer})\\\\' +
          '\\text{Parallel: } k_{\\text{eff}} = \\sum_i k_i \\quad (\\text{stiffer})',
      },
      {
        type: 'insight',
        title: 'Springs are capacitors for mechanical energy',
        body:
          'A spring stores ½kx² joules when displaced by x. ' +
          'Double the displacement → 4× the stored energy (quadratic, not linear). ' +
          'This is the same scaling as kinetic energy ½mv² — by design, they exchange perfectly in SHM.',
      },
    ],
    visualizations: [
      {
        id: 'SVGDiagram',
        props: { type: 'spring-series-parallel' },
        title: 'Series vs parallel spring combinations',
        caption:
          'Series: same force, displacements add. Effective k is less than either spring alone. ' +
          'Parallel: same displacement, forces add. Effective k is greater than either spring.',
      },
    ],
  },

  rigor: {
    title: 'Hooke\'s Law as the first term of a Taylor expansion',
    prose: [
      'Any potential energy function near a stable equilibrium looks like a parabola — and therefore obeys Hooke\'s Law.',
    ],
    proofSteps: [
      {
        expression: 'U(x) = U(0) + U\'(0)x + \\tfrac{1}{2}U\'\'(0)x^2 + \\cdots',
        annotation: 'Taylor series of any PE function about equilibrium x = 0.',
      },
      {
        expression: 'U\'(0) = 0 \\text{ (equilibrium: minimum of PE → derivative is zero)}',
        annotation: 'At equilibrium, the force is zero: F = −dU/dx = −U\'(0) = 0.',
      },
      {
        expression: 'U(x) \\approx U(0) + \\tfrac{1}{2}U\'\'(0)x^2',
        annotation: 'For small x, higher terms are negligible. U″(0) > 0 (stable equilibrium).',
      },
      {
        expression: 'F = -\\frac{dU}{dx} = -U\'\'(0)x \\equiv -kx',
        annotation: 'The effective spring constant is k = U″(0). Any smooth PE near its minimum looks like a spring.',
      },
    ],
  },

  examples: [
    {
      id: 'ch8-001-ex1',
      title: 'Finding k from a stretch experiment',
      problem: '\\text{A spring stretches 8 cm when a 4 N force is applied. Find k. How far does it stretch under 10 N?}',
      steps: [
        { expression: 'k = F/|x| = 4/0.08 = 50\\,\\text{N/m}', annotation: 'Spring constant from F = kx (taking magnitude).' },
        { expression: 'x = F/k = 10/50 = 0.20\\,\\text{m} = 20\\,\\text{cm}', annotation: 'Stretch under 10 N.' },
      ],
      conclusion: 'k = 50 N/m. New stretch = 20 cm.',
    },
    {
      id: 'ch8-001-ex2',
      title: 'Two springs in series and parallel',
      problem: '\\text{Springs k₁ = 100 N/m and k₂ = 150 N/m. Find k_eff for (a) series, (b) parallel.}',
      steps: [
        { expression: '(a)\\; \\frac{1}{k_{\\text{eff}}} = \\frac{1}{100} + \\frac{1}{150} = \\frac{3+2}{300} = \\frac{5}{300} \\Rightarrow k_{\\text{eff}} = 60\\,\\text{N/m}', annotation: 'Series: softer than either spring.' },
        { expression: '(b)\\; k_{\\text{eff}} = 100 + 150 = 250\\,\\text{N/m}', annotation: 'Parallel: stiffer than either spring.' },
      ],
      conclusion: 'Series: 60 N/m (softer). Parallel: 250 N/m (stiffer).',
    },
  ],

  challenges: [
    {
      id: 'ch8-001-ch1',
      difficulty: 'easy',
      problem: '\\text{A 0.5 kg mass hangs from a spring (k = 200 N/m) at rest. Find the spring extension.}',
      hint: 'At equilibrium: kx = mg.',
      walkthrough: [
        { expression: 'x = mg/k = (0.5)(9.8)/200 = 0.0245\\,\\text{m} = 2.45\\,\\text{cm}', annotation: 'Equilibrium stretch.' },
      ],
      answer: 'x = 2.45 cm.',
    },
    {
      id: 'ch8-001-ch2',
      difficulty: 'medium',
      problem:
        '\\text{A spring (k = 300 N/m) is compressed 5 cm and launches a 50 g ball. Find the launch speed.}',
      hint: '½kx² = ½mv². Spring PE → KE.',
      walkthrough: [
        {
          expression: '\\tfrac{1}{2}(300)(0.05)^2 = \\tfrac{1}{2}(0.05)v^2 \\Rightarrow 0.375 = 0.025v^2',
          annotation: 'Energy conservation.',
        },
        { expression: 'v = \\sqrt{15} \\approx 3.87\\,\\text{m/s}', annotation: '' },
      ],
      answer: 'Launch speed ≈ 3.87 m/s.',
    },
    {
      id: 'ch8-001-ch3',
      difficulty: 'hard',
      problem:
        '\\text{A diatomic molecule has PE: } U(r) = \\frac{A}{r^{12}} - \\frac{B}{r^6} \\text{ (Lennard-Jones). ' +
        'At equilibrium } r_0 \\text{, show it behaves like a spring. Find k in terms of A, B, r₀.}',
      hint: 'Find r₀ from dU/dr = 0. Then k = d²U/dr² evaluated at r₀.',
      walkthrough: [
        {
          expression: 'dU/dr = -12A/r^{13} + 6B/r^7 = 0 \\Rightarrow r_0 = (2A/B)^{1/6}',
          annotation: 'Equilibrium position.',
        },
        {
          expression: 'k = \\frac{d^2U}{dr^2}\\bigg|_{r_0} = \\frac{156A}{r_0^{14}} - \\frac{42B}{r_0^8}',
          annotation: 'Second derivative gives the effective spring constant.',
        },
        {
          expression: 'k = \\frac{36B^2}{A r_0^2} \\cdot \\frac{1}{4} \\cdot \\frac{B}{A} \\; (\\text{simplifies using } r_0)',
          annotation: 'Substituting r₀ and simplifying. Near equilibrium, all atoms vibrate as harmonic oscillators.',
        },
      ],
      answer: 'Near r₀, U ≈ ½k(r−r₀)² — Lennard-Jones reduces to Hooke\'s Law. The atomic bond is a spring.',
    },
  ],
}
