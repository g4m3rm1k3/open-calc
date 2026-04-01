/**
 * JS1_DomIntro.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Chapter JS1: "The Box That Doesn't Know It Exists"
 * Introduction to the DOM — what it is, how to find elements, how to change them.
 *
 * Covers:
 *   - What the DOM is (data structure, not the file)
 *   - document.querySelector()
 *   - .textContent
 *   - .style.color / .style.background
 *   - classList.add / .remove / .toggle
 *   - Challenge: make a button change text on click
 *
 * Usage: register JSNotebook in VizFrame, then set lesson={LESSON_JS1}
 * ─────────────────────────────────────────────────────────────────────────────
 */
import JSNotebook from "./JSNotebook.jsx";

// ── Base styles shared across cells ─────────────────────────────────────────
const BASE_CSS = `
  body { font-family: 'Segoe UI', sans-serif; padding: 16px; background: #0f1923; color: #e2e8f0; }
  .box {
    display: inline-block;
    padding: 14px 22px;
    border-radius: 8px;
    background: #1e293b;
    border: 1.5px solid #334155;
    font-size: 15px;
    font-weight: 500;
    margin: 4px;
    transition: all 0.2s;
  }
  .highlight { border-color: #38bdf8; background: #0c2a3a; color: #38bdf8; }
  .selected  { border-color: #34d399; background: #0a2a1f; color: #34d399; }
  .danger    { border-color: #f87171; background: #2a0f0f; color: #f87171; }
  button.my-btn {
    padding: 8px 20px; border-radius: 6px;
    background: #0ea5e9; border: none; color: #fff;
    font-size: 14px; font-weight: 600; cursor: pointer;
    margin-top: 8px; display: block;
  }
  button.my-btn:hover { background: #38bdf8; }
  .counter {
    font-size: 48px; font-weight: 700; color: #a78bfa;
    text-align: center; padding: 20px; letter-spacing: -2px;
  }
`;

