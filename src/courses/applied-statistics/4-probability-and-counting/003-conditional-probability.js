export default {
  id: 'stat4-003',
  slug: 'conditional-probability',
  chapter: 'stat4',
  order: 3,
  title: 'Conditional Probability and Independence',
  subtitle: 'Compute conditional probabilities, apply the Multiplication Rule, and determine whether two events are independent.',
  tags: ['conditional probability', 'independence', 'multiplication rule', 'dependent events', 'sampling without replacement', 'Prosecutor\'s Fallacy', 'contingency table'],
  aliases: 'conditional probability independence multiplication rule dependent events sampling without replacement prosecutors fallacy P(A|B)',
  timeToComplete: 40,
  coreConcept: `Conditional probability P(A | B) quantifies how knowing that B occurred changes the probability of A. When knowing B provides no information about A, the events are independent and P(A | B) = P(A).`,
  prerequisites: ['stat4-002'],
  nextLesson: 'stat4-004',

  hook: {
    question: `In a study of 200 patients, 80 received Treatment X and 120 received a placebo. 56 of the 80 treated patients recovered; 48 of the 120 placebo patients recovered. What is the probability of recovery given the patient received Treatment X? Is the treatment effective?`,
    realWorldContext: `Conditional probability is the mathematical language for evidence. Every time a doctor updates a diagnosis based on a new test result, an email filter adjusts its spam score after reading a new word, or a court evaluates whether a suspect's DNA match is meaningful, the underlying calculation is P(A | B). The confusion of P(A | B) with P(B | A) â€” called the Prosecutor's Fallacy â€” has led to wrongful convictions in real court cases. The concept of independence is equally foundational: in clinical trials, randomization ensures that group assignment is independent of other patient characteristics, making the treatment effect estimable without confounding.`,
  },

  intuition: {
    prose: [
      `**Restricting the sample space.** Conditional probability answers: "If I know B occurred, how likely is A?" The key insight is that knowing B occurred *restricts* the relevant sample space to outcomes inside B. The conditional probability is then the fraction of those B-outcomes that also satisfy A. $$P(A \\mid B) = \\frac{P(A \\cap B)}{P(B)}, \\quad P(B) > 0$$ The vertical bar "| " is read "given."`,

      `**The patient study.** 80 received treatment; 56 recovered â†’ $P(\\text{recovery} \\mid \\text{treatment}) = 56/80 = 0.70$. 120 received placebo; 48 recovered â†’ $P(\\text{recovery} \\mid \\text{placebo}) = 48/120 = 0.40$. The treatment raised recovery probability from 40% to 70%. Overall recovery: 104/200 = 0.52. These are three different probabilities â€” unconditional (0.52) and two conditionals (0.70, 0.40).`,

      `**The Multiplication Rule.** Rearranging the definition gives: $$P(A \\cap B) = P(A \\mid B) \\cdot P(B)$$ This lets you compute joint probabilities from conditional ones. Equivalently, $P(A \\cap B) = P(B \\mid A) \\cdot P(A)$.`,

      `**Independence.** Events $A$ and $B$ are *independent* if knowing $B$ occurred does not change the probability of $A$: $$P(A \\mid B) = P(A)$$ Equivalently â€” and more usable for testing: $$P(A \\cap B) = P(A) \\cdot P(B)$$ Use the product rule to test independence. In the patient study: $P(\\text{recovery}) = 0.52$, $P(\\text{treatment}) = 0.40$, $P(\\text{recovery} \\cap \\text{treatment}) = 56/200 = 0.28$. Is $0.28 = 0.52 \\times 0.40 = 0.208$? No â€” recovery and treatment are NOT independent.`,

      `**Before reading on, predict:** A test for a disease has P(positive | disease) = 0.95. A patient tests positive. Is the probability they have the disease equal to 0.95? Why or why not?`,

      `**The Prosecutor's Fallacy: P(A|B) â‰  P(B|A).** P(test positive | disease present) is NOT the same as P(disease present | test positive). The first tells you how good the test is; the second tells you what a positive result means for the patient. These are different quantities related by Bayes' Theorem (stat4-004). Confusing the two in court â€” claiming that a 1-in-a-million DNA match means a 1-in-a-million chance of innocence â€” is the Prosecutor's Fallacy and has led to real wrongful convictions.`,

      `**Sampling without replacement creates dependence.** Drawing cards from a deck without replacing them makes successive draws dependent. After drawing the Ace of Spades, there are 51 cards left â€” the composition of the deck has changed and conditional probabilities shift. P(second card is Ace | first card was Ace) = 3/51 â‰  P(Ace from fresh deck) = 4/52. Dependence arises from the shared pool.`,

      `**Sequential independent events.** For $n$ independent events each with probability $p$: $P(\\text{all } n \\text{ occur}) = p^n$ and $P(\\text{at least one fails}) = 1 - p^n$. System reliability calculations use this: if each component has a 0.95 survival probability and 10 components are in series, system reliability $= 0.95^{10} \\approx 0.599$ â€” just 60% despite each component being 95% reliable.`,
    ],
    callouts: [
      {
        type: 'procedure',
        title: 'Computing P(A | B) â€” Two Steps',
        body: `1. Restrict the sample space to outcomes where $B$ occurred.
2. Among those outcomes, find the fraction where $A$ also occurred.

**Formula:** $P(A \\mid B) = P(A \\cap B) \\,/\\, P(B)$.

**Testing independence:** Check whether $P(A \\cap B) = P(A) \\cdot P(B)$. If yes, independent. If not, dependent.`,
      },
      {
        type: 'warning',
        title: 'Prosecutor\'s Fallacy',
        body: `$P(\\text{evidence} \\mid \\text{hypothesis})$ is NOT the same as $P(\\text{hypothesis} \\mid \\text{evidence})$.

Example: $P(\\text{test positive} \\mid \\text{disease}) = 0.95$ does NOT mean $P(\\text{disease} \\mid \\text{test positive}) = 0.95$. The posterior probability depends also on the base rate (prevalence) of the disease. Bayes' Theorem converts one into the other.`,
      },
      {
        type: 'insight',
        title: 'Independent â‰  Mutually Exclusive',
        body: `Mutually exclusive events ($A \\cap B = \\emptyset$) with non-zero probabilities are actually the **most dependent** events: if $A$ occurs, $B$ is guaranteed NOT to occur â€” knowing $A$ completely changes $P(B)$ from $P(B) > 0$ to $0$.

Independent events: $P(A \\cap B) = P(A) \\cdot P(B) > 0$ (they can both happen, and the occurrence of one doesn't inform the other).
Mutually exclusive events: $P(A \\cap B) = 0 \\neq P(A) \\cdot P(B)$ â€” they are dependent.`,
      },
    ],
    visualizations: [],
  },

  math: {
    prose: [
      `**Conditional probability as a ratio of measures.** If we restrict the sample space from $S$ to the "conditional universe" $B$, we need a new probability measure on $B$ that assigns total probability 1 to $B$. The conditional probability $P(A \\mid B) = P(A \\cap B) / P(B)$ is exactly this rescaling: it reassigns $P(B) \\to 1$ and scales all subsets of $B$ proportionally. One can verify that $P(\\cdot \\mid B)$ satisfies all three Kolmogorov axioms.`,

      `**Law of Total Probability.** If $\\{B_1, B_2, \\ldots, B_n\\}$ is a partition of $S$ (mutually exclusive, exhaustive), then for any event $A$: $$P(A) = \\sum_{i=1}^n P(A \\mid B_i) \\cdot P(B_i)$$ This decomposes $P(A)$ by conditioning on which case $B_i$ occurred. The patient study is an example with two cases (treatment, placebo): $P(\\text{recovery}) = P(\\text{rec} \\mid \\text{tx}) \\cdot P(\\text{tx}) + P(\\text{rec} \\mid \\text{placebo}) \\cdot P(\\text{placebo}) = 0.70 \\times 0.40 + 0.40 \\times 0.60 = 0.28 + 0.24 = 0.52$.`,

      `**Pairwise vs. mutual independence.** Events $A_1, A_2, \\ldots, A_n$ are **mutually independent** if for every subset $\\{A_{i_1}, \\ldots, A_{i_k}\\}$, $P(A_{i_1} \\cap \\cdots \\cap A_{i_k}) = P(A_{i_1}) \\cdots P(A_{i_k})$. Pairwise independence (every pair satisfies $P(A_i \\cap A_j) = P(A_i) P(A_j)$) does NOT imply mutual independence. A counterexample: three fair coin flips, let $A$ = "flip 1 = flip 2," $B$ = "flip 2 = flip 3," $C$ = "flip 1 = flip 3." These are pairwise independent but $P(A \\cap B \\cap C) \\neq P(A) P(B) P(C)$.`,
    ],
    callouts: [],
  },

  rigor: {
    prose: [
      `**Conditional probability and filtrations.** In advanced probability theory (stochastic processes), conditional expectation $E[X \\mid \\mathcal{F}]$ generalizes $P(A \\mid B)$ to arbitrary random variables and $\\sigma$-algebras. The conditional probability $P(A \\mid B)$ is the special case where $X = \\mathbf{1}_A$ (the indicator of $A$) and $\\mathcal{F}$ is the $\\sigma$-algebra generated by $B$. This abstraction is required for Markov chains, martingales, and Bayesian filtering.`,

      `**Why "without replacement" creates dependence â€” formally.** Let $X_1$ be the first draw and $X_2$ be the second. Conditional on $X_1 = a$, the conditional distribution of $X_2$ differs from its unconditional distribution because one copy of $a$ is removed from the urn. Formally, $P(X_2 = a \\mid X_1 = a) = (k_a - 1) / (n - 1)$ where $k_a$ is the initial count of $a$ and $n$ is total. This equals $P(X_2 = a) = k_a / n$ only when $k_a = n$ (all items identical) â€” in general they differ.`,
    ],
  },

  examples: [
    {
      id: 'ex1',
      title: 'Example 1 â€” Conditional Probability from a Contingency Table',
      prose: `A survey of 300 shoppers: 180 bought online (O), 120 bought in-store (I). Of the online buyers, 126 were satisfied (S). Of in-store buyers, 84 were satisfied. Compute (a) P(S | O), (b) P(S | I), (c) P(O | S), (d) test whether S and O are independent.`,
      steps: [
        { expression: `P(S \\mid O) = \\frac{126}{180} = 0.70`, annotation: `Of 180 online buyers, 126 were satisfied.` },
        { expression: `P(S \\mid I) = \\frac{84}{120} = 0.70`, annotation: `Of 120 in-store buyers, 84 were satisfied. Same rate â€” a clue that S and O may be independent.` },
        { expression: `P(S) = \\frac{126 + 84}{300} = \\frac{210}{300} = 0.70`, annotation: `Overall satisfaction rate. Also 70%.` },
        { expression: `P(O) = 180/300 = 0.60,\\quad P(S \\cap O) = 126/300 = 0.42`, annotation: `Marginal probability of online purchase, and joint probability of online AND satisfied.` },
        { expression: `P(S) \\cdot P(O) = 0.70 \\times 0.60 = 0.42 = P(S \\cap O) \\checkmark`, annotation: `The product test passes â€” S (satisfied) and O (online) are INDEPENDENT. Channel doesn't affect satisfaction.` },
        { expression: `P(O \\mid S) = \\frac{P(O \\cap S)}{P(S)} = \\frac{0.42}{0.70} = 0.60 = P(O)`, annotation: `Confirming independence: knowing someone is satisfied gives no information about their channel.` },
      ],
    },
    {
      id: 'ex2',
      title: 'Example 2 â€” Sequential Draws Without Replacement',
      prose: `A box contains 5 red and 3 blue chips. Two chips are drawn without replacement. Compute (a) P(both red), (b) P(second is red | first is red), (c) P(second is red | first is blue), (d) are the two draws independent?`,
      steps: [
        { expression: `P(\\text{1st red}) = \\frac{5}{8}`, annotation: `Before any draw: 5 red out of 8 total.` },
        { expression: `P(\\text{2nd red} \\mid \\text{1st red}) = \\frac{4}{7}`, annotation: `After removing one red chip: 4 red remain out of 7 total.` },
        { expression: `P(\\text{both red}) = \\frac{5}{8} \\times \\frac{4}{7} = \\frac{20}{56} \\approx 0.357`, annotation: `Multiplication Rule for dependent events.` },
        { expression: `P(\\text{2nd red} \\mid \\text{1st blue}) = \\frac{5}{7} \\approx 0.714`, annotation: `After removing one blue chip: 5 red remain out of 7. A higher probability.` },
        { expression: `P(\\text{2nd red}) = \\frac{5}{8} \\times \\frac{4}{7} + \\frac{3}{8} \\times \\frac{5}{7} = \\frac{20+15}{56} = \\frac{35}{56} = \\frac{5}{8}`, annotation: `Marginal probability of 2nd draw. Interestingly, the marginal equals P(1st red) = 5/8 â€” but the draws are still dependent because the conditionals differ.` },
        { expression: `P(\\text{1st red}) \\cdot P(\\text{2nd red}) = \\frac{5}{8} \\times \\frac{5}{8} \\neq \\frac{20}{56} = P(\\text{both red})`, annotation: `The product test fails â†’ the two draws are DEPENDENT. Without replacement creates dependence.` },
      ],
    },
  ],

  challenges: [
    {
      id: 'ch1',
      difficulty: 'medium',
      problem: `A factory has two machines. Machine A produces 60% of items; 3% are defective. Machine B produces 40%; 5% are defective. An item is selected at random. (a) P(defective). (b) Given the item is defective, what is P(it came from Machine A)? (c) Given the item is not defective, what is P(it came from Machine A)?`,
      walkthrough: [
        `(a) Law of Total Probability:
$P(D) = P(D \\mid A) P(A) + P(D \\mid B) P(B) = 0.03 \\times 0.60 + 0.05 \\times 0.40 = 0.018 + 0.020 = 0.038$

(b) Conditional probability (Bayes' Theorem preview):
$P(A \\mid D) = P(D \\cap A) / P(D) = 0.018 / 0.038 \\approx 0.474$

Despite producing 60% of units, Machine A is responsible for only 47.4% of defective units because its defect rate is lower.

(c) $P(D^c) = 1 - 0.038 = 0.962$; $P(A \\cap D^c) = 0.60 - 0.018 = 0.582$
$P(A \\mid D^c) = 0.582 / 0.962 \\approx 0.605$

Given non-defective, Machine A's share rises slightly above its production share â€” it produces proportionally more good parts.`,
      ],
    },
    {
      id: 'ch2',
      difficulty: 'hard',
      problem: `An online retailer tracks ad behavior: 30% of visitors click an ad, 10% of all visitors make a purchase. 24% of visitors who click an ad make a purchase. (a) Are "click ad" and "purchase" independent? (b) P(clicked ad | purchased). (c) P(purchased | did NOT click ad).`,
      walkthrough: [
        `Let C = "clicked ad," P_buy = "made purchase." $P(C) = 0.30$, $P(P_{\\text{buy}}) = 0.10$, $P(P_{\\text{buy}} \\mid C) = 0.24$.

(a) If independent: $P(P_{\\text{buy}} \\mid C) = P(P_{\\text{buy}}) = 0.10$. But we have $P(P_{\\text{buy}} \\mid C) = 0.24 \\neq 0.10$ â†’ **NOT independent**. Clicking an ad more than doubles the purchase probability.

(b) $P(P_{\\text{buy}} \\cap C) = P(P_{\\text{buy}} \\mid C) \\times P(C) = 0.24 \\times 0.30 = 0.072$.
$P(C \\mid P_{\\text{buy}}) = P(P_{\\text{buy}} \\cap C) / P(P_{\\text{buy}}) = 0.072 / 0.10 = 0.72$.
72% of purchasers clicked an ad â€” even though only 30% of all visitors did.

(c) $P(P_{\\text{buy}} \\cap C^c) = P(P_{\\text{buy}}) - P(P_{\\text{buy}} \\cap C) = 0.10 - 0.072 = 0.028$.
$P(C^c) = 0.70$.
$P(P_{\\text{buy}} \\mid C^c) = 0.028 / 0.70 = 0.04$.
Without an ad click, only 4% of visitors purchase â€” vs. 24% with a click.`,
      ],
    },
  ],

  python: {
    cells: [
      {
        id: 'py1',
        cellTitle: 'Conditional Probability from a Contingency Table',
        prose: `A contingency table is the natural home for conditional probability. Each cell count divided by a row or column total gives a conditional probability.`,
        code: `import numpy as np
import matplotlib.pyplot as plt

# Treatment study: 200 patients
# Rows: Treatment X, Placebo  |  Columns: Recovered, Not recovered
data = {
    'Treatment': {'Recovered': 56, 'Not Recovered': 24},
    'Placebo':   {'Recovered': 48, 'Not Recovered': 72},
}

total = 200
total_tx  = 56 + 24
total_plb = 48 + 72
total_rec = 56 + 48

p_tx        = total_tx / total
p_rec       = total_rec / total
p_rec_tx    = 56 / total_tx
p_rec_plb   = 48 / total_plb
p_rec_and_tx = 56 / total

print("=== Contingency Table ===")
print(f"{'':>12} | {'Recovered':>10} | {'Not Rec.':>10} | {'Total':>8}")
print("-" * 48)
print(f"{'Treatment':>12} | {56:>10} | {24:>10} | {total_tx:>8}")
print(f"{'Placebo':>12} | {48:>10} | {72:>10} | {total_plb:>8}")
print(f"{'Total':>12} | {total_rec:>10} | {200-total_rec:>10} | {total:>8}")
print()
print(f"P(Treatment)              = {p_tx:.4f}")
print(f"P(Recovered)              = {p_rec:.4f}")
print(f"P(Recovered | Treatment)  = {p_rec_tx:.4f}")
print(f"P(Recovered | Placebo)    = {p_rec_plb:.4f}")
print()
print("Independence test:")
print(f"  P(Rec âˆ© Tx)    = {p_rec_and_tx:.4f}")
print(f"  P(Rec)Ã—P(Tx)   = {p_rec * p_tx:.4f}")
print(f"  Independent?   = {abs(p_rec_and_tx - p_rec * p_tx) < 0.001}")

fig, ax = plt.subplots(figsize=(8, 4))
groups = ['P(Rec|Treatment)', 'P(Rec|Placebo)', 'P(Rec) overall']
values = [p_rec_tx, p_rec_plb, p_rec]
colors = ['steelblue', 'coral', 'green']
bars = ax.bar(groups, values, color=colors, alpha=0.85, edgecolor='white')
for bar, val in zip(bars, values):
    ax.text(bar.get_x() + bar.get_width()/2, bar.get_height() + 0.01,
            f'{val:.3f}', ha='center', fontsize=11, fontweight='bold')
ax.set_ylabel('Probability of Recovery')
ax.set_title('Conditional vs. Marginal Recovery Probability')
ax.set_ylim(0, 0.90)
plt.tight_layout()
plt.show()`,
      },
      {
        id: 'py2',
        cellTitle: 'Testing Independence',
        prose: `Independence means P(A âˆ© B) = P(A) Ã— P(B). This cell checks independence for three scenarios and shows how the conditional probability shifts when events are dependent.`,
        code: `import numpy as np

def test_independence(p_a, p_b, p_ab, label):
    """Check if A and B are independent and show conditionals."""
    product = p_a * p_b
    is_indep = abs(p_ab - product) < 1e-9
    if p_b > 0:
        p_a_given_b = p_ab / p_b
    else:
        p_a_given_b = float('nan')

    print(f"=== {label} ===")
    print(f"  P(A)              = {p_a:.4f}")
    print(f"  P(B)              = {p_b:.4f}")
    print(f"  P(A âˆ© B)          = {p_ab:.4f}")
    print(f"  P(A)Ã—P(B)         = {product:.4f}")
    print(f"  P(A|B)            = {p_a_given_b:.4f}   (= P(A) = {p_a:.4f}?  {is_indep})")
    print(f"  Independent?      = {is_indep}")
    print()

# Scenario 1: Independent â€” channel doesn't affect satisfaction
test_independence(0.60, 0.70, 0.42, "Online purchase vs. Satisfied (independent)")

# Scenario 2: Dependent â€” treatment improves recovery
p_tx = 0.40; p_rec = 0.52; p_rec_tx = 56/200
test_independence(p_tx, p_rec, p_rec_tx, "Treatment X vs. Recovery (dependent)")

# Scenario 3: Perfectly dependent â€” always co-occur
test_independence(0.30, 0.30, 0.30, "A âŠ† B (perfectly correlated)")`,
      },
      {
        id: 'py3',
        cellTitle: 'Sampling Without Replacement: Visualizing Dependence',
        prose: `With 5 red and 3 blue chips, drawing without replacement creates dependence â€” the second draw's conditional probability depends on what was drawn first.`,
        code: `import numpy as np
import matplotlib.pyplot as plt

red, blue = 5, 3
total = red + blue

# Exact conditional probabilities
p_r1 = red / total
p_r2_given_r1 = (red - 1) / (total - 1)
p_r2_given_b1 = red / (total - 1)
p_b1 = blue / total

# Marginal probability of 2nd draw
p_r2_marginal = p_r1 * p_r2_given_r1 + p_b1 * p_r2_given_b1

print(f"Urn: {red} red, {blue} blue = {total} total")
print()
print(f"P(1st draw = red)             = {p_r1:.4f}")
print(f"P(2nd red | 1st red)          = {p_r2_given_r1:.4f}  â† fewer red remain")
print(f"P(2nd red | 1st blue)         = {p_r2_given_b1:.4f}  â† same red, one less blue")
print(f"P(2nd red) [marginal]         = {p_r2_marginal:.4f}  â† equals P(1st red)!")
print()
print(f"Independence check:")
print(f"  P(both red)    = {p_r1 * p_r2_given_r1:.4f}")
print(f"  P(r1)Ã—P(r2)   = {p_r1 * p_r2_marginal:.4f}  â† different â†’ DEPENDENT")

# Plot the two conditionals vs. the marginal
fig, ax = plt.subplots(figsize=(7, 4))
scenarios = ['P(2nd red\n| 1st red)', 'P(2nd red\n| 1st blue)', 'P(2nd red)\nMarginal']
values = [p_r2_given_r1, p_r2_given_b1, p_r2_marginal]
colors = ['coral', 'steelblue', 'green']
bars = ax.bar(scenarios, values, color=colors, alpha=0.85, edgecolor='white')
for bar, val in zip(bars, values):
    ax.text(bar.get_x() + bar.get_width()/2, bar.get_height() + 0.01,
            f'{val:.3f}', ha='center', fontsize=11, fontweight='bold')
ax.set_ylabel('P(2nd draw = red)')
ax.set_title(f'Conditional vs. Marginal Probabilities ({red} red, {blue} blue, no replacement)')
ax.set_ylim(0, 0.85)
plt.tight_layout()
plt.show()`,
      },
    ],
  },

  quiz: [
    {
      type: 'choice',
      question: `P(A âˆ© B) = 0.15, P(B) = 0.50. What is P(A | B)?`,
      options: [`0.075`, `0.30`, `0.65`, `0.15`],
      answer: `0.30`,
      hints: [`P(A | B) = P(A âˆ© B) / P(B) = 0.15 / 0.50.`],
      reviewSection: 'intuition',
    },
    {
      type: 'choice',
      question: `For independent events A and B with P(A) = 0.3 and P(B) = 0.6, P(A âˆ© B) = ?`,
      options: [`0.90`, `0.18`, `0.50`, `0.30`],
      answer: `0.18`,
      hints: [`Independence means P(A âˆ© B) = P(A) Ã— P(B) = 0.3 Ã— 0.6.`],
      reviewSection: 'intuition',
    },
    {
      type: 'choice',
      question: `5 independent components each have P(failure) = 0.02. P(at least one fails) = ?`,
      options: [`0.10`, `0.096`, `0.904`, `0.02`],
      answer: `0.096`,
      hints: [`P(at least one fails) = 1 âˆ’ P(all work) = 1 âˆ’ 0.98âµ â‰ˆ 1 âˆ’ 0.904.`],
      reviewSection: 'intuition',
    },
    {
      type: 'choice',
      question: `P(A | B) = 0.45 and P(A) = 0.30. What can we conclude?`,
      options: [`A and B are independent`, `A and B are mutually exclusive`, `A and B are dependent`, `P(B | A) = 0.45`],
      answer: `A and B are dependent`,
      hints: [`Independence requires P(A | B) = P(A). Since 0.45 â‰  0.30, they are dependent.`],
      reviewSection: 'intuition',
    },
    {
      type: 'choice',
      question: `A test has P(positive | disease) = 0.95. A patient tests positive. The probability they have the disease is:`,
      options: [`0.95 â€” that is what P(positive | disease) means`, `Different â€” we need P(disease | positive)`, `Exactly 1.0`, `0.05`],
      answer: `Different â€” we need P(disease | positive)`,
      hints: [`P(A | B) â‰  P(B | A) in general. We need Bayes' Theorem and the disease prevalence to compute P(disease | positive).`],
      reviewSection: 'intuition',
    },
    {
      type: 'choice',
      question: `P(A) = 0.5, P(B | A) = 0.4. P(A âˆ© B) = ?`,
      options: [`0.2`, `0.9`, `0.1`, `0.8`],
      answer: `0.2`,
      hints: [`Multiplication Rule: P(A âˆ© B) = P(B | A) Ã— P(A) = 0.4 Ã— 0.5.`],
      reviewSection: 'intuition',
    },
    {
      type: 'choice',
      question: `P(A) = 0.40, P(B) = 0.50, P(A âˆ© B) = 0.20. Which is true?`,
      options: [
        `A and B are independent`,
        `A and B are dependent`,
        `A and B are mutually exclusive`,
        `P(A | B) = 0.40 and P(B | A) = 0.50`,
      ],
      answer: `A and B are independent`,
      hints: [`Check: P(A) Ã— P(B) = 0.40 Ã— 0.50 = 0.20 = P(A âˆ© B). Independence confirmed.`],
      reviewSection: 'examples',
    },
    {
      type: 'choice',
      question: `Cards are drawn WITHOUT replacement from a deck. The two draws are:`,
      options: [
        `Independent â€” each card is still equally likely`,
        `Dependent â€” removing one card changes the remaining composition`,
        `Mutually exclusive â€” you cannot draw the same card twice`,
        `Independent only if the first card is replaced`,
      ],
      answer: `Dependent â€” removing one card changes the remaining composition`,
      hints: [`P(2nd Ace | 1st Ace) = 3/51, but P(Ace from fresh deck) = 4/52. These differ â†’ dependent.`],
      reviewSection: 'intuition',
    },
    {
      type: 'choice',
      question: `In the Law of Total Probability, P(A) = P(A|Bâ‚)P(Bâ‚) + P(A|Bâ‚‚)P(Bâ‚‚) + â€¦ requires that Bâ‚, Bâ‚‚, â€¦ are:`,
      options: [
        `Independent events`,
        `A partition of S (mutually exclusive and exhaustive)`,
        `Equally likely events`,
        `Events with the same probability as A`,
      ],
      answer: `A partition of S (mutually exclusive and exhaustive)`,
      hints: [`The Law of Total Probability decomposes A by which case occurred. The cases must cover all possibilities without overlap.`],
      reviewSection: 'math',
    },
    {
      type: 'choice',
      question: `A security system has two independent alarms, each with P(triggering | intrusion) = 0.85. P(at least one triggers | intrusion) = ?`,
      options: [`0.725`, `0.850`, `0.9775`, `0.9225`],
      answer: `0.9775`,
      hints: [`P(at least one) = 1 âˆ’ P(neither) = 1 âˆ’ (1 âˆ’ 0.85)Â² = 1 âˆ’ 0.15Â² = 1 âˆ’ 0.0225 = 0.9775.`],
      reviewSection: 'intuition',
    },
  ],

  checkpoints: [
    { id: 'cp1', label: 'P(A âˆ© B) = 0.12, P(B) = 0.40. Compute P(A | B).', type: 'application' },
    { id: 'cp2', label: 'P(A) = 0.50, P(B) = 0.60, P(A âˆ© B) = 0.30. Are A and B independent?', type: 'application' },
    { id: 'cp3', label: 'Run Python Cell 1: identify which recovery probability is conditional vs. marginal', type: 'lab' },
    { id: 'cp4', label: 'Explain the Prosecutor\'s Fallacy in your own words', type: 'concept' },
    { id: 'cp5', label: 'P(A) = 0.3, P(B | A) = 0.6. Find P(A âˆ© B) using the Multiplication Rule.', type: 'application' },
    { id: 'cp6', label: 'Pass the quiz with â‰¥ 80%', type: 'quiz' },
  ],

  definitions: [
    { term: 'Conditional probability', definition: 'P(A | B) = P(A âˆ© B) / P(B). The probability of A given that B has already occurred. Requires P(B) > 0.', symbol: 'P(A|B)' },
    { term: 'Independence', definition: 'Events A and B are independent if P(A | B) = P(A), equivalently P(A âˆ© B) = P(A)Â·P(B). Knowing B occurred gives no information about A.', symbol: null },
    { term: 'Multiplication Rule', definition: 'P(A âˆ© B) = P(A | B) Â· P(B). For independent events: P(A âˆ© B) = P(A) Â· P(B).', symbol: null },
    { term: "Prosecutor's Fallacy", definition: 'Incorrectly equating P(evidence | hypothesis) with P(hypothesis | evidence). These require Bayes\' Theorem to relate.', symbol: null },
    { term: 'Law of Total Probability', definition: 'If {Bâ‚,â€¦,Bâ‚™} partitions S, then P(A) = Î£ P(A|Báµ¢)Â·P(Báµ¢). Decomposes an event by cases.', symbol: null },
  ],
};
