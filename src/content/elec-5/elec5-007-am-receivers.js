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
};
