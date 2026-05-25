export default {
  id: 'stat1-002',
  slug: 'sampling-methods',
  chapter: 'stat1',
  order: 2,
  title: 'Sampling Methods',
  subtitle: 'How you collect data determines what conclusions you can draw.',
  tags: ['sampling', 'random sampling', 'stratified', 'cluster', 'systematic', 'bias', 'survey design'],
  aliases: 'simple random sample stratified sampling cluster sampling systematic sampling convenience sample probability sample',
  timeToComplete: 30,
  coreConcept: 'A probability sample gives every unit in the population a known, nonzero chance of selection. The sampling method you choose determines whether your estimates are valid and how efficiently you can achieve a target margin of error.',
  prerequisites: ['stat1-001'],
  nextLesson: 'stat1-003',

  hook: {
    question: 'Can a sample of 1,000 voters accurately represent 250 million? Yes — but only if you choose them correctly.',
    realWorldContext: 'In 1936, Literary Digest magazine mailed 10 million ballots and received 2.4 million responses. They predicted Alf Landon would beat Franklin Roosevelt by a landslide. Roosevelt won by one of the largest margins in history. The problem was not the sample size — 2.4 million is enormous. The problem was how the sample was chosen: from telephone directories and car registration lists, which in 1936 overrepresented wealthy, Republican-leaning households. A Gallup poll of 50,000 using proper random selection predicted the correct winner. This is the central lesson of sampling: method matters more than size.',
  },

  intuition: {
    prose: [
      '**Five ways to pick a sample — and why the differences matter.** Every sampling method is an answer to the question: which units from the population get measured? The five main strategies differ in how much randomness they use, how representative they are, and how expensive they are to execute.',
      '**Simple Random Sample (SRS).** Assign every unit in the population a number from 1 to N. Use a random number generator to pick n numbers. Measure those units. Every unit has the same probability of selection: n/N. Every possible group of n units has the same probability of being the sample. SRS is the theoretical gold standard: it eliminates selection bias by construction. Weakness: if the population has important subgroups, SRS may by chance under-represent them.',
      '**Stratified Random Sample.** Divide the population into non-overlapping groups called strata based on a characteristic you care about — for example, age group, income bracket, or geographic region. Within each stratum, draw a simple random sample. You guarantee representation from every stratum. Proportional stratified sampling draws the same proportion from each stratum (if stratum A is 30% of the population, take 30% of your total sample from stratum A). This typically gives a smaller margin of error than SRS for the same total sample size, because between-stratum variation is removed.',
      '**Before reading on, predict:** A university wants to estimate the average GPA of its students and knows that GPA distributions differ substantially between freshmen, sophomores, juniors, and seniors. Should they use SRS or stratified sampling — and what should the strata be? Write your prediction.',
      '**Cluster Sampling.** Divide the population into groups called clusters (usually geographic: school districts, city blocks, hospital wards). Randomly select some clusters, then measure everyone (or a random sample) within the selected clusters. Cluster sampling is cheaper and faster than SRS when the population is spread across many physical locations — you only travel to selected clusters. Trade-off: if units within a cluster are similar to each other (which they often are — neighbors share demographics), the effective sample size is smaller than the number of units measured, and estimates are less precise than SRS of the same total n.',
      '**Systematic Sampling.** Order all N units in some sequence (alphabetical, by ID number, by arrival time). Choose a random starting point k (1 ≤ k ≤ N/n). Then select units k, k + N/n, k + 2N/n, … every N/n-th unit. Simple to execute in the field: a quality inspector samples every 50th item off an assembly line, a pollster interviews every 10th person who enters a shopping mall. Risk: if there is a periodic pattern in the list that matches the sampling interval, the sample is biased. Example: if every 7th apartment in a building is a corner unit with different characteristics, and you sample every 7th apartment, your sample is all corner units.',
      '**Convenience Sample (Non-probability).** Measure whoever is easiest to reach: volunteers, students in your class, the first 50 customers who walk in. Fast and cheap. Cannot support valid statistical inference about the broader population because units did not have known selection probabilities. Suitable for pilot studies to test whether an instrument works, not for estimating population parameters. Literary Digest used something close to a convenience sample (self-selected respondents) despite mailing 10 million ballots.',
      '**The key distinction: probability vs. non-probability.** SRS, stratified, cluster, and systematic sampling are all probability samples — every unit has a calculable probability of being selected. This allows you to compute unbiased estimates and valid confidence intervals. Convenience samples are non-probability: selection probabilities are unknown, so statistical inference is not valid.',
    ],
    callouts: [
      {
        type: 'procedure',
        title: 'Procedure: Choosing a Sampling Method',
        body: 'Step 1. Is the population list available (a sampling frame)? If yes, SRS is feasible. If no, cluster or systematic may be required.\n\nStep 2. Are there important subgroups you must represent? If yes, use stratified sampling with those subgroups as strata.\n\nStep 3. Is the population geographically dispersed and expensive to travel to? If yes, cluster sampling reduces field cost.\n\nStep 4. Is the population ordered and sequentially accessible? If yes, systematic sampling is simple to execute.\n\nStep 5. Do you only need a rough pilot estimate and cannot obtain a probability sample? Convenience sampling is acceptable — but do NOT extrapolate to the population.',
      },
      {
        type: 'insight',
        title: 'Sampling Frame',
        body: 'The **sampling frame** is the list or mechanism from which you actually draw units. Ideally the frame matches the target population exactly. In practice it often does not:\n\n• A phone directory excludes people without landlines or unlisted numbers.\n• A school enrollment list excludes students who enrolled after the list was compiled.\n• A voter registration list excludes eligible voters who have not registered.\n\nThe gap between the target population and the sampling frame creates **coverage error** — a form of bias that no amount of sophisticated sampling can fix once committed.',
      },
      {
        type: 'warning',
        title: 'Volunteer and Self-Selection Bias',
        body: 'When participation is voluntary, people who choose to respond are systematically different from those who do not. Health surveys over-represent health-conscious people. Online polls over-represent people with strong opinions who seek out the survey. Customer satisfaction surveys over-represent customers who are either very happy or very angry.\n\nVolunteer bias is not correctable by weighting unless the nature of the bias is fully understood — which it rarely is. A probability sample with a low response rate can also suffer from self-selection bias if non-responders differ from responders.',
      },
      {
        type: 'insight',
        title: 'Effective Sample Size in Cluster Sampling',
        body: 'When units within a cluster are correlated, the effective sample size $n_{eff}$ is less than the actual number measured $n$:\n$$n_{eff} = \\frac{n}{1 + (\\bar{m}-1)\\cdot\\rho}$$\nwhere $\\bar{m}$ is the average cluster size and $\\rho$ (the intracluster correlation coefficient) measures how similar units within a cluster are. If $\\rho = 0$ (units in a cluster are no more similar than random), $n_{eff} = n$. If $\\rho = 1$ (all units in a cluster are identical), $n_{eff}$ equals the number of clusters, not the total units measured. This is why cluster sampling is less efficient than SRS — you are paying for measurements that carry less new information.',
      },
    ],
    visualizations: [],
  },

  math: {
    prose: [
      '**SRS selection probability.** In a population of $N$ units, an SRS of size $n$ selects each unit with probability $\\pi_i = n/N$. The Horvitz-Thompson estimator of the population total $T = \\sum_{i=1}^N y_i$ is $\\hat{T} = \\sum_{i \\in S} y_i / \\pi_i = (N/n)\\sum_{i \\in S} y_i$. For the mean: $\\hat{\\mu} = \\bar{y}_S = \\frac{1}{n}\\sum_{i \\in S} y_i$ with estimated variance $\\hat{V}(\\bar{y}_S) = \\frac{s^2}{n}\\left(1 - \\frac{n}{N}\\right)$. The factor $(1 - n/N)$ is the **finite population correction** (FPC) — it reduces the variance when the sample is a large fraction of the population. When $n/N < 0.05$, the FPC is negligible and is typically omitted.',
      '**Stratified sampling variance.** Divide the population of $N$ units into $H$ strata with sizes $N_1, N_2, \\ldots, N_H$. Draw an SRS of size $n_h$ from stratum $h$. The stratified estimator of the population mean is $\\bar{y}_{st} = \\sum_{h=1}^H W_h \\bar{y}_h$, where $W_h = N_h/N$ is the stratum weight and $\\bar{y}_h$ is the sample mean in stratum $h$. Its variance is $V(\\bar{y}_{st}) = \\sum_{h=1}^H W_h^2 \\frac{S_h^2}{n_h}$. Stratification reduces variance when strata are internally homogeneous (small $S_h^2$) and different from each other (large between-stratum variance).',
      '**Optimal Neyman allocation.** The variance of $\\bar{y}_{st}$ is minimized (for a fixed total $n = \\sum n_h$) by the Neyman allocation: $n_h \\propto N_h S_h$. Allocate more units to larger strata and to strata with higher variability. If you do not know $S_h$ in advance, proportional allocation $n_h = n \\cdot W_h$ is a robust default that is never worse than SRS.',
    ],
  },

  rigor: {
    prose: [
      '**R1 — Probability sampling and design-based inference.** In design-based inference, the population values $y_1, \\ldots, y_N$ are treated as fixed (not random). The only randomness comes from the sampling design — which subset $S$ of the population was selected. An estimator $\hat{\\theta}$ is design-unbiased if $E_p[\\hat{\\theta}] = \\theta$ where $E_p$ denotes expectation over all possible samples under the probability sampling design $p$. This is a different notion of unbiasedness from the model-based approach: no distributional assumptions about the population values are required.',
      '**R2 — Non-response and missing data.** A response rate of $r$ means only fraction $r$ of the selected sample actually provides data. If non-responders differ from responders on the outcome variable, the effective estimator is biased regardless of the original sampling design. The bias due to non-response is $\\text{Bias} \\approx (1-r)(\\bar{y}_{nr} - \\bar{y}_r)$, where $\\bar{y}_{nr}$ and $\\bar{y}_r$ are the true means for non-responders and responders. This bias is fundamentally unknowable from the observed data alone — it requires assumptions or external data about non-responders.',
      '**R3 — Randomization vs. randomness.** Randomly assigning units to treatment conditions (randomized experiment) is different from randomly selecting units from a population (probability sampling). Random assignment justifies causal inference. Random selection justifies generalization to the population. Most observational studies do neither perfectly — they use convenience samples and do not assign treatments — which is why they support only associational claims.',
    ],
    visualizations: [],
  },

  code: {
    cells: [],
  },

  examples: [
    {
      id: 'stat1-002-ex1',
      title: 'SRS in practice: drawing a random sample',
      difficulty: 'easy',
      problem: 'A company has 400 employees (numbered 1–400) and wants to survey 40 about job satisfaction. Describe the SRS procedure and compute the selection probability for each employee.',
      steps: [
        { expression: 'N = 400, \\quad n = 40', annotation: 'Identify population size N and desired sample size n.', strategyTitle: 'Step 1: State N and n' },
        { expression: '\\pi_i = \\frac{n}{N} = \\frac{40}{400} = 0.10', annotation: 'Every employee has a 10% chance of being selected. This equal probability is the defining property of SRS.', strategyTitle: 'Step 2: Selection probability' },
        { expression: '\\text{Procedure: generate 40 distinct random integers from } [1, 400]', annotation: 'Use a random number generator (Python: random.sample(range(1,401), 40), Excel: RANDBETWEEN or RAND). Survey those 40 employees. This guarantees equal probability and no duplication.', strategyTitle: 'Step 3: Execute the draw' },
      ],
    },
    {
      id: 'stat1-002-ex2',
      title: 'Stratified vs. SRS: choosing the better method',
      difficulty: 'medium',
      problem: 'A university of 8,000 students wants to estimate the average weekly study hours. The registrar knows: 2,400 are freshmen (avg ~20 hrs/week, high variability), 2,400 are sophomores (avg ~16 hrs/week), 1,600 are juniors (avg ~14 hrs/week), 1,600 are seniors (avg ~12 hrs/week). Total sample budget: n = 200. (a) Set up proportional stratified sampling. (b) Explain why it will be more precise than SRS of 200.',
      steps: [
        { expression: 'W_1 = \\frac{2400}{8000} = 0.30, \\quad W_2 = 0.30, \\quad W_3 = 0.20, \\quad W_4 = 0.20', annotation: 'Compute stratum weights. Freshmen and sophomores are each 30% of the population; juniors and seniors are each 20%.', strategyTitle: 'Step 1: Stratum weights' },
        { expression: 'n_1 = 0.30 \\times 200 = 60, \\quad n_2 = 60, \\quad n_3 = 40, \\quad n_4 = 40', annotation: 'Proportional allocation: multiply each weight by the total sample size. Allocate 60 freshmen, 60 sophomores, 40 juniors, 40 seniors.', strategyTitle: 'Step 2: Proportional allocation' },
        { expression: '\\bar{y}_{st} = 0.30 \\bar{y}_1 + 0.30 \\bar{y}_2 + 0.20 \\bar{y}_3 + 0.20 \\bar{y}_4', annotation: 'After collecting data, the stratified estimator is the weighted average of stratum sample means.', strategyTitle: 'Step 3: Estimator formula' },
        { expression: '\\text{More precise than SRS because: between-stratum variation is controlled}', annotation: 'The four year groups have different means (20, 16, 14, 12 hrs). An SRS might by chance draw too many freshmen (raising the estimate) or too few seniors. Stratified sampling guarantees the right proportions, so the only remaining variance is within-stratum variation.', strategyTitle: 'Step 4: Precision argument' },
      ],
    },
    {
      id: 'stat1-002-ex3',
      title: 'Identify the sampling method and its risks',
      difficulty: 'medium',
      problem: 'For each study, identify the sampling method used and state one key risk:\n(a) A quality-control manager inspects every 20th product off an assembly line.\n(b) A health researcher divides a city into 50 neighborhoods, randomly selects 8 neighborhoods, then surveys all households in those 8 neighborhoods.\n(c) A psychology professor recruits study participants from her own intro class.',
      steps: [
        { expression: '\\text{(a) Every 20th item: systematic sampling}', annotation: 'Risk: if there is a periodic defect pattern with period 20 (e.g., a machine calibration drift that repeats every 20 units), the sample will either always catch it or always miss it. Check whether the sampling interval could align with any production cycle.', strategyTitle: '(a) Systematic — period risk' },
        { expression: '\\text{(b) 8 random neighborhoods, all households: cluster sampling}', annotation: 'Risk: households within a neighborhood are more similar to each other than to random households city-wide (shared income, ethnicity, housing type). The intracluster correlation $\\rho > 0$ reduces the effective sample size below the total households surveyed.', strategyTitle: '(b) Cluster — intracluster correlation' },
        { expression: '\\text{(c) Own intro class: convenience sample}', annotation: 'Risk: intro psychology students are not representative of the general population (younger, more educated, WEIRD — Western, Educated, Industrialized, Rich, Democratic). Results cannot be validly generalized beyond this specific population. Not a probability sample.', strategyTitle: '(c) Convenience — generalizability' },
      ],
    },
  ],

  challenges: [
    {
      id: 'stat1-002-ch1',
      title: 'Design a stratified sample for an election poll',
      difficulty: 'medium',
      problem: 'You are designing a poll to estimate the proportion of registered voters in a state who support a ballot measure. The state has three regions: Urban (1.2 million voters), Suburban (1.8 million voters), Rural (0.6 million voters). Support levels are expected to differ substantially by region. Your total budget allows n = 600 interviews. (a) Identify why stratified sampling is preferred over SRS here. (b) Compute proportional allocation. (c) State the stratified estimator formula.',
      walkthrough: [
        { expression: 'N = 1{,}200{,}000 + 1{,}800{,}000 + 600{,}000 = 3{,}600{,}000', annotation: 'Total registered voter population. Identify N first.' },
        { expression: 'W_{\\text{Urban}} = \\frac{1.2M}{3.6M} = 0.333 \\quad W_{\\text{Suburban}} = 0.500 \\quad W_{\\text{Rural}} = 0.167', annotation: 'Stratum weights: Urban = 33.3%, Suburban = 50%, Rural = 16.7%.' },
        { expression: 'n_{\\text{Urban}} = 0.333 \\times 600 = 200 \\quad n_{\\text{Suburban}} = 300 \\quad n_{\\text{Rural}} = 100', annotation: 'Proportional allocation. Each stratum contributes its exact population proportion of the total sample.' },
        { expression: '\\hat{p}_{st} = 0.333 \\hat{p}_{\\text{Urban}} + 0.500 \\hat{p}_{\\text{Sub}} + 0.167 \\hat{p}_{\\text{Rural}}', annotation: 'Weighted average of stratum sample proportions. This is design-unbiased for the true population proportion p.' },
        { expression: '\\text{Preferred over SRS: support rates differ by region; SRS risks under-representing the smaller Rural stratum}', annotation: 'With SRS, the 600 interviews might yield only ~97 rural voters by chance (16.7% × 600). Stratified sampling guarantees exactly 100, eliminating that source of variability.' },
      ],
      answer: 'Stratified sampling with proportional allocation: 200 Urban, 300 Suburban, 100 Rural. Estimator: weighted average of stratum proportions with weights 0.333, 0.500, 0.167.',
    },
    {
      id: 'stat1-002-ch2',
      title: 'Diagnose a flawed sampling design',
      difficulty: 'hard',
      problem: 'A city wants to know the average number of potholes per block. The city has 2,000 blocks. A researcher picks a random starting block, then surveys every 40th block: blocks 7, 47, 87, 127, … for a total of 50 blocks. She finds the average is 3.2 potholes/block. Later, someone discovers that the city\'s grid has a repeating pattern: corner blocks (which occur every 40 blocks along main arteries) have been recently repaved and have 0 potholes. (a) Identify the sampling method. (b) Explain the bias. (c) Suggest a fix.',
      walkthrough: [
        { expression: '\\text{Sampling interval: } N/n = 2000/50 = 40', annotation: 'Systematic sample with interval 40. The researcher correctly computed the interval.' },
        { expression: '\\text{Period of repaving cycle} = 40 = \\text{sampling interval} \\Rightarrow \\text{every sample block is a corner block}', annotation: 'The sampling interval exactly matches the repaving period. Every selected block is recently repaved, with 0 potholes. The estimate 3.2 potholes/block is not representative of the full population.' },
        { expression: '\\text{Bias} = \\bar{y}_{\\text{sample}} - \\mu = 3.2 - \\mu_{\\text{true}}', annotation: 'We cannot compute the exact bias without knowing the true mean, but the direction is clear: the sample underestimates potholes because it selects the best-maintained blocks.' },
        { expression: '\\text{Fix: use SRS, or change interval to a non-divisor of 40 (e.g., 39 or 41), or use stratified sampling}', annotation: 'The cleanest fix is SRS: draw 50 blocks at random from the list of 2,000. Alternatively, use an interval that does not align with any known cycle. If block type (corner vs. interior) is known, stratify on it.' },
      ],
      answer: 'Systematic sampling with period 40 that coincidentally matches the repaving cycle, causing all selected blocks to be recently repaved. Fix: use SRS or change the interval to avoid alignment with any periodic pattern in the population.',
    },
    {
      id: 'stat1-002-ch3',
      title: 'Compute a stratified estimate',
      difficulty: 'hard',
      problem: 'A company has three departments. HR (80 employees, sampled 16, mean salary $52,000, s=$8,000), Engineering (200 employees, sampled 40, mean $95,000, s=$15,000), Sales (120 employees, sampled 24, mean $68,000, s=$11,000). Compute the stratified estimate of the company-wide mean salary.',
      walkthrough: [
        { expression: 'N = 80 + 200 + 120 = 400 \\text{ total employees}', annotation: 'Total population size.' },
        { expression: 'W_{HR} = 80/400 = 0.20 \\quad W_{Eng} = 200/400 = 0.50 \\quad W_{Sales} = 120/400 = 0.30', annotation: 'Stratum weights must sum to 1: 0.20 + 0.50 + 0.30 = 1.00. ✓' },
        { expression: '\\bar{y}_{st} = 0.20(52{,}000) + 0.50(95{,}000) + 0.30(68{,}000)', annotation: 'Weighted average of stratum means.' },
        { expression: '= 10{,}400 + 47{,}500 + 20{,}400 = \\$78{,}300', annotation: 'The stratified estimate of the company-wide mean salary is $78,300.' },
      ],
      answer: '$78,300. The stratified estimator weights each department\'s sample mean by that department\'s share of the total workforce.',
    },
  ],

  semantics: {
    core: [
      { symbol: 'N', meaning: 'Population size — total number of units in the target population' },
      { symbol: 'n', meaning: 'Sample size — total number of units measured' },
      { symbol: '\\pi_i', meaning: 'Inclusion probability of unit i — the probability that unit i is selected in the sample' },
      { symbol: 'W_h', meaning: 'Stratum weight — N_h/N, the proportion of the population in stratum h' },
      { symbol: '\\bar{y}_{st}', meaning: 'Stratified estimator of the population mean — weighted average of stratum sample means' },
      { symbol: '\\rho', meaning: 'Intracluster correlation coefficient — similarity of units within the same cluster (0 = independent, 1 = identical)' },
    ],
    rulesOfThumb: [
      'Probability sample → valid statistical inference. Non-probability (convenience) sample → descriptive only.',
      'Use stratified sampling when subgroups differ substantially on the outcome of interest.',
      'Cluster sampling saves cost but reduces precision — expect wider confidence intervals for the same n.',
      'Systematic sampling is safe unless the population has periodicity that matches the sampling interval.',
      'A large biased sample is worse than a small unbiased one: Literary Digest had 2.4 million responses and still got it wrong.',
      'Finite population correction (1 − n/N) matters only when the sample is more than 5% of the population.',
    ],
  },

  spiral: {
    recoveryPoints: [],
    futureLinks: [
      { lessonId: 'stat1-003', label: 'Study Design and Bias', note: 'Sampling method is one source of bias. stat1-003 covers selection bias, response bias, and measurement bias systematically.' },
      { lessonId: 'stat6-001', label: 'Statistical Inference', note: 'Confidence intervals and hypothesis tests assume probability sampling. The formulas for margin of error assume SRS unless adjusted for the design.' },
      { lessonId: 'stat6-002', label: 'Confidence Intervals', note: 'The variance formula used to compute confidence intervals changes depending on the sampling design (SRS vs stratified vs cluster).' },
    ],
  },

  checkpoints: [
    { id: 'cp-stat1-002-1', label: 'Read: define probability vs. non-probability sample with one example each', type: 'read' },
    { id: 'cp-stat1-002-2', label: 'Read: explain the sampling frame and what coverage error is', type: 'read' },
    { id: 'cp-stat1-002-3', label: 'Read: name the five sampling methods and the key risk of each', type: 'read' },
    { id: 'cp-stat1-002-4', label: 'Apply the classification procedure callout to example 3 before reading the solutions', type: 'example' },
    { id: 'cp-stat1-002-5', label: 'Complete example 2: compute proportional allocation for the four-stratum university study', type: 'example' },
    { id: 'cp-stat1-002-6', label: 'Attempt challenge 3: compute the stratified mean salary from scratch', type: 'challenge' },
    { id: 'cp-stat1-002-7', label: 'Read: explain why the Literary Digest poll failed despite its enormous sample size', type: 'read' },
    { id: 'cp-stat1-002-8', label: 'Read: state when the finite population correction can be ignored and why', type: 'read' },
  ],

  assessment: {
    questions: [
      {
        id: 'stat1-002-assess-1',
        type: 'choice',
        text: 'A researcher divides a city into 100 zip codes, randomly selects 10 zip codes, then surveys every household in the selected zip codes. What sampling method is this?',
        options: ['Simple random sample', 'Systematic sample', 'Stratified sample', 'Cluster sample'],
        answer: 'Cluster sample',
        hint: 'The city is divided into groups (zip codes), some groups are selected at random, and all units within the selected groups are measured.',
      },
    ],
  },

  quiz: [
    {
      id: 'stat1-002-quiz-1',
      type: 'choice',
      text: 'Which of the following is a probability sampling method?',
      options: ['Surveying volunteers who respond to a social media post', 'Interviewing everyone who enters a coffee shop on Monday morning', 'Drawing names from a numbered list using a random number generator', 'Asking your friends and colleagues to complete a survey'],
      answer: 'Drawing names from a numbered list using a random number generator',
      hints: ['Probability sampling requires that every unit has a known, non-zero chance of selection.', 'Only one option uses a random selection mechanism.'],
      reviewSection: 'Intuition → "The key distinction: probability vs. non-probability" paragraph',
    },
    {
      id: 'stat1-002-quiz-2',
      type: 'choice',
      text: 'A company has 1,000 employees. A researcher draws an SRS of 50. What is the inclusion probability of each employee?',
      options: ['0.01', '0.05', '0.10', '0.50'],
      answer: '0.05',
      hints: ['Inclusion probability in SRS = n / N.', '50 / 1000 = ?'],
      reviewSection: 'Math section — SRS selection probability',
    },
    {
      id: 'stat1-002-quiz-3',
      type: 'choice',
      text: 'Stratified sampling is most beneficial over SRS when:',
      options: [
        'The population is homogeneous (all units are very similar)',
        'The strata have very different means on the outcome variable',
        'The sampling frame is unavailable',
        'The population is geographically concentrated',
      ],
      answer: 'The strata have very different means on the outcome variable',
      hints: ['Stratification controls between-stratum variation.', 'If all strata have the same mean, stratification adds no precision benefit.'],
      reviewSection: 'Intuition → "Stratified Random Sample" paragraph',
    },
    {
      id: 'stat1-002-quiz-4',
      type: 'choice',
      text: 'The main risk of cluster sampling compared to SRS is:',
      options: [
        'It is more expensive to administer',
        'Units within a cluster are correlated, reducing effective sample size',
        'It cannot be used with large populations',
        'It requires a complete list of all population units',
      ],
      answer: 'Units within a cluster are correlated, reducing effective sample size',
      hints: ['Think about neighbors sharing similar characteristics.', 'The intracluster correlation coefficient ρ measures this.'],
      reviewSection: 'Intuition → "Cluster Sampling" paragraph and the intracluster correlation callout',
    },
    {
      id: 'stat1-002-quiz-5',
      type: 'choice',
      text: 'In the 1936 Literary Digest poll, why did a sample of 2.4 million responses fail while a Gallup sample of 50,000 succeeded?',
      options: [
        'The Gallup sample was larger',
        'Literary Digest used a biased, non-probability sample; Gallup used proper random selection',
        'Literary Digest surveyed too many people, causing measurement fatigue',
        'Gallup used stratified sampling while Literary Digest used SRS',
      ],
      answer: 'Literary Digest used a biased, non-probability sample; Gallup used proper random selection',
      hints: ['Think about who was on the mailing list in 1936.', 'Telephone directories and car registration lists overrepresented which demographic?'],
      reviewSection: 'Hook — Literary Digest 1936 example',
    },
    {
      id: 'stat1-002-quiz-6',
      type: 'choice',
      text: 'The finite population correction (1 − n/N) can be ignored when:',
      options: [
        'The sample size n > 30',
        'The sample is less than 5% of the population (n/N < 0.05)',
        'The population is normally distributed',
        'The sampling is done without replacement',
      ],
      answer: 'The sample is less than 5% of the population (n/N < 0.05)',
      hints: ['When n is tiny relative to N, does it matter whether you sample with or without replacement?', 'If n/N ≈ 0, what does (1 − n/N) equal?'],
      reviewSection: 'Math section — SRS variance formula',
    },
  ],

  misconceptions: [
    {
      falseBelief: 'A bigger sample is always better than a smaller one.',
      whyStudentsThinkIt: 'Students correctly learn that larger samples give smaller margins of error. They incorrectly extend this to conclude that size alone guarantees quality.',
      correctionExample: 'Literary Digest (2.4 million responses, biased sample) vs. Gallup (50,000, probability sample). The smaller, unbiased sample was far more accurate. A biased sample of any size converges to the wrong answer.',
      contrastCase: 'Two SRS samples from the same population: n=100 vs n=1000. Here bigger is better. But a convenience sample of 1,000 vs an SRS of 100 — the SRS may be more accurate.',
    },
    {
      falseBelief: 'Stratified sampling always gives better results than SRS.',
      whyStudentsThinkIt: 'Students learn that stratification "controls" for subgroup differences and assume it always improves precision.',
      correctionExample: 'If the strata have identical means on the outcome variable (e.g., you stratify by eye color when studying income, and mean income is the same across eye colors), stratification provides zero precision gain over SRS. It only helps when strata differ on the outcome.',
      contrastCase: 'Stratifying by age group when estimating age — by definition improves precision enormously. Stratifying by shoe size when estimating political views — likely provides no benefit.',
    },
    {
      falseBelief: 'A random sample means a haphazard or casual selection.',
      whyStudentsThinkIt: 'In everyday language, "random" means arbitrary or unplanned. In statistics, it means sampled according to a known probability mechanism.',
      correctionExample: 'Asking the first 50 people you see is not a random sample — it is a convenience sample. Drawing 50 names from a hat containing all population members is a random sample (SRS), even though it seems simple.',
      contrastCase: 'The word "random" in statistics always requires specifying the probability distribution: "Each unit is selected with probability n/N, independently." Without that specification, a selection process is not statistically random even if it feels arbitrary.',
    },
  ],

  transferPrompts: [
    {
      situation: 'A hospital wants to estimate the average length of stay for patients discharged last year. It has a complete list of all 12,000 discharges.',
      competingTechniques: ['Survey all 12,000 (census)', 'Draw an SRS of 400 from the list', 'Sample every 30th discharge in chronological order'],
      whyThisTechniqueWins: 'With a complete list, SRS of 400 gives a valid estimate with a predictable margin of error at low cost. A census is unnecessary unless subgroup-level precision is required. Systematic sampling (every 30th) is practical but risks bias if discharge timing has a weekly cycle (e.g., more elective procedures on Mondays that affect LOS).',
    },
    {
      situation: 'A national education study wants to measure reading scores across all public schools in a country with 50,000 schools in 500 districts.',
      competingTechniques: ['SRS of 500 schools', 'Cluster sample: random sample of 50 districts, test all schools in those districts', 'Stratified sample by district size and region'],
      whyThisTechniqueWins: 'Cluster sampling is far more practical — testing all 500 schools in 50 districts requires sending test administrators to only 50 locations. SRS of 500 schools scattered across the country requires 500 separate site visits. For national estimates, the efficiency gain of clustering usually outweighs the precision loss, especially if the study also wants district-level estimates.',
    },
  ],

  debugging: [
    {
      commonError: 'Computing a stratified estimate using simple arithmetic mean instead of weighted mean.',
      symptom: 'Average of the three stratum sample means gives a different (usually wrong) answer than the weighted formula.',
      whyItHappened: 'If stratum sample sizes are proportional to stratum population sizes, the unweighted average of sample means happens to equal the weighted estimate. But if they differ (e.g., you over-sampled a small stratum), the unweighted average is biased.',
      repairStrategy: 'Always use $\\bar{y}_{st} = \\sum_h W_h \\bar{y}_h$ where $W_h = N_h / N$. The weights come from population sizes, not sample sizes.',
    },
    {
      commonError: 'Treating a self-selected online survey as if it were a probability sample.',
      symptom: 'Researcher reports confidence intervals and p-values from a survey promoted on social media, implying the results generalize to the population.',
      whyItHappened: 'The confidence interval formula is mechanically applicable to any data — Python and R will compute it without checking whether the data came from a probability sample. Students apply the formula without checking the assumption.',
      repairStrategy: 'Before applying inferential formulas, verify: "Was every unit in the population given a known, nonzero chance of selection?" If not, confidence intervals and p-values are not valid for inference about the population. Report descriptive statistics only and explicitly state the convenience sample limitation.',
    },
  ],

  mastery: {
    targetLevel: 'Apply (Level 3) — given a study description, identify the sampling method, compute inclusion probabilities or stratum allocations, and evaluate whether the sample supports valid population inference.',
    solveIndependently: 'Given a population with known stratum sizes, compute proportional stratified allocation, compute the stratified mean estimate, and identify the sampling method from a study description.',
    explainVerbally: 'Explain why the 1936 Literary Digest poll failed despite having 2.4 million responses, using the specific concepts of probability sampling and coverage error.',
    detectIncorrectApplication: 'Identify when a researcher uses a convenience sample but reports it as if it were a probability sample and explain exactly what inferential claims are no longer valid.',
    transferToUnfamiliar: 'Given a novel sampling scenario you have not seen (e.g., sampling hospital patients, sampling tweets from a social media platform), identify which probability sampling method is most appropriate and justify the choice.',
  },
};
