// Chapter js2.1 — Lesson 2-2: Closures and Lexical Scope

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

\`\`\`js
function makeCounter() {
  let count = 0;           // private to makeCounter

  return function() {      // this inner function is returned
    count++;               // still has access to count — it was "closed over"
    return count;
  };
}

const counter = makeCounter();
counter();  // 1
counter();  // 2
counter();  // 3
\`\`\`

\`makeCounter\` has returned. In most languages, local variables vanish when a function returns — the stack frame is gone. But here \`count\` is still alive, because the inner function holds a reference to it. The JavaScript engine keeps the memory alive as long as something refers to it.

This is different from C, where a local variable truly dies with its stack frame — returning a pointer to it is undefined behavior. JavaScript's garbage collector handles lifetime automatically, so closures just work.`,
    },

    // ─── Part 1 Cell: counter closure ────────────────────────────────────────
    {
      type: 'js',
      instruction: `### The Counter: A Closure in Action

Each call to \`makeCounter()\` creates an **independent** counter with its own private \`count\`. Notice how \`counterA\` and \`counterB\` do not interfere with each other, even though they came from the same function.

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
.label{color:var(--color-text-secondary, #475569);font-size:11px;letter-spacing:.08em;text-transform:uppercase;}
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

console.log('Two independent counters. Click the buttons.');`,
      outputHeight: 220,
    },

    // ─── Part 2: Practical Use — Factory Functions ─────────────────────────────
    {
      type: 'markdown',
      instruction: `## Part 2 — Factory Functions

A **factory function** is a regular function that returns an object. Closures are what make the returned object's methods stateful — they remember the variables they were created alongside.

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
alice.login();        // 1
alice.login();        // 2
alice.status();       // "Alice has logged in 2 times"
alice.loginCount;     // undefined — it is genuinely private
\`\`\`

This pattern achieves something C++ needs \`private:\` access modifiers to enforce. JavaScript enforces it through scope — if the variable was never put on the object, it simply cannot be reached from outside.

Every time you write a React hook, a module with internal state, or a caching function, you are using this pattern.`,
    },

    // ─── Part 2 Cell: factory function ───────────────────────────────────────
    {
      type: 'js',
      instruction: `### Factory Function: Private State via Closure

\`loginCount\` is never put on the returned object — it only exists in the closure. The "Peek" button proves it cannot be accessed from outside.

Press Login a few times and watch the state persist between calls.`,
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
  let loginCount = 0;   // genuinely private

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

This is one of the most famous JavaScript gotchas. Every developer who learned JS before 2015 has been burned by it.

\`\`\`js
for (var i = 0; i < 3; i++) {
  setTimeout(function() { console.log(i); }, 100);
}
// Expected: 0, 1, 2
// Actual:   3, 3, 3
\`\`\`

Why? Because \`var\` is **function-scoped**, not block-scoped. All three closures share the *same* \`i\`. By the time the timeouts fire, the loop has already finished and \`i\` is 3.

If you come from C or Java, this surprises you: in those languages, a loop variable declared in the \`for\` header is block-scoped to the loop body. Every iteration gets its own \`i\`. In JavaScript with \`var\`, that is not true.

**The fix — use \`let\`:**

\`\`\`js
for (let i = 0; i < 3; i++) {
  setTimeout(function() { console.log(i); }, 100);
}
// Actual: 0, 1, 2
\`\`\`

\`let\` is block-scoped. Each loop iteration creates a brand-new \`i\` binding. Each closure captures its own independent copy. This is the behavior you expected.

This bug is one of the main reasons the JavaScript community moved from \`var\` to \`let\` and \`const\`. **Use \`let\` and \`const\` exclusively.**`,
    },

    // ─── Part 3 Cell: loop bug ────────────────────────────────────────────────
    {
      type: 'js',
      instruction: `### var vs let in Closures

Run the cell and see both behaviors side by side. The \`var\` row shows the old IIFE workaround that developers used before \`let\` existed. The \`let\` row just works.`,
      html: `<div class="panel">
  <div class="label">var loop (shared i — needs workaround)</div>
  <div id="var-row" class="row bad">waiting 300ms…</div>
  <div class="label">let loop (own i per iteration)</div>
  <div id="let-row" class="row good">waiting 300ms…</div>
</div>`,
      css: `.panel{height:100%;background:#09111c;padding:18px;border-radius:12px;display:flex;flex-direction:column;gap:8px;font-family:monospace;}
.label{color:var(--color-text-secondary, #475569);font-size:10px;letter-spacing:.08em;text-transform:uppercase;}
.row{background:#111827;border:1px solid #1e293b;border-radius:8px;padding:10px;font-size:13px;}
.bad{border-color:#f87171;color:#fca5a5;}
.good{border-color:#4ade80;color:#86efac;}`,
      startCode: `const varResults = [];
const letResults = [];

// var — one shared binding across all iterations
// Old fix: immediately-invoked function expression (IIFE) to capture a copy
for (var i = 0; i < 3; i++) {
  setTimeout((function(captured) {
    return function() { varResults.push(captured); };
  })(i), 150);
}

// let — fresh binding per iteration, closures capture different values
for (let j = 0; j < 3; j++) {
  setTimeout(function() { letResults.push(j); }, 150);
}

setTimeout(() => {
  document.getElementById('var-row').textContent =
    "var (IIFE workaround): [" + varResults + "]";
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

A closure can wrap any function and add **caching** — store results you have already computed, return them instantly on repeat calls.

\`\`\`js
function memoize(fn) {
  const cache = {};         // private to this closure

  return function(...args) {
    const key = JSON.stringify(args);
    if (key in cache) {
      return cache[key];    // instant — no recomputation
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

expensiveCalc(10);  // computed, stored
expensiveCalc(10);  // cache hit — instant
\`\`\`

This is the same idea as memoization tables in dynamic programming — once you compute a value, store it. The closure is what makes the \`cache\` persist between calls without becoming a global variable.

This pattern appears in React (\`useMemo\`), routing libraries, API clients, and anywhere expensive computation should not repeat for the same input.`,
    },

    // ─── Part 4 Cell: memoize ─────────────────────────────────────────────────
    {
      type: 'js',
      instruction: `### Memoize: Caching with a Closure

Call \`slowSquare(8)\` twice — the second call is instant and shows "CACHE HIT". Call it with a new number to see a fresh computation.

The \`cache\` object lives inside the closure — it persists across calls without polluting any outer scope.`,
      html: `<div class="panel">
  <div class="label">Call log</div>
  <div id="log" class="log-box"></div>
  <div class="btn-row">
    <button id="b8a">slowSquare(8) — first</button>
    <button id="b8b">slowSquare(8) — again</button>
    <button id="b12">slowSquare(12) — new</button>
  </div>
</div>`,
      css: `.panel{height:100%;background:#09111c;padding:16px;border-radius:12px;display:flex;flex-direction:column;gap:10px;font-family:monospace;}
.label{color:var(--color-text-secondary, #475569);font-size:10px;letter-spacing:.08em;text-transform:uppercase;}
.log-box{flex:1;background:#050e1a;border:1px solid #1e293b;border-radius:8px;padding:10px;color:#93c5fd;font-size:12px;overflow-y:auto;}
.btn-row{display:flex;gap:6px;flex-wrap:wrap;}
button{flex:1;background:#1e2a3f;border:1px solid #334155;color:#94a3b8;padding:8px;border-radius:8px;cursor:pointer;font-size:11px;font-family:monospace;}`,
      startCode: `function memoize(fn) {
  const cache = {};

  return function(...args) {
    const key = JSON.stringify(args);
    if (key in cache) {
      log("CACHE HIT for " + key + " → " + cache[key]);
      return cache[key];
    }
    log("computing for " + key + "…");
    const result = fn(...args);
    cache[key] = result;
    log("stored result " + result);
    return result;
  };
}

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

log("memoized slowSquare ready — click the buttons.");`,
      outputHeight: 280,
    },

    // ─── Wrap-up ──────────────────────────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `## You Can Now Do the Following

