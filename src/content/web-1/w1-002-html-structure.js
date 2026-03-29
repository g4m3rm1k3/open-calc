export default {
  id: 'w1-002',
  slug: 'html-structure',
  chapter: 1,
  order: 2,
  title: 'HTML as Structure',
  subtitle: 'HTML defines meaning and structure, not appearance',
  tags: ['html', 'semantics', 'structure', 'tags', 'elements'],
  aliases: 'meaning nesting semantic vs non-semantic',

  hook: {
    question: 'If CSS handles all of the visual styling, what is the actual purpose of HTML tags?',
    realWorldContext: 'Search engines, screen readers, and programmatic scrapers do not "see" visual layouts. They only extract meaning directly from semantic HTML structures.',
    previewVisualizationId: 'HTMLBuilderViz',
  },

  intuition: {
    prose: [
      '**Where you are in the story:** We just learned that the browser maintains a DOM tree. Now, we examine exactly how we instruct the browser to construct that tree using HTML tags.',
      'HTML is fundamentally a semantic markup language. It is meant to dictate *what* data is, not *how* data looks.',
      'A `<strong>` tag does not mathematically mean "make this font weight 700". It strictly means "this text carries strong importance". A `<nav>` tag is an architectural marker grouping navigation nodes together.',
      '**Where this is heading:** Once the structural skeleton is defined cleanly with meaning, we will apply cascading CSS rules on top of it to paint the layout.'
    ],
    callouts: [
      {
        type: 'sequencing',
        title: 'Lesson 2 of 4 — The Web as a System',
        body: '**Previous:** We discovered the webpage is a DOM tree.\n**This lesson:** Defining the nodes of that tree with semantics.\n**Next:** Layering rules over the tree via CSS.',
      }
    ],
    visualizations: [
      {
        id: 'HTMLBuilderViz',
        title: 'Semantic Tree Builder',
        caption: 'Drag and drop HTML elements into the DOM tree and watch the structural meaning update live.',
        mathBridge: 'Step 1: Drag a <header> element into the root. Step 2: Nest a <nav> inside it. Notice how visual defaults appear. The key lesson: The structure creates innate grouping, visual quirks are just browser defaults.'
      }
    ]
  },

  math: { prose: [], callouts: [], visualizations: [] },
  rigor: { prose: [], callouts: [], visualizations: [] },

  examples: [],
  challenges: [],

  semantics: {
    core: [
      { symbol: '<...>', meaning: 'A semantic tag defining the boundaries of a structural element' },
    ],
    rulesOfThumb: [
      'Use HTML to describe what the content *means*, never what it *looks like*.'
    ]
  },
  spiral: { recoveryPoints: [], futureLinks: [] },
  assessment: { questions: [] },
  mentalModel: [
    'HTML builds the skeleton.',
    'Meaning comes before rendering.',
    'Nesting dictates DOM inheritance.'
  ],
  checkpoints: ['read-intuition', 'read-math'],
  quiz: []
};
