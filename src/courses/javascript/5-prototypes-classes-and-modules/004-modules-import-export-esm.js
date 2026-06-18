// J9 — Lesson 4-4: Modules — import, export, and ESM

const LESSON_JS_CORE_4_4 = {
  title: 'Modules — import, export, and ESM',
  subtitle: 'Split code across files, share functionality, and understand how the module system works.',
  sequential: true,

  cells: [

    {
      type: 'markdown',
      instruction: `## Part 1 — Why Modules Exist

Before modules, all JavaScript ran in a single global scope. Every script tag dumped its variables into \`window\`. A \`utils.js\` defining \`function format()\` would silently overwrite any other \`format()\` anywhere on the page.

**Modules solve three problems:**
1. **Scope isolation** — module-level variables are private by default
2. **Explicit dependencies** — you declare what you need, where you need it
3. **One canonical source** — import the same module from ten places; it runs once

**The three module systems JavaScript developers encounter:**

| System | Syntax | Context |
|--------|--------|---------|
| **ESM** (ES Modules) | \`import / export\` | Browsers, Node ≥ 14, Vite/Webpack/Bun |
| **CommonJS** | \`require() / module.exports\` | Old Node, most npm packages |
| **AMD** | \`define()\` | Legacy browser bundlers (pre-2015) |

You will mostly write ESM. You will often *read* CommonJS. The key difference: ESM is statically analyzed (bundlers can tree-shake it), CommonJS is dynamic (imports can be inside if-blocks).

**In C and C++**, the equivalent is \`#include\` with header files — but those are textual inclusion, not a module system. There is no hiding of symbols unless you use \`static\` or anonymous namespaces. Java and C# have proper package systems with access modifiers; ESM is closer to that model.`,
    },

    {
      type: 'markdown',
      instruction: `## Part 2 — Named Exports and Imports

\`\`\`js
// math.js
export function add(a, b) { return a + b; }
export function multiply(a, b) { return a * b; }
export const PI = 3.14159;
\`\`\`

\`\`\`js
// main.js
import { add, multiply, PI } from './math.js';
console.log(add(2, 3));   // 5
console.log(PI);          // 3.14159
\`\`\`

**Renaming on import:**
\`\`\`js
import { add as sum } from './math.js';
sum(1, 2);   // 3 — now called sum locally
\`\`\`

**Import all as a namespace:**
\`\`\`js
import * as math from './math.js';
math.add(1, 2);
math.PI;
\`\`\`

**Default export** — one per module, no curly braces:
\`\`\`js
// logger.js
export default function log(msg) { console.log('[LOG]', msg); }
\`\`\`
\`\`\`js
import log from './logger.js';        // name is whatever you choose
import myLog from './logger.js';      // same module, different local name
\`\`\`

**Rule of thumb:** Default export for the *primary* thing a module provides (a class, a config object, a main function). Named exports for utilities, constants, and secondary helpers.`,
    },

    {
      type: 'js',
      instruction: `### Simulating Modules in a Single File

We can not run two files here, but we can simulate the module pattern using closures — which is literally what bundlers do when they package your modules together.`,
      startCode: `// --- Simulating module: math.js ---
const mathModule = (() => {
  // Private — not exported
  function clamp(n, min, max) {
    return Math.max(min, Math.min(max, n));
  }

  // Public exports
  function add(a, b) { return a + b; }
  function multiply(a, b) { return a * b; }
  function safeDiv(a, b) {
    if (b === 0) throw new Error('Division by zero');
    return a / b;
  }
  const PI = 3.14159265358979;

  return { add, multiply, safeDiv, PI };   // named exports
})();

// --- Simulating module: stats.js — depends on math.js ---
const statsModule = (() => {
  const { add } = mathModule;   // "import { add } from './math.js'"

  function mean(arr) {
    return arr.reduce(add, 0) / arr.length;
  }
  function variance(arr) {
    const m = mean(arr);
    return mean(arr.map(x => (x - m) ** 2));
  }

  return { mean, variance };
})();

// --- main.js ---
const { add, PI, safeDiv } = mathModule;   // named imports
const { mean, variance } = statsModule;

console.log(add(3, 4));           // 7
console.log(PI.toFixed(4));       // 3.1416
console.log(safeDiv(10, 2));      // 5
console.log(mean([1, 2, 3, 4, 5]));      // 3
console.log(variance([1, 2, 3, 4, 5]).toFixed(2));  // 2.00
// clamp is NOT accessible — it is private to mathModule`,
      outputHeight: 240,
    },

    {
      type: 'markdown',
      instruction: `## Part 3 — Re-exports and Barrel Files

A common pattern is an **index.js (barrel file)** that re-exports everything from a folder, creating a clean public API:

\`\`\`
src/
  utils/
    math.js        // export function add, multiply
    string.js      // export function capitalize, truncate
    date.js        // export function formatDate, daysBetween
    index.js       // barrel — re-exports everything
\`\`\`

\`\`\`js
// utils/index.js
export { add, multiply } from './math.js';
export { capitalize, truncate } from './string.js';
export { formatDate, daysBetween } from './date.js';
\`\`\`

\`\`\`js
// usage — one clean import
import { add, capitalize, formatDate } from './utils';
\`\`\`

**Avoid barrel files when tree-shaking matters** — bundlers like Vite and webpack handle it, but some tools (older ones) will include the entire barrel even if you only import one thing.

## Part 4 — Dynamic Imports

Static \`import\` runs at module load time. **Dynamic import** is a function call — it returns a Promise and loads the module on demand:

\`\`\`js
// Load a heavy chart library only when the user clicks "View Chart"
button.onclick = async () => {
  const { default: Chart } = await import('https://cdn.jsdelivr.net/npm/chart.js/auto/auto.esm.js');
  new Chart(canvas, config);
};
\`\`\`

This is called **code splitting** — the browser only downloads code when it's actually needed. React, Next.js, and Vite all use this heavily behind the scenes.`,
    },

    {
      type: 'js',
      instruction: `### Dynamic Import — Code Splitting in Action

In a real app dynamic import lets you defer loading large dependencies. Here we simulate the timing.`,
      startCode: `// Simulate a heavy module that takes time to load
function simulateModuleLoad(name, ms) {
  return new Promise(resolve => {
    setTimeout(() => {
      console.log('Module loaded:', name);
      resolve({ default: { name, loadedAt: Date.now() } });
    }, ms);
  });
}

async function main() {
  console.log('App started');

  // Eager load — happens immediately at startup
  const coreModule = { version: '1.0', ready: true };
  console.log('Core ready:', coreModule.version);

  // Simulate user clicking a button 500ms later
  await new Promise(r => setTimeout(r, 500));
  console.log('User clicked "Load Chart"');

  // Dynamic import — only now do we pay the cost
  const { default: chartLib } = await simulateModuleLoad('chart.js', 300);
  console.log('Chart lib ready, loaded at:', new Date(chartLib.loadedAt).toISOString().slice(11, 19));

  // Another feature, loaded on demand
  await new Promise(r => setTimeout(r, 200));
  console.log('User clicked "Export PDF"');
  const { default: pdfLib } = await simulateModuleLoad('pdf-lib', 400);
  console.log('PDF lib ready:', pdfLib.name);
}

main();`,
      outputHeight: 260,
    },

    {
      type: 'js',
      instruction: `### CommonJS vs ESM — Reading Node.js Code

You will constantly encounter both syntaxes in the wild. Here is the mapping:`,
      startCode: `// CommonJS (Node.js classic syntax)
// const fs = require('fs');
// const { join } = require('path');
// module.exports = { myFunction };
// module.exports.helper = helperFn;

// ESM (modern syntax)
// import fs from 'fs';
// import { join } from 'path';
// export function myFunction() {}
// export { helperFn as helper };

// --- Key behavioral differences ---

// CJS: require() can be called anywhere, dynamically
// function loadConfig(env) {
//   const config = require('./config-' + env + '.json');  // dynamic!
//   return config;
// }

// ESM: imports must be at the top level, statically analyzable
// (dynamic import() is the escape hatch when you need it)

// Simulating the difference conceptually:
const cjsStyle = {
  exports: {},
  require(name) { return { name, type: 'commonjs' }; }
};

cjsStyle.exports.greet = (name) => 'Hello, ' + name;
cjsStyle.exports.VERSION = '2.0';

// Consumer side:
const { greet, VERSION } = cjsStyle.exports;
console.log(greet('World'));
console.log('Version:', VERSION);

// In ESM you'd write:
// import { greet, VERSION } from './greeter.js'
// But the module graph is resolved before any code runs.
// Circular deps are handled differently — ESM handles them more gracefully.
console.log('Both systems expose the same API, different loading semantics');`,
      outputHeight: 200,
    },

    {
      type: 'challenge',
      instruction: `### Challenge 1: Module Pattern with Private State

Implement a \`createCounter\` module factory that returns a public API with \`increment\`, \`decrement\`, and \`getCount\` — but keeps the count variable private (not accessible from outside).

Log three increments, one decrement, then the final count. Expected:
\`\`\`
count: 2
\`\`\``,
      startCode: `function createCounter(initial = 0) {
  // your module code — count should be private
}

const counter = createCounter(0);
counter.increment();
counter.increment();
counter.increment();
counter.decrement();
console.log('count:', counter.getCount());`,
      solutionCode: `function createCounter(initial = 0) {
  let count = initial;
  return {
    increment() { count++; },
    decrement() { count--; },
    getCount() { return count; },
  };
}
const counter = createCounter(0);
counter.increment();
counter.increment();
counter.increment();
counter.decrement();
console.log('count:', counter.getCount());`,
      check: (code, logs) =>
        logs[0] === 'count: 2' &&
        !/counter\.count/.test(code),
      successMessage: 'Correct! The module pattern uses closures to create private state — the same idea as ES module scope isolation.',
      failMessage: 'Return { increment, decrement, getCount } from createCounter. The count variable must be private (not a property on the returned object).',
      outputHeight: 200,
    },

    {
      type: 'challenge',
      instruction: `### Challenge 2: Barrel Re-export Pattern

Simulate a barrel file by creating three mini-modules as plain objects, then composing them into a single \`utils\` object that re-exports everything.

Required modules:
- \`mathUtils\`: \`{ add(a,b), multiply(a,b) }\`
- \`stringUtils\`: \`{ capitalize(s), truncate(s, n) }\` (truncate appends '...' if \`s.length > n\`)
- \`utils\`: re-exports all of the above

Log:
\`\`\`
6
Hello World
Hello...
\`\`\``,
      startCode: `const mathUtils = {
  // add, multiply
};

const stringUtils = {
  // capitalize, truncate
};

// barrel — re-export everything
const utils = {
  // spread or individually reference mathUtils and stringUtils
};

console.log(utils.multiply(2, 3));
console.log(utils.capitalize('hello world'));
console.log(utils.truncate('Hello there', 5));`,
      solutionCode: `const mathUtils = {
  add: (a, b) => a + b,
  multiply: (a, b) => a * b,
};
const stringUtils = {
  capitalize: (s) => s.charAt(0).toUpperCase() + s.slice(1),
  truncate: (s, n) => s.length > n ? s.slice(0, n) + '...' : s,
};
const utils = { ...mathUtils, ...stringUtils };

console.log(utils.multiply(2, 3));
console.log(utils.capitalize('hello world'));
console.log(utils.truncate('Hello there', 5));`,
      check: (code, logs) =>
        logs[0] === '6' &&
        logs[1] === 'Hello world' &&
        logs[2] === 'Hello...',
      successMessage: 'Correct! Barrel files work exactly like this — merge and re-export. In real ESM: export { add } from \'./math.js\'.',
      failMessage: 'Build mathUtils and stringUtils separately, then spread them into utils. Check capitalize only uppercases the first letter.',
      outputHeight: 200,
    },

  ],
};

