export default {
  id: 'elec4-004',
  slug: 'amplifier-classes',
  chapter: 'elec4',
  order: 4,
  title: 'Amplifier Classes',
  subtitle: 'Class A, B, AB & C Efficiency',
  tags: ['class A', 'class B', 'class AB', 'efficiency', 'push-pull', 'crossover distortion', 'class C'],
  aliases: ['amplifier efficiency', 'push-pull amplifier', 'power amplifier classes', 'conduction angle'],
  timeToComplete: 25,
  coreConcept: 'Amplifier class defines the conduction angle of each transistor; class A (360°) is linear but wasteful; class B (180°) is efficient but distorts at zero crossing; class AB balances both.',
  prerequisites: ['elec4-003'],
  nextLesson: 'elec4-005',
  hook: {
    question: 'Why do phone chargers and laptop adapters run hot, and why does class AB dominate audio amplifiers?',
    realWorldContext:
      'Class A amplifiers in a 100W home stereo dissipate 300W+ as heat even with no music playing. Class AB power amplifiers in your earbuds sip milliwatts. Understanding amplifier classes explains why industrial power amps, RF transmitters, and portable devices make radically different design choices.',
  },
  mentalModel: [
    'Conduction angle: the fraction of the input cycle (0°–360°) during which the transistor is conducting — this defines the class',
    'Class A (360°): transistor always on, Q-point centred, maximum linearity, maximum idle dissipation, efficiency ≤ 25% (resistive load) or ≤ 50% (transformer-coupled)',
    'Class B (180°): two transistors split the cycle (push-pull), each handles one half-cycle, efficiency up to 78.5% but crossover distortion appears at zero crossing',
    'Class AB (slightly > 180°): a small forward bias keeps both transistors barely on at the crossover point, eliminating distortion while retaining most of class B\'s efficiency',
    'Class C (< 180°): transistor conducts for less than half the cycle, highest efficiency (up to 85–90%), used exclusively in tuned RF power amplifiers with a resonant tank circuit that reconstructs the full sine wave',
  ],
  intuition: {
    prose: [
      'In class A, the transistor is biased so that it conducts throughout the entire 360° of the input cycle. This guarantees perfectly linear amplification — the output is a faithful replica of the input at all signal levels. The cost is severe: even with zero input signal, the transistor draws its full quiescent current from the supply, burning power as heat. A class A amplifier wastes at least 75% of the DC power it consumes.',
      'Class B splits the work between two transistors in a push-pull arrangement. One handles the positive half of the cycle; the other handles the negative half. Each transistor is off for half the time, so idle dissipation is near zero and efficiency climbs to a theoretical 78.5% at full output. The problem is crossover distortion: near the zero-crossing, both transistors are momentarily off, producing a small dead zone that creates audible distortion, a harsh "gritty" sound in audio circuits.',
      'Class AB is the practical compromise found in almost every commercial audio amplifier. Each transistor is biased with a small forward-bias voltage (typically two Vbe drops from a diode stack or Vbe multiplier), so both are barely conducting at zero signal. The crossover dead zone disappears while the efficiency stays close to class B levels. Class C pushes efficiency further by operating the transistor for less than half the cycle, but the output is a series of pulses — only useful when a resonant tank circuit reconstructs the sine wave, as in RF power amplifiers for broadcast transmitters.',
    ],
    callouts: [
      {
        type: 'insight',
        body: 'The maximum theoretical efficiency of class B is π/4 × 100% ≈ 78.5%. This is because the supply current in a push-pull stage is a full-wave-rectified sine, whose average is 2/π times the peak. Actual designs achieve 60–70% due to transistor saturation voltages and bias currents.',
      },
      {
        type: 'warning',
        body: 'Crossover distortion in class B is worst at low signal levels — the opposite of saturation clipping. It creates high-order harmonic distortion that the ear is very sensitive to. Never use class B without at least a small class AB bias in audio applications.',
      },
    ],
    visualizations: [{ type: 'AmplifierViz', props: { mode: 'classes' } }],
  },
  math: {
    prose: [
      'Class A maximum efficiency (resistive load): η_max = P_out / P_DC = (Vcc²/8Rc) / (Vcc²/4Rc) = 25%',
      'Class B push-pull efficiency: η = π/4 × (Vm/Vcc) where Vm is peak output voltage; η_max = π/4 ≈ 78.5% when Vm → Vcc',
      'Class B output power: P_out = Vm²/(2RL); DC supply power: P_DC = Vcc·Vm/(π·RL)',
      'Transistor dissipation in class B peaks at Vm = 2Vcc/π ≈ 0.636·Vcc, giving P_D(max) = Vcc²/(π²·RL) per transistor',
    ],
    callouts: [
      {
        type: 'formula',
        body: 'η(class B) = (π/4) · (V_m / V_cc) × 100%.  At full swing (V_m ≈ V_cc): η_max ≈ 78.5%.  Compare class A η_max = 25% (resistive) or 50% (transformer-coupled).',
      },
    ],
  },
  quiz: [
    {
      id: 'q1',
      type: 'choice',
      text: 'A class A amplifier is biased at IC = 100 mA with VCC = 12V and RC = 60Ω. Even with no audio input signal, how much power does it dissipate?',
      options: [
        '0W — class A only draws current when a signal is present',
        '1.2W — P = VCC × IC = 12V × 0.1A; class A transistors conduct continuously regardless of signal',
        '0.3W — efficiency is 25% so it only wastes 25% of input power at idle',
      ],
      correct: 1,
    },
    {
      id: 'q2',
      type: 'choice',
      text: 'A class B push-pull amplifier has two transistors. Crossover distortion appears because:',
      options: [
        'Both transistors saturate simultaneously near the zero crossing, causing the output to clamp at VCE(sat)',
        'Both transistors are biased at cutoff (VBE = 0) so there is a dead zone near zero volts where neither transistor conducts, producing a notch in the output waveform',
        'The two transistors have slightly different β values, causing unequal gain between the positive and negative half-cycles',
      ],
      correct: 1,
    },
    {
      id: 'q3',
      type: 'choice',
      text: 'Class AB amplifiers bias each transistor with a small forward voltage. What specific problem does this solve compared to class B?',
      options: [
        'It raises efficiency above the 78.5% class B theoretical maximum',
        'It keeps both transistors barely conducting at zero signal, eliminating the crossover dead zone and its associated distortion while retaining most of class B\'s efficiency advantage over class A',
        'It allows the amplifier to operate from a single supply rail without a split supply',
      ],
      correct: 1,
    },
    {
      id: 'q4',
      type: 'choice',
      text: 'Class C amplifiers conduct for less than 180° of each cycle, producing output pulses rather than a continuous waveform. Why are they still useful in RF transmitters?',
      options: [
        'RF receivers can reconstruct a sine wave from any periodic pulse train, so class C distortion doesn\'t matter at radio frequencies',
        'A tuned resonant tank circuit at the output filters the pulses, reconstructing the full sine wave while the class C efficiency of 85–90% dramatically reduces heat dissipation in high-power transmitters',
        'Class C amplifiers self-modulate to produce AM signals, which is the dominant modulation used in radio broadcasting',
      ],
      correct: 1,
    },
  ],
};
