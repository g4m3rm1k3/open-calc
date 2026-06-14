export default {
  id: 'w4-001',
  slug: 'state-drives-ui',
  chapter: 'w4',
  order: 1,
  title: 'State Drives UI',
  subtitle: 'The modern paradigm: UI is a pure function of strict State',
  tags: ['ui', 'state', 'reactivity', 'rendering', 'data'],
  aliases: 'ui function state data-driven react framework',

  hook: {
    question: 'Why did the entire web industry abandon manual `document.querySelector` manipulation for complex applications?',
    realWorldContext: 'Manually syncing a Javascript variable (State) with a DOM tag (View) generates immense bug surfaces. If state changes in 5 places, updating 5 disparate DOM nodes creates brittle entropy.',
    previewVisualizationId: 'WebLesson11_StateUI',
  },

  intuition: {
    prose: [
      '**Where you are in the story:** We understand DOM manipulation mathematically, but it has severe scaling constraints. We need a fundamental paradigm shift to handle complex applications safely.',
      'Instead of writing code that aggressively hunts down DOM nodes to mutate pixels (Imperative), we simply define a template connecting the UI straight to our raw Variables (State).',
      'When the State changes, the underlying framework dynamically recalculates the exact necessary geometric DOM diffs and re-renders automatically. **UI becomes a pure mathematical function of State: UI = f(state)**.',
      '**Where this is heading:** Having established this centralized data flow, we must slice the interface into small, encapsulated blocks called **Components** to prevent the framework from re-rendering the entire page on every click.'
    ],
    callouts: [
      {
        type: 'sequencing',
        title: 'Lesson 1 of 3 — Stateful UI Systems',
        body: '**Previous:** Manual asynchronous DOM manipulation.\n**This lesson:** Automating UI rendering dynamically via State maps.\n**Next:** Encapsulating this automatic logic into Components.',
      }
    ],
    visualizations: [
      {
        id: 'WebLesson11_StateUI',
        title: 'State vs DOM Visualizer',
        caption: 'Compare a manual DOM mutation pipeline side-by-side with a state-driven reactive pipeline.',
        mathBridge: 'Step 1: Mutate the core array variable on the left. Step 2: Observe the state-driven pipeline automatically flush the DOM visually without manual query selectors. The key lesson: State implies Render.'
      }
    ]
  },

  math: { prose: [], callouts: [], visualizations: [] },
  rigor: { prose: [], callouts: [], visualizations: [] },

  examples: [],
  challenges: [],

  semantics: {
    core: [
      { symbol: 'UI = f(state)', meaning: 'The interface mathematically matches exactly whatever the data dictates' }
    ]
  },
  spiral: { recoveryPoints: [], futureLinks: [] },
  assessment: { questions: [] },
  mentalModel: [
    'State is absolute truth.',
    'UI is just a visual reflection.',
    'Frameworks automate the binding.'
  ],
  checkpoints: ['read-intuition', 'read-math'],
  quiz: []
};
