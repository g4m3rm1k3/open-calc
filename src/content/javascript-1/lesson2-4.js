// Chapter js2.1 — Lesson 2-4: Objects

const LESSON_JS_CORE_2_4 = {
  title: 'Objects — Key-Value Maps',
  subtitle: 'Properties, methods, destructuring, spread, and the reference model.',
  sequential: true,

  cells: [

    // ─── Part 1: What an Object Is ───────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `## Part 1 — What an Object Is

An **object** is a collection of named values — each value has a **key** (a string) that you use to look it up.

\`\`\`js
const user = {
  name: "Alice",
  age: 28,
  active: true,
};

user.name       // "Alice"    — dot notation
user["age"]     // 28         — bracket notation (key is a string)
user.missing    // undefined  — no crash, just undefined
\`\`\`

Objects in JavaScript are the closest thing to a hash map or dictionary in other languages — Go's \`map[string]any\`, Rust's \`HashMap\`, C++'s \`std::unordered_map\`. The difference is that JavaScript objects are built into the language syntax and serve double duty as both data containers and the building blocks of object-oriented programming.

**Adding and removing properties at runtime:**
\`\`\`js
user.email = "alice@example.com";   // add a new key
delete user.active;                 // remove a key
\`\`\`

**Checking for existence:**
\`\`\`js
"name" in user       // true
"missing" in user    // false
user.hasOwnProperty("name")  // true
\`\`\``,
    },

    // ─── Part 1 Cell: basic object operations ────────────────────────────────
    {
      type: 'js',
      instruction: `### Creating and Reading Objects

Run this. Try adding a new property after the fact and deleting one — the object adapts at runtime.`,
      html: `<div class="panel">
  <div id="log" class="log-box"></div>
</div>`,
      css: `.panel{height:100%;background:#09111c;padding:16px;border-radius:12px;display:flex;flex-direction:column;font-family:monospace;}
.log-box{flex:1;background:#050e1a;border:1px solid #1e293b;border-radius:8px;padding:10px;color:#93c5fd;font-size:13px;line-height:1.9;overflow-y:auto;}`,
      startCode: `const user = { name: "Alice", age: 28, active: true };

log("name: " + user.name);
log("age via bracket: " + user["age"]);
log("missing key: " + user.missing);       // undefined — no crash
log('"name" in user: ' + ("name" in user));

// Runtime mutation
user.email = "alice@example.com";
log("after adding email: " + user.email);

delete user.active;
log('"active" in user after delete: ' + ("active" in user));

// Keys and values
log("all keys: " + Object.keys(user).join(", "));
log("all values: " + Object.values(user).join(", "));

function log(msg) {
  const el = document.getElementById('log');
  const line = document.createElement('div');
  line.textContent = msg;
  el.appendChild(line);
}`,
      outputHeight: 290,
    },

    // ─── Part 2: Methods ─────────────────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `## Part 2 — Methods and \`this\`

A function stored as an object property is called a **method**. Inside a method, \`this\` refers to the object the method was called on.

\`\`\`js
const counter = {
  count: 0,
  increment() {
    this.count++;        // this = counter
    return this.count;
  },
};

counter.increment();  // 1
counter.increment();  // 2
\`\`\`

The shorthand \`increment() { }\` inside an object literal is equivalent to \`increment: function() { }\`.

**The \`this\` trap — why arrow functions break methods:**

Arrow functions do not have their own \`this\`. If you write a method as an arrow function, \`this\` will be whatever \`this\` was in the surrounding scope when the object was created — usually \`undefined\` (in strict mode) or the global object.

\`\`\`js
const broken = {
  count: 0,
  increment: () => {
    this.count++;   // this is NOT broken — it's the outer scope's this
  },
};
broken.increment();  // count stays 0
\`\`\`

**Rule**: use regular \`function\` or method shorthand for object methods. Use arrow functions for callbacks *inside* those methods, where you want \`this\` to stay fixed.`,
    },

    // ─── Part 2 Cell: methods and this ───────────────────────────────────────
    {
      type: 'js',
      instruction: `### Methods: function vs arrow

Click the buttons to see \`this\` behave correctly with a regular method and incorrectly with an arrow method. The count display shows the difference.`,
      html: `<div class="panel">
  <div class="group">
    <div class="label">Regular method (correct)</div>
    <div id="good-count" class="count-box">0</div>
    <button id="good-btn">increment()</button>
  </div>
  <div class="group">
    <div class="label">Arrow method (broken this)</div>
    <div id="bad-count" class="count-box bad">0</div>
    <button id="bad-btn">arrowIncrement()</button>
  </div>
</div>`,
      css: `.panel{height:100%;background:#09111c;padding:18px;border-radius:12px;display:flex;gap:30px;justify-content:center;align-items:center;font-family:monospace;}
.group{display:flex;flex-direction:column;align-items:center;gap:10px;}
.label{color:#475569;font-size:10px;letter-spacing:.08em;text-transform:uppercase;text-align:center;}
.count-box{width:80px;height:70px;border:2px solid #4ade80;border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:28px;font-weight:800;color:#4ade80;background:#071c10;}
.count-box.bad{border-color:#f87171;color:#f87171;background:#1c0707;}
button{background:#1e2a3f;border:1px solid #334155;color:#94a3b8;padding:8px 14px;border-radius:8px;cursor:pointer;font-family:monospace;font-size:12px;}`,
      startCode: `const goodCounter = {
  count: 0,
  increment() {          // regular method — this = goodCounter
    this.count++;
    document.getElementById('good-count').textContent = this.count;
    console.log("good this.count:", this.count);
  },
};

const badCounter = {
  count: 0,
  increment: () => {     // arrow — this is NOT badCounter
    this.count++;        // modifies window.count (or crashes in strict mode)
    // badCounter.count remains 0
    document.getElementById('bad-count').textContent =
      badCounter.count + " (stuck)";
    console.log("bad this:", this);    // window or undefined
  },
};

document.getElementById('good-btn').onclick = () => goodCounter.increment();
document.getElementById('bad-btn').onclick  = () => badCounter.increment();`,
      outputHeight: 230,
    },

    // ─── Part 3: References and Equality ─────────────────────────────────────
    {
      type: 'markdown',
      instruction: `## Part 3 — The Reference Model

Objects are **not stored by value** — they are stored by **reference**. A variable holding an object does not contain the object itself. It contains an address pointing to the object in memory.

This has two major consequences:

**1. Assignment copies the reference, not the object:**
\`\`\`js
const a = { x: 1 };
const b = a;          // b points to the SAME object as a
b.x = 99;
console.log(a.x);    // 99 — a sees the change because they share the object
\`\`\`

**2. Equality checks the address, not the content:**
\`\`\`js
const a = { x: 1 };
const b = { x: 1 };
a === b              // false — different objects in memory
a === a              // true  — same address
\`\`\`

This is the same model as pointers in C — when you assign a pointer, you copy the address, not the data. In C you can see this clearly because you write \`*\` and \`&\` explicitly. In JavaScript the pointer nature is implicit.

**Shallow copy with spread:**
\`\`\`js
const original = { x: 1, y: 2 };
const copy = { ...original };   // new object, same top-level values
copy.x = 99;
original.x    // still 1 — the copy is independent at the top level
\`\`\`

**Shallow means nested objects are still shared:**
\`\`\`js
const a = { inner: { val: 1 } };
const b = { ...a };
b.inner.val = 99;
a.inner.val   // 99 — inner is still the same object
\`\`\``,
    },

    // ─── Part 3 Cell: reference model ────────────────────────────────────────
    {
      type: 'js',
      instruction: `### References: Shared vs Copied

Run this and watch how \`b\` and \`a\` share the same underlying object, but \`copy\` is independent at the top level. Then see the shallow-copy trap with a nested object.`,
      html: `<div class="panel">
  <div class="row" id="r1">shared reference: ?</div>
  <div class="row" id="r2">equality by address: ?</div>
  <div class="row good" id="r3">spread copy (top-level independent): ?</div>
  <div class="row bad" id="r4">spread copy (nested still shared): ?</div>
</div>`,
      css: `.panel{height:100%;background:#09111c;padding:16px;border-radius:12px;display:flex;flex-direction:column;gap:8px;font-family:monospace;}
.row{background:#111827;border:1px solid #1e293b;border-radius:8px;padding:10px;color:#e2e8f0;font-size:13px;}
.good{border-color:#4ade80;color:#86efac;}
.bad{border-color:#f87171;color:#fca5a5;}`,
      startCode: `// Shared reference
const a = { x: 1 };
const b = a;
b.x = 99;

// Equality by address
const c = { x: 1 };
const d = { x: 1 };

// Shallow spread copy
const original = { x: 10, y: 20 };
const copy = { ...original };
copy.x = 999;

// Shallow copy trap — nested object is still shared
const deep = { inner: { val: 1 } };
const shallowCopy = { ...deep };
shallowCopy.inner.val = 777;

document.getElementById('r1').textContent =
  "b.x = 99 → a.x = " + a.x + "  (shared object)";
document.getElementById('r2').textContent =
  "c === d: " + (c === d) + "  |  c === c: " + (c === c);
document.getElementById('r3').textContent =
  "copy.x = 999 → original.x = " + original.x + "  (independent top-level)";
document.getElementById('r4').textContent =
  "shallowCopy.inner.val = 777 → deep.inner.val = " + deep.inner.val + "  (still shared!)";`,
      outputHeight: 240,
    },

    // ─── Part 4: Destructuring and Spread ────────────────────────────────────
    {
      type: 'markdown',
      instruction: `## Part 4 — Destructuring and Computed Keys

**Destructuring** pulls specific keys out of an object into named variables:

\`\`\`js
const { name, age } = user;
// same as:
const name = user.name;
const age  = user.age;
\`\`\`

**Rename during destructuring:**
\`\`\`js
const { name: userName, age: userAge } = user;
// userName = user.name, userAge = user.age
\`\`\`

**Defaults:**
\`\`\`js
const { role = "viewer" } = user;   // "viewer" if role is undefined
\`\`\`

**Rest in destructuring:**
\`\`\`js
const { name, ...rest } = user;   // rest = everything except name
\`\`\`

**Destructuring in function parameters** — extremely common in real code:
\`\`\`js
function greetUser({ name, role = "user" }) {
  return \`Hello \${name}, you are a \${role}.\`;
}
greetUser({ name: "Alice", role: "admin" });
\`\`\`

**Computed property names:**
\`\`\`js
const key = "score";
const obj = { [key]: 100 };   // { score: 100 }
\`\`\``,
    },

    // ─── Part 4 Cell: destructuring ──────────────────────────────────────────
    {
      type: 'js',
      instruction: `### Destructuring in Practice

The function-parameter destructuring at the bottom is the pattern you will see in almost every React component and API handler. Learn to read it fluently.`,
      html: `<div class="panel">
  <div class="row" id="r1">basic destructuring: ?</div>
  <div class="row" id="r2">rename + default: ?</div>
  <div class="row" id="r3">rest: ?</div>
  <div class="row" id="r4">param destructuring: ?</div>
</div>`,
      css: `.panel{height:100%;background:#09111c;padding:14px;border-radius:12px;display:flex;flex-direction:column;gap:8px;font-family:monospace;}
.row{background:#111827;border:1px solid #1e293b;border-radius:8px;padding:10px;color:#e2e8f0;font-size:13px;}`,
      startCode: `const user = { name: "Alice", age: 28, country: "Canada" };

// Basic destructuring
const { name, age } = user;

// Rename and default
const { name: userName, role = "viewer" } = user;

// Rest collects remaining keys
const { name: n, ...rest } = user;

// Function parameter destructuring
function renderCard({ name, age, country = "Unknown" }) {
  return name + " | age " + age + " | " + country;
}

document.getElementById('r1').textContent =
  "name=" + name + "  age=" + age;
document.getElementById('r2').textContent =
  "userName=" + userName + "  role=" + role + " (default)";
document.getElementById('r3').textContent =
  "rest=" + JSON.stringify(rest);
document.getElementById('r4').textContent =
  "renderCard(user): " + renderCard(user);`,
      outputHeight: 230,
    },

    // ─── Part 5: Object.keys / entries / assign ───────────────────────────────
    {
      type: 'markdown',
      instruction: `## Part 5 — Object Utility Methods

**\`Object.keys(obj)\`** — array of all own keys:
\`\`\`js
Object.keys({ a: 1, b: 2 })  // ["a", "b"]
\`\`\`

**\`Object.values(obj)\`** — array of all values:
\`\`\`js
Object.values({ a: 1, b: 2 })  // [1, 2]
\`\`\`

**\`Object.entries(obj)\`** — array of \`[key, value]\` pairs — very useful with \`for...of\` or destructuring:
\`\`\`js
for (const [key, val] of Object.entries(config)) {
  console.log(key, "→", val);
}
\`\`\`

**\`Object.assign(target, ...sources)\`** — merge objects into target, mutating it:
\`\`\`js
const defaults = { theme: "dark", lang: "en" };
const userPrefs = { lang: "fr" };
const config = Object.assign({}, defaults, userPrefs);
// { theme: "dark", lang: "fr" }
\`\`\`

The spread alternative (preferred in modern code):
\`\`\`js
const config = { ...defaults, ...userPrefs };
\`\`\`

Later keys win — \`userPrefs.lang\` overwrites \`defaults.lang\`.

**\`Object.freeze(obj)\`** — prevents all mutations. Useful for constants:
\`\`\`js
const STATUS = Object.freeze({ PENDING: 0, DONE: 1, ERROR: 2 });
STATUS.PENDING = 99;  // silently fails in normal mode, throws in strict mode
\`\`\``,
    },

    // ─── Part 5 Cell: Object utilities ───────────────────────────────────────
    {
      type: 'js',
      instruction: `### Object.keys, entries, and Merging

The \`entries\` + for...of combination is how you iterate objects cleanly — you get both key and value without extra lookups.`,
      html: `<div class="panel">
  <div class="label">Object.entries loop</div>
  <div id="entries" class="section"></div>
  <div class="label">Merge with spread (later keys win)</div>
  <div id="merged" class="section"></div>
  <div class="label">Object.freeze</div>
  <div id="freeze" class="section"></div>
</div>`,
      css: `.panel{height:100%;background:#09111c;padding:14px;border-radius:12px;display:flex;flex-direction:column;gap:6px;font-family:monospace;overflow-y:auto;}
.label{color:#475569;font-size:10px;letter-spacing:.08em;text-transform:uppercase;}
.section{background:#050e1a;border:1px solid #1e293b;border-radius:8px;padding:8px;color:#93c5fd;font-size:12px;line-height:1.8;}`,
      startCode: `const config = { theme: "dark", lang: "en", fontSize: 14 };

// Object.entries — [key, value] pairs, destructured in the loop header
let entriesLog = "";
for (const [key, val] of Object.entries(config)) {
  entriesLog += key + " → " + val + "\n";
}

// Merging — spread, later source wins
const defaults    = { theme: "dark", lang: "en", debug: false };
const userPrefs   = { lang: "fr", debug: true };
const merged      = { ...defaults, ...userPrefs };

// Freeze — mutations silently fail
const STATUS = Object.freeze({ PENDING: 0, DONE: 1, ERROR: 2 });
STATUS.PENDING = 99;   // no effect

document.getElementById('entries').textContent = entriesLog.trim();
document.getElementById('merged').textContent  = JSON.stringify(merged, null, 2);
document.getElementById('freeze').textContent  =
  "STATUS.PENDING after attempted mutation: " + STATUS.PENDING;`,
      outputHeight: 300,
    },

    // ─── Wrap-up ──────────────────────────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `## You Can Now Do the Following

