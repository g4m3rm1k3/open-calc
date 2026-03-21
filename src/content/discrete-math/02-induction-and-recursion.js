export default {
  id: 'discrete-1-03',
  slug: 'induction-and-recursion',
  chapter: 'discrete-1',
  order: 5,
  title: 'Induction and Recursion',
  subtitle: 'Proving infinitely many claims with finite work',
  tags: ['induction', 'strong induction', 'recursion', 'recurrence', 'well-ordering'],
  aliases: 'mathematical induction recurrence relation recursive sequence strong induction',

  hook: {
    question:
      'How can one proof certify infinitely many cases? Why does proving a base case and an induction step unlock all n?',
    realWorldContext:
      'Induction powers algorithm correctness proofs, loop invariants, recurrence analysis, and structural properties of trees and strings. Recursion is the computational mirror of induction.',
    previewVisualizationId: 'RecurrenceExplorer',
  },

  intuition: {
    prose: [
      'Induction is a domino argument: knock over the first tile, prove each tile knocks over the next, then all tiles fall.',
      'For non-math learners, the key idea is trust transfer: once the implication P(k)=>P(k+1) is secure, truth can propagate forever from the base case.',
      'Strong induction expands the hypothesis from only n=k to all values <= k, useful when each step depends on multiple earlier values.',
      'You can think of ordinary induction as climbing one rung at a time, while strong induction lets you stand on every lower rung while proving the next one.',
      'Historically, induction appeared explicitly in medieval and early modern mathematics before being formalized as a proof principle.',
      'Recursion defines objects in terms of smaller objects; induction proves properties of those recursively defined objects.',
      'Programmers use this daily: recursive code mirrors a recurrence, and induction is the proof that the code works for all input sizes.',
      'When you feel lost in an induction proof, ask two questions: what exactly is P(n), and where is the induction hypothesis used in the algebra?',
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'Principle of Mathematical Induction',
        body: 'If P(1) is true and \\forall k\\ge1, P(k)\\Rightarrow P(k+1), then P(n) is true for all n\\ge1.',
      },
      {
        type: 'theorem',
        title: 'Strong Induction',
        body: 'If P(1) true and (P(1)\\wedge...\\wedge P(k))\\Rightarrow P(k+1), then P(n) true for all n.',
      },
    ],
    visualizations: [
      {
        id: 'RecurrenceExplorer',
        title: 'Recurrence Explorer',
        caption: 'Tune recurrence parameters and compare arithmetic, geometric, and Fibonacci-like growth.',
      },
    ],
  },

  math: {
    prose: [
      'Recurrences connect discrete math to asymptotics. Example: T(n)=2T(n/2)+n appears in divide-and-conquer algorithms.',
      'Closed forms and bounds can be proved by induction once a candidate expression is guessed.',
      'The method of proof by minimal counterexample is equivalent in strength to induction through the well-ordering principle.',
      'Structural induction extends the idea from integers to recursively built objects such as trees, expressions, and syntax graphs.',
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'Well-Ordering Principle',
        body: 'Every nonempty subset of positive integers has a least element. This is equivalent to induction.',
      },
    ],
  },

  rigor: {
    prose: [
      'Induction proof structure must explicitly separate base case and induction step. Omitting either invalidates the proof.',
      'In strong induction, the step must clearly show where earlier hypotheses are used.',
      'A common beginner mistake is proving P(k)=>P(k+2) and assuming that is enough. It is not enough unless you also provide enough base cases to start both parity chains.',
      'Another common mistake is using the exact claim P(k+1) as part of the induction hypothesis. That is circular reasoning and invalid.',
    ],
    callouts: [
      {
        type: 'proof',
        title: 'Template: Sum Formula',
        body: 'Base: n=1 is immediate. Step: assume 1+...+k = k(k+1)/2. Then add (k+1) to both sides and simplify to (k+1)(k+2)/2.',
      },
    ],
  },

  examples: [
    {
      id: 'discrete-1-02-ex1',
      title: 'Classic Sum by Induction',
      problem: 'Prove \\sum_{i=1}^n i = n(n+1)/2.',
      steps: [
        { expression: 'n=1: 1=1(2)/2', annotation: 'Base case true.' },
        { expression: 'Assume \\sum_{i=1}^k i = k(k+1)/2', annotation: 'Induction hypothesis.' },
        { expression: '\\sum_{i=1}^{k+1} i = k(k+1)/2 + (k+1)', annotation: 'Expand next case.' },
        { expression: '= (k+1)(k+2)/2', annotation: 'Algebraic simplification.' },
      ],
      conclusion: 'Therefore formula holds for all n\\ge1.',
    },
    {
      id: 'discrete-1-02-ex2',
      title: 'Strong Induction: Factorization',
      problem: 'Show every integer n>1 can be written as product of primes.',
      steps: [
        { expression: 'Base n=2: prime', annotation: 'Immediate.' },
        { expression: 'Assume true for 2..k', annotation: 'Strong hypothesis.' },
        { expression: 'For k+1: prime or composite ab with 2<=a,b<=k', annotation: 'Case split.' },
        { expression: 'If composite, a and b factor into primes by hypothesis', annotation: 'Combine prime factors.' },
      ],
      conclusion: 'Every n>1 has a prime factorization existence.',
    },
  ],

  challenges: [
    {
      id: 'discrete-1-02-ch1',
      difficulty: 'easy',
      problem: 'Prove by induction: 2^n >= n+1 for n>=0.',
      hint: 'Use 2^{k+1}=2*2^k and induction hypothesis.',
      answer: 'True for all n>=0.',
    },
    {
      id: 'discrete-1-02-ch2',
      difficulty: 'medium',
      problem: 'Given a_1=1, a_{n+1}=a_n+2n+1, guess and prove closed form.',
      hint: 'Compute first few terms; try n^2.',
      answer: 'a_n=n^2.',
    },
  ],

  crossRefs: [
    { lessonSlug: 'propositions-and-proof-techniques', label: 'Proof Techniques', context: 'Induction step is a specialized implication proof.' },
    { lessonSlug: 'relations-and-structures', label: 'Relations and Structures', context: 'Recursive definitions on sets and relations are proved by induction patterns.' },
    { lessonSlug: 'algorithms-and-complexity', label: 'Algorithms and Complexity', context: 'Recurrences and loop invariants are proved by induction.' },
    { lessonSlug: 'sets-and-logic', label: 'Sets and Logic', context: 'Quantifier control is essential when writing precise induction statements.' },
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
