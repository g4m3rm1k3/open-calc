export default {
  id: 'elec4-006',
  slug: 'inverting-amplifier',
  chapter: 'elec4',
  order: 6,
  title: 'Inverting Amplifier',
  subtitle: 'Virtual Ground & Gain Formula',
  tags: ['inverting amplifier', 'virtual ground', 'feedback resistor', 'KCL', 'summing amplifier'],
  aliases: ['inverting op-amp', 'virtual ground amplifier', 'Rf/R1 gain', 'summing amplifier'],
  timeToComplete: 20,
  coreConcept: 'The inverting op-amp amplifier uses virtual ground at the inverting input; voltage gain Av = −Rf/R1, input impedance = R1.',
  prerequisites: ['elec4-005'],
  nextLesson: 'elec4-007',
  hook: {
    question: 'How do mixing consoles add multiple audio channels together with precise gain control using just two resistors per channel?',
    realWorldContext:
      'The inverting amplifier is the fundamental building block of audio mixers, DAC output stages, PID controllers, and signal conditioning circuits. Extending it to a summing amplifier enables digital-to-analog conversion and audio mixing with a single op-amp.',
  },
  mentalModel: [
    'V+ is grounded → V− is a virtual ground (held at 0V by negative feedback, even though nothing physically connects it to ground)',
    'No current enters the op-amp input terminal (Golden Rule 2), so the current through R1 must equal the current through Rf: I1 = If',
    'I1 = (Vin − 0)/R1 = Vin/R1; If = (0 − Vout)/Rf; setting equal: Vin/R1 = −Vout/Rf → Av = −Rf/R1',
    'Input impedance of the inverting amplifier = R1 (the signal sees R1 to virtual ground)',
    'Summing amplifier: connect multiple inputs each through their own resistor to the virtual ground node; Vout = −(Rf/R1·V1 + Rf/R2·V2 + ...)',
  ],
  intuition: {
    prose: [
      'The virtual ground is the key insight of the inverting amplifier. The non-inverting input (+) is tied to actual ground. Because the op-amp has enormous open-loop gain and is configured with negative feedback, it forces V− to also sit at 0V — even though no wire connects V− to ground. This "phantom" ground node is what makes circuit analysis so straightforward: you know the voltage at the summing node without needing to know the op-amp\'s internal gain.',
      'With the virtual ground established, Kirchhoff\'s current law does the rest. The current flowing from the input through R1 to the virtual-ground node cannot enter the op-amp (Golden Rule 2), so it must flow onward through the feedback resistor Rf to the output. Writing KCL at the virtual ground node gives Vin/R1 = −Vout/Rf, which rearranges to Av = −Rf/R1. The negative sign reflects the phase inversion: a positive input drives a negative output.',
      'Extending the inverting amplifier to a summing amplifier requires only adding more input resistors to the virtual ground node. Each input source drives a current independently (because the virtual ground node is at 0V, the inputs do not interact), and the op-amp output integrates all of them. A four-input summing amplifier with binary-weighted resistors (R, 2R, 4R, 8R) converts a 4-bit digital word to an analog voltage — a rudimentary DAC. This principle is used in audio mixers, where dozens of microphone channels are summed with individual fader (gain) control.',
    ],
    callouts: [
      {
        type: 'insight',
        body: 'The input impedance of an inverting amplifier is simply R1, not the very high impedance of the op-amp itself. This means a source with significant output impedance will form a voltage divider with R1. Always make R1 large compared to the source impedance, or use a buffer stage before the inverting amplifier.',
      },
      {
        type: 'tip',
        body: 'To minimise output offset due to input bias currents, add a compensation resistor Rcomp = R1∥Rf to the non-inverting input. This ensures both inputs see the same source resistance, and the bias-current-induced voltage drops cancel. For CMOS op-amps with pA-level bias currents this is rarely needed; for BJT-input op-amps (μA-level bias) it matters significantly.',
      },
    ],
    visualizations: [{ type: 'OpAmpViz', props: { mode: 'inv' } }],
  },
  math: {
    prose: [
      'KCL at virtual ground node (V− = 0): I1 = (Vin − 0)/R1 = Vin/R1;  If = (0 − Vout)/Rf',
      'Setting I1 = If:  Vin/R1 = −Vout/Rf  →  Av = Vout/Vin = −Rf/R1',
      'Input impedance: Zin = R1  (signal source sees R1 to virtual ground)',
      'Summing amplifier output: Vout = −Rf · (V1/R1 + V2/R2 + V3/R3)',
    ],
    callouts: [
      {
        type: 'formula',
        body: 'A_v = −R_f / R_1.  Example: R_1 = 10kΩ, R_f = 100kΩ → A_v = −10 (inverting, gain of 10).  Note: input impedance = R_1 = 10kΩ, much lower than the op-amp itself.',
      },
    ],
  },
};
