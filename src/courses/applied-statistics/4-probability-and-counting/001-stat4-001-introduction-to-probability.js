export default {
  id: 'stat4-001',
  slug: 'introduction-to-probability',
  chapter: 'stat4',
  order: 1,
  title: 'Introduction to Probability',
  subtitle: 'Sample spaces, events, and the three ways to assign a probability.',
  tags: ['probability', 'sample space', 'classical probability', 'empirical probability', 'subjective probability', 'law of large numbers', 'gambler\'s fallacy', 'odds'],
  aliases: 'probability sample space event outcome classical empirical subjective law of large numbers gamblers fallacy odds likelihood',
  timeToComplete: 30,
  coreConcept: `Probability is a number between 0 and 1 that describes how likely an outcome is. Whether you compute it by counting equally-likely outcomes, by running many trials, or by expert judgment depends on what information you have.`,
  prerequisites: ['stat3-006'],
  nextLesson: 'stat4-002',

  hook: {
    question: `A weather app says 70% chance of rain. A card deck gives P(heart) = 25%. A doctor says "80% chance the treatment works." Are these three statements about probability even the same kind of thing?`,
    realWorldContext: `Probability appears everywhere â€” in forecasts, games, clinical trials, insurance, and machine learning â€” but it is not always computed the same way. When a casino says the house edge on roulette is 5.26%, they used classical probability: counting equally-likely outcomes. When an epidemiologist says a vaccine is 94% effective, they used empirical probability: counting cases in a clinical trial. When a doctor estimates a patient's survival odds, they use subjective probability: expert judgment calibrated by experience. Understanding which approach applies â€” and what assumptions each requires â€” is the foundation of all statistical reasoning.`,
  },

  intuition: {
    prose: [
      `**Start with 600 rolls of a die.** A class of 30 students each rolled a standard die 20 times and pooled their 600 results: 97 ones, 103 twos, 98 threes, 104 fours, 102 fives, and 96 sixes. The relative frequency of rolling "1" is 97/600 â‰ˆ 0.162. The classical prediction is 1/6 â‰ˆ 0.167. These two numbers are close but not equal â€” and that gap is the starting point for understanding what probability actually means.`,

      `**Sample space, outcome, and event â€” the vocabulary.** Before computing any probability, identify what experiment you are running and what can happen. The **sample space** $S$ is the complete list of all possible outcomes. An **outcome** is one specific result. An **event** $A$ is any collection of outcomes â€” any subset of $S$. For the die experiment: $S = \\{1, 2, 3, 4, 5, 6\\}$. The event "roll an even number" is $A = \\{2, 4, 6\\}$. That event contains 3 outcomes out of 6 possible.`,

      `**Classical probability: count the outcomes.** When every outcome in $S$ is equally likely, the probability of event $A$ is simply the fraction of outcomes that belong to $A$: $$P(A) = \\frac{|A|}{|S|}$$ where $|A|$ means "the number of outcomes in $A$." For our die: $P(\\text{even}) = |\\{2,4,6\\}| / |\\{1,2,3,4,5,6\\}| = 3/6 = 0.5$. This formula works for a fair die, a shuffled deck, or any situation with equally-likely outcomes. It breaks down the moment outcomes are not equally likely.`,

      `**Empirical probability: count what happened.** When you cannot list equally-likely outcomes, run the experiment and count. $$P(A) \\approx \\frac{\\text{number of times } A \\text{ occurred}}{\\text{total number of trials}}$$ The **Law of Large Numbers** guarantees that as the number of trials grows, the empirical probability gets closer and closer to the true probability.`,

      `**Subjective probability: expert belief.** When you cannot count outcomes and cannot run repeated experiments, probability becomes a calibrated belief. A surgeon's "85% chance of success" is a subjective probability: informed by data and experience but ultimately a personal assessment. It must still satisfy the same mathematical rules.`,

      `**Before reading on, predict:** A coin is flipped 10 times and lands heads every time. Does the coin "owe" you tails on the 11th flip? Will tails be more likely than heads?`,

      `**The Gambler's Fallacy.** Each coin flip is an independent event. Previous results do not change future probabilities. $P(\\text{heads}) = 0.5$ on every single flip, regardless of history. The coin has no memory. The Law of Large Numbers says that over a very long run, the proportion of heads approaches 0.5 â€” but it says nothing about any individual flip. Believing that tails is "due" after a streak of heads is the **Gambler's Fallacy**, and it causes real financial harm in casinos and investment decisions every day.`,

      `**Probability vs. odds.** Probability is not the only way to express likelihood. **Odds in favour** of $A$ = $P(A) : P(A^c) = P(A) : (1 - P(A))$. If $P(A) = 0.25$, the odds in favour are $0.25 : 0.75 = 1 : 3$. Converting back: $P = \\text{odds for} / (\\text{odds for} + \\text{odds against})$. Sports betting and medical research often report odds; data science and statistics prefer probability.`,
    ],
    callouts: [
      {
        type: 'procedure',
        title: 'Choosing the Right Probability Type',
        body: `**Step 1.** Are the outcomes equally likely and fully listable? â†’ **Classical:** $P(A) = |A| / |S|$.

**Step 2.** Can you run (or have recorded) many repeated trials? â†’ **Empirical:** $P(A) \\approx$ (count of $A$) / (total trials).

**Step 3.** Neither equally-likely outcomes nor repeated trials available? â†’ **Subjective:** a calibrated expert belief that must still satisfy all probability axioms.`,
      },
      {
        type: 'insight',
        title: 'Three Interpretations, One Axiom System',
        body: `All three approaches must satisfy the same Kolmogorov axioms:

(1) **Non-negativity:** $P(A) \\geq 0$ for every event $A$.
(2) **Normalisation:** $P(S) = 1$ â€” something must happen.
(3) **Additivity:** if $A$ and $B$ are mutually exclusive, $P(A \\cup B) = P(A) + P(B)$.

Every rule you will learn in this chapter â€” complement, addition rule, Bayes' Theorem â€” follows from these three axioms alone.`,
      },
      {
        type: 'warning',
        title: 'Two Classic Errors',
        body: `**Error 1: Applying classical probability to non-uniform outcomes.** If you answer "there are 2 outcomes (type A blood, not type A) so P = 1/2," you have applied the classical formula to a non-uniform space. The actual P(blood type A) â‰ˆ 0.41 â€” determined empirically.

**Error 2: The Gambler's Fallacy.** The Law of Large Numbers is a long-run convergence result. It says nothing about any individual trial.`,
      },
    ],
    visualizations: [
      {
        id: 'CardDiceLab',
        title: 'Cards and Dice Lab',
        mathBridge: `**Start here before any formula.** Use Dice mode to find how many of the 36 outcomes give a sum of 7 â€” the green cells are the favorable outcomes; the fraction at the bottom is P(sum=7). Then try Cards mode to compute P(Ace), P(Heart), and P(Ace OR Heart). In every case you are doing the same thing: counting favorable outcomes, counting total outcomes, dividing. That ratio is classical probability.`,
        caption: `Count favorable outcomes first, then divide by total outcomes. Change the target sum or card event and watch the probability update instantly.`,
      },
    ],
  },

  math: {
    prose: [
      `**Formal setup.** Let $S$ be a non-empty set (the sample space). An **event** is a subset $A \\subseteq S$. A **probability function** $P$ assigns to each event a real number satisfying the three Kolmogorov axioms: (1) $P(A) \\geq 0$, (2) $P(S) = 1$, (3) for any two mutually exclusive events $A \\cap B = \\emptyset$: $P(A \\cup B) = P(A) + P(B)$. Every other probability rule is a consequence of these three.`,

      `**Classical probability formula.** If $S$ is finite and all outcomes are equally likely, $P(A) = |A| / |S|$ where $|A|$ denotes the number of outcomes in $A$. This follows directly from axioms 2 and 3: if $S$ has $n$ equally-likely singleton outcomes, then $P(\\{s_i\\}) = 1/n$ for each $i$, so $P(A) = \\sum_{s_i \\in A} P(\\{s_i\\}) = |A| \\cdot (1/n)$.`,

      `**Law of Large Numbers (informal).** Let $A$ be an event with true probability $P(A) = p$. Perform $n$ independent repetitions. The empirical probability $\\hat{p}_n = f_n / n$ satisfies: for every $\\varepsilon > 0$, $P(|\\hat{p}_n - p| > \\varepsilon) \\to 0$ as $n \\to \\infty$. In plain language: the probability that the empirical estimate deviates from the true probability by more than any fixed amount goes to zero as $n$ grows.`,

      `**Odds and probability conversion.** Given $P(A) = p$, the odds in favour of $A$ are $\\text{odds}(A) = p / (1 - p)$. The inverse: $p = \\text{odds}(A) / (1 + \\text{odds}(A))$. $p = 0.5$ gives odds $= 1$ (even odds); $p = 0.9$ gives odds $= 9$ (9:1 in favour).`,
    ],
    callouts: [],
  },

  rigor: {
    prose: [
      `**Measure theory foundation.** In advanced probability, $S$ is equipped with a $\\sigma$-algebra $\\mathcal{F}$ â€” a collection of subsets closed under complement and countable unions. The probability function $P: \\mathcal{F} \\to [0,1]$ is a measure with $P(S) = 1$. For discrete $S$ this is elementary; for continuous $S$ (e.g., $S = \\mathbb{R}$) it requires the Borel $\\sigma$-algebra. This is why the classical formula $P(A) = |A|/|S|$ only applies to finite $S$ with equally-likely outcomes.`,

      `**Frequentist vs. Bayesian interpretations.** The Kolmogorov axioms define the mathematics; they do not prescribe the meaning of $P$. The **frequentist** interpretation: probability is the long-run relative frequency of a repeatable experiment. The **Bayesian** interpretation: probability is a degree of belief about any uncertain proposition, updated via Bayes' Theorem as evidence accumulates. Both are internally consistent. This course uses both â€” classical/empirical probability is frequentist; Bayes' Theorem (stat4-004) is Bayesian.`,

      `**Why the Gambler's Fallacy is a formal error.** Two events $A$ and $B$ are **independent** if $P(A \\cap B) = P(A) \\cdot P(B)$. For a fair coin, successive flips are independent by assumption. The $k$-th flip lives on a different trial from the $(k-1)$-th flip. The intersection of "flip 10 = heads" and "flip 11 = heads" has probability $0.5 \\times 0.5 = 0.25$, regardless of all prior results. There is no mechanism by which past independent outcomes can affect future ones.`,
    ],
  },

  examples: [
    {
      id: 'ex1',
      title: 'Example 1 â€” Classical Probability: Dice',
      prose: `A fair six-sided die is rolled once. Compute the probability of rolling (a) a 4, (b) an even number, (c) a number greater than 4.`,
      steps: [
        { expression: `S = \\{1, 2, 3, 4, 5, 6\\}, \\quad |S| = 6`, annotation: `The sample space has 6 equally-likely outcomes.` },
        { expression: `P(\\text{roll 4}) = \\frac{|\\{4\\}|}{|S|} = \\frac{1}{6} \\approx 0.167`, annotation: `One favorable outcome out of 6.` },
        { expression: `P(\\text{even}) = \\frac{|\\{2,4,6\\}|}{6} = \\frac{3}{6} = 0.5`, annotation: `Three even outcomes: 2, 4, 6.` },
        { expression: `P(\\text{greater than 4}) = \\frac{|\\{5,6\\}|}{6} = \\frac{2}{6} \\approx 0.333`, annotation: `Two outcomes exceed 4.` },
      ],
    },
    {
      id: 'ex2',
      title: 'Example 2 â€” Empirical Probability: Quality Control',
      prose: `A factory inspected 500 parts and found 17 defective. What is the empirical probability that a randomly selected part is defective? What is P(not defective)?`,
      steps: [
        { expression: `P(\\text{defective}) \\approx \\frac{17}{500} = 0.034`, annotation: `Empirical probability: count of defective parts divided by total inspected.` },
        { expression: `P(\\text{not defective}) = 1 - 0.034 = 0.966`, annotation: `Complement rule. Every part is either defective or not, so probabilities sum to 1.` },
        { expression: `\\text{If 10{,}000 parts produced: expected defects} \\approx 10{,}000 \\times 0.034 = 340`, annotation: `The empirical probability extends to prediction: about 340 defective parts per 10,000 produced.` },
      ],
    },
    {
      id: 'ex3',
      title: 'Example 3 â€” Odds Conversion',
      prose: `A sports betting line gives odds of 5:2 in favour of Team A winning. What is the implied probability that Team A wins?`,
      steps: [
        { expression: `\\text{Odds in favour} = 5:2 \\Rightarrow \\text{odds} = 5/2 = 2.5`, annotation: `Odds in favour mean: for every 5 wins, there are 2 losses.` },
        { expression: `P(\\text{win}) = \\frac{\\text{odds for}}{\\text{odds for} + \\text{odds against}} = \\frac{5}{5+2} = \\frac{5}{7} \\approx 0.714`, annotation: `Convert odds to probability. Team A is favored at about 71.4%.` },
        { expression: `P(\\text{loss}) = 1 - \\frac{5}{7} = \\frac{2}{7} \\approx 0.286`, annotation: `Complement. Note: betting lines build in a house margin â€” the implied probabilities sum to more than 1 across all outcomes.` },
      ],
    },
  ],

  challenges: [
    {
      id: 'ch1',
      difficulty: 'easy',
      problem: `Two fair dice are rolled. (a) How many outcomes are in the sample space? (b) What is P(sum = 7)? (c) What is P(sum = 12)? (d) What is P(at least one die shows 6)?`,
      walkthrough: [
        `(a) Each die has 6 faces; with two dice the sample space has $6 \\times 6 = 36$ equally-likely outcomes.

(b) Outcomes with sum 7: (1,6), (2,5), (3,4), (4,3), (5,2), (6,1) â€” that is 6 outcomes. $P(\\text{sum}=7) = 6/36 = 1/6 \\approx 0.167$.

(c) Only (6,6) gives sum 12. $P(\\text{sum}=12) = 1/36 \\approx 0.028$.

(d) Outcomes where at least one die shows 6: P(at least one 6) = 1 âˆ’ P(no 6) = 1 âˆ’ (5/6)Â² = 1 âˆ’ 25/36 = 11/36 â‰ˆ 0.306. (We will formalise this complement technique in stat4-002.)`,
      ],
    },
    {
      id: 'ch2',
      difficulty: 'medium',
      problem: `A bag contains 5 red, 3 blue, and 2 green marbles. One marble is drawn at random. (a) List the sample space and state which probability type applies. (b) Compute P(red), P(blue), P(green). (c) Convert P(red) into odds in favour of drawing red. (d) Over 200 draws with replacement, about how many times would you expect to draw blue?`,
      walkthrough: [
        `(a) $S = \\{\\text{red}_1, \\ldots, \\text{red}_5, \\text{blue}_1, \\text{blue}_2, \\text{blue}_3, \\text{green}_1, \\text{green}_2\\}$, or equivalently $|S| = 10$ with each marble equally likely. This is **classical probability** â€” finite, equally-likely outcomes.

(b) $P(\\text{red}) = 5/10 = 0.5$; $P(\\text{blue}) = 3/10 = 0.3$; $P(\\text{green}) = 2/10 = 0.2$. Check: $0.5 + 0.3 + 0.2 = 1$ âœ“.

(c) $P(\\text{red}) = 0.5$ â†’ odds in favour $= 0.5/(1-0.5) = 1:1$ (even odds).

(d) Expected blue draws $= 200 \\times 0.3 = 60$ out of 200 draws.`,
      ],
    },
  ],

  python: {
    cells: [
      {
        id: 'py1',
        cellTitle: 'Simulating Empirical Probability: Law of Large Numbers',
        prose: `Roll a fair die many times and watch the empirical probability of rolling a 1 converge toward the true probability 1/6 â‰ˆ 0.167.`,
        code: `import numpy as np
import matplotlib.pyplot as plt

np.random.seed(42)
n_max = 2000
rolls = np.random.randint(1, 7, size=n_max)

# Running empirical probability of rolling 1
running_p = np.cumsum(rolls == 1) / np.arange(1, n_max + 1)

print("n rolls | Empirical P(1) | Classical P(1)")
print("-" * 44)
for n in [10, 50, 100, 500, 1000, 2000]:
    print(f"  {n:5d} |    {running_p[n-1]:.4f}      |    {1/6:.4f}")

fig, ax = plt.subplots(figsize=(9, 4))
ax.plot(range(1, n_max + 1), running_p, color='steelblue', lw=1.5, label='Empirical P(roll 1)')
ax.axhline(1/6, color='red', linestyle='--', lw=2, label='True P = 1/6 â‰ˆ 0.167')
ax.set_xlabel('Number of rolls')
ax.set_ylabel('Empirical probability')
ax.set_title('Law of Large Numbers: P(rolling 1) converges to 1/6')
ax.legend()
ax.set_ylim(0, 0.5)
plt.tight_layout()
plt.show()`,
      },
      {
        id: 'py2',
        cellTitle: 'Classical Probability: Card Deck',
        prose: `Compute and visualise classical probabilities for a standard 52-card deck.`,
        code: `import numpy as np
import matplotlib.pyplot as plt

total_cards = 52

events = {
    'P(Heart)':       13 / total_cards,
    'P(Ace)':          4 / total_cards,
    'P(Face card)':   12 / total_cards,
    'P(Red card)':    26 / total_cards,
    'P(King or Ace)':  8 / total_cards,
}

print(f"{'Event':<20} | {'Count':>5} | {'Probability':>12} | {'Fraction'}")
print("-" * 60)
for name, p in events.items():
    count = round(p * 52)
    print(f"{name:<20} | {count:>5} | {p:>12.4f} | {count}/52")

fig, ax = plt.subplots(figsize=(8, 4))
ax.bar(events.keys(), events.values(), color='steelblue', edgecolor='white')
ax.set_ylabel('Probability')
ax.set_title('Classical Probabilities â€” 52-Card Deck')
ax.set_ylim(0, 0.65)
for i, (name, p) in enumerate(events.items()):
    ax.text(i, p + 0.01, f'{p:.3f}', ha='center', fontsize=9)
plt.xticks(rotation=15, ha='right')
plt.tight_layout()
plt.show()`,
      },
      {
        id: 'py3',
        cellTitle: 'Probability vs. Odds',
        prose: `Explore how odds and probability relate. Odds grow non-linearly â€” a small increase in P near 1 creates enormous odds.`,
        code: `import numpy as np
import matplotlib.pyplot as plt

# Table: probability to odds conversion
probs = [0.05, 0.10, 0.25, 0.50, 0.75, 0.90, 0.95]
print(f"{'P(A)':>6} | {'Odds for':>12} | {'Ratio (for:against)'}")
print("-" * 45)
for p in probs:
    odds = p / (1 - p)
    a = 1 - p
    # Express as simplified ratio
    print(f"{p:>6.2f} | {odds:>12.4f}    | {p:.2f} : {a:.2f}")

# Plot: odds vs probability
p_range = np.linspace(0.01, 0.99, 500)
odds_range = p_range / (1 - p_range)

fig, axes = plt.subplots(1, 2, figsize=(11, 4))

axes[0].plot(p_range, odds_range, color='coral', lw=2)
axes[0].set_xlabel('P(A)')
axes[0].set_ylabel('Odds in favour')
axes[0].set_title('Odds vs. Probability')
axes[0].set_ylim(0, 20)
axes[0].axvline(0.5, color='gray', linestyle='--', lw=1, label='P = 0.5 (even odds)')
axes[0].legend()

# Inverse: probability from odds
odds_input = np.linspace(0.01, 20, 500)
p_from_odds = odds_input / (1 + odds_input)
axes[1].plot(odds_input, p_from_odds, color='steelblue', lw=2)
axes[1].set_xlabel('Odds in favour')
axes[1].set_ylabel('P(A)')
axes[1].set_title('Probability from Odds')
axes[1].axhline(0.5, color='gray', linestyle='--', lw=1, label='P = 0.5')
axes[1].legend()

plt.tight_layout()
plt.show()`,
      },
    ],
  },

  quiz: [
    {
      type: 'choice',
      question: `The sample space for flipping a coin twice is:`,
      options: [`{H, T}`, `{HH, HT, TH, TT}`, `{H, T, HH, TT}`, `{2 heads, 1 head, 0 heads}`],
      answer: `{HH, HT, TH, TT}`,
      hints: [`The sample space lists every possible outcome. Two flips each with 2 outcomes gives 4 combined outcomes.`],
      reviewSection: 'intuition',
    },
    {
      type: 'choice',
      question: `Classical probability P(A) = |A| / |S| is valid when:`,
      options: [
        `All outcomes in S are equally likely`,
        `The sample space is infinite`,
        `The experiment has been repeated many times`,
        `Events are independent`,
      ],
      answer: `All outcomes in S are equally likely`,
      hints: [`Classical probability counts favorable vs. total outcomes â€” this only gives the right answer when each outcome is equally likely.`],
      reviewSection: 'intuition',
    },
    {
      type: 'choice',
      question: `A factory tests 400 circuit boards and finds 12 defective. The empirical probability of a defective board is:`,
      options: [`0.012`, `0.030`, `0.120`, `0.400`],
      answer: `0.030`,
      hints: [`Empirical probability = count of event / total trials = 12 / 400.`],
      reviewSection: 'intuition',
    },
    {
      type: 'choice',
      question: `A coin lands heads 8 times in a row. On the 9th flip, P(heads) for a fair coin is:`,
      options: [`Less than 0.5 â€” tails is "due"`, `Greater than 0.5 â€” the pattern continues`, `Exactly 0.5 â€” each flip is independent`, `Cannot be determined without more information`],
      answer: `Exactly 0.5 â€” each flip is independent`,
      hints: [`Believing a fair coin "owes" you tails is the Gambler's Fallacy. Each flip is an independent event with P(heads) = 0.5.`],
      reviewSection: 'intuition',
    },
    {
      type: 'choice',
      question: `Which Kolmogorov axiom states that the probability of the entire sample space equals 1?`,
      options: [`Non-negativity: P(A) â‰¥ 0`, `Normalisation: P(S) = 1`, `Additivity for mutually exclusive events`, `Complement rule: P(Aá¶œ) = 1 âˆ’ P(A)`],
      answer: `Normalisation: P(S) = 1`,
      hints: [`There are three axioms: non-negativity, normalisation, and additivity. The complement rule is a consequence, not an axiom.`],
      reviewSection: 'math',
    },
    {
      type: 'choice',
      question: `P(A) = 0.40. What are the odds in favour of A?`,
      options: [`1 : 2`, `2 : 3`, `2 : 5`, `0.40 : 1`],
      answer: `2 : 3`,
      hints: [`Odds in favour = P(A) : P(Aá¶œ) = 0.40 : 0.60 = 2 : 3.`],
      reviewSection: 'intuition',
    },
    {
      type: 'choice',
      question: `A doctor says a patient has a "75% chance of responding to the new treatment." This is best described as:`,
      options: [`Classical probability â€” counting equally-likely outcomes`, `Empirical probability â€” long-run frequency from trials`, `Subjective probability â€” expert judgment calibrated by experience`, `Theoretical probability â€” derived from a mathematical model`],
      answer: `Subjective probability â€” expert judgment calibrated by experience`,
      hints: [`The doctor cannot enumerate equally-likely outcomes for this patient nor run repeated experiments. This is a calibrated expert belief.`],
      reviewSection: 'intuition',
    },
    {
      type: 'choice',
      question: `The Law of Large Numbers guarantees that:`,
      options: [
        `After a run of heads, tails becomes more likely`,
        `With enough trials, the empirical probability converges to the true probability`,
        `The sample space shrinks as more data is collected`,
        `The empirical probability is always exactly equal to the true probability`,
      ],
      answer: `With enough trials, the empirical probability converges to the true probability`,
      hints: [`The LLN is a convergence result: the gap between empirical and true probability approaches zero as n â†’ âˆž. It says nothing about any individual trial.`],
      reviewSection: 'math',
    },
    {
      type: 'choice',
      question: `Odds of 4:1 in favour of event A correspond to P(A) = ?`,
      options: [`0.20`, `0.40`, `0.80`, `4.00`],
      answer: `0.80`,
      hints: [`P = odds_for / (odds_for + odds_against) = 4 / (4 + 1) = 4/5 = 0.80.`],
      reviewSection: 'math',
    },
    {
      type: 'choice',
      question: `A standard deck of 52 cards. What is P(drawing a red face card)?`,
      options: [`3/52`, `6/52`, `12/52`, `26/52`],
      answer: `6/52`,
      hints: [`Face cards are Jack, Queen, King â€” 3 per suit, 12 total. Red suits (hearts, diamonds) have 3 face cards each â†’ 6 red face cards.`],
      reviewSection: 'examples',
    },
  ],

  checkpoints: [
    { id: 'cp1', label: 'Name the three types of probability and give an example of each', type: 'recall' },
    { id: 'cp2', label: 'List all outcomes in the sample space for rolling two dice', type: 'recall' },
    { id: 'cp3', label: 'Run Python Cell 1: observe LLN convergence', type: 'lab' },
    { id: 'cp4', label: 'Explain the Gambler\'s Fallacy in your own words', type: 'concept' },
    { id: 'cp5', label: 'Convert P(A) = 0.6 to odds in favour', type: 'application' },
    { id: 'cp6', label: 'Pass the quiz with â‰¥ 80%', type: 'quiz' },
  ],

  definitions: [
    { term: 'Sample space', definition: 'The set S of all possible outcomes of an experiment. Denoted S or Î©.', symbol: 'S' },
    { term: 'Event', definition: 'Any subset A âŠ† S of the sample space. An event occurs if the outcome of the experiment belongs to A.', symbol: 'A' },
    { term: 'Classical probability', definition: 'P(A) = |A|/|S|. Valid only when all outcomes in S are equally likely.', symbol: null },
    { term: 'Empirical probability', definition: 'P(A) â‰ˆ (number of times A occurred) / (total trials). Estimated from observed data.', symbol: null },
    { term: 'Law of Large Numbers', definition: 'As the number of independent trials n â†’ âˆž, the empirical probability converges to the true probability P(A).', symbol: null },
    { term: "Gambler's Fallacy", definition: 'The false belief that past outcomes of independent events affect future probabilities. Each independent trial has the same probability regardless of history.', symbol: null },
    { term: 'Odds in favour', definition: 'P(A) : P(Aá¶œ). If P(A) = p, odds = p/(1âˆ’p). Converted back to probability: p = odds/(1 + odds).', symbol: null },
  ],
};
