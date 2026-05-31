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
      'A guitar string is plucked at its center. The disturbance splits into two pulses traveling in opposite directions. When they meet at the ends of the string, they reflect and travel back. When two waves occupy the same string simultaneously — what happens? Does the string break? Do the waves cancel? Do they add? And why does the string eventually settle into a smooth, sustained tone?',
    realWorldContext:
      'The wave equation ∂²y/∂t² = v² ∂²y/∂x² is one of the most important equations in all of physics. Maxwell derived it for electromagnetic fields in 1865 — and found v = 1/√(ε₀μ₀) = c. This single calculation revealed that light is an electromagnetic wave. Schrödinger\'s equation (quantum mechanics) is a wave equation. Einstein\'s gravitational wave equation (GR) is a wave equation. Every wave phenomenon in nature descends from the same mathematical structure.',
    previewVisualizationId: 'WaveformViz',
  },

  intuition: {
    prose: [
      '**Superposition:** When two waves occupy the same medium, they simply add. y_total = y₁ + y₂. The string doesn\'t break or cancel — each wave passes through the other as if the other weren\'t there. After they cross, each continues unchanged. This is the **principle of superposition**, and it holds whenever the medium responds linearly (which it does for small amplitudes).',

      '**Standing waves from superposition:** When two identical waves travel in opposite directions, their superposition creates a **standing wave** — a pattern that oscillates in place without traveling. Some points (nodes) never move; others (antinodes) oscillate with maximum amplitude. This is the vibration pattern of guitar strings, organ pipes, and laser cavities.',

      '**Why the guitar settles into a tone:** The string can only sustain vibrations where integer numbers of half-wavelengths fit between the fixed ends: L = nλ/2. These are the **harmonics** or **normal modes**. The fundamental (n=1) is the lowest pitch. Overtones (n=2,3,...) create the timbre. The Fourier theorem says any pluck shape can be decomposed into these modes — and each mode sustains independently. The tone you hear is the superposition.',

      '**The wave equation:** The mathematical statement that disturbances propagate at speed v. It equates the second time-derivative (acceleration of the medium) to the second space-derivative (curvature of the wave): ∂²y/∂t² = v² ∂²y/∂x². Any function of the form f(x − vt) or g(x + vt) satisfies it — and so does any sum of such functions. This is why superposition works: the equation is linear.',
    ],
    callouts: [
      {
        type: 'sequencing',
        title: 'Lesson 4 of 4 — The wave equation closes Chapter 8',
        body:
          '**Lessons 1–3:** Hooke\'s Law → SHM → wave properties.\\n**This lesson:** The wave equation — the PDE that governs all wave phenomena.\\n**Physics 2:** Interference, diffraction, EM waves, Maxwell\'s equations.\\n**Math connection:** This is the first PDE you\'ve seen — it opens the door to differential equations.',
      },
      {
        type: 'theorem',
        title: 'The wave equation',
        body:
          '\\frac{\\partial^2 y}{\\partial t^2} = v^2 \\frac{\\partial^2 y}{\\partial x^2}\\\\\\text{Solutions: } y = f(x - vt) + g(x + vt) \\text{ (d\'Alembert)}',
      },
      {
        type: 'theorem',
        title: 'Principle of superposition',
        body:
          '\\text{If } y_1 \\text{ and } y_2 \\text{ are solutions, so is } y_1 + y_2.\\\\\\text{(The wave equation is linear — no } y^2 \\text{ terms.)}',
      },
      {
        type: 'theorem',
        title: 'Standing waves on a string',
        body:
          'y(x,t) = 2A\\sin(kx)\\cos(\\omega t)\\\\\\text{Nodes: } x = 0, \\lambda/2, \\lambda, \\ldots \\quad (\\sin(kx) = 0)\\\\\\text{Antinodes: } x = \\lambda/4, 3\\lambda/4, \\ldots \\quad (|\\sin(kx)| = 1)',
      },
      {
        type: 'theorem',
        title: 'Harmonics of a string fixed at both ends',
        body:
          'L = n\\frac{\\lambda_n}{2} \\Rightarrow \\lambda_n = \\frac{2L}{n} \\Rightarrow f_n = \\frac{nv}{2L} = nf_1\\\\\\text{Fundamental: } f_1 = \\frac{v}{2L} = \\frac{1}{2L}\\sqrt{\\frac{F_T}{\\mu}}',
      },
      {
        type: 'connection',
        title: 'Calculus: the wave equation is a second-order PDE',
        body:
          '\\(\\partial^2 y/\\partial t^2\\) and \\(\\partial^2 y/\\partial x^2\\) are partial derivatives — differentiate with respect to one variable while treating the other as constant. This is your first PDE: an equation for an unknown function of two variables. The techniques for ODEs (Lesson 8.2) extend naturally: guess a separable solution y = X(x)T(t), substitute, and reduce to two ODEs.',
      },
      {
        type: 'insight',
        title: 'Why light is a wave: Maxwell\'s wave equation',
        body:
          'From Maxwell\'s equations, the electric field satisfies \\(\\partial^2 E/\\partial t^2 = (1/\\varepsilon_0\\mu_0)\\partial^2 E/\\partial x^2\\). This is the wave equation with \\(v^2 = 1/(\\varepsilon_0\\mu_0)\\). Plugging in measured values: \\(v = 3 \\times 10^8\\) m/s = c. Maxwell concluded: light is an electromagnetic wave.',
      },
    ],
    visualizations: [
      {
        id: 'WaveformViz',
        title: 'Two waves passing through each other — superposition live',
        mathBridge:
          'Watch two pulses approach, overlap (showing their sum), then separate unchanged. Set them to equal but opposite amplitudes: they cancel at the crossing moment, then reappear. The medium briefly shows zero displacement — but each wave\'s energy continues forward.',
        caption: 'Superposition: waves add algebraically at every point. Each wave continues unchanged after the overlap.',
        props: { showSuperposition: true, twoWaves: true },
      },
      {
        id: 'WaveformViz',
        title: 'Standing wave — nodes and antinodes',
        mathBridge:
          'Set two waves of equal amplitude traveling in opposite directions. Watch the standing wave form: nodes stay fixed, antinodes oscillate in place. Change frequency to hit different harmonics: n=1 (fundamental), n=2 (first overtone).',
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
          '\\text{Open both ends (antinodes at ends): } f_n = \\frac{nv}{2L}, \\; n = 1,2,3,\\ldots\\\\\\text{Closed one end (node at closed, antinode at open): } f_n = \\frac{nv}{4L}, \\; n = 1,3,5,\\ldots \\text{(odd only)}',
      },
      {
        type: 'insight',
        title: 'Fourier\'s theorem: any wave is a sum of sinusoids',
        body:
          'The wave equation is linear, so any sum of solutions is a solution. Fourier\'s theorem says: any periodic function can be written as a sum of sinusoids (at the fundamental frequency and its harmonics). This is why: (1) complex waveforms decompose into pure tones, (2) a guitar sounds different from a flute at the same pitch — different harmonic content, (3) signal processing, image compression, and quantum mechanics all use the same mathematics.',
      },
    ],
    visualizations: [
      {
        id: 'FunctionPlotter',
        title: 'Standing wave: y = 2A sin(kx) cos(ωt)',
        mathBridge:
          'At t = 0: y = 2A sin(kx) — full amplitude spatial pattern. At t = T/4 (ωt = π/2): cos(π/2) = 0 — every point at zero (string flat). At t = T/2: y = −2A sin(kx) — inverted. The nodes (sin(kx) = 0) never move regardless of time.',
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
          'A\\sin(kx-\\omega t) + A\\sin(kx+\\omega t)\\\\= A[\\sin(kx)\\cos(\\omega t) - \\cos(kx)\\sin(\\omega t)] + A[\\sin(kx)\\cos(\\omega t) + \\cos(kx)\\sin(\\omega t)]\\\\= 2A\\sin(kx)\\cos(\\omega t)',
        annotation: 'Standing wave from superposition. The cos(kx) sin(ωt) terms cancel; the sin(kx) cos(ωt) terms add.',
      },
    ],
  },

  examples: [
    {
      id: 'ch8-004-ex1',
      title: 'Harmonics of a guitar string',
      problem:
        '\\text{A guitar string (L = 0.65 m, v = 410 m/s). Find the fundamental frequency and first three overtone frequencies.}',
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
        '\\text{Two waves: y₁ = 0.04 sin(3x − 6t) and y₂ = 0.04 sin(3x + 6t). Write the standing wave and find the positions of the first three nodes and antinodes.}',
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
        '\\text{Verify by substitution that y(x,t) = A sin(kx)cos(ωt) satisfies the wave equation, and find the condition on k, ω, and v for it to be a valid standing wave solution.}',
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

  quiz: [
    {
      id: 'p8-004-q1',
      type: 'choice',
      question: 'Two waves on the same string have the same amplitude A. If they are in phase (phase difference = 0), the superposition has amplitude:',
      options: ['2A', 'A', '0', 'A√2'],
      answer: '2A',
      hints: ['Superposition: add the waves. If both are at peak A simultaneously, their sum is A + A = 2A.', 'Fully constructive interference doubles the amplitude.'],
      reviewSection: 'intuition',
    },
    {
      id: 'p8-004-q2',
      type: 'choice',
      question: 'Two waves on the same string have amplitude A and are exactly out of phase (phase difference = π). The superposition has amplitude:',
      options: ['0', '2A', 'A', 'A/2'],
      answer: '0',
      hints: ['When one wave is at +A, the other is at −A. They cancel: A + (−A) = 0.', 'Fully destructive interference cancels the waves (at that instant).'],
      reviewSection: 'intuition',
    },
    {
      id: 'p8-004-q3',
      type: 'choice',
      question: 'A standing wave y = 2A sin(kx) cos(ωt) has nodes where:',
      options: ['sin(kx) = 0', 'cos(ωt) = 0', 'kx = π/2', 'ωt = 0'],
      answer: 'sin(kx) = 0',
      hints: ['A node is a point that never moves: y = 0 for ALL t.', 'Since cos(ωt) varies, the only way y = 0 always is if sin(kx) = 0 at that x.'],
      reviewSection: 'intuition',
    },
    {
      id: 'p8-004-q4',
      type: 'choice',
      question: 'A guitar string of length L = 0.6 m and wave speed v = 300 m/s. What is the fundamental frequency?',
      options: ['250 Hz', '500 Hz', '125 Hz', '300 Hz'],
      answer: '250 Hz',
      hints: ['f₁ = v/(2L) = 300/(2×0.6) = 300/1.2.', '300/1.2 = 250 Hz.'],
      reviewSection: 'math',
    },
    {
      id: 'p8-004-q5',
      type: 'choice',
      question: 'For the same guitar string (f₁ = 250 Hz), what is the third harmonic frequency?',
      options: ['750 Hz', '500 Hz', '1000 Hz', '83 Hz'],
      answer: '750 Hz',
      hints: ['Harmonics of a string fixed at both ends: f_n = n × f₁.', 'f₃ = 3 × 250 = 750 Hz.'],
      reviewSection: 'math',
    },
    {
      id: 'p8-004-q6',
      type: 'choice',
      question: 'A pipe open at both ends has length L = 0.5 m and sound speed 340 m/s. What is its fundamental frequency?',
      options: ['340 Hz', '170 Hz', '680 Hz', '85 Hz'],
      answer: '340 Hz',
      hints: ['Open pipe: f₁ = v/(2L) = 340/(2×0.5) = 340/1.', 'Same formula as a string fixed at both ends.'],
      reviewSection: 'math',
    },
    {
      id: 'p8-004-q7',
      type: 'choice',
      question: 'A pipe closed at one end (and open at the other) has length L = 0.5 m and sound speed 340 m/s. What is its fundamental frequency?',
      options: ['170 Hz', '340 Hz', '680 Hz', '85 Hz'],
      answer: '170 Hz',
      hints: ['Closed-open pipe: f₁ = v/(4L) (one quarter-wave fits).', 'f₁ = 340/(4×0.5) = 340/2 = 170 Hz. Only odd harmonics: 170, 510, 850 Hz...'],
      reviewSection: 'math',
    },
    {
      id: 'p8-004-q8',
      type: 'choice',
      question: 'The wave equation ∂²y/∂t² = v² ∂²y/∂x² is called a linear PDE because:',
      options: ['It contains no y² or (∂y)² terms — only y and its first/second derivatives', 'It produces straight-line waves', 'The medium is a linear solid', 'The wave travels in one direction only'],
      answer: 'It contains no y² or (∂y)² terms — only y and its first/second derivatives',
      hints: ['Linear equations have the property: if y₁ and y₂ are solutions, so is y₁ + y₂.', 'Linearity is what makes superposition work. Non-linear wave equations don\'t allow simple addition.'],
      reviewSection: 'intuition',
    },
    {
      id: 'p8-004-q9',
      type: 'choice',
      question: 'Two traveling waves: y₁ = A sin(kx − ωt) and y₂ = A sin(kx + ωt). Their sum y₁ + y₂ equals:',
      options: ['2A sin(kx) cos(ωt)', '2A cos(kx) sin(ωt)', '2A sin(kx − ωt)', 'A sin(2kx − 2ωt)'],
      answer: '2A sin(kx) cos(ωt)',
      hints: ['Use sin(u−v) + sin(u+v) = 2 sin(u) cos(v) with u = kx, v = ωt.', 'The result is a standing wave: sin(kx) gives the spatial pattern, cos(ωt) gives the oscillation.'],
      reviewSection: 'math',
    },
    {
      id: 'p8-004-q10',
      type: 'choice',
      question: 'At a node in a standing wave, the displacement is zero for all time. What about the pressure in a sound standing wave at a node?',
      options: ['Pressure is maximum at displacement nodes', 'Pressure is also zero at displacement nodes', 'Pressure oscillates randomly at nodes', 'Pressure is undefined at nodes'],
      answer: 'Pressure is maximum at displacement nodes',
      hints: ['For sound: displacement and pressure are 90° out of phase. Nodes of displacement are antinodes of pressure.', 'Where molecules don\'t move (node), they are maximally compressed/expanded — maximum pressure variation.'],
      reviewSection: 'math',
    },
  ],

  misconceptions: [
    {
      id: 'p8-004-m1',
      misconception: 'When two waves with opposite amplitudes meet, they destroy each other permanently.',
      correction: 'Destructive interference is temporary — the waves cancel only at the moment and location of overlap. Each wave continues traveling unchanged after the crossing. The energy is not lost; it is elsewhere in the wave train. The medium returns to zero displacement, but the energy continues propagating.',
      correctionExample: 'Two identical pulses of opposite sign traveling toward each other: at the moment they overlap, the string is flat (zero everywhere). One moment later, each pulse has passed through and continues in its original direction, unaltered.',
    },
    {
      id: 'p8-004-m2',
      misconception: 'A guitar string vibrates in only one mode (the fundamental) after being plucked.',
      correction: 'Plucking a string excites MANY harmonics simultaneously. The exact mix depends on where and how the string is plucked. Near the center → more fundamental, few higher harmonics. Near the bridge → richer in high harmonics (brighter tone). The Fourier theorem guarantees any pluck shape decomposes into the harmonic series, and each mode rings at its own frequency independently.',
      correctionExample: 'Pluck at 1/4 of the string length: this excites modes n = 1, 2, 3 strongly but suppresses n = 4 (the 4th harmonic has a node exactly at the 1/4 point). That\'s why pluck position changes timbre.',
    },
  ],

  transferPrompts: [
    {
      id: 'p8-004-t1',
      prompt: `Maxwell's equations in vacuum give the wave equation for the electric field E: ∂²E/∂t² = c² ∂²E/∂x² where c² = 1/(ε₀μ₀). Using measured values ε₀ = 8.85×10⁻¹² F/m and μ₀ = 4π×10⁻⁷ H/m, calculate c. What did Maxwell conclude when he computed this? Why was this one of the most important results in 19th-century physics?`,
      connection: 'The wave equation structure ∂²y/∂t² = v² ∂²y/∂x² identifies v² as the coefficient — Maxwell computed 1/(ε₀μ₀) and found it equaled c². This was the theoretical prediction that light is an electromagnetic wave.',
    },
    {
      id: 'p8-004-t2',
      prompt: `Musical harmonics and timbre: a violin and a flute both play concert A₄ (440 Hz), but they sound completely different. Both produce a standing wave at 440 Hz, but the violin has strong odd AND even harmonics while the flute has mostly fundamental. Using the idea that any periodic waveform = sum of harmonics (Fourier), explain: why does the timbre differ? What would you have to do to make a violin sound like a flute?`,
      connection: 'Standing waves on the string/air column create the harmonic series. Timbre = harmonic content = Fourier decomposition. The wave equation\'s linearity means harmonics are independent — you could add or remove them independently.',
    },
  ],

  debugging: [
    {
      id: 'p8-004-d1',
      error: `A student finding harmonics for a closed-open pipe (L = 0.4 m, v = 340 m/s) writes:
"f_n = nv/(2L) = n(340)/(0.8). So f₁ = 425 Hz, f₂ = 850 Hz, f₃ = 1275 Hz..."`,
      fix: `The student used the open-pipe formula f_n = nv/(2L) for a closed-open pipe. For a pipe closed at one end:
- Boundary conditions require a NODE at the closed end and ANTINODE at the open end
- Only ODD quarter-wavelengths fit: L = (2n−1)λ/4, giving f_n = (2n−1)v/(4L)
- f₁ = v/(4L) = 340/(4×0.4) = 212.5 Hz, f₂ (odd only) = 3×212.5 = 637.5 Hz

The closed pipe has fundamental f₁ = v/(4L) and produces ONLY ODD harmonics.`,
    },
    {
      id: 'p8-004-d2',
      error: `A student writes: "y₁ = 0.04 sin(3x−6t) and y₂ = −0.04 sin(3x−6t) are traveling in opposite directions, so they form a standing wave."`,
      fix: `For a standing wave, the two waves must travel in OPPOSITE directions. y₂ = −0.04 sin(3x−6t) = 0.04 sin(3x−6t+π) is the same wave direction (same sign of kx−ωt) but phase-shifted — this pair just produces destructive interference, not a standing wave.

For a standing wave, the second wave should be y₂ = 0.04 sin(3x+6t) (positive ωt means leftward travel). Then:
y₁ + y₂ = 0.04[sin(3x−6t) + sin(3x+6t)] = 0.08 sin(3x) cos(6t).`,
    },
  ],

  mastery: {
    targetLevel: 'Apply the superposition principle; derive and identify standing waves; compute harmonics for strings and pipes; verify that traveling waves satisfy the wave equation.',
    checklistItems: [
      'Can add two waves using superposition (y_total = y₁ + y₂)',
      'Can derive the standing wave y = 2A sin(kx) cos(ωt) from adding oppositely-traveling waves',
      'Can find nodes (sin(kx) = 0) and antinodes (|sin(kx)| = 1) for a standing wave',
      'Can compute harmonic frequencies for strings and open pipes (f_n = nv/2L) and closed-open pipes (f_n = (2n−1)v/4L, odd only)',
      'Can verify that a proposed function satisfies ∂²y/∂t² = v² ∂²y/∂x² by differentiating',
    ],
    commonStruggles: [
      'Using open-pipe formula f_n = nv/(2L) for a closed-open pipe — closed pipe uses v/(4L) and odd harmonics only',
      'Thinking destructive interference destroys waves permanently — waves pass through and continue unchanged',
      'Forming standing waves from same-direction waves rather than opposite-direction waves',
    ],
    nextSteps: 'Physics 2 covers EM waves (Maxwell\'s equations), interference patterns (Young\'s double slit), and diffraction — all based on the same wave equation structure.',
  },

  semantics: {
    core: [
      { symbol: '\\partial^2 y/\\partial t^2 = v^2 \\partial^2 y/\\partial x^2', meaning: 'The wave equation: medium acceleration equals v² times wave curvature; linear PDE governing all small-amplitude waves' },
      { symbol: 'y_1 + y_2', meaning: 'Superposition principle: total wave = algebraic sum; valid because the wave equation is linear' },
      { symbol: '2A\\sin(kx)\\cos(\\omega t)', meaning: 'Standing wave: spatial pattern sin(kx) oscillates in amplitude cos(ωt); no net energy transport' },
      { symbol: 'f_n = nv/(2L)', meaning: 'Harmonics of string or open pipe — all integer multiples of f₁ = v/(2L)' },
      { symbol: 'f_n = (2n-1)v/(4L)', meaning: 'Harmonics of closed-open pipe — fundamental v/(4L), odd harmonics only' },
      { symbol: 'y = f(x-vt) + g(x+vt)', meaning: "D'Alembert's solution: general solution is any right-traveling plus any left-traveling wave" },
    ],
    rulesOfThumb: [
      'Superposition: waves add; each continues unchanged after overlap. Destructive interference is temporary.',
      'Standing wave = rightward + leftward wave of equal amplitude. Use sin(u−v) + sin(u+v) = 2 sin u cos v.',
      'Nodes at sin(kx) = 0: fixed points, never move. Antinodes at |sin(kx)| = 1: maximum oscillation.',
      'Open pipe (both ends): f_n = nv/(2L), all harmonics. Closed-open: f_n = (2n−1)v/(4L), odd only.',
      'The wave equation is linear → superposition works. Non-linear waves (shock waves, solitons) behave differently.',
    ],
  },

  notebooks: {
    python: {
      type: 'PythonNotebook',
      title: 'Wave Equation in Python',
      cells: [
        {
          cellTitle: 'Superposition: constructive, destructive, standing wave',
          type: 'code',
          language: 'python',
          code: `import numpy as np
import matplotlib.pyplot as plt

A = 0.04   # m
k = 3.0    # rad/m
omega = 6.0  # rad/s
x = np.linspace(0, 2 * np.pi / k * 2, 400)  # 2 wavelengths

t = 0  # snapshot at t = 0

# Right-traveling wave
y1 = A * np.sin(k * x - omega * t)
# Left-traveling wave (same amplitude, opposite direction)
y2 = A * np.sin(k * x + omega * t)

# Their superposition = standing wave at t = 0
y_standing = y1 + y2  # = 2A sin(kx) cos(0) = 2A sin(kx)

# Pure destructive: same direction, opposite phase
y_destruct = A * np.sin(k * x - omega * t) + A * np.sin(k * x - omega * t + np.pi)

fig, axes = plt.subplots(3, 1, figsize=(10, 9), sharex=True)

axes[0].plot(x, y1 * 100, 'b-', label='y₁ (rightward)', linewidth=2)
axes[0].plot(x, y2 * 100, 'r--', label='y₂ (leftward)', linewidth=2)
axes[0].set_ylabel('y (cm)'); axes[0].legend(); axes[0].grid(True)
axes[0].set_title('Two waves: rightward and leftward')

axes[1].plot(x, y_standing * 100, 'g-', linewidth=2.5)
axes[1].set_ylabel('y (cm)'); axes[1].grid(True)
axes[1].set_title(f'Standing wave = y₁ + y₂ = 2A sin(kx) cos(ωt)  at t=0')
axes[1].axhline(0, color='k', linewidth=0.5)
# Mark nodes
node_xs = np.arange(0, x[-1], np.pi / k)
axes[1].scatter(node_xs, np.zeros_like(node_xs), s=80, color='red', zorder=5, label='Nodes')
axes[1].legend()

axes[2].plot(x, y_destruct * 100, 'purple', linewidth=2)
axes[2].set_ylabel('y (cm)'); axes[2].set_xlabel('x (m)'); axes[2].grid(True)
axes[2].set_title('Destructive: same direction + π phase shift → net = 0')

plt.tight_layout()
plt.show()`,
          prose: [
            'y2 = A * np.sin(k * x + omega * t) is the leftward-traveling wave — same A and k and ω, but +ωt means it moves in the −x direction (kx+ωt form). y1 and y2 traveling in opposite directions is the condition for standing waves.',
            'y_standing = y1 + y2 demonstrates superposition: Python just adds the arrays element-by-element. At t = 0, cos(ωt) = cos(0) = 1, so the result equals 2A sin(kx) — the full-amplitude standing pattern.',
            'The red scatter points mark nodes where sin(kx) = 0: at x = 0, π/k, 2π/k, ... These points have zero displacement for ALL time (even though cos(ωt) varies). The third subplot shows that opposite-phase same-direction waves cancel completely — a different scenario from standing waves.',
          ],
        },
        {
          cellTitle: 'Standing wave animation: nodes and antinodes',
          type: 'code',
          language: 'python',
          code: `import numpy as np
import matplotlib.pyplot as plt

A = 0.04; k = 3.0; omega = 6.0
L = np.pi / k   # string length = half wavelength (fundamental)
x = np.linspace(0, L, 500)
T = 2 * np.pi / omega

# Plot the standing wave at 8 different times within one period
times = np.linspace(0, T, 9)[:-1]  # 8 snapshots, not including the repeated endpoint

fig, ax = plt.subplots(figsize=(10, 6))
colors = plt.cm.viridis(np.linspace(0, 1, len(times)))

for t_val, color in zip(times, colors):
    y = 2 * A * np.sin(k * x) * np.cos(omega * t_val)  # standing wave formula
    ax.plot(x * 100, y * 100, color=color, linewidth=1.5, alpha=0.7,
            label=f't = {t_val:.3f} s')

# Envelope: maximum possible displacement at each x
ax.plot(x * 100,  2 * A * np.abs(np.sin(k * x)) * 100, 'k--', linewidth=2, label='Envelope (±2A|sin(kx)|)')
ax.plot(x * 100, -2 * A * np.abs(np.sin(k * x)) * 100, 'k--', linewidth=2)

ax.set_xlabel('Position x (cm)'); ax.set_ylabel('Displacement y (cm)')
ax.set_title('Standing wave y = 2A sin(kx) cos(ωt): 8 time snapshots')
ax.axhline(0, color='k', linewidth=0.5); ax.grid(True)

# Label nodes and antinodes
node_pos = [0, L * 100]
anti_pos = [L / 2 * 100]
for xn in node_pos:
    ax.annotate('Node', xy=(xn, 0), fontsize=9, color='red', ha='center', va='bottom')
for xa in anti_pos:
    ax.annotate('Antinode', xy=(xa, 2*A*100), fontsize=9, color='blue', ha='center', va='bottom')

plt.tight_layout(); plt.show()

print(f"String length L = π/k = {L:.4f} m (= λ/2 — fundamental mode)")
print(f"Node positions: x = 0 and x = {L:.4f} m  (sin(kx) = 0)")
print(f"Antinode at: x = {L/2:.4f} m  (|sin(kx)| = 1)")`,
          prose: [
            'y = 2 * A * np.sin(k * x) * np.cos(omega * t_val) evaluates the standing wave at each snapshot time. The sin(kx) factor is the same for all times — it sets the spatial shape. The cos(ωt) factor oscillates in time but doesn\'t change where nodes are.',
            'The envelope 2A|sin(kx)| shows the maximum possible displacement at each x across all time. Nodes (sin(kx) = 0) touch zero in the envelope; antinodes (sin(kx) = ±1) reach the full 2A height.',
            'Eight snapshots at equally-spaced times show the standing wave "breathing" — the whole pattern grows and shrinks while the nodes stay fixed. This is fundamentally different from a traveling wave, which slides across without changing shape.',
          ],
        },
        {
          cellTitle: 'Harmonic series: string and pipe',
          type: 'code',
          language: 'python',
          code: `import numpy as np
import matplotlib.pyplot as plt

v = 340     # m/s (sound in air or adjusted for string)
L = 0.65    # m

# Harmonics of string / open pipe (both ends fixed/open)
n_max = 8
n_string = np.arange(1, n_max + 1)
f_string = n_string * v / (2 * L)  # f_n = nv/(2L), n = 1, 2, 3, ...

# Harmonics of closed-open pipe (odd only)
n_closed = 2 * np.arange(1, n_max // 2 + 1) - 1  # odd integers: 1, 3, 5, 7...
f_closed = n_closed * v / (4 * L)   # f_n = (2n-1)v/(4L)

fig, (ax1, ax2) = plt.subplots(2, 1, figsize=(10, 8))

ax1.bar(n_string, f_string, width=0.5, color='steelblue')
ax1.set_xlabel('Harmonic number n'); ax1.set_ylabel('Frequency (Hz)')
ax1.set_title(f'String / Open pipe harmonics: f_n = n × v/(2L)  (L={L} m, v={v} m/s)')
ax1.set_xticks(n_string)
for n, f in zip(n_string, f_string):
    ax1.text(n, f + 5, f'{f:.0f}', ha='center', fontsize=9)
ax1.grid(axis='y')

ax2.bar(np.arange(1, len(n_closed)+1), f_closed, width=0.5, color='salmon',
        tick_label=[f'n={ni}' for ni in n_closed])
ax2.set_xlabel('Harmonic'); ax2.set_ylabel('Frequency (Hz)')
ax2.set_title(f'Closed-open pipe harmonics: odd only, f_n = (2n-1) × v/(4L)')
for i, (n, f) in enumerate(zip(n_closed, f_closed)):
    ax2.text(i+1, f + 5, f'{f:.0f}', ha='center', fontsize=9)
ax2.grid(axis='y')

plt.tight_layout()
plt.show()

print("String/Open pipe - all harmonics (Hz):", [f'{f:.0f}' for f in f_string])
print("Closed-open pipe - odd harmonics (Hz):", [f'{f:.0f}' for f in f_closed])
print(f"\\nFundamental ratio (open/closed) = {f_string[0]/f_closed[0]:.2f} (closed pipe = half frequency)")`,
          prose: [
            'f_string = n_string * v / (2 * L) computes all harmonic frequencies at once: vectorized multiplication applies the formula f_n = nv/(2L) for n = 1, 2, ..., 8. These are equally spaced in frequency — the hallmark of the harmonic series.',
            'n_closed = 2 * np.arange(1, ...) - 1 generates odd integers 1, 3, 5, 7... because only odd harmonics fit in a closed-open pipe. f_closed = n_closed * v / (4 * L) applies f_n = (2n−1)v/(4L). The fundamental is v/(4L) — half that of an open pipe of the same length.',
            'The bar charts compare the two harmonic series side by side. The open pipe fills all positions 1, 2, 3, 4... The closed pipe has gaps at even harmonics. This is why closed pipes sound different from open pipes — different harmonic content = different timbre.',
          ],
        },
        {
          cellTitle: 'Challenge: Fourier synthesis of a square wave',
          type: 'code',
          language: 'python',
          challengeType: 'write',
          starterCode: `import numpy as np
import matplotlib.pyplot as plt

# Fourier's theorem: any periodic wave = sum of sinusoids
# A square wave = sum of odd harmonics: (4/π)[sin(ωt) + sin(3ωt)/3 + sin(5ωt)/5 + ...]

omega = 2 * np.pi  # rad/s (period = 1 s)
t = np.linspace(0, 2, 1000)  # 2 seconds

# TODO:
# 1. Compute partial sums of the Fourier series using increasing numbers of terms:
#    N = [1, 3, 5, 9, 21] harmonics
# 2. For each N, compute y_N = (4/pi) * sum_{k=0}^{N//2} sin((2k+1)*omega*t) / (2k+1)
# 3. Plot all partial sums on the same axes, labeled by N
# 4. Compare to the true square wave: y_square = np.sign(np.sin(omega*t))
# 5. How many harmonics are needed to look "square"? Why does the series converge slowly near the jumps?
`,
        },
      ],
    },
    matlab: {
      type: 'OpenMatNotebook',
      title: 'Wave Equation in MATLAB/Octave',
      cells: [
        {
          cellTitle: 'Superposition and standing wave formation',
          type: 'code',
          language: 'matlab',
          code: `A = 0.04; k = 3.0; omega = 6.0;
L = pi / k;   % half-wavelength (fundamental)
x = linspace(0, L, 500);
t = 0;  % snapshot

y1 = A * sin(k*x - omega*t);   % rightward
y2 = A * sin(k*x + omega*t);   % leftward
y_stand = y1 + y2;              % standing wave = 2A sin(kx) cos(ωt)

figure;
subplot(2,1,1);
plot(x*100, y1*100, 'b-', 'LineWidth', 2, 'DisplayName', 'y_1 (rightward)');
hold on;
plot(x*100, y2*100, 'r--', 'LineWidth', 2, 'DisplayName', 'y_2 (leftward)');
ylabel('y (cm)'); title('Two oppositely-traveling waves');
legend; grid on; yline(0, 'k-', 'LineWidth', 0.5);

subplot(2,1,2);
plot(x*100, y_stand*100, 'g-', 'LineWidth', 2.5);
ylabel('y (cm)'); xlabel('x (cm)');
title('Standing wave = y_1 + y_2 = 2A sin(kx) cos(\omega t) at t=0');
% Mark nodes
node_xs = linspace(0, L, 3) * 100;  % nodes at 0 and L for fundamental
scatter(node_xs, zeros(size(node_xs)), 80, 'r', 'filled', 'DisplayName', 'Nodes');
legend; grid on; yline(0, 'k-', 'LineWidth', 0.5);`,
          prose: [
            'y1 = A * sin(k*x - omega*t) and y2 = A * sin(k*x + omega*t) are two waves with the same amplitude and frequency but traveling in opposite directions. MATLAB evaluates sin() element-wise on the vector x.',
            'y_stand = y1 + y2 is superposition: MATLAB adds the vectors element by element. At t = 0, y₁ + y₂ = 2A sin(kx) cos(0) = 2A sin(kx) — the full-amplitude spatial pattern of the fundamental mode.',
            'scatter(node_xs, zeros(...)) marks nodes at x = 0 and x = L (the string endpoints). These are the fixed boundary conditions for a string: the boundary forces nodes at both ends, which is what restricts the allowed wavelengths to λ_n = 2L/n.',
          ],
        },
        {
          cellTitle: 'Standing wave snapshots over one period',
          type: 'code',
          language: 'matlab',
          code: `A = 0.04; k = 3.0; omega = 6.0;
L = pi / k;
x = linspace(0, L, 500);
T = 2*pi / omega;
n_snaps = 8;
times = linspace(0, T, n_snaps+1);
times = times(1:end-1);  % remove duplicate endpoint

cmap = parula(n_snaps);  % colormap for different times
figure; hold on;
for i = 1:n_snaps
    t_val = times(i);
    y = 2 * A * sin(k*x) .* cos(omega * t_val);  % standing wave
    plot(x*100, y*100, 'Color', cmap(i,:), 'LineWidth', 1.5);
end

% Envelope
envelope = 2 * A * abs(sin(k*x));
plot(x*100,  envelope*100, 'k--', 'LineWidth', 2, 'DisplayName', 'Envelope');
plot(x*100, -envelope*100, 'k--', 'LineWidth', 2);

xlabel('x (cm)'); ylabel('y (cm)');
title('Standing wave: 8 snapshots over one period');
text(0, 0, ' Node', 'Color', 'red', 'FontSize', 10);
text(L*100, 0, ' Node', 'Color', 'red', 'FontSize', 10, 'HorizontalAlignment', 'right');
text(L/2*100, 2*A*100, 'Antinode', 'Color', 'blue', 'FontSize', 10, 'HorizontalAlignment', 'center');
grid on; yline(0, 'k-', 'LineWidth', 0.5);`,
          prose: [
            'The loop computes y = 2 * A * sin(k*x) .* cos(omega * t_val) for each snapshot time. The .* multiplies the spatial vector sin(k*x) element-wise by the scalar cos(omega*t_val) — broadcasting the scalar across the whole array.',
            'The envelope 2A|sin(kx)| (dashed black) bounds all snapshots. Every colorful line touches the envelope at the antinode (x = L/2) when cos(ωt) = ±1, and all lines pass through zero at the nodes (x = 0 and x = L).',
            'The color gradient from parula(n_snaps) maps each snapshot to a distinct color, showing the temporal sequence. The standing wave "breathes" — oscillates in amplitude while the spatial pattern and node locations remain fixed.',
          ],
        },
        {
          cellTitle: 'Harmonic series: string vs closed pipe',
          type: 'code',
          language: 'matlab',
          code: `v = 340; L = 0.65;  % m/s, m

n_max = 8;
n_string = 1:n_max;
f_string = n_string * v / (2*L);     % f_n = nv/(2L)

n_odd = 1:2:2*n_max;                 % odd integers: 1,3,5,...,15
n_odd = n_odd(1:n_max/2);            % first 4 odd harmonics
f_closed = n_odd * v / (4*L);        % f_n = (2n-1)v/(4L)

figure;
subplot(2,1,1);
bar(n_string, f_string, 'FaceColor', 'steelblue');
xlabel('Harmonic n'); ylabel('Frequency (Hz)');
title(sprintf('String / Open pipe: f_n = nv/(2L)  [f_1=%.0f Hz]', f_string(1)));
grid on; ylim([0, max(f_string)*1.15]);
for i = 1:length(f_string)
    text(i, f_string(i)+10, sprintf('%.0f', f_string(i)), 'HorizontalAlignment', 'center', 'FontSize', 8);
end

subplot(2,1,2);
bar(1:length(f_closed), f_closed, 'FaceColor', 'salmon');
set(gca, 'XTick', 1:length(f_closed), 'XTickLabel', arrayfun(@(n) sprintf('n=%d', n), n_odd, 'UniformOutput', false));
ylabel('Frequency (Hz)'); xlabel('Harmonic');
title(sprintf('Closed-open pipe: odd harmonics only  [f_1=%.0f Hz]', f_closed(1)));
grid on; ylim([0, max(f_closed)*1.15]);
for i = 1:length(f_closed)
    text(i, f_closed(i)+10, sprintf('%.0f', f_closed(i)), 'HorizontalAlignment', 'center', 'FontSize', 8);
end`,
          prose: [
            'n_string = 1:n_max creates the integer sequence 1 through 8. f_string = n_string * v / (2*L) multiplies each harmonic number by v/(2L) to get all frequencies simultaneously — MATLAB vectorizes the multiplication.',
            'n_odd = 1:2:2*n_max generates odd integers using step-2 syntax. f_closed uses these to implement f_n = (2n−1)v/(4L). The closed-open pipe only supports odd harmonics because an even harmonic would require an antinode at the closed end — physically impossible.',
            'Comparing the two bar charts shows the key difference: the open pipe has harmonics at 261, 523, 784... Hz (all n); the closed-open pipe has 130, 391, 651... Hz (odd n only). Same length L but different fundamental — closed pipe has f₁ = v/(4L) = half that of open pipe.',
          ],
        },
        {
          cellTitle: 'Challenge: Fourier synthesis of a square wave',
          type: 'code',
          language: 'matlab',
          challengeType: 'write',
          starterCode: `% Fourier synthesis: build a square wave from odd harmonics
% Square wave = (4/pi) * [sin(ωt) + sin(3ωt)/3 + sin(5ωt)/5 + ...]

omega = 2*pi;   % period = 1 s
t = linspace(0, 2, 1000);
y_square = sign(sin(omega * t));   % true square wave for reference

% TODO:
% 1. For N_terms = [1, 3, 5, 11, 21]:
%    Compute y_partial = (4/pi) * sum_{n=1,3,5,...,2N-1} sin(n*omega*t) / n
% 2. Plot y_partial for each N on the same axes
% 3. Add y_square as a reference (thick dashed line)
% 4. Label each curve with its N value
% 5. Observe: near the discontinuity, the series "overshoots" — this is the Gibbs phenomenon
`,
        },
      ],
    },
  },
};
