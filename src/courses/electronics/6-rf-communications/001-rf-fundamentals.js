export default {
  id: 'elec5-001',
  slug: 'rf-fundamentals',
  chapter: 'elec5',
  order: 1,
  title: 'RF Fundamentals',
  subtitle: 'Frequency Spectrum, Wavelength & RF vs Baseband',
  tags: ['RF', 'frequency spectrum', 'wavelength', 'radio waves', 'electromagnetic spectrum'],
  aliases: ['radio frequency', 'electromagnetic spectrum', 'wavelength formula'],
  timeToComplete: 20,
  coreConcept: 'RF signals are electromagnetic waves above ~20kHz; wavelength λ = c/f; the spectrum spans MF through EHF bands.',
  prerequisites: ['elec4-001'],
  nextLesson: 'elec5-002',
  hook: {
    question: 'Why does your WiFi router use 2.4GHz and 5GHz — not 100MHz or 10GHz?',
    realWorldContext: 'Every wireless device — phone, WiFi, Bluetooth, GPS, microwave — occupies a specific frequency band chosen for propagation, antenna size, and interference avoidance.',
  },
  mentalModel: [
    'All radio signals are electromagnetic waves travelling at the speed of light c = 3×10⁸ m/s',
    'Wavelength: λ = c/f — higher frequency means shorter wavelength and smaller antennas',
    'RF spectrum: MF(300kHz–3MHz) → HF(3–30MHz) → VHF(30–300MHz) → UHF(300MHz–3GHz) → SHF(3–30GHz)',
    'Baseband signal = original information signal (audio, data); RF carrier = the wave that transports it through space',
    'Skin effect: RF currents flow on the outer surface of conductors — this is why shielding and coaxial cables are essential at RF frequencies',
  ],
  intuition: {
    prose: [
      'Think of radio waves as ripples spreading across a pond. The transmitter is the stone you drop; the ripples are electromagnetic waves expanding outward at the speed of light. Every broadcast station, smartphone, and satellite is just throwing stones at specific, carefully chosen frequencies.',
      'Frequency determines everything about a radio link: how far waves travel, how big your antenna must be, and how much data you can send. Low frequencies like AM radio travel thousands of miles by bouncing off the ionosphere but carry little data. High frequencies like 5G mmWave carry gigabits per second but barely penetrate a single wall.',
      'Wavelength is the physical length of one complete wave cycle in space. A 100MHz FM signal has λ = 3m, so a quarter-wave antenna must be 75cm long — that is exactly why FM car antennas are about that height. As frequencies climb into the GHz range, wavelengths shrink to centimetres, enabling tiny antennas inside every phone.',
    ],
    callouts: [
      { type: 'insight', body: 'Antenna length is determined by wavelength — typically λ/4 or λ/2. This is why phone antennas got dramatically smaller as cellular frequencies moved from 450MHz up to 1.8GHz and beyond.' },
      { type: 'tip', body: 'Quick mental shortcut: λ(metres) ≈ 300 / f(MHz). So 300MHz → 1m, 3GHz → 10cm, 30GHz → 1cm. Memorise this ratio and you can size antennas in your head.' },
    ],
    visualizations: [{ type: 'WaveModViz', props: { mode: 'am' } }],
  },
  math: {
    prose: [
      'Speed of light in free space: c = 3×10⁸ m/s (more precisely 2.998×10⁸ m/s)',
      'Wavelength-frequency relationship: λ = c / f — wavelength in metres, frequency in Hz',
      'Half-wave dipole antenna physical length: L = λ/2 = c/(2f)',
      'Frequency band boundaries: VHF = 30–300 MHz (λ = 1–10m), UHF = 300MHz–3GHz (λ = 10cm–1m), SHF = 3–30GHz (λ = 1–10cm)',
    ],
    callouts: [
      { type: 'formula', body: 'λ = c / f = 3×10⁸ / f   (λ in metres, f in Hz)\nShortcut: λ(m) ≈ 300 / f(MHz)' },
    ],
  },
  quiz: [
    {
      id: 'q1',
      type: 'choice',
      text: 'A WiFi router transmits at 2.4 GHz. What is the wavelength of this signal?',
      options: [
        'About 12.5 cm — λ = c/f = 3×10⁸ / 2.4×10⁹ ≈ 0.125 m',
        'About 1.25 m — using λ(m) ≈ 300/f(MHz) = 300/2400',
        'About 7.2 m — multiply frequency by the speed of light',
      ],
      correct: 0,
    },
    {
      id: 'q2',
      type: 'choice',
      text: 'Why do 5G mmWave signals (28 GHz) carry more data than 4G signals (700 MHz)?',
      options: [
        'Higher frequency signals travel faster, allowing more data to be sent in the same time',
        'Higher carrier frequency provides more available bandwidth — the spectrum around 28 GHz can support wider channels (400–800 MHz wide) carrying gigabits per second, while narrow 700 MHz channels are limited to a few MHz of bandwidth',
        'mmWave uses quantum tunneling through walls, giving better indoor penetration and speed',
      ],
      correct: 1,
    },
    {
      id: 'q3',
      type: 'choice',
      text: 'An FM radio station broadcasts at 100 MHz. Why is a car antenna approximately 75 cm long?',
      options: [
        'Car aerodynamics require antennas shorter than 1 m to reduce drag at highway speeds',
        'At 100 MHz, λ = 3 m; a quarter-wave antenna (λ/4) is 75 cm — this length resonates at the signal frequency, maximizing reception',
        'Government regulations restrict FM antennas to 75 cm for interference prevention',
      ],
      correct: 1,
    },
    {
      id: 'q4',
      type: 'choice',
      text: 'What is the difference between a "baseband" signal and an "RF carrier"?',
      options: [
        'Baseband is the digital version of a signal; RF is the analog version of the same information',
        'Baseband is the original information signal (audio, data) at low frequency; the RF carrier is a high-frequency electromagnetic wave that transports the baseband information through space',
        'Baseband signals travel through wires; RF carriers are the same signals filtered for wireless transmission',
      ],
      correct: 1,
    },
  ],
};
