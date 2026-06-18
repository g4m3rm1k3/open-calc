export default {
  id: 'w2-002',
  slug: 'functions',
  chapter: 'w2',
  order: 2,
  title: 'Functions as Transformations',
  subtitle: 'Functions map geometric input directly to determined output',
  tags: ['javascript', 'js', 'functions', 'parameters', 'returns'],
  aliases: 'methods mapping variables algorithms',

  hook: {
    question: 'How do you prevent a system from becoming a chaotic tangle of millions of line-by-line instructions?',
    realWorldContext: 'Engineering scales entirely through encapsulation. Functions wrap complex transformation algorithms into isolated black-box machines.',
    previewVisualizationId: 'WebLesson06_Functions',
  },

  intuition: {
    prose: [
      '**Where you are in the story:** We now have memory via variables. But memory without transformation is just data storage. We need a way to mathematically mutate that state.',
      'A function is functionally a computational machine. It accepts raw material inputs (parameters), applies a strict algorithmic mutation layer internally, and ejects a finished mathematical output.',
      'Because the variables inside an executing function strictly disappear from memory once finished (Scope), you can safely reuse the same machine thousands of times without cross-contaminating systems.',
      '**Where this is heading:** Once we establish isolated functional logic, we hook these functions directly into the browser\'s user input timeline as **Event Listeners**.'
    ],
    callouts: [
      {
        type: 'sequencing',
        title: 'Lesson 2 of 5 — JavaScript as Behavior',
        body: '**Previous:** Allocating system memory via variables.\n**This lesson:** Transforming memory via functions.\n**Next:** Triggering functions through async events.',
      }
    ],
    visualizations: [
      {
        id: 'WebLesson06_Functions',
        title: 'The Function Machine',
        caption: 'Adjust the raw inputs and systematically watch the algorithm pipeline return novel outputs.',
        mathBridge: 'Step 1: Increase the parameter slider numerically. Step 2: Observe the block pipeline. The key lesson: A function operates blindly on strictly whatever is dropped into its scope.'
      }
    ]
  },

  math: { prose: [], callouts: [], visualizations: [] },
  rigor: { prose: [], callouts: [], visualizations: [] },

  examples: [],
  challenges: [],

  semantics: {
    core: [
      { symbol: '() => {}', meaning: 'Arrow function syntax: mathematically mapping parameters safely to block scope actions.' }
    ],
    rulesOfThumb: [
      'A function should accomplish exactly one semantic transformation.'
    ]
  },
  spiral: { recoveryPoints: [], futureLinks: [] },
  assessment: { questions: [] },
  mentalModel: [
    'Functions map inputs to outputs.',
    'Scope protects memory mutations.',
    'Black-box logic scales architectures.'
  ],
  checkpoints: ['read-intuition', 'read-math'],
  quiz: []
};
