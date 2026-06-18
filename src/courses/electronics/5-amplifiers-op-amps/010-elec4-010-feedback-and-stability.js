export default {
  id: 'elec4-010',
  slug: 'feedback-and-stability',
  chapter: 'elec4',
  order: 10,
  title: 'Feedback & Stability',
  subtitle: 'Gain-Bandwidth Product & Bode Plots',
  tags: ['feedback', 'Bode plot', 'gain-bandwidth product', 'stability', 'oscillator', 'phase margin', 'gain margin'],
  aliases: ['negative feedback', 'Bode plot', 'gain margin', 'phase margin', 'Wien bridge oscillator', 'GBW'],
  timeToComplete: 30,
  coreConcept: 'Negative feedback stabilises gain and reduces distortion but exchanges gain for bandwidth; stability requires adequate gain margin (>6dB) and phase margin (>45°) read from the Bode plot.',
  prerequisites: ['elec4-009'],
  nextLesson: null,
  hook: {
    question: 'Why do some amplifier circuits burst into oscillation and destroy themselves — and how do engineers prevent it?',
    realWorldContext:
      'Instability can destroy RF power amplifiers, cause audio amplifiers to emit high-pitched squeals, and make servo motor controllers vibrate destructively. Every feedback amplifier design must prove adequate stability margins. Bode plots are the standard tool used in audio, power electronics, control systems, and RF design to guarantee stable operation.',
  },
  mentalModel: [
    'Negative feedback (output fed back 180° out of phase with input) reduces gain, distortion, and sensitivity to component variation, while extending bandwidth and lowering output impedance',
    'Closed-loop gain: Acl = Aol / (1 + Aol·β), where β is the feedback fraction; for Aol·β ≫ 1, Acl ≈ 1/β — set entirely by external components',
    'Gain-bandwidth product (GBW): Aol falls at −20dB/decade above the dominant pole; GBW = Aol(DC) × f₁(dominant pole) = constant — a fundamental amplifier parameter',
    'Stability condition (Barkhausen criterion for oscillation): |Aol·β| = 1 AND ∠(Aol·β) = −180° simultaneously; amplifier is stable when this never occurs',
    'Bode plot margins: gain margin = amount Aol·β is below 0dB at the frequency where phase = −180°; phase margin = how far phase is above −180° at the frequency where |Aol·β| = 1 (0dB crossing)',
  ],
  intuition: {
    prose: [
      'Negative feedback is the cornerstone of precision analog design. By sampling the output and feeding a fraction back to subtract from the input, the closed-loop gain becomes nearly independent of the amplifier\'s open-loop gain — and therefore independent of temperature, supply voltage, and device-to-device variation. The tradeoff is that gain is exchanged for stability and bandwidth: closing the loop by factor β reduces gain from Aol to approximately 1/β, but extends the −3dB bandwidth by the same factor. This is the gain-bandwidth product — a conserved quantity.',
      'Stability becomes a concern because real amplifiers add phase shift at high frequencies (capacitances inside transistors, compensation networks). If the cumulative phase shift around the feedback loop ever reaches −180° while the loop still has gain ≥ 1, the negative feedback becomes positive feedback at that frequency, and the amplifier oscillates. The Bode plot displays gain and phase vs. frequency on logarithmic axes, making stability assessment visual and immediate. Engineers read two margins from the Bode plot: the gain margin (how much gain must increase before oscillation at the −180° frequency) and the phase margin (how much additional phase shift is tolerable before oscillation at the 0dB-gain frequency).',
      'Positive feedback, deliberately applied, produces oscillators rather than amplifiers. The Wien bridge oscillator uses an RC network with exactly 0° phase shift at one frequency, and an op-amp with gain of exactly 3 at that frequency, to sustain continuous sinusoidal oscillation. The phase-shift oscillator uses three cascaded RC stages, each contributing 60° of phase shift at the oscillation frequency, for a total of 180° — making the overall feedback positive at that single frequency. These circuits appear in function generators, lock-in amplifiers, and signal synthesisers.',
    ],
    callouts: [
      {
        type: 'insight',
        body: 'A phase margin of 45° gives a slight peaking in the closed-loop frequency response (about 2.3dB at resonance) and a moderately damped step response. For audio and precision DC applications, 60–70° phase margin is preferred for a flat response. For fast transient applications (switching regulators, servo systems), 45° is often acceptable. Less than 30° phase margin typically produces an oscillatory step response and should be avoided.',
      },
      {
        type: 'warning',
        body: 'Adding a capacitive load to an op-amp output degrades phase margin. A capacitor forms a pole with the op-amp\'s output resistance, adding phase lag in the feedback loop. Long coaxial cables, ADC inputs, and large bypass capacitors all present capacitive loads. The fix is a small series resistor (10–100Ω) at the op-amp output, which isolates the internal output resistance from the load capacitance and prevents the additional phase lag from destabilising the loop.',
      },
    ],
    visualizations: [{ type: 'AmplifierViz', props: {} }],
  },
  math: {
    prose: [
      'Closed-loop gain: A_cl = A_ol / (1 + A_ol · β)  ≈ 1/β  when A_ol·β ≫ 1  (loop gain dominates)',
      'Loop gain: T = A_ol · β; gain desensitivity: A_cl variation = A_ol variation / (1 + T) — feedback reduces sensitivity by factor (1+T)',
      'Gain-bandwidth product: GBW = A_ol(0) · f_p1 = A_cl · BW_cl = constant (for single-pole rolloff)',
      'Barkhausen oscillation criterion: |A_ol(jω₀) · β(jω₀)| = 1  AND  ∠[A_ol(jω₀) · β(jω₀)] = 0° (or −360°)',
    ],
    callouts: [
      {
        type: 'formula',
        body: 'Phase margin PM = 180° + ∠[A_ol·β] at the frequency where |A_ol·β| = 1 (0dB).  Gain margin GM = −20 log₁₀|A_ol·β| at the frequency where ∠[A_ol·β] = −180°.  Stable if PM > 0° and GM > 0dB; recommended PM ≥ 45°, GM ≥ 6dB.',
      },
    ],
  },
};
