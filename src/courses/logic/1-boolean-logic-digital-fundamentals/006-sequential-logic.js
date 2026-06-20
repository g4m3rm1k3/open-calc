export default {
  id: 'logic0-006',
  slug: 'sequential-logic',
  chapter: 'logic0',
  order: 6,
  title: 'Sequential Logic and Flip-Flops',
  subtitle: 'Logic with memory — how circuits remember state, and why PLCs use latches and seal-in circuits.',
  tags: ['flip-flop', 'SR latch', 'D flip-flop', 'JK flip-flop', 'sequential logic', 'clock', 'state', 'latch', 'memory'],
  aliases: 'flip flop SR D JK T latch sequential logic clock state memory register',
  timeToComplete: 22,
  coreConcept: "Sequential logic output depends on both current inputs AND current state (memory). The SR latch is the fundamental memory element: a cross-coupled NOR pair that remembers which input was last asserted. Flip-flops add clock synchronization. PLC OTL/OTU instructions are direct implementations of SR latches.",
  prerequisites: ['logic0-005'],
  nextLesson: 'state-machines',

  hook: {
    question: "A machine needs to stay running after the operator releases the start button — but stop immediately when the E-stop is pressed. There's no spring-return memory in the PLC. How does the PLC remember 'I should still be running' even after the start button input goes back to 0?",
    realWorldContext: "Every PLC program that remembers anything — a mode, a fault condition, an alarm that was acknowledged, a step in a sequence — is using sequential logic. The PLC's OTL (latch) and OTU (unlatch) instructions directly implement the SR flip-flop. Industrial machines have dozens of state variables: current cycle step, last tool used, fault history, accumulated piece count. All of these are sequential logic — the output depends on history, not just the current moment. Understanding how flip-flops work explains why PLC bits behave the way they do, why race conditions happen in poorly-written programs, and how to design sequences that are immune to them.",
  },

  mentalModel: [
    "**Combinational vs. sequential: the memory distinction.** Combinational logic output is a pure function of current inputs — give the same inputs, get the same output, every time. Sequential logic has state: internal memory that persists between input changes. The same inputs can produce different outputs depending on what happened before. Anything that 'remembers' is sequential.",
    "**Feedback creates memory.** The mechanism behind all sequential logic is feeding the output back to the input. A cross-coupled pair of NOR gates (or NAND gates) creates a loop where the circuit has two stable states — 0 or 1 — and holds that state as long as nothing forces a change. The Set input forces it to 1; the Reset input forces it to 0. Between changes, the stored bit is stable.",
    "**Clock synchronization prevents races.** Asynchronous latches change whenever inputs change. In complex circuits, this can cause timing races where two signals arrive slightly out of order and the circuit goes to the wrong state. Clocked flip-flops only update their state on the clock edge (rising or falling), making timing predictable. PLC scan cycle is the equivalent of a clock: all logic evaluates from a snapshot of inputs taken at the start of the scan.",
  ],

  intuition: {
    prose: [
      "**The SR latch — the simplest memory.** An SR (Set-Reset) latch is two cross-coupled NOR gates. Each gate's output feeds back to the other gate's input. Set (S) forces Q to 1. Reset (R) forces Q to 0. When both S and R are 0, Q holds its previous state — the feedback loop maintains the stored bit. This is the circuit that makes memory possible from pure combinational gates. It has two stable states (Q=0, Q=1) — exactly the two states of a binary memory bit.",
      "**SR latch truth table and the forbidden state.** S=0, R=0: no change (Q holds). S=1, R=0: Q → 1 (set). S=0, R=1: Q → 0 (reset). S=1, R=1: both NOR outputs go to 0, which is logically contradictory (Q and Q̄ should be complements — this violates that). When S and R both drop to 0 afterward, the final state is unpredictable and depends on which gate is faster. The S=R=1 state is 'forbidden' — never apply it. This is why OTL and OTU instructions in a PLC are designed so you don't latch and unlatch the same bit in the same scan.",
      "**PLC seal-in circuit — SR latch in ladder logic.** Classic PLC motor control: a normally-open Start contact in parallel with a normally-open Run output contact, in series with a normally-closed Stop contact, feeding the Run output coil. When Start is pressed: Run coil energizes. Run contact closes in parallel with Start — this is the 'seal-in.' When Start is released: Run contact keeps the coil energized. When Stop is pressed: the series NC contact opens — Run coil drops out, Run contact opens, circuit stays off. This is an SR latch: Start = Set, Stop = Reset, Run = Q. The parallel branch with the output contact is the feedback that creates memory.",
      "**D flip-flop — clocked data capture.** The D (Data) flip-flop captures whatever is on the D input at the clock edge and holds it until the next clock edge. D→Q on rising edge, hold until next rising edge. Unlike the SR latch, there's no forbidden state — D is either 0 or 1. D flip-flops are the standard building block for registers and shift registers. In PLC terms: at the start of each scan, input values are captured ('latched') into an input image table — this is conceptually a bank of D flip-flops clocked by the start-of-scan signal.",
      "**JK flip-flop — the universal clocked flip-flop.** The JK flip-flop resolves the SR forbidden state: J=K=1 causes the flip-flop to toggle (invert its state). J=1, K=0 → Q=1 (set). J=0, K=1 → Q=0 (reset). J=0, K=0 → no change. J=K=1 → Q toggles. No forbidden state. The T (Toggle) flip-flop is a JK with J and K tied together — it toggles every clock edge when T=1. T flip-flops make divide-by-2 counters: chain N T flip-flops and you get a binary counter.",
      "**Master-slave and edge triggering.** Early flip-flops were level-triggered: they responded whenever the clock was high. This caused 'ones catching' — glitches on the input during the clock-high window could corrupt the state. Edge-triggered flip-flops only respond to the instant of the clock transition (rising or falling edge). Modern flip-flops are almost always edge-triggered. The clock symbol with a triangle on a flip-flop schematic indicates edge triggering. This is why PLC scan cycle edges (end-of-scan) are deterministic — they behave like falling-edge clocked updates.",
    ],
    callouts: [
      {
        type: 'definition',
        title: 'SR Latch Truth Table',
        body: '```\nS  R | Q(next) | Notes\n0  0 |  Q(hold) | No change — memory\n0  1 |    0     | Reset (clear)\n1  0 |    1     | Set\n1  1 | FORBIDDEN| Undefined next state\n```\n\nNOR-based SR latch equations:\n- Q = NOR(R, Q̄)\n- Q̄ = NOR(S, Q)\n\nNAND-based SR latch (SR̄ latch): inputs are active-low. More common in IC implementations.',
      },
      {
        type: 'definition',
        title: 'Flip-Flop Summary',
        body: '**SR flip-flop:** Set/Reset, forbidden state at S=R=1\n**D flip-flop:** Q captures D at clock edge. No forbidden state. Used for registers.\n**JK flip-flop:** J=K=1 toggles. Universal — no forbidden state.\n**T flip-flop:** Toggles when T=1, holds when T=0. Used for counters.\n\nAll clocked types share:\n- Clock edge sensitivity (↑ rising or ↓ falling)\n- Setup time: D/J/K must be stable before clock edge\n- Hold time: D/J/K must remain stable after clock edge\n- Propagation delay: Q updates after clock edge + tpd',
      },
      {
        type: 'insight',
        title: 'PLC OTL/OTU = SR Latch',
        body: 'Allen-Bradley RSLogix ladder:\n- **OTL** (Output Latch): Sets a bit to 1 and it stays 1 even if the rung condition goes false. Equivalent to S input.\n- **OTU** (Output Unlatch): Clears a bit to 0 and it stays 0 even if the rung condition goes false. Equivalent to R input.\n- The bit being latched is Q — it persists between scans.\n\nRule: never OTL and OTU the same bit in the same scan (the forbidden S=R=1 condition). In practice: put OTL and OTU rungs far apart, or use interlock logic to make them mutually exclusive.\n\nSiemens S7 equivalent: S (Set) and R (Reset) coils for memory bits (M bits).',
      },
      {
        type: 'insight',
        title: 'Metastability — When Timing Rules Are Violated',
        body: 'Every flip-flop has setup and hold time requirements. If the D input changes within the setup+hold window around the clock edge, the flip-flop enters metastability — an intermediate voltage state between 0 and 1. The flip-flop eventually resolves to a valid state, but the time to resolve is probabilistic and can be arbitrarily long.\n\nIn PLCs: inputs are sampled at start-of-scan. If a sensor changes exactly as sampling occurs, the captured value could be the old or new reading — but it will be a valid 0 or 1, not a metastable value, because the PLC input circuitry includes filtering and synchronization.\n\nIn high-speed digital design, crossing clock domains (two circuits with different clocks) always requires synchronization flip-flops to handle metastability.',
      },
    ],
    visualizations: [
      {
        id: 'FlipFlopSim',
        title: 'Flip-Flop Clock Simulator',
        mathBridge: 'Start with SR. Set S=1 and click Clock Edge — Q goes to 1. Set S=0, R=0 and click again — Q holds at 1 (memory!). Now try R=1 — Q resets to 0. Switch to D: Q always copies D on the clock edge. Switch to JK: with J=K=1, every clock edge toggles Q.',
      },
    ],
  },

  math: {
    prose: [
      "**Characteristic equations.** Each flip-flop type has a characteristic equation describing next state $Q^+$ as a function of current state $Q$ and inputs:\n\n$$\\text{SR: } Q^+ = S + \\bar{R}Q \\quad (S \\cdot R = 0 \\text{ required})$$\n$$\\text{D: } Q^+ = D$$\n$$\\text{JK: } Q^+ = J\\bar{Q} + \\bar{K}Q$$\n$$\\text{T: } Q^+ = T \\oplus Q$$\n\nThese equations are used in sequential circuit analysis to trace state transitions.",
      "**Binary ripple counter.** Chain T flip-flops: output of each feeds the clock input of the next. Each flip-flop divides frequency by 2. A chain of 4 T flip-flops forms a 4-bit binary counter: the outputs are Q3 Q2 Q1 Q0 representing the binary count from 0 to 15. The counter rolls over to 0 after 15. This is how PLC counters are implemented in hardware — the software CTU instruction emulates this in the scan cycle.",
    ],
    callouts: [],
  },

  challenges: [
    {
      problem: 'An SR latch currently has Q=0. S=1, R=0 is applied. What is Q after this input? What happens when S returns to 0?',
      hint: 'Check the SR latch truth table: S=1, R=0 is the Set condition.',
      walkthrough: [
        'Current state: Q=0.',
        'Apply S=1, R=0: this is the Set condition. From the SR latch truth table: S=1, R=0 → Q(next) = 1.',
        'Q transitions to 1.',
        'Now S returns to 0 (S=0, R=0): this is the No Change condition. Q holds its current value.',
        'Q remains at 1 — the latch is now storing a 1. This is memory: the bit was written once and persists even after the Set input returns to 0.',
      ],
      answer: 'Q becomes 1 after S=1, R=0. When S returns to 0, Q holds at 1 (memory).',
      difficulty: 'easy',
    },
    {
      problem: 'A D flip-flop has Q=0. The sequence D=1, CLK↑, D=0, CLK↑, D=1, CLK↑ is applied. List the value of Q after each clock edge.',
      hint: 'D flip-flop rule: Q captures the value of D at each rising clock edge.',
      walkthrough: [
        'Initial state: Q=0.',
        'Clock edge 1: D=1 at the rising edge. Q captures D: Q becomes 1.',
        'After CLK↑ #1: Q=1.',
        'Clock edge 2: D=0 at the rising edge. Q captures D: Q becomes 0.',
        'After CLK↑ #2: Q=0.',
        'Clock edge 3: D=1 at the rising edge. Q captures D: Q becomes 1.',
        'After CLK↑ #3: Q=1.',
        'Summary: Q follows the sequence 1, 0, 1 — exactly mirroring D at each clock edge.',
      ],
      answer: 'After CLK↑ #1: Q=1. After CLK↑ #2: Q=0. After CLK↑ #3: Q=1.',
      difficulty: 'medium',
    },
    {
      problem: 'Design an alarm memory circuit using OTL/OTU ladder instructions: FAULT bit sets the alarm latch, ACK button clears it. What is the OTL rung? What is the OTU rung? What prevents the forbidden state (both active simultaneously)?',
      hint: 'OTL = Set (S input), OTU = Reset (R input). The forbidden state is when both OTL and OTU fire in the same scan on the same bit.',
      walkthrough: [
        'OTL rung: [FAULT] ---( OTL ALARM_LATCH ). When FAULT is true, ALARM_LATCH is set to 1 and stays set even if FAULT clears.',
        'OTU rung: [ACK] ---( OTU ALARM_LATCH ). When ACK is true, ALARM_LATCH is cleared to 0.',
        'The forbidden state would occur if FAULT and ACK are both true in the same scan — both OTL and OTU fire on ALARM_LATCH.',
        'Prevention method 1: Add [NOT ACK] in series with the OTL rung: [FAULT][NOT ACK] ---( OTL ALARM_LATCH ). The latch cannot be set while being acknowledged.',
        'Prevention method 2: Give ACK priority by placing the OTU rung AFTER the OTL rung in the program. In Allen-Bradley, the last write in a scan wins for output coils — but OTL/OTU are latching, so priority must be handled explicitly.',
        'Best practice: use interlock logic so FAULT cannot set the latch while ACK is active. This mirrors the hardware SR latch where the Reset input takes priority over Set in safe-state-priority designs.',
      ],
      answer: 'OTL rung: [FAULT]---(OTL ALARM_LATCH). OTU rung: [ACK]---(OTU ALARM_LATCH). Prevent forbidden state by adding [NOT ACK] in series with the OTL rung, ensuring the latch cannot be set and cleared simultaneously.',
      difficulty: 'hard',
    },
  ],

  examples: [
    {
      title: 'Motor seal-in circuit — SR latch in ladder',
      problem: 'Design ladder logic for a conveyor motor: momentary Start (NO) starts it, momentary Stop (NC) stops it. Motor must keep running after releasing Start.',
      solution: 'Rung 1 (Start/Seal-in):\n[Start_PB]--+--[Motor_Run]--+--[Stop_PB(NC)]--( Motor_Run )\n                            (Motor_Run contact in parallel with Start_PB)\n\nOperation:\n- Start_PB momentarily closes → Motor_Run coil energizes → Motor_Run contact closes → seals in the circuit\n- Start_PB releases → Motor_Run contact keeps the path active → Motor_Run stays energized\n- Stop_PB opens → breaks series path → Motor_Run deenergizes → Motor_Run contact opens → no re-seal\n\nSR latch mapping:\n- S = Start_PB (set: turn motor on)\n- R = NOT(Stop_PB) = Stop_PB NC contact (reset: turn motor off)\n- Q = Motor_Run\n\nTo avoid the forbidden state, Stop_PB physically overrides Start_PB — even if both are pressed simultaneously, the series Stop_NC breaking the path wins. This is the correct safety priority.',
    },
    {
      title: 'Alarm with acknowledge — SR latch with memory',
      problem: 'A fault bit (FAULT) goes high when a machine fault occurs. An alarm light should stay lit until the operator presses an Acknowledge button (ACK), even if FAULT clears. How is this implemented?',
      solution: 'This is an SR latch where:\n- S = FAULT (rising edge of fault sets the alarm)\n- R = ACK (operator acknowledge clears it)\n- Q = ALARM_ACTIVE\n\nIn ladder (using OTL/OTU):\nRung 1: [FAULT] ---( OTL ALARM_ACTIVE )   -- latches when fault occurs\nRung 2: [ACK]   ---( OTU ALARM_ACTIVE )   -- clears when acknowledged\nRung 3: [ALARM_ACTIVE] ---( ALARM_LIGHT ) -- drives the output\n\nKey behavior: if FAULT goes true and then clears (transient fault), ALARM_ACTIVE remains set. The operator must press ACK — only then does ALARM_ACTIVE clear. This ensures faults cannot silently self-clear without operator awareness. The memory is the OTL bit persisting between scans.',
    },
  ],

  quiz: [
    {
      id: 'q1',
      type: 'choice',
      text: 'A combinational circuit and a sequential circuit receive the same inputs at two different times. The combinational circuit gives the same output both times. The sequential circuit gives different outputs. Why?',
      options: [
        'Sequential circuits have more inputs that were not described in the question',
        'Sequential circuits have memory — their output depends on current inputs AND the internal state built from past inputs. The same inputs produce different outputs depending on what happened before. Combinational circuits have no memory: identical inputs always produce identical outputs regardless of history',
        'Sequential circuits use analog signals while combinational circuits use digital',
      ],
      correct: 1,
    },
    {
      id: 'q2',
      type: 'choice',
      text: 'A motor starter uses a seal-in (latch) circuit: the start button momentarily energizes the motor coil, which then holds itself on via a parallel contact. What SR latch behavior does this implement?',
      options: [
        'S = motor running, R = stop button; Q = power to motor',
        'S = start button press (set), R = stop button press (reset), Q = Motor_Run coil — once Set triggers (Q→1), Q\'s own contact in parallel maintains the path even after S releases. R breaks the series path to reset Q→0',
        'The seal-in is NOT an SR latch — it is combinational logic that checks both buttons simultaneously',
      ],
      correct: 1,
    },
    {
      id: 'q3',
      type: 'choice',
      text: 'In a D flip-flop, the output Q updates to match input D only on the rising clock edge. Why does this edge-triggering matter in practice?',
      options: [
        'Edge triggering prevents the flip-flop from responding to input glitches — signals only "count" at the exact clock edge, giving the system a deterministic sampling moment; this is why digital systems are synchronous: all state changes happen at the same clock tick',
        'Edge triggering doubles the speed of the flip-flop compared to level-triggered latches',
        'D flip-flops without edge triggering would always output the same value as the input, which would make them useless for memory',
      ],
      correct: 1,
    },
    {
      id: 'q4',
      type: 'choice',
      text: 'An OTL (Output Latch) instruction holds a bit ON until an OTU (Output Unlatch) clears it, even across PLC scan cycles. Why does this matter for fault alarms?',
      options: [
        'OTL is faster than a standard output coil, so fault response is quicker',
        'A fault that clears before the next scan would be missed by a standard output coil (it would turn off when the fault signal clears); OTL persists the bit independently of the triggering condition — the fault is recorded even if it was momentary, requiring explicit operator acknowledgment via OTU',
        'OTL and standard coils behave identically; OTL is just older ladder syntax',
      ],
      correct: 1,
    },
  ],
};
