export default {
  id: 'stat4-002',
  title: 'Complement, Union, and Intersection',
  description: 'Apply the complement rule, addition rule, and understand mutually exclusive events.',
  prerequisites: ['stat4-001'],
  coreConcept: 'Three set operations — complement, union, intersection — let you build complex events from simple ones and compute their probabilities using rules that follow directly from the Kolmogorov axioms.',

  prose: [
    '**75 students took an exam.** 45 passed the math section, 38 passed the writing section, and 20 passed both. How many passed at least one section? Counting 45 + 38 = 83 overcounts by 20 (the students who passed both are counted twice). Subtract the overlap: 45 + 38 − 20 = 63. This is the Addition Rule for non-mutually-exclusive events — and it runs on exactly the same logic as Venn diagram areas.',
    '**Complement.** For any event A in sample space S, the *complement* Aᶜ (also written Ā or A\') contains every outcome NOT in A. Because A and Aᶜ together cover all of S without overlap, P(A) + P(Aᶜ) = 1, so **P(Aᶜ) = 1 − P(A)**. This is useful whenever "at least one" problems make the direct calculation hard.',
    '**Union.** A ∪ B ("A or B") is the event that at least one of A or B occurs. The **General Addition Rule**: P(A ∪ B) = P(A) + P(B) − P(A ∩ B). The subtraction removes the double-counting of outcomes in both A and B.',
    '**Intersection.** A ∩ B ("A and B") is the event that both A and B occur. P(A ∩ B) is computed differently depending on whether A and B are independent (next lesson). For now, it is obtained from the addition rule: P(A ∩ B) = P(A) + P(B) − P(A ∪ B).',

    { type: 'callout', variant: 'procedure', title: 'General Addition Rule — three steps', body: '1. Identify P(A) and P(B).\n2. Identify P(A ∩ B) — outcomes in BOTH A and B.\n3. P(A ∪ B) = P(A) + P(B) − P(A ∩ B).' },

    '**Mutually exclusive (disjoint) events.** Events A and B are *mutually exclusive* if they cannot both occur — A ∩ B = ∅, so P(A ∩ B) = 0. The addition rule simplifies to P(A ∪ B) = P(A) + P(B). Rolling a 2 and rolling a 5 on a single die are mutually exclusive; drawing a heart and drawing a red card are NOT (all hearts are red).',

    { type: 'prediction', prompt: 'A student draws one card from a 52-card deck. Events: A = "the card is a King", B = "the card is a Diamond". Before computing: are A and B mutually exclusive? What is P(A ∩ B)?' },

    '**"At least one" via complement.** P(at least one) = 1 − P(none). This technique avoids enumerating all ways at least one thing can happen. Example: P(at least one head in 3 flips) = 1 − P(all tails) = 1 − (1/2)³ = 7/8.',
    '**Venn diagram algebra.** Draw two overlapping circles in a rectangle. The rectangle has area 1 (the full sample space). Each circle region represents an event. The overlap is A ∩ B. "Only A" = P(A) − P(A ∩ B). "Neither" = 1 − P(A ∪ B). These four regions always sum to 1.',
  ],

  checkpoints: [
    { id: 'stat4-002-cp1', label: 'P(A) = 0.4. What is P(Aᶜ)?', type: 'recall' },
    { id: 'stat4-002-cp2', label: 'P(A) = 0.5, P(B) = 0.4, P(A ∩ B) = 0.2. Find P(A ∪ B).', type: 'application' },
    { id: 'stat4-002-cp3', label: 'A and B are mutually exclusive and P(A) = 0.3, P(B) = 0.25. Find P(A ∪ B).', type: 'application' },
    { id: 'stat4-002-cp4', label: 'What does A ∩ B = ∅ mean for A and B?', type: 'concept' },
    { id: 'stat4-002-cp5', label: 'P(at least one head in 4 coin flips) = ?', type: 'application' },
    { id: 'stat4-002-cp6', label: 'If P(A ∪ B) = 0.9 and P(A ∩ B) = 0.1, P(A) = 0.6, find P(B).', type: 'application' },
    { id: 'stat4-002-cp7', label: 'For a 52-card deck, are "drawing a King" and "drawing a Club" mutually exclusive?', type: 'concept' },
    { id: 'stat4-002-cp8', label: 'Name the formula region: P(A) − P(A ∩ B).', type: 'recall' },
  ],

  workedExample: {
    problem: 'In a class of 100 students: 60 study Math (M), 50 study English (E), 30 study both. Find (a) P(M ∪ E), (b) P(only Math), (c) P(neither), (d) P(Mᶜ).',
    steps: [
      { expression: 'P(M)=0.60,\\; P(E)=0.50,\\; P(M\\cap E)=0.30', annotation: 'Convert counts to probabilities by dividing by 100.' },
      { expression: 'P(M\\cup E)=0.60+0.50-0.30=0.80', annotation: 'General Addition Rule.' },
      { expression: 'P(\\text{only }M)=P(M)-P(M\\cap E)=0.60-0.30=0.30', annotation: 'Subtract the overlap from M.' },
      { expression: 'P(\\text{neither})=1-P(M\\cup E)=1-0.80=0.20', annotation: 'Complement of the union.' },
      { expression: 'P(M^c)=1-0.60=0.40', annotation: 'Complement of M.' },
    ],
    answer: 'P(M ∪ E) = 0.80; P(only M) = 0.30; P(neither) = 0.20; P(Mᶜ) = 0.40.',
  },

  challenge: {
    problem: 'A quality-control team tests components from two machines. Machine A produces 55% of parts; 4% of A\'s parts are defective. Machine B produces 45%; 6% of B\'s parts are defective. Let D = "part is defective." (a) P(defective and from A). (b) P(defective and from B). (c) P(D). (d) P(not defective).',
    steps: [
      { expression: 'P(D\\cap A)=0.55\\times 0.04=0.022', annotation: 'P(from A) × P(defective | from A). These events are not yet fully independent — we will formalise this in stat4-003.' },
      { expression: 'P(D\\cap B)=0.45\\times 0.06=0.027', annotation: 'P(from B) × P(defective | from B).' },
      { expression: 'P(D)=0.022+0.027=0.049', annotation: 'A and B are mutually exclusive (a part comes from exactly one machine), so P(D) = P(D∩A) + P(D∩B).' },
      { expression: 'P(D^c)=1-0.049=0.951', annotation: 'Complement rule.' },
    ],
    answer: 'P(D) = 0.049 (4.9% defect rate overall); P(not defective) = 0.951.',
  },

  assessment: {
    type: 'choice',
    question: 'P(A) = 0.45, P(B) = 0.30, P(A ∩ B) = 0.15. What is P(A ∪ B)?',
    options: ['0.45', '0.60', '0.75', '0.90'],
    answer: '0.60',
    explanation: 'P(A ∪ B) = 0.45 + 0.30 − 0.15 = 0.60.',
  },

  quiz: [
    {
      id: 'stat4-002-q1',
      question: 'If P(A) = 0.72, what is P(Aᶜ)?',
      options: ['0.28', '0.72', '1.72', '−0.28'],
      answer: '0.28',
      hints: ['P(A) + P(Aᶜ) = 1.'],
      reviewSection: 'Complement',
    },
    {
      id: 'stat4-002-q2',
      question: 'A and B are mutually exclusive. P(A) = 0.35, P(B) = 0.40. P(A ∪ B) = ?',
      options: ['0.14', '0.75', '0.35', '1.00'],
      answer: '0.75',
      hints: ['When mutually exclusive, P(A ∩ B) = 0.'],
      reviewSection: 'Mutually exclusive events',
    },
    {
      id: 'stat4-002-q3',
      question: 'P(A ∪ B) = 0.70, P(A) = 0.50, P(B) = 0.30. What is P(A ∩ B)?',
      options: ['0.10', '0.20', '0.50', '0.80'],
      answer: '0.10',
      hints: ['Rearrange the Addition Rule: P(A ∩ B) = P(A) + P(B) − P(A ∪ B).'],
      reviewSection: 'Intersection',
    },
    {
      id: 'stat4-002-q4',
      question: 'P(at least one success in 3 independent trials, each with P(success) = 0.5):',
      options: ['0.500', '0.750', '0.875', '0.125'],
      answer: '0.875',
      hints: ['Use complement: 1 − P(all failures) = 1 − 0.5³.'],
      reviewSection: '"At least one" via complement',
    },
    {
      id: 'stat4-002-q5',
      question: '"Drawing a club" and "drawing a diamond" from a deck are:',
      options: ['Mutually exclusive', 'Independent', 'Complementary', 'Exhaustive'],
      answer: 'Mutually exclusive',
      hints: ['Can a single card be both a club and a diamond?'],
      reviewSection: 'Mutually exclusive events',
    },
    {
      id: 'stat4-002-q6',
      question: 'If P(only A) = 0.20 and P(A ∩ B) = 0.15, what is P(A)?',
      options: ['0.05', '0.20', '0.35', '0.15'],
      answer: '0.35',
      hints: ['P(A) = P(only A) + P(A ∩ B).'],
      reviewSection: 'Venn diagram algebra',
    },
  ],

  misconceptions: [
    {
      error: 'Adding P(A) + P(B) without subtracting the intersection.',
      correction: 'The General Addition Rule requires P(A ∪ B) = P(A) + P(B) − P(A ∩ B). Skipping the subtraction double-counts outcomes in both events.',
    },
    {
      error: 'Assuming "mutually exclusive" means "independent."',
      correction: 'Mutually exclusive events are actually the opposite of independent for events with non-zero probability: if A occurs, B cannot, so they affect each other. Mutually exclusive ≠ independent.',
    },
    {
      error: 'Using the complement rule incorrectly for compound events.',
      correction: 'P(at least one) = 1 − P(none). Not 1 − P(one). Build the complement carefully by listing what "none" means.',
    },
  ],

  transferPrompts: [
    'A marketing team finds 40% of customers buy product A, 30% buy product B, and 15% buy both. What fraction buy at least one? What fraction buy neither? How would you use this for a targeting campaign?',
    'A startup claims their app crashes with probability 0.03 per session. What is the probability it does NOT crash in 10 independent sessions? (Use complement repeatedly or exponentiation.)',
  ],

  debugging: [
    {
      symptom: 'P(A ∪ B) > 1 when you add P(A) + P(B).',
      cause: 'You forgot to subtract P(A ∩ B) — or A and B are not actually mutually exclusive.',
      fix: 'Always use P(A ∪ B) = P(A) + P(B) − P(A ∩ B). Check whether A ∩ B = ∅ before treating the events as mutually exclusive.',
    },
    {
      symptom: 'P(A ∩ B) came out negative.',
      cause: 'The given values are inconsistent, or you misidentified P(A ∩ B) in the formula.',
      fix: 'Check P(A ∩ B) = P(A) + P(B) − P(A ∪ B). If the result is negative, the given probabilities are logically inconsistent.',
    },
  ],

  mastery: {
    targetLevel: 'Apply',
    successCriteria: [
      'Apply the complement rule to find P(Aᶜ).',
      'Apply the General Addition Rule correctly including the subtraction.',
      'Identify whether events are mutually exclusive from a problem description.',
      'Use the complement strategy for "at least one" problems.',
      'Decompose a Venn diagram into four non-overlapping regions and verify they sum to 1.',
    ],
    commonErrors: ['Omitting P(A ∩ B) in addition rule', 'Confusing mutually exclusive with independent'],
    prerequisites: ['stat4-001: Introduction to Probability'],
    nextSteps: ['stat4-003: Conditional Probability and Independence'],
  },

  python: {
    cells: [
      {
        id: 'stat4-002-cell-1',
        type: 'python',
        cellTitle: 'Visualise Venn Diagram Regions',
        code: `# Venn diagram as a bar breakdown — four regions
# P(A)=0.55, P(B)=0.40, P(A∩B)=0.20

p_a = 0.55
p_b = 0.40
p_ab = 0.20  # intersection

p_only_a = p_a - p_ab       # in A but not B
p_only_b = p_b - p_ab       # in B but not A
p_union = p_a + p_b - p_ab  # at least one
p_neither = 1 - p_union     # neither

print("Region         | Probability")
print("-" * 30)
print(f"Only A         |  {p_only_a:.4f}")
print(f"A ∩ B          |  {p_ab:.4f}")
print(f"Only B         |  {p_only_b:.4f}")
print(f"Neither        |  {p_neither:.4f}")
print(f"Sum (check=1)  |  {p_only_a + p_ab + p_only_b + p_neither:.4f}")
print()
print(f"P(A ∪ B) = {p_a} + {p_b} - {p_ab} = {p_union}")

# Bar chart of the four Venn regions
fig = Figure(width=7, height=4)
fig.axes(xmin=0, xmax=5, ymin=0, ymax=0.4)
fig.bars(
    labels=["Only A", "A ∩ B", "Only B", "Neither"],
    values=[p_only_a, p_ab, p_only_b, p_neither],
    color="steelblue"
)
fig.text(2.5, 0.375, "Venn Diagram Regions (P values)", size=12, bold=True)
fig.show()`,
        instructions: 'Run the cell. The four bars are the four non-overlapping regions of a two-event Venn diagram and they sum to 1. Try changing p_a, p_b, p_ab to new values (keep p_ab ≤ min(p_a, p_b)) and confirm the regions still sum to 1.',
      },
      {
        id: 'stat4-002-cell-2',
        type: 'python',
        cellTitle: '"At Least One" via Complement',
        code: `# P(at least one head in n flips of a fair coin)
# = 1 - P(all tails) = 1 - (0.5)^n

print("n flips | P(at least 1 head) | P(all tails)")
print("-" * 50)
for n in [1, 2, 3, 5, 10, 20, 50]:
    p_none = 0.5 ** n
    p_at_least_one = 1 - p_none
    print(f"  {n:3d}   |       {p_at_least_one:.6f}     |  {p_none:.6f}")

# Visualise how quickly P approaches 1
fig = Figure(width=7, height=4.5)
fig.axes(xmin=0, xmax=21, ymin=0, ymax=1.05)
ns = list(range(1, 21))
probs = [1 - 0.5**n for n in ns]
fig.scatter(xs=ns, ys=probs, color="coral", size=6)
fig.plot(lambda n: 1 - 0.5**n, xmin=1, xmax=20, color="steelblue", width=2)
fig.text(10, 1.0, "P(at least 1 head) in n fair coin flips", size=12, bold=True)
fig.text(10, -0.08, "Number of flips (n)", size=11)
fig.show()`,
        instructions: 'Run the cell. Notice that by 10 flips, P(at least one head) ≈ 0.999. The complement trick is powerful: instead of counting all the ways to get heads, you just count the one way to get none (all tails). Change 0.5 to 0.1 (a biased coin) and observe how the curve shifts.',
      },
      {
        id: 'stat4-002-cell-3',
        type: 'python',
        cellTitle: 'Addition Rule: Card Deck Events',
        code: `# Addition rule on a 52-card deck

# Event A: card is a Heart (13/52)
# Event B: card is a Face card (J, Q, K = 12/52)
# A ∩ B: Heart Face card (J♥, Q♥, K♥ = 3/52)

total = 52
p_a = 13 / total     # hearts
p_b = 12 / total     # face cards
p_ab = 3 / total     # heart face cards
p_union = p_a + p_b - p_ab

print("P(Heart)         = {:2d}/52 = {:.4f}".format(13, p_a))
print("P(Face card)     = {:2d}/52 = {:.4f}".format(12, p_b))
print("P(Heart & Face)  = {:2d}/52 = {:.4f}".format(3, p_ab))
print()
print(f"P(Heart OR Face) = {p_a:.4f} + {p_b:.4f} - {p_ab:.4f} = {p_union:.4f}")
print(f"That is {round(p_union * 52)}/52 = {round(p_union*52)}/52")
print()
print("Are 'Heart' and 'Face card' mutually exclusive?")
print(f"  P(A ∩ B) = {p_ab:.4f}  → NOT zero, so NOT mutually exclusive.")

# Build a simple visual
fig = Figure(width=7, height=3.5)
fig.axes(xmin=0, xmax=4, ymin=0, ymax=0.5)
fig.bars(
    labels=["P(Heart)", "P(Face)", "P(H∩F)", "P(H∪F)"],
    values=[p_a, p_b, p_ab, p_union],
    color=["coral", "coral", "steelblue", "teal"]
)
fig.text(2, 0.47, "Addition Rule — Card Events", size=12, bold=True)
fig.show()`,
        instructions: 'Run the cell. P(Heart OR Face) = 22/52 ≈ 0.423. Change the events: let B = "card is a Spade" and recompute. What happens to P(A ∩ B) when both A and B are suits? Are they mutually exclusive?',
      },
    ],
  },
};
