import ambiguousParseTreesUrl from '../diagrams/dm-ambiguous-parse-trees.svg?url'
import chomskyHierarchyUrl from '../diagrams/dm-chomsky-hierarchy.svg?url'

export default {
  id: 'discrete-1-12',
  slug: 'formal-languages-and-grammars',
  chapter: 'discrete-6',
  order: 2,
  title: 'Formal Languages and Grammars',
  subtitle: 'From rules that generate strings to parsing and language classes',
  tags: ['formal language', 'grammar', 'cfg', 'parse tree', 'compiler theory'],
  aliases: 'context free grammar parse tree language classes chomsky hierarchy intro',

  hook: {
    question:
      'How can a finite set of production rules generate infinitely many valid programs or expressions?',
    realWorldContext:
      'Programming language parsers, query engines, and protocol validators all rely on grammar-based language definitions. Formal language theory gives precision to syntax design.',
  },

  intuition: {
    prose: [
      'A **formal language** is simply a set of strings over some alphabet — nothing more mystical than that. A **grammar** is a generative mechanism: a small set of rewrite rules that, applied repeatedly starting from a designated start symbol, produces exactly the strings that belong to the language. A finite set of rules generating infinitely many strings is possible for the same reason a recursive function can produce infinitely many outputs from a finite definition — the rules can refer back to themselves.',

      'Context-free grammars (CFGs) are expressive enough for the vast majority of programming-language syntax, while remaining structured enough to support efficient, algorithmic parsing — this balance is exactly why virtually every programming language\'s syntax is specified as a CFG rather than a more powerful (but less efficiently parseable) grammar class.',

      `![Two different parse trees for the same string "id + id * id" under an ambiguous grammar](${ambiguousParseTreesUrl})`,

      'Parse trees expose the hierarchical structure a flat string hides, and they resolve exactly the kind of ambiguity shown above: "id + id * id" can be grouped as (id + id) × id or as id + (id × id), and these mean genuinely different things arithmetically. A grammar that allows both trees for the same string is called **ambiguous**, and it is a real defect — a compiler needs exactly one meaning per valid program, not a choice of several.',

      'For beginners, keep syntax and meaning strictly separate: a grammar defines legal *shape* only — which strings are well-formed — and says nothing about what a well-formed string *means*. "int x = "hello";" might be syntactically perfect (a well-formed assignment statement) while being semantically wrong (a type mismatch) — that\'s a separate concern, handled by later compiler stages, not the grammar.',

      `![The Chomsky hierarchy: Regular ⊂ Context-Free ⊂ Context-Sensitive ⊂ Recursively Enumerable](${chomskyHierarchyUrl})`,

      'Language classes exist on a hierarchy of expressive power, each one a strict superset of the last: every regular language is context-free, every context-free language is context-sensitive, and so on. Moving up the hierarchy buys more expressive power but costs recognizability — regular languages are recognized by the simplest possible machine (a DFA, no extra memory needed), context-free languages need a stack (a pushdown automaton), and the outer classes need progressively more powerful machines, up to a full Turing machine at the top.',
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'Regular vs Context-Free',
        body: 'Every regular language is context-free, but not every context-free language is regular.',
      },
    ],
    visualizations: [
      {
        id: 'GrammarDerivationLab',
        title: 'Grammar Derivation Lab',
        caption: 'Step through two different leftmost derivations of "id+id*id" under the same ambiguous grammar and watch each one build a different parse tree.',
      },
    ],
  },

  math: {
    prose: [
      'Formally, a CFG is a 4-tuple (V, Σ, R, S): V is the set of variables (non-terminal placeholder symbols), Σ is the alphabet of terminals (the actual symbols that appear in finished strings), R is the set of production rules (each of the form A → α, rewriting variable A into some string α of variables and terminals), and S ∈ V is the designated start variable.',

      'A **derivation** repeatedly applies production rules starting from S until only terminals remain; it can proceed leftmost-first (always rewrite the leftmost variable next) or rightmost-first, and different orders can produce the same final string via different intermediate steps. A **parse tree** abstracts away the specific order chosen and keeps only the structural result — which is exactly why two different leftmost derivations of the same string still correspond to the same parse tree, while two genuinely different parse trees (as in the ambiguous example above) reveal a real ambiguity, not just a different derivation order.',

      'Ambiguity means at least one string in the language has more than one valid parse tree. Since a parse tree is what fixes a string\'s actual meaning (grouping, precedence, scope), unambiguous grammar design is central to building a deterministic parser — a well-designed grammar typically separates precedence levels into their own layer of rules (e.g., separate "expression," "term," and "factor" non-terminals) specifically to force one grouping and eliminate the ambiguity.',
    ],
  },

  rigor: {
    prose: [
      'To prove a grammar generates exactly a target language L, prove two separate directions: **soundness** (every string the grammar can generate is actually in L — no false positives) and **completeness** (every string in L can be generated by the grammar — no false negatives, nothing missed). Both directions are needed; proving only one leaves open the possibility the grammar generates too much or too little.',

      'Induction on derivation length (or equivalently, parse-tree height) is the standard proof technique here: prove the claim for the shortest possible derivations directly, then show that if it holds for all derivations of length ≤ k, it holds for derivations of length k+1 — structural induction, applied to the derivation process itself rather than to an integer.',
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
      walkthrough: [
        { expression: 'Need any number of a before b and after b', annotation: 'That shape is a^* b a^*.' },
        { expression: 'Use S->A b A and A->aA|epsilon', annotation: 'A generates arbitrary-length a block.' },
      ],
      answer: 'S -> A b A and A -> aA | epsilon.',
    },
    {
      id: 'discrete-1-12-ch2',
      difficulty: 'medium',
      problem: 'Show language {a^n b^n : n>=0} is not regular but is context-free.',
      walkthrough: [
        { expression: 'Not regular: pumping lemma contradiction', annotation: 'Pumping breaks equal counts of a and b.' },
        { expression: 'Context-free: S->aSb|epsilon', annotation: 'Each recursive step adds one a and one b.' },
      ],
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
  semantics: {
    core: [
      { symbol: 'V', meaning: 'Variables (Non-terminals)' },
      { symbol: 'Σ', meaning: 'Terminals (Alphabet symbols)' },
      { symbol: 'P', meaning: 'Production Rules — the substitution rules (A → α)' },
      { symbol: 'S', meaning: 'Start Variable' },
      { symbol: 'L(G)', meaning: 'Language generated by Grammar G' },
      { symbol: '⇒', meaning: 'Derivation — applying a rule to transform a string' },
    ],
    rulesOfThumb: [
      'Chomsky Hierarchy: Regular ⊂ Context-Free ⊂ Context-Sensitive ⊂ Recursively Enumerable.',
      'Context-Free Grammars (CFGs) are used to define programming language syntax.',
      'Ambiguity: A grammar is ambiguous if a string has more than one leftmost derivation.',
      'Pushdown Automata (PDA) recognize Context-Free Languages.',
    ],
  },

  spiral: {
    recoveryPoints: [
      {
        lessonId: 'discrete-1-11',
        label: 'Automata Theory',
        note: 'Grammars provide the "Generative" definition of the languages that Automata "Recognize".',
      },
    ],
    futureLinks: [
      {
        lessonId: 'discrete-1-13',
        label: 'Algorithms and Complexity',
        note: 'Parsing a context-free grammar is a polynomial-time algorithm (O(n³)).',
      },
    ],
  },

  mentalModel: [
    'A grammar is a "Recipe for Sentences".',
    'Derivation is the "Building Process"; Parsing is the "Reverse Discovery".',
    'Context-Free means the rule applies regardless of what surrounds the variable.',
    'The Chomsky Hierarchy is the "Onion of Computing" — layers of increasing power.',
  ],

  assessment: {
    questions: [
      {
        id: 'lang-assess-1',
        type: 'choice',
        text: 'Which type of grammar is most commonly used to define the syntax of programming languages like C++ or Java?',
        options: ['Regular', 'Context-Free', 'Context-Sensitive', 'Unrestricted'],
        answer: 'Context-Free',
        hint: 'Most programming languages are defined by Context-Free Grammars (CFGs).',
      },
      {
        id: 'lang-assess-2',
        type: 'input',
        text: 'In the rule S → aSb | ε, what is the terminal symbol?',
        answer: 'a, b',
        hint: 'Terminals are the lowercase symbols that appear in the final string.',
      },
    ],
  },

  quiz: [
    {
      id: 'lang-q1',
      type: 'choice',
      text: 'What do we call a grammar where a single string can result in two different parse trees?',
      options: ['Recursive', 'Ambiguous', 'Deterministic', 'Infinite'],
      answer: 'Ambiguous',
      hints: ['Ambiguity is a problem for compiler design.'],
    },
    {
      id: 'lang-q2',
      type: 'choice',
      text: 'Which machine is powerful enough to recognize Context-Free Languages?',
      options: ['DFA', 'NFA', 'Pushdown Automata (PDA)', 'Turing Machine'],
      answer: 'Pushdown Automata (PDA)',
      hints: ['A PDA is an NFA with a Stack for infinite (but structured) memory.'],
    },
  ],
}
