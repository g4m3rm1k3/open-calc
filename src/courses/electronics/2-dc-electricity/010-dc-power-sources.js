export default {
  id: 'elec1-010',
  slug: 'dc-power-sources',
  chapter: 'elec1',
  order: 10,
  title: 'DC Power Sources — Batteries, Cells, and Supplies',
  subtitle: 'How batteries store energy chemically, how real supplies differ from ideal ones, and how to characterize any power source with its Thévenin equivalent.',
  tags: ['battery', 'cell', 'power supply', 'internal resistance', 'Thevenin', 'capacity', 'voltage regulation', 'SMPS'],
  aliases: 'battery internal resistance primary secondary cell amp hour capacity voltage regulation power supply SMPS',
  timeToComplete: 25,
  coreConcept: "Every real DC power source — battery, power supply, solar panel, generator — has internal resistance. This makes it a Thévenin equivalent: ideal EMF in series with Rth. Under load, terminal voltage drops as I × Rth. Battery capacity is rated in Amp-hours (Ah). Switching-mode power supplies (SMPS) regulate output against load and line variations by feedback control.",
  prerequisites: ['elec0-001', 'elec0-002', 'elec1-004'],
  nextLesson: null,

  hook: {
    question: "A UPS battery bank is rated 12V, 100Ah, with internal resistance 0.05Ω. During a power outage, it must run a server drawing 20A. How long will it last, and what will the terminal voltage be under load? Can you charge and discharge it simultaneously?",
    realWorldContext: "UPS systems are critical infrastructure in data centers, hospitals, and manufacturing plants. Understanding battery capacity (Ah × efficiency), internal resistance (terminal voltage under load), and charge/discharge characteristics is not optional for engineers maintaining these systems. A 100Ah battery at 20A draws gives 100/20 = 5 hours theoretical (before accounting for Peukert effect and efficiency). Terminal voltage = 12 − 20 × 0.05 = 11V — is that still enough for the connected load? These calculations require only Ohm's Law plus the Thévenin model, but must be done before the outage, not during.",
  },

  mentalModel: [
    "**Every source has internal resistance.** The ideal voltage source (Vs, no internal resistance) is a useful fiction. Every real source — battery, power supply, generator — has source resistance Rth. Under load, terminal voltage drops: V_terminal = EMF − I × Rth. The source is its own voltage divider with the load. This is the Thévenin model applied to real power sources. Measuring open-circuit voltage gives EMF; measuring terminal voltage at known load current gives Rth = (EMF − V_load) / I.",
    "**Amp-hours are capacity, not power.** A 100Ah battery stores 100 amperes for 1 hour — or 10 amperes for 10 hours, or 1 ampere for 100 hours. The energy stored (Wh) is approximately V × Ah = 12 × 100 = 1200Wh = 1.2kWh. But real batteries are non-ideal: the Peukert effect means higher discharge rates give less effective capacity. A 100Ah battery discharged at 20A (5-hour rate, C/5) might only deliver 80Ah effectively. Battery datasheets specify capacity at a standard rate (usually C/20 for lead-acid).",
    "**SMPS vs. linear regulators — why efficiency matters.** A linear regulator drops excess voltage across a pass transistor: efficiency = V_out/V_in. Regulating 5V from 12V at 1A: 7V dropped × 1A = 7W heat. SMPS converts by switching, inductor, and capacitor — efficiency 85–95%. Same job: ~0.5W heat. For the same output power, an SMPS runs 14× cooler and needs no heatsink. Industrial 24VDC supplies are all SMPS today.",
  ],

  intuition: {
    prose: [
      "**Primary vs. secondary cells.** Primary cells are not rechargeable: the chemical reaction is not reversible (alkaline AA, lithium coin cells). Used for low-power long-duration applications (smoke detectors, memory backup). Secondary cells are rechargeable: the reaction is reversible by applying charging current. Types: lead-acid (automotive, UPS — cheap, heavy, good peak current), NiMH (moderate energy density), Li-ion (high energy density, light, used in tools and vehicles), LiFePO₄ (safer than Li-ion, long cycle life, used in industrial storage).",
      "**Lead-acid batteries in industrial systems.** The lead-acid battery is a 2V cell (6 cells in series = 12V). Fully charged: ~12.6–12.8V open circuit. Discharged: ~11.8V. Never discharge below 10.5V (irreversible sulfation). Internal resistance increases with age and discharge depth — a battery with Rth = 0.1Ω where it once had 0.02Ω is significantly degraded. Float charging (constant 13.5–13.8V) maintains charge without overcharging. Equalization charging (higher voltage periodically) prevents stratification.",
      "**Switching-mode power supply operation.** An SMPS converts input voltage to output voltage through a high-frequency switching sequence: (1) switch ON — energy stored in inductor from input; (2) switch OFF — inductor releases energy to output capacitor and load. Feedback circuit measures output voltage and adjusts duty cycle (on-time fraction) to maintain regulation. Regulation spec: ±1–5% load regulation means output voltage stays within spec from 0 to full load current. Line regulation: output stays in spec as input varies (e.g., 100–240VAC universal input).",
      "**Voltage regulation — Thévenin applied.** A power supply's output impedance is its Thévenin resistance at output terminals. An ideal supply has Rth = 0. A real SMPS at full load might have Rth_eff = ΔV_out / ΔI_load = 0.1V / 10A = 0.01Ω — very low, essentially ideal for most purposes. A battery-backed supply adds battery Rth to the SMPS Rth. On battery: V_out = V_battery − I_load × R_battery. This terminal voltage variation must be within load tolerance.",
    ],
    callouts: [
      {
        type: 'definition',
        title: 'Electrochemical Cell EMF',
        body: "An electrochemical cell converts chemical energy to electrical energy via oxidation-reduction reactions. The **open-circuit voltage (EMF)** depends entirely on the chemistry:\n\n| Chemistry | Nominal Cell Voltage |\n|---|---|\n| Lead-acid | 2.0V per cell |\n| Alkaline (Zn-MnO₂) | 1.5V |\n| NiMH | 1.2V |\n| Li-ion (LiCoO₂) | 3.6–3.7V |\n| LiFePO₄ | 3.2–3.3V |\n\nCells in series add voltage. Cells in parallel add capacity (Ah). Never mix old and new cells in series — the weak cell becomes a load.",
      },
      {
        type: 'definition',
        title: 'Battery Capacity and Energy',
        body: "**Capacity (Ah)**: total charge deliverable at a standard discharge rate.\n$$Q = I \\times t \\text{ (ampere-hours)}$$\n\n**Energy (Wh)**: ≈ V_nominal × capacity:\n$$E = V \\times Q \\text{ (watt-hours)}$$\n\n**Discharge time** at constant current I:\n$$t = \\frac{Q_{rated}}{I} \\text{ hours}$$\n\n**Peukert effect** (lead-acid): at higher rates, effective capacity decreases. At 1C (full capacity in 1 hour), effective capacity might be only 60% of C/20 rating.",
      },
      {
        type: 'definition',
        title: 'Voltage Regulation and Load Regulation',
        body: "**Load regulation**: change in output voltage from no-load to full-load:\n$$\\text{LR\\%} = \\frac{V_{noload} - V_{fullload}}{V_{fullload}} \\times 100\\%$$\n\nA good SMPS: ±0.5–2% load regulation.\n\n**Line regulation**: change in output voltage for specified input voltage change.\n\n**Source (output) impedance**: Rout = ΔV_out / ΔI_load — lower is better. Ideal supply: Rout = 0.",
      },
      {
        type: 'procedure',
        title: 'Measuring Battery Internal Resistance',
        body: "1. Measure open-circuit voltage V_oc (no load).\n2. Connect known load R_L — measure terminal voltage V_L and current I.\n3. Internal resistance: Rth = (V_oc − V_L) / I\n4. State of health indicator: Rth increases as battery ages. Fresh automotive: 0.01–0.05Ω. Degraded: 0.2Ω+\n5. For accurate measurement, use a calibrated load and allow voltage to stabilize.\n\nAlternatively: use a dedicated battery impedance tester (AC injection method) for non-intrusive measurement.",
      },
      {
        type: 'insight',
        title: 'Why 24VDC Supplies Need Proper Grounding',
        body: "Industrial 24VDC SMPS typically have one output terminal (0V) connected to earth ground (protective earth). Without this: common-mode noise from the switching converter appears on both output lines relative to ground — affecting sensitive sensors and causing EMI. SMPS ground connection also provides a return path for fault current, enabling the fuse to blow when a live-to-ground short occurs. A 24V supply with floating output needs either isolation analysis or external common-mode filtering.",
      },
      {
        type: 'warning',
        title: 'Charging Lithium Batteries — Strict Voltage Limits',
        body: "Lithium-ion and LiFePO₄ batteries are destroyed or become fire hazards if overcharged or deeply discharged:\n\n**Li-ion**: max 4.2V/cell. Never below 2.5V/cell.\n**LiFePO₄**: max 3.65V/cell. Never below 2.5V/cell.\n\nAlways use a proper BMS (Battery Management System) and matched charger. Generic 12V chargers designed for lead-acid will overcharge lithium cells. Cell balancing is essential for multi-cell packs. Thermal runaway risk is real — a properly designed BMS with temperature monitoring is mandatory for any industrial Li-ion installation.",
      },
    ],
    visualizations: [
      {
        id: 'OhmViz',
        title: 'Internal Resistance — Source Loading Effect',
        mathBridge: "Model the voltage slider as EMF and resistance slider as internal resistance Rth. Lock voltage, increase resistance: this is a battery aging — higher Rth means more voltage drop under load. The current display shows I = EMF/(Rth + R_load). Compare: a fresh 12V battery at 0.05Ω vs. a degraded battery at 0.5Ω — the voltage drop difference under heavy load is dramatic.",
      },
    ],
  },

  math: {
    prose: [
      "**Thévenin model of a battery.** With EMF (open-circuit voltage) Voc and internal resistance Rint, terminal voltage under load RL:\n\n$$V_{terminal} = V_{oc} - I \\cdot R_{int} = V_{oc} \\cdot \\frac{R_L}{R_L + R_{int}}$$\n\nPower delivered to load: $P_L = I^2 R_L$. Internal power loss: $P_{int} = I^2 R_{int}$. Total power: $P_{total} = I^2(R_L + R_{int}) = I \\cdot V_{oc}$.",
      "**UPS autonomy time.** For constant power load P at terminal voltage V(I):\n\n$$t = \\frac{E_{battery}}{P} \\times \\eta$$\n\nwhere E_battery (Wh) = rated capacity × nominal voltage, and η = efficiency (~0.85 for lead-acid at moderate rates). For high discharge rates, derate by Peukert coefficient.\n\nExample: 100Ah × 12V × 0.85 = 1020Wh effective. 20A × 12V = 240W load: t = 1020/240 = 4.25 hours.",
    ],
    callouts: [
      {
        type: 'procedure',
        title: '24VDC Supply Sizing for a Panel',
        body: "1. Sum all 24VDC device currents: I_total = ΣI_devices\n2. Add 25% design margin: I_supply = 1.25 × I_total\n3. Choose next standard supply rating above I_supply\n4. Verify voltage drop from supply to farthest device (KVL + Rth calculation)\n5. If UPS backup required: E_battery = I_total × V_nominal × t_backup / η\n6. Size the main 24VDC fuse ≤ supply rating, ≥ I_total\n7. Document: record all device currents for future maintenance",
      },
    ],
  },
  quiz: [
    {
      id: 'q1',
      type: 'choice',
      text: 'A battery has an open-circuit voltage of 12.6V. Under a 20A load, terminal voltage drops to 11.6V. What is the battery\'s internal resistance?',
      options: [
        '0.63Ω — divide open-circuit voltage by load current',
        '0.05Ω — Rth = (V_oc − V_load) / I = (12.6 − 11.6) / 20 = 0.05Ω',
        '252Ω — multiply the voltage drop by the load current',
      ],
      correct: 1,
    },
    {
      id: 'q2',
      type: 'choice',
      text: 'A UPS battery is rated 100Ah at 12V. A server draws 10A continuously. Roughly how long will the battery last (ignoring efficiency losses)?',
      options: [
        '120 hours — the battery provides 1200V worth of stored energy',
        '10 hours — 100Ah ÷ 10A = 10 hours',
        '1 hour — amp-hours are spent at 10A so 10% of capacity lasts 1 hour',
      ],
      correct: 1,
    },
    {
      id: 'q3',
      type: 'choice',
      text: 'Why do industrial 24VDC control panels use switching-mode power supplies (SMPS) instead of linear regulators?',
      options: [
        'SMPS provide better voltage accuracy than linear regulators can achieve',
        'SMPS achieve 85–95% efficiency by switching rather than dissipating excess voltage — linear regulators waste voltage drop × current as heat, which is impractical for panel loads',
        'SMPS are simpler to design and more reliable than linear regulators',
      ],
      correct: 1,
    },
    {
      id: 'q4',
      type: 'choice',
      text: 'Why must lithium-ion cells never be charged above their maximum voltage (e.g., 4.2V/cell)?',
      options: [
        'Overcharging reduces capacity permanently but is otherwise safe',
        'Exceeding the maximum voltage causes the electrolyte to decompose, generating heat and gas that can lead to thermal runaway and fire',
        'The BMS automatically prevents charging above maximum regardless of charger voltage, so this is not a real concern',
      ],
      correct: 1,
    },
  ],
};
