export default {
  id: 'elec5-002',
  slug: 'antennas',
  chapter: 'elec5',
  order: 2,
  title: 'Antennas',
  subtitle: 'Dipoles, Gain & Radiation Patterns',
  tags: ['antenna', 'dipole', 'gain', 'radiation pattern', 'directivity', 'Yagi', 'monopole'],
  aliases: ['dipole antenna', 'antenna gain', 'radiation pattern', 'Yagi antenna', 'dBi'],
  timeToComplete: 22,
  coreConcept: 'Antennas convert between electrical signals and electromagnetic waves; gain describes directional concentration of radiated power relative to an isotropic reference (0 dBi).',
  prerequisites: ['elec5-001'],
  nextLesson: 'elec5-003',
  hook: {
    question: 'Why does a WiFi router have stubby rubber antennas while a TV broadcast tower uses a giant steel lattice — they both send electromagnetic waves?',
    realWorldContext: 'From the rubber duck antenna on a walkie-talkie to the massive dish on a satellite ground station, every antenna is engineered around the same electromagnetic principles — wavelength, impedance, and radiation pattern.',
  },
  mentalModel: [
    'A half-wave dipole (λ/2) is the fundamental antenna; its radiation pattern is a toroidal doughnut shape broadside to the element',
    'Antenna gain G (in dBi) measures how much power is concentrated in a preferred direction compared to a perfect isotropic radiator',
    'Directivity means focusing radiated power like a flashlight vs a bare bulb — gain increases in one direction but decreases in others',
    'Beamwidth (half-power or 3dB beamwidth) is the angular width of the main lobe; narrow beamwidth = high gain = more directional',
    'Front-to-back ratio compares power radiated toward the front vs the rear — critical for rejecting interference from behind',
  ],
  intuition: {
    prose: [
      'An antenna is a transducer — it converts the oscillating voltage and current in your transmitter into electromagnetic waves in space, and in reverse, it captures passing waves and converts them back into tiny voltages for your receiver. The half-wave dipole is the simplest resonant antenna: two conductors each λ/4 long, fed at the centre. Its radiation pattern looks like a doughnut lying flat around the antenna wire.',
      'Gain is often misunderstood. Antennas cannot amplify power — they are purely passive devices. What they can do is concentrate power spatially, like squeezing a balloon: push it in from the sides and it bulges up and down. A 6dBi gain antenna radiates four times as much power in its preferred direction compared to an isotropic antenna with the same transmitter power. That extra punch comes at the cost of reduced radiation in other directions.',
      'The Yagi-Uda antenna (the old TV rooftop antenna) is a perfect example of trading omnidirectional coverage for high gain. A driven dipole element is surrounded by a reflector behind it and several parasitic director elements in front. The directors steer energy forward, producing gains of 10–15 dBi. A WiFi omni antenna gives 360° coverage at 2–3 dBi; a directional Yagi points at one access point but gives 12+ dBi — useful for long outdoor links.',
    ],
    callouts: [
      { type: 'insight', body: 'A Marconi (monopole) antenna is a dipole cut in half, mounted over a ground plane. The ground plane acts as a mirror, creating an electrical image of the missing half. Quarter-wave monopoles are used in car radio antennas and mobile phones.' },
      { type: 'tip', body: 'dBi vs dBd: dBi references an isotropic radiator; dBd references a half-wave dipole (2.15 dBi). Manufacturers sometimes quote dBd to make gains look smaller. Always check which reference is being used.' },
    ],
    visualizations: [{ type: 'WaveModViz', props: { mode: 'am' } }],
  },
  math: {
    prose: [
      'Half-wave dipole length: L = λ/2 = c/(2f) — physical element length for resonance',
      'Antenna gain in dBi: G(dBi) = 10·log₁₀(Directivity) — for a half-wave dipole, G ≈ 2.15 dBi',
      'Effective isotropic radiated power: EIRP = Pt · Gt  (or in dB: EIRP_dBm = Pt_dBm + Gt_dBi)',
      'Effective aperture of receiving antenna: Ae = G·λ² / (4π) — relates received power to incident power density',
    ],
    callouts: [
      { type: 'formula', body: 'G(dBi) = 10 log₁₀(Directivity)\nHalf-wave dipole: G = 2.15 dBi\nEIRP(dBm) = P_TX(dBm) + G_TX(dBi)' },
    ],
  },
};
