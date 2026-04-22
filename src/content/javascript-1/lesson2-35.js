// Chapter js2.1 — Lesson 2-3b: The DOM and Forms

const LESSON_JS_CORE_2_35 = {
  title: 'The DOM and Forms',
  subtitle: 'Selecting elements, reading input, listening for events, and building objects from user data.',
  sequential: true,

  cells: [

    // ─── Part 1: What the DOM Is ─────────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `## Part 1 — What Is the DOM?

When the browser loads an HTML file, it does not just display the text — it **parses it into a tree of objects** that your JavaScript can read and modify. This tree is the **Document Object Model**, or DOM.

Every HTML element becomes a node in the tree. The node is a plain JavaScript object with properties like \`textContent\`, \`style\`, \`classList\`, and methods like \`addEventListener\`.

\`\`\`html
<div id="box">
  <p class="msg">Hello</p>
</div>
\`\`\`

After parsing, you can do this in JavaScript:

\`\`\`js
const box = document.getElementById('box');
const msg = document.querySelector('.msg');

msg.textContent = "World";         // change the text
box.style.background = "blue";     // change a style
\`\`\`

The browser re-renders instantly when you change a node — no reload required. This is how every interactive web page works: JavaScript modifies the DOM, the browser redraws.

**\`querySelector\` vs \`getElementById\`**: \`querySelector\` accepts any CSS selector — IDs, classes, tags, attribute selectors. It is the more general tool. \`getElementById\` is slightly faster but only finds by ID. In practice, use \`querySelector\` for almost everything.`,
    },

    // ─── Part 1 Cell: querySelector basics ───────────────────────────────────
    {
      type: 'js',
      instruction: `### querySelector: Finding Elements

Run this. Each button targets a different element using a different selector style — ID, class, and tag. Change the selectors and watch what gets highlighted.`,
      html: `<div class="stage">
  <div id="box" class="card">I am #box</div>
  <p class="msg">I am .msg</p>
  <span>I am a span</span>
  <div class="controls">
    <button id="b1">Select #box</button>
    <button id="b2">Select .msg</button>
    <button id="b3">Select span</button>
    <button id="b4">Reset</button>
  </div>
</div>`,
      css: `.stage{height:100%;background:#09111c;padding:18px;border-radius:12px;display:flex;flex-direction:column;gap:12px;font-family:monospace;}
.card{background:#111827;border:2px solid #1e293b;border-radius:8px;padding:12px;color:#e2e8f0;font-size:13px;transition:all .25s;}
p{background:#111827;border:2px solid #1e293b;border-radius:8px;padding:10px;color:#e2e8f0;font-size:13px;margin:0;transition:all .25s;}
span{background:#111827;border:2px solid #1e293b;border-radius:8px;padding:10px;color:#e2e8f0;font-size:13px;display:block;transition:all .25s;}
.controls{display:flex;gap:8px;flex-wrap:wrap;}
button{background:#1e2a3f;border:1px solid #334155;color:#94a3b8;padding:8px 12px;border-radius:8px;cursor:pointer;font-family:monospace;font-size:12px;}`,
      startCode: `function highlight(el) {
  el.style.borderColor = '#38bdf8';
  el.style.background  = '#0f2233';
  el.style.color       = '#38bdf8';
}
function reset() {
  ['#box', '.msg', 'span'].forEach(sel => {
    const el = document.querySelector(sel);
    el.style.borderColor = '#1e293b';
    el.style.background  = '#111827';
    el.style.color       = '#e2e8f0';
  });
}

document.getElementById('b1').onclick = () => {
  reset();
  highlight(document.querySelector('#box'));      // by ID
  console.log('selected by ID: #box');
};
document.getElementById('b2').onclick = () => {
  reset();
  highlight(document.querySelector('.msg'));      // by class
  console.log('selected by class: .msg');
};
document.getElementById('b3').onclick = () => {
  reset();
  highlight(document.querySelector('span'));      // by tag
  console.log('selected by tag: span');
};
document.getElementById('b4').onclick = reset;`,
      outputHeight: 280,
    },

    // ─── Part 2: Reading and Writing the DOM ─────────────────────────────────
    {
      type: 'markdown',
      instruction: `## Part 2 — Reading and Writing Elements

Once you have a reference to an element, you can read or change almost anything about it.

**Text content:**
\`\`\`js
el.textContent = "New text";   // sets text — safe, no HTML parsing
el.innerHTML = "<b>Bold</b>";  // sets HTML — use carefully, can introduce XSS
\`\`\`

**Styles:**
\`\`\`js
el.style.color = "red";
el.style.fontSize = "20px";    // camelCase, not kebab-case
\`\`\`

**Classes** — preferred over direct style manipulation:
\`\`\`js
el.classList.add("active");
el.classList.remove("active");
el.classList.toggle("active");
el.classList.contains("active");  // true/false
\`\`\`

**Attributes:**
\`\`\`js
el.setAttribute("disabled", "");
el.getAttribute("href");
el.removeAttribute("disabled");
\`\`\`

**Creating and inserting elements:**
\`\`\`js
const newEl = document.createElement("div");
newEl.textContent = "I am new";
parent.appendChild(newEl);       // add to end
parent.prepend(newEl);           // add to start
el.remove();                     // remove from DOM
\`\`\``,
    },

    // ─── Part 2 Cell: DOM manipulation ───────────────────────────────────────
    {
      type: 'js',
      instruction: `### Building a Live List

Click "Add item" to insert a new \`<div>\` into the list, "Clear" to empty it. This is the pattern behind every to-do list, chat message feed, or search result display.`,
      html: `<div class="app">
  <div class="toolbar">
    <button id="addBtn">Add item</button>
    <button id="clearBtn">Clear</button>
  </div>
  <div id="list" class="list"></div>
  <div id="count" class="counter">0 items</div>
</div>`,
      css: `.app{height:100%;background:#09111c;padding:16px;border-radius:12px;display:flex;flex-direction:column;gap:10px;font-family:monospace;}
.toolbar{display:flex;gap:8px;}
button{background:#1e3a5f;border:1px solid #38bdf8;color:#93c5fd;padding:8px 14px;border-radius:8px;cursor:pointer;font-size:12px;font-family:monospace;}
.list{flex:1;display:flex;flex-direction:column;gap:6px;overflow-y:auto;}
.item{background:#111827;border:1px solid #1e293b;border-radius:8px;padding:10px;color:#e2e8f0;font-size:13px;display:flex;justify-content:space-between;align-items:center;}
.remove-btn{background:none;border:none;color:#475569;cursor:pointer;font-size:16px;padding:0 4px;}
.counter{color:#475569;font-size:11px;text-align:right;}`,
      startCode: `let count = 0;

document.getElementById('addBtn').onclick = () => {
  count++;
  const item = document.createElement('div');
  item.className = 'item';
  item.innerHTML =
    '<span>Item #' + count + '</span>' +
    '<button class="remove-btn">×</button>';

  // Delete just this item when × is clicked
  item.querySelector('.remove-btn').onclick = () => {
    item.remove();
    updateCount();
  };

  document.getElementById('list').appendChild(item);
  updateCount();
  console.log('Added item #' + count);
};

document.getElementById('clearBtn').onclick = () => {
  document.getElementById('list').innerHTML = '';
  updateCount();
};

function updateCount() {
  const n = document.querySelectorAll('.item').length;
  document.getElementById('count').textContent = n + ' item' + (n === 1 ? '' : 's');
}`,
      outputHeight: 300,
    },

    // ─── Part 3: Events ───────────────────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `## Part 3 — Events: Reacting to the User

The browser constantly fires **events** as the user interacts — clicks, keypresses, mouse movements, focus changes. JavaScript listens for them with \`addEventListener\`.

\`\`\`js
element.addEventListener('click', function(event) {
  console.log('clicked!', event.target);
});
\`\`\`

The second argument is a **callback** — a function that runs when the event fires. The \`event\` object contains information about what happened: which element was clicked, which key was pressed, mouse position, etc.

**Common events:**
| Event | Fires when |
|---|---|
| \`click\` | Element is clicked |
| \`input\` | Input value changes (fires on every keystroke) |
| \`change\` | Input value is committed (blur or Enter) |
| \`submit\` | Form is submitted |
| \`keydown\` | A key is pressed |
| \`mouseover\` | Mouse enters element |
| \`focus\` / \`blur\` | Input gains/loses focus |

**\`event.preventDefault()\`** — stops the browser's default action. For forms, the default is to reload the page and send a GET/POST request to the server. In single-page apps you almost always call this:

\`\`\`js
form.addEventListener('submit', function(event) {
  event.preventDefault();   // stop the page reload
  // handle the data yourself
});
\`\`\`

**Event delegation** — instead of attaching listeners to every child, attach one to the parent and check \`event.target\`. This is more efficient for dynamic lists where children are added at runtime.`,
    },

    // ─── Part 3 Cell: events ─────────────────────────────────────────────────
    {
      type: 'js',
      instruction: `### Events: click, input, keydown

Run this and interact — type in the box, click buttons, press keys. Each event type is logged with its relevant data. Notice how \`input\` fires on every keystroke while \`change\` only fires when you leave the field.`,
      html: `<div class="app">
  <input id="textInput" type="text" placeholder="Type something…" />
  <div class="btn-row">
    <button id="btn1">Click me</button>
    <button id="btn2">Hover me</button>
  </div>
  <div id="log" class="log"></div>
</div>`,
      css: `.app{height:100%;background:#09111c;padding:16px;border-radius:12px;display:flex;flex-direction:column;gap:10px;font-family:monospace;}
input{background:#111827;border:1px solid #334155;border-radius:8px;padding:10px;color:#e2e8f0;font-size:13px;font-family:monospace;outline:none;}
input:focus{border-color:#38bdf8;}
.btn-row{display:flex;gap:8px;}
button{flex:1;background:#1e2a3f;border:1px solid #334155;color:#94a3b8;padding:10px;border-radius:8px;cursor:pointer;font-family:monospace;font-size:12px;}
.log{flex:1;background:#050e1a;border:1px solid #1e293b;border-radius:8px;padding:10px;overflow-y:auto;display:flex;flex-direction:column;gap:4px;}
.entry{font-size:12px;color:#93c5fd;line-height:1.5;}
.entry.click{color:#4ade80;}.entry.input{color:#a78bfa;}.entry.key{color:#fb923c;}`,
      startCode: `const logEl = document.getElementById('log');
function addEntry(type, msg) {
  const div = document.createElement('div');
  div.className = 'entry ' + type;
  div.textContent = '[' + type + '] ' + msg;
  logEl.prepend(div);           // newest at top
  if (logEl.children.length > 12) logEl.lastChild.remove();
}

// click
document.getElementById('btn1').addEventListener('click', (e) => {
  addEntry('click', 'button clicked');
});

// mouseover
document.getElementById('btn2').addEventListener('mouseover', (e) => {
  addEntry('click', 'mouse entered button');
});

// input — fires on every keystroke
document.getElementById('textInput').addEventListener('input', (e) => {
  addEntry('input', 'value = "' + e.target.value + '"  length=' + e.target.value.length);
});

// change — fires when field is committed (tab or click away)
document.getElementById('textInput').addEventListener('change', (e) => {
  addEntry('input', 'CHANGE committed: "' + e.target.value + '"');
});

// keydown — fires for every key, including non-printing keys
document.getElementById('textInput').addEventListener('keydown', (e) => {
  if (e.key === 'Enter') addEntry('key', 'Enter pressed');
});`,
      outputHeight: 310,
    },

    // ─── Part 4: Reading Form Data ────────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `## Part 4 — Reading Form Inputs

