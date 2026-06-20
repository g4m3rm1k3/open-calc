export default {
  id: 'w5-002',
  slug: 'state-async-combined',
  chapter: 'w5',
  order: 2,
  title: 'State + Async Combined',
  subtitle: 'Real applications are strictly temporal state-machines',
  tags: ['async', 'state', 'loading', 'ui', 'errors'],
  aliases: 'loading spinners error boundaries combining async and state',

  hook: {
    question: 'How do you prevent a user from clicking "Submit" 40 times while an API request is already running in the background?',
    realWorldContext: 'Over 90% of front-end bugs in production systems relate directly to unpredictable asynchronous timing mismatching with local user interactions.',
    previewVisualizationId: 'AsyncStateCombinedViz',
  },

  intuition: {
    prose: [
      '**Where you are in the story:** We understand data fetching and we understand state. Now we rigorously combine them to model realistic application lifecycles.',
      'A component fetching data cannot just have one state ("Data"). It mathematically must possess at least three distinct states: Loading (Pending), Success (Data), and Error (Failed).',
      'The true job of a frontend engineer is defensively orchestrating the Declarative UI to visually react seamlessly to all three potential temporal realities.',
      '**Where this is heading:** Our foundational capabilities are complete. We possess UI, Logic, Timing, and Data. In Phase 6, we push these constructs to their absolute computing limits by studying generic Performance architecture.'
    ],
    callouts: [
      {
        type: 'sequencing',
        title: 'Lesson 2 of 2 — Data & Real Systems',
        body: '**Previous:** Executing remote network fetches.\n**This lesson:** Orchestrating dynamic temporal application states.\n**Next:** We start Phase 6 — Advanced Engineering and Scaling.',
      }
    ],
    visualizations: [
      {
        id: 'WebLesson15_StateAsync',
        title: 'The Tri-State Machine',
        caption: 'Simulate differing network conditions to observe UI handlers flip dynamically between loading, error, and success states.',
        mathBridge: 'Step 1: Toggle the "Force Network Failure" boolean. Step 2: Trigger a fetch. Notice exactly how the UI bypasses the Success renderer entirely and natively paints the Error fallback screen.'
      }
    ]
  },

  math: { prose: [], callouts: [], visualizations: [] },
  rigor: { prose: [], callouts: [], visualizations: [] },

  examples: [],
  challenges: [],

  semantics: {
    core: [
      { symbol: 'isLoading', meaning: 'The generic boolean state lock mechanically preventing duplicate async pipeline executions.' }
    ]
  },
  spiral: { recoveryPoints: [], futureLinks: [] },
  assessment: { questions: [] },
  mentalModel: [
    'Network returns are highly unreliable.',
    'UI mathematically must catch errors.',
    'Loading states are temporal blockers.'
  ],
  checkpoints: ['read-intuition', 'read-math'],
  quiz: [
    {
      id: 'q1',
      type: 'choice',
      text: '"Network returns are highly unreliable." Which of these best describes what makes network responses unreliable?',
      options: [
        'Servers sometimes return data in the wrong programming language',
        'Responses can be slow, time out, return server errors, or return malformed data — none of this is under your control',
        'Network calls only fail in production, not in development',
      ],
      correct: 1,
    },
    {
      id: 'q2',
      type: 'choice',
      text: '"UI mathematically must catch errors." Why is error handling non-optional when fetching data?',
      options: [
        'It is optional — if the server is reliable you can skip it',
        'Without error handling, a failed request leaves the UI in a broken or empty state with no message to the user',
        'Error handling is only needed when the API returns a 500 status',
      ],
      correct: 1,
    },
    {
      id: 'q3',
      type: 'choice',
      text: '"Loading states are temporal blockers." What should your UI show while waiting for a network response?',
      options: [
        'Nothing — show the data only when it arrives',
        'A loading indicator so the user knows a request is in progress and the UI is not frozen',
        'The previous data, silently replacing it when new data arrives',
      ],
      correct: 1,
    },
    {
      id: 'q4',
      type: 'choice',
      text: 'You combine async data-fetching with reactive state. In what order do you update state when a fetch completes?',
      options: [
        'Set loading to false, then set error to null, then set data — order does not matter',
        'Clear the loading state, store the result in data state (or error state on failure) — the UI re-renders from the new state values',
        'Update the DOM directly with the result, then sync it back to state',
      ],
      correct: 1,
    },
  ],
};
