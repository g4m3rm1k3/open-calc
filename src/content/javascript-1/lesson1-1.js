const LESSON_JS_CORE_1_1 = {
  title: 'Variables: Bindings, Not Boxes',
  subtitle: 'Understanding let, const, TDZ, and the reference model of memory.',
  sequential: true,

  cells: [
    {
      type: 'markdown',
      instruction: `### The Mental Model: Bindings
      
In many introductory courses, variables are described as "boxes" where you put values. This is a helpful starting point, but it's technically inaccurate and leads to confusion later with Objects and References.

In JavaScript, variables are **Bindings**. 

Think of a variable as a **string** tied to a **balloon**. 
- The **String** is the name (the identifier).
- The **Balloon** is the value in memory.

When you say \`let x = 10\`, you aren't putting 10 in a box. You are tying the label \`x\` to the number \`10\`.`,
    },
    {
      type: 'js',
      instruction: `### Visualization: The Binding Map
      
Run this cell to see how JavaScript maps names to values. Notice how multiple names can point to the same "balloon" (value), and how reassigning a variable just moves the string to a new balloon.`,
      html: `<div class="binding-container">
        <div id="labels" class="panel">Labels (Stack)</div>
        <div id="values" class="panel">Values (Heap/Stack)</div>
        <svg id="lines" class="lines-svg"></svg>
      </div>`,
      css: `.binding-container { height: 100%; display: grid; grid-template-columns: 1fr 1fr; gap: 40px; background: #0a1220; padding: 20px; border-radius: 12px; position: relative; overflow: hidden; }
      .panel { border: 1px solid #1e293b; background: #111827; border-radius: 8px; padding: 15px; color: #94a3b8; font-family: monospace; font-size: 12px; display: flex; flex-direction: column; gap: 10px; z-index: 2; }
      .label-box, .value-box { padding: 8px 12px; border-radius: 6px; background: #1e293b; color: #e2e8f0; border: 1px solid #334155; text-align: center; transition: all 0.3s ease; }
      .lines-svg { position: absolute; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; z-index: 1; }
      .line { stroke: #38bdf8; stroke-width: 2; stroke-dasharray: 4; animation: dash 20s linear infinite; }
      @keyframes dash { to { stroke-dashoffset: -1000; } }`,
      startCode: `const labelsEl = document.getElementById('labels');
const valuesEl = document.getElementById('values');
const svg = document.getElementById('lines');

function createBinding(name, val, color = '#38bdf8') {
  const l = document.createElement('div');
  l.className = 'label-box';
  l.textContent = name;
  l.id = 'label-' + name;
  labelsEl.appendChild(l);

  const v = document.createElement('div');
  v.className = 'value-box';
  v.textContent = val;
  v.id = 'value-' + val.replace(/\\s/g, '');
  valuesEl.appendChild(v);

  setTimeout(() => {
    const lRect = l.getBoundingClientRect();
    const vRect = v.getBoundingClientRect();
    const cRect = labelsEl.parentElement.getBoundingClientRect();

    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', lRect.right - cRect.left);
    line.setAttribute('y1', (lRect.top + lRect.bottom)/2 - cRect.top);
    line.setAttribute('x2', vRect.left - cRect.left);
    line.setAttribute('y2', (vRect.top + vRect.bottom)/2 - cRect.top);
    line.setAttribute('class', 'line');
    line.style.stroke = color;
    svg.appendChild(line);
  }, 100);
}

createBinding('let score', '100', '#10b981');
createBinding('let user', '{ name: "Ada" }', '#f59e0b');
console.log('Variables are bindings (lines) between names (labels) and values (balloons).');`,
      outputHeight: 250,
    },
    {
      type: 'markdown',
      instruction: `### let vs const: The Rule of Mutation
      
JavaScript provides two primary ways to create bindings today:

1. **\`let\`**: Creates a "re-assignable" binding. You can untie the string from one balloon and tie it to another.
2. **\`const\`**: Creates a "constant" binding. The string is permanently tied to that balloon.

> **Crucial Distinction**: \`const\` prevents **re-assignment**, but it does NOT necessarily prevent **mutation** if the balloon contains an object. We'll explore this next point deeply.`,
    },
    {
      type: 'js',
      instruction: `### Mechanics: Re-assignment
      
Observe what happens when we use \`let\` vs \`const\`. If you try to re-assign a \`const\`, JavaScript will throw an error. 

Run this code and look at the console.`,
      startCode: `let score = 10;
score = 20; // Legal! We moved the 'score' label to a new number.
console.log('let score is now:', score);

const gravity = 9.8;
try {
  gravity = 10; // Illegal! We tried to untie a 'const' label.
} catch (e) {
  console.error('Error re-assigning const:', e.message);
}

console.log('const gravity remains:', gravity);`,
      outputHeight: 180,
    },
    {
      type: 'markdown',
      instruction: `### Re-assignment vs. Mutation
      
This is the single most common point of confusion for new JS developers.

- **Re-assignment**: Changing *which* balloon the label points to. (Forbidden for \`const\`)
- **Mutation**: Changing the *contents* of the balloon itself. (Allowed for \`const\` if the value is an object!)

Imagine a \`const\` binding to a house. You cannot point the label at a different house, but you *can* paint the front door of the house you are tied to.`,
    },
    {
      type: 'js',
      instruction: `### Visualization: Mutating a const Object
      
In the code below, \`person\` is a \`const\`. We cannot do \`person = somethingElse\`, but we **can** change properties inside the object.

Run the cell and watch the "Balloon" content change while the "String" remains tied to the same object.`,
      html: `<div class="mut-viz">
        <div id="binding-path" class="path">
          <span class="label">const user</span>
          <span class="arrow">→</span>
          <span id="obj-balloon" class="balloon">{ name: "Ada" }</span>
        </div>
        <button id="mutate-btn">Mutate Property</button>
      </div>`,
      css: `.mut-viz { height: 100%; background: #0a1220; padding: 20px; border-radius: 12px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 20px; }
      .path { display: flex; align-items: center; gap: 15px; font-family: monospace; font-size: 16px; }
      .label { color: #f59e0b; font-weight: 800; }
      .arrow { color: #475569; }
      .balloon { padding: 10px 20px; background: #1e293b; border: 2px solid #38bdf8; border-radius: 99px; color: #fff; transition: all 0.3s ease; }
      .mutated { transform: scale(1.1); border-color: #10b981; background: #064e3b; }
      button { padding: 8px 16px; border-radius: 8px; border: 1px solid #334155; background: #111827; color: #cbd5e1; cursor: pointer; transition: all 0.2s; }
      button:hover { background: #1e293b; border-color: #38bdf8; }`,
      startCode: `const user = { name: "Ada" };
document.getElementById('mutate-btn').onclick = () => {
  user.name = "Byron"; // This is MUTATION, not re-assignment.
  const b = document.getElementById('obj-balloon');
  b.textContent = JSON.stringify(user);
  b.classList.add('mutated');
  console.log('Mutated const object. Properties changed, but binding remains.', user);
};`,
      outputHeight: 220,
    },
    {
      type: 'markdown',
      instruction: `### var: The Ghost of JavaScript Past
      
Before 2015 (ES6), we only had \`var\`. You should almost **never** use it today, but you must understand why it's dangerous.

\`var\` has two problematic behaviors:
1. **No Block Scope**: It "leaks" out of \`if\` blocks and \`for\` loops.
2. **Hoisting**: It exists (as \`undefined\`) even before the line where you declare it.

\`let\` and \`const\` were invented to solve these specific "leakage" issues.`,
    },
    {
      type: 'js',
      instruction: `### The Temporal Dead Zone (TDZ)
      
Unlike \`var\`, which is "hoisted" and initialized to \`undefined\`, \`let\` and \`const\` are hoisted but **NOT initialized**.

The period between the start of the block and the declaration line is called the **Temporal Dead Zone**. If you try to touch the variable here, the engine throws a ReferenceError. It's a safety feature!

Predict what happens when you run this.`,
      startCode: `try {
  console.log('Touching x before let:', x);
} catch (e) {
  console.log('Caught Error:', e.message); // This is the TDZ in action!
}

let x = 42;
console.log('Touching x after let:', x);`,
      outputHeight: 180,
    },
    {
      type: 'js',
      instruction: `### Visualization: The TDZ Wall
      
Imagine a wall at the start of your code block. You cannot reach past this wall to grab a variable until the code execution "unlocks" it at the declaration line.

Run to see the "execution engine" try to reach variables.`,
      html: `<div class="tdz-viz">
        <div id="tdz-wall" class="wall">Temporal Dead Zone</div>
        <div class="code-line">1: <span class="dim">console.log(val)</span></div>
        <div class="code-line">2: <span class="highlight">let val = 100</span></div>
        <div class="code-line">3: <span class="dim">console.log(val)</span></div>
        <div id="engine-cursor" class="cursor">Engine Position</div>
      </div>`,
      css: `.tdz-viz { height: 100%; background: #0a1220; padding: 20px; border-radius: 12px; position: relative; font-family: monospace; }
      .wall { position: absolute; top: 0; left: 0; width: 100%; height: 50%; background: rgba(239, 68, 68, 0.1); border-bottom: 2px dashed #ef4444; color: #fca5a5; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 10px; text-transform: uppercase; letter-spacing: 2px; }
      .code-line { padding: 5px; color: #64748b; font-size: 13px; }
      .highlight { color: #38bdf8; font-weight: 800; }
      .dim { opacity: 0.5; }
      .cursor { position: absolute; left: -10px; top: 15px; color: #10b981; font-weight: 800; transition: top 1s ease; font-size: 10px; }`,
      startCode: `const cursor = document.getElementById('engine-cursor');
const wall = document.getElementById('tdz-wall');
setTimeout(() => {
  cursor.style.top = '15px'; // Line 1
  console.log('Position: Line 1 (Inside TDZ)');
}, 500);
setTimeout(() => {
  cursor.style.top = '40px'; // Line 2
  wall.style.opacity = '0';
  console.log('Position: Line 2 (Locked & Initialized)');
}, 1500);
setTimeout(() => {
  cursor.style.top = '65px'; // Line 3
  console.log('Position: Line 3 (Safe Access)');
}, 2500);`,
      outputHeight: 220,
    },
    {
      type: 'markdown',
      instruction: `### Block Scope: Where Variables Live
      
A "block" is anything between curly braces \`{ ... }\`. 

- Variables declared with \`let\` or \`const\` only exist inside the block where they were born.
- This prevents "variable pollution" where a variable from one part of your app accidentally messes with another.`,
    },
    {
      type: 'js',
      instruction: `### Variable Shadowing
      
When you declare a variable inside a block with the **same name** as a variable outside, the inner one "shadows" (hides) the outer one. They are two completely different bindings.

Predict the logs before running.`,
      startCode: `let user = "Alice";

if (true) {
  let user = "Bob"; // This shadows the outer user
  console.log('Inside block:', user);
}

console.log('Outside block:', user);`,
      outputHeight: 180,
    },
    {
      type: 'markdown',
      instruction: `### Summary of the Binding Model
      
1. **Declaration**: You tell JS "I want a name called 'x'".
2. **Initialization**: JS unties 'x' from the TDZ and ties it to a value (often \`undefined\` by default).
3. **Assignment**: You tie 'x' to a specific value balloon.
4. **const**: The tie (binding) is permanent.
5. **let**: The tie can be moved.
6. **Object values**: The balloon contains a map. You can change what's *inside* the balloon even if the tie is permanent.`,
    },
    {
      type: 'js',
      instruction: `### Practical Example: The State Toggle
      
Let's apply all this. We'll use a \`let\` for a toggle state and a \`const\` for a config object. notice we mutate the config but re-assign the toggle.`,
      html: `<div class="app-sim">
        <button id="toggle-btn">Toggle Theme</button>
        <div id="status">Theme: Light</div>
      </div>`,
      css: `.app-sim { padding: 20px; background: #111827; border-radius: 8px; text-align: center; }
      #status { margin-top: 10px; color: #94a3b8; font-family: monospace; }`,
      startCode: `const config = { theme: 'light' }; // constant binding to an object
let isActive = false;             // re-assignable binding

document.getElementById('toggle-btn').onclick = () => {
  isActive = !isActive; // Re-assignment
  config.theme = isActive ? 'dark' : 'light'; // Mutation
  
  document.getElementById('status').textContent = 'Theme: ' + config.theme + ' (Active: ' + isActive + ')';
  console.log('App state updated:', { isActive, config });
};`,
      outputHeight: 150,
    },
    {
       type: 'markdown',
       instruction: `### Before the Challenges
       
Success in these challenges requires applying the **Binding Map** mental model. Don't ask "what does this code do?", ask "where are the labels pointed?"

Keep in mind:
- \`const\` + Object = Allowed property changes.
- \`let\` = Moving the label allowed.
- TDZ = Don't touch before declaration.`,
    },

    {
      type: 'challenge',
      instruction: 'Challenge 1: Re-assignment vs Mutation. Predicting the outcome of a const object mutation. Change the value of `expectedScore` to match what will be logged.',
      startCode: `const player = { score: 10, name: "Zara" };
player.score = 50;

const expectedScore = 0; // Change this

console.log('Zaras score is:', player.score);
const isCorrect = expectedScore === player.score;
console.log('Correct?', isCorrect);`,
      solutionCode: `const player = { score: 10, name: "Zara" };
player.score = 50;
const expectedScore = 50;
console.log('Zaras score is:', player.score);
const isCorrect = expectedScore === player.score;
console.log('Correct?', isCorrect);`,
      check: (code) => /expectedScore\s*=\s*50/.test(code),
      successMessage: 'Correct! Mutating a property inside a const object is allowed.',
      failMessage: 'Remember: const prevents re-assignment (player = ...), not mutation (player.score = ...).',
    },
    {
      type: 'challenge',
      instruction: 'Challenge 2: Fixed the TDZ Error. The code below crashes because it tries to use `val` before it is initialized. Move the declaration to fix it.',
      startCode: `console.log('The lucky number is:', val); // Error here!
let val = 7;`,
      solutionCode: `let val = 7;
console.log('The lucky number is:', val);`,
      check: (code) => {
        const lines = code.split('\\n').map(l => l.trim()).filter(l => l !== '');
        return lines.indexOf('let val = 7;') < lines.findIndex(l => l.includes('console.log'));
      },
      successMessage: 'Correct. You must declare a let/const variable before you can access it (exiting the TDZ).',
      failMessage: 'Check the line order. You are still trying to log val before it is declared.',
    },
    {
        type: 'challenge',
        instruction: 'Challenge 3: Shadowing. What will the following code log? Change prediction1 and prediction2.',
        startCode: `let x = 10;
if (true) {
  let x = 20;
}
const prediction1 = 0; // What is x inside the block?
const prediction2 = 0; // What is x outside the block?

console.log('Outside:', x);`,
        solutionCode: `let x = 10;
if (true) {
  let x = 20;
}
const prediction1 = 20;
const prediction2 = 10;
console.log('Outside:', x);`,
        check: (code) => /prediction1\s*=\s*20/.test(code) && /prediction2\s*=\s*10/.test(code),
        successMessage: 'Correct. The outer x remains 10 because the inner x was a separate binding in a different scope.',
    },
    {
      type: 'challenge',
      instruction: 'Challenge 4: Const Re-assignment. Identify if the following line is valid or invalid. Change isValid to true or false.',
      startCode: `const status = "online";
status = "offline";

const isValid = true; // Change this`,
      solutionCode: `const status = "online";
// status = "offline"; // This would throw an error
const isValid = false;`,
      check: (code) => /isValid\s*=\s*false/.test(code),
      successMessage: 'Correct. Primitives (like strings) cannot be mutated, and const forbids re-assignment.',
    },
    {
        type: 'challenge',
        instruction: 'Challenge 5: Mutating vs Reassigning Arrays. Arrays are objects. Which of these is allowed for a const array? Change the boolean values.',
        startCode: `const arr = [1, 2];

// Option A: arr.push(3);
// Option B: arr = [1, 2, 3];

const canDoA = false; 
const canDoB = false;`,
        solutionCode: `const arr = [1, 2];
const canDoA = true; // Mutation is allowed
const canDoB = false; // Re-assignment is forbidden`,
        check: (code) => /canDoA\s*=\s*true/.test(code) && /canDoB\s*=\s*false/.test(code),
        successMessage: 'Spot on. Mutation (.push) is safe; re-assignment (=) is a crash.',
    },
    {
        type: 'challenge',
        instruction: 'Challenge 6: Memory Model Synthesis. In your own words (log it), explain why "Variables are bindings, not boxes" helps you understand why const objects can be changed.',
        startCode: `// Write your explanation in the log below.
console.log('???');`,
        solutionCode: `console.log('Because the binding is the tether to the object, not the object itself. I can change what is inside the object as long as I do not try to move the tether to a new object.');`,
        check: (code) => code.length > 20 && code.includes('console.log'),
        successMessage: 'Excellent. You are thinking like a JavaScript engine.',
    },
  ],
};

