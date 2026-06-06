export default {
  id: 'stat4-002',
  slug: 'complement-union-intersection',
  chapter: 'stat4',
  order: 2,
  title: 'Complement, Union, and Intersection',
  subtitle: 'Apply the complement rule, addition rule, and understand mutually exclusive events.',
  tags: ['complement', 'union', 'intersection', 'addition rule', 'mutually exclusive', 'venn diagram', 'at least one', 'set operations'],
  aliases: 'complement union intersection addition rule mutually exclusive venn diagram at least one set operations probability rules',
  timeToComplete: 35,
  coreConcept: `Three set operations â€” complement, union, intersection â€” let you build complex events from simple ones and compute their probabilities using rules that follow directly from the Kolmogorov axioms.`,
  prerequisites: ['stat4-001'],
  nextLesson: 'stat4-003',

  hook: {
    question: `75 students took an exam. 45 passed the math section, 38 passed the writing section, and 20 passed both. How many passed at least one section? Adding 45 + 38 = 83 seems right â€” but the true answer is 63. Where does the discrepancy come from?`,
    realWorldContext: `Set operations on events are the grammar of probability. Every real-world probability question ultimately reduces to these: What fraction of customers bought product A OR product B (union)? What fraction of devices failed AND were under warranty (intersection)? What is the failure rate given it is NOT a peak hour (complement)? Insurance actuaries, network engineers, medical researchers, and A/B test analysts use these rules constantly. The General Addition Rule and the complement technique are among the most frequently applied tools in practical statistics.`,
  },

  intuition: {
    prose: [
      `**The double-counting problem.** 45 + 38 = 83, but only 75 students took the exam â€” so 83 > 75 is impossible. The error: the 20 students who passed both sections were counted once in the 45 (math) and again in the 38 (writing). Subtract the overlap once: 45 + 38 âˆ’ 20 = 63. This is the **General Addition Rule**, and it runs on exactly the same logic as Venn diagram areas.`,

      `**Complement.** For any event $A$ in sample space $S$, the **complement** $A^c$ (also written $\\bar{A}$ or $A'$) contains every outcome NOT in $A$. Because $A$ and $A^c$ together cover all of $S$ without overlap: $P(A) + P(A^c) = 1$, so $$P(A^c) = 1 - P(A)$$ This is the most-used rule in probability. It is especially powerful for "at least one" problems where the direct calculation is complicated.`,

      `**Union.** $A \\cup B$ ("A or B") is the event that at least one of $A$ or $B$ occurs. The **General Addition Rule**: $$P(A \\cup B) = P(A) + P(B) - P(A \\cap B)$$ The subtraction removes the double-counting of outcomes in both $A$ and $B$.`,

      `**Intersection.** $A \\cap B$ ("A and B") is the event that both $A$ and $B$ occur simultaneously. For now, the intersection probability comes from rearranging the addition rule: $P(A \\cap B) = P(A) + P(B) - P(A \\cup B)$. When events are independent, there is a simpler formula â€” covered in stat4-003.`,

      `**Before reading on, predict:** From a 52-card deck, one card is drawn. Events: A = "the card is a King," B = "the card is a Diamond." Before computing: are A and B mutually exclusive? What is P(A âˆ© B)?`,

      `**Mutually exclusive (disjoint) events.** Events $A$ and $B$ are *mutually exclusive* if they cannot both occur â€” $A \\cap B = \\emptyset$, so $P(A \\cap B) = 0$. The addition rule simplifies to $P(A \\cup B) = P(A) + P(B)$. Rolling a 2 and rolling a 5 on a single die are mutually exclusive; drawing a heart and drawing a red card are NOT (all hearts are red â€” every heart is automatically a red card).`,

      `**"At least one" via complement.** The complement of "at least one A occurs" is "no A occurs." So: $$P(\\text{at least one}) = 1 - P(\\text{none})$$ This technique avoids enumerating all the ways "at least one" can happen. Example: $P(\\text{at least one head in 3 flips}) = 1 - P(\\text{all tails}) = 1 - (1/2)^3 = 7/8$.`,

      `**Venn diagram algebra.** Draw two overlapping circles in a rectangle. The rectangle has total area 1 (the full sample space). Each circle is an event. The four non-overlapping regions are: "Only A" = $P(A) - P(A \\cap B)$; "A âˆ© B" = $P(A \\cap B)$; "Only B" = $P(B) - P(A \\cap B)$; "Neither" = $1 - P(A \\cup B)$. These four regions always sum to 1.`,
    ],
    callouts: [
      {
        type: 'procedure',
        title: 'General Addition Rule â€” Three Steps',
        body: `1. Identify $P(A)$ and $P(B)$.
2. Identify $P(A \\cap B)$ â€” outcomes in BOTH $A$ and $B$.
3. $P(A \\cup B) = P(A) + P(B) - P(A \\cap B)$.

**Special case:** If $A$ and $B$ are mutually exclusive, $P(A \\cap B) = 0$, so $P(A \\cup B) = P(A) + P(B)$.`,
      },
      {
        type: 'warning',
        title: 'Mutually Exclusive â‰  Independent',
        body: `Mutually exclusive events ($A \\cap B = \\emptyset$) are actually the *opposite* of independent for events with non-zero probability: if $A$ occurs, $B$ cannot â€” knowing $A$ occurred changes the probability of $B$ from $P(B)$ to 0. Independence (covered in stat4-003) means knowing $A$ occurred does NOT change the probability of $B$. The two concepts are unrelated and easily confused.`,
      },
      {
        type: 'insight',
        title: 'Why Subtract the Intersection?',
        body: `Consider a Venn diagram. When you shade all of $A$ and then all of $B$, the overlapping region (intersection) gets shaded twice â€” once when you shade $A$ and once when you shade $B$. To get the total shaded area (the union), you must subtract the overlap once. This is purely geometric: $P(A \\cup B) = P(A) + P(B) - P(A \\cap B)$ is the probabilistic version of inclusion-exclusion.`,
      },
    ],
    visualizations: [],
  },

  math: {
    prose: [
      `**Deriving the addition rule from axioms.** Any event $A \\cup B$ can be decomposed into three disjoint parts: $A \\cap B^c$ (only A), $A \\cap B$ (both), and $A^c \\cap B$ (only B). By axiom 3 (additivity): $P(A \\cup B) = P(A \\cap B^c) + P(A \\cap B) + P(A^c \\cap B)$. Also, $P(A) = P(A \\cap B^c) + P(A \\cap B)$ and $P(B) = P(A^c \\cap B) + P(A \\cap B)$. Adding these: $P(A) + P(B) = P(A \\cup B) + P(A \\cap B)$. Rearranging gives $P(A \\cup B) = P(A) + P(B) - P(A \\cap B)$.`,

      `**Inclusion-exclusion for three events.** For three events: $P(A \\cup B \\cup C) = P(A) + P(B) + P(C) - P(A \\cap B) - P(A \\cap C) - P(B \\cap C) + P(A \\cap B \\cap C)$. The alternating sign pattern continues for $n$ events â€” this is the Principle of Inclusion-Exclusion (PIE). For $n$ mutually exclusive events, all intersections are zero and $P(\\bigcup_i A_i) = \\sum_i P(A_i)$.`,

      `**Complement rule derived from normalisation.** Since $A$ and $A^c$ are mutually exclusive and $A \\cup A^c = S$: by additivity, $P(A) + P(A^c) = P(S) = 1$. Therefore $P(A^c) = 1 - P(A)$. This derivation shows the complement rule is not an axiom â€” it follows from normalisation and additivity.`,
    ],
    callouts: [],
  },

  rigor: {
    prose: [
      `**Generalized inclusion-exclusion.** The formula $P(A \\cup B) = P(A) + P(B) - P(A \\cap B)$ generalizes to $n$ events via the alternating sum: $P\\left(\\bigcup_{i=1}^n A_i\\right) = \\sum_k P(A_k) - \\sum_{j < k} P(A_j \\cap A_k) + \\cdots + (-1)^{n+1} P\\left(\\bigcap_{i=1}^n A_i\\right)$. This is used in combinatorics (e.g., counting surjective functions, deriving the Bonferroni inequalities) and in bounding probabilities when only partial intersection information is available.`,

      `**Boolean algebra structure.** The set of all events $\\mathcal{F}$ under the operations $\\cup, \\cap, \\cdot^c$ forms a Boolean algebra (actually a $\\sigma$-algebra in the measure-theoretic setting). The probability function $P$ is a normalized measure on this algebra. The De Morgan laws â€” $(A \\cup B)^c = A^c \\cap B^c$ and $(A \\cap B)^c = A^c \\cup B^c$ â€” provide a useful bridge: $P(\\text{neither } A \\text{ nor } B) = P(A^c \\cap B^c) = 1 - P(A \\cup B)$, often easier to compute than $P(A \\cup B)$ directly.`,
    ],
  },

  examples: [
    {
      id: 'ex1',
      title: 'Example 1 â€” Class Exam Venn Diagram',
      prose: `In a class of 100 students: 60 study Math (M), 50 study English (E), 30 study both. Find (a) P(M âˆª E), (b) P(only Math), (c) P(neither), (d) P(Má¶œ).`,
      steps: [
        { expression: `P(M)=0.60,\\; P(E)=0.50,\\; P(M\\cap E)=0.30`, annotation: `Convert counts to probabilities by dividing by 100.` },
        { expression: `P(M\\cup E)=0.60+0.50-0.30=0.80`, annotation: `General Addition Rule â€” subtract the double-counted overlap.` },
        { expression: `P(\\text{only }M)=P(M)-P(M\\cap E)=0.60-0.30=0.30`, annotation: `Only Math = in M but not in E.` },
        { expression: `P(\\text{neither})=1-P(M\\cup E)=1-0.80=0.20`, annotation: `Complement of the union â€” the region outside both circles.` },
        { expression: `P(M^c)=1-0.60=0.40`, annotation: `Complement of M â€” all students who do NOT study Math.` },
      ],
    },
    {
      id: 'ex2',
      title: 'Example 2 â€” "At Least One" via Complement',
      prose: `Three independent components in a system each have a 10% failure probability. What is the probability at least one fails?`,
      steps: [
        { expression: `P(\\text{at least one fails}) = 1 - P(\\text{none fail})`, annotation: `Complement strategy: the complement of "at least one fails" is "all three work."` },
        { expression: `P(\\text{none fail}) = P(\\text{comp}_1 \\text{ works}) \\times P(\\text{comp}_2 \\text{ works}) \\times P(\\text{comp}_3 \\text{ works})`, annotation: `Independent components â€” multiply probabilities. Each has P(work) = 0.90.` },
        { expression: `P(\\text{none fail}) = 0.90^3 = 0.729`, annotation: `Three components each surviving independently.` },
        { expression: `P(\\text{at least one fails}) = 1 - 0.729 = 0.271`, annotation: `About 27% chance at least one component fails. Direct calculation would require listing all 7 failure combinations.` },
      ],
    },
    {
      id: 'ex3',
      title: 'Example 3 â€” Addition Rule: Card Draw',
      prose: `One card is drawn from a 52-card deck. Events: A = "the card is a Heart", B = "the card is a Face card (J, Q, K)". Compute P(A âˆª B).`,
      steps: [
        { expression: `P(A) = 13/52 = 0.250`, annotation: `13 hearts in a 52-card deck.` },
        { expression: `P(B) = 12/52 \\approx 0.231`, annotation: `12 face cards: J, Q, K in each of 4 suits.` },
        { expression: `P(A \\cap B) = 3/52 \\approx 0.058`, annotation: `Heart face cards: Jâ™¥, Qâ™¥, Kâ™¥ â€” exactly 3 cards.` },
        { expression: `P(A \\cup B) = 13/52 + 12/52 - 3/52 = 22/52 \\approx 0.423`, annotation: `22 cards are a Heart OR a Face card (or both). Mutually exclusive? No â€” heart face cards belong to both events, so we must subtract the overlap.` },
      ],
    },
  ],

  challenges: [
    {
      id: 'ch1',
      difficulty: 'easy',
      problem: `A marketing team finds: 40% of customers buy Product A, 30% buy Product B, and 15% buy both. (a) What fraction buy at least one product? (b) What fraction buy neither? (c) What fraction buy only Product B? (d) If you target only customers who buy at least one product, what percentage are "both" buyers?`,
      walkthrough: [
        `(a) $P(A \\cup B) = 0.40 + 0.30 - 0.15 = 0.55$. 55% buy at least one product.

(b) $P(\\text{neither}) = 1 - 0.55 = 0.45$. 45% buy neither.

(c) $P(\\text{only B}) = P(B) - P(A \\cap B) = 0.30 - 0.15 = 0.15$. 15% buy only B.

(d) Among the 55% who buy at least one, the "both" buyers are 15%. As a fraction of the "at least one" group: $0.15 / 0.55 \\approx 0.273$ = 27.3% of the targeted customers bought both products.`,
      ],
    },
    {
      id: 'ch2',
      difficulty: 'medium',
      problem: `Quality control: components from two machines. Machine A produces 55% of parts; 4% of A's parts are defective. Machine B produces 45%; 6% of B's parts are defective. Let D = "part is defective." (a) P(defective and from A). (b) P(defective and from B). (c) P(D). (d) P(not defective). Note: A and B are mutually exclusive (each part comes from exactly one machine).`,
      walkthrough: [
        `(a) $P(D \\cap A) = P(A) \\times P(D \\mid A) = 0.55 \\times 0.04 = 0.022$. (We are using conditional probability here â€” more formally treated in stat4-003.)

(b) $P(D \\cap B) = 0.45 \\times 0.06 = 0.027$.

(c) Since "from A" and "from B" are mutually exclusive, $P(D) = P(D \\cap A) + P(D \\cap B) = 0.022 + 0.027 = 0.049$. The overall defect rate is 4.9%.

(d) $P(D^c) = 1 - 0.049 = 0.951$. 95.1% of all parts are non-defective.`,
      ],
    },
  ],

  python: {
    cells: [
      {
        id: 'py1',
        cellTitle: 'Venn Diagram: Four Non-Overlapping Regions',
        prose: `For any two events A and B, the sample space decomposes into four non-overlapping regions. This cell shows the four regions as a bar chart â€” they always sum to 1.`,
        code: `import numpy as np
import matplotlib.pyplot as plt

# Event probabilities â€” try changing these
p_a = 0.55
p_b = 0.40
p_ab = 0.20  # P(A âˆ© B) â€” must satisfy 0 â‰¤ p_ab â‰¤ min(p_a, p_b)

p_only_a  = p_a - p_ab
p_only_b  = p_b - p_ab
p_union   = p_a + p_b - p_ab
p_neither = 1 - p_union

print("=== Venn Diagram Breakdown ===")
print(f"P(A)              = {p_a:.4f}")
print(f"P(B)              = {p_b:.4f}")
print(f"P(A âˆ© B)          = {p_ab:.4f}")
print()
print(f"Region          | Probability")
print("-" * 30)
print(f"Only A          |  {p_only_a:.4f}")
print(f"A âˆ© B           |  {p_ab:.4f}")
print(f"Only B          |  {p_only_b:.4f}")
print(f"Neither         |  {p_neither:.4f}")
print(f"Sum (must = 1)  |  {p_only_a + p_ab + p_only_b + p_neither:.4f}")
print()
print(f"P(A âˆª B) = {p_a} + {p_b} - {p_ab} = {p_union:.4f}")

fig, ax = plt.subplots(figsize=(8, 4))
regions = ['Only A', 'A âˆ© B\n(both)', 'Only B', 'Neither']
values = [p_only_a, p_ab, p_only_b, p_neither]
colors = ['#4e9af1', '#a66ef5', '#61c99e', '#d0d0d0']
bars = ax.bar(regions, values, color=colors, edgecolor='white', linewidth=1.5)
for bar, val in zip(bars, values):
    ax.text(bar.get_x() + bar.get_width()/2, bar.get_height() + 0.01,
            f'{val:.3f}', ha='center', fontsize=11)
ax.set_ylabel('Probability')
ax.set_title(f'Venn Diagram Regions  [P(A)={p_a}, P(B)={p_b}, P(Aâˆ©B)={p_ab}]')
ax.set_ylim(0, max(values) + 0.08)
plt.tight_layout()
plt.show()`,
      },
      {
        id: 'py2',
        cellTitle: '"At Least One" via Complement',
        prose: `For n independent events each with the same probability p of occurring, the probability of "at least one" = 1 âˆ’ (1âˆ’p)â¿. This grows rapidly even when each individual probability is small.`,
        code: `import numpy as np
import matplotlib.pyplot as plt

# P(at least one heads in n flips of a fair coin)
# = 1 - P(all tails) = 1 - 0.5^n

print(f"{'n flips':>8} | {'P(at least 1 head)':>20} | {'P(all tails)':>14}")
print("-" * 50)
for n in [1, 2, 3, 5, 10, 20, 50]:
    p_none = 0.5 ** n
    p_at_least_one = 1 - p_none
    print(f"{n:>8} | {p_at_least_one:>20.6f} | {p_none:>14.6f}")

# Plot for various p values
ns = np.arange(1, 21)
fig, ax = plt.subplots(figsize=(9, 4))

for p, color, label in [(0.5, 'steelblue', 'p=0.5 (fair coin)'),
                         (0.3, 'coral',     'p=0.3'),
                         (0.1, 'green',     'p=0.1')]:
    probs = 1 - (1 - p) ** ns
    ax.plot(ns, probs, marker='o', markersize=4, color=color, label=label)

ax.axhline(0.5, color='gray', linestyle='--', lw=1, alpha=0.7, label='P = 0.5 threshold')
ax.set_xlabel('Number of independent trials (n)')
ax.set_ylabel('P(at least one success)')
ax.set_title('P(at least one success) = 1 âˆ’ (1âˆ’p)â¿')
ax.legend()
ax.set_ylim(0, 1.05)
ax.set_xticks(ns)
plt.tight_layout()
plt.show()`,
      },
      {
        id: 'py3',
        cellTitle: 'Addition Rule: Interactive Calculator',
        prose: `Given P(A), P(B), and P(A âˆ© B), the addition rule computes P(A âˆª B). This cell also checks whether the inputs are logically consistent and whether the events are mutually exclusive.`,
        code: `import numpy as np

def addition_rule_summary(p_a, p_b, p_ab, label=""):
    """Compute all Venn-diagram probabilities from P(A), P(B), P(Aâˆ©B)."""
    # Validity check
    assert 0 <= p_ab <= min(p_a, p_b), "P(Aâˆ©B) must be â‰¤ min(P(A), P(B))"
    assert p_a + p_b - p_ab <= 1.0 + 1e-9, "P(AâˆªB) cannot exceed 1"

    p_union   = p_a + p_b - p_ab
    p_only_a  = p_a - p_ab
    p_only_b  = p_b - p_ab
    p_neither = 1 - p_union
    me = (p_ab == 0)

    print(f"{'='*40}  {label}")
    print(f"P(A)                   = {p_a:.4f}")
    print(f"P(B)                   = {p_b:.4f}")
    print(f"P(A âˆ© B)               = {p_ab:.4f}")
    print(f"P(A âˆª B)               = {p_union:.4f}  â† general addition rule")
    print(f"P(only A)              = {p_only_a:.4f}")
    print(f"P(only B)              = {p_only_b:.4f}")
    print(f"P(neither)             = {p_neither:.4f}")
    print(f"Mutually exclusive?    = {me}")
    print()

# Three scenarios
addition_rule_summary(0.60, 0.50, 0.30, label="Class exam (math & english)")
addition_rule_summary(0.40, 0.30, 0.15, label="Marketing (product A & B)")
addition_rule_summary(0.35, 0.25, 0.00, label="Rolling 2 vs rolling 5 (die)")`,
      },
    ],
  },

  quiz: [
    {
      type: 'choice',
      question: `If P(A) = 0.72, what is P(Aá¶œ)?`,
      options: [`0.28`, `0.72`, `1.72`, `âˆ’0.28`],
      answer: `0.28`,
      hints: [`P(A) + P(Aá¶œ) = 1 by the normalisation axiom.`],
      reviewSection: 'intuition',
    },
    {
      type: 'choice',
      question: `A and B are mutually exclusive. P(A) = 0.35, P(B) = 0.40. P(A âˆª B) = ?`,
      options: [`0.14`, `0.75`, `0.35`, `1.00`],
      answer: `0.75`,
      hints: [`Mutually exclusive means P(A âˆ© B) = 0, so P(A âˆª B) = P(A) + P(B).`],
      reviewSection: 'intuition',
    },
    {
      type: 'choice',
      question: `P(A âˆª B) = 0.70, P(A) = 0.50, P(B) = 0.30. What is P(A âˆ© B)?`,
      options: [`0.10`, `0.20`, `0.50`, `0.80`],
      answer: `0.10`,
      hints: [`Rearrange the Addition Rule: P(A âˆ© B) = P(A) + P(B) âˆ’ P(A âˆª B) = 0.50 + 0.30 âˆ’ 0.70.`],
      reviewSection: 'examples',
    },
    {
      type: 'choice',
      question: `P(at least one head in 4 independent fair coin flips) = ?`,
      options: [`0.500`, `0.750`, `0.875`, `0.9375`],
      answer: `0.9375`,
      hints: [`Use complement: 1 âˆ’ P(all tails) = 1 âˆ’ (0.5)â´ = 1 âˆ’ 0.0625 = 0.9375.`],
      reviewSection: 'examples',
    },
    {
      type: 'choice',
      question: `"Drawing a club" and "drawing a diamond" from a deck are:`,
      options: [`Mutually exclusive`, `Independent`, `Complementary`, `Exhaustive`],
      answer: `Mutually exclusive`,
      hints: [`A single card cannot be both a club and a diamond â€” P(club âˆ© diamond) = 0.`],
      reviewSection: 'intuition',
    },
    {
      type: 'choice',
      question: `P(only A) = 0.20 and P(A âˆ© B) = 0.15. What is P(A)?`,
      options: [`0.05`, `0.20`, `0.35`, `0.15`],
      answer: `0.35`,
      hints: [`P(A) = P(only A) + P(A âˆ© B) = 0.20 + 0.15. The "only A" region plus the overlap region equals all of A.`],
      reviewSection: 'intuition',
    },
    {
      type: 'choice',
      question: `P(A) = 0.45, P(B) = 0.30, P(A âˆ© B) = 0.15. What is P(A âˆª B)?`,
      options: [`0.45`, `0.60`, `0.75`, `0.90`],
      answer: `0.60`,
      hints: [`P(A âˆª B) = 0.45 + 0.30 âˆ’ 0.15 = 0.60.`],
      reviewSection: 'examples',
    },
    {
      type: 'choice',
      question: `Which of these pairs of events CANNOT be mutually exclusive?`,
      options: [
        `Rolling a 3 and rolling a 5 on one die`,
        `Drawing a heart and drawing a spade from one card`,
        `Drawing a heart and drawing a red card from one card`,
        `Being born in January and being born in February`,
      ],
      answer: `Drawing a heart and drawing a red card from one card`,
      hints: [`Hearts ARE red cards. Every heart satisfies both events simultaneously, so P(heart âˆ© red) = P(heart) > 0 â€” not mutually exclusive.`],
      reviewSection: 'intuition',
    },
    {
      type: 'choice',
      question: `P(A) = 0.6, P(B | A) = 0.3, P(B | Aá¶œ) = 0.1. What is P(B)?`,
      options: [`0.18`, `0.22`, `0.30`, `0.40`],
      answer: `0.22`,
      hints: [`Law of Total Probability: P(B) = P(B|A)Â·P(A) + P(B|Aá¶œ)Â·P(Aá¶œ) = 0.3Ã—0.6 + 0.1Ã—0.4 = 0.18 + 0.04 = 0.22.`],
      reviewSection: 'math',
    },
    {
      type: 'choice',
      question: `Four regions of a two-event Venn diagram are: P(only A) = 0.25, P(A âˆ© B) = 0.10, P(only B) = 0.30. What is P(neither A nor B)?`,
      options: [`0.35`, `0.40`, `0.55`, `0.65`],
      answer: `0.35`,
      hints: [`The four regions must sum to 1: 0.25 + 0.10 + 0.30 + P(neither) = 1 â†’ P(neither) = 0.35.`],
      reviewSection: 'intuition',
    },
  ],

  checkpoints: [
    { id: 'cp1', label: 'P(A) = 0.4. What is P(Aá¶œ)?', type: 'recall' },
    { id: 'cp2', label: 'P(A) = 0.5, P(B) = 0.4, P(A âˆ© B) = 0.2. Find P(A âˆª B).', type: 'application' },
    { id: 'cp3', label: 'Run Python Cell 1: verify that four Venn regions sum to 1', type: 'lab' },
    { id: 'cp4', label: 'P(at least one head in 4 coin flips) using the complement technique', type: 'application' },
    { id: 'cp5', label: 'Are "drawing a heart" and "drawing a face card" mutually exclusive?', type: 'concept' },
    { id: 'cp6', label: 'Pass the quiz with â‰¥ 80%', type: 'quiz' },
  ],

  definitions: [
    { term: 'Complement', definition: 'Aá¶œ (also Ä€ or Aâ€²) is the event that A does not occur. P(Aá¶œ) = 1 âˆ’ P(A).', symbol: 'Aá¶œ' },
    { term: 'Union', definition: 'A âˆª B is the event that A occurs, or B occurs, or both occur. P(A âˆª B) = P(A) + P(B) âˆ’ P(A âˆ© B).', symbol: 'A âˆª B' },
    { term: 'Intersection', definition: 'A âˆ© B is the event that both A and B occur simultaneously.', symbol: 'A âˆ© B' },
    { term: 'Mutually exclusive', definition: 'Events A and B with A âˆ© B = âˆ… â€” they cannot both occur. Also called disjoint events.', symbol: null },
    { term: 'General Addition Rule', definition: 'P(A âˆª B) = P(A) + P(B) âˆ’ P(A âˆ© B). The intersection is subtracted to avoid double-counting.', symbol: null },
  ],
};
