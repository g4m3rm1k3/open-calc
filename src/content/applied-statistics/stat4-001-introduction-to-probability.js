export default {
  // ── Identity ───────────────────────────────────────────────────
  id: "stat4-001",
  slug: "introduction-to-probability",
  chapter: "stat4",
  order: 1,
  title: "Introduction to Probability",
  subtitle:
    "Sample spaces, events, and the three ways to assign a probability.",
  tags: [
    "probability",
    "sample space",
    "classical probability",
    "empirical probability",
    "subjective probability",
    "law of large numbers",
    "gambler's fallacy",
    "odds",
  ],
  aliases:
    "probability sample space event outcome classical empirical subjective law of large numbers gamblers fallacy odds likelihood",
  timeToComplete: 30,
  coreConcept:
    "Probability is a number between 0 and 1 that describes how likely an outcome is. Whether you compute it by counting equally-likely outcomes, by running many trials, or by expert judgment depends on what information you have.",
  prerequisites: ["stat3-006"],
  nextLesson: "stat4-002",

  // ── Hook ──────────────────────────────────────────────────────
  hook: {
    question:
      'A weather app says 70% chance of rain. A card deck gives P(heart) = 25%. A doctor says "80% chance the treatment works." Are these three statements about probability even the same kind of thing?',
    realWorldContext:
      "Probability appears everywhere — in forecasts, games, clinical trials, insurance, and machine learning — but it is not always computed the same way. When a casino says the house edge on roulette is 5.26%, they used classical probability: counting equally-likely outcomes. When an epidemiologist says a vaccine is 94% effective, they used empirical probability: counting cases in a clinical trial. When a doctor estimates a patient's survival odds, they use subjective probability: expert judgment calibrated by experience. Understanding which approach applies — and what assumptions each requires — is the foundation of all statistical reasoning.",
  },

  // ── Intuition ──────────────────────────────────────────────────
  intuition: {
    prose: [
      '**Start with 600 rolls of a die.** A class of 30 students each rolled a standard die 20 times and pooled their 600 results: 97 ones, 103 twos, 98 threes, 104 fours, 102 fives, and 96 sixes. The relative frequency of rolling "1" is 97/600 ≈ 0.162. The classical prediction is 1/6 ≈ 0.167. These two numbers are close but not equal — and that gap is the starting point for understanding what probability actually means.',
      '**Sample space, outcome, and event — the vocabulary.** Before computing any probability, identify what experiment you are running and what can happen. The **sample space** $S$ is the complete list of all possible outcomes. An **outcome** is one specific result. An **event** $A$ is any collection of outcomes — any subset of $S$. For the die experiment: $S = \\{1, 2, 3, 4, 5, 6\\}$. The event "roll an even number" is $A = \\{2, 4, 6\\}$. That event contains 3 outcomes out of 6 possible.',
      '**Classical probability: count the outcomes.** When every outcome in $S$ is equally likely, the probability of event $A$ is simply the fraction of outcomes that belong to $A$: $$P(A) = \\frac{|A|}{|S|}$$ where $|A|$ means "the number of outcomes in $A$." For our die: $P(\\text{even}) = |\\{2,4,6\\}| / |\\{1,2,3,4,5,6\\}| = 3/6 = 0.5$. This formula works for a fair die, a shuffled deck, or any situation with equally-likely outcomes. It breaks down the moment outcomes are not equally likely — a loaded die, a biased coin, or almost any real-world phenomenon.',
      "**Empirical probability: count what happened.** When you cannot list equally-likely outcomes, run the experiment and count. $$P(A) \\approx \\frac{\\text{number of times } A \\text{ occurred}}{\\text{total number of trials}}$$ The 600-roll class experiment gives $P(1) \\approx 97/600 \\approx 0.162$. This is an estimate — it varies each time you run the experiment. The **Law of Large Numbers** guarantees that as the number of trials grows, the empirical probability gets closer and closer to the true probability. With 6000 rolls instead of 600, the estimate would be tighter.",
      '**Subjective probability: expert belief.** When you cannot count outcomes and cannot run repeated experiments — a surgeon has never performed this exact operation before, a meteorologist has one Tuesday afternoon to forecast — probability becomes a calibrated belief. A surgeon\'s "85% chance of success" is a subjective probability: it is informed by data and experience but is ultimately a personal assessment. Subjective probability must still satisfy the same mathematical rules as all other probability — it just has a different source.',
      '**Before reading on, predict:** A coin is flipped 10 times. The results are H H H H H H H H H H — ten heads in a row. Does the coin "owe" you tails on the 11th flip? Will tails be more likely than heads? Write your prediction.',
      "**The Gambler's Fallacy.** Each coin flip is an independent event. Previous results do not change future probabilities. $P(\\text{heads}) = 0.5$ on every single flip, regardless of history. The coin has no memory. The Law of Large Numbers says that over a very long run, the proportion of heads approaches 0.5 — but it does not promise anything about the next flip. Believing that tails is \"due\" after a streak of heads is called the **Gambler's Fallacy**, and it causes real financial harm in casinos, investment decisions, and sports betting every day.",
      "**Probability vs. odds.** Probability is not the only way to express likelihood. **Odds in favour** of $A$ = $P(A) : P(A^c) = P(A) : (1 - P(A))$. If $P(A) = 0.25$, the odds in favour are $0.25 : 0.75 = 1 : 3$ — for every 1 time $A$ happens, it fails 3 times. Converting back: $P = \\frac{\\text{odds for}}{\\text{odds for} + \\text{odds against}}$. Sports betting and medical research often report odds; data science and statistics prefer probability. Knowing both lets you read results in any field.",
    ],
    callouts: [
      {
        type: "procedure",
        title: "Procedure: Choosing the Right Probability Type",
        body: "Step 1. Are the outcomes equally likely and fully listable? → **Classical:** $P(A) = |A| / |S|$.\n\nStep 2. Can you run (or have recorded) many repeated trials? → **Empirical:** $P(A) \\approx$ (count of $A$) / (total trials).\n\nStep 3. Neither equally-likely outcomes nor repeated trials are available? → **Subjective:** a calibrated expert belief, which must still satisfy all probability axioms.\n\nDefault check: if you are computing probability for a fair coin, die, or shuffled deck, use classical. If you are reading experimental data or a study, use empirical. If a human expert is giving an estimate from experience, it is subjective.",
      },
      {
        type: "insight",
        title: "Three Interpretations, One Axiom System",
        body: 'All three approaches must satisfy the same Kolmogorov axioms:\n\n(1) **Non-negativity:** $P(A) \\geq 0$ for every event $A$.\n(2) **Normalisation:** $P(S) = 1$ — something must happen.\n(3) **Additivity:** if $A$ and $B$ cannot both occur (mutually exclusive), $P(A \\cup B) = P(A) + P(B)$.\n\nThe interpretation of "what $P$ means" differs between classical, empirical, and subjective probability. The mathematics is identical. Every rule you will learn in this chapter (complement rule, addition rule, Bayes\' Theorem) follows from these three axioms alone.',
      },
      {
        type: "warning",
        title: "Two Classic Errors",
        body: '**Error 1: Applying classical probability to non-uniform outcomes.** $P(A) = |A|/|S|$ requires equally-likely outcomes. If you ask "what is the probability that a randomly chosen person has blood type A?" and answer "2 outcomes (type A, not type A) so P = 1/2," you have applied the classical formula to a non-uniform space. The actual probability of blood type A is about 0.41, determined empirically.\n\n**Error 2: The Gambler\'s Fallacy.** The Law of Large Numbers is a long-run convergence result — it says nothing about any individual trial. Past results of independent events do not change future probabilities.',
      },
    ],
    visualizations: [
      {
        id: "stat4-001-viz-1",
        title: "Sample space rectangle: probability as area",
        type: "diagram",
        purpose:
          "Shows that probability is a proportion of a whole — a fraction of area in the sample space rectangle. Prepares students for Venn diagram reasoning in stat4-002.",
        misconceptionAddressed:
          "Students think of probability as a count rather than a proportion. This visual anchors it as a fraction of a whole.",
        invariant:
          "The total area of the rectangle is always 1. Every event is a region inside it. The probability of an event is the fraction of the rectangle it occupies.",
      },
      {
        id: "stat4-001-viz-2",
        title:
          "Law of Large Numbers: empirical probability converging to true probability",
        type: "line-chart",
        purpose:
          'Shows that empirical probability is noisy for small n and stable for large n. Directly addresses the common question "how do we know the empirical estimate is right?"',
        misconceptionAddressed:
          "Students think empirical probability is exact from a small sample, or that it never converges.",
        invariant:
          "As n grows, the running proportion fluctuates less and centres on the true probability. The convergence is guaranteed but the path is random.",
      },
    ],
  },

  // ── Math ──────────────────────────────────────────────────────
  math: {
    prose: [
      "**Formal setup.** Let $S$ be a non-empty set (the sample space). An **event** is a subset $A \\subseteq S$. A **probability function** $P$ assigns to each event a real number satisfying the three Kolmogorov axioms: (1) $P(A) \\geq 0$, (2) $P(S) = 1$, (3) for any two mutually exclusive events $A \\cap B = \\emptyset$: $P(A \\cup B) = P(A) + P(B)$. Every other probability rule is a consequence of these three.",
      "**Classical probability formula.** If $S$ is finite and all outcomes are equally likely, $P(A) = |A| / |S|$ where $|A|$ denotes the number of outcomes in $A$. This follows directly from axioms 2 and 3: if $S$ has $n$ equally-likely singleton outcomes $\\{s_1\\}, \\ldots, \\{s_n\\}$, then $P(\\{s_i\\}) = 1/n$ for each $i$, so $P(A) = \\sum_{s_i \\in A} P(\\{s_i\\}) = |A| \\cdot (1/n)$.",
      "**Law of Large Numbers (informal).** Let $A$ be an event with true probability $P(A) = p$. Perform $n$ independent repetitions. The empirical probability $\\hat{p}_n = f_n / n$ satisfies: for every $\\varepsilon > 0$, $P(|\\hat{p}_n - p| > \\varepsilon) \\to 0$ as $n \\to \\infty$. In plain language: the probability that the empirical estimate deviates from the true probability by more than any fixed amount goes to zero as $n$ grows.",
      "**Odds and probability conversion.** Given $P(A) = p$, the odds in favour of $A$ are $\\text{odds}(A) = p / (1 - p)$. The inverse: $p = \\text{odds}(A) / (1 + \\text{odds}(A))$. $p = 0.5$ gives odds $= 1$ (even odds); $p = 0.9$ gives odds $= 9$ (9:1 in favour).",
    ],
  },

  // ── Rigor ─────────────────────────────────────────────────────
  rigor: {
    prose: [
      "**Measure theory foundation.** In advanced probability, $S$ is equipped with a $\\sigma$-algebra $\\mathcal{F}$ — a collection of subsets closed under complement and countable unions. The probability function $P: \\mathcal{F} \\to [0,1]$ is a measure with $P(S) = 1$. For discrete $S$ this is elementary; for continuous $S$ (e.g., $S = \\mathbb{R}$) it requires the Borel $\\sigma$-algebra. This is why the classical formula $P(A) = |A|/|S|$ only applies to finite $S$ with equally-likely outcomes.",
      "**Frequentist vs. Bayesian interpretations.** The Kolmogorov axioms define the mathematics; they do not prescribe the meaning of $P$. The **frequentist** interpretation: probability is the long-run relative frequency of a repeatable experiment. The **Bayesian** interpretation: probability is a degree of belief about any uncertain proposition, updated via Bayes' Theorem as evidence accumulates. Both are internally consistent. This course uses both — classical/empirical probability is frequentist; Bayes' Theorem (stat4-004) is Bayesian.",
      '**Why the Gambler\'s Fallacy is a formal error.** Two events $A$ and $B$ are **independent** if $P(A \\cap B) = P(A) \\cdot P(B)$. For a fair coin, successive flips are independent by assumption. The $k$-th flip\'s outcome lives on a different trial from the $(k-1)$-th flip. The intersection of "flip 10 = heads" and "flip 11 = heads" has probability $0.5 \\times 0.5 = 0.25$, regardless of all prior results. There is no mechanism by which past independent outcomes can affect future ones.',
    ],
    visualizations: [],
  },

  // ── Code / Notebooks ──────────────────────────────────────────
  python: {
    cells: [
      {
        id: "stat4-001-cell-1",
        type: "python",
        cellTitle: "Simulate Empirical Probability: Fair Die",
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
        instructions:
          "Run the cell. Compare the empirical probabilities in the table to 1/6 ≈ 0.1667. Modify `n` to 60, then to 6000 and re-run — notice how the empirical probabilities get closer to 0.1667 as n increases. This is the Law of Large Numbers.",
      },
      {
        id: "stat4-001-cell-2",
        type: "python",
        cellTitle: "Classical Probability: Card Deck",
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
        instructions:
          "Run the cell to see four classical probabilities visualised. Change `num_hearts` to 13 and recompute — the fraction should always be count / 52. Try computing P(not a heart) = 1 − P(heart) and verify it equals 39/52.",
      },
      {
        id: "stat4-001-cell-3",
        type: "python",
        cellTitle: "Probability vs. Odds Converter",
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
        instructions:
          "Run the cell. Notice that odds grow non-linearly — once P > 0.5, odds increase steeply. When P = 0.5, odds are 1:1. Modify the list `probs` to include 0.01 and 0.99 and observe the extreme odds.",
      },
    ],
  },
};
