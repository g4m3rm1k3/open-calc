export default {
  id: 'elec4-001',
  slug: 'intro-to-amplifiers',
  chapter: 'elec4',
  order: 1,
  title: 'Introduction to Amplifiers',
  subtitle: 'Gain, Bandwidth & Decibels',
  tags: ['amplifiers', 'gain', 'decibels', 'bandwidth'],
  aliases: ['amplifier gain', 'dB gain', 'voltage gain', 'signal amplification'],
  timeToComplete: 20,
  coreConcept: 'An amplifier increases signal power; voltage gain Av = Vout/Vin; gain in dB = 20log10|Av|.',
  prerequisites: ['elec3-005'],
  nextLesson: 'elec4-002',
  hook: {
    question: 'Why does a microphone signal need amplification before reaching a speaker?',
    realWorldContext:
      'A microphone outputs millivolts; a speaker needs volts. Amplifiers bridge this gap in every audio system, radio, and sensor interface. Without amplification, your voice recording would be inaudible, radar signals undetectable, and EEG brain readings impossible to process.',
  },
  mentalModel: [
    'Amplifier = controlled power valve — small input signal controls large output power drawn from a DC supply',
    'Voltage gain Av = Vout/Vin — a dimensionless ratio; Av = 10 means output is 10× bigger than input',
    'Power gain Ap = Pout/Pin — always > 1 for a true amplifier; a passive network (transformer, RC) cannot exceed 1',
    'Decibels compress wide ranges: dB = 20log10|Av|, so Av=10 → 20dB, Av=100 → 40dB, Av=1000 → 60dB',
    'Gain-bandwidth product (GBW) is constant for a given amplifier — doubling gain halves the usable bandwidth',
  ],
  intuition: {
    prose: [
      'Every amplifier is fundamentally a valve: a small input signal opens or closes a gate that lets energy from a power supply flow through to the output. The transistor is this valve — a tiny base current controls a much larger collector current. The input signal does not supply the output power; the DC supply does, guided by the input.',
      'The gain ratio tells us how much bigger the output is compared to the input. A gain of 10 means the output voltage is 10 times larger than the input. But signal levels in real systems span enormous ranges — from nanovolts in an antenna to volts in a speaker — so we use decibels (dB), a logarithmic scale, to make these numbers manageable. Each 20dB step is a factor of 10 in voltage.',
      'Bandwidth is the range of frequencies over which the amplifier maintains useful gain. At low and high frequencies, the gain inevitably falls off due to capacitances inside the transistor. The product of midband gain and bandwidth is a fixed property of the device, called the gain-bandwidth product (GBW). Designing for high gain in a narrow band, or moderate gain over a wide band, is the central amplifier engineering tradeoff.',
    ],
    callouts: [
      {
        type: 'insight',
        body: 'Amplifiers do not create energy — they redirect energy from the DC supply into the AC output. The supply current is always greater than the signal current. Efficiency (η = Pout/PDC) is the key metric for battery-powered designs.',
      },
      {
        type: 'warning',
        body: 'Gain has a frequency limit. The gain-bandwidth product (GBW) is constant: if you increase closed-loop gain by 10×, the −3dB bandwidth shrinks by 10×. Violating this leads to oscillation or unexpected signal roll-off.',
      },
    ],
    visualizations: [{ type: 'AmplifierViz', props: {} }],
  },
  math: {
    prose: [
      'Voltage gain: Av = Vout / Vin (dimensionless ratio)',
      'Current gain: Ai = Iout / Iin; Power gain: Ap = Pout / Pin = Av × Ai',
      'Decibel voltage gain: AdB = 20 log₁₀ |Av|; Decibel power gain: AdB = 10 log₁₀ Ap',
      'Gain-bandwidth product: GBW = Av(midband) × BW₋₃dB = constant for a given amplifier stage',
    ],
    callouts: [
      {
        type: 'formula',
        body: 'A_dB = 20 log₁₀ |A_v|  ←  The −3dB point is where |A_v| drops to 1/√2 ≈ 0.707 of its midband value, corresponding to a power drop of exactly one half.',
      },
    ],
  },
  quiz: [
    {
      id: 'q1',
      type: 'choice',
      text: 'A microphone outputs 5 mV and a speaker needs 1 V. What voltage gain is required, and how many decibels is that?',
      options: [
        'Gain = 200, which is 46 dB — Av = 1000/5 = 200, AdB = 20 × log10(200)',
        'Gain = 0.005, which is −46 dB — divide output by input',
        'Gain = 20, which is 26 dB — 1 V / 0.05 V',
      ],
      correct: 0,
    },
    {
      id: 'q2',
      type: 'choice',
      text: 'An amplifier\'s gain-bandwidth product (GBW) is 10 MHz. If the closed-loop gain is set to 100, what is the −3 dB bandwidth?',
      options: [
        '10 MHz — GBW applies only to open-loop operation',
        '100 kHz — bandwidth = GBW / gain = 10 MHz / 100',
        '1 GHz — multiply GBW by gain for the effective bandwidth',
      ],
      correct: 1,
    },
    {
      id: 'q3',
      type: 'choice',
      text: 'Where does the output power of an amplifier come from?',
      options: [
        'The input signal itself — amplification concentrates the input power into a larger output voltage',
        'The DC power supply — the input signal controls how much supply energy flows to the output; the supply always delivers more power than the input signal',
        'A resonant circuit inside the amplifier that stores and releases energy each cycle',
      ],
      correct: 1,
    },
    {
      id: 'q4',
      type: 'choice',
      text: 'Three amplifier stages in cascade have voltage gains of 10, 5, and 4. What is the total gain in decibels?',
      options: [
        '19 dB — add the individual gains: 10 + 5 + 4',
        '46 dB — total voltage gain = 10 × 5 × 4 = 200; AdB = 20 × log10(200) ≈ 46 dB',
        '200 dB — multiply gains then multiply by 10 for dB conversion',
      ],
      correct: 1,
    },
  ],
};
