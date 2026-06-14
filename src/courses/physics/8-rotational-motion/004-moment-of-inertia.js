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

  quiz: [
    {
      id: 'p7-004-q1',
      type: 'choice',
      question: 'Three 1 kg masses are placed at distances 0.5 m, 1.0 m, and 2.0 m from a rotation axis. What is the total moment of inertia?',
      options: ['3.5 kg·m²', '5.25 kg·m²', '7.0 kg·m²', '3.0 kg·m²'],
      answer: '5.25 kg·m²',
      hints: ['I = Σmr² = 1(0.25) + 1(1.0) + 1(4.0) = 0.25 + 1.0 + 4.0.', 'The mass at 2.0 m contributes 4 kg·m² — sixteen times more than the mass at 0.5 m.'],
      reviewSection: 'math',
    },
    {
      id: 'p7-004-q2',
      type: 'choice',
      question: 'A 4 kg uniform rod of length 1.5 m rotates about its center. What is its moment of inertia?',
      options: ['0.75 kg·m²', '1.5 kg·m²', '3.0 kg·m²', '0.5 kg·m²'],
      answer: '0.75 kg·m²',
      hints: ['I_center = (1/12)ML² for a uniform rod.', 'I = (1/12)(4)(1.5²) = (1/12)(4)(2.25) = 9/12 = 0.75 kg·m².'],
      reviewSection: 'intuition',
    },
    {
      id: 'p7-004-q3',
      type: 'choice',
      question: 'The same rod (4 kg, 1.5 m) is pivoted about one end. What is I?',
      options: ['3.0 kg·m²', '0.75 kg·m²', '1.5 kg·m²', '6.0 kg·m²'],
      answer: '3.0 kg·m²',
      hints: ['I_end = (1/3)ML² OR use parallel axis theorem: I_end = I_center + Md² with d = L/2.', 'I = (1/3)(4)(2.25) = 3.0 kg·m². Note: 4× the center value because the end axis is farther.'],
      reviewSection: 'math',
    },
    {
      id: 'p7-004-q4',
      type: 'choice',
      question: 'A figure skater with I₁ = 5.0 kg·m² spins at 2 rev/s and pulls in to I₂ = 1.25 kg·m². What is her new angular velocity?',
      options: ['8 rev/s', '4 rev/s', '10 rev/s', '0.5 rev/s'],
      answer: '8 rev/s',
      hints: ['Angular momentum is conserved: L = I₁ω₁ = I₂ω₂.', 'ω₂ = I₁ω₁/I₂ = (5.0 × 2)/1.25 = 8 rev/s.'],
      reviewSection: 'intuition',
    },
    {
      id: 'p7-004-q5',
      type: 'choice',
      question: 'Which has the largest moment of inertia for the same mass M and radius R?',
      options: ['Hollow cylinder (I = MR²)', 'Solid cylinder (I = ½MR²)', 'Solid sphere (I = 2/5 MR²)', 'Hollow sphere (I = 2/3 MR²)'],
      answer: 'Hollow cylinder (I = MR²)',
      hints: ['More mass concentrated farther from axis → larger I.', 'Hollow cylinder: ALL mass at rim (r = R). That gives I = MR², the maximum possible for given M and R.'],
      reviewSection: 'intuition',
    },
    {
      id: 'p7-004-q6',
      type: 'choice',
      question: 'The parallel axis theorem is I = I_cm + Md². What does this tell you about rotating an object about an axis that does NOT pass through its center of mass?',
      options: ['I is always greater than I_cm', 'I is always less than I_cm', 'I equals I_cm for any parallel axis', 'I depends only on total mass'],
      answer: 'I is always greater than I_cm',
      hints: ['Md² is always positive (d² ≥ 0).', 'The minimum I for any object is I_cm — rotating about any other parallel axis always increases I.'],
      reviewSection: 'math',
    },
    {
      id: 'p7-004-q7',
      type: 'choice',
      question: 'A solid sphere (I = 2/5 MR²) has M = 3 kg, R = 0.2 m, and spins at ω = 10 rad/s. What is its angular momentum?',
      options: ['0.48 kg·m²/s', '1.2 kg·m²/s', '0.24 kg·m²/s', '2.4 kg·m²/s'],
      answer: '0.48 kg·m²/s',
      hints: ['I = (2/5)(3)(0.04) = (2/5)(0.12) = 0.048 kg·m².', 'L = Iω = 0.048 × 10 = 0.48 kg·m²/s.'],
      reviewSection: 'math',
    },
    {
      id: 'p7-004-q8',
      type: 'choice',
      question: 'A uniform disk of mass M and radius R has I_cm = ½MR². Using the parallel axis theorem, what is I about an axis at the rim (distance R from center)?',
      options: ['3/2 MR²', '2MR²', '½MR²', 'MR²'],
      answer: '3/2 MR²',
      hints: ['I = I_cm + Md² = ½MR² + MR².', '½MR² + MR² = 3/2 MR².'],
      reviewSection: 'math',
    },
    {
      id: 'p7-004-q9',
      type: 'choice',
      question: 'A neutron star forms when a star collapses, reducing its radius by a factor of 1000 while conserving angular momentum. By what factor does its angular velocity increase?',
      options: ['1,000,000 (10⁶)', '1000', '1,000,000,000 (10⁹)', '1,000,000,000,000 (10¹²)'],
      answer: '1,000,000 (10⁶)',
      hints: ['For a solid sphere: I = 2/5 MR². If R decreases by 1000, I decreases by 1000² = 10⁶.', 'L = Iω = const, so ω increases by the same factor that I decreases: 10⁶.'],
      reviewSection: 'intuition',
    },
    {
      id: 'p7-004-q10',
      type: 'choice',
      question: 'The formula I = ∫r² dm is derived by summing mass elements weighted by the square of their distance from the axis. Why does the ½ appear in I = ½MR² for a solid disk (but not in I = MR² for a hollow ring)?',
      options: ['Because disk mass is spread from r=0 to r=R; average r² is R²/2', 'Because there are two surfaces to the disk', 'Because of the parallel axis theorem', 'It is an empirical constant measured in experiments'],
      answer: 'Because disk mass is spread from r=0 to r=R; average r² is R²/2',
      hints: ['For a ring, all mass is at r = R, so Σmr² = MR².', 'For a disk, mass is distributed from 0 to R. The r² integral gives R⁴/4 after weighting by 2πr dr, yielding ½MR².'],
      reviewSection: 'math',
    },
  ],

  misconceptions: [
    {
      id: 'p7-004-m1',
      misconception: 'Moment of inertia is just mass — more mass always means harder to spin.',
      correction: 'Moment of inertia is I = Σmr², which weights mass by squared distance from the axis. A 1 kg mass at 2 m contributes 4 kg·m², while a 4 kg mass at 0.5 m contributes only 1 kg·m². Redistributing mass outward increases I even if total mass is unchanged — this is exactly what happens when a skater extends her arms.',
      correctionExample: 'Two 2 kg masses: at r = 0.5 m, I = 2(0.25) = 0.5 kg·m². Move same masses to r = 2 m: I = 2(4) = 8 kg·m². Same mass, 16× larger I.',
    },
    {
      id: 'p7-004-m2',
      misconception: 'A spinning skater "generates" extra rotational speed by pulling her arms in — she is doing work to speed up.',
      correction: 'The skater does do work (muscle work against centrifugal tendency), but angular momentum L = Iω is conserved — the increased ω comes entirely from decreased I, not from an external torque. The rotational kinetic energy INCREASES (½I₂ω₂² > ½I₁ω₁²) because muscle work is done, but this is internal energy, not an external torque.',
      correctionExample: 'I₁ = 4 kg·m², ω₁ = 2 rad/s → L = 8 kg·m²/s. Pull to I₂ = 1 kg·m² → ω₂ = 8 rad/s. KE₁ = 8 J; KE₂ = 32 J. Extra 24 J came from muscle work.',
    },
  ],

  transferPrompts: [
    {
      id: 'p7-004-t1',
      prompt: `A diver leaves the board with angular momentum L from a small initial rotation. She tucks tightly (small I) to spin fast, then extends fully (large I) before entering the water. Sketch (or describe) the ω vs time profile during the dive. Where is ω largest? Why must she extend before entry?`,
      connection: 'L = Iω conservation: tucking reduces I so ω spikes; extending increases I so ω drops back — giving a controlled, slow entry despite fast mid-air rotation.',
    },
    {
      id: 'p7-004-t2',
      prompt: `In structural engineering, the "second moment of area" (also called the area moment of inertia) of a beam cross-section determines its resistance to bending. An I-beam has most of its material in the flanges far from the neutral axis. How is this directly analogous to moment of inertia I = Σmr², and why does it make the beam stiff without being heavy?`,
      connection: 'Both weight "material" by r² from an axis. Just as mass far from the rotation axis resists angular acceleration, area far from the neutral axis resists bending — the same mathematical structure appears in both mechanics of materials and rotational dynamics.',
    },
  ],

  debugging: [
    {
      id: 'p7-004-d1',
      error: `A student computing ω₂ after a skater pulls arms in (I₁ = 6 kg·m², ω₁ = 3 rev/s, I₂ = 2 kg·m²) writes:
ΔI = 6 - 2 = 4 kg·m²
ω₂ = ω₁ + ΔI = 3 + 4 = 7 rev/s`,
      fix: `Angular momentum is conserved as a product, not a sum: L = I₁ω₁ = I₂ω₂.
ω₂ = I₁ω₁ / I₂ = (6 × 3) / 2 = 9 rev/s
The student added ΔI to ω, which has no physical meaning. The conserved quantity is L = Iω (a product), and ω scales inversely with I.`,
    },
    {
      id: 'p7-004-d2',
      error: `A student computing I for a rod (M = 2 kg, L = 1.0 m) pivoted at one end using the parallel axis theorem writes:
I_cm = (1/12)(2)(1.0²) = 1/6 kg·m²
I_end = I_cm + Md² = 1/6 + (2)(1.0²) = 1/6 + 2 = 13/6 kg·m²`,
      fix: `The distance d in the parallel axis theorem is the distance between the two PARALLEL axes, not the length of the rod. The end axis is L/2 away from the center-of-mass axis.
d = L/2 = 0.5 m
I_end = I_cm + Md² = 1/6 + (2)(0.5²) = 1/6 + 0.5 = 1/6 + 3/6 = 4/6 = 2/3 kg·m²
This matches the direct formula (1/3)ML² = (1/3)(2)(1) = 2/3 kg·m². ✓`,
    },
  ],

  mastery: {
    targetLevel: 'Calculate I for point masses and common shapes; apply the parallel axis theorem; use L = Iω conservation to find ω after shape change; explain why mass distribution determines rotational behavior.',
    checklistItems: [
      'Can compute I = Σmr² for a system of point masses',
      'Can recall or derive I for a solid disk (½MR²), hollow cylinder (MR²), solid sphere (⅖MR²), and rod (about center or end)',
      'Can apply parallel axis theorem I = I_cm + Md² correctly with d = distance between axes (not the rod length)',
      'Can solve L = Iω conservation problems: given I₁, ω₁, I₂, find ω₂',
      'Can explain qualitatively why hollow objects have larger I than solid objects of equal mass and radius',
    ],
    commonStruggles: [
      'Parallel axis theorem: using rod length L as d instead of the distance L/2 between the two parallel axes',
      'Angular momentum conservation: adding ΔI to ω instead of using the multiplicative relation ω₂ = I₁ω₁/I₂',
      'Forgetting to convert rev/s to rad/s before computing L = Iω in SI units',
    ],
    nextSteps: 'Chapter 8 covers oscillations (SHM): springs, pendulums, and waves. The moment of inertia appears again in physical pendulum period T = 2π√(I/mgd).',
  },

  semantics: {
    core: [
      { symbol: 'I = \\sum m_i r_i^2', meaning: 'Moment of inertia — sum of each mass element times squared distance from axis' },
      { symbol: 'I = \\int r^2\\,dm', meaning: 'Continuous form of moment of inertia — integrates r² over the mass distribution' },
      { symbol: 'I = I_{cm} + Md^2', meaning: 'Parallel axis theorem — I about any axis equals I_cm plus mass × squared axis separation' },
      { symbol: 'L = I\\omega', meaning: 'Angular momentum (kg·m²/s) — product of rotational inertia and angular velocity' },
      { symbol: 'L = \\text{const}', meaning: 'Angular momentum conservation — holds when net external torque is zero' },
      { symbol: '\\tfrac{1}{2}MR^2', meaning: 'Moment of inertia for a solid disk or cylinder — the ½ from integrating r² over the area' },
    ],
    rulesOfThumb: [
      'Hollow > solid: for same M and R, hollow always has larger I — more mass farther from axis.',
      'The r² effect dominates: moving a mass 2× farther increases its I contribution by 4×.',
      'Parallel axis theorem: rotating about any non-center axis always increases I — I_cm is the minimum.',
      'Angular momentum conservation: if I halves, ω doubles — inverse proportional relationship.',
      'Sphere < cylinder: sphere has more mass near the center (r < R), so less average r²; solid sphere (⅖MR²) spins up easier than solid cylinder (½MR²).',
    ],
  },

  notebooks: {
    python: {
      type: 'PythonNotebook',
      title: 'Moment of Inertia in Python',
      cells: [
        {
          cellTitle: 'Compare I for common shapes — same M and R',
          type: 'code',
          language: 'python',
          code: `import numpy as np
import matplotlib.pyplot as plt

# Same mass and radius — different I due to mass distribution
M = 2.0  # kg
R = 0.5  # m

shapes = {
    'Hollow\\ncylinder\\nI = MR²':       M * R**2,
    'Hollow\\nsphere\\nI = ⅔MR²':        (2/3) * M * R**2,
    'Solid\\ncylinder\\nI = ½MR²':       0.5 * M * R**2,
    'Solid\\nsphere\\nI = ⅖MR²':         (2/5) * M * R**2,
    'Rod (end)\\nI = ⅓ML²\\n(L=2R)':     (1/3) * M * (2*R)**2,
    'Rod (center)\\nI = ¹⁄₁₂ML²\\n(L=2R)': (1/12) * M * (2*R)**2,
}

labels = list(shapes.keys())
I_values = list(shapes.values())

fig, ax = plt.subplots(figsize=(10, 5))
bars = ax.bar(labels, I_values, color=['#e74c3c', '#e67e22', '#3498db', '#2ecc71', '#9b59b6', '#1abc9c'])
ax.set_ylabel('Moment of Inertia I (kg·m²)')
ax.set_title(f'I for common shapes (M = {M} kg, R = {R} m)')
ax.set_ylim(0, max(I_values) * 1.2)

for bar, val in zip(bars, I_values):
    ax.text(bar.get_x() + bar.get_width()/2., bar.get_height() + 0.01,
            f'{val:.3f}', ha='center', va='bottom', fontsize=9)
plt.tight_layout()
plt.show()

print("\\nMass distribution ranking (harder to spin = larger I):")
for name, I in sorted(shapes.items(), key=lambda x: -x[1]):
    print(f"  {name.replace(chr(10), ' ')}: I = {I:.4f} kg·m²")`,
          prose: [
            'Each formula is entered directly from the table of standard shapes. The hollow cylinder I = MR² represents all mass at r = R; the solid cylinder I = ½MR² comes from integrating from r = 0 to R where not all mass is at the rim.',
            'The bar chart makes the ordering visual: hollow cylinder is hardest to spin (all mass at rim), solid sphere is easiest (most mass near center). Same M and R, but the internal distribution determines how much resistance the object offers to angular acceleration.',
            'The sorted output confirms the hierarchy: hollow cylinder > hollow sphere > solid cylinder > solid sphere. This ranking determines which shape wins rolling races — more rotational inertia means less translation speed at the bottom of the ramp.',
          ],
        },
        {
          cellTitle: 'Skater simulation: L = Iω conservation',
          type: 'code',
          language: 'python',
          code: `import numpy as np
import matplotlib.pyplot as plt

# Figure skater: I changes continuously as arms move in
# L = I*omega = constant throughout

L = 8.0  # angular momentum (kg·m²/s) — set by initial spin

# Model I as a function of "arm extension" parameter a ∈ [0, 1]
# a=1: arms fully out (I_max), a=0: arms in (I_min)
I_min = 1.0   # arms in (kg·m²)
I_max = 4.0   # arms out (kg·m²)

arm_positions = np.linspace(0, 1, 200)          # 0=in, 1=out
I_values = I_min + (I_max - I_min) * arm_positions  # linear model
omega_values = L / I_values                      # ω = L/I (conservation)
KE_values = 0.5 * I_values * omega_values**2    # KE = ½Iω²

fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(12, 5))

ax1.plot(arm_positions, omega_values, 'b-', linewidth=2)
ax1.set_xlabel('Arm extension (0=in, 1=out)')
ax1.set_ylabel('Angular velocity ω (rad/s)')
ax1.set_title('L = Iω = const: pull arms in → spin faster')
ax1.axhline(L/I_min, color='r', linestyle=':', alpha=0.5, label=f'ω_max = {L/I_min:.1f} rad/s')
ax1.axhline(L/I_max, color='g', linestyle=':', alpha=0.5, label=f'ω_min = {L/I_max:.1f} rad/s')
ax1.legend(); ax1.grid(True)

ax2.plot(arm_positions, KE_values, 'r-', linewidth=2)
ax2.set_xlabel('Arm extension (0=in, 1=out)')
ax2.set_ylabel('Rotational KE (J)')
ax2.set_title('KE = ½Iω² increases as arms pull in (muscle work!)')
ax2.grid(True)

plt.tight_layout()
plt.show()

print(f"Arms out: I = {I_max} kg·m², ω = {L/I_max:.2f} rad/s, KE = {0.5*I_max*(L/I_max)**2:.2f} J")
print(f"Arms in:  I = {I_min} kg·m², ω = {L/I_min:.2f} rad/s, KE = {0.5*I_min*(L/I_min)**2:.2f} J")
print(f"Extra KE from muscle work: {0.5*I_min*(L/I_min)**2 - 0.5*I_max*(L/I_max)**2:.2f} J")`,
          prose: [
            'omega_values = L / I_values is the conservation law in one line: L is constant (no external torque), so as I decreases (arms in), ω must increase inversely. The hyperbolic shape of the ω curve reflects this inverse relationship.',
            'The second plot reveals something surprising: KE increases as arms pull in. This violates naive "conservation of energy" intuition — the energy comes from the skater\'s muscles doing work against the centrifugal tendency to fling the arms outward.',
            'The print output quantifies it: ω quadruples (from 2 to 8 rad/s when I reduces by 4×), and KE increases from 8 J to 32 J. Angular momentum is conserved; mechanical energy is NOT (it increases by the muscle work done).',
          ],
        },
        {
          cellTitle: 'Parallel axis theorem: I as a function of axis position',
          type: 'code',
          language: 'python',
          code: `import numpy as np
import matplotlib.pyplot as plt

# Uniform rod: I as the axis moves from center to end (and beyond)
M = 3.0  # kg
L = 1.2  # m

I_cm = (1/12) * M * L**2   # I about center

# d = distance from center of mass to the new axis
d_values = np.linspace(-L, L, 300)  # from -L to +L of center
I_values = I_cm + M * d_values**2   # parallel axis theorem

d_end = L / 2  # end is L/2 from center
I_end_formula = (1/3) * M * L**2
I_end_parallel = I_cm + M * (L/2)**2

plt.figure(figsize=(9, 5))
plt.plot(d_values, I_values, 'b-', linewidth=2, label='I = I_cm + Md²')
plt.axvline(-L/2, color='r', linestyle='--', alpha=0.7, label='Left end (d = −L/2)')
plt.axvline(L/2,  color='r', linestyle='--', alpha=0.7, label='Right end (d = L/2)')
plt.axvline(0, color='g', linestyle=':', alpha=0.7, label='Center (d = 0, minimum I)')
plt.xlabel('Distance d from center of mass (m)')
plt.ylabel('Moment of inertia I (kg·m²)')
plt.title('Parallel axis theorem: I = I_cm + Md² for a rod')
plt.legend(); plt.grid(True)
plt.show()

print(f"I_cm = {I_cm:.4f} kg·m²  (center, minimum)")
print(f"I_end (formula 1/3ML²) = {I_end_formula:.4f} kg·m²")
print(f"I_end (parallel axis)  = {I_end_parallel:.4f} kg·m²  ← must match")`,
          prose: [
            'I_values = I_cm + M * d_values**2 applies the parallel axis theorem for every axis position simultaneously. The parabolic shape is characteristic — I is minimized at the center of mass (d = 0) and increases quadratically as the axis moves away.',
            'The vertical dashed lines mark the two ends of the rod (d = ±L/2). Reading off those values gives I_end = I_cm + M(L/2)² = ML²/12 + ML²/4 = ML²/3 — exactly the formula from the table.',
            'The print output verifies agreement between the direct formula I = ML²/3 and the parallel axis theorem result — they must match. This is a key check: any time you derive I two ways, they should agree.',
          ],
        },
        {
          cellTitle: 'Challenge: neutron star spin-up calculation',
          type: 'code',
          language: 'python',
          challengeType: 'write',
          starterCode: `import numpy as np

# A star collapses to form a neutron star
# Model both as uniform spheres: I = (2/5) * M * R^2
# Angular momentum L = Iω is conserved during collapse

M_star = 2e30           # kg (≈ 1 solar mass)
R_star = 7e8            # m  (≈ 700,000 km, like our Sun)
omega_star = 2*np.pi / (25 * 24 * 3600)  # rad/s (25-day rotation like the Sun)

R_neutron = R_star / 1000  # radius shrinks by factor of 1000

# TODO:
# 1. Compute I_star and I_neutron using I = (2/5)*M*R^2
# 2. Find omega_neutron using L = I_star * omega_star = I_neutron * omega_neutron
# 3. Convert omega_neutron to revolutions per second
# 4. Print: initial ω, final ω, and the ratio
# 5. The fastest observed pulsars spin at ~700 rev/s — is this consistent?
`,
        },
      ],
    },
    matlab: {
      type: 'OpenMatNotebook',
      title: 'Moment of Inertia in MATLAB/Octave',
      cells: [
        {
          cellTitle: 'Compare I values for common shapes',
          type: 'code',
          language: 'matlab',
          code: `% Common shapes: same M and R, different I
M = 2.0;  % kg
R = 0.5;  % m

shapes = {'Hollow cyl', 'Hollow sph', 'Solid cyl', 'Solid sph', 'Rod (end)', 'Rod (ctr)'};
I_vals = [M*R^2, (2/3)*M*R^2, 0.5*M*R^2, (2/5)*M*R^2, ...
          (1/3)*M*(2*R)^2, (1/12)*M*(2*R)^2];

figure;
bar(I_vals, 'FaceColor', 'flat');
set(gca, 'XTickLabel', shapes, 'XTick', 1:length(shapes));
ylabel('Moment of Inertia (kg·m²)');
title(sprintf('I comparison (M=%.1f kg, R=%.1f m)', M, R));
grid on;

% Label each bar
for i = 1:length(I_vals)
    text(i, I_vals(i) + 0.01, sprintf('%.3f', I_vals(i)), ...
         'HorizontalAlignment', 'center', 'FontSize', 9);
end

fprintf('Shapes ranked by I (hardest to spin first):\\n');
[sorted_I, idx] = sort(I_vals, 'descend');
for i = 1:length(sorted_I)
    fprintf('  %d. %s: I = %.4f kg·m²\\n', i, shapes{idx(i)}, sorted_I(i));
end`,
          prose: [
            'I_vals is a row vector computed all at once — MATLAB evaluates each element in order. The (2*R)^2 terms for the rod use rod length L = 2R as a convenient choice to make dimensions comparable.',
            'sort(I_vals, "descend") returns the sorted values AND the original indices, letting us print the ranked names without duplicating the shape labels. This MATLAB pattern (sort returning indices) is useful whenever you need to rank items with associated labels.',
            'The bar labels use text() at each bar position. The ranking output mirrors the Python result: hollow cylinder hardest (all mass at rim), solid sphere easiest (most mass near center).',
          ],
        },
        {
          cellTitle: 'Angular momentum conservation: skater simulation',
          type: 'code',
          language: 'matlab',
          code: `% Skater: arms pull in, I decreases, omega increases to conserve L
L = 8.0;      % angular momentum (kg·m²/s)
I_min = 1.0;  % arms in
I_max = 4.0;  % arms out

arm = linspace(0, 1, 200);                    % 0=in, 1=out
I_vals   = I_min + (I_max - I_min) * arm;     % I as function of arm position
omega    = L ./ I_vals;                       % ω = L/I
KE_vals  = 0.5 * I_vals .* omega.^2;         % KE = ½Iω²

figure;
subplot(1,2,1);
plot(arm, omega, 'b-', 'LineWidth', 2);
xlabel('Arm extension (0=in, 1=out)');
ylabel('\omega (rad/s)');
title('L = I\omega conserved: pull in \rightarrow spin faster');
grid on;

subplot(1,2,2);
plot(arm, KE_vals, 'r-', 'LineWidth', 2);
xlabel('Arm extension (0=in, 1=out)');
ylabel('KE (J)');
title('KE increases as arms pull in (muscle work)');
grid on;

fprintf('Arms out: I=%.1f, omega=%.2f rad/s, KE=%.2f J\\n', I_max, L/I_max, 0.5*I_max*(L/I_max)^2);
fprintf('Arms in:  I=%.1f, omega=%.2f rad/s, KE=%.2f J\\n', I_min, L/I_min, 0.5*I_min*(L/I_min)^2);`,
          prose: [
            'omega = L ./ I_vals uses element-wise division on the vector I_vals — MATLAB requires ./ (not /) for element-wise operations on arrays. Each element of omega is L divided by the corresponding I.',
            'subplot(1,2,1) and subplot(1,2,2) place two plots side by side in the same figure window. The \\omega and \\rightarrow in the title strings are LaTeX commands that MATLAB renders as mathematical symbols.',
            'The fprintf output shows: arms out (I=4) → ω=2 rad/s, KE=8 J; arms in (I=1) → ω=8 rad/s, KE=32 J. Angular momentum L=8 is constant throughout; KE increased by 24 J from muscle work. Same result as Python.',
          ],
        },
        {
          cellTitle: 'Parallel axis theorem: parabolic I curve',
          type: 'code',
          language: 'matlab',
          code: `% Parallel axis theorem: I = I_cm + Md² for a rod as axis moves
M = 3.0;   % kg
L = 1.2;   % m

I_cm = (1/12) * M * L^2;   % minimum I (center axis)
d_vals = linspace(-L, L, 300);
I_vals = I_cm + M * d_vals.^2;   % element-wise .^2

figure;
plot(d_vals, I_vals, 'b-', 'LineWidth', 2);
hold on;
xline(-L/2, 'r--', 'Left end', 'LineWidth', 1.5);
xline( L/2, 'r--', 'Right end', 'LineWidth', 1.5);
xline(0, 'g:', 'Center (min I)', 'LineWidth', 1.5);
xlabel('Axis position d from center of mass (m)');
ylabel('Moment of Inertia I (kg·m²)');
title('I = I_{cm} + Md^2: parabola, minimum at center of mass');
grid on; legend('I(d)', 'End', 'End', 'Center');

I_end_direct  = (1/3) * M * L^2;
I_end_theorem = I_cm + M * (L/2)^2;
fprintf('I_cm = %.4f kg·m²\\n', I_cm);
fprintf('I_end (direct formula): %.4f\\n', I_end_direct);
fprintf('I_end (parallel axis):  %.4f\\n', I_end_theorem);
fprintf('Agreement: %s\\n', mat2str(abs(I_end_direct - I_end_theorem) < 1e-10));`,
          prose: [
            'I_vals = I_cm + M * d_vals.^2 uses .^2 for element-wise squaring of the vector d_vals. The result is a parabola in d — the simplest possible shape, because the parallel axis theorem adds a quadratic term to the constant I_cm.',
            'xline() draws vertical reference lines at the axis positions of interest. These show where the ends of the rod are (d = ±L/2), confirming visually that I_end > I_cm as expected from Md² > 0.',
            'The agreement check uses mat2str on a logical comparison — this prints "1" (true) if the two methods agree to 10 decimal places, confirming the parallel axis theorem is consistent with the direct integration formula.',
          ],
        },
        {
          cellTitle: 'Challenge: neutron star spin-up',
          type: 'code',
          language: 'matlab',
          challengeType: 'write',
          starterCode: `% Neutron star spin-up via angular momentum conservation
M_star = 2e30;    % kg (1 solar mass)
R_star = 7e8;     % m  (solar radius)
T_star = 25 * 24 * 3600;  % s (25-day rotation period)
omega_star = 2*pi / T_star;

R_neutron = R_star / 1000;  % radius shrinks by 1000x

% TODO:
% 1. Compute I_star = (2/5)*M*R^2 for the star
% 2. Compute I_neutron = (2/5)*M*R_neutron^2
% 3. Use L = I_star * omega_star = I_neutron * omega_neutron
% 4. Convert omega_neutron to rev/s
% 5. Print the ratio I_star/I_neutron and compare omega values
`,
        },
      ],
    },
  },
};
