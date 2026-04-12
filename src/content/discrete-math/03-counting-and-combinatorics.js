export default {
  id: 'discrete-1-04',
  slug: 'counting-and-combinatorics',
  chapter: 'discrete-1',
  order: 6,
  title: 'Counting and Combinatorics',
  subtitle: 'The dark art of enumerating massive keyspaces before brute-force computation fails',
  tags: ['counting', 'combinatorics', 'permutations', 'combinations', 'binomial coefficient'],
  aliases: 'n choose k permutations combinations multiplication principle inclusion exclusion',

  hook: {
    question: 'How do you theoretically prove that a 256-bit encryption key will take the world\'s fastest supercomputer roughly 3 million years to crack via brute-force?',
    realWorldContext: 'Combinatorics is the mathematical engine behind cryptography, database indexing efficiency, and AI game trees. If a software engineer cannot estimate branching path counts, their algorithms can become computationally impractical very quickly (the State Explosion Problem).',
    previewVisualizationId: 'CountingTreeLab',
  },

  intuition: {
    prose: [
      `### Why Counting Is Hard — And Why It Matters

Counting sounds trivial. You learned it at age three. So why does it deserve an entire chapter of discrete mathematics?

Because what looks like "how many?" quickly becomes "how many arrangements of 52 playing cards exist?" (Answer: 52! ≈ 8 × 10⁶⁷ — more than the number of atoms in the observable universe.) Or "how many different 256-bit keys are there?" (Answer: 2²⁵⁶ ≈ 1.16 × 10⁷⁷ — so many that even if every atom in the universe tried a trillion keys per second since the Big Bang, you'd cover less than a rounding error's worth.)

These numbers are so large they define what's computationally secure. Combinatorics is how you calculate them without actually listing every possibility.

The core challenge is this: you need to count things that follow rules — arrangements where order matters, or doesn't; selections where repetition is allowed, or isn't; sets that overlap in complicated ways. Each variation changes the count dramatically. Grabbing the wrong formula gives you an answer that could be off by a factor of millions.

This chapter gives you a decision framework, not just formulas. For each counting problem, you'll learn to ask the right questions first.`,

      `### The Two Fundamental Rules

Everything in combinatorics reduces to two operations. Master these and the formulas become natural consequences rather than things to memorize.

**The Multiplication Rule (AND):** If you make a choice from Group A AND then a choice from Group B, and these choices are independent, multiply the counts.

Choosing an outfit: 5 shirts AND 3 pairs of pants = 5 × 3 = 15 outfits. Draw it as a tree: each shirt branches into 3 pants options. The 15 leaf nodes are all the distinct outfits.

The multiplication rule extends to any number of independent stages: choices for Stage 1 × Stage 2 × Stage 3 × ... This is how you get 10⁴ = 10,000 possible 4-digit PINs (10 choices per digit, 4 independent digits).

**The Addition Rule (OR):** If you make a choice from Group A OR a choice from Group B (but not both), add the counts.

Choosing a beverage: 4 coffees OR 6 teas = 4 + 6 = 10 options. The groups are separate — choosing a coffee and choosing a tea are mutually exclusive events.

**The critical caveat:** OR only works as simple addition when the groups don't overlap. If some beverages are both coffee-based AND available as tea lattes (or whatever), you'd be double-counting them. That case requires Inclusion-Exclusion, which we'll get to shortly.`,

      `### The Slot Machine Method: Anchor Your Brain First

Before reaching for a formula, do this: draw blank slots on paper representing each sequential decision.

Cracking a 4-digit PIN: _ _ _ _

Now fill each slot with the number of valid options for that position:

10 × 10 × 10 × 10 = 10,000

That's it. No formula needed. The multiplication rule applied four times.

Now try a harder one: How many 8-character passwords using uppercase letters, lowercase, and digits, where the first character must be a letter?

Slot 1: 52 options (26 upper + 26 lower)
Slots 2–8: 62 options each (52 letters + 10 digits)

Total: 52 × 62⁷ = 52 × 3,521,614,606,208 ≈ 183 trillion

This method forces you to identify the structure before algebra. It prevents the most common mistake: applying a formula to a problem that doesn't fit its assumptions.`,

      `### Factorials: The Engine Under Everything

Before the main formulas, you need to be comfortable with factorials.

n! means n × (n−1) × (n−2) × ... × 2 × 1. It counts the number of ways to arrange n distinct objects in a line.

Why? Place the first object: n choices. Place the second: n−1 remaining choices. Third: n−2. And so on. Multiply them all: n × (n−1) × ... × 1 = n!

5! = 5 × 4 × 3 × 2 × 1 = 120 ways to arrange 5 books on a shelf.
10! = 3,628,800 ways to arrange 10 people in a line.
52! ≈ 8 × 10⁶⁷ ways to shuffle a deck of cards.

**The critical gotcha: 0! = 1.**

This feels wrong. How can you arrange zero objects in one way? Think of it as: there is exactly one way to arrange nothing — the empty arrangement. Alternatively, the factorial recurrence n! = n × (n−1)! requires 1! = 1 × 0!, so 0! must be 1.

If you use 0! = 0, the combination formula C(n,n) = n!/(n! × 0!) collapses to n!/0, which is undefined. You'd be saying "there are no ways to choose all n items from n items." That's wrong — there's exactly one way. 0! = 1 is the only definition that keeps the formulas consistent.`,

      `### Permutations: When Order Is Everything

A permutation counts ordered arrangements. The key word is ordered — changing the sequence produces a distinct result.

Lock combination 1-2-3 is different from 3-2-1. First place vs. second place in a race is different. Seating people at a table where chairs are labeled is different from seating people at a round table (we'll get to that).

**Full permutation** of n distinct objects: n! (arrange all of them)

**Partial permutation** of k objects chosen from n distinct objects: P(n,k) = n!/(n−k)!

Why this formula? You have n choices for position 1, n−1 for position 2, ..., n−k+1 for position k. Multiply these k terms:

n × (n−1) × ... × (n−k+1)

That's a product of k consecutive integers starting from n and going down. Written using factorials: n! divided by (n−k)! (which cancels the terms below position k).

Example: How many 3-letter ordered arrangements can you make from the letters A, B, C, D, E?

P(5,3) = 5!/(5−3)! = 5!/2! = 120/2 = 60

Draw the slot machine: 5 × 4 × 3 = 60. Same answer, different path.`,

      `### Combinations: When Only the Selection Matters

A combination counts unordered selections. The key question: if you swap two chosen items, does anything change?

Lottery numbers: {3, 17, 42} is the same winning ticket as {42, 3, 17}. Order doesn't matter — you either picked those numbers or you didn't.
Committee of 3 from 10 people: {Alice, Bob, Carol} is the same committee as {Carol, Bob, Alice}.

The formula: C(n,k) = n! / (k! × (n−k)!)

This is also written as $\binom{n}{k}$, pronounced "n choose k."

**Where does k! come from?** Start from P(n,k) — the ordered arrangements. Every unordered selection of k items corresponds to k! different ordered arrangements (all the ways to arrange those k items in order). Since we don't care about order, we divide P(n,k) by k! to collapse all those ordered duplicates into one selection.

C(n,k) = P(n,k) / k! = n! / (k! × (n−k)!)

Example: Choose 3 toppings from 8 for a pizza.
C(8,3) = 8! / (3! × 5!) = 40320 / (6 × 120) = 40320 / 720 = 56

Concrete check: if you ordered the 3 toppings in all possible ways, each distinct set of toppings would appear 3! = 6 times in the permutation list. Dividing by 6 collapses each group of 6 duplicates into 1. 8 × 7 × 6 = 336 ordered arrangements, divide by 6 = 56 unordered selections.`,

      `### The Master Decision Tree

Before touching any formula, run through these questions:

**Step 1: Does order matter?**
- YES → Use permutations
- NO → Use combinations

**Step 2: Is repetition allowed?**
- Order matters + no repetition: P(n,k) = n!/(n−k)!
- Order matters + repetition OK: nᵏ (choose from n for each of k positions)
- Order doesn't matter + no repetition: C(n,k) = n!/(k!(n−k)!)
- Order doesn't matter + repetition OK: C(n+k−1, k) — Stars and Bars

**The secret test for order:** "If I swap two of the chosen items, is the result different?"
- Committee of 3 (swap any two members): same committee → combination
- President/VP from 3 candidates (swap the roles): different result → permutation
- 4-digit PIN (swap digits 1 and 2): different PIN → permutation/repetition

**The classic confusion:** People treat "combination lock" as if it uses combinations. It doesn't. 1-2-3 and 3-2-1 open different things — order matters, it's a permutation lock. The name is a cultural accident.`,

      `### Identical Items: The Overcount Problem

What if some of your objects are identical?

How many distinct arrangements of the letters in BOOT?

If all four letters were distinct (say B-O₁-O₂-T), there would be 4! = 24 arrangements. But O₁ and O₂ are identical — swapping them produces the same word. Every word that contains both O's appears twice in our 24 count, because we counted O₁O₂ and O₂O₁ separately.

Fix: divide by the factorial of each group of identical items.

BOOT: 4 letters, 2 identical O's: 4!/2! = 24/2 = 12 distinct arrangements.

MISSISSIPPI: 11 letters. M appears 1 time, I appears 4 times, S appears 4 times, P appears 2 times.
Total: 11! / (1! × 4! × 4! × 2!) = 39,916,800 / (1 × 24 × 24 × 2) = 39,916,800 / 1,152 = 34,650

This formula — dividing by the product of factorials of identical groups — is called the multinomial coefficient and it generalizes C(n,k).`,
    ],

    callouts: [
      {
        type: 'definition',
        title: 'The Factorial Primer (n!)',
        body: 'n! = n × (n−1) × (n−2) × ... × 2 × 1. Counts arrangements of n distinct objects.\n\n5! = 120\n10! = 3,628,800\n\nCRITICAL: 0! = 1. There is exactly one way to arrange nothing. Every combination formula breaks if you use 0! = 0.',
      },
      {
        type: 'theorem',
        title: 'The Multiplication Principle',
        body: 'If a process has independent stages where Stage 1 has a choices, Stage 2 has b choices, ..., the total number of complete outcomes is a × b × ...',
      },
      {
        type: 'theorem',
        title: 'Inclusion-Exclusion (Overlap Fix)',
        body: '|A ∪ B| = |A| + |B| − |A ∩ B|\n\nFor three sets: |A ∪ B ∪ C| = |A| + |B| + |C| − |A ∩ B| − |A ∩ C| − |B ∩ C| + |A ∩ B ∩ C|\n\nStory: add all groups, subtract pairwise overlaps (added twice), add triple overlaps back (subtracted too many times).',
      },
    ],

    visualizations: [
      {
        id: 'MultiplicationRuleTree',
        title: 'The Multiplication Rule: See Every Branch',
        caption: 'Adjust the number of choices at each stage and watch the tree grow. See exactly why independent choices multiply.',
        props: { interactive: true },
      },
      {
        id: 'CountingTreeLab',
        title: 'The Multiplication Tree Branching',
        caption: 'Visually trace exact logic branches to prove why independent choices are mathematically forced to strictly multiply.',
      },
      {
        id: 'SlotMachineCounter',
        title: 'The Slot Machine Method',
        caption: 'Enter a counting problem as independent slots. Fill each slot with its valid options and watch the product emerge. Build intuition before formulas.',
        props: { guided: true },
      },
      {
        id: 'FactorialExplorer',
        title: 'Factorial Growth: How Fast Is n!?',
        caption: 'Watch n! grow and compare it to exponential and polynomial growth. Understand why 52! is larger than atoms in the universe.',
        props: { interactive: true },
      },
    ],
  },

  math: {
    prose: [
      `### The Complementary Counting Trick

When counting things that satisfy "at least one condition," direct counting forces you to enumerate all the cases: exactly 1, exactly 2, exactly 3... This can get extremely tedious.

The complementary trick: instead of counting what you want, count what you DON'T want and subtract from the total.

Total outcomes − (outcomes with NONE of what you want) = outcomes with AT LEAST ONE of what you want

**Signal phrase:** whenever you see "at least one," immediately consider complementary counting.

Example: 5-character passwords with at least one digit.
- Direct: count passwords with exactly 1 digit + exactly 2 digits + ... + exactly 5 digits. Five cases.
- Complement: (all passwords) − (passwords with zero digits)
  = 36⁵ − 26⁵ = 60,466,176 − 11,881,376 = 48,584,800

One calculation instead of five. The complement approach is dramatically faster whenever "at least one" appears.`,

      `### Pascal's Triangle and the Binomial Theorem

Pascal's Triangle is a visual table of all C(n,k) values, organized by row n and position k:

Row 0:          1
Row 1:         1   1
Row 2:        1   2   1
Row 3:       1   3   3   1
Row 4:      1   4   6   4   1

Each entry equals the sum of the two entries above it. This is because C(n,k) = C(n−1,k−1) + C(n−1,k): you can either include the new item (choose k−1 from the remaining n−1) or exclude it (choose k from n−1).

Pascal's Triangle connects combinatorics to algebra through the **Binomial Theorem**:

(x + y)ⁿ = Σₖ C(n,k) xⁿ⁻ᵏ yᵏ

(x + y)³ = C(3,0)x³ + C(3,1)x²y + C(3,2)xy² + C(3,3)y³ = x³ + 3x²y + 3xy² + y³

The coefficients (1, 3, 3, 1) are row 3 of Pascal's Triangle. This connects counting (how many ways to choose k y's from n factors) to algebra (the coefficient of xⁿ⁻ᵏ yᵏ).

Engineering application: Bernoulli trials. The probability of exactly k successes in n independent trials with success probability p is C(n,k) × pᵏ × (1−p)ⁿ⁻ᵏ. The C(n,k) counts how many ways those k successes could be distributed among n trials.`,

      `### Stars and Bars: Combinations with Repetition

The hardest type of combination problem: choosing k items from n types when you can repeat types and order doesn't matter.

How many ways can you buy 10 sodas from 3 flavors (Coke, Sprite, Fanta) with repetition?

You can't use C(3,10) — that requires choosing 10 distinct items from 3, which is impossible (only 3 options). You need a different model.

**The Stars and Bars model:** represent your 10 sodas as stars: ★★★★★★★★★★

Use 2 "bars" (|) to divide them into 3 flavor bins. The position of the bars determines the distribution:

★★★|★★★★★|★★ means 3 Cokes, 5 Sprites, 2 Fantas (total = 10 ✓)
★★★★★★★★★★|| means 10 Cokes, 0 Sprites, 0 Fantas (total = 10 ✓)

You have 10 stars + 2 bars = 12 symbols total. The number of distinct arrangements is the number of ways to choose which 2 positions (out of 12) hold the bars:

C(12, 2) = C(10+3−1, 3−1) = C(12, 2) = 66

General formula: distributing n identical items into k bins = C(n+k−1, k−1).

The key insight: this is equivalent to choosing the positions of the k−1 bars among n+k−1 total symbols. You're not choosing sodas — you're choosing where to put the dividers.`,
    ],

    callouts: [
      {
        type: 'warning',
        title: 'The Identical Items Overcount Trap',
        body: 'If your objects include duplicates (same letters, same colors, identical items), the standard factorial counts phantom arrangements. Fix: divide by the factorial of each group of identical items.\n\nMISSISSIPPI: 11!/(1!×4!×4!×2!) = 34,650\n\nIf you forget to divide, you get 11! = 39,916,800 — off by a factor of 1,152.',
      },
      {
        type: 'theorem',
        title: 'The Master Matrix: Four Counting Scenarios',
        body: 'Order Matters + No Repetition: P(n,k) = n!/(n−k)!\nOrder Matters + Repetition Allowed: nᵏ\nOrder Does Not Matter + No Repetition: C(n,k) = n!/(k!(n−k)!)\nOrder Does Not Matter + Repetition Allowed: C(n+k−1, k−1) [Stars and Bars]',
      },
      {
        type: 'tip',
        title: 'The Swap Test',
        body: 'Ask: "If I swap two chosen items, does the outcome change?"\n\nYES → Permutation (order matters)\nNO → Combination (order doesn\'t matter)\n\nPresident and VP: swap changes who has power → Permutation\nCommittee of 2: swap gives same committee → Combination\nPIN code: swap gives different code → Permutation (with repetition: n^k)',
      },
      {
        type: 'insight',
        title: 'Circular Permutations: Round Table Fix',
        body: 'At a circular table, rotating all seats produces the same seating — not a new arrangement. To eliminate rotational duplicates, fix one person in place and arrange the remaining n−1 others: (n−1)! arrangements.\n\n7 people at a round table: (7−1)! = 720, not 7! = 5,040.',
      },
    ],

    visualizations: [
      {
        id: 'PascalsTriangleLab',
        title: 'Pascal\'s Geometric Bridge',
        caption: 'Hover over Pascal\'s Triangle to visually decode how C(n,k) maps to a repeating geometric lattice.',
      },
      {
        id: 'PermutationVsCombinationAnimator',
        title: 'Permutation vs Combination: The Overcount Visualized',
        caption: 'Choose 3 from {A,B,C,D,E}. Watch all ordered arrangements appear first, then collapse into unordered groups. See exactly why dividing by k! is correct.',
        props: { animated: true, interactive: true },
      },
      {
        id: 'CombinationVsPermutationLab',
        title: 'The Overcount Compression Engine',
        caption: 'Watch the geometric difference as Combinations physically crush 6 distinct Permutations down into 1 single block.',
      },
      {
        id: 'HandshakeCliqueLab',
        title: 'Handshake Network Builder',
        caption: 'Increase people count and watch pair-lines fill the graph; each line is one unique handshake.',
      },
      {
        id: 'ComplementaryCountingViz',
        title: '"At Least One": Complement in Action',
        caption: 'See a probability space divided into "what you want" and "what you don\'t want." Watch how subtracting the complement is always faster than adding up all the cases.',
        props: { interactive: true },
      },
      {
        id: 'StarsAndBarsLab',
        title: 'Stars and Bars: The Final Boss',
        caption: 'Watch geometrically scattering bars between stars instantly trivializes the most terrifying combination problems.',
      },
      {
        id: 'VennDiagram',
        title: 'Inclusion-Exclusion: The Overlap',
        caption: 'See exactly why raw OR-counts must subtract the intersection once.',
      },
    ],
  },

  rigor: {
    prose: [
      `### Inclusion-Exclusion: The Airtight Version

The Addition Rule works cleanly when groups are disjoint — no overlap. When groups overlap, the naive sum |A| + |B| counts every element in A ∩ B twice. You must subtract it once.

For two sets: |A ∪ B| = |A| + |B| − |A ∩ B|

For three sets: |A ∪ B ∪ C| = |A| + |B| + |C| − |A ∩ B| − |A ∩ C| − |B ∩ C| + |A ∩ B ∩ C|

The pattern: add singletons, subtract pairwise intersections, add triple intersections, subtract quadruple, and so on. The signs alternate, and the reasoning is: adding three singletons counts the triple intersection three times; subtracting pairwise intersections removes it three times (to zero); adding the triple intersection once gives the correct count of 1.

This is the Inclusion-Exclusion Principle, and it generalizes to any number of sets. The formula for n sets involves 2ⁿ − 1 terms. For large n this becomes expensive — but for 2 or 3 sets it's exactly as clean as shown above.

**Application:** How many integers from 1 to 100 are divisible by 2 or by 3?

|A| = ⌊100/2⌋ = 50 (divisible by 2)
|B| = ⌊100/3⌋ = 33 (divisible by 3)
|A ∩ B| = ⌊100/6⌋ = 16 (divisible by both, i.e., by 6)

|A ∪ B| = 50 + 33 − 16 = 67`,

      `### Why Combinatorics Matters for Algorithm Complexity

The State Explosion Problem: in model checking, a program with n boolean variables has 2ⁿ possible states. With 10 variables: 1,024. With 50: 1,125,899,906,842,624. With 300: more states than atoms in the observable universe.

This is why exhaustive testing is impossible for most software. Combinatorics gives you the language to precisely articulate why. "Brute-force checking all states is infeasible because the state space is C(n,k) × k!" is a quantitative engineering statement, not a hand-wave.

Similarly: the number of paths in a decision tree, the number of ways a hash collision could occur, the number of distinct test inputs for a function — all require combinatorial analysis. Estimation before implementation is part of engineering discipline.`,
    ],

    callouts: [],

    visualizations: [
      {
        id: 'InclusionExclusionAnimator',
        title: 'Inclusion-Exclusion: Three Sets, Step by Step',
        caption: 'Watch the three-set inclusion-exclusion formula derived visually. Each step adds or subtracts a region, and the final count is exact.',
        props: { animated: true },
      },
      {
        id: 'StateExplosionViz',
        title: 'The State Explosion Problem',
        caption: 'Add one boolean variable at a time and watch the state space double. See exactly when brute-force becomes infeasible.',
        props: { interactive: true },
      },
    ],
  },

  examples: [
    {
      id: 'discrete-1-04-ex0',
      title: 'Warm-Up: The Slot Machine',
      problem: 'A restaurant has 4 soup choices, 6 main courses, and 3 desserts. A meal is one soup, one main, and one dessert. How many distinct meals?',
      steps: [
        { expression: '\\text{Draw slots: } [\\_] \\times [\\_] \\times [\\_]', annotation: 'Three independent choices — one per course.' },
        { expression: '4 \\times 6 \\times 3 = 72', annotation: 'Multiplication Rule: independent stages multiply.' },
      ],
      conclusion: '72 distinct meals. No formula needed — just the multiplication rule applied directly.',
    },
    {
      id: 'discrete-1-04-ex1',
      title: 'The MISSISSIPPI Protocol',
      problem: 'How many distinct ways can you scramble the letters in the word MISSISSIPPI?',
      steps: [
        { expression: '\\text{Total Letters: } 11', annotation: 'If every letter were unique, answer would be 11!.' },
        { expression: '\\text{Identical groups: } S=4, I=4, P=2, M=1', annotation: 'Swapping identical letters gives the same string — these are phantom arrangements we\'re overcounting.' },
        { expression: '\\frac{11!}{4! \\times 4! \\times 2! \\times 1!}', annotation: 'Divide by factorial of each identical group to eliminate duplicates.' },
        { expression: '= \\frac{39{,}916{,}800}{24 \\times 24 \\times 2 \\times 1} = \\frac{39{,}916{,}800}{1{,}152} = 34{,}650', annotation: '39 million ordered arrangements collapse to 34,650 truly distinct strings.' },
      ],
      conclusion: '34,650. The multinomial coefficient divides out all the identical-item phantom duplicates.',
    },
    {
      id: 'discrete-1-04-ex2',
      title: 'The Complementary Trick ("At Least One")',
      problem: 'How many 5-letter passwords (lowercase only) contain at least one vowel?',
      steps: [
        { expression: '\\text{Direct approach: cases 1 vowel, 2 vowels, ..., 5 vowels} \\Rightarrow \\text{5 separate calculations}', annotation: 'Tedious. Complementary counting is much faster.' },
        { expression: '\\text{Total passwords (no restriction): } 26^5 = 11{,}881{,}376', annotation: '26 options per character, 5 characters, repetition allowed.' },
        { expression: '\\text{Passwords with ZERO vowels (only 21 consonants): } 21^5 = 4{,}084{,}101', annotation: 'The complement: passwords we DON\'T want.' },
        { expression: '26^5 - 21^5 = 11{,}881{,}376 - 4{,}084{,}101 = 7{,}797{,}275', annotation: 'Subtract the complement from the total.' },
      ],
      conclusion: '7,797,275 passwords. Complementary counting turns 5 cases into 1 subtraction.',
    },
    {
      id: 'discrete-1-04-ex3',
      title: 'Permutation vs. Combination: The Role Problem',
      problem: 'From 10 students: (a) choose a committee of 3, (b) choose president, VP, and treasurer.',
      steps: [
        { expression: '\\text{(a) Committee: order does NOT matter}', annotation: 'Alice-Bob-Carol is the same committee as Carol-Bob-Alice.' },
        { expression: 'C(10,3) = \\frac{10!}{3! \\times 7!} = \\frac{10 \\times 9 \\times 8}{3 \\times 2 \\times 1} = 120', annotation: '120 possible committees.' },
        { expression: '\\text{(b) Officers: order DOES matter}', annotation: 'Swapping Alice (president) and Bob (VP) gives a different assignment.' },
        { expression: 'P(10,3) = \\frac{10!}{(10-3)!} = 10 \\times 9 \\times 8 = 720', annotation: '720 possible officer assignments.' },
        { expression: '720 = 120 \\times 6 = C(10,3) \\times 3!', annotation: 'Each committee of 3 can be ordered 3! = 6 ways as officers. P = C × k!' },
      ],
      conclusion: 'Same people, completely different problem structure. The "swap test" is the key: swapping roles changes the outcome → permutation.',
    },
    {
      id: 'discrete-1-04-ex4',
      title: 'Stars and Bars in One Line',
      problem: 'How many ways can you buy exactly 12 donuts from 5 varieties if any variety can repeat?',
      steps: [
        { expression: '\\text{Model: 12 identical stars, 4 bars separating 5 bins}', annotation: '5 bins need 4 separators. Stars are donuts; bars are dividers between varieties.' },
        { expression: '\\star\\star\\star | \\star\\star\\star\\star\\star | \\star\\star | \\star | \\star', annotation: 'This picture means 3 of variety 1, 5 of variety 2, 2 of variety 3, 1 of variety 4, 1 of variety 5.' },
        { expression: '\\text{Total symbols: } 12 + 4 = 16', annotation: 'Choose which 4 positions (out of 16 total) hold the bars.' },
        { expression: '\\binom{16}{4} = \\frac{16!}{4! \\times 12!} = 1820', annotation: 'Equivalently, choose which 12 positions hold the stars.' },
      ],
      conclusion: '1,820 ways. Stars and Bars reduces a seemingly complex repetition problem to a standard combination.',
    },
  ],

  challenges: [
    {
      id: 'discrete-1-04-ch0',
      difficulty: 'easy',
      problem: 'How many distinct 7-character license plates can be formed using 3 letters followed by 4 digits, with repetition allowed?',
      hint: 'Draw the 7-slot machine. Letters: 26 options each. Digits: 10 options each.',
      walkthrough: [
        { expression: '[\\_ \\_ \\_] \\times [\\_ \\_ \\_ \\_]', annotation: 'Three independent letter slots, four independent digit slots.' },
        { expression: '26^3 \\times 10^4 = 17{,}576 \\times 10{,}000', annotation: 'Multiplication Rule.' },
        { expression: '= 175{,}760{,}000', annotation: '175 million possible plates.' },
      ],
      answer: '175,760,000',
    },
    {
      id: 'discrete-1-04-ch1',
      difficulty: 'easy',
      problem: 'A class of 20 students has a test. How many ways can 1st, 2nd, and 3rd prize be awarded if no student can win more than one prize?',
      hint: 'Order matters (1st ≠ 2nd ≠ 3rd). No repetition. Use P(n,k).',
      walkthrough: [
        { expression: '\\text{Slot machine: } 20 \\times 19 \\times 18', annotation: '20 choices for 1st, 19 remaining for 2nd, 18 remaining for 3rd.' },
        { expression: 'P(20,3) = \\frac{20!}{17!} = 6840', annotation: 'Or directly: 20 × 19 × 18 = 6,840.' },
      ],
      answer: '6,840 ways to award the three prizes.',
    },
    {
      id: 'discrete-1-04-ch2',
      difficulty: 'medium',
      problem: 'You are sorting 5 identical red marbles and 3 identical blue marbles into a single row. How many distinct arrangements exist?',
      hint: 'This is identical to MISSISSIPPI structure. 8 total objects, 2 groups of identical objects.',
      walkthrough: [
        { expression: '\\text{Total objects: } 8', annotation: 'If all 8 were distinct, there would be 8! = 40,320 arrangements.' },
        { expression: '\\frac{8!}{5! \\times 3!}', annotation: 'Divide by 5! for identical reds, 3! for identical blues.' },
        { expression: '= \\frac{40320}{120 \\times 6} = \\frac{40320}{720} = 56', annotation: 'Collapses to 56.' },
      ],
      answer: '56 distinct arrangements. Note: 8!/(5!×3!) = C(8,5) = C(8,3) — choosing positions for the red marbles is equivalent to choosing positions for the blue ones.',
    },
    {
      id: 'discrete-1-04-ch3',
      difficulty: 'hard',
      problem: '7 lords seated at a round table. How many distinct seating arrangements? (Rotations count as the same.)',
      hint: 'Fix one person in place to eliminate rotational symmetry. Then arrange the remaining 6.',
      walkthrough: [
        { expression: '\\text{Linear arrangements: } 7! = 5040', annotation: 'If the table had labeled seats (straight line), 7! arrangements.' },
        { expression: '\\text{Rotational duplicates: each arrangement has 7 rotations that look identical}', annotation: 'Rotating all seats clockwise by one gives same seating pattern.' },
        { expression: '\\frac{7!}{7} = (7-1)! = 6! = 720', annotation: 'Equivalently: fix Lord 1 in seat A, arrange the other 6 freely.' },
      ],
      answer: '720 distinct circular arrangements.',
    },
    {
      id: 'discrete-1-04-ch4',
      difficulty: 'hard',
      problem: 'Master matrix drill: classify and solve. (a) 6-digit PIN with digit repetition. (b) Select 4 toppings from 9, order irrelevant, no repeats. (c) Distribute 8 identical candies among 3 children, any amount per child.',
      walkthrough: [
        { expression: '(a) \\ \\text{Order matters} + \\text{repetition} \\Rightarrow 10^6 = 1{,}000{,}000', annotation: 'Six independent slots, each with 10 digit options.' },
        { expression: '(b) \\ \\text{Order irrelevant} + \\text{no repetition} \\Rightarrow \\binom{9}{4} = 126', annotation: 'Classic combination.' },
        { expression: '(c) \\ \\text{Order irrelevant} + \\text{repetition} \\Rightarrow \\binom{8+3-1}{3-1} = \\binom{10}{2} = 45', annotation: 'Stars and Bars: 8 stars, 2 bars (3 bins need 2 dividers).' },
      ],
      answer: '(a) 1,000,000; (b) 126; (c) 45',
    },
  ],

  semantics: {
    core: [
      { symbol: 'n!', meaning: 'n factorial — n × (n−1) × ... × 1. Counts arrangements of n distinct objects.' },
      { symbol: 'P(n,k)', meaning: 'Permutation — ordered arrangements of k items from n distinct items. P(n,k) = n!/(n−k)!' },
      { symbol: 'C(n,k) or ⁿCₖ or (n choose k)', meaning: 'Combination — unordered selections of k items from n. C(n,k) = n!/(k!(n−k)!)' },
      { symbol: 'nᵏ', meaning: 'Arrangements with repetition — n choices per position, k positions' },
      { symbol: 'C(n+k−1, k−1)', meaning: 'Combinations with repetition (Stars and Bars) — distributing k identical items into n bins' },
      { symbol: '|A ∪ B|', meaning: 'Inclusion-Exclusion: |A| + |B| − |A ∩ B|' },
    ],
    rulesOfThumb: [
      'Draw slots FIRST. Fill each slot with its option count. Multiply (AND) or add (OR — only if disjoint).',
      '"At least one" → complementary counting. Total minus "zero of what you want."',
      '"Does swapping two selected items change the outcome?" YES → permutation, NO → combination.',
      'Identical objects in arrangements → divide by their factorial counts.',
      'Circular arrangements → fix one object, arrange n−1 others: (n−1)!',
      'Stars and Bars: n identical items into k bins = C(n+k−1, k−1).',
    ],
  },

  spiral: {
    recoveryPoints: [
      {
        lessonId: 'discrete-1-01b-logic-and-proofs',
        label: 'Logic and Proofs',
        note: 'The Binomial Theorem can be proven by induction. Inclusion-Exclusion requires careful logical case analysis.',
      },
      {
        lessonId: 'discrete-1-03',
        label: 'Induction and Recursion',
        note: 'Pascal\'s triangle identity C(n,k) = C(n−1,k−1) + C(n−1,k) is proven by induction.',
      },
    ],
    futureLinks: [
      {
        lessonId: 'discrete-1-06-probability',
        label: 'Probability',
        note: 'Counting is the foundation of discrete probability. P(event) = (favorable outcomes)/(total outcomes) requires counting both.',
      },
      {
        lessonId: 'discrete-2-01-algorithm-analysis',
        label: 'Algorithm Analysis',
        note: 'Combinatorial explosion explains why certain brute-force algorithms are infeasible and why heuristics and pruning are necessary.',
      },
    ],
  },

  mentalModel: [
    'Counting = structured decision trees. AND → multiply branches. OR (disjoint) → add totals.',
    'Order matters → permutation. Order irrelevant → combination. P = C × k!',
    'Identical objects create phantom duplicates. Divide by factorial of each identical group.',
    '"At least one" → complement: total minus "none of what you want."',
    'Stars and Bars: identical items + bins = choosing bar positions among stars.',
    'The state space of n binary variables is 2ⁿ. This number becomes astronomically large very quickly.',
  ],

  assessment: {
    questions: [
      {
        id: 'co-assess-1',
        type: 'choice',
        text: 'You want to choose 4 books from a shelf of 10 to bring on a trip. You don\'t care about the reading order. Which formula applies?',
        options: ['P(10,4)', 'C(10,4)', '10⁴', '10!'],
        answer: 'C(10,4)',
        hint: 'Swapping two chosen books doesn\'t change your selection. Order doesn\'t matter → combination.',
      },
      {
        id: 'co-assess-2',
        type: 'input',
        text: 'How many 3-letter arrangements of the letters A, B, C, D, E are possible (no repetition)?',
        answer: '60',
        hint: 'P(5,3) = 5 × 4 × 3 = 60. Order matters, no repetition.',
      },
      {
        id: 'co-assess-3',
        type: 'choice',
        text: 'Why does the formula for multiset permutations (arrangements of objects with repeats) divide by the factorial of each repeated group?',
        options: [
          'To adjust for the larger number of objects',
          'Because identical objects create indistinguishable swap arrangements that should not be counted separately',
          'To convert permutations into combinations',
          'Because factorials cancel in the formula',
        ],
        answer: 'Because identical objects create indistinguishable swap arrangements that should not be counted separately',
        hint: 'In BOOT, swapping the two O\'s gives the same word. The division removes these phantom duplicates.',
      },
    ],
  },

  quiz: [
    {
      id: 'co-q1',
      type: 'choice',
      text: 'How many 4-digit PINs are possible (digits 0–9, repetition allowed)?',
      options: ['10 × 9 × 8 × 7', '10!', '10⁴', 'C(10,4)'],
      answer: '10⁴',
      hints: ['Each digit is chosen independently from 10 options. Order matters and repetition is allowed: 10⁴ = 10,000.'],
    },
    {
      id: 'co-q2',
      type: 'choice',
      text: 'P(n,k) = C(n,k) × k!. What does this relationship tell you?',
      options: [
        'Permutations and combinations are always equal',
        'Each unordered combination corresponds to k! ordered permutations (all ways to order the same k items)',
        'You must always use permutations before combinations',
        'k! is a correction factor for identical objects',
      ],
      answer: 'Each unordered combination corresponds to k! ordered permutations (all ways to order the same k items)',
      hints: ['C(n,k) selects which k items. Multiplying by k! then orders them. P(n,k) selects AND orders.'],
    },
    {
      id: 'co-q3',
      type: 'choice',
      text: '"How many passwords of length 8 contain at least one uppercase letter?" The fastest solution strategy is:',
      options: [
        'Count passwords with exactly 1, 2, 3, ... 8 uppercase letters and add',
        'Total passwords minus passwords with ZERO uppercase letters',
        'Use Stars and Bars',
        'Use inclusion-exclusion on uppercase and lowercase sets',
      ],
      answer: 'Total passwords minus passwords with ZERO uppercase letters',
      hints: ['"At least one" always signals complementary counting. Total − (complement where NONE satisfy the condition).'],
    },
    {
      id: 'co-q4',
      type: 'choice',
      text: 'You want to distribute 7 identical coins among 4 people (some may get zero coins). How many ways?',
      options: ['4⁷', 'P(7,4)', 'C(7,4)', 'C(7+4−1, 4−1) = C(10,3) = 120'],
      answer: 'C(7+4−1, 4−1) = C(10,3) = 120',
      hints: ['Identical items + distinct bins + repetition = Stars and Bars. n=7, k=4: C(7+4−1, 4−1) = C(10,3) = 120.'],
    },
  ],

  checkpoints: [
    'read-intuition',
    'read-math',
    'read-rigor',
    'completed-example-1',
    'completed-example-2',
    'completed-example-3',
    'completed-example-4',
    'attempted-challenge-easy',
    'attempted-challenge-medium',
    'attempted-challenge-hard',
  ],
}
