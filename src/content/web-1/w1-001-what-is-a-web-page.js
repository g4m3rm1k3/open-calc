export default {
  id: 'w1-001',
  slug: 'what-is-a-web-page',
  chapter: 1,
  order: 1,
  title: 'What is a Web Page?',
  subtitle: 'A webpage is a tree of objects rendered visually',
  tags: ['web', 'dom', 'tree', 'nodes', 'html'],
  aliases: 'document object model tree rendering',

  hook: {
    question: 'How does a browser turn a flat text file into an interactive application interface?',
    realWorldContext: 'Every modern complex web application ultimately reduces to a mathematical tree of visual nodes called the Document Object Model (DOM).',
    previewVisualizationId: 'WebLesson01_DOMTree',
  },

  intuition: {
    prose: [
      '**Where you are in the story:** We are starting at the very bottom layer. Before you can write JavaScript that changes the page, you have to understand what the page fundamentally *is*.',
      'At its core, a webpage is not a flat canvas of pixels. It is a strict mathematical hierarchy—a **tree of objects**.',
      'Every heading, paragraph, button, and image forms a discrete "node" in this tree. The browser\'s engine parses the raw text of an HTML file and recursively builds out this parent-child architecture in active memory before calculating where anything goes visually.',
      '**Where this is heading:** Once we grasp this tree structure, the next stage is understanding how CSS mathematically traverses and decorates this exact same tree to make it visually meaningful.'
    ],
    callouts: [
      {
        type: 'sequencing',
        title: 'Lesson 1 of 4 — The Web as a System',
        body: '**This lesson:** Visualizing the core DOM tree architecture.\n**Next:** How HTML tags map to this continuous tree.',
      },
      {
        type: 'insight',
        title: 'The "Model" in DOM',
        body: 'The browser keeps an active, living "Model" of the document. When JavaScript interacts with the page, it is strictly mutating this memory tree, *not* updating pixels directly.',
      }
    ],
    visualizations: [
      {
        id: 'WebLesson01_DOMTree',
        title: 'The Document Object Model (DOM)',
        caption: 'The left side represents the HTML structure as a tree of nodes, mapping to the rendered interface on the right.',
        mathBridge: 'Step 1: Hover over any node in the tree diagram. Notice how its boundaries highlight dynamically on the rendered page preview. The key lesson: Structure and visual layout are decoupled but mapped 1:1.'
      }
    ]
  },

  math: { prose: [], callouts: [], visualizations: [] },
  rigor: { prose: [], callouts: [], visualizations: [] },

  examples: [],
  challenges: [],

  semantics: {
    core: [
      { symbol: 'DOM', meaning: 'Document Object Model — the memory tree of nodes representing the UI' },
      { symbol: 'Node', meaning: 'A single point or element within the tree hierarchy' }
    ],
    rulesOfThumb: [
      'Pixels are just a symptom. The real truth is the tree.',
      'Every element has exactly one parent (except the root).'
    ]
  },
  spiral: { recoveryPoints: [], futureLinks: [] },
  assessment: { questions: [] },
  mentalModel: [
    'A webpage is a strict hierarchy of data nodes.',
    'HTML defines parent/child object relations.',
    'The renderer translates tree paths into 2D boxes.'
  ],
  checkpoints: ['read-intuition', 'read-math'],
  quiz: []
};
