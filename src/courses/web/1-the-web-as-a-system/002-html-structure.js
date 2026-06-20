export default {
  id: 'w1-002',
  slug: 'html-structure',
  chapter: 'w1',
  order: 2,
  title: 'HTML as Structure',
  subtitle: 'HTML defines meaning and structure, not appearance',
  tags: ['html', 'semantics', 'structure', 'tags', 'elements'],
  aliases: 'meaning nesting semantic vs non-semantic',

  hook: {
    question: 'If CSS handles all of the visual styling, what is the actual purpose of HTML tags?',
    realWorldContext: 'Search engines, screen readers, and programmatic scrapers do not "see" visual layouts. They only extract meaning directly from semantic HTML structures.',
    previewVisualizationId: 'WebLesson02_HTML',
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
        id: 'WebLesson02_HTML',
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
  quiz: [
    {
      id: 'q1',
      type: 'choice',
      text: 'HTML "builds the skeleton" of a page. What does this mean for CSS and JavaScript?',
      options: [
        'CSS and JavaScript provide structure — HTML only handles colour',
        'HTML creates the elements and their relationships; CSS styles them and JS adds behavior to what HTML built',
        'HTML runs after CSS, so it overrides any pre-existing styles',
      ],
      correct: 1,
    },
    {
      id: 'q2',
      type: 'choice',
      text: '"Meaning comes before rendering." What does semantic HTML provide that a div does not?',
      options: [
        'Better performance — semantic elements are faster to paint',
        'Meaning for accessibility tools and search engines — a nav tag signals navigation intent; a div is meaningless',
        'Automatic styling — semantic elements have built-in CSS',
      ],
      correct: 1,
    },
    {
      id: 'q3',
      type: 'choice',
      text: '"Nesting dictates DOM inheritance." If a child element inherits font-family, where does it come from?',
      options: [
        'The browser default stylesheet only',
        'Its closest ancestor in the tree that has font-family set — inheritance flows down from parent to child',
        'The last CSS file loaded on the page',
      ],
      correct: 1,
    },
    {
      id: 'q4',
      type: 'choice',
      text: 'An element is placed inside another element in HTML. What is their relationship in the DOM?',
      options: [
        'They are siblings — nested elements are placed at the same level',
        'The outer element is the parent and the inner is its child — nesting creates the parent/child tree structure',
        'They share the same DOM node to save memory',
      ],
      correct: 1,
    },
  ],
};
