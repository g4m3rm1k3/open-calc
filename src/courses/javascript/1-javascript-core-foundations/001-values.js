// Chapter 0.1 — Lesson 1: JavaScript Values
//
// Teaches the core types of JavaScript values: numbers, strings, booleans, and null/undefined.

const LESSON_JS1 = {
  title: "Values: The Atoms of Logic",
  subtitle: "Every interaction on the web is just a transformation of data.",
  sequential: false,

  cells: [
    {
      type: "markdown",
      instruction: `### What is a Value?
A **value** is a piece of data that your computer can work with. In JavaScript, every button click, every text input, and every animation is just moving and changing values.

There are four main types of "primitive" values you'll use constantly:
1. **Numbers** (42, 10.5)
2. **Strings** ("Hello World")
3. **Booleans** (true, false)
4. **Nothingness** (null, undefined)`,
    },
    {
      type: "js",
      instruction: "The simplest value is a **Number**. In JavaScript, 42 and 3.14 are handled the same way. Run this cell to see how the console displays them.",
      startCode: `console.log(42);
console.log(3.14);
console.log(-100);`,
      showDom: false,
      outputHeight: 80,
    },
    {
      type: "js",
      instruction: "**Strings** are sequences of text. They must always be wrapped in quotes (single, double, or backticks).",
      startCode: `console.log("I am a double-quoted string");
console.log('I am a single-quoted string');
console.log(\`I am a template literal string\`);`,
      showDom: false,
      outputHeight: 80,
    },
    {
      type: "js",
      instruction: "**Booleans** represent truth. They have exactly two values: \`true\` or \`false\`. They are the foundation of all computer logic.",
      startCode: `console.log(true);
console.log(false);
console.log(1 > 0); // Expressions can produce booleans!`,
      showDom: false,
      outputHeight: 80,
    },
    {
      type: "challenge",
      instruction: "### Challenge: Log Your Info\nUse \`console.log()\` to output three values:\n1. Your favorite number\n2. Your name as a string\n3. The boolean \`true\` to indicate you're ready to learn.",
      startCode: `// Write your code below
`,
      solutionCode: `console.log(7);
console.log("Mike");
console.log(true);`,
      check: (code, logs) => logs.length >= 3,
      successMessage: "Perfect! You've successfully handled the main primitive types.",
      showDom: false,
      outputHeight: 100,
    }
  ]
};

export default {
  id: 'js-1-1-values',
  slug: 'values',
  chapter: 1,
  order: 1,
  title: 'Values',
  subtitle: 'The atoms of every JavaScript program',
  tags: ['javascript', 'values', 'types', 'numbers', 'strings', 'booleans'],

  hook: {
    question: "What is the simplest possible piece of information a computer can understand?",
    realWorldContext:
      "Before we build interactive apps, we need to understand what we're moving around. " +
      "A value is data. This lesson introduces the fundamental building blocks of the web.",
    previewVisualizationId: 'JSNotebook',
  },

  intuition: {
    prose: [
      'In JavaScript, everything is a value. A value is essentially a "noun" in the language — it is the thing that exists.',
      'We use four main types for almost everything: Numbers for math, Strings for text, Booleans for logic, and null/undefined for nothingness.',
    ],
    callouts: [
      {
        type: 'insight',
        title: 'Dynamic Typing',
        body: 'JavaScript is "dynamically typed," meaning a box that holds a number can later hold a string. But every piece of data itself always has a specific type.',
      },
    ],
    visualizations: [
      {
        id: 'JSNotebook',
        title: 'JavaScript Value Lab',
        params: {
          lesson: LESSON_JS1,
        },
      },
    ],
  },

  math: { prose: [], callouts: [], visualizations: [] },
  rigor: { prose: [], callouts: [], visualizations: [] },
  mentalModel: [
    'A value is a piece of data.',
    'Common types: Number, String, Boolean, Null, Undefined.',
    'console.log() is how we "look" at values in the console.',
  ],
  checkpoints: ['read-intuition'],
  quiz: [],
}