export default {
  id: 'j1-variables-bindings',
  title: 'Variables: Bindings, Not Boxes',
  slug: 'variables-bindings-properly',
  number: '1.1',
  chapter: 'JavaScript 1',
  description: 'Master the nuance of let, const, TDZ, and the reference model of variables.',
  
  tags: ['javascript', 'variables', 'scope', 'tdz', 'hoisting', 'mutation'],

  intuition: {
    prose: [
      'Stop thinking of variables as containers. Think of them as labels tied to values in memory.',
      'This distinction is critical for understanding why some constants can still be "changed" and why "let" behaves differently in loops.',
    ],
    callouts: [
      {
        type: 'warning',
        title: 'The Const Catch',
        body: 'Const protects the BINDING, not the VALUE. If the value is an object, that object can still change.',
      },
    ],
    visualizations: [
      {
        id: 'JSNotebook',
        title: 'Variable Binding Lab',
        props: {
          lesson: LESSON_JS_CORE_1_1,
        },
      },
    ],
  },

  mentalModel: [
    'Binding: A named connection to a memory address.',
    'Temporal Dead Zone: A safety period where a variable exists but cannot be accessed.',
    'Re-assignment: Moving a label to a new value.',
    'Mutation: Changing the data inside a referenced object.',
  ],

  checkpoints: ['read-intuition'],
  quiz: [],
};
