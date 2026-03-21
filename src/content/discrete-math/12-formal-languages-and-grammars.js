export default {
  id: 'discrete-1-12',
  slug: 'formal-languages-and-grammars',
  chapter: 'discrete-1',
  order: 14,
  title: 'Formal Languages and Grammars',
  subtitle: 'From rules that generate strings to parsing and language classes',
  tags: ['formal language', 'grammar', 'cfg', 'parse tree', 'compiler theory'],
  aliases: 'context free grammar parse tree language classes chomsky hierarchy intro',

  hook: {
    question:
      'How can a finite set of production rules generate infinitely many valid programs or expressions?',
    realWorldContext:
      'Programming language parsers, query engines, and protocol validators all rely on grammar-based language definitions. Formal language theory gives precision to syntax design.',
    previewVisualizationId: 'GraphNetwork3D',
  },

  intuition: {
    prose: [
      'A formal language is a set of strings over an alphabet. A grammar is a generative mechanism that defines which strings belong.',
      'Context-free grammars (CFGs) are powerful enough for most programming-language syntax while still supporting algorithmic parsing.',
      'Parse trees expose hierarchical structure and resolve ambiguity questions about expression grouping and precedence.',
      'For beginners, separate syntax from meaning: grammars define legal shape, not semantic correctness.',
      'Language classes (regular, context-free, etc.) are about expressive power and algorithmic recognizability tradeoffs.',
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'Regular vs Context-Free',
        body: 'Every regular language is context-free, but not every context-free language is regular.',
      },
    ],
  },

  math: {
    prose: [
      'A CFG is a tuple (V, Sigma, R, S) with variables V, terminals Sigma, productions R, and start variable S.',
      'Derivations can be leftmost or rightmost; parse trees abstract away specific derivation order for structure.',
      'Ambiguity means one string has more than one parse tree. Unambiguous grammar design is central for deterministic parsing.',
    ],
  },

  rigor: {
    prose: [
      'To prove a grammar generates a target language, prove soundness (generated strings are valid) and completeness (all valid strings can be generated).',
      'Induction on derivation length or parse-tree height is the standard formal proof technique in this domain.',
    ],
  },

  examples: [
    {
      id: 'discrete-1-12-ex1',
      title: 'Balanced Parentheses Grammar',
      problem: 'Give CFG for balanced parentheses.',
      steps: [
        { expression: 'S -> SS | (S) | epsilon', annotation: 'Classic recursive decomposition.' },
        { expression: 'Check small strings: epsilon, (), ()(), (())', annotation: 'Validate intended generation.' },
      ],
      conclusion: 'This grammar captures all and only balanced-parentheses strings.',
    },
    {
      id: 'discrete-1-12-ex2',
      title: 'Ambiguity Warning',
      problem: 'Why is E -> E+E | E*E | id ambiguous?',
      steps: [
        { expression: 'String id+id*id has multiple parse trees', annotation: 'Operator precedence not encoded.' },
        { expression: 'Refactor grammar with precedence levels', annotation: 'Separate terms and factors.' },
      ],
      conclusion: 'Grammar structure must encode precedence and associativity constraints.',
    },
  ],

  challenges: [
    {
      id: 'discrete-1-12-ch1',
      difficulty: 'easy',
      problem: 'Give a grammar for strings over {a,b} with exactly one b.',
      answer: 'S -> A b A and A -> aA | epsilon.',
    },
    {
      id: 'discrete-1-12-ch2',
      difficulty: 'medium',
      problem: 'Show language {a^n b^n : n>=0} is not regular but is context-free.',
      answer: 'Use pumping lemma for non-regularity and CFG S->aSb|epsilon for context-free generation.',
    },
  ],

  crossRefs: [
    { lessonSlug: 'automata-theory', label: 'Automata Theory', context: 'Automata and grammars are dual perspectives on language classes.' },
    { lessonSlug: 'trees-and-hierarchies', label: 'Trees and Hierarchies', context: 'Parse trees are rooted trees encoding derivation structure.' },
    { lessonSlug: 'algorithms-and-complexity', label: 'Algorithms and Complexity', context: 'Parsing complexity depends on grammar class and algorithm choice.' },
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
