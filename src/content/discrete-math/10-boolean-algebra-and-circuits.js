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
  semantics: {
    core: [
      { symbol: '1, 0', meaning: 'True and False (High and Low voltage)' },
      { symbol: '· (AND)', meaning: 'Conjunction — true only if both are 1' },
      { symbol: '+ (OR)', meaning: 'Disjunction — true if at least one is 1' },
      { symbol: 'ā or ¬a', meaning: 'Inversion — the NOT operation' },
      { symbol: '⊕ (XOR)', meaning: 'Exclusive OR — true if inputs differ' },
      { symbol: 'NAND / NOR', meaning: 'Universal gates capable of building any other logic' },
    ],
    rulesOfThumb: [
      'De Morgan: NOT(A AND B) = (NOT A) OR (NOT B).',
      'XOR is essentially "Addition modulo 2".',
      'Absorption: A + (A · B) = A.',
      'Double Negation: NOT(NOT A) = A.',
    ],
  },

  spiral: {
    recoveryPoints: [
      {
        lessonId: 'discrete-1-01b-logic-and-proofs',
        label: 'Logic and Proofs',
        note: 'Boolean algebra is the formal symbolic system for the propositional logic we studied at the beginning.',
      },
    ],
    futureLinks: [
      {
        lessonId: 'discrete-1-11-automata-theory',
        label: 'Automata Theory',
        note: 'Sequential circuits use Boolean logic combined with memory (Flip-Flops) to implement state machines.',
      },
    ],
  },

  mentalModel: [
    'Boolean algebra is the "Math of Switches".',
    'Logic gates are the "Atomic Building Blocks" of digital hardware.',
    'Truth Tables are the "Input-Output Maps" for any circuit.',
    'Functional completeness means you only need one type of "Universal" brick to build anything.',
  ],

  assessment: {
    questions: [
      {
        id: 'bool-assess-1',
        type: 'choice',
        text: 'What is the output of an OR gate if one input is 1 and the other is 0?',
        options: ['0', '1', 'Undefined', 'Depends on the previous state'],
        answer: '1',
        hint: 'OR requires at least one input to be 1.',
      },
      {
        id: 'bool-assess-2',
        type: 'input',
        text: 'Simplify: A AND (NOT A).',
        answer: '0',
        hint: 'A value cannot be both true and false at the same time.',
      },
    ],
  },

  quiz: [
    {
      id: 'bool-q1',
      type: 'choice',
      text: 'Which gate is called "Universal" because it can implement any Boolean function?',
      options: ['AND', 'OR', 'NAND', 'XOR'],
      answer: 'NAND',
      hints: ['NAND and NOR are functionally complete.'],
    },
    {
      id: 'bool-q2',
      type: 'choice',
      text: 'According to De Morgan\'s Law, NOT(A OR B) is equivalent to:',
      options: ['(NOT A) OR (NOT B)', '(NOT A) AND (NOT B)', 'A AND B', 'A OR B'],
      answer: '(NOT A) AND (NOT B)',
      hints: ['The negation of a disjunction is a conjunction of negations.'],
    },
  ],
}