**Create and mutate objects** — read with dot or bracket notation, add properties at runtime, delete them.

**Write object methods correctly** — use regular \`function\` or method shorthand for methods where \`this\` matters; use arrow functions only for callbacks inside those methods.

**Reason about references** — assigning an object copies the address, not the data. Spread creates a shallow copy. Two objects with identical content are \`!==\` unless they are literally the same object.

**Destructure cleanly** — pull keys into named variables, rename them, set defaults, collect the rest. Use destructuring in function parameters to make call sites readable.

**Merge objects** with spread — later keys overwrite earlier ones.

---

### Before the Challenges

The final challenge pulls everything together — you will build a user object from a form, the same pattern you will use in every real app.`,
    },

    // ─── Challenge 1: destructuring ──────────────────────────────────────────
    {
      type: 'challenge',
      instruction: `### Challenge 1: Destructure a Config Object

Given the config object below, use **one destructuring statement** to extract:
- \`theme\` into a variable called \`theme\`
- \`lang\` into a variable called \`language\` (rename it)
- \`timeout\` with a default of \`30\` (it is missing from the object)

Then log all three. Expected:
\`\`\`
dark
fr
30
\`\`\``,
      startCode: `const config = { theme: "dark", lang: "fr" };

// Write one destructuring statement here
// const { ... } = config;

console.log(theme);
console.log(language);
console.log(timeout);`,
      solutionCode: `const config = { theme: "dark", lang: "fr" };
const { theme, lang: language, timeout = 30 } = config;
console.log(theme);
console.log(language);
console.log(timeout);`,
      check: (code, logs) =>
        /const\s*\{[^}]+\}\s*=\s*config/.test(code) &&
        /lang\s*:\s*language/.test(code) &&
        logs[0] === 'dark' && logs[1] === 'fr' && logs[2] === '30',
      successMessage: 'Correct! Renaming and defaults in one destructuring statement — this is very common in real code.',
      failMessage: 'Syntax: `const { theme, lang: language, timeout = 30 } = config;` — rename with `:`, default with `=`.',
    },

    // ─── Challenge 2: merge objects ──────────────────────────────────────────
    {
      type: 'challenge',
      instruction: `### Challenge 2: Merge with Override

You have a \`defaults\` object and a \`userPrefs\` object. Use spread to create a \`settings\` object where \`userPrefs\` values override the defaults. Then log \`settings.theme\` and \`settings.lang\`.

Expected:
\`\`\`
light
fr
\`\`\``,
      startCode: `const defaults = { theme: "dark", lang: "en", fontSize: 14 };
const userPrefs = { theme: "light", lang: "fr" };

const settings = null; // replace with spread merge

console.log(settings.theme);
console.log(settings.lang);`,
      solutionCode: `const defaults = { theme: "dark", lang: "en", fontSize: 14 };
const userPrefs = { theme: "light", lang: "fr" };
const settings = { ...defaults, ...userPrefs };
console.log(settings.theme);
console.log(settings.lang);`,
      check: (code, logs) =>
        /\.\.\.\s*defaults/.test(code) && /\.\.\.\s*userPrefs/.test(code) &&
        logs[0] === 'light' && logs[1] === 'fr',
      successMessage: 'Correct! Spread merge: the last source wins for any key that appears in multiple objects.',
      failMessage: 'Use `{ ...defaults, ...userPrefs }` — userPrefs must come second so its keys overwrite defaults.',
    },

    // ─── Challenge 3: form → object (uses DOM) ──────────────────────────────
    {
      type: 'challenge',
      instruction: `### Challenge 3: Build a User Object from the Form

The preview has a form with fields: \`#username\`, \`#age\` (number), and \`#role\` (select).

On submit:
1. \`preventDefault()\`
2. Read all three values — make \`age\` a \`Number\`
3. Build a user object \`{ username, age, role, createdAt: new Date().toISOString() }\`
4. Log it
5. Display it in \`#output\` using \`JSON.stringify(user, null, 2)\``,
      html: `<div class="c-app">
  <form id="userForm" class="c-form">
    <input id="username" type="text"   placeholder="Username" />
    <input id="age"      type="number" placeholder="Age" />
    <select id="role">
      <option value="viewer">Viewer</option>
      <option value="editor">Editor</option>
      <option value="admin">Admin</option>
    </select>
    <button type="submit">Create User</button>
  </form>
  <pre id="output" class="c-output">—</pre>
</div>`,
      css: `.c-app{height:100%;background:#09111c;padding:16px;border-radius:12px;display:grid;grid-template-columns:1fr 1fr;gap:14px;font-family:monospace;}
.c-form{display:flex;flex-direction:column;gap:8px;}
input,select{background:#111827;border:1px solid #334155;border-radius:8px;padding:10px;color:#e2e8f0;font-size:12px;font-family:monospace;outline:none;}
button{background:#1e3a5f;border:1px solid #38bdf8;color:#93c5fd;padding:10px;border-radius:8px;cursor:pointer;font-size:12px;}
.c-output{background:#050e1a;border:1px solid #1e293b;border-radius:8px;padding:12px;color:#4ade80;font-size:12px;margin:0;white-space:pre-wrap;overflow:auto;}`,
      startCode: `document.getElementById('userForm').addEventListener('submit', (event) => {
  // 1. prevent page reload
  // 2. read username, age (as Number), role
  // 3. build a user object with those + createdAt: new Date().toISOString()
  // 4. console.log(user)
  // 5. display JSON.stringify(user, null, 2) in #output
});`,
      solutionCode: `document.getElementById('userForm').addEventListener('submit', (event) => {
  event.preventDefault();
  const username = document.getElementById('username').value.trim();
  const age      = Number(document.getElementById('age').value);
  const role     = document.getElementById('role').value;
  const user = { username, age, role, createdAt: new Date().toISOString() };
  console.log(user);
  document.getElementById('output').textContent = JSON.stringify(user, null, 2);
});`,
      check: (code) =>
        /preventDefault/.test(code) &&
        /Number\s*\(/.test(code) &&
        /createdAt/.test(code) &&
        /JSON\.stringify/.test(code),
      successMessage: 'Correct! This is the exact pattern every form in a real app uses — read inputs, build an object, send or display it.',
      failMessage: 'Make sure to: preventDefault, convert age with Number(), include createdAt, and JSON.stringify the result into #output.',
      outputHeight: 270,
    },

  ],
};

