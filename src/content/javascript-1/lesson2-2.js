// Chapter js2.1 — Lesson 2-2: Closures and Lexical Scope
// Style: narrative tutorial, Python bridging, incremental builds

const LESSON_JS_CORE_2_2 = {
  title: 'Closures — Functions That Remember',
  subtitle: 'How inner functions capture outer variables, and why this is one of JavaScript\'s most useful patterns.',
  sequential: true,

  cells: [

    // ─── Part 1: The Setup ────────────────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `## Part 1 — What Is a Closure?

You already know that a function creates a scope — variables inside are private.

Now add one rule: **a function remembers the scope it was created in**, even after that scope is no longer active.

That remembered scope is called a **closure**.

Here is the minimal example:

\`\`\`js
function makeCounter() {
  let count = 0;           // private to makeCounter

  return function() {      // this inner function is returned to the caller
    count++;               // still has access to count — it was "closed over"
    return count;
  };
}

const counter = makeCounter();
counter();  // 1
counter();  // 2
counter();  // 3
\`\`\`

\`makeCounter\` has returned. Its local variables should be gone. But \`count\` is still alive — because the inner function holds a reference to it.

**Python analogy:**
\`\`\`python
def make_counter():
    count = 0
    def inner():
        nonlocal count
        count += 1
        return count
    return inner
\`\`\`

Python requires the \`nonlocal\` keyword to *write* to an outer variable. JavaScript does not — inner functions can read and write outer variables freely.`,
    },

    // ─── Part 1 Cell: counter closure ────────────────────────────────────────
    {
      type: 'js',
      instruction: `### The Counter: A Closure in Action

Each call to \`makeCounter()\` creates an independent counter — its own private \`count\`. Notice how \`counterA\` and \`counterB\` do not interfere with each other even though they were produced by the same function.

This is the key: closures create **private, persistent state** without global variables.`,
      html: `<div class="panel">
  <div class="group">
    <div class="label">Counter A</div>
    <div id="ca" class="count-box">0</div>
    <button id="btnA">Increment A</button>
  </div>
  <div class="group">
    <div class="label">Counter B</div>
    <div id="cb" class="count-box">0</div>
    <button id="btnB">Increment B</button>
  </div>
</div>`,
      css: `.panel{height:100%;background:#09111c;padding:18px;border-radius:12px;display:flex;gap:24px;justify-content:center;align-items:center;font-family:monospace;}
.group{display:flex;flex-direction:column;align-items:center;gap:10px;}
.label{color:#475569;font-size:11px;letter-spacing:.08em;text-transform:uppercase;}
.count-box{width:80px;height:80px;border:2px solid #38bdf8;border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:32px;font-weight:800;color:#38bdf8;background:#0f2233;}
button{background:#1e3a5f;border:1px solid #38bdf8;color:#93c5fd;padding:8px 16px;border-radius:8px;cursor:pointer;font-family:monospace;font-size:13px;transition:background .2s;}
button:hover{background:#1e4976;}`,
      startCode: `function makeCounter() {
  let count = 0;           // each call to makeCounter() gets its own count

  return function() {
    count++;
    return count;
  };
}

const counterA = makeCounter();   // independent closure — its own count
const counterB = makeCounter();   // independent closure — its own count

document.getElementById('btnA').onclick = () => {
  document.getElementById('ca').textContent = counterA();
};

document.getElementById('btnB').onclick = () => {
  document.getElementById('cb').textContent = counterB();
};

console.log('Two independent counters created. Click the buttons.');`,
      outputHeight: 220,
    },

    // ─── Part 2: Practical Use — Factory Functions ─────────────────────────────
    {
      type: 'markdown',
      instruction: `## Part 2 — Factory Functions

A **factory function** is a regular function that returns an object. Closures are what make the object's methods stateful.

\`\`\`js
function createUser(name) {
  let loginCount = 0;     // private — not on the returned object

  return {
    getName: () => name,
    login:   () => { loginCount++; return loginCount; },
    status:  () => \`\${name} has logged in \${loginCount} times\`,
  };
}

const alice = createUser("Alice");
alice.login();   // 1
alice.login();   // 2
alice.status();  // "Alice has logged in 2 times"
alice.loginCount; // undefined — private, not reachable from outside
\`\`\`

**Why this matters in real code**: every time you write a React hook, a module with internal state, or a cache function, you are using a closure. The pattern is ubiquitous.

**Python analogy**: factory functions mirror Python classes with \`__init__\` and private attributes. The key difference is there is no \`self\` — \`name\` and \`loginCount\` are simply captured variables, not object properties.`,
    },

    // ─── Part 2 Cell: factory function ───────────────────────────────────────
    {
      type: 'js',
      instruction: `### Factory Function: Private State via Closure

\`loginCount\` is genuinely private — it cannot be read or modified from outside the factory. The only way to interact with it is through the methods the factory exposes.

Press Login a few times and watch the state persist between calls without any global variable.`,
      html: `<div class="panel">
  <div id="name-display" class="name-row">User: —</div>
  <div id="count-display" class="stat-row">Logins: 0</div>
  <div id="status-display" class="status-row">—</div>
  <div class="btn-row">
    <button id="loginBtn">Login</button>
    <button id="peekBtn">Peek at loginCount</button>
  </div>
</div>`,
      css: `.panel{height:100%;background:#09111c;padding:18px;border-radius:12px;display:flex;flex-direction:column;gap:10px;font-family:monospace;}
.name-row{background:#0f172a;border:1px solid #334155;border-radius:8px;padding:10px;color:#94a3b8;font-size:13px;}
.stat-row{background:#0f2233;border:1px solid #38bdf8;border-radius:8px;padding:10px;color:#38bdf8;font-size:15px;font-weight:700;}
.status-row{background:#111827;border:1px solid #1e293b;border-radius:8px;padding:10px;color:#e2e8f0;font-size:12px;}
.btn-row{display:flex;gap:8px;}
button{flex:1;background:#1e3a5f;border:1px solid #38bdf8;color:#93c5fd;padding:9px;border-radius:8px;cursor:pointer;font-family:monospace;font-size:12px;}`,
      startCode: `function createUser(name) {
  let loginCount = 0;   // genuinely private — not on the object

  return {
    getName:  () => name,
    login:    () => { loginCount++; return loginCount; },
    status:   () => name + " has logged in " + loginCount + " time(s)",
  };
}

const alice = createUser("Alice");

document.getElementById('name-display').textContent = "User: " + alice.getName();
document.getElementById('status-display').textContent = alice.status();

document.getElementById('loginBtn').onclick = () => {
  const count = alice.login();
  document.getElementById('count-display').textContent = "Logins: " + count;
  document.getElementById('status-display').textContent = alice.status();
};

document.getElementById('peekBtn').onclick = () => {
  // loginCount is not a property of the returned object
  const val = alice.loginCount;
  document.getElementById('status-display').textContent =
    "alice.loginCount = " + val + "  (undefined — it is private)";
};`,
      outputHeight: 260,
    },

    // ─── Part 3: The Classic Loop Bug ─────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `## Part 3 — The Loop Bug That Catches Everyone

This is one of the most famous JavaScript interview questions. It looks simple and has a non-obvious answer.

\`\`\`js
for (var i = 0; i < 3; i++) {
  setTimeout(function() { console.log(i); }, 100);
}
// Expected: 0, 1, 2
// Actual:   3, 3, 3
\`\`\`

Why? Because \`var\` is **function-scoped**, not block-scoped. All three closures share the *same* \`i\`. By the time the timeouts fire, the loop has finished and \`i\` is 3.

**The fix — use \`let\`:**

\`\`\`js
for (let i = 0; i < 3; i++) {
  setTimeout(function() { console.log(i); }, 100);
}
// Actual: 0, 1, 2
\`\`\`

\`let\` is **block-scoped**. Each loop iteration creates a brand-new \`i\` binding. Each closure captures its own copy.

**Python does not have this bug** because Python for-loops do not close over the loop variable the same way — Python closures capture by *reference to the name*, and the behavior differs enough that this particular trap does not arise in the same form.

This bug is the reason the JavaScript community moved from \`var\` to \`let\` and \`const\`. You should use \`let\`/\`const\` exclusively.`,
    },

    // ─── Part 3 Cell: loop bug ────────────────────────────────────────────────
    {
      type: 'js',
      instruction: `### var vs let in Closures

Run the cell and see both behaviors side by side. The \`var\` row will always log 3. The \`let\` row captures each iteration's value correctly.`,
      html: `<div class="panel">
  <div class="label">var loop (shared i)</div>
  <div id="var-row" class="row bad">waiting 300ms…</div>
  <div class="label">let loop (own i per iteration)</div>
  <div id="let-row" class="row good">waiting 300ms…</div>
</div>`,
      css: `.panel{height:100%;background:#09111c;padding:18px;border-radius:12px;display:flex;flex-direction:column;gap:8px;font-family:monospace;}
.label{color:#475569;font-size:10px;letter-spacing:.08em;text-transform:uppercase;}
.row{background:#111827;border:1px solid #1e293b;border-radius:8px;padding:10px;font-size:13px;}
.bad{border-color:#f87171;color:#fca5a5;}
.good{border-color:#4ade80;color:#86efac;}`,
      startCode: `const varResults = [];
const letResults = [];

// var — function-scoped, one shared binding
for (var i = 0; i < 3; i++) {
  setTimeout((function(captured_i) {
    // Without this IIFE wrapper, all callbacks see i = 3
    return function() { varResults.push(captured_i); };
  })(i), 150);   // immediately-invoked to capture current i the old way
}

// let — block-scoped, fresh binding each iteration
for (let j = 0; j < 3; j++) {
  setTimeout(function() { letResults.push(j); }, 150);
}

setTimeout(() => {
  document.getElementById('var-row').textContent =
    "var (IIFE workaround needed): [" + varResults + "]";
  document.getElementById('let-row').textContent =
    "let (just works): [" + letResults + "]";
  console.log('var results:', varResults);
  console.log('let results:', letResults);
}, 300);`,
      outputHeight: 210,
    },

    // ─── Part 4: Memoization ──────────────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `## Part 4 — Practical Pattern: Memoization

