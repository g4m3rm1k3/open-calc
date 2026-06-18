export default {
  id: 'logic0-005',
  slug: 'boolean-simplification',
  chapter: 'logic0',
  order: 5,
  title: 'Boolean Simplification and Karnaugh Maps',
  subtitle: 'How to minimize gate count systematically — from algebraic manipulation to K-map visual grouping.',
  tags: ['Karnaugh map', 'K-map', 'boolean simplification', 'SOP minimization', 'prime implicants', 'don\'t care conditions'],
  aliases: 'karnaugh map k-map boolean minimization simplification SOP reduction prime implicant',
  timeToComplete: 22,
  coreConcept: "Karnaugh maps provide a visual method to minimize boolean expressions by grouping adjacent 1s in powers of 2. Groups of 2 eliminate one variable, groups of 4 eliminate two variables, groups of 8 eliminate three. The result is a minimal SOP with the fewest gates.",
  prerequisites: ['logic0-004'],
  nextLesson: 'sequential-logic',

  hook: {
    question: "A PLC programmer writes: ENABLE = (A·B·C) + (A·B·C̄) + (A·B̄·C) + (A·B̄·C̄). This is provably correct from the truth table — it works. But the machine is a 1990s safety PLC with a limit on the number of rung instructions. Can you reduce this to fewer terms without changing the output for any input?",
    realWorldContext: "Boolean minimization isn't just academic elegance. In older PLCs with instruction count limits, minimal logic fits in memory. In FPGAs and ASICs, fewer gates mean lower power and higher speed. In any PLC, simpler rungs are easier to audit, read, and debug. A safety engineer reviewing a 20-instruction rung with redundant terms will spend twice as long verifying it — and is more likely to miss errors. Minimized logic is also self-documenting: the minimal form often reveals the designer's intent more clearly than the expanded form.",
  },

  mentalModel: [
    "**Adjacent cells in a K-map differ by exactly one variable.** This is the key property. When two adjacent cells (both 1s) are grouped, the variable that changes between them cancels out — leaving an expression with one fewer variable. Group of 4 → two variables cancel. Group of 8 → three variables cancel.",
    "**Wrap around the edges.** K-maps use Gray code ordering precisely so that the top row wraps to the bottom, and the left column wraps to the right. A group of four corners is a valid group. If you don't check wrap-around, you'll miss simplifications.",
    "**Largest groups first, overlapping is OK.** The goal is to cover all 1s using the fewest, largest possible groups. Groups can overlap — it's not only allowed but often required to get the minimum. Every 1 must be covered by at least one group, but a single 1 can be covered by multiple groups.",
  ],

  intuition: {
    prose: [
      "**Why algebraic simplification is hard to apply systematically.** Boolean algebra has many identities — complement, absorption, De Morgan, consensus — and knowing which one to apply next requires insight. Example: A·B + A·B̄ = A is obvious. But what about A·B·C + A·B·C̄ + A·B̄·C + Ā·B·C? The minimal form (which requires grouping three terms and using consensus) is not obvious at all. Algebraic minimization works but doesn't scale. K-maps give a visual algorithm that scales to 4–5 variables without needing insight.",
      "**The Karnaugh map structure.** A K-map is a truth table rearranged as a 2D grid. Two-variable K-map: 2×2 grid. Three-variable K-map: 2×4 grid. Four-variable K-map: 4×4 grid. The columns and rows are labeled in Gray code order (00, 01, 11, 10 — not binary order). Gray code ensures adjacent cells in the grid differ by exactly one variable — which is exactly the property we need for grouping.",
      "**Reading the K-map: filling it in.** Take the truth table and write each output value in the corresponding cell. The cell coordinates correspond to the input values. For a 3-variable K-map with rows labeled by A and columns labeled by BC: the cell at row A=0, column BC=11 corresponds to row A=0, B=1, C=1 in the truth table — which is minterm 3. Write the output value (0 or 1) from that row.",
      "**Reading the K-map: finding groups.** Look for rectangular regions of 1s with sizes that are powers of 2 (1, 2, 4, 8). The group must be a valid rectangle (no L-shapes, no diagonals). Remember the wrap-around. For each group, write an AND term: for each variable, if it's constant 0 across the group, write the complement; if it's constant 1, write the variable; if it changes, drop it entirely. The AND term for each group plus the OR of all groups gives the minimal SOP.",
      "**Don't-care conditions.** Some input combinations may never occur (3-bit BCD digits only use 0–9, not 10–15). These are 'don't cares' — marked X in the K-map. When grouping, treat X as either 0 or 1, whichever makes the group larger. Don't cares are free variables: you promise to never use those input combinations, so the output can be anything. In PLC programming, don't cares represent physically impossible input states: 'the sensor can't be 1 when the actuator hasn't moved.' Using don't cares correctly can dramatically reduce logic.",
      "**When K-maps aren't enough.** K-maps work well up to 4–5 variables visually. For 6+ variables, the map becomes too large to read reliably. The Quine-McCluskey algorithm is the algebraic equivalent — finds all prime implicants systematically, then solves a covering problem. Modern logic synthesis tools (Espresso, ABC, Vivado) use variants of this. For PLC programming, you'll rarely exceed 4–5 significant variables in a single expression; K-maps are the right tool.",
    ],
    callouts: [
      {
        type: 'procedure',
        title: '4-Variable K-Map Minimization Procedure',
        body: '**Setup:** Draw 4×4 grid. Label rows AB ∈ {00,01,11,10}, columns CD ∈ {00,01,11,10}.\n\n**Fill:** Copy truth table output values into each cell (cell position matches minterm number).\n\n**Group:**\n1. Circle the largest possible group of 1s (size = power of 2)\n2. Wrap edges as needed (left↔right, top↔bottom, corners)\n3. Every 1 must be in at least one group\n4. Mark don\'t-cares (X) as 1 if it helps enlarge a group\n5. Eliminate any group fully covered by other groups\n\n**Write:** For each group, identify which variables are constant:\n- Variable = 1 across all cells → include it uncomplemented\n- Variable = 0 across all cells → include it complemented\n- Variable changes → drop it (it was eliminated by grouping)\n\n**Result:** OR all group terms together.',
      },
      {
        type: 'definition',
        title: 'Prime Implicants and Essential Prime Implicants',
        body: '**Implicant:** Any valid group of 1s (size = power of 2).\n\n**Prime implicant:** A group that cannot be enlarged further while staying within the 1s (and don\'t cares).\n\n**Essential prime implicant:** A prime implicant that is the *only* group covering some particular 1. Essential PIs must appear in the final expression — they\'re not optional.\n\n**Minimization procedure:**\n1. Find all prime implicants\n2. Identify essential prime implicants (those that cover a unique 1)\n3. Include all essential PIs in the result\n4. Cover any remaining uncovered 1s with the fewest additional PIs\n\nThe K-map visual method finds this automatically when you group largest-first.',
      },
      {
        type: 'insight',
        title: 'Algebraic Identities for Quick Simplification',
        body: 'For small expressions, algebraic manipulation is faster than drawing a K-map:\n\n**Absorption:** A + A·B = A (the second term is absorbed)\n**Consensus:** A·B + Ā·C + B·C = A·B + Ā·C (the third term is redundant)\n**Combining:** A·B + A·B̄ = A (complement of B cancels)\n**De Morgan + complement:** NOT(NOT(A)) = A — double NOT cancels\n\nRecognizing "A·B + A·B̄" — two terms that are identical except one variable is complemented — is the single most useful pattern. Always check for it first. If you spot it, the two terms simplify to just A.',
      },
      {
        type: 'insight',
        title: 'Don\'t-Care Conditions in PLC Logic',
        body: 'In industrial systems, certain input combinations are physically impossible:\n- "Auto mode ON and Manual mode ON simultaneously" — mechanical keyswitches prevent this\n- "Spindle at position A AND spindle at position B" — a spindle is in one position\n- "Motor running forward AND running reverse simultaneously" — interlocked physically\n\nThese become don\'t-cares. In a PLC, if you know inputs X and Y can never both be 1, you can simplify logic that handles the X=1,Y=1 case however you want — usually to extend a group and get a smaller expression.\n\n**Caution:** Be certain the impossibility is physical, not just procedural. Procedures change; hardware interlocks don\'t.',
      },
    ],
    visualizations: [
      {
        id: 'KMapViz',
        title: 'Interactive Karnaugh Map',
        mathBridge: 'Click cells to toggle 0/1/X (don\'t care). The map auto-detects and highlights groups of 1s. Each colored group becomes one AND term in the minimal SOP. Watch how grouping 4 adjacent 1s eliminates 2 variables.',
      },
    ],
  },

  math: {
    prose: [
      "**The formal basis for K-map grouping.** When two minterms differ in exactly one variable (say variable $x_i$), they can be combined:\n\n$$m_k + m_{k'} = (\\ldots x_i \\ldots) + (\\ldots \\bar{x}_i \\ldots) = (\\ldots)(x_i + \\bar{x}_i) = (\\ldots)(1) = (\\ldots)$$\n\nThe differing variable drops out, leaving a term with one fewer literal. Grouping four cells applies this twice (two variables drop). Grouping eight cells applies it three times.",
      "**Counting groups for n-variable K-map.** An $n$-variable K-map has $2^n$ cells. A group of $2^k$ cells eliminates $k$ variables, yielding an $(n-k)$-literal AND term. The maximum elimination occurs with a group of $2^n$ (the entire map) — all variables cancel and the function reduces to the constant 1.",
    ],
    callouts: [],
  },

  challenges: [
    {
      problem: 'A 2-variable K-map has 1s at minterms 1 and 3 (AB=01 and AB=11). What group do these form? What is the minimal term?',
      hint: 'In a 2-variable K-map, adjacent cells share all but one variable. Which variable changes between these two cells?',
      walkthrough: [
        'Minterm 1: AB=01 (A=0, B=1). Minterm 3: AB=11 (A=1, B=1).',
        'These two cells are adjacent in the K-map.',
        'Compare the two cells: A changes (0→1), B stays constant at 1.',
        'Since A changes, it is eliminated from the group term.',
        'Since B=1 in both cells, B is included uncomplemented.',
        'The minimal term for this group of 2 is: B.',
        'Verify: B=1 covers both minterms 01 and 11. B=0 covers minterms 00 and 10, which are both 0. ✓',
      ],
      answer: 'B (group of 2 eliminates variable A)',
      difficulty: 'easy',
    },
    {
      problem: 'Minimize: F = Σm(0,1,4,5) for a 3-variable function (A,B,C). Draw the K-map and find the minimal SOP.',
      hint: 'Place minterms in the 3-variable K-map (rows=A, columns=BC in Gray code order 00,01,11,10). Look for a group of 4.',
      walkthrough: [
        '3-variable K-map layout (rows=A, columns=BC in Gray code: 00,01,11,10):',
        'Place the 1s: m0(000)→row A=0,col BC=00, m1(001)→row A=0,col BC=01, m4(100)→row A=1,col BC=00, m5(101)→row A=1,col BC=01.',
        'K-map:\n         BC=00  BC=01  BC=11  BC=10\n  A=0:    1      1      0      0\n  A=1:    1      1      0      0',
        'The four 1s form a 2×2 block in the BC=00 and BC=01 columns, both rows.',
        'In this group: A changes (0 and 1) → eliminate A. B=0 in both BC=00 and BC=01 → include B̄. C changes (0 and 1) → eliminate C.',
        'Wait — check the column labels: BC=00 means B=0,C=0 and BC=01 means B=0,C=1. B is constant at 0; C changes.',
        'Group term: B̄ (B is 0 throughout the group, so include its complement).',
        'Minimal SOP: F = B̄',
      ],
      answer: 'F = B̄',
      difficulty: 'medium',
    },
    {
      problem: 'A 4-variable K-map has 1s at minterms 0,1,4,5,8,9,12,13 and don\'t-cares at 2,3,6,7,10,11,14,15. What is the minimal SOP?',
      hint: 'The don\'t-cares are all minterms where C=1 (odd columns in the K-map). Use them to extend your groups to cover 8 cells.',
      walkthrough: [
        '4-variable K-map (rows=AB, columns=CD in Gray code 00,01,11,10):',
        'Minterms with 1s (the left two columns, CD=00 and CD=01, all rows): m0,m1,m4,m5,m8,m9,m12,m13.',
        'Don\'t-cares (the right two columns, CD=11 and CD=10, all rows): m2,m3,m6,m7,m10,m11,m14,m15.',
        'The entire left half of the map (CD=00 and CD=01 columns) has required 1s.',
        'Treat don\'t-cares as 1s to make the largest possible group: now ALL 16 cells are 1 or X.',
        'One group of 8: columns CD=00 and CD=01 (C=0 in both), all 4 rows of AB.',
        'In this group: A changes, B changes → both eliminated. C=0 in both columns → include C̄. D changes → eliminated.',
        'Group term: C̄',
        'Actually, with don\'t-cares, we can group the full 8 required 1s: m0,1,4,5,8,9,12,13 — all have C=0 (D alternates). Term: C̄.',
        'Minimal SOP: F = C̄',
      ],
      answer: 'F = C̄',
      difficulty: 'hard',
    },
  ],

  examples: [
    {
      title: 'Minimizing the PLC safety enable logic',
      problem: 'ENABLE = Σm(4,5,6,7) in a 3-variable function (A, B, C). Write the K-map and find the minimal SOP.',
      solution: 'Truth table:\nm0 (000): 0\nm1 (001): 0\nm2 (010): 0\nm3 (011): 0\nm4 (100): 1\nm5 (101): 1\nm6 (110): 1\nm7 (111): 1\n\n3-variable K-map (rows=A, columns=BC with Gray code 00,01,11,10):\n\n         BC=00  BC=01  BC=11  BC=10\nA=0:       0      0      0      0\nA=1:       1      1      1      1\n\nAll four 1s are in the A=1 row — one group of 4. The variable A=1 everywhere in the group → include A uncomplemented. B and C both change → both drop out.\n\nMinimal SOP: ENABLE = A\n\nThe original 4-term expression A·B·C + A·B·C̄ + A·B̄·C + A·B̄·C̄ reduces to simply A. The output is 1 whenever A is 1, regardless of B and C.',
    },
    {
      title: 'K-map with don\'t cares — BCD digit decoder',
      problem: 'A BCD digit is valid only for values 0–9 (4 bits, inputs A B C D). Design logic that outputs 1 when the digit is 5, 6, 7, 8, or 9 (the "high digits" for a display segment). Inputs 10–15 are invalid (don\'t cares).',
      solution: 'Output = 1 for minterms 5,6,7,8,9. Don\'t cares at 10,11,12,13,14,15.\n\n4-variable K-map with A,B on rows and C,D on columns:\n\n         CD=00  CD=01  CD=11  CD=10\nAB=00:     0      0      0      0      (rows 0,1,3,2)\nAB=01:     0      1      1      1      (rows 4,5,7,6)\nAB=11:     X      X      X      X      (rows 12,13,15,14)\nAB=10:     1      1      X      X      (rows 8,9,11,10)\n\nGroup 1: Rows AB=01,AB=11 in CD=01 and CD=11 columns (cells 5,7,13,15) — group of 4.\nA changes (0→1), B=1 constant, C changes, D=1 constant → term: B·D\n\nGroup 2: Rows AB=10,AB=11 in CD=00 and CD=01 columns (cells 8,9,12,13) — group of 4.\nA=1 constant, B changes, C=0 constant, D changes → term: A·C̄\n\nGroup 3: Rows AB=01 in CD=10 and CD=11 (cells 6,7) — could be covered by Group 1 + another, but check: cell 6 (0110) = minterm 6. B=1, D=0 — not covered by B·D (D must be 1). Need separate coverage.\nCells 6,7,14,15 (AB=01,AB=11, CD=10,CD=11): term B·C. Covers minterm 6.\n\nMinimal SOP: OUTPUT = B·D + A·C̄ + B·C\n\nThree 2-literal AND terms instead of five 4-literal minterms. Verified: substituting each valid minterm confirms output = 1.',
    },
  ],
};
