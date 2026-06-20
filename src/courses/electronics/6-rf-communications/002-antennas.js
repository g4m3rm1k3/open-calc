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
  quiz: [
    {
      id: 'q1',
      type: 'choice',
      text: 'An antenna is rated at 10 dBi gain. A student says "this antenna amplifies my transmitter power by 10×." What is wrong with this statement?',
      options: [
        'The antenna amplifies by 10× — dBi directly gives the power multiplication factor',
        'Antennas are passive — they cannot amplify power. 10 dBi means the antenna concentrates radiated power 10× in its preferred direction by reducing power in other directions, not by adding energy',
        'The student is wrong about the direction — 10 dBi means power is reduced by 10× in the preferred direction compared to an isotropic radiator',
      ],
      correct: 1,
    },
    {
      id: 'q2',
      type: 'choice',
      text: 'A Yagi antenna has 12 dBi gain and narrow beamwidth. What is the tradeoff compared to a 2 dBi omnidirectional antenna?',
      options: [
        'The Yagi can only transmit; it cannot receive signals',
        'The Yagi concentrates far more power toward one target (useful for long-distance point-to-point links) but has very limited coverage angle — if the target moves off-axis, signal drops sharply. The omni covers all directions but with much lower power density in any one direction',
        'The Yagi operates only at higher frequencies while the omni works across all bands',
      ],
      correct: 1,
    },
    {
      id: 'q3',
      type: 'choice',
      text: 'A car radio monopole antenna is a quarter-wave element mounted on the car roof. How does the car body contribute to the antenna\'s operation?',
      options: [
        'The car body shields the antenna from interference, improving signal-to-noise ratio',
        'The metal car roof acts as a ground plane, creating an electrical mirror image of the missing half of the dipole — the monopole plus its image together behave like a full half-wave dipole',
        'The car body absorbs the antenna\'s reactive near-field, converting it to useful current in the antenna element',
      ],
      correct: 1,
    },
    {
      id: 'q4',
      type: 'choice',
      text: 'A transmitter outputs 1W and uses an antenna with 6 dBi gain. What is the EIRP (Effective Isotropic Radiated Power) in the antenna\'s main beam?',
      options: [
        '6W — EIRP = transmit power × gain (dBi)',
        '4W — 6 dBi represents a factor of 4 in power (10^(6/10) ≈ 4); EIRP = 1W × 4 = 4W',
        '7W — add the gain directly to the transmit power',
      ],
      correct: 1,
    },
  ],
};
