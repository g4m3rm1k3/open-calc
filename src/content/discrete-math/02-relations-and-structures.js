export default {
  id: 'discrete-1-02',
  slug: 'relations-and-structures',
  chapter: 'discrete-1',
  order: 4,
  title: 'Relations, Equivalence, and Order',
  subtitle: 'How discrete math organizes objects before counting or proving anything deep',
  tags: ['sets', 'relations', 'equivalence relation', 'partial order', 'functions', 'poset'],
  aliases: 'relation matrix reflexive symmetric transitive antisymmetric equivalence class poset',

  hook: {
    question:
      'Before proving theorems or designing algorithms, how do we describe what objects are connected, comparable, or interchangeable?',
    realWorldContext:
      'Database joins, type systems, compiler dependency graphs, and access-control hierarchies all rely on relation structure. Equivalence classes define when two objects should be treated as the same. Partial orders define legal dependency and scheduling constraints.',
    previewVisualizationId: 'RelationMatrixLab',
  },

  intuition: {
    prose: [
      'A set gives us objects. A relation gives us a rule for how pairs of objects are connected. Formally, a relation R on a set A is any subset of A x A.',
      'Think of a relation as a yes/no table for ordered pairs. If (a,b) is in R, then a is related to b. If it is not, then the relation says no.',
      'This table perspective is not optional for beginners. It is the fastest way to avoid confusion about direction. In general, aRb does not imply bRa unless symmetry is proved.',
      'Three properties appear everywhere: reflexive (everything relates to itself), symmetric (relation works both directions), and transitive (chains collapse).',
      'When reflexive + symmetric + transitive all hold, we get an equivalence relation. Equivalence relations partition a set into non-overlapping classes.',
      'When reflexive + antisymmetric + transitive hold, we get a partial order. Partial orders model prerequisites and dependencies where some items are incomparable.',
      'This lesson is a gateway topic. Without it, later topics like graph traversal, recurrence dependencies, and algorithm correctness feel disconnected.',
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'Relation as Subset',
        body: 'R is a relation on A iff R \subseteq A\\times A.',
      },
      {
        type: 'theorem',
        title: 'Equivalence Relation Criteria',
        body: 'R is an equivalence relation iff R is reflexive, symmetric, and transitive.',
      },
      {
        type: 'theorem',
        title: 'Partial Order Criteria',
        body: 'R is a partial order iff R is reflexive, antisymmetric, and transitive.',
      },
    ],
    visualizations: [
      {
        id: 'RelationMatrixLab',
        title: 'Relation Matrix Lab',
        caption: 'Toggle pair-membership and watch structure labels update in real time.',
      },
    ],
  },

  math: {
    prose: [
      'Equivalence classes induced by relation R are sets [a]={x in A : xRa}. The set of all classes is a partition of A.',
      'A partition can be viewed backward as an equivalence relation: xRy iff x and y are in the same block. This two-way correspondence is foundational.',
      'Functions are special relations where each input has exactly one output. So function language is not separate from relation language; it is a constrained case.',
      'In partial orders, minimal and maximal elements need not be unique, and least/greatest elements might not exist. This distinction matters in algorithm design.',
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'Partition-Equivalence Correspondence',
        body: 'Every equivalence relation induces a partition, and every partition induces an equivalence relation.',
      },
      {
        type: 'theorem',
        title: 'Function as Relation',
        body: 'f: A\\to B is a relation f\\subseteq A\\times B such that each a\\in A appears in exactly one pair (a,b).',
      },
    ],
  },

  rigor: {
    prose: [
      'To prove transitivity, start with arbitrary a,b,c and assume aRb and bRc. Then derive aRc directly from the relation definition.',
      'To disprove a property, one counterexample pair is enough. For example, if aRb but not bRa, symmetry fails immediately.',
      'For equivalence classes, prove two things: classes are disjoint or identical, and the union of classes is all of A. That is what makes a partition.',
      'For partial orders, always check antisymmetry carefully. Beginners often confuse it with asymmetry; they are different statements.',
    ],
  },

  examples: [
    {
      id: 'discrete-1-02-ex1',
      title: 'Congruence Mod 3 is an Equivalence Relation',
      problem: 'On integers, define aRb iff a mod 3 = b mod 3. Prove R is an equivalence relation.',
      steps: [
        { expression: 'Reflexive: a mod 3 = a mod 3', annotation: 'Always true.' },
        { expression: 'Symmetric: if a mod 3 = b mod 3 then b mod 3 = a mod 3', annotation: 'Equality is symmetric.' },
        { expression: 'Transitive: if a mod 3 = b mod 3 and b mod 3 = c mod 3 then a mod 3 = c mod 3', annotation: 'Equality is transitive.' },
      ],
      conclusion: 'Therefore congruence modulo 3 is an equivalence relation with three classes.',
    },
    {
      id: 'discrete-1-02-ex2',
      title: 'Divisibility is a Partial Order on Positive Integers',
      problem: 'On positive integers, define aRb iff a divides b. Show this is a partial order.',
      steps: [
        { expression: 'Reflexive: a divides a', annotation: 'Because a = a*1.' },
        { expression: 'Antisymmetric: a|b and b|a => a=b', annotation: 'For positive integers this forces equality.' },
        { expression: 'Transitive: a|b and b|c => a|c', annotation: 'Compose divisibility factors.' },
      ],
      conclusion: 'Divisibility defines a partial order; some elements are incomparable (for example 2 and 3).',
    },
  ],

  challenges: [
    {
      id: 'discrete-1-02-ch1',
      difficulty: 'easy',
      problem: 'On real numbers define aRb iff a-b is rational. Is R an equivalence relation?',
      hint: 'Use closure of rationals under subtraction.',
      walkthrough: [
        { expression: 'Reflexive: a-a=0\in\mathbb{Q}', annotation: 'Every element is related to itself.' },
        { expression: 'Symmetric: a-b\in\mathbb{Q} => b-a=-(a-b)\in\mathbb{Q}', annotation: 'Rationals are closed under negation.' },
        { expression: 'Transitive: (a-b),(b-c)\in\mathbb{Q} => a-c=(a-b)+(b-c)\in\mathbb{Q}', annotation: 'Rationals are closed under addition.' },
      ],
      answer: 'Yes, it is reflexive, symmetric, and transitive.',
    },
    {
      id: 'discrete-1-02-ch2',
      difficulty: 'medium',
      problem: 'Give a relation on {1,2,3} that is reflexive and symmetric but not transitive.',
      hint: 'Try including (1,2) and (2,3) but excluding (1,3).',
      walkthrough: [
        { expression: 'Include all (i,i)', annotation: 'Needed for reflexive property.' },
        { expression: 'Include (1,2),(2,1),(2,3),(3,2)', annotation: 'Keeps symmetry.' },
        { expression: '(1,2) and (2,3) are in R but (1,3) is not', annotation: 'Transitivity fails by explicit counterexample.' },
      ],
      answer: 'Example: {(1,1),(2,2),(3,3),(1,2),(2,1),(2,3),(3,2)}.',
    },
  ],

  crossRefs: [
    { lessonSlug: 'sets-and-functions-for-discrete', label: 'Sets and Functions for Discrete', context: 'Relations are subsets of Cartesian products and functions are special relations.' },
    { lessonSlug: 'predicate-logic-and-quantifiers', label: 'Predicate Logic and Quantifiers', context: 'Reflexive/symmetric/transitive properties are quantified statements.' },
    { lessonSlug: 'graph-theory', label: 'Graph Theory', context: 'Directed graphs visualize binary relations as adjacency structure.' },
    { lessonSlug: 'propositions-and-proof-techniques', label: 'Proof Techniques', context: 'Property proofs for relations use direct proof, contradiction, and quantifier control.' },
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
