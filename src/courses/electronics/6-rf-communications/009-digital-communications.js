export default {
  id: 'elec5-009',
  slug: 'digital-communications',
  chapter: 'elec5',
  order: 9,
  title: 'Digital Communications Basics',
  subtitle: 'ASK, FSK, PSK, QAM & Spectral Efficiency',
  tags: ['digital modulation', 'ASK', 'FSK', 'PSK', 'QAM', 'bit rate', 'bandwidth efficiency', 'OFDM', 'constellation'],
  aliases: ['digital modulation', 'QAM', 'QPSK', '16-QAM', '64-QAM', 'spectral efficiency', 'constellation diagram'],
  timeToComplete: 28,
  coreConcept: 'Digital modulation encodes bits into discrete symbols; higher-order modulation (64-QAM, 256-QAM) packs more bits per symbol but requires higher SNR — the fundamental trade-off between data rate and noise immunity.',
  prerequisites: ['elec5-008'],
  nextLesson: 'elec5-010',
  hook: {
    question: 'Your WiFi connection shows "802.11ac, 866Mbps" — how does a single 80MHz radio channel carry nearly a gigabit per second of data?',
    realWorldContext: 'Every digital wireless system — WiFi, 4G LTE, 5G NR, digital TV (DVB), Bluetooth, ZigBee — uses some form of digital modulation. Understanding constellation diagrams, bits per symbol, and spectral efficiency explains why your connection slows down when the signal weakens.',
  },
  mentalModel: [
    'Digital modulation maps groups of bits to symbols that differ in amplitude (ASK), frequency (FSK), phase (PSK), or both amplitude and phase (QAM)',
    'Bits per symbol: BPSK = 1, QPSK = 2, 16-QAM = 4, 64-QAM = 6, 256-QAM = 8 — each doubling of the constellation adds 1 bit/symbol',
    'Nyquist: minimum bandwidth for a symbol rate Rs symbols/second is B = Rs/2 Hz — spectral efficiency η = log₂(M) bits/s/Hz for M-ary modulation',
    'Higher-order QAM (64, 256, 1024) requires higher SNR — constellation points crowd together and noise causes symbol errors; this is why WiFi adapts modulation to signal strength',
    'OFDM (orthogonal frequency-division multiplexing) splits a wideband channel into many narrow subcarriers, each carrying QPSK or QAM — used in 4G, 5G, WiFi, and DVB',
  ],
  intuition: {
    prose: [
      'Think of digital modulation as a codebook agreed between transmitter and receiver. In BPSK, two codewords exist: send phase 0° for a 0, phase 180° for a 1. In QPSK, four codewords: 45°=00, 135°=01, 225°=10, 315°=11. Each time we transmit a symbol we deliver 2 bits instead of 1, doubling throughput in the same bandwidth. A constellation diagram plots these codewords as dots in an I-Q (in-phase and quadrature) plane — QPSK has 4 dots, 16-QAM has 16 dots in a 4×4 grid.',
      'The receiver must decide which constellation point was sent based on the received noisy symbol. When noise is small, points are easily distinguished. As SNR decreases, the received point wanders closer to a neighbouring symbol until eventually it crosses a decision boundary — a bit error occurs. Higher-order modulations pack dots closer together on the same constellation plane, so they tolerate less noise. 256-QAM requires about 10dB more SNR than QPSK to achieve the same bit error rate — that is 10× more signal power, or equivalently, the antenna must be much closer to the access point.',
      'OFDM elegantly sidesteps the problem of frequency-selective fading in multipath environments like buildings. Instead of one fast wideband signal that is randomly wiped out by multipath, OFDM uses hundreds of slow narrowband subcarriers. Each subcarrier sees a nearly flat channel; a few subcarriers might fade but most remain intact. WiFi 802.11ac uses 256 subcarriers across 80MHz, each carrying 64-QAM or 256-QAM — the product of subcarrier count, bits per symbol, coding rate, and symbol rate yields the headline "up to 866Mbps" figure.',
    ],
    callouts: [
      { type: 'insight', body: 'Adaptive modulation and coding (AMC) is why WiFi and LTE are so efficient. The base station constantly measures the link SNR and selects the highest-order modulation that the current channel can support: excellent signal → 256-QAM; medium signal → 16-QAM; weak signal → QPSK; very weak → BPSK. As you walk away from an access point, your throughput drops not because bandwidth shrinks but because you step down through the modulation hierarchy.' },
      { type: 'tip', body: 'Gray coding is used in all practical QAM and PSK constellations. Adjacent constellation points differ by only one bit. This means that when noise causes a symbol error to the nearest neighbour (the most likely error), only one bit is wrong. Without Gray coding, a QPSK symbol error could change two bits simultaneously, doubling the bit error rate for the same symbol error rate.' },
    ],
    visualizations: [{ type: 'WaveModViz', props: { mode: 'am' } }],
  },
  math: {
    prose: [
      'Bits per symbol: k = log₂(M) where M is the constellation size — BPSK: k=1, QPSK: k=2, 16-QAM: k=4, 64-QAM: k=6, 256-QAM: k=8',
      'Nyquist minimum bandwidth: B = Rs/2 Hz where Rs is the symbol rate in symbols/second (baud)',
      'Bit rate: Rb = Rs · log₂(M) = Rs · k bits/second; spectral efficiency: η = Rb/B = 2k bits/s/Hz (Nyquist limit)',
      'Shannon capacity (theoretical limit): C = B·log₂(1 + SNR) — sets the ceiling on spectral efficiency for a given SNR regardless of modulation scheme',
    ],
    callouts: [
      { type: 'formula', body: 'k = log₂(M)  bits/symbol\nRb = Rs · k   bit rate\nη = Rb / B = 2k  bits/s/Hz (Nyquist)\nC = B·log₂(1 + SNR)  [Shannon]' },
    ],
  },
  quiz: [
    {
      id: 'q1',
      type: 'choice',
      text: 'A wireless link uses 64-QAM modulation. How many bits does each transmitted symbol carry?',
      options: [
        '4 bits — 64-QAM places symbols in a 4×4 grid like 16-QAM but with more spacing',
        '6 bits — k = log₂(M) = log₂(64) = 6; 64-QAM encodes 6 bits per symbol by using 64 distinct amplitude/phase combinations in an 8×8 constellation grid',
        '8 bits — 64-QAM carries a full byte per symbol, which is why it is used in gigabit WiFi',
      ],
      correct: 1,
    },
    {
      id: 'q2',
      type: 'choice',
      text: 'As you walk away from a WiFi access point, your data rate drops significantly even though the channel bandwidth stays the same. What causes this?',
      options: [
        'The access point reduces the number of OFDM subcarriers to limit interference from distant stations, narrowing effective bandwidth',
        'Lower SNR at distance means constellation points can no longer be reliably distinguished in high-order modulation — the AP steps down from 256-QAM through 64-QAM, 16-QAM, to QPSK or BPSK, reducing bits per symbol and therefore throughput',
        'Multipath reflections cancel out entire OFDM subcarrier groups, removing large chunks of bandwidth at distance',
      ],
      correct: 1,
    },
    {
      id: 'q3',
      type: 'choice',
      text: 'OFDM divides a wide channel into hundreds of narrow subcarriers instead of one fast wideband signal. What multipath problem does this solve?',
      options: [
        'Multipath causes frequency-selective fading that can deep-null a wideband signal; OFDM\'s narrow subcarriers each experience a nearly flat channel — only a few may fade deeply while the majority remain intact, limiting total signal loss',
        'Multipath forces a wideband signal to use more transmit power; OFDM reduces power consumption by distributing energy across many subcarriers',
        'Wideband signals cannot carry QAM modulation in multipath environments; OFDM is required because each subcarrier carries a different modulation type',
      ],
      correct: 0,
    },
    {
      id: 'q4',
      type: 'choice',
      text: 'A channel has 20 MHz bandwidth and SNR = 1023 (approximately 30 dB). Using Shannon\'s capacity formula C = B·log₂(1 + SNR), what is the theoretical maximum data rate?',
      options: [
        '20 Mbps — Shannon capacity equals bandwidth times SNR in linear scale',
        '200 Mbps — C = 20 MHz × log₂(1 + 1023) = 20 MHz × log₂(1024) = 20 MHz × 10 = 200 Mbps; this is a hard ceiling no modulation scheme can exceed at this SNR',
        '2 Gbps — C = B × SNR = 20 MHz × 1023; Shannon uses the SNR directly, not its logarithm',
      ],
      correct: 1,
    },
  ],
};
