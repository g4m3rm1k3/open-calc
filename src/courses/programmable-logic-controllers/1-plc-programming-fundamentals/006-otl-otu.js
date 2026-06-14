export default {
  id: 'plc0-006',
  slug: 'otl-otu',
  chapter: 'plc0',
  order: 6,
  title: 'OTE, OTL, and OTU — Three Output Instructions',
  subtitle: 'Non-retentive vs. retentive outputs: when to use the SR latch instructions and how they differ from the basic coil.',
  tags: ['OTE', 'OTL', 'OTU', 'output latch', 'output unlatch', 'retentive', 'non-retentive', 'SR latch', 'memory bit', 'latch coil'],
  aliases: 'OTE OTL OTU output latch unlatch retentive non-retentive SR latch memory',
  timeToComplete: 20,
  coreConcept: "OTE (Output Energize) is non-retentive: the tag follows the rung power state every scan. OTL (Output Latch) sets a tag to 1 when the rung is true and holds it at 1 even when the rung goes false. OTU (Output Unlatch) clears a tag to 0 when the rung is true and holds it at 0 even when the rung goes false. OTL and OTU together implement an SR latch — the fundamental memory element.",
  prerequisites: ['plc0-005'],
  nextLesson: 'timers',

  hook: {
    question: "A fault occurs: TEMP_HIGH goes true for 200ms, then the temperature drops and TEMP_HIGH returns to false. You need the alarm to stay on until the operator presses ACKNOWLEDGE. An OTE coil fed by TEMP_HIGH will turn off when TEMP_HIGH clears — the alarm self-clears with the fault. How do you make the alarm stick?",
    realWorldContext: "Alarms that self-clear are useless — the operator needs to know a fault occurred and acknowledge it deliberately. Latched alarms, faulted states that require explicit reset, process setpoints that must be held, step counter values that persist across scans — these all require retentive outputs. OTL and OTU are the PLC implementation of the SR latch from digital logic. Every real PLC program has dozens of latched bits: cycle complete flags, fault histories, mode indicators. Using OTE where OTL/OTU is needed is one of the most common sources of transient logic bugs in industrial programs.",
  },

  mentalModel: [
    "**OTE is 'continuous assignment.'** Every scan, OTE writes the current rung power state to the tag. Rung true → tag=1. Rung false → tag=0. The tag doesn't remember — it just reflects the rung right now. If the rung condition goes false for even one scan, the tag drops to 0. OTE is stateless.",
    "**OTL is 'set and forget.'** When the OTL rung goes true, the tag is set to 1 and stays at 1 regardless of what the rung does next scan. The rung can go false the very next scan — the tag is still 1. Only OTU can clear it. OTL is the S input of an SR latch.",
    "**OTU is 'clear on command.'** When the OTU rung goes true, the tag is cleared to 0 and stays at 0 regardless of what the rung does next. OTL is needed to set it again. OTU is the R input of the SR latch. Together, OTL and OTU give you a bit that remembers its last commanded state — the fundamental memory element.",
  ],

  intuition: {
    prose: [
      "**When OTE is correct.** Use OTE when the output should track its conditions continuously: a motor that should run whenever the run command is active, a pilot light that reflects a sensor state, a calculated intermediate flag used within the same scan. If the condition changes, the output should immediately follow. OTE is the right choice for all purely combinational logic where there's no need for memory.",
      "**When OTL/OTU is correct.** Use OTL/OTU when the output represents a state that should persist after the triggering event. Classic cases: alarm memory (triggered by fault, cleared by acknowledge), step counter flags (set on entry, cleared on exit), production counters (set once per part, never auto-clear), mode bits (set by mode button press, cleared by mode cancel button). Any time you catch a rising edge and hold its result, use OTL.",
      "**The forbidden state.** If both OTL and OTU fire on the same tag in the same scan, the final state depends on which rung comes last in scan order — the same 'last rung wins' behavior as OTE double-coil. This is the SR latch's forbidden state (S=R=1). Prevention: add XIO(ACK_PB) in series with the OTL rung (don't set the alarm while it's being acknowledged). Or use programming conventions that ensure OTL and OTU rungs have mutually exclusive conditions.",
      "**ONS — one-shot rising (a special case).** Some PLCs include ONS (One-Shot) or OSR (One-Shot Rising) instructions that fire the output TRUE for exactly one scan when the input transitions from false to true. This is useful for: detecting the exact moment a button is pressed (to avoid repeated triggers while held), triggering a counter on a part sensor edge, or advancing a step counter. ONS is internally implemented with a latched storage bit that records the previous state of the input. Without ONS, you'd use XIC(SENSOR) in series with XIO(SENSOR_PREV) to detect the rising edge manually.",
      "**Scan restart and retentive tags.** On power cycle, all non-retentive tags (BOOL, INT, DINT) are initialized to 0 — including OTE outputs and OTL/OTU bits. If a machine was mid-cycle when power was cut, all step flags clear and the machine goes to step 0. For some applications, you want persistent memory across power cycles — retentive memory areas. Allen-Bradley designates specific memory files as retentive. Siemens uses retain attribute on data block variables. Use retentive only for values that need to survive power loss (recipe setpoints, production counts) — not for runtime state that should safely reinitialize to 0.",
    ],
    callouts: [
      {
        type: 'definition',
        title: 'OTE vs OTL vs OTU Comparison',
        body: '| Instruction | Symbol | Sets on True | Clears on False | Retentive |\n|---|---|---|---|---|\n| OTE | ( ) | Yes | Yes | No |\n| OTL | (L) | Yes | No | Yes |\n| OTU | (U) | Clears only | No | Yes |\n\n**OTE behavior:** Tag = rung power (every scan, no memory)\n**OTL behavior:** Tag SET when rung=true; ignores rung=false\n**OTU behavior:** Tag CLEAR when rung=true; ignores rung=false\n\nOTL and OTU always come in pairs targeting the same tag. Having OTL without a corresponding OTU (or vice versa) is always a programming error.',
      },
      {
        type: 'insight',
        title: 'Alarm Latch Pattern',
        body: 'The standard alarm-with-acknowledge pattern:\n\nRung A: [XIC(FAULT_CONDITION)] ─── (OTL ALARM_ACTIVE)\nRung B: [XIC(ACK_BUTTON)] ────── (OTU ALARM_ACTIVE)\nRung C: [XIC(ALARM_ACTIVE)] ─── (ALARM_HORN)\nRung D: [XIC(ALARM_ACTIVE)] ─── (ALARM_LIGHT)\n\nBehavior:\n- FAULT_CONDITION goes true (even briefly) → ALARM_ACTIVE latched to 1 → horn and light on\n- FAULT_CONDITION clears → alarm stays on (OTL is retentive)\n- Operator presses ACK_BUTTON → ALARM_ACTIVE cleared → horn and light off\n- If FAULT_CONDITION is still true when ACK is pressed → alarm clears, but will re-latch next scan from Rung A\n\nSafety note: Some applications require FAULT_CONDITION to be clear BEFORE the alarm can be acknowledged. Add XIO(FAULT_CONDITION) in series with the OTU rung for this behavior.',
      },
      {
        type: 'procedure',
        title: 'Choosing OTE vs OTL/OTU',
        body: 'Ask these questions:\n\n1. **Should the output turn off automatically when conditions clear?**\n   - YES → OTE\n   - NO → OTL/OTU pair\n\n2. **Is the output driven by a momentary event (edge) that must be held?**\n   - YES → OTL (set) + OTU (clear)\n   - NO → OTE is usually fine\n\n3. **Does the tag represent a state vs. a continuous signal?**\n   - STATE (fault occurred, step 3 active, mode is manual) → OTL/OTU\n   - CONTINUOUS SIGNAL (motor is running now, sensor is high now) → OTE\n\n4. **Is there a separate clear condition?**\n   - Two distinct conditions for set and clear → always OTL/OTU\n   - Single condition controls both → OTE',
      },
    ],
    visualizations: [
      {
        id: 'PLCLadderSim',
        title: 'OTL/OTU Alarm Latch',
        mathBridge: 'Trigger FAULT to latch the alarm — then clear FAULT. Notice ALARM_ACTIVE stays on (OTL is retentive). Press ACK to clear it. Try triggering FAULT and ACK simultaneously — see which wins based on rung order. Compare to Rung 3 which uses OTE: it resets immediately when FAULT clears.',
        initialProps: {
          program: [
            [
              { type: 'XIC', tag: 'FAULT_INPUT', label: 'Fault' },
              { type: 'OTL', tag: 'ALARM_ACTIVE', label: 'Alarm Active' },
            ],
            [
              { type: 'XIC', tag: 'ACK_BUTTON', label: 'Acknowledge' },
              { type: 'OTU', tag: 'ALARM_ACTIVE', label: 'Alarm Active' },
            ],
            [
              { type: 'XIC', tag: 'ALARM_ACTIVE', label: 'Alarm Active' },
              { type: 'OTE', tag: 'ALARM_HORN', label: 'Alarm Horn' },
            ],
            [
              { type: 'XIC', tag: 'FAULT_INPUT', label: 'Fault (live)' },
              { type: 'OTE', tag: 'FAULT_LIGHT', label: 'Fault Light (OTE - no memory)' },
            ],
          ],
          tags: {
            FAULT_INPUT: { type: 'BOOL', value: false },
            ACK_BUTTON: { type: 'BOOL', value: false },
            ALARM_ACTIVE: { type: 'BOOL', value: false },
            ALARM_HORN: { type: 'BOOL', value: false },
            FAULT_LIGHT: { type: 'BOOL', value: false },
          },
          inputs: [
            { tag: 'FAULT_INPUT', label: 'Fault Input' },
            { tag: 'ACK_BUTTON', label: 'Acknowledge' },
          ],
          outputs: [
            { tag: 'ALARM_ACTIVE', label: 'Alarm Active (latched)' },
            { tag: 'ALARM_HORN', label: 'Alarm Horn' },
            { tag: 'FAULT_LIGHT', label: 'Fault Light (live/OTE)' },
          ],
        },
      },
    ],
  },

  math: {
    prose: [
      "**SR latch characteristic equation in PLC terms.** The OTL/OTU pair implements: Q⁺ = S + (Q · R̄), where S is the OTL rung condition, R is the OTU rung condition, and Q is the current tag value. The SR latch's forbidden state (S=R=1) in PLC terms: if both OTL rung and OTU rung are simultaneously true, the last rung in scan order determines Q. Unlike the hardware SR latch (which can enter a metastable state), the PLC's sequential scan execution always produces a deterministic result — but it may not be the intended one. The R-priority condition (OTU rung after OTL rung) means Q=0 if both fire. S-priority (OTL rung after OTU rung) means Q=1 if both fire.",
    ],
    callouts: [],
  },

  challenges: [
    {
      problem: 'A machine has a CYCLE_DONE bit. CYCLE_START triggers the cycle, CYCLE_COMPLETE signals when done. Which instructions should control CYCLE_DONE, and write the two rungs?',
      hint: 'CYCLE_DONE must persist after CYCLE_COMPLETE (which may be momentary). It should clear when the next cycle starts.',
      walkthrough: [
        'CYCLE_DONE must: turn ON when cycle completes (momentary CYCLE_COMPLETE pulse), stay ON until the next CYCLE_START.',
        'This requires persistence → use OTL/OTU.',
        'Rung A: [XIC(CYCLE_COMPLETE)] → (OTL CYCLE_DONE)',
        '  Sets CYCLE_DONE when cycle finishes. Stays set even after CYCLE_COMPLETE clears.',
        'Rung B: [XIC(CYCLE_START)] → (OTU CYCLE_DONE)',
        '  Clears CYCLE_DONE when a new cycle starts.',
        'Why not OTE? If CYCLE_COMPLETE is only a 1-scan pulse (which is common for machine completion signals), OTE(CYCLE_DONE) would immediately clear after the one scan, making it useless for "is cycle done?" checks.',
        'The OTL persists the one-scan pulse into a held state until explicitly cleared.',
      ],
      answer: 'Rung A: XIC(CYCLE_COMPLETE) → OTL(CYCLE_DONE). Rung B: XIC(CYCLE_START) → OTU(CYCLE_DONE). OTL required because CYCLE_COMPLETE may be momentary.',
      difficulty: 'easy',
    },
    {
      problem: 'An OTL rung fires on FAULT_A and an OTU rung fires on ACK. They both target ALARM_BIT. In Scan 1: FAULT_A=1, ACK=0 → ALARM_BIT=? In Scan 2: FAULT_A=1, ACK=1 → ALARM_BIT=? In Scan 3: FAULT_A=0, ACK=1 → ALARM_BIT=? In Scan 4: FAULT_A=0, ACK=0 → ALARM_BIT=? The OTU rung is AFTER the OTL rung in the program.',
      hint: 'Track ALARM_BIT through each scan. OTL sets to 1, OTU clears to 0. If both fire, last-rung-wins (OTU after OTL = OTU wins).',
      walkthrough: [
        'Start: ALARM_BIT = 0.',
        'Scan 1: FAULT_A=1 → OTL fires → ALARM_BIT set to 1. ACK=0 → OTU does NOT fire. End: ALARM_BIT=1.',
        'Scan 2: FAULT_A=1 → OTL fires → tries to set ALARM_BIT=1. ACK=1 → OTU fires AFTER OTL → clears ALARM_BIT=0. End: ALARM_BIT=0 (OTU wins because it runs after OTL).',
        'Scan 3: FAULT_A=0 → OTL does NOT fire. ACK=1 → OTU fires → clears ALARM_BIT=0 (already 0, no change). End: ALARM_BIT=0.',
        'Scan 4: FAULT_A=0, ACK=0 → neither fires. ALARM_BIT holds at 0. End: ALARM_BIT=0.',
        'Key insight from Scan 2: the OTU rung running after OTL means acknowledgment wins when both occur simultaneously.',
        'This is the "reset priority" design — safer because an operator can always acknowledge even during a sustained fault.',
      ],
      answer: 'Scan 1: 1. Scan 2: 0 (OTU wins). Scan 3: 0. Scan 4: 0. OTU has reset priority because it runs after OTL.',
      difficulty: 'medium',
    },
    {
      problem: 'Design a 3-bit step counter using OTL and OTU: STEP_1, STEP_2, STEP_3 bits. When ADVANCE is pulsed: STEP_1→STEP_2, STEP_2→STEP_3, STEP_3→STEP_1 (wraps). Only one step is active at a time. Start in STEP_1. Write all rungs needed.',
      hint: 'Think about what each OTL and OTU must look at. Setting STEP_2 requires clearing STEP_1 in the same scan.',
      walkthrough: [
        'The machine state: exactly one of STEP_1, STEP_2, STEP_3 is set at any time.',
        'Transition logic: when ADVANCE goes high (use ONS for one-shot if available, or manage manually):',
        'STEP_1 → STEP_2: Clear STEP_1, Set STEP_2.',
        'STEP_2 → STEP_3: Clear STEP_2, Set STEP_3.',
        'STEP_3 → STEP_1: Clear STEP_3, Set STEP_1.',
        'Rungs for STEP_1→STEP_2 transition:',
        'Rung: [XIC(ADVANCE)] [XIC(STEP_1)] → OTU(STEP_1)',
        'Rung: [XIC(ADVANCE)] [XIC(STEP_1)] → OTL(STEP_2)',
        'Rungs for STEP_2→STEP_3 transition:',
        'Rung: [XIC(ADVANCE)] [XIC(STEP_2)] → OTU(STEP_2)',
        'Rung: [XIC(ADVANCE)] [XIC(STEP_2)] → OTL(STEP_3)',
        'Rungs for STEP_3→STEP_1 transition:',
        'Rung: [XIC(ADVANCE)] [XIC(STEP_3)] → OTU(STEP_3)',
        'Rung: [XIC(ADVANCE)] [XIC(STEP_3)] → OTL(STEP_1)',
        'Initialization rung (runs once at startup): Set STEP_1 initially using a first-scan bit.',
        'This pattern is a manual state machine implementation. In practice, use an INT STEP_COUNTER tag with MOV instructions instead — much cleaner for more than 3 steps.',
      ],
      answer: '6 rungs total (one OTU + one OTL per transition). Each transition: XIC(ADVANCE) AND XIC(current_step) → OTU(current_step) then OTL(next_step).',
      difficulty: 'hard',
    },
  ],

  examples: [
    {
      title: 'E-stop reset circuit with OTL/OTU',
      problem: 'After an E-stop is pressed, the machine must not restart automatically when the E-stop is released. The operator must press a separate RESET button to re-enable. Design the OTL/OTU logic.',
      solution: 'When E-stop is pressed → set a SAFE_STATE latch that blocks machine operation.\nWhen E-stop is released AND operator presses RESET → clear the latch.\n\nRung 1: XIC(ESTOP_PRESSED) → OTL(MACHINE_LOCKOUT)\n  (ESTOP_PRESSED = contact that goes high when E-stop is pressed)\n\nRung 2: XIO(ESTOP_PRESSED) → XIC(RESET_PB) → OTU(MACHINE_LOCKOUT)\n  (Only allow reset when E-stop is no longer pressed — cannot reset with E-stop held)\n\nRung 3: XIO(MACHINE_LOCKOUT) → [other machine enable logic] → OTE(MACHINE_ENABLE)\n  (Machine can only run when MACHINE_LOCKOUT=0)\n\nNote: ESTOP_PRESSED is a derived tag that goes 1 when the NC E-stop contact opens:\n  Rung 0: XIO(ESTOP_NC) → OTE(ESTOP_PRESSED)\n  (ESTOP_NC is the PLC input tag — 1 when NC contact is intact, 0 when pressed)\n\nThis pattern ensures deliberate re-enabling after any E-stop event.',
    },
  ],
};
