import lesson0_0 from './lesson0-0.js'
import lesson0_1 from './lesson0-1.js'
import lesson0_2 from './lesson0-2.js'
import lesson0_3 from './lesson0-3.js'
import lesson1_1 from './lesson1-1.js'
import lesson1_2 from './lesson1-2.js'
import lesson2_1 from './lesson2-1.js'
import lesson2_2 from './lesson2-2.js'
import lesson2_3 from './lesson2-3.js'
import lesson2_35 from './lesson2-35.js'
import lesson2_4 from './lesson2-4.js'
import lesson3_1 from './lesson3-1.js'
import lesson3_2 from './lesson3-2.js'
import lesson3_3 from './lesson3-3.js'
import lesson3_4 from './lesson3-4.js'
import lesson4_1 from './lesson4-1.js'
import lesson4_2 from './lesson4-2.js'
import lesson4_3 from './lesson4-3.js'
import lesson4_4 from './lesson4-4.js'
import lesson5_1 from './lesson5-1.js'
import lesson5_2 from './lesson5-2.js'
import lesson5_3 from './lesson5-3.js'
import lesson6_1 from './lesson6-1.js'

const J1 = {
  title: 'JavaScript Core Foundations',
  number: 'js0.1',
  slug: 'javascript-core-foundations',
  description: 'Language model, runtime model, and first-principles JavaScript.',
  course: 'javascript-core',
  lessons: [
    lesson0_0,
    lesson0_1,
    lesson0_2,
    lesson0_3
  ],
};

const J2 = {
  title: 'Syntax & Core Constructs',
  number: 'js1.1',
  slug: 'syntax-core-constructs',
  description: 'Variables, Bindings, and the proper way to think about JS syntax.',
  course: 'javascript-core',
  lessons: [
    lesson1_1,
    lesson1_2
  ],
};

const J3 = {
  title: 'Functions, Data, and the DOM',
  number: 'js2.1',
  slug: 'functions-data-dom',
  description: 'Functions, closures, arrays, objects, and getting real data from the browser.',
  course: 'javascript-core',
  lessons: [
    lesson2_1,   // Functions — The Reusable Unit
    lesson2_2,   // Closures — Functions That Remember
    lesson2_3,   // Arrays — Ordered Collections
    lesson2_35,  // The DOM and Forms
    lesson2_4,   // Objects — Key-Value Maps
  ],
};

const J4 = {
  title: 'Async JavaScript — Promises, async/await, and Fetch',
  number: 'js3.1',
  slug: 'async-javascript',
  description: 'The event loop, Promises, async/await, and the Fetch API — how JavaScript handles time.',
  course: 'javascript-core',
  lessons: [
    lesson3_1,   // The Event Loop — Call Stack, Microtasks, Macrotasks
    lesson3_2,   // Promises — State, Chaining, and Combinators
    lesson3_3,   // async/await — Sequential and Parallel Patterns
    lesson3_4,   // Fetch API — HTTP, REST, and Real Data
  ],
};

const J5 = {
  title: 'Prototypes, Classes, and Modules',
  number: 'js4.1',
  slug: 'prototypes-classes-modules',
  description: 'JavaScript\'s object system and module system from the ground up.',
  course: 'javascript-core',
  lessons: [
    lesson4_1,   // Prototypes — The Inheritance Chain
    lesson4_2,   // Classes — Sugar, Private Fields, and Inheritance
    lesson4_3,   // Iterators and Generators
    lesson4_4,   // Modules — import, export, and ESM
  ],
};

const J6 = {
  title: 'Libraries from CDNs',
  number: 'js5.1',
  slug: 'libraries-from-cdns',
  description: 'Load professional libraries in one script tag — Chart.js, Lodash, Axios, and Anime.js.',
  course: 'javascript-core',
  lessons: [
    lesson5_1,   // Chart.js — Data Visualization from a CDN
    lesson5_2,   // Lodash and Axios — Utility and HTTP Libraries
    lesson5_3,   // Anime.js — Animations from a CDN
  ],
};

const J7 = {
  title: 'The Browser Platform',
  number: 'js6.1',
  slug: 'browser-platform',
  description: 'localStorage, sessionStorage, cookies, and browser APIs for building stateful web apps.',
  course: 'javascript-core',
  lessons: [
    lesson6_1,   // Browser Storage — localStorage, sessionStorage, and Cookies
  ],
};

export default [J1, J2, J3, J4, J5, J6, J7];
