export default {
  id: 'plc0-008',
  slug: 'counters',
  chapter: 'plc0',
  order: 8,
  title: 'Counters — CTU and CTD',
  subtitle: 'Count up, count down, track production totals and position steps with the fundamental event-counting instructions.',
  tags: ['CTU', 'CTD', 'counter', 'count up', 'count down', 'counter done', 'accumulator', 'preset', 'RES', 'production counter', 'event counting'],
  aliases: 'CTU CTD counter count up count down done accumulator preset production event',
  timeToComplete: 20,
  coreConcept: "CTU (Count Up) increments its accumulator on each rising edge of the rung. CTD (Count Down) decrements its accumulator. Both set .DN when the accumulator equals the preset. Counters require a separate RES (Reset) rung to clear the accumulator. The .ACC value persists between scans and power cycles (retentive by default).",
  prerequisites: ['plc0-007'],
  nextLesson: 'comparison-instructions',

  hook: {
    question: "A filling machine fills 500ml bottles. A flow sensor pulses once per 10ml of liquid. The bottle is filled when the count reaches 50 pulses. The machine runs 16 hours per day and you need to track total bottles produced per shift. You also need to count down remaining bottles in a batch of 1000. What three different counter applications are these, and which instruction handles each?",
    realWorldContext: "Counters are in virtually every production machine: part counts, stroke counts, reject counts, batch totals, and position step tracking. The CTU instruction is simpler than timers (no timing logic, just edge-counting), but the edge detection behavior — counter increments ONLY on the rising edge (0→1 transition) of the rung — is easy to misunderstand and causes programming errors. A rung that's continuously true causes exactly ONE count increment, not continuous incrementing. Understanding this edge-triggered behavior, and how to use RES correctly, is the key to mastering PLC counters.",
  },

  mentalModel: [
    "**CTU counts rising edges, not high levels.** CTU increments .ACC when the rung transitions from FALSE to TRUE (the 0→1 edge). If the rung is continuously true for 100 scans, .ACC increments ONCE. The counter needs to see the rung go false and then true again for another count. This is why counters work naturally with sensor pulses (which naturally rise and fall) and with one-shot (ONS) instructions.",
    "**The .DN bit is an alarm threshold.** .DN goes true when .ACC ≥ .PRE. It stays true even if the counter is reset to 0 (wait — no: when RES fires, .ACC=0 and .DN=0). But while .ACC is above .PRE, .DN stays true. CTU allows counting beyond the preset — the counter doesn't stop at PRE, it just sets .DN and keeps counting. To stop at PRE, add XIO(COUNTER1.DN) in series with the CTU rung.",
    "**RES resets the counter.** A RES (Reset) instruction on a separate rung clears .ACC to 0 and .DN to 0 when its rung goes true. The counter does NOT auto-reset — you must explicitly reset it. This is the most common counter mistake: forgetting to add a RES rung, leaving the counter at a high value indefinitely.",
  ],

  intuition: {
    prose: [
      "**CTU instruction detail.** The CTU rung is a coil-type instruction. Each time the rung transitions from false to true (rising edge): .ACC increments by 1, .DN sets if .ACC ≥ .PRE. The instruction uses an internal one-shot: it stores the previous rung state (the CU bit in the counter tag) and only increments when the current state is true AND the previous state was false. So the CU bit is effectively the previous-scan rung state — it's stored in the counter tag structure.",
      "**CTD instruction detail.** CTD works identically to CTU but decrements .ACC instead of incrementing. The CD bit stores the previous-scan rung state. .DN sets when .ACC ≤ .PRE (actually when .ACC ≥ PRE is the ControlLogix convention for DN; for countdown, use a separate comparison instruction to check .ACC ≤ 0 for 'empty'). Common pattern: load .ACC with the batch quantity (using MOV), then CTD counts down to 0, and use LEQ(COUNTER.ACC, 0) to detect empty.",
      "**RES (Reset) instruction.** The RES instruction clears .ACC to 0 and .DN to 0. RES is a coil-type instruction — it fires when the rung is true. Important: if the RES rung is continuously true, the counter is continuously reset to 0 every scan — it can never count. Make sure the reset condition is momentary (push a button, or use one-shot). Common pattern: reset counter at the start of each shift (triggered by a time-of-day comparison) or at the end of each batch (triggered by a completion bit).",
      "**Counting beyond the preset.** CTU doesn't stop at the preset. After .DN is set, the counter continues incrementing. Maximum count is 32767 (INT) or 2,147,483,647 (DINT). If a production counter might run for a long time without reset, use DINT type. If the count exceeds INT max, the counter overflows to -32768 (two's complement wrap) — a common source of bugs in machines that run for months without a full reset.",
      "**Cascaded counters.** For very large counts: use the .DN bit of Counter1 as the rung for Counter2. When Counter1 reaches 1000 and .DN goes true, Counter2 increments by 1 (and Counter1 is reset). Counter2 then counts thousands. This creates a multi-digit counter: Counter1 = units, Counter2 = thousands. The same technique is used in hardware as a ripple counter.",
    ],
    callouts: [
      {
        type: 'definition',
        title: 'Counter Tag Members',
        body: '**COUNTER tag members:**\n- **.PRE** — Preset. The count value at which .DN is set.\n- **.ACC** — Accumulated. The current count. Retentive (persists without power).\n- **.CU** — Count Up enable. Previous-scan state for rising-edge detection.\n- **.CD** — Count Down enable. Previous-scan state for CTD rising-edge detection.\n- **.DN** — Done. Set when ACC ≥ PRE (CTU) or ACC ≤ 0 (CTD convention).\n- **.OV** — Overflow. Set if ACC exceeds maximum INT value (32767).\n- **.UN** — Underflow. Set if ACC goes below minimum INT value (-32768).\n\n**Reset:** RES(COUNTER_TAG) clears ACC=0, DN=0, OV=0, UN=0.\n\n**Reading in rungs:**\n- `XIC(COUNTER1.DN)` — passes when count target reached\n- Compare instruction on COUNTER1.ACC for any other threshold',
      },
      {
        type: 'insight',
        title: 'Why CTU Needs a Pulse, Not a Level',
        body: 'Common mistake: "I want to count 100 scans the motor has been running, so I\'ll connect MOTOR_RUN directly to CTU."\n\nResult: CTU increments once when MOTOR_RUN first goes true. Then MOTOR_RUN is continuously true → no more rising edges → CTU stays at 1. The engineer expected 100 counts but got 1.\n\nCorrect approach for scan-counting:\n- Use a clock bit that pulses at a known rate (1-second clock bit that toggles each scan)\n- OR use a TON timer (which correctly measures time)\n\nCorrect CTU usage is for events that naturally pulse:\n- Proximity sensor that fires once per part (part passes → sensor rises and falls → 1 count per part)\n- Pushbutton press (pressed → 1 count, released → contact opens, next press → another count)\n- Encoder pulses (high-speed module handles this)\n\nIf your "event" is a continuous state, use a TON timer instead of CTU.',
      },
      {
        type: 'procedure',
        title: 'Production Counter Pattern',
        body: 'Standard production counter for a bottling line:\n\nRung 1 — Part count:\n[XIC(PART_SENSOR)] → CTU(PART_CTR, PRE=1000)\n  Count parts. PRE=1000 is one batch.\n\nRung 2 — Batch complete:\n[XIC(PART_CTR.DN)] → OTL(BATCH_COMPLETE)\n  Latch batch-complete when 1000 parts counted.\n\nRung 3 — Reset counter at batch start:\n[XIC(BATCH_START)] → RES(PART_CTR)\n  Reset when new batch begins.\n\nRung 4 — Clear batch flag:\n[XIC(BATCH_START)] → OTU(BATCH_COMPLETE)\n\nShift total counter:\nRung 5: [XIC(PART_SENSOR)] → CTU(SHIFT_CTR, PRE=99999)\n  Never resets during shift (high PRE).\nRung 6: [XIC(SHIFT_END)] → RES(SHIFT_CTR)\n  Shift end trigger resets at shift change.',
      },
    ],
    visualizations: [
      {
        id: 'PLCLadderSim',
        title: 'CTU Counter Demo',
        mathBridge: 'Toggle PART_SENSOR on and off — notice CTU.ACC only increments on the rising edge (toggle OFF then ON again for each count). Watch CTU.DN go true at preset (5). Rung 2 triggers BATCH_DONE when DN. Toggle RESET to clear the counter.',
        initialProps: {
          program: [
            [
              { type: 'XIC', tag: 'PART_SENSOR', label: 'Part Sensor' },
              { type: 'CTU', tag: 'PART_CTR', label: 'Part Counter', preset: 5 },
            ],
            [
              { type: 'XIC', tag: 'PART_CTR.DN', label: 'Counter Done' },
              { type: 'OTE', tag: 'BATCH_DONE', label: 'Batch Complete' },
            ],
            [
              { type: 'XIC', tag: 'RESET_BTN', label: 'Reset' },
              { type: 'OTU', tag: 'BATCH_DONE', label: 'Batch Complete' },
            ],
          ],
          tags: {
            PART_SENSOR: { type: 'BOOL', value: false },
            PART_CTR: { type: 'COUNTER', PRE: 5 },
            RESET_BTN: { type: 'BOOL', value: false },
            BATCH_DONE: { type: 'BOOL', value: false },
          },
          inputs: [
            { tag: 'PART_SENSOR', label: 'Part Sensor' },
            { tag: 'RESET_BTN', label: 'Reset' },
          ],
          outputs: [
            { tag: 'BATCH_DONE', label: 'Batch Complete' },
          ],
        },
      },
    ],
  },

  math: {
    prose: [
      "**Counter overflow.** INT-type counters hold values from -32,768 to 32,767. If a CTU counter reaches 32,767 and receives another count, it overflows to -32,768 and .OV is set. For production counters that accumulate millions of parts, use DINT-type counters (or use the cascade pattern). For a part that produces 300 parts/minute for 16 hours: 300 × 60 × 16 = 288,000 parts per shift — well within INT range (32,767 max). But over one week: 288,000 × 5 = 1,440,000 — exceeds INT max. Use DINT for weekly or longer accumulators.",
      "**Parts-per-minute rate calculation.** Given PART_CTR.ACC and a 1-second clock that pulses a second counter: PARTS_PER_MIN = PART_CTR.ACC × 60 ÷ ELAPSED_SECONDS. For a moving average: use a TON timer to trigger a MOV of the current ACC into a register, then calculate the rate, then reset the partial counter. This rate calculation is the basis for machine OEE (Overall Equipment Effectiveness) calculations in production monitoring systems.",
    ],
    callouts: [],
  },

  challenges: [
    {
      problem: 'A punch press cycles when the FOOT_PEDAL input goes high. Write a CTU rung to count cycles. The operator wants an alarm after 500 cycles for die inspection. Add the alarm rung and a reset rung triggered by MAINT_RESET button.',
      hint: 'FOOT_PEDAL going high = one cycle. CTU accumulates on rising edge. .DN at 500.',
      walkthrough: [
        'Rung 1 — Cycle counter: [XIC(FOOT_PEDAL)] → CTU(CYCLE_CTR, PRE=500)',
        '  Each press of the foot pedal (rising edge of FOOT_PEDAL) increments the counter.',
        'Rung 2 — Alarm at 500: [XIC(CYCLE_CTR.DN)] → OTL(INSPECT_ALARM)',
        '  Latch alarm when 500 cycles reached.',
        'Rung 3 — Reset counter: [XIC(MAINT_RESET)] → RES(CYCLE_CTR)',
        '  Technician presses MAINT_RESET after die inspection — counter clears to 0.',
        'Rung 4 — Clear alarm: [XIC(MAINT_RESET)] → OTU(INSPECT_ALARM)',
        '  Same button clears the alarm.',
        'Note: FOOT_PEDAL naturally pulses (pressed → released) so each physical pedal press generates exactly one rising edge = one count. No one-shot needed.',
        'If the machine could be in a state where FOOT_PEDAL stays high: add XIO(CYCLE_CTR.DN) in series with Rung 1 to stop counting at 500.',
      ],
      answer: 'Rung 1: XIC(FOOT_PEDAL) → CTU(CYCLE_CTR, PRE=500). Rung 2: XIC(CYCLE_CTR.DN) → OTL(INSPECT_ALARM). Rung 3: XIC(MAINT_RESET) → RES(CYCLE_CTR). Rung 4: XIC(MAINT_RESET) → OTU(INSPECT_ALARM).',
      difficulty: 'easy',
    },
    {
      problem: 'A filling machine needs to fill exactly 12 bottles before stopping for a label check. A bottle sensor (BOTTLE_PRESENT) pulses once per bottle filled. After 12 counts, stop the filler (FILLER_RUN=0) and set LABEL_CHECK. The operator presses CONTINUE to reset and fill the next 12. Write all rungs.',
      hint: 'CTU to 12, .DN stops the filler and triggers label check. CONTINUE resets counter and clears flag.',
      walkthrough: [
        'Rung 1 — Bottle counter: [XIC(BOTTLE_PRESENT)] [XIO(LABEL_CHECK)] → CTU(BOTTLE_CTR, PRE=12)',
        '  Count bottles only when not in label check mode (prevents overcounting while stopped).',
        'Rung 2 — Filler run: [XIC(FILLER_START)] [XIO(BOTTLE_CTR.DN)] [XIO(LABEL_CHECK)] → OTE(FILLER_RUN)',
        '  Filler runs when started and not at count and no label check pending.',
        'Rung 3 — Label check trigger: [XIC(BOTTLE_CTR.DN)] → OTL(LABEL_CHECK)',
        '  When 12 bottles counted, set label check flag.',
        'Rung 4 — Continue: [XIC(CONTINUE_BTN)] → RES(BOTTLE_CTR)',
        'Rung 5 — Clear label check: [XIC(CONTINUE_BTN)] → OTU(LABEL_CHECK)',
        '  Operator presses CONTINUE: counter resets, label check clears, filler can restart.',
        'With Rung 2\'s XIO(BOTTLE_CTR.DN): when counter hits 12, filler automatically stops (OTE goes false because XIO(BOTTLE_CTR.DN) blocks).',
      ],
      answer: '5 rungs. CTU counts to 12. .DN blocks filler run and triggers OTL(LABEL_CHECK). CONTINUE button runs RES(BOTTLE_CTR) and OTU(LABEL_CHECK) to restart the sequence.',
      difficulty: 'medium',
    },
    {
      problem: 'A machining cell produces parts in batches of 250. You need to track: (1) current batch count (reset each batch), (2) shift total (reset at shift change), (3) day total (reset at end of day). One PART_MADE pulse fires per part. Design an efficient counter system without running three separate CTU rungs from PART_MADE.',
      hint: 'Use CTU.DN cascading: batch counter.DN triggers shift counter, shift counter.DN triggers day counter logic. Or use one CTU and copy .ACC.',
      walkthrough: [
        'Approach: One CTU for batch (PRE=250), cascade .DN to increment shift and day counters.',
        'Rung 1 — Batch counter: [XIC(PART_MADE)] [XIO(BATCH_CTR.DN)] → CTU(BATCH_CTR, PRE=250)',
        '  Count parts in current batch. XIO stops counting at 250.',
        'Rung 2 — Batch complete: [XIC(BATCH_CTR.DN)] → OTL(BATCH_COMPLETE)',
        'Rung 3 — Reset batch on NEXT_BATCH: [XIC(NEXT_BATCH)] → RES(BATCH_CTR)',
        'Rung 4 — OTU: [XIC(NEXT_BATCH)] → OTU(BATCH_COMPLETE)',
        'For shift total: cascade from PART_MADE directly (shift counter needs raw part count, not batch count)',
        'Rung 5 — Shift counter: [XIC(PART_MADE)] → CTU(SHIFT_CTR, PRE=9999)',
        '  High PRE ensures it doesn\'t auto-stop.',
        'Rung 6 — Day counter: [XIC(PART_MADE)] → CTU(DAY_CTR, PRE=99999)',
        'Rung 7 — Shift reset: [XIC(SHIFT_END)] → RES(SHIFT_CTR)',
        'Rung 8 — Day reset: [XIC(DAY_END)] → RES(DAY_CTR)',
        'Note: All three CTU rungs use the same PART_MADE source. This is fine — three CTU instructions on the same source tag each increment their own counters independently on each rising edge.',
        'Alternative: one master CTU, use MOV to copy .ACC at shift and day end to separate registers, then RES.',
      ],
      answer: '3 independent CTU rungs from PART_MADE (batch, shift, day), each with their own RES triggered by NEXT_BATCH, SHIFT_END, DAY_END respectively. Multiple CTU instructions on the same source tag are valid and independent.',
      difficulty: 'hard',
    },
  ],

  examples: [
    {
      title: 'Parts-in vs. parts-out inventory tracking',
      problem: 'A parts bin has an IN conveyor (PART_IN sensor) and an OUT conveyor (PART_OUT sensor). Track bin inventory: count up on PART_IN, count down on PART_OUT. Alarm when inventory goes below 10 (INVENTORY_LOW) or above 200 (INVENTORY_HIGH).',
      solution: 'Rung 1 — Count in: [XIC(PART_IN)] → CTU(INVENTORY_CTR, PRE=200)\nRung 2 — Count out: [XIC(PART_OUT)] → CTD(INVENTORY_CTR, PRE=10)\n  Both CTU and CTD share the same counter tag. CTU increments .ACC, CTD decrements .ACC.\n\nRung 3 — High alarm: [GEQ(INVENTORY_CTR.ACC, 200)] → OTE(INVENTORY_HIGH)\nRung 4 — Low alarm: [LEQ(INVENTORY_CTR.ACC, 10)] → OTE(INVENTORY_LOW)\n  Comparison instructions on .ACC value.\n\nRung 5 — Initialize (first scan): [XIC(FIRST_SCAN)] → MOV(150, INVENTORY_CTR.ACC)\n  Set initial inventory count from manual entry at startup.\n\nNote: Using both CTU and CTD on the same tag is valid. The .PRE for CTD is often set to the low-alarm threshold for convenience (.DN goes true when count drops to PRE). For a shared CTU/CTD pair, .PRE on CTU is the high limit and can drive the CTU .DN for the high alarm — or use comparison instructions for more flexibility.',
    },
  ],
};
