export default {
  id: 'elec6-009',
  slug: 'sensors-and-signal-conditioning',
  chapter: 'elec6',
  order: 9,
  title: 'Sensors & Signal Conditioning',
  subtitle: 'Transducers, Bridges & Instrumentation Amps',
  tags: ['sensor', 'transducer', 'Wheatstone bridge', 'instrumentation amplifier', '4-20mA', 'RTD', 'thermocouple'],
  aliases: ['signal conditioning', 'measurement amplifier', 'temperature sensor', 'strain gauge'],
  timeToComplete: 28,
  coreConcept: 'Sensors convert physical quantities into small electrical signals. Signal conditioning amplifies, filters, and converts those signals to a standard form (4-20mA or 0-10V) before digitisation. The instrumentation amplifier and Wheatstone bridge are the core of precision measurement.',
  prerequisites: ['elec6-008'],
  nextLesson: 'elec6-010',
  hook: {
    question: 'A load cell reads correctly on the bench but drifts by 5% over an eight-hour production run. The ambient temperature changes by 15°C. What is happening and how do you fix it?',
    realWorldContext: 'Strain gauges and RTDs both have significant temperature coefficients. Industrial weighing systems and process instruments account for thermal drift through bridge balancing, cold junction compensation, and three- or four-wire connection schemes. Understanding these compensation techniques separates working instruments from those that are merely plausible.',
  },
  mentalModel: [
    'A sensor converts a physical quantity to a proportional electrical quantity (resistance, capacitance, voltage, current, frequency)',
    'Wheatstone bridge converts a small resistance change into a differential voltage; all four arms change in a full bridge (strain gauge load cell) for maximum sensitivity and temperature cancellation',
    'Instrumentation amplifier (in-amp) amplifies the differential voltage between two inputs with extremely high common-mode rejection — it does not amplify noise common to both inputs',
    'RTD (PT100/PT1000) uses four-wire (Kelvin) connection to eliminate lead resistance error; two wires carry excitation current, two wires measure voltage',
    'Thermocouple generates a Seebeck voltage proportional to the temperature difference between the measurement junction and the reference (cold) junction — cold junction compensation is required for absolute temperature measurement',
  ],
  intuition: {
    prose: [
      'A strain gauge is simply a resistor whose resistance changes when it is deformed. The change is tiny: a strain of 1000 microstrain (0.1% deformation) changes a 350Ω gauge by about 0.7Ω — a 0.2% change. Measuring 0.2% resistance change accurately in an industrial environment full of temperature variations, cable resistance changes, and electrical noise is not possible with a simple voltage divider. The Wheatstone bridge makes it possible by measuring the ratio between two arms rather than an absolute resistance, while active temperature compensation cancels the thermal drift of the gauge material itself.',
      'The instrumentation amplifier is the workhorse of precision measurement. Its three op-amp topology provides high input impedance at both inputs, adjustable gain set by a single resistor, and common-mode rejection that can exceed 100dB. Common-mode rejection is the key specification: if both inputs rise by 1V simultaneously (as they would if a ground loop introduced 1V of noise), the output does not change. Only the difference between the inputs is amplified. This is why in-amps are used at the output of every bridge sensor, thermocouple, and ECG electrode — the signal of interest is differential; the noise is common-mode.',
      'Type K thermocouples (nickel-chromium vs nickel-aluminium) are the most common industrial temperature sensors: cheap, robust, and useful from -200°C to 1260°C. Their Seebeck coefficient is approximately 41µV/°C at room temperature, meaning a 1°C change produces a 41 microvolt signal. At the measurement end, those microvolts must be amplified to a usable level. At the connection end — where the thermocouple wires connect to the instrument — a second thermocouple junction is formed. Cold junction compensation measures the temperature at this reference junction (usually with a thermistor or semiconductor sensor integrated into the connector block) and adds the corresponding correction voltage electronically.',
    ],
    callouts: [
      { type: 'insight', body: 'A four-wire RTD connection eliminates the error caused by lead resistance. The excitation current flows through one pair of leads; the voltage is measured through a separate pair. Since the voltmeter draws negligible current, there is no voltage drop in the voltage-sensing leads, and the measurement is independent of lead resistance regardless of cable length or temperature.' },
      { type: 'warning', body: 'Never connect a thermocouple amplifier to the thermocouple using standard copper extension wire. Always use thermocouple extension cable matched to the thermocouple type (e.g., KX for type K). Copper-to-thermocouple junctions at room temperature introduce a compensating voltage error that can be tens of degrees Celsius.' },
    ],
    visualizations: [{ type: 'OpAmpViz', props: {} }],
  },
  math: {
    prose: [
      'Wheatstone bridge output: V_out = V_excitation × (ΔR/4R) for a single active arm; for a full bridge with four active arms (load cell), V_out = V_excitation × (ΔR/R) — four times more sensitive',
      'RTD linearisation: R(T) = R₀ × (1 + αT) where α = 0.00385/°C for PT100 (R₀=100Ω at 0°C); at 100°C, R = 100 × (1 + 0.385) = 138.5Ω',
      'Instrumentation amplifier gain: G = 1 + (2R / R_G), where R is the internal resistor pair and R_G is the external gain resistor; for an INA128 with R=40kΩ, setting R_G=392Ω gives G = 1 + 80000/392 ≈ 205',
      'Thermocouple sensitivity: type K ≈ 41µV/°C; for a 200°C measurement, V_out = 200 × 41µV = 8.2mV; an in-amp with G=200 produces 1.64V — comfortably within ADC range',
    ],
    callouts: [
      { type: 'formula', body: 'Lead resistance error in 2-wire RTD: ΔT_error = 2 × R_lead / (R₀ × α); for 10m of 0.5mm² copper (R_lead = 0.68Ω each way), ΔT = 2×0.68/(100×0.00385) ≈ 3.5°C error — unacceptable for precision measurement without 3- or 4-wire correction.' },
    ],
  },
  quiz: [
    {
      id: 'q1',
      type: 'choice',
      text: 'A load cell uses a Wheatstone bridge with only one active strain gauge (the other three arms are fixed resistors). The reading drifts by 5% over an 8-hour shift as ambient temperature rises 15°C. What configuration would eliminate the drift?',
      options: [
        'Use a precision op-amp with very low offset drift to amplify the bridge output — the electronics are causing the drift',
        'Use a full bridge with four active strain gauges (two in tension, two in compression) — all four arms change resistance with strain and with temperature; the temperature changes cancel because they affect all arms equally, while strain-induced changes add, giving 4× the signal and zero temperature error',
        'Add a temperature sensor and apply a software correction factor to the reading each time temperature changes',
      ],
      correct: 1,
    },
    {
      id: 'q2',
      type: 'choice',
      text: 'A thermocouple in an industrial furnace produces a 8 mV differential signal in the presence of 5 V of common-mode noise from nearby VFDs. Why is an instrumentation amplifier chosen over a standard op-amp to amplify this signal?',
      options: [
        'An instrumentation amplifier has higher gain than a standard op-amp, allowing the 8 mV signal to be amplified to a usable level',
        'An instrumentation amplifier has very high common-mode rejection ratio (CMRR > 100 dB) — it amplifies only the difference between its two inputs and ignores voltage common to both; the 5 V common-mode noise appears equally on both inputs and is suppressed by 100,000×, while the 8 mV thermocouple signal — which is differential — is amplified normally',
        'An instrumentation amplifier requires no external gain resistors, simplifying the circuit compared to a standard op-amp differential amplifier',
      ],
      correct: 1,
    },
    {
      id: 'q3',
      type: 'choice',
      text: 'A PT100 RTD is connected using only two wires. In summer, readings are 3.5°C higher than a calibrated reference. In winter, the error is negligible. What causes the summer error?',
      options: [
        'PT100 sensors have a non-linear response at high temperatures that requires polynomial correction — the linear approximation is only accurate below 50°C',
        'The two wire leads have resistance that adds to the measured RTD resistance; in summer, the cable heats up, increasing lead resistance, which the measurement system interprets as a higher RTD temperature. A three- or four-wire connection separates the current-carrying wires from the voltage-sensing wires, eliminating lead resistance from the measurement entirely',
        'Two-wire connections pick up ground loop noise in summer when increased soil moisture improves the earth conductor — use shielded cable to prevent this',
      ],
      correct: 1,
    },
    {
      id: 'q4',
      type: 'choice',
      text: 'A Type K thermocouple is extended to a measurement instrument using ordinary copper wire. The temperature reading is 35°C higher than actual. What causes this?',
      options: [
        'Copper wire has higher resistance than thermocouple alloy, attenuating the Seebeck voltage and causing a high reading',
        'Where the copper wire meets the thermocouple alloy at the instrument terminal block, a new thermocouple junction is formed that generates its own Seebeck voltage at room temperature, adding to the signal and creating a large temperature error — always use matched thermocouple extension cable (KX for Type K) so no dissimilar-metal junctions are introduced',
        'Copper wire acts as an antenna in industrial environments, picking up electromagnetic interference that appears as a higher-than-actual temperature reading',
      ],
      correct: 1,
    },
  ],
};