A closure can wrap any function and add **caching** — store results you have computed before, return them instantly the second time.

\`\`\`js
function memoize(fn) {
  const cache = {};         // private to this closure

  return function(...args) {
    const key = JSON.stringify(args);
    if (key in cache) {
      console.log("cache hit!");
      return cache[key];
    }
    const result = fn(...args);
    cache[key] = result;
    return result;
  };
}

const expensiveCalc = memoize(function(n) {
  // imagine this takes 2 seconds
  return n * n;
});

expensiveCalc(10);  // computed
expensiveCalc(10);  // cache hit — instant
\`\`\`

**Python equivalent**: \`functools.lru_cache\` does the same thing at the decorator level. The JavaScript version is explicit — you can inspect and clear the cache directly because \`cache\` is just an object inside the closure.

This pattern appears in React (\`useMemo\`), routing libraries, API clients, and anywhere expensive computation should not repeat for the same input.`,
    },

    // ─── Part 4 Cell: memoize ─────────────────────────────────────────────────
    {
      type: 'js',
      instruction: `### Memoize: Caching with a Closure

The \`memoize\` wrapper uses a closure (\`cache\`) to remember results. Call \`slowSquare(8)\` twice — the second call is instant and shows "CACHE HIT".

Try calling it with a new number to see a fresh computation.`,
      html: `<div class="panel">
  <div class="label">Call log</div>
  <div id="log" class="log-box"></div>
  <div class="btn-row">
    <button id="b8a">slowSquare(8) — first</button>
    <button id="b8b">slowSquare(8) — second</button>
    <button id="b12">slowSquare(12) — new</button>
  </div>
</div>`,
      css: `.panel{height:100%;background:#09111c;padding:16px;border-radius:12px;display:flex;flex-direction:column;gap:10px;font-family:monospace;}
.label{color:#475569;font-size:10px;letter-spacing:.08em;text-transform:uppercase;}
.log-box{flex:1;background:#050e1a;border:1px solid #1e293b;border-radius:8px;padding:10px;color:#93c5fd;font-size:12px;overflow-y:auto;}
.btn-row{display:flex;gap:6px;flex-wrap:wrap;}
button{flex:1;background:#1e2a3f;border:1px solid #334155;color:#94a3b8;padding:8px;border-radius:8px;cursor:pointer;font-size:11px;font-family:monospace;}`,
      startCode: `function memoize(fn) {
  const cache = {};

  return function(...args) {
    const key = JSON.stringify(args);
    if (key in cache) {
      log("CACHE HIT for args " + key + " → " + cache[key]);
      return cache[key];
    }
    log("computing for args " + key + "…");
    const result = fn(...args);
    cache[key] = result;
    log("stored result " + result);
    return result;
  };
}

// Simulate a slow computation (normally this might call an API or do heavy math)
const slowSquare = memoize(function(n) {
  return n * n;
});

const logEl = document.getElementById('log');
function log(msg) {
  const line = document.createElement('div');
  line.textContent = msg;
  logEl.appendChild(line);
  logEl.scrollTop = logEl.scrollHeight;
}

document.getElementById('b8a').onclick  = () => slowSquare(8);
document.getElementById('b8b').onclick  = () => slowSquare(8);
document.getElementById('b12').onclick  = () => slowSquare(12);

log("memoized slowSquare ready. Click the buttons.");`,
      outputHeight: 280,
    },

    // ─── Wrap-up ──────────────────────────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `## You Can Now Do the Following

