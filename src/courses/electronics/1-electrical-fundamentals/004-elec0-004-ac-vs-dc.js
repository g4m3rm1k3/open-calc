export default {
  id: 'elec0-004',
  slug: 'ac-vs-dc',
  chapter: 'elec0',
  order: 4,
  title: 'AC vs. DC',
  subtitle: 'Why industrial machines use both — when each is appropriate, how to measure them correctly, and what RMS actually means.',
  tags: ['AC', 'DC', 'alternating current', 'direct current', 'RMS', 'frequency', 'three-phase', 'rectifier', 'transformer'],
  aliases: 'alternating direct current AC DC RMS voltage frequency Hz three-phase single-phase rectifier',
  timeToComplete: 20,
  coreConcept: 'DC voltage is constant; AC voltage alternates in a sinusoidal waveform. Industrial machines use both: 480VAC three-phase for high-power motors and drives, 120VAC single-phase for HMI and lighting, 24VDC for control circuits and I/O. RMS is the equivalent DC value that delivers the same power.',
  prerequisites: ['elec0-002'],
  nextLesson: 'switches-relays-contactors',

  hook: {
    question: "Your voltmeter reads 480V between two phases of a motor panel, but 277V between any single phase and ground. Why is one measurement higher, and why does it matter when you're wiring a drive?",
    realWorldContext: "Every machine shop has at least three voltages: 480VAC three-phase for spindle and axis drives, 120VAC for HMI panels and convenience outlets, and 24VDC for everything a PLC touches. Understanding the relationship between these systems — how they're generated, how they're converted, and how to measure them correctly — is fundamental to reading electrical prints, commissioning machines, and diagnosing power-related faults.",
  },

  mentalModel: [
    "**DC is a flat line; AC is a wave.** DC voltage stays constant over time — a battery, a DC power supply. AC voltage alternates between positive and negative peaks in a sinusoidal pattern. The rate of alternation is the frequency: 60Hz in North America means 60 complete cycles per second. Every zero crossing is a moment of no voltage at all.",
    "**RMS converts AC to an equivalent DC.** You can't just use the peak AC voltage in power calculations — the voltage is only at its peak for an instant. RMS (Root Mean Square) is the mathematical equivalent DC level that would deliver the same average power. For a perfect sine wave: V_RMS = V_peak / √2 ≈ 0.707 × V_peak. The 120V you measure from an outlet is 120V RMS — the actual peak is 170V.",
    "**Three-phase is just three single-phase AC sources at 120° offsets.** Power plants and motors use three-phase because it delivers constant power (the three waves fill in each other's zero crossings), transmits more power per conductor, and creates a rotating magnetic field directly usable by motors. Single-phase is derived from three-phase by tapping just one phase and neutral.",
  ],

  intuition: {
    prose: [
      "**Direct Current — constant flow.** DC voltage maintains a constant polarity. A 12V car battery is always +12V on one terminal, 0V (ground) on the other. DC is what you get from batteries, solar panels, and the switching power supplies inside every PLC and CNC control cabinet. It's ideal for logic circuits, sensors, and solenoids because the behavior is completely predictable — no oscillation, no zero crossings, no phase angles.",
      "**Alternating Current — the sinewave.** AC voltage reverses polarity 60 times per second (in North America; 50Hz in Europe). At any instant, the voltage is V(t) = V_peak × sin(2πft). The voltage swings from +170V to −170V in a standard 120VAC outlet, but the useful measure is the RMS value — 120V — which represents the equivalent heating power. AC is used for power distribution because it can be transformed to very high voltage (lower I²R losses over long distances) and stepped back down — something DC couldn't do efficiently before power electronics.",
      "**Why 480VAC three-phase?** Industrial machines use three-phase 480VAC for motors and drives because: more power per wire (a 10HP motor needs less current at 480V vs 240V, allowing smaller wire), the three-phase motor design is simpler and more reliable than single-phase, and the constant power delivery of three-phase (no 120Hz pulsing like single-phase rectified) means smoother operation. The 480V is the line-to-line voltage. Each phase to neutral is 480/√3 = 277V — which is why you measured 277V.",
      "**The relationship between voltages in three-phase.** In a 480V three-phase 'wye' system: each phase wire is 277V above neutral/ground, but adjacent phases are 480V apart. L1 to L2 = 480V. L1 to ground = 277V. This trips up technicians constantly. Always confirm which measurement you need: motor terminals want line-to-line (480V); grounded equipment protection is line-to-ground (277V).",
      "**Converting AC to DC — rectifiers and power supplies.** The 24VDC in your PLC cabinet comes from a switching power supply that: (1) transforms 120VAC down (or uses direct high-voltage switching), (2) rectifies it (converts AC to pulsed DC using diodes), (3) filters it (capacitors smooth the pulses), (4) regulates it (feedback control maintains 24V regardless of load). The result is stable DC. Understand this chain and you can diagnose a failed power supply: no AC input? Check fuse. AC present but no DC output? Supply failed internally.",
      "**Measuring AC correctly.** A multimeter on 'AC voltage' displays RMS. The peak voltage will be V_RMS × √2 = 1.414 × V_RMS. For 120VAC RMS: peak = 169.7V. For 480VAC: peak = 679V. This peak voltage determines insulation requirements for cables and components — a 600V-rated cable is needed for 480VAC service. Using a meter's DC setting to measure AC gives a near-zero reading (the meter sees the average, which is zero for a symmetric sine wave).",
    ],
    callouts: [
      {
        type: 'definition',
        title: 'RMS Voltage',
        body: '**RMS (Root Mean Square)** is the equivalent DC voltage that delivers the same power as the AC waveform.\n\nFor a pure sine wave:\n$$V_{\\text{RMS}} = \\frac{V_{\\text{peak}}}{\\sqrt{2}} \\approx 0.707 \\times V_{\\text{peak}}$$\n\n$$V_{\\text{peak}} = V_{\\text{RMS}} \\times \\sqrt{2} \\approx 1.414 \\times V_{\\text{RMS}}$$\n\nExamples:\n- 120V RMS outlet → 170V peak\n- 480V RMS three-phase line → 679V peak\n- 24V RMS transformer output → 34V peak (before filtering)',
      },
      {
        type: 'definition',
        title: 'Three-Phase Voltage Relationships (Wye/Star)',
        body: 'For a wye-connected three-phase system:\n\n$$V_{\\text{line-to-line}} = \\sqrt{3} \\times V_{\\text{line-to-neutral}}$$\n$$V_{\\text{line-to-neutral}} = \\frac{V_{\\text{line-to-line}}}{\\sqrt{3}} \\approx 0.577 \\times V_{\\text{line-to-line}}$$\n\nCommon industrial voltages:\n- 480V L-L → 277V L-N\n- 208V L-L → 120V L-N\n- 600V L-L → 347V L-N (Canada)\n\n**Delta systems** have no neutral and all phase voltages equal the line voltage.',
      },
      {
        type: 'insight',
        title: 'Why Your CNC Spindle Drive Has Both AC Input and DC Bus',
        body: 'A typical servo/spindle drive takes 480VAC three-phase input, rectifies it to ~680VDC (480 × √2), stores it in a large capacitor bank (the DC bus), then inverts it back to variable-frequency AC to control the motor speed. The DC bus voltage is what you\'d measure between the "+" and "−" bus terminals — always ~540–700V when powered. Touching that bus is extremely dangerous even with AC power disconnected: those capacitors store lethal energy.',
      },
      {
        type: 'warning',
        title: 'Capacitor Discharge — DC Bus Danger After Power-Off',
        body: 'After disconnecting AC power from a variable frequency drive (VFD) or servo drive, the DC bus capacitors remain charged. Most drives take 5–15 minutes to discharge to safe levels. Industrial drives have warning labels: "WAIT 5 MINUTES AFTER POWER REMOVAL BEFORE SERVICING." Never measure inside a drive with a meter or open it for repairs before the discharge period — 680VDC through your body is fatal. Wait, then verify with a meter before touching anything.',
      },
      {
        type: 'insight',
        title: 'Frequency and Motor Speed',
        body: 'AC motor speed depends on the power frequency: synchronous speed (RPM) = 120 × f / P, where f is frequency (Hz) and P is number of poles. A 4-pole motor at 60Hz runs at 1800 RPM (synchronously) or ~1750 RPM under load. This is why variable frequency drives (VFDs) control motor speed by varying the output frequency — run the drive at 30Hz and the motor runs at half speed. The CNC axis drives on your machine do this continuously for precise velocity control.',
      },
    ],
    visualizations: [
      {
        id: 'ACWaveformViz',
        title: 'AC Waveform — Live Sine Wave',
        mathBridge: 'Select the 120V AC preset. The yellow dashed lines show the RMS value — 120V RMS is the equivalent DC power level. Enable 3-Phase to see how 480V three-phase industrial power uses three sine waves 120° apart.',
      },
    ],
  },

  math: {
    prose: [
      "An AC voltage varies sinusoidally: $v(t) = V_p \\sin(2\\pi f t)$, where $V_p$ is the peak voltage and $f$ is frequency.\n\nRMS is defined as the square root of the mean of the squared instantaneous voltage over one complete cycle:\n\n$$V_{\\text{RMS}} = \\sqrt{\\frac{1}{T}\\int_0^T v(t)^2 \\, dt}$$\n\nFor a pure sine wave, this evaluates to $V_{\\text{RMS}} = V_p / \\sqrt{2}$.",
      "**Power in AC circuits.** For a purely resistive load, $P = V_{\\text{RMS}}^2 / R = I_{\\text{RMS}}^2 R = V_{\\text{RMS}} \\cdot I_{\\text{RMS}}$. For inductive or capacitive loads, apparent power $S = V I$ (in VA), real power $P = VI \\cos\\phi$ (in W), reactive power $Q = VI \\sin\\phi$ (in VAR), and power factor $\\text{PF} = \\cos\\phi$.",
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'Three-Phase Power',
        body: 'For a balanced three-phase load:\n\n$$P_{\\text{total}} = \\sqrt{3} \\cdot V_{LL} \\cdot I_L \\cdot \\cos\\phi$$\n\nWhere $V_{LL}$ is line-to-line RMS voltage, $I_L$ is line current, and $\\cos\\phi$ is power factor.\n\nExample: 480V three-phase motor drawing 10A at 0.85 PF:\n$P = 1.732 \\times 480 \\times 10 \\times 0.85 = 7,063\\text{ W} \\approx 7.1\\text{ kW} \\approx 9.5\\text{ HP}$',
      },
    ],
  },

  challenges: [
    {
      problem: 'A 240V AC RMS outlet is used to power a piece of equipment. What is the peak voltage of this AC waveform?',
      hint: 'V_peak = V_RMS × √2 ≈ V_RMS × 1.414',
      walkthrough: [
        'Identify known: V_RMS = 240V',
        'Apply peak formula: V_peak = V_RMS × √2',
        'V_peak = 240 × 1.414 ≈ 339.4V',
        'This peak voltage determines insulation requirements — components must be rated above 339V',
      ],
      answer: 'V_peak ≈ 339V',
      difficulty: 'easy',
    },
    {
      problem: 'A 480V three-phase motor is connected in a wye configuration. The line-to-line voltage is 480V. What is the line-to-neutral voltage for each phase?',
      hint: 'For a wye system: V_line-to-neutral = V_line-to-line / √3',
      walkthrough: [
        'Identify known: V_LL = 480V',
        'Apply wye relationship: V_LN = V_LL / √3',
        'V_LN = 480 / 1.732 ≈ 277.1V',
        'This is why you measure 277V between any phase and ground/neutral in a 480V wye system',
      ],
      answer: 'V_line-to-neutral ≈ 277V',
      difficulty: 'medium',
    },
    {
      problem: 'A VFD (Variable Frequency Drive) rectifies its AC input to charge a DC bus capacitor bank. For a 480V three-phase line-to-line input, what is the approximate DC bus voltage? Why is this dangerous after the disconnect is opened?',
      hint: 'The DC bus charges to V_peak of the AC line-to-line voltage. V_peak = V_RMS × √2.',
      walkthrough: [
        'V_LL_RMS = 480V',
        'DC bus charges to peak of the AC waveform: V_DC ≈ V_LL × √2',
        'V_DC = 480 × 1.414 ≈ 679V',
        'After the disconnect opens, the AC power is removed but the large capacitors on the DC bus remain charged at ~679VDC',
        'These capacitors hold lethal energy (½CV²) and take 5–15 minutes to discharge through internal bleed resistors',
        'Touching the DC bus terminals immediately after power removal can be fatal — always wait and verify with a meter before servicing',
      ],
      answer: 'DC bus ≈ 679VDC; dangerous because capacitors remain charged at lethal voltage after disconnect opens',
      difficulty: 'hard',
    },
  ],

  examples: [
    {
      title: 'Identifying voltages in a machine panel',
      problem: 'You open a CNC machine electrical cabinet and measure: L1-L2 = 480V, L1-N = 277V, PE terminal to any phase ≈ 0V (through earthing). The control transformer secondary reads 120V. The SMPS output reads 24.1V. Describe what each measurement means.',
      solution: 'L1-L2 = 480V: Line-to-line voltage of the three-phase 480V supply — this feeds the spindle drive and servo drives.\n\nL1-N = 277V: Phase-to-neutral (277 = 480/√3) — confirms it\'s a wye system with neutral available.\n\nPE ≈ 0V: Protective earth (green wire) is bonded to neutral and ground — correct and safe.\n\n120V transformer secondary: Steps 480V down to 120VAC for HMI, relays, and lighting circuits.\n\n24.1V DC: Switching power supply output for PLC I/O, sensors, and solenoids — the 0.1V over nominal is normal (regulated within ±5%).',
    },
  ],
};
