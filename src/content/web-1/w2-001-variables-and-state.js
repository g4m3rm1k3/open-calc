export default {
  id: 'w2-001',
  slug: 'variables-and-state',
  chapter: 2,
  order: 1,
  title: 'Variables and State',
  subtitle: 'Programs store and transform state',
  tags: ['javascript', 'js', 'variables', 'state', 'memory'],
  aliases: 'let const var assignment updates',

  hook: {
    question: 'How does an application remember what a user clicked 5 seconds ago?',
    realWorldContext: 'Without state, an interface is purely amnesiac. State is the singular mathematical concept separating static posters from dynamic logic systems.',
    previewVisualizationId: 'WebLesson05_Variables',
  },

  intuition: {
    prose: [
      '**Where you are in the story:** We have successfully built the DOM tree and painted it with CSS constraints. But the entire construct is frozen. It cannot respond. To wake it up, we need memory. We need state.',
      'A variable is not just a container; it is an active alias to a location in memory. When a script runs, the JavaScript engine allocates small continuous blocks of memory to hold data representations.',
      'We call this collection of data **State**. An application\'s behavior at any exact millisecond is nothing more than a functional reaction to its current internal State.',
      '**Where this is heading:** Once we can hold and recall data reliably, we will introduce mechanisms meant entirely for manipulating that data: **Functions**.'
    ],
    callouts: [
      {
        type: 'sequencing',
        title: 'Lesson 1 of 4 — JavaScript as Behavior',
        body: '**Previous:** Resolving structural layouts manually.\n**This lesson:** Giving the system memory via variables.\n**Next:** Operating on memory via functions.',
      }
    ],
    visualizations: [
      {
        id: 'WebLesson05_Variables',
        title: 'Memory and State Transmutation',
        caption: 'Watch virtual memory addresses update in real time as variables are reassigned.',
        mathBridge: 'Step 1: Change the variable value in the input simulator. Step 2: Watch the physical UI update immediately downstream. The key lesson: The UI is inherently bound directly to the underlying raw logic state.'
      }
    ]
  },

  math: { prose: [], callouts: [], visualizations: [] },
  rigor: { prose: [], callouts: [], visualizations: [] },

  examples: [],
  challenges: [],

  semantics: {
    core: [
      { symbol: 'let', meaning: 'Allocates a memory reference that can be computationally reassigned' },
      { symbol: 'const', meaning: 'Allocates a strict memory reference that fundamentally prevents reassignment' }
    ],
    rulesOfThumb: [
      'Default to const computationally. Only use let when mutation is algorithmically required.'
    ]
  },
  spiral: { recoveryPoints: [], futureLinks: [] },
  assessment: { questions: [] },
  mentalModel: [
    'Memory holds current state.',
    'UI physically reflects current state.',
    'Const prevents pointer reassignment.'
  ],
  checkpoints: ['read-intuition', 'read-math'],
  quiz: []
};
