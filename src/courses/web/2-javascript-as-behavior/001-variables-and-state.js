export default {
  id: 'w2-001',
  slug: 'variables-and-state',
  chapter: 'w2',
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
        title: 'Lesson 1 of 5 — JavaScript as Behavior',
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
  quiz: [
    {
      id: 'q1',
      type: 'choice',
      text: '"Memory holds current state." In a web app, what is "state"?',
      options: [
        'The HTML structure of the page',
        'The data that represents what the application currently knows — things like user input, loaded items, and toggle flags',
        'The CSS classes currently applied to elements',
      ],
      correct: 1,
    },
    {
      id: 'q2',
      type: 'choice',
      text: '"UI physically reflects current state." What is the correct relationship between your data and what the user sees?',
      options: [
        'The UI is the source of truth — the data must match the DOM',
        'The data (state) is the source of truth — the UI should be derived from it, not the other way around',
        'They are independent — state and UI operate in separate systems',
      ],
      correct: 1,
    },
    {
      id: 'q3',
      type: 'choice',
      text: '"Const prevents pointer reassignment." You declare const count = 0 and then try count = 1. What happens?',
      options: [
        'count silently stays 0',
        'A TypeError is thrown — const bindings cannot be re-assigned to a new value',
        'count becomes 1 — const only prevents deletion, not reassignment',
      ],
      correct: 1,
    },
    {
      id: 'q4',
      type: 'choice',
      text: 'A counter in your app shows the wrong number. You update the variable but the displayed count does not change. What step are you missing?',
      options: [
        'You must use let instead of const for the counter to update',
        'The DOM element displaying the count must also be updated — changing a variable does not automatically update the UI',
        'You need to reload the page for variable changes to appear',
      ],
      correct: 1,
    },
  ],
};
