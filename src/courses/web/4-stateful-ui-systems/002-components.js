export default {
  id: 'w4-002',
  slug: 'components',
  chapter: 'w4',
  order: 2,
  title: 'Components',
  subtitle: 'Break complex applications into reusable, encapsulated units',
  tags: ['components', 'props', 'reactivity', 'encapsulation'],
  aliases: 'modules inputs properties react chunks',

  hook: {
    question: 'How do you build a website with 1,000 distinct interactive buttons without copying and pasting 1,000 HTML tags?',
    realWorldContext: 'Systems like Facebook or Spotify scale by never repeating interface code. They build a single generic "Audio Track Component" and hydrate it mathematically with differing dynamic data.',
    previewVisualizationId: 'ComponentTreeViz',
  },

  intuition: {
    prose: [
      '**Where you are in the story:** The UI is dynamically rendering based on State variables. But one massive template is impossible to maintain. We must slice it up.',
      'A component is just a Function that returns UI geometry instead of raw numbers. It is purely encapsulated. It maintains its own local state, styling patterns, and event listeners natively.',
      'To build complex apps, we feed external dynamic data into these components via Inputs (commonly termed **Props**). Components form a semantic Tree structure heavily mimicking the original foundational DOM.',
      '**Where this is heading:** We finally step back to conceptually compare the old methodology against this new framework structure to cement "Reactive Thinking".'
    ],
    callouts: [
      {
        type: 'sequencing',
        title: 'Lesson 2 of 3 — Stateful UI Systems',
        body: '**Previous:** Establishing data-driven templates.\n**This lesson:** Architecting generic component trees.\n**Next:** Finalizing the Reactive mindset.',
      }
    ],
    visualizations: [
      {
        id: 'WebLesson12_Components',
        title: 'Component vs DOM Tree',
        caption: 'Examine how an Abstract Component tree physically maps to the literal HTML DOM tree mapping.',
        mathBridge: 'Step 1: Duplicate the standard Card component. Step 2: Notice the physical DOM expands but the internal component logic remains geometrically encapsulated. The key lesson: DRY principle translates mathematically to interfaces.'
      }
    ]
  },

  math: { prose: [], callouts: [], visualizations: [] },
  rigor: { prose: [], callouts: [], visualizations: [] },

  examples: [],
  challenges: [],

  semantics: {
    core: [
      { symbol: 'Props', meaning: 'The strict parameters passed downstream mathematically to configure a custom abstract Component element.' }
    ]
  },
  spiral: { recoveryPoints: [], futureLinks: [] },
  assessment: { questions: [] },
  mentalModel: [
    'Components are just UI functions.',
    'Props act as isolated input data.',
    'Trees map directly to the DOM.'
  ],
  checkpoints: ['read-intuition', 'read-math'],
  quiz: [
    {
      id: 'q1',
      type: 'choice',
      text: '"Components are just UI functions." What makes a component reusable?',
      options: [
        'Each component must be in its own file',
        'A component is a function that takes inputs and returns UI — call it with different inputs to get different output',
        'Components are reusable because they share global state',
      ],
      correct: 1,
    },
    {
      id: 'q2',
      type: 'choice',
      text: '"Props act as isolated input data." What is the key principle about how a component should treat its props?',
      options: [
        'Components can modify their props to communicate back to the parent',
        'Props are read-only inputs — a component uses them to render but should not mutate them',
        'Props are optional — components always have access to global data anyway',
      ],
      correct: 1,
    },
    {
      id: 'q3',
      type: 'choice',
      text: '"Trees map directly to the DOM." How does a component tree relate to the page structure?',
      options: [
        'Components are abstract and have no direct DOM relationship',
        'The hierarchy of components maps to the hierarchy of DOM elements — parent components wrap child elements',
        'Component trees are only for logic; the DOM is built separately',
      ],
      correct: 1,
    },
    {
      id: 'q4',
      type: 'choice',
      text: 'You have a Button component used in 50 places. You need to add an aria-label to every button. Where do you make the change?',
      options: [
        'In all 50 places where Button is used',
        'In the Button component definition — one change propagates everywhere the component is used',
        'You cannot change shared components — you must create a new component',
      ],
      correct: 1,
    },
  ],
};
