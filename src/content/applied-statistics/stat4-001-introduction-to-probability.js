export default {
  id: 'stat4-001',
  title: 'Introduction to Probability',
  description: 'Define probability, sample spaces, and events. Compare classical, empirical, and subjective approaches.',
  prerequisites: ['stat1-001', 'stat1-002'],
  coreConcept: 'Probability is a number between 0 and 1 that describes how likely an outcome is. Whether you compute it by counting equally-likely outcomes, by running many trials, or by expert judgment depends on what information you have.',
  prerequisites: ['stat1-001'],

  prose: [
    '**30 students rolled a standard die 600 times.** They recorded 97 ones, 103 twos, 98 threes, 104 fours, 102 fives, and 96 sixes. The *relative frequency* of "1" is 97/600 ≈ 0.162 — close to but not exactly 1/6 ≈ 0.167. Both numbers estimate the same underlying probability; the gap shrinks as the number of trials grows. That is the empirical law of large numbers in action.',
    '**Sample space, event, and outcome.** The *sample space* S is the set of all possible outcomes of a random experiment. An *outcome* is a single result; an *event* A is any subset of S. For a fair die, S = {1, 2, 3, 4, 5, 6} and the event "roll an even number" = {2, 4, 6}.',
    '**Classical probability.** When outcomes are equally likely, P(A) = |A| / |S|. P(even) = 3/6 = 0.5. This formula requires equally-likely outcomes — it fails for a loaded die or a weather forecast.',
    '**Empirical probability.** P(A) ≈ (number of times A occurred) / (total trials). With many trials this converges to the true probability by the *Law of Large Numbers*: as n → ∞, the relative frequency stabilises at P(A).',
    '**Subjective probability.** When neither a symmetric sample space nor repeated trials exist, a probability is a personal degree of belief. A meteorologist\'s "70% chance of rain" and a doctor\'s "80% chance the treatment works" are subjective — calibrated by expertise, not by formula.',

    { type: 'callout', variant: 'insight', body: '**Three interpretations, one axiom system.** All three approaches must satisfy the same Kolmogorov axioms: (1) P(A) ≥ 0 for every event A; (2) P(S) = 1; (3) if A and B are mutually exclusive, P(A ∪ B) = P(A) + P(B). The interpretation of "what P means" differs; the math is identical.' },

    '**Probability as area.** Visualising the sample space as a rectangle with area 1 makes every probability a *proportion of area*. Events are regions inside the rectangle. Overlapping regions represent non-mutually-exclusive events. This picture will carry through the entire probability unit.',

    { type: 'prediction', prompt: 'Before reading on, predict: if you flip a fair coin 10 times and get 7 heads, does the coin "owe" you more tails on the next flip? What does probability theory say?' },

    '**Gambler\'s Fallacy.** Each coin flip is independent; previous results do not change future probabilities. P(heads) = 0.5 on every flip regardless of history. The coin has no memory. Short runs can deviate from 0.5 dramatically — that is expected variation, not a debt to be repaid.',
    '**Probability vs. odds.** Probability and odds both quantify likelihood but differently. If P(A) = 0.25, the odds in favour of A are 0.25 : 0.75 = 1 : 3. Odds = P(A) / (1 − P(A)). Converting back: P = odds / (1 + odds). Sports betting and medical literature often use odds; data science prefers probability.',
  ],

  checkpoints: [
    { id: 'stat4-001-cp1', label: 'A fair six-sided die is rolled. What is P(rolling a 3)?', type: 'recall' },
    { id: 'stat4-001-cp2', label: 'A coin is flipped 1000 times with 512 heads. What is the empirical probability of heads?', type: 'recall' },
    { id: 'stat4-001-cp3', label: 'A bag contains 4 red and 6 blue marbles. Is P(red) = 0.4 classical, empirical, or subjective probability?', type: 'concept' },
    { id: 'stat4-001-cp4', label: 'A doctor says "I believe there is a 90% chance this treatment will work." Which type of probability is this?', type: 'concept' },
    { id: 'stat4-001-cp5', label: 'List the sample space for flipping a coin twice.', type: 'recall' },
    { id: 'stat4-001-cp6', label: 'If P(A) = 0.3, what are the odds in favour of A?', type: 'application' },
    { id: 'stat4-001-cp7', label: 'After 5 coin flips all showing tails, a student says "heads is overdue." What is the name for this error?', type: 'concept' },
    { id: 'stat4-001-cp8', label: 'Which Kolmogorov axiom ensures P(something happens) = 1?', type: 'recall' },
  ],

  workedExample: {
    problem: 'A standard deck of 52 cards is shuffled. (a) What is the sample space size? (b) What is P(drawing a heart)? (c) 2600 draws with replacement are made; hearts appear 660 times. What is the empirical probability? (d) How do (b) and (c) compare?',
    steps: [
      { expression: '|S| = 52', annotation: 'The sample space is the 52 distinct cards.' },
      { expression: 'P(\\text{heart}) = \\dfrac{13}{52} = 0.25', annotation: '13 hearts ÷ 52 equally-likely outcomes. Classical formula.' },
      { expression: 'P_{\\text{emp}}(\\text{heart}) = \\dfrac{660}{2600} \\approx 0.254', annotation: 'Empirical: count of favourable outcomes ÷ total trials.' },
      { expression: '|0.254 - 0.25| = 0.004', annotation: 'The empirical value is within 0.4 percentage points of the classical value. With more trials it would converge further.' },
    ],
    answer: 'P(heart) = 0.25 classically; empirical estimate ≈ 0.254. Both describe the same probability; the difference is random variation.',
  },

  challenge: {
    problem: 'A factory inspects 400 light bulbs; 24 are defective. (a) Compute the empirical probability of a defect. (b) Convert to odds in favour of a defect. (c) If the inspector says "I believe 1 in 15 bulbs is defective based on industry norms," classify that probability type.',
    steps: [
      { expression: 'P_{\\text{emp}}(\\text{defect}) = \\dfrac{24}{400} = 0.06', annotation: 'Empirical probability from observed data.' },
      { expression: '\\text{Odds} = \\dfrac{0.06}{1-0.06} = \\dfrac{0.06}{0.94} \\approx 0.0638 \\approx 1:15.7', annotation: 'Odds in favour = P/(1-P). Often stated as "1 in 16.7" defective.' },
      { expression: 'P_{\\text{subjective}} = \\tfrac{1}{15} \\approx 0.0\\overline{6}', annotation: 'The inspector\'s belief from industry norms is subjective — a personal degree of belief informed by experience, not from this dataset alone.' },
    ],
    answer: '(a) 0.06; (b) ≈ 1:15.7; (c) subjective probability.',
  },

  assessment: {
    type: 'choice',
    question: 'A spinner has 5 equal sections numbered 1–5. You spin it 200 times and "3" appears 38 times. The classical probability of spinning a 3 is ___; the empirical probability is ___.',
    options: ['0.20 ; 0.190', '0.20 ; 0.200', '0.25 ; 0.190', '0.33 ; 0.190'],
    answer: '0.20 ; 0.190',
    explanation: 'Classical: 1/5 = 0.20. Empirical: 38/200 = 0.190.',
  },

  quiz: [
    {
      id: 'stat4-001-q1',
      question: 'Which probability type requires equally-likely outcomes?',
      options: ['Classical', 'Empirical', 'Subjective', 'Conditional'],
      answer: 'Classical',
      hints: ['Think about the formula P(A) = |A| / |S|.'],
      reviewSection: 'Classical probability',
    },
    {
      id: 'stat4-001-q2',
      question: 'According to the Law of Large Numbers, as trial count grows, empirical probability:',
      options: ['Stays fixed at 0.5', 'Converges to the true probability', 'Grows without bound', 'Becomes subjective'],
      answer: 'Converges to the true probability',
      hints: ['What does "law of large numbers" mean in plain language?'],
      reviewSection: 'Empirical probability',
    },
    {
      id: 'stat4-001-q3',
      question: 'P(A) = 0.4. What are the odds in favour of A?',
      options: ['2 : 3', '4 : 10', '3 : 2', '0.4 : 1'],
      answer: '2 : 3',
      hints: ['Odds = P(A) / P(not A) = 0.4 / 0.6.'],
      reviewSection: 'Probability vs. odds',
    },
    {
      id: 'stat4-001-q4',
      question: 'Which Kolmogorov axiom guarantees P(S) = 1?',
      options: ['Axiom 1: P(A) ≥ 0', 'Axiom 2: P(S) = 1', 'Axiom 3: addition for mutually exclusive events', 'None of them'],
      answer: 'Axiom 2: P(S) = 1',
      hints: ['The three axioms are non-negativity, normalisation, and additivity.'],
      reviewSection: 'Three interpretations, one axiom system',
    },
    {
      id: 'stat4-001-q5',
      question: 'A coin is flipped 6 times; all 6 are heads. A student says "tails must come next." This is:',
      options: ["Correct — the coin's probability balances out", 'Gambler\'s Fallacy', 'The Law of Large Numbers', 'Empirical probability'],
      answer: "Gambler's Fallacy",
      hints: ['Are successive flips independent of each other?'],
      reviewSection: "Gambler's Fallacy",
    },
    {
      id: 'stat4-001-q6',
      question: 'An event A has sample space S = {1,2,3,4,5,6,7,8}. A = {2,4,6,8}. P(A) = ?',
      options: ['0.25', '0.50', '0.75', '4'],
      answer: '0.50',
      hints: ['Count elements in A and divide by |S|.'],
      reviewSection: 'Classical probability',
    },
  ],

  misconceptions: [
    {
      error: 'Applying classical probability to a non-uniform sample space.',
      correction: 'Classical P = |A|/|S| only when all outcomes are equally likely. A loaded die, a weighted spinner, or a real-world phenomenon requires empirical data or a model.',
    },
    {
      error: 'Assuming independent events "balance out" in the short run (Gambler\'s Fallacy).',
      correction: 'Each trial is independent. Past outcomes do not change future probabilities. The Law of Large Numbers is a statement about infinite limits, not a guarantee in any finite window.',
    },
    {
      error: 'Confusing probability and odds.',
      correction: 'P(A) = 0.25 means odds of 1:3, not 25:75 reduced to 1:3 meaning different things in different contexts. Always state whether you are giving a probability (between 0 and 1) or odds (a ratio).',
    },
  ],

  transferPrompts: [
    'A quality-control engineer says "based on last year\'s data, 2% of parts fail." Is this classical, empirical, or subjective? What would you need to compute a classical probability for the same event?',
    'An insurance actuary sets a 0.003 annual probability of flood damage for a specific zip code. What type of probability is this? What data was likely used?',
  ],

  debugging: [
    {
      symptom: 'You compute P(A) > 1 or P(A) < 0.',
      cause: 'Arithmetic error or misidentification of |A| or |S|. P must always lie in [0, 1].',
      fix: 'Recount the favourable outcomes and total outcomes. Check whether your denominator is the full sample space, not a subset.',
    },
    {
      symptom: 'Empirical probability does not match classical probability even after 1000 trials.',
      cause: 'Small deviations are expected and normal. Verify there is no systematic bias in how the experiment is run.',
      fix: 'Check that the experiment is truly random. The gap between empirical and classical shrinks on average as n grows, but any single run can deviate.',
    },
  ],

  mastery: {
    targetLevel: 'Apply',
    successCriteria: [
      'Correctly identify which probability type is appropriate for a given scenario.',
      'Compute classical probability from a finite equally-likely sample space.',
      'Compute empirical probability from frequency data.',
      'Convert between probability and odds.',
      'Identify and name the Gambler\'s Fallacy.',
    ],
    commonErrors: ['Using classical formula with unequal outcomes', 'Confusing probability and odds', 'Gambler\'s Fallacy'],
    prerequisites: ['Fractions and ratios', 'Basic set notation (|S|, subsets)'],
    nextSteps: ['stat4-002: Complement, Union, Intersection'],
  },

  python: {
    cells: [
      {
        id: 'stat4-001-cell-1',
        type: 'python',
        cellTitle: 'Simulate Empirical Probability: Fair Die',
        code: `import random

# Simulate rolling a fair die 600 times
random.seed(42)
n = 600
rolls = [random.randint(1, 6) for _ in range(n)]

# Count each face
counts = {i: rolls.count(i) for i in range(1, 7)}

# Empirical probabilities
emp = {face: count / n for face, count in counts.items()}

print("Face | Count | Empirical P | Classical P")
print("-" * 45)
for face in range(1, 7):
    print(f"  {face}  |  {counts[face]:3d}  |   {emp[face]:.4f}    |   {1/6:.4f}")

# Visualise with a bar chart
fig = Figure(width=7, height=4)
fig.axes(xmin=0, xmax=7, ymin=0, ymax=0.25)
fig.bars(
    labels=[str(i) for i in range(1, 7)],
    values=[emp[i] for i in range(1, 7)],
    color="steelblue"
)
fig.text(3.5, 0.235, "Empirical vs Classical P (600 die rolls)", size=12, bold=True)
fig.show()`,
        instructions: 'Run the cell. Compare the empirical probabilities in the table to 1/6 ≈ 0.1667. Modify `n` to 60, then to 6000 and re-run — notice how the empirical probabilities get closer to 0.1667 as n increases. This is the Law of Large Numbers.',
      },
      {
        id: 'stat4-001-cell-2',
        type: 'python',
        cellTitle: 'Classical Probability: Card Deck',
        code: `# Classical probability from a 52-card deck
# Sample space: 52 equally-likely cards

total_cards = 52
num_hearts = 13
num_aces = 4
num_face_cards = 12  # Jack, Queen, King in 4 suits

p_heart = num_hearts / total_cards
p_ace = num_aces / total_cards
p_face = num_face_cards / total_cards
p_red_ace = 2 / total_cards  # 2 red aces

print("Event                  | P(Event) | As fraction")
print("-" * 50)
print(f"Heart                  |  {p_heart:.4f}  |  13/52 = 1/4")
print(f"Ace                    |  {p_ace:.4f}  |   4/52 = 1/13")
print(f"Face card (J/Q/K)      |  {p_face:.4f}  |  12/52 = 3/13")
print(f"Red ace                |  {p_red_ace:.4f}  |   2/52 = 1/26")

# Visualise the proportions
fig = Figure(width=7, height=4)
fig.axes(xmin=0, xmax=5, ymin=0, ymax=0.35)
labels = ["P(Heart)", "P(Ace)", "P(Face)", "P(Red Ace)"]
values = [p_heart, p_ace, p_face, p_red_ace]
fig.bars(labels=labels, values=values, color="coral")
fig.text(2.5, 0.32, "Classical Probabilities — 52-Card Deck", size=12, bold=True)
fig.show()`,
        instructions: 'Run the cell to see four classical probabilities visualised. Change `num_hearts` to 13 and recompute — the fraction should always be count / 52. Try computing P(not a heart) = 1 − P(heart) and verify it equals 39/52.',
      },
      {
        id: 'stat4-001-cell-3',
        type: 'python',
        cellTitle: 'Probability vs. Odds Converter',
        code: `# Convert between probability and odds

def prob_to_odds(p):
    """Return odds in favour as (favourable, against) integers."""
    against = 1 - p
    # Express as a ratio
    return p, against

def odds_to_prob(odds_for, odds_against):
    return odds_for / (odds_for + odds_against)

# Explore several probabilities
probs = [0.1, 0.25, 0.5, 0.75, 0.9]

print("P(A)  | Odds (for : against)  | Back to P")
print("-" * 45)
for p in probs:
    a = 1 - p
    back = odds_to_prob(p, a)
    print(f" {p:.2f} |  {p:.2f} : {a:.2f}           |  {back:.4f}")

# Visualise: how odds change as P increases
fig = Figure(width=7, height=4.5)
fig.axes(xmin=0, xmax=1, ymin=0, ymax=10)
ps = [i/100 for i in range(1, 100)]
odds = [p/(1-p) for p in ps]
fig.plot(lambda x: x/(1-x) if x < 0.99 else 9.9, xmin=0.01, xmax=0.99, color="steelblue", width=2.5)
fig.text(0.5, 9.3, "Odds in Favour vs. Probability", size=12, bold=True)
fig.text(0.5, -0.7, "P(A)", size=11)
fig.text(-0.1, 5, "Odds", size=11)
fig.show()`,
        instructions: 'Run the cell. Notice that odds grow non-linearly — once P > 0.5, odds increase steeply. When P = 0.5, odds are 1:1. Modify the list `probs` to include 0.01 and 0.99 and observe the extreme odds.',
      },
    ],
  },
};
