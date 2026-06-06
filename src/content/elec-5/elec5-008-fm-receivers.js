export default {
  id: 'elec5-008',
  slug: 'fm-receivers',
  chapter: 'elec5',
  order: 8,
  title: 'FM Receivers',
  subtitle: 'Limiters, Discriminators & PLL Demodulation',
  tags: ['FM receiver', 'limiter', 'discriminator', 'PLL', 'capture effect', 'Foster-Seeley', 'stereo FM'],
  aliases: ['FM demodulation', 'FM discriminator', 'Foster-Seeley discriminator', 'ratio detector', 'PLL demodulator'],
  timeToComplete: 25,
  coreConcept: 'FM receivers add a limiter stage before the discriminator to exploit FM\'s noise immunity; the discriminator converts frequency variations to voltage; PLLs provide elegant digital-era FM demodulation.',
  prerequisites: ['elec5-007'],
  nextLesson: 'elec5-009',
  hook: {
    question: 'FM and AM receivers share the same superheterodyne front end — what extra stages does an FM receiver add, and why do they make such a dramatic difference in audio quality?',
    realWorldContext: 'FM broadcast receivers, VHF/UHF two-way radios, emergency services communications, aviation ATIS broadcasts, and Doppler weather radar all rely on FM demodulation circuits.',
  },
  mentalModel: [
    'An FM receiver front end is identical to AM (RF amp → mixer → IF amp at 10.7MHz) but then diverges with a limiter stage',
    'The limiter is an amplifier driven into saturation — it strips all amplitude variations from the IF signal, leaving only frequency information, which is why FM ignores amplitude noise',
    'A frequency discriminator converts instantaneous frequency deviations back to proportional voltage — the inverse of the FM modulator',
    'PLL demodulators: the VCO tracks the incoming FM carrier; the VCO control voltage is proportional to the instantaneous frequency deviation — directly the demodulated audio',
    'Stereo FM multiplexes two channels: (L+R) at baseband 0–15kHz, a 19kHz pilot tone, and (L−R) DSB-SC at 38kHz — mono receivers ignore everything above 15kHz',
  ],
  intuition: {
    prose: [
      'After the IF amplifier, an AM receiver sends the signal to an envelope detector. An FM receiver instead drives the signal into a hard limiter — an amplifier with so much gain that the output clips to a constant amplitude regardless of input level. This appears destructive but is deliberate: FM information lives in frequency, not amplitude, so clipping causes no information loss. What it does remove is all the amplitude noise accumulated during propagation. The signal that emerges from the limiter is a perfect square wave at exactly the IF frequency, with all its frequency modulation intact and all amplitude noise gone.',
      'The frequency discriminator must convert frequency changes to voltage changes linearly. The classic slope detector used a detuned IF transformer: near resonance, the slope of the bandpass response converts frequency to amplitude, then envelope detection recovers audio — but it responds to amplitude noise too. The Foster-Seeley discriminator and ratio detector are improved designs that are more linear and less sensitive to amplitude. The ratio detector is particularly popular because it inherently rejects amplitude variations without needing a preceding limiter stage.',
      'Modern FM receivers use a phase-locked loop (PLL) as the demodulator. The PLL\'s voltage-controlled oscillator (VCO) is locked to track the incoming FM carrier frequency. The error voltage that the PLL generates to keep the VCO in lock is exactly proportional to the frequency deviation of the input — this is the demodulated audio, available directly. PLL demodulators are easily integrated into single chips, are linear over a wide deviation range, and naturally provide a pilot-tone lock detector for stereo switching.',
    ],
    callouts: [
      { type: 'insight', body: 'The capture effect in FM is implemented by the limiter. When two FM stations are on the same channel, the limiter strongly favours the larger signal. If one signal is just 3–6dB stronger than the other, the limiter suppresses the weaker one by 20–40dB. This is why driving into a city, you suddenly switch sharply from one station to another rather than hearing a gradual blend.' },
      { type: 'tip', body: 'Stereo FM decoding: the receiver sums (L+R) and demodulates the (L−R) subchannel by mixing it with a 38kHz carrier regenerated from the 19kHz pilot tone. Then L = (L+R)/2 + (L−R)/2 and R = (L+R)/2 − (L−R)/2. If no pilot is detected (mono broadcast or poor reception), the decoder outputs only the (L+R) sum to both channels.' },
    ],
    visualizations: [{ type: 'WaveModViz', props: { mode: 'fm' } }],
  },
  math: {
    prose: [
      'FM IF frequency: 10.7MHz standard (compared to 455kHz for AM) — higher IF gives better image rejection for the wider FM broadcast band (88–108 MHz)',
      'PLL demodulator: VCO output frequency = fc + K_VCO·V_ctrl; in lock, V_ctrl = Δf/K_VCO — directly proportional to frequency deviation',
      'Stereo FM pilot: 19kHz; (L−R) subcarrier: 38kHz DSB-SC; SCA services (background music): 67kHz FM subcarrier',
      'FM receiver sensitivity (typical broadcast): −95 to −100dBm for 50dB signal-to-noise ratio with 75kHz deviation — about 1μV at the antenna terminals',
    ],
    callouts: [
      { type: 'formula', body: 'FM IF = 10.7MHz (broadcast), 455kHz (AM)\nPLL demod: V_audio = Δf(t) / K_VCO\nStereo: L = ½(L+R) + ½(L−R),   R = ½(L+R) − ½(L−R)' },
    ],
  },
};
