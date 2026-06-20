export default {
  id: 'w6-002',
  slug: 'abstraction-layers',
  chapter: 'w6',
  order: 2,
  title: 'Abstraction Layers',
  subtitle: 'Frameworks natively isolate developers from repeating structural problems',
  tags: ['frameworks', 'react', 'abstractions', 'systems', 'engineering'],
  aliases: 'libraries react vue vanilla js why frameworks',

  hook: {
    question: 'If raw vanilla JavaScript is faster to execute natively, why does the entire tech industry mandate heavy generalized Frameworks?',
    realWorldContext: 'Engineers scale companies by establishing standardized systemic boundaries. A framework is simply a highly-optimized generic wrapper mapping human logic safely to raw system mechanics.',
    previewVisualizationId: 'AbstractionDiffViz',
  },

  intuition: {
    prose: [
      '**Where you are in the story:** We understand the DOM, we understand State, we understand Performance constraints. Now we recognize how human-engineered tools automatically manage all three.',
      'An abstraction layer (like React) exists mathematically to hide brutal low-level complexity (like DOM diffing, Event delegation, and memory synchronization).',
      'Instead of re-inventing an optimized node pipeline manually for every single project, we collectively defer specifically to a singular underlying Framework engine—trading a microscopic fraction of raw execution speed for a phenomenal multiplier in declarative code structure.',
      '**Where this is heading:** We now know the tools. The next exact stage is applying these highly abstract tools conceptually into full-scale App Architecture.'
    ],
    callouts: [
      {
        type: 'sequencing',
        title: 'Lesson 2 of 3 — Advanced Engineering',
        body: '**Previous:** Optimizing low-level graphic physics.\n**This lesson:** Shifting complexity upstream into Framework abstractions.\n**Next:** Designing macroscopic systemic architectures.',
      }
    ],
    visualizations: [
      {
        id: 'WebLesson17_Abstraction',
        title: 'Abstraction Diff Comparator',
        caption: 'Compare a 100-line imperative logic module explicitly against an identical 5-line declarative abstraction implementation.',
        mathBridge: 'Step 1: Inspect the Raw JS block. Note exactly how error handling and state-DOM tracking bloats the execution script. Step 2: Inspect the Abstract block. The key lesson: Abstraction condenses human interaction surface.'
      }
    ]
  },

  math: { prose: [], callouts: [], visualizations: [] },
  rigor: { prose: [], callouts: [], visualizations: [] },

  examples: [],
  challenges: [],

  semantics: {
    core: [
      { symbol: 'Abstraction', meaning: 'Packaging complex internal implementation mechanics behind a dramatically simplified declarative operational interface' }
    ]
  },
  spiral: { recoveryPoints: [], futureLinks: [] },
  assessment: { questions: [] },
  mentalModel: [
    'Frameworks solve repeating boundaries.',
    'Logic encapsulation drives rapid scaling.',
    'UI becomes a singular data expression.'
  ],
  checkpoints: ['read-intuition', 'read-math'],
  quiz: [
    {
      id: 'q1',
      type: 'choice',
      text: '"Frameworks solve repeating boundaries." What is the core problem a framework like React solves?',
      options: [
        'Frameworks prevent all bugs by checking your code at compile time',
        'Frameworks handle the repetitive work of syncing state to DOM, routing, and component lifecycle — work every app needs but nobody should reimplement',
        'Frameworks replace the need for JavaScript entirely',
      ],
      correct: 1,
    },
    {
      id: 'q2',
      type: 'choice',
      text: '"Logic encapsulation drives rapid scaling." What does encapsulation give you as an app grows?',
      options: [
        'Faster network requests because logic is bundled more efficiently',
        'Self-contained units that can be developed, tested, and reused independently — changes inside one unit don\'t break others',
        'Automatic code splitting so less JavaScript is downloaded',
      ],
      correct: 1,
    },
    {
      id: 'q3',
      type: 'choice',
      text: '"UI becomes a singular data expression." What does this mean architecturally?',
      options: [
        'You store all data in a single global variable to keep things simple',
        'The entire UI is derived from data — given the same data, the UI always looks the same, making it predictable and testable',
        'You can only have one UI component per page',
      ],
      correct: 1,
    },
    {
      id: 'q4',
      type: 'choice',
      text: 'You are adding a new feature that already exists in a slightly different form elsewhere in the app. What does good abstraction encourage you to do?',
      options: [
        'Copy the existing code and modify it — duplication is safer than abstraction',
        'Extract the shared logic into a reusable component or hook so both features use the same implementation',
        'Rewrite the existing feature to match the new one',
      ],
      correct: 1,
    },
  ],
};
