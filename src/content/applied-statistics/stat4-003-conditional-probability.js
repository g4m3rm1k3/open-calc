export default {
  id: 'stat4-003',
  title: 'Conditional Probability and Independence',
  description: 'Compute conditional probabilities, apply the Multiplication Rule, and determine whether two events are independent.',
  prerequisites: ['stat4-002'],
  coreConcept: 'Conditional probability P(A | B) quantifies how knowing that B occurred changes the probability of A. When knowing B provides no information about A, the events are independent and P(A | B) = P(A).',

  prose: [
    '**In a study of 200 patients:** 80 received Treatment X and 120 received a placebo. Of the 80 in Treatment X, 56 recovered. Of the 120 given placebo, 48 recovered. What is the probability of recovery GIVEN the patient received Treatment X? 56/80 = 0.70. GIVEN placebo? 48/120 = 0.40. These are *conditional probabilities* — the sample space has been restricted to a known subgroup.',
    '**Definition.** The conditional probability of A given B is: **P(A | B) = P(A ∩ B) / P(B)**, provided P(B) > 0. The vertical bar "| " is read "given." Restricting to B redefines the denominator from the full sample space to just event B.',
    '**Multiplication Rule.** Rearranging the definition gives P(A ∩ B) = P(A | B) · P(B). This lets you compute joint probabilities from conditional ones. Equivalently, P(A ∩ B) = P(B | A) · P(A).',

    { type: 'callout', variant: 'procedure', title: 'Computing P(A | B) — two steps', body: '1. Restrict the sample space to outcomes where B occurred.\n2. Among those outcomes, find the fraction where A also occurred.\nFormula: P(A | B) = P(A ∩ B) / P(B).' },

    { type: 'prediction', prompt: 'Before reading on: if knowing that it rained today changes the probability of carrying an umbrella, are "rain" and "umbrella" independent? What condition would make them independent?' },

    '**Independence.** Events A and B are *independent* if knowing B occurred does not change the probability of A: **P(A | B) = P(A)**. Equivalently, **P(A ∩ B) = P(A) · P(B)**. Use either definition to test independence. For independent events, the Multiplication Rule simplifies: P(A ∩ B) = P(A) · P(B).',
    '**Testing independence.** Check: does P(A ∩ B) = P(A) · P(B)? If yes, independent. If not, dependent. In the patient study above: P(recovery) = 104/200 = 0.52. P(Treatment X) = 80/200 = 0.40. P(recovery ∩ Treatment X) = 56/200 = 0.28. Is 0.28 = 0.52 × 0.40 = 0.208? No — so recovery and treatment are NOT independent.',
    '**Common pitfall: confusing P(A | B) and P(B | A).** The probability that a randomly selected person who has a disease tests positive [P(positive | disease)] is NOT the same as the probability that a positive test means the person has the disease [P(disease | positive)]. Confusing these is the *Prosecutor\'s Fallacy*. Bayes\' Theorem (next lesson) formalises the relationship.',
    '**Sequential independent events.** For n independent events each with probability p, P(all n occur) = pⁿ and P(at least one fails) = 1 − pⁿ. System reliability calculations use this. If each component has a 0.95 survival probability and 10 components are in series, system reliability = 0.95¹⁰ ≈ 0.599.',
  ],

  checkpoints: [
    { id: 'stat4-003-cp1', label: 'P(A ∩ B) = 0.12, P(B) = 0.40. Compute P(A | B).', type: 'application' },
    { id: 'stat4-003-cp2', label: 'P(A) = 0.50, P(B) = 0.60, P(A ∩ B) = 0.30. Are A and B independent?', type: 'application' },
    { id: 'stat4-003-cp3', label: 'State the Multiplication Rule for independent events.', type: 'recall' },
    { id: 'stat4-003-cp4', label: 'P(A | B) = 0.25 and P(A) = 0.25. What can you conclude?', type: 'concept' },
    { id: 'stat4-003-cp5', label: 'Name the fallacy of confusing P(A | B) with P(B | A).', type: 'recall' },
    { id: 'stat4-003-cp6', label: 'A system has 5 independent components, each with P(working) = 0.98. Find P(all 5 work).', type: 'application' },
    { id: 'stat4-003-cp7', label: 'From a deck, two cards are drawn WITHOUT replacement. Are the draws independent?', type: 'concept' },
    { id: 'stat4-003-cp8', label: 'P(A) = 0.3, P(B | A) = 0.6. Find P(A ∩ B).', type: 'application' },
  ],

  workedExample: {
    problem: 'A box contains 5 red and 3 blue chips. Two chips are drawn without replacement. (a) P(both red). (b) P(second is red | first is red). (c) P(second is red | first is blue). (d) Are the two draws independent?',
    steps: [
      { expression: 'P(\\text{1st red}) = \\dfrac{5}{8}', annotation: 'Before any draw: 5 red out of 8 total.' },
      { expression: 'P(\\text{2nd red}\\mid\\text{1st red}) = \\dfrac{4}{7}', annotation: 'After removing one red: 4 red remain out of 7 total.' },
      { expression: 'P(\\text{both red}) = \\dfrac{5}{8}\\times\\dfrac{4}{7}=\\dfrac{20}{56}\\approx 0.357', annotation: 'Multiplication Rule for dependent events.' },
      { expression: 'P(\\text{2nd red}\\mid\\text{1st blue}) = \\dfrac{5}{7}\\approx 0.714', annotation: 'After removing one blue: 5 red remain out of 7.' },
      { expression: 'P(\\text{2nd red}) = \\tfrac{5}{8}\\neq\\tfrac{4}{7}\\text{ and }\\neq\\tfrac{5}{7}', annotation: 'The probability of the second draw changes depending on the first. Therefore NOT independent.' },
    ],
    answer: 'P(both red) ≈ 0.357; draws are NOT independent (without replacement).',
  },

  challenge: {
    problem: 'A factory has two machines. Machine A produces 60% of items; 3% are defective. Machine B produces 40%; 5% are defective. An item is selected at random. (a) P(defective). (b) Given the item is defective, what is P(it came from Machine A)?',
    steps: [
      { expression: 'P(D\\cap A)=0.60\\times 0.03=0.018', annotation: 'P(from A) × P(defective | A).' },
      { expression: 'P(D\\cap B)=0.40\\times 0.05=0.020', annotation: 'P(from B) × P(defective | B).' },
      { expression: 'P(D)=0.018+0.020=0.038', annotation: 'Law of Total Probability (A and B partition the sample space).' },
      { expression: 'P(A\\mid D)=\\dfrac{P(D\\cap A)}{P(D)}=\\dfrac{0.018}{0.038}\\approx 0.474', annotation: 'Conditional probability definition. Given the item is defective, there is about a 47.4% chance it came from Machine A.' },
    ],
    answer: 'P(D) = 0.038; P(A | D) ≈ 0.474. This is an early taste of Bayes\' Theorem.',
  },

  assessment: {
    type: 'choice',
    question: 'P(A) = 0.40, P(B) = 0.50, P(A ∩ B) = 0.20. Which statement is true?',
    options: [
      'A and B are independent because P(A ∩ B) = P(A) · P(B)',
      'A and B are dependent because P(A | B) ≠ P(A)',
      'A and B are mutually exclusive',
      'P(A | B) = 0.80',
    ],
    answer: 'A and B are independent because P(A ∩ B) = P(A) · P(B)',
    explanation: 'P(A) · P(B) = 0.40 × 0.50 = 0.20 = P(A ∩ B). So A and B are independent.',
  },

  quiz: [
    {
      id: 'stat4-003-q1',
      question: 'P(A ∩ B) = 0.15, P(B) = 0.50. What is P(A | B)?',
      options: ['0.075', '0.30', '0.65', '0.15'],
      answer: '0.30',
      hints: ['P(A | B) = P(A ∩ B) / P(B) = 0.15 / 0.50.'],
      reviewSection: 'Definition of conditional probability',
    },
    {
      id: 'stat4-003-q2',
      question: 'For independent events A and B with P(A) = 0.3 and P(B) = 0.6, P(A ∩ B) = ?',
      options: ['0.90', '0.18', '0.50', '0.30'],
      answer: '0.18',
      hints: ['Independence means P(A ∩ B) = P(A) × P(B).'],
      reviewSection: 'Independence',
    },
    {
      id: 'stat4-003-q3',
      question: '5 independent components each have P(failure) = 0.02. P(at least one fails) = ?',
      options: ['0.10', '0.096', '0.904', '0.02'],
      answer: '0.096',
      hints: ['P(at least one fails) = 1 − P(all work) = 1 − 0.98⁵.'],
      reviewSection: 'Sequential independent events',
    },
    {
      id: 'stat4-003-q4',
      question: 'P(A | B) = 0.45 and P(A) = 0.30. What can we conclude?',
      options: ['A and B are independent', 'A and B are mutually exclusive', 'A and B are dependent', 'P(B | A) = 0.45'],
      answer: 'A and B are dependent',
      hints: ['Independence requires P(A | B) = P(A).'],
      reviewSection: 'Testing independence',
    },
    {
      id: 'stat4-003-q5',
      question: 'A test for a disease has P(positive | disease) = 0.95. A patient tests positive. The probability they have the disease is:',
      options: ['0.95 — that is what P(positive | disease) means', 'Different from 0.95 — we need P(disease | positive)', 'Exactly 1.0', '0.05'],
      answer: 'Different from 0.95 — we need P(disease | positive)',
      hints: ["P(A | B) ≠ P(B | A) in general. This is Bayes' setup."],
      reviewSection: 'Prosecutor\'s Fallacy',
    },
    {
      id: 'stat4-003-q6',
      question: 'P(A) = 0.5, P(B | A) = 0.4. P(A ∩ B) = ?',
      options: ['0.2', '0.9', '0.1', '0.8'],
      answer: '0.2',
      hints: ['Multiplication Rule: P(A ∩ B) = P(B | A) × P(A).'],
      reviewSection: 'Multiplication Rule',
    },
  ],

  misconceptions: [
    {
      error: 'Assuming independence whenever two events "seem unrelated."',
      correction: 'Independence is a mathematical property: P(A ∩ B) = P(A) · P(B). It must be verified, not assumed. Many intuitively "unrelated" events in a shared data set are actually correlated.',
    },
    {
      error: 'Confusing P(A | B) with P(B | A) — the Prosecutor\'s Fallacy.',
      correction: 'P(test positive | disease) ≠ P(disease | test positive). Always check which event is the "given" one. Bayes\' Theorem provides the exact conversion formula.',
    },
    {
      error: 'Using independence formula (P(A) · P(B)) for sampling WITHOUT replacement.',
      correction: 'Without replacement, each draw changes the remaining sample space. Draws are dependent. Use the conditional probability formula, not simple multiplication.',
    },
  ],

  transferPrompts: [
    'An online retailer finds 30% of visitors click an ad and 12% of all visitors both click the ad and make a purchase. (a) P(purchase | clicked ad). (b) P(purchase without clicking ad) if P(purchase) = 0.10? Are clicking and purchasing independent?',
    'A security system has two independent alarms, each with P(triggering correctly | intrusion) = 0.85. What is P(at least one triggers | intrusion)? Why is a series system more reliable?',
  ],

  debugging: [
    {
      symptom: 'P(A | B) > 1.',
      cause: 'P(A ∩ B) > P(B), which is impossible — the intersection cannot exceed either constituent event.',
      fix: 'Check that the counts or probabilities for A ∩ B and B are correctly identified. Recall P(A ∩ B) ≤ min(P(A), P(B)).',
    },
    {
      symptom: 'P(A ∩ B) computed from independence does not match the data.',
      cause: 'The events are not actually independent — a hidden confounding factor links them.',
      fix: 'Always test independence with the data: compare P(A ∩ B) to P(A) · P(B). Use the conditional formula when in doubt.',
    },
  ],

  mastery: {
    targetLevel: 'Analyze',
    successCriteria: [
      'Compute P(A | B) from given joint and marginal probabilities.',
      'Apply the Multiplication Rule for both dependent and independent events.',
      'Test whether two events are independent using P(A ∩ B) = P(A) · P(B).',
      'Identify the Prosecutor\'s Fallacy in a written scenario.',
      'Compute system reliability for independent components in series.',
    ],
    commonErrors: ['Assuming independence without verification', 'Confusing P(A|B) and P(B|A)'],
    prerequisites: ['stat4-002: Complement, Union, Intersection'],
    nextSteps: ["stat4-004: Bayes' Theorem"],
  },

  python: {
    cells: [
      {
        id: 'stat4-003-cell-1',
        type: 'python',
        cellTitle: 'Conditional Probability from a Contingency Table',
        code: `# Treatment study: 200 patients
# Rows: Treatment X (80), Placebo (120)
# Columns: Recovered, Not recovered

recovered_tx = 56
not_recovered_tx = 24
recovered_placebo = 48
not_recovered_placebo = 72

total = 200
total_tx = recovered_tx + not_recovered_tx
total_placebo = recovered_placebo + not_recovered_placebo
total_recovered = recovered_tx + recovered_placebo

# Marginal probabilities
p_tx = total_tx / total
p_placebo = total_placebo / total
p_recovered = total_recovered / total

# Conditional probabilities
p_rec_given_tx = recovered_tx / total_tx
p_rec_given_placebo = recovered_placebo / total_placebo

print("P(Treatment X)       =", round(p_tx, 4))
print("P(Recovered)         =", round(p_recovered, 4))
print()
print("P(Recovered | Tx X)  =", round(p_rec_given_tx, 4))
print("P(Recovered | Placebo)=", round(p_rec_given_placebo, 4))
print()

# Independence test
p_rec_and_tx = recovered_tx / total
product = p_tx * p_recovered
print(f"P(Rec ∩ Tx) = {p_rec_and_tx:.4f}")
print(f"P(Rec) × P(Tx) = {product:.4f}")
print("Independent?", abs(p_rec_and_tx - product) < 0.001)

# Bar chart: conditional vs marginal
fig = Figure(width=7, height=4)
fig.axes(xmin=0, xmax=4, ymin=0, ymax=0.85)
fig.bars(
    labels=["P(Rec|Tx)", "P(Rec|Placebo)", "P(Rec) overall"],
    values=[p_rec_given_tx, p_rec_given_placebo, p_recovered],
    color=["coral", "steelblue", "teal"]
)
fig.text(2, 0.80, "Conditional vs. Marginal Recovery Probability", size=11, bold=True)
fig.show()`,
        instructions: 'Run the cell. Notice P(Rec | Tx) = 0.70 vs P(Rec | Placebo) = 0.40. The independence test shows these are NOT independent — treatment affects recovery. Change `recovered_tx = 42` (so that P(rec | tx) = 0.525) and re-run to see when the events get closer to independent.',
      },
      {
        id: 'stat4-003-cell-2',
        type: 'python',
        cellTitle: 'Sequential Draws Without Replacement',
        code: `# Drawing chips without replacement — dependent events
# Box: 5 red, 3 blue = 8 total

red = 5
blue = 3
total = red + blue

# Exact conditional probabilities
p_red1 = red / total
p_red2_given_red1 = (red - 1) / (total - 1)
p_red2_given_blue1 = red / (total - 1)

p_both_red = p_red1 * p_red2_given_red1
p_red1_blue2 = p_red1 * (blue / (total - 1))
p_blue1_red2 = (blue / total) * p_red2_given_blue1

# Marginal probability of 2nd draw being red
p_red2 = p_red1 * p_red2_given_red1 + (blue/total) * p_red2_given_blue1

print(f"P(1st red)              = {p_red1:.4f}")
print(f"P(2nd red | 1st red)    = {p_red2_given_red1:.4f}")
print(f"P(2nd red | 1st blue)   = {p_red2_given_blue1:.4f}")
print(f"P(2nd red) [marginal]   = {p_red2:.4f}")
print()
print("Independence check (2nd draw):")
print(f"  P(2nd red) = {p_red2:.4f} ≠ P(1st red) = {p_red1:.4f} → Dependent")
print()
print(f"P(both red)   = {p_both_red:.4f}")
print(f"P(red, blue)  = {p_red1_blue2:.4f}")
print(f"P(blue, red)  = {p_blue1_red2:.4f}")

# Pie chart of all 2-draw outcomes
labels = ["RR", "RB", "BR", "BB"]
p_bb = (blue/total) * ((blue-1)/(total-1))
values = [p_both_red, p_red1_blue2, p_blue1_red2, p_bb]
print()
print("Sum of all outcomes:", round(sum(values), 6))

fig = Figure(width=6, height=5)
fig.axes(xmin=-1.5, xmax=1.5, ymin=-1.5, ymax=1.8)
fig.pie(labels=labels, values=values, colors=["coral","steelblue","steelblue","teal"])
fig.text(0, 1.65, "2-Draw Outcome Probabilities (Without Replacement)", size=10, bold=True)
fig.show()`,
        instructions: 'Run the cell. Notice that P(2nd red) = P(1st red) = 5/8 despite the draws being dependent. This is a common misconception — the draws are dependent, but the marginal probabilities remain the same. Try changing to WITH replacement (set p_red2_given_red1 = red/total) and compare.',
      },
    ],
  },
};
