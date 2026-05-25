export default {
  id: 'stat4-006',
  title: 'Probability Rules Summary',
  description: 'Consolidate all probability rules into a unified reference framework and solve multi-step probability problems.',
  prerequisites: ['stat4-001', 'stat4-002', 'stat4-003', 'stat4-004', 'stat4-005'],
  coreConcept: 'Every probability problem requires identifying the right rule. The decision depends on: Are events mutually exclusive? Independent? Are we combining events, conditioning on one, or updating a prior? This lesson maps those choices to formulas.',

  prose: [
    '**A comprehensive decision tree for probability.** Given a problem, the first question is always: "What type of probability do I need?" — a single event, a combination of events, a conditional, or a posterior after evidence. Each type maps to a specific formula. Building fluency means recognising the structure before computing.',

    { type: 'callout', variant: 'procedure', title: 'Probability Rule Selection Guide', body: '• **One event, equally likely outcomes** → Classical: P(A) = |A| / |S|\n• **Repeated trials (empirical)** → P(A) ≈ frequency / n\n• **Complement** → P(Aᶜ) = 1 − P(A)\n• **Two events combined (union)** → P(A ∪ B) = P(A) + P(B) − P(A ∩ B)\n• **Mutually exclusive union** → P(A ∪ B) = P(A) + P(B)\n• **Joint probability (general)** → P(A ∩ B) = P(A | B) · P(B)\n• **Independent joint** → P(A ∩ B) = P(A) · P(B)\n• **Conditional** → P(A | B) = P(A ∩ B) / P(B)\n• **Posterior (Bayes)** → P(H | E) = P(E | H) · P(H) / P(E)\n• **Counting ordered** → P(n, r) = n! / (n−r)!\n• **Counting unordered** → C(n, r) = n! / [r!(n−r)!]' },

    '**Connecting the rules.** All rules descend from the three Kolmogorov axioms. The complement rule follows from P(S) = 1. The addition rule follows from additivity plus the inclusion of intersections. Conditional probability is a derived definition; independence is a special case; Bayes\' Theorem is just algebra applied to the conditional definition.',
    '**Multi-step problems.** Complex probability problems decompose into sub-problems, each solved by one rule. Identify the outermost structure first (is the final answer a union? a conditional? a posterior?) then work inward.',

    { type: 'prediction', prompt: 'Before the worked example: identify which rule(s) you would use for this problem. "A bag has 5 red and 3 blue chips. Two are drawn without replacement. What is P(at least one red)?"' },

    '**Visual taxonomy.** Think of probability rules as a tree. Level 1: single events (classical/empirical/subjective). Level 2: logical operations on events (complement, union, intersection). Level 3: conditioning (conditional probability, independence). Level 4: inference (Bayes). Level 5: counting the outcomes (permutations, combinations). Each level assumes mastery of the previous.',
    '**Common multi-step patterns.** (a) "Probability of at least one" → complement + independent sequential events. (b) "Given that…" → conditional probability formula. (c) "After we observe…" → Bayes. (d) "How many ways…" then "What is the probability" → counting then classical.',
    '**Error taxonomy for exam success.** Most probability errors fall into four categories: (1) Wrong rule (used addition rule instead of multiplication); (2) Wrong independence assumption (assumed independent when dependent); (3) Wrong direction of conditioning (Prosecutor\'s Fallacy); (4) Counting error (permutation instead of combination).',
  ],

  checkpoints: [
    { id: 'stat4-006-cp1', label: 'P(A) = 0.4, P(B) = 0.5, A and B are independent. Find P(A ∩ B) and P(A ∪ B).', type: 'application' },
    { id: 'stat4-006-cp2', label: 'P(A) = 0.6, P(B | A) = 0.3, P(B | Aᶜ) = 0.1. Find P(B) using the Law of Total Probability.', type: 'application' },
    { id: 'stat4-006-cp3', label: 'Use your answer from cp2 to find P(A | B) via Bayes\' Theorem.', type: 'application' },
    { id: 'stat4-006-cp4', label: 'A bag has 4 red and 6 blue chips; 2 drawn without replacement. P(both red) = ?', type: 'application' },
    { id: 'stat4-006-cp5', label: 'A bag has 4 red and 6 blue chips; 2 drawn without replacement. P(at least one red) = ?', type: 'application' },
    { id: 'stat4-006-cp6', label: 'Identify the rule: "P(at least one success) = 1 − P(all failures)"', type: 'recall' },
    { id: 'stat4-006-cp7', label: 'Which error: "P(test positive | disease) = 0.95, so a positive test means 95% chance of disease"?', type: 'concept' },
    { id: 'stat4-006-cp8', label: 'How many distinct 4-card hands from a 52-card deck? What is the probability of a 4-card flush (all same suit)?', type: 'application' },
  ],

  workedExample: {
    problem: 'Three dice are rolled. (a) Total outcomes. (b) P(all three show 6). (c) P(at least one 6). (d) P(sum = 18). (e) P(at least one 6 | sum = 18).',
    steps: [
      { expression: '|S| = 6^3 = 216', annotation: 'Each die has 6 faces, three independent rolls.' },
      { expression: 'P(\\text{all 6s}) = \\left(\\tfrac{1}{6}\\right)^3 = \\tfrac{1}{216} \\approx 0.00463', annotation: 'Independent events; multiply probabilities.' },
      { expression: 'P(\\text{at least one 6}) = 1 - P(\\text{no 6}) = 1 - \\left(\\tfrac{5}{6}\\right)^3 = 1 - \\tfrac{125}{216} = \\tfrac{91}{216} \\approx 0.421', annotation: 'Complement rule: P(at least one) = 1 − P(none).' },
      { expression: 'P(\\text{sum}=18) = \\tfrac{1}{216}', annotation: 'Only one outcome gives sum 18: (6, 6, 6).' },
      { expression: 'P(\\text{at least one 6}\\mid\\text{sum}=18) = \\dfrac{P(\\text{at least one 6}\\cap\\text{sum}=18)}{P(\\text{sum}=18)} = \\dfrac{1/216}{1/216} = 1', annotation: 'The only outcome with sum 18 is (6,6,6), which has all 6s. So given sum=18, a 6 is certain.' },
    ],
    answer: '216 total; P(all 6) = 1/216; P(at least one 6) ≈ 0.421; P(sum=18) = 1/216; P(at least one 6 | sum=18) = 1.',
  },

  challenge: {
    problem: 'A company ships products from two factories: Factory A produces 60% of units with 2% defect rate; Factory B produces 40% with 5% defect rate. A unit is chosen at random. (a) P(defective). (b) P(from A | defective). (c) If two units are chosen independently, P(at least one defective). (d) Among 10,000 units, expected defective count.',
    steps: [
      { expression: 'P(D)=0.60\\times0.02+0.40\\times0.05=0.012+0.020=0.032', annotation: 'Law of Total Probability.' },
      { expression: 'P(A\\mid D)=\\dfrac{0.012}{0.032}=0.375', annotation: "Bayes' Theorem. Despite producing 60% of units, Factory A contributes only 37.5% of defectives because its defect rate is lower." },
      { expression: 'P(\\text{at least 1 defective in 2}) = 1-(1-0.032)^2=1-0.968^2\\approx 1-0.937=0.063', annotation: 'Complement of "both non-defective." Two independent draws.' },
      { expression: '10{,}000\\times0.032=320', annotation: 'Expected value = n × P. About 320 defective units per 10,000.' },
    ],
    answer: 'P(D) = 0.032; P(A|D) = 0.375; P(≥1 defective in 2) ≈ 0.063; expected 320 defectives per 10,000.',
  },

  assessment: {
    type: 'choice',
    question: 'P(A) = 0.5, P(B) = 0.4. A and B are mutually exclusive. Which value is P(A ∪ B)?',
    options: ['0.20', '0.70', '0.90', '0.50'],
    answer: '0.90',
    explanation: 'Mutually exclusive: P(A ∪ B) = P(A) + P(B) = 0.5 + 0.4 = 0.90.',
  },

  quiz: [
    {
      id: 'stat4-006-q1',
      question: 'Which rule computes P(A ∩ B) when A and B are NOT independent?',
      options: [
        'P(A ∩ B) = P(A) · P(B)',
        'P(A ∩ B) = P(A | B) · P(B)',
        'P(A ∩ B) = P(A) + P(B) − P(A ∪ B)',
        'Both B and C are equivalent',
      ],
      answer: 'Both B and C are equivalent',
      hints: ['The multiplication rule and the rearranged addition rule give the same result.'],
      reviewSection: 'Probability Rule Selection Guide',
    },
    {
      id: 'stat4-006-q2',
      question: 'P(A) = 0.70, P(B | A) = 0.60, P(B | Aᶜ) = 0.20. P(B) = ?',
      options: ['0.42', '0.48', '0.60', '0.40'],
      answer: '0.48',
      hints: ['Law of Total Probability: P(B) = P(B|A)·P(A) + P(B|Aᶜ)·P(Aᶜ).'],
      reviewSection: 'Multi-step problems',
    },
    {
      id: 'stat4-006-q3',
      question: 'For the problem in q2, what is P(A | B)?',
      options: ['0.70', '0.875', '0.60', '0.48'],
      answer: '0.875',
      hints: ["P(A | B) = P(B | A) · P(A) / P(B) = 0.60 × 0.70 / 0.48."],
      reviewSection: "Bayes' Theorem",
    },
    {
      id: 'stat4-006-q4',
      question: 'Which error type is: "Events are independent because they sound unrelated."',
      options: [
        'Wrong rule',
        'Wrong independence assumption',
        'Prosecutor\'s Fallacy',
        'Counting error',
      ],
      answer: 'Wrong independence assumption',
      hints: ['Independence must be verified with P(A ∩ B) = P(A) · P(B), not assumed.'],
      reviewSection: 'Error taxonomy for exam success',
    },
    {
      id: 'stat4-006-q5',
      question: 'P(A) = 0.3, P(B) = 0.4, P(A ∩ B) = 0.12. Are A and B independent?',
      options: ['Yes — P(A ∩ B) = P(A) · P(B)', 'No — P(A | B) ≠ P(A)', 'Cannot determine', 'No — they are mutually exclusive'],
      answer: 'Yes — P(A ∩ B) = P(A) · P(B)',
      hints: ['Check: 0.3 × 0.4 = 0.12 = P(A ∩ B). Independence confirmed.'],
      reviewSection: 'Connecting the rules',
    },
    {
      id: 'stat4-006-q6',
      question: 'Three independent components each have P(working) = 0.90. P(system works) = all three work = ?',
      options: ['0.270', '0.729', '0.900', '0.999'],
      answer: '0.729',
      hints: ['P(all three) = 0.90³ = 0.729.'],
      reviewSection: 'Common multi-step patterns',
    },
  ],

  misconceptions: [
    {
      error: 'Applying the mutually exclusive addition rule to non-mutually-exclusive events.',
      correction: 'Always check P(A ∩ B). If it is not zero, you must subtract it. P(A ∪ B) = P(A) + P(B) − P(A ∩ B) always holds.',
    },
    {
      error: 'Applying the independent multiplication rule to dependent events (e.g., sampling without replacement).',
      correction: 'Verify independence with P(A ∩ B) = P(A) · P(B). If the second draw depends on the first, use the general multiplication rule P(A ∩ B) = P(A | B) · P(B).',
    },
    {
      error: 'Confusing "at least one" with "exactly one."',
      correction: '"At least one" = 1 − P(none). "Exactly one" requires careful counting with combinations or the inclusion-exclusion principle.',
    },
  ],

  transferPrompts: [
    'Design a 3-question decision flowchart for choosing among classical, empirical, subjective, conditional, and Bayes\' probabilities. What question at each node best separates the cases?',
    'A logistics firm has two independent delivery routes, each with 92% on-time delivery. What is the probability a shipment that uses both routes (in sequence) arrives on time? What assumptions underpin your calculation?',
  ],

  debugging: [
    {
      symptom: 'You applied Bayes\' Theorem but the posterior equals the prior.',
      cause: 'The Bayes factor P(E | H) / P(E | Hᶜ) equals 1 — the evidence is equally likely under H and Hᶜ, so it provides no information.',
      fix: 'Check: if P(E | H) = P(E | Hᶜ), the evidence is uninformative and the posterior will always equal the prior. This is mathematically correct, not an error.',
    },
    {
      symptom: 'A probability computed for "at least one" came out greater than 1.',
      cause: 'You added individual probabilities instead of using the complement rule.',
      fix: 'For "at least one" with independent events: P(at least one) = 1 − P(none) = 1 − (1 − p)ⁿ. Never add individual event probabilities for "at least one."',
    },
  ],

  mastery: {
    targetLevel: 'Synthesize',
    successCriteria: [
      'Select the correct probability rule for any given scenario description.',
      'Decompose a multi-step probability problem into sub-problems.',
      'Apply at least three different rules in a single chained calculation.',
      'Identify and name all four probability error types from a described mistake.',
      'Translate a word problem into the correct probability formula without prompting.',
    ],
    commonErrors: ['Using mutually exclusive rule for overlapping events', 'Assuming independence without verification'],
    prerequisites: ['stat4-001 through stat4-005'],
    nextSteps: ['stat5: Probability Distributions'],
  },

  python: {
    cells: [
      {
        id: 'stat4-006-cell-1',
        type: 'python',
        cellTitle: 'Multi-Rule Solver: Two-Factory Defect Problem',
        code: `# Multi-step probability: Two factories, defect rates

def solve_factory_problem(p_a, defect_a, p_b, defect_b, n_units=10000):
    """
    p_a: proportion from Factory A
    defect_a: P(defect | from A)
    p_b: proportion from Factory B
    defect_b: P(defect | from B)
    """
    # Step 1: Law of Total Probability
    p_d = p_a * defect_a + p_b * defect_b
    
    # Step 2: Bayes' Theorem
    p_a_given_d = (p_a * defect_a) / p_d
    p_b_given_d = (p_b * defect_b) / p_d
    
    # Step 3: Complement for at-least-one in n=2
    p_at_least_one = 1 - (1 - p_d) ** 2
    
    # Step 4: Expected count
    expected = n_units * p_d
    
    return p_d, p_a_given_d, p_b_given_d, p_at_least_one, expected

p_d, p_a_d, p_b_d, p_al1, exp = solve_factory_problem(0.60, 0.02, 0.40, 0.05)

print("=== Factory Problem Summary ===")
print(f"P(Defective)                    = {p_d:.4f}")
print(f"P(From A | Defective)           = {p_a_d:.4f}")
print(f"P(From B | Defective)           = {p_b_d:.4f}")
print(f"P(At least 1 defective in 2)    = {p_al1:.4f}")
print(f"Expected defectives in 10,000   = {exp:.0f}")
print()

# Visualise: breakdown of defectives by source
fig = Figure(width=7, height=4)
fig.axes(xmin=0, xmax=3, ymin=0, ymax=0.04)
fig.bars(
    labels=["P(D ∩ A)", "P(D ∩ B)", "P(D) total"],
    values=[0.60*0.02, 0.40*0.05, p_d],
    color=["coral", "steelblue", "teal"]
)
fig.text(1.5, 0.038, "Defect Probability Breakdown by Factory", size=12, bold=True)
fig.show()`,
        instructions: 'Run the cell to see the full multi-rule calculation. Try changing defect_a to 0.08 (8%) and observe how P(A | Defective) rises even though Factory A still makes only 60% of units. This shows why high-volume producers can dominate the defect count even with lower defect rates.',
      },
      {
        id: 'stat4-006-cell-2',
        type: 'python',
        cellTitle: 'Rule Comparison: Same Inputs, Different Rules',
        code: `# Compare what different rules give for P(A) = 0.4, P(B) = 0.5

p_a = 0.4
p_b = 0.5

print("Given P(A) =", p_a, "and P(B) =", p_b)
print()

# Case 1: Independent
p_int_ind = p_a * p_b
p_union_ind = p_a + p_b - p_int_ind
print("=== INDEPENDENT events ===")
print(f"  P(A ∩ B) = P(A) × P(B)     = {p_int_ind:.4f}")
print(f"  P(A ∪ B)                    = {p_union_ind:.4f}")
print(f"  P(A | B) = P(A)             = {p_a:.4f}  (unchanged by independence)")

# Case 2: Mutually exclusive
p_int_me = 0
p_union_me = p_a + p_b
print()
print("=== MUTUALLY EXCLUSIVE events ===")
print(f"  P(A ∩ B) = 0")
print(f"  P(A ∪ B) = P(A) + P(B)     = {p_union_me:.4f}")
print(f"  P(A | B) = 0                (if B occurred, A cannot)")

# Case 3: Given P(A ∩ B) = 0.30 (dependent, not mutually exclusive)
p_int_dep = 0.30
p_union_dep = p_a + p_b - p_int_dep
p_a_given_b = p_int_dep / p_b
print()
print("=== DEPENDENT: P(A ∩ B) = 0.30 ===")
print(f"  P(A ∪ B)                    = {p_union_dep:.4f}")
print(f"  P(A | B) = 0.30 / 0.50     = {p_a_given_b:.4f}")
print()

# Visualise the three intersection values
fig = Figure(width=7, height=3.5)
fig.axes(xmin=0, xmax=4, ymin=0, ymax=0.35)
fig.bars(
    labels=["P(A∩B)\nIndep", "P(A∩B)\nMut.Excl", "P(A∩B)\nDependent"],
    values=[p_int_ind, p_int_me, p_int_dep],
    color=["coral", "steelblue", "teal"]
)
fig.text(2, 0.325, "P(A ∩ B) Under Three Relationship Assumptions", size=10, bold=True)
fig.show()`,
        instructions: 'Run the cell. This shows how the same P(A) and P(B) give three different P(A ∩ B) depending on the relationship between events. Independence is the middle-ground assumption. Try adding a 4th case: P(A ∩ B) = P(A) = 0.40 (meaning B is a subset of A — every time B occurs, A occurs too). What is P(A | B) in that case?',
      },
    ],
  },
};
