export default {
  id: 'elec4-007',
  slug: 'noninverting-amplifier',
  chapter: 'elec4',
  order: 7,
  title: 'Non-Inverting Amplifier',
  subtitle: 'High Input Impedance Configuration',
  tags: ['non-inverting', 'voltage follower', 'unity gain buffer', 'impedance matching', 'buffer'],
  aliases: ['noninverting op-amp', 'voltage follower', 'unity gain buffer', 'op-amp buffer'],
  timeToComplete: 20,
  coreConcept: 'The non-inverting amplifier has Av = 1 + Rf/R1 and extremely high input impedance, making it ideal for impedance matching and buffering high-impedance sensors.',
  prerequisites: ['elec4-006'],
  nextLesson: 'elec4-008',
  hook: {
    question: 'Why does connecting a voltmeter to a sensitive pH electrode give a wrong reading — and how does an op-amp fix it?',
    realWorldContext:
      'A glass pH electrode has an internal impedance of 100MΩ or more. A standard voltmeter input (1MΩ) loads the sensor, causing a massive measurement error. A voltage-follower op-amp stage with near-infinite input impedance solves this — it is the front-end of every pH meter, electrophysiology amplifier, and capacitive touch sensor.',
  },
  mentalModel: [
    'Input signal connects directly to V+ (non-inverting input), giving the circuit the full open-loop input impedance of the op-amp — hundreds of megaohms to teraohms for CMOS or JFET-input types',
    'Feedback network (R1 bottom, Rf top) forms a voltage divider from Vout back to V−; the op-amp drives Vout until V− = V+',
    'At equilibrium: V− = Vout · R1/(R1 + Rf) = Vin → Vout = Vin · (1 + Rf/R1)',
    'Voltage follower (unity-gain buffer): Rf = 0, R1 = ∞ (or just connect output directly to V−); Av = 1, Zin ≈ Zin(op-amp), Zout ≈ 0',
    'Unlike the inverting configuration, gain is always ≥ 1; you cannot attenuate below unity with this topology alone',
  ],
  intuition: {
    prose: [
      'In the non-inverting configuration the input signal connects directly to the + terminal of the op-amp, without passing through any resistor. This means the source sees the full differential input impedance of the op-amp — often hundreds of megaohms or more for JFET-input devices, and into the teraohm range for CMOS. This is the defining advantage over the inverting configuration, where input impedance is limited to R1.',
      'The feedback analysis is just as clean as for the inverting case. The op-amp drives its output until V− (set by the R1-Rf divider) equals Vin at V+. The output voltage must be large enough that its divided version matches the input: Vout × R1/(R1 + Rf) = Vin. Solving gives Av = 1 + Rf/R1. The gain is always positive (no inversion) and always at least 1.',
      'The voltage follower is the special case where Rf = 0 (short circuit) and R1 is omitted. Now V− connects directly to the output, and the op-amp drives Vout = Vin with unity gain. Despite doing "nothing" to the voltage, the follower is enormously useful: it presents near-infinite impedance to the source and near-zero impedance to the load. This impedance transformation isolates stages from each other, preventing a low-impedance load from pulling down a high-impedance source — it is the ideal buffer.',
    ],
    callouts: [
      {
        type: 'insight',
        body: 'The non-inverting amplifier has a noise gain of (1 + Rf/R1), the same as its signal gain. The inverting amplifier has a signal gain of Rf/R1 but a noise gain of (1 + Rf/R1) — one step higher. For low-noise design, the non-inverting topology is preferred when signal gain > 1, because op-amp input noise is multiplied by the same factor as the signal.',
      },
      {
        type: 'tip',
        body: 'For a voltage follower, close the loop directly from output to V− with a wire. Do not insert even a small resistor "for safety" — it creates an unnecessary pole. However, a small resistor (10–100Ω) in series with the output can prevent oscillation when driving a capacitive load such as a long cable, by limiting the rate of feedback and stabilising the phase margin.',
      },
    ],
    visualizations: [{ type: 'OpAmpViz', props: { mode: 'noninv' } }],
  },
  math: {
    prose: [
      'Virtual short at input: V− = V+ = Vin (since op-amp drives Vout until this is satisfied)',
      'Feedback divider: V− = Vout · R1/(R1 + Rf) = Vin  →  Av = Vout/Vin = 1 + Rf/R1',
      'Voltage follower (Rf = 0, R1 removed): Av = 1 + 0/∞ = 1; Zin ≈ Zin(op-amp) → very large; Zout ≈ Zout(op-amp)/Aol → near zero',
      'Output impedance of closed-loop non-inverting amp: Zout(cl) = Zout(ol) / (1 + Aol·β), where β = R1/(R1+Rf)',
    ],
    callouts: [
      {
        type: 'formula',
        body: 'A_v = 1 + R_f / R_1.  Voltage follower: R_f = 0, R_1 → ∞ gives A_v = 1.  Example: R_1 = 10kΩ, R_f = 39kΩ → A_v = 1 + 3.9 = 4.9 (≈ 13.8dB), non-inverting.',
      },
    ],
  },
};
