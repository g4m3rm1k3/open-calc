export default {
  id: 'w3-002',
  slug: 'async-patterns',
  chapter: 'w3',
  order: 2,
  title: 'Async Patterns',
  subtitle: 'Managing delayed logic execution mathematically pipelines',
  tags: ['javascript', 'async', 'promises', 'await', 'then'],
  aliases: 'callbacks promises then catch asynchronous resolution',

  hook: {
    question: 'How do you structure code when Step B relies entirely on Step A, but Step A takes exactly 2 unpredictable seconds to finish?',
    realWorldContext: 'Database queries, network requests, and cryptographic operations are inherently asynchronous. Badly structured async logic leads natively to "Callback Hell" and system fragility.',
    previewVisualizationId: 'WebLesson10_Async',
  },

  intuition: {
    prose: [
      '**Where you are in the story:** You now understand that the Event Loop manages non-blocking logic. We must learn the formal syntactic patterns used to define and control this logic.',
      'Historically, developers used nested Functions (Callbacks). This created a pyramid of doom. Modern architectures solve this mathematically using **Promises**.',
      'A Promise is an object representing the eventual completion (or failure) of an asynchronous operation. You can chain formal `.then()` actions onto it securely, or utilize the semantic `async/await` syntax to make asynchronous code physically read like synchronous code.',
      '**Where this is heading:** Time is solved. Now we apply these async delays precisely alongside Reactivity to create our final form: Stateful Component UIs.'
    ],
    callouts: [
      {
        type: 'sequencing',
        title: 'Lesson 2 of 2 — Time & Asynchrony',
        body: '**Previous:** Structural engine mechanics via the Event Loop.\n**This lesson:** Orchestrating delayed operations via Promises.\n**Next:** We start Phase 4 — Reactive UI Architectures.',
      }
    ],
    visualizations: [
      {
        id: 'WebLesson10_Async',
        title: 'Asynchronous Timeline',
        caption: 'Watch a Promise transition from Pending to Fulfilled along a timeline.',
        mathBridge: 'Step 1: Initiate the mock network request. Step 2: Observe the State switch and instantly trigger the `.then()` block downstream. The key lesson: A Promise is a persistent container for a future value.'
      }
    ]
  },

  math: { prose: [], callouts: [], visualizations: [] },
  rigor: { prose: [], callouts: [], visualizations: [] },

  examples: [],
  challenges: [],

  semantics: {
    core: [
      { symbol: 'Promise', meaning: 'An object representing the future resolved or rejected state of a process' },
      { symbol: 'await', meaning: 'Computationally halts the local async function execution until the Promise resolves' }
    ]
  },
  spiral: { recoveryPoints: [], futureLinks: [] },
  assessment: { questions: [] },
  mentalModel: [
    'Promises are asynchronous wrappers.',
    'Await blocks locally, not globally.',
    'They map time-delayed logic cleanly.'
  ],
  checkpoints: ['read-intuition', 'read-math'],
  quiz: [
    {
      id: 'q1',
      type: 'choice',
      text: '"Promises are asynchronous wrappers." What does a Promise represent?',
      options: [
        'A function that will be called later',
        'A value that may not be available yet — a container for an eventual result',
        'A timer that runs code after a delay',
      ],
      correct: 1,
    },
    {
      id: 'q2',
      type: 'choice',
      text: '"Await blocks locally, not globally." What does this mean?',
      options: [
        'await freezes the entire page while waiting',
        'await pauses the current async function and returns control to the caller — the rest of the program continues running',
        'await is the same as a synchronous delay and blocks everything',
      ],
      correct: 1,
    },
    {
      id: 'q3',
      type: 'choice',
      text: 'You await a fetch call that takes 2 seconds. Does the user\'s ability to click buttons on the page pause for those 2 seconds?',
      options: [
        'Yes — await pauses all JavaScript',
        'No — only the async function pauses; the event loop continues processing clicks and other events',
        'It depends on whether the fetch is in a Web Worker',
      ],
      correct: 1,
    },
    {
      id: 'q4',
      type: 'choice',
      text: '"They map time-delayed logic cleanly." What problem did Promises solve compared to callback-based async code?',
      options: [
        'Callbacks were too slow; Promises are faster',
        'Deeply nested callbacks ("callback hell") made async code hard to read and error-proof; Promises allow flat, chainable flow',
        'Callbacks required internet access; Promises work offline',
      ],
      correct: 1,
    },
  ],
};