// ── The lesson ───────────────────────────────────────────────────────────────
export const LESSON_JS1 = {
  title: "The Box That Doesn't Know It Exists",
  subtitle: "An introduction to the DOM — the live data structure behind every webpage.",
  sequential: true,

  cells: [

    // ── 0: What is the DOM? ─────────────────────────────────────────────────
    {
      type: "markdown",
      instruction: `When a browser loads an HTML file, it doesn't just display the text — it builds a tree of objects in memory. That tree is called the DOM: the Document Object Model.

Every tag becomes an object. Every object has properties you can read and change with JavaScript. Changing those properties instantly updates what you see on screen.

The HTML file on disk stays the same. The DOM in memory changes. That's the key insight: you are NOT editing a file. You are talking to live objects.

In this lesson you'll learn to find elements in that tree and change them. Run each cell and watch what happens.`,
    },

    // ── 1: querySelector ────────────────────────────────────────────────────
    {
      type: "js",
      instruction: `\`document.querySelector(selector)\` finds the FIRST element matching a CSS selector and returns it as a JavaScript object.

Try selecting \`.box\` — the dot means "an element with this class." Then log what you get.`,
      html: `<div class="box" data-inspect>I am a box. Find me with JS.</div>`,
      css: BASE_CSS,
      startCode: `// document.querySelector works like CSS selectors
// .className, #id, tagName, etc.

const box = document.querySelector('.box');
console.log(box);           // the element object
console.log(box.tagName);   // what kind of element
console.log(box.textContent); // the text inside`,
      solutionCode: `const box = document.querySelector('.box');
console.log(box);
console.log(box.tagName);
console.log(box.textContent);`,
      showDom: true,
      outputHeight: 100,
    },

    // ── 2: textContent ──────────────────────────────────────────────────────
    {
      type: "js",
      instruction: `Once you have an element, you can read and WRITE its properties.

\`.textContent\` is the text inside the element. Assign to it like a variable and the screen updates immediately.`,
      html: `<div class="box" data-inspect>Original text. Change me.</div>`,
      css: BASE_CSS,
      startCode: `const box = document.querySelector('.box');

// Read it
console.log('Before:', box.textContent);

// Write it — the page updates instantly
box.textContent = 'JavaScript changed this!';

console.log('After:', box.textContent);`,
      solutionCode: `const box = document.querySelector('.box');
console.log('Before:', box.textContent);
box.textContent = 'JavaScript changed this!';
console.log('After:', box.textContent);`,
      showDom: true,
      outputHeight: 100,
    },

    // ── 3: style property ───────────────────────────────────────────────────
    {
      type: "js",
      instruction: `Every element has a \`.style\` object. Properties on it are camelCase versions of CSS properties.

\`element.style.color\` = the CSS \`color\` property.
\`element.style.backgroundColor\` = the CSS \`background-color\` property.

Try changing some styles below.`,
      html: `<div class="box" data-inspect>Style me with JS.</div>`,
      css: BASE_CSS,
      startCode: `const box = document.querySelector('.box');

// CSS: color, background-color, font-size, border-radius...
// JS: color, backgroundColor, fontSize, borderRadius...

box.style.color = '#38bdf8';
box.style.backgroundColor = '#0c2a3a';
box.style.fontSize = '18px';
box.style.padding = '20px 30px';

console.log('Style applied!');`,
      solutionCode: `const box = document.querySelector('.box');
box.style.color = '#38bdf8';
box.style.backgroundColor = '#0c2a3a';
box.style.fontSize = '18px';
box.style.padding = '20px 30px';
console.log('Style applied!');`,
      showDom: true,
      outputHeight: 110,
    },

    // ── 4: classList ─────────────────────────────────────────────────────────
    {
      type: "js",
      instruction: `\`.style\` works but it's messy for complex changes. The better way is to pre-define styles in CSS classes, then use \`.classList\` to add and remove them.

\`element.classList.add('highlight')\` — adds the class.
\`element.classList.remove('highlight')\` — removes it.
\`element.classList.toggle('highlight')\` — adds if missing, removes if present.
\`element.classList.contains('highlight')\` — returns true/false.

Watch the DOM Inspector update when you add a class.`,
      html: `<div class="box" data-inspect>Watch my class list change.</div>`,
      css: BASE_CSS,
      startCode: `const box = document.querySelector('.box');

console.log('Classes before:', box.className);

box.classList.add('highlight');
console.log('After add:', box.className);

box.classList.add('selected');
console.log('After second add:', box.className);

box.classList.remove('highlight');
console.log('After remove:', box.className);

console.log('Has selected?', box.classList.contains('selected'));`,
      solutionCode: `const box = document.querySelector('.box');
console.log('Classes before:', box.className);
box.classList.add('highlight');
console.log('After add:', box.className);
box.classList.add('selected');
console.log('After second add:', box.className);
box.classList.remove('highlight');
console.log('After remove:', box.className);
console.log('Has selected?', box.classList.contains('selected'));`,
      showDom: true,
      outputHeight: 110,
    },

    // ── 5: querySelectorAll ──────────────────────────────────────────────────
    {
      type: "js",
      instruction: `\`querySelector\` finds ONE element. \`querySelectorAll\` returns ALL matching elements as a NodeList — similar to an array.

Loop over it with \`forEach\` to affect every matching element at once.`,
      html: `
<div class="box" data-inspect>Box one</div>
<div class="box" data-inspect>Box two</div>
<div class="box" data-inspect>Box three</div>`,
      css: BASE_CSS,
      startCode: `// querySelectorAll returns a NodeList — like an array
const boxes = document.querySelectorAll('.box');

console.log('Found:', boxes.length, 'elements');

// forEach works like on an array
boxes.forEach((box, index) => {
  box.textContent = 'Box ' + (index + 1) + ' updated!';
  box.classList.add('highlight');
});`,
      solutionCode: `const boxes = document.querySelectorAll('.box');
console.log('Found:', boxes.length, 'elements');
boxes.forEach((box, index) => {
  box.textContent = 'Box ' + (index + 1) + ' updated!';
  box.classList.add('highlight');
});`,
      showDom: true,
      outputHeight: 160,
    },

    // ── 6: addEventListener ──────────────────────────────────────────────────
    {
      type: "js",
      instruction: `So far you've run code that fires once. Real webpages respond to user actions.

\`element.addEventListener('click', function)\` attaches a function that runs every time the element is clicked. The function receives an event object \`e\` with info about what happened.

Click the button below after running.`,
      html: `
<div class="box" data-inspect id="display">Click the button!</div>
<button class="my-btn" id="btn">Click me</button>`,
      css: BASE_CSS,
      startCode: `const display = document.querySelector('#display');
const btn = document.querySelector('#btn');

let clickCount = 0;

btn.addEventListener('click', function(e) {
  clickCount++;
  display.textContent = 'Clicked ' + clickCount + ' times!';
  
  // Toggle class every other click
  display.classList.toggle('highlight');
  
  console.log('Click event:', e.type, 'on', e.target.tagName);
});`,
      solutionCode: `const display = document.querySelector('#display');
const btn = document.querySelector('#btn');
let clickCount = 0;
btn.addEventListener('click', function(e) {
  clickCount++;
  display.textContent = 'Clicked ' + clickCount + ' times!';
  display.classList.toggle('highlight');
  console.log('Click event:', e.type, 'on', e.target.tagName);
});`,
      showDom: false,
      outputHeight: 160,
    },

    // ── 7: Challenge ─────────────────────────────────────────────────────────
    {
      type: "challenge",
      instruction: `Your turn. The HTML has a \`<div>\` with id \`"status"\` and a button with id \`"toggle-btn"\`.

Write JavaScript that:
1. Selects both elements.
2. When the button is clicked, toggles the class \`"selected"\` on the div.
3. Also updates the div's \`textContent\` to say either \`"ON"\` or \`"OFF"\` based on whether the class is present.

Click Run, then click the button to test.`,
      html: `
<div class="box" id="status" data-inspect>OFF</div>
<button class="my-btn" id="toggle-btn">Toggle</button>`,
      css: BASE_CSS,
      startCode: `// Select the elements
const status = document.querySelector('#status');
const btn = document.querySelector('#toggle-btn');

// Add a click listener to btn
// When clicked:
//   - toggle 'selected' class on status
//   - set textContent to 'ON' or 'OFF'
`,
      solutionCode: `const status = document.querySelector('#status');
const btn = document.querySelector('#toggle-btn');

btn.addEventListener('click', function() {
  status.classList.toggle('selected');
  status.textContent = status.classList.contains('selected') ? 'ON' : 'OFF';
});`,
      check: (code) => {
        return (
          code.includes("classList.toggle") &&
          code.includes("addEventListener") &&
          (code.includes("'ON'") || code.includes('"ON"')) &&
          (code.includes("'OFF'") || code.includes('"OFF"'))
        );
      },
      successMessage: "✓ Excellent! You used addEventListener + classList.toggle + textContent together. That's 80% of what JS on the web actually does.",
      failMessage: "✗ Close — make sure you're using addEventListener, classList.toggle, and setting textContent to 'ON' or 'OFF' based on the class.",
      showDom: true,
      outputHeight: 160,
    },

    // ── 8: What's next ───────────────────────────────────────────────────────
    {
      type: "markdown",
      instruction: `You now know the five fundamental DOM operations:

\`querySelector\` / \`querySelectorAll\` — find elements
\`.textContent\` — read and write text
\`.style\` — set inline styles
\`.classList\` — add, remove, toggle CSS classes
\`addEventListener\` — respond to user events

Everything you see on the web — dropdowns, modals, tabs, counters, live search — is built from these five things combined.

Next: **Chapter JS2 — Making Things Move** covers \`createElement\`, \`appendChild\`, and building dynamic lists that change as data changes.`,
    },
  ],
};

export default function JS1DomIntro({ params = {} }) {
  return <JSNotebook lesson={LESSON_JS1} params={params} />;
}