**Explain what a closure is:** a function that retains access to variables from the scope in which it was defined, even after that scope is no longer active.

**Build factory functions** that return objects with private state — no classes required.

**Diagnose the loop bug:** if timeouts or callbacks produce the same value repeatedly, the closure is sharing a \`var\` binding. Fix it with \`let\`.

**Write memoization:** wrap any pure function with a closure-based cache to skip redundant computation.

---

**Next lesson: Arrays and Objects** — the two data structures that underpin every non-trivial JavaScript program. We will cover destructuring, spread, and the reference model that determines when two objects are "equal".`,
    },

  ],
};

export default {
  id: 'js-core-2-2-closures',
  slug: 'closures-functions-that-remember',
  chapter: 'js2.1',
  order: 1,
  title: 'Closures — Functions That Remember',
  subtitle: 'Private state, factory functions, the loop bug, and memoization.',
  tags: ['javascript', 'closures', 'scope', 'factory-functions', 'memoization'],

  hook: {
    question: 'How can a function remember something after it returns?',
    realWorldContext: 'Closures power React hooks, module state, caching layers, and event handlers. Every time you write a function inside a function, you are creating a closure — understanding it makes bugs disappear.',
    previewVisualizationId: 'JSNotebook',
  },

  intuition: {
    prose: [
      'A closure is a function bundled with the variables from the scope it was defined in.',
      'Each call to a factory function creates a new, independent closure — its own private state.',
      '`let` in a for-loop gives each iteration its own binding; `var` shares one binding across all callbacks.',
    ],
    callouts: [
      {
        type: 'warning',
        title: 'The Loop Bug',
        body: 'Using `var` in a for-loop and closing over the loop variable inside a callback always produces the final value for every callback. Use `let` — it creates a fresh binding each iteration.',
      },
      {
        type: 'tip',
        title: 'Python Bridge',
        body: 'Python closures need `nonlocal` to write to an outer variable. JavaScript closures can read and write outer variables freely — no keyword needed.',
      },
    ],
    visualizations: [
      {
        id: 'JSNotebook',
        title: 'Closures — Counter, Factory, Loop Bug, Memoize',
        props: { lesson: LESSON_JS_CORE_2_2 },
      },
    ],
  },

  math: { prose: [], callouts: [], visualizations: [] },
  rigor: { prose: [], callouts: [], visualizations: [] },
  examples: [],
  challenges: [],

  mentalModel: [
    'A closure = function + the scope chain it was born in.',
    'Each factory-function call creates an independent closure with its own private variables.',
    '`let` in a for-loop: fresh binding per iteration — callbacks capture different values.',
    '`var` in a for-loop: one shared binding — all callbacks see the final value.',
    'Memoization = closure holding a cache object. Same input → instant return.',
  ],

  checkpoints: ['read-intuition'],
  quiz: [],
};
