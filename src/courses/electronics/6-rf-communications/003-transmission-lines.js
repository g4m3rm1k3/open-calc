export default {
  id: 'elec5-003',
  slug: 'transmission-lines',
  chapter: 'elec5',
  order: 3,
  title: 'Transmission Lines',
  subtitle: 'Characteristic Impedance, SWR & Matching',
  tags: ['transmission line', 'characteristic impedance', 'SWR', 'impedance matching', 'coax', 'reflection coefficient'],
  aliases: ['coaxial cable', 'SWR meter', 'standing wave ratio', 'impedance matching', '50 ohm'],
  timeToComplete: 25,
  coreConcept: 'A transmission line has characteristic impedance Z₀ = √(L/C); mismatches cause reflections measured by SWR; maximum power transfer requires ZL = Z₀.',
  prerequisites: ['elec5-002'],
  nextLesson: 'elec5-004',
  hook: {
    question: 'Why does RF coaxial cable come in 50Ω and 75Ω varieties — and does it actually matter if you mix them up?',
    realWorldContext: 'Every cable, PCB trace, and connector at RF frequencies is a transmission line. Using the wrong impedance creates reflections that waste power, cause hot spots, and can even damage transmitters.',
  },
  mentalModel: [
    'A transmission line has distributed inductance L (H/m) and capacitance C (F/m) along its length — its characteristic impedance Z₀ = √(L/C) is independent of length',
    'When ZL ≠ Z₀, some energy is reflected back toward the source — the reflection coefficient Γ = (ZL − Z₀)/(ZL + Z₀)',
    'Standing wave ratio SWR = (1 + |Γ|)/(1 − |Γ|) quantifies mismatch: SWR = 1 is perfect match, SWR > 2 wastes significant power',
    'Impedance matching (using L-networks, transformers, or stub tuners) maximises power transfer from source to load',
    '50Ω is the RF standard (compromise between minimum loss and maximum power handling in coax); 75Ω is used for video and cable TV (lower loss at lower power)',
  ],
  intuition: {
    prose: [
      'A transmission line is not just a wire — it is a carefully engineered structure where the electric and magnetic fields travel together as a wave. At audio frequencies a wire is just a wire, but at RF the signal wavelength can be shorter than the cable itself, so the voltage and current vary along the cable length. The characteristic impedance Z₀ is a property of the line geometry, not its length; it is set by the ratio of conductor diameters in coax and the spacing in twin-lead.',
      'When a wave travelling down a transmission line encounters a load with a different impedance, it is like a wave on a rope hitting a wall — part of the energy is transmitted into the load, but part bounces back. These forward and reflected waves add to create standing waves: fixed nodes of minimum voltage and antinodes of maximum voltage along the cable. A high SWR means large voltage swings that can arc across connectors or overheat the cable dielectric.',
      'Impedance matching is the art of making the load look like Z₀ to the source. Simple L-networks using two reactive components can transform any real impedance to 50Ω. A quarter-wave transformer (a section of line with Z₁ = √(Z₀·ZL)) is an elegant single-frequency matching technique used everywhere from PCB traces to waveguide transitions. Ham radio operators use antenna tuners (transmatch networks) to match antennas with high SWR — the tuner brings the SWR down to nearly 1:1 at the transmitter output.',
    ],
    callouts: [
      { type: 'insight', body: 'A perfectly matched line (SWR = 1:1) delivers all available transmitter power to the antenna. At SWR = 3:1, about 25% of power is reflected. At SWR = 10:1, roughly 67% is reflected — nearly all power bounces back to the transmitter.' },
      { type: 'tip', body: 'RF connectors matter. BNC, SMA, N-type, and TNC are all 50Ω. F-type (used on cable TV) is 75Ω. Mixing connector types with mismatched impedances causes reflections at every junction — keep the system impedance consistent end-to-end.' },
    ],
    visualizations: [{ type: 'WaveModViz', props: { mode: 'am' } }],
  },
  math: {
    prose: [
      'Characteristic impedance: Z₀ = √(L/C) where L = inductance per unit length (H/m), C = capacitance per unit length (F/m)',
      'Reflection coefficient: Γ = (ZL − Z₀) / (ZL + Z₀) — complex number; |Γ| ranges from 0 (perfect match) to 1 (open or short)',
      'Standing wave ratio: SWR = (1 + |Γ|) / (1 − |Γ|) — ranges from 1 (matched) to ∞ (total reflection)',
      'Quarter-wave impedance transformer: Z₁ = √(Z₀ · ZL) — a λ/4 line section with this impedance transforms ZL to Z₀',
    ],
    callouts: [
      { type: 'formula', body: 'Z₀ = √(L/C)\nΓ = (ZL − Z₀) / (ZL + Z₀)\nSWR = (1 + |Γ|) / (1 − |Γ|)' },
    ],
  },
  quiz: [
    {
      id: 'q1',
      type: 'choice',
      text: 'A 50Ω coaxial cable connects a transmitter to a 150Ω antenna. What is the reflection coefficient Γ?',
      options: [
        '0.5 — Γ = (ZL − Z₀) / (ZL + Z₀) = (150 − 50) / (150 + 50) = 100/200 = 0.5',
        '3.0 — reflection coefficient equals the SWR for resistive loads',
        '0 — the reflection coefficient is only nonzero for reactive (capacitive or inductive) loads',
      ],
      correct: 0,
    },
    {
      id: 'q2',
      type: 'choice',
      text: 'An antenna system has SWR = 3:1. What fraction of transmitter power is reflected back from the antenna?',
      options: [
        '33% — SWR directly gives the reflected fraction',
        '25% — |Γ| = (SWR−1)/(SWR+1) = (3−1)/(3+1) = 0.5; reflected power = |Γ|² = 0.25 = 25%',
        '67% — most power is reflected at SWR > 2',
      ],
      correct: 1,
    },
    {
      id: 'q3',
      type: 'choice',
      text: 'Why is the characteristic impedance of a coaxial cable independent of its length?',
      options: [
        'Cable length doesn\'t affect impedance because resistance per meter is constant for a given wire gauge',
        'Z₀ = √(L/C) depends only on the inductance and capacitance per unit length — which are determined by the cable geometry (conductor diameters, dielectric), not the total length of cable',
        'Characteristic impedance is a measured value specified by the manufacturer; its independence of length is a regulatory requirement, not a physical property',
      ],
      correct: 1,
    },
    {
      id: 'q4',
      type: 'choice',
      text: 'A 50Ω transmitter is connected to a 200Ω antenna. You insert a λ/4 impedance matching transformer section. What should its characteristic impedance be?',
      options: [
        '125Ω — average of 50Ω and 200Ω',
        '100Ω — Z₁ = √(Z₀ × ZL) = √(50 × 200) = √10000 = 100Ω',
        '10kΩ — multiply the two impedances together',
      ],
      correct: 1,
    },
  ],
};
