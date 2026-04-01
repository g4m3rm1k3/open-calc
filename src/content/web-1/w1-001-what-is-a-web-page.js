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

  rigor: {
    prose: [
      'The DOM is not a file format — it is a **live data structure** in memory. The HTML file on disk is just the instructions for building it. Once built, the file is irrelevant — JavaScript talks to the tree, not the text.',
      'Every node in the tree is a JavaScript object with properties: `tagName`, `textContent`, `style`, `classList`, `children`. When you change a property, the browser re-renders only the affected subtree — not the whole page.',
    ],
    callouts: [],
    visualizations: [
      {
        id: 'JSNotebook',
        title: 'Hands-On: Talking to the DOM',
        caption: 'Write code in the JS tab and click Run to see it change the preview live.',
        props: {
          lesson: {
            title: 'Your First DOM Manipulation',
            subtitle: 'The tree is live — change an object property and the page updates instantly.',
            sequential: true,
            cells: [
              {
                type: 'markdown',
                instruction: 'The DOM tree you just saw in the diagram is a live JavaScript object. Below are two cells that let you reach into that tree and change it.\n\nRead each instruction, write the code, and click ▶ Run to see the result in the preview above the editor.',
              },
              {
                type: 'js',
                instruction: '`document.querySelector(selector)` finds the first matching element in the tree and returns it as a JavaScript object. Once you have the object, you can read and write its properties.\n\nRun the starter code, then try changing the `textContent` to something else.',
                html: `<h2 id="heading">The DOM is a tree of live objects.</h2>
<p id="sub">Change me with JavaScript.</p>`,
                css: `body { background: #0f172a; color: #e2e8f0; font-family: 'Segoe UI', sans-serif; padding: 20px; }
h2 { color: #38bdf8; margin: 0 0 8px; }
p  { color: #94a3b8; margin: 0; }`,
                startCode: `// Find the heading node in the tree
const heading = document.querySelector('#heading');

// Read its current text
console.log('Before:', heading.textContent);

// Write a new value — the preview updates instantly
heading.textContent = 'I just changed a live DOM node!';

console.log('After:', heading.textContent);`,
                solutionCode: `const heading = document.querySelector('#heading');
console.log('Before:', heading.textContent);
heading.textContent = 'I just changed a live DOM node!';
console.log('After:', heading.textContent);`,
                outputHeight: 120,
                showDom: false,
              },
              {
                type: 'challenge',
                instruction: 'The paragraph below has id `"message"`. Write JavaScript that:\n1. Selects it with `querySelector`\n2. Changes its `textContent` to `"DOM nodes are just objects!"`\n3. Changes its `style.color` to `"#34d399"` (green)\n\nClick Run, then check the preview.',
                html: `<p id="message">This text needs to change.</p>`,
                css: `body { background: #0f172a; color: #e2e8f0; font-family: 'Segoe UI', sans-serif; padding: 24px; font-size: 16px; }`,
                startCode: `// Select the paragraph by its id
const msg = document.querySelector('#message');

// 1. Change its text
// 2. Change its color to '#34d399'
`,
                solutionCode: `const msg = document.querySelector('#message');
msg.textContent = 'DOM nodes are just objects!';
msg.style.color = '#34d399';`,
                outputHeight: 100,
                check: (code) =>
                  code.includes('querySelector') &&
                  (code.includes('"DOM nodes are just objects!"') || code.includes("'DOM nodes are just objects!'")) &&
                  (code.includes('"#34d399"') || code.includes("'#34d399'")),
                successMessage: '✓ You reached into the live tree and changed two properties at once. That is the entire DOM API in miniature.',
                failMessage: '✗ Make sure you set textContent to "DOM nodes are just objects!" and style.color to "#34d399".',
              },
            ],
          },
        },
      },
    ],
  },

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
