export default {
  id: 'w1-001',
  slug: 'what-is-a-web-page',
  chapter: 'w1',
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
      },
      {
        id: 'JSNotebook',
        title: 'Hands-On: Build the Tree',
        caption: 'Edit the HTML tab and click ▶ Run to see your tree rendered in the preview.',
        props: {
          lesson: {
            title: 'Build a DOM Tree by Hand',
            subtitle: 'Every tag you write becomes a node. Nesting tags creates parent-child relationships.',
            sequential: true,
            cells: [
              {
                type: 'markdown',
                instruction: 'The diagram shows that a webpage is a **tree of nested nodes**. HTML is how you describe that tree in text.\n\nEvery opening tag (`<div>`, `<h1>`, `<p>`) creates a node. Tags inside other tags become **children** of that node. The indentation in HTML is just a visual hint — the browser sees the nesting and builds the actual tree from it.\n\nIn the cells below, you will write HTML and watch the browser turn it into a rendered tree.',
              },
              {
                type: 'js',
                instruction: 'The HTML tab already has a simple tree: one parent `<div>` with two children — an `<h2>` and a `<p>`. Click the **HTML** tab to see the structure, then click ▶ Run to render it.\n\nTry adding a third child: another `<p>` tag inside the same `<div>`. Every tag you add inside the parent creates a new node in the tree.',
                html: `<div class="card">
  <h2>I am the parent node</h2>
  <p>I am a child node</p>
  <p>I am another child node</p>
</div>`,
                css: `body { background: #0f172a; color: #e2e8f0; font-family: 'Segoe UI', sans-serif; padding: 20px; }
.card {
  background: #1e293b;
  border: 1.5px solid #334155;
  border-radius: 10px;
  padding: 20px 24px;
}
h2 { color: #38bdf8; margin: 0 0 10px; font-size: 16px; }
p  { color: #94a3b8; margin: 4px 0; font-size: 14px; }`,
                outputHeight: 150,
              },
              {
                type: 'js',
                instruction: 'Now try **nesting deeper**. A tree can have multiple levels: grandparent → parent → child.\n\nThe HTML tab has a two-level tree. Add a third level by putting a `<span>` inside one of the `<p>` tags — that span becomes a grandchild node.\n\nEvery level of indentation in HTML = one level deeper in the tree.',
                html: `<div class="section">
  <h2>Grandparent</h2>
  <div class="group">
    <p>Parent node — <span class="child">I am a grandchild span inside the p</span></p>
    <p>Another parent node</p>
  </div>
</div>`,
                css: `body { background: #0f172a; color: #e2e8f0; font-family: 'Segoe UI', sans-serif; padding: 20px; }
.section { background: #1e293b; border: 1.5px solid #334155; border-radius: 10px; padding: 20px; }
h2 { color: #38bdf8; margin: 0 0 12px; font-size: 15px; }
.group { border-left: 2px solid #334155; padding-left: 16px; margin-top: 8px; }
p { color: #94a3b8; margin: 6px 0; font-size: 14px; }
.child { color: #a78bfa; background: #1e1040; padding: 1px 6px; border-radius: 4px; font-size: 13px; }`,
                outputHeight: 160,
              },
              {
                type: 'challenge',
                instruction: 'Build your own tree in the **HTML tab**. Create a structure with:\n\n- A `<div>` as the root node with class `"container"`\n- Inside it: an `<h1>` with any text\n- Inside it: two `<p>` tags, each with different text\n\nThe tree should have exactly one root, one heading child, and two paragraph children.',
                html: `<!-- Build your tree here -->
<div class="container">

</div>`,
                css: `body { background: #0f172a; color: #e2e8f0; font-family: 'Segoe UI', sans-serif; padding: 20px; }
.container { background: #1e293b; border: 1.5px solid #334155; border-radius: 10px; padding: 24px; }
h1 { color: #38bdf8; font-size: 18px; margin: 0 0 12px; }
p  { color: #94a3b8; margin: 6px 0; font-size: 14px; }`,
                outputHeight: 160,
                check: (_code, _logs, html) => {
                  if (typeof html === 'string') {
                    return html.includes('<h1') && html.includes('</h1>') &&
                      (html.match(/<p/g) || []).length >= 2;
                  }
                  return true;
                },
                successMessage: '✓ Your tree has a root, a heading child, and two paragraph children — exactly what the DOM diagram showed.',
                failMessage: '✗ Make sure the HTML tab has an <h1> and at least two <p> tags inside the .container div.',
              },
            ],
          },
        },
      },
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
