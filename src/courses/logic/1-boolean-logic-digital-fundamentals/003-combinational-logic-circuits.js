export default {
  id: 'logic0-003',
  slug: 'combinational-logic-circuits',
  chapter: 'logic0',
  order: 3,
  title: 'Combinational Logic Circuits',
  subtitle: 'Building multi-input, multi-output logic from gates — and reading industrial control logic as the boolean circuits it really is.',
  tags: ['combinational logic', 'sum of products', 'product of sums', 'logic circuit', 'minterm', 'maxterm', 'SOP', 'POS'],
  aliases: 'combinational logic SOP POS sum products minterms maxterms logic design',
  timeToComplete: 22,
  coreConcept: 'Any combinational logic function can be derived from its truth table using Sum of Products (SOP): OR together every AND term that produces a 1 output. SOP gives you the minimal gate network directly from requirements. Reading complex PLC rungs backwards gives you SOP expressions.',
  prerequisites: ['logic0-002'],
  nextLesson: 'demorgans-theorem',

  hook: {
    question: "A machine has 3 sensors: door guard (D), workpiece present (W), and cycle button (C). The machine should start exactly when: the door is closed AND the workpiece is loaded AND the button is pressed, OR when in 'auto mode' (A) AND the door is closed AND the workpiece is loaded. How do you build this from gates — and how do you verify it's correct?",
    realWorldContext: "PLC programs are combinational logic expressed in ladder notation. Every rung is an implicit boolean equation. When you need to design or audit logic — especially safety-critical logic — you need to be able to go from specification to truth table to gate network, and back. This is how you verify that a PLC program does exactly what the specification requires and nothing more.",
  },

  mentalModel: [
    "**Truth table to circuit is a solved problem.** Given any specification expressed as a truth table, Sum of Products (SOP) gives you a guaranteed correct gate implementation. It's mechanical: identify the rows where output = 1, write an AND term for each such row, OR all the AND terms together. Done.",
    "**Every row in the truth table is an AND term.** The AND term for a row sets each input to its value in that row: if A=1 and B=0, the AND term is A · B̄ (A AND NOT-B). This AND term is 1 for exactly that one row and 0 for all others. ORing multiple AND terms 'lights up' each of their corresponding rows.",
    "**SOP is a two-level circuit.** The first level is a bank of AND gates (one per selected row). The second level is a single OR gate collecting all AND outputs. Two levels of gates, maximum. Any logic function can be implemented in two levels — this is a fundamental result in combinational logic theory.",
  ],

  intuition: {
    prose: [
      "**Deriving logic from specification.** Given a verbal spec, the first step is always the truth table. List every input variable, enumerate every combination (2ⁿ rows), and for each combination, decide from the specification what the output should be. This forces you to confront every possible input state explicitly — including edge cases the verbal spec may not have addressed.",
      "**Sum of Products (SOP) method.** Look at the truth table. Find every row where the output is 1. For each such row, write an AND term: for each input variable, if it's 1 in that row write the variable; if it's 0 write the complement. Then OR all the AND terms together. This expression evaluates to 1 for exactly the rows you selected.",
      "**Product of Sums (POS) method — the complement.** Alternatively, look at every row where output is 0 and write an OR term for each (using complements of the 1s — the dual of SOP). Then AND all OR terms together. POS and SOP are dual methods producing equivalent circuits. Use SOP when there are fewer 1-rows than 0-rows; use POS when there are fewer 0-rows.",
      "**Simplifying with Boolean algebra.** Raw SOP from the truth table is seldom minimal — it may have many terms with redundancies. Boolean algebra identities (complement, absorption, idempotent) can simplify it to fewer gates. Example: A·B + A·B̄ = A·(B + B̄) = A·1 = A. The two terms differing only in B merge to just A. Systematic simplification uses Karnaugh Maps (K-maps) — covered in the next lesson.",
      "**Reading a PLC rung as SOP.** A ladder rung with multiple parallel branches (each branch being contacts in series) is literally SOP: each parallel branch is an AND term, and the parallel combination is the OR. The output coil energizes when the SOP evaluates to 1. Complex rungs with nested parallels and series combinations are more complex boolean expressions — but still reducible to SOP form.",
    ],
    callouts: [
      {
        type: 'procedure',
        title: 'Truth Table to SOP Gate Circuit',
        body: '1. Write the truth table (enumerate all 2ⁿ input combinations).\n2. Identify all rows where output = 1.\n3. For each 1-output row, write the AND term:\n   - Input = 1 in that row → use the variable directly\n   - Input = 0 in that row → use the complemented variable\n4. Write the SOP expression: OR together all AND terms.\n5. Build the circuit: one AND gate per term, one final OR gate.\n\nVerify: substitute each row\'s values into the expression. Should match the truth table.',
      },
      {
        type: 'definition',
        title: 'Minterms and Maxterms',
        body: '**Minterm (mₙ):** AND term that is 1 for exactly one row. Row 5 (binary 101) has minterm: A·B̄·C. The minterm number equals the row number in the truth table.\n\n**Maxterm (Mₙ):** OR term that is 0 for exactly one row. Row 5 has maxterm: Ā+B+C̄.\n\n**Shorthand notation:**\n\nSOP: $f = \\sum m(2, 5, 7)$ = sum of minterms 2, 5, 7\nPOS: $f = \\prod M(0, 1, 3, 4, 6)$ = product of maxterms 0,1,3,4,6\n\n(Complement of each other — the 1-rows and 0-rows together cover all rows.)',
      },
      {
        type: 'insight',
        title: 'Why Two-Level Logic is Important',
        body: 'SOP (AND-OR) and POS (OR-AND) are two-level logic implementations. Signal propagation through exactly two gate levels ensures predictable, bounded delay — the output responds to any input change within two gate delays (2–20ns typically). Deep logic chains (many levels) create timing hazards where glitches can propagate before the output stabilizes. PLC scan times (milliseconds) are 10,000× slower than gate delays, so this doesn\'t matter for PLC logic — but it matters deeply for hardware design in ASICs and FPGAs.',
      },
      {
        type: 'insight',
        title: 'Hazards and Glitches in Combinational Logic',
        body: 'When an input changes, different paths through a logic circuit take slightly different times (due to gate propagation delays). For a brief moment, the paths may disagree, causing a glitch on the output. This is called a **static hazard**. In PLC software, this never matters — the PLC reads inputs once per scan and evaluates logic with stored values. In hardware (relays, solid-state logic), glitches can cause spurious actuations. This is one reason PLCs replaced relay logic: software logic is glitch-free by design.',
      },
    ],
    visualizations: [
      {
        id: 'LogicGateLab',
        title: 'Building SOP: AND gates select rows, OR gate combines them',
        mathBridge: 'Select AND gate. Set A=1, B=1: output = 1. This is minterm m3. Now set A=1, B=0: output = 0 (wrong row). Two AND gates in parallel (one per selected row) + one OR gate = Sum of Products. Explore all 4 input combinations.',
      },
    ],
  },

  math: {
    prose: [
      "**SOP canonical form.** For a function $f(A, B, C)$:\n\n$$f = \\sum_{k} m_k \\quad \\text{for all rows } k \\text{ where } f = 1$$\n\nEach minterm is:\n$$m_k = \\prod_{i} L_i^{k_i}$$\n\nWhere $L_i^0 = \\bar{x}_i$ (complement if bit is 0) and $L_i^1 = x_i$ (uncomplemented if bit is 1).",
      "**Duality.** Every boolean theorem has a dual obtained by swapping (AND↔OR) and (0↔1). SOP ↔ POS under duality. Sum of minterms ↔ product of maxterms. The canonical forms are duals of each other.",
    ],
    callouts: [],
  },

  challenges: [
    {
      problem: 'Write the SOP minterm for a 3-variable truth table row where A=1, B=0, C=1.',
      hint: 'For each variable: if it is 1 in the row, use it directly; if it is 0, use its complement.',
      walkthrough: [
        'Variable A = 1 in this row → include A uncomplemented.',
        'Variable B = 0 in this row → include B̄ (complement of B).',
        'Variable C = 1 in this row → include C uncomplemented.',
        'AND all three together: A · B̄ · C.',
        'Verify: substitute A=1, B=0, C=1: 1 · 1 · 1 = 1. ✓ Any other row gives 0.',
        'This is minterm m5 (binary 101 = decimal 5).',
      ],
      answer: 'A · B̄ · C (minterm m5)',
      difficulty: 'easy',
    },
    {
      problem: 'A function has output=1 for minterms 1, 3, 5, 7 (for variables A, B, C). Write the full SOP expression without simplification.',
      hint: 'Convert each minterm number to binary (3 bits for A, B, C). Then write the AND term for each row.',
      walkthrough: [
        'm1: binary 001 → A=0, B=0, C=1 → AND term: Ā · B̄ · C',
        'm3: binary 011 → A=0, B=1, C=1 → AND term: Ā · B · C',
        'm5: binary 101 → A=1, B=0, C=1 → AND term: A · B̄ · C',
        'm7: binary 111 → A=1, B=1, C=1 → AND term: A · B · C',
        'OR all four terms: F = Ā·B̄·C + Ā·B·C + A·B̄·C + A·B·C',
        'This is the canonical SOP — correct but not minimal.',
      ],
      answer: 'F = Ā·B̄·C + Ā·B·C + A·B̄·C + A·B·C',
      difficulty: 'medium',
    },
    {
      problem: 'Simplify: A·B·C + A·B·C̄ using Boolean algebra. Show each step, name the law used at each step.',
      hint: 'Look for two terms that are identical except one variable appears complemented in one term and uncomplemented in the other.',
      walkthrough: [
        'Original: A·B·C + A·B·C̄',
        'Step 1 — Factor out A·B (Distributive law): A·B·(C + C̄)',
        'Step 2 — Apply the Complement law: C + C̄ = 1',
        'Result: A·B·(1)',
        'Step 3 — Apply the AND Identity law: A·B·1 = A·B',
        'Final result: A·B. The variable C was eliminated because the two terms covered all possible values of C.',
      ],
      answer: 'A·B',
      difficulty: 'hard',
    },
  ],

  examples: [
    {
      title: 'Machine start logic design',
      problem: 'Inputs: D=door closed, W=workpiece present, C=cycle button, A=auto mode. Output: START=1 when (D AND W AND C) OR (A AND D AND W). Build the truth table for the relevant states and derive SOP.',
      solution: 'Rather than full 4-variable truth table (16 rows), analyze SOP directly:\n\nTerm 1: D·W·C (manual start: door, workpiece, button)\nTerm 2: A·D·W (auto start: auto mode, door, workpiece)\n\nSOP: START = D·W·C + A·D·W\n\nSimplify with distributive law:\nSTART = D·W·(C + A)\n\nResult: Door closed AND workpiece present AND (cycle button pressed OR auto mode active).\n\nGate circuit: AND(D,W) → AND with OR(C,A) → START. 3 gates instead of the 2 AND + 1 OR from raw SOP.',
    },
  ],

  quiz: [
    {
      id: 'q1',
      type: 'choice',
      text: 'Sum of Products (SOP) form writes a boolean function as ORs of AND terms, one per truth table row where output = 1. What is the key advantage of SOP form?',
      options: [
        'SOP form is always the most simplified version of any boolean expression',
        'SOP form directly maps each output-1 row to one AND gate — you can immediately read off the gate circuit; it is a canonical form that can be derived mechanically from the truth table and then simplified using boolean algebra or K-maps',
        'SOP form minimizes the number of logic gates by construction',
      ],
      correct: 1,
    },
    {
      id: 'q2',
      type: 'choice',
      text: 'What distinguishes combinational logic from sequential logic?',
      options: [
        'Combinational logic uses transistors; sequential logic uses relays',
        'Combinational logic output depends only on current inputs — the same inputs always produce the same output. Sequential logic has memory (flip-flops, latches) so the output depends on current inputs AND past state. A full adder is combinational; a counter is sequential',
        'Combinational logic processes multiple bits at once; sequential logic processes one bit at a time',
      ],
      correct: 1,
    },
    {
      id: 'q3',
      type: 'choice',
      text: 'D·W·C + A·D·W simplifies to D·W·(C + A). What boolean law enables this?',
      options: [
        'De Morgan\'s theorem: NOT(D·W) = NOT(D) + NOT(W)',
        'The distributive law: A·B + A·C = A·(B + C) — factoring out D·W from both terms. This reduces 2 three-input AND gates plus an OR to one two-input AND, one OR, and one two-input AND — fewer gates for the same logic',
        'The idempotent law: A + A = A',
      ],
      correct: 1,
    },
    {
      id: 'q4',
      type: 'choice',
      text: 'A 4-variable truth table has 16 rows. Why does this grow as 2ⁿ rather than 2×n?',
      options: [
        'Because each variable doubles the number of possible input combinations — n variables each independently contribute a factor of 2 (0 or 1), giving 2 × 2 × ... × 2 = 2ⁿ total rows. This exponential growth is why simplification (K-maps, boolean algebra) matters so much',
        'Because truth tables use binary encoding which adds two columns per variable',
        'The growth is 2×n for fewer than 4 variables; it only becomes 2ⁿ for 4+ variables',
      ],
      correct: 1,
    },
  ],
};
