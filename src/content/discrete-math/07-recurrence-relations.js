export default {
  id: 'discrete-1-07',
  slug: 'recurrence-relations',
  chapter: 'discrete-1',
  order: 9,
  title: 'Recurrence Relations',
  subtitle: 'Recursive definitions, closed forms, and algorithm growth models',
  tags: ['recurrence', 'recursive sequence', 'characteristic equation', 'divide and conquer'],
  aliases: 'solve recurrence relation iteration method master theorem style intuition',

  hook: {
    question:
      'If a process depends on its earlier states, how can we predict its long-term behavior without simulating every step?',
    realWorldContext:
      'Recurrences model algorithm runtime, population models, dynamic programming states, and signal-processing recursions. They connect discrete structure with performance prediction.',
    previewVisualizationId: 'RecurrenceExplorer',
  },

  intuition: {
    prose: [
      'A recurrence defines each term using earlier terms. It is a rule plus initial conditions.',
      'Initial conditions are not optional details. Without them, many different sequences satisfy the same recurrence rule.',
      'You can solve recurrences by pattern expansion (iteration), by algebraic guessing and induction, or by characteristic equations for linear homogeneous forms.',
      'Divide-and-conquer recurrences like T(n)=2T(n/2)+n describe recursive algorithms and reveal why some strategies scale better than others.',
      'For beginners, write the first 6 to 8 terms before doing formal algebra. Seeing the shape often suggests the right closed form.',
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'Linear Homogeneous Recurrence (Order 2)',
        body: 'a_n = c_1 a_{n-1} + c_2 a_{n-2} solved via characteristic equation r^2-c_1 r-c_2=0.',
      },
    ],
    visualizations: [
      {
        id: 'RecurrenceExplorer',
        title: 'Recurrence Explorer',
        caption: 'Vary coefficients and seeds to compare growth families and stability.',
      },
    ],
  },

  math: {
    prose: [
      'Iteration method repeatedly substitutes until a summation pattern appears; then simplify with known sum identities.',
      'Characteristic equations convert recurrence solving into polynomial root analysis for many linear cases.',
      'Recurrences for runtime are often solved to asymptotic classes instead of exact forms, which is enough for complexity analysis.',
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'Geometric Recurrence Example',
        body: 'a_n = r a_{n-1}, a_0=A gives a_n = Ar^n.',
      },
    ],
  },

  rigor: {
    prose: [
      'After guessing a closed form, always verify it with induction. Pattern spotting alone is not a proof.',
      'When solving runtime recurrences, state the domain (for example powers of two) and base case assumptions clearly.',
      'If recurrence has floors/ceilings, bound them explicitly before asymptotic classification.',
    ],
  },

  examples: [
    {
      id: 'discrete-1-07-ex1',
      title: 'Arithmetic-Style Recurrence',
      problem: 'Given a_1=4 and a_n=a_{n-1}+3 for n>=2, find closed form.',
      steps: [
        { expression: 'Terms: 4,7,10,13,...', annotation: 'Identify arithmetic growth.' },
        { expression: 'a_n = 4 + 3(n-1)', annotation: 'General arithmetic sequence form.' },
      ],
      conclusion: 'a_n = 3n+1.',
    },
    {
      id: 'discrete-1-07-ex2',
      title: 'Runtime Recurrence Shape',
      problem: 'Analyze T(n)=2T(n/2)+n with T(1)=1.',
      steps: [
        { expression: 'Level i contributes n total work', annotation: 'At each level, subproblem count doubles while size halves.' },
        { expression: 'There are log_2 n levels', annotation: 'Until base size 1.' },
        { expression: 'Total T(n)=Theta(n log n)', annotation: 'n per level times log n levels.' },
      ],
      conclusion: 'This is the hallmark recurrence of merge sort.',
    },
  ],

  challenges: [
    {
      id: 'discrete-1-07-ch1',
      difficulty: 'easy',
      problem: 'Given b_0=2 and b_n=3b_{n-1}, find b_n.',
      answer: 'b_n = 2*3^n',
    },
    {
      id: 'discrete-1-07-ch2',
      difficulty: 'medium',
      problem: 'Guess and prove closed form for c_1=1, c_n=c_{n-1}+2n-1.',
      hint: 'Compute first terms and test n^2.',
      answer: 'c_n=n^2.',
    },
  ],

  crossRefs: [
    { lessonSlug: 'induction-and-recursion', label: 'Induction and Recursion', context: 'Induction is the formal proof tool for closed forms.' },
    { lessonSlug: 'algorithms-and-complexity', label: 'Algorithms and Complexity', context: 'Algorithm runtime recurrences map directly to asymptotic growth classes.' },
    { lessonSlug: 'functions', label: 'Functions', context: 'Sequences are functions from positive integers to values.' },
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
