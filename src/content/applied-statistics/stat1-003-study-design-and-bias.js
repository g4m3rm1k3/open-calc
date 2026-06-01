export default {
  id: 'stat1-003',
  slug: 'study-design-and-bias',
  chapter: 'stat1',
  order: 3,
  title: 'Study Design and Bias',
  subtitle: 'Observational studies vs. experiments, and every way data collection can go wrong.',
  tags: ['study design', 'observational study', 'experiment', 'bias', 'confounding', 'randomization', 'blinding'],
  aliases: 'observational study experimental design confounding variable randomized controlled trial selection bias response bias measurement bias',
  timeToComplete: 30,
  coreConcept: 'An experiment with random assignment supports causal conclusions. An observational study supports only associational conclusions. Bias is any systematic tendency of a study to produce estimates that are consistently too high or too low — and unlike random error, collecting more data does not fix it.',
  prerequisites: ['stat1-001', 'stat1-002'],
  nextLesson: 'stat2-001',

  hook: {
    question: 'Coffee drinkers live longer on average — does that mean coffee causes longevity?',
    realWorldContext: 'Dozens of observational studies show that moderate coffee drinkers have lower rates of type 2 diabetes, heart disease, and all-cause mortality than non-drinkers. But coffee drinkers also differ from non-drinkers in dozens of other ways: they tend to be more socially active, have more regular work schedules, and are less likely to smoke (in recent data). Any of these factors — not the coffee itself — could explain the longevity difference. This is the confounding problem: two things move together, and you cannot tell which one is doing the work. The only way to cleanly answer "does X cause Y?" is to run a randomized experiment — randomly assign half the participants to drink coffee, half to drink a placebo, and compare. For obvious ethical and practical reasons, such an experiment has never been run at scale. So we are left with the observational evidence and its limits.',
  },

  intuition: {
    prose: [
      '**Roadmap for this lesson.** Your target is simple: when you read a study claim, you should be able to say what type of study it is, whether causal language is justified, and which bias is most likely to break the conclusion.',
      '**Two fundamental types of study.** Every data collection effort is either an experiment or an observational study. The distinction is not about how carefully you collect data — it is about whether you control the assignment to conditions.',
      '**Observational study:** you observe and record what happens without intervening. Who gets treatment A and who gets treatment B is decided by nature, history, or personal choice — not by the researcher. Examples: tracking smokers and non-smokers over 20 years to see who develops cancer (cohort study); interviewing lung cancer patients to see how many were smokers (case-control study); taking a survey snapshot of the population at one moment in time (cross-sectional study). Because subjects self-select into groups, the groups differ in many ways beyond the variable of interest.',
      '**Experiment:** the researcher randomly assigns subjects to conditions (treatment vs. control, drug A vs. drug B, new ad vs. old ad). Because assignment is random, the treatment and control groups are expected to be similar on all other variables — both the ones you measured and the ones you did not. This is why randomization is so powerful: it controls for confounders you did not even think to measure.',
      '**Before reading on, predict:** A company tests a new website design by showing it to everyone who visits on Tuesday and the old design to everyone who visits on Wednesday. They find Tuesday visitors convert at a higher rate. Is this a valid experiment? Why or why not? Write your prediction.',
      '**Confounding.** A confounding variable is associated with both the exposure (the variable you are studying) and the outcome. If you ignore it, your estimate of the exposure-outcome relationship is wrong. In the Tuesday/Wednesday website test: Tuesday and Wednesday visitors are different people with different behaviors (Tuesday might have more business users, Wednesday more casual browsers). The day of week confounds the website-conversion relationship. To remove this confound, randomly assign each individual visitor to old or new design — independent of when they visit.',
      '**Bias types: four categories.** Unlike random error (which averages out with more data), bias is a systematic error that more data only amplifies.\n\n**Selection bias:** the sample systematically differs from the target population on characteristics related to the outcome. Examples: healthy workers bias (only healthy enough people remain employed, so worker health studies underestimate disease rates); survivor bias (studying successful companies to learn what makes companies succeed, ignoring the failed companies that had the same practices).\n\n**Response/Non-response bias:** people who respond to a survey differ systematically from those who do not (non-response bias), or they answer questions inaccurately (response bias). Income surveys underestimate high incomes (social desirability). Drug use surveys underestimate usage (stigma). Physical health surveys overestimate exercise frequency (recall and social desirability).\n\n**Measurement bias:** the instrument or procedure systematically records values that are too high or too low. A miscalibrated scale reads 2 kg heavy. A blood pressure cuff that is too small gives artificially high readings. A leading question ("Don\'t you agree that...?") inflates agreement rates.\n\n**Confounding bias:** an unmeasured or uncontrolled variable causes both the exposure and the outcome, creating a spurious association. Randomization eliminates confounding in experiments. In observational studies, you can only control for confounders you measured and adjusted for — unmeasured confounders remain a threat.',
      '**Blinding removes response and measurement bias.** In a blinded study, participants do not know which treatment they received (single blind), preventing the placebo effect from distorting self-reported outcomes. In a double-blind study, neither participants nor the outcome assessors know the assignment — preventing assessors from unconsciously recording better outcomes for the treatment group. The gold standard for evaluating medical treatments is the double-blind randomized controlled trial (RCT) precisely because it eliminates both confounding (randomization) and placebo/assessment bias (blinding).',
      '**Internal vs. external validity.** Internal validity: does the study design allow valid causal conclusions within the study population? Random assignment maximizes internal validity. External validity (generalizability): do the conclusions apply beyond the study sample to the broader target population? A highly controlled lab experiment with strong internal validity may have low external validity if the lab conditions bear little resemblance to real-world use. Both matter — but they trade off against each other.',
    ],
    callouts: [
      {
        type: 'procedure',
        title: 'Procedure: Evaluate a Study Design',
        body: 'Step 1. Was there random assignment to conditions? If yes → experiment → causal conclusions are supported. If no → observational → only associational conclusions are valid.\n\nStep 2. List plausible confounders: variables associated with both the exposure and the outcome. For each, ask: was it controlled by randomization, matching, or statistical adjustment?\n\nStep 3. Identify the sampling method (stat1-002). Was the sample a probability sample? If not, generalizability is limited.\n\nStep 4. Check for each bias type: selection (who got included?), response (who answered? accurately?), measurement (how was the outcome recorded?), confounding (what else could explain the result?).\n\nStep 5. State the appropriate conclusion: "X is associated with Y, controlling for Z and W" (observational) OR "X causes a change in Y (in this population, under these conditions)" (experiment).',
      },
      {
        type: 'insight',
        title: 'Correlation vs. Causation — The Standard Warning',
        body: 'Association (correlation) is symmetric: if A is associated with B, then B is associated with A. Causation is asymmetric: A → B does not imply B → A.\n\nThree conditions are required to infer causation:\n1. **Association:** A and B are statistically correlated.\n2. **Temporal precedence:** A preceded B in time.\n3. **Elimination of confounders:** no plausible third variable explains the A-B correlation.\n\nObservational studies can establish (1) and sometimes (2), but condition (3) requires either randomization or implausibly complete measurement and adjustment of all confounders.',
      },
      {
        type: 'warning',
        title: 'Bias vs. Variance — A Critical Distinction',
        body: 'Random error (variance): your estimates scatter around the true value. More data makes them cluster more tightly — the error averages out.\n\nBias: your estimates are consistently shifted in one direction. More data makes them converge on the wrong value — it does not average out.\n\nThis is why a large biased sample is worse than a small unbiased one for making correct inferences. A miscalibrated scale that reads 2 kg heavy will still read 2 kg heavy after 10,000 measurements. Calibrate the instrument; do not collect more data.',
      },
      {
        type: 'insight',
        title: 'Types of Observational Studies',
        body: '**Cross-sectional:** measure exposure and outcome at the same point in time. Fast and cheap. Cannot establish temporal precedence (you don\'t know what came first).\n\n**Cohort study:** follow a group over time, comparing outcomes between exposed and unexposed. Can establish temporal precedence. Expensive and slow for rare outcomes.\n\n**Case-control study:** start with people who have the outcome (cases) and people who don\'t (controls), then look backwards at exposure. Efficient for rare diseases. Susceptible to recall bias.\n\n**Randomized Controlled Trial (RCT):** assigns participants randomly to treatment and control. Gold standard for causal inference. Often not feasible for ethical or practical reasons.',
      },
    ],
    visualizations: [
      {
        id: 'stat1-003-viz-1',
        title: 'Causal decision flow: observational vs experiment',
        type: 'flowchart',
        purpose: 'Gives a repeatable decision process for choosing causal vs associational wording.',
        misconceptionAddressed: 'Any strong correlation can be written as a causal claim.',
        invariant: 'Without random assignment (or strong causal identification), conclusions must remain associational.',
      },
      {
        id: 'stat1-003-viz-2',
        title: 'Bias map by study pipeline stage',
        type: 'diagram',
        purpose: 'Shows where each bias enters: who gets in, who responds, how outcomes are measured, and what confounds remain.',
        misconceptionAddressed: 'Bias is one generic error instead of multiple distinct failure modes.',
        invariant: 'More data reduces variance, but it does not remove systematic bias introduced upstream.',
      },
    ],
  },

  math: {
    prose: [
      '**Bias formally.** Let $\\hat{\\theta}$ be an estimator of population parameter $\\theta$. The bias of $\\hat{\\theta}$ is $\\text{Bias}(\\hat{\\theta}) = E[\\hat{\\theta}] - \\theta$. A positive bias means the estimator systematically overestimates; a negative bias means it systematically underestimates. The mean squared error decomposes as: $\\text{MSE}(\\hat{\\theta}) = \\text{Var}(\\hat{\\theta}) + [\\text{Bias}(\\hat{\\theta})]^2$. In study design, a small-variance biased estimator can have worse MSE than a larger-variance unbiased estimator — "precise but inaccurate" loses to "noisy but on target" when the bias is large.',
      '**Confounding and Simpson\'s Paradox.** Confounding can reverse the apparent direction of a relationship. Let $Z$ be a confounder, $X$ the exposure, $Y$ the outcome. Marginally (ignoring $Z$), $P(Y=1|X=1) > P(Y=1|X=0)$ — it looks like $X$ increases $Y$. But within each level of $Z$, $P(Y=1|X=1,Z=z) < P(Y=1|X=0,Z=z)$ — conditioning on $Z$ reverses the relationship. This is Simpson\'s Paradox. It occurs when $Z$ is associated with both $X$ and $Y$ and the groups have very different proportions of each $Z$ level.',
      '**Randomization as confounder control.** In a randomized experiment, treatment assignment $T \\in \\{0,1\\}$ is independent of all baseline covariates $\\mathbf{X}$ by design: $T \\perp\\!\\!\\!\\perp \\mathbf{X}$. Therefore, the naive comparison $E[Y|T=1] - E[Y|T=0]$ is an unbiased estimator of the average treatment effect $E[Y(1)] - E[Y(0)]$, where $Y(t)$ is the potential outcome under treatment $t$. In an observational study, $T \\not\\perp\\!\\!\\!\\perp \\mathbf{X}$, so the naive comparison is confounded unless you condition on $\\mathbf{X}$ — and only if $\\mathbf{X}$ includes all confounders.',
    ],
  },

  rigor: {
    prose: [
      '**R1 — The Rubin Causal Model.** The potential outcomes framework defines causality rigorously. For each unit $i$, there are two potential outcomes: $Y_i(1)$ (outcome if treated) and $Y_i(0)$ (outcome if not treated). The individual treatment effect is $\\tau_i = Y_i(1) - Y_i(0)$. The fundamental problem of causal inference (Holland, 1986): only one potential outcome is ever observed — the one corresponding to the actual treatment received. The other is the counterfactual and is permanently unobservable. The average treatment effect $\\text{ATE} = E[\\tau_i] = E[Y(1)] - E[Y(0)]$ is estimable from an RCT because randomization ensures $E[Y(1)] = E[Y|T=1]$ and $E[Y(0)] = E[Y|T=0]$.',
      '**R2 — Ignorability and the observational study assumption.** In an observational study, valid causal estimation requires the "strong ignorability" assumption: $(Y(0), Y(1)) \\perp\\!\\!\\!\\perp T \\mid \\mathbf{X}$. This says: conditional on the observed covariates $\\mathbf{X}$, treatment assignment is as-good-as-random. This is an untestable assumption from the data alone. If there are unmeasured confounders (variables in the data-generating process for $T$ that affect $Y$ but are not in $\\mathbf{X}$), ignorability fails and the causal estimate is biased — regardless of how sophisticated the statistical adjustment is.',
      '**R3 — External validity and SUTVA.** The Stable Unit Treatment Value Assumption (SUTVA) requires: (1) no interference (one unit\'s treatment does not affect another\'s outcome) and (2) no hidden versions of treatment (everyone who receives "treatment" receives the same thing). Violations are common: vaccine trials violate SUTVA when herd immunity is present (your vaccination status affects my outcome). Externally valid conclusions require that the study population resembles the target population and that SUTVA holds — both require careful study design.',
    ],
    visualizations: [],
  },

  python: {
    cells: [
      {
        id: 'stat1-003-cell-1',
        type: 'python',
        cellTitle: 'Simulate confounding: lurking variable distorts a relationship',
        code: `import random
random.seed(42)

# Scenario: "Does ice cream cause drowning?"
# True cause of both: summer (temperature)
# n = 100 days

temperature = [random.uniform(50, 100) for _ in range(100)]  # degrees F

# Ice cream sales: driven by temperature + noise
ice_cream = [0.8 * t + random.gauss(0, 5) for t in temperature]

# Drowning incidents: driven by temperature + noise (more swimming in heat)
drowning = [0.05 * t + random.gauss(0, 1.5) for t in temperature]
drowning = [max(0, round(d)) for d in drowning]  # non-negative counts

# Compute naive correlation between ice cream and drowning
n = len(temperature)
xbar = sum(ice_cream)/n
ybar = sum(drowning)/n
sx = (sum((x-xbar)**2 for x in ice_cream)/(n-1))**0.5
sy = (sum((y-ybar)**2 for y in drowning)/(n-1))**0.5
r = sum((x-xbar)*(y-ybar) for x,y in zip(ice_cream,drowning)) / ((n-1)*sx*sy)

print(f"Correlation(ice cream, drowning) = {r:.3f}  ← looks strong!")
print("But this is entirely explained by temperature (confounding variable).")
print()
print("If you only observe ice cream vs. drowning, you see a real correlation.")
print("But there is NO causal link — temperature drives both.")
print("Conclusion: correlation ≠ causation when a lurking variable is present.")
`,
        instructions: 'The correlation is strong (~0.8) even though ice cream has zero direct effect on drowning. To detect confounding in a real study, you would need to hold temperature constant (control for it) or use random assignment. This is why observational data alone cannot establish causation.',
      },
      {
        id: 'stat1-003-cell-2',
        type: 'python',
        cellTitle: 'Simulate a randomized experiment — eliminate confounding',
        code: `import random
random.seed(99)

# Drug trial: does Drug X reduce blood pressure?
# True effect: Drug X reduces BP by 8 points on average
# Confound if not randomized: older patients tend to have higher BP AND get drug more

n = 100
ages = [random.randint(30, 80) for _ in range(n)]
baseline_bp = [100 + 0.5 * age + random.gauss(0, 8) for age in ages]

# --- Observational (biased) assignment: older → more likely to get drug
def assign_biased(age):
    prob = (age - 30) / 50  # older = higher probability of getting drug
    return 1 if random.random() < prob else 0

treated_obs  = [assign_biased(a) for a in ages]

# --- Randomized assignment: 50/50 coin flip
treated_rand = [1 if random.random() < 0.5 else 0 for _ in ages]

def estimate_effect(treated, bp_baseline):
    treated_bp  = [bp + (-8 + random.gauss(0,3)) for bp, t in zip(bp_baseline, treated) if t==1]
    control_bp  = [bp               for bp, t in zip(bp_baseline, treated) if t==0]
    if not treated_bp or not control_bp:
        return None
    return sum(treated_bp)/len(treated_bp) - sum(control_bp)/len(control_bp)

random.seed(99)
biased_est   = estimate_effect(treated_obs, baseline_bp)
random.seed(99)
random_est   = estimate_effect(treated_rand, baseline_bp)

print(f"True treatment effect:         -8.0 points")
print(f"Biased (observational) estimate: {biased_est:.1f} points  ← confounded by age")
print(f"Randomized experiment estimate:  {random_est:.1f} points  ← close to truth")
`,
        instructions: 'The observational estimate is distorted by age (older patients both receive the drug more AND have higher baseline BP). Random assignment breaks this link — the treated and control groups have similar age distributions by chance, so the estimate is close to the true −8 point effect.',
      },
    ],
  },

  examples: [
    {
      id: 'stat1-003-ex1',
      title: 'Identify study type and appropriate conclusion',
      difficulty: 'easy',
      problem: 'Researchers track 10,000 adults for 15 years. They record coffee consumption at baseline and track cardiovascular events. Coffee drinkers have 20% fewer heart attacks than non-drinkers. (a) What type of study is this? (b) What conclusion is valid? (c) What is the key limitation?',
      steps: [
        { expression: '\\text{Prospective cohort study — observational}', annotation: 'A group (cohort) is followed forward in time. Researchers observe but do not assign coffee consumption. No random assignment → observational study.', strategyTitle: 'Step 1: Identify study type' },
        { expression: '\\text{Valid: "Coffee consumption is associated with a 20\\% lower rate of heart attacks in this cohort."}', annotation: 'Associational language is correct: "associated with," not "causes." We observed a correlation, not a causal effect.', strategyTitle: 'Step 2: Valid conclusion' },
        { expression: '\\text{Limitation: unmeasured confounders. Coffee drinkers may also exercise more, smoke less, etc.}', annotation: 'The key limitation of all observational studies: variables not measured or adjusted for could explain the association. The study cannot establish causality — only that coffee drinking and lower heart attack rates co-occur.', strategyTitle: 'Step 3: Key limitation' },
      ],
    },
    {
      id: 'stat1-003-ex2',
      title: 'Identify and fix a confounded comparison',
      difficulty: 'medium',
      problem: 'A company compares sales performance between employees who attended a 2-day training program and those who did not. Trained employees sell 15% more on average. HR concludes "the training causes a 15% sales improvement." Identify the flaw and propose a valid study design.',
      steps: [
        { expression: '\\text{Flaw: self-selection confounding}', annotation: 'Employees who choose to attend training (or are selected for it) likely differ from non-attendees in motivation, tenure, ability, or manager support. Any of these could explain higher sales, independent of the training itself.', strategyTitle: 'Step 1: Identify the confounder' },
        { expression: '\\text{Valid conclusion: "Employees who attended training sold 15\\% more than those who did not."}', annotation: 'This is a descriptive associational claim. It does not imply causation. The training group and comparison group are not comparable on baseline characteristics.', strategyTitle: 'Step 2: Correct language' },
        { expression: '\\text{Valid design: randomly assign eligible employees to training vs. waitlist control}', annotation: 'Randomization makes the two groups comparable at baseline. Any difference in sales after the training period can then be attributed to the training itself — not to pre-existing differences between groups.', strategyTitle: 'Step 3: Propose valid design' },
      ],
    },
    {
      id: 'stat1-003-ex3',
      title: 'Simpson\'s Paradox — a reversal by confounding',
      difficulty: 'hard',
      problem: 'Hospital A treats 800 patients: 600 are low-risk, 200 are high-risk. Hospital A\'s overall survival rate is 85%. Hospital B treats 1,000 patients: 200 are low-risk, 800 are high-risk. Hospital B\'s overall survival rate is 75%. A health reporter concludes "Hospital A is better." But: Low-risk patients in Hospital A survive at 90%; in Hospital B, also 90%. High-risk patients: Hospital A 70%, Hospital B 72%. Explain the paradox.',
      steps: [
        { expression: '\\text{Hospital A overall: } \\frac{600(0.90) + 200(0.70)}{800} = \\frac{540+140}{800} = \\frac{680}{800} = 85\\%', annotation: 'Hospital A treats mostly low-risk patients (600/800 = 75%). Their high survival rate is driven by case mix, not quality.', strategyTitle: 'Step 1: Verify Hospital A' },
        { expression: '\\text{Hospital B overall: } \\frac{200(0.90) + 800(0.72)}{1000} = \\frac{180+576}{1000} = \\frac{756}{1000} = 75.6\\%', annotation: 'Hospital B treats mostly high-risk patients (800/1000 = 80%). Within each risk group, Hospital B matches or beats Hospital A.', strategyTitle: 'Step 2: Verify Hospital B' },
        { expression: '\\text{Within each stratum: } \\underbrace{90\\% = 90\\%}_{\\text{low-risk}} \\text{ and } \\underbrace{70\\% < 72\\%}_{\\text{high-risk, B is better}}', annotation: 'Within both risk groups, Hospital B is at least as good. The aggregate comparison is misleading because patient risk level (the confounder) is distributed very differently across hospitals.', strategyTitle: 'Step 3: The reversal explained' },
        { expression: '\\text{Correct comparison: control for patient risk level}', annotation: 'This is Simpson\'s Paradox in action. The confounder (risk level) is associated with both hospital choice (high-risk patients go to specialized centers) and outcome (higher risk → lower survival). Always condition on relevant confounders before comparing groups.', strategyTitle: 'Step 4: Resolution' },
      ],
    },
  ],

  challenges: [
    {
      id: 'stat1-003-ch1',
      title: 'Design a valid A/B test',
      difficulty: 'medium',
      problem: 'A mobile app company wants to test whether a new onboarding flow (version B) increases 7-day retention compared to the current flow (version A). They have 50,000 new users per week. Design a valid experiment: state the unit of randomization, how to assign users, what the outcome is, and what conclusion is valid if B\'s 7-day retention is 2 percentage points higher.',
      walkthrough: [
        { expression: '\\text{Unit of randomization: individual user (not day-of-week or device type)}', annotation: 'Randomize at the user level so that each new user is independently assigned to A or B with probability 0.5. This prevents day-of-week confounding (which would occur if you showed A on Monday and B on Tuesday).' },
        { expression: 'P(T=B) = 0.50 \\text{ for each user, independent of all other users}', annotation: 'Each new user is assigned to version B with 50% probability using a random number draw. This is the random assignment that creates comparable groups.' },
        { expression: '\\text{Outcome: } Y_i = \\mathbf{1}[\\text{user } i \\text{ opens the app on day 7}]', annotation: '7-day retention is a binary outcome (returned or not on day 7). Measure this for every user in both groups over the same 1-week period.' },
        { expression: '\\hat{\\Delta} = \\bar{Y}_B - \\bar{Y}_A = 0.02 \\Rightarrow \\text{"Version B causes a 2pp increase in 7-day retention"}', annotation: 'Because assignment was random, the 2 percentage point difference is attributable to the onboarding flow, not to pre-existing user differences. This is a valid causal claim within the study population.' },
      ],
      answer: 'Randomize at the user level with 50/50 split. Measure 7-day binary retention for both groups simultaneously. A 2pp difference under random assignment is a valid causal estimate of the effect of onboarding B on retention.',
    },
    {
      id: 'stat1-003-ch2',
      title: 'Classify biases in a published study',
      difficulty: 'medium',
      problem: 'A survey asks 500 adults about their weekly exercise habits and self-reported health. The survey is distributed via a fitness app. Participants also self-report hours of exercise. Identify at least three distinct sources of bias, classify each (selection/response/measurement/confounding), and explain which direction each bias pushes the estimates.',
      walkthrough: [
        { expression: '\\text{1. Selection bias: fitness app users ≠ general population}', annotation: 'People who use a fitness app are more health-conscious and more physically active than the general adult population. The sample overrepresents active, health-seeking individuals. This pushes the estimated average exercise hours upward relative to the true population average.' },
        { expression: '\\text{2. Response bias (social desirability): self-reported exercise is overstated}', annotation: 'When people self-report exercise hours, they tend to round up (reporting 4 hours when they actually did 3) because exercise is socially desirable. This also pushes measured exercise hours upward.' },
        { expression: '\\text{3. Confounding: health-conscious people both exercise more AND eat better, sleep better, etc.}', annotation: 'If the study concludes "exercise causes better health," the conclusion is confounded: health-conscious lifestyle (diet, sleep, stress management) is associated with both exercise frequency and health outcomes. The exercise-health correlation may partly reflect this broader lifestyle difference.' },
        { expression: '\\text{Overall direction of bias: exercise-health correlation is likely overestimated}', annotation: 'All three biases point in the same direction: the sample exercises more than the general population, reports even more than they actually do, and is healthier for confounded reasons. The study overstates how much and how strongly exercise predicts health in the general population.' },
      ],
      answer: 'Three biases: (1) selection — app users are not representative, exercise hours overestimated; (2) response — social desirability inflates self-reported exercise; (3) confounding — overall healthy lifestyle explains both exercise and health outcomes.',
    },
    {
      id: 'stat1-003-ch3',
      title: 'Assess internal and external validity',
      difficulty: 'hard',
      problem: 'A randomized controlled trial tests a new anxiety treatment. 200 patients with severe anxiety disorder at a single academic medical center are randomly assigned to the new treatment (n=100) or standard care (n=100). At 12 weeks, the treatment group shows a 30-point reduction in anxiety scores vs. 15-point reduction in the control group. (a) Is internal validity strong? (b) Is external validity strong? (c) What populations and settings can this conclusion be generalized to?',
      walkthrough: [
        { expression: '\\text{Internal validity: strong — random assignment, controlled setting}', annotation: 'Random assignment of 200 patients to treatment and control ensures the two groups are comparable at baseline. The 15-point difference in improvement is attributable to the treatment, not to baseline differences. Internal validity is strong.' },
        { expression: '\\text{External validity: limited — single center, severe anxiety, academic medical setting}', annotation: 'The study population: patients with severe anxiety disorder at one academic medical center. This excludes mild/moderate anxiety, patients who would not seek treatment at an academic center, patients with comorbidities that lead to exclusion, and patients in different healthcare systems.' },
        { expression: '\\text{Generalize to: adults with severe anxiety disorder in similar academic settings who resemble the enrolled patients}', annotation: 'The finding "this treatment reduces anxiety by 15 points more than standard care, in patients with severe anxiety at an academic medical center over 12 weeks" is the valid generalized claim. Further generalization requires replication in community settings, different severity levels, and diverse populations.' },
      ],
      answer: 'Strong internal validity (random assignment). Limited external validity: results apply to patients with severe anxiety at academic medical centers. Generalization to other settings and severity levels requires additional studies.',
    },
  ],

  semantics: {
    core: [
      { symbol: '\\text{Bias}(\\hat{\\theta})', meaning: 'Systematic error in estimation: E[θ̂] − θ. Positive = overestimation, negative = underestimation. More data does not fix bias.' },
      { symbol: 'T \\perp\\!\\!\\!\\perp \\mathbf{X}', meaning: 'Treatment assignment is independent of all covariates — guaranteed by randomization in an experiment' },
      { symbol: 'Y_i(t)', meaning: 'Potential outcome for unit i under treatment t — the outcome that would be observed if unit i were assigned to condition t' },
      { symbol: '\\text{ATE}', meaning: 'Average Treatment Effect: E[Y(1) − Y(0)] — the expected causal effect of treatment across the population' },
      { symbol: '\\rho_{XY \\cdot Z}', meaning: 'Partial correlation between X and Y after controlling for confounder Z — the association remaining after adjustment' },
    ],
    rulesOfThumb: [
      'Random assignment → causal conclusions valid. No random assignment → associational conclusions only.',
      'Bias does not average out with more data; variance does. More data fixes imprecision, not inaccuracy.',
      'Always ask: "Who was left out?" (selection bias), "Did they answer honestly?" (response bias), "Was the measure accurate?" (measurement bias), "What else could explain this?" (confounding).',
      'Simpson\'s Paradox: aggregate comparisons can reverse when a confounder is distributed differently across groups — always condition on relevant variables.',
      'Internal validity (causality) and external validity (generalizability) are separate dimensions — high internal validity does not imply high external validity.',
    ],
  },

  spiral: {
    recoveryPoints: [],
    futureLinks: [
      { lessonId: 'stat6-001', label: 'Inferential Statistics', note: 'Confidence intervals and hypothesis tests assume no bias — they measure precision, not accuracy. A biased study with perfect precision is worse than an imprecise unbiased one.' },
      { lessonId: 'stat7-001', label: 'Chi-square Tests', note: 'Chi-square tests for independence in contingency tables are one way to detect and quantify confounding in observational studies.' },
      { lessonId: 'stat8-001', label: 'Linear Regression', note: 'Multiple regression is used to "control for" confounders in observational studies by including them as covariates — though this only works for measured confounders.' },
    ],
  },

  checkpoints: [
    { id: 'cp-stat1-003-1', label: 'Read: distinguish observational study vs. experiment with one example each', type: 'read' },
    { id: 'cp-stat1-003-2', label: 'Read: define confounding and explain why it prevents causal conclusions', type: 'read' },
    { id: 'cp-stat1-003-3', label: 'Read: name the four bias types and give one example of each', type: 'read' },
    { id: 'cp-stat1-003-4', label: 'Apply the evaluation procedure to example 2 before reading the solution', type: 'example' },
    { id: 'cp-stat1-003-5', label: 'Complete example 3: trace through Simpson\'s Paradox arithmetic step by step', type: 'example' },
    { id: 'cp-stat1-003-6', label: 'Attempt challenge 2: identify all three bias types in the fitness app survey', type: 'challenge' },
    { id: 'cp-stat1-003-7', label: 'Read: explain the difference between bias and variance using the MSE formula', type: 'read' },
    { id: 'cp-stat1-003-8', label: 'Read: state the two conditions that distinguish internal from external validity', type: 'read' },
  ],

  assessment: {
    questions: [
      {
        id: 'stat1-003-assess-1',
        type: 'choice',
        text: 'Researchers randomly assign 300 patients to receive a new drug or a placebo, then measure blood pressure after 8 weeks. This is best described as:',
        options: [
          'An observational cohort study',
          'A cross-sectional survey',
          'A randomized controlled trial',
          'A case-control study',
        ],
        answer: 'A randomized controlled trial',
        instructions: 'The key feature is random assignment to treatment conditions by the researchers.',
      },
    ],
  },

  quiz: [
    {
      id: 'stat1-003-quiz-1',
      type: 'choice',
      text: 'What is a confounding variable?',
      options: [
        'A variable that is measured inaccurately',
        'A variable associated with both the exposure and the outcome, distorting the apparent relationship',
        'A variable that has no correlation with the outcome',
        'A variable that is only present in the treatment group',
      ],
      answer: 'A variable associated with both the exposure and the outcome, distorting the apparent relationship',
      hints: ['A confounder affects both sides of the relationship you are studying.', 'Coffee drinkers also tend to have other lifestyle differences — which of these is a confounder?'],
      reviewSection: 'Intuition → "Confounding" paragraph',
    },
    {
      id: 'stat1-003-quiz-2',
      type: 'choice',
      text: 'Which statement about bias is correct?',
      options: [
        'Collecting more data reduces bias',
        'Bias is the same as random sampling error',
        'Bias is a systematic error that does not average out with more data',
        'A larger sample size always removes confounding',
      ],
      answer: 'Bias is a systematic error that does not average out with more data',
      hints: ['A miscalibrated scale reads 2 kg heavy. Does weighing 10,000 objects fix the calibration?', 'Bias is not random — it consistently shifts estimates in one direction.'],
      reviewSection: 'Intuition → "Bias vs. Variance" callout',
    },
    {
      id: 'stat1-003-quiz-3',
      type: 'choice',
      text: 'A cross-sectional study finds that adults who eat breakfast regularly score higher on cognitive tests. The strongest limitation of this conclusion is:',
      options: [
        'The sample size is too small',
        'Causality cannot be established because temporal precedence is unknown and confounders exist',
        'Cognitive tests are not reliable measures',
        'The finding needs to be replicated in a lab',
      ],
      answer: 'Causality cannot be established because temporal precedence is unknown and confounders exist',
      hints: ['What type of study is cross-sectional — observational or experimental?', 'Can a cross-sectional study tell you what came first?'],
      reviewSection: 'Intuition → "Types of Observational Studies" callout',
    },
    {
      id: 'stat1-003-quiz-4',
      type: 'choice',
      text: 'In a double-blind clinical trial, who does NOT know which treatment a patient received?',
      options: [
        'Only the patient',
        'Only the physician',
        'Neither the patient nor the outcome assessors',
        'Neither the patient nor the study statistician',
      ],
      answer: 'Neither the patient nor the outcome assessors',
      hints: ['Single-blind = patient doesn\'t know. Double-blind adds who else?', 'The purpose is to prevent both placebo effects and assessment bias.'],
      reviewSection: 'Intuition → "Blinding removes response and measurement bias" paragraph',
    },
    {
      id: 'stat1-003-quiz-5',
      type: 'choice',
      text: 'A study has strong internal validity but weak external validity. This means:',
      options: [
        'The causal conclusion is valid within the study, but may not generalize to other populations or settings',
        'The study used an invalid causal design but a representative sample',
        'The measuring instruments were poorly calibrated',
        'The sample size was too small to detect a real effect',
      ],
      answer: 'The causal conclusion is valid within the study, but may not generalize to other populations or settings',
      hints: ['Internal = causal validity within the study. External = generalizability beyond the study.', 'These are separate and can be high or low independently.'],
      reviewSection: 'Intuition → "Internal vs. external validity" paragraph',
    },
    {
      id: 'stat1-003-quiz-6',
      type: 'choice',
      text: 'Simpson\'s Paradox occurs when:',
      options: [
        'The sample mean is higher than the population mean',
        'An aggregate comparison gives the opposite conclusion from comparisons within subgroups, due to a confounder',
        'Two variables are correlated by coincidence with no causal relationship',
        'The standard deviation is larger than the mean',
      ],
      answer: 'An aggregate comparison gives the opposite conclusion from comparisons within subgroups, due to a confounder',
      hints: ['Recall the hospital example: overall Hospital A looked better, but within each risk group Hospital B matched or exceeded Hospital A.', 'The reversal happens because a third variable (risk level) is distributed very differently across the groups.'],
      reviewSection: 'Example 3 — Simpson\'s Paradox',
    },
  ],

  misconceptions: [
    {
      falseBelief: 'If a study is large, it must be valid.',
      whyStudentsThinkIt: 'Students (and sometimes journalists) conflate statistical power (larger studies detect smaller effects) with study validity (the design actually measures what it claims to measure).',
      correctionExample: 'Literary Digest\'s 2.4-million-response poll was enormous but biased. The size made the editors more confident in a wrong answer. Size amplifies whatever the study is measuring — including systematic error.',
      contrastCase: 'A 200-person double-blind RCT has much higher internal validity than a 2-million-person observational study on the same question, if the observational study has unmeasured confounding.',
    },
    {
      falseBelief: 'Controlling for a variable in regression removes all confounding.',
      whyStudentsThinkIt: 'Students learn that including a confounder as a covariate in regression "adjusts" for it, and incorrectly generalize this to mean all confounding is resolved.',
      correctionExample: 'Regression can only control for variables that were measured and included. Unmeasured confounders are not controlled. If you study the effect of income on health but do not measure diet (which correlates with both income and health), the income coefficient is still confounded.',
      contrastCase: 'In an RCT, randomization controls for all confounders — measured and unmeasured — by making the treatment groups exchangeable at baseline. This is why RCTs are more credible than adjusted observational studies for causal questions.',
    },
    {
      falseBelief: 'Correlation between X and Y means X causes Y.',
      whyStudentsThinkIt: 'The association is visible in data and easy to interpret; the causal direction and confounding are invisible without additional reasoning.',
      correctionExample: 'Ice cream sales and drowning deaths are correlated — both increase in summer. The confounder is temperature (hot weather → people swim more → more drownings; hot weather → people buy ice cream). Ice cream does not cause drownings.',
      contrastCase: 'Smoking and lung cancer are also correlated. Unlike ice cream/drownings, decades of evidence including dose-response relationships, biological mechanisms, and natural experiments support causality. Correlation alone never proves causation, but additional evidence can accumulate to make causation highly credible.',
    },
  ],

  transferPrompts: [
    {
      situation: 'A tech company analyzes its internal HR data and finds that employees who received mentorship assigned by managers in their first year have 25% higher promotion rates over 5 years.',
      competingTechniques: ['Conclude mentorship causes higher promotion rates', 'Identify and state the confounds before drawing conclusions', 'Run a regression controlling for job level and department'],
      whyThisTechniqueWins: 'Identify confounders first: high-potential employees are more likely to be assigned mentors by managers who recognize their potential. That same potential causes both mentorship assignment and higher promotion rates. The association is real but the causal direction is unclear. A controlled experiment (randomly assign mentors to new hires) would isolate the causal effect. Regression controlling for initial performance ratings can partially adjust — but only for measured potential, not the manager\'s judgment of unrecorded soft skills.',
    },
    {
      situation: 'You are evaluating a tutoring program. Students who enrolled in tutoring after failing a math exam improved their next exam score by 18 points on average. Non-tutored students improved by only 4 points.',
      competingTechniques: ['Conclude the tutoring program causes 14-point improvement', 'Recognize regression to the mean as a confound', 'Design an RCT for the next cohort'],
      whyThisTechniqueWins: 'Regression to the mean: students who were tutored entered the study after a low score. Extremely low scores are partly due to bad luck on that particular exam. On the next exam, those same students would likely score higher on average even without tutoring — this is regression to the mean. The non-tutored students did not fail the previous exam, so they had less room to regress upward. The 14-point difference likely overstates the tutoring effect. A proper design: randomly assign failing students to tutoring or waitlist control, measuring improvement for both groups.',
    },
  ],

  debugging: [
    {
      commonError: 'Using language like "X leads to Y" or "X improves Y" for an observational finding.',
      symptom: 'A report says "employees who exercised during work hours showed improved productivity" and concludes the exercise program caused the improvement.',
      whyItHappened: 'Causal language is more compelling than associational language, so writers unconsciously use it even when the study design does not support it.',
      repairStrategy: 'In observational studies, restrict language to: "is associated with," "is correlated with," "was observed alongside," "predicts" (in a statistical, not causal, sense). Reserve "causes," "leads to," "improves," "reduces" for randomized experiments or studies with explicit causal identification strategies (e.g., instrumental variables, regression discontinuity).',
    },
    {
      commonError: 'Ignoring non-response when reporting survey results.',
      symptom: 'A survey was sent to 1,000 customers; 200 responded. The researcher reports the mean satisfaction score of the 200 respondents as "customer satisfaction."',
      whyItHappened: 'The responding sample is easy to analyze; the non-respondents left no data. It is easy to forget they exist.',
      repairStrategy: 'Always report the response rate and acknowledge non-response bias. If the 800 non-respondents are systematically different (e.g., dissatisfied customers ignore surveys), the 200-respondent estimate is biased. Strategies to mitigate: follow up with non-respondents, compare early vs. late responders (late responders resemble non-responders more), use weighting if demographic data on non-respondents is available.',
    },
  ],

  mastery: {
    targetLevel: 3,
    solveIndependently: 'Given a study, determine whether causal or associational language is appropriate, identify at least two confounders or bias sources, and propose a design change that would address the most serious threat.',
    explainVerbally: 'Explain Simpson\'s Paradox using the hospital example: why does Hospital A look better overall but Hospital B is better within every patient risk stratum?',
    detectIncorrectApplication: 'Identify when causal language is used for an observational finding and explain what additional evidence would be needed to support a causal conclusion.',
    transferToUnfamiliar: 'Given a novel study you have not seen (e.g., a business A/B test, a public health cohort, a school intervention), classify it, evaluate its validity, and state what conclusions are and are not supported by the design.',
  },
};
