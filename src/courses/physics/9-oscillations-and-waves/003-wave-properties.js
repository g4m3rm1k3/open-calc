export default {
  id: 'p1-ch8-003',
  slug: 'wave-properties',
  chapter: 'p8',
  order: 3,
  title: 'Wave Properties',
  subtitle: 'SHM propagating through space — the oscillation travels, the medium does not.',
  tags: ['waves', 'wavelength', 'frequency', 'amplitude', 'wave speed', 'v = fλ', 'transverse', 'longitudinal'],

  hook: {
    question:
      'A stone drops into a still pond. Ripples spread outward at about 0.5 m/s. A leaf on the surface bobs up and down as each ripple passes. Does the leaf travel outward with the wave? And if the ripples are 10 cm apart and the leaf bobs twice per second — can you calculate the wave speed without watching it move?',
    realWorldContext:
      'Waves carry energy without carrying matter. Sound is a pressure wave — molecules oscillate but don\'t travel from mouth to ear. Light is an electromagnetic wave — no matter moves at all, just oscillating fields. Seismic waves carry energy from an earthquake thousands of kilometers away. The wave-particle duality of quantum mechanics rests on the same mathematics you\'re about to learn.',
    previewVisualizationId: 'WaveformViz',
  },

  intuition: {
    prose: [
      '**The answer:** No — the leaf stays in place, bobbing vertically. The wave pattern moves outward; the water molecules only oscillate up and down. A wave is a *pattern of disturbance* propagating through a medium, not a flow of the medium. The wave speed is v = fλ = (2 Hz)(0.1 m) = 0.2 m/s.',

      '**Wavelength λ:** The spatial repeat distance — how far you must travel along the wave to find an identical point. Like period T in time, but in space. Measure from crest to crest, trough to trough, or any two adjacent identical points.',

      '**Frequency f and period T:** How many complete oscillations pass a fixed point per second (f), or how long one oscillation takes (T = 1/f). A guitar string vibrating at 440 Hz produces a sound wave with f = 440 Hz — 440 compressions hit your eardrum every second.',

      '**Wave speed v = fλ:** The fundamental wave relationship. In one period T, the wave moves exactly one wavelength λ forward. So speed = distance/time = λ/T = fλ. For sound in air at 20°C: v ≈ 343 m/s. Light in vacuum: c = 3 × 10⁸ m/s. Both obey v = fλ — but the speed is fixed by the medium, not the source.',

      '**Transverse vs longitudinal:** In a transverse wave (water, light, strings), the medium oscillates perpendicular to the wave\'s direction of travel. In a longitudinal wave (sound), the medium oscillates parallel to travel — back-and-forth compressions and rarefactions. Both obey v = fλ, but they look fundamentally different.',
    ],
    callouts: [
      {
        type: 'sequencing',
        title: 'Lesson 3 of 4 — Waves: SHM in space',
        body:
          '**Lessons 1–2:** Hooke\'s Law (F = −kx) and SHM (x = A cos(ωt + φ)).\\n**This lesson:** Wave properties — the same oscillation spreading through space.\\n**Next:** The wave equation — the PDE that governs wave propagation.\\n**Physics 2:** Interference, diffraction, standing waves, and the double-slit experiment.',
      },
      {
        type: 'theorem',
        title: 'The fundamental wave relationship',
        body: 'v = f\\lambda = \\frac{\\lambda}{T} \\qquad [v \\text{ in m/s, } f \\text{ in Hz, } \\lambda \\text{ in m}]',
      },
      {
        type: 'definition',
        title: 'Wave parameters',
        body:
          '\\lambda — wavelength [m]: spatial period\\\\f — frequency [Hz = 1/s]: oscillations per second\\\\T — period [s]: time per oscillation (T = 1/f)\\\\A — amplitude [m]: maximum displacement from equilibrium\\\\v — wave speed [m/s]: speed of pattern propagation',
      },
      {
        type: 'insight',
        title: 'Wave speed is a property of the medium, not the source',
        body:
          'Sound travels at 343 m/s in air regardless of whether the source is a whisper or a shout, low-pitched or high-pitched. A louder source (larger A) or higher-pitched source (larger f) — same speed. The medium determines v. Then v = fλ determines λ from f.',
      },
      {
        type: 'definition',
        title: 'Wave number k',
        body:
          'k = \\frac{2\\pi}{\\lambda} \\quad [\\text{rad/m}]\\\\\\text{Spatial analogue of angular frequency } \\omega = 2\\pi/T.\\\\v = \\omega/k \\quad \\text{(another form of } v = f\\lambda\\text{)}',
      },
      {
        type: 'warning',
        title: 'k (wave number) ≠ k (spring constant)',
        body:
          'The letter k is overloaded in physics. In this chapter: k = 2π/λ (wave number, radians per meter). In Hooke\'s Law: k = spring constant (N/m). Context makes the meaning clear — but watch for this when switching between topics.',
      },
    ],
    visualizations: [
      {
        id: 'WaveformViz',
        title: 'Snapshot vs history — what the wave looks like',
        mathBridge:
          'A snapshot (y vs x at fixed t) shows the spatial shape: peaks λ apart. A history (y vs t at fixed x) shows SHM: one full oscillation every T seconds. Both are sinusoidal — but one is in space, the other in time.',
        caption: 'The wave is a function of both x and t. Snapshots and histories are cross-sections.',
        props: { showSnapshot: true, showHistory: true },
      },
    ],
  },

  math: {
    prose: [
      'A sinusoidal wave traveling in the +x direction:',
      '\\(y(x,t) = A\\sin(kx - \\omega t + \\phi)\\)',
      'where \\(k = 2\\pi/\\lambda\\) is the wave number and \\(\\omega = 2\\pi f\\) is the angular frequency.',
      'At a fixed x: \\(y = A\\sin(-\\omega t + \\text{const})\\) — SHM with frequency f.',
      'At a fixed t: \\(y = A\\sin(kx + \\text{const})\\) — sinusoidal in space with wavelength λ.',
      'The phase speed: \\(v = \\omega/k = f\\lambda\\).',
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'Sinusoidal traveling wave',
        body:
          'y(x,t) = A\\sin(kx - \\omega t) \\quad (+x \\text{ direction})\\\\y(x,t) = A\\sin(kx + \\omega t) \\quad (-x \\text{ direction})\\\\v_{\\text{phase}} = \\omega/k = f\\lambda',
      },
      {
        type: 'insight',
        title: 'Wave intensity and amplitude',
        body:
          'The energy carried by a wave is proportional to A². Double the amplitude → 4× the power. For a point source spreading in 3D, intensity falls as 1/r² (inverse square law). This is why sound gets quieter with distance: same total power, larger sphere.',
      },
      {
        type: 'theorem',
        title: 'Wave speeds in common media',
        body:
          '\\text{String: } v = \\sqrt{F_T/\\mu} \\quad (F_T = \\text{tension, } \\mu = \\text{mass/length})\\\\\\text{Sound in fluid: } v = \\sqrt{B/\\rho} \\quad (B = \\text{bulk modulus})\\\\\\text{Sound in solid: } v = \\sqrt{Y/\\rho} \\quad (Y = \\text{Young\'s modulus})',
      },
    ],
    visualizations: [
      {
        id: 'FunctionPlotter',
        title: 'y(x, t) snapshot: adjust λ and A',
        mathBridge:
          'Plot y = A sin(2πx/λ) at fixed t = 0. Change A: amplitude scales the height. Change λ: spatial frequency changes. The curve is a frozen snapshot of the wave at one instant.',
        caption: 'Snapshot y vs x. The spatial period is λ — just like T is the temporal period.',
        props: { expression: '0.1*sin(2*PI*x/0.4)', variable: 'x', xMin: 0, xMax: 2, label: 'y (m)' },
      },
    ],
  },

  rigor: {
    title: 'Wave speed on a string: deriving v = √(F_T/μ)',
    prose: [
      'Consider a small curved segment of a string under tension F_T, with mass/length μ.',
    ],
    proofSteps: [
      {
        expression: '\\text{Segment length } ds \\approx dx, \\; \\text{mass } dm = \\mu\\,dx',
        annotation: 'For a nearly horizontal segment.',
      },
      {
        expression: 'F_y = F_T\\sin\\theta_2 - F_T\\sin\\theta_1 \\approx F_T(\\partial^2 y/\\partial x^2)\\,dx',
        annotation: 'Net vertical force from the two tension vectors at each end of the segment, using small-angle approximation.',
      },
      {
        expression: 'dm \\cdot \\frac{\\partial^2 y}{\\partial t^2} = F_T \\frac{\\partial^2 y}{\\partial x^2}\\,dx',
        annotation: 'Newton\'s second law for the segment. dm = μ dx.',
      },
      {
        expression: '\\frac{\\partial^2 y}{\\partial t^2} = \\frac{F_T}{\\mu} \\frac{\\partial^2 y}{\\partial x^2} \\equiv v^2 \\frac{\\partial^2 y}{\\partial x^2}',
        annotation: 'This is the wave equation with v² = F_T/μ, giving v = √(F_T/μ).',
      },
    ],
  },

  examples: [
    {
      id: 'ch8-003-ex1',
      title: 'Finding wave speed from frequency and wavelength',
      problem:
        '\\text{A sound wave in air has frequency 440 Hz and wavelength 0.78 m. Find: (a) wave speed, (b) period, (c) wave number.}',
      steps: [
        { expression: 'v = f\\lambda = (440)(0.78) = 343\\,\\text{m/s}', annotation: 'Speed of sound at ≈ 20°C.' },
        { expression: 'T = 1/f = 1/440 \\approx 0.00227\\,\\text{s} = 2.27\\,\\text{ms}', annotation: '' },
        { expression: 'k = 2\\pi/\\lambda = 2\\pi/0.78 \\approx 8.06\\,\\text{rad/m}', annotation: 'Wave number.' },
      ],
      conclusion: 'v = 343 m/s (consistent with speed of sound). T ≈ 2.27 ms. k ≈ 8.06 rad/m.',
    },
    {
      id: 'ch8-003-ex2',
      title: 'Guitar string wave speed',
      problem:
        '\\text{A guitar string (μ = 0.003 kg/m) is under 120 N tension. Find the wave speed. If the string is 0.65 m long, what is the fundamental frequency?}',
      steps: [
        {
          expression: 'v = \\sqrt{F_T/\\mu} = \\sqrt{120/0.003} = \\sqrt{40000} = 200\\,\\text{m/s}',
          annotation: 'Wave speed from tension and linear density.',
        },
        {
          expression: '\\lambda_1 = 2L = 2(0.65) = 1.3\\,\\text{m} \\quad (\\text{fundamental: half-wavelength fits the string})',
          annotation: 'Boundary condition: nodes at both fixed ends.',
        },
        {
          expression: 'f_1 = v/\\lambda_1 = 200/1.3 \\approx 154\\,\\text{Hz}',
          annotation: 'Fundamental frequency of the string.',
        },
      ],
      conclusion: 'v = 200 m/s; f₁ ≈ 154 Hz. Tighten the string (increase F_T) to raise the pitch.',
    },
  ],

  challenges: [
    {
      id: 'ch8-003-ch1',
      difficulty: 'easy',
      problem:
        '\\text{A wave has λ = 2 m and T = 0.5 s. Find its speed and frequency.}',
      hint: 'v = λ/T; f = 1/T.',
      walkthrough: [
        { expression: 'v = 2/0.5 = 4\\,\\text{m/s}; \\quad f = 1/0.5 = 2\\,\\text{Hz}', annotation: '' },
      ],
      answer: 'v = 4 m/s, f = 2 Hz.',
    },
    {
      id: 'ch8-003-ch2',
      difficulty: 'medium',
      problem:
        '\\text{The wave y(x,t) = 0.05 sin(3x − 12t) m. Find: (a) amplitude, (b) wave number, (c) angular frequency, (d) wave speed, (e) wavelength, (f) frequency.}',
      hint: 'Read off A, k, ω directly from the form y = A sin(kx − ωt). Then λ = 2π/k, f = ω/2π, v = ω/k.',
      walkthrough: [
        { expression: 'A = 0.05\\,\\text{m}, \\quad k = 3\\,\\text{rad/m}, \\quad \\omega = 12\\,\\text{rad/s}', annotation: 'Read directly from the equation.' },
        { expression: 'v = \\omega/k = 12/3 = 4\\,\\text{m/s}', annotation: '' },
        { expression: '\\lambda = 2\\pi/k = 2\\pi/3 \\approx 2.09\\,\\text{m}', annotation: '' },
        { expression: 'f = \\omega/2\\pi = 12/2\\pi \\approx 1.91\\,\\text{Hz}', annotation: '' },
      ],
      answer: 'A = 0.05 m, k = 3 rad/m, ω = 12 rad/s, v = 4 m/s, λ ≈ 2.09 m, f ≈ 1.91 Hz.',
    },
    {
      id: 'ch8-003-ch3',
      difficulty: 'hard',
      problem:
        '\\text{Two loudspeakers emit 680 Hz sound (v = 340 m/s). They are 2 m apart. A listener is 5 m directly in front of one speaker. Find the path length difference and determine whether the listener hears constructive or destructive interference.}',
      hint: 'Find the distance from each speaker to the listener. The difference Δd determines interference: Δd = nλ (constructive) or Δd = (n+½)λ (destructive).',
      walkthrough: [
        {
          expression: '\\lambda = v/f = 340/680 = 0.5\\,\\text{m}',
          annotation: 'Wavelength of the sound.',
        },
        {
          expression: 'd_1 = 5\\,\\text{m} \\quad (\\text{directly in front})',
          annotation: '',
        },
        {
          expression: 'd_2 = \\sqrt{5^2 + 2^2} = \\sqrt{29} \\approx 5.385\\,\\text{m}',
          annotation: 'Distance from the second speaker (Pythagorean theorem).',
        },
        {
          expression: '\\Delta d = 5.385 - 5.000 = 0.385\\,\\text{m}',
          annotation: '',
        },
        {
          expression: '\\Delta d / \\lambda = 0.385/0.5 = 0.77 \\approx 0.75 = 3/4',
          annotation: 'Not a whole number → not constructive. Not a half-integer → not perfectly destructive. But close to ¾λ — near destructive interference.',
        },
      ],
      answer: 'Δd ≈ 0.385 m ≈ 0.77λ. This is between ½λ and λ — partial destructive interference. The listener hears reduced but not zero intensity.',
    },
  ],

  quiz: [
    {
      id: 'p8-003-q1',
      type: 'choice',
      question: 'A sound wave has frequency 200 Hz and wavelength 1.7 m. What is its speed?',
      options: ['340 m/s', '200 m/s', '1.7 m/s', '118 m/s'],
      answer: '340 m/s',
      hints: ['v = fλ = 200 × 1.7.', 'This is the speed of sound in air at room temperature.'],
      reviewSection: 'intuition',
    },
    {
      id: 'p8-003-q2',
      type: 'choice',
      question: 'A wave traveling at 12 m/s has wavelength 3 m. What is its frequency?',
      options: ['4 Hz', '36 Hz', '0.25 Hz', '12 Hz'],
      answer: '4 Hz',
      hints: ['v = fλ → f = v/λ = 12/3.', 'Period T = 1/f = 0.25 s.'],
      reviewSection: 'intuition',
    },
    {
      id: 'p8-003-q3',
      type: 'choice',
      question: 'What is the wave number k for a wave with wavelength λ = 0.5 m?',
      options: ['4π rad/m', '2π rad/m', '0.5 rad/m', 'π rad/m'],
      answer: '4π rad/m',
      hints: ['k = 2π/λ = 2π/0.5 = 4π.', 'Wave number k counts radians per meter, analogous to ω counting radians per second.'],
      reviewSection: 'intuition',
    },
    {
      id: 'p8-003-q4',
      type: 'choice',
      question: 'A louder speaker increases the amplitude of a sound wave. What happens to the wave speed?',
      options: ['Speed is unchanged', 'Speed increases with amplitude', 'Speed decreases with amplitude', 'Speed doubles'],
      answer: 'Speed is unchanged',
      hints: ['Wave speed is a property of the medium, not the source.', 'In air, v ≈ 343 m/s regardless of volume (amplitude) or pitch (frequency).'],
      reviewSection: 'intuition',
    },
    {
      id: 'p8-003-q5',
      type: 'choice',
      question: 'In a transverse wave, the medium particles oscillate:',
      options: ['Perpendicular to the wave\'s direction of travel', 'Parallel to the wave\'s direction of travel', 'In circles', 'They do not move at all'],
      answer: 'Perpendicular to the wave\'s direction of travel',
      hints: ['Trans- = across. Transverse waves oscillate across (perpendicular to) travel direction.', 'Examples: water waves (up-down while wave moves horizontally), light waves, string waves.'],
      reviewSection: 'intuition',
    },
    {
      id: 'p8-003-q6',
      type: 'choice',
      question: 'The wave y(x,t) = 0.02 sin(5x − 10t) has wave number k = 5 rad/m and ω = 10 rad/s. What is the wave speed?',
      options: ['2 m/s', '5 m/s', '0.5 m/s', '50 m/s'],
      answer: '2 m/s',
      hints: ['v = ω/k = 10/5.', 'Equivalently: v = fλ = (ω/2π)(2π/k) = ω/k.'],
      reviewSection: 'math',
    },
    {
      id: 'p8-003-q7',
      type: 'choice',
      question: 'A guitar string (μ = 0.005 kg/m) is under 180 N tension. What is the wave speed?',
      options: ['190 m/s', '36 m/s', '6 m/s', '900 m/s'],
      answer: '190 m/s',
      hints: ['v = √(F_T/μ) = √(180/0.005) = √36000.', '√36000 ≈ 190 m/s.'],
      reviewSection: 'math',
    },
    {
      id: 'p8-003-q8',
      type: 'choice',
      question: 'Sound intensity follows the inverse square law: I ∝ 1/r². If you double your distance from a speaker, intensity changes by:',
      options: ['Factor of 1/4 (drops to 25%)', 'Factor of 1/2 (drops to 50%)', 'Factor of 1/8 (drops to 12.5%)', 'Stays the same'],
      answer: 'Factor of 1/4 (drops to 25%)',
      hints: ['I ∝ 1/r²: doubling r multiplies intensity by 1/2² = 1/4.', 'Same total power spreads over 4× the surface area of the sphere.'],
      reviewSection: 'math',
    },
    {
      id: 'p8-003-q9',
      type: 'choice',
      question: 'How does doubling the frequency of a wave (at fixed wave speed) affect the wavelength?',
      options: ['λ halves', 'λ doubles', 'λ is unchanged', 'λ quadruples'],
      answer: 'λ halves',
      hints: ['v = fλ → λ = v/f. With fixed v, λ ∝ 1/f.', 'Higher frequency → shorter wavelength. This is why radio waves are much longer than visible light.'],
      reviewSection: 'intuition',
    },
    {
      id: 'p8-003-q10',
      type: 'choice',
      question: 'Wave intensity is proportional to:',
      options: ['A² (amplitude squared)', 'A (amplitude)', '1/A²', 'A³'],
      answer: 'A² (amplitude squared)',
      hints: ['Energy in a wave is proportional to the square of the amplitude — same as KE = ½mv² and E = ½kA² in SHM.', 'Doubling amplitude → 4× the intensity.'],
      reviewSection: 'math',
    },
  ],

  misconceptions: [
    {
      id: 'p8-003-m1',
      misconception: 'The medium (water, air) travels with the wave — that\'s how the wave moves.',
      correction: 'The medium oscillates in place; the pattern of the disturbance moves forward. Each water molecule just bobs up and down as the wave passes. You can see this with a floating cork: it rises and falls but doesn\'t travel outward with the wave. Energy propagates through the medium without net transport of matter.',
      correctionExample: 'Sound: air molecules oscillate back and forth (compression/rarefaction), but no net flow of air. After a sound passes, each air molecule is back where it started.',
    },
    {
      id: 'p8-003-m2',
      misconception: 'Higher frequency waves travel faster.',
      correction: 'Wave speed is set by the medium, not the frequency. In a given medium, all frequencies travel at the same speed v = fλ — higher frequency just means shorter wavelength. (Note: this applies to non-dispersive media. In dispersive media like glass, different frequencies do travel at different speeds — that\'s why prisms split white light into colors.)',
      correctionExample: 'Sound in air at 20°C: both 100 Hz (bass) and 10,000 Hz (treble) travel at 343 m/s. λ₁₀₀ = 3.43 m; λ₁₀₀₀₀ = 0.034 m. Same speed, different wavelength.',
    },
  ],

  transferPrompts: [
    {
      id: 'p8-003-t1',
      prompt: `The Doppler effect: when a source moves toward you, you perceive a higher frequency. Using v = fλ and the fact that v is fixed by the medium, explain qualitatively why a moving source compresses wavelengths in front of it. If a car horn emits 400 Hz and travels toward you at 30 m/s (sound speed = 340 m/s), what frequency do you hear?`,
      connection: 'The wave speed v = fλ stays fixed by the medium; a moving source changes the apparent λ (spacing of wave crests), which changes perceived f. This is v = f_observed × λ_observed.',
    },
    {
      id: 'p8-003-t2',
      prompt: `Seismic waves come in two types: P-waves (longitudinal, travel through rock at ~6 km/s) and S-waves (transverse, ~3.5 km/s). An earthquake happens 100 km away. How many seconds after the P-wave arrives does the S-wave arrive? How do seismologists use this time difference to locate the earthquake epicenter?`,
      connection: 'v = d/t for each wave type. The P-S time gap gives distance to the source; three seismograph stations triangulate position — direct application of v = fλ and wave speed differences.',
    },
  ],

  debugging: [
    {
      id: 'p8-003-d1',
      error: `A student computing wavelength writes:
"Spring constant k = 200 N/m. Wave number k = 2π/λ = 200 rad/m. Therefore λ = 2π/200 m."`,
      fix: `The symbol k is used for two completely different things: spring constant (N/m) and wave number (rad/m). These are NOT the same k.
The problem gives a spring constant of 200 N/m — this tells you nothing about wavelength.
Wave number k = 2π/λ is determined by the wavelength of an oscillating wave, which needs frequency and wave speed: λ = v/f.
Always check which meaning of k the context requires.`,
    },
    {
      id: 'p8-003-d2',
      error: `A student writes: "Wave y(x,t) = 0.1 sin(3x − 12t). The period is T = 2π/3 s and the wavelength is λ = 2π/12 m."`,
      fix: `The student swapped which parameter is which. In y = A sin(kx − ωt):
- k = 3 rad/m is the WAVE NUMBER → wavelength λ = 2π/k = 2π/3 m
- ω = 12 rad/s is the ANGULAR FREQUENCY → period T = 2π/ω = 2π/12 s

The student used ω for the spatial quantity and k for the temporal quantity. Rule: k is the spatial frequency (cycles per meter, scaled by 2π); ω is the temporal frequency (cycles per second, scaled by 2π).`,
    },
  ],

  mastery: {
    targetLevel: 'Apply v = fλ to find speed, frequency, or wavelength; read wave parameters from y(x,t) = A sin(kx − ωt); distinguish wave speed from medium speed.',
    checklistItems: [
      'Can use v = fλ to find the third quantity given any two',
      'Can extract A, k, ω from the wave equation and compute v, λ, f, T',
      'Can calculate wave speed on a string using v = √(F_T/μ)',
      'Can explain why the medium oscillates in place while the wave pattern moves forward',
      'Can apply intensity ∝ A² and the inverse square law I ∝ 1/r² for point sources',
    ],
    commonStruggles: [
      'Confusing wave number k (rad/m) with spring constant k (N/m) — same symbol, completely different quantities',
      'Swapping the roles of k and ω when reading from y = A sin(kx − ωt): k is spatial, ω is temporal',
      'Assuming higher frequency = higher wave speed — both low and high frequencies travel at the same v in a non-dispersive medium',
    ],
    nextSteps: 'Lesson p8-004 (Wave Equation) shows the PDE ∂²y/∂t² = v² ∂²y/∂x² that all waves satisfy, plus superposition and standing waves.',
  },

  semantics: {
    core: [
      { symbol: 'v = f\\lambda', meaning: 'Fundamental wave relationship: wave speed = frequency × wavelength' },
      { symbol: '\\lambda', meaning: 'Wavelength (m): spatial repeat distance — distance from crest to crest' },
      { symbol: 'f = 1/T', meaning: 'Frequency (Hz): oscillations per second; T = period (s)' },
      { symbol: 'k = 2\\pi/\\lambda', meaning: 'Wave number (rad/m): spatial analogue of ω; measures oscillation rate in space' },
      { symbol: 'y(x,t) = A\\sin(kx - \\omega t)', meaning: 'Sinusoidal wave traveling in +x direction; kx−ωt form means rightward propagation' },
      { symbol: 'I \\propto A^2', meaning: 'Wave intensity proportional to amplitude squared; double amplitude → 4× intensity' },
    ],
    rulesOfThumb: [
      'v = fλ: wave speed is fixed by the medium; changing frequency changes wavelength, not speed.',
      'k = 2π/λ (wave number) ≠ k (spring constant): same letter, completely different meaning.',
      'Transverse: medium oscillates ⊥ to propagation (strings, light). Longitudinal: ∥ to propagation (sound).',
      'Amplitude A tells you energy; frequency/wavelength tell you the pattern. They are independent parameters.',
      'For point sources in 3D, intensity I ∝ 1/r² — same power spreads over larger spherical area.',
    ],
  },

  notebooks: {
    python: {
      type: 'PythonNotebook',
      title: 'Wave Properties in Python',
      cells: [
        {
          cellTitle: 'Wave snapshot: y(x,t₀) and v = fλ',
          type: 'code',
          language: 'python',
          code: `import numpy as np
import matplotlib.pyplot as plt

# Sinusoidal wave: y(x,t) = A sin(kx - ωt)
A = 0.05      # m (5 cm amplitude)
f = 2.0       # Hz
v_wave = 4.0  # m/s (wave speed — set by medium)
lam = v_wave / f        # λ = v/f = 2 m
k = 2 * np.pi / lam     # k = 2π/λ = π rad/m
omega = 2 * np.pi * f   # ω = 2πf = 4π rad/s

print(f"v = fλ = {f} Hz × {lam} m = {f*lam} m/s  ✓")
print(f"k = 2π/λ = {k:.4f} rad/m,  ω = 2πf = {omega:.4f} rad/s")
print(f"v = ω/k = {omega/k:.2f} m/s  ✓ (same wave speed from ratio)")

x = np.linspace(0, 4 * lam, 500)  # 4 wavelengths of space

# Snapshots at different times
times = [0, 0.1, 0.25]  # seconds
fig, ax = plt.subplots(figsize=(10, 5))
colors = ['blue', 'orange', 'green']
for t_val, color in zip(times, colors):
    y = A * np.sin(k * x - omega * t_val)
    ax.plot(x, y * 100, color=color, linewidth=2, label=f't = {t_val} s')

ax.set_xlabel('Position x (m)')
ax.set_ylabel('Displacement y (cm)')
ax.set_title(f'Wave snapshots: f = {f} Hz, λ = {lam} m, v = {v_wave} m/s')
ax.axhline(0, color='k', linewidth=0.5)
ax.legend(); ax.grid(True)
plt.show()`,
          prose: [
            'lam = v_wave / f implements λ = v/f, the fundamental wave relation rearranged to find wavelength. Wave speed v_wave = 4.0 m/s is fixed by the medium — changing f changes λ, not v.',
            'k = 2*np.pi / lam is the wave number: k = 2π/λ. It measures how many radians of oscillation occur per meter of space. The check omega/k = v verifies that v = ω/k is consistent with v = fλ.',
            'Three snapshots at t = 0, 0.1, 0.25 s show the wave pattern translating to the right — the whole sinusoid shifts forward by vt. After t = T = 0.5 s, the pattern returns to its original position: the wave moved exactly one wavelength.',
          ],
        },
        {
          cellTitle: 'Wave history and v = fλ verification',
          type: 'code',
          language: 'python',
          code: `import numpy as np
import matplotlib.pyplot as plt

# Wave history: what a fixed observer sees
A = 0.05; f = 2.0; v_wave = 4.0
lam = v_wave / f
k = 2 * np.pi / lam
omega = 2 * np.pi * f
T = 1 / f

# Fixed position observers
positions = [0, lam/4, lam/2]  # at 0, λ/4, λ/2 meters
t = np.linspace(0, 3 * T, 500)

fig, axes = plt.subplots(len(positions), 1, figsize=(10, 8), sharex=True)

for ax, x0 in zip(axes, positions):
    y_history = A * np.sin(k * x0 - omega * t)
    ax.plot(t, y_history * 100, linewidth=2)
    ax.set_ylabel('y (cm)')
    ax.set_title(f'History at x = {x0:.3f} m (= {x0/lam:.1f}λ)')
    ax.axhline(0, color='k', linewidth=0.5); ax.grid(True)

axes[-1].set_xlabel('Time (s)')
plt.suptitle(f'Wave history: each observer sees SHM at frequency f = {f} Hz', y=1.01)
plt.tight_layout()
plt.show()

# Print the phase lag between adjacent observers
phase_lag = k * lam / 4  # = 2π/λ × λ/4 = π/2
print(f"Observers λ/4 apart have phase lag = kΔx = {phase_lag:.4f} rad = π/2 rad = 90°")
print("Each observer sees the same SHM frequency {f} Hz — just shifted in time")`,
          prose: [
            'y_history = A * np.sin(k * x0 - omega * t) evaluates y(x₀, t) at a fixed position x₀ as time varies — this is what a single observer measures. The result is pure SHM (sinusoidal in time) at frequency f.',
            'Observers at x = 0, λ/4, λ/2 all see the same frequency f, but their oscillations are shifted in phase. Observer at x = λ/4 is π/2 radians (90°) behind x = 0 because the wave takes Δt = (λ/4)/v = T/4 to travel that distance.',
            'The key insight: every observer along the wave sees identical SHM, just started at a different phase. The wave speed v determines how quickly that phase shift propagates — and v = fλ connects the timing to the spatial pattern.',
          ],
        },
        {
          cellTitle: 'String wave speed vs tension',
          type: 'code',
          language: 'python',
          code: `import numpy as np
import matplotlib.pyplot as plt

# Wave speed on a string: v = sqrt(F_T / mu)
mu = 0.003  # kg/m (linear mass density)
F_T_values = np.linspace(10, 500, 300)  # tension from 10 N to 500 N

v_values = np.sqrt(F_T_values / mu)   # v = sqrt(F_T/μ)

# For a 0.65 m string: fundamental frequency f1 = v/(2L)
L = 0.65   # m
f1_values = v_values / (2 * L)

fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(12, 5))

ax1.plot(F_T_values, v_values, 'b-', linewidth=2)
ax1.set_xlabel('Tension F_T (N)'); ax1.set_ylabel('Wave speed v (m/s)')
ax1.set_title(f'v = √(F_T/μ)  (μ = {mu} kg/m)')
ax1.grid(True)

ax2.plot(F_T_values, f1_values, 'r-', linewidth=2)
ax2.set_xlabel('Tension F_T (N)'); ax2.set_ylabel('Fundamental frequency (Hz)')
ax2.set_title(f'f₁ = v/(2L) on a {L} m string')
ax2.grid(True)

plt.tight_layout()
plt.show()

# At concert A₄ = 440 Hz
target_f = 440  # Hz
required_v = 2 * L * target_f
required_F = mu * required_v**2
print(f"To tune to A₄ = 440 Hz: v = {required_v:.1f} m/s, tension = {required_F:.1f} N")`,
          prose: [
            'v_values = np.sqrt(F_T_values / mu) computes v = √(F_T/μ) for 300 tension values simultaneously. The √ shape shows that doubling tension increases wave speed by √2, not by 2 — a concave-upward curve.',
            'f1_values = v_values / (2 * L) converts wave speed to fundamental frequency using f₁ = v/(2L). This is the boundary condition for a string fixed at both ends: the fundamental mode fits one half-wavelength (λ/2 = L).',
            'The tuning calculation demonstrates the real application: given f₁ = 440 Hz, we solve backwards for required tension. A guitar player "tunes" by adjusting this tension — tightening raises f₁, loosening lowers it.',
          ],
        },
        {
          cellTitle: 'Challenge: two-speaker interference pattern',
          type: 'code',
          language: 'python',
          challengeType: 'write',
          starterCode: `import numpy as np
import matplotlib.pyplot as plt

# Two speakers emitting 680 Hz sound, speed v = 340 m/s
f = 680; v_sound = 340
lam = v_sound / f   # wavelength

# Speaker positions (on y-axis, separated by 2 m)
s1 = np.array([0.0,  1.0])   # speaker 1
s2 = np.array([0.0, -1.0])   # speaker 2

# Grid of listener positions in front of the speakers
x = np.linspace(0.5, 10, 200)
y = np.linspace(-8, 8, 200)
X, Y = np.meshgrid(x, y)

# TODO:
# 1. For each grid point (X, Y), compute distances d1 and d2 to each speaker:
#    d1 = sqrt((X - s1[0])^2 + (Y - s1[1])^2)  (use element-wise operations)
# 2. Compute path length difference: delta_d = d2 - d1
# 3. Compute interference: amplitude = |2 * cos(pi * delta_d / lam)|
#    (constructive where delta_d = n*lambda, destructive where delta_d = (n+0.5)*lambda)
# 4. Plot the interference pattern using plt.contourf(X, Y, amplitude, levels=50, cmap='RdBu')
# 5. Mark the two speaker positions with red dots
`,
        },
      ],
    },
    matlab: {
      type: 'OpenMatNotebook',
      title: 'Wave Properties in MATLAB/Octave',
      cells: [
        {
          cellTitle: 'Wave snapshot and v = fλ',
          type: 'code',
          language: 'matlab',
          code: `% Sinusoidal wave: y(x,t) = A sin(kx - ωt)
A = 0.05; f = 2.0; v_wave = 4.0;
lam = v_wave / f;         % λ = v/f
k = 2*pi / lam;           % k = 2π/λ
omega = 2*pi * f;         % ω = 2πf
T = 1 / f;

fprintf('v = f*lambda = %.1f * %.1f = %.1f m/s\\n', f, lam, f*lam);
fprintf('v = omega/k = %.4f/%.4f = %.2f m/s\\n', omega, k, omega/k);

x = linspace(0, 4*lam, 500);
times = [0, 0.1, 0.25];
colors = {'b', 'r', 'g'};

figure;
for i = 1:length(times)
    y = A * sin(k*x - omega*times(i));
    plot(x, y*100, colors{i}, 'LineWidth', 2, ...
         'DisplayName', sprintf('t = %.2f s', times(i)));
    hold on;
end
xlabel('Position x (m)'); ylabel('Displacement y (cm)');
title(sprintf('Wave snapshots: f=%g Hz, \\lambda=%g m, v=%g m/s', f, lam, v_wave));
legend; grid on; yline(0, 'k-', 'LineWidth', 0.5);`,
          prose: [
            'lam = v_wave / f computes λ = v/f. With v = 4 m/s and f = 2 Hz, λ = 2 m. The two consistency checks — f*lam and omega/k — both print the same wave speed, confirming v = fλ = ω/k.',
            'The loop over times plots three snapshots. hold on keeps all three plots on the same axes. Each snapshot is the same sinusoid shifted forward by v × Δt meters — after t = T/4 = 0.125 s, the wave moved one quarter-wavelength to the right.',
            'The pattern translates rightward — the medium doesn\'t move but the disturbance pattern does. An observer at any fixed x would see pure SHM (same frequency), just starting at a different phase.',
          ],
        },
        {
          cellTitle: 'Wave history at fixed positions',
          type: 'code',
          language: 'matlab',
          code: `A = 0.05; f = 2.0; v_wave = 4.0;
lam = v_wave / f; k = 2*pi/lam; omega = 2*pi*f; T = 1/f;

positions = [0, lam/4, lam/2];
t = linspace(0, 3*T, 500);

figure;
for i = 1:length(positions)
    x0 = positions(i);
    y_hist = A * sin(k*x0 - omega*t);
    subplot(3, 1, i);
    plot(t, y_hist*100, 'b-', 'LineWidth', 2);
    ylabel('y (cm)');
    title(sprintf('History at x = %.3f m (%.1f\\lambda)', x0, x0/lam));
    yline(0, 'k-', 'LineWidth', 0.5); grid on;
end
xlabel('Time (s)');

% Phase difference between observers
delta_x = lam / 4;
delta_phase = k * delta_x;
fprintf('Phase difference for observers %.3f m apart: %.4f rad = 90 deg\\n', delta_x, delta_phase);`,
          prose: [
            'A * sin(k*x0 - omega*t) evaluates y(x₀, t) at fixed position x₀ as t varies. The result is pure SHM — sinusoidal in time at frequency f. Every position sees the same oscillation, just at a different phase.',
            'subplot(3,1,i) creates three stacked panels. The three history plots look identical except for horizontal shifts. Observers λ/4 apart have a 90° phase difference: observer at x = λ/4 sees the same oscillation as x = 0, but starting T/4 seconds later.',
            'The phase formula delta_phase = k * delta_x = (2π/λ)(λ/4) = π/2 rad = 90° explains the shift quantitatively. This same phase lag governs constructive and destructive interference between wave sources.',
          ],
        },
        {
          cellTitle: 'String wave speed and guitar tuning',
          type: 'code',
          language: 'matlab',
          code: `mu = 0.003;  % kg/m (linear mass density)
L  = 0.65;   % m (string length)
F_T = linspace(10, 500, 300);   % N

v = sqrt(F_T / mu);      % v = sqrt(F_T/mu)
f1 = v ./ (2 * L);       % fundamental: f1 = v/(2L)

figure;
subplot(1,2,1);
plot(F_T, v, 'b-', 'LineWidth', 2);
xlabel('Tension F_T (N)'); ylabel('Wave speed v (m/s)');
title(sprintf('v = \\surd(F_T/\\mu)  (\\mu = %.3f kg/m)', mu)); grid on;

subplot(1,2,2);
plot(F_T, f1, 'r-', 'LineWidth', 2);
hold on;
yline(440, 'k--', 'A4 = 440 Hz', 'LineWidth', 1.5);
xlabel('Tension F_T (N)'); ylabel('f_1 (Hz)');
title(sprintf('f_1 = v/(2L) on %.2f m string', L)); grid on;

% Find tension for A4 = 440 Hz
F_A4 = mu * (2 * L * 440)^2;
fprintf('To tune to A4=440 Hz: v = %.1f m/s, tension = %.1f N\\n', 2*L*440, F_A4);`,
          prose: [
            'v = sqrt(F_T / mu) is element-wise: MATLAB automatically broadcasts the scalar mu across all elements of the vector F_T. f1 = v ./ (2 * L) uses ./ since v is a vector — f₁ = v/(2L) for every tension value simultaneously.',
            'yline(440, "k--", "A4 = 440 Hz") overlays a reference line on the frequency plot. The intersection of the curve with this line shows exactly what tension is needed to tune the string to concert A₄.',
            'F_A4 = mu * (2 * L * 440)^2 solves F = μv² = μ(2Lf₁)² for the required tension. This is the physics behind why different guitar strings have different tensions and different thicknesses (μ values).',
          ],
        },
        {
          cellTitle: 'Challenge: two-speaker interference pattern',
          type: 'code',
          language: 'matlab',
          challengeType: 'write',
          starterCode: `% Two-speaker interference pattern
f = 680; v_sound = 340;
lam = v_sound / f;   % wavelength

% Speaker positions
s1 = [0, 1]; s2 = [0, -1];

% Listener position grid
x = linspace(0.5, 10, 200);
y = linspace(-8, 8, 200);
[X, Y] = meshgrid(x, y);

% TODO:
% 1. d1 = sqrt((X - s1(1)).^2 + (Y - s1(2)).^2)
% 2. d2 = sqrt((X - s2(1)).^2 + (Y - s2(2)).^2)
% 3. delta_d = d2 - d1
% 4. amplitude = abs(2 * cos(pi * delta_d / lam))
% 5. contourf(X, Y, amplitude, 50); colormap('jet'); colorbar
%    xlabel('x (m)'); ylabel('y (m)');
%    title('Two-speaker interference pattern (680 Hz)')
`,
        },
      ],
    },
  },
};