Every input element has a \`.value\` property that holds the current string the user typed. Reading it is how you get data out of the UI.

\`\`\`js
const nameInput  = document.querySelector('#name');
const emailInput = document.querySelector('#email');

nameInput.value     // whatever the user typed
emailInput.value    // same
\`\`\`

**Input types and their values:**
| Type | \`.value\` returns |
|---|---|
| \`text\`, \`email\`, \`password\` | The typed string |
| \`number\` | Still a string — convert with \`Number()\` or \`+\` prefix |
| \`checkbox\` | Use \`.checked\` (boolean) instead of \`.value\` |
| \`select\` | The selected \`<option>\`'s value |
| \`range\` | String number — e.g., \`"42"\` |

**Number inputs return strings** — this is a common gotcha. Always convert:
\`\`\`js
const age = Number(document.querySelector('#age').value);
// or
const age = +document.querySelector('#age').value;
\`\`\`

**Validation**: check before using. An empty field returns \`""\`. A required number field left blank returns \`""\` not \`0\`.
\`\`\`js
if (!nameInput.value.trim()) {
  alert("Name is required");
  return;
}
\`\`\``,
    },

    // ─── Part 4 Cell: reading form inputs ────────────────────────────────────
    {
      type: 'js',
      instruction: `### Reading Multiple Inputs

Fill in the form and click "Build Object". Watch how the values are pulled from the DOM and assembled into a JavaScript object — this is the pattern behind every sign-up form or data entry screen.`,
      html: `<div class="app">
  <div class="form">
    <input id="nameInput"  type="text"   placeholder="Name" />
    <input id="ageInput"   type="number" placeholder="Age" min="0" max="120" />
    <input id="emailInput" type="email"  placeholder="Email" />
    <label class="check-label">
      <input id="activeCheck" type="checkbox" /> Active user
    </label>
    <button id="buildBtn">Build Object →</button>
  </div>
  <div id="output" class="output">Fill in the form and click Build Object.</div>
</div>`,
      css: `.app{height:100%;background:#09111c;padding:16px;border-radius:12px;display:grid;grid-template-columns:1fr 1fr;gap:14px;font-family:monospace;}
.form{display:flex;flex-direction:column;gap:8px;}
input[type="text"],input[type="number"],input[type="email"]{background:#111827;border:1px solid #334155;border-radius:8px;padding:10px;color:#e2e8f0;font-size:12px;font-family:monospace;outline:none;}
input:focus{border-color:#38bdf8;}
.check-label{display:flex;align-items:center;gap:8px;color:#94a3b8;font-size:12px;}
button{background:#1e3a5f;border:1px solid #38bdf8;color:#93c5fd;padding:10px;border-radius:8px;cursor:pointer;font-family:monospace;font-size:12px;}
.output{background:#050e1a;border:1px solid #1e293b;border-radius:8px;padding:12px;color:#4ade80;font-size:12px;white-space:pre;overflow:auto;}`,
      startCode: `document.getElementById('buildBtn').addEventListener('click', () => {
  const name   = document.getElementById('nameInput').value.trim();
  const age    = Number(document.getElementById('ageInput').value);
  const email  = document.getElementById('emailInput').value.trim();
  const active = document.getElementById('activeCheck').checked;

  // Basic validation
  if (!name) {
    document.getElementById('output').textContent = 'Error: name is required';
    return;
  }

  // Build an object from the form data
  const user = { name, age, email, active };

  document.getElementById('output').textContent = JSON.stringify(user, null, 2);
  console.log('User object:', user);
  console.log('typeof age:', typeof user.age);   // number, not string
});`,
      outputHeight: 310,
    },

    // ─── Part 5: Form Submit ──────────────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `## Part 5 — Handling Form Submission

