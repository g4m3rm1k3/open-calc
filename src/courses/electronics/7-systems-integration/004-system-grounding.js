export default {
  id: 'elec6-004',
  slug: 'system-grounding',
  chapter: 'elec6',
  order: 4,
  title: 'System Grounding & Earthing',
  subtitle: 'Safety Earth, Signal Ground & Ground Loops',
  tags: ['grounding', 'earthing', 'ground loop', 'star ground', 'EMC'],
  aliases: ['earth connection', 'signal reference', 'ground plane', 'chassis ground'],
  timeToComplete: 22,
  coreConcept: 'Ground is never perfectly at zero volts. Every ground connection has impedance; current through that impedance creates voltage differences that corrupt measurements and cause noise. Topology — star vs daisy-chain — determines whether those differences matter.',
  prerequisites: ['elec6-003'],
  nextLesson: 'elec6-005',
  hook: {
    question: 'You connect a sensor to your data acquisition system and the signal shows 50/60Hz noise even though the sensor is working perfectly. What is happening?',
    realWorldContext: 'Ground loops are responsible for a significant fraction of measurement noise in industrial and audio systems. Understanding their mechanism means you can eliminate them in minutes rather than spending days chasing ghost signals.',
  },
  mentalModel: [
    'Safety earth (PE) provides a fault current return path to trip breakers — it is never used as a signal return',
    'Signal ground is the voltage reference for all measurements; its integrity determines measurement accuracy',
    'Ground loops form when two pieces of equipment connect at two different ground points that are at different potentials — current circulates and appears as noise',
    'Star grounding: all grounds return to a single point; daisy-chaining creates voltage drops along the chain that affect downstream circuits',
    'At high frequencies (>1MHz), multi-point grounding to a solid ground plane beats star grounding because inductance, not resistance, dominates',
  ],
  intuition: {
    prose: [
      'Imagine the ground conductor as a pipe carrying water. Even a very large pipe has some resistance to flow. When current flows through it, Ohm\'s law creates a voltage drop. Now imagine two instruments sharing that pipe as their ground reference — each sees a different voltage at its ground pin. Any signal measured across these two grounds contains that voltage difference as noise. This is the ground loop: a loop of conductor enclosing changing magnetic flux, which induces a voltage by Faraday\'s law.',
      'The star grounding topology solves the problem by ensuring all ground currents return independently to a single node. No current from one circuit flows through the ground return of another. It is the electrical equivalent of a hub-and-spoke road network: traffic from one suburb never passes through another. The central node — the star point — must be located carefully, usually at the main power supply negative terminal or at the chassis entry point for mains systems.',
      'Industrial 4-20mA current loops are inherently immune to ground noise because the signal is encoded as a current, not a voltage. The receiver measures current, not voltage difference. Any common-mode noise voltage appears equally on both conductors and cancels at the differential receiver. Balanced audio lines (XLR connectors) use the same principle. When you need to break a ground loop in existing equipment, an isolation transformer or a common-mode choke on the signal cable achieves the same differential rejection without rewiring.',
    ],
    callouts: [
      { type: 'insight', body: 'The quickest test for a ground loop: lift one end of the shield connection and see if the noise disappears. If it does, you have confirmed a ground loop — now design the proper fix rather than leaving the shield floating.' },
      { type: 'warning', body: 'Never disconnect the safety earth (PE/protective earth) to eliminate noise. Use isolation or balanced signalling instead. An ungrounded equipment chassis can charge to mains potential during a fault and electrocute the next person who touches it.' },
    ],
    visualizations: [{ type: 'DCCircuitViz', props: {} }],
  },
  math: {
    prose: [
      'Ground loop noise voltage: V_noise = I_loop × R_ground, where I_loop is the circulating current induced by stray magnetic flux; even milliohm ground resistances cause microvolts to millivolts of noise at power-line frequencies',
      'Common-mode rejection: CMRR (dB) = 20 log(A_differential / A_common-mode); a good instrumentation amp has CMRR > 100dB, meaning common-mode noise is reduced by 100,000×',
      'Ground plane resistance: R = ρ × L / (W × t); a 10cm × 10cm copper plane (1oz, 35µm) has sheet resistance ~0.5mΩ/square — negligible for DC but not for RF',
      'Isolation transformer rejection: a 1:1 isolation transformer with 1MΩ interwinding resistance and 10pF parasitic capacitance passes only I = V × 2πfC ≈ 3µA at 50Hz — effectively breaking low-frequency ground loops',
    ],
    callouts: [
      { type: 'formula', body: 'Ground loop induced EMF: V = -dΦ/dt = -A × dB/dt. A 0.1m² loop in a 50Hz field of 1mT peak creates V_peak = 2π×50×0.1×0.001 ≈ 31mV — easily overwhelming millivolt sensor signals.' },
    ],
  },
  quiz: [
    {
      id: 'q1',
      type: 'choice',
      text: 'A sensor in Building A is connected to a data logger in Building B. The signal has persistent 50 Hz noise even though the sensor and cable are shielded. What is the most likely cause?',
      options: [
        'The cable shield is picking up radiated 50 Hz magnetic fields from nearby power cables',
        'A ground loop — the two buildings have separate earth connections at slightly different potentials; current circulates around the loop formed by the signal cable, the sensor ground, and the building earth connections, inducing noise voltage into the measurement',
        'The sensor\'s output impedance is too high, making the signal line susceptible to capacitive coupling',
      ],
      correct: 1,
    },
    {
      id: 'q2',
      type: 'choice',
      text: 'You discover that disconnecting the safety earth (PE) from a piece of equipment eliminates the 50 Hz noise on its signal output. Why is this not an acceptable fix?',
      options: [
        'Disconnecting PE is acceptable as long as the equipment is labelled "isolated" and placed behind a safety barrier',
        'The safety earth provides the fault current return path that trips the breaker during an insulation failure — without it, the equipment chassis can charge to mains potential, creating a lethal shock hazard for anyone who touches it; fix the noise with isolation or balanced signalling instead',
        'Removing PE will increase noise in other equipment on the same supply, so the fix only moves the problem elsewhere',
      ],
      correct: 1,
    },
    {
      id: 'q3',
      type: 'choice',
      text: 'A measurement system has five sensors daisy-chained to a single ground bus, one sensor per tap point along the bus. Sensor 5 reads 12 mV higher than expected. What grounding topology would eliminate this error?',
      options: [
        'Add a larger-diameter ground conductor so the resistance is lower and the voltage drop is negligible',
        'Star grounding — run a separate return wire from each sensor directly to a single ground point; daisy-chaining means every sensor shares the ground impedance of all upstream connections, and the cumulative voltage drop corrupts downstream measurements',
        'Use a differential amplifier at sensor 5 to cancel the common-mode offset introduced by the ground bus',
      ],
      correct: 1,
    },
    {
      id: 'q4',
      type: 'choice',
      text: 'A star grounding topology works well for audio and low-frequency instrumentation. Why does the same star topology fail at RF frequencies above 1 MHz?',
      options: [
        'At high frequencies, the star point becomes a common impedance that couples all circuits together, defeating the purpose of separate returns',
        'Above 1 MHz, the inductance of the long ground leads (roughly 1 nH/mm) dominates over their resistance — a 10 cm lead has ~100 nH of impedance at 160 MHz, making it a poor reference; a solid multi-point ground plane provides many parallel low-inductance paths to a uniform reference',
        'RF ground currents are too large for star wiring to carry; only heavy copper bus bars can handle the current without resistance drop',
      ],
      correct: 1,
    },
  ],
};
