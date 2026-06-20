export default {
  id: 'w1-003',
  slug: 'css-rule-engine',
  chapter: 'w1',
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
  quiz: [
    {
      id: 'q1',
      type: 'choice',
      text: 'Two CSS rules target the same element and set the same property to different values. What decides which one wins?',
      options: [
        'The rule that appears first in the stylesheet always wins',
        'Specificity — the more specific selector wins; when specificity is equal, the later rule wins',
        'The browser picks whichever value is alphabetically first',
      ],
      correct: 1,
    },
    {
      id: 'q2',
      type: 'choice',
      text: 'Which selector has higher specificity: a class (.button) or a tag (button)?',
      options: [
        'The tag selector — it is more fundamental to HTML',
        'The class selector — classes carry more specificity weight than element selectors',
        'They are equal — specificity only differs for IDs vs classes',
      ],
      correct: 1,
    },
    {
      id: 'q3',
      type: 'choice',
      text: '"Higher math weight always trumps load order." What does this mean when a later stylesheet tries to override an earlier rule?',
      options: [
        'The later stylesheet always wins, regardless of specificity',
        'If the earlier rule has higher specificity, it wins even though it was loaded first — specificity beats order',
        'You must use !important to override any earlier rule',
      ],
      correct: 1,
    },
    {
      id: 'q4',
      type: 'choice',
      text: 'CSS "matches patterns against the DOM." What does this mean about when styles are applied?',
      options: [
        'Styles are applied once when the page loads and never update',
        'The browser continuously matches CSS selectors against the live DOM — when the DOM changes, matching re-runs',
        'CSS matches only happen when JavaScript explicitly triggers a repaint',
      ],
      correct: 1,
    },
  ],
};
