export default {
  id: 'elec6-010',
  slug: 'systems-design-and-commissioning',
  chapter: 'elec6',
  order: 10,
  title: 'Systems Design & Commissioning',
  subtitle: 'From Schematic to Running System',
  tags: ['design review', 'commissioning', 'testing', 'documentation', 'reliability'],
  aliases: ['system commissioning', 'design process', 'DFM', 'DFT', 'panel commissioning'],
  timeToComplete: 30,
  coreConcept: 'Good systems engineering front-loads effort into design reviews and structured commissioning sequences, eliminating the expensive rework that results from discovering problems under power for the first time.',
  prerequisites: ['elec6-009'],
  nextLesson: null,
  hook: {
    question: 'You energise a completed motor control panel for the first time and immediately blow the main fuse. What should you have done before closing the breaker?',
    realWorldContext: 'A dead check — systematic resistance measurements before any power is applied — takes 30 minutes and catches 90% of assembly faults: wiring shorts, misrouted cables, and floating signals. Skipping it to save time typically costs days of fault-finding after a dramatic first energisation.',
  },
  mentalModel: [
    'Requirements → schematic → layout → BOM → prototype → test → production: never skip stages; each gate catches errors that become exponentially more expensive later',
    'DFM (Design for Manufacture): minimise unique component types, prefer standard footprints, design for automated assembly; DFT (Design for Test): provide test points, JTAG headers, and loopback connectors',
    'Commissioning sequence: dead check (off) → reduced voltage energisation → functional test at no load → full load test → handover with documentation',
    'Derating: operate semiconductors at 50–70% of rated voltage and current to achieve the reliability margins needed for long-field life — full-rated operation halves the MTBF of many components',
    'Thermal management: calculate total power dissipation, size heatsinks to keep junction temperature below 80% of rated maximum, verify with thermocouple measurement under full load',
  ],
  intuition: {
    prose: [
      'The design review is the cheapest test in the development process. An experienced engineer looking at a schematic for one hour can identify five to ten issues that would each require a board re-spin to fix. The review cost is measured in hours; a PCB re-spin costs weeks and thousands of dollars. Yet design reviews are the step most commonly skipped when schedules are tight — which is exactly when they deliver the highest return. Effective reviews have a checklist: power sequencing, decoupling strategy, signal integrity, thermal headroom, and protection devices for every output.',
      'Commissioning a motor control panel is a structured ceremony, not an improvised event. The dead check verifies that every wire is continuous where it should be and isolated where it should be, before any power source is connected. Measure insulation resistance between every power conductor and ground with a megohmmeter at 500V DC; values below 1MΩ indicate a contamination or wiring fault. Only when the dead check passes completely do you close the main breaker — and even then, start with the smallest available supply voltage, observe current draw, and verify voltages at each bus before proceeding.',
      'Reliability engineering turns intuition into numbers. MTBF (Mean Time Between Failures) is calculated from component failure rates using MIL-HDBK-217 or Telcordia models. The key insight is that failure rate increases steeply with temperature: for many semiconductor devices, every 10°C rise above 25°C doubles the failure rate. A panel designed to run at 65°C junction temperature will fail eight times as often as one running at 45°C junction temperature. Derating — operating every component well below its maximum rating — is the most cost-effective reliability improvement available, costing nothing in materials and delivering years of additional life.',
    ],
    callouts: [
      { type: 'insight', body: 'As-built documentation is the most valuable deliverable in a control system project and the most commonly skipped. Redline the drawings during commissioning to capture every field change. The engineer who commissions the system will eventually leave; the next technician to service it has only the documentation. Incomplete as-builts mean the next fault takes three times as long to diagnose.' },
      { type: 'warning', body: 'Full load testing is not optional. A system that passes no-load and light-load tests can still fail at full load due to voltage drops in undersized cabling, thermal shutdown of undersized components, or harmonic resonance excited only at full motor current. Budget time for a full-load acceptance test before handover, and instrument it thoroughly.' },
    ],
    visualizations: [{ type: 'OhmViz', props: {} }],
  },
  math: {
    prose: [
      'MTBF from failure rates: MTBF = 1 / λ_total, where λ_total = Σ(λ_i × π_T,i × π_Q,i) for all components; temperature factor π_T = exp(-E_a/k × (1/T_operating - 1/T_reference)) — Arrhenius relationship',
      'Heatsink thermal resistance: T_junction = T_ambient + P_dissipation × (θ_jc + θ_cs + θ_sa); for P=50W, θ_jc=0.5°C/W, θ_cs=0.1°C/W, θ_sa=1.2°C/W, T_ambient=40°C: T_j = 40 + 50×1.8 = 130°C — review against T_j_max',
      'Cable voltage drop: ΔV = 2 × R_per_metre × L × I; for 10m of 2.5mm² copper (R=7.4mΩ/m) at 16A: ΔV = 2×0.0074×10×16 = 2.37V; ensure this keeps supply voltage above minimum equipment threshold',
      'Derating and reliability: if a capacitor rated 105°C is operated at 85°C (20°C derating), Arrhenius predicts life extension by factor exp(E_a/k×(1/358K - 1/378K)) ≈ 4× for typical E_a=0.7eV',
    ],
    callouts: [
      { type: 'formula', body: 'Insulation resistance rule of thumb for LV equipment: R_insulation (MΩ) > rated voltage (V) / 1000. For a 480V system: R_min = 0.48MΩ. IEC 60364 requires minimum 1MΩ for new installation — measure with 500V DC megohmmeter before first energisation.' },
    ],
  },
  quiz: [
    {
      id: 'q1',
      type: 'choice',
      text: 'Before energising a completed motor control panel for the first time, you spend 30 minutes doing a "dead check." What does this check involve and why is it done before applying power?',
      options: [
        'Running the motor at reduced load to check for abnormal vibration or heat before applying full voltage',
        'Measuring insulation resistance between every power conductor and ground with a megohmmeter while power is off — this catches wiring shorts, misrouted cables, and contaminated insulation before they can cause a fault arc, equipment damage, or injury when the breaker is first closed',
        'Checking that all control panel components are installed per the bill of materials before the customer arrives for acceptance testing',
      ],
      correct: 1,
    },
    {
      id: 'q2',
      type: 'choice',
      text: 'A capacitor rated for 105°C operation is derated by 20°C and runs at 85°C. According to the Arrhenius model, how does this affect its service life?',
      options: [
        'Life increases by about 20% — proportional to the temperature reduction',
        'Life increases by approximately 4× — the Arrhenius relationship predicts an exponential increase in life with temperature reduction; for typical electrolytic capacitors, every 10°C reduction roughly doubles life, so a 20°C reduction approximately quadruples it',
        'Life is unchanged — derating only improves reliability for semiconductor devices, not passive components',
      ],
      correct: 1,
    },
    {
      id: 'q3',
      type: 'choice',
      text: 'A control panel passes all bench tests at no load and light load. The customer requires a full-load acceptance test before handover. Why is the no-load result insufficient?',
      options: [
        'The customer requires the test as a contractual formality — the no-load result is technically sufficient to verify all functions',
        'Voltage drops in undersized cabling, thermal shutdown of undersized components, and harmonic resonance in the motor circuit only manifest at full current — a system that passes all no-load and light-load tests can still fail in service if these full-load conditions were never tested',
        'PLC programs can only be fully validated with the motor loaded because the timing of the scan cycle depends on the current drawn by the motor',
      ],
      correct: 1,
    },
    {
      id: 'q4',
      type: 'choice',
      text: 'A design review takes one hour and costs nothing extra. A PCB re-spin takes three weeks and costs $15,000. How does this explain why design reviews are the most cost-effective quality tool in electronics development?',
      options: [
        'Design reviews are only valuable for complex designs; simple boards do not need them because errors are easier to fix in hardware',
        'An error caught on a schematic takes minutes to fix; the same error discovered after PCB fabrication requires a re-spin — weeks of delay and thousands of dollars. An experienced reviewer can find 5–10 such errors per hour, making the review the cheapest possible test, especially when schedule pressure tempts the team to skip it',
        'Design reviews catch only schematic errors; manufacturing and assembly errors must be found by inspection after production, so the review saves only a portion of potential costs',
      ],
      correct: 1,
    },
  ],
};
