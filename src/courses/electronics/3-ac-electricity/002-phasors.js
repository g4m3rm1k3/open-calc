export default {
  id: 'elec2-002',
  slug: 'phasors',
  chapter: 'elec2',
  order: 2,
  title: 'Phasors — Rotating Vectors for AC Analysis',
  subtitle: 'How complex numbers replace trigonometry for AC circuits — turning differential equations into simple algebra.',
  tags: ['phasor', 'complex number', 'impedance', 'phase angle', 'imaginary', 'polar form', 'rectangular form', 'j-notation'],
  aliases: 'phasor rotating vector complex number j notation polar rectangular impedance phase angle AC analysis',
  timeToComplete: 28,
  coreConcept: "A phasor is a complex number representing a sinusoidal quantity's amplitude and phase. Voltage v(t) = Vm sin(ωt + φ) becomes phasor V = Vm∠φ = Vm(cos φ + j sin φ). Multiplying by j rotates by 90° — giving inductors jωL and capacitors 1/(jωC) as impedances. All AC circuit analysis (KVL, KCL, voltage dividers) then works algebraically on phasors instead of solving differential equations.",
  prerequisites: ['elec2-001'],
  nextLesson: 'capacitive-reactance',

  hook: {
    question: "A 120V RMS, 60Hz source drives a series circuit: R = 100Ω, L = 100mH. Without phasors, finding the current requires solving a differential equation. With phasors, it's Ohm's Law applied to complex numbers. What is the current magnitude and phase angle?",
    realWorldContext: "Before phasors (Steinmetz, 1893), AC circuit analysis required solving systems of differential equations for every calculation. Steinmetz realized that all AC quantities at the same frequency have the same ωt dependence — it cancels out. What remains are amplitude ratios and phase differences: exactly what complex number algebra handles. The complex number j (= √-1) in electrical engineering is a rotation operator: multiplying by j rotates a phasor 90° counterclockwise. This is why inductors have impedance jωL (voltage leads current by 90°) and capacitors have 1/(jωC) (current leads voltage by 90°).",
  },

  mentalModel: [
    "**A phasor is a frozen snapshot of rotation.** Imagine a vector rotating counterclockwise at ω rad/s. The projection of that vector onto the vertical axis is the instantaneous sine wave. A phasor is that vector frozen at t=0, described by its length (amplitude) and angle (phase). All the physics happens at the same ω, so we don't need to track the rotation — just the relative lengths and angles.",
    "**j means 'rotate 90°'.** The complex number j = √-1 has a concrete geometric meaning: multiplying any phasor by j rotates it 90° counterclockwise (leading). Multiplying by −j rotates 90° clockwise (lagging). Inductors: v = L × dI/dt → in phasors, differentiating sin(ωt) gives ω cos(ωt) = ω sin(ωt + 90°), which is multiplication by jω. So Z_L = jωL.",
    "**Polar and rectangular forms are the same phasor.** Z = R + jX = |Z|∠φ where |Z| = √(R² + X²) and φ = arctan(X/R). Use rectangular form for adding impedances. Use polar form for multiplication/division (magnitudes multiply, angles add). Real instruments measure magnitudes (voltmeter reads |V|). The angle φ is measured with a power analyzer or oscilloscope.",
  ],

  intuition: {
    prose: [
      "**From differential equations to algebra.** In time domain: v = L × dI/dt is a differential equation. In phasor domain: V = jωL × I is simple multiplication. KVL in phasors: V_s = V_R + V_L = IR + IjωL = I(R + jωL) = I × Z. Ohm's Law works — just with complex Z instead of real R. The entire machinery of DC circuit analysis (voltage dividers, KVL, KCL, superposition, Thévenin) carries over to AC with phasors.",
      "**ELI the ICEman.** For an inductor (L): E (voltage) Leads I (current). Phasor V_L = jωL × I — the j puts V 90° ahead of I. For a capacitor (C): I Leads E (voltage). Phasor I_C = jωC × V_C — the j puts I 90° ahead of V. This mnemonic is memorized by every electrical engineer: ELI (E leads I in L) the ICEman (I leads E in C).",
      "**Converting between forms.** Polar → Rectangular: Z = |Z|∠φ → R + jX where R = |Z|cosφ, X = |Z|sinφ. Rectangular → Polar: R + jX → |Z|∠φ where |Z| = √(R² + X²), φ = arctan(X/R). Addition: use rectangular. Multiplication/division: use polar. For a series circuit, add impedances in rectangular form. For a parallel circuit, convert to admittances (Y = 1/Z), add, convert back.",
      "**Phase angle in practice.** A phase angle of −36.9° means current lags voltage by 36.9° — the circuit is inductive (net inductive reactance). Power factor = cos(−36.9°) = 0.8. At 120V, 10A, PF=0.8: apparent power S = 1200VA, real power P = 960W, reactive power Q = 720VAr. The utility must supply 1200VA to deliver 960W of real work. That's why utilities care about PF.",
    ],
    callouts: [
      {
        type: 'definition',
        title: 'Phasor Notation',
        body: "**Time domain → Phasor domain:**\n$$v(t) = V_m\\cos(\\omega t + \\phi) \\Longleftrightarrow \\mathbf{V} = V_m \\angle\\phi$$\n\n**Forms:**\n- Polar: $V_m \\angle\\phi$\n- Rectangular: $V_m\\cos\\phi + jV_m\\sin\\phi$\n- Euler: $V_m e^{j\\phi}$\n\n**Conversion:**\n$$|Z| = \\sqrt{R^2 + X^2} \\qquad \\phi = \\arctan\\!\\left(\\frac{X}{R}\\right)$$\n$$R = |Z|\\cos\\phi \\qquad X = |Z|\\sin\\phi$$",
      },
      {
        type: 'theorem',
        title: 'AC Impedances as Phasors',
        body: "| Element | Time domain | Phasor impedance |\n|---|---|---|\n| Resistor R | V = IR | Z_R = R |\n| Inductor L | V = L dI/dt | Z_L = jωL = jX_L |\n| Capacitor C | I = C dV/dt | Z_C = 1/(jωC) = −jX_C |\n\nwhere X_L = ωL and X_C = 1/(ωC) are the **reactances** (positive real numbers).\n\n**Series combination:** Z = Z₁ + Z₂ + … (add in rectangular)\n**Parallel combination:** 1/Z = 1/Z₁ + 1/Z₂ + …",
      },
      {
        type: 'insight',
        title: 'Why j = √−1 Works for Rotating Vectors',
        body: "Euler's formula: $e^{j\\theta} = \\cos\\theta + j\\sin\\theta$\n\nMultiplying any complex number by $e^{j90°} = j$:\n- Rotates it 90° counterclockwise\n- Increases phase by 90° (leads)\n\nDifferentiating $A e^{j\\omega t}$ gives $j\\omega \\cdot A e^{j\\omega t}$ — a multiplication by $j\\omega$.\n\nThis is why:\n- $V_L = j\\omega L \\cdot I$ (differentiation of current → inductor voltage leads by 90°)\n- $I_C = j\\omega C \\cdot V$ (differentiation of voltage → capacitor current leads by 90°)\n\nThe complex exponential makes the calculus disappear into multiplication.",
      },
      {
        type: 'procedure',
        title: 'Series RL Phasor Solution',
        body: "**Given:** Vs = 120V RMS, f = 60Hz, R = 100Ω, L = 100mH\n\n1. ω = 2π × 60 = 377 rad/s\n2. Z_L = jωL = j × 377 × 0.1 = j37.7Ω\n3. Z_total = R + jX_L = 100 + j37.7Ω\n4. |Z| = √(100² + 37.7²) = √(10000 + 1421) = 106.9Ω\n5. φ = arctan(37.7/100) = +20.7° (current lags voltage)\n6. I = Vs/|Z| = 120/106.9 = 1.12A RMS\n7. V_R = I × R = 112V;  V_L = I × X_L = 42.3V\n8. Check: √(112² + 42.3²) = √(12544 + 1789) = √14333 ≈ 120V ✓\n   (Phasor sum, not algebraic sum — voltages are 90° apart)",
      },
    ],
    visualizations: [
      {
        id: 'PhasorViz',
        title: 'Phasor Diagram — Phase Relationships',
        mathBridge: "Select R: V and I phasors overlap (0° phase). Select L: V phasor is 90° ahead of I (ELI). Select C: I is 90° ahead of V (ICE). Watch the time-domain waveforms — the time delay between the two sine waves equals the phase angle. Select RLC: drag φ to intermediate values and watch both representations update simultaneously.",
      },
    ],
  },

  math: {
    prose: [
      "**Phasor division: finding current from impedance.** If V = 120∠0° and Z = 100 + j37.7 = 106.9∠20.7°:\n\n$$I = \\frac{V}{Z} = \\frac{120\\angle 0°}{106.9\\angle 20.7°} = \\frac{120}{106.9}\\angle(0° - 20.7°) = 1.12\\angle{-20.7°}$$\n\nMagnitude divides; angle subtracts. The negative angle means current lags voltage by 20.7°. Verify power: P = |V||I|cos(φ) = 120 × 1.12 × cos(20.7°) = 125.7W. Also P = I²R = 1.12² × 100 = 125.4W ✓",
    ],
    callouts: [
      {
        type: 'procedure',
        title: 'Parallel Impedance via Admittance',
        body: "For parallel branches with Z₁ and Z₂:\n\n$$Y_{total} = Y_1 + Y_2 \\text{ where } Y = \\frac{1}{Z} = G + jB$$\n\nG = conductance (1/R), B = susceptance (−1/X_L or +1/X_C)\n\nExample: R=100Ω ∥ L(X_L=37.7Ω) at 60Hz:\n$$Y_R = 0.01 + j0 \\quad Y_L = 0 - j\\frac{1}{37.7} = 0 - j0.0265$$\n$$Y_{total} = 0.01 - j0.0265 \\quad |Y| = \\sqrt{0.01^2 + 0.0265^2} = 0.0283$$\n$$Z_{parallel} = 1/0.0283 = 35.4\\Omega$$",
      },
    ],
  },
};
