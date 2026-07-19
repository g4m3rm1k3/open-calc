import bayesTreeUrl from '../diagrams/dm-bayes-tree.svg?url'

export default {
  id: 'discrete-1-06',
  slug: 'discrete-probability',
  chapter: 'discrete-4',
  order: 1,
  title: 'Discrete Probability',
  subtitle: 'Finite sample spaces, conditional probability, Bayes rule, and random variables',
  tags: ['probability', 'conditional probability', 'bayes', 'random variable', 'expectation'],
  aliases: 'discrete probability bayes theorem conditional independence expectation variance',

  hook: {
    question:
      'A test is 99% accurate. If you test positive, what is the chance you actually have the condition?',
    realWorldContext:
      'Discrete probability underlies risk estimation, medical screening interpretation, fraud detection, card-game strategy, and randomized algorithm design.',
  },

  intuition: {
    prose: [
      `### Probability Is Counting With Normalization

On a **finite sample space** — a finite set S of every possible outcome — probability is nothing more exotic than counting: P(event) = (number of favorable outcomes) / (total number of outcomes), *provided* every outcome is equally likely. Roll a fair six-sided die: S = {1,2,3,4,5,6}, and P(rolling a 4) = 1/6 because exactly one of the six equally-likely outcomes is a 4. Every probability formula in this lesson is ultimately a bookkeeping device built on top of this one idea — which is exactly why the counting and combinatorics lesson is the direct prerequisite here.

If you're not naturally a "math person," resist memorizing formulas first. Start every problem by naming the sample space in plain language — what, concretely, are all the possible outcomes? — then define the event you care about as a subset of that space. The formula falls out once the space and event are both nailed down precisely; skipping this step is the single most common source of wrong answers.`,

      `### Conditional Probability: Zooming In

**Conditional probability** answers: given that we already know B happened, what's the chance A also happened? P(A|B) restricts the entire sample space down to just the outcomes where B occurred, then asks what fraction of *that* smaller space also satisfies A.

Concretely: among a standard deck's 52 cards, P(heart) = 13/52 = 1/4. But P(heart | red) is different — once you're told the card is red, the sample space shrinks from all 52 cards down to just the 26 red ones, and hearts make up 13 of those 26. So P(heart | red) = 13/26 = 1/2 — a much higher probability than the unconditioned 1/4, because knowing the card is red already eliminates every black card (and half of black cards would have made "heart" impossible anyway — knowing "red" pre-filters toward exactly the cards where "heart" has decent odds).`,

      `### Bayes' Rule: Inverting the Condition

Bayes' Rule solves a specific, treacherous problem: you know P(evidence | hypothesis), but what you actually want is P(hypothesis | evidence) — and these are *not* the same number, even though they're easy to conflate. "If you have the disease, the test is 95% likely to come back positive" (P(test+|disease)) is a completely different statement from "if you tested positive, you're 95% likely to have the disease" (P(disease|test+)). Confusing the two is called the *base rate fallacy*, and it is one of the most consequential reasoning errors in medicine, law, and everyday risk assessment.

The hook question at the top of this lesson — a 99%-accurate test comes back positive, what's the real chance you're sick? — is answered properly further down, and the answer surprises almost everyone the first time they compute it honestly.`,

      `### From Gambling to Science: A Brief History

Probability theory has an unusually traceable origin: in 1654, the gambler Chevalier de Méré asked Blaise Pascal a question about dice games, and Pascal's correspondence with Pierre de Fermat over that problem is generally credited as the birth of the field. For roughly a century, probability stayed tied to gambling. Pierre-Simon Laplace then generalized it into a genuine mathematical theory of uncertainty, and by the 20th century probability had become the formal language of statistics, quantum mechanics, and machine learning — a direct line from "should I bet on this dice roll" to "how confident should this medical test make me."`,

      `### The Habit That Prevents Most Mistakes

Before touching any formula, convert the word problem into a table (for two binary events) or a tree (for sequential/conditional events). A 2×2 table with rows {disease, no disease} and columns {test+, test−} makes every quantity in a Bayes problem visible simultaneously — you can *see* why a rare disease keeps the false-positive count large relative to true positives, instead of having to trust the algebra blindly.`,
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'Conditional Probability',
        body: 'P(A|B)=\\frac{P(A\\cap B)}{P(B)} \\quad (P(B)>0)\n\nRead the denominator as "the new, restricted universe" and the numerator as "the part of that universe where A also holds."',
      },
      {
        type: 'theorem',
        title: 'Bayes Rule',
        body: 'P(A|B)=\\frac{P(B|A)P(A)}{P(B)}\n\nThis is exactly the definition of conditional probability applied twice: P(A\\cap B) = P(B|A)P(A) = P(A|B)P(B), then solve for P(A|B).',
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
      `![Probability tree for the disease test: prevalence branches into disease/no-disease, each branching again into test+/test−](${bayesTreeUrl})`,

      'A **discrete random variable** X is a function that maps each outcome in the sample space to a number — turning "the outcome was heads" into "X = 1," for instance, so that outcomes can be added, averaged, and compared numerically. **Expectation** E[X] is the probability-weighted average of every value X can take: E[X] = Σ x·p(x), summed over every possible value x. It is not "the most likely outcome" — for a fair die, E[X] = 3.5, a value the die can never actually show, but it is exactly the long-run average if you rolled the die millions of times and averaged the results.',

      'The tree diagram above makes the disease-test problem completely mechanical: the prevalence branches into "has disease" (1%) and "no disease" (99%); each of those branches again into "tests positive" and "tests negative" using the sensitivity and specificity rates. Every path from root to leaf is one multiplication of branch probabilities, and P(disease | positive) is just (the one path through "disease AND positive") divided by (the sum of every path that ends in "positive"). This is the Law of Total Probability and Bayes\' Rule, made completely visible instead of memorized as symbols.',

      '**Variance** measures how spread out X\'s values are around its own expectation: Var(X) = E[(X − E[X])²] — the average squared distance from the mean. Squaring matters because it treats being 2 below the mean the same as being 2 above it (a plain average of differences would always cancel to zero); the algebraically convenient computational form is Var(X) = E[X²] − E[X]², derived by expanding the square and using linearity of expectation.',
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'Law of Total Probability',
        body: 'If {B_i} partitions the sample space (the B_i are disjoint and their union is everything), then P(A)=\\sum_i P(A|B_i)P(B_i).\n\nThis is exactly what the tree diagram computes: sum, over every path that ends the way you care about, the product of probabilities along that path.',
      },
    ],
  },

  rigor: {
    prose: [
      'Bayes\' theorem follows immediately from writing P(A ∩ B) two different ways and setting them equal: by definition of conditional probability, P(A ∩ B) = P(A|B)·P(B), and symmetrically P(A ∩ B) = P(B|A)·P(A). Since both expressions equal the same quantity P(A ∩ B), they equal each other: P(A|B)·P(B) = P(B|A)·P(A). Dividing both sides by P(B) gives Bayes\' Rule directly — it is not a separate axiom, just an algebraic consequence of the definition of conditional probability applied from both directions.',

      'Always define the sample space and any event partition explicitly, in writing, before computing a single conditional probability. The single most common error in probability proofs (and in interview problems) is an implicit, unstated sample space — computing P(A|B) against the wrong denominator because the "restricted universe" was never precisely pinned down. State S, state the events as subsets of S, and only then start dividing.',
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
        { expression: '\\text{Independence} \\implies P(A \\cap B)=P(A)P(B)', annotation: 'Use independence definition directly.' },
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
        { expression: 'P(A|B) = \\frac{n(\\text{red aces})}{n(\\text{red cards})} = \\frac{2}{26} = \\frac{1}{13}', annotation: 'Conditioning on red card as denominator.' },
        { expression: 'P(B|A) = \\frac{n(\\text{red aces})}{n(\\text{aces})} = \\frac{2}{4} = \\frac{1}{2}', annotation: 'Conditioning on ace changes denominator.' },
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
    { lessonSlug: 'sets-and-functions-for-discrete', label: 'Sets and Functions', context: 'Events are sets and probability laws mirror set identities (union, intersection, complement).' },
    { lessonSlug: 'algorithms-and-complexity', label: 'Algorithms and Complexity', context: 'Randomized algorithms require probabilistic reasoning about outcomes.' },
  ],

  checkpoints: [
    'read-intuition',
    'read-math',
    'read-rigor',
    'completed-example-1',
    'completed-example-2',
    'completed-example-3',
    'completed-example-4',
    'attempted-challenge-easy',
    'attempted-challenge-medium',
    'attempted-challenge-hard',
  ],
  semantics: {
    core: [
      { symbol: 'S', meaning: 'Sample Space — the set of all possible outcomes' },
      { symbol: 'E ⊆ S', meaning: 'Event — a subset of the sample space' },
      { symbol: 'P(E)', meaning: 'Probability of E — |E|/|S| in uniform spaces' },
      { symbol: 'P(A|B)', meaning: 'Conditional Probability — chance of A given B occurred' },
      { symbol: 'E[X]', meaning: 'Expectation — the long-run average value of random variable X' },
      { symbol: 'A ⊥ B', meaning: 'Independence — P(A ∩ B) = P(A)P(B)' },
    ],
    rulesOfThumb: [
      'Complement: P(not E) = 1 - P(E).',
      'Union: P(A ∪ B) = P(A) + P(B) - P(A ∩ B).',
      'Bayes: Posterior = (Likelihood × Prior) / Evidence.',
      'Expectation is Linear: E[X+Y] = E[X] + E[Y] even if X and Y are dependent.',
    ],
  },

  spiral: {
    recoveryPoints: [
      {
        lessonId: 'discrete-1-04',
        label: 'Counting and Combinatorics',
        note: 'Discrete probability is essentially counting favorable outcomes and dividing by total outcomes. Combinatorial tools like C(n,k) are your primary calculation engine.',
      },
    ],
    futureLinks: [
      {
        lessonId: 'discrete-1-13',
        label: 'Algorithms and Complexity',
        note: 'Randomized algorithms (like Quicksort) use expectation to prove average-case efficiency.',
      },
    ],
  },

  mentalModel: [
    'Probability is "Normalized Counting".',
    'Conditional probability is "Zooming In" on a specific subset of the universe.',
    'Independence means one event "Carries No Information" about the other.',
    'Bayes Theorem is the "Mechanism of Learning" — updating beliefs based on evidence.',
  ],

  assessment: {
    questions: [
      {
        id: 'prob-assess-1',
        type: 'choice',
        text: 'If you roll a fair 6-sided die, what is the probability of rolling a number greater than 4?',
        options: ['1/6', '1/3', '1/2', '2/3'],
        answer: '1/3',
        hint: 'Favorable outcomes are {5, 6}. Total outcomes are 6.',
      },
      {
        id: 'prob-assess-2',
        type: 'input',
        text: 'If P(A) = 0.5 and P(B|A) = 0.4, what is P(A ∩ B)?',
        answer: '0.2',
        hint: 'Use the definition: P(A ∩ B) = P(A) * P(B|A).',
      },
    ],
  },

  quiz: [
    {
      id: 'prob-q1',
      type: 'choice',
      text: 'Which rule allows you to update the probability of a hypothesis after seeing new evidence?',
      options: ['The Product Rule', 'The Inclusion-Exclusion Principle', 'Bayes Theorem', 'The Law of Large Numbers'],
      answer: 'Bayes Theorem',
      hints: ['Bayes Theorem calculates P(Hypothesis | Evidence).'],
    },
    {
      id: 'prob-q2',
      type: 'choice',
      text: 'What is the sum of probabilities of all possible outcomes in a sample space S?',
      options: ['0', '0.5', '1', 'Infinity'],
      answer: '1',
      hints: ['The total probability of the entire sample space is always 100% or 1.'],
    },
  ],
}
