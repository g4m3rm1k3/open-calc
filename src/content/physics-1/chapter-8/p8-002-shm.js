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
}
