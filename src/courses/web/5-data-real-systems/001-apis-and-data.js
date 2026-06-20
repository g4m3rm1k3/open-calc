export default {
  id: 'w5-001',
  slug: 'apis-and-data',
  chapter: 'w5',
  order: 1,
  title: 'APIs and Data Flow',
  subtitle: 'Applications communicate with entirely external remote systems natively',
  tags: ['api', 'network', 'json', 'fetch', 'requests'],
  aliases: 'fetch json remote rest api data',

  hook: {
    question: 'How does an airline application know a flight was delayed 7 seconds ago in Tokyo?',
    realWorldContext: 'If applications could only read local memory, the web would just be static calculators. APIs bridge local interface logic to planetary-scale remote clusters.',
    previewVisualizationId: 'ApiDataFlowViz',
  },

  intuition: {
    prose: [
      '**Where you are in the story:** Our UI perfectly updates itself continuously based on local State. Now we shatter the boundaries of the isolated browser tab and connect to the web.',
      'An Application Programming Interface (API) is functionally a strictly defined mathematical contract. A server agrees: "If you send me a correctly formatted request over the network, I will return data."',
      'Because JavaScript is the universal language of the web, this data is uniformly serialized into JSON (JavaScript Object Notation)—a raw text string that natively structurally maps directly into JS objects and arrays.',
      '**Where this is heading:** Fetching data involves temporal delays. When integrating remote data, we must instantly apply our Phase 3 Async logic to gracefully handle the Network transmission time.'
    ],
    callouts: [
      {
        type: 'sequencing',
        title: 'Lesson 1 of 2 — Data & Real Systems',
        body: '**Previous:** Mastering declarative UI components.\n**This lesson:** Pulling live data across network borders.\n**Next:** Harmonizing network latency entirely with local reactive UI states.',
      }
    ],
    visualizations: [
      {
        id: 'WebLesson14_APIs',
        title: 'Network Traversal Visualizer',
        caption: 'Adjust the network latency parameter and watch a packet traverse from the remote server down to the UI Layer.',
        mathBridge: 'Step 1: Increase the latency slider to 3000ms. Step 2: Trigger a fetch command. The key lesson: The UI sits idle waiting strictly for the JSON packet to natively resolve through the network socket.'
      }
    ]
  },

  math: { prose: [], callouts: [], visualizations: [] },
  rigor: { prose: [], callouts: [], visualizations: [] },

  examples: [],
  challenges: [],

  semantics: {
    core: [
      { symbol: 'JSON', meaning: 'The universal serializable text format directly mirroring standard programming structural trees' },
      { symbol: 'Fetch', meaning: 'The native browser engine module that initializes an asynchronous network socket' }
    ]
  },
  spiral: { recoveryPoints: [], futureLinks: [] },
  assessment: { questions: [] },
  mentalModel: [
    'APIs are defined data contracts.',
    'JSON is just stringified tree logic.',
    'Network calls inherently demand Time.'
  ],
  checkpoints: ['read-intuition', 'read-math'],
  quiz: [
    {
      id: 'q1',
      type: 'choice',
      text: '"APIs are defined data contracts." What does this mean for how you use an API?',
      options: [
        'You can request any data format and the server will adapt',
        'The API specifies exactly what you send and what you get back — you must follow the contract or requests will fail',
        'APIs are informal — the server will infer what you want from context',
      ],
      correct: 1,
    },
    {
      id: 'q2',
      type: 'choice',
      text: '"JSON is just stringified tree logic." What is JSON actually?',
      options: [
        'A database format used by browsers',
        'A text format for representing structured data — objects and arrays serialised as a string for transmission',
        'A JavaScript function for making network requests',
      ],
      correct: 1,
    },
    {
      id: 'q3',
      type: 'choice',
      text: '"Network calls inherently demand Time." What does this mean for your UI?',
      options: [
        'You should block the UI until data arrives to avoid showing stale content',
        'Data will not arrive instantly — you must handle the loading state and show the user that something is happening',
        'Network calls are fast enough that loading states are unnecessary',
      ],
      correct: 1,
    },
    {
      id: 'q4',
      type: 'choice',
      text: 'You receive data from an API as a JSON string. Before you can access its properties, what must you do?',
      options: [
        'Nothing — JSON is already a JavaScript object',
        'Parse it with JSON.parse() to convert the string into an actual JavaScript object',
        'Decode it using atob() which converts JSON to objects',
      ],
      correct: 1,
    },
  ],
};
