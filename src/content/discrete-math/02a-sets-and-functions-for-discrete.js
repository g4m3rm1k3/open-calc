export default {
  id: 'discrete-1-02a',
  slug: 'sets-and-functions-for-discrete',
  chapter: 'discrete-1',
  order: 3,
  title: 'Sets and Functions for Discrete Math',
  subtitle: 'The language layer that makes counting, relations, and probability precise',
  tags: ['sets', 'subsets', 'power set', 'cartesian product', 'functions', 'injective', 'surjective', 'bijective'],
  aliases: 'set operations cartesian product function mapping injective surjective bijective',

  hook: {
    question:
      'Before doing proofs, counting, or probability, what vocabulary lets us even state problems unambiguously?',
    realWorldContext:
      'Sets and functions are the grammar of modern math and CS. Databases, APIs, data pipelines, and algorithm specifications all depend on these abstractions.',
    previewVisualizationId: 'FunctionMachine',
  },

  intuition: {
    prose: [
      'A set is a collection of distinct objects. This sounds simple, but the set viewpoint lets us represent domains, solution spaces, and event spaces cleanly.',
      'Subset language formalizes containment. Power sets describe the space of all possible selections, which is central to combinatorics and state-space reasoning.',
      'Cartesian products build ordered pairs and tuples. Relations and functions live inside these products.',
      'A function maps each input to exactly one output. This is a consistency rule, not a formula requirement.',
      'Injective, surjective, and bijective classifications describe information behavior: collisions, coverage, and invertibility.',
      'For beginners, draw arrow diagrams and small tables first. Symbolic shorthand should summarize understanding, not replace it.',
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'Power Set Size',
        body: 'If |A|=n for finite set A, then |P(A)|=2^n.',
      },
      {
        type: 'theorem',
        title: 'Bijection Principle',
        body: 'Two finite sets have equal size iff there exists a bijection between them.',
      },
    ],
    visualizations: [
      {
        id: 'FunctionMachine',
        title: 'Function Machine',
        caption: 'Map inputs to outputs and test what function constraints mean operationally.',
      },
    ],
  },

  math: {
    prose: [
      'Set identities (union, intersection, complement) form algebraic tools used in probability and logic simplifications.',
      'Function composition is associative and creates chains of transformations used in algorithm pipelines.',
      'Inverse functions exist exactly for bijections on finite sets.',
      'Cardinality arguments often use explicit bijections to count indirectly.',
    ],
  },

  rigor: {
    prose: [
      'To prove set equality A=B, prove both A subset B and B subset A.',
      'To prove injective, assume f(x1)=f(x2) and derive x1=x2.',
      'To prove surjective, start with arbitrary target y in codomain and produce x with f(x)=y.',
    ],
  },

  examples: [
    {
      id: 'discrete-1-02a-ex1',
      title: 'Power Set Count',
      problem: 'How many subsets does A={1,2,3,4} have?',
      steps: [
        { expression: '|A|=4', annotation: 'Set size.' },
        { expression: '|P(A)|=2^4', annotation: 'Power set theorem.' },
      ],
      conclusion: 'There are 16 subsets.',
    },
    {
      id: 'discrete-1-02a-ex2',
      title: 'Function Classification',
      problem: 'For f:{1,2,3}->{a,b,c} with f(1)=a, f(2)=b, f(3)=c, classify f.',
      steps: [
        { expression: 'Distinct inputs map to distinct outputs', annotation: 'Injective.' },
        { expression: 'Every codomain element is hit', annotation: 'Surjective.' },
      ],
      conclusion: 'f is bijective, so inverse exists.',
    },
  ],

  challenges: [
    {
      id: 'discrete-1-02a-ch1',
      difficulty: 'easy',
      problem: 'Is f(n)=n^2 from integers to integers injective?',
      walkthrough: [
        { expression: 'Injective means: f(x_1)=f(x_2) => x_1=x_2', annotation: 'Write the definition first.' },
        { expression: 'f(1)=1, f(-1)=1', annotation: 'Find two distinct inputs with equal output.' },
      ],
      answer: 'No, because f(1)=f(-1).',
    },
    {
      id: 'discrete-1-02a-ch2',
      difficulty: 'medium',
      problem: 'Prove A intersection (B union C) = (A intersection B) union (A intersection C).',
      hint: 'Use double inclusion.',
      walkthrough: [
        { expression: 'x\in A\cap(B\cup C) => x\in A and (x\in B or x\in C)', annotation: 'Unpack left side definition.' },
        { expression: '=> (x\in A\cap B) or (x\in A\cap C)', annotation: 'Distribute conjunction over disjunction.' },
        { expression: '=> x\in (A\cap B)\cup(A\cap C)', annotation: 'Pack right side definition; reverse direction similarly.' },
      ],
      answer: 'True by element-wise logic and double-inclusion proof.',
    },
  ],

  crossRefs: [
    { lessonSlug: 'sets-and-logic', label: 'Sets and Logic (Precalculus)', context: 'This discrete lesson builds directly on the prerequisite set notation primer.' },
    { lessonSlug: 'relations-and-structures', label: 'Relations and Structures', context: 'Relations are subsets of Cartesian products.' },
    { lessonSlug: 'counting-and-combinatorics', label: 'Counting and Combinatorics', context: 'Bijections and subset counting are central combinatorial tools.' },
    { lessonSlug: 'discrete-probability', label: 'Discrete Probability', context: 'Events are subsets of a sample space.' },
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
