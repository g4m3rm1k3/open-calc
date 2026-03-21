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
      'Discrete probability underlies risk estimation, medical screening interpretation, fraud detection, card-game strategy, and randomized algorithm design.',
    previewVisualizationId: 'CardDiceLab',
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
        id: 'CardDiceLab',
        title: 'Cards and Dice Lab',
        caption: 'Switch between dice and cards to build sample-space intuition before using formulas.',
      },
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
      id: 'discrete-1-06-ex1',
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
      id: 'discrete-1-06-ex2',
      title: 'Expectation of Fair Die',
      problem: 'Compute E[X] for fair six-sided die.',
      steps: [
        { expression: 'E[X]=sum_{k=1}^6 k(1/6)', annotation: 'Definition.' },
        { expression: '=(1+2+3+4+5+6)/6=3.5', annotation: 'Arithmetic simplification.' },
      ],
      conclusion: 'Expected value can be non-attainable as a single outcome.',
    },
    {
      id: 'discrete-1-06-ex3',
      title: 'Two Dice, Sum Equals 8',
      problem: 'Roll two fair dice. Compute P(sum=8).',
      steps: [
        { expression: 'Sample space size = 6*6=36', annotation: 'Ordered outcomes (d1,d2).' },
        { expression: 'Favorable outcomes: (2,6),(3,5),(4,4),(5,3),(6,2)', annotation: 'Exactly 5 ordered pairs sum to 8.' },
        { expression: 'P(sum=8)=5/36', annotation: 'Favorable divided by total.' },
      ],
      conclusion: 'The probability is 5/36, not 1/11, because sums are not uniformly distributed.',
    },
    {
      id: 'discrete-1-06-ex4',
      title: 'Card Conditioning Intuition',
      problem: 'From a standard deck, compute P(heart|red).',
      steps: [
        { expression: 'Condition on red cards only => reduced sample space has 26 cards', annotation: 'Restricted sample space idea.' },
        { expression: 'Hearts among red cards = 13', annotation: 'Half of red cards are hearts.' },
        { expression: 'P(heart|red)=13/26=1/2', annotation: 'Conditional probability from reduced space.' },
      ],
      conclusion: 'Conditioning changes the denominator first, then counting becomes easy.',
    },
  ],

  challenges: [
    {
      id: 'discrete-1-06-ch1',
      difficulty: 'easy',
      problem: 'For independent A,B with P(A)=0.4, P(B)=0.5, find P(A intersection B).',
      walkthrough: [
        { expression: 'Independence => P(A\cap B)=P(A)P(B)', annotation: 'Use independence definition directly.' },
        { expression: '0.4*0.5=0.2', annotation: 'Multiply marginals.' },
      ],
      answer: '0.2',
    },
    {
      id: 'discrete-1-06-ch2',
      difficulty: 'medium',
      problem: 'If X takes values 0,1,2 with probs 0.2,0.5,0.3, compute E[X] and Var(X).',
      walkthrough: [
        { expression: 'E[X]=0(0.2)+1(0.5)+2(0.3)=1.1', annotation: 'Weighted average definition.' },
        { expression: 'E[X^2]=0^2(0.2)+1^2(0.5)+2^2(0.3)=1.7', annotation: 'Compute second moment.' },
        { expression: 'Var(X)=E[X^2]-E[X]^2=1.7-1.21=0.49', annotation: 'Variance identity.' },
      ],
      answer: 'E[X]=1.1, Var(X)=0.49',
    },
    {
      id: 'discrete-1-06-ch3',
      difficulty: 'hard',
      problem: 'Two fair dice are rolled. Given that the sum is even, what is P(both dice are even)?',
      walkthrough: [
        { expression: 'Even sum means both even or both odd', annotation: 'Parity rule for sums.' },
        { expression: 'P(both even)=(3/6)*(3/6)=1/4', annotation: 'Each die has 3 even faces.' },
        { expression: 'P(both odd)=(3/6)*(3/6)=1/4', annotation: 'Same count for odd faces.' },
        { expression: 'P(sum even)=1/4+1/4=1/2', annotation: 'Disjoint union of two cases.' },
        { expression: 'P(both even | sum even)=(1/4)/(1/2)=1/2', annotation: 'Conditional ratio.' },
      ],
      answer: '1/2',
    },
    {
      id: 'discrete-1-06-ch4',
      difficulty: 'hard',
      problem: 'A card is drawn uniformly from a standard deck. Event A: card is an ace. Event B: card is red. Compute P(A|B), P(B|A), and explain why they differ.',
      walkthrough: [
        { expression: 'P(A|B)=#(red aces)/#(red cards)=2/26=1/13', annotation: 'Conditioning on red card as denominator.' },
        { expression: 'P(B|A)=#(red aces)/#(aces)=2/4=1/2', annotation: 'Conditioning on ace changes denominator.' },
        { expression: 'Conditionals are directional: P(A|B) and P(B|A) usually differ', annotation: 'Common Bayes confusion in interviews.' },
      ],
      answer: 'P(A|B)=1/13, P(B|A)=1/2',
    },
    {
      id: 'discrete-1-06-ch5',
      difficulty: 'hard',
      problem: 'Three boxes each contain two coins: Box 1 has (G,G), Box 2 has (G,S), Box 3 has (S,S). You pick a box uniformly, then draw one coin and it is gold. What is the probability the other coin in that box is also gold?',
      walkthrough: [
        { expression: 'List all equally likely visible-gold outcomes', annotation: 'Treat each gold side that could be drawn as a case.' },
        { expression: 'GG contributes 2 gold-draw outcomes; GS contributes 1; SS contributes 0', annotation: 'Total visible-gold outcomes = 3.' },
        { expression: 'Favorable outcomes where partner coin is gold come only from GG and there are 2 of those 3 cases', annotation: 'Case-counting under conditional information.' },
        { expression: 'Probability = 2/3', annotation: 'Classic puzzle where intuition often says 1/2 incorrectly.' },
      ],
      answer: '2/3',
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
    'completed-example-3',
    'completed-example-4',
    'attempted-challenge-easy',
    'attempted-challenge-medium',
    'attempted-challenge-hard',
  ],
}
