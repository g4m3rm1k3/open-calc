export default {
  id: 'elec4-005',
  slug: 'op-amp-fundamentals',
  chapter: 'elec4',
  order: 5,
  title: 'Op-Amp Fundamentals',
  subtitle: 'Ideal Op-Amp & Virtual Short',
  tags: ['op-amp', 'operational amplifier', 'virtual short', 'open-loop gain', 'golden rules'],
  aliases: ['operational amplifier', 'ideal op-amp', 'op amp rules', '741', 'LM358'],
  timeToComplete: 20,
  coreConcept: 'An ideal op-amp has infinite gain, infinite input impedance, and zero output impedance. In closed-loop negative feedback, the virtual short principle forces V+ = V−.',
  prerequisites: ['elec4-004'],
  nextLesson: 'elec4-006',
  hook: {
    question: 'How can a single $0.20 chip accurately multiply, filter, integrate, and compare voltages?',
    realWorldContext:
      'The operational amplifier, first built from vacuum tubes in 1941 analog computers, now costs pennies and appears in virtually every piece of electronic equipment — from medical instruments to audio mixers, from industrial sensors to spacecraft. Understanding the two golden rules unlocks all of its applications.',
  },
  mentalModel: [
    'Ideal op-amp has: open-loop voltage gain Aol → ∞, input impedance Zin → ∞, output impedance Zout = 0, bandwidth → ∞',
    'Golden Rule 1 (closed-loop negative feedback): V+ = V− — the output drives itself to whatever voltage makes the two inputs equal',
    'Golden Rule 2: no current flows into either input terminal — Iin = 0',
    'Virtual short: V+ = V− does NOT mean the inputs are connected; it means the output has adjusted to force equality through the feedback network',
    'Real op-amps (741, LM358, TL072): Aol ≈ 100–120dB, Zin ≈ 1MΩ–10TΩ, Zout ≈ 50–75Ω, GBW ≈ 1–10MHz — close enough to ideal for most designs',
  ],
  intuition: {
    prose: [
      'The open-loop gain of a real op-amp is enormous — typically 100,000 to 1,000,000. This means even a 10μV difference between the two input terminals drives the output to its supply rail. Left open-loop, the op-amp is just a very sensitive comparator. But connect a fraction of the output back to the inverting input (negative feedback) and something remarkable happens: the output automatically adjusts to whatever voltage makes V+ equal V−. This self-correcting behavior is the engine behind all op-amp circuits.',
      'The virtual short is the most powerful simplifying concept in analog design. When an op-amp is in a stable closed-loop configuration, you can assume V+ = V− without worrying about the actual gain value. The op-amp "wants" these two voltages to be equal so strongly (because any difference gets multiplied by 100,000) that it actively drives the output to achieve it. This assumption turns complex feedback circuits into simple algebraic problems.',
      'Real op-amps deviate from the ideal in several important ways: the input offset voltage (typically 1–10mV) means V+ and V− are not perfectly equal even at zero output; bias currents (nA to μA) flow into the inputs; the gain falls with frequency (the unity-gain bandwidth or GBW product). The 741, introduced in 1968, was the first widely adopted general-purpose op-amp. Modern variants like the LM358 (dual, single-supply), TL072 (low-noise JFET), and OPA2134 (audio-grade) improve on specific parameters for different applications.',
    ],
    callouts: [
      {
        type: 'insight',
        body: 'The virtual short only exists in closed-loop circuits with negative feedback. In open-loop or positive-feedback configurations, the op-amp output saturates at the supply rail and the golden rules do not apply. Always confirm negative feedback exists before invoking V+ = V−.',
      },
      {
        type: 'warning',
        body: 'Real op-amps cannot output more than their supply voltage (rail-to-rail types get close; others have 1–2V headroom). They also have a maximum output current (typically 25–40mA). Exceeding these limits produces a clipped, distorted output that looks nothing like the theoretical prediction.',
      },
    ],
    visualizations: [{ type: 'OpAmpViz', props: {} }],
  },
  math: {
    prose: [
      'Open-loop output: Vout = Aol · (V+ − V−), where Aol ≈ 10⁵ to 10⁶ (100–120dB)',
      'Virtual short condition (closed-loop, negative feedback): V+ = V−  (i.e., Vd = V+ − V− → 0)',
      'Golden Rule 2: I+ = I− = 0  (input currents are negligible)',
      'Closed-loop gain set entirely by external resistors — e.g., inverting: Av = −Rf/R1; non-inverting: Av = 1 + Rf/R1',
    ],
    callouts: [
      {
        type: 'formula',
        body: 'V_out = A_ol · (V⁺ − V⁻).  With A_ol = 10⁵ and V_out = 10V:  V⁺ − V⁻ = 10/10⁵ = 0.1mV ≈ 0.  This is why the virtual short (V⁺ ≈ V⁻) is such an accurate approximation.',
      },
    ],
  },
};