export default {
  id: 'js-core-2-4-objects',
  slug: 'objects-key-value-maps',
  chapter: 'js2.1',
  order: 4,
  title: 'Objects — Key-Value Maps',
  subtitle: 'Properties, methods, this, references, destructuring, and merging.',
  tags: ['javascript', 'objects', 'destructuring', 'spread', 'this', 'references'],

  hook: {
    question: 'When you assign an object to a new variable, what actually gets copied?',
    realWorldContext: 'Objects are the primary data structure in JavaScript — user records, API responses, component state, configuration. Understanding how they are stored and copied is essential for avoiding bugs that are notoriously hard to debug.',
    previewVisualizationId: 'JSNotebook',
  },

  intuition: {
    prose: [
      'Objects are reference types — a variable holds an address, not the data. Assignment copies the address.',
      'Two objects with identical content are not `===` unless they are the same object in memory.',
      'Spread creates a shallow copy — top-level properties are independent, nested objects are still shared.',
    ],
    callouts: [
      {
        type: 'warning',
        title: 'Arrow Functions as Methods',
        body: 'Arrow functions do not have their own `this`. Defining a method as an arrow function means `this` inside it will not be the object — it will be whatever `this` was in the surrounding scope.',
      },
      {
        type: 'warning',
        title: 'Shallow vs Deep Copy',
        body: 'Spread (`{ ...obj }`) only copies the top level. Nested objects remain shared. For a full independent copy, you need a deep clone (e.g., `structuredClone(obj)`, available in modern environments).',
      },
    ],
    visualizations: [
      {
        id: 'JSNotebook',
        title: 'Objects — Properties, Methods, References, Destructuring',
        props: { lesson: LESSON_JS_CORE_2_4 },
      },
    ],
  },

  math: { prose: [], callouts: [], visualizations: [] },
  rigor: { prose: [], callouts: [], visualizations: [] },
  examples: [],
  challenges: [],

  mentalModel: [
    'Objects store by reference — the variable holds an address, not the object itself.',
    '`===` on objects compares addresses. Two identical-looking objects are not equal unless they are the same object.',
    'Spread copy is shallow — top-level independent, nested objects still shared.',
    'Regular methods: `this` = the calling object. Arrow methods: `this` = outer scope (usually wrong).',
    '`Object.entries` gives [key, value] pairs — use with `for...of` destructuring to iterate objects cleanly.',
  ],

  checkpoints: ['read-intuition'],
  quiz: [],
};
