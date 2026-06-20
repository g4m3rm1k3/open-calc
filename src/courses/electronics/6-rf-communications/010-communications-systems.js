export default {
  id: 'elec5-010',
  slug: 'communications-systems',
  chapter: 'elec5',
  order: 10,
  title: 'Communications Systems Overview',
  subtitle: 'SNR, Shannon Capacity & Link Budget',
  tags: ['SNR', 'Shannon capacity', 'link budget', 'noise figure', 'margin', 'system design', 'Eb/N0'],
  aliases: ['link budget', 'Shannon-Hartley theorem', 'noise figure', 'system noise temperature', 'Eb/N0', 'carrier-to-noise'],
  timeToComplete: 30,
  coreConcept: 'Shannon\'s theorem C = B·log₂(1+SNR) sets the theoretical data rate ceiling; a link budget tallies all gains and losses to predict received SNR; noise figure quantifies how much a receiver degrades SNR.',
  prerequisites: ['elec5-009'],
  nextLesson: null,
  hook: {
    question: 'How do satellite engineers know, years before launch, exactly how large the dish must be and how powerful the transmitter should be to guarantee a reliable data link from 36,000km away?',
    realWorldContext: 'Link budgets are used to design every wireless system — from the margin in a 5G cell site to the minimum dish size for a satellite TV installation to the maximum range of a Bluetooth Low Energy sensor.',
  },
  mentalModel: [
    'SNR (signal-to-noise ratio) = signal power / noise power — the fundamental quantity that determines communication quality and capacity',
    'Shannon-Hartley theorem: C = B·log₂(1 + SNR) — sets the theoretical maximum bits per second for a channel of bandwidth B and signal-to-noise ratio SNR',
    'Noise figure NF = SNR_in / SNR_out — how much worse (in dB) the SNR becomes after passing through a real amplifier or receiver; 0dB noise figure is a theoretical perfect noiseless device',
    'A link budget is an accounting sheet in dB: start with transmit power, add antenna gains, subtract path losses and noise, and check the remaining margin against the minimum required SNR',
    'System margin (fade margin) is the dB of headroom between predicted received SNR and the minimum required — typically 10–20dB for terrestrial links to handle rain, multipath, and equipment aging',
  ],
  intuition: {
    prose: [
      'Claude Shannon\'s 1948 theorem is arguably the most important result in all of electrical engineering. It says there is a hard ceiling on how much information can be reliably transmitted through a noisy channel: C = B·log₂(1 + SNR) bits per second. No cleverness in modulation, coding, or signal processing can exceed this limit. But it also guarantees that as long as you transmit below C, you can in principle achieve arbitrarily low error rates. Every advance in wireless technology — from 3G to 5G — is essentially an effort to push practical systems closer to the Shannon limit.',
      'Noise figure captures the unavoidable degradation that occurs whenever a signal passes through real hardware. An ideal noiseless amplifier would pass the signal through with exactly the same SNR as its input. Real transistors add thermal noise, quantisation noise, and shot noise. A 3dB noise figure means the SNR at the output is half (3dB worse) what it was at the input. In a receiver chain, the first amplifier (low-noise amplifier, LNA) dominates the system noise figure — subsequent stages contribute much less because the signal has already been amplified.',
      'A link budget is an engineer\'s accounting spreadsheet for RF power. In the asset column: transmitter output power, transmitter antenna gain, and receiver antenna gain. In the liability column: free-space path loss, cable and connector losses, atmospheric absorption, and rain fade. The bottom line is received power. Subtract the receiver\'s noise floor (determined by bandwidth and noise temperature) to get SNR. If SNR exceeds the minimum required by your chosen modulation scheme, you have positive margin — the link will work. If not, you need a bigger dish, more transmit power, or a lower data rate. This same calculation was done on paper for the Apollo moon landing and runs in microseconds today in every 5G base station.',
    ],
    callouts: [
      { type: 'insight', body: 'Friis\'s formula for cascaded noise figure: F_total = F1 + (F2−1)/G1 + (F3−1)/(G1·G2) + ... The first stage dominates. A low-noise amplifier (LNA) with NF = 1dB at the antenna input keeps the system noise figure close to 1dB regardless of the noisier stages behind it. This is why satellite receivers always place an LNA directly at the dish focus, not at the end of a long cable.' },
      { type: 'tip', body: 'Quick noise floor estimate: thermal noise power density = −174 dBm/Hz at room temperature (290K). For a 10MHz bandwidth receiver: noise floor = −174 + 10·log₁₀(10×10⁶) = −174 + 70 = −104 dBm. Add your receiver noise figure (e.g., 8dB) → noise floor = −96 dBm. Any signal weaker than this disappears into the noise.' },
    ],
    visualizations: [{ type: 'WaveModViz', props: { mode: 'am' } }],
  },
  math: {
    prose: [
      'Shannon-Hartley capacity: C = B·log₂(1 + SNR) bits/second — C in bits/s, B in Hz, SNR is linear (not dB)',
      'Noise figure: NF(dB) = SNR_in(dB) − SNR_out(dB) = 10·log₁₀(F) where F = noise factor (linear)',
      'Thermal noise power: N = k·T·B where k = 1.38×10⁻²³ J/K, T = 290K, B = bandwidth — in dBm: N(dBm) = −174 + 10log(B_Hz)',
      'Link budget (dB): Pr = Pt + Gt + Gr − FSPL − L_cable − L_atm; Margin = Pr − (N_floor + NF + SNR_min)',
    ],
    callouts: [
      { type: 'formula', body: 'C = B·log₂(1 + SNR)   [Shannon capacity]\nNF(dB) = SNR_in − SNR_out  (in dB)\nN_floor(dBm) = −174 + 10log(B_Hz) + NF\nMargin = Pr − N_floor − SNR_min' },
    ],
  },
  quiz: [
    {
      id: 'q1',
      type: 'choice',
      text: 'Shannon\'s theorem states C = B·log₂(1 + SNR). A channel has 10 MHz bandwidth and a linear SNR of 15. What is the theoretical capacity ceiling?',
      options: [
        '40 Mbps — C = 10 MHz × log₂(1 + 15) = 10 MHz × log₂(16) = 10 × 4 = 40 Mbps; no modulation or coding scheme can exceed this for this channel',
        '150 Mbps — C = B × SNR = 10 MHz × 15',
        '10 Mbps — Shannon capacity equals the bandwidth when SNR is below 20 dB',
      ],
      correct: 0,
    },
    {
      id: 'q2',
      type: 'choice',
      text: 'A receiver chain has a low-noise amplifier (NF = 1 dB, gain = 20 dB) followed by a mixer (NF = 10 dB). Why is the LNA placed first, directly at the antenna?',
      options: [
        'The LNA must come first because mixers cannot operate without a pre-amplified signal above a minimum threshold',
        'The first stage dominates overall system noise figure — a 1 dB NF LNA with 20 dB gain reduces the mixer\'s 10 dB NF contribution by a factor of 100, keeping total system NF near 1 dB regardless of later noisy stages',
        'Placing the LNA first protects downstream components from large interfering signals that could cause overload',
      ],
      correct: 1,
    },
    {
      id: 'q3',
      type: 'choice',
      text: 'A satellite link budget shows 12 dB of margin. The required minimum SNR for the modulation scheme is 8 dB. What does the 12 dB margin protect against?',
      options: [
        'It allows the satellite to transmit 12 dB less power than the design value to conserve battery life during normal operations',
        'Margin is headroom above the minimum required SNR — it absorbs rain fade, equipment aging, pointing errors, and atmospheric absorption that can temporarily reduce received signal power by several dB without breaking the link',
        'The 12 dB margin compensates for the 12 dB noise figure of the receiver, which Shannon\'s theorem assumes is zero',
      ],
      correct: 1,
    },
    {
      id: 'q4',
      type: 'choice',
      text: 'A 5G base station receiver has a noise figure of 6 dB and a receive bandwidth of 100 MHz. What is the receiver\'s noise floor?',
      options: [
        '−174 dBm — thermal noise density is constant regardless of bandwidth or noise figure',
        '−88 dBm — noise floor = −174 dBm/Hz + 10·log₁₀(100×10⁶ Hz) + 6 dB = −174 + 80 + 6 = −88 dBm; any signal weaker than this is buried in noise',
        '−94 dBm — noise floor equals thermal noise at 100 MHz bandwidth without adding noise figure',
      ],
      correct: 1,
    },
  ],
};
