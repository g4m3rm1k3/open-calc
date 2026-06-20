export default {
  id: 'w2-005',
  slug: 'dom-manipulation',
  chapter: 'w2',
  order: 5,
  title: 'DOM Manipulation',
  subtitle: 'JavaScript mutates the structural tree actively via the Event pipeline',
  tags: ['javascript', 'dom', 'mutation', 'rendering', 'UI'],
  aliases: 'selectors document.query changing elements document object model',

  hook: {
    question: 'How do pixels actually shift on the screen after you type into an input box?',
    realWorldContext: 'Nearly all physical UI lag and jank originates from unoptimized programmatic manipulation of the Document Object Model tree structure during animation ticks.',
    previewVisualizationId: 'WebLesson08_DOM',
  },

  intuition: {
    prose: [
      '**Where you are in the story:** We have the structural skeleton (HTML), and the interactive logic pipeline (Events & Functions). Now we connect the two ends: the logic rewrites the skeleton.',
      'JavaScript possesses native access to an interface called the `document` object. Using selector queries, JS can locate specific nodes mathematically deep within the Phase 1 tree architecture.',
      'When you algorithmically splice, remove, or generate new tree nodes, the internal C++ Render Engine detects the structural difference (a "Diff") and instantly triggers a re-layout and re-paint operation on the canvas natively.',
      '**Where this is heading:** Writing raw DOM manipulation code scales horribly and gets incredibly unwieldy. Phase 3 steps back to explore the Asynchronous Event cycle, and Phase 4 will abstract standard DOM manipulation entirely using modern Stateful UI patterns (React).'
    ],
    callouts: [
      {
        type: 'sequencing',
        title: 'Lesson 5 of 5 — JavaScript as Behavior',
        body: '**Previous:** The Document Object Model basics.\n**This lesson:** Master standard programmatic tree mutations.\n**Next:** We start Phase 3 — Asynchrony and strict temporal Time patterns.',
      }
    ],
    visualizations: [
      {
        id: 'WebLesson08_DOM',
        title: 'Before/After DOM Diff Viewer',
        caption: 'Compare the live raw structural tree against a pending programmatic mutation before rendering occurs.',
        mathBridge: 'Step 1: Execute the simulated JavaScript function block. Step 2: Observe the tree difference highlight. The key lesson: JS mutates memory logic nodes; the browser internally handles the heavy graphics translation natively.'
      }
    ]
  },

  math: { prose: [], callouts: [], visualizations: [] },
  rigor: { prose: [], callouts: [], visualizations: [] },

  examples: [],
  challenges: [],

  semantics: {
    core: [
      { symbol: 'document.querySelector()', meaning: 'The mathematical algorithm for recursively mapping CSS selectors into pure RAM object pointers.' }
    ],
    rulesOfThumb: [
      'Touching the DOM is slow. Batch algorithmic edits computationally before executing physical paints.'
    ]
  },
  spiral: { recoveryPoints: [], futureLinks: [] },
  assessment: { questions: [] },
  mentalModel: [
    'JS pulls node references from RAM.',
    'Memory modifications trigger paints.',
    'UI updates are strictly reactive loops.'
  ],
  checkpoints: ['read-intuition', 'read-math'],
  quiz: [
    {
      id: 'q1',
      type: 'choice',
      text: '"JS pulls node references from RAM." What does this mean when you call document.getElementById()?',
      options: [
        'It searches the page HTML source file for the element',
        'It returns a live JavaScript object that is the element — a reference to the actual DOM node in memory',
        'It returns a copy of the element that you must re-insert into the page',
      ],
      correct: 1,
    },
    {
      id: 'q2',
      type: 'choice',
      text: '"Memory modifications trigger paints." When you set element.textContent, what happens next?',
      options: [
        'The page must be reloaded to reflect the change',
        'The browser schedules a repaint — the changed DOM node gets re-rendered on screen',
        'The change only appears when the user scrolls',
      ],
      correct: 1,
    },
    {
      id: 'q3',
      type: 'choice',
      text: 'You create a new element with document.createElement("div"). Is it visible on the page yet?',
      options: [
        'Yes — creating an element automatically adds it to the page',
        'No — the element exists in memory but must be inserted into the DOM with appendChild or similar before it appears',
        'Only if you set its innerHTML before creating it',
      ],
      correct: 1,
    },
    {
      id: 'q4',
      type: 'choice',
      text: '"UI updates are strictly reactive loops." What does this say about the ideal approach to building a UI?',
      options: [
        'Manually update every element whenever the user interacts',
        'Update the underlying state, then derive the UI from that state — not the other way around',
        'Use CSS animations instead of JavaScript for all UI changes',
      ],
      correct: 1,
    },
  ],
};
