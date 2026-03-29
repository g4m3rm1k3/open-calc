export default {
  id: 'w6-003',
  slug: 'architecture',
  chapter: 6,
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
        id: 'ArchitectureLayerViz',
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
  quiz: []
};
