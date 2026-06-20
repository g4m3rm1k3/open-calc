export default {
  id: 'elec6-005',
  slug: 'emc-and-emi',
  chapter: 'elec6',
  order: 5,
  title: 'EMC & EMI Fundamentals',
  subtitle: 'Emissions, Immunity, Shielding & Filtering',
  tags: ['EMC', 'EMI', 'shielding', 'filtering', 'ferrite', 'conducted emissions', 'radiated emissions'],
  aliases: ['electromagnetic compatibility', 'electromagnetic interference', 'RF interference', 'EMC compliance'],
  timeToComplete: 25,
  coreConcept: 'EMC requires that a device neither emits excessive electromagnetic energy nor malfunctions when exposed to external fields. Both goals are addressed by the same three tools: filtering, shielding, and good PCB layout.',
  prerequisites: ['elec6-004'],
  nextLesson: 'elec6-006',
  hook: {
    question: 'A new switching power supply makes the AM radio in the same room unintelligible. The supply passed its bench tests. Why is it causing interference and what can you do about it?',
    realWorldContext: 'CE and FCC compliance testing is legally required before selling electronic products. Failing the test late in development costs tens of thousands of dollars in re-spins. Engineers who understand EMC fundamentals bake compliance in from day one.',
  },
  mentalModel: [
    'Every fast-switching signal is a broadband noise source — rise time determines bandwidth: BW ≈ 0.35/t_rise',
    'Conducted emissions travel along power and signal cables; radiated emissions propagate through the air as electromagnetic waves',
    'Common-mode current flows the same direction on all conductors of a cable — it is the primary source of radiated emissions and is suppressed by ferrite beads and common-mode chokes',
    'Shielding effectiveness depends on material conductivity, permeability, and thickness relative to skin depth; a gap or seam in the shield degrades it dramatically',
    'Decoupling capacitors placed at every IC power pin kill high-frequency conducted emissions by providing a local charge reservoir that prevents supply rail voltage spikes from propagating',
  ],
  intuition: {
    prose: [
      'Every switching edge — whether from a microcontroller clock, a MOSFET gate, or a relay coil — injects a burst of energy across a wide frequency band. The faster the edge, the wider the spectrum. A 10ns rise time produces significant spectral content up to 35MHz; a 1ns rise time reaches to 350MHz. This is why modern switching power supplies, which switch at hundreds of kilohertz with nanosecond edges, generate noise that covers broadcast radio, cellular, and WiFi bands simultaneously. The cure is not to slow everything down — it is to contain the noise at its source.',
      'Think of your circuit board as an antenna farm. Any conductor carrying a changing current radiates. Differential-mode currents (equal and opposite on the two wires of a pair) produce fields that cancel at a distance. Common-mode currents (flowing the same direction on all conductors) produce fields that add. A ferrite bead placed over a cable presents high impedance to common-mode currents while passing differential-mode signal currents unchanged. This is why ferrite clamps on laptop power bricks are not decorative.',
      'A Faraday cage blocks electric fields and, at sufficiently high frequencies, magnetic fields too. But a cage is only as good as its worst seam. A single unshielded aperture of length L acts as a slot antenna with resonant frequency f = c/(2L). A 15cm opening resonates at 1GHz. This is why proper RF enclosures use continuous conductive gaskets, not just bolted flanges, and why cable penetrations use filtered connectors rather than bare holes in the wall.',
    ],
    callouts: [
      { type: 'insight', body: 'Place 100nF ceramic decoupling capacitors as close as physically possible to every IC VCC pin. The parasitic inductance of a 5mm trace is ~5nH, which forms a resonant tank with the capacitor and may amplify certain frequencies instead of suppressing them.' },
      { type: 'warning', body: 'Variable frequency drives (VFDs) inject common-mode current back onto the motor cable at the PWM switching frequency and its harmonics. Always install a dV/dt filter or a common-mode choke on the VFD output cable, and use screened motor cable with the screen bonded at both ends.' },
    ],
    visualizations: [{ type: 'WaveModViz', props: {} }],
  },
  math: {
    prose: [
      'Noise bandwidth from switching edge: BW (Hz) ≈ 0.35 / t_rise (s) — 10ns edges create broadband noise to 35MHz',
      'Shielding effectiveness: SE (dB) = 20 log(E_incident / E_transmitted); copper at 1MHz has SE > 100dB for plane waves but SE drops to ~20dB near seams or apertures',
      'Skin depth: δ = √(ρ / πfμ); copper at 100MHz has δ ≈ 6.6µm — beyond one skin depth, currents are attenuated by e^(-1) ≈ 37%; foil thicker than 5δ provides excellent shielding',
      'Ferrite bead impedance: typically modelled as series R + jωL; at its peak impedance frequency (often 100MHz) the bead appears as a pure resistance of 100–600Ω, dissipating common-mode noise rather than reflecting it',
    ],
    callouts: [
      { type: 'formula', body: 'Radiated emission field strength approximation: E (V/m) ≈ (I × A × f²) / (0.159 × r × c²), where I is loop current, A is loop area, f is frequency, r is distance. Reducing loop area is the most powerful design lever.' },
    ],
  },
  quiz: [
    {
      id: 'q1',
      type: 'choice',
      text: 'A microcontroller has a clock at 100 MHz and its I/O lines switch with 2 ns rise times. Up to approximately what frequency does this circuit generate significant radiated noise?',
      options: [
        '100 MHz — only the fundamental clock frequency generates significant emissions',
        '175 MHz — noise bandwidth ≈ 0.35 / t_rise = 0.35 / 2 ns = 175 MHz; fast edges generate broadband noise well above the clock frequency, covering FM broadcast, cellular, and WiFi bands simultaneously',
        '500 MHz — all digital circuits emit noise up to 5× their clock frequency regardless of rise time',
      ],
      correct: 1,
    },
    {
      id: 'q2',
      type: 'choice',
      text: 'A ferrite bead is installed on a USB cable to reduce EMI. What current does the bead suppress, and what current does it leave unchanged?',
      options: [
        'The bead suppresses high-frequency differential-mode signal currents and leaves the low-frequency common-mode currents unchanged',
        'The bead suppresses common-mode currents (flowing the same direction on all conductors) which are the primary source of radiated EMI, while leaving differential-mode signal currents (equal and opposite) unchanged — this is why ferrite clamps on cables reduce radiated emissions without affecting data',
        'The bead equally reduces both common-mode and differential-mode currents; the effect on signal quality is acceptable because data is encoded with redundancy',
      ],
      correct: 1,
    },
    {
      id: 'q3',
      type: 'choice',
      text: 'A metal enclosure provides good shielding on five sides, but a 15 cm unsealed slot runs along the seam on one face. What RF problem does this create?',
      options: [
        'The slot increases the enclosure\'s thermal resistance, causing internal components to overheat and emit more EMI',
        'A 15 cm slot acts as a half-wave slot antenna resonant at approximately 1 GHz — at resonance, the slot radiates internal emissions efficiently and also admits external interference, degrading shielding effectiveness to near zero at that frequency',
        'The slot allows convection airflow that creates charge separation, generating electrostatic discharge internally',
      ],
      correct: 1,
    },
    {
      id: 'q4',
      type: 'choice',
      text: 'A 100 nF decoupling capacitor is placed on the PCB but connected to an IC\'s VCC pin via a 5 mm trace. Why might this fail to suppress high-frequency noise effectively?',
      options: [
        'A 100 nF capacitor is too large for high-frequency decoupling; values below 10 nF are needed above 10 MHz',
        'The 5 mm trace adds approximately 5 nH of inductance in series with the capacitor, forming an LC resonant circuit that may amplify rather than suppress noise at the resonant frequency — place the capacitor\'s pads as close as physically possible to the IC VCC and GND pins to minimise trace inductance',
        'Ceramic capacitors self-resonate above 1 MHz and become inductive, making them useless for decoupling regardless of placement',
      ],
      correct: 1,
    },
  ],
};
