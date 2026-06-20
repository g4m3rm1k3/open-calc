export default {
  id: 'elec5-004',
  slug: 'wave-propagation',
  chapter: 'elec5',
  order: 4,
  title: 'Wave Propagation',
  subtitle: 'Ground Wave, Sky Wave & Line-of-Sight',
  tags: ['propagation', 'ground wave', 'sky wave', 'ionosphere', 'line-of-sight', 'Friis', 'free-space path loss'],
  aliases: ['ionospheric skip', 'Friis equation', 'free space path loss', 'FSPL', 'radio propagation', 'DX'],
  timeToComplete: 22,
  coreConcept: 'Radio waves propagate via ground wave (low HF), sky wave ionospheric skip (HF), or line-of-sight (VHF+); free-space path loss FSPL = 20log(4πd/λ) dominates all links.',
  prerequisites: ['elec5-003'],
  nextLesson: 'elec5-005',
  hook: {
    question: 'Why can you pick up AM radio stations from hundreds of miles away at night, but the same station barely reaches 50 miles during the day?',
    realWorldContext: 'Long-range shortwave broadcasts, over-the-horizon radar, satellite downlinks, and 5G small cells all depend on understanding which propagation mechanism dominates at their frequency.',
  },
  mentalModel: [
    'Ground wave follows the curvature of the Earth at low frequencies (below ~3MHz); signal attenuates with distance but covers regional areas reliably',
    'Sky wave bounces between the Earth and the ionosphere — effective for HF (3–30MHz); the ionosphere is a variable mirror whose height and reflectivity change with solar activity and time of day',
    'Line-of-sight (LOS) propagation dominates VHF and above — signals travel in straight lines and are blocked by terrain, buildings, and the horizon',
    'Free-space path loss increases with distance squared and frequency squared — doubling distance adds 6dB of loss; doubling frequency also adds 6dB',
    'Friis transmission equation accounts for transmit power, antenna gains, and path loss to predict received signal strength at any link',
  ],
  intuition: {
    prose: [
      'Below about 3MHz, radio waves hug the surface of the Earth in a ground wave mode. The wave induces currents in the ground as it travels, losing energy gradually. AM broadcast stations (535–1705 kHz) rely on this mechanism for their daytime coverage area — typically 50–200 miles depending on power and soil conductivity. Seawater is an excellent conductor and allows ground wave coverage of thousands of miles over ocean paths.',
      'At HF frequencies (3–30MHz), the ionosphere becomes a useful mirror. The ionosphere consists of layers (D, E, F1, F2) of ionised gas 60–400km above Earth, created by solar UV and X-ray radiation. An HF wave aimed at the sky at the right angle is refracted (bent back) to Earth thousands of miles away — this is the "skip" that ham radio operators chase for intercontinental contacts called DX. At night the D layer disappears, reducing absorption and allowing AM stations to skip hundreds of miles further, letting distant stations break through on your car radio.',
      'Above 30MHz, the ionosphere stops reflecting and waves pass straight through into space. VHF, UHF, and microwave links are limited to line-of-sight — the straight-line path between antennas, with the horizon as the natural limit. Raising antenna height dramatically extends coverage: a 10m high antenna on flat ground has a radio horizon of about 13km. Communication satellites overcome this by being the highest possible "antenna" — a single geostationary satellite at 35,786km can see 42% of Earth\'s surface.',
    ],
    callouts: [
      { type: 'insight', body: 'Ionospheric skip creates a "skip zone" — a ring around a transmitter where the ground wave has faded but the sky wave has not yet landed. HF broadcasters choose frequencies and antenna elevation angles to place their target audience in the skip landing zone, not the skip zone.' },
      { type: 'tip', body: 'Free-space path loss at 2.4GHz over 100m: FSPL = 20log(4π × 100 / 0.125) ≈ 80dB. That is why WiFi needs high gain access points and receivers with sensitive front ends — 80dB is a factor of 100 million in power!' },
    ],
    visualizations: [{ type: 'WaveModViz', props: { mode: 'am' } }],
  },
  math: {
    prose: [
      'Free-space path loss: FSPL(dB) = 20log₁₀(4πd/λ) = 20log₁₀(d) + 20log₁₀(f) + 20log₁₀(4π/c)',
      'Simplified FSPL: FSPL(dB) = 32.45 + 20log₁₀(f_MHz) + 20log₁₀(d_km) — useful for quick link calculations',
      'Friis equation: Pr(dBm) = Pt(dBm) + Gt(dBi) + Gr(dBi) − FSPL(dB)',
      'Radio horizon distance: d(km) ≈ 4.12 × (√h_TX + √h_RX) where heights are in metres — accounts for atmospheric refraction',
    ],
    callouts: [
      { type: 'formula', body: 'FSPL(dB) = 32.45 + 20log(f_MHz) + 20log(d_km)\nFriis: Pr = Pt + Gt + Gr − FSPL   (all in dB/dBm/dBi)' },
    ],
  },
  quiz: [
    {
      id: 'q1',
      type: 'choice',
      text: 'AM radio stations (540–1700 kHz) can be received hundreds of miles away at night but only 50–100 miles during the day. Why?',
      options: [
        'Transmitter power is reduced during daytime hours as a regulatory requirement',
        'During daylight, the ionosphere\'s D layer absorbs HF/MF sky waves; at night the D layer disappears, allowing sky waves to bounce off the higher F layer and travel hundreds of miles further',
        'Ground wave propagation is stronger at night due to lower ground resistance when the soil cools',
      ],
      correct: 1,
    },
    {
      id: 'q2',
      type: 'choice',
      text: 'A WiFi access point and client are 200 m apart outdoors at 5 GHz. Free-space path loss doubles with each doubling of distance. What happens to path loss if the distance increases from 200 m to 400 m?',
      options: [
        'Path loss increases by 6 dB — doubling distance squares the power loss (factor of 4), which is 6 dB',
        'Path loss doubles in dB — 200 m has 80 dB loss, so 400 m has 160 dB',
        'Path loss is unchanged — free-space path loss depends only on frequency, not distance',
      ],
      correct: 0,
    },
    {
      id: 'q3',
      type: 'choice',
      text: 'Why are geostationary communication satellites placed at 35,786 km altitude rather than at a lower orbit of 500 km?',
      options: [
        'At lower orbits, atmospheric drag causes the satellite to deorbit; 35,786 km is the minimum drag-free altitude',
        'At 35,786 km, the orbital period equals exactly 24 hours — the satellite appears stationary over one point on Earth, allowing fixed ground antennas to maintain a constant link without tracking',
        'Lower orbit satellites cannot relay signals because signals are blocked by the ionosphere below 30,000 km altitude',
      ],
      correct: 1,
    },
    {
      id: 'q4',
      type: 'choice',
      text: 'A 5G base station transmits 30 dBm and has 12 dBi antenna gain. A phone 500 m away has a 3 dBi antenna and free-space path loss is 100 dB. What is the received signal power?',
      options: [
        '−55 dBm — Pr = Pt + Gt + Gr − FSPL = 30 + 12 + 3 − 100 = −55 dBm',
        '−70 dBm — subtract all gains from the path loss',
        '+145 dBm — add all values together without subtracting path loss',
      ],
      correct: 0,
    },
  ],
};
