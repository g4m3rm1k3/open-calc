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
  quiz: [
    {
      id: 'q1',
      type: 'choice',
      text: '"Functions map inputs to outputs." What does this mean for writing reliable code?',
      options: [
        'Functions should only do one thing — take inputs, compute, and return an output predictably',
        'Functions must always accept at least one argument',
        'Functions should never return a value — they should modify the DOM instead',
      ],
      correct: 0,
    },
    {
      id: 'q2',
      type: 'choice',
      text: '"Scope protects memory mutations." A variable declared inside a function — can code outside the function read it?',
      options: [
        'Yes — all variables are globally accessible in JavaScript',
        'No — the variable is scoped to the function and invisible to outside code',
        'Only if the function is declared with const',
      ],
      correct: 1,
    },
    {
      id: 'q3',
      type: 'choice',
      text: '"Black-box logic scales architectures." What does treating a function as a black box mean for how you use it?',
      options: [
        'You must read the function body before calling it',
        'You only need to know what it takes as input and what it returns — the internal implementation does not matter to the caller',
        'Black-box functions cannot be tested',
      ],
      correct: 1,
    },
    {
      id: 'q4',
      type: 'choice',
      text: 'You write the same calculation in five different places in your code. Why is extracting it into a function better?',
      options: [
        'Functions run faster than inline code',
        'The logic lives in one place — when it needs to change, you change it once; inline repetition means changing it everywhere',
        'Functions are required by the browser for multi-step calculations',
      ],
      correct: 1,
    },
  ],
};
