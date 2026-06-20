export default {
  id: 'elec2-004',
  slug: 'inductive-reactance',
  chapter: 'elec2',
  order: 4,
  title: 'Inductive Reactance — XL and the Frequency Response of Inductors',
  subtitle: 'Why inductors pass DC freely but impede high-frequency AC — and how XL = 2πfL shapes every motor, transformer, and choke.',
  tags: ['inductive reactance', 'XL', 'inductor', 'AC impedance', 'choke', 'EMI filter', 'motor winding'],
  aliases: 'inductive reactance XL inductor AC impedance choke EMI filter low pass motor winding frequency',
  timeToComplete: 22,
  coreConcept: "Inductive reactance XL = 2πfL = ωL. It increases with frequency: at DC (f=0), XL = 0 — short circuit. At high frequency, XL → ∞ — open circuit. Phasor impedance Z_L = +jXL, meaning voltage leads current by 90° (current lags voltage — ELI). Inductors are used as low-pass chokes, EMI filters, VFD output filters, and energy storage elements in switching power supplies.",
  prerequisites: ['elec2-002', 'elec1-007'],
  nextLesson: 'rlc-series',

  hook: {
    question: "A VFD drives a 480V motor through 50 meters of cable. Without an output filter, the motor windings see voltage spikes up to 1000V+ from cable reflections. The VFD manufacturer recommends adding a 3-phase output choke (inductor). Why does an inductor help, and what inductance do you need to limit dV/dt to 500V/μs?",
    realWorldContext: "VFD output switching creates fast voltage rise times (dV/dt). When these travel down a long cable and reflect off the motor's high-impedance winding, they can double in amplitude. The motor winding insulation sees twice the DC bus voltage. An output choke adds inductive reactance that slows the rise time: V = L × dI/dt → dV/dt is limited by L. For dV/dt ≤ 500V/μs at 30A load: L = V × dt/dI = 500 × 10⁶ V/s × (Δt/ΔI). In practice, VFD output chokes are 1–5mH, reducing dV/dt from 5000V/μs to under 500V/μs and extending motor winding life dramatically.",
  },

  mentalModel: [
    "**Inductors resist change in current — faster changes need more voltage.** V = L × dI/dt. High frequency = faster change = more voltage for the same current. This is why XL = ωL increases with frequency. An inductor is a frequency-dependent 'stiffener': it doesn't care about DC current magnitude (no voltage drop at DC), but it strongly resists AC current, especially at high frequencies.",
    "**Voltage leads current in an inductor.** When you apply AC voltage to an inductor, current builds up slowly (inductance is inertia). The voltage peaks first; current peaks 90° later. This is ELI: in an inductor (L), voltage (E) leads current (I) by 90°. Phasor Z_L = jXL — the positive j means voltage is 90° ahead of current.",
    "**XL as a low-pass filter element.** In series with a load, an inductor drops more voltage at high frequencies (XL increases). High-frequency currents through the inductor produce large back-EMF that limits those currents. This is a low-pass filter — the inductor passes DC and low frequencies, attenuates high frequencies. This is the principle behind VFD output chokes, EMI chokes on motor cables, and power-line filters.",
  ],

  intuition: {
    prose: [
      "**Series RL: low-pass filter.** In a series RL circuit with output across R: V_out/V_in = R/√(R² + XL²). As f increases, XL increases, V_out/V_in decreases. Corner frequency f_c = R/(2πL). This is a low-pass filter — the RL version of the RC low-pass. Output across L gives a high-pass filter. RL filters are used where low source impedance is needed (chokes have low DC resistance, capacitors can't pass DC bias current).",
      "**EMI chokes on motor cables.** Motor drive cables carry PWM currents at the switching frequency (2–20kHz) plus harmonics. A common-mode choke (wound on a ferrite toroid) presents high XL to common-mode noise (same direction in all conductors) while presenting low impedance to differential (motor drive) currents. At 10kHz with L = 1mH: XL = 2π × 10000 × 0.001 = 62.8Ω. This is sufficient to attenuate common-mode noise to safe levels.",
      "**Motor winding inductance.** A motor winding is fundamentally an RL circuit. The winding resistance R limits steady-state current. The winding inductance L limits the rate of current rise during starting. Inrush current during motor start is: I_peak ≈ V_s/Z_winding where Z_winding at 60Hz ≈ √(R² + XL²). For a large motor, XL >> R at power frequency — the winding is mostly inductive. This is why motor starting current is 6–8× running current: at standstill (t=0), back-EMF = 0, and only the winding impedance limits current.",
      "**Switching power supply inductors.** In a buck converter (step-down), an inductor stores energy during the ON time and releases it during the OFF time. The inductor value determines current ripple: ΔI = V × ton / L. For L = 100μH at 100kHz with 12V input, 5V output, ton = 0.5μs: ΔI = 12 × 0.5×10⁻⁶ / 100×10⁻⁶ = 60mA. Increasing L reduces ΔI (smoother current), but larger L means bigger, heavier component.",
    ],
    callouts: [
      {
        type: 'definition',
        title: 'Inductive Reactance',
        body: "$$X_L = \\omega L = 2\\pi f L$$\n\nUnit: Ohms (Ω) — frequency-dependent.\n\n| Freq | L=1mH | L=10mH | L=100mH |\n|---|---|---|---|\n| 50 Hz | 0.31Ω | 3.14Ω | 31.4Ω |\n| 60 Hz | 0.38Ω | 3.77Ω | 37.7Ω |\n| 1 kHz | 6.28Ω | 62.8Ω | 628Ω |\n| 10 kHz | 62.8Ω | 628Ω | 6.28kΩ |\n\nXL increases with frequency (opposite of XC).",
      },
      {
        type: 'theorem',
        title: 'RL Filter Equations',
        body: "**Low-pass** (output across R):\n$$\\frac{V_{out}}{V_{in}} = \\frac{R}{\\sqrt{R^2 + X_L^2}}$$\n\n**High-pass** (output across L):\n$$\\frac{V_{out}}{V_{in}} = \\frac{X_L}{\\sqrt{R^2 + X_L^2}}$$\n\n**Corner frequency (−3dB):**\n$$f_c = \\frac{R}{2\\pi L}$$\n\nAt f_c: V_out = 0.707 V_in, phase = ±45°.",
      },
      {
        type: 'procedure',
        title: 'VFD Output Choke Selection',
        body: "For dV/dt limitation on a VFD drive:\n\n1. Determine cable length and worst-case dV/dt (from VFD spec or measurement)\n2. Target dV/dt ≤ 500V/μs for standard motor insulation\n3. Required L: from V = L × dI/dt, and knowing the drive switching rise time, select choke L\n4. Choke current rating ≥ motor FLA (full load amps)\n5. Check voltage drop at 60Hz: V_drop = I × X_L = I × 2π × 60 × L. For L=3mH, I=30A: V_drop = 30 × 1.13 = 33.9V at 60Hz — acceptable (<7% of 480V)\n6. Verify choke core does not saturate at motor starting inrush current",
      },
      {
        type: 'warning',
        title: 'Inductor Saturation in Drives',
        body: "Inductors used in VFD output filters and switching converters can saturate if the core is undersized for the peak current. At saturation: inductance collapses → XL drops to near zero → large current spikes → potential component failure.\n\n**Always specify inductors by:** saturation current (I_sat ≥ peak current), inductance value (H), DCR (DC resistance, Ω), and core material (ferrite for >20kHz, powdered iron for 1–20kHz, silicon steel for <1kHz).\n\nFor motor starting: choke must not saturate at 6–8× FLA for 3–10 seconds.",
      },
    ],
    visualizations: [
      {
        id: 'ImpedanceViz',
        title: 'Inductive Reactance — Frequency and Impedance',
        mathBridge: "Set R=0, C very large (near 0Ω XC), vary L and f. Watch XL = 2πfL grow with frequency. At low frequency: XL is small, current is large. At high frequency: XL dominates, current is small — the inductor blocks it. Phase angle approaches +90°. Add R: see the RL impedance triangle. Compare XL vs XC curves by toggling L and C.",
      },
    ],
  },

  math: {
    prose: [
      "**Energy stored and reactive power.** Energy in an inductor at current I: E = ½LI². The instantaneous power p(t) = v_L(t) × i(t). For ideal inductor: p(t) = XL × Im² × sin(ωt)cos(ωt) = (XL Im²/2) sin(2ωt). Average power = 0 — energy is stored and returned every half-cycle. Reactive power Q = I²_rms × XL = V²_rms/XL (VAr, inductive).\n\nFor a motor: the winding draws reactive power for the magnetic field — this reactive power must be supplied by the source even though no real work is done by it. Capacitor banks in the plant supply this locally, reducing reactive current from the grid.",
    ],
    callouts: [
      {
        type: 'insight',
        title: 'Buck Converter Inductor Design',
        body: "For a buck converter: V_in=12V, V_out=5V, f_sw=100kHz, I_out=1A, ΔI=10% of I_out:\n\n$$L = \\frac{V_{in} - V_{out}}{\\Delta I \\cdot f_{sw}} \\times D = \\frac{(12-5)}{0.1 \\times 100\\text{kHz}} \\times \\frac{5}{12} = 29.2\\mu H$$\n\nwhere D = V_out/V_in = 5/12 = 0.417 is the duty cycle.\n\nSelect L = 33μH standard value. Saturation current rating: I_sat > I_out + ΔI/2 = 1.05A.",
      },
    ],
  },
  quiz: [
    {
      id: 'q1',
      type: 'choice',
      text: 'A 100mH inductor is in a 60Hz AC circuit. What is its reactance?',
      options: [
        '6000Ω — multiply inductance by frequency',
        'About 37.7Ω — XL = 2π × 60 × 0.1 = 37.7Ω',
        '1.67Ω — divide frequency by inductance',
      ],
      correct: 1,
    },
    {
      id: 'q2',
      type: 'choice',
      text: 'You double the frequency of AC applied to an inductor. What happens to its reactance?',
      options: [
        'Reactance halves — higher frequency means less opposition in inductors',
        'Reactance doubles — XL = 2πfL, so doubling f doubles XL',
        'Reactance stays the same — it depends only on inductance, not frequency',
      ],
      correct: 1,
    },
    {
      id: 'q3',
      type: 'choice',
      text: 'Why is a VFD output choke (series inductor) effective at reducing voltage spikes on long motor cables?',
      options: [
        'The inductor stores the spike energy and releases it slowly as heat',
        'The inductor limits dV/dt by opposing rapid changes in current — V = L × dI/dt — slowing the voltage rise that causes cable reflections',
        'The inductor filters the PWM carrier frequency while blocking the fundamental motor frequency',
      ],
      correct: 1,
    },
    {
      id: 'q4',
      type: 'choice',
      text: 'An ideal inductor in an AC circuit consumes no real power. Why not?',
      options: [
        'The inductor has zero resistance, so it cannot convert electrical energy to heat',
        'Energy is stored in the magnetic field during one half-cycle and returned to the circuit during the next — the average power over a full cycle is zero',
        'Inductors only resist change in current, so they cannot do work on charge carriers',
      ],
      correct: 1,
    },
  ],
};
