export default {
  id:'d-01',slug:'probability-foundations',track:'D',order:1,
  title:'Probability Foundations',subtitle:'Reasoning About Uncertainty',
  tags:['probability','simulation','conditional','bayes','law-of-large-numbers'],
  prereqs:['c-02','b-04'],unlocks:['d-02','d-03'],
  hook:{question:'How do you reason mathematically about things that might or might not happen?',realWorldContext:'Every ML model produces probabilities. Every A/B test uses probability theory. Every risk assessment depends on conditional probability. Probability is the mathematical language of uncertainty — without it, you cannot reason about data-driven decisions.'},
  intuition:{
    prose:[
      'Probability is a number in [0,1] assigned to events. The three rules: P(not A)=1-P(A). P(A or B)=P(A)+P(B)-P(A and B). P(A and B)=P(A)×P(B) if A and B are independent. These are axioms — not conventions.',
      '**Law of Large Numbers**: the empirical frequency of an event converges to its probability as trials grow. Run a coin flip simulation 100,000 times and you will get very close to 0.5. This is why simulations work.',
      '**Conditional probability** P(A|B) = P(A and B)/P(B). The probability of A given that B occurred. Bayes theorem: P(A|B) = P(B|A)×P(A)/P(B). Updating beliefs with evidence.',
    ],
    callouts:[{type:'important',title:'Bayes Theorem — Medical Test Example',body:'P(disease) = 0.01  (1% of population has it)\nP(positive | disease) = 0.95  (95% sensitivity)\nP(positive | no disease) = 0.05  (5% false positives)\n\nIf you test positive:\nP(disease | positive) = 0.95×0.01 / (0.95×0.01 + 0.05×0.99)\n                      ≈ 0.161  (only 16%!)\n\nA positive test does not mean you have the disease.\nBase rate (prevalence) matters enormously.'}],
    visualizations:[{id:'PythonNotebook',title:'Probability',props:{initialCells:[
      {id:1,cellTitle:'Stage 1 — Law of Large Numbers',
       prose:'Empirical frequency converges to true probability as N grows.',
       instructions:'Run. Notice the stabilization as N increases.',
       code:'import numpy as np\nnp.random.seed(42)\nfor N in [10,100,1000,10000,100000]:\n    flips = np.random.choice([0,1], N)\n    print(f"N={N:>7}: P(heads) ≈ {np.mean(flips):.4f}")',output:'',status:'idle'},
      {id:2,cellTitle:'Stage 2 — Convergence Visualized',
       prose:'Plot the running average of coin flips to see convergence.',
       instructions:'Run. The path is noisy early, then converges to 0.5.',
       code:'from opencalc import Figure\nimport numpy as np\nnp.random.seed(42)\nN = 500\nflips = np.random.choice([0,1], N)\nrunning = [np.mean(flips[:i+1]) for i in range(N)]\nfig = Figure(xmin=0,xmax=N,ymin=0,ymax=1,title="Running average converges to 0.5")\nfig.grid().axes()\nfig.scatter(list(range(N)),running,color="blue",radius=2)\nfig.hline(0.5, color="amber")\nfig.show()',output:'',status:'idle'},
      {id:3,cellTitle:'Stage 3 — Conditional Probability',
       prose:'P(A|B) = P(A and B) / P(B). Simulate to verify.',
       instructions:'Run. P(sum=7 | d1=4) = 1/6 because only d2=3 works.',
       code:'import numpy as np\nnp.random.seed(42)\nN = 100000\nd1 = np.random.randint(1,7,N)\nd2 = np.random.randint(1,7,N)\nmask_d1_4 = (d1 == 4)\nmask_sum7 = (d1+d2 == 7)\nP_sim = np.mean(mask_sum7[mask_d1_4])\nprint(f"P(sum=7 | d1=4) ≈ {P_sim:.4f}")\nprint(f"Analytical: 1/6 = {1/6:.4f}")',output:'',status:'idle'},
      {id:4,cellTitle:'Stage 4 — Bayes Theorem',
       prose:'Update probability with evidence. Base rate matters enormously.',
       instructions:'Run. A 95% accurate test is only 16% reliable for a 1%-prevalence disease.',
       code:'def bayes_test(prior, sensitivity, fpr):\n    """P(disease | positive test)"""\n    P_pos = sensitivity*prior + fpr*(1-prior)\n    return sensitivity*prior / P_pos\n\nprint("Prevalence  P(disease|positive)")\nfor prev in [0.001, 0.01, 0.1, 0.5]:\n    p = bayes_test(prev, sensitivity=0.95, fpr=0.05)\n    print(f"{prev:.3f}       {p:.3f}")',output:'',status:'idle'},
      {id:5,cellTitle:'Stage 5 — Monte Carlo Simulation',
       prose:'When math is hard, simulate many trials and count.',
       instructions:'Run. Monte Carlo works for any probability problem — just simulate enough trials.',
       code:'import numpy as np\nnp.random.seed(42)\n# P(at least one 6 in 4 rolls of a die)\nN = 100000\nrolls = np.random.randint(1,7,(N,4))\nhas_six = np.any(rolls==6, axis=1)\nprint(f"Simulated:  {np.mean(has_six):.4f}")\nprint(f"Analytical: {1-(5/6)**4:.4f}")',output:'',status:'idle'},
      {id:11,challengeType:'write',challengeNumber:1,challengeTitle:'Challenge 1 — Monte Carlo Pi',
       difficulty:'medium',
       prompt:'Estimate π using Monte Carlo: generate 100,000 random points in [-1,1]×[-1,1]. Count those inside the unit circle (x²+y²≤1). π ≈ 4 × inside/total. Store in pi_estimate.',
       instructions:'1. np.random.uniform(-1,1,N) for x and y.\n2. Check x²+y²<=1.\n3. pi_estimate = 4 * inside / N.',
       code:'import numpy as np\nnp.random.seed(42)\nN = 100000\npi_estimate = \nprint(f"Estimate: {pi_estimate:.4f}, True: {3.14159:.4f}")\n',output:'',status:'idle',
       testCode:`
import numpy as np
if abs(pi_estimate - np.pi) > 0.05: raise ValueError(f"pi_estimate={pi_estimate:.4f} should be within 0.05 of π={np.pi:.4f}")
res=f"SUCCESS: π ≈ {pi_estimate:.4f}. Monte Carlo works!"
res
`,hint:'x=np.random.uniform(-1,1,N)\ny=np.random.uniform(-1,1,N)\ninside=(x**2+y**2<=1).sum()\npi_estimate=4*inside/N'},
      {id:12,challengeType:'write',challengeNumber:2,challengeTitle:'Challenge 2 — Birthday Problem',
       difficulty:'hard',
       prompt:'Simulate the birthday problem: in a group of N people, what is the probability that at least two share a birthday? Simulate 10,000 groups for N=23. Store the probability in prob_shared.',
       instructions:'1. For each trial: generate N random birthdays (1-365).\n2. Check if any birthday repeats (len(set(days)) < N).\n3. Fraction of trials with a match = prob_shared.',
       code:'import numpy as np\nnp.random.seed(42)\nN = 23\ntrials = 10000\nprob_shared = \nprint(f"P(shared birthday in {N} people) ≈ {prob_shared:.4f}")\nprint(f"Analytical: {1 - __import__(\"math\").factorial(365)/(__import__(\"math\").factorial(365-N)*365**N):.4f}")\n',output:'',status:'idle',
       testCode:`
if abs(prob_shared - 0.507) > 0.03: raise ValueError(f"prob_shared should be ~0.507, got {prob_shared:.4f}")
res=f"SUCCESS: P(shared birthday in 23 people) ≈ {prob_shared:.3f}. The birthday paradox!"
res
`,hint:'matches=sum(len(set(np.random.randint(1,366,N)))<N for _ in range(trials))\nprob_shared=matches/trials'},
    ]}}],
  },
  mentalModel:[
    'P rules: P(not A)=1-P(A). P(A or B)=P(A)+P(B)-P(A∩B). P(A∩B)=P(A)×P(B) if independent.',
    'Law of Large Numbers: empirical frequency → true probability as N→∞.',
    'P(A|B) = P(A and B)/P(B). Conditional probability updates on evidence.',
    'Bayes: P(A|B) = P(B|A)×P(A)/P(B). Base rate matters enormously.',
    'Monte Carlo: simulate many trials, count outcomes — works for any probability.',
  ],
}
