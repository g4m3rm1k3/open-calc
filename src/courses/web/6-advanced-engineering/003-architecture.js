export default {
  id: 'w6-003',
  slug: 'architecture',
  chapter: 'w6',
  order: 3,
  title: 'Architecture',
  subtitle: 'Organizing massive disparate application layers coherently',
  tags: ['architecture', 'data flow', 'systems', 'concerns', 'design'],
  aliases: 'separation of concerns mvc architectures data layers',

  hook: {
    question: 'When a codebase organically scales past 100,000 lines of logic, how do you prevent the system from catastrophically collapsing on itself?',
    realWorldContext: 'Systems fall apart structurally when boundaries blur. True web architecture physically divides discrete domains of logic systematically to isolate entropy impact zones.',
    previewVisualizationId: 'ArchitectureLayerViz',
  },

  intuition: {
    prose: [
      '**Where you are in the story:** We are now operating at a microscopic mechanical scale (Event loops) up to a monolithic framework scale (React Abstractions). The final philosophical stage is combining them elegantly.',
      'True software architecture strictly enforces "Separation of Concerns". A Data Layer focuses entirely on parsing network fetch responses (Phase 5). A UI Layer focuses strictly upon translating variables visually (Phase 4).',
      'If you architect your boundaries cleanly, you theoretically can rip out and replace the entire visual layer algorithmically without altering a singular isolated byte of the underlying state logic engine.',
      '**Where this is heading:** The theory concludes. You now inherently possess the exact mathematical structural knowledge needed for our final stage: The Capstone Dashboard System.'
    ],
    callouts: [
      {
        type: 'sequencing',
        title: 'Lesson 3 of 3 — Advanced Engineering',
        body: '**Previous:** Understanding abstract framework efficiencies.\n**This lesson:** Macroscopic component and logic layer design.\n**Next:** We start Phase 7 — The complete Capstone.',
      }
    ],
    visualizations: [
      {
        id: 'WebLesson18_Architecture',
        title: 'Data vs Logic vs UI Topology',
        caption: 'Diagram analyzing the strict boundaries separating the Network logic, local State logic, and the View rendering mechanics.',
        mathBridge: 'Step 1: Click the UI button mapping. Observe how the instruction algorithmically flows downwards mechanically to the logic controller, then directly translates data, and flows outwards back upwards to UI listeners.'
      }
    ]
  },

  math: { prose: [], callouts: [], visualizations: [] },
  rigor: { prose: [], callouts: [], visualizations: [] },

  examples: [],
  challenges: [],

  semantics: {
    core: [
      { symbol: 'Separation of Concerns', meaning: 'The rigid architectural principle that discrete domains (UI, data, networks) must not intersect their mathematical implementations' }
    ]
  },
  spiral: { recoveryPoints: [], futureLinks: [] },
  assessment: { questions: [] },
  mentalModel: [
    'Views map visual inputs naturally.',
    'Logic purely tracks mathematics.',
    'Services strictly coordinate externals.'
  ],
  checkpoints: ['read-intuition', 'read-math'],
  quiz: [
    {
      id: 'q1',
      type: 'choice',
      text: '"Views map visual inputs naturally." What is the responsibility of the View layer in an MVC-style architecture?',
      options: [
        'Fetching data from external APIs',
        'Rendering the UI and capturing user inputs — it knows what things look like but not how they work',
        'Storing application state and business rules',
      ],
      correct: 1,
    },
    {
      id: 'q2',
      type: 'choice',
      text: '"Logic purely tracks mathematics." What does the Logic (Model/Controller) layer own?',
      options: [
        'The HTML template and CSS styles',
        'The business rules, data transformations, and state — the calculations that determine what is true in the application',
        'Network requests and database connections only',
      ],
      correct: 1,
    },
    {
      id: 'q3',
      type: 'choice',
      text: '"Services strictly coordinate externals." What kinds of work belong in a Service layer?',
      options: [
        'Rendering buttons and form elements',
        'Coordinating communication with external systems — API calls, authentication, database queries, third-party integrations',
        'Managing CSS transitions and animations',
      ],
      correct: 1,
    },
    {
      id: 'q4',
      type: 'choice',
      text: 'Your app\'s "save to server" logic is currently inside a button\'s click handler. What architectural problem does this create?',
      options: [
        'None — click handlers are the correct place for all logic',
        'The save logic is coupled to the UI — you cannot reuse it elsewhere, test it in isolation, or swap it without touching the View',
        'Click handlers cannot make async calls',
      ],
      correct: 1,
    },
  ],
};
