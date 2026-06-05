export default {
  id: 'plc0-007',
  slug: 'timers',
  chapter: 'plc0',
  order: 7,
  title: 'Timers — TON, TOF, RTO',
  subtitle: 'On-delay, off-delay, and retentive timers: controlling time in industrial sequences.',
  tags: ['TON', 'TOF', 'RTO', 'timer', 'on-delay', 'off-delay', 'retentive timer', 'timer done', 'timer preset', 'timer accumulator', 'EN', 'DN', 'TT'],
  aliases: 'TON TOF RTO timer on-delay off-delay retentive timer done preset accumulator',
  timeToComplete: 24,
  coreConcept: "TON (Timer On-Delay) starts counting when its rung goes true and sets DN when accumulator reaches preset. TOF (Timer Off-Delay) starts counting when its rung goes false. RTO (Retentive Timer On-Delay) accumulates time across multiple rung-true intervals without resetting when the rung goes false. All timers have .ACC (accumulated time), .PRE (preset), .DN (done), .EN (enabled), and .TT (timing) bits.",
  prerequisites: ['plc0-006'],
  nextLesson: 'counters',

  hook: {
    question: "A hydraulic cylinder needs 2 seconds to extend fully after the solenoid is energized. You can't use a limit switch at the end of travel (it's inaccessible). You need the PLC to wait 2 seconds after energizing the solenoid before commanding the clamp. You also need an alarm if the operation takes more than 5 seconds. How do you implement both with timers?",
    realWorldContext: "Timers are in every PLC program. Dwell times, minimum on-times, delay-before-action, watchdog timeouts, pump run-time totals — all need timers. The three timer types cover every industrial timing application: TON for 'wait before acting,' TOF for 'keep output on after trigger,' and RTO for 'accumulate machine run hours.' Understanding timer structure — especially the .DN, .EN, .TT, and .ACC members — is required for writing timer-dependent sequences and for troubleshooting timing faults on actual equipment.",
  },

  mentalModel: [
    "**The timer is a tag with five members.** A timer tag (type TIMER) has: .PRE (preset value in ms), .ACC (accumulated ms), .EN (enabled — rung is true), .DN (done — ACC ≥ PRE), .TT (timing — EN is true but DN is not yet). The instruction itself controls all five based on the rung state. You read the .DN bit in downstream rungs to trigger the next action.",
    "**TON: delay before action.** The output .DN goes true only AFTER the rung has been continuously true for PRE milliseconds. If the rung goes false before PRE, the accumulator resets to 0. TON is used for 'wait this long after condition is met, then act.'",
    "**TOF: delay after action.** The output .DN is true immediately when the rung goes true. When the rung goes false, the timer starts — .DN stays true for PRE milliseconds after the rung drops, then clears. TOF is used for 'keep output on for a defined time after the trigger goes away' — like a cooling fan that must run 30 seconds after the heater turns off.",
  ],

  intuition: {
    prose: [
      "**TON in detail.** When the rung goes true: .EN=1, .TT=1, .ACC starts incrementing each scan (by scan-delta ms). When .ACC reaches .PRE: .DN=1, .TT=0 (timing stops, but .EN stays 1 while rung is true). When the rung goes false: .EN=0, .DN=0, .ACC resets to 0 immediately. Non-retentive: the accumulator always resets when the rung goes false, regardless of how close to PRE it was.",
      "**TOF in detail.** When the rung goes true: .EN=1, .DN=1 immediately, .TT=0, .ACC=0. When the rung goes false: .EN=0, .TT=1, .ACC starts counting. When .ACC reaches .PRE: .DN=0, .TT=0. TOF output (.DN) is high while rung is true AND for PRE ms after rung goes false. The rung going true again resets .ACC. TOF is used for 'extended de-energize time' — the output stays on even after the triggering condition clears.",
      "**RTO in detail.** Retentive on-delay: .ACC increments while rung is true, holds its value when rung goes false (does not reset). .DN sets when .ACC cumulative total reaches .PRE. Only a RES (Reset Timer) instruction on a separate rung will reset .ACC to 0. RTO is used for total run-time accumulation: how long has this motor run since the last reset? When .ACC reaches PRE (e.g., 480 hours = 1,728,000,000 ms), trigger a maintenance alarm.",
      "**Using .TT for 'timer is in progress.'** The .TT bit is true while the timer is counting and hasn't yet reached PRE. Use XIC(TIMER1.TT) to detect 'timer is running but not done' — useful for timeout detection or for blanking a status light during a transition delay. Don't confuse .TT and .DN: .TT=1 means 'counting, not done yet'; .DN=1 means 'counting complete, PRE reached.'",
      "**Cascaded timers.** A common sequence: TON1 delays 2 seconds, then TON2 starts its 5-second timeout. Connect TON1.DN to the rung for TON2. When TON1.DN goes true, TON2 starts counting. If TON2.DN goes true before something else happens, it's a timeout fault. This cascaded pattern implements 'after delay N, action must complete within timeout T.'",
      "**Time resolution.** PLC timers count in milliseconds (1ms base for most modern PLCs). The minimum useful preset is 1× scan time (can't reliably time shorter than one scan). Timer accumulator is typically a 32-bit integer (DINT), supporting up to ~2.1 billion ms = ~24.8 days before overflow. For maintenance timers (thousands of hours), multiply scan-time increments by a factor to use the timer in seconds rather than milliseconds — or use a DINT accumulator with a separate calculation rung.",
    ],
    callouts: [
      {
        type: 'definition',
        title: 'Timer Bit Summary',
        body: '**TIMER tag members:**\n- **.PRE** — Preset. Time in ms (or time base × preset count for older PLCs). Set in the instruction box.\n- **.ACC** — Accumulated. Current count in ms. Increments each scan while timing.\n- **.EN** — Enable. 1 while rung is true (TON) or rung just went false (TOF during timing).\n- **.DN** — Done. 1 when ACC ≥ PRE. Stays 1 until timer resets.\n- **.TT** — Timing. 1 while timer is counting but DN has not yet been set.\n\n**Relationships:**\n- TON: TT = EN AND NOT DN\n- TOF: TT = NOT EN AND NOT DN\n- DN sets when ACC reaches PRE and stays set until reset\n\n**Reading in rungs:**\n- `XIC(TIMER1.DN)` — passes when timer has completed\n- `XIC(TIMER1.TT)` — passes while timer is running\n- `XIC(TIMER1.EN)` — passes while timer rung is energized',
      },
      {
        type: 'procedure',
        title: 'Timer Rung Pattern — Sequence Step with Timeout',
        body: '// Step 2: extend cylinder for 2s, timeout after 5s\n\nRung A: [XIC(STEP_EQ_2)] ─── TON(EXTEND_TMR, PRE=2000)\n  Start the extend timer when in step 2.\n\nRung B: [XIC(STEP_EQ_2)] [XIC(EXTEND_TMR.DN)] ─── (advance to step 3)\n  Normal advance when timer completes.\n\nRung C: [XIC(STEP_EQ_2)] ─── TON(WATCHDOG_TMR, PRE=5000)\n  Watchdog: counts while in step 2.\n\nRung D: [XIC(WATCHDOG_TMR.DN)] ─── OTL(FAULT_BIT)\n  If watchdog completes: fault.\n\nThis pattern: extend timer drives normal transition, watchdog timer drives fault. Watchdog preset > normal expected time. The rung for step advance (Rung B) checks both STEP_EQ_2 AND EXTEND_TMR.DN — both must be true.',
      },
      {
        type: 'insight',
        title: 'TON vs. TOF — The Timing Diagram',
        body: 'TON timing:\n  Rung:  ____████████████__________\n  EN:    ____████████████__________\n  TT:    ____████___________________\n  DN:    _________███████__________\n         (TT high while counting, DN after PRE reached)\n\nTOF timing:\n  Rung:  ____████████_______________\n  EN:    ____████████_______________\n  TT:    ____________████____________\n  DN:    ____████████████____________\n         (DN goes high immediately with rung, stays high during TOF countdown)\n\nKey difference: TON DN lags the rung (output AFTER delay). TOF DN leads the rung clear (output BEFORE delay ends).',
      },
    ],
    visualizations: [
      {
        id: 'PLCLadderSim',
        title: 'TON Timer Demonstration',
        mathBridge: 'Enable TIMER_ENABLE — watch TIMER1.ACC count up in the Tags tab and the timer box in the Ladder tab. TIMER1.DN goes high when ACC reaches PRE (3000ms = 3 seconds). TIMER1.TT goes high while counting. Disable TIMER_ENABLE before DN to see ACC reset. Rung 2 shows how .DN drives the next action.',
        initialProps: {
          program: [
            [
              { type: 'XIC', tag: 'TIMER_ENABLE', label: 'Timer Enable' },
              { type: 'TON', tag: 'TIMER1', label: 'On-Delay 3s', preset: 3000 },
            ],
            [
              { type: 'XIC', tag: 'TIMER1.DN', label: 'Timer1 Done' },
              { type: 'OTE', tag: 'OUTPUT_COIL', label: 'Output (after 3s)' },
            ],
            [
              { type: 'XIC', tag: 'TIMER1.TT', label: 'Timer1 Timing' },
              { type: 'OTE', tag: 'TIMING_LIGHT', label: 'Timing in Progress' },
            ],
          ],
          tags: {
            TIMER_ENABLE: { type: 'BOOL', value: false },
            TIMER1: { type: 'TIMER', PRE: 3000 },
            OUTPUT_COIL: { type: 'BOOL', value: false },
            TIMING_LIGHT: { type: 'BOOL', value: false },
          },
          inputs: [
            { tag: 'TIMER_ENABLE', label: 'Timer Enable' },
          ],
          outputs: [
            { tag: 'OUTPUT_COIL', label: 'Output (after 3s)' },
            { tag: 'TIMING_LIGHT', label: 'Timing in Progress' },
          ],
        },
      },
    ],
  },

  math: {
    prose: [
      "**Timer accumulator update.** Each scan, the timer's accumulated value is incremented by the scan delta time (ms). For a 10ms scan: each scan adds 10ms to ACC. After 200 scans (2 seconds), ACC = 2000ms = PRE if PRE was set to 2000. The actual elapsed time is 200 × 10ms = 2.000 seconds, but since the scan is 10ms, the timer can only resolve to the nearest scan: actual timing error = ±1 scan = ±10ms. For a 2-second delay, this is 0.5% error — acceptable for pneumatic cylinder timing, not acceptable for high-precision motion control (which uses motion modules with μs-resolution timing).",
      "**Minimum timer preset.** Setting PRE to 0 or 1 causes the timer to complete immediately on the first scan it's enabled. This is intentional for 'done immediately if condition is met' patterns. Setting PRE below the scan time makes the timer behave as if PRE=0, since the ACC can never be less than 1 scan's increment. Always set PRE ≥ 2× scan time for reliable timing.",
    ],
    callouts: [],
  },

  challenges: [
    {
      problem: 'A pump is controlled by a float switch (FLOAT_HIGH). When FLOAT_HIGH goes true, start a 30-second TON timer. After 30 seconds, stop the pump (PUMP_RUN=0) and set a FLOOD_ALARM. Write the rungs.',
      hint: 'Two rungs: one for the timer, one for the action when timer completes. Use TON with PRE=30000ms.',
      walkthrough: [
        'The condition: float switch high AND pump is running for > 30 seconds = flood alarm.',
        'Rung 1 — Timer: [XIC(FLOAT_HIGH)] [XIC(PUMP_RUN)] → TON(FLOOD_TMR, PRE=30000)',
        '  Timer runs while float is high AND pump is running. Resets if float drops or pump stops.',
        'Rung 2 — Pump run (normal): [XIC(PUMP_START)] [XIO(FLOAT_HIGH)] [XIO(FLOOD_ALARM)] → OTL(PUMP_RUN)',
        '  Pump can start when start commanded and no flood condition.',
        'Rung 3 — Flood alarm and pump stop: [XIC(FLOOD_TMR.DN)] → OTU(PUMP_RUN)',
        '  When timer completes: stop pump.',
        'Rung 4: [XIC(FLOOD_TMR.DN)] → OTL(FLOOD_ALARM)',
        '  Set alarm latch.',
        'Rung 5 — Alarm clear: [XIC(ALARM_ACK)] → OTU(FLOOD_ALARM)',
        '  Operator clears alarm.',
      ],
      answer: 'Rung 1: XIC(FLOAT_HIGH) XIC(PUMP_RUN) → TON(FLOOD_TMR, 30000). Rung 3: XIC(FLOOD_TMR.DN) → OTU(PUMP_RUN). Rung 4: XIC(FLOOD_TMR.DN) → OTL(FLOOD_ALARM).',
      difficulty: 'easy',
    },
    {
      problem: 'A motor has a star-delta starter: on start command, run in STAR configuration for 5 seconds, then switch to DELTA. Write the ladder logic using TON. Include the output rungs for STAR_CONTACTOR and DELTA_CONTACTOR, with mechanical interlock (STAR and DELTA must never be simultaneously energized).',
      hint: 'STAR is on during the first 5 seconds. DELTA is on after the timer completes. Use timer.DN to switch, and XIO interlocks between the contactors.',
      walkthrough: [
        'Rung 1 — Start timer: [XIC(START_CMD)] → TON(STAR_DELTA_TMR, PRE=5000)',
        '  Timer runs continuously from start command.',
        'Rung 2 — STAR contactor: [XIC(START_CMD)] [XIO(STAR_DELTA_TMR.DN)] [XIO(DELTA_CONTACTOR)] → OTE(STAR_CONTACTOR)',
        '  STAR is on: while started AND timer not done AND DELTA is not on (interlock).',
        'Rung 3 — DELTA contactor: [XIC(START_CMD)] [XIC(STAR_DELTA_TMR.DN)] [XIO(STAR_CONTACTOR)] → OTE(DELTA_CONTACTOR)',
        '  DELTA is on: while started AND timer done AND STAR is not on (interlock).',
        'Sequence: START_CMD → STAR on (DELTA off) → 5 seconds → STAR off → DELTA on.',
        'The XIO interlocks ensure never simultaneous: STAR rung checks XIO(DELTA_CONTACTOR), DELTA rung checks XIO(STAR_CONTACTOR).',
        'Critical timing: there is a brief moment when STAR turns off and DELTA turns on (same scan — STAR_CONTACTOR OTE goes 0, then DELTA_CONTACTOR OTE sees XIO(STAR_CONTACTOR) now passing). This is safe because the PLC output scan defers physical output changes to end-of-scan.',
      ],
      answer: 'STAR rung: XIC(START_CMD) XIO(TMR.DN) XIO(DELTA_CONTACTOR) → OTE(STAR_CONTACTOR). DELTA rung: XIC(START_CMD) XIC(TMR.DN) XIO(STAR_CONTACTOR) → OTE(DELTA_CONTACTOR). TON preset = 5000ms.',
      difficulty: 'medium',
    },
    {
      problem: 'A machine needs to track total run time for maintenance scheduling. The maintenance interval is 2000 hours. The machine runs when MACHINE_RUNNING=1. Design an RTO-based run-hour timer system that triggers a MAINTENANCE_DUE alarm when 2000 hours are reached. Explain why RTO is necessary instead of TON.',
      hint: 'RTO retains its accumulator across power cycles and across machine stops. 2000 hours = how many milliseconds?',
      walkthrough: [
        '2000 hours × 60 min/hr × 60 sec/min × 1000 ms/sec = 7,200,000,000 ms.',
        'This exceeds a 32-bit signed integer max (2,147,483,647). Need a different approach.',
        'Practical solution: use RTO with PRE = 3,600,000 ms (1 hour). Count completions.',
        'Rung 1: [XIC(MACHINE_RUNNING)] → RTO(HOUR_TMR, PRE=3,600,000)',
        'Rung 2: [XIC(HOUR_TMR.DN)] → CTU(HOUR_COUNTER, PRE=2000)',
        '  Count hours. When HOUR_COUNTER.DN=1, 2000 hours have elapsed.',
        'Rung 3: [XIC(HOUR_TMR.DN)] → RES(HOUR_TMR)',
        '  Reset the hour timer after each hour completion.',
        'Rung 4: [XIC(HOUR_COUNTER.DN)] → OTL(MAINTENANCE_DUE)',
        'Rung 5: [XIC(MAINTENANCE_RESET)] → RES(HOUR_COUNTER)',
        '  Technician resets counter after performing maintenance.',
        'Why RTO not TON: TON resets to 0 every time MACHINE_RUNNING goes false (machine stops for a break). 30 minutes of accumulated run time would be lost every time the machine pauses. RTO holds the accumulator through pauses, only counting while running, accumulating correctly over days/weeks.',
      ],
      answer: 'Use RTO with PRE=3,600,000ms (1 hour). CTU counter counts hours and triggers MAINTENANCE_DUE at 2000 counts. Reset RTO with RES after each hour. TON would lose accumulated time on every machine stop.',
      difficulty: 'hard',
    },
  ],

  examples: [
    {
      title: 'Conveyor speed-up delay',
      problem: 'When a jam sensor clears (JAM_SENSOR goes false), wait 3 seconds before accelerating the conveyor back to full speed (to allow in-progress parts to clear). After the 3-second delay, if the jam returns within 10 seconds, go directly to fault state (REPEAT_JAM_FAULT). Write the timer rungs.',
      solution: 'Rung 1 — Jam-clear delay timer:\n  [XIO(JAM_SENSOR)] → TON(JAM_CLEAR_TMR, PRE=3000)\n  Timer starts when jam sensor clears. Resets if jam returns.\n\nRung 2 — Full speed enable:\n  [XIC(JAM_CLEAR_TMR.DN)] → OTE(FULL_SPEED_CMD)\n  Resume full speed 3 seconds after jam clears.\n\nRung 3 — Repeat jam watchdog:\n  [XIC(JAM_CLEAR_TMR.DN)] → TON(REPEAT_JAM_TMR, PRE=10000)\n  Start 10-second watchdog after jam clears and machine resumes.\n\nRung 4 — Repeat jam detection:\n  [XIC(REPEAT_JAM_TMR.TT)] [XIC(JAM_SENSOR)] → OTL(REPEAT_JAM_FAULT)\n  If jam returns WHILE the watchdog is running (within 10s of clearing):\n  latch the repeat-jam fault.\n\nRung 5 — Watchdog cancel (normal):\n  [XIC(REPEAT_JAM_TMR.DN)] → OTE(WATCHDOG_EXPIRED)\n  Watchdog expired normally — no repeat jam within 10s, machine is clear.',
    },
  ],
};
