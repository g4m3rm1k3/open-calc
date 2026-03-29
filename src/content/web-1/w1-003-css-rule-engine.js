export default {
  id: 'w1-003',
  slug: 'css-rule-engine',
  chapter: 1,
  order: 3,
  title: 'CSS as a Rule Engine',
  subtitle: 'Pattern matching, the cascade, and specificity weights',
  tags: ['css', 'cascade', 'specificity', 'styling', 'selectors'],
  aliases: 'pattern matching css hierarchy inheritance',

  hook: {
    question: 'When two conflicting design rules target the exact same button, how does the browser mathematically decide which one wins?',
    realWorldContext: 'In massive production CSS architectures, styles clash. Understanding the deterministic "cascade" algorithm prevents brittle stylesheets and hours of debugging.',
    previewVisualizationId: 'WebLesson03_CSSCascade',
  },

  intuition: {
    prose: [
      '**Where you are in the story:** We have an established DOM tree defined by semantic HTML. Now we want to visually decorate it. We do this by feeding rules into a cascading engine.',
      'CSS is not a scripting language; it is a **pattern matching rule engine**. You declare a "selector" (the pattern to match on the tree) and a payload of styles.',
      'The real complexity is the Cascade. If an ID selector and a Class selector both command the same element to have disparate colors, the engine calculates a strict mathematical Specificity weight to declare a victor.',
      '**Where this is heading:** Once styling logic is mastered, we push CSS to its limits by using it natively to solve geometric 2D layout constraints via Box Model and Flexbox mathematics.'
    ],
    callouts: [
      {
        type: 'sequencing',
        title: 'Lesson 3 of 4 — The Web as a System',
        body: '**Previous:** Structural semantics with HTML.\n**This lesson:** Applying math-based cascading layout rules (CSS).\n**Next:** Advanced CSS constraint solving for layouts.',
      }
    ],
    visualizations: [
      {
        id: 'WebLesson03_CSSCascade',
        title: 'The Cascade Resolver',
        caption: 'Watch competing CSS rules attempt to overwrite styles based on specificity weight.',
        mathBridge: 'Step 1: Increase the class rule specificity using the dynamic slider. Step 2: See the element instantaneously swap from red to blue as the formula algorithm flips. The key lesson: Specificity mathematically outranks execution order.'
      }
    ]
  },

  math: { prose: [], callouts: [], visualizations: [] },
  rigor: { prose: [], callouts: [], visualizations: [] },

  examples: [],
  challenges: [],

  semantics: {
    core: [
      { symbol: '.class', meaning: 'Class selector pattern matching (weight 10)' },
      { symbol: '#id', meaning: 'ID selector pattern matching (weight 100)' }
    ],
    rulesOfThumb: [
      'The engine reads from top to bottom unless specificity outranks order.',
      'Never use IDs for styling to preserve component reusability.'
    ]
  },
  spiral: { recoveryPoints: [], futureLinks: [] },
  assessment: { questions: [] },
  mentalModel: [
    'CSS matches patterns against the DOM.',
    'Specificity weight decides style clashes.',
    'Higher math weight always trumps load order.'
  ],
  checkpoints: ['read-intuition', 'read-math'],
  quiz: []
};
