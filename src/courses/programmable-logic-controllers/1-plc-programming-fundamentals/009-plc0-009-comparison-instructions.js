export default {
  id: 'plc0-009',
  slug: 'comparison-instructions',
  chapter: 'plc0',
  order: 9,
  title: 'Comparison Instructions',
  subtitle: 'EQU, NEQ, GRT, GEQ, LES, LEQ — turning sensor values into decisions.',
  tags: ['EQU', 'NEQ', 'GRT', 'GEQ', 'LES', 'LEQ', 'comparison', 'compare', 'EQ', 'GT', 'LT', 'setpoint', 'threshold', 'analog'],
  aliases: 'EQU NEQ GRT GEQ LES LEQ comparison compare equal greater less than setpoint threshold',
  timeToComplete: 18,
  coreConcept: "Comparison instructions (EQU, NEQ, GRT, GEQ, LES, LEQ) act as contacts — they pass power when the comparison is true, block when false. They compare a tag value to a setpoint or another tag. They are the bridge between analog values (temperature, pressure, position, count) and binary (on/off) logic decisions.",
  prerequisites: ['plc0-008'],
  nextLesson: 'math-mov',

  hook: {
    question: "A temperature sensor gives a raw analog value of 0–32767 representing 0–300°C. You need to: turn on a cooling fan above 180°C, trigger a high-temperature alarm above 250°C, and shut down the process above 280°C. Three different thresholds, three different actions. In relay logic you'd need three separate thermostats. In a PLC, all three come from one sensor — how?",
    realWorldContext: "Comparison instructions transform the PLC from a relay replacement into an intelligent controller. With XIC and XIO, a PLC is just a complex relay panel. With comparison instructions, it becomes a system that can read a 4–20mA temperature sensor and make multiple independent decisions based on the exact value — something no relay system could do without hardware setpoint devices for each threshold. Comparison instructions are in every PLC program that handles any analog signal: temperature, pressure, flow, level, speed, torque, position. Mastering them is mastering analog PLC programming.",
  },

  mentalModel: [
    "**Comparison instructions are contacts that check math conditions.** XIC(TAG) passes when TAG=1. GRT(TEMP, 180) passes when TEMP > 180. Both are contact-type instructions — they sit in the rung and either pass or block power based on a condition. The difference is that comparisons work on INT/DINT values, not just BOOLs. They're placed in the same position as XIC/XIO contacts in a rung.",
    "**Two operands: source A and source B.** Every comparison instruction has two inputs: Source A (the tag being tested, often a sensor value or counter .ACC) and Source B (the setpoint, either a literal number or another tag). GRT(SOURCE_A, SOURCE_B) passes when SOURCE_A > SOURCE_B. Either operand can be a tag or a numeric constant.",
    "**Hysteresis prevents chatter.** If a value is right at the threshold (e.g., temperature = 180.0°C when the threshold is 180), the output will flicker on and off as the value fluctuates around the threshold. Solve this with hysteresis: turn on at >182, turn off at <178 — a 4°C deadband. Implement in the program using GRT(TEMP, 182) for the on-condition and LES(TEMP, 178) for the off-condition, with an OTL/OTU pair for the fan output.",
  ],

  intuition: {
    prose: [
      "**The six comparison instructions.** EQU (Equal): SOURCE_A = SOURCE_B. NEQ (Not Equal): SOURCE_A ≠ SOURCE_B. GRT (Greater Than): SOURCE_A > SOURCE_B. GEQ (Greater than or Equal): SOURCE_A ≥ SOURCE_B. LES (Less Than): SOURCE_A < SOURCE_B. LEQ (Less Than or Equal): SOURCE_A ≤ SOURCE_B. These correspond exactly to the six relational operators in any programming language: ==, !=, >, >=, <, <=.",
      "**Combining comparisons in a rung.** Multiple comparisons can be in series (AND): GEQ(TEMP, 100) in series with LEQ(TEMP, 200) means 'temperature is in the range 100–200.' In parallel (OR): LES(TEMP, 10) OR GRT(TEMP, 290) means 'temperature is out of the normal range.' Combinations with XIC and XIO: XIC(TANK_SELECTED) in series with GRT(LEVEL, 500) means 'this tank is selected AND level is above 500.'",
      "**Comparing tag to tag.** SOURCE_B doesn't have to be a constant. GRT(ACTUAL_SPEED, SETPOINT_SPEED) compares two tags — the actual motor speed to an operator-entered setpoint. This enables adaptive control: the threshold isn't hardcoded in the program, it comes from an HMI setpoint that operators can change without reprogramming. This is the standard pattern for recipe-driven machines: setpoints stored in an array, comparison instructions reference the active recipe's setpoint tag.",
      "**Using EQU for step sequencing.** EQU(STEP_CTR, 3) passes when the step counter equals exactly 3. This is the most common use of EQU: XIC(EQU(STEP_CTR, 3)) in ladder logic reads as 'when the machine is in step 3.' It replaces having a BOOL bit for each step. Using an INT step counter + EQU comparisons instead of individual BOOL step bits reduces the number of tags from N (one per step) to 1 (one step counter) and makes the step relationship obvious.",
      "**The dead band (hysteresis) pattern.** For any analog threshold that controls an output:\n- Setpoint to TURN ON: GEQ(VALUE, HIGH_THRESHOLD)\n- Setpoint to TURN OFF: LEQ(VALUE, LOW_THRESHOLD)\nWhere HIGH_THRESHOLD > LOW_THRESHOLD by the deadband amount.\nImplement with OTL/OTU: OTL on the high condition, OTU on the low condition. The output stays ON between the two thresholds once triggered. This prevents relay chatter on a value that oscillates around a single setpoint.",
    ],
    callouts: [
      {
        type: 'definition',
        title: 'All Six Comparison Instructions',
        body: '| Instruction | Passes when | Symbol |\n|---|---|---|\n| EQU(A, B) | A = B | = |\n| NEQ(A, B) | A ≠ B | <> |\n| GRT(A, B) | A > B | > |\n| GEQ(A, B) | A ≥ B | >= |\n| LES(A, B) | A < B | < |\n| LEQ(A, B) | A ≤ B | <= |\n\nAll six act as contacts in the rung. Place them left-to-right like XIC/XIO.\nSource A is typically the variable (sensor value, counter ACC, step counter).\nSource B is typically the setpoint or reference value (constant or HMI-writable tag).',
      },
      {
        type: 'procedure',
        title: 'Multi-Threshold Alarm Pattern',
        body: 'For a temperature monitor with three alarm levels:\n\nRung 1 — Warning (above 180°C):\n[GEQ(TEMP_RAW, 18432)] → OTL(WARNING_ALARM)\n  18432 = 180°C scaled (18432/32767 × 300°C = 168.8°C... adjust for your module scaling)\n\nRung 2 — Warning clear (below 175°C):\n[LEQ(TEMP_RAW, 17920)] → OTU(WARNING_ALARM)\n  Hysteresis: 5°C deadband prevents chatter at 180.\n\nRung 3 — High alarm (above 250°C):\n[GEQ(TEMP_RAW, 27307)] → OTL(HIGH_ALARM)\n\nRung 4 — Shutdown (above 280°C):\n[GEQ(TEMP_RAW, 30583)] → OTL(SHUTDOWN_CMD)\n[XIC(SHUTDOWN_CMD)] → OTU(MOTOR_ENABLE)\n\nNote: scale TEMP_RAW to engineering units (°C) in a separate rung using math instructions (next lesson), then use the engineering unit value in comparisons — much more readable than raw counts.',
      },
      {
        type: 'insight',
        title: 'EQU for Step Counter vs. BOOL Bits',
        body: '**Bit-per-step approach (old style):**\n12 BOOL tags: STEP_01, STEP_02, ... STEP_12\nSet one with OTL, clear others with OTU.\nEach rung: XIC(STEP_03) → [action]\n12 tags, complex transition logic.\n\n**INT step counter approach (modern):**\n1 INT tag: STEP_NUMBER (0–12)\nAdvance: MOV(3, STEP_NUMBER) to go to step 3.\nEach rung: EQU(STEP_NUMBER, 3) → [action]\n1 tag, MOV to advance, trivial to add/reorder steps.\n\nAlways use the integer step counter for sequences with more than 3 steps. It\'s the foundation of every FSM implementation in a PLC. The bit-per-step approach creates dozens of latch/unlatch rungs that are hard to verify and easy to get wrong.',
      },
    ],
    visualizations: [
      {
        id: 'PLCLadderSim',
        title: 'Comparison Instructions with Step Counter',
        mathBridge: 'Rung 1 uses EQU to check step. Rungs 2–4 show GRT/LES/EQU on a simulated sensor value. Change STEP_NUM and SENSOR_VAL in the Tags tab to see how different comparisons respond. Rung 5 shows a range check (value between 10 and 50) using GEQ and LEQ in series.',
        initialProps: {
          program: [
            [
              { type: 'EQU', tagA: 'STEP_NUM', tagB: 2 },
              { type: 'OTE', tag: 'STEP2_ACTIVE', label: 'Step 2 Active' },
            ],
            [
              { type: 'GRT', tagA: 'SENSOR_VAL', tagB: 50 },
              { type: 'OTE', tag: 'HIGH_ALARM', label: 'High Alarm (>50)' },
            ],
            [
              { type: 'LES', tagA: 'SENSOR_VAL', tagB: 10 },
              { type: 'OTE', tag: 'LOW_ALARM', label: 'Low Alarm (<10)' },
            ],
            [
              { type: 'GEQ', tagA: 'SENSOR_VAL', tagB: 10 },
              { type: 'LEQ', tagA: 'SENSOR_VAL', tagB: 50 },
              { type: 'OTE', tag: 'IN_RANGE', label: 'In Range (10-50)' },
            ],
          ],
          tags: {
            STEP_NUM: { type: 'INT', value: 1 },
            SENSOR_VAL: { type: 'INT', value: 25 },
            STEP2_ACTIVE: { type: 'BOOL', value: false },
            HIGH_ALARM: { type: 'BOOL', value: false },
            LOW_ALARM: { type: 'BOOL', value: false },
            IN_RANGE: { type: 'BOOL', value: false },
          },
          inputs: [],
          outputs: [
            { tag: 'STEP2_ACTIVE', label: 'Step 2 Active' },
            { tag: 'HIGH_ALARM', label: 'High Alarm' },
            { tag: 'LOW_ALARM', label: 'Low Alarm' },
            { tag: 'IN_RANGE', label: 'In Range' },
          ],
        },
      },
    ],
  },

  math: {
    prose: [
      "**Scaling analog values for comparison.** Raw counts from a 4–20mA analog input don't directly correspond to engineering units. For a pressure sensor, 4mA (count=0) = 0 PSI and 20mA (count=32767) = 500 PSI. Threshold of 250 PSI in raw counts: 250 ÷ 500 × 32767 = 16,384 counts. You can either write GRT(PRESSURE_RAW, 16384) — using raw counts — or first scale the raw value to PSI using the math instructions, then use GRT(PRESSURE_PSI, 250) — using engineering units. The second approach is far more readable and maintainable. Scaling math is covered in the next lesson.",
      "**Integer truncation in comparisons.** PLC comparison instructions work on integers. If a physical value of 180.5°C is represented as 18050 (in units of 0.01°C) and the setpoint is 18000, GRT(TEMP_SCALED, 18000) correctly detects the overshoot. But if the scaling is integers only (18050 scaled to 180°C = 180 due to truncation) and the setpoint is also 180, EQU(TEMP_INT, 180) triggers at 180.0–180.9°C. Hysteresis (using GEQ and LEQ with a deadband) avoids the chatter this causes.",
    ],
    callouts: [],
  },

  challenges: [
    {
      problem: 'A hydraulic press has a pressure sensor (0–5000 PSI, raw 0–32767). Write EQU and GEQ rungs to: (1) detect when pressure equals exactly 2500 PSI (raw), and (2) detect when pressure is at or above 4000 PSI (raw). What are the raw count values to compare against?',
      hint: 'Scale: raw = (PSI / 5000) × 32767. Calculate for 2500 PSI and 4000 PSI.',
      walkthrough: [
        '2500 PSI raw: (2500 / 5000) × 32767 = 0.5 × 32767 = 16383.5 → round to 16384.',
        'Rung 1: EQU(PRESS_RAW, 16384) → OTE(PRESS_MID)',
        '4000 PSI raw: (4000 / 5000) × 32767 = 0.8 × 32767 = 26213.6 → round to 26214.',
        'Rung 2: GEQ(PRESS_RAW, 26214) → OTE(HIGH_PRESS)',
        'Note: EQU on a continuous analog value will likely never be exactly true (the value will jump from 16383 to 16385). Use GEQ/LEQ with a range instead: GEQ(PRESS_RAW, 16379) AND LEQ(PRESS_RAW, 16389) for ±5 counts = ±0.76 PSI deadband.',
      ],
      answer: '2500 PSI = count 16384. Use EQU(PRESS_RAW, 16384). 4000 PSI = count 26214. Use GEQ(PRESS_RAW, 26214). In practice, use a range check for analog values, not EQU.',
      difficulty: 'easy',
    },
    {
      problem: 'Implement a 5-position step sequence using a single INT tag STEP_COUNTER. Each position has a specific action. Transition from step N to step N+1 when ADVANCE_BTN is pressed, with wrap from step 5 back to 1. Write the comparison and advance rungs.',
      hint: 'Use EQU for each step\'s action rung. For advancing: use GEQ comparison to check current step, then MOV to set the next step.',
      walkthrough: [
        'Step action rungs (one per step):',
        'Rung 1: [EQU(STEP_COUNTER, 1)] → OTE(OUTPUT_1)',
        'Rung 2: [EQU(STEP_COUNTER, 2)] → OTE(OUTPUT_2)',
        'Rung 3: [EQU(STEP_COUNTER, 3)] → OTE(OUTPUT_3)',
        'Rung 4: [EQU(STEP_COUNTER, 4)] → OTE(OUTPUT_4)',
        'Rung 5: [EQU(STEP_COUNTER, 5)] → OTE(OUTPUT_5)',
        'Advance logic:',
        'Rung 6: [XIC(ADVANCE_BTN)] [LES(STEP_COUNTER, 5)] → ADD(STEP_COUNTER, 1, STEP_COUNTER)',
        '  If step is less than 5 and advance pressed: increment step.',
        'Rung 7: [XIC(ADVANCE_BTN)] [EQU(STEP_COUNTER, 5)] → MOV(1, STEP_COUNTER)',
        '  If at step 5 and advance pressed: wrap to step 1.',
        'Note: Use OSR (one-shot) on ADVANCE_BTN to prevent multiple increments while held.',
        'A single counter with CTU/RES could also work but MOV gives direct step control.',
      ],
      answer: 'EQU(STEP_COUNTER, N) → OTE(OUTPUT_N) for each step. Advance: ADD if LES(step,5) else MOV(1). One-shot on ADVANCE_BTN prevents multi-increment.',
      difficulty: 'medium',
    },
    {
      problem: 'A VFD (Variable Frequency Drive) speed reference is a 0–32767 integer representing 0–60 Hz. Design a control scheme: below 20 Hz → SLOW_SPEED_OUTPUT; 20–45 Hz → NORMAL_SPEED_OUTPUT; above 45 Hz → HIGH_SPEED_OUTPUT. Only one output should be true at a time. Write all comparison rungs with GEQ/LES/LEQ.',
      hint: 'Divide the range into three non-overlapping zones using GEQ and LES/LEQ pairs in series.',
      walkthrough: [
        'Scale: 20 Hz = (20/60)×32767 = 10922; 45 Hz = (45/60)×32767 = 24575.',
        'Zone 1 — SLOW (0 to <20 Hz, raw 0–10921):',
        'Rung 1: [LES(VFD_SPEED, 10922)] → OTE(SLOW_SPEED_OUTPUT)',
        '  No lower bound needed — raw value is always ≥ 0.',
        'Zone 2 — NORMAL (20 Hz to <45 Hz, raw 10922–24574):',
        'Rung 2: [GEQ(VFD_SPEED, 10922)] [LES(VFD_SPEED, 24575)] → OTE(NORMAL_SPEED_OUTPUT)',
        '  Series AND: both comparisons must be true.',
        'Zone 3 — HIGH (≥45 Hz, raw ≥24575):',
        'Rung 3: [GEQ(VFD_SPEED, 24575)] → OTE(HIGH_SPEED_OUTPUT)',
        '  No upper bound needed — values above 60 Hz shouldn\'t occur but would still be HIGH.',
        'Verification: at exactly 10922 (20 Hz): LES(10922, 10922) = false (SLOW off), GEQ(10922, 10922) = true AND LES(10922, 24575) = true (NORMAL on). Correct — zones are mutually exclusive.',
      ],
      answer: 'SLOW: LES(raw, 10922). NORMAL: GEQ(raw, 10922) AND LES(raw, 24575) [series]. HIGH: GEQ(raw, 24575). Three mutually exclusive zones.',
      difficulty: 'hard',
    },
  ],

  examples: [
    {
      title: 'Tank level control with hysteresis',
      problem: 'A water tank needs to be kept between 40% and 80% full. A level sensor gives 0–100 (scaled to %full). When below 40%, start FILL_VALVE. When above 80%, stop FILL_VALVE. The fill valve must not chatter at the thresholds.',
      solution: 'Hysteresis pattern using OTL/OTU:\n\nRung 1 — Start filling when low:\n[LEQ(LEVEL_PCT, 40)] → OTL(FILL_VALVE)\n  Start filling when at or below 40%.\n\nRung 2 — Stop filling when high:\n[GEQ(LEVEL_PCT, 80)] → OTU(FILL_VALVE)\n  Stop filling when at or above 80%.\n\nBehavior:\n- Level drops to 40% → OTL sets FILL_VALVE=1 → valve opens → level rises.\n- Level rises through 41%, 50%, 79% → neither rung fires (valve stays open via OTL latch).\n- Level reaches 80% → OTU clears FILL_VALVE=0 → valve closes → level falls.\n- Level drops through 79%, 50%, 41% → neither rung fires (valve stays closed via OTU latch).\n- Level drops to 40% again → OTL fires → cycle repeats.\n\nThe deadband (40–80%) prevents the valve from chattering — it operates only at the extremes. This is the ON/OFF control with hysteresis pattern, used in virtually every temperature, level, and pressure two-state control system.',
    },
  ],
};
