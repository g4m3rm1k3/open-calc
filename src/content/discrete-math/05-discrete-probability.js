export default {
  id: 'discrete-1-06',
  slug: 'discrete-probability',
  chapter: 'discrete-1',
  order: 8,
  title: 'Discrete Probability',
  subtitle: 'Finite sample spaces, conditional probability, Bayes rule, and random variables',
  tags: ['probability', 'conditional probability', 'bayes', 'random variable', 'expectation'],
  aliases: 'discrete probability bayes theorem conditional independence expectation variance',

  hook: {
    question:
      'A test is 99% accurate. If you test positive, what is the chance you actually have the condition?',
    realWorldContext:
      'Discrete probability underlies risk estimation, medical screening interpretation, fraud detection, and decision-making under uncertainty.',
    previewVisualizationId: 'BayesGridLab',
  },

  intuition: {
    prose: [
      'Probability on finite spaces is counting with normalization: favorable outcomes divided by total outcomes.',
      'If you are not a math person, do not memorize formulas first. Start by naming the sample space in plain language, then define events as subsets.',
      'Conditional probability updates context by restricting the sample space to the condition event.',
      'Bayes rule inverts conditioning: from P(test|disease) to P(disease|test). This inversion is where many intuitions fail.',
      'Historical arc: from Bernoulli and Laplace to modern inference, probability evolved from gambling math to scientific reasoning language.',
      'A useful habit is to convert every conditional-probability word problem into a table or tree before touching algebra.',
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'Conditional Probability',
        body: 'P(A|B)=\\frac{P(A\\cap B)}{P(B)} \\quad (P(B)>0)',
      },
      {
        type: 'theorem',
        title: 'Bayes Rule',
        body: 'P(A|B)=\\frac{P(B|A)P(A)}{P(B)}',
      },
    ],
    visualizations: [
      {
        id: 'BayesGridLab',
        title: 'Bayes Grid Lab',
        caption: 'Adjust prevalence, sensitivity, and specificity to see how posterior probability shifts.',
      },
    ],
  },

  math: {
    prose: [
      'A discrete random variable X maps outcomes to numbers. Expectation is weighted average: E[X]=sum x p(x).',
      'Variance captures spread: Var(X)=E[(X-E[X])^2]=E[X^2]-E[X]^2.',
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'Law of Total Probability',
        body: 'If {B_i} partitions sample space, P(A)=\\sum_i P(A|B_i)P(B_i).',
      },
    ],
  },

  rigor: {
    prose: [
      'Bayes theorem follows immediately by equating two expressions for P(A intersection B).',
      'Always define the sample space and event partition explicitly before computing conditionals.',
    ],
  },

  examples: [
    {
      id: 'discrete-1-05-ex1',
      title: 'Posterior from Test Result',
      problem: 'Prevalence=1%, sensitivity=95%, specificity=90%. Compute P(disease|positive).',
      steps: [
        { expression: 'P(D)=0.01, P(+|D)=0.95, P(+|not D)=0.10', annotation: 'Translate given rates.' },
        { expression: 'P(+)=0.95(0.01)+0.10(0.99)=0.1085', annotation: 'Total probability.' },
        { expression: 'P(D|+)=0.95(0.01)/0.1085≈0.0876', annotation: 'Bayes rule.' },
      ],
      conclusion: 'Despite high sensitivity, low prevalence keeps posterior under 9%.',
    },
    {
      id: 'discrete-1-05-ex2',
      title: 'Expectation of Fair Die',
      problem: 'Compute E[X] for fair six-sided die.',
      steps: [
        { expression: 'E[X]=sum_{k=1}^6 k(1/6)', annotation: 'Definition.' },
        { expression: '=(1+2+3+4+5+6)/6=3.5', annotation: 'Arithmetic simplification.' },
      ],
      conclusion: 'Expected value can be non-attainable as a single outcome.',
    },
  ],

  challenges: [
    {
      id: 'discrete-1-05-ch1',
      difficulty: 'easy',
      problem: 'For independent A,B with P(A)=0.4, P(B)=0.5, find P(A intersection B).',
      answer: '0.2',
    },
    {
      id: 'discrete-1-05-ch2',
      difficulty: 'medium',
      problem: 'If X takes values 0,1,2 with probs 0.2,0.5,0.3, compute E[X] and Var(X).',
      answer: 'E[X]=1.1, Var(X)=0.49',
    },
  ],

  crossRefs: [
    { lessonSlug: 'counting-and-combinatorics', label: 'Counting and Combinatorics', context: 'Finite probability depends on accurate counting.' },
    { lessonSlug: 'sets-and-logic', label: 'Sets and Logic', context: 'Events are sets and probability laws mirror set identities.' },
    { lessonSlug: 'algorithms-and-complexity', label: 'Algorithms and Complexity', context: 'Randomized algorithms require probabilistic reasoning about outcomes.' },
  ],

  checkpoints: [
    'read-intuition',
    'read-math',
    'completed-example-1',
    'completed-example-2',
    'attempted-challenge-easy',
    'attempted-challenge-medium',
  ],
}
