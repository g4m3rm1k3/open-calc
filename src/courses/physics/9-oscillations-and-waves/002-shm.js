export default {
  id: 'p1-ch8-002',
  slug: 'simple-harmonic-motion',
  chapter: 'p8',
  order: 2,
  title: 'Simple Harmonic Motion',
  subtitle: 'Hooke\'s Law produces the most important oscillation in all of physics.',
  tags: ['SHM', 'simple harmonic motion', 'angular frequency', 'period', 'amplitude', 'x = A cos(ωt)', 'T = 2π√(m/k)'],

  hook: {
    question:
      'A mass on a spring is displaced 10 cm and released from rest. Where is it after exactly 1 second? After 1.5 seconds? After 17 seconds? You could track it step-by-step using F = ma — but that would require thousands of tiny steps. Is there a formula that gives the position at any time directly?',
    realWorldContext:
      'Simple Harmonic Motion is the template for all oscillation in physics. Pendulum clocks, guitar strings, electronic oscillators, and the vibration of molecules in a crystal all obey the same equations. Even quantum mechanics uses SHM: the quantum harmonic oscillator is the most-solved problem in all of quantum physics, underlying the structure of every field theory.',
    previewVisualizationId: 'SpringOscillation',
  },

  intuition: {
    prose: [
      '**The answer:** Yes — the position is \\(x(t) = A\\cos(\\omega t + \\phi)\\), where \\(A\\) is the amplitude, \\(\\omega = \\sqrt{k/m}\\) is the angular frequency, and \\(\\phi\\) is the initial phase. This single formula encodes the entire future of the oscillation — position at any time, forever.',

      '**Why cosine?** The restoring force F = −kx creates an acceleration a = −(k/m)x. This says: *acceleration is proportional to and opposite displacement*. The function whose second derivative equals −(constant)×itself is exactly cosine (or sine). Nature chose the only function that satisfies this equation.',

      '**The three parameters:** **A (amplitude)** — maximum displacement, set by initial conditions. Double the initial stretch → double the amplitude. **ω (angular frequency)** — how fast it oscillates, set entirely by k and m: \\(\\omega = \\sqrt{k/m}\\). Stiff spring (large k) → fast oscillation. Heavy mass (large m) → slow oscillation. **φ (phase)** — where in the cycle you start. Released from rest at x = A gives φ = 0 (pure cosine). Released from equilibrium moving right gives φ = −π/2 (pure sine).',

      '**Period and frequency:** One full oscillation takes \\(T = 2\\pi/\\omega = 2\\pi\\sqrt{m/k}\\) seconds. Note what T does NOT depend on: amplitude. A pendulum clock works because doubling the swing doesn\'t change the period. This amplitude-independence is the defining property of SHM — and it\'s the reason pendulum clocks are accurate.',

      '**Energy in SHM:** The system constantly exchanges KE and PE. At maximum displacement (x = ±A): v = 0, all energy is PE = ½kA². At equilibrium (x = 0): maximum speed, all energy is KE = ½mv²_max. Total energy E = ½kA² = constant throughout the oscillation.',
    ],
    callouts: [
      {
        type: 'sequencing',
        title: 'Lesson 2 of 4 — SHM: the motion that results from Hooke\'s Law',
        body:
          '**Lesson 1:** F = −kx — the restoring force (Hooke\'s Law).\\n**This lesson:** x(t) = A cos(ωt + φ) — the motion that force produces.\\n**Next:** Wave properties — SHM in space, not just time.\\n**Chapter 9:** Thermodynamics — energy storage in molecular vibrations (quantum SHM).',
      },
      {
        type: 'theorem',
        title: 'SHM position, velocity, and acceleration',
        body:
          'x(t) = A\\cos(\\omega t + \\phi)\\\\v(t) = -A\\omega\\sin(\\omega t + \\phi)\\\\a(t) = -A\\omega^2\\cos(\\omega t + \\phi) = -\\omega^2 x',
      },
      {
        type: 'definition',
        title: 'Angular frequency ω and period T',
        body:
          '\\omega = \\sqrt{k/m} \\quad [\\text{rad/s}]\\\\T = \\frac{2\\pi}{\\omega} = 2\\pi\\sqrt{\\frac{m}{k}} \\quad [\\text{s}]\\\\f = \\frac{1}{T} = \\frac{\\omega}{2\\pi} \\quad [\\text{Hz}]',
      },
      {
        type: 'insight',
        title: 'Period is independent of amplitude',
        body:
          'T = 2π√(m/k) contains no A. A small oscillation and a large oscillation of the same spring take exactly the same time. This is isochronism — discovered by Galileo watching a chandelier swing, and exploited by every pendulum clock ever built.',
      },
      {
        type: 'theorem',
        title: 'Energy in SHM',
        body:
          'E = \\tfrac{1}{2}kA^2 = \\tfrac{1}{2}mv_{\\text{max}}^2 = \\text{const}\\\\v_{\\text{max}} = A\\omega = A\\sqrt{k/m}\\\\v(x) = \\omega\\sqrt{A^2 - x^2}',
      },
      {
        type: 'connection',
        title: 'Calculus: SHM is the solution to a differential equation',
        body:
          'Newton\'s 2nd: \\(ma = -kx\\), i.e., \\(\\ddot{x} = -\\frac{k}{m}x\\). This is the **simple harmonic oscillator ODE**. General solution: \\(x = A\\cos(\\omega t) + B\\sin(\\omega t)\\). Initial conditions (x₀, v₀) determine A and B uniquely.',
      },
      {
        type: 'warning',
        title: 'ω is not the same as f',
        body:
          'Angular frequency ω = 2πf (radians/second). Frequency f = 1/T (cycles/second = Hz). Confusing them by a factor of 2π is the most common SHM calculation error. Rule: use ω inside cos/sin; use f or T for timing real oscillations.',
      },
    ],
    visualizations: [
      {
        id: 'SpringOscillation',
        title: 'SHM live — position, velocity, and acceleration vs time',
        mathBridge:
          'Watch x(t) trace out a cosine. Note that v(t) = dx/dt is a sine — shifted 90° ahead of x. a(t) = dv/dt is −cosine — always pointing opposite to x. Change m or k: watch how ω = √(k/m) changes the frequency.',
        caption: 'x = A cos(ωt): position, velocity, and acceleration are all sinusoidal, each shifted by 90°.',
        props: { showVelocity: true, showAcceleration: true, interactive: true },
      },
      {
        id: 'UnitCircle',
        title: 'SHM as projection of circular motion',
        mathBridge:
          'A point moving at constant speed around a circle of radius A projects a cosine onto the x-axis. This is exactly x(t) = A cos(ωt). SHM is one-dimensional circular motion. The angular speed of the circular motion is ω — hence "angular frequency."',
        caption: 'SHM is the shadow of uniform circular motion. ω is literally an angular velocity.',
        props: { showProjection: true },
      },
    ],
  },

  math: {
    prose: [
      'Starting from Newton\'s second law with Hooke\'s Law: \\(m\\ddot{x} = -kx\\)',
      'This ODE has solution \\(x(t) = A\\cos(\\omega t + \\phi)\\) where \\(\\omega = \\sqrt{k/m}\\).',
      'Initial conditions determine A and φ:',
      'If \\(x(0) = x_0\\) and \\(v(0) = 0\\) (released from rest): \\(A = x_0\\), \\(\\phi = 0\\).',
      'If \\(x(0) = 0\\) and \\(v(0) = v_0\\) (pushed from equilibrium): \\(A = v_0/\\omega\\), \\(\\phi = -\\pi/2\\) (i.e., \\(x = A\\sin(\\omega t)\\)).',
      'General case: \\(A = \\sqrt{x_0^2 + (v_0/\\omega)^2}\\), \\(\\tan\\phi = -v_0/(\\omega x_0)\\).',
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'Simple pendulum (small angle)',
        body:
          '\\text{For small } \\theta: \\quad T = 2\\pi\\sqrt{\\frac{L}{g}}\\\\\\text{Same form as spring: substitute } L/g \\text{ for } m/k.\\\\\\text{Effective spring constant: } k_{\\text{eff}} = mg/L.',
      },
      {
        type: 'insight',
        title: 'Solving any SHM problem',
        body:
          '1. Identify the restoring force F = −κx (find κ).\\n2. Write ω = √(κ/m) and T = 2π/ω.\\n3. Apply initial conditions to find A and φ.\\n4. Use energy E = ½κA² to find speeds without solving ODE.',
      },
      {
        type: 'mnemonic',
        title: 'The SHM recipe',
        body:
          'Restoring force → find ω → find T → apply ICs → done.\\nEnergy shortcut: v_max = Aω; v(x) = ω√(A² − x²).',
      },
    ],
    visualizations: [
      {
        id: 'FunctionPlotter',
        title: 'x(t) = A cos(ωt): adjust A, ω, φ',
        mathBridge:
          'Set A = 0.1 m, ω = 2π rad/s (T = 1 s). Changing A changes the height but not the period. Changing ω compresses or stretches the time axis. Changing φ slides the curve left or right — same shape, different starting point.',
        caption: 'Three parameters: amplitude (height), frequency (x-compression), phase (horizontal shift).',
        props: { expression: '0.1*cos(2*PI*x)', variable: 't', xMin: 0, xMax: 4, label: 'x (m)' },
      },
    ],
  },

  rigor: {
    title: 'Solving the SHM differential equation',
    prose: [
      'We need a function whose second derivative equals −(k/m) times itself.',
    ],
    proofSteps: [
      {
        expression: 'm\\ddot{x} = -kx \\quad \\Rightarrow \\quad \\ddot{x} = -\\frac{k}{m}x \\equiv -\\omega^2 x',
        annotation: 'Define ω² = k/m. The equation says: second derivative = −ω² × function.',
      },
      {
        expression: '\\text{Guess: } x(t) = e^{rt} \\Rightarrow r^2 = -\\omega^2 \\Rightarrow r = \\pm i\\omega',
        annotation: 'Characteristic equation has imaginary roots. Complex exponentials are the solutions.',
      },
      {
        expression: 'x(t) = C_1 e^{i\\omega t} + C_2 e^{-i\\omega t} = A\\cos(\\omega t) + B\\sin(\\omega t)',
        annotation: 'Euler\'s formula: e^{iθ} = cos θ + i sin θ. Real combinations give cosine and sine.',
      },
      {
        expression: 'x(t) = A\\cos(\\omega t + \\phi) \\quad \\text{where } A = \\sqrt{C_1^2 + C_2^2},\\; \\tan\\phi = -C_2/C_1',
        annotation: 'Amplitude-phase form. A and φ are determined by x(0) = x₀ and ẋ(0) = v₀.',
      },
      {
        expression: '\\ddot{x} = -A\\omega^2\\cos(\\omega t + \\phi) = -\\omega^2 x \\quad \\checkmark',
        annotation: 'Verify: differentiating twice gives −ω²x. The solution satisfies the ODE. QED.',
      },
    ],
  },

  examples: [
    {
      id: 'ch8-002-ex1',
      title: 'Spring-mass: period, frequency, and position',
      problem:
        '\\text{A 0.4 kg mass on a spring (k = 160 N/m) is displaced 5 cm and released from rest. Find: (a) ω, (b) T, (c) x at t = 0.3 s.}',
      steps: [
        {
          expression: '\\omega = \\sqrt{k/m} = \\sqrt{160/0.4} = \\sqrt{400} = 20\\,\\text{rad/s}',
          annotation: 'Angular frequency.',
        },
        {
          expression: 'T = 2\\pi/\\omega = 2\\pi/20 \\approx 0.314\\,\\text{s}',
          annotation: 'Period.',
        },
        {
          expression: 'x(0.3) = 0.05\\cos(20 \\times 0.3) = 0.05\\cos(6) \\approx 0.05(0.960) = 0.048\\,\\text{m}',
          annotation: 'Position at t = 0.3 s. Angle in radians.',
        },
      ],
      conclusion: 'ω = 20 rad/s, T ≈ 0.314 s, x(0.3) ≈ 4.8 cm. Nearly back to start after slightly less than one period.',
    },
    {
      id: 'ch8-002-ex2',
      title: 'Maximum speed and speed at a given position',
      problem:
        '\\text{Same system: k = 160 N/m, m = 0.4 kg, A = 0.05 m. Find: (a) maximum speed, (b) speed when x = 3 cm.}',
      steps: [
        {
          expression: 'v_{\\text{max}} = A\\omega = (0.05)(20) = 1.0\\,\\text{m/s}',
          annotation: 'Maximum speed at x = 0.',
        },
        {
          expression: 'v = \\omega\\sqrt{A^2 - x^2} = 20\\sqrt{(0.05)^2 - (0.03)^2} = 20\\sqrt{0.0016} = 20(0.04) = 0.8\\,\\text{m/s}',
          annotation: 'Speed at x = 3 cm, using energy conservation shortcut.',
        },
      ],
      conclusion: 'v_max = 1.0 m/s (at equilibrium). v = 0.8 m/s at x = 3 cm.',
    },
  ],

  challenges: [
    {
      id: 'ch8-002-ch1',
      difficulty: 'easy',
      problem:
        '\\text{A 1 kg mass on a spring oscillates with T = 0.5 s. Find k.}',
      hint: 'T = 2π√(m/k). Solve for k.',
      walkthrough: [
        {
          expression: 'k = m(2\\pi/T)^2 = (1)(2\\pi/0.5)^2 = (4\\pi)^2 \\approx 158\\,\\text{N/m}',
          annotation: '',
        },
      ],
      answer: 'k ≈ 158 N/m.',
    },
    {
      id: 'ch8-002-ch2',
      difficulty: 'medium',
      problem:
        '\\text{A spring-mass system has A = 0.2 m, T = 1.0 s. Write x(t) if at t = 0: x = 0 m, v = +1.26 m/s.}',
      hint: 'x(0) = 0 → starts at equilibrium. v(0) > 0 → moving right. This gives a sine function.',
      walkthrough: [
        {
          expression: '\\omega = 2\\pi/T = 2\\pi\\,\\text{rad/s}',
          annotation: '',
        },
        {
          expression: 'x(0) = 0 \\Rightarrow A\\cos\\phi = 0 \\Rightarrow \\phi = \\pm\\pi/2',
          annotation: '',
        },
        {
          expression: 'v(0) = -A\\omega\\sin\\phi = +A\\omega > 0 \\Rightarrow \\sin\\phi < 0 \\Rightarrow \\phi = -\\pi/2',
          annotation: '',
        },
        {
          expression: 'x(t) = 0.2\\cos(2\\pi t - \\pi/2) = 0.2\\sin(2\\pi t)',
          annotation: 'Equivalently x = A sin(ωt) when starting from equilibrium moving in +x.',
        },
      ],
      answer: 'x(t) = 0.2 sin(2πt) m.',
    },
    {
      id: 'ch8-002-ch3',
      difficulty: 'hard',
      problem:
        '\\text{A pendulum of length L = 0.5 m swings with amplitude θ₀ = 0.1 rad. Find: (a) the period, (b) the maximum speed of the bob, (c) the speed when θ = 0.06 rad.}',
      hint: 'Small angle: T = 2π√(L/g). For the pendulum, the \"spring constant\" is k_eff = mg/L. Maximum arc displacement is s₀ = Lθ₀.',
      walkthrough: [
        {
          expression: 'T = 2\\pi\\sqrt{L/g} = 2\\pi\\sqrt{0.5/9.8} \\approx 1.42\\,\\text{s}',
          annotation: 'Small-angle pendulum period.',
        },
        {
          expression: '\\omega = \\sqrt{g/L} = \\sqrt{9.8/0.5} = \\sqrt{19.6} \\approx 4.43\\,\\text{rad/s}',
          annotation: '',
        },
        {
          expression: 'v_{\\text{max}} = (L\\theta_0)\\omega = (0.5)(0.1)(4.43) = 0.221\\,\\text{m/s}',
          annotation: 'Arc amplitude = Lθ₀; v_max = A·ω.',
        },
        {
          expression: 'v = \\omega L\\sqrt{\\theta_0^2 - \\theta^2} = 4.43(0.5)\\sqrt{(0.1)^2-(0.06)^2} = 2.215\\sqrt{0.0064} = 0.177\\,\\text{m/s}',
          annotation: 'Speed at θ = 0.06 rad using v = ω√(A² − x²) with arc displacement.',
        },
      ],
      answer: 'T ≈ 1.42 s; v_max ≈ 0.221 m/s; v(0.06 rad) ≈ 0.177 m/s.',
    },
  ],

  quiz: [
    {
      id: 'p8-002-q1',
      type: 'choice',
      question: 'A spring-mass system has k = 50 N/m and m = 0.5 kg. What is its angular frequency ω?',
      options: ['10 rad/s', '5 rad/s', '100 rad/s', '0.1 rad/s'],
      answer: '10 rad/s',
      hints: ['ω = √(k/m) = √(50/0.5) = √100.', '√100 = 10 rad/s.'],
      reviewSection: 'intuition',
    },
    {
      id: 'p8-002-q2',
      type: 'choice',
      question: 'The same system (ω = 10 rad/s) has amplitude A = 8 cm. What is the period T?',
      options: ['0.628 s', '1.0 s', '0.1 s', '6.28 s'],
      answer: '0.628 s',
      hints: ['T = 2π/ω = 2π/10 ≈ 0.628 s.', 'The period does NOT depend on amplitude — same T whether A = 1 cm or 100 cm.'],
      reviewSection: 'intuition',
    },
    {
      id: 'p8-002-q3',
      type: 'choice',
      question: 'A mass-spring system is released from rest at x = A. Which function correctly describes x(t)?',
      options: ['x(t) = A cos(ωt)', 'x(t) = A sin(ωt)', 'x(t) = A cos(ωt + π/2)', 'x(t) = A sin(ωt + π/2)'],
      answer: 'x(t) = A cos(ωt)',
      hints: ['Released from rest at x = A means x(0) = A and v(0) = 0.', 'A cos(ωt) gives x(0) = A and v(0) = −Aω sin(0) = 0. ✓'],
      reviewSection: 'math',
    },
    {
      id: 'p8-002-q4',
      type: 'choice',
      question: 'For SHM with ω = 5 rad/s and A = 0.04 m, what is v_max?',
      options: ['0.20 m/s', '0.04 m/s', '5 m/s', '0.008 m/s'],
      answer: '0.20 m/s',
      hints: ['v_max = Aω = 0.04 × 5.', 'Maximum speed occurs at equilibrium (x = 0).'],
      reviewSection: 'intuition',
    },
    {
      id: 'p8-002-q5',
      type: 'choice',
      question: 'If the mass in a spring-mass system is quadrupled (k unchanged), what happens to the period?',
      options: ['T doubles', 'T quadruples', 'T halves', 'T is unchanged'],
      answer: 'T doubles',
      hints: ['T = 2π√(m/k). If m → 4m, then √m → 2√m, so T → 2T.', 'Period scales as √m.'],
      reviewSection: 'intuition',
    },
    {
      id: 'p8-002-q6',
      type: 'choice',
      question: 'Total energy in SHM (k = 400 N/m, A = 5 cm) equals:',
      options: ['0.5 J', '1.0 J', '2.0 J', '0.25 J'],
      answer: '0.5 J',
      hints: ['E = ½kA² = ½ × 400 × (0.05)².', '½ × 400 × 0.0025 = 0.5 J.'],
      reviewSection: 'intuition',
    },
    {
      id: 'p8-002-q7',
      type: 'choice',
      question: 'At what displacement x does v = v_max/2 in SHM with amplitude A?',
      options: ['x = A√3/2', 'x = A/2', 'x = A/√2', 'x = A/√3'],
      answer: 'x = A√3/2',
      hints: ['v = ω√(A²−x²). Set v = v_max/2 = Aω/2.', 'Aω/2 = ω√(A²−x²) → A²/4 = A²−x² → x² = 3A²/4 → x = A√3/2.'],
      reviewSection: 'math',
    },
    {
      id: 'p8-002-q8',
      type: 'choice',
      question: 'A simple pendulum with length L = 1.0 m. What is its period (g = 9.8 m/s²)?',
      options: ['2.01 s', '1.00 s', '3.14 s', '0.50 s'],
      answer: '2.01 s',
      hints: ['T = 2π√(L/g) = 2π√(1.0/9.8).', '√(1/9.8) ≈ 0.319 s; T ≈ 2π × 0.319 ≈ 2.01 s.'],
      reviewSection: 'math',
    },
    {
      id: 'p8-002-q9',
      type: 'choice',
      question: 'In SHM, when is the kinetic energy equal to the potential energy?',
      options: ['When x = ±A/√2', 'When x = 0', 'When x = ±A', 'KE and PE are never equal in SHM'],
      answer: 'When x = ±A/√2',
      hints: ['KE = PE → ½mv² = ½kx². Also E_total = ½kA², so ½kx² = ½kA²/2 → x² = A²/2.', 'x = ±A/√2 ≈ ±0.707A.'],
      reviewSection: 'math',
    },
    {
      id: 'p8-002-q10',
      type: 'choice',
      question: 'The acceleration in SHM is a(t) = −ω²x(t). This means:',
      options: ['Acceleration is maximum at maximum displacement and zero at equilibrium', 'Acceleration is constant throughout the oscillation', 'Acceleration is maximum at equilibrium', 'Acceleration and displacement always have the same sign'],
      answer: 'Acceleration is maximum at maximum displacement and zero at equilibrium',
      hints: ['a = −ω²x: when x = ±A (max), a = ∓ω²A (max). When x = 0 (equilibrium), a = 0.'],
      reviewSection: 'intuition',
    },
  ],

  misconceptions: [
    {
      id: 'p8-002-m1',
      misconception: 'A larger amplitude makes the period longer because the mass has to travel farther.',
      correction: 'Period T = 2π√(m/k) contains NO amplitude A. SHM is isochronous — larger amplitude means larger maximum speed, so the extra distance is covered in exactly the same time. Galileo observed this in a pendulum: wide swings and small swings take the same time (for small angles). This is why pendulum clocks are accurate.',
      correctionExample: 'k = 100 N/m, m = 0.25 kg: T = 2π√(0.25/100) = 0.314 s regardless of whether A = 1 cm or A = 10 cm.',
    },
    {
      id: 'p8-002-m2',
      misconception: 'Angular frequency ω and regular frequency f are the same thing, just different notation.',
      correction: 'ω (rad/s) = 2πf (Hz). They differ by a factor of 2π. In x(t) = A cos(ωt), the argument of cosine must be in radians — using f instead of ω gives answers that are 2π times too fast. Rule: ω inside trig functions; f or T for timing.',
      correctionExample: 'f = 2 Hz: one oscillation every 0.5 s. ω = 2π(2) = 4π ≈ 12.6 rad/s. Using f inside cos gives x = A cos(2t) instead of correct A cos(12.6t) — six times too slow.',
    },
  ],

  transferPrompts: [
    {
      id: 'p8-002-t1',
      prompt: `An LC circuit (inductor L, capacitor C) has charge q(t) satisfying L(d²q/dt²) = −q/C. This is identical in form to m(d²x/dt²) = −kx. What is the oscillation frequency ω of the LC circuit? If L = 1 mH and C = 100 μF, what is f in Hz?`,
      connection: 'By analogy with ω = √(k/m): ω_LC = √(1/(LC)). SHM mathematics applies directly to electrical oscillations.',
    },
    {
      id: 'p8-002-t2',
      prompt: `The bond between two atoms in a molecule acts like a spring with k ≈ 400 N/m, and the reduced mass is μ ≈ 1.67×10⁻²⁷ kg (about 1 amu). What is the vibration frequency of the bond in Hz? Compare to infrared light frequency (~10¹³ Hz). What does this tell you about why molecules absorb infrared radiation?`,
      connection: 'Molecular bonds are SHM oscillators: f = (1/2π)√(k/μ). Their natural frequency matches infrared light — resonance causes absorption.',
    },
  ],

  debugging: [
    {
      id: 'p8-002-d1',
      error: `A student finds x at t = 0.5 s for a system with f = 2 Hz, A = 0.1 m:
x = A cos(f × t) = 0.1 × cos(2 × 0.5) = 0.1 × cos(1) ≈ 0.1 × 0.540 = 0.054 m`,
      fix: `The argument of cosine must use ω = 2πf, not f. Using frequency f directly in the trig function is a factor-of-2π error.
ω = 2πf = 2π(2) = 4π rad/s
x(0.5) = 0.1 cos(4π × 0.5) = 0.1 cos(2π) = 0.1 × 1 = 0.1 m
After exactly one period (T = 0.5 s), the mass is back at its starting point.`,
    },
    {
      id: 'p8-002-d2',
      error: `A student computing x(t) for a mass released from x₀ = 0 with v₀ = +0.5 m/s, ω = 5 rad/s writes:
"Released from equilibrium so A = x₀ = 0 m — the mass doesn't oscillate."`,
      fix: `Being at equilibrium x = 0 does not mean zero amplitude — it means the mass was given an initial VELOCITY. The amplitude comes from initial KE:
E = ½mv₀² = ½kA² → A = v₀/ω = 0.5/5 = 0.1 m
x(t) = A sin(ωt) = 0.1 sin(5t)  (sine because released from equilibrium with +velocity)
The mass oscillates with A = 10 cm even though it started at x = 0.`,
    },
  ],

  mastery: {
    targetLevel: 'Solve the SHM ODE; find ω, T, A, and x(t) from initial conditions; compute v and a at any position; apply pendulum analogy.',
    checklistItems: [
      'Can identify ω = √(k/m) and compute T = 2π/ω from spring and mass values',
      'Can write x(t) = A cos(ωt) or A sin(ωt) depending on whether the system starts at max displacement or equilibrium',
      'Can determine A from initial conditions using A = √(x₀² + (v₀/ω)²)',
      'Can compute v at any position using v = ω√(A² − x²)',
      'Can apply the small-angle pendulum formula T = 2π√(L/g) and identify the analogy L/g ↔ m/k',
    ],
    commonStruggles: [
      'Confusing ω and f: using f inside cos/sin instead of ω = 2πf',
      'Setting A = x₀ when the mass starts at equilibrium — initial velocity contributes to amplitude: A = v₀/ω',
      'Forgetting period is independent of amplitude — trying to adjust T for different starting positions',
    ],
    nextSteps: 'Lesson p8-003 (Wave Properties) extends SHM from time to space: the wave is SHM propagating through a medium with v = fλ.',
  },

  semantics: {
    core: [
      { symbol: 'x(t) = A\\cos(\\omega t + \\phi)', meaning: 'SHM position — sinusoidal oscillation with amplitude A, frequency ω, phase φ' },
      { symbol: '\\omega = \\sqrt{k/m}', meaning: 'Angular frequency (rad/s) — set by stiffness and mass, not amplitude' },
      { symbol: 'T = 2\\pi/\\omega', meaning: 'Period (s) — time for one complete oscillation; independent of amplitude' },
      { symbol: 'A', meaning: 'Amplitude (m) — maximum displacement from equilibrium; set by initial conditions' },
      { symbol: 'v_{\\text{max}} = A\\omega', meaning: 'Maximum speed — occurs at equilibrium (x = 0)' },
      { symbol: 'E = \\tfrac{1}{2}kA^2', meaning: 'Total energy in SHM — constant; determined by amplitude alone' },
    ],
    rulesOfThumb: [
      'Period T = 2π√(m/k): more mass → slower, stiffer spring → faster. No amplitude dependence.',
      'ω inside trig functions, f or T for timing: ω = 2πf. Confusing them gives a 2π error.',
      'Released from rest at max: use cosine. Released from equilibrium with velocity: use sine.',
      'v_max = Aω occurs at x = 0; v = 0 at x = ±A. Force is maximum where v = 0.',
      'Energy E = ½kA²: double the amplitude → quadruple the energy.',
    ],
  },

  notebooks: {
    python: {
      type: 'PythonNotebook',
      title: 'Simple Harmonic Motion in Python',
      cells: [
        {
          cellTitle: 'x(t), v(t), a(t): all three oscillators',
          type: 'code',
          language: 'python',
          code: `import numpy as np
import matplotlib.pyplot as plt

# SHM: x = A cos(ωt), v = -Aω sin(ωt), a = -Aω² cos(ωt)
k = 160    # N/m
m = 0.4    # kg
A = 0.05   # m (5 cm amplitude)

omega = np.sqrt(k / m)    # ω = √(k/m)
T = 2 * np.pi / omega     # period

t = np.linspace(0, 2 * T, 500)   # plot 2 full oscillations

x = A * np.cos(omega * t)
v = -A * omega * np.sin(omega * t)
a = -A * omega**2 * np.cos(omega * t)   # = -ω²x

fig, axes = plt.subplots(3, 1, figsize=(10, 8), sharex=True)

axes[0].plot(t, x * 100, 'b-', linewidth=2)
axes[0].set_ylabel('x (cm)'); axes[0].set_title(f'SHM: ω = {omega:.1f} rad/s, T = {T:.3f} s, A = {A*100:.0f} cm')
axes[0].axhline(0, color='k', linewidth=0.5); axes[0].grid(True)

axes[1].plot(t, v, 'r-', linewidth=2)
axes[1].set_ylabel('v (m/s)'); axes[1].axhline(0, color='k', linewidth=0.5); axes[1].grid(True)
axes[1].axhline(A * omega, color='r', linestyle=':', alpha=0.5, label=f'v_max = {A*omega:.2f} m/s')
axes[1].legend()

axes[2].plot(t, a, 'g-', linewidth=2)
axes[2].set_ylabel('a (m/s²)'); axes[2].set_xlabel('Time (s)')
axes[2].axhline(0, color='k', linewidth=0.5); axes[2].grid(True)

plt.tight_layout()
plt.show()

print(f"ω = {omega:.2f} rad/s,  T = {T:.4f} s,  v_max = {A*omega:.3f} m/s")`,
          prose: [
            'omega = np.sqrt(k / m) computes ω = √(k/m): the angular frequency is set entirely by the spring and mass, not the amplitude. With k = 160 and m = 0.4, ω = 20 rad/s.',
            'The three lines x = A cos(ωt), v = −Aω sin(ωt), a = −Aω² cos(ωt) are the derivatives of each other: v = dx/dt and a = dv/dt. Note the 90° phase shifts: x peaks when v = 0, and v peaks when a = 0.',
            'a = −ω²x confirms the SHM definition: acceleration is proportional to and opposite displacement. When x is at maximum, a is at maximum magnitude but opposite sign — this is what causes the reversal and perpetuates oscillation.',
          ],
        },
        {
          cellTitle: 'Phase space and energy exchange',
          type: 'code',
          language: 'python',
          code: `import numpy as np
import matplotlib.pyplot as plt

k = 160; m = 0.4; A = 0.05
omega = np.sqrt(k / m)
T = 2 * np.pi / omega

t = np.linspace(0, 2 * T, 1000)
x = A * np.cos(omega * t)
v = -A * omega * np.sin(omega * t)

KE = 0.5 * m * v**2
PE = 0.5 * k * x**2
E_total = KE + PE

fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(12, 5))

# Phase space: v vs x — should be an ellipse
ax1.plot(x * 100, v, 'b-', linewidth=1.5)
ax1.scatter([A * 100, -A * 100, 0, 0], [0, 0, A * omega, -A * omega],
            s=80, color=['red', 'red', 'green', 'green'], zorder=5)
ax1.set_xlabel('x (cm)'); ax1.set_ylabel('v (m/s)')
ax1.set_title('Phase space: v vs x  (ellipse = constant energy)')
ax1.axhline(0, color='k', linewidth=0.5); ax1.axvline(0, color='k', linewidth=0.5)
ax1.grid(True)

# Energy exchange
ax2.plot(t, KE, 'r-',  linewidth=2, label='Kinetic KE = ½mv²')
ax2.plot(t, PE, 'b-',  linewidth=2, label='Potential PE = ½kx²')
ax2.plot(t, E_total, 'k--', linewidth=1.5, label=f'Total E = {E_total[0]:.4f} J')
ax2.set_xlabel('Time (s)'); ax2.set_ylabel('Energy (J)')
ax2.set_title('KE and PE exchange; total E is constant')
ax2.legend(); ax2.grid(True)

plt.tight_layout()
plt.show()

print(f"Total energy E = ½kA² = {0.5*k*A**2:.4f} J (constant)")
print(f"KE+PE at any t ≈ {np.mean(E_total):.4f} J  (mean over oscillation)")`,
          prose: [
            'The phase space plot (v vs x) forms a perfect ellipse. Every point on the ellipse is one moment in time; the particle travels around it clockwise. The shape of the ellipse encodes the energy: E = ½mv² + ½kx². If we scale axes by 1/A and 1/(Aω), it becomes a circle.',
            'The red dots at (±A, 0) are the turning points: maximum displacement, zero velocity — all PE. The green dots at (0, ±Aω) are equilibrium crossings: zero displacement, maximum velocity — all KE.',
            'The energy plot shows KE and PE oscillating out of phase by 90°: when PE peaks (x = ±A), KE = 0; when KE peaks (x = 0), PE = 0. Their sum E_total is constant throughout — energy is conserved, just continuously exchanging form.',
          ],
        },
        {
          cellTitle: 'Period vs mass and spring constant',
          type: 'code',
          language: 'python',
          code: `import numpy as np
import matplotlib.pyplot as plt

# How does T depend on m and k?
m_vals = np.linspace(0.1, 5, 200)    # vary mass
k_vals = np.linspace(10, 500, 200)   # vary spring constant
k_fixed = 100   # N/m
m_fixed = 1.0   # kg

T_vs_m = 2 * np.pi * np.sqrt(m_vals / k_fixed)
T_vs_k = 2 * np.pi * np.sqrt(m_fixed / k_vals)

fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(12, 5))

ax1.plot(m_vals, T_vs_m, 'b-', linewidth=2)
ax1.set_xlabel('Mass m (kg)'); ax1.set_ylabel('Period T (s)')
ax1.set_title(f'T vs m (k = {k_fixed} N/m): T ∝ √m')
ax1.grid(True)

ax2.plot(k_vals, T_vs_k, 'r-', linewidth=2)
ax2.set_xlabel('Spring constant k (N/m)'); ax2.set_ylabel('Period T (s)')
ax2.set_title(f'T vs k (m = {m_fixed} kg): T ∝ 1/√k')
ax2.grid(True)

plt.tight_layout()
plt.show()

# Verify isochronism: T doesn't depend on amplitude
print("Isochronism check (k=100 N/m, m=1 kg):")
for A in [0.01, 0.05, 0.1, 0.5]:
    T_val = 2 * np.pi * np.sqrt(m_fixed / k_fixed)
    print(f"  A = {A*100:.0f} cm → T = {T_val:.4f} s  (same for all amplitudes!)")`,
          prose: [
            'T_vs_m = 2 * np.pi * np.sqrt(m_vals / k_fixed) computes T = 2π√(m/k) for a range of masses with fixed k. The √ shape confirms T ∝ √m: doubling mass increases period by √2 ≈ 41%, not by 2.',
            'T_vs_k shows the inverse relationship T ∝ 1/√k: stiffer springs (larger k) give shorter periods. A spring with k = 400 N/m has half the period of k = 100 N/m (since √(400/100) = 2).',
            'The isochronism check shows all amplitudes from 1 cm to 50 cm give exactly the same T = 0.628 s. This is the key property of SHM: T depends only on k and m, never on amplitude. This is why pendulum clocks work.',
          ],
        },
        {
          cellTitle: 'Challenge: SHM from initial conditions',
          type: 'code',
          language: 'python',
          challengeType: 'write',
          starterCode: `import numpy as np
import matplotlib.pyplot as plt

# A mass-spring system: k = 100 N/m, m = 0.25 kg
# Initial conditions: x0 = 0.03 m, v0 = 0.4 m/s (not from rest!)
k = 100; m = 0.25
x0 = 0.03  # m (3 cm from equilibrium)
v0 = 0.40  # m/s (initial velocity)

omega = np.sqrt(k / m)

# TODO:
# 1. Compute A from: A = sqrt(x0^2 + (v0/omega)^2)
# 2. Compute phase phi from: phi = arctan2(-v0, omega*x0)
#    (Note: x(0) = A cos(phi) = x0, v(0) = -A*omega*sin(phi) = v0)
# 3. Compute and plot x(t) = A * cos(omega*t + phi) for t in [0, 3T]
# 4. Verify x(0) ≈ x0 and v(0) ≈ v0 from your formula
# 5. Label A and T on the plot
`,
        },
      ],
    },
    matlab: {
      type: 'OpenMatNotebook',
      title: 'Simple Harmonic Motion in MATLAB/Octave',
      cells: [
        {
          cellTitle: 'x(t), v(t), a(t): the three SHM functions',
          type: 'code',
          language: 'matlab',
          code: `% SHM: x = A cos(ωt), v = dx/dt = -Aω sin(ωt), a = -Aω² cos(ωt)
k = 160; m = 0.4; A = 0.05;  % N/m, kg, m (5 cm)
omega = sqrt(k / m);           % ω = √(k/m)
T = 2 * pi / omega;            % period

t = linspace(0, 2*T, 500);    % 2 full oscillations
x = A * cos(omega * t);
v = -A * omega * sin(omega * t);
a = -A * omega^2 * cos(omega * t);  % = -ω²x

figure;
subplot(3,1,1);
plot(t, x*100, 'b-', 'LineWidth', 2);
ylabel('x (cm)'); title(sprintf('SHM: \\omega=%.1f rad/s, T=%.3f s', omega, T));
yline(0, 'k-', 'LineWidth', 0.5); grid on;

subplot(3,1,2);
plot(t, v, 'r-', 'LineWidth', 2);
yline(A*omega, 'r:', 'v_{max}', 'LineWidth', 1.5);
ylabel('v (m/s)'); yline(0, 'k-', 'LineWidth', 0.5); grid on;

subplot(3,1,3);
plot(t, a, 'g-', 'LineWidth', 2);
ylabel('a (m/s²)'); xlabel('Time (s)');
yline(0, 'k-', 'LineWidth', 0.5); grid on;

fprintf('omega = %.2f rad/s,  T = %.4f s,  v_max = %.3f m/s\\n', omega, T, A*omega);`,
          prose: [
            'omega = sqrt(k / m) is the MATLAB form of ω = √(k/m). T = 2*pi/omega converts to period. These two lines establish everything about how fast the system oscillates — independent of amplitude A.',
            'The three plots stack vertically with shared x-axis (subplot(3,1,n)). Notice each is a shifted version of the others: v = dx/dt introduces a 90° lag (cosine becomes −sine); a = dv/dt introduces another 90° (−sine becomes −cosine = −x).',
            'yline(A*omega, "r:", "v_{max}") marks the maximum speed on the velocity plot. At this instant (when the mass crosses x = 0), all energy is kinetic: KE = ½mv_max² = ½m(Aω)² = ½kA² = E_total.',
          ],
        },
        {
          cellTitle: 'Phase space and energy exchange',
          type: 'code',
          language: 'matlab',
          code: `k = 160; m = 0.4; A = 0.05; omega = sqrt(k/m);
T = 2*pi/omega;
t = linspace(0, 2*T, 1000);
x = A * cos(omega*t);
v = -A * omega * sin(omega*t);

KE = 0.5 * m * v.^2;
PE = 0.5 * k * x.^2;
E_total = KE + PE;

figure;
subplot(1,2,1);
plot(x*100, v, 'b-', 'LineWidth', 1.5);
hold on;
scatter([A*100, -A*100], [0, 0], 80, 'r', 'filled');  % turning points
scatter([0, 0], [A*omega, -A*omega], 80, 'g', 'filled');  % equilibrium crossings
xlabel('x (cm)'); ylabel('v (m/s)');
title('Phase space: ellipse = constant energy');
xline(0, 'k:', 'LineWidth', 0.5); yline(0, 'k:', 'LineWidth', 0.5);
grid on;

subplot(1,2,2);
plot(t, KE, 'r-', 'LineWidth', 2, 'DisplayName', 'KE = ½mv²');
hold on;
plot(t, PE, 'b-', 'LineWidth', 2, 'DisplayName', 'PE = ½kx²');
plot(t, E_total, 'k--', 'LineWidth', 1.5, 'DisplayName', sprintf('Total E = %.4f J', mean(E_total)));
xlabel('Time (s)'); ylabel('Energy (J)');
title('Energy exchange: KE + PE = constant');
legend; grid on;`,
          prose: [
            'The phase space plot (v vs x) is computed by pairing x and v values at each time step. The result is an ellipse — traversed clockwise. Each point on the ellipse represents a specific (x, v) state. Returning to the same point means returning to the same state.',
            'scatter([A*100, -A*100], [0, 0]) marks the turning points in red: maximum displacement (±A), zero velocity. scatter([0, 0], [A*omega, -A*omega]) marks the equilibrium crossings in green: zero displacement, maximum speed (±Aω).',
            'The energy plot shows KE and PE in antiphase — when one peaks the other is zero. Their sum E_total = ½kA² is constant throughout. mean(E_total) in the legend should equal 0.5*k*A^2 exactly.',
          ],
        },
        {
          cellTitle: 'Period vs mass and spring constant',
          type: 'code',
          language: 'matlab',
          code: `m_vals = linspace(0.1, 5, 200);
k_vals = linspace(10, 500, 200);
k_fixed = 100; m_fixed = 1.0;

T_vs_m = 2 * pi * sqrt(m_vals / k_fixed);
T_vs_k = 2 * pi * sqrt(m_fixed ./ k_vals);

figure;
subplot(1,2,1);
plot(m_vals, T_vs_m, 'b-', 'LineWidth', 2);
xlabel('Mass m (kg)'); ylabel('Period T (s)');
title(sprintf('T vs m (k=%d N/m): T \\propto \\surd m', k_fixed)); grid on;

subplot(1,2,2);
plot(k_vals, T_vs_k, 'r-', 'LineWidth', 2);
xlabel('Spring constant k (N/m)'); ylabel('Period T (s)');
title(sprintf('T vs k (m=%.1f kg): T \\propto 1/\\surd k', m_fixed)); grid on;

% Isochronism: T independent of amplitude
fprintf('Isochronism check (k=100, m=1 kg):\\n');
T_base = 2 * pi * sqrt(m_fixed / k_fixed);
for A = [0.01, 0.05, 0.1, 0.5]
    fprintf('  A = %.0f cm: T = %.4f s\\n', A*100, T_base);
end`,
          prose: [
            'T_vs_m = 2 * pi * sqrt(m_vals / k_fixed) computes T for each mass in the vector m_vals. sqrt() applies element-wise to the vector result. The plot curve confirms the √m dependence — concave shape, not linear.',
            'T_vs_k = 2 * pi * sqrt(m_fixed ./ k_vals) uses ./ for element-wise division when dividing scalar by vector. The decreasing curve shows stiffer springs → shorter periods. The shape is 1/√k.',
            'The isochronism check loop runs T_base (which is amplitude-independent) for each A value and prints the same number every time. This confirms that period depends only on k and m — regardless of A = 1 cm or A = 50 cm.',
          ],
        },
        {
          cellTitle: 'Challenge: SHM from arbitrary initial conditions',
          type: 'code',
          language: 'matlab',
          challengeType: 'write',
          starterCode: `% SHM from arbitrary initial conditions
k = 100; m = 0.25;
x0 = 0.03;   % m
v0 = 0.40;   % m/s

omega = sqrt(k / m);
T = 2*pi / omega;

% TODO:
% 1. A = sqrt(x0^2 + (v0/omega)^2)
% 2. phi = atan2(-v0, omega*x0)
% 3. Plot x(t) = A * cos(omega*t + phi) for 3 periods
% 4. Verify x(0) and v(0) match initial conditions
% 5. Mark amplitude and turning points on the plot
`,
        },
      ],
    },
  },
};
