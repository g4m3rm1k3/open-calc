export default {
  id: 'stat4-005',
  slug: 'counting-principles',
  chapter: 'stat4',
  order: 5,
  title: 'Counting Principles: Permutations and Combinations',
  subtitle: 'Count ordered arrangements and unordered selections to compute classical probabilities for complex events.',
  tags: ['permutations', 'combinations', 'factorial', 'counting', 'fundamental counting principle', 'binomial coefficient', 'classical probability', 'with replacement', 'without replacement'],
  aliases: 'permutations combinations factorial counting nCr nPr binomial coefficient fundamental counting principle arrangements selections poker birthday problem',
  timeToComplete: 40,
  coreConcept: `Classical probability requires counting outcomes. When outcomes are ordered arrangements, use permutations P(n,r) = n!/(nâˆ’r)!. When outcomes are unordered selections, use combinations C(n,r) = n!/[r!(nâˆ’r)!]. The key question is always: does order matter?`,
  prerequisites: ['stat4-001'],
  nextLesson: 'stat4-006',

  hook: {
    question: `A 4-digit PIN uses digits 0â€“9 with no repeats. How many valid PINs exist? Your online banking requires the last 4 digits of your Social Security Number â€” which is NOT a chosen PIN. Does randomness vs. choice affect how likely a brute-force attacker is to guess it on the first try?`,
    realWorldContext: `Counting principles are the machinery behind classical probability for complex sample spaces. Every time a statistician computes the probability of a specific poker hand, a lottery organizer determines the odds of jackpot, or a cryptographer calculates how many keys an attacker must try, they are applying permutations and combinations. The Birthday Problem â€” that in a group of just 23 people there is greater than 50% probability of a shared birthday â€” is a counting result that surprises virtually everyone who encounters it for the first time.`,
  },

  intuition: {
    prose: [
      `**The Fundamental Counting Principle.** If an experiment has two stages â€” first choosing from $m$ options, then from $n$ options independently â€” there are $m \\times n$ total possible outcomes. This extends to any number of stages: for a 4-digit PIN (digits 0â€“9, no repeats), stage 1 has 10 choices, stage 2 has 9, stage 3 has 8, stage 4 has 7 â€” total $10 \\times 9 \\times 8 \\times 7 = 5040$ PINs.`,

      `**Factorial notation.** $n! = n \\times (n-1) \\times (n-2) \\times \\cdots \\times 2 \\times 1$. This counts the number of ways to arrange $n$ distinct objects in a sequence. $5! = 120$ arrangements of 5 books. Convention: $0! = 1$ (there is exactly one way to arrange nothing â€” this makes the formulas consistent).`,

      `**Permutations: when order matters.** A permutation is an ordered arrangement of $r$ items chosen from $n$ distinct items. $$P(n, r) = \\frac{n!}{(n-r)!} = n(n-1)(n-2)\\cdots(n-r+1)$$ Example: 3 students receiving 1st, 2nd, and 3rd place from a class of 20 is $P(20, 3) = 20 \\times 19 \\times 18 = 6840$. Why not $20!$? Because only 3 positions are filled â€” after the 3rd choice, we stop. The $(20-3)! = 17!$ leftover arrangements don't matter.`,

      `**Before reading on, predict:** A lottery draws 6 numbers from 1â€“49 (no repeats). Is this a permutation or a combination? Does the order in which the numbers are drawn affect whether you win?`,

      `**Combinations: when order doesn't matter.** A combination is an unordered selection of $r$ items from $n$ distinct items. $$C(n, r) = \\binom{n}{r} = \\frac{n!}{r!(n-r)!} = \\frac{P(n,r)}{r!}$$ Dividing by $r!$ removes the overcounting of the same group in different orders. Example: a 5-person committee from 20 people is $C(20, 5) = 15504$. The same 5 people regardless of the sequence they were selected.`,

      `**The key question: does order matter?** Ranked outcomes (1st/2nd/3rd prize, ordered passwords, sequential processes) â†’ permutations. Unranked selections (committees, card hands, lottery tickets) â†’ combinations. When in doubt, ask: "Would swapping two items produce a different outcome?" If yes â†’ permutation. If no â†’ combination.`,

      `**With vs. without replacement.** With replacement: all $n$ options are available every time â†’ $n^r$ sequences for $r$ choices. Without replacement: each choice removes an option â†’ $P(n,r)$ ordered sequences or $C(n,r)$ unordered subsets. Drawing cards is always without replacement from the original deck; rolling dice is always with replacement.`,

      `**The symmetry property.** $C(n, r) = C(n, n-r)$. Choosing 3 items from 10 to *include* = choosing 7 items to *exclude*. So $C(52, 47) = C(52, 5) = 2{,}598{,}960$. This symmetry often allows you to use the smaller number in the denominator for easier computation.`,
    ],
    callouts: [
      {
        type: 'insight',
        title: 'Order Matters â†’ Permutations; Order Doesn\'t â†’ Combinations',
        body: `- **Permutation examples:** PIN codes, race finishes, ranked prize lists, DNA sequences, ordered passwords.
- **Combination examples:** committee selections, lottery tickets, poker hands, choosing which courses to take.

Quick test: swap two chosen items. If it creates a different outcome â†’ permutation. If it creates the same outcome â†’ combination.

Relationship: $C(n,r) = P(n,r)/r!$ â€” each combination corresponds to $r!$ permutations of the same items.`,
      },
      {
        type: 'procedure',
        title: 'Computing Classical Probability with Counting',
        body: `1. Identify the sample space â€” total equally-likely outcomes (often $C(n,r)$ or $P(n,r)$).
2. Count favorable outcomes â€” use counting rules with the constraints applied.
3. $P(A) = \\text{favorable} / \\text{total}$.

**Example:** P(exactly 2 aces in a 5-card hand) = $C(4,2) \\times C(48,3) / C(52,5)$.
- $C(4,2)$: choose 2 aces from 4
- $C(48,3)$: choose 3 non-aces from 48
- $C(52,5)$: total 5-card hands`,
      },
    ],
    visualizations: [],
  },

  math: {
    prose: [
      `**Deriving the combination formula.** From $P(n, r) = n!/(n-r)!$ ordered arrangements, each unordered subset of $r$ items appears exactly $r!$ times (one for each ordering). Therefore: $C(n, r) = P(n, r) / r! = n! / [r!(n-r)!]$. The binomial coefficient $\\binom{n}{r}$ notation emphasizes the connection to the Binomial Theorem: $(a+b)^n = \\sum_{r=0}^{n} \\binom{n}{r} a^r b^{n-r}$, where $\\binom{n}{r}$ counts the number of ways to choose $r$ factors of $a$ from $n$ factors of $(a+b)$.`,

      `**Pascal's Triangle.** The binomial coefficients satisfy $\\binom{n}{r} = \\binom{n-1}{r-1} + \\binom{n-1}{r}$. This recurrence generates Pascal's Triangle and provides an integer-valued recursive computation that avoids large factorials. Row $n$ of Pascal's Triangle is $\\binom{n}{0}, \\binom{n}{1}, \\ldots, \\binom{n}{n}$, and their sum is $2^n$ (the total number of subsets of an $n$-element set).`,

      `**Multinomial counting.** When items are divided into $k$ groups of sizes $n_1, n_2, \\ldots, n_k$ (with $n_1 + \\cdots + n_k = n$), the number of arrangements is the multinomial coefficient: $\\binom{n}{n_1, n_2, \\ldots, n_k} = \\frac{n!}{n_1! n_2! \\cdots n_k!}$. Example: the number of distinct arrangements of the word MISSISSIPPI (4 S's, 4 I's, 2 P's, 1 M) is $11!/(4!4!2!1!) = 34650$.`,
    ],
    callouts: [],
  },

  rigor: {
    prose: [
      `**Counting problems as bijections.** The core technique in combinatorics is establishing a bijection (one-to-one correspondence) between the set to be counted and a set whose size is known. Permutations biject with sequences in $\\{1,\\ldots,n\\}^r$ (injections); combinations biject with characteristic vectors in $\\{0,1\\}^n$ with exactly $r$ ones. Many advanced counting proofs â€” stars and bars, generating functions, the Principle of Inclusion-Exclusion â€” are ultimately about finding the right bijection.`,

      `**Stars and bars.** The number of ways to distribute $k$ identical objects into $n$ distinct bins (allowing empty bins) is $C(n + k - 1, k)$. This is the "stars and bars" formula. It is the combinatorial interpretation of combinations with repetition (order doesn't matter, items can repeat). Example: 5 identical apples into 3 distinct boxes: $C(7, 5) = 21$ ways.`,
    ],
  },

  examples: [
    {
      id: 'ex1',
      title: 'Example 1 â€” Prizes and Committees from a Class of 12',
      prose: `A class of 12 students. (a) How many ways can 3 students win ranked prizes (1st/2nd/3rd)? (b) How many 3-person study groups can be formed? (c) If a group is chosen at random, what is the probability it contains both Alice and Bob?`,
      steps: [
        { expression: `P(12, 3) = \\frac{12!}{9!} = 12 \\times 11 \\times 10 = 1320`, annotation: `Ordered prize assignments â€” 1st â‰  2nd â‰  3rd. Order matters.` },
        { expression: `C(12, 3) = \\frac{12!}{3! \\cdot 9!} = \\frac{1320}{6} = 220`, annotation: `Unordered groups â€” the same 3 students regardless of selection order. $C = P / r! = 1320/6$.` },
        { expression: `\\text{Groups with Alice and Bob: } C(10, 1) = 10`, annotation: `Alice and Bob are fixed; choose 1 more from the remaining 10.` },
        { expression: `P(\\text{Alice and Bob in group}) = \\frac{10}{220} = \\frac{1}{22} \\approx 0.0455`, annotation: `10 favorable outcomes out of 220 equally-likely groups.` },
      ],
    },
    {
      id: 'ex2',
      title: 'Example 2 â€” 5-Card Poker Hands',
      prose: `Compute: (a) total 5-card hands, (b) number of hands with exactly 3 hearts, (c) P(exactly 3 hearts), (d) number of full houses (3 of one rank, 2 of another).`,
      steps: [
        { expression: `C(52, 5) = 2{,}598{,}960`, annotation: `Total 5-card hands from 52 cards â€” order irrelevant (your hand is the same regardless of deal order).` },
        { expression: `C(13, 3) \\times C(39, 2) = 286 \\times 741 = 211{,}926`, annotation: `Choose 3 hearts from 13, then 2 non-hearts from the remaining 39.` },
        { expression: `P(\\text{exactly 3 hearts}) = \\frac{211{,}926}{2{,}598{,}960} \\approx 0.0815`, annotation: `About 8.2% of 5-card hands contain exactly 3 hearts.` },
        { expression: `C(13,1) \\times C(4,3) \\times C(12,1) \\times C(4,2) = 13 \\times 4 \\times 12 \\times 6 = 3{,}744`, annotation: `Choose rank for triple (13); choose 3 suits of 4 for triple (C(4,3)=4); choose rank for pair from remaining 12; choose 2 suits of 4 for pair (C(4,2)=6).` },
      ],
    },
    {
      id: 'ex3',
      title: 'Example 3 â€” Birthday Problem',
      prose: `What is the probability that at least 2 people in a group of 23 share a birthday? (Assume 365 days, equally likely, independent birthdays.)`,
      steps: [
        { expression: `P(\\text{all different}) = \\frac{365}{365} \\times \\frac{364}{365} \\times \\cdots \\times \\frac{343}{365} = \\frac{365 \\times 364 \\times \\cdots \\times 343}{365^{23}}`, annotation: `Person 1 can have any birthday; person 2 must avoid person 1's; and so on. This is sequential counting without replacement in 365 slots.` },
        { expression: `P(\\text{all different}) = \\frac{P(365, 23)}{365^{23}} \\approx 0.4927`, annotation: `Using permutation formula for ordered sampling without replacement.` },
        { expression: `P(\\text{at least one shared}) = 1 - 0.4927 \\approx 0.5073`, annotation: `Complement rule. With 23 people, the probability of a shared birthday first exceeds 50%. Most people expect this to require ~183 people â€” the birthday problem is a famous counterintuitive result.` },
      ],
    },
  ],

  challenges: [
    {
      id: 'ch1',
      difficulty: 'easy',
      problem: `(a) How many ways can 5 books be arranged on a shelf? (b) How many 3-book subsets can be chosen from those 5 books? (c) A security badge has a 6-character code using uppercase letters Aâ€“Z (no repeats, order matters). How many valid codes are there? (d) Verify: C(15, 12) using the symmetry property.`,
      walkthrough: [
        `(a) All 5 books are arranged in order â†’ $5! = 120$ arrangements.

(b) Choose 3 from 5, order irrelevant â†’ $C(5, 3) = 5!/(3! \\cdot 2!) = 10$ subsets.

(c) 6-character ordered code from 26 letters, no repeats â†’ $P(26, 6) = 26 \\times 25 \\times 24 \\times 23 \\times 22 \\times 21 = 165{,}765{,}600$ codes.

(d) $C(15, 12) = C(15, 3)$ by symmetry ($12 = 15 - 3$). $C(15, 3) = (15 \\times 14 \\times 13)/(3 \\times 2 \\times 1) = 2730/6 = 455$.`,
      ],
    },
    {
      id: 'ch2',
      difficulty: 'medium',
      problem: `A committee of 5 is chosen at random from 8 men and 6 women (14 people total). (a) How many total committees exist? (b) How many have exactly 3 women? (c) P(exactly 3 women)? (d) How many have at least 1 woman? (e) P(at least 1 woman)?`,
      walkthrough: [
        `(a) $C(14, 5) = 14!/(5! \\cdot 9!) = 2002$ total committees.

(b) Exactly 3 women: choose 3 from 6 women AND 2 from 8 men.
$C(6, 3) \\times C(8, 2) = 20 \\times 28 = 560$.

(c) $P(\\text{exactly 3 women}) = 560/2002 \\approx 0.2797$.

(d) Complement: "at least 1 woman" = 1 âˆ’ "all men."
All-men committees: $C(8, 5) = 56$.
Committees with at least 1 woman: $2002 - 56 = 1946$.

(e) $P(\\text{at least 1 woman}) = 1946/2002 \\approx 0.9720$.`,
      ],
    },
  ],

  python: {
    cells: [
      {
        id: 'py1',
        cellTitle: 'Factorial, Permutations, and Combinations',
        prose: `Python's math module provides exact integer arithmetic for these computations, which is essential since factorials grow astronomically fast.`,
        code: `import math
import matplotlib.pyplot as plt
import numpy as np

# â”€â”€ Factorials â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
print("=== Factorials (n!) ===")
for n in range(0, 13):
    print(f"  {n:2d}! = {math.factorial(n):>15,}")

# â”€â”€ Permutations P(n, r) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
print()
print("=== Permutations P(n, r) = n!/(n-r)! ===")
perm_examples = [(10, 3), (20, 3), (52, 5), (26, 6)]
for n, r in perm_examples:
    result = math.perm(n, r)
    print(f"  P({n:2d}, {r}) = {result:>15,}")

# â”€â”€ Combinations C(n, r) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
print()
print("=== Combinations C(n, r) = n! / [r!(n-r)!] ===")
comb_examples = [(10, 3), (12, 3), (52, 5), (49, 6)]
for n, r in comb_examples:
    result = math.comb(n, r)
    print(f"  C({n:2d}, {r}) = {result:>15,}")

# â”€â”€ Symmetry property â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
print()
print("=== Symmetry: C(n,r) = C(n, n-r) ===")
for n, r in [(10, 3), (52, 5), (15, 12)]:
    print(f"  C({n},{r}) = {math.comb(n,r):,}   =   C({n},{n-r}) = {math.comb(n,n-r):,}")

# â”€â”€ Ratio plot: combinations C(20, r) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
rs = list(range(0, 21))
combs = [math.comb(20, r) for r in rs]

fig, ax = plt.subplots(figsize=(9, 4))
ax.bar(rs, combs, color='steelblue', alpha=0.85, edgecolor='white')
ax.set_xlabel('r (number chosen)')
ax.set_ylabel('C(20, r)')
ax.set_title('Binomial Coefficients C(20, r)  â€” symmetric around r=10')
ax.set_xticks(rs)
plt.tight_layout()
plt.show()`,
      },
      {
        id: 'py2',
        cellTitle: 'Poker Hand Probabilities',
        prose: `Use combinations to compute exact probabilities for 5-card poker hands from a 52-card deck.`,
        code: `import math
import matplotlib.pyplot as plt

def C(n, r):
    if r < 0 or r > n:
        return 0
    return math.comb(n, r)

total = C(52, 5)
print(f"Total 5-card hands: C(52,5) = {total:,}")
print()

# Hand counts (exact combinatorial formulas)
hands = {
    'Royal Flush':             4,
    'Straight Flush (non-R)': 36,
    'Four of a Kind':          C(13,1) * C(4,4) * C(48,1),
    'Full House':              C(13,1) * C(4,3) * C(12,1) * C(4,2),
    'Flush (not straight)':    4 * C(13,5) - 40,
    'Straight (not flush)':    10*4**5 - 40,
    'Three of a Kind':         C(13,1)*C(4,3)*C(12,2)*4*4,
    'Exactly 3 Hearts':        C(13,3) * C(39,2),
}

print(f"{'Hand':<24} | {'Count':>12} | {'Probability':>14}")
print("-" * 56)
for name, count in hands.items():
    prob = count / total
    print(f"{name:<24} | {count:>12,} | {prob:>14.6f}")

# Bar chart (log scale)
fig, ax = plt.subplots(figsize=(10, 5))
probs = [c / total for c in hands.values()]
ax.bar(hands.keys(), probs, color='steelblue', alpha=0.85, edgecolor='white')
ax.set_yscale('log')
ax.set_ylabel('Probability (log scale)')
ax.set_title('5-Card Poker Hand Probabilities')
plt.xticks(rotation=25, ha='right')
plt.tight_layout()
plt.show()`,
      },
      {
        id: 'py3',
        cellTitle: 'Birthday Problem',
        prose: `The Birthday Problem is one of the most famous counterintuitive probability results. With just 23 people, the probability of a shared birthday exceeds 50%.`,
        code: `import numpy as np
import matplotlib.pyplot as plt

def p_shared_birthday(n, days=365):
    """P(at least 2 people share a birthday in a group of n)."""
    if n > days:
        return 1.0
    p_all_diff = 1.0
    for k in range(n):
        p_all_diff *= (days - k) / days
    return 1 - p_all_diff

print(f"{'Group size n':>14} | {'P(shared birthday)':>20} | Visual")
print("-" * 60)
for n in [10, 15, 20, 23, 25, 30, 40, 50, 57, 70]:
    p = p_shared_birthday(n)
    bar = 'â–ˆ' * int(p * 40)
    mark = ' â† > 50%!' if n == 23 else ''
    print(f"{n:>14} | {p:>20.4f} | {bar}{mark}")

# Plot
ns = np.arange(1, 71)
probs = [p_shared_birthday(n) for n in ns]

fig, ax = plt.subplots(figsize=(10, 4))
ax.plot(ns, probs, color='steelblue', lw=2)
ax.axhline(0.5, color='red', linestyle='--', lw=1.5, label='P = 0.5')
ax.axvline(23, color='coral', linestyle='--', lw=1.5, label='n = 23 (P > 50%)')
ax.scatter([23], [p_shared_birthday(23)], color='red', s=80, zorder=5)
ax.set_xlabel('Group size (n)')
ax.set_ylabel('P(at least one shared birthday)')
ax.set_title('Birthday Problem: P(shared birthday) vs. Group Size')
ax.legend()
ax.set_xlim(0, 70)
ax.set_ylim(0, 1.05)
plt.tight_layout()
plt.show()`,
      },
    ],
  },

  quiz: [
    {
      type: 'choice',
      question: `The number of ways to arrange all 5 books on a shelf uses:`,
      options: [`C(5, 5)`, `P(5, 5) = 5!`, `C(5, 3)`, `5Â²`],
      answer: `P(5, 5) = 5!`,
      hints: [`All 5 items arranged in order â†’ permutation P(5,5) = 5! = 120.`],
      reviewSection: 'intuition',
    },
    {
      type: 'choice',
      question: `C(8, 3) = ?`,
      options: [`24`, `56`, `336`, `512`],
      answer: `56`,
      hints: [`C(8,3) = 8! / (3! Ã— 5!) = 8Ã—7Ã—6 / (3Ã—2Ã—1) = 336/6 = 56.`],
      reviewSection: 'intuition',
    },
    {
      type: 'choice',
      question: `C(15, 12) using the symmetry property = ?`,
      options: [`1365`, `2730`, `455`, `105`],
      answer: `455`,
      hints: [`C(15, 12) = C(15, 3) by symmetry. C(15,3) = 15Ã—14Ã—13 / 6 = 455.`],
      reviewSection: 'intuition',
    },
    {
      type: 'choice',
      question: `A president, VP, and secretary are elected from 10 candidates. How many outcomes?`,
      options: [`120`, `720`, `1000`, `10`],
      answer: `720`,
      hints: [`Order matters (president â‰  VP). P(10, 3) = 10 Ã— 9 Ã— 8 = 720.`],
      reviewSection: 'intuition',
    },
    {
      type: 'choice',
      question: `A lottery picks 6 numbers from 1â€“49 (no repeats, order irrelevant). Total outcomes?`,
      options: [`C(49, 6) = 13,983,816`, `P(49, 6) = 10,068,347,520`, `49â¶`, `49 Ã— 6`],
      answer: `C(49, 6) = 13,983,816`,
      hints: [`Order does not matter â†’ combinations. C(49,6) = 49!/(6!Ã—43!).`],
      reviewSection: 'intuition',
    },
    {
      type: 'choice',
      question: `How many 2-letter codes (order matters, no repeats) can be formed from 26 letters?`,
      options: [`650`, `325`, `676`, `52`],
      answer: `650`,
      hints: [`P(26, 2) = 26 Ã— 25 = 650. With replacement (repeats allowed) it would be 26Â² = 676.`],
      reviewSection: 'intuition',
    },
    {
      type: 'choice',
      question: `A committee of 4 is chosen from 9 people. How many possible committees?`,
      options: [`126`, `3024`, `362880`, `504`],
      answer: `126`,
      hints: [`Order doesn't matter â†’ C(9,4) = 9!/(4!Ã—5!) = 9Ã—8Ã—7Ã—6 / 24 = 3024/24 = 126.`],
      reviewSection: 'examples',
    },
    {
      type: 'choice',
      question: `P(exactly 2 aces in a 5-card hand) = C(4,2) Ã— C(48,3) / C(52,5). What does C(48,3) count?`,
      options: [
        `The number of ways to choose 3 aces from the remaining 48 cards`,
        `The number of ways to choose 3 non-ace cards from the 48 non-aces`,
        `The total number of 5-card hands containing at least 2 aces`,
        `The number of ordered 3-card arrangements from 48 cards`,
      ],
      answer: `The number of ways to choose 3 non-ace cards from the 48 non-aces`,
      hints: [`After fixing the 2 aces (from C(4,2)), the other 3 cards must come from the 48 non-aces.`],
      reviewSection: 'examples',
    },
    {
      type: 'choice',
      question: `A network switch has 8 ports; 3 distinct servers are each assigned to a different port. How many valid assignments?`,
      options: [`24`, `56`, `336`, `512`],
      answer: `336`,
      hints: [`3 distinct servers assigned to ordered positions â†’ P(8, 3) = 8Ã—7Ã—6 = 336. (Servers are distinct, so order matters.)` ],
      reviewSection: 'intuition',
    },
    {
      type: 'choice',
      question: `A DNA codon uses 3 bases drawn from the 4 options (A, T, C, G) with no base repeating. How many distinct codons exist?`,
      options: [`24`, `64`, `12`, `6`],
      answer: `24`,
      hints: [`Ordered selection, no repeats: P(4, 3) = 4 Ã— 3 Ã— 2 = 24. Order matters (ATG â‰  TAG), and each base can only appear once.`],
      reviewSection: 'intuition',
    },
  ],

  checkpoints: [
    { id: 'cp1', label: 'Compute 7!', type: 'recall' },
    { id: 'cp2', label: 'How many ways can a president, VP, and treasurer be chosen from a club of 15 members?', type: 'application' },
    { id: 'cp3', label: 'How many 3-person committees can be chosen from 15 members?', type: 'application' },
    { id: 'cp4', label: 'Run Python Cell 3: verify that 23 people gives P(shared birthday) > 0.5', type: 'lab' },
    { id: 'cp5', label: 'Why is C(52,5) = C(52,47)? Explain the symmetry.', type: 'concept' },
    { id: 'cp6', label: 'Pass the quiz with â‰¥ 80%', type: 'quiz' },
  ],

  definitions: [
    { term: 'Factorial', definition: 'n! = nÃ—(nâˆ’1)Ã—â‹¯Ã—2Ã—1. Counts the number of ways to arrange n distinct objects. Convention: 0! = 1.', symbol: 'n!' },
    { term: 'Permutation', definition: 'P(n,r) = n!/(nâˆ’r)! â€” ordered arrangements of r items chosen from n distinct items. Order matters.', symbol: 'P(n,r)' },
    { term: 'Combination', definition: 'C(n,r) = n!/[r!(nâˆ’r)!] â€” unordered selections of r items from n. Order does not matter. Equal to P(n,r)/r!.', symbol: 'C(n,r) or â¿Cáµ£' },
    { term: 'Binomial coefficient', definition: 'Another name for C(n,r), written â¿Cáµ£ or (n choose r). Appears in the Binomial Theorem and Pascal\'s Triangle.', symbol: '(â¿áµ£)' },
    { term: 'Fundamental Counting Principle', definition: 'If stage 1 has m choices and stage 2 has n choices (independently), there are mÃ—n total outcomes. Extends to any number of stages.', symbol: null },
  ],
};
