export default {
  id: 'logic0-004',
  slug: 'demorgans-theorem',
  chapter: 'logic0',
  order: 4,
  title: "De Morgan's Theorem",
  subtitle: 'The single most useful identity in boolean algebra — how to push negations through AND and OR, and why it rewrites safety logic.',
  tags: ["De Morgan", "boolean algebra", "logic simplification", "NAND NOR equivalence", "safety logic"],
  aliases: "de morgan theorem NOT AND OR invert push through safety relay",
  timeToComplete: 18,
  coreConcept: "De Morgan's theorem: NOT(A·B) = Ā+B̄ and NOT(A+B) = Ā·B̄. Breaking a NOT across AND flips AND to OR (and vice versa). This is the tool for converting between NAND/NOR and AND/OR, simplifying negated expressions, and understanding why safety circuits fail to the safe state.",
  prerequisites: ['logic0-003'],
  nextLesson: 'boolean-simplification',

  hook: {
    question: "A safety relay has the logic: SAFE = NOT(FAULT_1 OR FAULT_2 OR FAULT_3). An engineer proposes changing this to: SAFE = NOT(FAULT_1) AND NOT(FAULT_2) AND NOT(FAULT_3). Are these equivalent? Does it matter which form the PLC program uses?",
    realWorldContext: "De Morgan's theorem directly impacts how you write safety interlocks. The two forms are equivalent — but one may be clearer to read, or map better to available hardware. More importantly, understanding De Morgan's stops you from making subtle logic errors when negating complex conditions: 'the machine is NOT ready when A or B or C' means something very different from 'the machine is NOT(A) and NOT(B) and NOT(C).' Only one of those is De Morgan; the other is wrong.",
  },

  mentalModel: [
    "**The two laws in one sentence.** To push NOT inside a parenthesized expression: flip AND to OR (or OR to AND), and complement each variable inside. Do both steps or the result is wrong.",
    "**Gates with bubbles are De Morgan identities.** A NAND gate (AND+output bubble) is literally De Morgan: its truth table equals OR with input bubbles (Ā+B̄). The two circuit symbols for NAND are equivalent — you choose which to draw based on which conveys the logic more clearly.",
    "**Failing safe means failing to the de-energized state.** Safety systems use negative logic so that the 'safe' output is energized, and faults cause it to de-energize. De Morgan's tells you how to convert between 'enable when all OK' and 'disable when any fault' — they're the same condition, two logical forms.",
  ],

  intuition: {
    prose: [
      "**De Morgan's First Law.** NOT(A AND B) = NOT-A OR NOT-B. Written: $\\overline{A \\cdot B} = \\bar{A} + \\bar{B}$. Proof by truth table: check all four input combinations — both sides produce the same output for every row. The NAND gate implements exactly this: it's an AND gate with its output inverted, which is the same as an OR gate with both inputs inverted.",
      "**De Morgan's Second Law.** NOT(A OR B) = NOT-A AND NOT-B. Written: $\\overline{A + B} = \\bar{A} \\cdot \\bar{B}$. The NOR gate implements exactly this: it's an OR gate with its output inverted, equivalent to an AND gate with both inputs inverted.",
      "**Breaking NOT into an expression — the procedure.** To apply De Morgan, push the NOT sign inward through the expression: flip every AND to OR and OR to AND, and complement every individual variable. The NOT sign 'absorbs' into the expression and disappears. Example: $\\overline{A + B \\cdot C}$ — push NOT through: $\\bar{A} \\cdot \\overline{B \\cdot C}$ — push NOT through the remaining term: $\\bar{A} \\cdot (\\bar{B} + \\bar{C})$.",
      "**Multiple applications.** De Morgan applies to any level of nesting — apply it repeatedly, one level at a time. Complex negated expressions always fully simplify with enough applications. The key is: one step at a time, always both operations (flip AND/OR AND complement variables) simultaneously.",
      "**Graphical De Morgan.** On a schematic, you can convert between equivalent gate symbols: replace the AND body with OR body (or vice versa) and add/remove bubbles on all I/O points. An AND gate with bubbles on all inputs = NOR gate. An OR gate with bubbles on all inputs = NAND gate. Using the form that matches the logic polarity makes schematics self-documenting.",
      "**PLC application: converting safety logic forms.** Specification: 'Enable output when door is NOT open AND E-stop is NOT pressed AND no faults active.' Directly: Enable = $\\bar{D} \\cdot \\bar{E} \\cdot \\bar{F}$. Equivalent (De Morgan inverse): Enable = $\\overline{D + E + F}$. In ladder: first form = three XIO (NC) contacts in series. Second form = a NOR function block. Both are identical logic — choose what's clearer to read and audit.",
    ],
    callouts: [
      {
        type: 'theorem',
        title: "De Morgan's Theorem (Both Laws)",
        body: '**Law 1 (NAND = OR with inverted inputs):**\n$$\\overline{A \\cdot B} = \\bar{A} + \\bar{B}$$\n\n**Law 2 (NOR = AND with inverted inputs):**\n$$\\overline{A + B} = \\bar{A} \\cdot \\bar{B}$$\n\n**General rule:** To push NOT inside parentheses:\n1. Flip AND ↔ OR inside\n2. Complement each variable inside\n3. Remove the outer NOT\n\nBoth steps are required — do just one and the result is wrong.',
      },
      {
        type: 'procedure',
        title: 'Step-by-Step Application',
        body: 'Simplify: $\\overline{(A + \\bar{B}) \\cdot C}$\n\nStep 1 — Apply Law 1 (NOT of AND):\n$\\overline{A + \\bar{B}} + \\bar{C}$\n\nStep 2 — Apply Law 2 (NOT of OR):\n$\\bar{A} \\cdot \\overline{\\bar{B}} + \\bar{C}$\n\nStep 3 — Double NOT cancels:\n$\\bar{A} \\cdot B + \\bar{C}$\n\nResult: $\\bar{A} \\cdot B + \\bar{C}$\n\nVerify: substitute sample values into both original and simplified forms — they must match.',
      },
      {
        type: 'insight',
        title: 'Graphical De Morgan — Equivalent Gate Symbols',
        body: 'Every gate has two equivalent symbols under De Morgan:\n\n**AND gate** = OR gate with all inputs and output bubbled\n**OR gate** = AND gate with all inputs and output bubbled\n**NAND gate** = OR gate with all inputs bubbled (no output bubble)\n**NOR gate** = AND gate with all inputs bubbled (no output bubble)\n\nChoose the symbol that matches the signal polarity context — draw the gate whose active-high inputs and outputs align with the surrounding logic. Active-low signals pair with bubbled pins.',
      },
      {
        type: 'insight',
        title: 'Why Safety Circuits Use Negative Logic',
        body: '"Normally-closed" safety circuits are designed so the safe state (unactuated) is the energized state, and any fault (broken wire, open contact, power loss) drives the circuit to the de-energized (safe) state. This is the "fail-safe" principle.\n\nDe Morgan connection: "SAFE = NOT(any fault)" = $\\overline{F_1 + F_2 + F_3}$ = NOR. The NOR output is 1 only when all faults are 0. Any fault drives output to 0 — de-energized = safe. Wire break (F → 0, but circuit opens anyway) → output = 0 = safe. This is safety by design, not by accident.',
      },
    ],
    visualizations: [
      {
        id: 'LogicGateLab',
        title: "De Morgan's Gate Equivalences",
        mathBridge: 'Select NAND gate. Note its truth table. Now select OR gate — they have the same output column! The NAND and the OR-with-inverted-inputs are identical. That IS De Morgan\'s first law. Try NOR vs AND-with-inverted-inputs.',
      },
    ],
  },

  math: {
    prose: [
      "**Proof by perfect induction.** Since all boolean variables are either 0 or 1, De Morgan's laws can be proved by checking all 4 rows of the two-input truth table:\n\n| A | B | A·B | ¬(A·B) | Ā | B̄ | Ā+B̄ |\n|---|---|-----|--------|---|---|------|\n| 0 | 0 |  0  |   1    | 1 | 1 |  1   |\n| 0 | 1 |  0  |   1    | 1 | 0 |  1   |\n| 1 | 0 |  0  |   1    | 0 | 1 |  1   |\n| 1 | 1 |  1  |   0    | 0 | 0 |  0   |\n\nColumns 4 and 7 are identical — QED.",
      "**Extension to n variables.** De Morgan generalizes to any number of variables:\n\n$$\\overline{A_1 \\cdot A_2 \\cdots A_n} = \\bar{A}_1 + \\bar{A}_2 + \\cdots + \\bar{A}_n$$\n$$\\overline{A_1 + A_2 + \\cdots + A_n} = \\bar{A}_1 \\cdot \\bar{A}_2 \\cdots \\bar{A}_n$$\n\nA 16-input NOR gate: output is 1 only when all 16 inputs are 0. Output is 0 when any single input is 1.",
    ],
    callouts: [],
  },

  challenges: [
    {
      problem: 'Apply De Morgan: simplify NOT(A AND B). Write the result.',
      hint: 'Use De Morgan\'s First Law: NOT(A·B) = Ā + B̄.',
      walkthrough: [
        'Identify the form: NOT(A AND B) = NOT(A·B).',
        'Apply De Morgan\'s First Law: NOT(A·B) = Ā + B̄.',
        'Result: Ā + B̄ (NOT-A OR NOT-B).',
        'Verify with one example: A=1, B=1. NOT(1·1)=NOT(1)=0. And Ā+B̄=0+0=0. ✓',
      ],
      answer: 'Ā + B̄',
      difficulty: 'easy',
    },
    {
      problem: 'Simplify using De Morgan: NOT(NOT-A OR NOT-B). Show each step.',
      hint: 'Apply De Morgan\'s Second Law to the outer NOT, then simplify the double negations.',
      walkthrough: [
        'Start: NOT(Ā + B̄)',
        'Apply De Morgan\'s Second Law: NOT(X + Y) = X̄ · Ȳ, where X=Ā and Y=B̄.',
        'Result: Ā̄ · B̄̄',
        'Apply Double NOT (involution) law: Ā̄ = A and B̄̄ = B.',
        'Final result: A · B',
        'This shows that NOT(NOT-A OR NOT-B) = A AND B. De Morgan\'s laws are self-inverse — applying them twice returns to the original form.',
      ],
      answer: 'A · B',
      difficulty: 'medium',
    },
    {
      problem: 'A PLC rung condition is: STOP when NOT(DOOR_CLOSED AND WORKPIECE_PRESENT AND CYCLE_ACTIVE). Rewrite this using De Morgan into a form with three OR terms, then describe what each term means in plain English.',
      hint: 'Apply De Morgan\'s First Law extended to three variables: NOT(A·B·C) = Ā + B̄ + C̄.',
      walkthrough: [
        'Original: STOP = NOT(DOOR_CLOSED · WORKPIECE_PRESENT · CYCLE_ACTIVE)',
        'Apply De Morgan\'s Law (generalized to 3 variables): NOT(A·B·C) = Ā + B̄ + C̄',
        'Result: STOP = NOT(DOOR_CLOSED) + NOT(WORKPIECE_PRESENT) + NOT(CYCLE_ACTIVE)',
        'Term 1 — NOT(DOOR_CLOSED): Stop because the door is open (safety interlock).',
        'Term 2 — NOT(WORKPIECE_PRESENT): Stop because no workpiece is loaded (prevents empty-cycle damage).',
        'Term 3 — NOT(CYCLE_ACTIVE): Stop because the cycle has not been initiated (prevents spurious motion).',
        'The De Morgan form explicitly lists every individual reason the machine will stop, which is much easier to audit than the original negated AND.',
      ],
      answer: 'STOP = NOT(DOOR_CLOSED) + NOT(WORKPIECE_PRESENT) + NOT(CYCLE_ACTIVE). Each term is one reason the machine must stop.',
      difficulty: 'hard',
    },
  ],

  examples: [
    {
      title: 'Simplify a negated safety condition',
      problem: "Specification: 'The conveyor stops when: it is NOT the case that (product is present AND conveyor is enabled AND no jam is detected).' Write this as a simplified boolean expression suitable for a PLC rung.",
      solution: 'Let P = product present, E = conveyor enabled, J = jam detected.\n\nStop condition: NOT(P AND E AND NOT(J))\n= NOT(P · E · J̄)\n\nApply De Morgan (Law 1, NOT of AND):\n= P̄ + Ē + J̄̄\n= P̄ + Ē + J\n\nSo STOP = NOT(product present) OR NOT(conveyor enabled) OR jam detected.\n\nPLC ladder: Three parallel branches — XIO P (NC), XIO E (NC), XIC J (NO) — any one of these energizes the STOP output. This is equivalent to the original condition but is much easier to read and debug in a ladder rung.',
    },
  ],
};
