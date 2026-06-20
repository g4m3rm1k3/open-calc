export default {
  id: 'elec6-002',
  slug: 'test-equipment',
  chapter: 'elec6',
  order: 2,
  title: 'Test Equipment',
  subtitle: 'DMM, Oscilloscope, Signal Generator & Spectrum Analyzer',
  tags: ['DMM', 'oscilloscope', 'signal generator', 'spectrum analyzer', 'LCR meter'],
  aliases: ['test instruments', 'bench equipment', 'measurement tools'],
  timeToComplete: 25,
  coreConcept: 'Each instrument has a frequency range, input impedance, and measurement uncertainty. Choosing the right tool — and connecting it correctly — is as important as reading the result.',
  prerequisites: ['elec6-001'],
  nextLesson: 'elec6-003',
  hook: {
    question: 'You scope a 10MHz square wave and the edges look rounded and slow. Is the signal bad, or is your probe the problem?',
    realWorldContext: 'Engineers lose hours chasing ghost faults caused by incorrect probe compensation or an oscilloscope bandwidth that is too low. Understanding your instruments prevents misdiagnosis before it starts.',
  },
  mentalModel: [
    'DMM: best for DC levels, resistance, and slow AC — never trust a DMM on signals above 1kHz without checking its AC bandwidth spec',
    'Oscilloscope bandwidth must be at least 3–5× the highest frequency of interest to capture waveform shape accurately',
    'Signal generator output impedance is typically 50Ω — driving a 1MΩ scope input causes voltage doubling; use a 50Ω terminator when accuracy matters',
    'Spectrum analyzer shows frequency-domain content — use it to find harmonics, spurious signals, and interference sources invisible to an oscilloscope',
    'LCR meter applies a small AC test signal; frequency of measurement must match the component\'s intended operating frequency for accurate results',
  ],
  intuition: {
    prose: [
      'A digital multimeter is the screwdriver of electronics: simple, essential, and easy to misuse. Its key limitation is bandwidth. Most DMMs measure AC voltage accurately only up to a few kilohertz. Above that, the internal averaging circuit cannot track the waveform, and the reading lies. Always verify the spec sheet before trusting an AC reading on a fast signal.',
      'An oscilloscope is a time machine — it captures voltage versus time so you can see rise times, glitches, ringing, and phase relationships. The front-end bandwidth, the probe capacitance, and the ground lead inductance all limit what you see. A 10× probe attenuates by ten but raises input impedance from 1MΩ to 10MΩ, making it far less loading on the circuit. The short ground spring clip matters: a long ground lead adds inductance that rings on every fast edge.',
      'A spectrum analyzer is an oscilloscope for the frequency domain. Where an oscilloscope shows you a time-domain snapshot, the spectrum analyzer sweeps across frequencies and plots amplitude at each. This is indispensable for EMC work, RF debugging, and finding the harmonic products of switching supplies. Resolution bandwidth (RBW) controls the narrowest feature the analyzer can distinguish — narrow RBW takes longer to sweep but reveals closely spaced signals.',
    ],
    callouts: [
      { type: 'warning', body: 'Probe compensation is not optional. An uncompensated 10× probe can add 10-20% overshoot to every measured edge, leading you to diagnose ringing that does not exist in the circuit.' },
      { type: 'insight', body: 'When measuring current with a clamp meter around a cable, make sure the cable carries only one conductor of the circuit. Clamping around both live and neutral cancels the magnetic fields and reads zero.' },
    ],
    visualizations: [{ type: 'OhmViz', props: {} }],
  },
  math: {
    prose: [
      'Oscilloscope rise time: t_rise ≈ 0.35 / BW — a 100MHz scope has a rise time limit of ~3.5ns regardless of the signal',
      'Loading effect: probe impedance Zp in parallel with circuit; at 10MHz a 1× probe (1MΩ ‖ 100pF) has |Z| ≈ 159Ω, loading sensitive circuits significantly',
      'Voltage doubling at open load: generator set to 1V with 50Ω source into 1MΩ load delivers ~2V; correct with 50Ω terminator to ground',
      'DMM AC accuracy: true-RMS meter measures V_rms = √(1/T ∫v²dt), while average-responding meters assume sinusoidal waveforms and read incorrectly for non-sine signals',
    ],
    callouts: [
      { type: 'formula', body: 'Scope rise time limit: t_rise (ns) ≈ 350 / BW(MHz). A 500MHz scope resolves edges no faster than 0.7ns.' },
    ],
  },
  quiz: [
    {
      id: 'q1',
      type: 'choice',
      text: 'You use a 20 MHz oscilloscope to view a 10 MHz square wave and the edges look rounded and slow. Is the signal bad, or is the instrument the problem?',
      options: [
        'The signal is bad — a proper 10 MHz square wave should have fast edges on any oscilloscope',
        'The instrument is the problem — oscilloscope bandwidth should be at least 3–5× the signal frequency; a 20 MHz scope has a rise time limit of ~17.5 ns (0.35/20MHz), which rounds the edges of a 10 MHz square wave even if the signal is perfect',
        'The probe compensation is off — adjusting the trimmer on the probe will restore the fast edges regardless of oscilloscope bandwidth',
      ],
      correct: 1,
    },
    {
      id: 'q2',
      type: 'choice',
      text: 'A DMM reads 3.2 V AC on a 5 V, 100 kHz PWM signal. Can you trust this reading?',
      options: [
        'Yes — a true-RMS DMM accurately measures any waveform regardless of frequency',
        'No — most DMMs have AC bandwidth limits of a few kHz; at 100 kHz the internal averaging circuit cannot track the waveform, so the reading is unreliable and should be verified with an oscilloscope or a DMM specified for high-frequency AC',
        'No — a PWM signal must be measured with a power analyser, not a DMM, because it contains harmonics',
      ],
      correct: 1,
    },
    {
      id: 'q3',
      type: 'choice',
      text: 'A signal generator is set to 1.0 V output and has a 50 Ω source impedance. When connected directly to a 1 MΩ oscilloscope input (no 50 Ω terminator), the scope reads nearly 2.0 V. Why?',
      options: [
        'The oscilloscope amplifier has a gain error that doubles the reading on 1× probes',
        'The generator\'s 50 Ω source forms a voltage divider with the load; with a 1 MΩ load, almost no voltage drops across the 50 Ω source resistance, so the full open-circuit voltage (~2× the specified output) appears at the load — add a 50 Ω terminator to restore the correct 1.0 V reading',
        'The scope is measuring peak voltage instead of RMS, which doubles the apparent AC amplitude',
      ],
      correct: 1,
    },
    {
      id: 'q4',
      type: 'choice',
      text: 'A switching power supply causes interference on an AM radio. An oscilloscope shows the supply output looks clean. What instrument would reveal the interference source?',
      options: [
        'A current clamp meter — it measures the supply\'s output ripple current more accurately than a voltage probe',
        'A spectrum analyser — it displays frequency-domain content across a wide range, revealing harmonics and spurious emissions at AM broadcast frequencies (535–1705 kHz) that are invisible to a time-domain oscilloscope',
        'An LCR meter — it measures the output capacitance, which determines the high-frequency noise filtering capability',
      ],
      correct: 1,
    },
  ],
};
