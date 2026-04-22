import lesson0_0 from './lesson0-0.js'
import lesson0_1 from './lesson0-1.js'
import lesson0_2 from './lesson0-2.js'
import lesson0_3 from './lesson0-3.js'
import lesson1_1 from './lesson1-1.js'
import lesson1_2 from './lesson1-2.js'
import lesson2_1 from './lesson2-1.js'
import lesson2_2 from './lesson2-2.js'
import lesson2_3 from './lesson2-3.js'
import lesson2_4 from './lesson2-4.js'

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
  title: 'Functions and Closures',
  number: 'js2.1',
  slug: 'functions-and-closures',
  description: 'Declarations, expressions, arrow functions, hoisting, scope, and closure-based state.',
  course: 'javascript-core',
  lessons: [
    lesson2_1,
    lesson2_2,
    lesson2_3,
    lesson2_4,
  ],
};

export default [J1, J2, J3];
