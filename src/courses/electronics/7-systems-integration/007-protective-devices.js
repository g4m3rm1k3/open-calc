export default {
  id: 'elec6-007',
  slug: 'protective-devices',
  chapter: 'elec6',
  order: 7,
  title: 'Protective Devices & Coordination',
  subtitle: 'Fuses, Breakers, MOVs & TVS Diodes',
  tags: ['fuse', 'circuit breaker', 'MOV', 'TVS diode', 'overvoltage', 'overcurrent', 'coordination'],
  aliases: ['overcurrent protection', 'surge protection', 'fault protection', 'SPD'],
  timeToComplete: 22,
  coreConcept: 'Protective devices must clear faults before damage occurs. Coordination ensures only the device closest to the fault operates, leaving the rest of the system undisturbed. Speed and energy absorption must match the threat.',
  prerequisites: ['elec6-006'],
  nextLesson: 'elec6-008',
  hook: {
    question: 'A lightning surge reaches a PLC panel. The MOV at the panel entry glows and is destroyed. The PLC inside is unharmed. Was this a failure or a success?',
    realWorldContext: 'Surge protection devices are sacrificial — they absorb the energy so the load does not. Understanding the energy hierarchy from the service entrance to the sensitive load determines whether equipment survives field-level surges and lightning-induced transients.',
  },
  mentalModel: [
    'Fuses protect conductors from sustained overcurrent; their I²t rating determines how much energy they absorb before clearing — fast-blow clears quickly, slow-blow tolerates motor inrush',
    'Circuit breaker trip curves: B (3–5×rated, cold loads), C (5–10×rated, general), D (10–20×rated, transformers, motors with high inrush)',
    'MOV (metal oxide varistor) clamps voltage by conducting heavily above its clamping voltage; each surge degrades it — check for discolouration or cracking',
    'TVS diodes clamp transients in nanoseconds (faster than MOVs), essential for protecting semiconductor inputs from ESD and inductive kickback',
    'Coordination: upstream device must have a higher trip energy (higher I²t) than the downstream device; the downstream device clears the fault alone',
  ],
  intuition: {
    prose: [
      'A fuse is not a current limiter — it is an energy limiter. The I²t rating describes how much energy (ampere-squared seconds) the fuse can absorb before it opens. A fast-blow fuse has low I²t: it clears quickly but cannot tolerate the brief inrush current when a motor starts. A slow-blow fuse has high I²t: it tolerates inrush for hundreds of milliseconds but still clears a sustained overload. Choosing the wrong type is the most common fuse application error.',
      'Surge protection follows a distance rule: the first SPD at the service entrance (Class 1) handles the bulk of a lightning strike — kilojoules of energy. The second SPD at the distribution panel (Class 2) handles the residual — hundreds of joules. The third SPD at the sensitive equipment (Class 3) handles the remnant — joules. Each stage clamps to a lower voltage than the previous. Without this cascade, a Class 3 device at the equipment would be overwhelmed by a direct lightning-induced surge, but a Class 1 device alone cannot clamp voltage low enough to protect a microcontroller.',
      'A crowbar circuit is the semiconductor equivalent of a short-circuit across the supply rail. When the monitored voltage exceeds a threshold, a thyristor (SCR) fires and holds the supply near zero until a fuse or breaker clears the fault. This protects loads that cannot tolerate even a brief overvoltage — laboratory power supplies, aerospace electronics, and medical devices. The crowbar is unconditional: once triggered, it latches until power is cycled, ensuring the fault is investigated before restart.',
    ],
    callouts: [
      { type: 'warning', body: 'A MOV does not fail open — it fails short or open depending on the energy involved. A short-circuit failure means the protected circuit is now permanently connected to ground through the MOV, which may blow the fuse or breaker. Always use a fuse in series with MOVs in critical applications so a failed MOV does not take out the supply.' },
      { type: 'insight', body: 'TVS diodes are rated in peak pulse power (e.g., 600W for 1ms), not continuous power. A 600W TVS can absorb a 1ms transient but only 0.6W continuously. Always check the pulse width of your threat against the TVS datasheet waveform.' },
    ],
    visualizations: [{ type: 'DiodeViz', props: {} }],
  },
  math: {
    prose: [
      'Fuse I²t: energy = I² × t (A²·s); a 10A fast-blow fuse might have I²t = 10 A²·s; a 10A slow-blow might have I²t = 1000 A²·s — 100× more energy tolerance',
      'MOV energy absorption: E = P_peak × t_pulse; a 14mm MOV rated 140J can absorb a 1kA, 8/20µs lightning waveform (standard test pulse) without failure',
      'TVS clamping: V_clamp = V_BR × (1 + tolerance); a 5.0SMDJ18A (18V bidirectional) clamps at ≤29.2V at 10A peak pulse current',
      'Coordination check: I²t of upstream device must exceed I²t of downstream device at the fault current level; use time-current characteristic curves to verify selectivity',
    ],
    callouts: [
      { type: 'formula', body: 'Crowbar trigger threshold: V_trigger = V_nominal × (1 + overvoltage_fraction); for a 5V rail, set trigger at 5.5–6V. After crowbar fires, I_fault = V_supply / R_series; ensure this current is within fuse clearing capability.' },
    ],
  },
};