**Explain what a closure is:** a function bundled with the variables from the scope it was defined in. Those variables stay alive as long as the function exists.

**Build factory functions** that return objects with genuinely private state — not enforced by an access modifier, but by scope.

**Diagnose the loop bug:** if a \`setTimeout\` or event callback always logs the same final value, the closure is sharing a \`var\` binding. Fix it with \`let\`.

**Write memoization:** wrap any pure function with a closure-based cache to skip redundant computation.

---

### Before the Challenges

Each challenge below tests one closure concept from this lesson. Write real code — do not just pass the check; make sure you understand why it works.`,
    },

    // ─── Challenge 1: makeMultiplier ─────────────────────────────────────────
    {
      type: 'challenge',
      instruction: `### Challenge 1: makeMultiplier

Write a factory function \`makeMultiplier(factor)\` that returns a new function. The returned function takes a number and multiplies it by \`factor\`.

\`\`\`
const triple = makeMultiplier(3);
triple(4)   → 12
triple(10)  → 30

const half = makeMultiplier(0.5);
half(20)    → 10
\`\`\``,
      startCode: `function makeMultiplier(factor) {
  // return a function that multiplies its argument by factor
}

const triple = makeMultiplier(3);
const half   = makeMultiplier(0.5);

console.log(triple(4));   // 12
console.log(triple(10));  // 30
console.log(half(20));    // 10`,
      solutionCode: `function makeMultiplier(factor) {
  return function(n) { return n * factor; };
}
const triple = makeMultiplier(3);
const half   = makeMultiplier(0.5);
console.log(triple(4));
console.log(triple(10));
console.log(half(20));`,
      check: (code, logs) =>
        logs[0] === '12' && logs[1] === '30' && logs[2] === '10',
      successMessage: 'Correct! Each makeMultiplier call creates a closure that remembers its own factor.',
      failMessage: 'The returned function should close over `factor` from the outer call.',
    },

    // ─── Challenge 2: fix the loop bug ──────────────────────────────────────
    {
      type: 'challenge',
      instruction: `### Challenge 2: Fix the Loop Bug

The code below uses \`var\` in a loop and logs the same value three times instead of 0, 1, 2. Fix it with a one-word change so the output is \`0 1 2\`.`,
      startCode: `for (var i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 50);
}
// currently logs: 3  3  3
// should log:     0  1  2`,
      solutionCode: `for (let i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 50);
}`,
      check: (code) => /for\s*\(\s*let/.test(code),
      successMessage: 'Correct! `let` creates a fresh binding per iteration — each closure captures a different i.',
      failMessage: 'Change `var` to `let` in the for-loop header.',
    },

    // ─── Challenge 3: write a once() wrapper ────────────────────────────────
    {
      type: 'challenge',
      instruction: `### Challenge 3: Write \`once\`

Write a function \`once(fn)\` that returns a new function. The returned function calls \`fn\` the **first time** it is invoked, then returns that same result on every subsequent call without calling \`fn\` again.

\`\`\`
let count = 0;
const incrementOnce = once(() => { count++; return count; });

incrementOnce()  → 1    (fn runs, count becomes 1)
incrementOnce()  → 1    (fn does NOT run again)
incrementOnce()  → 1    (still 1)
\`\`\``,
      startCode: `function once(fn) {
  // use a closure to remember whether fn has been called
  // and what it returned
}

let count = 0;
const incrementOnce = once(() => { count++; return count; });

console.log(incrementOnce());   // 1
console.log(incrementOnce());   // 1
console.log(incrementOnce());   // 1
console.log('count:', count);   // count: 1 (fn only ran once)`,
      solutionCode: `function once(fn) {
  let called = false;
  let result;
  return function() {
    if (!called) { called = true; result = fn(); }
    return result;
  };
}
let count = 0;
const incrementOnce = once(() => { count++; return count; });
console.log(incrementOnce());
console.log(incrementOnce());
console.log(incrementOnce());
console.log('count:', count);`,
      check: (code, logs) =>
        logs[0] === '1' && logs[1] === '1' && logs[2] === '1' && logs[3] === 'count: 1',
      successMessage: 'Correct! once() is a real utility used in initialization, analytics, and event wiring.',
      failMessage: 'Track whether fn has been called with a boolean in the closure. Cache the result and return it every time after.',
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
    realWorldContext: 'Closures power React hooks, module state, caches, and event handlers. Every time you write a function inside a function, you are creating a closure — understanding it makes bugs disappear.',
    previewVisualizationId: 'JSNotebook',
  },

  intuition: {
    prose: [
      'A closure is a function bundled with the variables from the scope it was defined in.',
      'Each factory-function call creates a new, independent closure with its own private state.',
      '`let` in a for-loop gives each iteration its own binding; `var` shares one binding across all callbacks.',
    ],
    callouts: [
      {
        type: 'warning',
        title: 'The Loop Bug',
        body: 'Using `var` in a for-loop and referencing it inside a callback always produces the final value. Use `let` — it creates a fresh binding each iteration.',
      },
      {
        type: 'tip',
        title: 'Why Variables Don\'t Die',
        body: 'In C, local variables die with the stack frame. In JavaScript, the garbage collector keeps memory alive as long as something holds a reference to it — closures are that reference.',
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
    'Each factory call creates an independent closure with its own private variables.',
    '`let` in a for-loop: fresh binding per iteration — callbacks capture different values.',
    '`var` in a for-loop: one shared binding — all callbacks see the final value.',
    'Memoization = closure holding a cache object. Same input → instant return.',
  ],

  checkpoints: ['read-intuition'],
  quiz: [
    {
      id: 'q1',
      type: 'choice',
      text: 'What exactly is a closure?',
      options: [
        'A function that has been called and finished executing',
        'A function paired with the scope chain it was created in — it remembers its surrounding variables',
        'A design pattern for hiding object properties',
      ],
      correct: 1,
    },
    {
      id: 'q2',
      type: 'choice',
      text: 'You call a factory function twice to create two counters. Each counter has its own independent count. Why?',
      options: [
        'Factory functions reset global state on each call',
        'Each call to the factory creates a fresh scope — each returned function closes over its own separate variables',
        'The two counters share a closure but read from different indices',
      ],
      correct: 1,
    },
    {
      id: 'q3',
      type: 'choice',
      text: 'You write a for loop with var i and register a callback inside it. When the callbacks run later, they all see the same value of i. Why?',
      options: [
        'var creates a new binding for each loop iteration',
        'var has function scope — there is only one i shared across all iterations; by the time callbacks run, the loop has finished',
        'Callbacks always capture the initial value of i',
      ],
      correct: 1,
    },
    {
      id: 'q4',
      type: 'choice',
      text: 'Memoization uses a closure to cache results. What is the closure holding in this pattern?',
      options: [
        'A reference to the calling function so it can be re-run cheaply',
        'A cache object — the inner function closes over it and checks it before computing a result',
        'A copy of the entire function argument list from the first call',
      ],
      correct: 1,
    },
  ],
};
