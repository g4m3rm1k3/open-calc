import recursionTreeUrl from '../diagrams/dm-recursion-tree-mergesort.svg?url'

export default {
  id: 'discrete-1-07',
  slug: 'recurrence-relations',
  chapter: 'discrete-3',
  order: 2,
  title: 'Recurrence Relations',
  subtitle: 'Recursive definitions, closed forms, and algorithm growth models',
  tags: ['recurrence', 'recursive sequence', 'characteristic equation', 'divide and conquer'],
  aliases: 'solve recurrence relation iteration method master theorem style intuition',

  hook: {
    question:
      'If a process depends on its earlier states, how can we predict its long-term behavior without simulating every step?',
    realWorldContext:
      'Recurrences model algorithm runtime, population models, dynamic programming states, and signal-processing recursions. They connect discrete structure with performance prediction.',
  },

  intuition: {
    prose: [
      'A **recurrence relation** defines each term of a sequence using earlier terms, rather than giving a direct formula in n. It has two parts: a rule (how the next term relates to previous ones) and one or more **initial conditions** (the specific starting values that pin down a unique sequence).',

      'Initial conditions are not optional bookkeeping — without them, the rule alone is ambiguous. The rule aₙ = aₙ₋₁ + 3 is satisfied by 4, 7, 10, 13, ... and equally by 100, 103, 106, 109, ... Both sequences obey the identical recurrence; only the initial condition (a₁ = 4 vs. a₁ = 100) picks out one specific sequence from infinitely many that share the rule.',

      'There are three main ways to solve a recurrence — find a **closed form**, a formula that computes the nth term directly from n with no recursion required. **Iteration** (also called "unrolling" or "telescoping") repeatedly substitutes the recurrence into itself until a summation pattern emerges, which you then simplify with known sum identities. **Guess-and-verify** uses the first several terms to spot a pattern, proposes a closed form, then proves it correct by induction — pattern-spotting alone is never a proof, only a hypothesis. The **characteristic equation** method applies specifically to linear recurrences with constant coefficients, converting the problem into finding roots of a polynomial.',

      'Divide-and-conquer recurrences like T(n) = 2T(n/2) + n describe the runtime of recursive algorithms — here, "solve two half-size subproblems, then do n units of work to combine them" is exactly what merge sort does. Different divide-and-conquer strategies produce different recurrences, and solving them is how you compare algorithms\' scaling behavior before ever running the code.',

      'Before reaching for algebra, write out the first 6 to 8 terms by direct substitution. Seeing the actual numbers — 4, 7, 10, 13, ... — usually suggests the right closed form (here, obviously linear) well before any formal method would.',
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'Linear Homogeneous Recurrence (Order 2)',
        body: 'aₙ = c₁aₙ₋₁ + c₂aₙ₋₂ is solved by proposing aₙ = rⁿ and substituting: rⁿ = c₁rⁿ⁻¹ + c₂rⁿ⁻², which (dividing through by rⁿ⁻²) gives the **characteristic equation** r² − c₁r − c₂ = 0. Its roots determine the shape of the closed form — this is exactly how the Fibonacci recurrence produces the golden-ratio-based Binet formula.',
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
      'The **iteration method** works by repeatedly substituting the recurrence into itself and watching for a pattern. Take T(n) = T(n−1) + n with T(0) = 0: T(n) = T(n−1) + n = T(n−2) + (n−1) + n = T(n−3) + (n−2) + (n−1) + n = ... = T(0) + 1 + 2 + ... + n = n(n+1)/2. Each substitution peels off one layer of recursion and adds one more term to a growing sum, until the base case appears and the sum becomes a closed, known identity.',

      `![Recursion tree for T(n) = 2T(n/2) + n: n total work at each of log₂n levels](${recursionTreeUrl})`,

      'For divide-and-conquer recurrences like T(n) = 2T(n/2) + n, the **recursion tree method** makes the total work visible directly: draw one node per subproblem, with each node\'s cost written next to it, and sum every level. At the top level there is 1 subproblem of size n, doing n work. At the next level, 2 subproblems of size n/2, each doing n/2 work — n total again. This pattern holds at every level: the work per level stays exactly n, because the subproblems shrink exactly as fast as they multiply. There are log₂n levels (since size n halves down to size 1), so the total work is n · log₂n — this is exactly the Θ(n log n) bound for merge sort, derived by counting instead of guessed.',

      'Characteristic equations convert linear-recurrence solving into ordinary polynomial root-finding: propose aₙ = rⁿ, substitute into the recurrence, and the exponents cancel down to a polynomial in r whose roots determine the closed form\'s building blocks (distinct real roots give a sum of geometric terms; a repeated root of multiplicity m contributes terms nⁱrⁿ; complex roots give oscillating, sinusoidal solutions).',

      'Runtime recurrences are usually solved only to an **asymptotic class** (like Θ(n log n)) rather than an exact closed form with precise constants — for complexity analysis, knowing the growth rate is what actually matters for comparing algorithms, and chasing exact constants is both harder and usually beside the point.',
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'Geometric Recurrence Example',
        body: 'aₙ = r·aₙ₋₁ with a₀ = A gives the closed form aₙ = A·rⁿ. This is the n = 1 case of the characteristic-equation method above: the "polynomial" r − r = 0 has the single root r, and the closed form is just that root raised to the nth power, scaled by the initial condition.',
      },
      {
        type: 'theorem',
        title: 'The Master Theorem — A Complexity Cheat Sheet',
        body: 'For T(n) = a·T(n/b) + f(n) (a subproblems, each of size n/b, plus f(n) combine work), compare f(n) to n^(log_b a): if f(n) grows slower, T(n) = Θ(n^(log_b a)) — the recursive splitting dominates. If f(n) grows at the same rate, T(n) = Θ(n^(log_b a) · log n) — this is merge sort\'s case (a=2, b=2, f(n)=n, log_b a = 1, matching f(n)\'s growth). If f(n) grows faster, T(n) = Θ(f(n)) — the combine step dominates.',
      },
    ],
  },

  rigor: {
    prose: [
      'After guessing a closed form by pattern-spotting or by iteration, always verify it with induction: state P(n) as the claim "the closed form equals the recurrence at n," prove the base case directly from the initial condition, then show the inductive step using the recurrence rule itself to connect P(k) to P(k+1). Pattern spotting alone is never a proof — it is only how you generate the hypothesis that induction then confirms or refutes.',

      'When solving runtime recurrences, state the domain explicitly (for instance, "assume n is a power of 2" for T(n) = 2T(n/2) + n) and state the base case assumption (typically T(1) = c for some constant c). These aren\'t formalities — without them, "n/2" isn\'t even guaranteed to be an integer, and the recursion tree\'s level count depends on exactly how the size shrinks.',

      'If the recurrence involves floors or ceilings (like T(n) = T(⌈n/2⌉) + T(⌊n/2⌋) + n for algorithms that split unevenly-sized inputs), bound them explicitly before doing asymptotic classification: ⌊n/2⌋ ≤ n/2 ≤ ⌈n/2⌉ ≤ (n+1)/2, and carry these bounds through the recursion tree rather than silently treating n as always evenly divisible.',
    ],
  },

  examples: [
    {
      id: 'discrete-1-07-ex1',
      title: 'Arithmetic-Style Recurrence — Iteration Method',
      problem: 'Given a_1 = 4 and a_n = a_{n-1} + 3 for n \\geq 2, find the closed form.',
      steps: [
        { expression: 'a_1=4,\\ a_2=7,\\ a_3=10,\\ a_4=13,\\ \\ldots', annotation: 'Compute the first few terms directly. The constant gap of 3 signals arithmetic growth before any algebra.' },
        { expression: 'a_n = a_{n-1} + 3 = a_{n-2} + 3 + 3 = \\ldots = a_1 + 3(n-1)', annotation: 'Iterate: each substitution peels off one layer and adds one more +3, until reaching the known initial condition a₁.' },
        { expression: 'a_n = 4 + 3(n-1) = 3n + 1', annotation: 'Substitute a₁ = 4 and simplify.' },
      ],
      conclusion: 'a_n = 3n + 1. Check: a_1 = 3(1)+1 = 4 ✓, a_2 = 3(2)+1 = 7 ✓ — matches the computed terms.',
    },
    {
      id: 'discrete-1-07-ex2',
      title: 'Runtime Recurrence — Recursion Tree Method',
      problem: 'Analyze T(n) = 2T(n/2) + n with T(1) = 1 (assume n is a power of 2).',
      steps: [
        { expression: '\\text{Level 0: } 1 \\text{ subproblem of size } n \\Rightarrow \\text{cost } n', annotation: 'The root of the recursion tree does n units of combine-work.' },
        { expression: '\\text{Level 1: } 2 \\text{ subproblems of size } n/2 \\Rightarrow \\text{cost } 2 \\cdot (n/2) = n', annotation: 'Twice as many subproblems, each half the size — the level total is unchanged.' },
        { expression: '\\text{Level } i: 2^i \\text{ subproblems of size } n/2^i \\Rightarrow \\text{cost } 2^i \\cdot (n/2^i) = n', annotation: 'This pattern holds at every level: subproblem count and per-subproblem cost always cancel to n.' },
        { expression: '\\text{Number of levels} = \\log_2 n', annotation: 'The size halves each level, so it takes log₂n halvings to shrink n down to the base case size 1.' },
        { expression: 'T(n) = n \\cdot \\log_2 n = \\Theta(n \\log n)', annotation: 'Total work = (cost per level) × (number of levels).' },
      ],
      conclusion: 'T(n) = Θ(n log n) — this is the hallmark recurrence of merge sort, derived by literally counting the recursion tree rather than guessed.',
    },
    {
      id: 'discrete-1-07-ex3',
      title: 'Applying the Master Theorem',
      problem: 'Classify T(n) = 4T(n/2) + n using the Master Theorem.',
      steps: [
        { expression: 'a = 4,\\ b = 2,\\ f(n) = n', annotation: 'Read off the three parameters: 4 subproblems, each 1/2 the size, plus n combine-work.' },
        { expression: 'n^{\\log_b a} = n^{\\log_2 4} = n^2', annotation: 'Compute the "pure recursive splitting" growth rate — this is what the recursion alone would cost with no combine work.' },
        { expression: 'f(n) = n \\quad \\text{vs.} \\quad n^{\\log_b a} = n^2', annotation: 'Compare: f(n) = n grows strictly slower than n².' },
        { expression: '\\therefore\\; T(n) = \\Theta(n^{\\log_b a}) = \\Theta(n^2)', annotation: 'Since the combine work is dominated by the recursive splitting, the recursion\'s own growth rate wins.' },
      ],
      conclusion: 'T(n) = Θ(n²) — the recursive branching (4 subproblems, only halved each time) dominates the linear combine step, unlike the merge-sort case where they were balanced.',
    },
  ],

  challenges: [
    {
      id: 'discrete-1-07-ch1',
      difficulty: 'easy',
      problem: 'Given b_0=2 and b_n=3b_{n-1}, find b_n.',
      walkthrough: [
        { expression: 'b_1=6, b_2=18, b_3=54', annotation: 'Compute first few terms to detect pattern.' },
        { expression: 'Each step multiplies by 3', annotation: 'So after n steps, factor is 3^n.' },
      ],
      answer: 'b_n = 2*3^n',
    },
    {
      id: 'discrete-1-07-ch2',
      difficulty: 'medium',
      problem: 'Guess and prove closed form for c_1=1, c_n=c_{n-1}+2n-1.',
      hint: 'Compute first terms and test n^2.',
      walkthrough: [
        { expression: 'c_1=1, c_2=4, c_3=9, c_4=16', annotation: 'Pattern suggests c_n=n^2.' },
        { expression: 'Assume c_k=k^2, then c_{k+1}=c_k+2(k+1)-1', annotation: 'Induction step setup.' },
        { expression: '=k^2+2k+1=(k+1)^2', annotation: 'Induction closes.' },
      ],
      answer: 'c_n=n^2.',
    },
  ],

  crossRefs: [
    { lessonSlug: 'induction-and-recursion', label: 'Induction and Recursion', context: 'Induction is the formal proof tool for verifying a proposed closed form.' },
    { lessonSlug: 'algorithms-and-complexity', label: 'Algorithms and Complexity', context: 'Algorithm runtime recurrences map directly to asymptotic growth classes.' },
    { lessonSlug: 'sets-and-functions-for-discrete', label: 'Sets and Functions', context: 'A sequence is just a function from the positive integers to values — the recurrence is a rule for that function.' },
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
  ],
  semantics: {
    core: [
      { symbol: 'aₙ', meaning: 'The nth term of a sequence' },
      { symbol: 'Initial Condition', meaning: 'The specific starting values (e.g., a₀ = 1) needed to define a unique sequence' },
      { symbol: 'Closed Form', meaning: 'A formula that calculates aₙ directly from n (no recursion required)' },
      { symbol: 'Characteristic Equation', meaning: 'A polynomial used to solve linear homogeneous recurrences' },
      { symbol: 'Homogeneous', meaning: 'All terms depend only on previous terms in the sequence' },
      { symbol: 'T(n)', meaning: 'Algorithm runtime recurrence (complexity)' },
    ],
    rulesOfThumb: [
      'An order-k recurrence needs exactly k initial conditions.',
      'Linear homogeneous recurrences with constant coefficients always have exponential-style solutions.',
      'Divide and Conquer recurrences (T(n) = aT(n/b) + f(n)) are solved using the Master Theorem.',
      'If the characteristic equation has a repeated root r with multiplicity m, the solution terms are nⁱrⁿ.',
    ],
  },

  spiral: {
    recoveryPoints: [
      {
        lessonId: 'discrete-1-03',
        label: 'Induction and Recursion',
        note: 'Recurrence relations are the explicit mathematical definitions of the recursive processes we studied earlier — and induction is exactly the tool that verifies a proposed closed form.',
      },
    ],
    futureLinks: [
      {
        lessonId: 'discrete-1-13',
        label: 'Algorithms and Complexity',
        note: 'Recurrences are the primary tool for proving the Big-O complexity of recursive algorithms like merge sort.',
      },
    ],
  },

  mentalModel: [
    'A recurrence is a "Rule for the Next Step".',
    'Solving a recurrence is like finding the "General Formula" from a "Recursive Rule".',
    'Initial conditions are the "Seeds"; the recurrence is the "Growth Rule".',
    'The Master Theorem is a "Complexity Cheat Sheet" for recursive algorithms.',
  ],

  assessment: {
    questions: [
      {
        id: 'rec-assess-1',
        type: 'choice',
        text: 'What is the characteristic equation for aₙ = 5aₙ₋₁ - 6aₙ₋₂?',
        options: ['r² - 5r + 6 = 0', 'r² + 5r - 6 = 0', 'r² - 6r + 5 = 0', 'r² + 6r - 5 = 0'],
        answer: 'r² - 5r + 6 = 0',
        hint: 'Rearrange all terms to one side: aₙ - 5aₙ₋₁ + 6aₙ₋₂ = 0.',
      },
      {
        id: 'rec-assess-2',
        type: 'input',
        text: 'If a₀ = 2 and aₙ = aₙ₋₁ + 5, what is a₁?',
        answer: '7',
        hint: 'Plug n=1 into the recurrence.',
      },
    ],
  },

  quiz: [
    {
      id: 'rec-q1',
      type: 'choice',
      text: 'What do you call a formula that lets you calculate aₙ directly without knowing aₙ₋₁?',
      options: ['Recursive Form', 'Closed Form', 'Differential Form', 'Base Case'],
      answer: 'Closed Form',
      hints: ['A non-recursive explicit formula.'],
    },
    {
      id: 'rec-q2',
      type: 'choice',
      text: 'Which technique is typically used to verify that a conjectured closed-form solution is correct?',
      options: ['Integration', 'Mathematical Induction', 'Truth Tables', 'Binary Search'],
      answer: 'Mathematical Induction',
      hints: ['Proving a pattern holds for all n.'],
    },
  ],
}
