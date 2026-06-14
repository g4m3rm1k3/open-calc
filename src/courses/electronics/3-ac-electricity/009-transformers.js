export default {
  id: 'elec2-009',
  slug: 'transformers',
  chapter: 'elec2',
  order: 9,
  title: 'Transformers — Turns Ratio, Impedance Matching, and Practical Design',
  subtitle: 'How transformers step voltage up and down, match impedances, and provide isolation — and why they only work with AC.',
  tags: ['transformer', 'turns ratio', 'step-up', 'step-down', 'isolation', 'impedance matching', 'core loss', 'leakage inductance'],
  aliases: 'transformer turns ratio step up step down isolation impedance matching core loss copper loss efficiency power transformer control transformer',
  timeToComplete: 28,
  coreConcept: "A transformer uses Faraday's law: changing flux in the primary coil (from AC input) induces voltage in the secondary coil. Turns ratio n = Ns/Np determines voltage transformation: Vs = n × Vp. Current transforms inversely: Is = Ip/n (power is conserved). Impedance transforms as Z_reflected = n² × Z_load. Transformers only work with AC — a DC primary produces no changing flux and no secondary voltage.",
  prerequisites: ['elec2-001', 'elec1-009'],
  nextLesson: 'three-phase-power',

  hook: {
    question: "A control panel uses a 480V:120V control transformer to power 120V relays and PLC cards. The transformer is rated 500VA. The control loads draw 3.5A at 120V. What primary current is drawn? If you add a 200W heater to the 120V circuit, does the 500VA rating limit you? What happens if the secondary short-circuits?",
    realWorldContext: "Control transformers are in every industrial control panel. Primary current: Ip = Is/n = 3.5/(480/120) = 3.5/4 = 0.875A. Secondary load: 3.5A × 120V = 420VA. Adding 200W heater: S_total = √((420W + 200W)² + Q²) ≈ 620VA — exceeds 500VA rating. Result: transformer overheats, insulation degrades, shortened lifespan. Short circuit: transformer must supply short-circuit current limited only by its leakage inductance and winding resistance. Transformers are not self-protecting — fusing on both sides is required. Primary fuse: 500VA/480V = 1.04A → use 2A fuse. Secondary fuse: 500VA/120V = 4.17A → use 5A fuse.",
  },

  mentalModel: [
    "**Transformers are flux conductors, not current conductors.** The primary winding creates a magnetic flux in the core proportional to its ampere-turns (N_p × I_p). The secondary winding intercepts this flux and generates a voltage proportional to its turns (N_s × dΦ/dt). The flux is the intermediary — it's what gets 'transferred'. More primary turns for the same flux means lower flux density per amp; more secondary turns means more voltage induced per flux.",
    "**Conservation of energy dictates the current relationship.** If voltage steps up by n = Ns/Np, current must step down by 1/n (power in = power out for ideal transformer). V_p × I_p = V_s × I_s. This is why step-up transformers for high-voltage transmission lines (765kV) carry very low current (< 1000A) — all the power is at high voltage × low current. Stepping down to distribution levels increases current proportionally.",
    "**Impedance transformation: why it matters for signal matching.** A transformer reflects the secondary load impedance to the primary as Z_primary = n² × Z_secondary. An 8Ω speaker connected through a transformer with n = 10 appears as 800Ω to the amplifier output. This impedance matching maximizes power transfer when source and load impedances must be matched. Audio output transformers, RF matching networks, and impedance-matching transformers in industrial systems all use this principle.",
  ],

  intuition: {
    prose: [
      "**Real transformer model.** An ideal transformer is a good first approximation. A real transformer adds: magnetizing inductance (keeps core flux even at no load), core resistance (represents hysteresis and eddy current losses), primary and secondary leakage inductances (flux that doesn't link both coils), and winding resistances (copper losses I²R). The leakage inductance causes voltage to droop under load — important for fault current calculation and voltage regulation.",
      "**Voltage regulation.** A transformer's voltage regulation is how much secondary voltage drops from no-load to full-load: VR% = (V_NL − V_FL)/V_FL × 100%. A good power transformer: VR < 5%. A control transformer: 5–10%. High-leakage transformers (for current limiting): 20–50% (used as current-limited transformers for safe welding and charging circuits). Low VR is essential for voltage-sensitive loads (PLCs, VFDs); high VR is desired for inherently current-limited loads.",
      "**Core losses and efficiency.** Transformer losses: Copper losses P_Cu = I² × R_winding (load-dependent, proportional to I²). Core losses P_Fe = hysteresis + eddy current losses (load-independent, proportional to V² and f). Maximum efficiency occurs when P_Cu = P_Fe, typically at 50–80% of full load. A transformer idling at no load still draws full core losses (magnetizing current at no-load). Large plant transformers left energized 24/7 should be selected for low core losses (amorphous core or premium efficiency units).",
      "**Instrument transformers: CTs and PTs.** Current transformers (CTs) step down line current to 5A or 1A for meter/relay input. A 200:5 CT turns 200A line current into 5A for an ammeter. The CT secondary must never be open-circuited while current flows — all EMF drives into a very high impedance, producing dangerous kilovolt spikes that can destroy insulation and injure personnel. Potential transformers (PTs) step down line voltage (480V → 120V) for voltage measurement. PTs can be open on secondary safely — no current flows at no load.",
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'Ideal Transformer Equations',
        body: "**Turns ratio:** $n = N_s/N_p$\n\n$$\\frac{V_s}{V_p} = \\frac{N_s}{N_p} = n$$\n\n$$\\frac{I_s}{I_p} = \\frac{N_p}{N_s} = \\frac{1}{n}$$\n\n**Power conservation:** $V_p I_p = V_s I_s$ (ideal)\n\n**Impedance reflection:**\n$$Z_{primary} = n^2 \\times Z_{secondary}$$\n\n**Three-winding/autotransformer:** additional secondary windings, all linked by common flux. Voltage ratios = turns ratios.",
      },
      {
        type: 'procedure',
        title: 'Control Transformer Sizing',
        body: "1. List all 120VAC loads: VA for each (relays: 10–50VA, PLC cards: 25–150VA, indicators: 5VA, solenoids: 30–200VA)\n2. Sum continuous loads: S_continuous = Σ VA\n3. Account for inrush: relays/solenoids have 3–10× inrush on pickup. Use inrush factor for sizing if many are simultaneously energized\n4. Add 25% design margin: S_transformer = 1.25 × S_continuous\n5. Round up to nearest standard size (50, 100, 150, 250, 500, 750, 1000VA)\n6. Verify primary fuse: I_primary = S_transformer/V_primary; fuse = 125–175% of rated primary current\n7. Secondary fuse: 125% of rated secondary current",
      },
      {
        type: 'definition',
        title: 'Transformer Nameplate Ratings',
        body: "| Nameplate item | Meaning |\n|---|---|\n| kVA | Apparent power capacity — depends on temperature rise, not real power type |\n| Voltage (primary/secondary) | Nominal voltages — assume rated V at no load |\n| % Impedance | Percentage of V_rated that causes full rated current in short-circuit test |\n| Class H, F, B | Insulation temperature class (180°C, 155°C, 130°C max winding temp) |\n| Frequency | 50 or 60Hz — running 60Hz transformer at 50Hz increases core losses and reduces kVA rating |\n| Regulation % | Voltage drop from no-load to full-load, expressed as % of full-load voltage |",
      },
      {
        type: 'warning',
        title: 'Never Open-Circuit a CT Secondary',
        body: "A current transformer (CT) normally has a very low-impedance secondary (5Ω meter or relay). When current flows in the primary (line), the secondary current is forced by the primary ampere-turns. If the secondary is open-circuited while primary current flows:\n\n1. No secondary current → no opposing MMF\n2. Core flux rises until saturation\n3. Very high dΦ/dt at saturation corners → kilovolt EMF spikes\n4. Insulation failure, equipment damage, potentially fatal electric shock\n\nAlways: short the CT secondary before disconnecting meter/relay. Use CT shorting terminals. Label all CTs clearly. This is a Code requirement and a safety-critical procedure.",
      },
    ],
    visualizations: [
      {
        id: 'MagnetismViz',
        title: 'Transformer — Magnetic Flux and Turns Ratio',
        mathBridge: "Switch to Solenoid mode. The solenoid represents the primary coil creating flux. In a real transformer, a secondary coil intercepts this flux. Increase turns N: flux per amp increases (B = μ₀μᵣnI). Toggle iron core: μᵣ × 1000 dramatically increases flux density — this is why transformer cores use silicon steel or ferrite (high μᵣ) rather than air. The mutual flux is what transfers energy — this visual shows the primary side of that process.",
      },
    ],
  },

  math: {
    prose: [
      "**Referred equivalent circuit.** To analyze a real transformer, 'refer' all secondary quantities to the primary side using n = Ns/Np:\n\n$$V'_s = V_s/n \\quad I'_s = n I_s \\quad Z'_{load} = n^2 Z_{load}$$\n\nThe equivalent circuit becomes a single loop: V_p − I_p(R1 + jX1) − I_m(Rc ∥ jXm) − I'_s(R'2 + jX'2) − V'_s = 0\n\nFor most calculations, the shunt branch (Rc ∥ jXm) is ignored (no-load current is small). This leaves a simple series circuit: Z_total = (R1 + R'2) + j(X1 + X'2) plus the load. This is how transformer voltage regulation and short-circuit current are calculated.",
    ],
    callouts: [
      {
        type: 'insight',
        title: 'Autotransformer vs. Isolation Transformer',
        body: "**Isolation transformer:** primary and secondary are electrically isolated — no shared conductors. Provides galvanic isolation. Required for medical equipment, GFCI protection, and grounding reference changes.\n\n**Autotransformer:** uses a single winding with a tap. Primary and secondary share conductors. No isolation — ground faults propagate. More efficient (smaller core, less copper) for small step ratios.\n\nExample: 480V → 208V as autotransformer uses 272V winding (the difference) as the 'transformer' part, while 208V is common. Saves ~43% copper vs. isolation transformer for the same kVA. Not permitted in some NEC applications requiring isolation (hazardous locations, certain medical).",
      },
    ],
  },
};
