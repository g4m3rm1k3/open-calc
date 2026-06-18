export default {
  id: 'w2-003',
  slug: 'events',
  chapter: 'w2',
  order: 3,
  title: 'Events (Critical Pivot)',
  subtitle: 'Programs react to unexpected user or system disruptions computationally',
  tags: ['javascript', 'events', 'listeners', 'async'],
  aliases: 'clicks timeline bubbles propagation',

  hook: {
    question: 'How does code know exactly when a user decides to finally press a hardware button after staring idly for ten minutes?',
    realWorldContext: 'Applications do not sit executing endlessly in a loop waiting for clicks; they sleep computationally until the foundational Browser Engine fires an "interrupt" signal through the hardware.',
    previewVisualizationId: 'WebLesson07_Events',
  },

  intuition: {
    prose: [
      '**Where you are in the story:** We have data (Variables) and actions (Functions). But currently, the code simply executes linearly from top to bottom and then stops. We need the system to wait and listen.',
      'This is achieved via the critical Pivot concept: The Event. Every time you click, swipe, or type, the browser creates a mathematical data object representing that physical reality (an `Event`).',
      'By algorithmically strapping our JavaScript Functions directly onto elements as **Listeners**, we effectively hook our custom logic execution pipeline directly onto the user\'s physical timeline.',
      '**Where this is heading:** Once we know exactly when a user completes an action, we finally loop back to Phase 1: manipulating the live DOM tree in response.'
    ],
    callouts: [
      {
        type: 'sequencing',
        title: 'Lesson 3 of 5 — JavaScript as Behavior',
        body: '**Previous:** Formalizing transformation functions.\n**This lesson:** Instructing the browser when to fire functions.\n**Next:** Dynamically altering the fundamental DOM tree via events.',
      }
    ],
    visualizations: [
      {
        id: 'WebLesson07_Events',
        title: 'The Event Flow Timeline',
        caption: 'Watch the user click generate an event object that gets piped into the handler function.',
        mathBridge: 'Step 1: Physically click the simulated button. Step 2: Watch the event object structure traverse down the DOM. The key lesson: Events propagate down and bubble up structurally, carrying precise interaction data.'
      }
    ]
  },

  math: { prose: [], callouts: [], visualizations: [] },
  rigor: { prose: [], callouts: [], visualizations: [] },

  examples: [],
  challenges: [],

  semantics: {
    core: [
      { symbol: '.addEventListener()', meaning: 'Hooks a strict functional callback onto the browser\'s internal user emission stream.' }
    ],
    rulesOfThumb: [
      'Events occur regardless of whether you map standard listeners or not.',
      'Always consider event bubbling when structuring large UI architectures.'
    ]
  },
  spiral: { recoveryPoints: [], futureLinks: [] },
  assessment: { questions: [] },
  mentalModel: [
    'The engine never stops listening.',
    'User actions spawn Data Events.',
    'Listeners hook Functions to Events.'
  ],
  checkpoints: ['read-intuition', 'read-math'],
  quiz: []
};
