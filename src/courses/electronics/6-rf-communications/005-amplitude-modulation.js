export default {
  id: 'elec5-005',
  slug: 'amplitude-modulation',
  chapter: 'elec5',
  order: 5,
  title: 'Amplitude Modulation',
  subtitle: 'Carrier, Sidebands & Modulation Index',
  tags: ['AM', 'amplitude modulation', 'modulation index', 'sidebands', 'bandwidth', 'carrier', 'overmodulation'],
  aliases: ['AM radio', 'double sideband', 'modulation index', 'AM bandwidth', 'DSB-LC'],
  timeToComplete: 23,
  coreConcept: 'AM encodes information in the amplitude of a carrier; the modulation index ma = Am/Ac controls depth; sidebands at fc±fm carry the actual information.',
  prerequisites: ['elec5-004'],
  nextLesson: 'elec5-006',
  hook: {
    question: 'If the carrier wave carries no information on its own, why does AM radio waste most of its transmitter power on it?',
    realWorldContext: 'AM broadcast radio, aircraft VHF communications, CB radio, and shortwave broadcasts all use amplitude modulation — understanding sidebands explains the 10kHz channel spacing on the AM broadcast band.',
  },
  mentalModel: [
    'An AM signal multiplies the carrier by (1 + ma·m(t)) where m(t) is the normalised message signal — the amplitude envelope follows the audio waveform',
    'Modulation index ma = Am/Ac — for clean demodulation, ma ≤ 1; overmodulation (ma > 1) causes envelope clipping and splatter into adjacent channels',
    'Multiplying carrier by a tone creates two sidebands: upper sideband at fc + fm and lower sideband at fc − fm',
    'AM bandwidth = 2fm (for a single tone) or 2 × maximum audio frequency for speech/music',
    'Carrier power accounts for most of AM transmitter power; only the sideband power carries information — efficiency η = ma²/(2 + ma²) ≤ 33% at ma = 1',
  ],
  intuition: {
    prose: [
      'Imagine you are waving a flag to signal a message. The flag itself (the carrier) moves back and forth rapidly, but the amplitude of your waving arm — how far the flag swings — varies with your message. That is exactly what AM does. The carrier wave oscillates at the radio frequency, but its peak amplitude rises and falls in sync with the audio. A receiver only needs to track those amplitude peaks (the envelope) to recover the original sound.',
      'When you multiply a carrier cos(2πfc·t) by a modulating tone cos(2πfm·t), trigonometric identities tell you the result is two new tones at fc + fm and fc − fm — the sidebands. The original carrier frequency remains. A 1MHz AM station broadcasting a 1kHz tone occupies 999kHz, 1000kHz, and 1001kHz simultaneously. This is why AM stations are spaced 10kHz apart on the broadcast band: their 5kHz audio sidebands must not overlap.',
      'The dirty secret of conventional AM (DSB-LC — double sideband, large carrier) is efficiency. At 100% modulation (ma = 1), the carrier consumes two-thirds of the total transmitter power and carries zero information. The two sidebands — which contain all the audio — share only one-third. Engineers invented single-sideband (SSB) modulation to suppress the carrier and one sideband entirely, achieving the same communication range with one-sixth the transmitter power. SSB is used on all modern HF voice links for exactly this reason.',
    ],
    callouts: [
      { type: 'insight', body: 'Overmodulation (ma > 1) is not just inefficient — it creates harmonic distortion products that splatter across adjacent channels, causing interference to other broadcasters. Broadcast stations use automatic limiters to keep ma ≤ 0.95 at all times.' },
      { type: 'tip', body: 'AM efficiency formula: η = ma²/(2 + ma²). At ma = 0.5, η = 11%. At ma = 1.0, η = 33%. This cap of one-third efficiency is why SSB and other modulation schemes were developed for power-limited systems.' },
    ],
    visualizations: [{ type: 'WaveModViz', props: { mode: 'am' } }],
  },
  math: {
    prose: [
      'AM signal in time domain: s(t) = Ac[1 + ma·cos(2πfm·t)]·cos(2πfc·t)',
      'Expanding by trig identity: s(t) = Ac·cos(2πfc·t) + (maAc/2)·cos(2π(fc+fm)·t) + (maAc/2)·cos(2π(fc−fm)·t)',
      'Bandwidth for single tone: B = 2fm; for audio bandlimited to W Hz: B = 2W',
      'AM power efficiency: η = ma²/(2 + ma²) — maximum 33.3% at ma = 1; carrier power = Ac²/2, total power = (Ac²/2)(1 + ma²/2)',
    ],
    callouts: [
      { type: 'formula', body: 's(t) = Ac[1 + ma·cos(2πfm·t)]·cos(2πfc·t)\nma = Am/Ac,   B_AM = 2fm\nη = ma² / (2 + ma²)   ≤ 33.3%' },
    ],
  },
  quiz: [
    {
      id: 'q1',
      type: 'choice',
      text: 'An AM transmitter modulates a 1 MHz carrier with a 5 kHz audio tone at 100% modulation (ma = 1). What frequencies appear in the transmitted signal?',
      options: [
        '1 MHz only — the carrier frequency dominates, sidebands are negligible at 100% modulation',
        '995 kHz, 1000 kHz, and 1005 kHz — the carrier plus two sidebands at fc ± fm',
        '990 kHz and 1010 kHz — only the sidebands are transmitted; the carrier is suppressed in standard AM',
      ],
      correct: 1,
    },
    {
      id: 'q2',
      type: 'choice',
      text: 'An AM broadcaster transmits at 100% modulation (ma = 1). What percentage of the transmitter power actually carries audio information?',
      options: [
        '100% — all transmitted power conveys the audio modulation',
        '33% — at ma = 1, efficiency η = ma²/(2 + ma²) = 1/3; the other 67% is carrier power that carries no information',
        '50% — the carrier and sidebands each receive equal power in conventional AM',
      ],
      correct: 1,
    },
    {
      id: 'q3',
      type: 'choice',
      text: 'An AM radio station overmodulates (ma > 1). What problem does this cause beyond the station\'s own channel?',
      options: [
        'Overmodulation reduces the carrier frequency, shifting the station off its assigned frequency',
        'When ma > 1, the amplitude envelope clips — the clipping generates harmonic distortion products that create interference in adjacent channels (splatter), disrupting neighboring stations',
        'Overmodulation increases carrier power but decreases sideband power, reducing audio quality without affecting adjacent stations',
      ],
      correct: 1,
    },
    {
      id: 'q4',
      type: 'choice',
      text: 'Single sideband (SSB) modulation suppresses the carrier and one sideband. Why does this allow the same communication range with much less transmitter power than conventional AM?',
      options: [
        'SSB uses a more efficient antenna that focuses all power toward the receiver',
        'In conventional AM, two-thirds of power is in the carrier (no information) and one sideband is a redundant copy of the other. SSB puts all power into one information-carrying sideband — achieving the same intelligence content with one-sixth the power of 100%-modulated AM',
        'SSB signals travel further because they have lower frequency than AM sidebands',
      ],
      correct: 1,
    },
  ],
};
