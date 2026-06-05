export default {
  id: 'logic0-002',
  slug: 'logic-gates-and-truth-tables',
  chapter: 'logic0',
  order: 2,
  title: 'Logic Gates and Truth Tables',
  subtitle: 'The seven fundamental gates — AND, OR, NOT, NAND, NOR, XOR, XNOR — and the truth tables that completely describe their behavior.',
  tags: ['AND gate', 'OR gate', 'NOT gate', 'NAND', 'NOR', 'XOR', 'XNOR', 'truth table', 'logic gates'],
  aliases: 'AND OR NOT NAND NOR XOR XNOR logic gate truth table bubble gate universal gate',
  timeToComplete: 20,
  coreConcept: 'The seven fundamental logic gates are completely described by truth tables. NAND and NOR are universal — any logic function can be built from only NANDs or only NORs. XOR detects difference; XNOR detects equality. Every gate maps directly to PLC ladder logic.',
  prerequisites: ['logic0-001'],
  nextLesson: 'combinational-logic-circuits',

  hook: {
    question: "A safety light curtain has 4 sensor beams. The machine should stop if ANY beam is broken. A second system: an E-stop mushroom head has 2 contacts that must BOTH open when pressed (for reliability). What gates describe these two requirements — and are they the same gate?",
    realWorldContext: "Real safety systems require a specific logical relationship between inputs and output. Sometimes one trigger is enough (OR). Sometimes all conditions must be met (AND). Sometimes a circuit should work only when both redundant channels agree (XNOR for equivalence checking). Understanding which gate applies to which scenario is the core skill of writing and reading PLC logic.",
  },

  mentalModel: [
    "**Every gate is fully described by its truth table.** A truth table enumerates every possible input combination and the corresponding output. With 2 inputs there are 4 rows (2² = 4). With 3 inputs there are 8 rows (2³ = 8). The truth table is the ground truth — the gate's definition.",
    "**The bubble means 'invert.'** NAND = AND with a bubble (invert) on output. NOR = OR with a bubble. XNOR = XOR with a bubble. Any gate with a bubble inverts the ungated equivalent. This is why NAND and NOR are called 'complementary' forms of AND and OR.",
    "**Universal gates: any circuit from one type.** NAND and NOR are called universal gates because you can construct AND, OR, NOT — and therefore any possible logic function — using only NAND gates (or only NOR gates). This matters for chip fabrication: a single NAND cell design repeated thousands of times can implement any logic.",
  ],

  intuition: {
    prose: [
      "**AND gate: all must be true.** Output = 1 if and only if every input = 1. Two inputs: only the 1,1 row produces a 1 output. Three inputs: only the 1,1,1 row produces 1. This implements 'all conditions must be met' logic. Ladder logic: contacts in series. Industrial use: machine ready signal = E-stop clear AND door closed AND no fault active.",
      "**OR gate: at least one must be true.** Output = 0 if and only if every input = 0. Two inputs: only the 0,0 row produces 0. This implements 'any condition triggers' logic. Ladder logic: contacts in parallel. Industrial use: alarm = high temperature OR high pressure OR high level sensor OR flow failure.",
      "**NOT gate: single-input inversion.** Trivially simple but critically important. Converts a normally-open sensor into normally-closed logic, inverts fault signals, or implements 'enabled when NOT in fault' conditions. Ladder logic: XIO (Examine If Open) contact. The NOT gate is always drawn with a bubble on its output — the bubble symbol means inversion.",
      "**NAND gate: AND inverted.** Output = 0 only when ALL inputs are 1. Output = 1 for every other combination. A NAND gate's output stays HIGH by default and only drops LOW when everything activates. Safety pattern: use NAND for 'deactivate when all confirming signals arrive' — the output de-energizes a hold-to-run circuit only when all OK signals are active. (Counterintuitive but common.)",
      "**NOR gate: OR inverted.** Output = 1 only when ALL inputs are 0. Output = 0 when any input = 1. This implements 'safe only when nothing is active' — the output is 1 (enabled) only when all monitored conditions are quiescent. Industrial use: 'all clear' signal = NOR of all fault inputs. Any single fault drives the output to 0.",
      "**XOR gate: exclusive OR, detecting difference.** Output = 1 when inputs DIFFER. Output = 0 when inputs are EQUAL (both 0 or both 1). Standard OR includes 'both 1' as true; XOR excludes that case. Industrial use: fault detection in redundant systems — compare two independent channels. If they agree (both 1 or both 0), XOR output = 0 (no fault). If they disagree (one thinks 0, other thinks 1), XOR output = 1 (mismatch fault). Also used for toggling: XOR a signal with 1 to flip its state.",
      "**XNOR gate: equivalence detector.** Output = 1 when inputs are EQUAL. The complement of XOR. Used to check that two systems agree — dual-channel safety relay comparison, encoder channel agreement, or communication parity checking.",
    ],
    callouts: [
      {
        type: 'definition',
        title: 'Complete Truth Tables — All 7 Gates',
        body: '```\nA  B | AND OR NAND NOR XOR XNOR\n0  0 |  0   0   1    1   0    1\n0  1 |  0   1   1    0   1    0\n1  0 |  0   1   1    0   1    0\n1  1 |  1   1   0    0   0    1\n```\n\nNOT gate (single input):\n```\nA  | NOT\n0  |  1\n1  |  0\n```',
      },
      {
        type: 'insight',
        title: 'NAND is Universal — Proof by Construction',
        body: 'Any logic can be built from NAND alone:\n\n**NOT from NAND:** Connect both inputs together: NAND(A,A) = NOT(A·A) = NOT(A)\n\n**AND from NAND:** NOT(NAND(A,B)) = NOT(NOT(A·B)) = A·B — invert a NAND\n\n**OR from NAND:** By De Morgan: A+B = NOT(NOT(A) · NOT(B)) = NAND(NOT(A), NOT(B))\n\nThis is why early digital computers (including the first integrated circuits) were built entirely from NAND gates — simplify the manufacturing process to one cell type.',
      },
      {
        type: 'insight',
        title: 'The Bubble Convention',
        body: 'A circle (bubble) on any gate input or output means "invert at that point."\n\n- Bubble on output: AND+bubble = NAND, OR+bubble = NOR, XOR+bubble = XNOR\n- Bubble on input: inverting the input before the gate function\n\nDe Morgan\'s theorem has a graphical form: a NAND gate (AND body + output bubble) is equivalent to an OR gate with bubbles on all inputs. Both symbols represent the same truth table. Use whichever form matches the logic you\'re describing.',
      },
      {
        type: 'insight',
        title: 'Gate Delay — Why Combinational Circuits Have a Speed Limit',
        body: 'A real gate takes a small but nonzero time to respond to input changes — gate propagation delay, typically 1–10 nanoseconds. Complex combinational logic is a chain of gates, and the signal must propagate through all of them before the output stabilizes. The critical path (longest gate chain) determines maximum clock frequency. This matters in PLC scan cycles: the PLC must complete its scan cycle faster than the fastest-changing input. At 60Hz sensor update rate, you have 16ms per scan — far longer than any gate delay concern.',
      },
    ],
    visualizations: [
      {
        id: 'LogicGateLab',
        title: 'Interactive Gates and Truth Tables',
        mathBridge: 'Systematically go through all 7 gate types. For each: verify the truth table by toggling A and B through all 4 combinations and confirming the output matches. Pay special attention to NAND and NOR — the output that seems backwards becomes intuitive when you remember the bubble.',
      },
      {
        id: 'LogicGateLab',
        title: 'NAND and NOR — Universal Gates',
        mathBridge: 'Select NAND gate. Notice the output is 1 for all combinations EXCEPT both inputs = 1. Now select NOR: output is 1 ONLY when both inputs are 0. These are the complements of AND and OR — the bubble means \'invert at output\'.',
      },
    ],
  },

  math: {
    prose: [
      "**Counting truth table rows.** A function with $n$ inputs has exactly $2^n$ rows in its truth table and $2^{2^n}$ possible distinct boolean functions. With 2 inputs: 4 rows and 16 possible functions (which is why exactly 16 two-input gates exist, including the 7 common ones plus trivially-useful ones like constant-0 and constant-1).",
      "**Boolean expressions for each gate:**\n\n$$\\text{AND: } Q = A \\cdot B$$\n$$\\text{OR: } Q = A + B$$\n$$\\text{NOT: } Q = \\bar{A}$$\n$$\\text{NAND: } Q = \\overline{A \\cdot B}$$\n$$\\text{NOR: } Q = \\overline{A + B}$$\n$$\\text{XOR: } Q = A \\oplus B = A\\bar{B} + \\bar{A}B$$\n$$\\text{XNOR: } Q = \\overline{A \\oplus B} = AB + \\bar{A}\\bar{B}$$",
    ],
    callouts: [],
  },

  challenges: [
    {
      problem: 'A NAND gate has inputs A=1, B=0. What is the output?',
      hint: 'NAND output = NOT(A AND B). First evaluate A AND B, then invert.',
      walkthrough: [
        'Step 1: Evaluate A AND B: 1 AND 0 = 0.',
        'Step 2: Invert the AND result: NOT(0) = 1.',
        'NAND output = 1. The NAND output is 0 only when BOTH inputs are 1 — any other combination produces 1.',
      ],
      answer: '1',
      difficulty: 'easy',
    },
    {
      problem: 'Build NOT from NAND gates. Write the expression and explain why NAND(A,A) = NOT(A).',
      hint: 'Connect both inputs of a NAND gate to the same signal A. Then apply the NAND definition.',
      walkthrough: [
        'A NAND gate computes: output = NOT(A AND B).',
        'Connect both inputs to A: output = NOT(A AND A).',
        'Apply the Idempotent law: A AND A = A.',
        'So output = NOT(A).',
        'Verify with truth table: A=0 → NOT(0 AND 0) = NOT(0) = 1. A=1 → NOT(1 AND 1) = NOT(1) = 0.',
        'NAND(A,A) produces the exact same truth table as NOT(A). This is how NOT is built from a single NAND gate.',
      ],
      answer: 'NAND(A,A) = NOT(A·A) = NOT(A) by the Idempotent law.',
      difficulty: 'medium',
    },
    {
      problem: 'A dual-channel E-stop monitoring circuit uses XOR. Channel 1 = 1 (closed), Channel 2 = 0 (open contact stuck). What does the XOR output? What does this indicate? What would the output be during normal operation (both channels agree)?',
      hint: 'XOR outputs 1 when inputs DIFFER. Think about what each state means for a safety channel.',
      walkthrough: [
        'XOR truth table: output is 1 when inputs differ, 0 when inputs are equal.',
        'Current state: CH1=1, CH2=0. These differ, so XOR output = 1.',
        'XOR = 1 indicates a channel mismatch — one contact is open, the other is closed. This is a fault condition: the E-stop contacts disagree. Likely a stuck or welded contact on CH2.',
        'During normal operation (E-stop not pressed): CH1=1, CH2=1. XOR(1,1) = 0. No fault.',
        'During normal E-stop press: CH1=0, CH2=0. XOR(0,0) = 0. No fault — both channels agree.',
        'XOR = 1 only when channels disagree, which always indicates a fault. This is a safety monitoring pattern used in dual-channel safety relays.',
      ],
      answer: 'XOR output = 1 (mismatch fault detected). Normal operation (both agree) gives XOR = 0.',
      difficulty: 'hard',
    },
  ],

  examples: [
    {
      title: 'Safety light curtain logic',
      problem: 'A light curtain has 4 beams (B1, B2, B3, B4). The machine should stop if ANY beam is broken. Write the boolean expression and identify the gate.',
      solution: 'STOP = B1 + B2 + B3 + B4 (OR gate with 4 inputs)\n\nActually: STOP = 1 when any Bn = 1 (beam broken = 1).\nTruth table check: STOP = 0 only when all beams are 0 (unbroken). Any beam broken → STOP = 1.\n\nIn a PLC: four XIC contacts for B1, B2, B3, B4 wired in parallel (OR), feeding the STOP output coil.\n\nNote: in practice the safety output is inverted — the "run enable" signal is 1 when the curtain is clear. Use a NOR: RUN_ENABLE = NOR(B1, B2, B3, B4) — output is 1 only when ALL beams are unbroken.',
    },
    {
      title: 'Dual-channel E-stop comparison',
      problem: 'A safety E-stop button has two independent contact channels: CH1 and CH2. Both should change state simultaneously when pressed. If they disagree (one opens, other doesn\'t), it\'s a fault. Design the monitoring logic.',
      solution: 'When E-stop is NOT pressed: CH1 = 1, CH2 = 1 (both contacts closed)\nWhen E-stop IS pressed: CH1 = 0, CH2 = 0 (both contacts open)\n\nFault condition: CH1 ≠ CH2\n\nFAULT = XOR(CH1, CH2) — output is 1 when channels differ.\n\nNormal operation: FAULT = XOR(1,1) = 0 and XOR(0,0) = 0\nFault (stuck contact): FAULT = XOR(1,0) = 1 or XOR(0,1) = 1\n\nIn a safety PLC: this is implemented as a cross-monitoring function in the safety program, exactly this XOR logic.',
    },
  ],
};
