export default {
  id: 'elec2-010',
  slug: 'three-phase-power',
  chapter: 'elec2',
  order: 10,
  title: 'Three-Phase Power — Delta, Wye, and Industrial Distribution',
  subtitle: 'How three-phase systems deliver more power with less conductor, and why delta and wye connections produce different voltages and currents.',
  tags: ['three-phase', 'delta', 'wye', 'star', 'line voltage', 'phase voltage', 'balanced load', 'industrial power'],
  aliases: 'three phase delta wye star balanced load line voltage phase voltage 480V 208V power distribution industrial',
  timeToComplete: 28,
  coreConcept: "Three-phase systems use three conductors carrying currents 120° apart. In a wye (Y) system: V_LL = √3 × V_LN (480V line-to-line = 277V line-to-neutral). Delta (Δ): V_LL = V_phase (same). Line current in delta: I_L = √3 × I_phase. Total three-phase power: P = √3 × V_LL × I_L × PF. Three-phase is used for all industrial motors (> 1HP) and distribution because it uses less copper for the same power transfer and creates constant torque.",
  prerequisites: ['elec2-008'],
  nextLesson: null,

  hook: {
    question: "A new manufacturing line needs 480V 3-phase power for five 30HP motors (total 150HP) and 120V single-phase power for controls and lighting (20kVA). What transformer bank do you specify? What are the primary and secondary currents? Should you use a delta or wye secondary? Why?",
    realWorldContext: "150HP motors × 746W/HP ÷ 0.9 efficiency ÷ 0.85 PF ≈ 147kVA motor load. Plus 20kVA single-phase = 167kVA total. Specify a 200kVA transformer (25% margin). For 480V 3-phase with 120/208V single-phase: use a 480V delta primary, 120Y/208V wye secondary. The secondary wye provides: 208V line-to-line (3-phase for possible future use), 120V line-to-neutral (single-phase lighting and controls from any phase-to-neutral), true neutral for grounding. Primary current: 200kVA / (√3 × 480V) = 240A. Secondary current at 208V: 200kVA / (√3 × 208V) = 555A. This is standard for industrial facilities throughout North America.",
  },

  mentalModel: [
    "**Three-phase: constant torque from overlapping waves.** Single-phase power pulsates at twice line frequency (p(t) = VI cos(φ)(1 + cos(2ωt))/2 — goes to zero twice per cycle). Three-phase power, when balanced, is constant: P_total = P₁ + P₂ + P₃ = constant (the cos(2ωt) terms cancel). This is why three-phase motors run smoother — no pulsating torque. It's also why three-phase welders produce better welds than single-phase.",
    "**Wye vs delta: a connection choice, not a different system.** The same three-phase source can be connected wye or delta. Wye gives access to the neutral point (providing two voltage levels: V_LN and V_LL = √3 × V_LN). Delta has no neutral but circulates zero-sequence (3rd harmonic) currents within the delta, preventing them from reaching the line — this is why delta secondaries are used in transformers serving VFD loads. The physical voltages are the same; the connection determines what's accessible.",
    "**√3 is everywhere in three-phase.** The factor √3 ≈ 1.732 appears because of the 120° phase angles: V_LL = √3 × V_LN in wye; I_L = √3 × I_phase in delta. Three-phase power = 3 × single-phase power = √3 × V_LL × I_L × cos(φ). Memorize: 480V / √3 = 277V. 208V / √3 = 120V. These are the line-to-neutral voltages from the respective line-to-line voltages.",
  ],

  intuition: {
    prose: [
      "**Wye connection.** Three load impedances connected from each line to a common neutral point. Each phase voltage V_LN drives current through one impedance. V_LL = √3 × V_LN. Line current = phase current. Neutral current is zero for balanced loads (three equal currents 120° apart sum to zero). Any single-phase load (120V) connects between one line and neutral.",
      "**Delta connection.** Three load impedances connected line-to-line (no neutral). Each impedance sees full line-to-line voltage. Phase current I_phase = V_LL/Z. Line current I_L = √3 × I_phase (from phasor sum of two phase currents). Delta connection: no neutral, so single-phase 120V loads can't be served. Advantage: each delta element can be removed individually for maintenance (a 'corner delta' configuration allows derating to 57.7% with only two of three elements).",
      "**Why industrial motors are typically 480V 3-phase.** At 240V 3-phase, a 100HP motor draws 100×746/(√3×240×0.9×0.85) ≈ 263A. At 480V 3-phase (same power): 131A. At 4160V (medium voltage): 15A. Higher voltage → smaller current → smaller conductor → less copper cost → less I²R losses. 480V is the maximum voltage permitted for most indoor industrial wiring without special precautions (NEC). Motors > 250HP typically use 2400V or 4160V medium-voltage systems.",
      "**Phase sequencing and motor rotation.** Three-phase phase sequence (ABC or 123) determines which way a three-phase motor rotates. To reverse a three-phase motor: swap any two of the three phase conductors. The motor doesn't know or care which two — any swap reverses sequence. This is why three-phase motor starters use a reversing contactor with mechanical interlocking: two contactors, one for each rotation, with physical interlocks preventing both from closing simultaneously (which would create a three-phase short circuit).",
    ],
    callouts: [
      {
        type: 'definition',
        title: 'Wye and Delta Voltage/Current Relationships',
        body: "**Wye (Y) connection:**\n$$V_{LL} = \\sqrt{3}\\,V_{LN} \\approx 1.732\\,V_{LN}$$\n$$I_L = I_{phase}$$\n\n**Delta (Δ) connection:**\n$$V_{LL} = V_{phase}$$\n$$I_L = \\sqrt{3}\\,I_{phase}$$\n\n**Common voltages:**\n| V_LL | V_LN | Connection |\n|---|---|---|\n| 480V | 277V | 480Y/277V |\n| 208V | 120V | 208Y/120V |\n| 4160V | 2400V | 4160Y/2400V |\n\n**Three-phase power:**\n$$P = \\sqrt{3}\\,V_{LL}\\,I_L\\cos\\phi = 3\\,V_{LN}\\,I_L\\cos\\phi$$",
      },
      {
        type: 'procedure',
        title: 'Three-Phase Load Current Calculation',
        body: "**Given:** three-phase motor, P = 75kW, V_LL = 480V, PF = 0.88, η = 0.94\n\n1. Electrical input power: P_elec = P_shaft/η = 75/0.94 = 79.8kW\n2. Apparent power: S = P/PF = 79.8/0.88 = 90.6kVA\n3. Line current: I_L = S/(√3 × V_LL) = 90600/(1.732 × 480) = 108.9A\n4. Verify: I_L at unity PF = 79800/(1.732×480) = 95.8A (less current at PF=1)\n\n**For balanced load analysis:** work per phase:\n- V_LN = 480/√3 = 277V\n- Per-phase Z = V_LN/I_phase = 277/108.9 = 2.54Ω\n- Per-phase P = I²×R = 108.9² × 2.54×0.88 = 26.6kW × 3 phases = 79.8kW ✓",
      },
      {
        type: 'insight',
        title: 'Open-Delta (V-V) Transformer Connection',
        body: "If one transformer in a delta-delta bank fails, the remaining two can supply three-phase power in an 'open delta' or 'V' connection — at 57.7% of original capacity.\n\nThis allows temporary operation while the failed transformer is replaced. Critical industrial facilities sometimes intentionally design open-delta banks for cheaper transformer cost and quick recovery from single transformer failure, accepting the 42.3% capacity reduction.\n\nOpen-delta also produces slightly unbalanced voltages — harmful to sensitive equipment. Three-phase motors derate for voltage unbalance: 3% unbalance → 20% derating.",
      },
      {
        type: 'warning',
        title: 'Voltage Unbalance and Motor Damage',
        body: "Voltage unbalance in three-phase systems causes overheating and premature failure of induction motors:\n\n$$\\% \\text{unbalance} = \\frac{\\text{max deviation from average}}{\\text{average V}_{LL}} \\times 100$$\n\nNEMA MG1 motor derating for voltage unbalance:\n- 1% unbalance: 3% derating\n- 2% unbalance: 8% derating  \n- 3% unbalance: 20% derating\n- 5% unbalance: motor should not be operated\n\nCauses: single-phase loads unevenly distributed, blown fuse in three-phase bank, failing transformer, unequal cable lengths to three-phase load.\n\nMeasure: take V_LL between all three pairs (AB, BC, CA). The differences should be <1% at the motor terminals.",
      },
    ],
    visualizations: [
      {
        id: 'ACWaveformViz',
        title: 'Three-Phase Waveforms',
        mathBridge: "Enable 'Three-Phase' mode. See three sine waves 120° apart. At any instant, the sum of all three = 0 for a balanced system (they always cancel). This means: no neutral current for balanced loads, no pulsating torque for three-phase motors, and √3 times the single-phase power from the same peak voltage. The RMS display shows the equivalent DC value for each phase.",
      },
    ],
  },

  math: {
    prose: [
      "**Balanced three-phase power is constant.** For three phases with loads drawing currents i_a = Im sin(ωt), i_b = Im sin(ωt−120°), i_c = Im sin(ωt−240°) at voltages va, vb, vc:\n\n$$p_{total} = v_a i_a + v_b i_b + v_c i_c = \\frac{3}{2}V_m I_m \\cos\\phi = \\text{constant}$$\n\nThe cos(2ωt) pulsation terms from each phase cancel exactly. This mathematical identity is why three-phase induction motors produce smooth constant torque — the air-gap power is constant, and torque = power/angular velocity = constant.",
    ],
    callouts: [
      {
        type: 'procedure',
        title: 'Transformer Bank Specification',
        body: "For a new industrial facility:\n\n1. Sum all 3-phase motor loads: kVA = kW/(η × PF)\n2. Sum all single-phase loads: kVA\n3. Total kVA (with 25% margin): T_kVA = 1.25 × (3-phase kVA + single-phase kVA)\n4. Primary voltage: utility supply (typically 4160V, 13.8kV, or 34.5kV)\n5. Secondary: 480Y/277V for motor/VFD loads OR 208Y/120V for small facility\n6. Specify: kVA rating, primary voltage, secondary voltage, % impedance (5–6% typical), insulation class\n7. Include: transformer protection (fuses or breaker on primary), secondary main breaker or fuse disconnect",
      },
    ],
  },
  quiz: [
    {
      id: 'q1',
      type: 'choice',
      text: 'A wye-connected system has 480V line-to-line voltage. What is the voltage from any line to the neutral point?',
      options: [
        '480V — line-to-neutral equals line-to-line in a wye system',
        'About 277V — V_LN = V_LL / √3 = 480 / 1.732 ≈ 277V',
        '831V — multiply line-to-line by √3',
      ],
      correct: 1,
    },
    {
      id: 'q2',
      type: 'choice',
      text: 'Three-phase power delivered to a balanced load is constant (no pulsation), unlike single-phase power. Why does this matter for industrial motors?',
      options: [
        'Constant power means constant torque — no vibration from twice-per-cycle torque dips that single-phase motors experience, leading to smoother operation and less mechanical stress',
        'Constant power allows the motor to run at higher RPM without a gearbox',
        'Constant power means the motor draws the same current regardless of load, simplifying overcurrent protection',
      ],
      correct: 0,
    },
    {
      id: 'q3',
      type: 'choice',
      text: 'A three-phase motor runs clockwise. A technician needs to reverse its rotation. What is the correct procedure?',
      options: [
        'Reverse the polarity of all three phase conductors simultaneously',
        'Swap any two of the three phase conductors — swapping any pair reverses the phase sequence, which reverses motor rotation',
        'Replace the motor with one wound for the opposite rotation direction',
      ],
      correct: 1,
    },
    {
      id: 'q4',
      type: 'choice',
      text: 'A factory with many variable frequency drives (VFDs) uses a transformer with a delta secondary rather than a wye secondary. What is the main reason?',
      options: [
        'Delta secondaries provide higher voltage, which improves VFD efficiency',
        'A delta secondary circulates triple-frequency (3rd harmonic) currents within itself rather than letting them propagate onto the line — important because VFDs generate significant harmonic currents',
        'Delta secondaries have lower impedance, which reduces voltage sag when VFDs demand inrush current during startup',
      ],
      correct: 1,
    },
  ],
};
