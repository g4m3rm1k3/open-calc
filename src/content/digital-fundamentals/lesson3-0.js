export default {
  id: 'df-3-0-and-or-not-gates',
  slug: 'and-or-not-gates',
  chapter: 'df.3',
  order: 0,
  title: 'AND, OR, NOT: The Three Primitive Gates',
  subtitle: 'The minimal set of operations that can express any Boolean function.',
  tags: [
    'digital', 'logic-gates', 'AND', 'OR', 'NOT', 'boolean-algebra',
    'truth-table', '74xx', 'TTL', 'CMOS', 'timing-diagram', 'DIP',
    'propagation-delay', 'fan-out', 'SOP',
  ],
  hook: {
    question: 'If you had to build a computer from scratch using only three rules, what three rules would be enough to compute anything?',
    realWorldContext: 'AND, OR, and NOT are the primitive operations that underpin every chip ever made. A CPU with billions of transistors is ultimately a hierarchy of these three rules, repeated at enormous scale.',
  },
  intuition: {
    prose: [
      'AND outputs 1 only when all its inputs are 1 — "all conditions met".',
      'OR outputs 1 when any input is 1 — "any condition met".',
      'NOT flips a single bit — the only 1-input primitive.',
      'Together these three are functionally complete: any Boolean function can be expressed using only AND, OR, and NOT.',
      'Real-world 74xx ICs (7408, 7432, 7404) put four or six of these gates in a single 14-pin DIP package.',
    ],
    callouts: [
      { type: 'tip', title: 'Mnemonics', body: 'AND: "all agree". OR: "any wins". NOT: "flip it". Write the mnemonic next to the gate symbol until it becomes automatic.' },
      { type: 'important', title: 'Functional completeness', body: '{AND, OR, NOT} is a complete basis — every logic function, however complex, is a combination of these three operations. NAND alone (or NOR alone) is also complete, but AND+OR+NOT is the classical foundation.' },
    ],
    visualizations: [{ id: 'DF_L3_1_ANDORNOTGates', title: 'AND, OR, NOT Gates' }],
  },
  math: { prose: [], callouts: [], visualizations: [] },
  rigor: { prose: [], callouts: [], visualizations: [] },
  examples: [],
  challenges: [],
  mentalModel: [
    'AND = intersection (set theory). OR = union. NOT = complement.',
    'A truth table is the complete definition of a gate. Two inputs → 4 rows; three inputs → 8 rows (2^n).',
    'Any combinational circuit = tree of AND/OR/NOT. Trace inputs through the tree to compute outputs.',
    'Propagation delay accumulates along the longest gate chain — that chain sets the maximum clock speed.',
  ],
  checkpoints: ['read-intuition'],
  quiz: [],
};
