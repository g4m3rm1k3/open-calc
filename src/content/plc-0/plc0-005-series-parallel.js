export default {
  id: 'plc0-005',
  slug: 'series-parallel',
  chapter: 'plc0',
  order: 5,
  title: 'Series and Parallel Rungs',
  subtitle: 'AND logic in series, OR logic in parallel — and the direct connection to sum-of-products Boolean expressions.',
  tags: ['series', 'parallel', 'AND', 'OR', 'branch', 'ladder logic', 'sum of products', 'SOP', 'parallel branch', 'combinational logic'],
  aliases: 'series parallel AND OR branch ladder logic sum of products Boolean',
  timeToComplete: 22,
  coreConcept: "Contacts in series implement AND logic: all must be true for power to flow. Contacts in parallel implement OR logic: any one being true allows power to flow. A parallel branch in a rung is drawn as multiple paths between the same two rail points. Combining series and parallel implements any Boolean sum-of-products expression in ladder form.",
  prerequisites: ['plc0-004'],
  nextLesson: 'otl-otu',

  hook: {
    question: "A conveyor motor should run when: (Automatic mode AND start button pressed AND no fault) OR (Manual jog button pressed AND no fault). Two distinct conditions that both turn on the same motor. How do you express this as a single rung of ladder logic?",
    realWorldContext: "The OR condition appears in almost every real PLC program: multiple ways to activate the same output, multiple alarm conditions feeding one alarm horn, multiple fault conditions triggering one safety circuit. In relay logic, parallel contacts created OR paths by physically running parallel wire branches between relay terminals. Ladder logic inherits this directly — parallel branches in a rung represent OR paths. The combination of series (AND) groups in parallel (OR) is exactly the sum-of-products Boolean form, and understanding this connection lets you convert any Boolean expression into ladder logic mechanically.",
  },

  mentalModel: [
    "**Series = AND.** Two contacts in series: both must be closed for power to reach the coil. Like two switches in series in a physical circuit — both switches must be on. XIC(A)—XIC(B)—OTE(Y) means Y = A AND B.",
    "**Parallel = OR.** Two contacts in parallel: either one being closed provides an alternate path for power. Like two switches in parallel — either one creates a complete circuit. A BRANCH instruction creates a parallel path around a contact (or group of contacts). The rung is energized if either the main series path OR the branch path passes power.",
    "**Sum-of-products maps directly to rungs.** Any Boolean SOP expression can be converted to ladder: each product term (AND group) becomes a series group in a branch, and the OR of product terms is implemented as parallel branches all feeding the same coil. Y = (A·B·C) + (D·E) + F becomes three parallel branches: [A in series with B in series with C], [D in series with E], [F alone].",
  ],

  intuition: {
    prose: [
      "**Drawing a parallel branch.** In ladder diagram, a parallel branch starts where the main rung starts and rejoins where the main rung ends (or at a specific point in the rung). The branch contacts are drawn below the main rung path, connected by vertical lines at the start and end of the branch. The rung passes power if EITHER path (main or any branch) provides a complete path from left rail to right rail. This is exactly like two physical wires in parallel — current takes any available path.",
      "**Branch around one contact vs. group.** A branch can bypass a single contact, or a group of contacts. If you want (A OR B) in series with C, the branch wraps only around the A/B contacts, not C. If you want (A·C) OR (B·C), the branch wraps both A and C in one path, B and C in another path (C appears in both — or you could move C after the branch point). This flexibility lets you build complex Boolean expressions compactly.",
      "**The seal-in circuit revisited.** The classic start/stop circuit uses a parallel branch: XIC(START_PB) in parallel with XIC(MOTOR_RUN), both in series with XIC(STOP_PB), feeding OTE(MOTOR_RUN). The branch is: MOTOR_RUN contact seals in the rung after START_PB is released. Once MOTOR_RUN=1, the MOTOR_RUN contact provides a path that bypasses the now-open START_PB contact. The STOP_PB contact is outside (in series after) the branch — it breaks both paths simultaneously.",
      "**Multiple rungs vs. one rung with branches.** Two equivalent approaches: (1) One rung with a BRANCH for each condition, all sharing one OTE. (2) Two separate rungs, each with XIC conditions and the same OTE coil. The second approach creates a double-coil situation (same OTE in multiple rungs) — the last rung wins. The first approach (one rung with branches) is the correct way to implement OR logic. Exception: if OTL and OTU are used instead of OTE, multiple rungs for the same tag is intentional.",
      "**Nested branches.** Some rung structures need branches within branches: (A·B) OR (C·(D OR E)). This is a branch that contains another branch inside it. Most PLC programming software supports nested branches graphically. In instruction list text format, this uses nested parentheses. Deeply nested branches can be hard to read — if a rung has more than 3 levels of nesting, consider breaking it into sub-rungs using intermediate internal tags.",
    ],
    callouts: [
      {
        type: 'definition',
        title: 'Branch Instruction (BRANCH / BST/NXB/BND)',
        body: 'Allen-Bradley ControlLogix: The BRANCH instruction is implicit in the graphical ladder editor. You draw it by inserting contacts below the current rung position. In the exported instruction list, it appears as BST (Branch Start), NXB (Next Branch), BND (Branch End):\n\nBST\n  XIC(A)\n  XIC(B)\nNXB\n  XIC(C)\nBND\n\nMeans: (A OR B) in the branch. Power flows if A=1 OR C=1 (NXB starts the second branch element). The BND closes the branch and continues the main rung.\n\nIn most PLC graphical editors: right-click on a contact and select "Insert Branch Below" to create parallel contacts graphically.',
      },
      {
        type: 'insight',
        title: 'Converting SOP to Ladder',
        body: 'Given: Y = (A · B) + (C · D\') + E\n\nStep 1: Identify product terms:\n- Term 1: A · B → two XIC in series\n- Term 2: C · D\' → XIC(C) in series with XIO(D)\n- Term 3: E → single XIC(E)\n\nStep 2: Create parallel branches, one per term:\n┌─┤A├─┤B├──────────────────┐\n├─┤C├─┤/├D─────────────────┤─(Y)\n└─┤E├──────────────────────┘\n\nStep 3: Each branch is an independent path to the coil. Y energizes if any branch passes power.\n\nThis mechanical translation works for any SOP expression. Simplify the Boolean expression first (using K-maps or algebraic simplification) to get the minimum number of branches.',
      },
      {
        type: 'procedure',
        title: 'Rung Analysis Procedure',
        body: '1. **Identify parallel groups.** Where do the branches start and end? Each branch group is an OR of its paths.\n\n2. **Simplify each branch to a Boolean term.** Series contacts within a branch = AND. XIC = variable, XIO = NOT of variable.\n\n3. **Combine branches with OR.** The rung passes if branch 1 OR branch 2 OR branch 3...\n\n4. **Write the full Boolean expression.** Y = (Term1) + (Term2) + ... where + is OR.\n\n5. **Verify with truth table.** Pick a few key combinations and verify the rung and expression agree.\n\nExample: ─┬─┤A├─┤B├─┬──┤C├──(Y)\n          └─┤D├────┘\n\nAnalysis: Branch group = (A·B) OR D. Then in series with C. Full expression: Y = ((A·B) + D) · C.',
      },
    ],
    visualizations: [
      {
        id: 'PLCLadderSim',
        title: 'Series and Parallel Logic',
        mathBridge: 'Rung 1 is pure AND (series): all inputs must be on. Rung 2 is OR (parallel branch): any input turns on the output. Rung 3 is (A AND B) OR (C AND D) — two AND groups in parallel. Try all combinations and match to the Boolean expressions shown.',
        initialProps: {
          program: [
            [
              { type: 'XIC', tag: 'INPUT_A', label: 'A' },
              { type: 'XIC', tag: 'INPUT_B', label: 'B' },
              { type: 'XIC', tag: 'INPUT_C', label: 'C' },
              { type: 'OTE', tag: 'OUT_AND', label: 'Y=A·B·C' },
            ],
            [
              {
                type: 'BRANCH',
                branches: [
                  [{ type: 'XIC', tag: 'INPUT_A', label: 'A' }],
                  [{ type: 'XIC', tag: 'INPUT_B', label: 'B' }],
                  [{ type: 'XIC', tag: 'INPUT_C', label: 'C' }],
                ],
              },
              { type: 'OTE', tag: 'OUT_OR', label: 'Y=A+B+C' },
            ],
            [
              {
                type: 'BRANCH',
                branches: [
                  [
                    { type: 'XIC', tag: 'INPUT_A', label: 'A' },
                    { type: 'XIC', tag: 'INPUT_B', label: 'B' },
                  ],
                  [
                    { type: 'XIC', tag: 'INPUT_C', label: 'C' },
                    { type: 'XIO', tag: 'INPUT_D', label: '/D' },
                  ],
                ],
              },
              { type: 'OTE', tag: 'OUT_SOP', label: 'Y=(A·B)+(C·/D)' },
            ],
          ],
          tags: {
            INPUT_A: { type: 'BOOL', value: false },
            INPUT_B: { type: 'BOOL', value: false },
            INPUT_C: { type: 'BOOL', value: false },
            INPUT_D: { type: 'BOOL', value: false },
            OUT_AND: { type: 'BOOL', value: false },
            OUT_OR: { type: 'BOOL', value: false },
            OUT_SOP: { type: 'BOOL', value: false },
          },
          inputs: [
            { tag: 'INPUT_A', label: 'A' },
            { tag: 'INPUT_B', label: 'B' },
            { tag: 'INPUT_C', label: 'C' },
            { tag: 'INPUT_D', label: 'D' },
          ],
          outputs: [
            { tag: 'OUT_AND', label: 'AND (A·B·C)' },
            { tag: 'OUT_OR', label: 'OR (A+B+C)' },
            { tag: 'OUT_SOP', label: 'SOP (A·B)+(C·/D)' },
          ],
        },
      },
    ],
  },

  math: {
    prose: [
      "**Any combinational function in ladder.** By the completeness of AND, OR, and NOT (from De Morgan's theorem), any Boolean function can be expressed as a sum-of-products. And any SOP expression can be directly drawn as a ladder rung with parallel branches of series contacts. Therefore: any combinational Boolean function can be implemented in ladder logic with just XIC, XIO, OTE, and parallel branches. The mapping is mechanical and exact.",
      "**Counting the rungs.** For an n-variable Boolean function with k product terms in its minimal SOP form, the ladder implementation requires exactly 1 rung (with k branches, each having at most n series contacts). Before K-map minimization, you might have 2^n branches (one per minterm). After minimization, you might have only 2–4 branches. This is why Boolean minimization (K-maps) directly reduces the complexity of the PLC rung — fewer rungs, fewer contacts, faster scan.",
    ],
    callouts: [],
  },

  challenges: [
    {
      problem: 'Convert the Boolean expression Y = (A · B) + (A · C) to minimized form, then draw the ladder rung. How many series contacts does the minimized version save compared to the original SOP?',
      hint: 'Factor the expression algebraically. Look for common terms.',
      walkthrough: [
        'Original: Y = (A · B) + (A · C).',
        'Factor out A: Y = A · (B + C).',
        'This is now in product-of-sums form: A in series with the branch (B OR C).',
        'Original SOP ladder: 2 branches, 2 contacts each = 4 series contacts total.',
        'Minimized ladder: 1 XIC(A) in series with a branch [XIC(B) or XIC(C)] = 3 contacts total.',
        'Saved: 1 contact (and clearer structure).',
        'Minimized rung: ─┤A├─┬─┤B├─┬──(Y)',
        '               └─┤C├─┘',
      ],
      answer: 'Y = A · (B + C). Minimized rung uses 3 contacts vs. 4 in original SOP — saves 1 contact and makes the logic clearer.',
      difficulty: 'easy',
    },
    {
      problem: 'A conveyor start circuit: the conveyor runs when (AUTO_MODE AND START_PB AND NOT ESTOP AND NOT FAULT) OR (MANUAL_JOG AND NOT ESTOP AND NOT FAULT). Draw the ladder rung. Then simplify to reduce the number of contacts by factoring out common terms.',
      hint: 'Notice that NOT ESTOP and NOT FAULT appear in both product terms — factor them out.',
      walkthrough: [
        'Original SOP: Y = (AUTO · START · /ESTOP · /FAULT) + (JOG · /ESTOP · /FAULT)',
        'Factor out (/ESTOP · /FAULT):',
        'Y = (AUTO · START + JOG) · /ESTOP · /FAULT',
        'Minimized: the NOT ESTOP and NOT FAULT are in series AFTER the branch.',
        'Original rung needs 2 branches × 4 contacts = 8 contacts total.',
        'Minimized rung:',
        '  Branch group: [XIC(AUTO) XIC(START)] OR [XIC(JOG)]',
        '  In series after branch: XIO(ESTOP) XIO(FAULT)',
        '  Contacts: 2 (branch path 1) + 1 (branch path 2) + 2 (series) = 5 contacts total.',
        'Saved: 3 contacts. More importantly, the interlock logic (ESTOP, FAULT) applies to BOTH modes without duplication — easier to maintain.',
      ],
      answer: 'Y = (AUTO·START + JOG) · /ESTOP · /FAULT. Rung: parallel branch of (AUTO+START) and (JOG) in series with XIO(ESTOP) and XIO(FAULT). Reduces from 8 to 5 contacts.',
      difficulty: 'medium',
    },
    {
      problem: 'Analyze this rung: ─┬─┤A├─┬──┬─┤D├─┬──(Y). The first branch is [A OR B in parallel], the second branch is [D OR (E in series with F) in parallel]. Write the Boolean expression and evaluate for: A=1,B=0,C=0,D=0,E=1,F=1.',
      hint: 'Work from inside out on the nested branch. Treat each branch group as parentheses.',
      walkthrough: [
        'First branch group: (A OR B) — let\'s call this T1 = A + B.',
        'Second branch group: (D OR (E · F)) — let\'s call this T2 = D + (E · F).',
        'Full rung: Y = T1 · T2 = (A + B) · (D + (E · F)).',
        'Evaluate for A=1, B=0, D=0, E=1, F=1:',
        'T1 = A + B = 1 + 0 = 1.',
        'E · F = 1 · 1 = 1.',
        'T2 = D + (E · F) = 0 + 1 = 1.',
        'Y = T1 · T2 = 1 · 1 = 1.',
        'The output Y is energized.',
        'Even though A is the only active input in the first group and D is not active in the second group, E·F in the nested branch provides the second path.',
      ],
      answer: 'Y = (A + B) · (D + (E · F)). For A=1,B=0,D=0,E=1,F=1: Y = (1+0)·(0+(1·1)) = 1·1 = 1. Y is energized.',
      difficulty: 'hard',
    },
  ],

  examples: [
    {
      title: 'Auto/Manual conveyor control',
      problem: 'A conveyor should run when: in AUTO mode and all three position sensors are active, OR in MANUAL mode with the jog button held. Both modes require E-stop OK. Write the complete ladder rung.',
      solution: 'Boolean: CONVEYOR = ((AUTO · POS_1 · POS_2 · POS_3) + (MANUAL · JOG_PB)) · /ESTOP_FAULT\n\nLadder rung structure:\n  ┌─┤AUTO_MODE├─┤POS_1├─┤POS_2├─┤POS_3├─┐\n  ├─┤MANUAL_MODE├─┤JOG_PB├─────────────────┤─┤/├ESTOP─(CONVEYOR)\n  └───────────────────────────────────────┘\n\nBranch 1: AUTO_MODE in series with POS_1, POS_2, POS_3 (4 contacts)\nBranch 2: MANUAL_MODE in series with JOG_PB (2 contacts)\nAfter branch: XIO(ESTOP_FAULT) in series (1 contact)\n\nTotal: 7 contacts, 1 coil, 1 rung. This would have been 2 separate relay circuit branches in physical relay logic, converging on one contactor coil.',
    },
  ],
};
