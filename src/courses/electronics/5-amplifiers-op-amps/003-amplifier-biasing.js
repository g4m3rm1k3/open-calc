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
};
