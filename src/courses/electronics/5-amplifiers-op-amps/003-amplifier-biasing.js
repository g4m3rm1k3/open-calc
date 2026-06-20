export default {
  id: 'elec4-003',
  slug: 'amplifier-biasing',
  chapter: 'elec4',
  order: 3,
  title: 'Amplifier Biasing',
  subtitle: 'Q-Point, Load Line & DC Stability',
  tags: ['biasing', 'Q-point', 'load line', 'voltage divider bias', 'thermal stability'],
  aliases: ['DC bias', 'quiescent point', 'operating point', 'emitter degeneration'],
  timeToComplete: 25,
  coreConcept: 'Voltage-divider bias sets a stable Q-point on the DC load line; the emitter resistor Re provides negative feedback to resist thermal drift.',
  prerequisites: ['elec4-002'],
  nextLesson: 'elec4-004',
  hook: {
    question: 'Why does a transistor amplifier "run away" and destroy itself without proper biasing?',
    realWorldContext:
      'Thermal runaway kills improperly biased power transistors. As temperature rises, Ic increases, generating more heat, which raises Ic further — a destructive positive feedback loop. Proper biasing design is why audio amplifiers survive playing loud music for hours.',
  },
  mentalModel: [
    'DC load line: draw a straight line on the Ic-Vce characteristic from (0, Vcc/Rc) to (Vcc, 0) — all valid DC operating points lie on this line',
    'Q-point (quiescent point): the specific Ic, Vce at rest (no AC signal) — ideally centered on the load line for maximum swing',
    'Voltage-divider bias: R1-R2 network sets a stiff Vb that is nearly independent of β, greatly reducing sensitivity to transistor variation',
    'Emitter resistor Re: any increase in Ic raises Ve = Ic·Re, which reduces Vbe = Vb − Ve, reducing Ic — a stabilising negative feedback loop',
    'Bypass capacitor Ce: short-circuits Re at signal frequencies to recover AC gain while keeping DC stability from Re',
  ],
  intuition: {
    prose: [
      'The Q-point is the heart of amplifier design. It defines where the transistor sits on its characteristic curves when no signal is applied. If the Q-point is too close to saturation (Vce ≈ 0), positive peaks of the output waveform clip. If it is too close to cutoff (Ic ≈ 0), negative peaks clip. Centering the Q-point maximises the output voltage swing before any distortion occurs.',
      'Voltage-divider bias is the most common and robust biasing scheme. The two resistors R1 and R2 form a voltage divider that supplies a base voltage Vb largely independent of the transistor\'s current gain β. The rule of thumb is to choose the divider current at least 10× the base current, so variations in β from unit to unit have negligible effect on the operating point — critical in production manufacturing.',
      'The emitter degeneration resistor Re acts as a local DC negative feedback element. If temperature rises and Ic tries to increase, the voltage across Re (= Ic·Re) increases too. Since Vb is fixed by the stiff divider, this means Vbe = Vb − Ve decreases, reducing the base-emitter forward bias and bringing Ic back down. This self-correcting mechanism prevents thermal runaway and makes the Q-point stable across temperature and transistor samples.',
    ],
    callouts: [
      {
        type: 'insight',
        body: 'Centering the Q-point at Vce = Vcc/2 and Ic = Vcc/(2Rc) maximises the symmetrical voltage swing before clipping. This gives a maximum peak-to-peak output swing of Vcc − 2Vce(sat) in a resistor-loaded CE stage.',
      },
      {
        type: 'warning',
        body: 'A large emitter resistor Re greatly improves stability but also reduces voltage gain (Av ≈ −Rc/Re without bypass cap). Choose Re ≈ 0.1·Vcc/Ic as a starting point, then add Ce to recover AC gain while keeping DC bias stable.',
      },
    ],
    visualizations: [{ type: 'AmplifierViz', props: {} }],
  },
  math: {
    prose: [
      'Voltage divider base voltage: Vb = Vcc × R2/(R1 + R2)  (assuming stiff divider, Idivider ≫ Ib)',
      'Quiescent collector current: Ic ≈ (Vb − Vbe) / Re  where Vbe ≈ 0.7V for silicon BJT',
      'DC load line endpoints: Ic(max) = Vcc / (Rc + Re) at Vce = 0;  Vce(max) = Vcc at Ic = 0',
      'Stability factor S = ΔIc/ΔIco ≈ (1 + β) / (1 + β·Re/(Rth+Re)), where Rth = R1∥R2 — lower S means more stable',
    ],
    callouts: [
      {
        type: 'formula',
        body: 'I_C(Q) ≈ (V_B − 0.7) / R_E   and   V_CE(Q) = V_CC − I_C(R_C + R_E).  For maximum swing: set V_CE(Q) ≈ V_CC/2.',
      },
    ],
  },
  quiz: [
    {
      id: 'q1',
      type: 'choice',
      text: 'What is the Q-point of a BJT amplifier, and why does centering it matter?',
      options: [
        'The Q-point is the threshold voltage at which the transistor switches from cutoff to active mode',
        'The Q-point is the DC operating point (IC, VCE) with no AC signal applied; centering it at VCE ≈ VCC/2 maximizes the output voltage swing before clipping occurs on either peak',
        'The Q-point is the frequency at which the amplifier gain reaches its maximum value',
      ],
      correct: 1,
    },
    {
      id: 'q2',
      type: 'choice',
      text: 'Voltage-divider bias uses two resistors (R1, R2) to set the base voltage. Why is this more reliable than a single base resistor from VCC?',
      options: [
        'Two resistors have lower noise than a single resistor, improving signal quality',
        'The voltage divider sets VB from resistor ratio alone, nearly independent of β — so the Q-point stays stable even when transistors from different batches have different current gain values',
        'The two-resistor divider allows the base to swing both above and below the bias voltage, enabling larger output swings',
      ],
      correct: 1,
    },
    {
      id: 'q3',
      type: 'choice',
      text: 'A BJT amplifier has an emitter resistor RE with no bypass capacitor. How does RE stabilize the Q-point against thermal drift?',
      options: [
        'RE absorbs heat from the transistor, cooling it and preventing thermal runaway directly',
        'If IC rises due to heat, VE = IC × RE increases, which reduces VBE = VB − VE (VB is fixed by the divider), reducing base drive and pulling IC back down — negative feedback',
        'RE limits the maximum collector current by being in series with the collector path, acting as a fuse',
      ],
      correct: 1,
    },
    {
      id: 'q4',
      type: 'choice',
      text: 'An emitter bypass capacitor CE is added across RE. What tradeoff does this introduce?',
      options: [
        'CE improves DC bias stability while reducing AC gain — the opposite of the design goal',
        'CE short-circuits RE at AC signal frequencies, restoring full gm × RC gain, while the DC bias stability provided by RE is unaffected since the capacitor blocks DC',
        'CE converts the amplifier from common-emitter to common-base configuration at high frequencies',
      ],
      correct: 1,
    },
  ],
};
