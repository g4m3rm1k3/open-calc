export default {
  id: 'p1-ch7-004',
  slug: 'moment-of-inertia',
  chapter: 'p7',
  order: 4,
  title: 'Moment of Inertia: Rotational Mass',
  subtitle: 'Where mass is matters as much as how much mass there is.',
  tags: ['moment of inertia', 'I = sum mr2', 'parallel axis theorem', 'rotational inertia', 'mass distribution'],

  hook: {
    question:
      'A figure skater spins with arms outstretched at 1 revolution per second. She pulls her arms in close. Without any external torque, she suddenly spins at about 3 rev/s. Where did the extra rotational speed come from? No force was applied. No torque. Yet she sped up.',
    realWorldContext:
      'Angular momentum conservation (the rotational version of momentum conservation) explains the skater, a collapsing star becoming a pulsar, a diver tucking into a somersault, and the spiral dive of a hawk. All are consequences of \\(L = I\\omega = \\text{const}\\): when you reduce I by pulling mass inward, \\(\\omega\\) must increase to keep L constant.',
    previewVisualizationId: 'OscillationViz',
  },

  intuition: {
    prose: [
      '**The answer:** Angular momentum \\(L = I\\omega\\) is conserved when no external torque acts. Pulling arms in decreases I (mass moves closer to the axis → smaller \\(\\sum mr^2\\)). To keep \\(L = I\\omega\\) constant, \\(\\omega\\) must increase. The skater converts potential energy (muscle work) into rotational kinetic energy.',

      '**Moment of inertia depends on shape AND axis:** The same object has different I depending on where and how it rotates. A rod spun about its center (I = ML²/12) is easier to spin than the same rod spun about its end (I = ML²/3) — one-third of the end-axis value. Same rod, same mass, 3× different rotational resistance.',

      '**The \\(r^2\\) effect:** A kilogram at 1 m contributes 1 kg·m² to I. The same kilogram at 2 m contributes 4 kg·m². At 3 m: 9 kg·m². Mass far from the axis dominates I. This is why hollow cylinders are harder to spin than solid ones of equal mass — the hollow one concentrates mass at the rim.',

      '**Angular momentum conservation:** In the absence of external torque, \\(L = I\\omega = \\text{const}\\). This is the rotational analogue of linear momentum conservation. Divers tuck (reduce I) to spin faster mid-air. Astronomers watch pulsars (collapsed stars) spin at 700 rev/s — the star\'s I collapsed by a factor of \\(10^{10}\\), so \\(\\omega\\) increased by the same factor.',
    ],
    callouts: [
      {
        type: 'sequencing',
        title: 'Lesson 4 of 4 — The rotational chapter complete',
        body:
          '**Lessons 1–3:** Angular kinematics (θ, ω, α); torque (τ = rF sin θ); dynamics (τ = Iα).\n**This lesson:** What determines I? Common shapes and the parallel axis theorem.\n**Conservation:** L = Iω is conserved when τ_net = 0 — the rotational version of momentum conservation.\n**Chapter 8 next:** Oscillations — springs, pendulums, and waves.',
      },
      {
        type: 'definition',
        title: 'Moment of inertia',
        body:
          'Discrete: \\(I = \\sum_i m_i r_i^2\\)\\\\Continuous: \\(I = \\int r^2\\,dm\\) \\qquad [\\text{SI: kg·m}^2]',
      },
      {
        type: 'theorem',
        title: 'Common moments of inertia',
        body:
          '\\text{Solid cylinder: } \\tfrac{1}{2}MR^2\\\\\\text{Hollow cylinder: } MR^2\\\\\\text{Solid sphere: } \\tfrac{2}{5}MR^2\\\\\\text{Hollow sphere: } \\tfrac{2}{3}MR^2\\\\\\text{Rod (center): } \\tfrac{1}{12}ML^2\\\\\\text{Rod (end): } \\tfrac{1}{3}ML^2',
      },
      {
        type: 'theorem',
        title: 'Parallel axis theorem',
        body: 'I = I_{\\text{cm}} + Md^2 \\quad (d = \\text{distance between axes})',
      },
      {
        type: 'theorem',
        title: 'Conservation of angular momentum',
        body: 'L = I\\omega = \\text{const} \\quad \\text{when } \\tau_{\\text{net}} = 0',
      },
      {
        type: 'connection',
        title: 'Calculus: I from integration over continuous bodies',
        body:
          'For a uniform rod of length L, mass M per length λ = M/L: \\(I = \\int_0^L \\lambda x^2\\,dx = \\frac{\\lambda L^3}{3} = \\frac{ML^2}{3}\\) (about the end). The \\(r^2\\) in the integrand weights far-away mass more heavily — the result is not ML²/2 (uniform weight) but ML²/3 (quadratic weight).',
      },
    ],
    visualizations: [
      {
        id: 'OscillationViz',
        title: 'Arms in vs out — watch ω change as I changes',
        mathBridge:
          'Drag the "arm position" slider. As arms move in, I decreases, ω increases to conserve L. The total angular momentum L = Iω stays constant throughout.',
        caption: 'Conservation of angular momentum: I↓ → ω↑. The skater analogy made quantitative.',
        props: { showAngularMomentum: true },
      },
      {
        id: 'SVGDiagram',
        props: { type: 'moment-of-inertia-shapes' },
        title: 'Common shapes and their moments of inertia',
        caption:
          'All have the same mass M and "size" R. The hollow cylinder (I = MR²) is hardest to spin; the solid sphere (I = 2MR²/5) is easiest. Mass distribution, not just mass, determines rotational resistance.',
      },
    ],
  },

  math: {
    prose: [
      'For a system of point masses: \\(I = \\sum_i m_i r_i^2\\).',
      'For a continuous rigid body: \\(I = \\int r^2\\,dm\\), where \\(r\\) is the perpendicular distance from each mass element to the rotation axis.',
      'The **parallel axis theorem** lets you find I about any axis if you know I about the parallel axis through the center of mass:',
      '\\(I = I_{\\text{cm}} + Md^2\\)',
    ],
    callouts: [
      {
        type: 'insight',
        title: 'Why the parallel axis theorem works',
        body:
          'When you shift the axis by distance d, every mass element gains an extra term d² in its r². Summing \\(\\sum m_i(r_i^{\\prime 2}) = \\sum m_i r_i^2 + 2d\\sum m_i x_i + d^2 \\sum m_i\\). The middle term vanishes (cm at origin), leaving I_cm + Md².',
      },
      {
        type: 'mnemonic',
        title: 'Building intuition for the table of shapes',
        body:
          'More mass farther from axis → larger I.\\\\Hollow always > solid (for same M, R).\\\\Sphere < cylinder (sphere has more mass near center).\\\\Rod (end) = 4× rod (center) — the end axis is twice as far.',
      },
    ],
    visualizations: [
      {
        id: 'FunctionPlotter',
        title: 'I = ∫r² dm — the ½ factor revealed',
        mathBridge:
          'For a solid disk of radius R: shells at radius r have dm = (2πr)(M/πR²) dr. So I = ∫₀ᴿ r² · (2M/R²) r dr = (2M/R²) · R⁴/4 = MR²/2. The ½ comes from the integral — not from guessing.',
        caption: 'Every entry in the moment of inertia table comes from an integral like this.',
        props: { expression: '2*x*x*x', variable: 'r', xMin: 0, xMax: 1, showArea: true, label: 'r² dm/dr' },
      },
    ],
  },

  rigor: {
    title: 'Deriving I = ML²/3 for a rod about its end',
    proofSteps: [
      {
        expression: '\\lambda = M/L \\quad (\\text{linear mass density: mass per unit length})',
        annotation: 'For a uniform rod.',
      },
      {
        expression: 'I = \\int_0^L r^2\\,dm = \\int_0^L r^2 \\cdot \\lambda\\,dr',
        annotation: 'Replace dm = λ dr. r is distance from the end (rotation axis).',
      },
      {
        expression: 'I = \\lambda \\int_0^L r^2\\,dr = \\lambda \\cdot \\frac{L^3}{3} = \\frac{M}{L} \\cdot \\frac{L^3}{3} = \\frac{ML^2}{3}',
        annotation: 'Integrate r² from 0 to L. Substitute λ = M/L.',
      },
      {
        expression: 'I_{\\text{cm}} = I_{\\text{end}} - Md^2 = \\frac{ML^2}{3} - M\\left(\\frac{L}{2}\\right)^2 = \\frac{ML^2}{3} - \\frac{ML^2}{4} = \\frac{ML^2}{12}',
        annotation: 'Verify center value using parallel axis theorem: subtract Md² with d = L/2.',
      },
    ],
  },

  examples: [
    {
      id: 'ch7-004-ex1',
      title: 'Skater arm pull — angular momentum conservation',
      problem:
        '\\text{A skater (I₁ = 4.0 kg·m²) spins at 2 rev/s with arms out. She pulls in to I₂ = 1.5 kg·m². Find her new angular velocity.}',
      steps: [
        {
          expression: 'L = I_1\\omega_1 = (4.0)(2 \\times 2\\pi) = 16\\pi\\,\\text{kg·m}^2/\\text{s}',
          annotation: 'Initial angular momentum (convert rev/s to rad/s: multiply by 2π).',
        },
        {
          expression: '\\omega_2 = \\frac{L}{I_2} = \\frac{16\\pi}{1.5} \\approx 33.5\\,\\text{rad/s} \\approx 5.33\\,\\text{rev/s}',
          annotation: 'L is conserved; new ω = L/I₂.',
        },
      ],
      conclusion: 'Rotation triples from 2 to ≈ 5.3 rev/s. Angular momentum conservation turns I change into ω change.',
    },
    {
      id: 'ch7-004-ex2',
      title: 'Parallel axis theorem — rod about its end',
      problem:
        '\\text{A uniform rod (M = 3 kg, L = 1.2 m) rotates about one end. Find I using: (a) direct integration formula, (b) parallel axis theorem.}',
      steps: [
        { expression: '(a)\\; I_{\\text{end}} = \\tfrac{1}{3}ML^2 = \\tfrac{1}{3}(3)(1.44) = 1.44\\,\\text{kg·m}^2', annotation: 'Direct formula.' },
        { expression: '(b)\\; I_{\\text{cm}} = \\tfrac{1}{12}ML^2 = \\tfrac{1}{12}(3)(1.44) = 0.36\\,\\text{kg·m}^2', annotation: 'cm formula.' },
        { expression: 'I_{\\text{end}} = I_{\\text{cm}} + Md^2 = 0.36 + (3)(0.6)^2 = 0.36 + 1.08 = 1.44\\,\\text{kg·m}^2', annotation: 'Same result from parallel axis theorem. ✓' },
      ],
      conclusion: 'Both methods agree: I_end = 1.44 kg·m². The parallel axis theorem is a powerful shortcut.',
    },
  ],

  challenges: [
    {
      id: 'ch7-004-ch1',
      difficulty: 'easy',
      problem:
        '\\text{Two 2 kg masses are attached to the ends of a massless rod 1.4 m long. Find I about the center and about one end.}',
      hint: 'I = Σmr². At center, each mass is 0.7 m away. At end, masses are 0 and 1.4 m away.',
      walkthrough: [
        { expression: 'I_{\\text{center}} = 2(0.7)^2 + 2(0.7)^2 = 2(0.49) \\times 2 = 1.96\\,\\text{kg·m}^2', annotation: 'Both masses at r = 0.7 m.' },
        { expression: 'I_{\\text{end}} = 2(0)^2 + 2(1.4)^2 = 0 + 2(1.96) = 3.92\\,\\text{kg·m}^2', annotation: 'End mass at r = 0, far mass at r = 1.4 m.' },
      ],
      answer: 'I_center = 1.96 kg·m²; I_end = 3.92 kg·m² (exactly 2×, as expected from parallel axis theorem).',
    },
    {
      id: 'ch7-004-ch2',
      difficulty: 'medium',
      problem:
        '\\text{A solid cylinder (M = 4 kg, R = 0.2 m) spins at 20 rad/s. A torque of −0.8 N·m brakes it. How long until it stops?}',
      hint: 'I = ½MR². α = τ/I. Use ω = ω₀ + αt.',
      walkthrough: [
        { expression: 'I = \\tfrac{1}{2}(4)(0.04) = 0.08\\,\\text{kg·m}^2', annotation: '' },
        { expression: '\\alpha = -0.8/0.08 = -10\\,\\text{rad/s}^2', annotation: '' },
        { expression: 't = -\\omega_0/\\alpha = -20/(-10) = 2\\,\\text{s}', annotation: '' },
      ],
      answer: 't = 2 s to stop.',
    },
    {
      id: 'ch7-004-ch3',
      difficulty: 'hard',
      problem:
        '\\text{Derive I for a solid disk (radius R, mass M) using integration. Use shell elements dm = ρ(2πr)dr where ρ = M/(πR²).}',
      hint: 'I = ∫₀ᴿ r² dm = ∫₀ᴿ r² · ρ(2πr) dr. Factor out constants, integrate r³, substitute ρ.',
      walkthrough: [
        {
          expression: 'I = \\int_0^R r^2 \\cdot \\frac{M}{\\pi R^2}(2\\pi r)\\,dr = \\frac{2M}{R^2}\\int_0^R r^3\\,dr',
          annotation: 'Set up the integral.',
        },
        {
          expression: '= \\frac{2M}{R^2} \\cdot \\frac{R^4}{4} = \\frac{MR^2}{2}',
          annotation: '∫r³ dr = r⁴/4.',
        },
      ],
      answer: 'I = ½MR². The ½ factor emerges from the integration.',
    },
  ],
}
