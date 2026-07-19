import logicGatesUrl from '../diagrams/dm-logic-gates.svg?url'
import karnaughMapUrl from '../diagrams/dm-karnaugh-map.svg?url'

export default {
  id: 'discrete-1-10',
  slug: 'boolean-algebra-and-circuits',
  chapter: 'discrete-6',
  order: 0,
  title: 'Boolean Algebra and Circuits',
  subtitle: 'Logic identities as an algebra and their hardware realization',
  tags: ['boolean algebra', 'logic circuits', 'cnf', 'dnf', 'karnaugh map'],
  aliases: 'and or not gates cnf dnf boolean identities digital logic',

  hook: {
    question:
      'How do symbolic logic statements become actual hardware gates that compute?',
    realWorldContext:
      'Boolean algebra underlies CPU logic units, digital circuit minimization, hardware verification, and SAT-based software tooling.',
  },

  intuition: {
    prose: [
      `![Standard schematic symbols for AND, OR, NOT, NAND, and XOR gates](${logicGatesUrl})`,

      'Boolean algebra treats True/False (or 1/0) as algebraic objects with their own operations — AND, OR, and NOT — that obey precise laws, the same way ordinary algebra has + and × obeying commutativity, associativity, and distributivity. This is literally the propositional logic from the very first lesson of this course, renamed and given an algebraic treatment: ∧ becomes ·, ∨ becomes +, ¬ becomes overline or prime.',

      'Every propositional formula has equivalent normal-form representations — **CNF** (conjunctive normal form: an AND of ORs, like (A∨B)·(¬A∨C)) and **DNF** (disjunctive normal form: an OR of ANDs, like A·B + ¬A·C). Any Boolean function, no matter how it was originally written, can be mechanically rewritten into either form — which matters because SAT solvers and hardware verification tools are typically built to consume one specific normal form.',

      'Circuit design is Boolean logic made physical: each gate symbol above is a hardware component implementing exactly one Boolean operation, and algebraic simplification (via the identities below, or visually via a Karnaugh map) reduces gate count, chip area, and signal latency in the physical circuit that results — this is not an abstract exercise, it is literally how CPUs get faster and cheaper.',

      'For beginners, always validate a proposed identity with a truth table first — check all 2ⁿ rows — before trying to manipulate it symbolically. Once you trust the identity is true, the symbolic transformation rules (De Morgan, absorption, distributivity) let you simplify expressions far faster than re-deriving a truth table every time.',

      `![Karnaugh map showing P·Q + P·¬Q simplifying to just P](${karnaughMapUrl})`,

      'A **Karnaugh map** is a grid laid out so that any two horizontally- or vertically-adjacent cells differ in exactly one input variable — which means a rectangular block of 1s that spans two or more cells reveals a variable that "doesn\'t matter" across that block, and can be dropped. In the diagram, both cells in the P=1 row are 1 regardless of Q\'s value, so the whole row collapses from "P·Q + P·¬Q" down to simply "P" — the same simplification the absorption law gives algebraically, but found by pattern-matching on a grid instead of applying a named law.',
    ],
    checks: [
      {
        afterParagraph: 4,
        question: 'In a Karnaugh map, why does a block of adjacent 1s spanning 2 cells let you drop a variable?',
        options: [
          'It doesn\'t — you must always keep every variable',
          'Adjacent cells differ in exactly one variable, so if both are 1 regardless of that variable\'s value, the variable "doesn\'t matter" and can be dropped',
          'Because Karnaugh maps only work for 2 variables',
          'Because the map is drawn in a circle',
        ],
        answer: 'Adjacent cells differ in exactly one variable, so if both are 1 regardless of that variable\'s value, the variable "doesn\'t matter" and can be dropped',
        explanation: 'The grid is laid out specifically so adjacency = "differs in one variable." A 1-block spanning both values of a variable means that variable is irrelevant to the output.',
      },
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
        id: 'GateCircuitBuilder',
        title: 'Gate Circuit Builder',
        caption: 'Pick a gate and watch its truth table live, then switch to NAND-only mode to rebuild NOT, AND, and OR from NAND alone.',
      },
    ],
  },

  math: {
    prose: [
      'The core identities are the same shape as ordinary algebra\'s, with AND playing the role of multiplication and OR playing the role of addition: **idempotent** (A·A = A, A+A = A — Boolean values don\'t "accumulate" the way numbers do), **commutative** and **associative** (order and grouping don\'t matter), **distributive** (A·(B+C) = A·B + A·C, exactly like ordinary distribution), **absorption** (A + A·B = A, the Karnaugh-map simplification above), and **De Morgan\'s laws** (¬(A·B) = ¬A+¬B and ¬(A+B) = ¬A·¬B, from the propositions lesson, now written algebraically).',

      '**Functional completeness** means a set of gates can express *every* possible Boolean function using only gates from that set. Remarkably, NAND *alone* is functionally complete — the challenge below constructs NOT and AND purely from NAND gates, and once you have NOT and AND, De Morgan\'s law gives you OR for free, and having {NOT, AND, OR} is enough to build any truth table whatsoever. NOR is separately, independently also functionally complete on its own. This is why real chips are often built almost entirely out of just one gate type — manufacturing one uniform component repeatedly is cheaper than manufacturing several different ones.',

      'CNF is the form SAT solvers and formal verification tools are built around (checking "is there some assignment that makes every AND-ed clause true" is the canonical SAT problem), while DNF is often more intuitive for direct constructive reasoning ("the function is true exactly when one of these explicit combinations holds").',
    ],
    checks: [
      {
        afterParagraph: 1,
        question: 'Why is it economically significant that NAND alone is functionally complete?',
        options: [
          'It isn\'t significant — NAND is just one of many equally-used gate types',
          'Chips can be built almost entirely from one uniform gate type, which is cheaper to manufacture repeatedly than several different types',
          'NAND gates run faster than AND or OR gates',
          'Functional completeness only matters for software, not hardware',
        ],
        answer: 'Chips can be built almost entirely from one uniform gate type, which is cheaper to manufacture repeatedly than several different types',
        explanation: 'Since NOT, AND, and (via De Morgan) OR can all be built from NAND alone, a fab can mass-produce one gate type instead of several — a real manufacturing cost savings.',
      },
    ],
  },

  rigor: {
    prose: [
      'A symbolic simplification step is valid only if the rewrite rule applied is itself a genuine logical equivalence — provable, in principle, by checking that both sides\' truth tables match on every row. Chaining several valid rewrite steps together produces a valid overall simplification, by transitivity of logical equivalence.',

      'To prove two circuits compute the same function, either prove their corresponding Boolean formulas are logically equivalent via the algebraic identities (fast, but requires spotting the right sequence of rewrites), or directly compare their full truth tables row by row (slower — 2ⁿ rows for n inputs — but mechanical and guaranteed to terminate with a definite answer either way).',
    ],
    checks: [
      {
        question: 'What makes a symbolic simplification step in Boolean algebra valid?',
        options: [
          'It looks shorter than the original',
          'The rewrite rule applied is itself a genuine logical equivalence, verifiable by matching truth tables on every row',
          'A professor approved it',
          'It uses fewer parentheses',
        ],
        answer: 'The rewrite rule applied is itself a genuine logical equivalence, verifiable by matching truth tables on every row',
        explanation: 'Validity traces back to truth-table equivalence — any rewrite rule you chain together must itself be provably true on all 2ⁿ input rows.',
      },
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
        lessonId: 'discrete-1-01',
        label: 'Propositions and Proof Techniques',
        note: 'Boolean algebra is the formal symbolic system for the propositional logic we studied at the beginning.',
      },
    ],
    futureLinks: [
      {
        lessonId: 'discrete-1-11',
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
    {
      id: 'bool-q3',
      type: 'choice',
      text: 'What does the absorption law A + (A·B) = A tell you?',
      options: [
        'A·B is always False',
        'The term A·B is redundant once A is already True',
        'A and B must be equal',
        'This law only holds for A=0',
      ],
      answer: 'The term A·B is redundant once A is already True',
      hints: ['If A is True, the whole OR expression is already True regardless of B — so A·B adds nothing.'],
    },
    {
      id: 'bool-q4',
      type: 'choice',
      text: 'CNF (conjunctive normal form) is structured as:',
      options: ['An OR of ANDs', 'An AND of ORs', 'A single NOT applied to everything', 'A truth table'],
      answer: 'An AND of ORs',
      hints: ['CNF: (A∨B)·(¬A∨C) — clauses joined by AND, each clause itself an OR. This is the form SAT solvers are built around.'],
    },
    {
      id: 'bool-q5',
      type: 'input',
      text: 'Simplify: A AND (A OR B). (Answer as a single letter.)',
      answer: 'A',
      hints: ['This is the dual form of absorption: A·(A+B) = A.'],
    },
    {
      id: 'bool-q6',
      type: 'choice',
      text: 'To prove two circuits compute the same Boolean function, which two methods are valid?',
      options: [
        'Guessing and checking one input',
        'Algebraic identity chains, OR direct row-by-row truth table comparison',
        'Only algebraic identities — truth tables can\'t prove equivalence',
        'Only truth tables — algebra can\'t prove equivalence',
      ],
      answer: 'Algebraic identity chains, OR direct row-by-row truth table comparison',
      hints: ['Algebra is faster but requires spotting the right rewrites; truth tables are slower (2ⁿ rows) but mechanical and guaranteed to terminate.'],
    },
  ],
}
