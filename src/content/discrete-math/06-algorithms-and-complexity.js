export default {
  id: 'discrete-1-13',
  slug: 'algorithms-and-complexity',
  chapter: 'discrete-1',
  order: 15,
  title: 'Algorithms and Complexity',
  subtitle: 'Efficiency, growth rates, and why asymptotics matter',
  tags: ['algorithms', 'complexity', 'big-o', 'runtime', 'space complexity', 'asymptotics'],
  aliases: 'big O algorithm analysis asymptotic growth runtime classes',

  hook: {
    question:
      'Two algorithms both solve the same task. Why can one finish instantly while the other is unusable at scale?',
    realWorldContext:
      'Complexity analysis predicts scalability before implementation details are optimized. It is the language for feasibility in software, cryptography, search, and AI pipelines.',
    previewVisualizationId: 'ComplexityLab',
  },

  intuition: {
    prose: [
      'Asymptotic analysis compares growth trends as input size n becomes large.',
      'This topic answers the engineering question: will this still work when my inputs are 10x, 100x, or 1,000,000x larger?',
      'Big-O gives an upper-growth class, suppressing constant factors and lower-order terms.',
      'Historical context: from early algorithmics to modern complexity theory, the key shift was proving limits, not only building procedures.',
      'Exponential-time algorithms may look fine on tiny n but become impossible quickly.',
      'Complexity is not just speed. Space usage, communication cost, and parallel bottlenecks are also discrete complexity questions.',
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'Big-O Definition (Informal)',
        body: 'f(n)=O(g(n)) if f is eventually bounded above by constant multiple of g.',
      },
      {
        type: 'insight',
        title: 'Dominant Term Principle',
        body: 'For polynomial expressions, highest-degree term determines asymptotic class.',
      },
    ],
    visualizations: [
      {
        id: 'ComplexityLab',
        title: 'Complexity Growth Lab',
        caption: 'Compare O(1), O(log n), O(n), O(n log n), O(n^2), and O(2^n) interactively.',
      },
    ],
  },

  math: {
    prose: [
      'Common growth hierarchy: 1 < log n < n < n log n < n^2 < n^3 < 2^n < n!.',
      'Recurrence relations model recursive algorithm cost; solving them links to induction and closed-form reasoning.',
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'Sample Asymptotic Simplification',
        body: '7n^2+3n+100 = O(n^2)',
      },
    ],
  },

  rigor: {
    prose: [
      'Formal Big-O proofs require constants c and n0 such that f(n) <= c g(n) for all n>=n0.',
      'Lower bounds (Omega) and tight bounds (Theta) complete the asymptotic picture.',
    ],
  },

  examples: [
    {
      id: 'discrete-1-06-ex1',
      title: 'Classifying a Polynomial Runtime',
      problem: 'Classify f(n)=5n^3+2n^2+9.',
      steps: [
        { expression: 'Dominant term is 5n^3', annotation: 'Highest degree governs growth.' },
        { expression: 'f(n)=Theta(n^3)', annotation: 'Both O(n^3) and Omega(n^3).' },
      ],
      conclusion: 'Cubic growth dominates for large n.',
    },
    {
      id: 'discrete-1-06-ex2',
      title: 'Linear Search Cost',
      problem: 'Worst-case comparisons to find target in unsorted length-n array?',
      steps: [
        { expression: 'May inspect all n items', annotation: 'Target absent or last position.' },
        { expression: 'T(n)=n', annotation: 'Worst-case runtime linear in n.' },
      ],
      conclusion: 'Linear search is O(n).',
    },
  ],

  challenges: [
    {
      id: 'discrete-1-06-ch1',
      difficulty: 'easy',
      problem: 'Is n log n in O(n^2)?',
      answer: 'Yes.',
    },
    {
      id: 'discrete-1-06-ch2',
      difficulty: 'medium',
      problem: 'Give c and n0 to show 3n+7 <= c n for n>=n0.',
      answer: 'One choice: c=4, n0=7.',
    },
  ],

  crossRefs: [
    { lessonSlug: 'induction-and-recursion', label: 'Induction and Recursion', context: 'Recurrence correctness and solutions use induction.' },
    { lessonSlug: 'recurrence-relations', label: 'Recurrence Relations', context: 'Runtime recurrences are solved with the same discrete tools.' },
    { lessonSlug: 'graph-theory', label: 'Graph Theory', context: 'Graph traversal runtime is a core complexity case study.' },
    { lessonSlug: 'automata-theory', label: 'Automata Theory', context: 'State-machine models motivate formal complexity classes.' },
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
