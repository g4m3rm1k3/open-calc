import w1_001 from './w1-001-what-is-a-web-page.js';
import w1_002 from './w1-002-html-structure.js';
import w1_003 from './w1-003-css-rule-engine.js';
import w1_004 from './w1-004-layout-systems.js';

import w2_001 from './w2-001-variables-and-state.js';
import w2_002 from './w2-002-functions.js';
import w2_003 from './w2-003-events.js';
import w2_004 from './w2-004-dom-manipulation.js';

import w3_001 from './w3-001-event-loop.js';
import w3_002 from './w3-002-async-patterns.js';

import w4_001 from './w4-001-state-drives-ui.js';
import w4_002 from './w4-002-components.js';
import w4_003 from './w4-003-reactive-thinking.js';

import w5_001 from './w5-001-apis-and-data.js';
import w5_002 from './w5-002-state-async-combined.js';

import w6_001 from './w6-001-performance.js';
import w6_002 from './w6-002-abstraction-layers.js';
import w6_003 from './w6-003-architecture.js';

import w7_001 from './w7-001-build-full-app.js';

// Phase 1: The Web as a System (Foundations)
const W1 = {
  title: 'The Web as a System',
  number: 'w1',
  slug: 'web-foundations',
  lessons: [
    w1_001,
    w1_002,
    w1_003,
    w1_004
  ],
};

// Phase 2: JavaScript as Behavior
const W2 = {
  title: 'JavaScript as Behavior',
  number: 'w2',
  slug: 'javascript-behavior',
  lessons: [
    w2_001,
    w2_002,
    w2_003,
    w2_004
  ],
};

// Phase 3: Time & Asynchrony
const W3 = {
  title: 'Time & Asynchrony',
  number: 'w3',
  slug: 'time-and-asynchrony',
  lessons: [
    w3_001,
    w3_002
  ],
};

// Phase 4: Stateful UI Systems
const W4 = {
  title: 'Stateful UI Systems',
  number: 'w4',
  slug: 'stateful-ui',
  lessons: [
    w4_001,
    w4_002,
    w4_003
  ],
};

// Phase 5: Data & Real Systems
const W5 = {
  title: 'Data & Real Systems',
  number: 'w5',
  slug: 'data-systems',
  lessons: [
    w5_001,
    w5_002
  ],
};

// Phase 6: Advanced Engineering
const W6 = {
  title: 'Advanced Engineering',
  number: 'w6',
  slug: 'advanced-engineering',
  lessons: [
    w6_001,
    w6_002,
    w6_003
  ],
};

// Phase 7: Capstone System
const W7 = {
  title: 'Capstone System',
  number: 'w7',
  slug: 'capstone',
  lessons: [
    w7_001
  ],
};

export default [W1, W2, W3, W4, W5, W6, W7];
