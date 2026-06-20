export default {
  id: 'w7-001',
  slug: 'build-app',
  chapter: 'w7',
  order: 1,
  title: 'Build a Full App',
  subtitle: 'Capstone Dashboard integrating Data, Reactivity, Geometry, and Time',
  tags: ['capstone', 'dashboard', 'interactive', 'system', 'build'],
  aliases: 'final project recap system architecture combined',

  hook: {
    question: 'How seamlessly does everything we just learned mathematically assemble into a modern dashboard system?',
    realWorldContext: 'In enterprise, you never execute isolated rules in a vacuum. You weave them collectively into complex interconnected logic fabrics. The Capstone integrates every phase synchronously.',
    previewVisualizationId: 'CapstoneSystemViz',
  },

  intuition: {
    prose: [
      '**Where you are in the story:** This is the pinnacle. You natively understand the core tree (HTML), the structural constraints (CSS), the memory mechanics (Variables), the temporality (Event Loop), the rendering automation (Components), and the remote bridges (APIs).',
      'The Capstone System binds all six dimensions fundamentally together. A live, dynamic dashboard interface requires the underlying HTML to remain perfectly synchronized to remote data updates through reactive memory structures across the network timeline.',
      'There is no new theory introduced here. Only explicit, systematic execution.'
    ],
    callouts: [
      {
        type: 'sequencing',
        title: 'Lesson 1 of 1 — Capstone System',
        body: '**Previous:** Abstract Logic Architectures.\n**This lesson:** Hands-on integration.\n**Next:** Mastery of building generic digital interfaces.',
      }
    ],
    visualizations: [
      {
        id: 'WebLesson19_Capstone',
        title: 'The System Sandbox',
        caption: 'A simulated full dashboard application mapping its internal structural layers simultaneously alongside the physical UI output.',
        mathBridge: 'Step 1: Toggle the isolated system layers representing DOM, State, Events, and the Networking core natively. Step 2: Use the dashboard interface and observe precisely how user execution cascades fundamentally across all four abstract topologies simultaneously.'
      }
    ]
  },

  math: { prose: [], callouts: [], visualizations: [] },
  rigor: { prose: [], callouts: [], visualizations: [] },

  examples: [],
  challenges: [],

  semantics: {
    core: [
      { symbol: 'Systemic Execution', meaning: 'The flawless harmony achieved when separate mathematical programming abstractions combine sequentially into reality.' }
    ]
  },
  spiral: { recoveryPoints: [], futureLinks: [] },
  assessment: { questions: [] },
  mentalModel: [
    'Everything operates simultaneously.',
    'UI translates structural reality natively.',
    'You are executing complete systems.'
  ],
  checkpoints: ['read-intuition', 'read-math'],
  quiz: [
    {
      id: 'q1',
      type: 'choice',
      text: '"Everything operates simultaneously." In a full application, what does this mean in practice?',
      options: [
        'All code runs in parallel threads simultaneously',
        'State, async data fetching, UI rendering, and event handling are all active at once — you must design for their interaction, not treat them as sequential steps',
        'Multiple users can edit the same file at the same time',
      ],
      correct: 1,
    },
    {
      id: 'q2',
      type: 'choice',
      text: '"UI translates structural reality natively." When your app data changes, what should the UI do automatically?',
      options: [
        'Alert the user that data has changed and ask them to refresh',
        'Re-render to reflect the new data — the UI is a direct translation of state, so state changes always produce updated UI',
        'Write the change to localStorage first, then render',
      ],
      correct: 1,
    },
    {
      id: 'q3',
      type: 'choice',
      text: '"You are executing complete systems." What distinguishes a complete system from a collection of features?',
      options: [
        'A complete system has more features than a collection',
        'The layers communicate coherently — state, services, and UI work together in a predictable data flow rather than being independently patched together',
        'A complete system uses a framework; a collection uses vanilla JavaScript',
      ],
      correct: 1,
    },
    {
      id: 'q4',
      type: 'choice',
      text: 'You built a working app — it fetches data, updates state, and re-renders correctly. A user reports that on slow connections it shows broken UI. Which layer of the system needs attention?',
      options: [
        'The View layer — add more CSS to handle empty states',
        'The async/state layer — you are missing loading and error states that handle the time between request start and data arrival',
        'The architecture layer — you need to switch to a different framework',
      ],
      correct: 1,
    },
  ],
};
