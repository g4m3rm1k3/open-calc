export default {
  id: 'w4-003',
  slug: 'reactive-thinking',
  chapter: 'w4',
  order: 3,
  title: 'Reactive Thinking',
  subtitle: 'Stop telling the app what to do; formally describe what it should look like',
  tags: ['declarative', 'imperative', 'reactivity', 'thinking'],
  aliases: 'mindset shift programming patterns declarative ui',

  hook: {
    question: 'What is the absolute fundamental difference between jQuery programming and React programming?',
    realWorldContext: 'Transitioning from direct manipulation (Imperative) to state synchronization (Declarative) is universally the hardest mental hurdle for engineers. It fundamentally rewrites application structures.',
    previewVisualizationId: 'DeclarativeImperativeViz',
  },

  intuition: {
    prose: [
      '**Where you are in the story:** You have components reacting natively to state. It is time to step back and classify this entire engineering paradigm shift.',
      'The manual `document.querySelector` manipulation methodology we used previously is **Imperative**: you explicitly tell the system exactly *how* to change step-by-step.',
      'State-driven components are **Declarative**: you describe strictly *what* the system should look like in every possible state scenario, and the framework figures out the mathematical diffs heavily underneath.',
      '**Where this is heading:** The internal mechanisms are secure. We break outside the boundaries of the browser in Phase 5 to pull active data across the planet via APIs.'
    ],
    callouts: [
      {
        type: 'sequencing',
        title: 'Lesson 3 of 3 — Stateful UI Systems',
        body: '**Previous:** Encapsulating logic into Components.\n**This lesson:** Cementing the Declarative architectural mindset.\n**Next:** We start Phase 5 — External Data and Networks.',
      }
    ],
    visualizations: [
      {
        id: 'WebLesson13_Reactive',
        title: 'Logic Explosion Comparison',
        caption: 'Watch an interface scale complexity between Imperative and Declarative logic bases.',
        mathBridge: 'Step 1: Add three interactive toggles. Step 2: Notice the imperative logic code physically explode into unscalable spaghetti due to edge case syncing. The key lesson: Declarative UI avoids local desynchronization.'
      }
    ]
  },

  math: { prose: [], callouts: [], visualizations: [] },
  rigor: { prose: [], callouts: [], visualizations: [] },

  examples: [],
  challenges: [],

  semantics: {
    core: [
      { symbol: 'Declarative', meaning: 'Mapping UI boundaries mathematically directly to strict State values automatically.' }
    ]
  },
  spiral: { recoveryPoints: [], futureLinks: [] },
  assessment: { questions: [] },
  mentalModel: [
    'Imperative dictates the How.',
    'Declarative describes the What.',
    'State defines reality entirely.'
  ],
  checkpoints: ['read-intuition', 'read-math'],
  quiz: []
};
