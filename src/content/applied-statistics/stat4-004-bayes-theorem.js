export default {
  id: 'stat4-004',
  title: "Bayes' Theorem",
  description: "Use Bayes' Theorem to update probabilities given new evidence. Apply to medical testing and classification problems.",
  prerequisites: ['stat4-003'],
  coreConcept: "Bayes' Theorem converts a conditional probability P(evidence | hypothesis) into the reverse P(hypothesis | evidence) using the prior probability of the hypothesis and the total probability of the evidence.",

  prose: [
    '**A medical test for a rare disease has 95% sensitivity and 90% specificity.** The disease affects 1% of the population. A patient tests positive. What is the probability they actually have the disease? Most people guess "95%" — the answer is about 8.7%. This dramatic gap is explained by Bayes\' Theorem and the low base rate of the disease.',
    '**Anatomy of the formula.** Bayes\' Theorem: $$P(H \\mid E) = \\frac{P(E \\mid H) \\cdot P(H)}{P(E)}$$ where H is the hypothesis ("has disease"), E is the evidence ("tests positive"), P(H) is the *prior* probability before seeing E, P(E | H) is the *likelihood* (how likely the evidence is if H is true), and P(H | E) is the *posterior* probability after seeing E.',
    '**Computing P(E).** The denominator P(E) is usually computed with the Law of Total Probability: P(E) = P(E | H) · P(H) + P(E | Hᶜ) · P(Hᶜ). This accounts for all the ways the evidence can occur — either because H is true or because H is false (false alarm).',

    { type: 'callout', variant: 'procedure', title: "Three-step Bayes' calculation", body: '1. Write the prior P(H) and its complement P(Hᶜ) = 1 − P(H).\n2. Write the likelihoods P(E | H) and P(E | Hᶜ).\n3. Apply the formula: P(H | E) = P(E | H) · P(H) / [P(E | H) · P(H) + P(E | Hᶜ) · P(Hᶜ)].' },

    '**Medical testing terminology.** Sensitivity = P(test positive | disease present) = true positive rate. Specificity = P(test negative | no disease) = true negative rate. False positive rate = 1 − specificity = P(test positive | no disease). A high sensitivity test rarely misses disease; a high specificity test rarely gives false alarms.',

    { type: 'prediction', prompt: 'Before working through the disease example: intuitively, why would a disease with P(disease) = 0.01 lead to a very low posterior even when the test is 95% accurate? Think about how many healthy people are tested per sick person.' },

    '**Base rate matters.** When a condition is rare, even a very accurate test generates many more false positives than true positives in absolute numbers. If 10,000 people are tested and 100 have the disease: True positives = 100 × 0.95 = 95; False positives = 9,900 × 0.10 = 990. So P(disease | positive) = 95 / (95 + 990) ≈ 0.087. The test is accurate, but the disease is rare — so most positives are false alarms.',
    '**Sequential updating.** After observing the first piece of evidence, the posterior becomes the new prior for the next piece of evidence. This is *sequential Bayesian updating*, the foundation of Bayesian machine learning and spam filters. Each new email word (feature) updates the probability that the email is spam.',
    '**Bayes factor.** The ratio P(E | H) / P(E | Hᶜ) is called the Bayes factor — it measures how much the evidence updates the odds. A Bayes factor of 10 means the evidence is 10 times more likely under H than under Hᶜ, so the posterior odds are 10× the prior odds.',
  ],

  checkpoints: [
    { id: 'stat4-004-cp1', label: 'What does "prior probability" mean in Bayesian reasoning?', type: 'recall' },
    { id: 'stat4-004-cp2', label: 'In the disease example: prior = 0.01, sensitivity = 0.95, false positive rate = 0.10. Compute P(disease | positive).', type: 'application' },
    { id: 'stat4-004-cp3', label: 'What is the Law of Total Probability used for in Bayes\' Theorem?', type: 'concept' },
    { id: 'stat4-004-cp4', label: 'Define sensitivity and specificity in terms of conditional probability notation.', type: 'recall' },
    { id: 'stat4-004-cp5', label: 'If the disease prevalence rose to 20%, how would P(disease | positive) change qualitatively?', type: 'concept' },
    { id: 'stat4-004-cp6', label: 'What is the Bayes factor and what does a Bayes factor > 1 indicate?', type: 'recall' },
    { id: 'stat4-004-cp7', label: 'You ran the test twice on the same patient; both are positive. How do you update with two pieces of evidence?', type: 'application' },
    { id: 'stat4-004-cp8', label: 'A spam filter sees the word "FREE." P(spam) = 0.30, P("FREE" | spam) = 0.80, P("FREE" | not spam) = 0.05. Compute P(spam | "FREE").', type: 'application' },
  ],

  workedExample: {
    problem: 'Disease D has prevalence 1%. A test has sensitivity 95% and specificity 90%. A randomly selected person tests positive. What is P(D | positive)?',
    steps: [
      { expression: 'P(D)=0.01,\\; P(D^c)=0.99', annotation: 'Prior from known prevalence.' },
      { expression: 'P(+\\mid D)=0.95,\\; P(+\\mid D^c)=1-0.90=0.10', annotation: 'Sensitivity = 0.95; false positive rate = 1 − specificity = 0.10.' },
      { expression: 'P(+) = 0.95\\times 0.01 + 0.10\\times 0.99 = 0.0095+0.099=0.1085', annotation: 'Law of Total Probability for the denominator.' },
      { expression: 'P(D\\mid+)=\\dfrac{0.95\\times 0.01}{0.1085}=\\dfrac{0.0095}{0.1085}\\approx 0.0876', annotation: "Bayes' Theorem. Despite 95% sensitivity, P(D | +) ≈ 8.76%." },
    ],
    answer: 'P(D | positive) ≈ 0.0876 (8.76%). The low base rate (1%) means most positives are false alarms.',
  },

  challenge: {
    problem: 'A spam filter. P(spam) = 0.30. The word "WIN" appears in 85% of spam and 3% of legitimate emails. (a) P(spam | "WIN"). (b) Given the spam posterior, another word "FREE" then appears: P("FREE" | spam) = 0.80, P("FREE" | not spam) = 0.05. What is the final P(spam | WIN, FREE)?',
    steps: [
      { expression: 'P(+W)=0.85\\times0.30+0.03\\times0.70=0.255+0.021=0.276', annotation: 'Total probability of seeing "WIN".' },
      { expression: 'P(\\text{spam}\\mid W)=\\dfrac{0.85\\times0.30}{0.276}=\\dfrac{0.255}{0.276}\\approx 0.924', annotation: 'After "WIN", posterior ≈ 92.4% spam.' },
      { expression: 'P(+F)=0.80\\times0.924+0.05\\times0.076=0.739+0.004=0.743', annotation: 'Use posterior from step 1 as new prior. Total probability of "FREE".' },
      { expression: 'P(\\text{spam}\\mid W,F)=\\dfrac{0.80\\times0.924}{0.743}\\approx\\dfrac{0.739}{0.743}\\approx 0.995', annotation: 'Sequential update. After two spam-like words, posterior ≈ 99.5%.' },
    ],
    answer: 'P(spam | WIN, FREE) ≈ 0.995. Two strong spam signals push the posterior near certainty.',
  },

  assessment: {
    type: 'choice',
    question: 'P(H) = 0.10, P(E | H) = 0.80, P(E | Hᶜ) = 0.20. What is P(H | E)?',
    options: ['0.10', '0.267', '0.308', '0.80'],
    answer: '0.308',
    explanation: 'P(E) = 0.80 × 0.10 + 0.20 × 0.90 = 0.08 + 0.18 = 0.26. P(H | E) = 0.08 / 0.26 ≈ 0.308.',
  },

  quiz: [
    {
      id: 'stat4-004-q1',
      question: 'What does the denominator P(E) represent in Bayes\' Theorem?',
      options: [
        'The prior probability of the hypothesis',
        'The total probability of the evidence across all hypotheses',
        'The sensitivity of the test',
        'The likelihood ratio',
      ],
      answer: 'The total probability of the evidence across all hypotheses',
      hints: ['P(E) = P(E | H) · P(H) + P(E | Hᶜ) · P(Hᶜ).'],
      reviewSection: 'Computing P(E)',
    },
    {
      id: 'stat4-004-q2',
      question: 'Sensitivity is best defined as:',
      options: [
        'P(no disease | negative test)',
        'P(positive test | disease present)',
        'P(disease present | positive test)',
        'P(negative test | disease present)',
      ],
      answer: 'P(positive test | disease present)',
      hints: ['Sensitivity = true positive rate.'],
      reviewSection: 'Medical testing terminology',
    },
    {
      id: 'stat4-004-q3',
      question: 'A rare disease has 0.1% prevalence. Even with 99% sensitivity and 99% specificity, P(disease | positive) ≈:',
      options: ['0.99', '0.50', '0.09', '0.01'],
      answer: '0.09',
      hints: ['Low prevalence means many false positives swamp true positives. Compute: P(+) = 0.99 × 0.001 + 0.01 × 0.999.'],
      reviewSection: 'Base rate matters',
    },
    {
      id: 'stat4-004-q4',
      question: 'In sequential Bayesian updating, what becomes the new prior for the second update?',
      options: ['The original prior', 'The likelihood', 'The posterior from the first update', 'The Bayes factor'],
      answer: 'The posterior from the first update',
      hints: ['Each observation updates the prior → new posterior → next prior.'],
      reviewSection: 'Sequential updating',
    },
    {
      id: 'stat4-004-q5',
      question: 'P(E | H) = 0.60, P(E | Hᶜ) = 0.20. What is the Bayes factor?',
      options: ['0.40', '0.30', '3.0', '0.80'],
      answer: '3.0',
      hints: ['Bayes factor = P(E | H) / P(E | Hᶜ) = 0.60 / 0.20.'],
      reviewSection: 'Bayes factor',
    },
    {
      id: 'stat4-004-q6',
      question: 'A spam filter has P(spam) = 0.25. A suspicious word triples the prior odds of spam. What is the new P(spam)?',
      options: ['0.75', '0.50', '0.60', '0.43'],
      answer: '0.50',
      hints: ['Prior odds = 0.25/0.75 = 1/3. Triple to 1. New P = 1/(1+1) = 0.50.'],
      reviewSection: 'Bayes factor',
    },
  ],

  misconceptions: [
    {
      error: 'Equating P(disease | positive test) with P(positive test | disease) — the classic Prosecutor\'s Fallacy.',
      correction: "Bayes' Theorem is needed to convert P(E | H) into P(H | E). They are not equal unless P(H) = P(E), which is rarely the case.",
    },
    {
      error: 'Ignoring the base rate (prior) when interpreting test results.',
      correction: 'A test with 95% accuracy on a disease with 1% prevalence gives P(disease | positive) ≈ 8.7%, not 95%. Base rate matters enormously.',
    },
    {
      error: 'Thinking a single Bayesian update is sufficient.',
      correction: 'Bayesian reasoning is inherently sequential. As more evidence arrives, priors are updated. No single test result should usually be taken as definitive.',
    },
  ],

  transferPrompts: [
    'A machine learning classifier flags emails as spam. It has 92% precision (P(spam | flagged)) and 88% recall (P(flagged | spam)). If 20% of all emails are spam, derive the false positive rate P(flagged | not spam) using Bayes\' Theorem.',
    'A hiring algorithm flags 10% of candidates as "strong hires." Historical data shows 70% of actual strong performers were flagged and 8% of average performers were flagged. If 15% of candidates are truly strong performers, what fraction of flagged candidates are actually strong performers?',
  ],

  debugging: [
    {
      symptom: 'P(H | E) > 1.',
      cause: 'Denominoator P(E) was calculated incorrectly or the likelihoods were placed in the wrong positions.',
      fix: 'Verify P(E) = P(E|H)·P(H) + P(E|Hᶜ)·P(Hᶜ). Check that this equals or exceeds the numerator P(E|H)·P(H).',
    },
    {
      symptom: 'The posterior does not change much from the prior.',
      cause: 'The Bayes factor is close to 1 — the evidence is almost equally likely under H and Hᶜ, providing little information.',
      fix: 'Examine P(E|H) vs P(E|Hᶜ). If they are similar, the test is not discriminative. This is a feature of the data, not a calculation error.',
    },
  ],

  mastery: {
    targetLevel: 'Analyze',
    successCriteria: [
      "Apply Bayes' Theorem to compute a posterior probability from prior, likelihood, and evidence.",
      'Compute P(E) using the Law of Total Probability.',
      'Interpret medical test results correctly using sensitivity, specificity, and base rate.',
      'Perform sequential Bayesian updating with two pieces of evidence.',
      'Calculate and interpret the Bayes factor.',
    ],
    commonErrors: ["Confusing P(A|B) and P(B|A)", "Ignoring the base rate"],
    prerequisites: ['stat4-003: Conditional Probability and Independence'],
    nextSteps: ['stat4-005: Counting Principles'],
  },

  python: {
    cells: [
      {
        id: 'stat4-004-cell-1',
        type: 'python',
        cellTitle: "Bayes' Theorem: Medical Test Calculator",
        code: `# Bayes' Theorem for medical testing

def bayes(prior, sensitivity, specificity):
    """Compute P(disease | positive test)."""
    p_d = prior
    p_no_d = 1 - prior
    p_pos_given_d = sensitivity
    p_pos_given_no_d = 1 - specificity  # false positive rate

    p_pos = p_pos_given_d * p_d + p_pos_given_no_d * p_no_d
    posterior = (p_pos_given_d * p_d) / p_pos
    return posterior, p_pos

# Standard scenario
prior = 0.01        # 1% prevalence
sensitivity = 0.95  # 95% true positive rate
specificity = 0.90  # 90% true negative rate

posterior, p_pos = bayes(prior, sensitivity, specificity)
print(f"P(disease)          = {prior:.4f}")
print(f"P(+ | disease)      = {sensitivity:.4f}")
print(f"P(+ | no disease)   = {1 - specificity:.4f}")
print(f"P(+) overall        = {p_pos:.4f}")
print(f"P(disease | +)      = {posterior:.4f}  ({posterior*100:.1f}%)")

# How posterior changes with prevalence
priors = [i/100 for i in range(1, 51)]
posteriors = [bayes(p, sensitivity, specificity)[0] for p in priors]

fig = Figure(width=7, height=4.5)
fig.axes(xmin=0, xmax=0.52, ymin=0, ymax=1.05)
fig.plot(lambda p: bayes(p, 0.95, 0.90)[0] if p > 0 else 0, xmin=0.01, xmax=0.50, color="coral", width=2.5)
fig.scatter(xs=[prior], ys=[posterior], color="navy", size=8)
fig.text(0.25, 1.0, "P(Disease | Positive) vs. Prevalence", size=12, bold=True)
fig.text(0.25, -0.08, "Prior P(Disease)", size=11)
fig.show()`,
        instructions: 'Run the cell. The dot marks our scenario (prevalence 1%, posterior ≈ 8.7%). The curve shows how the posterior rises sharply as prevalence increases. Change prior to 0.10 (10% prevalence) and re-run — P(D | +) jumps to ≈ 51%. Change specificity to 0.99 and observe the effect on the 1% prevalence scenario.',
      },
      {
        id: 'stat4-004-cell-2',
        type: 'python',
        cellTitle: 'Sequential Bayesian Updating: Spam Filter',
        code: `# Sequential Bayesian updating — Naive Bayes spam filter

def update(prior, likelihood_spam, likelihood_ham):
    """Update spam probability given a new word."""
    p_spam = prior
    p_ham = 1 - prior
    evidence = likelihood_spam * p_spam + likelihood_ham * p_ham
    posterior = likelihood_spam * p_spam / evidence
    return posterior

# Prior: 30% of emails are spam
p_spam = 0.30

print("Step | Word   | P(spam) after update")
print("-" * 42)
print(f"  0  | (prior)|   {p_spam:.4f}")

# Word observations: (word, P(word|spam), P(word|ham))
observations = [
    ("WIN",   0.85, 0.03),
    ("FREE",  0.80, 0.05),
    ("Click", 0.40, 0.20),
    ("Hello", 0.10, 0.60),
]

history = [p_spam]
for i, (word, lk_spam, lk_ham) in enumerate(observations, 1):
    p_spam = update(p_spam, lk_spam, lk_ham)
    history.append(p_spam)
    print(f"  {i}  | {word:6s} |   {p_spam:.4f}")

print()
print(f"Final P(spam) after all 4 words: {history[-1]:.4f}")

# Plot the sequential update
steps = list(range(len(history)))
fig = Figure(width=7, height=4.5)
fig.axes(xmin=-0.5, xmax=4.5, ymin=0, ymax=1.05)
fig.scatter(xs=steps, ys=history, color="coral", size=8)
for i in range(len(history) - 1):
    pass  # connect dots conceptually (no line-from-points API)
fig.text(2, 1.0, "Spam Probability — Sequential Bayesian Updates", size=11, bold=True)
fig.text(2, -0.1, "Words observed (0 = prior)", size=10)
fig.show()`,
        instructions: 'Run the cell. Each word updates the spam probability. "WIN" and "FREE" push the probability up; "Hello" pulls it down. Add a 5th observation: ("Lottery", 0.90, 0.02) to the list and re-run. Try starting with a different prior like 0.05 (5% base spam rate) and observe how the final posterior changes.',
      },
      {
        id: 'stat4-004-cell-3',
        type: 'python',
        cellTitle: "100-Person Table: Visualising Bayes' Base Rate Effect",
        code: `# Visualise the disease test scenario with 10,000 people

n_total = 10000
prevalence = 0.01
sensitivity = 0.95
specificity = 0.90

n_disease = int(n_total * prevalence)
n_healthy = n_total - n_disease

true_pos = round(n_disease * sensitivity)
false_neg = n_disease - true_pos
false_pos = round(n_healthy * (1 - specificity))
true_neg = n_healthy - false_pos

total_pos = true_pos + false_pos
ppv = true_pos / total_pos  # Positive Predictive Value = P(D | +)

print("=== 10,000 People Tested ===")
print(f"Disease prevalence:    {prevalence*100:.1f}%")
print(f"Sensitivity:           {sensitivity*100:.0f}%")
print(f"Specificity:           {specificity*100:.0f}%")
print()
print(f"          | Has Disease | No Disease | Total")
print(f"--------- | ----------- | ---------- | -----")
print(f"Test +    |  {true_pos:5d} (TP) | {false_pos:5d} (FP) | {total_pos:5d}")
print(f"Test -    |  {false_neg:5d} (FN) | {true_neg:5d} (TN) | {n_total - total_pos:5d}")
print(f"Total     |  {n_disease:5d}      | {n_healthy:5d}     | {n_total:5d}")
print()
print(f"P(Disease | Positive) = {true_pos}/{total_pos} = {ppv:.4f}  ({ppv*100:.1f}%)")

# Bar chart: TP vs FP
fig = Figure(width=6, height=4)
fig.axes(xmin=0, xmax=3, ymin=0, ymax=1100)
fig.bars(
    labels=["True Positive", "False Positive"],
    values=[true_pos, false_pos],
    color=["teal", "coral"]
)
fig.text(1.5, 1040, "Among ALL Positive Tests (10,000 people)", size=11, bold=True)
fig.show()`,
        instructions: 'Run the cell. The table shows why P(D | +) ≈ 8.7%: 95 true positives are swamped by 990 false positives. Change `prevalence` to 0.10 (10%) and re-run — now there are 950 true positives vs 900 false positives, and PPV jumps above 50%.',
      },
    ],
  },
};
