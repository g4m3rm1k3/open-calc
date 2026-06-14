export default {
  id: 'elec5-006',
  slug: 'frequency-modulation',
  chapter: 'elec5',
  order: 6,
  title: 'Frequency Modulation',
  subtitle: 'Frequency Deviation, Carson\'s Rule & Noise Immunity',
  tags: ['FM', 'frequency modulation', 'frequency deviation', "Carson's rule", 'noise', 'modulation index', 'preemphasis'],
  aliases: ['FM radio', 'frequency deviation', "Carson's rule", 'wideband FM', 'narrowband FM'],
  timeToComplete: 24,
  coreConcept: 'FM encodes information in instantaneous frequency variations; bandwidth ≈ 2(Δf + fm) by Carson\'s rule; FM is inherently more noise-immune than AM because noise affects amplitude, not frequency.',
  prerequisites: ['elec5-005'],
  nextLesson: 'elec5-007',
  hook: {
    question: 'FM radio sounds noticeably cleaner than AM radio — why does changing what you modulate change the noise performance so dramatically?',
    realWorldContext: 'FM broadcast radio, two-way radios, police scanners, aviation weather broadcasts, and Doppler radar all exploit FM\'s noise advantage. Understanding β and Carson\'s rule predicts whether a link will have acceptable audio quality.',
  },
  mentalModel: [
    'FM modulates the instantaneous frequency of the carrier — louder audio causes larger frequency swings (deviation Δf), not larger amplitude',
    'Modulation index β = Δf/fm — wideband FM (broadcast): β up to 5; narrowband FM (two-way): β ≈ 0.5',
    "Carson's rule approximates FM bandwidth: BW ≈ 2(Δf + fm) = 2fm(β + 1)",
    'FM noise immunity: noise appears as amplitude variations; FM receivers use limiters to strip amplitude noise before demodulation — AM cannot do this',
    'Preemphasis (75μs in North America) boosts high audio frequencies before transmission; deemphasis at the receiver restores flat response while cutting high-frequency noise',
  ],
  intuition: {
    prose: [
      'If AM is like varying how hard you wave a flag, FM is like varying how fast you wave it. The amplitude of the FM carrier stays absolutely constant at all times — information is encoded entirely in how quickly the carrier frequency moves above and below its centre frequency. A loud bass note causes a large frequency swing; silence means the carrier sits exactly at the centre frequency with no deviation.',
      'The noise immunity of FM is a fundamental advantage. Electrical noise — from lightning, power lines, engines — primarily appears as random amplitude spikes and variations. An FM receiver does not care about amplitude: it passes the signal through a hard limiter that clips everything to a constant amplitude before the demodulator ever sees it. The demodulator only needs to track frequency, so amplitude noise is simply ignored. AM has no equivalent defence — amplitude is everything, so every noise spike goes straight through to your speaker.',
      'The trade-off for FM\'s noise immunity is bandwidth. Broadcast FM uses ±75kHz peak deviation with audio up to 15kHz, giving BW ≈ 2(75 + 15) = 180kHz per station. That is why FM stations are spaced 200kHz apart (100kHz in some countries) and occupy 20× more spectrum than AM. Narrowband FM used in two-way radios (walkie-talkies, emergency services) uses only ±2.5kHz deviation to fit into 12.5kHz channels, accepting lower noise immunity in exchange for spectrum efficiency.',
    ],
    callouts: [
      { type: 'insight', body: 'The FM capture effect means that when two FM stations are on the same frequency, the stronger signal almost completely suppresses the weaker one — you hear one station clearly or the other, rarely both. AM broadcasts mix together, producing heterodyne interference. Capture is why FM cochannel interference sounds like sudden switching rather than AM-style squealing.' },
      { type: 'tip', body: 'Preemphasis is applied with a 75μs RC time constant (North America/Japan) or 50μs (Europe). The 6dB/octave boost above ~2kHz compensates for the natural high-frequency roll-off of typical audio and dramatically improves perceived SNR for programme material with strong high-frequency content like cymbals and sibilants.' },
    ],
    visualizations: [{ type: 'WaveModViz', props: { mode: 'fm' } }],
  },
  math: {
    prose: [
      'FM signal: s(t) = Ac·cos[2πfc·t + β·sin(2πfm·t)] where instantaneous frequency fi = fc + Δf·cos(2πfm·t)',
      'Modulation index: β = Δf/fm — ratio of peak frequency deviation to modulating frequency',
      "Carson's rule (98% power bandwidth): BW ≈ 2(Δf + fm) = 2fm(β + 1)",
      'Broadcast FM parameters: Δf = ±75kHz, fm_max = 15kHz, BW ≈ 180kHz; narrowband FM: Δf = ±2.5kHz, fm_max = 3kHz, BW ≈ 11kHz',
    ],
    callouts: [
      { type: 'formula', body: 's(t) = Ac·cos[2πfc·t + β·sin(2πfm·t)]\nβ = Δf / fm\nBW_Carson ≈ 2(Δf + fm)   [98% power]' },
    ],
  },
};
