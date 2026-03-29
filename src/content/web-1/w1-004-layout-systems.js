export default {
  id: 'w1-004',
  slug: 'layout-systems',
  chapter: 1,
  order: 4,
  title: 'Layout Systems',
  subtitle: 'Constraint solving via the Box Model and Flexbox',
  tags: ['layout', 'css', 'box model', 'flexbox', 'grid'],
  aliases: 'constraints boxes dynamic rendering flow',

  hook: {
    question: 'How does an interface fluidly rearrange itself instantly without JS when a screen rotates?',
    realWorldContext: 'Modern responsive application scaffolding purely relies on deep internal C++ browser engines solving spatial CSS constraints natively via Flex and Grid algorithms.',
    previewVisualizationId: 'WebLesson04_Layout',
  },

  intuition: {
    prose: [
      '**Where you are in the story:** We mapped HTML structure and established CSS specificity. Now we apply structural CSS commands to physically dictate geometry and 2D canvas limits.',
      'Under the hood, all layout is a geometric constraint solver. Everything on the web is secretly a rectangle (The **Box Model**), defined precisely by its content, internal padding, border walls, and external margin buffer.',
      'When you utilize **Flexbox**, you are establishing a dynamic 1D mathematical layout axis where elements forcefully contract, expand, and distribute their remaining spatial coordinates automatically based on the constraints (rules) you provide.',
      '**Where this is heading:** Once the static interface is successfully painted and structurally robust, we move entirely into the next epoch: injecting dynamic active behavior and state using JavaScript.'
    ],
    callouts: [
      {
        type: 'sequencing',
        title: 'Lesson 4 of 4 — The Web as a System',
        body: '**Previous:** Resolving CSS specificity.\n**This lesson:** Rendering constraints into visual 2D layouts.\n**Next:** We start Phase 2 — JavaScript as Behavior.',
      }
    ],
    visualizations: [
      {
        id: 'WebLesson04_Layout',
        title: 'Flexbox Constraint Solver',
        caption: 'Toggle flex properties on containers and drag elements to see real-time layout recalculations.',
        mathBridge: 'Step 1: Enable the "Show invisible boxes" toggle to see the true boundaries. Step 2: Switch the flex direction axis constraint from row to column. The key lesson: Sibling boxes physically adapt natively according to inherited geometry parent limits.'
      }
    ]
  },

  math: { prose: [], callouts: [], visualizations: [] },
  rigor: { prose: [], callouts: [], visualizations: [] },

  examples: [],
  challenges: [],

  semantics: {
    core: [
      { symbol: 'Box Model', meaning: 'The fundamental standard sizing constraints consisting of margin, border, padding, and content' }
    ],
    rulesOfThumb: [
      'Always utilize Box-Sizing: border-box to lock widths computationally.',
      'Flexbox solves spatial relationships on a singular row/column axis.'
    ]
  },
  spiral: { recoveryPoints: [], futureLinks: [] },
  assessment: { questions: [] },
  mentalModel: [
    'Everything visually rendered is secretly a rect box.',
    'Layout equations solve for remaining available axes space.',
    'Parents mathematically distribute children natively.'
  ],
  checkpoints: ['read-intuition', 'read-math'],
  quiz: []
};