Wrapping inputs in a \`<form>\` gives you the \`submit\` event, which fires when the user presses Enter in any field or clicks a submit button. Always cancel the default behavior with \`event.preventDefault()\` in JavaScript-driven apps.

\`\`\`js
const form = document.querySelector('form');

form.addEventListener('submit', (event) => {
  event.preventDefault();        // stop the page reload

  const data = new FormData(form);
  const name  = data.get('name');   // matches <input name="name">
  const email = data.get('email');

  // or just read the inputs directly:
  const user = {
    name:  form.querySelector('#name').value.trim(),
    email: form.querySelector('#email').value.trim(),
  };

  processUser(user);
});
\`\`\`

**\`FormData\`** is a built-in that reads all named inputs from a form at once. It is especially useful when you have many fields — instead of querying each one individually, \`data.get('fieldName')\` pulls any value by the input's \`name\` attribute.

**Submitting to a server** is what the next chapter (Async & Fetch) is about. For now you are reading form data into objects — the foundation of everything that follows.`,
    },

    // ─── Part 5 Cell: full form → object → list ──────────────────────────────
    {
      type: 'js',
      instruction: `### Complete Form: Submit → Object → List

This ties everything together: a form that collects user data, validates it, builds a JavaScript object, and renders it to a dynamic list. This is the full client-side data flow you will use in real applications.

Fill in the form and press Enter or click Add.`,
      html: `<div class="app">
  <form id="userForm" class="form">
    <input name="name"  id="name"  type="text"  placeholder="Full name *" required />
    <input name="email" id="email" type="email" placeholder="Email *" required />
    <select name="role" id="role">
      <option value="viewer">Viewer</option>
      <option value="editor">Editor</option>
      <option value="admin">Admin</option>
    </select>
    <button type="submit">Add User</button>
  </form>
  <div id="userList" class="user-list"></div>
</div>`,
      css: `.app{height:100%;background:#09111c;padding:16px;border-radius:12px;display:grid;grid-template-columns:1fr 1fr;gap:14px;font-family:monospace;}
.form{display:flex;flex-direction:column;gap:8px;}
input,select{background:#111827;border:1px solid #334155;border-radius:8px;padding:10px;color:#e2e8f0;font-size:12px;font-family:monospace;outline:none;}
input:focus,select:focus{border-color:#38bdf8;}
button{background:#1e3a5f;border:1px solid #38bdf8;color:#93c5fd;padding:10px;border-radius:8px;cursor:pointer;font-family:monospace;font-size:12px;}
.user-list{display:flex;flex-direction:column;gap:6px;overflow-y:auto;}
.user-card{background:#111827;border:1px solid #1e293b;border-radius:8px;padding:10px;}
.user-card .n{color:#38bdf8;font-weight:700;font-size:13px;}
.user-card .e{color:#64748b;font-size:11px;}
.user-card .r{font-size:10px;padding:2px 6px;border-radius:4px;background:#0f2233;color:#4ade80;display:inline-block;margin-top:4px;}
.err{color:#f87171;font-size:12px;}`,
      startCode: `const users = [];   // in-memory list of user objects

document.getElementById('userForm').addEventListener('submit', (event) => {
  event.preventDefault();   // stop page reload

  const form = event.target;

  // Read form data into an object
  const user = {
    id:    Date.now(),                             // simple unique ID
    name:  form.querySelector('#name').value.trim(),
    email: form.querySelector('#email').value.trim(),
    role:  form.querySelector('#role').value,
    addedAt: new Date().toLocaleTimeString(),
  };

  // Validate
  if (!user.name || !user.email) {
    console.log('Validation failed — name and email required');
    return;
  }

  // Store
  users.push(user);
  console.log('Added user:', user);
  console.log('Total users:', users.length);

  // Render
  renderUsers();

  // Reset form
  form.reset();
});

function renderUsers() {
  const list = document.getElementById('userList');
  list.innerHTML = '';
  users.forEach(u => {
    const card = document.createElement('div');
    card.className = 'user-card';
    card.innerHTML =
      '<div class="n">' + u.name + '</div>' +
      '<div class="e">' + u.email + '</div>' +
      '<span class="r">' + u.role + '</span>';
    list.appendChild(card);
  });
}`,
      outputHeight: 340,
    },

    // ─── Challenges intro ─────────────────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `### Before the Challenges

