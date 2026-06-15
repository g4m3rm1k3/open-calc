export default {
  id: 'plc0-004',
  slug: 'first-rung',
  chapter: 'plc0',
  order: 4,
  title: 'Your First Rung — XIC, XIO, OTE',
  subtitle: 'The three instructions that form the basis of all ladder logic: normally-open contact, normally-closed contact, and output coil.',
  tags: ['XIC', 'XIO', 'OTE', 'contact', 'coil', 'normally open', 'normally closed', 'rung', 'ladder logic', 'contact symbol'],
  aliases: 'XIC XIO OTE contact coil normally open normally closed rung ladder logic',
  timeToComplete: 22,
  coreConcept: "XIC (Examine If Closed) is a normally-open contact — it passes power when its tag is 1. XIO (Examine If Open) is a normally-closed contact — it passes power when its tag is 0. OTE (Output Energize) is a coil — it writes 1 to its tag when power flows, 0 when power doesn't. These three instructions alone can implement any combinational logic.",
  prerequisites: ['plc0-003'],
  nextLesson: 'series-parallel',

  hook: {
    question: "You need a light to turn on when a START button is pressed AND a door interlock switch is closed AND an E-stop is NOT pressed. In relay logic this would be three physical relay contacts in series. What does this look like in ladder logic, and what three instructions do you need?",
    realWorldContext: "XIC, XIO, and OTE are the atoms of ladder logic. Every industrial PLC program ever written uses them. They map directly to the relay logic they replaced: XIC is a normally-open (NO) relay contact, XIO is a normally-closed (NC) relay contact, and OTE is the relay coil. Understanding these three instructions — deeply, not just mechanically — gives you the mental model to read and write any ladder program. Senior engineers can look at a rung with 8 contacts and immediately understand the machine logic. That fluency starts here.",
  },

  mentalModel: [
    "**Power flow is the metaphor.** Ladder logic inherits the relay diagram visual: power flows left-to-right through a rung. Contacts are in the path of the power. If all contacts pass power, it reaches the coil on the right — the coil energizes. If any contact blocks power, the coil doesn't energize. Each element in a rung either passes or blocks power, like a switch in series.",
    "**XIC mirrors the physical contact.** XIC(SENSOR_1) means: 'if SENSOR_1 is currently 1 (closed), let power through.' The contact symbol on the ladder diagram is two vertical lines — the symbol for a switch contact. When the tag is 1, the contact is 'closed' (conducts). When the tag is 0, it's 'open' (blocks). XIC is normally-open: by default (when tag=0), no power flows.",
    "**XIO is the inverse.** XIO(ESTOP) means: 'if ESTOP is currently 0 (open), let power through.' The contact symbol has a slash through it — the symbol for a normally-closed contact. XIO is normally-open in terms of real-world behavior: the tag is normally 0 (E-stop not pressed), so the XIO passes power normally. When the E-stop IS pressed (tag=1), XIO blocks — the rung de-energizes. This seems counterintuitive until you understand that the E-stop's physical wiring is also NC: the contact opens when pressed.",
  ],

  intuition: {
    prose: [
      "**Why XIC is called 'Examine If Closed.'** The instruction examines the tag value. If the tag is 1 (the bit is 'closed' — like a closed switch contact), it passes power. If the tag is 0 (the bit is 'open' — like an open switch contact), it blocks. The naming comes from the relay analogy: you're checking whether the relay contact is in the closed (conducting) position.",
      "**Why XIO is called 'Examine If Open.'** The instruction passes power when the tag is 0 — the bit is 'open' (not activated). This is the normally-closed relay contact: in its resting state (0), it conducts; when activated (1), it opens and blocks. E-stops are always wired normally-closed: if the wire breaks, the E-stop reads 0, the XIO passes power... wait, no — if the wire breaks, the input reads 0, meaning the E-stop IS 'pressed' from the PLC's perspective. So XIO(ESTOP) blocks when ESTOP=0... but the actual E-stop button is wired NC, so the tag is 1 when NOT pressed, 0 when pressed. This reversal of safe state is deliberate for safety.",
      "**The E-stop wiring convention.** E-stops are wired normally-closed: the physical switch is closed (24VDC on the input terminal) when NOT pressed. The PLC input reads 1 normally. If the wire breaks or the switch fails, the input reads 0 — same as if the E-stop were pressed. The machine stops on any failure. In the program, you use XIC(ESTOP) for the E-stop contact — it reads: 'if ESTOP=1 (not pressed), continue.' This is called fail-safe wiring. Always wire E-stops and safety devices normally-closed.",
      "**OTE: the coil.** OTE(MOTOR_RUN) writes the current rung power state to the MOTOR_RUN tag. If power flows: MOTOR_RUN=1. If power doesn't flow: MOTOR_RUN=0. The coil symbol is a circle with the tag name inside. Critical: OTE is NOT latching. If the rung conditions become false next scan, the tag resets to 0. The coil exactly mirrors the rung's power state — it's a direct mapping, not a latch.",
      "**Using an output as an input.** Once OTE sets a tag to 1, that tag can be used as an XIC input in another rung (or later in the same rung). This is how feedback and cascaded logic work. MOTOR_RUN=1 can appear as XIC(MOTOR_RUN) in a rung that controls a pilot light. The output image table is readable by the program — internal bits act as both outputs (when OTE writes them) and inputs (when XIC/XIO reads them).",
      "**Addressing modes.** In ControlLogix, all contacts and coils reference tag names (string labels). In older Allen-Bradley (SLC-500, PLC-5), they reference numeric addresses: I:1/0 (input module 1, bit 0), O:2/5 (output module 2, bit 5), B3:0/7 (data file B3, word 0, bit 7). The numeric addressing makes it clear that the contact is physically mapped to an I/O terminal; tag-based addressing is more readable but requires knowing the tag-to-I/O mapping in the I/O Configuration tree.",
    ],
    callouts: [
      {
        type: 'definition',
        title: 'XIC, XIO, OTE Truth Tables',
        body: '**XIC (Examine If Closed):**\n| Tag value | Power output |\n|---|---|\n| 0 (open) | Blocked (false) |\n| 1 (closed) | Passes (true) |\nSymbol: ─┤ ├─\n\n**XIO (Examine If Open):**\n| Tag value | Power output |\n|---|---|\n| 0 (open) | Passes (true) |\n| 1 (closed) | Blocked (false) |\nSymbol: ─┤/├─\n\n**OTE (Output Energize):**\n| Rung power | Tag written |\n|---|---|\n| False | 0 |\n| True | 1 |\nSymbol: ─( )─\n\nXIC = AND with its bit. XIO = AND with NOT of its bit. OTE = assignment.',
      },
      {
        type: 'insight',
        title: 'NC Contact Wiring Paradox',
        body: 'The "normally-closed" naming is the source of endless confusion for beginners:\n\n**Physical switch NC:** The switch conducts (closed) when NOT pressed. Opens when pressed.\n\n**PLC input:** When NC switch is NOT pressed → 24VDC on input terminal → tag = 1.\n\n**In the ladder program:** Use XIC(ESTOP_TAG) — because the tag is 1 (closed) when the E-stop is NOT pressed. You want power to flow when it\'s not pressed.\n\n**So:** A physically NC switch maps to XIC in the program (tag=1 = not pressed = pass power).\n**A physically NO switch maps to XIC in the program too** (tag=1 = pressed = pass power).\n\n**XIO is used when:** You want something to be TRUE when a tag is NOT set — like a fault bit. XIO(FAULT) = "only run if no fault." The FAULT bit is wired as NO from its sensor, but the program uses XIO to invert the logic.',
      },
      {
        type: 'procedure',
        title: 'Reading a Rung Step by Step',
        body: 'Rung: ─┤ START ├─┤/├─ ESTOP ─┤ DOOR_SW ├─( MOTOR_RUN )─\n\nTranslate right to left (read the output first, then the conditions):\n\n1. **What does it control?** Output: MOTOR_RUN.\n2. **When does MOTOR_RUN energize?** When all contacts in the rung pass power.\n3. **Contacts from left to right:**\n   - XIC(START): true when START=1 (start button pressed)\n   - XIO(ESTOP): true when ESTOP=0 (E-stop NOT pressed; it\'s wired NC so ESTOP=1 normally = XIC would be the safe choice, but using XIO means ESTOP tag is 0 normally → check the actual wiring convention)\n   - XIC(DOOR_SW): true when DOOR_SW=1 (door interlock closed)\n4. **Rung in English:** "Energize MOTOR_RUN when START is pressed AND E-stop is not faulted AND door is closed."\n\nAlways read outputs first, then conditions. Describe in plain English before tracing logic.',
      },
    ],
    visualizations: [
      {
        id: 'PLCLadderSim',
        title: 'XIC, XIO, OTE Interaction',
        mathBridge: 'Explore all three contact types. Rung 1: XIC + XIC = AND logic (both must be on). Rung 2: XIC + XIO = AND NOT logic (first on, second off). Rung 3: XIC alone → OTE. Toggle inputs on the I/O tab and watch which rungs pass power.',
        initialProps: {
          program: [
            [
              { type: 'XIC', tag: 'SWITCH_A', label: 'Switch A' },
              { type: 'XIC', tag: 'SWITCH_B', label: 'Switch B' },
              { type: 'OTE', tag: 'LIGHT_1', label: 'Light 1 (A AND B)' },
            ],
            [
              { type: 'XIC', tag: 'SWITCH_A', label: 'Switch A' },
              { type: 'XIO', tag: 'FAULT_BIT', label: 'Fault' },
              { type: 'OTE', tag: 'LIGHT_2', label: 'Light 2 (A AND NOT Fault)' },
            ],
            [
              { type: 'XIC', tag: 'SWITCH_B', label: 'Switch B' },
              { type: 'OTE', tag: 'LIGHT_3', label: 'Light 3 (B only)' },
            ],
          ],
          tags: {
            SWITCH_A: { type: 'BOOL', value: false },
            SWITCH_B: { type: 'BOOL', value: false },
            FAULT_BIT: { type: 'BOOL', value: false },
            LIGHT_1: { type: 'BOOL', value: false },
            LIGHT_2: { type: 'BOOL', value: false },
            LIGHT_3: { type: 'BOOL', value: false },
          },
          inputs: [
            { tag: 'SWITCH_A', label: 'Switch A' },
            { tag: 'SWITCH_B', label: 'Switch B' },
            { tag: 'FAULT_BIT', label: 'Fault Bit' },
          ],
          outputs: [
            { tag: 'LIGHT_1', label: 'Light 1 (A AND B)' },
            { tag: 'LIGHT_2', label: 'Light 2 (A AND NOT Fault)' },
            { tag: 'LIGHT_3', label: 'Light 3 (B only)' },
          ],
        },
      },
    ],
  },

  math: {
    prose: [
      "**Boolean algebra connection.** XIC is AND with the variable. XIO is AND with the complement. A rung with multiple XIC elements in series is an AND of all their variables: `LIGHT = A AND B AND C`. A rung with an XIO is AND with NOT: `LIGHT = A AND NOT(FAULT)`. This is exactly the Boolean AND and NOT operations — ladder logic is a visual representation of a Boolean product term (AND expression). OTE assigns the Boolean expression result to a variable.",
      "**Coverage via truth table.** For a 3-input rung (A, B, /C where / means XIO), there are 2³=8 input combinations. The rung is true for exactly the combinations where A=1, B=1, C=0 — one row of the truth table. Multiple rungs driving the same output coil (covered in the next lesson) implement an OR of multiple product terms — exactly the sum-of-products Boolean form. Every PLC program with just XIC/XIO/OTE implements a sum-of-products Boolean expression.",
    ],
    callouts: [],
  },

  challenges: [
    {
      problem: 'Write the Boolean expression for this rung: XIC(A) → XIO(B) → XIC(C) → OTE(Y). Then build a truth table showing all 8 combinations of A, B, C and which ones energize Y.',
      hint: 'XIC is the variable itself; XIO is NOT of the variable. All in series = AND.',
      walkthrough: [
        'XIC(A): contributes A to the expression.',
        'XIO(B): contributes NOT(B) = B\' to the expression.',
        'XIC(C): contributes C to the expression.',
        'Series connection = AND: Y = A AND NOT(B) AND C = A · B\' · C.',
        'Truth table (all 8 combinations):',
        'A=0, B=0, C=0: Y = 0·1·0 = 0',
        'A=0, B=0, C=1: Y = 0·1·1 = 0',
        'A=0, B=1, C=0: Y = 0·0·0 = 0',
        'A=0, B=1, C=1: Y = 0·0·1 = 0',
        'A=1, B=0, C=0: Y = 1·1·0 = 0',
        'A=1, B=0, C=1: Y = 1·1·1 = 1 ← only this combination energizes Y',
        'A=1, B=1, C=0: Y = 1·0·0 = 0',
        'A=1, B=1, C=1: Y = 1·0·1 = 0',
        'Y is true only when A=1, B=0, C=1 — exactly one combination out of 8.',
      ],
      answer: 'Y = A · B\' · C. Y is true only when A=1, B=0, C=1.',
      difficulty: 'easy',
    },
    {
      problem: 'A press cycle must start only when: (1) CYCLE_START button is pressed, (2) E-stop is not active (ESTOP tag=1 when OK, =0 when pressed), (3) Guard door is closed (DOOR_CLOSED tag=1 when closed), (4) Previous cycle is complete (CYCLE_DONE=1). Write the ladder rung using XIC and XIO as appropriate for each contact.',
      hint: 'For each condition, decide: does the rung need the tag to be 1 (XIC) or 0 (XIO) to allow the press to start?',
      walkthrough: [
        'CYCLE_START: Must be pressed (tag=1) → XIC(CYCLE_START)',
        'ESTOP: The tag is 1 when OK, 0 when pressed. We need it to be 1 (OK) → XIC(ESTOP)',
        'Note: This assumes fail-safe wiring where ESTOP=1 means normal/safe. If ESTOP is wired NO (1=pressed), use XIO instead.',
        'DOOR_CLOSED: Must be closed (tag=1) → XIC(DOOR_CLOSED)',
        'CYCLE_DONE: Must be 1 (previous cycle complete) → XIC(CYCLE_DONE)',
        'Rung: XIC(CYCLE_START) → XIC(ESTOP) → XIC(DOOR_CLOSED) → XIC(CYCLE_DONE) → OTE(PRESS_SOL)',
        'Boolean: PRESS_SOL = CYCLE_START · ESTOP · DOOR_CLOSED · CYCLE_DONE',
        'All series (AND) — the press only fires when all four conditions are simultaneously true.',
      ],
      answer: 'Rung: XIC(CYCLE_START) → XIC(ESTOP) → XIC(DOOR_CLOSED) → XIC(CYCLE_DONE) → OTE(PRESS_SOL). All XIC because each tag is 1 when the condition is satisfied.',
      difficulty: 'medium',
    },
    {
      problem: 'An OTE coil for VALVE_A appears in two separate rungs: Rung 5 and Rung 12. In Rung 5, VALVE_A is energized (Rung 5 power = true). In Rung 12, VALVE_A is NOT energized (Rung 12 power = false). What is the final value of VALVE_A at end-of-scan, and why? What does this reveal about using OTE for the same tag twice?',
      hint: 'Think about what happens when the program scan reaches Rung 12 after already setting VALVE_A in Rung 5.',
      walkthrough: [
        'Rung 5 executes first: Rung 5 power = true → OTE(VALVE_A) writes VALVE_A = 1.',
        'Rung 12 executes second: Rung 12 power = false → OTE(VALVE_A) writes VALVE_A = 0.',
        'Final value: VALVE_A = 0 (the LAST rung to execute with OTE wins).',
        'This is called "double-coil" — the same tag driven by two OTE instructions.',
        'Double-coil is almost always a programming error. The programmer likely intended Rung 5 to always control VALVE_A, but Rung 12 overrides it every scan.',
        'The second OTE always wins (last-scan-write principle), so Rung 5\'s condition is completely ineffective — VALVE_A is only controlled by Rung 12.',
        'Exception: using OTL (set) and OTU (unlatch) for the same tag is intentional and correct. The prohibition is specifically on OTE + OTE for the same tag.',
        'Fix: combine both rungs into one with BRANCH (OR) logic, or use OTL/OTU if latching is needed.',
      ],
      answer: 'VALVE_A = 0 at end-of-scan (Rung 12 overwrites Rung 5). Double-coil is a programming error — the last OTE in scan order always wins.',
      difficulty: 'hard',
    },
  ],

  examples: [
    {
      title: 'Three-wire motor start circuit',
      problem: 'Classic motor starter: Start (NO momentary), Stop (NC momentary), Motor_Run coil. Write the complete ladder program including seal-in contact.',
      solution: 'Rung 1 — Motor control with seal-in:\n  [XIC(START_PB) or XIC(MOTOR_RUN)] → [XIC(STOP_PB)] → OTE(MOTOR_RUN)\n\nIn ladder:\n  ─┤START_PB├─┬─────────────┬─┤STOP_PB├─(MOTOR_RUN)\n              └─┤MOTOR_RUN├─┘\n\n(MOTOR_RUN contact in parallel with START_PB = OR branch)\n\nRung 2 — Pilot light:\n  ─┤MOTOR_RUN├─(GREEN_LIGHT)\n\nOperation:\n- START_PB pressed: rung passes through XIC(START_PB) → MOTOR_RUN=1.\n- START_PB released: XIC(MOTOR_RUN) now passes (MOTOR_RUN=1 from previous scan) → circuit stays sealed.\n- STOP_PB pressed: XIC(STOP_PB) opens (STOP_PB tag=1 normally, 0 when pressed if wired NO... or if wired NC, tag=1 when OK, so XIC passes normally and blocks when pressed). Circuit breaks → MOTOR_RUN=0 → seal-in releases → motor stops even after STOP_PB released.',
    },
  ],
};
