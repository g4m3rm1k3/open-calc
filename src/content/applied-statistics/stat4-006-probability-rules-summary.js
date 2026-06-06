export default {
  id: 'stat4-006',
  slug: 'probability-rules-summary',
  chapter: 'stat4',
  order: 6,
  title: 'Probability Rules Summary',
  subtitle: 'A unified framework for every probability rule â€” and how to select the right one for any problem.',
  tags: ['probability rules', 'decision framework', 'law of total probability', 'multi-step probability', 'complement', 'addition rule', 'multiplication rule', 'Bayes theorem', 'independence', 'combinations'],
  aliases: 'probability rules summary decision guide law of total probability multi-step problems review synthesis integration',
  timeToComplete: 40,
  coreConcept: `Every probability problem reduces to one or more of the same five rules: complement, addition, multiplication, conditional, and Bayes\'. The skill is recognizing which rule the structure calls for. This lesson maps problem structures to formulas and synthesizes all of Chapter 4 into a single decision framework.`,
  prerequisites: ['stat4-001', 'stat4-002', 'stat4-003', 'stat4-004', 'stat4-005'],
  nextLesson: 'stat5-001',

  hook: {
    question: `Three dice are rolled. What is P(at least one 6)? What is P(sum = 18)? What is P(at least one 6 | sum = 18)? These three questions look similar but require completely different probability rules â€” can you identify which rule each one calls for before computing?`,
    realWorldContext: `After studying probability rules individually, the real challenge is integration: any real-world problem requires identifying the right rule before computing. An actuary computing insurance premiums chains the Law of Total Probability with conditional probabilities. A quality control engineer computing system reliability chains independent multiplication with the complement rule. A data scientist building a Naive Bayes classifier chains Bayes' Theorem with sequential updates. This lesson is a roadmap: given any probability question, how do you identify the structure and select the right tools?`,
  },

  intuition: {
    prose: [
      `**The probability rule decision tree.** Every probability question starts with: "What kind of probability am I computing?" â€” a single event, a combination of events, a conditional, or a posterior after evidence. Each structure maps to a specific rule. Building fluency means recognizing the structure before opening your formula sheet.`,

      `**Level 1: Single events.** If outcomes are equally-likely â†’ Classical: $P(A) = |A|/|S|$, possibly requiring counting (permutations/combinations). If you have observed data â†’ Empirical: $P(A) \\approx$ count / trials. If using expert judgment â†’ Subjective.`,

      `**Level 2: Logical operations.** You have $P(A)$ and $P(B)$ and need $P$ of some combination. Complement: $P(A^c) = 1 - P(A)$. Union: $P(A \\cup B) = P(A) + P(B) - P(A \\cap B)$. If mutually exclusive: $P(A \\cup B) = P(A) + P(B)$. "At least one": use complement â†’ $1 - P(\\text{none})$.`,

      `**Level 3: Conditioning.** You need $P(A)$ given you know $B$ occurred. Conditional probability: $P(A \\mid B) = P(A \\cap B) / P(B)$. Multiplication Rule: $P(A \\cap B) = P(A \\mid B) \\cdot P(B)$. Law of Total Probability: $P(A) = \\sum_i P(A \\mid B_i) P(B_i)$ when you can decompose by cases.`,

      `**Level 4: Inference.** You have $P(E \\mid H)$ and need $P(H \\mid E)$ â€” the direction is reversed. Use Bayes' Theorem: $P(H \\mid E) = P(E \\mid H) P(H) / P(E)$.`,

      `**Level 5: Counting.** You need to count $|A|$ or $|S|$ to apply classical probability. Does order matter? â†’ permutations. Order doesn't matter? â†’ combinations.`,

      `**Multi-step decomposition.** Complex problems break into sub-problems. Always identify the outermost structure first (what is the final question asking?), then work inward. Most real problems chain 2â€“3 rules: Law of Total Probability (to get $P(A)$) followed by Bayes' Theorem (to get a conditional), or complement rule (for "at least one") applied to a multiplication result (for each independent trial).`,

      `**The four error types.** (1) **Wrong rule**: applying addition rule to events that require multiplication. (2) **Wrong independence assumption**: using $P(A) \\cdot P(B)$ when the events are dependent (e.g., sampling without replacement). (3) **Prosecutor's Fallacy**: confusing $P(A \\mid B)$ with $P(B \\mid A)$. (4) **Counting error**: using permutation when combination is needed, or forgetting the $(1 - p)^c$ complement in "at least one" problems.`,
    ],
    callouts: [
      {
        type: 'procedure',
        title: 'Probability Rule Selection Guide',
        body: `| Structure | Rule | Formula |
|---|---|---|
| Single event, equal outcomes | Classical | $P(A) = |A|/|S|$ |
| Repeated trials | Empirical | $\\approx$ count / n |
| "Not A" | Complement | $1 - P(A)$ |
| "A or B" | Addition | $P(A)+P(B)-P(A \\cap B)$ |
| Mutually exclusive union | Simplified add. | $P(A)+P(B)$ |
| "A and B", dependent | Multiplication | $P(A \\mid B) \\cdot P(B)$ |
| "A and B", independent | Simple product | $P(A) \\cdot P(B)$ |
| "Given B, what is P(A)?" | Conditional | $P(A \\cap B)/P(B)$ |
| Decompose by cases | Law of Total P | $\\sum P(A \\mid B_i) P(B_i)$ |
| Reverse direction of conditioning | Bayes' Theorem | $P(E \\mid H)P(H)/P(E)$ |
| Count ordered arrangements | Permutations | $P(n,r) = n!/(n-r)!$ |
| Count unordered selections | Combinations | $C(n,r) = n!/[r!(n-r)!]$ |`,
      },
      {
        type: 'insight',
        title: 'Connecting All Rules to the Three Axioms',
        body: `Every rule is derived from the three Kolmogorov axioms â€” none is independently assumed:
- Complement rule: from $P(S) = 1$ and additivity.
- Addition rule: from decomposing $A \\cup B$ into disjoint parts + additivity.
- Conditional probability: from the definition $P(A \\mid B) = P(A \\cap B)/P(B)$.
- Independence: a special case of conditional probability.
- Bayes' Theorem: algebra on the conditional probability definition.
- Counting: required to evaluate $|A|$ and $|S|$ for classical probability.`,
      },
    ],
    visualizations: [],
  },

  math: {
    prose: [
      `**Law of Total Probability and Bayes together.** The Law of Total Probability and Bayes' Theorem are paired tools. The Law computes the denominator; Bayes uses it to flip the conditioning direction. Given a partition $\\{H_1, \\ldots, H_n\\}$: first compute $P(E) = \\sum_i P(E \\mid H_i) P(H_i)$ (Law of Total Probability), then $P(H_j \\mid E) = P(E \\mid H_j) P(H_j) / P(E)$ (Bayes). These two formulas together are the foundation of all Bayesian inference.`,

      `**Chaining independence.** For $n$ mutually independent events $A_1, \\ldots, A_n$: $P(A_1 \\cap A_2 \\cap \\cdots \\cap A_n) = P(A_1) \\cdot P(A_2) \\cdots P(A_n)$. This simplifies sequential calculations enormously. System reliability, quality control (probability all $n$ components work), and the birthday problem complement all use this chain. Without independence, each $P(A_k \\mid A_1 \\cap \\cdots \\cap A_{k-1})$ is distinct and must be computed separately.`,

      `**The Bonferroni inequalities.** When exact intersection probabilities are unavailable, the inclusion-exclusion principle gives Bonferroni bounds: $P(A_1 \\cup \\cdots \\cup A_n) \\geq \\sum_i P(A_i) - \\sum_{i < j} P(A_i \\cap A_j)$ (lower bound using first and second terms). These are used in multiple hypothesis testing to bound the probability of any false positive.`,
    ],
    callouts: [],
  },

  rigor: {
    prose: [
      `**Probability space (formal).** A probability space is a triple $(\\Omega, \\mathcal{F}, P)$ where $\\Omega$ is the sample space, $\\mathcal{F}$ is a $\\sigma$-algebra of events, and $P: \\mathcal{F} \\to [0,1]$ satisfies Kolmogorov's axioms. All the rules in this chapter â€” complement, addition, conditional probability, independence â€” are theorems about $P$ in this structure. The "Law of Total Probability" is a theorem: for any partition $\\{B_i\\}$ of $\\Omega$ with $P(B_i) > 0$, $\\sum_i P(A \\mid B_i) P(B_i) = P(A)$ follows from countable additivity.`,

      `**Why independence is a definition, not a theorem.** The statement $P(A \\cap B) = P(A) P(B)$ is the **definition** of independence â€” it cannot be proven from the axioms without additional assumptions. Whether two events in a real model are independent is a modeling assumption that must be justified from the problem structure (e.g., by randomization, physical independence of trials, or prior knowledge). Independence is a strong assumption; it should always be stated explicitly and verified when possible.`,
    ],
  },

  examples: [
    {
      id: 'ex1',
      title: 'Example 1 â€” Three Dice: Multiple Rules in One Problem',
      prose: `Three fair dice are rolled. (a) Total outcomes. (b) P(all three show 6). (c) P(at least one 6). (d) P(sum = 18). (e) P(at least one 6 | sum = 18).`,
      steps: [
        { expression: `|S| = 6^3 = 216`, annotation: `Fundamental Counting Principle: each die has 6 faces, three independent rolls.` },
        { expression: `P(\\text{all 6s}) = (1/6)^3 = 1/216 \\approx 0.00463`, annotation: `Independent events â€” multiply. This is the chain multiplication rule.` },
        { expression: `P(\\text{at least one 6}) = 1 - P(\\text{no 6}) = 1 - (5/6)^3 = 1 - 125/216 = 91/216 \\approx 0.421`, annotation: `Complement rule: "at least one" = 1 âˆ’ "none." Independence lets us raise to the 3rd power.` },
        { expression: `P(\\text{sum}=18) = 1/216`, annotation: `Classical probability: only one outcome (6,6,6) gives sum 18.` },
        { expression: `P(\\text{at least one 6} \\mid \\text{sum}=18) = \\frac{P(\\text{at least one 6} \\cap \\text{sum}=18)}{P(\\text{sum}=18)} = \\frac{1/216}{1/216} = 1`, annotation: `Conditional probability definition. The only outcome with sum = 18 is (6,6,6), which has three 6s. Given sum = 18, a 6 is certain.` },
      ],
    },
    {
      id: 'ex2',
      title: 'Example 2 â€” Two-Factory Quality: Chaining Total Probability + Bayes',
      prose: `Factory A produces 60% of units, 2% defect rate. Factory B produces 40%, 5% defect rate. A unit is chosen. (a) P(defective). (b) P(from A | defective). (c) P(from B | not defective). (d) P(at least 1 defective in 2 independently drawn units).`,
      steps: [
        { expression: `P(D) = P(D \\mid A) P(A) + P(D \\mid B) P(B) = 0.02(0.60) + 0.05(0.40) = 0.012 + 0.020 = 0.032`, annotation: `Law of Total Probability. A and B partition the population.` },
        { expression: `P(A \\mid D) = \\frac{P(D \\mid A) P(A)}{P(D)} = \\frac{0.012}{0.032} = 0.375`, annotation: `Bayes' Theorem. Despite making 60% of units, A contributes only 37.5% of defectives because its defect rate is lower.` },
        { expression: `P(D^c) = 1 - 0.032 = 0.968; \\quad P(B \\cap D^c) = 0.40 - 0.020 = 0.380`, annotation: `Complement rule for $P(D^c)$; then $P(B \\cap D^c) = P(B) - P(B \\cap D)$.` },
        { expression: `P(B \\mid D^c) = 0.380/0.968 \\approx 0.393`, annotation: `Conditional probability definition.` },
        { expression: `P(\\geq 1 \\text{ defective in 2}) = 1 - (1-0.032)^2 = 1 - 0.968^2 \\approx 0.063`, annotation: `Complement + independent multiplication. Two independent units drawn.` },
      ],
    },
  ],

  challenges: [
    {
      id: 'ch1',
      difficulty: 'medium',
      problem: `A logistics firm has three shipping routes. Route A handles 50% of shipments (on-time rate 92%), Route B handles 30% (on-time rate 88%), Route C handles 20% (on-time rate 95%). (a) P(a randomly chosen shipment is on time). (b) P(via Route A | arrived on time). (c) P(via Route A | arrived LATE). (d) You observe 2 independent late shipments. P(both from Route B)?`,
      walkthrough: [
        `(a) **Law of Total Probability:**
$P(T) = 0.92(0.50) + 0.88(0.30) + 0.95(0.20) = 0.460 + 0.264 + 0.190 = 0.914$

(b) **Bayes' Theorem:**
$P(A \\mid T) = P(T \\mid A) P(A) / P(T) = 0.460 / 0.914 \\approx 0.503$

Route A handles 50% of shipments and 50.3% of on-time shipments â€” almost proportional since all routes have similar on-time rates.

(c) $P(\\text{late}) = 1 - 0.914 = 0.086$.
$P(B \\text{ late}) = (1 - 0.88)(0.30) = 0.036$.
$P(B \\mid \\text{late}) = 0.036 / 0.086 \\approx 0.419$.

Route B handles only 30% of shipments but about 42% of late ones â€” its lower on-time rate makes it over-represented among delays.

(d) $P(\\text{late from B}) = P(\\text{late} \\mid B) \\cdot P(B) = 0.12 \\times 0.30 = 0.036$.
$P(\\text{late} \\mid \\text{a shipment is late from the original distribution}) = P(B \\mid \\text{late}) \\approx 0.419$.
$P(\\text{both late shipments from B}) = 0.419^2 \\approx 0.176$.`,
      ],
    },
    {
      id: 'ch2',
      difficulty: 'hard',
      problem: `In a game show, a prize is behind one of three doors. You choose Door 1. The host (who knows where the prize is) always opens a different door showing no prize â€” say Door 3. Should you switch to Door 2? Compute P(prize behind Door 2 | host opens Door 3) using Bayes' Theorem. This is the Monty Hall Problem.`,
      walkthrough: [
        `Let $D_i$ = "prize is behind Door $i$." Prior: $P(D_1) = P(D_2) = P(D_3) = 1/3$.

Let $H_3$ = "host opens Door 3." The host cannot open the chosen door (Door 1) or the prize door. So:
- $P(H_3 \\mid D_1) = 1/2$ (host can open Door 2 or 3 with equal probability when prize is at Door 1)
- $P(H_3 \\mid D_2) = 1$ (host must open Door 3 â€” Door 1 is your choice, Door 2 has the prize)
- $P(H_3 \\mid D_3) = 0$ (host cannot open the prize door)

$P(H_3) = (1/2)(1/3) + (1)(1/3) + (0)(1/3) = 1/6 + 1/3 = 1/2$

$P(D_1 \\mid H_3) = \\frac{(1/2)(1/3)}{1/2} = \\frac{1/6}{1/2} = 1/3$

$P(D_2 \\mid H_3) = \\frac{(1)(1/3)}{1/2} = \\frac{1/3}{1/2} = 2/3$

**You should switch.** Sticking gives P = 1/3; switching gives P = 2/3. Switching doubles your probability of winning. This counterintuitive result confused mathematicians when Marilyn vos Savant published it in 1990 â€” but Bayes' Theorem gives the unambiguous answer.`,
      ],
    },
  ],

  python: {
    cells: [
      {
        id: 'py1',
        cellTitle: 'Multi-Rule Solver: Factory Quality Problem',
        prose: `This cell implements the complete factory problem using all relevant rules in sequence: Law of Total Probability, Bayes' Theorem, complement, and independent multiplication.`,
        code: `import numpy as np
import matplotlib.pyplot as plt

def factory_analysis(p_a, defect_a, p_b, defect_b, n_units=10000):
    """
    Full multi-rule probability analysis for two-factory defect problem.
    Rules used: Law of Total Probability, Bayes', complement, independence.
    """
    # Law of Total Probability
    p_d = p_a * defect_a + p_b * defect_b

    # Bayes' Theorem: P(from A | defective)
    p_a_given_d  = (p_a * defect_a) / p_d
    p_b_given_d  = (p_b * defect_b) / p_d

    # Bayes' Theorem: P(from A | not defective)
    p_dc = 1 - p_d
    p_a_given_dc = (p_a * (1 - defect_a)) / p_dc
    p_b_given_dc = (p_b * (1 - defect_b)) / p_dc

    # Complement + independence: P(at least 1 defective in 2 draws)
    p_at_least_1 = 1 - (1 - p_d) ** 2

    # Expected count
    expected_defective = n_units * p_d

    print("=== Factory Defect Analysis ===")
    print(f"Factory A: {p_a*100:.0f}% of production, {defect_a*100:.1f}% defect rate")
    print(f"Factory B: {p_b*100:.0f}% of production, {defect_b*100:.1f}% defect rate")
    print()
    print(f"P(Defective)                     = {p_d:.4f}  [Law of Total Probability]")
    print(f"P(From A | Defective)            = {p_a_given_d:.4f}  [Bayes' Theorem]")
    print(f"P(From B | Defective)            = {p_b_given_d:.4f}")
    print(f"P(From A | Not Defective)        = {p_a_given_dc:.4f}  [Bayes' Theorem]")
    print(f"P(â‰¥1 defective in 2 draws)       = {p_at_least_1:.4f}  [Complement + Independence]")
    print(f"Expected defective / {n_units:,}       = {expected_defective:.0f}")
    print()

    return p_d, p_a_given_d, p_b_given_d

p_d, pA_D, pB_D = factory_analysis(0.60, 0.02, 0.40, 0.05)

# Visualize: production share vs. defect contribution
fig, axes = plt.subplots(1, 2, figsize=(10, 4))

factories = ['Factory A', 'Factory B']
prod_share  = [0.60, 0.40]
defect_share = [0.60*0.02/p_d, 0.40*0.05/p_d]

axes[0].bar(factories, prod_share, color=['steelblue','coral'], alpha=0.85, edgecolor='white')
axes[0].set_title('Production Share')
axes[0].set_ylabel('Proportion')
for i, v in enumerate(prod_share):
    axes[0].text(i, v+0.01, f'{v:.2f}', ha='center', fontweight='bold')

axes[1].bar(factories, defect_share, color=['steelblue','coral'], alpha=0.85, edgecolor='white')
axes[1].set_title('Share of Defectives (Bayes)')
axes[1].set_ylabel('P(Factory | Defective)')
for i, v in enumerate(defect_share):
    axes[1].text(i, v+0.01, f'{v:.3f}', ha='center', fontweight='bold')

plt.suptitle('Production Share vs. Defect Contribution', fontweight='bold')
plt.tight_layout()
plt.show()`,
      },
      {
        id: 'py2',
        cellTitle: 'Rule Comparison: Same Inputs, Different Assumptions',
        prose: `Given P(A) = 0.4 and P(B) = 0.5, the joint probability P(A âˆ© B) takes different values depending on whether the events are independent, mutually exclusive, or arbitrarily dependent.`,
        code: `import numpy as np
import matplotlib.pyplot as plt

p_a = 0.4
p_b = 0.5

print(f"Given: P(A) = {p_a}, P(B) = {p_b}")
print()

scenarios = [
    ("Independent",            p_a * p_b),
    ("Mutually exclusive",     0.0),
    ("Dependent: P(Aâˆ©B)=0.30", 0.30),
    ("A âŠ† B: P(Aâˆ©B)=P(A)",    p_a),
]

print(f"{'Relationship':<28} | {'P(Aâˆ©B)':>8} | {'P(AâˆªB)':>8} | {'P(A|B)':>8} | {'P(B|A)':>8}")
print("-" * 70)
for name, p_ab in scenarios:
    p_union = p_a + p_b - p_ab
    p_a_given_b = p_ab / p_b if p_b > 0 else float('nan')
    p_b_given_a = p_ab / p_a if p_a > 0 else float('nan')
    print(f"{name:<28} | {p_ab:>8.4f} | {p_union:>8.4f} | {p_a_given_b:>8.4f} | {p_b_given_a:>8.4f}")

print()
print("Note: P(A|B) = P(A) only under independence (first row).")

# Bar chart: P(Aâˆ©B) under four scenarios
fig, ax = plt.subplots(figsize=(9, 4))
names = [s[0] for s in scenarios]
vals  = [s[1] for s in scenarios]
colors = ['steelblue', 'coral', 'green', 'purple']
bars = ax.bar(names, vals, color=colors, alpha=0.85, edgecolor='white')
ax.axhline(p_a * p_b, color='steelblue', linestyle='--', lw=1.5,
           label=f'P(A)Ã—P(B) = {p_a*p_b:.3f} (independent baseline)')
for bar, val in zip(bars, vals):
    ax.text(bar.get_x() + bar.get_width()/2, val + 0.01,
            f'{val:.3f}', ha='center', fontsize=10, fontweight='bold')
ax.set_title(f'P(A âˆ© B) Under Different Relationship Assumptions  [P(A)={p_a}, P(B)={p_b}]')
ax.set_ylabel('P(A âˆ© B)')
ax.legend()
ax.set_ylim(0, 0.55)
plt.xticks(rotation=15, ha='right')
plt.tight_layout()
plt.show()`,
      },
      {
        id: 'py3',
        cellTitle: 'Monty Hall Simulation',
        prose: `Simulate the Monty Hall Problem â€” stay vs. switch â€” to empirically verify the 1/3 vs. 2/3 result from Bayes' Theorem.`,
        code: `import numpy as np
import matplotlib.pyplot as plt

np.random.seed(42)
n_games = 100_000

def simulate_monty_hall(n, switch):
    """Simulate n Monty Hall games. If switch=True, always switch doors."""
    wins = 0
    for _ in range(n):
        prize = np.random.randint(1, 4)      # prize behind door 1, 2, or 3
        choice = np.random.randint(1, 4)     # initial choice

        # Host opens a door: not the chosen door, not the prize door
        remaining = [d for d in [1, 2, 3] if d != choice and d != prize]
        host_opens = np.random.choice(remaining)

        if switch:
            # Switch to the other remaining closed door
            new_choice = [d for d in [1, 2, 3] if d != choice and d != host_opens][0]
        else:
            new_choice = choice

        if new_choice == prize:
            wins += 1
    return wins / n

p_stay   = simulate_monty_hall(n_games, switch=False)
p_switch = simulate_monty_hall(n_games, switch=True)

print(f"Monty Hall Simulation ({n_games:,} games)")
print(f"  P(win | stay):   {p_stay:.4f}   [theoretical: 1/3 = {1/3:.4f}]")
print(f"  P(win | switch): {p_switch:.4f}   [theoretical: 2/3 = {2/3:.4f}]")
print()
print("Bayes' Theorem confirmed: switching doubles your winning probability.")

fig, ax = plt.subplots(figsize=(7, 4))
strategies = ['Stay', 'Switch']
simulated  = [p_stay, p_switch]
theoretical = [1/3, 2/3]

x = np.arange(2)
ax.bar(x - 0.2, simulated,   width=0.35, color='steelblue', alpha=0.85, label='Simulated')
ax.bar(x + 0.2, theoretical, width=0.35, color='coral',     alpha=0.85, label='Theoretical')
ax.set_xticks(x)
ax.set_xticklabels(strategies, fontsize=12)
ax.set_ylabel('P(win)')
ax.set_title(f'Monty Hall: Stay vs. Switch ({n_games:,} simulations)')
ax.legend()
ax.set_ylim(0, 0.85)
for i, (s, t) in enumerate(zip(simulated, theoretical)):
    ax.text(i - 0.2, s + 0.01, f'{s:.3f}', ha='center', fontsize=9)
    ax.text(i + 0.2, t + 0.01, f'{t:.3f}', ha='center', fontsize=9)
plt.tight_layout()
plt.show()`,
      },
    ],
  },

  quiz: [
    {
      type: 'choice',
      question: `Which rule computes P(A âˆ© B) when A and B are NOT independent?`,
      options: [
        `P(A âˆ© B) = P(A) Â· P(B)`,
        `P(A âˆ© B) = P(A | B) Â· P(B)`,
        `P(A âˆ© B) = P(A) + P(B) âˆ’ P(A âˆª B)`,
        `Both B and C are equivalent formulations`,
      ],
      answer: `Both B and C are equivalent formulations`,
      hints: [`The multiplication rule P(Aâˆ©B) = P(A|B)Â·P(B) and the rearranged addition rule P(Aâˆ©B) = P(A)+P(B)âˆ’P(AâˆªB) both give the same result.`],
      reviewSection: 'intuition',
    },
    {
      type: 'choice',
      question: `P(A) = 0.70, P(B | A) = 0.60, P(B | Aá¶œ) = 0.20. P(B) = ?`,
      options: [`0.42`, `0.48`, `0.60`, `0.40`],
      answer: `0.48`,
      hints: [`Law of Total Probability: P(B) = P(B|A)Â·P(A) + P(B|Aá¶œ)Â·P(Aá¶œ) = 0.60Ã—0.70 + 0.20Ã—0.30.`],
      reviewSection: 'examples',
    },
    {
      type: 'choice',
      question: `For the problem above, what is P(A | B)?`,
      options: [`0.70`, `0.875`, `0.60`, `0.48`],
      answer: `0.875`,
      hints: [`Bayes' Theorem: P(A|B) = P(B|A)Â·P(A)/P(B) = 0.60 Ã— 0.70 / 0.48 = 0.42/0.48 = 0.875.`],
      reviewSection: 'examples',
    },
    {
      type: 'choice',
      question: `Which error type is: "I didn't check if sampling was without replacement, so I assumed independence"?`,
      options: [
        `Wrong rule â€” used addition instead of multiplication`,
        `Wrong independence assumption`,
        `Prosecutor's Fallacy`,
        `Counting error â€” permutation vs. combination`,
      ],
      answer: `Wrong independence assumption`,
      hints: [`Independence must be verified with P(Aâˆ©B) = P(A)Â·P(B). Sampling without replacement creates dependence.`],
      reviewSection: 'intuition',
    },
    {
      type: 'choice',
      question: `P(A) = 0.3, P(B) = 0.4, P(A âˆ© B) = 0.12. Are A and B independent?`,
      options: [`Yes â€” P(A âˆ© B) = P(A) Â· P(B)`, `No â€” P(A | B) â‰  P(A)`, `Cannot determine`, `No â€” they are mutually exclusive`],
      answer: `Yes â€” P(A âˆ© B) = P(A) Â· P(B)`,
      hints: [`Check: 0.3 Ã— 0.4 = 0.12 = P(A âˆ© B). Independence confirmed.`],
      reviewSection: 'intuition',
    },
    {
      type: 'choice',
      question: `Three independent components each have P(working) = 0.90. P(all three work) = ?`,
      options: [`0.270`, `0.729`, `0.900`, `0.999`],
      answer: `0.729`,
      hints: [`Independent multiplication: P(all work) = 0.90Â³ = 0.729.`],
      reviewSection: 'intuition',
    },
    {
      type: 'choice',
      question: `In the Monty Hall problem (Bayes' Theorem), P(prize behind Door 2 | host opens Door 3) = ?`,
      options: [`1/2`, `1/3`, `2/3`, `3/4`],
      answer: `2/3`,
      hints: [`After host opens Door 3 (revealing no prize), Door 2 has 2/3 probability and Door 1 (your initial choice) has 1/3. You should always switch.`],
      reviewSection: 'challenges',
    },
    {
      type: 'choice',
      question: `A problem asks: "Given that at least one of two events occurred, what is the probability both occurred?" Which structure is this?`,
      options: [
        `Simple multiplication of independent events`,
        `Conditional probability P(A âˆ© B | A âˆª B) = P(A âˆ© B) / P(A âˆª B)`,
        `Bayes' Theorem reversing P(A âˆª B | A âˆ© B)`,
        `Complement rule applied to the union`,
      ],
      answer: `Conditional probability P(A âˆ© B | A âˆª B) = P(A âˆ© B) / P(A âˆª B)`,
      hints: [`"Given that at least one occurred" restricts the sample space to A âˆª B. The probability that both occurred is then P(Aâˆ©B)/P(AâˆªB).`],
      reviewSection: 'intuition',
    },
    {
      type: 'choice',
      question: `Law of Total Probability requires the conditioning events Bâ‚, Bâ‚‚, â€¦ to form a partition. This means they must be:`,
      options: [
        `Independent and equally likely`,
        `Mutually exclusive and exhaustive (cover all of S)`,
        `Each with probability greater than 0.5`,
        `Subsets of the event A`,
      ],
      answer: `Mutually exclusive and exhaustive (cover all of S)`,
      hints: [`A partition means every outcome belongs to exactly one Báµ¢ â€” the cases don't overlap and they cover everything.`],
      reviewSection: 'math',
    },
    {
      type: 'choice',
      question: `P(A) = 0.5, P(B) = 0.4. A and B are mutually exclusive. P(A âˆª B) = ?`,
      options: [`0.20`, `0.70`, `0.90`, `0.50`],
      answer: `0.90`,
      hints: [`Mutually exclusive: P(AâˆªB) = P(A)+P(B) = 0.5+0.4 = 0.90. No subtraction needed because P(Aâˆ©B) = 0.`],
      reviewSection: 'intuition',
    },
  ],

  checkpoints: [
    { id: 'cp1', label: 'P(A) = 0.4, P(B) = 0.5, A and B independent. Find P(A âˆ© B) and P(A âˆª B).', type: 'application' },
    { id: 'cp2', label: 'P(A) = 0.6, P(B | A) = 0.3, P(B | Aá¶œ) = 0.1. Find P(B) using the Law of Total Probability.', type: 'application' },
    { id: 'cp3', label: 'Using your answer from cp2, find P(A | B) via Bayes\' Theorem.', type: 'application' },
    { id: 'cp4', label: 'Run Python Cell 3: verify the Monty Hall simulation matches 1/3 vs. 2/3', type: 'lab' },
    { id: 'cp5', label: 'Name all four probability error types', type: 'recall' },
    { id: 'cp6', label: 'Pass the quiz with â‰¥ 80%', type: 'quiz' },
  ],

  definitions: [
    { term: 'Law of Total Probability', definition: 'If {Bâ‚,â€¦,Bâ‚™} partitions S, then P(A) = Î£ P(A|Báµ¢)Â·P(Báµ¢). Decomposes a probability by exhaustive cases.', symbol: null },
    { term: 'Probability partition', definition: 'Events Bâ‚,â€¦,Bâ‚™ form a partition if they are mutually exclusive (no overlap) and exhaustive (their union is S).', symbol: null },
    { term: 'Prosecutor\'s Fallacy', definition: 'Equating P(evidence | hypothesis) with P(hypothesis | evidence). These differ unless P(hypothesis) = P(evidence), which is rare.', symbol: null },
    { term: 'Monty Hall Problem', definition: 'A conditional probability puzzle: after a host reveals an empty door, switching your choice wins with P = 2/3, staying wins with P = 1/3. Derived from Bayes\' Theorem.', symbol: null },
  ],
};