The next two challenges test the core DOM skills from this lesson. For each one:

1. **Read the instruction** — understand what element you need to find and what you need to do to it.
2. **Write the code** — select the element, listen for or trigger an event, read or update a value.
3. **Press Run** — the banner tells you if it passed.

You will be writing code that directly selects and manipulates real DOM nodes in the preview.`,
    },

    // ─── Challenge 1 ─────────────────────────────────────────────────────────
    {
      type: 'challenge',
      instruction: `### Challenge 1: Update a Counter

The preview has a \`<div id="count">0</div>\` and a \`<button id="inc">+1</button>\`.

Write code so that clicking the button increments the number displayed in the div.`,
      html: `<div class="c-app">
  <div id="count" class="c-num">0</div>
  <button id="inc">+1</button>
</div>`,
      css: `.c-app{height:100%;background:#09111c;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:20px;font-family:monospace;}
.c-num{font-size:48px;font-weight:800;color:#38bdf8;}
button{background:#1e3a5f;border:1px solid #38bdf8;color:#93c5fd;padding:12px 28px;border-radius:8px;cursor:pointer;font-size:16px;font-family:monospace;}`,
      startCode: `// Select the count display and the button
// Add a click listener that reads the current number, increments it, and writes it back
`,
      solutionCode: `let n = 0;
document.getElementById('inc').addEventListener('click', () => {
  n++;
  document.getElementById('count').textContent = n;
});`,
      check: (code) =>
        /getElementById\s*\(\s*['"]inc['"]\s*\)/.test(code) &&
        /addEventListener\s*\(\s*['"]click['"]/.test(code) &&
        /getElementById\s*\(\s*['"]count['"]\s*\)/.test(code),
      successMessage: 'Correct! You selected an element, listened for a click, and updated the DOM.',
      failMessage: 'Use getElementById (or querySelector) to find #inc and #count. Add a click listener that updates #count\'s textContent.',
      outputHeight: 220,
    },

    // ─── Challenge 2 ─────────────────────────────────────────────────────────
    {
      type: 'challenge',
      instruction: `### Challenge 2: Form to Object

The preview has a form with two inputs: \`#username\` and \`#score\` (a number input).

On form submit, read both values and log an object \`{ username, score }\` to the console. Make sure \`score\` is a **number**, not a string.`,
      html: `<div class="c-app">
  <form id="dataForm" class="c-form">
    <input id="username" type="text"   placeholder="Username" />
    <input id="score"    type="number" placeholder="Score" />
    <button type="submit">Submit</button>
  </form>
  <div id="preview" class="c-preview">—</div>
</div>`,
      css: `.c-app{height:100%;background:#09111c;padding:20px;display:flex;flex-direction:column;gap:14px;font-family:monospace;}
.c-form{display:flex;flex-direction:column;gap:8px;}
input{background:#111827;border:1px solid #334155;border-radius:8px;padding:10px;color:#e2e8f0;font-size:13px;font-family:monospace;outline:none;}
button{background:#1e3a5f;border:1px solid #38bdf8;color:#93c5fd;padding:10px;border-radius:8px;cursor:pointer;font-size:13px;font-family:monospace;}
.c-preview{background:#050e1a;border:1px solid #1e293b;border-radius:8px;padding:12px;color:#4ade80;font-size:12px;white-space:pre;}`,
      startCode: `// Listen for the form submit event
// Call event.preventDefault() to stop page reload
// Read #username and #score values
// Make sure score is a number (not a string)
// Log the object and display it in #preview
`,
      solutionCode: `document.getElementById('dataForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const username = document.getElementById('username').value.trim();
  const score    = Number(document.getElementById('score').value);
  const data = { username, score };
  console.log(data);
  document.getElementById('preview').textContent = JSON.stringify(data, null, 2);
});`,
      check: (code, logs) => {
        const hasPreventDefault = /preventDefault/.test(code);
        const hasNumber = /Number\s*\(/.test(code) || /\+\s*document/.test(code) || /parseInt|parseFloat/.test(code);
        const hasSubmit = /addEventListener\s*\(\s*['"]submit['"]/.test(code);
        return hasPreventDefault && hasNumber && hasSubmit;
      },
      successMessage: 'Correct! preventDefault stops the reload, and Number() converts the string value to a real number.',
      failMessage: 'Make sure to: (1) call event.preventDefault(), (2) convert the score with Number(), (3) listen for "submit" not "click".',
      outputHeight: 260,
    },

  ],
};

export default {
  id: 'js-core-2-35-dom-forms',
  slug: 'the-dom-and-forms',
  chapter: 'js2.1',
  order: 3,
  title: 'The DOM and Forms',
  subtitle: 'querySelector, events, reading inputs, and building objects from user data.',
  tags: ['javascript', 'dom', 'forms', 'events', 'queryselector', 'addeventlistener'],

  hook: {
    question: 'How does JavaScript reach into an HTML page and change what the user sees?',
    realWorldContext: 'Every interactive website — login forms, search bars, shopping carts, live dashboards — works by JavaScript reading the DOM for input and writing back to it to update the display. This is the loop that powers the entire web.',
    previewVisualizationId: 'JSNotebook',
  },

  intuition: {
    prose: [
      'The DOM is the browser\'s parsed representation of your HTML — a tree of objects JavaScript can read and modify.',
      '`addEventListener` connects user actions (clicks, keystrokes, form submits) to JavaScript functions.',
      'Input `.value` is always a string — convert to a number explicitly if you need arithmetic.',
    ],
    callouts: [
      {
        type: 'warning',
        title: 'Always preventDefault on Forms',
        body: 'Without `event.preventDefault()`, submitting a form reloads the page, losing all your JavaScript state. This is the default browser behavior from 1993 — modern apps always cancel it.',
      },
      {
        type: 'tip',
        title: 'input vs change',
        body: '`input` fires on every keystroke (live feedback). `change` fires when the field is committed. Use `input` for real-time validation, `change` or `submit` for final processing.',
      },
    ],
    visualizations: [
      {
        id: 'JSNotebook',
        title: 'DOM — querySelector, Events, Forms, User Objects',
        props: { lesson: LESSON_JS_CORE_2_35 },
      },
    ],
  },

  math: { prose: [], callouts: [], visualizations: [] },
  rigor: { prose: [], callouts: [], visualizations: [] },
  examples: [],
  challenges: [],

  mentalModel: [
    'The DOM = your HTML parsed into a tree of JavaScript objects. querySelector finds nodes in that tree.',
    'addEventListener(event, callback) — the callback runs when that event fires on that element.',
    'form submit fires when Enter is pressed in any field or a submit button is clicked — always preventDefault.',
    'All input .value properties return strings. Number() or + converts to a number.',
    'Create elements with createElement, add them to the page with appendChild.',
  ],

  checkpoints: ['read-intuition'],
  quiz: [],
};