export default {
  id: 'js-core-4-4-modules-esm',
  slug: 'modules-import-export-esm',
  chapter: 'js4.1',
  order: 3,
  title: 'Modules — import, export, and ESM',
  subtitle: 'Split code across files, understand ESM vs CommonJS, barrel files, and dynamic import.',
  tags: ['javascript', 'modules', 'esm', 'import', 'export', 'commonjs', 'dynamic-import', 'code-splitting'],

  hook: {
    question: 'How does JavaScript share code across files without polluting the global scope?',
    realWorldContext: 'Every modern JavaScript project uses modules — React components, npm packages, utility libraries. Understanding ESM vs CommonJS and how bundlers handle them is essential for reading real-world codebases.',
    previewVisualizationId: 'JSNotebook',
  },

  intuition: {
    prose: [
      'ESM: static import/export at the top of the file. Analyzed before code runs. Default for browsers and modern Node.',
      'CommonJS: require() anywhere, dynamic. Still used in most npm packages and older Node code.',
      'Default export = the main thing. Named exports = the supporting cast.',
      'Dynamic import() loads a module on demand — the foundation of code splitting.',
      'Barrel files (index.js) create a clean public API by re-exporting from multiple submodules.',
    ],
    callouts: [
      {
        type: 'tip',
        title: 'Circular Imports',
        body: 'ESM handles circular dependencies better than CommonJS. With CJS, a circular require() returns a partially-constructed module.exports — a common source of "undefined is not a function" bugs. With ESM, the engine resolves the full graph first and live-binds the exports.',
      },
      {
        type: 'tip',
        title: 'Tree Shaking',
        body: 'Because ESM imports are static, bundlers like Vite and webpack can determine at build time which exports are actually used. Unused exports are "shaken" out of the final bundle. CommonJS\'s dynamic require() makes this impossible.',
      },
    ],
    visualizations: [
      {
        id: 'JSNotebook',
        title: 'Modules — import, export, ESM',
        props: { lesson: LESSON_JS_CORE_4_4 },
      },
    ],
  },

  math: { prose: [], callouts: [], visualizations: [] },
  rigor: { prose: [], callouts: [], visualizations: [] },
  examples: [],
  challenges: [],
  mentalModel: [
    'ESM: import/export at file top. Statically analyzed. One canonical instance per module.',
    'Default export: one per module. Named exports: any number.',
    'import * as ns from \'./mod\' → namespace object with all named exports.',
    'Dynamic import() → Promise<module>. Use for code splitting and conditional loads.',
    'CommonJS require() is dynamic and synchronous. ESM import is static and async.',
  ],
  checkpoints: ['read-intuition'],
  quiz: [],
};
