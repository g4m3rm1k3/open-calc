export default {
  id: 'stat4-005',
  title: 'Counting Principles: Permutations and Combinations',
  description: 'Count ordered arrangements (permutations) and unordered selections (combinations) to compute classical probabilities for complex events.',
  prerequisites: ['stat4-001'],
  coreConcept: 'Classical probability requires counting outcomes. When outcomes are arrangements, use permutations nPr. When outcomes are selections where order does not matter, use combinations nCr. The key question: does order matter?',

  prose: [
    '**A 4-digit PIN using digits 0–9 (no repeats).** How many PINs are possible? First digit: 10 choices. Second: 9 (one used). Third: 8. Fourth: 7. Total: 10 × 9 × 8 × 7 = 5040. This is the *Fundamental Counting Principle*: if step 1 has m choices and step 2 has n choices independently, there are m × n total choices.',
    '**Factorial notation.** n! = n × (n−1) × (n−2) × … × 2 × 1. This counts the number of ways to arrange n distinct items in a line. 5! = 120 arrangements of 5 books. 0! = 1 by convention (there is exactly one way to arrange nothing).',
    '**Permutations nPr.** A *permutation* is an ordered arrangement of r items chosen from n distinct items. $$P(n,r) = \\frac{n!}{(n-r)!}$$ Example: the number of ways 3 students can receive 1st, 2nd, and 3rd prize from a class of 20 is P(20, 3) = 20!/17! = 20 × 19 × 18 = 6840.',

    { type: 'callout', variant: 'insight', body: '**Order matters → Permutations.** Order does not matter → Combinations. PIN codes, race finishes, ranked lists: permutations. Committee selections, lottery tickets, card hands: combinations.' },

    '**Combinations nCr.** A *combination* is an unordered selection of r items from n distinct items. $$C(n,r) = \\binom{n}{r} = \\frac{n!}{r!(n-r)!}$$ Example: choosing 3 students for a committee from 20 is C(20, 3) = 1140. Each group of 3 appears once (not 3! = 6 times as in permutations), so C(n,r) = P(n,r) / r!.',

    { type: 'prediction', prompt: 'Before computing: how many 5-card hands can be dealt from a 52-card deck? Is this a permutation or a combination? (Hint: does the order in which you receive the cards change your hand?)' },

    '**Connecting to probability.** Once you can count the number of favourable outcomes and total outcomes, classical probability applies. P(5-card flush) = (number of flush hands) / C(52,5). P(all 5 cards from same suit) = 4 × C(13,5) / C(52,5) = 4 × 1287 / 2598960 ≈ 0.00198.',
    '**With vs. without replacement.** Counting rules differ. With replacement: n choices each time, so nʳ total sequences. Without replacement: permutations give P(n,r) ordered sequences, combinations give C(n,r) unordered subsets.',
    '**The Binomial Coefficient property.** C(n,r) = C(n, n−r). Choosing 3 items from 10 to include = choosing 7 to exclude. This symmetry is often useful: C(52, 47) = C(52, 5) = 2,598,960.',
  ],

  checkpoints: [
    { id: 'stat4-005-cp1', label: 'Compute 7!', type: 'recall' },
    { id: 'stat4-005-cp2', label: 'How many ways can a president, VP, and treasurer be chosen from a club of 15 members?', type: 'application' },
    { id: 'stat4-005-cp3', label: 'How many 3-person committees can be chosen from 15 members?', type: 'application' },
    { id: 'stat4-005-cp4', label: 'A lottery draws 6 numbers from 1–49. Is this a permutation or combination? Why?', type: 'concept' },
    { id: 'stat4-005-cp5', label: 'Compute C(10, 4).', type: 'recall' },
    { id: 'stat4-005-cp6', label: 'Using the symmetry property: C(100, 97) = ?', type: 'application' },
    { id: 'stat4-005-cp7', label: 'From a class of 8, how many ways to assign 1st, 2nd, 3rd place in a spelling bee?', type: 'application' },
    { id: 'stat4-005-cp8', label: 'A bag has 4 red, 3 blue chips. One chip is drawn. How does C(7,1) relate to the sample space?', type: 'concept' },
  ],

  workedExample: {
    problem: 'A class of 12 students. (a) How many ways can 3 win ranked prizes (1st/2nd/3rd)? (b) How many 3-person study groups can be formed? (c) If a group is chosen at random, what is the probability that it contains both Alice and Bob?',
    steps: [
      { expression: 'P(12,3) = \\frac{12!}{9!} = 12\\times11\\times10 = 1320', annotation: 'Ordered prize assignments — order matters (1st ≠ 2nd).' },
      { expression: 'C(12,3) = \\frac{12!}{3!\\cdot9!} = \\frac{1320}{6} = 220', annotation: 'Unordered groups — order does not matter.' },
      { expression: '\\text{Groups with Alice and Bob} = C(10,1) = 10', annotation: 'Alice and Bob are fixed in the group; choose 1 more from the remaining 10.' },
      { expression: 'P(\\text{Alice and Bob in group}) = \\frac{10}{220} = \\frac{1}{22} \\approx 0.0455', annotation: '10 favourable outcomes out of 220 equally-likely groups.' },
    ],
    answer: '(a) 1320 ranked assignments; (b) 220 groups; (c) P ≈ 0.0455.',
  },

  challenge: {
    problem: 'A 5-card hand from a 52-card deck. (a) Total 5-card hands. (b) Number of hands with exactly 3 hearts. (c) P(exactly 3 hearts). (d) Number of full houses (3 of one rank + 2 of another).',
    steps: [
      { expression: 'C(52,5) = 2{,}598{,}960', annotation: 'Total 5-card hands (order irrelevant).' },
      { expression: 'C(13,3)\\times C(39,2) = 286\\times 741 = 211{,}926', annotation: 'Choose 3 hearts from 13, then 2 non-hearts from 39.' },
      { expression: 'P(\\text{exactly 3 hearts})=\\frac{211{,}926}{2{,}598{,}960}\\approx 0.0815', annotation: 'About 8.2% of hands have exactly 3 hearts.' },
      { expression: 'C(13,1)\\times C(4,3)\\times C(12,1)\\times C(4,2)=13\\times4\\times12\\times6=3{,}744', annotation: 'Choose rank for triple: 13 ways. Choose 3 suits from 4: C(4,3)=4. Choose rank for pair: 12 remaining. Choose 2 suits from 4: C(4,2)=6.' },
    ],
    answer: 'C(52,5) = 2,598,960; exactly 3 hearts: 211,926 hands; P ≈ 0.0815; full houses: 3,744.',
  },

  assessment: {
    type: 'choice',
    question: 'In how many ways can a committee of 4 be chosen from 9 people?',
    options: ['126', '3024', '362880', '504'],
    answer: '126',
    explanation: 'C(9,4) = 9! / (4! × 5!) = 9×8×7×6 / (4×3×2×1) = 3024/24 = 126.',
  },

  quiz: [
    {
      id: 'stat4-005-q1',
      question: 'Computing the number of ways 5 books can be arranged on a shelf uses:',
      options: ['C(5,5)', 'P(5,5) = 5!', 'C(5,3)', '5²'],
      answer: 'P(5,5) = 5!',
      hints: ['All 5 items are being arranged in order.'],
      reviewSection: 'Factorial and permutations',
    },
    {
      id: 'stat4-005-q2',
      question: 'C(8, 3) = ?',
      options: ['24', '56', '336', '512'],
      answer: '56',
      hints: ['C(8,3) = 8! / (3! × 5!) = 8×7×6 / (3×2×1) = 336/6.'],
      reviewSection: 'Combinations nCr',
    },
    {
      id: 'stat4-005-q3',
      question: 'C(15, 12) = ?',
      options: ['1365', '2730', '455', '105'],
      answer: '455',
      hints: ['C(15, 12) = C(15, 3) = 15×14×13 / 6.'],
      reviewSection: 'Binomial Coefficient property',
    },
    {
      id: 'stat4-005-q4',
      question: 'A president, VP, and secretary are elected from 10 candidates. How many outcomes?',
      options: ['120', '720', '1000', '10'],
      answer: '720',
      hints: ['Order matters (president ≠ VP). P(10, 3) = 10 × 9 × 8.'],
      reviewSection: 'Permutations nPr',
    },
    {
      id: 'stat4-005-q5',
      question: 'A lottery picks 6 numbers from 1–49 (no repeats, order irrelevant). Total outcomes?',
      options: ['C(49, 6) = 13,983,816', 'P(49, 6) = 10,068,347,520', '49⁶', '49 × 6'],
      answer: 'C(49, 6) = 13,983,816',
      hints: ['Order does not matter → combinations. C(49,6).'],
      reviewSection: 'Connecting to probability',
    },
    {
      id: 'stat4-005-q6',
      question: 'How many 2-letter codes (order matters, no repeats) can be formed from 26 letters?',
      options: ['650', '325', '676', '52'],
      answer: '650',
      hints: ['P(26, 2) = 26 × 25 = 650.'],
      reviewSection: 'Permutations nPr',
    },
  ],

  misconceptions: [
    {
      error: 'Using permutations when order does not matter (overcounting by r!).',
      correction: 'If the group {Alice, Bob, Carol} is the same regardless of how it was listed, use combinations. Divide by r! to correct for the overcounting.',
    },
    {
      error: 'Confusing "without replacement" counting with "with replacement."',
      correction: 'Without replacement, each draw reduces the available pool: P(n,r) or C(n,r). With replacement, all n choices are available every time: nʳ sequences.',
    },
    {
      error: '0! = 0.',
      correction: '0! = 1. This is not arbitrary — there is exactly one way to arrange zero objects (do nothing). This makes C(n, 0) = 1 and C(n, n) = 1 consistent.',
    },
  ],

  transferPrompts: [
    'A network switch has 8 ports; a technician must assign each of 3 servers to a different port. How many valid assignments exist? Is this a permutation or combination? How would the answer change if the servers are identical (only their location matters)?',
    'A DNA strand is a sequence of 4 bases (A, T, C, G). How many distinct 6-base sequences exist if repeats are allowed? How many if no base repeats?',
  ],

  debugging: [
    {
      symptom: 'C(n, r) gives a larger answer than P(n, r).',
      cause: 'You may have swapped the formulas. Combinations are always ≤ permutations because C(n,r) = P(n,r) / r! and r! ≥ 1.',
      fix: 'Check: C(n,r) = n!/[r!(n-r)!] and P(n,r) = n!/(n-r)!. For r ≥ 2, C < P.',
    },
    {
      symptom: 'Probability from combinations exceeds 1.',
      cause: 'The favourable-outcomes count is larger than the total-outcomes count, which is impossible.',
      fix: 'Recheck the constraint for favourable outcomes. For example, "exactly k hearts" requires choosing k from 13 hearts AND (5−k) from 39 non-hearts.',
    },
  ],

  mastery: {
    targetLevel: 'Apply',
    successCriteria: [
      'Apply the Fundamental Counting Principle to multi-step experiments.',
      'Compute factorials, P(n,r), and C(n,r).',
      'Decide whether a situation calls for permutations or combinations.',
      'Use C(n,r) to compute classical probability for card or lottery problems.',
      'Apply the symmetry C(n,r) = C(n, n−r) to simplify calculations.',
    ],
    commonErrors: ['Using permutations when order irrelevant', 'Treating 0! as 0'],
    prerequisites: ['stat4-001: Introduction to Probability', 'Basic factorial arithmetic'],
    nextSteps: ['stat4-006: Probability Rules Summary'],
  },

  python: {
    cells: [
      {
        id: 'stat4-005-cell-1',
        type: 'python',
        cellTitle: 'Factorial, Permutations, Combinations',
        code: `import math

# Factorial
print("=== Factorials ===")
for n in range(0, 11):
    print(f"  {n}! = {math.factorial(n)}")

print()
print("=== Permutations P(n, r) ===")
def permutations(n, r):
    return math.factorial(n) // math.factorial(n - r)

examples_p = [(10, 3), (12, 3), (20, 5), (52, 5)]
for n, r in examples_p:
    print(f"  P({n}, {r}) = {permutations(n, r):,}")

print()
print("=== Combinations C(n, r) ===")
def combinations(n, r):
    return math.factorial(n) // (math.factorial(r) * math.factorial(n - r))

examples_c = [(10, 3), (12, 3), (20, 5), (52, 5), (49, 6)]
for n, r in examples_c:
    print(f"  C({n}, {r}) = {combinations(n, r):,}")

print()
print("=== Symmetry: C(n,r) = C(n, n-r) ===")
for n, r in [(10, 3), (52, 5)]:
    print(f"  C({n},{r}) = {combinations(n,r):,}   C({n},{n-r}) = {combinations(n,n-r):,}")`,
        instructions: 'Run the cell and observe how rapidly factorials and permutations grow. Notice that C(52, 5) = C(52, 47) = 2,598,960. Add C(100, 50) to the combinations list — this is the peak of Pascal\'s row 100 and is enormous. Compare C(10,3)=120 vs P(10,3)=720 and confirm C = P/r! = 720/6.',
      },
      {
        id: 'stat4-005-cell-2',
        type: 'python',
        cellTitle: 'Card Hand Probabilities',
        code: `import math

def C(n, r):
    if r < 0 or r > n: return 0
    return math.factorial(n) // (math.factorial(r) * math.factorial(n - r))

total_hands = C(52, 5)
print(f"Total 5-card hands: C(52,5) = {total_hands:,}")
print()

# Probability of different hands
events = {
    "Royal Flush":      4,
    "Straight Flush":   36,
    "Four of a Kind":   C(13,1) * C(4,4) * C(48,1),
    "Full House":       C(13,1) * C(4,3) * C(12,1) * C(4,2),
    "Flush (not str.)": 4 * C(13,5) - 40,
    "Exactly 3 hearts": C(13,3) * C(39,2),
}

print(f"{'Hand':<22} | {'Count':>10} | {'Probability':>14}")
print("-" * 52)
for name, count in events.items():
    prob = count / total_hands
    print(f"{name:<22} | {count:>10,} | {prob:>14.6f}")

# Visualise probabilities (log scale via bar heights)
labels = list(events.keys())
values = [events[k] / total_hands for k in labels]

fig = Figure(width=8, height=4.5)
fig.axes(xmin=0, xmax=7, ymin=0, ymax=0.095)
fig.bars(labels=labels, values=values, color="steelblue", alpha=0.85)
fig.text(3.5, 0.088, "5-Card Poker Hand Probabilities", size=12, bold=True)
fig.show()`,
        instructions: 'Run the cell. Notice the enormous contrast: Royal Flush is essentially impossible while "exactly 3 hearts" occurs about 8% of the time. The formula C(13,3) × C(39,2) picks 3 hearts from 13 and 2 non-hearts from 39. Modify to compute P(exactly 2 aces): C(4,2) × C(48,3).',
      },
      {
        id: 'stat4-005-cell-3',
        type: 'python',
        cellTitle: 'Birthday Problem: Counting and Probability',
        code: `# The Birthday Problem: P(at least 2 people share a birthday in a group of n)
# P(all different birthdays in n people) = 365/365 × 364/365 × ... × (365-n+1)/365
# P(at least one shared) = 1 - P(all different)

def p_shared_birthday(n):
    p_all_diff = 1.0
    for k in range(n):
        p_all_diff *= (365 - k) / 365
    return 1 - p_all_diff

print("n people | P(at least one shared birthday)")
print("-" * 45)
for n in [10, 20, 23, 30, 40, 50, 57, 70]:
    p = p_shared_birthday(n)
    bar = "#" * int(p * 40)
    print(f"   {n:3d}   |  {p:.4f}  {bar}")

print()
print(f"23 people → P = {p_shared_birthday(23):.4f}  (above 50%!)")

# Plot probability vs group size
ns = list(range(1, 71))
probs = [p_shared_birthday(n) for n in ns]

fig = Figure(width=7, height=4.5)
fig.axes(xmin=0, xmax=72, ymin=0, ymax=1.05)
fig.plot(lambda n: p_shared_birthday(int(n)), xmin=1, xmax=70, steps=69, color="coral", width=2.5)
fig.scatter(xs=[23], ys=[p_shared_birthday(23)], color="navy", size=8)
fig.text(35, 1.0, "Birthday Problem: P(shared birthday) vs Group Size", size=10, bold=True)
fig.text(35, -0.08, "Group size n", size=10)
fig.show()`,
        instructions: 'Run the cell. At only 23 people, there is greater than 50% chance of a shared birthday — most people find this surprising. The dot marks n=23 on the curve. This is a counting and complement problem: P(no shared) = product of fractions, P(shared) = 1 − that product. Try changing 365 to 30 (a shorter calendar) and find the new crossover point.',
      },
    ],
  },
};
