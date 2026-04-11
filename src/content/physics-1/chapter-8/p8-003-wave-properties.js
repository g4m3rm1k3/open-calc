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
}
