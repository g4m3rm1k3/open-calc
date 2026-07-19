import growthRateHierarchyUrl from '../diagrams/dm-growth-rate-hierarchy.svg?url'

export default {
  id: 'discrete-1-13',
  slug: 'algorithms-and-complexity',
  chapter: 'discrete-6',
  order: 3,
  title: 'Algorithms and Complexity',
  subtitle: 'Efficiency, growth rates, and why asymptotics matter',
  tags: ['algorithms', 'complexity', 'big-o', 'runtime', 'space complexity', 'asymptotics'],
  aliases: 'big O algorithm analysis asymptotic growth runtime classes',

  hook: {
    question:
      'Two algorithms both solve the same task. Why can one finish instantly while the other is unusable at scale?',
    realWorldContext:
      'Complexity analysis predicts scalability before implementation details are optimized. It is the language for feasibility in software, cryptography, search, and AI pipelines.',
  },

  intuition: {
    prose: [
      'Asymptotic analysis compares growth *trends* as input size n becomes large — not the exact runtime of any one run (which depends on hardware, language, and implementation details), but the *shape* of how work scales as n grows without bound.',
      'This topic answers the engineering question that actually matters in practice: will this still work when my inputs are 10x, 100x, or 1,000,000x larger? An algorithm that\'s fast on a 100-row test dataset can be completely unusable on a 100-million-row production dataset — and Big-O is the tool that predicts which failure mode you\'re in *before* you find out the hard way in production.',
      'Big-O gives an upper-growth class, suppressing constant factors and lower-order terms, because those details wash out for large n and depend on things Big-O deliberately ignores (CPU speed, compiler optimizations, language overhead) — what doesn\'t wash out is the *class* of growth, which is a property of the algorithm\'s logic, not its implementation.',

      `![Growth rates compared on a shared axis: O(1), O(log n), O(n), O(n log n), O(n^2), O(2^n)](${growthRateHierarchyUrl})`,

      'The diagram makes the stakes visible: all six curves start at the same origin, but O(n²) and O(2ⁿ) shoot off the top of the chart almost immediately while O(1) and O(log n) barely move. This is exactly why "it works fine on my test data" is not evidence an algorithm will work at scale — small n can\'t distinguish a good growth class from a bad one, only large n can.',

      'Historical context: from early algorithmics (procedures that simply worked) to modern complexity theory, the key shift was proving *limits* — not just "here is a way to solve this," but "here is the best any algorithm could possibly do," and sometimes "no efficient algorithm can possibly exist" (as with NP-complete problems).',
      'Exponential-time algorithms may look fine on tiny n (2¹⁰ = 1024 is nothing) but become impossible quickly (2⁶⁴ exceeds the number of atoms worth checking in any reasonable time) — this is the concrete meaning of "combinatorial explosion" that shows up throughout Chapter 3\'s counting problems.',
      'Complexity is not just about speed. Space usage (memory an algorithm needs), communication cost (data shipped across a network in distributed systems), and parallel bottlenecks (work that can\'t be split across cores) are all separate discrete complexity questions with their own Big-O analyses — a fast algorithm that needs more RAM than exists is just as impractical as a slow one.',
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
      'Common growth hierarchy: 1 < log n < n < n log n < n^2 < n^3 < 2^n < n!. Each class eventually beats every class to its left, no matter how large the constant multiplier on the left is — this is exactly what "asymptotic" means: a statement about the tail of the sequence, not about small n.',
      'Recurrence relations model recursive algorithm cost. A divide-and-conquer algorithm that splits work into `a` subproblems of size n/b, plus f(n) extra work per call, has runtime T(n) = a·T(n/b) + f(n) — the Master Theorem (see Recurrence Relations) turns this recurrence directly into a closed-form Big-O class.',
      'Composite algorithms follow a simple accounting rule: costs of sequential steps add (so the slower step dominates and the faster one disappears asymptotically), while costs of nested loops multiply (an O(n) loop inside an O(n) loop is O(n²), not O(n) + O(n) = O(2n) = O(n)).',
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'Sample Asymptotic Simplification',
        body: '7n^2+3n+100 = O(n^2)',
      },
    ],
    visualizations: [
      {
        id: 'PythonNotebook',
        title: 'Code: Watching Growth Rates Race',
        caption: 'Count operations directly instead of trusting the formulas — then time real code and watch quadratic and exponential growth appear on your own machine.',
        props: {
          initialCells: [
            {
              id: 1,
              cellTitle: 'Counting operations: linear vs quadratic vs exponential',
              prose: [
                '`linear_ops(n)` and `quadratic_ops(n)` don\'t run an algorithm — they directly compute how many basic operations an O(n) and an O(n²) algorithm would perform, using the closed forms from the lesson (n, and n(n-1)/2 comparisons for bubble sort).',
                '`fib_calls(n)` counts recursive calls for the naive exponential Fibonacci — every call spawns two more (until the base case), so the call count roughly doubles with each increment of n. Watch how fast the exponential column overtakes the other two, even though n itself only grows by a factor of 4 across the whole table.',
              ],
              instructions: 'Run this cell, then try adding 28 or 30 to the `sizes` list — the exponential column grows so fast that a jump of just a few in n adds hundreds of thousands of calls (and starts taking noticeably longer to run).',
              code: `def linear_ops(n):
    return n

def quadratic_ops(n):
    # bubble sort worst case: n(n-1)/2 comparisons
    return n * (n - 1) // 2

def fib_calls(n):
    # naive recursive fibonacci: count total calls (no memoization on purpose)
    if n <= 1:
        return 1
    return 1 + fib_calls(n - 1) + fib_calls(n - 2)

sizes = [5, 10, 15, 20, 25]
print(f"{'n':>4} | {'O(n)':>8} | {'O(n^2)':>10} | {'O(2^n)-ish calls':>18}")
print("-" * 48)
for n in sizes:
    print(f"{n:>4} | {linear_ops(n):>8} | {quadratic_ops(n):>10} | {fib_calls(n):>18}")`,
            },
            {
              id: 2,
              cellTitle: 'Timing real code: does the quadratic curve actually show up?',
              prose: [
                'This cell runs an actual O(n²) bubble sort on random lists of increasing size and times each run with `time.perf_counter()` — no counting formulas, just a stopwatch around real code.',
                'Look at the ratio column: each time `n` doubles, an O(n²) algorithm should take roughly **4x** longer (since (2n)² = 4n²). If your ratios cluster near 4, you\'ve just confirmed the lesson\'s asymptotic claim empirically, on your own hardware.',
              ],
              instructions: 'Run this cell. Then try changing bubble_sort to a single `sorted(arr)` call and re-run — Python\'s built-in sort is O(n log n), so the timing ratio should drop toward 2, not stay near 4.',
              code: `import time
import random

def bubble_sort(arr):
    arr = arr[:]
    n = len(arr)
    for i in range(n):
        for j in range(n - 1 - i):
            if arr[j] > arr[j + 1]:
                arr[j], arr[j + 1] = arr[j + 1], arr[j]
    return arr

sizes = [200, 400, 800, 1600]
times = []
for n in sizes:
    data = [random.random() for _ in range(n)]
    start = time.perf_counter()
    bubble_sort(data)
    elapsed = time.perf_counter() - start
    times.append(elapsed)
    print(f"n={n:>5}  time={elapsed:.4f}s")

print("\\nRatio of consecutive times (expect ~4x for O(n^2) when n doubles):")
for i in range(1, len(times)):
    ratio = times[i] / times[i - 1] if times[i - 1] > 0 else float('nan')
    print(f"  n={sizes[i-1]}->{sizes[i]}:  {ratio:.2f}x")`,
            },
          ],
        },
      },
    ],
  },

  rigor: {
    prose: [
      'Formally, f(n) = O(g(n)) means there exist positive constants c and n₀ such that f(n) ≤ c·g(n) for **all** n ≥ n₀. The "for all n ≥ n₀" is doing the real work: it says the bound has to hold forever past some point, not just for a handful of convenient values — you cannot prove f(n)=O(g(n)) by checking f(10) ≤ c·g(10) and stopping.',
      'To prove f(n) = O(g(n)) rigorously, exhibit specific witnesses: pick a candidate c, then find the n₀ past which the inequality holds (usually by algebra — isolate n and solve the resulting inequality, exactly as in the two challenges below). To prove f(n) is **not** O(g(n)), show that no matter what c is chosen, the inequality f(n) ≤ c·g(n) eventually fails for large enough n — c cannot "buy back" a difference in growth class, only a difference in constant factor.',
      'Lower bounds (Ω, "big-Omega") mirror Big-O from below: f(n) = Ω(g(n)) means f(n) ≥ c·g(n) eventually, for some c > 0. Tight bounds (Θ, "big-Theta") require both simultaneously: f(n) = Θ(g(n)) exactly when f(n) = O(g(n)) **and** f(n) = Ω(g(n)) — meaning g truly captures f\'s growth rate, sandwiched from both sides, not merely an upper ceiling that might be loose.',
    ],
  },

  examples: [
    {
      id: 'discrete-1-13-ex1',
      title: 'Classifying a Polynomial Runtime',
      problem: 'Classify f(n)=5n^3+2n^2+9.',
      steps: [
        { expression: 'Dominant term is 5n^3', annotation: 'Highest degree governs growth.' },
        { expression: 'f(n)=Theta(n^3)', annotation: 'Both O(n^3) and Omega(n^3).' },
      ],
      conclusion: 'Cubic growth dominates for large n.',
    },
    {
      id: 'discrete-1-13-ex2',
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
      id: 'discrete-1-13-ch1',
      difficulty: 'easy',
      problem: 'Is n log n in O(n^2)?',
      walkthrough: [
        { expression: '\\log n \\le n \\text{ for } n \\ge 2', annotation: 'Standard growth comparison.' },
        { expression: 'n\\log n \\le n \\cdot n = n^2', annotation: 'Multiply both sides by n>0.' },
      ],
      answer: 'Yes.',
    },
    {
      id: 'discrete-1-13-ch2',
      difficulty: 'medium',
      problem: 'Give c and n0 to show 3n+7 <= c n for n>=n0.',
      walkthrough: [
        { expression: '3n+7 \\le cn \\implies 7 \\le (c-3)n', annotation: 'Rearrange target inequality.' },
        { expression: '\\text{Choose } c=4 \\text{ so } 7 \\le n', annotation: 'Then n0=7 works.' },
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
    'read-rigor',
    'completed-example-1',
    'completed-example-2',
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
        lessonId: 'discrete-1-03',
        label: 'Induction and Recursion',
        note: 'The runtime of recursive algorithms is naturally expressed as a recurrence relation, which we solve using induction.',
      },
    ],
    futureLinks: [
      {
        lessonId: 'discrete-1-07',
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
