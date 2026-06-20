export default {
  id: 'elec2-007',
  slug: 'resonance',
  chapter: 'elec2',
  order: 7,
  title: 'Resonance — Q Factor, Bandwidth, and Frequency Selection',
  subtitle: 'How resonant circuits select frequencies, amplify voltages, and form the core of every tuned electronic system.',
  tags: ['resonance', 'Q factor', 'bandwidth', 'tank circuit', 'series resonance', 'parallel resonance', 'filter'],
  aliases: 'resonance Q factor bandwidth tank circuit series parallel tuned filter selectivity LC resonant frequency',
  timeToComplete: 28,
  coreConcept: "At resonance, XL = XC, and f₀ = 1/(2π√LC). For series RLC: impedance is minimum (Z = R), current is maximum. For parallel LC: impedance is maximum, source current is minimum. Q factor Q = f₀/BW = (1/R)√(L/C) determines selectivity. High Q → narrow bandwidth, high voltage/current magnification. Low Q → wide bandwidth, less selective.",
  prerequisites: ['elec2-005', 'elec2-006'],
  nextLesson: 'ac-power',

  hook: {
    question: "A radio receiver needs to select 101.1 MHz FM from a crowded band with stations at 100.9, 101.1, and 101.3 MHz — only 200kHz apart. What Q factor does the tuned circuit need? If C = 10pF, what is L? What happens to the signal at 100.9 MHz?",
    realWorldContext: "Bandwidth required: 200kHz (±100kHz either side). Q = f₀/BW = 101.1MHz/0.2MHz = 505. For C=10pF: L = 1/(4π²f₀²C) = 1/(4π² × (101.1×10⁶)² × 10×10⁻¹²) = 24.8nH. The LC tank achieves the needed selectivity. At 100.9MHz (Δf = 200kHz = BW): the signal is down −3dB (70.7%). At 200kHz off (2×BW): −6dB. For professional receivers, Q must be 500–2000 to prevent adjacent-channel interference. Industrial applications use resonance for induction heating, RF sensors, and wireless power transfer.",
  },

  mentalModel: [
    "**Resonance: the frequency where XL and XC balance exactly.** Every LC combination has one frequency where inductive reactance equals capacitive reactance. At that frequency, the two reactances cancel — the circuit 'acts resistive'. For series: Z is minimum (current maximizes). For parallel: Z is maximum (current from source minimizes, but circulating tank current can be huge). Think of a pendulum at its natural frequency — small driving force creates large oscillation amplitude.",
    "**Q factor: quality of resonance.** Q = 2π × (peak energy stored / energy dissipated per cycle). High Q means energy stored >> energy lost per cycle — the resonance is sharp and selective. Low Q means energy is lost quickly — broad, flat response. For series RLC: Q = XL₀/R = √(L/C)/R. For parallel: Q = R/XL₀ = R√(C/L). Q is dimensionless but determines everything: voltage magnification (series), current magnification (parallel), bandwidth (BW = f₀/Q), and number of cycles for oscillations to decay.",
    "**Bandwidth: the −3dB frequency range.** Bandwidth BW = f₀/Q (Hz). The response is above −3dB between f_low = f₀ − BW/2 and f_high = f₀ + BW/2 (approximate for high Q). Narrow bandwidth = high Q = good selectivity = can pick out one frequency from a crowded spectrum. Wide bandwidth = low Q = accepts a range of frequencies — used in audio filters where you want a broad frequency range, not a single tone.",
  ],

  intuition: {
    prose: [
      "**Series resonance: maximum current, maximum component voltages.** At f₀: Z = R (minimum). I = Vs/R (maximum). V_L = I × XL₀ = Vs × Q. V_C = I × XC₀ = Vs × Q. Both V_L and V_C are Q times the source voltage — equal in magnitude but 180° apart. They cancel each other, leaving V_source = V_R only. Series resonance is used in: bandpass filters (output across R), induction heaters (high-Q tank drives current through workpiece), Tesla coils (Q=50–200, produces spectacular voltage amplification).",
      "**Parallel resonance: minimum source current, energy circulation.** At f₀: admittance Y = G = 1/R (minimum). Source current I_source = V/R (minimum — the load looks like a pure resistance R). But internal to the tank: I_tank = I_source × Q. All the energy is circulating between L and C, re-supplied only for resistive losses. A parallel tank with Q=100 draws 1A from the source while 100A circulates internally. Used in: RF power amplifier loads (high-impedance load matches transistor output), oscillator frequency-setting, notch filters (high impedance at one frequency blocks that frequency).",
      "**Bandwidth and Q in filter design.** For a bandpass filter centered at f₀ = 1kHz with BW = 100Hz: Q = 1000/100 = 10. For a narrower filter (BW = 10Hz): Q = 100. Achieving high Q requires low resistance — low-loss components (high-Q inductors, low-ESR capacitors). At RF frequencies, air-core inductors and NPO/C0G ceramic capacitors achieve Q = 200–500. At power frequencies, losses from core materials and wire resistance limit Q to 10–50.",
      "**Stagger tuning and flatness.** Multiple resonant circuits can be cascaded with slightly different f₀ values ('stagger-tuned') to create a flat-topped, steep-sided bandpass response. A single tuned circuit gives a rounded peak (Butterworth response). Two stagger-tuned circuits give a flatter top. This is how intermediate frequency (IF) strips in AM/FM radios are designed for consistent audio bandwidth across the IF band.",
    ],
    callouts: [
      {
        type: 'definition',
        title: 'Resonance Equations',
        body: "**Resonant frequency:**\n$$f_0 = \\frac{1}{2\\pi\\sqrt{LC}}$$\n\n**Q factor — series:**\n$$Q = \\frac{X_{L_0}}{R} = \\frac{1}{R}\\sqrt{\\frac{L}{C}} = \\frac{f_0}{BW}$$\n\n**Q factor — parallel:**\n$$Q = \\frac{R}{X_{L_0}} = R\\sqrt{\\frac{C}{L}}$$\n\n**Bandwidth:**\n$$BW = f_{high} - f_{low} = \\frac{f_0}{Q} = \\frac{R}{2\\pi L}$$\n\n**Voltage magnification (series):** $V_L = V_C = Q \\times V_s$ at resonance",
      },
      {
        type: 'procedure',
        title: 'Resonant Circuit Design',
        body: "**Given:** f₀, Q, impedance level Z₀ (= √(L/C))\n\n1. Choose Z₀ based on source/load impedance (match for max power transfer)\n2. L = Z₀/(2πf₀) = Q × R / (2πf₀)\n3. C = 1/(Z₀ × 2πf₀) = 1/(Q × R × 2πf₀)\n4. R is the total series resistance (inductor DCR + source resistance + load resistance)\n5. Q = Z₀/R — verify Q meets selectivity requirement\n\n**Example:** f₀=1MHz, Q=50, Z₀=1kΩ:\nL = 1000/(2π×10⁶) = 159μH\nC = 1/(1000×2π×10⁶) = 159pF\nRequired R = Z₀/Q = 1000/50 = 20Ω",
      },
      {
        type: 'insight',
        title: 'Ferroresonance — The Dangerous Resonance',
        body: "Ferroresonance occurs when a transformer (nonlinear inductor) resonates with circuit capacitance. Unlike linear resonance, ferroresonance can:\n- Jump between multiple stable operating points\n- Produce sustained overvoltages (2–5× normal)\n- Generate high-amplitude harmonics\n- Damage equipment and cause fires\n\nTriggers: switching a transformer with light load, long unloaded cable on a transformer, single-phase switching on a three-phase system.\n\nPrevention: never leave transformer secondary unloaded with long cable runs; use damping resistors on vulnerable systems; analyze capacitance before installing VFDs or cable runs near transformers.",
      },
    ],
    visualizations: [
      {
        id: 'ResonanceViz',
        title: 'Resonance Explorer — Frequency Response',
        mathBridge: "Adjust R, L, C. Watch the resonance peak move (f₀ = 1/2π√LC). Increase R: peak broadens (lower Q, wider bandwidth). Decrease R: peak sharpens (higher Q, narrower bandwidth). The −3dB line shows where bandwidth is measured. Switch to Parallel: same f₀ but the peak now shows maximum impedance instead of maximum current. Compare Q = 2 vs Q = 50 — same f₀, completely different selectivity.",
      },
    ],
  },

  math: {
    prose: [
      "**Frequency response near resonance.** For series RLC, normalized response H(f) = I(f)/I_max:\n\n$$|H(f)| = \\frac{1}{\\sqrt{1 + Q^2\\left(\\dfrac{f}{f_0} - \\dfrac{f_0}{f}\\right)^2}}$$\n\nAt f = f₀: H = 1 (maximum). At f = f₀ ± BW/2: H = 1/√2 (−3dB). Far from resonance (f >> f₀ or f << f₀): H → 0. This is the universal resonance curve — the same shape whether the resonance is mechanical, acoustic, optical, or electrical.",
    ],
    callouts: [
      {
        type: 'procedure',
        title: 'Measuring Q Factor Experimentally',
        body: "**Method 1: Bandwidth measurement**\n1. Sweep frequency through resonance, measure output amplitude\n2. Find f₀ (peak), f_low, f_high (−3dB points)\n3. Q = f₀/(f_high − f_low)\n\n**Method 2: Voltage magnification (series)**\n1. Apply V_s at resonance\n2. Measure V_C or V_L\n3. Q = V_C/V_s = V_L/V_s\n\n**Method 3: Phase shift**\n1. At f₀, phase between V and I = 0° (series) or max (parallel)\n2. Find frequencies where phase = ±45° → these are f_low, f_high\n3. Q = f₀/(f_high − f_low)",
      },
    ],
  },
  quiz: [
    {
      id: 'q1',
      type: 'choice',
      text: 'At series resonance, what happens to the impedance of a series RLC circuit?',
      options: [
        'Impedance reaches its maximum — reactive components combine to block current',
        'Impedance reaches its minimum value Z = R — XL and XC cancel, leaving only resistance',
        'Impedance becomes zero — the circuit is a short circuit at resonance',
      ],
      correct: 1,
    },
    {
      id: 'q2',
      type: 'choice',
      text: 'A series resonant circuit has Q = 50. The supply voltage is 10V. What voltage appears across the inductor at resonance?',
      options: [
        '10V — the inductor sees the same voltage as the source at resonance',
        '500V — V_L = Q × V_s = 50 × 10 = 500V at resonance',
        '0.2V — the voltage divides inversely with Q',
      ],
      correct: 1,
    },
    {
      id: 'q3',
      type: 'choice',
      text: 'An FM radio tuner needs to separate 101.1 MHz from a station 200 kHz away. What Q factor is needed?',
      options: [
        'Q = 200 — bandwidth must equal the station separation',
        'Q = 505 — Q = f₀/BW = 101.1MHz/0.2MHz = 505.5',
        'Q = 0.002 — divide bandwidth by center frequency',
      ],
      correct: 1,
    },
    {
      id: 'q4',
      type: 'choice',
      text: 'For a parallel LC tank circuit at resonance, what is the source current at minimum while large current circulates internally?',
      options: [
        'This cannot happen — current must be the same everywhere in a closed circuit',
        'At resonance, inductive and capacitive currents cancel in the source, so the source only supplies resistive losses while Q times that current circulates in the LC tank',
        'The tank circuit draws maximum source current at resonance because impedance is minimum',
      ],
      correct: 1,
    },
  ],
};
