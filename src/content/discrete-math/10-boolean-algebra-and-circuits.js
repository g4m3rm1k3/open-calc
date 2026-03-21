export default {
  id: 'discrete-1-10',
  slug: 'boolean-algebra-and-circuits',
  chapter: 'discrete-1',
  order: 12,
  title: 'Boolean Algebra and Circuits',
  subtitle: 'Logic identities as an algebra and their hardware realization',
  tags: ['boolean algebra', 'logic circuits', 'cnf', 'dnf', 'karnaugh map'],
  aliases: 'and or not gates cnf dnf boolean identities digital logic',

  hook: {
    question:
      'How do symbolic logic statements become actual hardware gates that compute?',
    realWorldContext:
      'Boolean algebra underlies CPU logic units, digital circuit minimization, hardware verification, and SAT-based software tooling.',
    previewVisualizationId: 'TruthTableLab',
  },

  intuition: {
    prose: [
      'Boolean algebra treats truth values as algebraic objects with operations AND, OR, and NOT.',
      'Every propositional formula has equivalent normal-form representations such as CNF and DNF.',
      'Circuit design is logic made physical. Gates implement Boolean operations, and algebraic simplification reduces gate count and latency.',
      'For beginners, always validate an identity by truth table first, then learn symbolic transformation rules.',
      'Karnaugh maps are visual tools for simplification and are especially useful before formal minimization algorithms.',
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'Duality Principle',
        body: 'Swapping AND/OR and 0/1 in a valid Boolean identity yields another valid identity.',
      },
      {
        type: 'theorem',
        title: 'Normal Form Fact',
        body: 'Every Boolean function can be represented in both CNF and DNF.',
      },
    ],
    visualizations: [
      {
        id: 'TruthTableLab',
        title: 'Truth Table Studio',
        caption: 'Test identity candidates and verify equivalence row-by-row.',
      },
    ],
  },

  math: {
    prose: [
      'Core identities include idempotent, commutative, associative, distributive, absorption, and De Morgan laws.',
      'Functional completeness means a gate set can express every Boolean function. NAND alone and NOR alone are functionally complete.',
      'CNF is central in SAT solving and formal verification; DNF is often intuitive for direct constructive reasoning.',
    ],
  },

  rigor: {
    prose: [
      'A symbolic simplification is valid only if each rewrite rule is logically equivalent.',
      'To prove two circuits equivalent, prove corresponding formulas equivalent or compare full truth tables.',
    ],
  },

  examples: [
    {
      id: 'discrete-1-10-ex1',
      title: 'Absorption Simplification',
      problem: 'Simplify P OR (P AND Q).',
      steps: [
        { expression: 'P OR (P AND Q)', annotation: 'Original expression.' },
        { expression: 'P', annotation: 'Absorption law.' },
      ],
      conclusion: 'The term (P AND Q) is redundant once P is already true.',
    },
    {
      id: 'discrete-1-10-ex2',
      title: 'De Morgan Transformation',
      problem: 'Rewrite NOT(P OR Q) using only AND and NOT.',
      steps: [
        { expression: 'NOT(P OR Q)', annotation: 'Original.' },
        { expression: '(NOT P) AND (NOT Q)', annotation: 'De Morgan law.' },
      ],
      conclusion: 'This rewrite is essential for circuit conversion constraints.',
    },
  ],

  challenges: [
    {
      id: 'discrete-1-10-ch1',
      difficulty: 'easy',
      problem: 'Is XOR associative?',
      walkthrough: [
        { expression: '(P xor Q) xor R = P xor (Q xor R)', annotation: 'Check via truth table or parity interpretation.' },
        { expression: 'Both sides are true when odd number of inputs are true', annotation: 'Parity view gives immediate proof.' },
      ],
      answer: 'Yes.',
    },
    {
      id: 'discrete-1-10-ch2',
      difficulty: 'medium',
      problem: 'Show NAND is functionally complete by constructing NOT and AND from NAND.',
      hint: 'Use x NAND x to build negation first.',
      walkthrough: [
        { expression: 'NOT x = x NAND x', annotation: 'First derive negation gate.' },
        { expression: 'x AND y = NOT(x NAND y)', annotation: 'Compose NAND with derived NOT.' },
        { expression: 'OR follows by De Morgan', annotation: 'With NOT and AND, full expressiveness follows.' },
      ],
      answer: 'NOT x = x NAND x, then x AND y = NOT(x NAND y).',
    },
  ],

  crossRefs: [
    { lessonSlug: 'propositions-and-proof-techniques', label: 'Propositions and Proof Techniques', context: 'Boolean algebra is propositional logic viewed algebraically.' },
    { lessonSlug: 'automata-theory', label: 'Automata Theory', context: 'State-transition guards are often Boolean conditions.' },
  ],

  checkpoints: [
    'read-intuition',
    'read-math',
    'read-rigor',
    'completed-example-1',
    'completed-example-2',
    'attempted-challenge-easy',
    'attempted-challenge-medium',
  ],
}
