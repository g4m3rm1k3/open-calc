export default {
  id:'d-04',slug:'hypothesis-testing',track:'D',order:4,
  title:'Hypothesis Testing',subtitle:'Signal vs Noise',
  tags:['hypothesis','p-value','t-test','permutation','type-1-error','type-2-error'],
  prereqs:['d-02','d-03'],unlocks:['d-05'],
  hook:{question:'How do you tell a real effect from random chance?',realWorldContext:'Every A/B test, every clinical trial, every scientific claim relies on hypothesis testing. Misunderstanding p-values is one of the most widespread errors in science and industry. Getting this right matters.'},
  intuition:{
    prose:[
      'A hypothesis test asks: "If the null hypothesis is true (no effect, no difference), how likely is it to observe data at least as extreme as mine?" That probability is the **p-value**. A small p-value means the data would be surprising if there were no effect.',
      'p-value is NOT: "the probability the null is true," or "the probability my result is due to chance," or "the probability the effect is real." It is only: the probability of data this extreme or more extreme, IF the null were true.',
      'The **permutation test** builds the null distribution by randomly shuffling group labels and measuring the test statistic repeatedly. No distributional assumptions. Completely general. More computationally expensive but conceptually clear.',
    ],
    callouts:[{type:'important',title:'What p-value Actually Means',body:`p = P(observing data this extreme | null hypothesis is true)

Small p (e.g. < 0.05): the data is surprising under the null.
We reject the null — not because we proved the alternative,
but because the null is implausible given the data.

Large p: data is unsurprising under the null.
We fail to reject — not because the null is true,
but because we have insufficient evidence to reject it.`}],
    visualizations:[{id:'PythonNotebook',title:'Hypothesis Testing',props:{initialCells:[
      {id:1,cellTitle:'Stage 1 — Building the Null Distribution',
       prose:'A permutation test: shuffle labels, compute statistic, repeat. Build what "no effect" looks like.',
       instructions:'Run. The red line is the observed difference. The histogram is "no effect."',
       code:`from opencalc import Figure
import numpy as np
np.random.seed(42)
control = np.random.normal(50,10,30)
treatment = np.random.normal(55,10,30)
obs_diff = treatment.mean() - control.mean()
all_data = np.concatenate([control,treatment])
null_diffs = []
for _ in range(5000):
    np.random.shuffle(all_data)
    null_diffs.append(all_data[:30].mean() - all_data[30:].mean())
p_value = np.mean(np.abs(null_diffs) >= abs(obs_diff))
print(f"Observed difference: {obs_diff:.3f}")
print(f"p-value: {p_value:.4f}")`},
      {id:2,cellTitle:'Stage 2 — The t-Test',
       prose:'The parametric test — assumes normal distributions. Faster than permutation.',
       instructions:'Run. Compare the p-value to the permutation test.',
       code:`import numpy as np
from scipy import stats
np.random.seed(42)
control = np.random.normal(50,10,30)
treatment = np.random.normal(55,10,30)
t_stat, p_value = stats.ttest_ind(treatment, control)
print(f"t-statistic: {t_stat:.4f}")
print(f"p-value: {p_value:.4f}")
print(f"Conclusion: {'Reject null' if p_value<0.05 else 'Fail to reject null'}")`},
      {id:3,cellTitle:'Stage 3 — Type I and Type II Errors',
       prose:'False positives (Type I) and false negatives (Type II).',
       instructions:'Run. With α=0.05, we expect 5% false positives when there is truly no effect.',
       code:`import numpy as np
from scipy import stats
np.random.seed(42)
# Simulate Type I error rate
false_positives = 0
for _ in range(1000):
    a = np.random.normal(0,1,30)  # same distribution
    b = np.random.normal(0,1,30)  # no real difference
    _,p = stats.ttest_ind(a,b)
    if p < 0.05:
        false_positives += 1
print(f"False positive rate: {false_positives/1000:.3f} (expect ~0.05)")`},
      {id:4,cellTitle:'Stage 4 — Multiple Testing Problem',
       prose:'Testing 20 things at p<0.05 expects 1 false positive by chance.',
       instructions:'Run. Without correction, spurious findings accumulate.',
       code:`import numpy as np
from scipy import stats
np.random.seed(42)
# 20 tests, no real effects
pvalues = [stats.ttest_ind(np.random.normal(0,1,30),np.random.normal(0,1,30))[1]
           for _ in range(20)]
print(f"Significant (p<0.05): {sum(p<0.05 for p in pvalues)} out of 20")
print(f"Expected by chance: 1")
print("\\nBonferroni correction threshold:", 0.05/20)`},
      {id:11,challengeType:'write',challengeNumber:1,challengeTitle:'Challenge 1 — A/B Test',
       difficulty:'hard',
       prompt:'Run an A/B test on conversion rates. Group A: 1000 visitors, 52 conversions. Group B: 1000 visitors, 68 conversions. Use a two-proportion z-test. Store p_value and is_significant (True if p<0.05).',
       instructions:`1. Compute proportions pA and pB. 2. Use stats.proportions_ztest or implement the z-test. 3. Store p_value and is_significant.`,
       code:`from scipy import stats
import numpy as np
nA, convA = 1000, 52
nB, convB = 1000, 68
p_value = 
is_significant = 
print(f"Conversion A: {convA/nA:.3f}, B: {convB/nB:.3f}")
print(f"p-value: {p_value:.4f}, significant: {is_significant}")
`,
       testCode:`
from scipy import stats
import numpy as np
count=np.array([68,52]);nobs=np.array([1000,1000])
_,ep=stats.proportions_ztest(count,nobs)
if abs(p_value-ep)>0.01: raise ValueError(f"p_value should be ~{ep:.4f}, got {p_value:.4f}")
if is_significant!=(p_value<0.05): raise ValueError(f"is_significant should be {p_value<0.05}")
res=f"SUCCESS: p={p_value:.4f}, significant={is_significant}. B's higher rate {'IS' if is_significant else 'is NOT'} statistically significant."
res
`,hint:`from scipy.stats import proportions_ztest
count=np.array([convB,convA]);nobs=np.array([nB,nA])
_,p_value=proportions_ztest(count,nobs)
is_significant=p_value<0.05`},
    ]}}],
  },
  mentalModel:[
    `p-value = P(data this extreme | null is true). Not P(null is true).`,
    `Small p → reject null. Large p → fail to reject null (not same as accepting it).`,
    `Permutation test: shuffle labels, compute statistic, repeat — builds null distribution.`,
    `Type I error (false positive): rejecting null when it is true. Rate = α (usually 0.05).`,
    `Multiple testing: 20 tests at p<0.05 expects 1 false positive. Use Bonferroni correction.`,
  ],
  quiz: [
    {
      id: 'q1',
      type: 'choice',
      text: 'A study reports p = 0.03. Which interpretation is correct?',
      options: [
        'There is a 3% chance the null hypothesis is true',
        'If the null hypothesis were true, there is a 3% probability of observing data this extreme or more extreme by chance — it does not tell you the probability the null is true, only how surprising your data would be if it were',
        'The effect has a 97% probability of being a real finding',
      ],
      correct: 1,
    },
    {
      id: 'q2',
      type: 'choice',
      text: 'A Type I error is a false positive (rejecting the null when it is true). If α = 0.05, what does this mean?',
      options: [
        'Only 5% of experiments will produce results',
        'When there is truly no effect, you will falsely conclude there is an effect 5% of the time — α is the false positive rate you accept; lower α means fewer false positives but also requires stronger evidence to detect real effects',
        'Your test is 95% accurate in all cases',
      ],
      correct: 1,
    },
    {
      id: 'q3',
      type: 'choice',
      text: 'A permutation test and a t-test both give the same conclusion. What advantage does the permutation test have?',
      options: [
        'Permutation tests are always more powerful (detect smaller effects)',
        'Permutation tests make no distributional assumptions — the t-test assumes approximately normal distributions in each group; the permutation test builds the null distribution empirically from the data itself, making it valid for any distribution including heavily skewed or non-normal data',
        'Permutation tests run faster because they avoid complex calculations',
      ],
      correct: 1,
    },
    {
      id: 'q4',
      type: 'choice',
      text: 'A researcher runs 100 independent hypothesis tests on random noise data with α = 0.05. How many false positives should they expect?',
      options: [
        'Zero — if all null hypotheses are true, no test should be significant',
        'About 5 — with α = 0.05, each test has a 5% chance of false positive; across 100 independent tests, the expected number of false positives is 100 × 0.05 = 5, which is why multiple testing correction (Bonferroni: α/n) is necessary',
        'About 50 — most results will be false positives without enough data',
      ],
      correct: 1,
    },
  ],
}
