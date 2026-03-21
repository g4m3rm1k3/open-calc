export default {
  id: 'discrete-1-01',
  slug: 'propositions-and-proof-techniques',
  chapter: 'discrete-1',
  order: 1,
  title: 'Propositions and Proof Techniques',
  subtitle: 'Truth tables, logical equivalence, and the architecture of rigorous arguments',
  tags: ['propositions', 'logic', 'proof', 'contrapositive', 'contradiction', 'direct proof', 'quantifiers'],
  aliases: 'discrete logic proofs truth table contrapositive contradiction quantifiers',

  hook: {
    question:
      'When Euclid wrote proofs around 300 BCE, he did not rely on calculators. He relied on logical structure. What are the minimal logical rules needed to guarantee a conclusion is true?',
    realWorldContext:
      'Formal logic is the basis of theorem proving, circuit design, program verification, and database query semantics. Any time you trust an automated checker, SAT solver, or type system, you are trusting propositions and proof rules.',
    previewVisualizationId: 'TruthTableLab',
  },

  intuition: {
    prose: [
      'A proposition is a statement that is either true or false. The sentence itself may be complicated, but its truth value is binary.',
      'Compound statements are built with connectives: NOT, AND, OR, implication, and biconditional. A truth table is the full behavior specification of such a statement.',
      'Most proof errors come from implication confusion: proving P => Q does not prove Q => P. The contrapositive, however, is equivalent to the original implication.',
      'Historically, mathematicians moved from rhetorical proofs to symbolic logic because symbols expose structure and eliminate ambiguity.',
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'Implication Equivalence',
        body: 'P \\Rightarrow Q \\equiv \\neg P \\vee Q, \\quad P \\Rightarrow Q \\equiv \\neg Q \\Rightarrow \\neg P',
      },
      {
        type: 'insight',
        title: 'Proof Strategy Selection',
        body: 'Direct proof is ideal when assumptions algebraically lead to the target. Contradiction is useful when the negation of the target creates structural impossibility.',
      },
    ],
    visualizations: [
      {
        id: 'DiscreteDependencyMap',
        title: 'Discrete Toolchain Map',
        caption: 'See how logic and proof ideas unlock later topics; revisit this map as you progress.',
      },
      {
        id: 'TruthTableLab',
        title: 'Truth Table Studio',
        caption: 'Toggle formulas and watch equivalent statements match row-by-row.',
      },
    ],
  },

  math: {
    prose: [
      'Quantified statements extend propositional logic: universal (for all) and existential (there exists). Negation flips quantifiers and negates the predicate.',
      'Logical equivalence lets us transform statements while preserving truth values. This is the algebra of logic.',
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'Quantifier Negation Rules',
        body: '\\neg(\\forall x\\, P(x)) \\equiv \\exists x\\, \\neg P(x), \\quad \\neg(\\exists x\\, P(x)) \\equiv \\forall x\\, \\neg P(x)',
      },
      {
        type: 'theorem',
        title: 'De Morgan Laws',
        body: '\\neg(P\\wedge Q)\\equiv(\\neg P)\\vee(\\neg Q), \\quad \\neg(P\\vee Q)\\equiv(\\neg P)\\wedge(\\neg Q)',
      },
    ],
  },

  rigor: {
    prose: [
      'To prove implication equivalence rigorously, compare full truth tables for P => Q and ~Q => ~P; their columns match exactly.',
      'For contradiction proofs, formal structure is: assume premises and negation of target, derive impossibility, conclude target.',
    ],
    callouts: [
      {
        type: 'proof',
        title: 'Contrapositive Equivalence Skeleton',
        body: 'Construct truth tables for P \\Rightarrow Q and \\neg Q \\Rightarrow \\neg P. Each of the four rows has identical truth values, so the statements are logically equivalent.',
      },
    ],
  },

  examples: [
    {
      id: 'discrete-1-01-ex1',
      title: 'Negating an Epsilon Statement',
      problem: 'Negate: \\forall \\varepsilon>0,\\exists \\delta>0,\\forall x, P(\\varepsilon,\\delta,x).',
      steps: [
        { expression: '\\neg(\\forall \\varepsilon>0,\\exists \\delta>0,\\forall x, P)', annotation: 'Start by placing one outer negation.' },
        { expression: '\\exists \\varepsilon>0,\\forall \\delta>0,\\exists x, \\neg P', annotation: 'Flip each quantifier in order and negate predicate.' },
      ],
      conclusion: 'Quantifier order matters; the negation is not obtained by only negating P.',
    },
    {
      id: 'discrete-1-01-ex2',
      title: 'Direct Proof Pattern',
      problem: 'Prove: if n is even then n^2 is even.',
      steps: [
        { expression: 'n=2k', annotation: 'By definition of even integer.' },
        { expression: 'n^2=(2k)^2=4k^2=2(2k^2)', annotation: 'Factor out 2.' },
      ],
      conclusion: 'n^2 is even by definition.',
    },
  ],

  challenges: [
    {
      id: 'discrete-1-01-ch1',
      difficulty: 'easy',
      problem: 'Prove or disprove: (P => Q) and (Q => P) imply P <=> Q.',
      hint: 'Use biconditional definition.',
      walkthrough: [
        { expression: 'P <=> Q \equiv (P=>Q) \wedge (Q=>P)', annotation: 'Start from the formal definition of biconditional.' },
        { expression: '(P=>Q) \wedge (Q=>P)', annotation: 'This exact conjunction is given in the hypothesis.' },
      ],
      answer: 'True; biconditional is exactly conjunction of both implications.',
    },
    {
      id: 'discrete-1-01-ch2',
      difficulty: 'medium',
      problem: 'Negate: For every graph G, there exists a vertex v of even degree.',
      hint: 'Flip quantifiers and negate predicate.',
      walkthrough: [
        { expression: '\neg(\forall G\,\exists v\,EvenDegree(v))', annotation: 'Wrap the whole statement in one negation first.' },
        { expression: '\exists G\,\forall v\,\neg EvenDegree(v)', annotation: 'Flip quantifiers in order and negate predicate.' },
        { expression: '\exists G\,\forall v\,OddDegree(v)', annotation: 'For integer degree parity, not-even means odd.' },
      ],
      answer: 'There exists a graph G such that every vertex v has odd degree.',
    },
  ],

  crossRefs: [
    { lessonSlug: 'pigeonhole-principle', label: 'Pigeonhole Principle', context: 'Uses contradiction and counting logic.' },
    { lessonSlug: 'induction-and-recursion', label: 'Induction and Recursion', context: 'Proof by induction builds directly on implication structure.' },
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
