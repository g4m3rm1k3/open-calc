export default {
  id: 'discrete-1-01a',
  slug: 'predicate-logic-and-quantifiers',
  chapter: 'discrete-1',
  order: 2,
  title: 'Predicate Logic and Quantifiers',
  subtitle: 'From proposition-level truth to variable-based formal statements',
  tags: ['predicate logic', 'quantifiers', 'forall', 'exists', 'nested quantifiers'],
  aliases: 'first order logic quantified statements quantifier negation domain of discourse',

  hook: {
    question:
      'Why do statements that look similar in English become radically different in mathematics once quantifier order changes?',
    realWorldContext:
      'Predicate logic is used in theorem proving, database query semantics, API contracts, and formal verification. It is the language for precise claims about entire classes of objects.',
    previewVisualizationId: 'TruthTableLab',
  },

  intuition: {
    prose: [
      'Propositional logic treats whole statements as atomic units. Predicate logic opens those statements and exposes variable-level structure.',
      'A predicate P(x) is a statement template that becomes true or false only after choosing a value for x in some domain.',
      'Universal quantifier means every element in the domain must satisfy the claim. Existential quantifier means at least one element does.',
      'Quantifier order matters: forall x exists y P(x,y) usually means something different from exists y forall x P(x,y).',
      'For beginners, always read quantified statements slowly in plain language before symbol manipulation.',
      'Negating quantified statements is a core survival skill in proofs. Negation flips quantifiers and negates predicate content.',
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'Quantifier Negation',
        body: 'NOT(forall x P(x)) <=> exists x NOT P(x), and NOT(exists x P(x)) <=> forall x NOT P(x).',
      },
      {
        type: 'insight',
        title: 'Domain Awareness',
        body: 'Truth of quantified statements depends on the chosen domain. Same predicate, different domain, different truth value.',
      },
    ],
  },

  math: {
    prose: [
      'Bound vs free variables: quantifiers bind variables, while free variables indicate open statements not yet truth-evaluable.',
      'Nested quantifiers are interpreted left-to-right. Each quantifier sets context for those after it.',
      'Many theorem statements in analysis, algebra, and CS are quantifier stacks; reading them correctly is half the battle.',
    ],
  },

  rigor: {
    prose: [
      'To prove a universal statement, start with an arbitrary element and prove predicate truth without extra assumptions.',
      'To prove an existential statement, construct a witness explicitly and verify it satisfies the predicate.',
      'To disprove a universal statement, one counterexample is enough.',
      'To disprove an existential statement, prove universal negation.',
    ],
  },

  examples: [
    {
      id: 'discrete-1-01a-ex1',
      title: 'Quantifier Order Contrast',
      problem: 'Compare forall x in R exists y in R (x+y=0) with exists y in R forall x in R (x+y=0).',
      steps: [
        { expression: 'forall x exists y (x+y=0)', annotation: 'True: choose y=-x for each x.' },
        { expression: 'exists y forall x (x+y=0)', annotation: 'False: one fixed y cannot cancel all x.' },
      ],
      conclusion: 'Swapping quantifiers changed the statement completely.',
    },
    {
      id: 'discrete-1-01a-ex2',
      title: 'Negating a Quantified Claim',
      problem: 'Negate: forall n in Z exists m in Z such that m>n.',
      steps: [
        { expression: 'NOT(forall n exists m (m>n))', annotation: 'Start with outer negation.' },
        { expression: 'exists n forall m NOT(m>n)', annotation: 'Flip quantifiers and negate predicate.' },
        { expression: 'exists n forall m (m<=n)', annotation: 'Predicate simplification.' },
      ],
      conclusion: 'The negation says there is a greatest integer, which is false.',
    },
  ],

  challenges: [
    {
      id: 'discrete-1-01a-ch1',
      difficulty: 'easy',
      problem: 'Translate into symbols: Every student has at least one course.',
      walkthrough: [
        { expression: '"Every student" -> \forall s\in Students', annotation: 'Universal quantifier for the word every.' },
        { expression: '"has at least one course" -> \exists c\in Courses\,Enrolled(s,c)', annotation: 'Existential quantifier for at least one.' },
      ],
      answer: 'forall s in Students exists c in Courses Enrolled(s,c).',
    },
    {
      id: 'discrete-1-01a-ch2',
      difficulty: 'medium',
      problem: 'Negate: exists x forall y P(x,y).',
      walkthrough: [
        { expression: '\neg(\exists x\,\forall y\,P(x,y))', annotation: 'Begin with one outer negation.' },
        { expression: '\forall x\,\exists y\,\neg P(x,y)', annotation: 'Flip each quantifier and negate predicate.' },
      ],
      answer: 'forall x exists y NOT P(x,y).',
    },
  ],

  crossRefs: [
    { lessonSlug: 'propositions-and-proof-techniques', label: 'Propositions and Proof Techniques', context: 'Predicate logic extends propositional operators with variable binding.' },
    { lessonSlug: 'relations-and-structures', label: 'Relations and Structures', context: 'Relation properties are naturally expressed with quantified formulas.' },
    { lessonSlug: 'epsilon-delta', label: 'Epsilon-Delta', context: 'Formal epsilon-delta definitions are nested quantifier statements.' },
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
