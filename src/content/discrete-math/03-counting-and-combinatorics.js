export default {
  id: 'discrete-1-04',
  slug: 'counting-and-combinatorics',
  chapter: 'discrete-1',
  order: 6,
  title: 'Counting and Combinatorics',
  subtitle: 'From multiplication principle to combinations, binomial models, and counting proofs',
  tags: ['counting', 'combinatorics', 'permutations', 'combinations', 'binomial coefficient'],
  aliases: 'n choose k permutations combinations multiplication principle inclusion exclusion',

  hook: {
    question:
      'How many passwords, schedules, team selections, and network routes are possible before brute force becomes impossible?',
    realWorldContext:
      'Combinatorics drives cryptography keyspaces, experimental design, reliability analysis, and search complexity in AI. Counting arguments often provide impossibility proofs without constructing explicit objects.',
    previewVisualizationId: 'CountingTreeLab',
  },

  intuition: {
    prose: [
      'Counting starts with structure: independent choices multiply, disjoint cases add.',
      'For beginners, most confusion comes from trying formulas too early. First decide the story: are you filling positions, choosing groups, or arranging with restrictions?',
      'Permutations care about order; combinations ignore order. Misidentifying this is the most common error.',
      'If the same final outcome is being counted many times by your method, you must divide by the overcount factor.',
      'The binomial coefficient C(n,k) emerged in Indian, Persian, and European traditions long before modern notation.',
      'Combinatorial proofs often explain algebraic identities better than symbolic manipulations alone.',
      'Advanced computer science uses this constantly: keyspace sizes, worst-case branch counts, and state explosion all come from counting models.',
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'Multiplication Principle',
        body: 'If a process has m ways then n ways, total outcomes are mn.',
      },
      {
        type: 'theorem',
        title: 'Permutations and Combinations',
        body: 'P(n,k)=\\frac{n!}{(n-k)!}, \\quad C(n,k)=\\frac{n!}{k!(n-k)!}',
      },
    ],
    visualizations: [
      {
        id: 'CountingTreeLab',
        title: 'Counting Tree Lab',
        caption: 'Build choice trees and compare direct multiplication to explicit enumeration.',
      },
    ],
  },

  math: {
    prose: [
      'Inclusion-exclusion corrects overcounting when sets overlap.',
      'Binomial coefficients satisfy Pascal recurrence: C(n,k)=C(n-1,k-1)+C(n-1,k).',
      'Stars-and-bars converts many integer-solution questions into placement problems with separators.',
      'Generating functions package counting sequences into algebraic objects and become central in advanced combinatorics.',
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'Inclusion-Exclusion for Two Sets',
        body: '|A\\cup B|=|A|+|B|-|A\\cap B|',
      },
      {
        type: 'theorem',
        title: 'Binomial Theorem',
        body: '(x+y)^n=\\sum_{k=0}^{n} C(n,k)x^{n-k}y^k',
      },
    ],
  },

  rigor: {
    prose: [
      'A counting proof must define the sample space and justify one-to-one correspondence to counted objects.',
      'When proving identities combinatorially, count one set in two different valid ways.',
      'If two counting methods produce different totals, one of them is silently overcounting or undercounting; debugging that mismatch is a powerful learning tactic.',
    ],
  },

  examples: [
    {
      id: 'discrete-1-03-ex1',
      title: 'Committee Selection',
      problem: 'How many 4-person committees can be chosen from 10 students?',
      steps: [
        { expression: 'C(10,4)=10!/(4!6!)', annotation: 'Order does not matter.' },
        { expression: '=210', annotation: 'Compute factorial ratio.' },
      ],
      conclusion: 'There are 210 possible committees.',
    },
    {
      id: 'discrete-1-03-ex2',
      title: 'Word Arrangements with Repeats',
      problem: 'How many distinct arrangements of MISSISSIPPI?',
      steps: [
        { expression: 'Total letters 11 with repeats: I4,S4,P2,M1', annotation: 'Use multinomial idea.' },
        { expression: '11!/(4!4!2!)', annotation: 'Divide by permutations of identical letters.' },
        { expression: '=34650', annotation: 'Final count.' },
      ],
      conclusion: 'Repeated symbols reduce naive permutation counts dramatically.',
    },
  ],

  challenges: [
    {
      id: 'discrete-1-03-ch1',
      difficulty: 'easy',
      problem: 'Compute C(12,2).',
      walkthrough: [
        { expression: 'C(12,2)=12!/(2!10!)', annotation: 'Apply combination formula.' },
        { expression: '=12*11/2=66', annotation: 'Cancel factorial tail and simplify.' },
      ],
      answer: '66',
    },
    {
      id: 'discrete-1-03-ch2',
      difficulty: 'medium',
      problem: 'How many 5-bit strings contain exactly two 1s?',
      hint: 'Choose positions of 1s.',
      walkthrough: [
        { expression: 'Pick 2 positions from 5 for ones', annotation: 'Order of chosen positions does not matter.' },
        { expression: 'C(5,2)=10', annotation: 'Remaining positions are automatically zeros.' },
      ],
      answer: 'C(5,2)=10',
    },
  ],

  crossRefs: [
    { lessonSlug: 'relations-and-structures', label: 'Relations and Structures', context: 'Many counting problems are counts of functions or constrained relations.' },
    { lessonSlug: 'discrete-probability', label: 'Discrete Probability', context: 'Probability in finite spaces is counting favorable over total outcomes.' },
    { lessonSlug: 'binomial-theorem', label: 'Binomial Theorem', context: 'Binomial coefficients in algebra are the same coefficients counted combinatorially.' },
  ],

  checkpoints: [
    'read-intuition',
    'read-math',
    'completed-example-1',
    'completed-example-2',
    'attempted-challenge-easy',
    'attempted-challenge-medium',
  ],
}
