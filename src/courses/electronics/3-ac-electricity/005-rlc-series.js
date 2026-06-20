export default {
  id: 'elec2-005',
  slug: 'rlc-series',
  chapter: 'elec2',
  order: 5,
  title: 'Series RLC Circuits — Impedance, Phase, and AC Ohm\'s Law',
  subtitle: 'How resistance, inductive reactance, and capacitive reactance combine to form the impedance triangle.',
  tags: ['series RLC', 'impedance', 'phase angle', 'AC Ohm\'s law', 'voltage divider', 'impedance triangle'],
  aliases: 'series RLC circuit impedance Z phase angle AC Ohms law phasor voltage divider inductive capacitive',
  timeToComplete: 28,
  coreConcept: "In a series RLC circuit, impedance Z = R + j(XL − XC) = √(R² + (XL−XC)²) ∠ arctan((XL−XC)/R). AC Ohm's Law: I = Vs/|Z|, phase angle φ = arctan((XL−XC)/R). Voltage divider still works — but with phasor (complex) quantities. The voltage across R, L, and C don't add algebraically — they add as phasors. At resonance, XL = XC, net reactance = 0, and Z = R.",
  prerequisites: ['elec2-003', 'elec2-004'],
  nextLesson: 'rlc-parallel',

  hook: {
    question: "A 480V, 60Hz single-phase motor has winding resistance R = 5Ω and winding inductance L = 20mH. What current does it draw? What is the power factor? What is the reactive power demand? How does this change if you add a 200μF power factor correction capacitor in series?",
    realWorldContext: "Real motor windings are RL circuits. At 60Hz: XL = 2π×60×0.02 = 7.54Ω. Z = √(5² + 7.54²) = 9.05Ω. I = 480/9.05 = 53A. PF = cos(arctan(7.54/5)) = cos(56.5°) = 0.55 lagging. Real power P = 480×53×0.55 = 14kW. Reactive power Q = 480×53×0.835 = 21.2kVAr. Adding 200μF: XC = 13.3Ω. Net X = XL − XC = 7.54 − 13.3 = −5.76Ω (now capacitive — overcorrected). A smaller capacitor (say 100μF, XC = 26.5Ω) brings X = 7.54−26.5 = −19Ω... still overcorrected. For exact unity PF: XC = XL = 7.54Ω → C = 1/(2π×60×7.54) = 352μF. With C=352μF: Z = R = 5Ω. I = 96A. But P = 96²×5 = 46kW — the motor is not drawing 46kW; this analysis is wrong because the motor speed and back-EMF changed. Series PF correction on motors is non-trivial — parallel is standard.",
  },

  mentalModel: [
    "**Impedance triangle: the Pythagorean theorem of AC.** In a series circuit: V_R = IR (in phase with I), V_L = jXL × I (90° ahead of I), V_C = −jXC × I (90° behind I). The total voltage V = I × (R + j(XL−XC)). The total impedance magnitude |Z| = √(R² + (XL−XC)²) — a right triangle where R is horizontal and net reactance X = XL−XC is vertical. The hypotenuse is |Z|. This is the impedance triangle.",
    "**Net reactance determines circuit character.** If XL > XC, net X is positive (inductive), φ > 0°, voltage leads current. If XC > XL, net X is negative (capacitive), φ < 0°, current leads voltage. If XL = XC, net X = 0, circuit is purely resistive at that frequency — this is resonance. The sign of X tells you whether to add more capacitance or inductance for PF correction.",
    "**Voltages in a series RLC add as phasors, not numbers.** V_R + V_L + V_C = V_s is a phasor equation. The magnitudes don't add algebraically. You might measure V_R = 100V, V_L = 80V, V_C = 50V, yet V_s = 101V (not 230V). This surprises technicians because they expect the sum of component voltages to equal supply voltage — in DC that's true, but in AC you must account for phase. V_L and V_C point in opposite directions, partly canceling.",
  ],

  intuition: {
    prose: [
      "**Series voltage divider with phasors.** In a series RLC, each element's voltage is I × Z_element. For R: V_R = I × R (in phase with I). For L: V_L = I × jXL (leads I by 90°). For C: V_C = I × (−jXC) (lags I by 90°). The component voltages are 90° apart from each other and sum by vector addition to give V_s. This is exactly the impedance triangle scaled by I.",
      "**Practical measurement: series circuit with motor.** A technician measures V = 480V at the supply and V_R = 266V across a sense resistor (measuring current). V_L = 400V across the motor winding. Phasor KVL: V_source² = V_R² + V_L² only if perfectly inductive. More precisely: V_s = V_R + j×V_L, |V_s| = √(266² + 400²) = 480V ✓. Current = 266/R. This confirms the measurement is consistent — a quick sanity check using phasor math.",
      "**Filter design with series RLC.** A series RLC bandpass filter has its output across R. The voltage across R peaks at resonance (Z is minimum, current is maximum, V_R = I × R = (Vs/R) × R = Vs). At frequencies far from resonance, Z increases, current decreases, V_R drops. The bandwidth is determined by Q = XL₀/R = f₀/BW — high Q gives narrow bandwidth. This is how radio tuners select a single station from the entire frequency spectrum.",
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'Series RLC Impedance',
        body: "$$Z = R + jX = R + j(X_L - X_C)$$\n\n$$|Z| = \\sqrt{R^2 + (X_L - X_C)^2}$$\n\n$$\\phi = \\arctan\\!\\left(\\frac{X_L - X_C}{R}\\right)$$\n\n**AC Ohm's Law:**\n$$I = \\frac{V_s}{|Z|} \\qquad I_{phasor} = \\frac{V_s}{Z}$$\n\n**Component voltages:**\n$$V_R = IR \\quad V_L = IX_L \\quad V_C = IX_C$$\n\n**Phasor KVL:** $V_s^2 = V_R^2 + (V_L - V_C)^2$",
      },
      {
        type: 'procedure',
        title: 'Series RLC Circuit Analysis',
        body: "1. Find XL = 2πfL and XC = 1/(2πfC)\n2. Calculate net reactance X = XL − XC\n3. Calculate |Z| = √(R² + X²)\n4. Calculate phase angle φ = arctan(X/R)\n5. Current magnitude I = Vs/|Z|\n6. Component voltages: VR = IR, VL = IXL, VC = IXC\n7. Real power P = I²R = Vs × I × cos(φ)\n8. Reactive power Q = I²X = Vs × I × sin(φ)\n9. Apparent power S = Vs × I = √(P² + Q²)\n\nVerify: VR² + (VL−VC)² = Vs² ✓",
      },
      {
        type: 'insight',
        title: 'The Voltmeter Paradox',
        body: "In a series RLC circuit, it is possible for individual component voltages to exceed the source voltage. At resonance, V_L = V_C = I × XL₀. If Q = XL₀/R = 10, then V_L = V_C = 10 × Vs. A 120V source can produce 1200V across L and C!\n\nThis voltage magnification is used in: RF filters (high Q for selectivity), induction heating (resonant tank voltage), Tesla coils. In industrial power systems, unintended resonance between cable capacitance and transformer inductance can create dangerous overvoltages — this is called ferroresonance.",
      },
      {
        type: 'warning',
        title: 'Series vs. Parallel Resonance in Real Circuits',
        body: "Industrial power systems are never purely series or purely parallel — they contain both. Resonance can occur unintentionally when:\n- Capacitor banks (for PF correction) resonate with transformer leakage inductance\n- Cable capacitance resonates with motor winding inductance\n- Harmonic currents from VFDs excite resonant frequencies\n\nResonant frequencies f_r = 1/(2π√LC). If a 5th harmonic (300Hz) coincides with a capacitor-transformer resonance, harmonic voltages can amplify 10–100×. This is why harmonic analysis is required before installing large capacitor banks in industrial plants.",
      },
    ],
    visualizations: [
      {
        id: 'ImpedanceViz',
        title: 'Series RLC Impedance Triangle',
        mathBridge: "Select Series mode. Adjust R, L, C, and f. Watch the impedance triangle update: when XL > XC the vertical leg points up (inductive), when XC > XL it points down (capacitive). When they're equal — resonance — the triangle collapses to just the horizontal R leg. φ = 0. Try reducing R to see high-Q behavior: Z → R minimum, angles become ±90° far from resonance.",
      },
    ],
  },

  math: {
    prose: [
      "**Voltage phasor diagram in series RLC.** With I = I∠0° as reference phasor:\n\n$$V_R = IR\\angle 0° \\quad V_L = IX_L\\angle +90° \\quad V_C = IX_C\\angle -90°$$\n\n$$V_s = V_R + j(V_L - V_C) = I(R + jX)$$\n\n$$|V_s| = I\\sqrt{R^2 + X^2} = I|Z| \\checkmark$$\n\nThe angle between V_s and I is φ = arctan(X/R). When X>0 (inductive): V_s leads I. When X<0 (capacitive): V_s lags I (i.e., I leads V_s).",
    ],
    callouts: [
      {
        type: 'procedure',
        title: 'Power Analysis of Series RLC',
        body: "Given: Vs=120V, R=100Ω, XL=150Ω, XC=80Ω (at 60Hz)\n\n|Z| = √(100² + (150−80)²) = √(10000 + 4900) = 122.1Ω\nφ = arctan(70/100) = +34.99° ≈ 35° (inductive)\nI = 120/122.1 = 0.983A\n\nReal power:    P = I²R = 0.966 × 100 = 96.6W\nReactive power: Q = I²X = 0.966 × 70 = 67.6VAr (inductive)\nApparent power: S = √(P²+Q²) = √(9331+4570) = 117.9VA\nPF = P/S = 96.6/117.9 = 0.819 lagging",
      },
    ],
  },
  quiz: [
    {
      id: 'q1',
      type: 'choice',
      text: 'A series RLC circuit has XL = 80Ω and XC = 50Ω at 60Hz. What is the total impedance magnitude if R = 60Ω?',
      options: [
        '190Ω — add R, XL, and XC directly',
        'About 67.1Ω — |Z| = √(R² + (XL−XC)²) = √(3600 + 900) = 67.1Ω',
        '60Ω — reactances cancel and leave only resistance',
      ],
      correct: 1,
    },
    {
      id: 'q2',
      type: 'choice',
      text: 'In a series RLC circuit you measure V_R = 100V, V_L = 120V, and V_C = 80V. What is the supply voltage?',
      options: [
        '300V — the component voltages must sum to the supply voltage in series circuits',
        '180V — V_L and V_C partially cancel so only add the larger reactance to V_R',
        'About 108V — phasor sum: V_s = √(V_R² + (V_L − V_C)²) = √(10000 + 1600) ≈ 108V',
      ],
      correct: 2,
    },
    {
      id: 'q3',
      type: 'choice',
      text: 'In a series RLC circuit, when is it possible for voltage across the inductor to exceed the supply voltage?',
      options: [
        'It is never possible — component voltages cannot exceed supply voltage by conservation of energy',
        'When the circuit is near resonance, high Q causes V_L (and V_C) to be Q times the supply voltage',
        'Only when XL > XC, in which case the capacitor reduces the apparent supply voltage',
      ],
      correct: 1,
    },
    {
      id: 'q4',
      type: 'choice',
      text: 'If XL = XC in a series RLC circuit, what is the phase angle of the current relative to the voltage?',
      options: [
        '90° — the reactive components dominate when they are equal',
        '0° — net reactance is zero so Z = R (purely resistive), meaning current is in phase with voltage',
        '45° — the transition between capacitive and inductive behavior',
      ],
      correct: 1,
    },
  ],
};
