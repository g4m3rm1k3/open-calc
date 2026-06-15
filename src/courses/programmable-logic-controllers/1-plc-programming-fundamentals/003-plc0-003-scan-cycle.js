export default {
  id: 'plc0-003',
  slug: 'scan-cycle',
  chapter: 'plc0',
  order: 3,
  title: 'The Scan Cycle',
  subtitle: 'Input scan → program scan → output scan → housekeeping — the heartbeat of every PLC, and why it matters for your program.',
  tags: ['scan cycle', 'input scan', 'output scan', 'program scan', 'housekeeping', 'input image table', 'output image table', 'scan time', 'determinism', 'real-time'],
  aliases: 'scan cycle input scan output scan program scan determinism real time image table',
  timeToComplete: 20,
  coreConcept: "The PLC scan cycle is a continuous four-phase loop: (1) input scan — copy all physical inputs to input image table; (2) program scan — execute every rung from top to bottom using the image tables; (3) output scan — copy output image table to physical outputs; (4) housekeeping — communication, diagnostics. The cycle repeats immediately. Understanding this loop explains every timing behavior in PLC programs.",
  prerequisites: ['plc0-002'],
  nextLesson: 'first-rung',

  hook: {
    question: "Two rungs in a PLC program: Rung 1 turns on VALVE_A when SENSOR_1 is high. Rung 500 turns on VALVE_B when VALVE_A is high. In the same scan that SENSOR_1 first goes high, will VALVE_B turn on? If not, when?",
    realWorldContext: "The answer is: yes, VALVE_B will turn on in the same scan — because the program scan evaluates rungs sequentially, and by the time Rung 500 executes, the output image table already has VALVE_A=1 (set by Rung 1). This behavior — where one rung's output immediately affects another rung's input in the same scan — is called 'scan-order dependency,' and it's one of the most important concepts for writing correct PLC programs. If you had put Rung 500 BEFORE Rung 1, VALVE_B would lag one scan behind. Understanding the scan cycle is understanding why ladder logic behaves exactly as it does.",
  },

  mentalModel: [
    "**The scan is a snapshot.** At the start of each scan, the PLC takes a complete snapshot of all physical inputs and freezes them in the Input Image Table. The program sees only this snapshot — even if a physical input changes mid-scan, the program sees the value it had at scan start. This prevents the program from seeing inconsistent data where some rungs see the new value and earlier rungs saw the old value.",
    "**Top-to-bottom, left-to-right evaluation.** The program scan evaluates rungs sequentially from top to bottom. Within each rung, elements are evaluated left to right. An output written by Rung 1 is immediately visible to Rung 2 — outputs go into the Output Image Table, which is also read back during program scan for contacts. This 'immediate feedback' within a scan is deliberate and enables compact ladder logic.",
    "**The output update is deferred.** Physical outputs are NOT updated when a rung's OTE executes. They're written to the Output Image Table and only pushed to the physical output modules at the end of the program scan. This means all program logic runs to completion before any physical output changes — the machine never sees a half-updated output state.",
  ],

  intuition: {
    prose: [
      "**Phase 1: Input scan (image table update).** The CPU reads every input module on the backplane, one at a time, and copies the state of every input point into the Input Image Table in RAM. This takes a few microseconds for digital modules, longer for analog modules that need A/D conversion time. When this phase is done, the IIT is a complete, frozen snapshot of all inputs at that moment in time.",
      "**Phase 2: Program scan.** The CPU executes the user program rung by rung, top to bottom. Each rung reads its conditions from the IIT (and from the OIT for tags that are internal bits), evaluates the logic, and writes the result to the OIT. The physical outputs are NOT changed yet — only the OIT is updated. Rung order matters: a tag written by an earlier rung is immediately available to later rungs in the same scan.",
      "**Phase 3: Output scan (image table push).** After the last rung has been evaluated, the CPU copies the OIT to all output modules simultaneously. Every output changes (or stays the same) atomically from the machine's perspective — no partial updates. This is when the physical world actually changes in response to the program.",
      "**Phase 4: Housekeeping.** The CPU handles communication requests (from an HMI reading tag values, from a SCADA system, from the programming terminal), updates its internal diagnostic registers, resets the watchdog timer (if the watchdog expires without being reset, the CPU goes into fault — this catches infinite loops), and starts the next scan.",
      "**Scan time is not constant.** Scan time depends on program length (number of rungs), instruction complexity (compare instructions take longer than simple contacts), and communication traffic (if the HMI is polling 1000 tags per second, that takes time in housekeeping). For a typical 500-rung program with moderate comms, expect 5–15ms. Long, complex programs with heavy comms can reach 50ms. If scan time exceeds the watchdog timeout (typically configurable from 10ms to 500ms), the CPU faults.",
      "**Immediate I/O instructions.** Some PLCs support 'immediate I/O' instructions (IIN, IOT in Allen-Bradley) that force an input module read or output module write mid-scan, bypassing the normal image table cycle. These are used when a sub-millisecond input response is critical. Use them sparingly — they increase scan time and can create re-entrancy problems if the immediate read catches a different value than the scan-start image.",
    ],
    callouts: [
      {
        type: 'procedure',
        title: 'Tracing a Signal Through the Scan Cycle',
        body: 'Scenario: sensor turns on → motor starts. Trace through one complete scan:\n\n1. **Input Scan:** Physical sensor terminal = 24VDC. IIT bit SENSOR_1 = 1.\n2. **Program Scan:**\n   - Rung 1: XIC(SENSOR_1) evaluates true. OTE(MOTOR_RUN) → OIT bit MOTOR_RUN = 1.\n   - Remaining rungs execute... (MOTOR_RUN is now 1 in OIT, visible to later rungs)\n3. **Output Scan:** OIT bit MOTOR_RUN = 1 pushed to output module → physical terminal switches to 24VDC → motor contactor coil energized.\n4. **Housekeeping:** HMI reads MOTOR_RUN = 1 for display.\n\nTotal latency from sensor going high to physical output energized: 1 scan = 5–15ms (typical).\n\nIf sensor goes high DURING the program scan (after the IIT was taken), the motor won\'t start until the scan AFTER the next input scan.',
      },
      {
        type: 'insight',
        title: 'Why Rung Order Matters (And When It Doesn\'t)',
        body: '**Order matters for same-scan feedback:**\nIf Rung 100 writes OUTPUT_A = 1, Rung 101 can immediately read OUTPUT_A = 1.\nIf Rung 101 is before Rung 100, it reads OUTPUT_A = 0 (the value from the previous scan).\n\n**Practical rule:** Place the rung that drives a condition BEFORE the rungs that read that condition. This is the "natural" order — like English, read left-to-right, top-to-bottom.\n\n**Order does NOT matter for physical inputs:**\nAll physical inputs were snapshotted at scan start. SENSOR_1 has the same value in Rung 1 as in Rung 500 — it cannot change mid-scan.\n\n**The "one scan late" bug:**\nFailing to account for rung order is the source of "it works, but there\'s always a one-scan delay" bugs. Usually harmless at 10ms, but can cause missed edge detections in high-speed applications.',
      },
      {
        type: 'definition',
        title: 'Watchdog Timer',
        body: 'The watchdog timer is a hardware timer in the CPU that must be reset by software at the end of every scan (housekeeping phase). If the scan takes longer than the watchdog timeout — because of an infinite loop, runaway program, or CPU overload — the watchdog times out and the CPU transitions to FAULT state:\n\n- All outputs de-energize (output image cleared to 0, then pushed)\n- CPU status light turns red\n- Fault code logged to fault history\n\nThis is a safety feature: a program that can\'t complete its scan is not executing predictably, so it\'s safer to stop all outputs than to continue in an unknown state.\n\nDefault watchdog timeout: typically 100–500ms. Adjustable in project properties. Never set it longer than the slowest acceptable response time for an E-stop.',
      },
    ],
    visualizations: [
      {
        id: 'PLCScanCycleViz',
        title: 'PLC Scan Cycle — Live Animation',
        mathBridge: 'Watch the four phases cycle: Input Scan → Program Scan → Output Scan → Housekeeping. Toggle inputs — notice the IIT freezes at scan start and doesn\'t update until the next Input Scan phase. Switch to Step mode to walk through execution one step at a time and see exactly what changes in each phase.',
      },
    ],
  },

  math: {
    prose: [
      "**Scan time estimation.** Rough estimate: 1ms per 1,000 Boolean instructions, 3–5ms per 1,000 math/compare instructions. For a 300-rung program with 3 elements per rung (900 instructions total, mostly Boolean): ~1ms program scan. Add communication overhead (HMI polling 500 tags at 100ms intervals = 5 tag reads per ms = ~0.5ms per scan in housekeeping). Total: ~2ms scan. This is the basis for sizing watchdog timers and understanding system responsiveness.",
      "**Maximum detectable frequency.** A signal that pulses at frequency f Hz must stay high for at least one full scan (t_scan) to be guaranteed detected. Maximum detectable frequency: f_max = 1 / (2 × t_scan). With t_scan = 10ms: f_max = 50Hz (a pulse at 50Hz has a 10ms period, exactly 1 scan per half-period). For reliable detection, the signal must be high for at least 2 scans: f_max_reliable = 1 / (4 × t_scan) = 25Hz. Above this, use a high-speed input module with hardware latching.",
    ],
    callouts: [],
  },

  challenges: [
    {
      problem: 'A PLC program has 450 rungs. The CPU executes 1,200 Boolean instructions per millisecond. Each rung averages 2.5 Boolean instructions. The HMI polls 200 tags at 50ms intervals. Estimate the scan time.',
      hint: 'Calculate program execution time + communication overhead per scan.',
      walkthrough: [
        'Program execution time:',
        '450 rungs × 2.5 instructions/rung = 1,125 Boolean instructions total.',
        '1,125 ÷ 1,200 instructions/ms = 0.94ms program scan.',
        'Communication overhead:',
        'HMI polls 200 tags every 50ms.',
        '200 tags / 50ms = 4 tag reads per ms.',
        'Assume each tag read takes ~2μs: 4 reads × 2μs = 8μs = 0.008ms per ms.',
        'Per scan (0.94ms scan): 0.94ms × 0.008ms/ms ≈ 0.008ms communication overhead (negligible).',
        'If the HMI request arrives once per scan: 200 tags × 2μs = 0.4ms per scan.',
        'Total estimated scan time: 0.94 + 0.4 = ~1.34ms.',
        'Watchdog timer should be set to at least 5× the nominal scan time: 5 × 1.34ms ≈ 7ms minimum.',
      ],
      answer: 'Estimated scan time ≈ 1.3–1.5ms. Watchdog should be set to at least 7ms.',
      difficulty: 'medium',
    },
    {
      problem: 'In the following 4-rung program, what is the state of PILOT_LIGHT at the end of the scan when SENSOR is first detected high? Rung 1: XIC(SENSOR) → OTE(FLAG_A). Rung 2: XIC(FLAG_A) → OTE(FLAG_B). Rung 3: XIO(FLAG_B) → OTE(FLAG_C). Rung 4: XIC(FLAG_C) → OTE(PILOT_LIGHT).',
      hint: 'Trace the value of each flag after each rung executes. Rung N+1 sees the output of Rung N.',
      walkthrough: [
        'Start of scan: SENSOR=1 (newly detected). FLAG_A=0, FLAG_B=0, FLAG_C=0, PILOT_LIGHT=0 (previous scan values).',
        'Rung 1: XIC(SENSOR)=1 → OTE(FLAG_A). FLAG_A becomes 1.',
        'Rung 2: XIC(FLAG_A)=1 (just set by Rung 1!) → OTE(FLAG_B). FLAG_B becomes 1.',
        'Rung 3: XIO(FLAG_B)=0 (FLAG_B is 1, so XIO is false) → OTE(FLAG_C). FLAG_C becomes 0.',
        'Rung 4: XIC(FLAG_C)=0 → OTE(PILOT_LIGHT). PILOT_LIGHT becomes 0.',
        'End of scan: PILOT_LIGHT = 0.',
        'The scan-order feedback propagates through 4 rungs in the same scan. The XIO(FLAG_B) is false because FLAG_B was already set in the same scan.',
        'PILOT_LIGHT stays off as long as SENSOR is high. If SENSOR goes back to 0: FLAG_A=0, FLAG_B=0, FLAG_C=1 (XIO passes), PILOT_LIGHT=1.',
        'Conclusion: PILOT_LIGHT is the inverse of SENSOR (with one intermediate flag).',
      ],
      answer: 'PILOT_LIGHT = 0 in the same scan SENSOR goes high (FLAG_A→FLAG_B cascade prevents FLAG_C from being set).',
      difficulty: 'hard',
    },
    {
      problem: 'The output scan pushes all physical outputs at once at the end of the program scan. Why is this important for machine safety? Give a specific example of what could go wrong if outputs were updated rung-by-rung as they were evaluated.',
      hint: 'Think about two outputs that must never be active simultaneously — like forward and reverse on a motor.',
      walkthrough: [
        'Consider a forward/reverse motor control program:',
        'Rung 10: XIC(FWD_CMD) XIO(REV_RUN) → OTE(FWD_RUN)',
        'Rung 11: XIC(REV_CMD) XIO(FWD_RUN) → OTE(REV_RUN)',
        'With deferred output update (correct PLC behavior):',
        '- FWD_RUN and REV_RUN update simultaneously at end-of-scan.',
        '- The interlocks XIO(REV_RUN) and XIO(FWD_RUN) see the previous scan values, ensuring mutual exclusion.',
        'If outputs updated rung-by-rung (hypothetical bad behavior):',
        '- Rung 10 runs: FWD_RUN = 1 (immediately written to physical output).',
        '- Physical motor forward contactor energizes.',
        '- Rung 11 runs: XIO(FWD_RUN) — checks the ALREADY UPDATED physical output, sees FWD=1, correctly blocks REV.',
        '- However: between Rung 10 and Rung 11, for a few microseconds, FWD is energized before REV check runs.',
        '- In relay logic, this caused contact chatter and arc damage.',
        '- Deferred output update eliminates this entirely: no physical change occurs until all logic is complete.',
        'This is why the output image table exists — it decouples program evaluation from physical output change.',
      ],
      answer: 'Deferred output update ensures all interlock logic evaluates before any physical output changes. This prevents momentary false output states that could damage equipment or create hazardous conditions.',
      difficulty: 'easy',
    },
  ],

  examples: [
    {
      title: 'Scan cycle timing for a press application',
      problem: 'A hydraulic press requires that two anti-tie-down buttons (LEFT_HAND and RIGHT_HAND) both be pressed within 0.5 seconds of each other to activate. The PLC scan time is 8ms. Describe how to implement this using the scan cycle timing.',
      solution: 'This is a "simultaneous button" safety requirement. Implementation:\n\n1. When either button first goes high, start a TON timer with 500ms preset.\n2. During the timer timing, check if both buttons are high.\n3. If both are high before timer.DN → activate press (transition allowed).\n4. If timer.DN before both are high → reject (operator released one hand, reset and require both again).\n\nScan-cycle consideration:\n- At 8ms scan, the PLC can detect both buttons going high to within one scan (8ms) of each other — well within the 500ms anti-tie-down window.\n- The timer accumulator increments each scan by deltaMs (8ms), so timing resolution is ±1 scan = ±8ms against a 500ms window — negligible error.\n- Use OSR (one-shot rising) on each button to detect the leading edge, then start the timer on the first edge. This avoids retriggering if a button bounces.',
    },
  ],
};
