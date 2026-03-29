export default {
  id: 'p1-ch8-004',
  slug: 'wave-equation',
  chapter: 'p8',
  order: 4,
  title: 'The Wave Equation',
  subtitle: 'One PDE governs all waves: sound, light, strings, and quantum matter.',
  tags: ['wave equation', 'PDE', 'partial differential equation', 'superposition', 'standing waves', 'nodes', 'antinodes', 'd\'Alembert'],

  hook: {
    question:
      'A guitar string is plucked at its center. ' +
      'The disturbance splits into two pulses traveling in opposite directions. ' +
      'When they meet at the ends of the string, they reflect and travel back. ' +
      'When two waves occupy the same string simultaneously — what happens? ' +
      'Does the string break? Do the waves cancel? Do they add? ' +
      'And why does the string eventually settle into a smooth, sustained tone?',
    realWorldContext:
      'The wave equation ∂²y/∂t² = v² ∂²y/∂x² is one of the most important equations in all of physics. ' +
      'Maxwell derived it for electromagnetic fields in 1865 — and found v = 1/√(ε₀μ₀) = c. ' +
      'This single calculation revealed that light is an electromagnetic wave. ' +
      'Schrödinger\'s equation (quantum mechanics) is a wave equation. ' +
      'Einstein\'s gravitational wave equation (GR) is a wave equation. ' +
      'Every wave phenomenon in nature descends from the same mathematical structure.',
    previewVisualizationId: 'WaveformViz',
  },

  intuition: {
    prose: [
      '**Superposition:** When two waves occupy the same medium, they simply add. ' +
        'y_total = y₁ + y₂. The string doesn\'t break or cancel — ' +
        'each wave passes through the other as if the other weren\'t there. ' +
        'After they cross, each continues unchanged. This is the **principle of superposition**, ' +
        'and it holds whenever the medium responds linearly (which it does for small amplitudes).',

      '**Standing waves from superposition:** When two identical waves travel in opposite directions, ' +
        'their superposition creates a **standing wave** — a pattern that oscillates in place without traveling. ' +
        'Some points (nodes) never move; others (antinodes) oscillate with maximum amplitude. ' +
        'This is the vibration pattern of guitar strings, organ pipes, and laser cavities.',

      '**Why the guitar settles into a tone:** The string can only sustain vibrations where ' +
        'integer numbers of half-wavelengths fit between the fixed ends: L = nλ/2. ' +
        'These are the **harmonics** or **normal modes**. ' +
        'The fundamental (n=1) is the lowest pitch. Overtones (n=2,3,...) create the timbre. ' +
        'The Fourier theorem says any pluck shape can be decomposed into these modes — ' +
        'and each mode sustains independently. The tone you hear is the superposition.',

      '**The wave equation:** The mathematical statement that disturbances propagate at speed v. ' +
        'It equates the second time-derivative (acceleration of the medium) to the second space-derivative (curvature of the wave): ' +
        '∂²y/∂t² = v² ∂²y/∂x². ' +
        'Any function of the form f(x − vt) or g(x + vt) satisfies it — and so does any sum of such functions. ' +
        'This is why superposition works: the equation is linear.',
    ],
    callouts: [
      {
        type: 'sequencing',
        title: 'Lesson 4 of 4 — The wave equation closes Chapter 8',
        body:
          '**Lessons 1–3:** Hooke\'s Law → SHM → wave properties.\\n' +
          '**This lesson:** The wave equation — the PDE that governs all wave phenomena.\\n' +
          '**Physics 2:** Interference, diffraction, EM waves, Maxwell\'s equations.\\n' +
          '**Math connection:** This is the first PDE you\'ve seen — it opens the door to differential equations.',
      },
      {
        type: 'theorem',
        title: 'The wave equation',
        body:
          '\\frac{\\partial^2 y}{\\partial t^2} = v^2 \\frac{\\partial^2 y}{\\partial x^2}\\\\' +
          '\\text{Solutions: } y = f(x - vt) + g(x + vt) \\text{ (d\'Alembert)}',
      },
      {
        type: 'theorem',
        title: 'Principle of superposition',
        body:
          '\\text{If } y_1 \\text{ and } y_2 \\text{ are solutions, so is } y_1 + y_2.\\\\' +
          '\\text{(The wave equation is linear — no } y^2 \\text{ terms.)}',
      },
      {
        type: 'theorem',
        title: 'Standing waves on a string',
        body:
          'y(x,t) = 2A\\sin(kx)\\cos(\\omega t)\\\\' +
          '\\text{Nodes: } x = 0, \\lambda/2, \\lambda, \\ldots \\quad (\\sin(kx) = 0)\\\\' +
          '\\text{Antinodes: } x = \\lambda/4, 3\\lambda/4, \\ldots \\quad (|\\sin(kx)| = 1)',
      },
      {
        type: 'theorem',
        title: 'Harmonics of a string fixed at both ends',
        body:
          'L = n\\frac{\\lambda_n}{2} \\Rightarrow \\lambda_n = \\frac{2L}{n} \\Rightarrow f_n = \\frac{nv}{2L} = nf_1\\\\' +
          '\\text{Fundamental: } f_1 = \\frac{v}{2L} = \\frac{1}{2L}\\sqrt{\\frac{F_T}{\\mu}}',
      },
      {
        type: 'connection',
        title: 'Calculus: the wave equation is a second-order PDE',
        body:
          '\\(\\partial^2 y/\\partial t^2\\) and \\(\\partial^2 y/\\partial x^2\\) are partial derivatives — ' +
          'differentiate with respect to one variable while treating the other as constant. ' +
          'This is your first PDE: an equation for an unknown function of two variables. ' +
          'The techniques for ODEs (Lesson 8.2) extend naturally: guess a separable solution y = X(x)T(t), ' +
          'substitute, and reduce to two ODEs.',
      },
      {
        type: 'insight',
        title: 'Why light is a wave: Maxwell\'s wave equation',
        body:
          'From Maxwell\'s equations, the electric field satisfies \\(\\partial^2 E/\\partial t^2 = (1/\\varepsilon_0\\mu_0)\\partial^2 E/\\partial x^2\\). ' +
          'This is the wave equation with \\(v^2 = 1/(\\varepsilon_0\\mu_0)\\). ' +
          'Plugging in measured values: \\(v = 3 \\times 10^8\\) m/s = c. ' +
          'Maxwell concluded: light is an electromagnetic wave.',
      },
    ],
    visualizations: [
      {
        id: 'WaveformViz',
        title: 'Two waves passing through each other — superposition live',
        mathBridge:
          'Watch two pulses approach, overlap (showing their sum), then separate unchanged. ' +
          'Set them to equal but opposite amplitudes: they cancel at the crossing moment, then reappear. ' +
          'The medium briefly shows zero displacement — but each wave\'s energy continues forward.',
        caption: 'Superposition: waves add algebraically at every point. Each wave continues unchanged after the overlap.',
        props: { showSuperposition: true, twoWaves: true },
      },
      {
        id: 'WaveformViz',
        title: 'Standing wave — nodes and antinodes',
        mathBridge:
          'Set two waves of equal amplitude traveling in opposite directions. ' +
          'Watch the standing wave form: nodes stay fixed, antinodes oscillate in place. ' +
          'Change frequency to hit different harmonics: n=1 (fundamental), n=2 (first overtone).',
        caption: 'y = 2A sin(kx) cos(ωt). The pattern oscillates in place — no net energy transport.',
        props: { showStandingWave: true, interactive: true },
      },
    ],
  },

  math: {
    prose: [
      'The general solution to the 1D wave equation (d\'Alembert\'s solution):',
      '\\(y(x,t) = f(x - vt) + g(x + vt)\\)',
      'where f and g are arbitrary functions — the shape of the right- and left-traveling waves respectively.',
      'The sinusoidal traveling wave \\(y = A\\sin(kx - \\omega t)\\) is a special case with \\(f(u) = A\\sin(ku/v \\cdot k)\\).',
      'For standing waves (superposition of two oppositely-traveling sinusoids):',
      '\\(A\\sin(kx - \\omega t) + A\\sin(kx + \\omega t) = 2A\\sin(kx)\\cos(\\omega t)\\)',
      'using the sum-to-product identity: \\(\\sin(u-v) + \\sin(u+v) = 2\\sin u \\cos v\\).',
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'Open pipe vs closed pipe harmonics',
        body:
          '\\text{Open both ends (antinodes at ends): } f_n = \\frac{nv}{2L}, \\; n = 1,2,3,\\ldots\\\\' +
          '\\text{Closed one end (node at closed, antinode at open): } f_n = \\frac{nv}{4L}, \\; n = 1,3,5,\\ldots \\text{(odd only)}',
      },
      {
        type: 'insight',
        title: 'Fourier\'s theorem: any wave is a sum of sinusoids',
        body:
          'The wave equation is linear, so any sum of solutions is a solution. ' +
          'Fourier\'s theorem says: any periodic function can be written as a sum of sinusoids ' +
          '(at the fundamental frequency and its harmonics). ' +
          'This is why: (1) complex waveforms decompose into pure tones, ' +
          '(2) a guitar sounds different from a flute at the same pitch — different harmonic content, ' +
          '(3) signal processing, image compression, and quantum mechanics all use the same mathematics.',
      },
    ],
    visualizations: [
      {
        id: 'FunctionPlotter',
        title: 'Standing wave: y = 2A sin(kx) cos(ωt)',
        mathBridge:
          'At t = 0: y = 2A sin(kx) — full amplitude spatial pattern. ' +
          'At t = T/4 (ωt = π/2): cos(π/2) = 0 — every point at zero (string flat). ' +
          'At t = T/2: y = −2A sin(kx) — inverted. ' +
          'The nodes (sin(kx) = 0) never move regardless of time.',
        caption: 'Standing wave is a product of space (sin kx) and time (cos ωt). Nodes are fixed in space.',
        props: { expression: '0.1*sin(PI*x)', variable: 'x', xMin: 0, xMax: 2, label: 'y (m)' },
      },
    ],
  },

  rigor: {
    title: 'Verifying d\'Alembert\'s solution and deriving standing waves',
    proofSteps: [
      {
        expression: '\\text{Claim: } y = f(x - vt) \\text{ satisfies } \\partial^2 y/\\partial t^2 = v^2 \\partial^2 y/\\partial x^2',
        annotation: 'Let u = x − vt. Then y = f(u).',
      },
      {
        expression: '\\frac{\\partial y}{\\partial t} = f\'(u)\\cdot(-v) \\quad \\Rightarrow \\quad \\frac{\\partial^2 y}{\\partial t^2} = f\'\'(u)\\cdot v^2',
        annotation: 'Chain rule: ∂u/∂t = −v.',
      },
      {
        expression: '\\frac{\\partial y}{\\partial x} = f\'(u) \\quad \\Rightarrow \\quad \\frac{\\partial^2 y}{\\partial x^2} = f\'\'(u)',
        annotation: 'Chain rule: ∂u/∂x = 1.',
      },
      {
        expression: 'v^2 \\frac{\\partial^2 y}{\\partial x^2} = v^2 f\'\'(u) = \\frac{\\partial^2 y}{\\partial t^2} \\quad \\checkmark',
        annotation: 'Satisfied for ANY twice-differentiable f. This is why waves maintain their shape.',
      },
      {
        expression:
          'A\\sin(kx-\\omega t) + A\\sin(kx+\\omega t)\\\\' +
          '= A[\\sin(kx)\\cos(\\omega t) - \\cos(kx)\\sin(\\omega t)] + A[\\sin(kx)\\cos(\\omega t) + \\cos(kx)\\sin(\\omega t)]\\\\' +
          '= 2A\\sin(kx)\\cos(\\omega t)',
        annotation: 'Standing wave from superposition. The cos(kx) sin(ωt) terms cancel; the sin(kx) cos(ωt) terms add.',
      },
    ],
  },

  examples: [
    {
      id: 'ch8-004-ex1',
      title: 'Harmonics of a guitar string',
      problem:
        '\\text{A guitar string (L = 0.65 m, v = 410 m/s). ' +
        'Find the fundamental frequency and first three overtone frequencies.}',
      steps: [
        {
          expression: 'f_1 = v/(2L) = 410/(2 \\times 0.65) = 410/1.3 \\approx 315\\,\\text{Hz}',
          annotation: 'Fundamental frequency.',
        },
        {
          expression: 'f_2 = 2f_1 = 630\\,\\text{Hz}, \\quad f_3 = 3f_1 = 945\\,\\text{Hz}, \\quad f_4 = 4f_1 = 1260\\,\\text{Hz}',
          annotation: 'Harmonics: all integer multiples of f₁.',
        },
      ],
      conclusion: 'Fundamental ≈ 315 Hz; harmonics at 630, 945, 1260 Hz. The harmonic series creates the characteristic timbre.',
    },
    {
      id: 'ch8-004-ex2',
      title: 'Identifying wave direction and speed from the equation',
      problem:
        '\\text{Identify the direction, speed, amplitude, and wavelength of: (a) y = 0.03 sin(2x − 8t), (b) y = 0.05 cos(πx + 3πt).}',
      steps: [
        {
          expression: '(a)\\; k = 2, \\omega = 8 \\Rightarrow v = \\omega/k = 4\\,\\text{m/s (+x direction)}; \\; A = 0.03\\,\\text{m}; \\; \\lambda = 2\\pi/2 = \\pi\\,\\text{m}',
          annotation: 'kx − ωt → positive x direction.',
        },
        {
          expression: '(b)\\; k = \\pi, \\omega = 3\\pi \\Rightarrow v = 3\\,\\text{m/s (−x direction)}; \\; A = 0.05\\,\\text{m}; \\; \\lambda = 2\\pi/\\pi = 2\\,\\text{m}',
          annotation: 'kx + ωt → negative x direction.',
        },
      ],
      conclusion: '(a) Rightward, v = 4 m/s, λ = π m. (b) Leftward, v = 3 m/s, λ = 2 m.',
    },
  ],

  challenges: [
    {
      id: 'ch8-004-ch1',
      difficulty: 'easy',
      problem:
        '\\text{A string is 0.8 m long and the wave speed is 320 m/s. List the first four harmonic frequencies.}',
      hint: 'f_n = nv/(2L).',
      walkthrough: [
        {
          expression: 'f_1 = 320/(1.6) = 200\\,\\text{Hz}; \\; f_2 = 400\\,\\text{Hz}; \\; f_3 = 600\\,\\text{Hz}; \\; f_4 = 800\\,\\text{Hz}',
          annotation: '',
        },
      ],
      answer: '200, 400, 600, 800 Hz.',
    },
    {
      id: 'ch8-004-ch2',
      difficulty: 'medium',
      problem:
        '\\text{Two waves: y₁ = 0.04 sin(3x − 6t) and y₂ = 0.04 sin(3x + 6t). ' +
        'Write the standing wave and find the positions of the first three nodes and antinodes.}',
      hint: 'Use the superposition formula. Nodes where sin(kx) = 0; antinodes where |sin(kx)| = 1.',
      walkthrough: [
        {
          expression: 'y = y_1 + y_2 = 2(0.04)\\sin(3x)\\cos(6t) = 0.08\\sin(3x)\\cos(6t)',
          annotation: 'Standing wave amplitude = 2A = 0.08 m.',
        },
        {
          expression: '\\text{Nodes: } 3x = n\\pi \\Rightarrow x = 0, \\pi/3, 2\\pi/3 \\approx 0, 1.05, 2.09\\,\\text{m}',
          annotation: 'sin(3x) = 0.',
        },
        {
          expression: '\\text{Antinodes: } 3x = \\pi/2 + n\\pi \\Rightarrow x = \\pi/6, \\pi/2, 5\\pi/6 \\approx 0.52, 1.57, 2.62\\,\\text{m}',
          annotation: 'sin(3x) = ±1.',
        },
      ],
      answer: 'y = 0.08 sin(3x) cos(6t). Nodes at x = 0, π/3, 2π/3 m. Antinodes at x = π/6, π/2, 5π/6 m.',
    },
    {
      id: 'ch8-004-ch3',
      difficulty: 'hard',
      problem:
        '\\text{Verify by substitution that y(x,t) = A sin(kx)cos(ωt) satisfies the wave equation, ' +
        'and find the condition on k, ω, and v for it to be a valid standing wave solution.}',
      hint: 'Compute ∂²y/∂t² and ∂²y/∂x². Set them equal with the wave equation factor v².',
      walkthrough: [
        {
          expression: '\\frac{\\partial^2 y}{\\partial t^2} = -A\\omega^2\\sin(kx)\\cos(\\omega t)',
          annotation: 'Differentiate twice with respect to t: cos → −sin → −cos, carrying factor ω each time.',
        },
        {
          expression: '\\frac{\\partial^2 y}{\\partial x^2} = -Ak^2\\sin(kx)\\cos(\\omega t)',
          annotation: 'Differentiate twice with respect to x: sin → cos → −sin, carrying factor k each time.',
        },
        {
          expression: '-A\\omega^2\\sin(kx)\\cos(\\omega t) = v^2 \\cdot (-Ak^2)\\sin(kx)\\cos(\\omega t)',
          annotation: 'Substituting into the wave equation.',
        },
        {
          expression: '\\omega^2 = v^2 k^2 \\quad \\Rightarrow \\quad \\omega = vk \\quad \\Rightarrow \\quad v = \\omega/k = f\\lambda \\quad \\checkmark',
          annotation: 'The dispersion relation: the wave equation constrains ω and k to satisfy ω = vk. This is just v = fλ in disguise.',
        },
      ],
      answer: 'Valid solution provided ω = vk (equivalently v = fλ). The wave equation enforces the fundamental wave relationship.',
    },
  ],
}
