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
      walkthrough: [
        { expression: '\log n \le n for n\ge2', annotation: 'Standard growth comparison.' },
        { expression: 'n\log n \le n*n=n^2', annotation: 'Multiply both sides by n>0.' },
      ],
      answer: 'Yes.',
    },
    {
      id: 'discrete-1-06-ch2',
      difficulty: 'medium',
      problem: 'Give c and n0 to show 3n+7 <= c n for n>=n0.',
      walkthrough: [
        { expression: 'Need 3n+7\le cn => 7\le (c-3)n', annotation: 'Rearrange target inequality.' },
        { expression: 'Choose c=4 so 7\le n', annotation: 'Then n0=7 works.' },
      ],
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
    'attempted-challenge-easy',
    'attempted-challenge-medium',
  ],
  semantics: {
    core: [
      { symbol: 'O(g(n))', meaning: 'Big-O — Upper bound on the growth rate' },
      { symbol: 'Ω(g(n))', meaning: 'Big-Omega — Lower bound on the growth rate' },
      { symbol: 'Θ(g(n))', meaning: 'Big-Theta — Tight bound (both O and Ω)' },
      { symbol: 'n', meaning: 'The size of the input (number of elements, bits, etc.)' },
      { symbol: 'log n', meaning: 'Logarithmic growth — characteristic of "divide and conquer"' },
      { symbol: 'n!', meaning: 'Factorial growth — characteristic of permutations/brute force' },
    ],
    rulesOfThumb: [
      'Big-O ignores constants: O(2n) is simply O(n).',
      'Drop lower-order terms: O(n² + n + 100) is O(n²).',
      'Polynomial > Logarithmic: Any power of n eventually beats any log n.',
      'Exponential > Polynomial: 2ⁿ eventually beats any nᵏ.',
    ],
  },

  spiral: {
    recoveryPoints: [
      {
        lessonId: 'discrete-1-02-induction-and-recursion',
        label: 'Induction and Recursion',
        note: 'The runtime of recursive algorithms is naturally expressed as a recurrence relation, which we solve using induction.',
      },
    ],
    futureLinks: [
      {
        lessonId: 'discrete-1-07-recurrence-relations',
        label: 'Recurrence Relations',
        note: 'Advanced complexity analysis uses the Master Theorem to solve recurrences from divide-and-conquer algorithms.',
      },
    ],
  },

  mentalModel: [
    'Asymptotics is "Math at a Distance" — we care about the shape of the curve, not the exact values.',
    'Big-O is a "Safety Ceiling"; it guarantees your program won\'t be slower than a certain rate.',
    'Growth classes are "Speed Zones" for algorithms (Highway, City, School Zone).',
    'Scaling is the real test: an algorithm that is fast for n=10 might be impossible for n=1,000,000.',
  ],

  assessment: {
    questions: [
      {
        id: 'comp-assess-1',
        type: 'choice',
        text: 'Which of the following growth rates is the slowest (most efficient)?',
        options: ['O(n)', 'O(n²)', 'O(log n)', 'O(2ⁿ)'],
        answer: 'O(log n)',
        hint: 'Logarithmic growth stays very small even as n grows to astronomical sizes.',
      },
      {
        id: 'comp-assess-2',
        type: 'input',
        text: 'Simplify to the tightest Big-O: f(n) = 10n³ + 50n² + 1000.',
        answer: 'O(n³)',
        hint: 'Keep only the highest-power term and drop the coefficient.',
      },
    ],
  },

  quiz: [
    {
      id: 'comp-q1',
      type: 'choice',
      text: 'What does f(n) = O(g(n)) formally mean?',
      options: ['f grows faster than g', 'f is always less than g', 'f is eventually bounded above by a constant multiple of g', 'f and g are the same function'],
      answer: 'f is eventually bounded above by a constant multiple of g',
      hints: ['Big-O defines an asymptotic upper bound.'],
    },
    {
      id: 'comp-q2',
      type: 'choice',
      text: 'Why do we ignore constant factors like "10" in 10n² when doing Big-O analysis?',
      options: ['Constants are always small', 'Constants depend on the specific hardware/compiler, but the growth rate is a property of the algorithm itself', 'The math is easier that way', 'Constants always cancel out in the end'],
      answer: 'Constants depend on the specific hardware/compiler, but the growth rate is a property of the algorithm itself',
      hints: ['Asymptotics focuses on how the work scales with input size, independent of hardware constants.'],
    },
  ],
}
