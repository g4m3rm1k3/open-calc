
const LESSON_JS_CORE_3_2 = {
  title: 'Promises — The Async State Machine',
  subtitle: 'Pending, fulfilled, rejected. Chaining, error handling, and the Promise API.',
  sequential: true,

  cells: [

    {
      type: 'markdown',
      instruction: `## Part 1 — What a Promise Is

A **Promise** is an object that represents the eventual result of an asynchronous operation. When you ask for something that takes time — a network request, a file read, a timer — you get a Promise back immediately. The actual result arrives later.

A Promise is always in exactly one of three states:

\`\`\`
Pending  →  Fulfilled (resolved with a value)
         ↘
           Rejected (failed with a reason)
\`\`\`

Once a promise settles (fulfills or rejects), it **never changes state**. A fulfilled promise stays fulfilled. A rejected promise stays rejected.

**Creating a Promise:**
\`\`\`js
const p = new Promise((resolve, reject) => {
  // do async work
  if (success) resolve(value);   // fulfills the promise
  else         reject(error);    // rejects the promise
});
\`\`\`

The function passed to \`new Promise\` is called the **executor**. It runs immediately and synchronously. \`resolve\` and \`reject\` are callbacks you call when the work is done.

**Consuming a Promise:**
\`\`\`js
p.then(value  => console.log("Got:", value))
 .catch(error => console.log("Failed:", error))
 .finally(()  => console.log("Done either way"));
\`\`\``,
    },

    {
      type: 'js',
      instruction: `### Promise States: Live

Click each button to create a promise in a different state. Watch the state indicator and the console. Notice that \`finally\` runs regardless of outcome.`,
      html: `<div class="app">
  <div class="btn-row">
    <button id="b-resolve">Resolve after 1s</button>
    <button id="b-reject">Reject after 1s</button>
    <button id="b-instant">Instant resolve</button>
  </div>
  <div id="state" class="state-box pending">PENDING</div>
  <div id="value" class="value-box">—</div>
</div>`,
      css: `.app{height:100%;background:#09111c;padding:18px;border-radius:12px;display:flex;flex-direction:column;gap:14px;font-family:monospace;}
.btn-row{display:flex;gap:8px;flex-wrap:wrap;}
button{flex:1;background:#1e2a3f;border:1px solid #334155;color:#94a3b8;padding:10px;border-radius:8px;cursor:pointer;font-size:12px;font-family:monospace;}
.state-box{padding:14px;border-radius:8px;text-align:center;font-weight:800;font-size:16px;letter-spacing:.1em;transition:all .4s;}
.pending{background:#0f172a;border:2px solid #475569;color:#64748b;}
.fulfilled{background:#064e3b;border:2px solid #34d399;color:#6ee7b7;}
.rejected{background:#450a0a;border:2px solid #f87171;color:#fca5a5;}
.value-box{background:#050e1a;border:1px solid #1e293b;border-radius:8px;padding:12px;color:#93c5fd;font-size:13px;}`,
      startCode: `function runPromise(p) {
  document.getElementById('state').className = 'state-box pending';
  document.getElementById('state').textContent = 'PENDING';
  document.getElementById('value').textContent = 'waiting…';

  p.then(val => {
    document.getElementById('state').className = 'state-box fulfilled';
    document.getElementById('state').textContent = 'FULFILLED';
    document.getElementById('value').textContent = 'Value: ' + val;
    console.log('Fulfilled with:', val);
  })
  .catch(err => {
    document.getElementById('state').className = 'state-box rejected';
    document.getElementById('state').textContent = 'REJECTED';
    document.getElementById('value').textContent = 'Error: ' + err.message;
    console.log('Rejected with:', err.message);
  })
  .finally(() => {
    console.log('finally — runs regardless of outcome');
  });
}

document.getElementById('b-resolve').onclick = () =>
  runPromise(new Promise(resolve => setTimeout(() => resolve("hello world"), 1000)));

document.getElementById('b-reject').onclick = () =>
  runPromise(new Promise((_, reject) => setTimeout(() => reject(new Error("network timeout")), 1000)));

document.getElementById('b-instant').onclick = () =>
  runPromise(Promise.resolve("instant value — no delay"));`,
      outputHeight: 280,
    },

    {
      type: 'markdown',
      instruction: `## Part 2 — Chaining: The Key Pattern

Every \`.then()\` returns a **new Promise**. This is what makes chaining work.

\`\`\`js
fetchUser(id)
  .then(user    => fetchPosts(user.id))   // returns a new promise
  .then(posts   => filterPublished(posts)) // transforms the value
  .then(posts   => render(posts))
  .catch(error  => showError(error));      // catches any rejection in the chain
\`\`\`

Rules for \`.then()\` return values:
- Return a **plain value** → next \`.then\` receives it immediately
- Return a **Promise** → next \`.then\` waits for that promise to settle
- **Throw an error** → skips to the next \`.catch\`

\`\`\`js
Promise.resolve(1)
  .then(n => n + 1)          // 2 — plain value, synchronous
  .then(n => n * 10)         // 20
  .then(n => {
    if (n > 15) throw new Error("too big");
    return n;
  })
  .catch(e => {
    console.log(e.message);  // "too big"
    return 0;                // recover — next .then gets 0
  })
  .then(n => console.log(n)); // 0
\`\`\`

**A \`.catch\` can recover**: if it returns a value, the chain continues normally after it. This lets you provide fallback values for failed operations.`,
    },

    {
      type: 'js',
      instruction: `### Chaining: Pipeline of Async Steps

This simulates a realistic chain: fetch a user, then fetch their orders, then calculate their total. Each step is fake-async with a 400ms delay. Watch the status update as each step completes.`,
      html: `<div class="app">
  <div id="pipeline" class="pipeline"></div>
  <button id="startBtn">Run Pipeline</button>
</div>`,
      css: `.app{height:100%;background:#09111c;padding:16px;border-radius:12px;display:flex;flex-direction:column;gap:12px;font-family:monospace;}
.pipeline{flex:1;display:flex;flex-direction:column;gap:8px;}
.step{background:#111827;border:1px solid #1e293b;border-radius:8px;padding:10px;font-size:12px;color:#475569;transition:all .3s;}
.step.active{border-color:#38bdf8;color:#93c5fd;background:#0f2233;}
.step.done{border-color:#34d399;color:#6ee7b7;background:#064e3b22;}
.step.error{border-color:#f87171;color:#fca5a5;background:#450a0a22;}
button{background:#1e3a5f;border:1px solid #38bdf8;color:#93c5fd;padding:10px;border-radius:8px;cursor:pointer;font-family:monospace;font-size:13px;}`,
      startCode: `// Fake async operations — each returns a Promise that resolves after a delay
function fakeFetch(name, data, delay = 400, shouldFail = false) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (shouldFail) reject(new Error(name + " failed"));
      else resolve(data);
    }, delay);
  });
}

const steps = [
  { id: 's1', label: '1. Fetch user (id: 42)' },
  { id: 's2', label: '2. Fetch orders for user' },
  { id: 's3', label: '3. Calculate total' },
  { id: 's4', label: '4. Render result' },
];

// Build the step UI
const pipeline = document.getElementById('pipeline');
steps.forEach(s => {
  const d = document.createElement('div');
  d.id = s.id;
  d.className = 'step';
  d.textContent = s.label;
  pipeline.appendChild(d);
});

function setStep(id, state, extra = '') {
  const el = document.getElementById(id);
  el.className = 'step ' + state;
  if (extra) el.textContent = steps.find(s => s.id === id).label + ' — ' + extra;
}

document.getElementById('startBtn').onclick = () => {
  steps.forEach(s => {
    document.getElementById(s.id).className = 'step';
    document.getElementById(s.id).textContent = steps.find(x => x.id === s.id).label;
  });

  setStep('s1', 'active');

  fakeFetch('user', { id: 42, name: 'Alice' })
    .then(user => {
      setStep('s1', 'done', 'user: ' + user.name);
      setStep('s2', 'active');
      return fakeFetch('orders', [{ item: 'Widget', price: 25 }, { item: 'Gadget', price: 80 }]);
    })
    .then(orders => {
      setStep('s2', 'done', orders.length + ' orders');
      setStep('s3', 'active');
      const total = orders.reduce((sum, o) => sum + o.price, 0);
      return fakeFetch('total', total, 300);
    })
    .then(total => {
      setStep('s3', 'done', 'total = $' + total);
      setStep('s4', 'active');
      return fakeFetch('render', 'rendered', 200);
    })
    .then(() => {
      setStep('s4', 'done', '✓ complete');
      console.log('Pipeline complete');
    })
    .catch(err => {
      console.log('Pipeline failed:', err.message);
    });
};`,
      outputHeight: 320,
    },

    {
      type: 'markdown',
      instruction: `## Part 3 — The Promise API: Running Multiple Promises

When you have several independent async operations, running them sequentially is slow — each one waits for the previous. Run them in parallel with the Promise combinators.

---

**\`Promise.all(promises)\`** — wait for all to fulfill, fail if any rejects:
\`\`\`js
const [user, posts, comments] = await Promise.all([
  fetchUser(id),
  fetchPosts(id),
  fetchComments(id),
]);
\`\`\`
If any promise rejects, the whole thing rejects immediately.

---

**\`Promise.allSettled(promises)\`** — wait for all to settle, never rejects:
\`\`\`js
const results = await Promise.allSettled([p1, p2, p3]);
results.forEach(r => {
  if (r.status === 'fulfilled') console.log(r.value);
  else console.log(r.reason);
});
\`\`\`
Use this when you want to know the outcome of every promise, even if some fail.

---

**\`Promise.race(promises)\`** — settle as soon as the first one settles:
\`\`\`js
const result = await Promise.race([
  fetchData(),
  timeout(5000),   // reject if takes more than 5 seconds
]);
\`\`\`
Classic use: implementing timeouts for requests.

---

**\`Promise.any(promises)\`** — fulfill as soon as the first one fulfills (ignores rejections):
\`\`\`js
const fastest = await Promise.any([mirror1, mirror2, mirror3]);
\`\`\`
Use this to race multiple servers and take the fastest response.`,
    },

    {
      type: 'js',
      instruction: `### Promise.all vs Promise.allSettled

Run both combinators on the same mix of passing and failing promises. Notice that \`Promise.all\` bails on the first rejection while \`Promise.allSettled\` collects everything.`,
      html: `<div class="app">
  <div class="label">Promise.all — fails fast</div>
  <div id="all-result" class="result-box bad">—</div>
  <div class="label">Promise.allSettled — collects all outcomes</div>
  <div id="settled-result" class="result-box good">—</div>
  <button id="runBtn">Run Both</button>
</div>`,
      css: `.app{height:100%;background:#09111c;padding:16px;border-radius:12px;display:flex;flex-direction:column;gap:10px;font-family:monospace;}
.label{color:#475569;font-size:10px;letter-spacing:.08em;text-transform:uppercase;}
.result-box{background:#050e1a;border:1px solid #1e293b;border-radius:8px;padding:10px;font-size:12px;color:#e2e8f0;white-space:pre-wrap;min-height:50px;}
.bad{border-color:#f87171;}.good{border-color:#34d399;}
button{background:#1e3a5f;border:1px solid #38bdf8;color:#93c5fd;padding:10px;border-radius:8px;cursor:pointer;font-family:monospace;font-size:12px;}`,
      startCode: `function fakeAsync(label, value, delay, fail = false) {
  return new Promise((resolve, reject) =>
    setTimeout(() => fail ? reject(new Error(label + " failed")) : resolve(value), delay)
  );
}

document.getElementById('runBtn').onclick = () => {
  document.getElementById('all-result').textContent = 'running…';
  document.getElementById('settled-result').textContent = 'running…';

  const promises = [
    fakeAsync('API-1', 'user data',    300),
    fakeAsync('API-2', 'posts data',   500, true),   // this one fails
    fakeAsync('API-3', 'config data',  200),
  ];

  // Promise.all — rejects immediately when API-2 fails
  Promise.all(promises.map(p => p.catch(e => { throw e; })))
    .then(results => {
      document.getElementById('all-result').textContent = 'All succeeded:\n' + results.join('\n');
    })
    .catch(err => {
      document.getElementById('all-result').textContent = 'REJECTED: ' + err.message + '\n(other results discarded)';
    });

  // Promise.allSettled — waits for all, reports each outcome
  Promise.allSettled([
    fakeAsync('API-1', 'user data',  300),
    fakeAsync('API-2', 'posts data', 500, true),
    fakeAsync('API-3', 'config data', 200),
  ]).then(results => {
    const report = results.map(r =>
      r.status === 'fulfilled'
        ? '✓ ' + r.value
        : '✗ ' + r.reason.message
    ).join('\n');
    document.getElementById('settled-result').textContent = report;
  });
};`,
      outputHeight: 300,
    },

    {
      type: 'markdown',
      instruction: `### Before the Challenges`,
    },

    {
      type: 'challenge',
      instruction: `### Challenge 1: Promisify a Timer

Write a function \`wait(ms)\` that returns a Promise which resolves after \`ms\` milliseconds. Then use it to log "done" after 500ms.

Expected console output: \`done\` (after a short delay)`,
      startCode: `function wait(ms) {
  // return a Promise that resolves after ms milliseconds
}

wait(500).then(() => console.log("done"));`,
      solutionCode: `function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
wait(500).then(() => console.log("done"));`,
      check: (code) =>
        /new Promise/.test(code) &&
        /setTimeout/.test(code) &&
        /resolve/.test(code),
      successMessage: 'Correct! This is the fundamental "promisify a callback" pattern — you will use it constantly.',
      failMessage: 'Create a new Promise, and inside the executor call setTimeout(resolve, ms).',
    },

    {
      type: 'challenge',
      instruction: `### Challenge 2: Chain and Recover

Write a promise chain that:
1. Starts with \`Promise.resolve(10)\`
2. Doubles the value
3. Throws an error if the value is greater than 15
4. Catches the error and returns \`0\` as a fallback
5. Logs the final value

Expected log: \`final: 0\``,
      startCode: `Promise.resolve(10)
  // .then(...)   double it
  // .then(...)   throw if > 15
  // .catch(...)  return 0 as fallback
  // .then(...)   log "final: " + value`,
      solutionCode: `Promise.resolve(10)
  .then(n => n * 2)
  .then(n => { if (n > 15) throw new Error("too big"); return n; })
  .catch(() => 0)
  .then(n => console.log("final:", n));`,
      check: (code, logs) => logs[0] === 'final: 0',
      successMessage: 'Correct! .catch() can recover from errors — returning a value continues the chain normally.',
      failMessage: 'Chain: double → throw if > 15 → catch → return 0 → log. Each .then() returns the new promise.',
    },

    {
      type: 'challenge',
      instruction: `### Challenge 3: Race a Timeout

Write a \`fetchWithTimeout(url, ms)\` function that races a fetch against a timeout. If the fetch takes longer than \`ms\` milliseconds, the promise should reject with \`"timeout"\`.

Then call it and log either the status code or the error message.

(Use \`'https://jsonplaceholder.typicode.com/todos/1'\` as the URL, timeout of 5000ms)`,
      startCode: `function fetchWithTimeout(url, ms) {
  const timeout = new Promise((_, reject) =>
    setTimeout(() => reject(new Error("timeout")), ms)
  );
  // race the fetch against the timeout
}

fetchWithTimeout('https://jsonplaceholder.typicode.com/todos/1', 5000)
  .then(res => console.log("status:", res.status))
  .catch(err => console.log("error:", err.message));`,
      solutionCode: `function fetchWithTimeout(url, ms) {
  const timeout = new Promise((_, reject) =>
    setTimeout(() => reject(new Error("timeout")), ms)
  );
  return Promise.race([fetch(url), timeout]);
}
fetchWithTimeout('https://jsonplaceholder.typicode.com/todos/1', 5000)
  .then(res => console.log("status:", res.status))
  .catch(err => console.log("error:", err.message));`,
      check: (code) =>
        /Promise\.race/.test(code) && /fetch\s*\(/.test(code),
      successMessage: 'Correct! Promise.race is the standard way to add timeouts to any async operation.',
      failMessage: 'Use Promise.race([fetch(url), timeout]) — whichever settles first wins.',
    },

  ],
};

export default {
  id: 'js-core-3-2-promises',
  slug: 'promises-the-async-state-machine',
  chapter: 'js3.1',
  order: 1,
  title: 'Promises — The Async State Machine',
  subtitle: 'Pending, fulfilled, rejected. Chaining, error handling, and the Promise API.',
  tags: ['javascript', 'promises', 'async', 'then', 'catch', 'promise-all'],

  hook: {
    question: 'How do you work with values that don\'t exist yet?',
    realWorldContext: 'Every network request, file read, or database query in JavaScript returns a Promise. Mastering promises is mastering the currency of async JavaScript.',
    previewVisualizationId: 'JSNotebook',
  },

  intuition: {
    prose: [
      'A Promise has three states: pending → fulfilled or rejected. Once settled, it never changes.',
      '.then() returns a new Promise — chaining transforms values step by step.',
      'Promise.all races to failure; Promise.allSettled collects every outcome regardless.',
    ],
    callouts: [
      {
        type: 'tip',
        title: '.catch() Can Recover',
        body: 'If .catch() returns a value (not throwing), the chain continues normally after it. Use this for fallback values.',
      },
      {
        type: 'warning',
        title: 'Forgetting to Return',
        body: 'In a .then() callback, if you forget the `return` before a Promise, the chain does not wait for it. The next .then() runs immediately with `undefined`.',
      },
    ],
    visualizations: [
      {
        id: 'JSNotebook',
        title: 'Promises — States, Chaining, all, allSettled, race',
        props: { lesson: LESSON_JS_CORE_3_2 },
      },
    ],
  },

  math: { prose: [], callouts: [], visualizations: [] },
  rigor: { prose: [], callouts: [], visualizations: [] },
  examples: [],
  challenges: [],
  mentalModel: [
    'Promise = eventual value. Three states: pending → fulfilled | rejected. Immutable once settled.',
    '.then(fn) returns a new promise. Returning a value passes it forward. Returning a promise waits for it.',
    'Promise.all — parallel, fail-fast. Promise.allSettled — parallel, collect all. Promise.race — first settles wins.',
    '.catch() can recover: if it returns a value, the chain continues.',
  ],
  checkpoints: ['read-intuition'],
  quiz: [],
};
