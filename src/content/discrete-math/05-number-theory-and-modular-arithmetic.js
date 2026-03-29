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
    previewVisualizationId: 'ModClockViz',
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
    visualizations: [
      {
        id: 'ModClockViz',
        title: 'Modular Clock Explorer',
        caption: 'Watch integers collapse into congruence classes and verify modular operations visually.',
      },
      {
        id: 'PascalsTriangle',
        title: 'Pascal Patterns',
        caption: 'Spot modular arithmetic regularities in binomial coefficients.',
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
    {
      id: 'discrete-1-05-ex3',
      title: 'Clock Arithmetic Warmup',
      problem: 'What time is it on a 12-hour clock after adding 29 hours to 8 o\'clock?',
      steps: [
        { expression: '8+29=37', annotation: 'Add in ordinary integers first.' },
        { expression: '37 mod 12 = 1', annotation: 'Wrap around the 12-hour cycle.' },
      ],
      conclusion: 'The clock reads 1 o\'clock. Modular arithmetic is controlled wrap-around.',
    },
  ],

  challenges: [
    {
      id: 'discrete-1-05-ch1',
      difficulty: 'easy',
      problem: 'Compute gcd(84,30).',
      walkthrough: [
        { expression: '84=30*2+24', annotation: 'First Euclidean step.' },
        { expression: '30=24*1+6', annotation: 'Second step.' },
        { expression: '24=6*4+0', annotation: 'Stop at remainder zero; last nonzero remainder is gcd.' },
      ],
      answer: '6',
    },
    {
      id: 'discrete-1-05-ch2',
      difficulty: 'medium',
      problem: 'Does 14 have a multiplicative inverse modulo 35?',
      hint: 'Check gcd(14,35).',
      walkthrough: [
        { expression: 'Inverse exists iff gcd(a,n)=1', annotation: 'Use modular inverse criterion.' },
        { expression: 'gcd(14,35)=7', annotation: 'Compute quickly by common factor.' },
      ],
      answer: 'No, gcd(14,35)=7 so inverse does not exist.',
    },
    {
      id: 'discrete-1-05-ch3',
      difficulty: 'hard',
      problem: 'Find the smallest nonnegative x such that x === 5 (mod 7) and x === 2 (mod 9).',
      walkthrough: [
        { expression: 'Write x=5+7k', annotation: 'Encode first congruence.' },
        { expression: '5+7k === 2 (mod 9) => 7k === -3 === 6 (mod 9)', annotation: 'Substitute into second congruence.' },
        { expression: '7 inverse mod 9 is 4, so k === 4*6 === 24 === 6 (mod 9)', annotation: 'Solve linear congruence.' },
        { expression: 'k=6 gives x=5+7*6=47', annotation: 'Smallest nonnegative solution.' },
      ],
      answer: '47',
    },
    {
      id: 'discrete-1-05-ch4',
      difficulty: 'hard',
      problem: 'On a 24-hour clock, you run a job every 17 hours starting at 03:00. After how many runs do you return to 03:00, and why?',
      walkthrough: [
        { expression: 'Times visited are 3+17k (mod 24)', annotation: 'Arithmetic progression modulo 24.' },
        { expression: 'Return when 17k === 0 (mod 24)', annotation: 'Need full cycle back to starting residue.' },
        { expression: 'Since gcd(17,24)=1, smallest k is 24', annotation: 'Coprime step size visits every residue once.' },
      ],
      answer: '24 runs; coprime step size with modulus creates a full cycle.',
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
    'completed-example-3',
    'attempted-challenge-easy',
    'attempted-challenge-medium',
    'attempted-challenge-hard',
  ],
  semantics: {
    core: [
      { symbol: 'a | b', meaning: 'Divisibility — a divides b (b = ak for some integer k)' },
      { symbol: 'gcd(a, b)', meaning: 'Greatest Common Divisor' },
      { symbol: 'lcm(a, b)', meaning: 'Least Common Multiple' },
      { symbol: 'a ≡ b (mod n)', meaning: 'Congruence — a and b have same remainder when divided by n' },
      { symbol: 'a⁻¹ (mod n)', meaning: 'Modular Inverse — a number x such that ax ≡ 1 (mod n)' },
      { symbol: 'φ(n)', meaning: 'Euler\'s Totient Function — count of numbers < n coprime to n' },
    ],
    rulesOfThumb: [
      'gcd(a, b) * lcm(a, b) = a * b.',
      'Modular inverse exists ONLY if gcd(a, n) = 1.',
      'If p is prime and p | ab, then p | a or p | b (Euclid\'s Lemma).',
      'The Euclidean Algorithm is O(log(min(a,b))).',
    ],
  },

  spiral: {
    recoveryPoints: [
      {
        lessonId: 'discrete-1-01b-logic-and-proofs',
        label: 'Logic and Proofs',
        note: 'The Fundamental Theorem of Arithmetic is often proven using strong induction or contradiction.',
      },
    ],
    futureLinks: [
      {
        lessonId: 'discrete-1-10-boolean-algebra-and-circuits',
        label: 'Boolean Algebra',
        note: 'Modular arithmetic base 2 (mod 2) is the foundation of XOR logic and bitwise operations.',
      },
    ],
  },

  mentalModel: [
    'Modular arithmetic is "Clock Math".',
    'Primes are the "Atoms" of the integers.',
    'The Euclidean Algorithm is a "Rectangle-Fitting" process.',
    'Public-key encryption is based on the difficulty of reversing a one-way mathematical function (factoring).',
  ],

  assessment: {
    questions: [
      {
        id: 'nt-assess-1',
        type: 'choice',
        text: 'What is the value of 17 mod 5?',
        options: ['1', '2', '3', '0'],
        answer: '2',
        hint: '17 = 5 * 3 + 2.',
      },
      {
        id: 'nt-assess-2',
        type: 'input',
        text: 'What is the gcd(12, 18)?',
        answer: '6',
        hint: 'The largest number that divides both 12 and 18.',
      },
    ],
  },

  quiz: [
    {
      id: 'nt-q1',
      type: 'choice',
      text: 'Which of the following is true for a number to have an inverse mod n?',
      options: ['The number must be prime', 'The number must be smaller than n', 'The number and n must be coprime (gcd=1)', 'n must be prime'],
      answer: 'The number and n must be coprime (gcd=1)',
      hints: ['gcd(a, n) = 1 is the necessary and sufficient condition.'],
    },
    {
      id: 'nt-q2',
      type: 'choice',
      text: 'What is the main idea behind the Euclidean Algorithm?',
      options: ['Factoring both numbers completely', 'Repeatedly replacing the larger number with the remainder', 'Multiplying the numbers', 'Checking every possible divisor'],
      answer: 'Repeatedly replacing the larger number with the remainder',
      hints: ['gcd(a, b) = gcd(b, a % b).'],
    },
  ],
}
