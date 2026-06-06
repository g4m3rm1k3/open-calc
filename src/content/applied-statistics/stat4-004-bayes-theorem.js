export default {
  id: 'stat4-004',
  slug: 'bayes-theorem',
  chapter: 'stat4',
  order: 4,
  title: "Bayes' Theorem",
  subtitle: "Update probabilities given new evidence â€” the mathematical engine behind medical testing, spam filters, and Bayesian AI.",
  tags: ["Bayes' theorem", 'posterior probability', 'prior probability', 'likelihood', 'base rate', 'sensitivity', 'specificity', 'false positive', 'sequential updating', 'Bayes factor'],
  aliases: "bayes theorem posterior prior likelihood base rate sensitivity specificity false positive PPV positive predictive value medical testing spam filter",
  timeToComplete: 45,
  coreConcept: `Bayes' Theorem converts P(evidence | hypothesis) into P(hypothesis | evidence) using the prior probability of the hypothesis and the total probability of the evidence. The most important insight: even highly accurate tests give mostly false positives when the condition being tested is rare.`,
  prerequisites: ['stat4-003'],
  nextLesson: 'stat4-005',

  hook: {
    question: `A medical test for a rare disease has 95% sensitivity (P(positive | disease) = 0.95) and 90% specificity (P(negative | no disease) = 0.90). The disease affects 1% of the population. A patient tests positive. Most people guess the probability they have the disease is "about 95%." The correct answer is approximately 8.7%. Why is it so low?`,
    realWorldContext: `Bayes' Theorem is the mathematical foundation of rational belief updating. It powers spam filters (each word in an email updates the probability it's spam), medical diagnosis (each test result updates the probability of disease), GPS positioning (each sensor reading updates the estimated location), autonomous vehicle perception, and virtually every Bayesian machine learning model. The theorem was discovered by Thomas Bayes in the 18th century and published posthumously. In the 20th century the "frequentist vs. Bayesian" debate became the central methodological divide in statistics. Understanding Bayes' Theorem means understanding how to correctly update beliefs â€” a skill as important in everyday reasoning as in data science.`,
  },

  intuition: {
    prose: [
      `**The anatomy of the formula.** Bayes' Theorem: $$P(H \\mid E) = \\frac{P(E \\mid H) \\cdot P(H)}{P(E)}$$ where $H$ is the **hypothesis** ("has disease"), $E$ is the **evidence** ("tests positive"), $P(H)$ is the **prior** probability before seeing $E$, $P(E \\mid H)$ is the **likelihood** (how likely the evidence is if $H$ is true), and $P(H \\mid E)$ is the **posterior** probability after seeing $E$. The denominator $P(E)$ is computed with the Law of Total Probability.`,

      `**Computing P(E).** $P(E) = P(E \\mid H) \\cdot P(H) + P(E \\mid H^c) \\cdot P(H^c)$. This accounts for all the ways the evidence can occur â€” either because $H$ is true (true positive) or because $H$ is false (false alarm). The denominator ensures the posterior is a valid probability.`,

      `**The base rate problem â€” 10,000 people.** Prevalence = 1%, so 100 have the disease and 9,900 don't. True positives: $100 \\times 0.95 = 95$. False positives: $9,900 \\times (1 - 0.90) = 9,900 \\times 0.10 = 990$. Total positives: $95 + 990 = 1,085$. Of these 1,085 positives, only 95 actually have the disease. So $P(D \\mid +) = 95/1085 \\approx 0.087$. The test is accurate, but the disease is rare â€” so most positives are false alarms.`,

      `**Before reading on, predict:** If the disease prevalence were 20% instead of 1%, how would P(D | positive) change? Compute your guess before seeing the formula answer.`,

      `**Medical testing terminology.** Sensitivity = $P(\\text{test}^+ \\mid D)$ = true positive rate. Specificity = $P(\\text{test}^- \\mid D^c)$ = true negative rate. False positive rate = $1 -$ specificity = $P(\\text{test}^+ \\mid D^c)$. Positive Predictive Value (PPV) = $P(D \\mid \\text{test}^+)$ â€” this is what Bayes' Theorem computes. A high sensitivity test rarely misses disease. A high specificity test rarely gives false alarms. You need both to get a high PPV, especially when prevalence is low.`,

      `**Sequential updating.** After observing the first piece of evidence, the posterior becomes the new prior for the next piece of evidence. This is **sequential Bayesian updating** â€” the foundation of spam filters, Kalman filters, and Bayesian neural networks. Each new word in an email updates the spam probability. The final posterior after many updates is independent of the order of evidence (for independent evidence pieces).`,

      `**The Bayes factor.** The ratio $P(E \\mid H) / P(E \\mid H^c)$ is the **Bayes factor** â€” it measures how much the evidence updates the odds. A Bayes factor of 10 means the evidence is 10 times more likely under $H$ than under $H^c$, so the posterior odds are 10Ã— the prior odds. A Bayes factor of 1 means the evidence is equally likely under both hypotheses and provides no information.`,
    ],
    callouts: [
      {
        type: 'procedure',
        title: "Three-Step Bayes' Calculation",
        body: `1. Write the prior $P(H)$ and its complement $P(H^c) = 1 - P(H)$.
2. Write the likelihoods $P(E \\mid H)$ and $P(E \\mid H^c)$.
3. Apply:
$$P(H \\mid E) = \\frac{P(E \\mid H) \\cdot P(H)}{P(E \\mid H) \\cdot P(H) + P(E \\mid H^c) \\cdot P(H^c)}$$`,
      },
      {
        type: 'insight',
        title: 'Why Base Rate Matters So Much',
        body: `The posterior probability $P(H \\mid E)$ depends on the prior $P(H)$. For rare conditions, the prior is very small, so the denominator $P(E)$ is dominated by false positives â€” even a small false positive rate generates many more false positives than true positives in absolute numbers.

Rule of thumb: no matter how accurate the test, if the condition being tested is rare enough (prevalence < 1%), a positive result is more likely to be a false positive than a true positive unless the test's specificity is extremely high (> 99%).`,
      },
      {
        type: 'definition',
        title: 'Key Medical Test Quantities',
        body: `- **Sensitivity** = $P(+ \\mid D)$ = true positive rate (TPR)
- **Specificity** = $P(- \\mid D^c)$ = true negative rate (TNR)
- **False positive rate** = $P(+ \\mid D^c) = 1 -$ specificity
- **False negative rate** = $P(- \\mid D) = 1 -$ sensitivity
- **PPV** = $P(D \\mid +)$ = precision = what Bayes computes
- **NPV** = $P(D^c \\mid -)$ = negative predictive value`,
      },
    ],
    visualizations: [],
  },

  math: {
    prose: [
      `**Deriving Bayes' Theorem.** From the definition of conditional probability: $P(H \\cap E) = P(H \\mid E) \\cdot P(E) = P(E \\mid H) \\cdot P(H)$. Dividing both sides by $P(E)$ (assumed nonzero): $P(H \\mid E) = P(E \\mid H) \\cdot P(H) / P(E)$. The denominator $P(E) = P(E \\mid H) P(H) + P(E \\mid H^c) P(H^c)$ comes from the Law of Total Probability. Bayes' Theorem is thus a direct consequence of the definition of conditional probability â€” no additional axioms are required.`,

      `**Odds form of Bayes' Theorem.** Let $\\text{odds}(H) = P(H)/(1-P(H))$ denote the prior odds. Then: $$\\frac{P(H \\mid E)}{P(H^c \\mid E)} = \\underbrace{\\frac{P(E \\mid H)}{P(E \\mid H^c)}}_{\\text{Bayes factor}} \\times \\underbrace{\\frac{P(H)}{P(H^c)}}_{\\text{prior odds}}$$ The posterior odds equal the Bayes factor times the prior odds. This form is often cleaner: to update odds, multiply by the Bayes factor. For a spam filter with prior odds 0.30/0.70 â‰ˆ 0.43 and a word with Bayes factor 10 (10Ã— more likely in spam), posterior odds $= 0.43 \\times 10 = 4.3$, corresponding to $P(\\text{spam}) = 4.3/5.3 \\approx 0.81$.`,

      `**Generalization to multiple hypotheses.** For a partition $\\{H_1, \\ldots, H_k\\}$: $$P(H_i \\mid E) = \\frac{P(E \\mid H_i) \\cdot P(H_i)}{\\sum_{j=1}^k P(E \\mid H_j) \\cdot P(H_j)}$$ This is the multinomial Bayes' Theorem. It is used in Naive Bayes classifiers (multiple class labels), medical diagnosis with multiple possible conditions, and forensic DNA analysis (multiple suspects).`,
    ],
    callouts: [],
  },

  rigor: {
    prose: [
      `**Bayesian vs. frequentist probability.** The frequentist interpretation restricts probability to repeatable events â€” $P(D)$ must be the long-run frequency of the disease in repeated sampling. In this framework, Bayes' Theorem is valid but the "prior" must be justified from data, not subjective belief. The **Bayesian** interpretation treats probability as a degree of belief about any proposition, including one-time events ("Will it rain tomorrow?"). Here, $P(H)$ is a personal prior that is updated via Bayes' Theorem to give a personal posterior. Both frameworks use the same mathematical formula; they differ in what that formula represents.`,

      `**Conjugate priors and Bayesian updating in closed form.** For the Beta-Binomial model: if the prior on $p$ (a proportion) is $\\text{Beta}(\\alpha, \\beta)$ and we observe $k$ successes in $n$ trials, the posterior is $\\text{Beta}(\\alpha + k, \\beta + n - k)$. The Beta distribution is the conjugate prior for the Binomial likelihood. This means Bayesian updating can be done algebraically without integration. For our medical test: if the prior on disease prevalence is $\\text{Beta}(1, 99)$ (mean = 0.01) and we run 100 tests observing 10 positives, the posterior on prevalence is $\\text{Beta}(11, 90)$ with mean 11/101 â‰ˆ 0.109. This is the Bayesian estimation paradigm.`,
    ],
  },

  examples: [
    {
      id: 'ex1',
      title: "Example 1 â€” Medical Test: Rare Disease",
      prose: `Disease D has prevalence 1%. A test has sensitivity 95% and specificity 90%. A randomly selected person tests positive. What is P(D | positive)?`,
      steps: [
        { expression: `P(D)=0.01,\\; P(D^c)=0.99`, annotation: `Prior from known prevalence.` },
        { expression: `P(+ \\mid D)=0.95,\\; P(+ \\mid D^c)=1-0.90=0.10`, annotation: `Sensitivity = 0.95; false positive rate = 1 âˆ’ specificity = 0.10.` },
        { expression: `P(+) = 0.95 \\times 0.01 + 0.10 \\times 0.99 = 0.0095 + 0.099 = 0.1085`, annotation: `Law of Total Probability â€” total probability of a positive test.` },
        { expression: `P(D \\mid +) = \\frac{0.95 \\times 0.01}{0.1085} = \\frac{0.0095}{0.1085} \\approx 0.0876`, annotation: `Bayes' Theorem. Despite 95% sensitivity, only 8.76% of positive tests are true positives.` },
        { expression: `\\text{Check: } \\frac{95}{95 + 990} = \\frac{95}{1085} \\approx 0.0876 \\checkmark`, annotation: `The 10,000-person table: 95 true positives vs. 990 false positives confirms the formula.` },
      ],
    },
    {
      id: 'ex2',
      title: "Example 2 â€” Spam Filter: Sequential Updating",
      prose: `A spam filter has prior P(spam) = 0.30. The word "WIN" appears in 85% of spam and 3% of legitimate emails. Then "FREE" also appears: P("FREE" | spam) = 0.80, P("FREE" | not spam) = 0.05. Find P(spam | WIN) and then P(spam | WIN, FREE).`,
      steps: [
        { expression: `P(W) = 0.85 \\times 0.30 + 0.03 \\times 0.70 = 0.255 + 0.021 = 0.276`, annotation: `Total probability of seeing "WIN."` },
        { expression: `P(\\text{spam} \\mid W) = \\frac{0.85 \\times 0.30}{0.276} = \\frac{0.255}{0.276} \\approx 0.924`, annotation: `After "WIN," posterior â‰ˆ 92.4% spam. This becomes the new prior.` },
        { expression: `P(F) = 0.80 \\times 0.924 + 0.05 \\times 0.076 = 0.739 + 0.004 = 0.743`, annotation: `Total probability of "FREE" given the updated prior.` },
        { expression: `P(\\text{spam} \\mid W, F) = \\frac{0.80 \\times 0.924}{0.743} \\approx \\frac{0.739}{0.743} \\approx 0.995`, annotation: `Sequential update: after two spam-like words, posterior â‰ˆ 99.5% spam.` },
      ],
    },
  ],

  challenges: [
    {
      id: 'ch1',
      difficulty: 'medium',
      problem: `A machine learning classifier flags emails as spam. Historical data shows: P(spam) = 0.25, sensitivity = P(flagged | spam) = 0.92, P(flagged | not spam) = 0.08. (a) What is P(flagged)? (b) What is P(spam | flagged) â€” the precision? (c) What is P(spam | not flagged)? (d) If you wanted P(spam | flagged) â‰¥ 0.90, and sensitivity must stay at 0.92, what maximum false positive rate P(flagged | not spam) would you need?`,
      walkthrough: [
        `(a) $P(\\text{flagged}) = 0.92 \\times 0.25 + 0.08 \\times 0.75 = 0.23 + 0.06 = 0.29$.

(b) $P(\\text{spam} \\mid \\text{flagged}) = (0.92 \\times 0.25) / 0.29 = 0.23 / 0.29 \\approx 0.793$. About 79% precision â€” most flagged emails are actually spam, but 21% are false alarms.

(c) $P(\\text{spam} \\mid \\neg\\text{flagged}) = P(\\text{spam} \\cap \\neg\\text{flagged}) / P(\\neg\\text{flagged})$.
$P(\\text{spam} \\cap \\neg\\text{flagged}) = P(\\neg\\text{flagged} \\mid \\text{spam}) \\cdot P(\\text{spam}) = 0.08 \\times 0.25 = 0.02$.
$P(\\neg\\text{flagged}) = 1 - 0.29 = 0.71$.
$P(\\text{spam} \\mid \\neg\\text{flagged}) = 0.02/0.71 \\approx 0.028$. Good: only 2.8% of unflagged emails are spam.

(d) We want: $P(S \\mid +) = (0.92 \\times 0.25) / (0.92 \\times 0.25 + r \\times 0.75) \\geq 0.90$.
$0.23 / (0.23 + 0.75r) \\geq 0.90 \\Rightarrow 0.23 \\geq 0.90(0.23 + 0.75r) \\Rightarrow 0.23 \\geq 0.207 + 0.675r \\Rightarrow r \\leq 0.023/0.675 \\approx 0.034$.
The false positive rate must be â‰¤ 3.4% to achieve 90% precision.`,
      ],
    },
    {
      id: 'ch2',
      difficulty: 'hard',
      problem: `A company uses three independent indicators to predict customer churn: login frequency dropped (L), support tickets filed (T), payment late (P). Prior: P(churn) = 0.05. Likelihoods: P(L | churn) = 0.70, P(L | no churn) = 0.15; P(T | churn) = 0.60, P(T | no churn) = 0.10; P(P | churn) = 0.40, P(P | no churn) = 0.03. A customer shows all three signals. What is the final posterior P(churn | L, T, P) using sequential Bayesian updating?`,
      walkthrough: [
        `Start: prior = 0.05, complement = 0.95.

**After signal L (login drop):**
$P(L) = 0.70 \\times 0.05 + 0.15 \\times 0.95 = 0.035 + 0.1425 = 0.1775$
$P(\\text{churn} \\mid L) = 0.035 / 0.1775 \\approx 0.197$

**After signal T (support ticket), using 0.197 as new prior:**
$P(T) = 0.60 \\times 0.197 + 0.10 \\times 0.803 = 0.1182 + 0.0803 = 0.1985$
$P(\\text{churn} \\mid L, T) = 0.1182 / 0.1985 \\approx 0.595$

**After signal P (late payment), using 0.595 as new prior:**
$P(P) = 0.40 \\times 0.595 + 0.03 \\times 0.405 = 0.238 + 0.01215 = 0.250$
$P(\\text{churn} \\mid L, T, P) = 0.238 / 0.250 = 0.952$

Three independent signals raise churn probability from 5% to 95.2%. The order of updating doesn't matter â€” the same posterior results regardless of which signal you process first (given independence).`,
      ],
    },
  ],

  python: {
    cells: [
      {
        id: 'py1',
        cellTitle: "Bayes' Theorem: Medical Test Calculator",
        prose: `Compute P(disease | positive) for any combination of prevalence, sensitivity, and specificity. Visualize how the posterior changes as prevalence increases.`,
        code: `import numpy as np
import matplotlib.pyplot as plt

def bayes_test(prior, sensitivity, specificity):
    """P(disease | positive test) via Bayes' Theorem."""
    fpr = 1 - specificity   # false positive rate
    p_pos = sensitivity * prior + fpr * (1 - prior)  # total P(positive)
    posterior = (sensitivity * prior) / p_pos
    return posterior, p_pos

# Standard scenario: 1% prevalence, 95% sensitivity, 90% specificity
prior, sens, spec = 0.01, 0.95, 0.90
post, p_pos = bayes_test(prior, sens, spec)

print(f"=== Medical Test Analysis ===")
print(f"Prevalence (prior P(D)):    {prior:.3f}")
print(f"Sensitivity P(+|D):         {sens:.3f}")
print(f"Specificity P(âˆ’|DÌ„):         {spec:.3f}")
print(f"False positive rate:         {1-spec:.3f}")
print(f"P(positive test overall):    {p_pos:.4f}")
print(f"P(Disease | Positive):       {post:.4f}  ({post*100:.1f}%)")

# 10,000 person table
n = 10000
n_disease = int(n * prior)
n_healthy = n - n_disease
tp = round(n_disease * sens)
fp = round(n_healthy * (1 - spec))
total_pos = tp + fp
ppv = tp / total_pos if total_pos > 0 else 0

print(f"\\n=== 10,000 People Tested ===")
print(f"  True  positives (TP): {tp:5d}")
print(f"  False positives (FP): {fp:5d}")
print(f"  Total positives:      {total_pos:5d}")
print(f"  PPV = {tp}/{total_pos} = {ppv:.4f}")

# Plot: posterior vs. prevalence
prevs = np.linspace(0.001, 0.50, 500)
posts = [bayes_test(p, sens, spec)[0] for p in prevs]

fig, axes = plt.subplots(1, 2, figsize=(12, 4))

axes[0].plot(prevs, posts, color='steelblue', lw=2)
axes[0].scatter([prior], [post], color='red', s=80, zorder=5, label=f'Current: {post:.3f}')
axes[0].set_xlabel('Prevalence (prior)')
axes[0].set_ylabel('P(Disease | Positive)')
axes[0].set_title('Posterior vs. Prevalence')
axes[0].legend()
axes[0].axhline(0.5, color='gray', linestyle='--', lw=1, alpha=0.6)

# TP vs FP bar
axes[1].bar(['True Positive', 'False Positive'], [tp, fp],
            color=['steelblue', 'coral'], alpha=0.85, edgecolor='white')
axes[1].set_title(f'Among {total_pos} Positive Tests (10,000 screened)')
axes[1].set_ylabel('Count')
for i, (name, val) in enumerate([('TP', tp), ('FP', fp)]):
    axes[1].text(i, val + 2, str(val), ha='center', fontsize=12, fontweight='bold')

plt.tight_layout()
plt.show()`,
      },
      {
        id: 'py2',
        cellTitle: 'Sequential Bayesian Updating: Spam Filter',
        prose: `Each new word in an email updates the spam probability. Watch how the posterior evolves as evidence accumulates â€” and how one non-spam word can pull the probability back down.`,
        code: `import numpy as np
import matplotlib.pyplot as plt

def bayes_update(prior, lk_H, lk_Hc):
    """Update P(H) given new evidence with likelihoods lk_H and lk_Hc."""
    p_E = lk_H * prior + lk_Hc * (1 - prior)
    return (lk_H * prior) / p_E if p_E > 0 else prior

# Prior: 30% of emails are spam
p_spam = 0.30

# Each tuple: (word, P(word|spam), P(word|ham))
observations = [
    ('WIN',     0.85, 0.03),
    ('FREE',    0.80, 0.05),
    ('Click',   0.40, 0.20),
    ('Hello',   0.10, 0.60),
    ('Urgent',  0.70, 0.08),
    ('Meeting', 0.15, 0.65),
]

history = [p_spam]
print(f"Step | {'Word':10} | P(spam) | Bayes Factor")
print("-" * 48)
print(f"  0  | {'(prior)':10} |  {p_spam:.4f} |    â€”")

for i, (word, lk_spam, lk_ham) in enumerate(observations, 1):
    bf = lk_spam / lk_ham
    p_spam = bayes_update(p_spam, lk_spam, lk_ham)
    history.append(p_spam)
    print(f"  {i}  | {word:10} |  {p_spam:.4f} | {bf:7.2f}x")

print(f"\\nFinal P(spam) = {history[-1]:.4f}")

fig, ax = plt.subplots(figsize=(9, 4))
steps = range(len(history))
words = ['Prior'] + [obs[0] for obs in observations]
ax.plot(steps, history, marker='o', markersize=8, color='steelblue', lw=2)
for i, (s, p, w) in enumerate(zip(steps, history, words)):
    ax.annotate(f'{w}\\n{p:.3f}', (s, p), textcoords='offset points',
                xytext=(0, 12), ha='center', fontsize=8)
ax.axhline(0.5, color='red', linestyle='--', lw=1, alpha=0.7, label='P=0.5 threshold')
ax.set_xlabel('Evidence observed (step)')
ax.set_ylabel('P(spam)')
ax.set_title('Sequential Bayesian Updating â€” Spam Filter')
ax.set_ylim(-0.05, 1.10)
ax.legend()
plt.tight_layout()
plt.show()`,
      },
      {
        id: 'py3',
        cellTitle: 'Bayes Factor and Odds Form',
        prose: `The odds form of Bayes' Theorem â€” posterior odds = Bayes factor Ã— prior odds â€” is often the most intuitive way to apply the theorem. This cell shows how Bayes factors from multiple independent tests combine multiplicatively.`,
        code: `import numpy as np
import matplotlib.pyplot as plt

def p_to_odds(p):
    return p / (1 - p)

def odds_to_p(odds):
    return odds / (1 + odds)

def bayes_factor(lk_H, lk_Hc):
    return lk_H / lk_Hc

# Disease test scenario: three independent tests on same patient
prior = 0.05  # 5% base rate

tests = [
    ('Test A (sens=0.90, spec=0.85)', 0.90, 0.15),
    ('Test B (sens=0.80, spec=0.95)', 0.80, 0.05),
    ('Test C (sens=0.70, spec=0.99)', 0.70, 0.01),
]

print(f"Prior: P(D) = {prior:.3f}  â†’  Prior odds = {p_to_odds(prior):.4f}")
print()
print(f"{'Test':<38} | {'BF':>8} | {'Post. Odds':>12} | {'Post. P':>10}")
print("-" * 75)

prior_odds = p_to_odds(prior)
posterior_odds = prior_odds
for name, lk_H, lk_Hc in tests:
    bf = bayes_factor(lk_H, lk_Hc)
    posterior_odds *= bf
    posterior_p = odds_to_p(posterior_odds)
    print(f"{name:<38} | {bf:>8.3f} | {posterior_odds:>12.4f} | {posterior_p:>10.4f}")

print(f"\\nFinal posterior P(D | all three positive): {odds_to_p(posterior_odds):.4f}")

# Bar chart: posterior after each test
priors_seq = [prior]
p_curr = prior
for name, lk_H, lk_Hc in tests:
    p_curr = odds_to_p(p_to_odds(p_curr) * bayes_factor(lk_H, lk_Hc))
    priors_seq.append(p_curr)

labels = ['Prior'] + [f'After\n{t[0][:6]}' for t in tests]
fig, ax = plt.subplots(figsize=(8, 4))
ax.bar(labels, priors_seq, color='steelblue', alpha=0.85, edgecolor='white')
for i, p in enumerate(priors_seq):
    ax.text(i, p + 0.01, f'{p:.3f}', ha='center', fontsize=10, fontweight='bold')
ax.set_ylabel('P(Disease)')
ax.set_title('Posterior Probability After Each Sequential Positive Test')
ax.set_ylim(0, min(1.1, max(priors_seq) + 0.1))
plt.tight_layout()
plt.show()`,
      },
    ],
  },

  quiz: [
    {
      type: 'choice',
      question: `What does the denominator P(E) represent in Bayes' Theorem?`,
      options: [
        `The prior probability of the hypothesis`,
        `The total probability of the evidence across all hypotheses`,
        `The sensitivity of the test`,
        `The likelihood ratio`,
      ],
      answer: `The total probability of the evidence across all hypotheses`,
      hints: [`P(E) = P(E|H)Â·P(H) + P(E|Há¶œ)Â·P(Há¶œ). It ensures the posterior sums to 1 across H and Há¶œ.`],
      reviewSection: 'intuition',
    },
    {
      type: 'choice',
      question: `Sensitivity is defined as:`,
      options: [
        `P(no disease | negative test)`,
        `P(positive test | disease present)`,
        `P(disease present | positive test)`,
        `P(negative test | disease present)`,
      ],
      answer: `P(positive test | disease present)`,
      hints: [`Sensitivity = true positive rate = P(test+ | disease). It measures how rarely the test misses the disease.`],
      reviewSection: 'intuition',
    },
    {
      type: 'choice',
      question: `A rare disease has 0.1% prevalence. With 99% sensitivity and 99% specificity, P(disease | positive) â‰ˆ:`,
      options: [`0.99`, `0.50`, `0.09`, `0.01`],
      answer: `0.09`,
      hints: [`P(+) = 0.99Ã—0.001 + 0.01Ã—0.999 = 0.000990 + 0.00999 = 0.01098. P(D|+) = 0.000990/0.01098 â‰ˆ 0.09.`],
      reviewSection: 'intuition',
    },
    {
      type: 'choice',
      question: `In sequential Bayesian updating, what becomes the new prior for the second update?`,
      options: [`The original prior`, `The likelihood`, `The posterior from the first update`, `The Bayes factor`],
      answer: `The posterior from the first update`,
      hints: [`Each observation: prior â†’ compute posterior â†’ that posterior becomes the next prior.`],
      reviewSection: 'intuition',
    },
    {
      type: 'choice',
      question: `P(E | H) = 0.60, P(E | Há¶œ) = 0.20. What is the Bayes factor?`,
      options: [`0.40`, `0.30`, `3.0`, `0.80`],
      answer: `3.0`,
      hints: [`Bayes factor = P(E | H) / P(E | Há¶œ) = 0.60 / 0.20 = 3. The evidence is 3Ã— more likely under H.`],
      reviewSection: 'math',
    },
    {
      type: 'choice',
      question: `P(H) = 0.10, P(E | H) = 0.80, P(E | Há¶œ) = 0.20. What is P(H | E)?`,
      options: [`0.10`, `0.267`, `0.308`, `0.80`],
      answer: `0.308`,
      hints: [`P(E) = 0.80Ã—0.10 + 0.20Ã—0.90 = 0.08 + 0.18 = 0.26. P(H|E) = 0.08/0.26 â‰ˆ 0.308.`],
      reviewSection: 'examples',
    },
    {
      type: 'choice',
      question: `A spam filter has P(spam) = 0.25. A word with Bayes factor = 4 is observed. What is P(spam | word)?`,
      options: [`0.57`, `0.50`, `0.75`, `0.25`],
      answer: `0.57`,
      hints: [`Prior odds = 0.25/0.75 = 1/3. Posterior odds = (1/3)Ã—4 = 4/3. P = (4/3)/(1+4/3) = 4/7 â‰ˆ 0.571.`],
      reviewSection: 'math',
    },
    {
      type: 'choice',
      question: `In 10,000 people: 100 have disease D, 9,900 do not. A test has sensitivity 0.90 and specificity 0.95. How many of the positive tests are false positives?`,
      options: [`90`, `495`, `405`, `9405`],
      answer: `495`,
      hints: [`False positives: 9,900 healthy people Ã— (1 âˆ’ specificity) = 9,900 Ã— 0.05 = 495.`],
      reviewSection: 'intuition',
    },
    {
      type: 'choice',
      question: `Which of these correctly explains why P(disease | positive test) can be low even with a highly sensitive test?`,
      options: [
        `Low sensitivity means many true positives are missed`,
        `Low base rate (prevalence) means false positives outnumber true positives`,
        `High specificity means the test is unreliable`,
        `The posterior probability is always equal to the prior`,
      ],
      answer: `Low base rate (prevalence) means false positives outnumber true positives`,
      hints: [`Even with a small false positive rate, many more healthy people exist than sick people when prevalence is low, generating more false alarms.`],
      reviewSection: 'intuition',
    },
    {
      type: 'choice',
      question: `P(spam) = 0.30. The word "FREE" triples the prior odds of spam. What is the new P(spam)?`,
      options: [`0.75`, `0.50`, `0.56`, `0.43`],
      answer: `0.56`,
      hints: [`Prior odds = 0.30/0.70 = 3/7. Triple to 9/7. P = (9/7)/(1 + 9/7) = 9/16 = 0.5625.`],
      reviewSection: 'math',
    },
  ],

  checkpoints: [
    { id: 'cp1', label: 'State the three inputs to Bayes\' Theorem (prior, likelihood, evidence)', type: 'recall' },
    { id: 'cp2', label: 'Run Python Cell 1: compute P(D|+) for 10% prevalence and observe the change', type: 'lab' },
    { id: 'cp3', label: 'Compute P(D | positive) for the disease example with prevalence = 0.20', type: 'application' },
    { id: 'cp4', label: 'Explain why a 1% prevalence disease gives mostly false positives even with an accurate test', type: 'concept' },
    { id: 'cp5', label: 'Define sensitivity and specificity using P(Â·|Â·) notation', type: 'recall' },
    { id: 'cp6', label: 'Pass the quiz with â‰¥ 80%', type: 'quiz' },
  ],

  definitions: [
    { term: "Bayes' Theorem", definition: "P(H|E) = P(E|H)Â·P(H) / P(E). Converts the likelihood P(E|H) into the posterior P(H|E) using the prior P(H).", symbol: null },
    { term: 'Prior probability', definition: 'P(H) â€” the probability of the hypothesis before observing evidence E.', symbol: 'P(H)' },
    { term: 'Posterior probability', definition: 'P(H|E) â€” the updated probability of the hypothesis after observing evidence E.', symbol: 'P(H|E)' },
    { term: 'Likelihood', definition: 'P(E|H) â€” the probability of the observed evidence assuming the hypothesis is true.', symbol: 'P(E|H)' },
    { term: 'Bayes factor', definition: 'P(E|H) / P(E|Há¶œ). Measures how much the evidence updates the odds. BF > 1 favors H; BF = 1 is uninformative.', symbol: null },
    { term: 'Sensitivity', definition: 'P(test positive | disease present). True positive rate. High sensitivity â†’ few missed cases.', symbol: null },
    { term: 'Specificity', definition: 'P(test negative | no disease). True negative rate. High specificity â†’ few false alarms.', symbol: null },
    { term: 'Positive Predictive Value (PPV)', definition: 'P(disease | test positive). What a positive result actually means for the patient â€” what Bayes\' Theorem computes.', symbol: 'PPV' },
  ],
};
