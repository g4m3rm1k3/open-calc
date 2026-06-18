export default {
  id: 'elec2-003',
  slug: 'capacitive-reactance',
  chapter: 'elec2',
  order: 3,
  title: 'Capacitive Reactance — XC and the Frequency Response of Capacitors',
  subtitle: 'Why capacitors pass high frequencies and block DC — and how to calculate XC = 1/(2πfC).',
  tags: ['capacitive reactance', 'XC', 'frequency response', 'AC capacitor', 'high-pass', 'coupling', 'bypass'],
  aliases: 'capacitive reactance XC frequency capacitor AC impedance coupling capacitor bypass capacitor high pass filter',
  timeToComplete: 22,
  coreConcept: "Capacitive reactance XC = 1/(2πfC) = 1/(ωC). It is frequency-dependent: XC decreases as frequency increases. At DC (f=0), XC = ∞ — open circuit. At high frequency, XC → 0 — short circuit. The phasor impedance is Z_C = −jXC, meaning current leads voltage by 90°. In a series RC circuit, the capacitor drops more voltage at low frequencies and less at high frequencies — the basis of all RC filters.",
  prerequisites: ['elec2-002', 'elec1-005'],
  nextLesson: 'inductive-reactance',

  hook: {
    question: "A PLC analog input has a 4–20mA signal from a sensor. The wiring picks up 60Hz interference from nearby power cables. You install a 10μF capacitor from the signal wire to ground. At 60Hz, what is XC? At the signal frequency of 10Hz, what is XC? Why does this protect the PLC input?",
    realWorldContext: "This is a bypass capacitor application. At 60Hz: XC = 1/(2π × 60 × 10×10⁻⁶) = 265Ω. At 10Hz: XC = 1/(2π × 10 × 10×10⁻⁶) = 1592Ω. The capacitor has much lower impedance at 60Hz than at 10Hz — it diverts the 60Hz noise to ground (bypasses it) while leaving the 10Hz signal largely unaffected. PLC input resistance is typically 250Ω; a 265Ω bypass at 60Hz provides significant noise attenuation. This is textbook capacitive reactance applied to industrial noise filtering.",
  },

  mentalModel: [
    "**Capacitors react to change, not to steady state.** A capacitor passes current only when voltage across it is changing. The faster the change, the more current flows: I = C × dV/dt. At DC (no change), no current flows — open circuit. At high frequency (fast change), lots of current flows — low impedance. This is the physical reason XC decreases with frequency.",
    "**XC is a frequency dial.** Think of a capacitor as a variable resistor whose 'resistance' is controlled by frequency: XC = 1/(ωC). Doubling frequency halves XC. Doubling capacitance halves XC. Smaller capacitors have higher XC (harder to pass current). This is why small coupling capacitors (nF) block audio frequencies but large filter capacitors (mF) are needed for power-frequency bypass.",
    "**Current leads voltage in a capacitor.** When AC voltage is rising (positive dV/dt), capacitor current is positive and maximum. When voltage is at its peak, dV/dt = 0, and current is zero. Current peaks 90° before voltage — current leads. Phasor: Z_C = −jXC (the minus j means 90° lag for Z, or 90° lead for I relative to V).",
  ],

  intuition: {
    prose: [
      "**Series RC: voltage divider with frequency.** V_out across C in series with R: V_out/V_in = XC/√(R² + XC²). As f increases, XC decreases, and V_out/V_in decreases. This is a low-pass filter — passes DC and low frequencies, attenuates high frequencies. The corner frequency f_c = 1/(2πRC) is where V_out = V_in/√2 = −3dB. For a high-pass filter, take V_out across R instead.",
      "**Coupling capacitor design.** An audio coupling capacitor must pass the desired signal frequencies but block DC. For audio (20Hz–20kHz), choose XC at 20Hz ≪ load resistance. If R_load = 10kΩ, choose XC(20Hz) < 1kΩ: C > 1/(2π × 20 × 1000) = 8μF. Standard choice: 10μF. At 20Hz: XC = 797Ω (−7.2dB attenuation at lowest audio frequency). At 1kHz: XC = 16Ω (essentially a short). At 20kHz: XC = 0.8Ω.",
      "**Bypass capacitor sizing.** A bypass capacitor from a supply rail to ground eliminates AC noise on the DC supply. Electrolytic capacitors (100–470μF) bypass low-frequency ripple (120Hz from bridge rectifier). Ceramic capacitors (0.1μF) bypass high-frequency switching noise (MHz range). Always use both in parallel — large electrolytic has high inductance at high frequencies, small ceramic has low reactance at high frequencies. This combination is on every PCB power supply rail.",
      "**Power factor capacitors.** Large industrial capacitor banks are installed to correct poor power factor caused by inductive motor loads. At 60Hz, a 100μF capacitor has XC = 26.5Ω. At 480V: I_C = 480/26.5 = 18.1A of capacitive reactive current — this cancels the inductive reactive current from motors, reducing the total current demand from the utility.",
    ],
    callouts: [
      {
        type: 'definition',
        title: 'Capacitive Reactance',
        body: "$$X_C = \\frac{1}{\\omega C} = \\frac{1}{2\\pi f C}$$\n\nUnit: Ohms (Ω) — like resistance, but frequency-dependent.\n\n| Freq | C=1μF | C=10μF | C=100μF |\n|---|---|---|---|\n| 10 Hz | 15.9kΩ | 1.59kΩ | 159Ω |\n| 60 Hz | 2.65kΩ | 265Ω | 26.5Ω |\n| 1 kHz | 159Ω | 15.9Ω | 1.59Ω |\n| 10 kHz | 15.9Ω | 1.59Ω | 0.16Ω |\n\nImportant: XC increases as f decreases (opposite of resistors and inductors).",
      },
      {
        type: 'theorem',
        title: 'RC Low-Pass and High-Pass Filters',
        body: "**Low-pass** (output across C):\n$$\\frac{V_{out}}{V_{in}} = \\frac{X_C}{\\sqrt{R^2 + X_C^2}} = \\frac{1}{\\sqrt{1+(fR/f_c)^2}}$$\n\n**High-pass** (output across R):\n$$\\frac{V_{out}}{V_{in}} = \\frac{R}{\\sqrt{R^2 + X_C^2}} = \\frac{f/f_c}{\\sqrt{1+(f/f_c)^2}}$$\n\n**Corner frequency (−3dB):**\n$$f_c = \\frac{1}{2\\pi RC}$$\n\nAt f_c: output = 70.7% of input, phase shift = 45°.",
      },
      {
        type: 'procedure',
        title: 'Capacitor Coupling/Bypass Design',
        body: "**Coupling capacitor** (must pass f_min, block DC):\n1. Choose XC(f_min) ≤ R_load/10 for minimal attenuation\n2. C ≥ 1/(2π × f_min × R_load/10)\n3. Round up to nearest standard value\n\n**Bypass capacitor** (noise rejection):\n1. For 60Hz ripple: C = I_load/(2×120×ΔV) — same as rectifier filter formula\n2. For switching noise (MHz): use 100nF ceramic (XC < 1Ω at 1MHz)\n3. Place ceramic capacitor as close to IC power pin as possible (PCB layout matters — lead inductance adds reactance)",
      },
      {
        type: 'insight',
        title: 'XC and Sensor Cable Length',
        body: "Long sensor cables have significant capacitance to ground (typically 100–200pF/meter). A 10-meter cable may add 1.5nF of parasitic capacitance. For a sensor output impedance of 10kΩ:\nf_c = 1/(2π × 10000 × 1.5×10⁻⁹) = 10.6kHz\n\nAbove 10.6kHz, the sensor signal is attenuated. This limits the bandwidth of long-cable analog transmitters. For 4–20mA current loops (low-impedance output), this is not an issue — current drives are designed for high-capacitance cables. For high-impedance voltage outputs, cable capacitance limits signal bandwidth.",
      },
    ],
    visualizations: [
      {
        id: 'ImpedanceViz',
        title: 'Capacitive Reactance — Frequency Dependence',
        mathBridge: "Set R=0, L=0, vary C and f. Watch XC = 1/(2πfC) change. At low frequency: XC is large (tall vertical leg in the triangle), current is small. At high frequency: XC shrinks, current increases. The phase angle approaches −90° when XC >> R. Add R: see the RLC impedance triangle form.",
      },
    ],
  },

  math: {
    prose: [
      "**Power in a capacitor.** For v_C(t) = Vm cos(ωt) and i_C(t) = ωCVm sin(ωt) = Im sin(ωt):\n\n$$p(t) = v_C(t) \\cdot i_C(t) = V_m I_m \\cos(\\omega t)\\sin(\\omega t) = \\frac{V_m I_m}{2}\\sin(2\\omega t)$$\n\nThe average of sin(2ωt) over a full cycle = 0. Therefore, average power in an ideal capacitor = 0. The capacitor stores energy during one quarter-cycle and returns it during the next. This is pure reactive power: Q = V_rms × I_rms = V²_rms/(XC) (VAr). Real industrial capacitors have a small ESR (equivalent series resistance) that dissipates real power — specified as the dissipation factor (DF) or loss tangent.",
    ],
    callouts: [
      {
        type: 'procedure',
        title: 'Power Factor Correction Capacitor Bank',
        body: "For a load: P = 100kW, PF = 0.8 lagging (φ = 36.9°)\n\n1. S = P/PF = 125kVA\n2. Q = S × sin(36.9°) = 75kVAr (inductive)\n3. To correct to PF = 0.95: Q_target = P × tan(arccos(0.95)) = 32.9kVAr\n4. Q_C needed = 75 − 32.9 = 42.1kVAr\n5. For 480V 3-phase: C = Q_C/(3 × ω × V²_LN) = 42100/(3 × 377 × 277²) = 154μF per phase\n6. Capacitor bank kVAr rating = 42.1kVAr, 480V, 60Hz",
      },
    ],
  },
};
