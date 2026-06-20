export default {
  id: 'elec5-007',
  slug: 'am-receivers',
  chapter: 'elec5',
  order: 7,
  title: 'AM Receivers',
  subtitle: 'Superheterodyne Architecture & Demodulation',
  tags: ['superheterodyne', 'IF', 'mixer', 'local oscillator', 'AGC', 'demodulation', 'envelope detector'],
  aliases: ['superhet receiver', 'IF stage', 'intermediate frequency', 'envelope detector', 'AGC'],
  timeToComplete: 25,
  coreConcept: 'The superheterodyne receiver converts any incoming RF frequency to a fixed intermediate frequency (IF) using a mixer and local oscillator, enabling high-gain selective amplification at a single designed frequency.',
  prerequisites: ['elec5-006'],
  nextLesson: 'elec5-008',
  hook: {
    question: 'Tuning an old AM radio moves a single knob and pulls in any station from 530kHz to 1700kHz — how does one circuit tune such a wide range while still rejecting all the other stations?',
    realWorldContext: 'Every AM and FM radio, television tuner, spectrum analyser, software-defined radio, and most RF receivers ever built use the superheterodyne principle invented by Edwin Armstrong in 1918.',
  },
  mentalModel: [
    'The superheterodyne converts the desired RF signal to a fixed intermediate frequency (IF) using a mixer: fIF = fRF − fLO (or fLO − fRF)',
    'The IF amplifier provides most of the receiver\'s gain and selectivity at a single fixed frequency — much easier to build than a wideband tunable amplifier',
    'AM demodulation uses an envelope detector: a diode plus RC low-pass filter that follows the amplitude envelope of the IF signal',
    'AGC (automatic gain control) samples the IF level and feeds back to reduce RF/IF amplifier gain for strong signals — prevents overload and maintains constant audio volume',
    'Image frequency = fRF + 2·fIF appears at the mixer output at the same IF as the desired signal — the RF preselector filter must reject it before mixing',
  ],
  intuition: {
    prose: [
      'Before the superheterodyne, early radio receivers needed to retune every single amplifier stage every time you changed stations. With 10 amplifier stages, tuning was a nightmare of 10 knobs to adjust in concert. Armstrong\'s insight was to convert the incoming signal to a single fixed "intermediate frequency" using a local oscillator and mixer. Now only one front-end filter needs to track the dial position; all the high-gain amplification and sharp filtering happens at the fixed IF where it can be optimised perfectly.',
      'The mixer is the heart of the superheterodyne. It multiplies the RF signal by the local oscillator (LO) signal, and this multiplication creates sum and difference frequency products. For an AM station at 1000kHz with fLO = 1455kHz (for a 455kHz IF), the mixer outputs signals at 455kHz (1455 − 1000) and 2455kHz (1455 + 1000). A bandpass filter passes only 455kHz to the IF amplifier. Every station tunes by changing fLO while keeping fIF constant.',
      'Envelope detection is beautifully simple. The AM signal\'s instantaneous amplitude contains the audio information. A diode rectifies the IF signal to keep only positive peaks, and an RC network smooths out the carrier ripple, leaving just the slowly varying envelope — the original audio. The time constant τ = RC must be fast enough to follow the audio (τ << 1/fm) but slow enough to reject the carrier ripple (τ >> 1/fIF). At 455kHz IF with 5kHz audio, a τ ≈ 100μs works perfectly.',
    ],
    callouts: [
      { type: 'insight', body: 'The image frequency is the receiver\'s blind spot. For a 455kHz IF and a desired 1000kHz station, the image lands at 1000 + 2×455 = 1910kHz. A station at 1910kHz would mix to 455kHz and pass right through the IF filter alongside the desired station. The front-end preselector filter must suppress the image frequency before it reaches the mixer.' },
      { type: 'tip', body: 'Double conversion superheterdyne receivers use two IFs (e.g., 10.7MHz then 455kHz) to get better image rejection at the high first IF and better selectivity at the lower second IF. This architecture is used in most serious communications receivers and spectrum analysers.' },
    ],
    visualizations: [{ type: 'WaveModViz', props: { mode: 'am' } }],
  },
  math: {
    prose: [
      'Mixer output frequencies: fout = fLO ± fRF — for AM receiver: fIF = fLO − fRF (LO above RF) or fIF = fRF − fLO (LO below RF)',
      'Local oscillator frequency for AM broadcast: fLO = fRF + fIF = fRF + 455kHz (standard IF for AM)',
      'Image frequency: fimage = fRF + 2·fIF — must be rejected by pre-mixer bandpass filter by at least 40–60dB',
      'Envelope detector time constant: 1/fIF << RC << 1/fm_max — for 455kHz IF and 5kHz audio: 2μs << RC << 200μs',
    ],
    callouts: [
      { type: 'formula', body: 'fLO = fRF + fIF   (for AM: fIF = 455kHz)\nfimage = fRF + 2·fIF\nEnvelope detector: τ = RC,   1/fIF << τ << 1/fm' },
    ],
  },
  quiz: [
    {
      id: 'q1',
      type: 'choice',
      text: 'An AM superheterodyne receiver has a standard 455 kHz IF. You tune to a station at 1000 kHz. What frequency must the local oscillator produce?',
      options: [
        '545 kHz — LO = IF − RF',
        '1455 kHz — fLO = fRF + fIF = 1000 + 455 = 1455 kHz',
        '455 kHz — the LO always equals the IF frequency',
      ],
      correct: 1,
    },
    {
      id: 'q2',
      type: 'choice',
      text: 'A superheterodyne receiver is tuned to 1000 kHz with a 455 kHz IF. An unwanted signal at 1910 kHz also appears at the IF output. Why?',
      options: [
        'The 1910 kHz signal is a harmonic of the LO that mixes back down to IF',
        'This is the image frequency: 1000 + 2 × 455 = 1910 kHz. The LO at 1455 kHz minus 1910 kHz also equals 455 kHz — both signals mix to the same IF and cannot be separated afterward',
        'The 1910 kHz signal is a spurious emission from the desired 1000 kHz station that appears at twice the carrier frequency',
      ],
      correct: 1,
    },
    {
      id: 'q3',
      type: 'choice',
      text: 'Why does the superheterodyne architecture make it easier to build a selective, high-gain AM receiver than a direct-conversion (tunable RF) design?',
      options: [
        'The superheterodyne uses digital signal processing that eliminates the need for analog filters',
        'All high-gain amplification and sharp filtering happen at a fixed IF (455 kHz) that is designed once and optimized permanently — only a low-gain, loosely tuned front-end filter needs to track the dial, which is far easier to build than a high-gain tunable amplifier',
        'The superheterodyne cancels AM noise by converting to a lower frequency where electrical interference is weaker',
      ],
      correct: 1,
    },
    {
      id: 'q4',
      type: 'choice',
      text: 'An AM receiver\'s envelope detector uses a diode followed by an RC low-pass filter. The RC time constant must satisfy two constraints. What are they?',
      options: [
        'RC must be much larger than the carrier period AND much larger than the audio period — both act as low-pass filters',
        'RC must be much larger than the carrier period (to smooth out the carrier ripple) but much smaller than the audio period (to follow the audio envelope without distorting it)',
        'RC must equal exactly one carrier period to produce the maximum rectified voltage at the diode output',
      ],
      correct: 1,
    },
  ],
};
