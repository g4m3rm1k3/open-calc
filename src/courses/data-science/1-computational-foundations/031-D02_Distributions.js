export default {
  id:'d-02',slug:'distributions-and-the-normal',track:'D',order:2,
  title:'Distributions and the Normal',subtitle:'The Shape of Data',
  tags:['normal','CLT','z-score','68-95-997','scipy','distribution'],
  prereqs:['d-01','b-04','c-02'],unlocks:['d-03','d-04'],
  hook:{question:'Why does the bell curve appear everywhere?',realWorldContext:'The Central Limit Theorem is one of the most important facts in statistics: the average of many independent random variables is approximately normal regardless of their distribution. This is why we can assume normal errors in models, and why standard statistical tests work.'},
  intuition:{
    prose:[
      'The **normal distribution** is defined by mean μ (center) and standard deviation σ (spread). The shape is always the same bell curve — different μ and σ just shift and scale it. Notation: X ~ N(μ, σ²).',
      'The **68-95-99.7 rule**: 68% of data falls within 1σ of the mean, 95% within 2σ, 99.7% within 3σ. This rule applies to any normal distribution. A data point 3σ from the mean is genuinely unusual.',
      'The **Central Limit Theorem (CLT)**: the sample mean of N independent draws from ANY distribution converges to normal as N increases. This is why means are so useful — their distribution is always approximately normal for large N.',
    ],
    callouts:[{type:'important',title:'The 68-95-99.7 Rule',body:'μ ± 1σ → 68.3% of data\nμ ± 2σ → 95.4% of data\nμ ± 3σ → 99.7% of data\n\nPractical meaning:\n  A value 2σ away happens ~5% of the time by chance\n  A value 3σ away happens ~0.3% of the time\n  "Statistically significant" often means > 2σ from expected'}],
    visualizations:[{id:'PythonNotebook',title:'Distributions and the Normal',props:{initialCells:[
      {id:1,cellTitle:'Stage 1 — The Normal Distribution',
       prose:'Shape, mean, and std. Varying μ shifts it; varying σ scales it.',
       instructions:'Run. Notice how σ controls the spread without changing the shape.',
       code:'from opencalc import Figure\nimport numpy as np\nfrom scipy import stats\nfig = Figure(xmin=-10,xmax=30,ymin=0,ymax=0.45,title="Normal distributions")\nfig.grid().axes()\nfor mu,sigma,color,label in [(0,1,"blue","N(0,1)"),(5,2,"amber","N(5,2)"),(10,3,"green","N(10,3)")]:\n    fig.plot(lambda x,m=mu,s=sigma: stats.norm.pdf(x,m,s), color=color, label=label)\nfig.show()',output:'',status:'idle'},
      {id:2,cellTitle:'Stage 2 — The 68-95-99.7 Rule',
       prose:'68%, 95%, 99.7% of data fall within 1, 2, 3 standard deviations.',
       instructions:'Run. Verify these percentages with the normal CDF.',
       code:'from scipy import stats\nfor n_sigma in [1,2,3]:\n    pct = stats.norm.cdf(n_sigma) - stats.norm.cdf(-n_sigma)\n    print(f"Within {n_sigma}σ: {pct*100:.1f}%")',output:'',status:'idle'},
      {id:3,cellTitle:'Stage 3 — Z-Score and Standardization',
       prose:'Z-score: how many standard deviations from the mean? Z=(x-μ)/σ.',
       instructions:'Run. All normal distributions become N(0,1) after z-scoring.',
       code:'import numpy as np\nfrom scipy import stats\nheights = np.array([160,165,170,175,180,185,190])\nmu, sigma = heights.mean(), heights.std()\nz_scores = (heights - mu) / sigma\nfor h,z in zip(heights,z_scores):\n    pct = stats.norm.cdf(z)*100\n    print(f"Height {h}cm: z={z:.2f}, taller than {pct:.1f}% of people")',output:'',status:'idle'},
      {id:4,cellTitle:'Stage 4 — Central Limit Theorem Demo',
       prose:'Average of N uniform draws converges to normal as N grows.',
       instructions:'Run. For N=1: uniform. For N=30: nearly normal. This is the CLT.',
       code:'from opencalc import Figure\nimport numpy as np\nnp.random.seed(42)\nfig = Figure(xmin=0,xmax=1,ymin=0,ymax=8,title="CLT: averages of uniform draws")\nfig.grid().axes()\ncolors=["red","amber","blue","green"]\nfor i,N in enumerate([1,2,10,30]):\n    samples=np.mean(np.random.uniform(0,1,(5000,N)),axis=1)\n    mu,sigma=samples.mean(),samples.std()\n    from scipy import stats\n    fig.plot(lambda x,m=mu,s=sigma: stats.norm.pdf(x,m,s) if s>0 else 0, color=colors[i], label=f"N={N}")\nfig.show()',output:'',status:'idle'},
      {id:5,cellTitle:'Stage 5 — Testing Normality',
       prose:'Check if data is approximately normal before using tests that assume it.',
       instructions:'Run. The Shapiro-Wilk test p-value tells you: small p = not normal.',
       code:'import numpy as np\nfrom scipy import stats\nnp.random.seed(42)\nnormal_data = np.random.normal(50,10,100)\nskewed_data = np.random.exponential(10,100)\nfor name,data in [("Normal",normal_data),("Skewed",skewed_data)]:\n    stat,p = stats.shapiro(data)\n    result = "likely normal" if p>0.05 else "NOT normal"\n    print(f"{name}: W={stat:.4f}, p={p:.4f} → {result}")',output:'',status:'idle'},
      {id:11,challengeType:'write',challengeNumber:1,challengeTitle:'Challenge 1 — Heights Analysis',
       difficulty:'medium',
       prompt:'Heights are normally distributed with μ=170cm, σ=10cm. Compute: (1) fraction_above_185 — fraction taller than 185cm, (2) height_95th — the 95th percentile height, (3) verify the 68-95-99.7 rule numerically.',
       instructions:'1. Use scipy.stats.norm.cdf() and .ppf().\n2. fraction_above_185 = 1 - cdf(185).\n3. height_95th = ppf(0.95).',
       code:'from scipy import stats\nmu, sigma = 170, 10\nfraction_above_185 = \nheight_95th = \nprint(f"P(height > 185) = {fraction_above_185:.4f}")\nprint(f"95th percentile = {height_95th:.2f} cm")\n',output:'',status:'idle',
       testCode:`
from scipy import stats
expected_fa=1-stats.norm.cdf(185,170,10)
expected_h95=stats.norm.ppf(0.95,170,10)
if abs(fraction_above_185-expected_fa)>0.001: raise ValueError(f"fraction_above_185 should be {expected_fa:.4f}, got {fraction_above_185}")
if abs(height_95th-expected_h95)>0.1: raise ValueError(f"height_95th should be {expected_h95:.2f}, got {height_95th}")
res=f"SUCCESS: P(>185cm)={fraction_above_185:.4f}, 95th pct={height_95th:.2f}cm."
res
`,hint:'fraction_above_185=1-stats.norm.cdf(185,mu,sigma)\nheight_95th=stats.norm.ppf(0.95,mu,sigma)'},
    ]}}],
  },
  mentalModel:[
    'Normal distribution: defined by μ (center) and σ (spread). Shape is always bell-curve.',
    '68-95-99.7: 1σ→68%, 2σ→95%, 3σ→99.7% of data.',
    'Z-score: (x-μ)/σ. Measures distance from mean in standard deviations.',
    'CLT: sample means are approximately normal for N≥30, regardless of original distribution.',
    'stats.norm.cdf(): P(X≤x). stats.norm.ppf(): inverse — find x given percentile.',
  ],
}
