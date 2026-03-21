export default {
  id: 'discrete-1-05',
  slug: 'number-theory-and-modular-arithmetic',
  chapter: 'discrete-1',
  order: 7,
  title: 'Number Theory and Modular Arithmetic',
  subtitle: 'Divisibility, primes, gcd, and congruences for computation and cryptography',
  tags: ['number theory', 'divisibility', 'primes', 'gcd', 'euclidean algorithm', 'modular arithmetic'],
  aliases: 'congruence modulo gcd euclid algorithm modular inverse rsa basics',

  hook: {
    question:
      'Why does modern encryption depend on arithmetic that looks like high-school remainders?',
    realWorldContext:
      'Public-key cryptography, hashing, checksums, and many randomized data structures rely on modular arithmetic and divisibility properties. Number theory is not optional if you want to understand secure systems.',
    previewVisualizationId: 'PascalsTriangle',
  },

  intuition: {
    prose: [
      'Number theory starts with divisibility: a divides b means b is an exact multiple of a. This relation encodes structure that ordinary decimal intuition hides.',
      'Greatest common divisor (gcd) answers the question: what is the largest building block shared by two integers?',
      'The Euclidean algorithm is one of the oldest and most important algorithms in mathematics. It is fast, elegant, and still used in modern software.',
      'Modular arithmetic says two integers are equivalent when they leave the same remainder after division by n. This creates clock-like arithmetic systems.',
      'For beginners, modular arithmetic is easier if you treat it as partitioning integers into remainder classes rather than memorizing congruence rules.',
      'Proof techniques from earlier lessons are used everywhere: divisibility proofs, contradiction arguments for primes, and induction for algorithm correctness.',
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'Division Algorithm',
        body: 'For integers a and b>0, there exist unique integers q,r with a=bq+r and 0<=r<b.',
      },
      {
        type: 'theorem',
        title: 'Bézout Identity',
        body: 'For integers a,b not both 0, there exist integers x,y with ax+by=gcd(a,b).',
      },
    ],
  },

  math: {
    prose: [
      'Congruence notation: a===b (mod n) means n divides a-b. This is an equivalence relation on integers.',
      'An integer a has a modular inverse modulo n exactly when gcd(a,n)=1. This criterion powers many cryptographic constructions.',
      'Prime factorization underlies integer structure. Fundamental Theorem of Arithmetic states uniqueness of prime factorization for integers >1.',
      'Chinese Remainder Theorem provides a way to solve simultaneous congruences and appears in performance optimizations for modular computations.',
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'Euclidean Algorithm Principle',
        body: 'gcd(a,b)=gcd(b, a mod b), repeatedly until remainder is 0.',
      },
      {
        type: 'theorem',
        title: 'Inverse Criterion',
        body: 'a has inverse mod n iff gcd(a,n)=1.',
      },
    ],
  },

  rigor: {
    prose: [
      'To prove gcd properties, show both divisibility directions: common divisor property and maximality.',
      'For modular proofs, always rewrite to divisibility statements before manipulating symbols. This prevents illegal cancellation errors.',
      'In algorithm proofs, state loop invariants explicitly. For Euclid, the invariant is that gcd of the current pair is unchanged each iteration.',
    ],
  },

  examples: [
    {
      id: 'discrete-1-05-ex1',
      title: 'Compute gcd(252, 198)',
      problem: 'Use Euclidean algorithm to compute gcd(252,198).',
      steps: [
        { expression: '252 = 198*1 + 54', annotation: 'First remainder.' },
        { expression: '198 = 54*3 + 36', annotation: 'Continue.' },
        { expression: '54 = 36*1 + 18', annotation: 'Continue.' },
        { expression: '36 = 18*2 + 0', annotation: 'Stop when remainder is zero.' },
      ],
      conclusion: 'gcd(252,198)=18.',
    },
    {
      id: 'discrete-1-05-ex2',
      title: 'Solve 7x === 1 (mod 26)',
      problem: 'Find multiplicative inverse of 7 modulo 26.',
      steps: [
        { expression: '26 = 7*3 + 5, 7 = 5*1 + 2, 5 = 2*2 + 1', annotation: 'Euclid shows gcd=1.' },
        { expression: '1 = 5 - 2*2 = 5 - (7-5)*2 = 3*5 - 2*7 = 3*(26-3*7)-2*7', annotation: 'Back substitute.' },
        { expression: '1 = 3*26 - 11*7', annotation: 'Rearrange Bézout form.' },
      ],
      conclusion: '7*(-11) === 1 (mod 26), so inverse is 15.',
    },
  ],

  challenges: [
    {
      id: 'discrete-1-05-ch1',
      difficulty: 'easy',
      problem: 'Compute gcd(84,30).',
      answer: '6',
    },
    {
      id: 'discrete-1-05-ch2',
      difficulty: 'medium',
      problem: 'Does 14 have a multiplicative inverse modulo 35?',
      hint: 'Check gcd(14,35).',
      answer: 'No, gcd(14,35)=7 so inverse does not exist.',
    },
  ],

  crossRefs: [
    { lessonSlug: 'propositions-and-proof-techniques', label: 'Proof Techniques', context: 'Divisibility and prime arguments rely on direct and contradiction proofs.' },
    { lessonSlug: 'relations-and-structures', label: 'Relations and Structures', context: 'Congruence modulo n is a canonical equivalence relation.' },
    { lessonSlug: 'algorithms-and-complexity', label: 'Algorithms and Complexity', context: 'Euclidean algorithm is a model example of efficient discrete computation.' },
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
