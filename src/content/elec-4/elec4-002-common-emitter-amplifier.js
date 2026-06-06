export default {
  id: 'elec4-002',
  slug: 'common-emitter-amplifier',
  chapter: 'elec4',
  order: 2,
  title: 'Common-Emitter Amplifier',
  subtitle: 'BJT CE Configuration',
  tags: ['BJT', 'common-emitter', 'voltage gain', 'phase inversion', 'transconductance'],
  aliases: ['CE amplifier', 'BJT amplifier', 'common emitter', 'transistor amplifier'],
  timeToComplete: 25,
  coreConcept: 'The common-emitter BJT amplifier inverts and amplifies; voltage gain Av = −gm·Rc where gm = Ic/VT.',
  prerequisites: ['elec4-001', 'elec3-005'],
  nextLesson: 'elec4-003',
  hook: {
    question: 'Why does a common-emitter amplifier flip the signal upside-down?',
    realWorldContext:
      'The CE amplifier is the workhorse of discrete transistor design — it appears in guitar pedals, radio receivers, sensor front-ends, and audio preamps. Understanding its 180° phase inversion is critical for stability when multiple stages are cascaded.',
  },
  mentalModel: [
    'Common-emitter: input at base, output at collector, emitter is the shared (common) terminal — hence the name',
    'As Vin rises, base current increases → collector current Ic increases → voltage drop across Rc increases → Vout (= Vcc − Ic·Rc) falls: phase inversion',
    'Transconductance gm = ΔIc / ΔVbe = Ic / VT, where VT ≈ 26mV at room temperature — links small-signal voltage to current',
    'Small-signal voltage gain: Av = −gm·Rc (negative sign = 180° phase inversion)',
    'Input impedance Zin ≈ rπ = β/gm; output impedance Zout ≈ Rc — relatively low, limiting cascading',
  ],
  intuition: {
    prose: [
      'In the CE configuration the emitter is grounded, the base receives the input signal, and the collector delivers the amplified output. When the input voltage rises slightly, more base current flows, which causes a much larger increase in collector current. That larger current flowing through the collector resistor Rc creates a larger voltage drop, pulling the collector voltage down. So a rising input produces a falling output — a 180° phase inversion that is a fundamental signature of CE stages.',
      'The transconductance gm captures how efficiently the transistor converts an input voltage change into an output current change. Because gm = Ic/VT and VT ≈ 26mV at room temperature, a transistor biased at Ic = 1mA has gm = 1/26 ≈ 38mA/V. Multiply by Rc to get the voltage gain magnitude. This means you can design for gain by choosing Rc: a 2.6kΩ load with a 1mA bias point gives |Av| = 100.',
      'The emitter bypass capacitor Ce is crucial for AC gain. Without it, the emitter resistor Re appears in the gain formula, reducing gain by a factor of (1 + gm·Re) — useful for stability but costly in gain. The bypass capacitor short-circuits Re at AC frequencies, restoring full gm·Rc gain while preserving the DC bias stabilisation that Re provides.',
    ],
    callouts: [
      {
        type: 'insight',
        body: 'Phase inversion matters in multi-stage designs. Two CE stages in series produce 360° total phase shift (back in phase). Three stages produce 540° = 180° — this can cause oscillation if there is feedback from output back to input.',
      },
      {
        type: 'warning',
        body: 'The gain equation Av = −gm·Rc assumes an ideal current source load. In practice, the output resistance ro of the transistor appears in parallel with Rc, reducing effective gain. At low Ic, ro = VA/Ic (VA = Early voltage) can be only a few kilohms.',
      },
    ],
    visualizations: [{ type: 'AmplifierViz', props: {} }],
  },
  math: {
    prose: [
      'Transconductance: gm = Ic / VT, where VT = kT/q ≈ 26mV at 300K',
      'Small-signal voltage gain (with bypass cap): Av = −gm · Rc  (magnitude = gm·Rc)',
      'Small-signal voltage gain (without bypass cap): Av = −gm·Rc / (1 + gm·Re) ≈ −Rc/Re when gm·Re ≫ 1',
      'Input resistance: rπ = β / gm;  Output resistance: Zout ≈ Rc ∥ ro, where ro = VA / Ic',
    ],
    callouts: [
      {
        type: 'formula',
        body: 'A_v = −g_m · R_C  where g_m = I_C / V_T ≈ I_C / 0.026   (room temperature).  Example: I_C = 2mA, R_C = 2kΩ → A_v = −(2/0.026)×2000 ≈ −154.',
      },
    ],
  },
};
