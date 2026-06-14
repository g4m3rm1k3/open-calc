export default {
  id: 'w3-001',
  slug: 'event-loop',
  chapter: 'w3',
  order: 1,
  title: 'The Event Loop',
  subtitle: 'JavaScript is single-threaded but natively time-aware',
  tags: ['javascript', 'event loop', 'async', 'call stack', 'task queue'],
  aliases: 'timeout single thread asynchronous blocking',

  hook: {
    question: 'If JavaScript can only do one thing at a time, how can it wait for a 5-second network response without freezing the entire browser?',
    realWorldContext: 'The Event Loop is the most misunderstood engine mechanic in JavaScript. Without it, the UI would lock up constantly whenever data is fetched or timers run.',
    previewVisualizationId: 'WebLesson09_EventLoop',
  },

  intuition: {
    prose: [
      '**Where you are in the story:** We hooked into events to manipulate the DOM tree. But standard functions execute synchronously (blocking). We need to handle unpredictable time delays.',
      'JavaScript operates on a single execution thread. This means it has exactly one Call Stack. If a mathematically intense function takes 5 seconds to solve, the UI completely freezes for 5 seconds.',
      'To prevent this, the browser spins off timers, requests, and listeners natively in C++ off the main thread. When they finish, they enqueue their JS callback functions into a Task Queue. The elusive **Event Loop** constantly monitors both: if the Call Stack is empty, it pushes the next Queue item up for execution.',
      '**Where this is heading:** Once we grasp this temporal offloading, we need rigorous syntax structures (Promises, Async/Await) to properly chain and synchronize these delayed queue tasks together.'
    ],
    callouts: [
      {
        type: 'sequencing',
        title: 'Lesson 1 of 2 — Time & Asynchrony',
        body: '**Previous:** Real-time synchronous DOM mutation.\n**This lesson:** Non-blocking temporal execution architectures.\n**Next:** Synchronizing multiple delayed asynchronous tasks.',
      }
    ],
    visualizations: [
      {
        id: 'WebLesson09_EventLoop',
        title: 'The Event Loop Animation',
        caption: 'Watch functions bounce between the Call Stack, Web APIs, and the Task Queue.',
        mathBridge: 'Step 1: Execute the asynchronous simulator block. Step 2: Notice the `setTimeout` callback bypass the immediate stack and wait in the queue. The key lesson: The queue dictates the execution timeline completely independent of the written code order.'
      }
    ]
  },

  math: { prose: [], callouts: [], visualizations: [] },
  rigor: { prose: [], callouts: [], visualizations: [] },

  examples: [],
  challenges: [],

  semantics: {
    core: [
      { symbol: 'Call Stack', meaning: 'The immediate execution tracker handling synchronous blocks' },
      { symbol: 'Task Queue', meaning: 'The waiting line for asynchronous callbacks attempting to enter the stack' }
    ]
  },
  spiral: { recoveryPoints: [], futureLinks: [] },
  assessment: { questions: [] },
  mentalModel: [
    'JS is strictly single-threaded.',
    'Heavy sync functions block the UI paint.',
    'The Loop feeds the empty stack.'
  ],
  checkpoints: ['read-intuition', 'read-math'],
  quiz: []
};
