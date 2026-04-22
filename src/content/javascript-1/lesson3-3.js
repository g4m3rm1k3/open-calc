// J4 — Lesson 3-3: async/await

const LESSON_JS_CORE_3_3 = {
  title: 'async/await — Promises You Can Read',
  subtitle: 'Syntactic sugar over Promises. Sequential and parallel patterns. Error handling.',
  sequential: true,

  cells: [

    {
      type: 'markdown',
      instruction: `## Part 1 — What async/await Is

\`async\`/\`await\` is not a new async model. It is **syntactic sugar over Promises**. Under the hood, every \`async\` function returns a Promise, and every \`await\` is a \`.then()\` in disguise.

The reason it exists: chained \`.then()\` callbacks get hard to read when you have many sequential steps. \`async\`/\`await\` makes async code look synchronous, which is dramatically easier to reason about.

**The transformation:**

\`\`\`js
// Promise chain
function loadUser(id) {
  return fetchUser(id)
    .then(user => fetchPosts(user.id))
    .then(posts => { return { posts }; });
}

// async/await — identical behavior, clearer intent
async function loadUser(id) {
  const user  = await fetchUser(id);
  const posts = await fetchPosts(user.id);
  return { posts };
}
\`\`\`

**Rules:**
- \`async\` before a function makes it always return a Promise
- \`await\` pauses the async function until the awaited Promise settles
- \`await\` can only be used inside an \`async\` function (or at the top level of a module)
- If the awaited Promise rejects, the \`await\` expression throws — use \`try/catch\``,
    },

    {
      type: 'js',
      instruction: `### async/await: Side by Side with Promises

Both blocks below do the same thing. Run both and compare. The async/await version reads like synchronous code even though it does the same async work.`,
      html: `<div class="app">
  <div class="col">
    <div class="label">Promise chain</div>
    <div id="p1" class="box">—</div>
    <button id="btn1">Run (promise)</button>
  </div>
  <div class="col">
    <div class="label">async/await</div>
    <div id="p2" class="box">—</div>
    <button id="btn2">Run (async/await)</button>
  </div>
</div>`,
      css: `.app{height:100%;background:#09111c;padding:16px;border-radius:12px;display:grid;grid-template-columns:1fr 1fr;gap:14px;font-family:monospace;}
.col{display:flex;flex-direction:column;gap:8px;}
.label{color:#475569;font-size:10px;letter-spacing:.08em;text-transform:uppercase;}
.box{flex:1;background:#050e1a;border:1px solid #1e293b;border-radius:8px;padding:10px;color:#93c5fd;font-size:12px;white-space:pre-wrap;}
button{background:#1e3a5f;border:1px solid #38bdf8;color:#93c5fd;padding:8px;border-radius:8px;cursor:pointer;font-size:12px;font-family:monospace;}`,
      startCode: `function delay(ms, val) {
  return new Promise(r => setTimeout(() => r(val), ms));
}

// ── Promise chain ──────────────────────────────────────────
function loadDataPromise() {
  return delay(300, { id: 1, name: "Alice" })
    .then(user => {
      return delay(300, ["post A", "post B"])
        .then(posts => ({ user, posts }));
    });
}

document.getElementById('btn1').onclick = () => {
  document.getElementById('p1').textContent = 'loading…';
  loadDataPromise().then(result => {
    document.getElementById('p1').textContent =
      'user: ' + result.user.name + '\nposts: ' + result.posts.join(', ');
  });
};

// ── async/await — same thing, different syntax ─────────────
async function loadDataAsync() {
  const user  = await delay(300, { id: 1, name: "Alice" });
  const posts = await delay(300, ["post A", "post B"]);
  return { user, posts };
}

document.getElementById('btn2').onclick = async () => {
  document.getElementById('p2').textContent = 'loading…';
  const result = await loadDataAsync();
  document.getElementById('p2').textContent =
    'user: ' + result.user.name + '\nposts: ' + result.posts.join(', ');
};`,
      outputHeight: 260,
    },

    {
      type: 'markdown',
      instruction: `## Part 2 — Error Handling: try/catch

With promise chains, errors flow to \`.catch()\`. With async/await, you use normal \`try/catch\` — the same syntax as synchronous error handling in every language.

\`\`\`js
async function loadUser(id) {
  try {
    const user = await fetchUser(id);
    return user;
  } catch (error) {
    console.error("Load failed:", error.message);
    return null;    // fallback value
  } finally {
    console.log("done — always runs");
  }
}
\`\`\`

**What try/catch catches:**
- Awaited promises that reject: \`await failingPromise()\`
- Synchronous throws inside the async function
- JSON parse errors, type errors, etc.

**What it does NOT catch:**
- Errors in callbacks that are not awaited
- Errors in unrelated promise chains you did not await

\`\`\`js
async function risky() {
  try {
    setTimeout(() => { throw new Error("uncaught!"); }, 100); // NOT caught
    await Promise.reject(new Error("caught!"));               // caught
  } catch (e) {
    console.log(e.message); // "caught!"
  }
}
\`\`\`

**Top-level error handling**: in Node.js and modern browsers, add a global handler:
\`\`\`js
window.addEventListener('unhandledrejection', event => {
  console.error('Unhandled promise rejection:', event.reason);
});
\`\`\``,
    },

    {
      type: 'js',
      instruction: `### try/catch in async Functions

Click "Succeed" and "Fail" to see error handling in action. Notice how the \`finally\` block runs in both cases, and the \`catch\` block provides a fallback value.`,
      html: `<div class="app">
  <div id="status" class="status-box neutral">Ready</div>
  <div id="result" class="result-box">—</div>
  <div class="btn-row">
    <button id="succeedBtn">Succeed</button>
    <button id="failBtn">Fail</button>
  </div>
</div>`,
      css: `.app{height:100%;background:#09111c;padding:18px;border-radius:12px;display:flex;flex-direction:column;gap:12px;font-family:monospace;}
.status-box{padding:10px;border-radius:8px;text-align:center;font-weight:700;font-size:13px;transition:all .3s;}
.neutral{background:#0f172a;border:1px solid #334155;color:#64748b;}
.ok{background:#064e3b;border:1px solid #34d399;color:#6ee7b7;}
.err{background:#450a0a;border:1px solid #f87171;color:#fca5a5;}
.result-box{flex:1;background:#050e1a;border:1px solid #1e293b;border-radius:8px;padding:10px;color:#93c5fd;font-size:12px;white-space:pre;}
.btn-row{display:flex;gap:8px;}
button{flex:1;background:#1e2a3f;border:1px solid #334155;color:#94a3b8;padding:10px;border-radius:8px;cursor:pointer;font-size:13px;font-family:monospace;}`,
      startCode: `function fakeRequest(shouldFail) {
  return new Promise((resolve, reject) =>
    setTimeout(() =>
      shouldFail
        ? reject(new Error("503 Service Unavailable"))
        : resolve({ data: "user profile", cached: false }),
      600
    )
  );
}

async function loadProfile(fail) {
  const statusEl = document.getElementById('status');
  const resultEl = document.getElementById('result');

  statusEl.className = 'status-box neutral';
  statusEl.textContent = 'Fetching…';
  resultEl.textContent = '';

  try {
    const response = await fakeRequest(fail);
    statusEl.className = 'status-box ok';
    statusEl.textContent = 'SUCCESS';
    resultEl.textContent = JSON.stringify(response, null, 2);
    console.log('got:', response);
    return response;
  } catch (error) {
    statusEl.className = 'status-box err';
    statusEl.textContent = 'FAILED — using fallback';
    const fallback = { data: "cached profile", cached: true };
    resultEl.textContent = 'Error: ' + error.message + '\n\nFallback:\n' + JSON.stringify(fallback, null, 2);
    console.log('caught:', error.message, '→ using fallback');
    return fallback;
  } finally {
    console.log('finally: cleanup, spinner off, analytics log, etc.');
  }
}

document.getElementById('succeedBtn').onclick = () => loadProfile(false);
document.getElementById('failBtn').onclick    = () => loadProfile(true);`,
      outputHeight: 310,
    },

    {
      type: 'markdown',
      instruction: `## Part 3 — Sequential vs Parallel: The Most Common Mistake

This is the most important performance trap in async JavaScript.

**Sequential (slow — one at a time):**
\`\`\`js
async function loadAll() {
  const user    = await fetchUser();    // wait 300ms
  const posts   = await fetchPosts();   // wait 300ms more
  const comments = await fetchComments(); // wait 300ms more
  // total: ~900ms
}
\`\`\`

Each \`await\` blocks the next line from starting. If the requests are independent, you are wasting time.

**Parallel (fast — all at once):**
\`\`\`js
async function loadAll() {
  const [user, posts, comments] = await Promise.all([
    fetchUser(),
    fetchPosts(),
    fetchComments(),
  ]);
  // total: ~300ms (as long as the slowest)
}
\`\`\`

Start all three simultaneously, then await all of them together.

**Rule of thumb**: if request B does not need the result of request A, run them in parallel with \`Promise.all\`.

**The sequential await in a loop trap:**
\`\`\`js
// Wrong — processes items one at a time
for (const id of ids) {
  await processItem(id);  // each waits for the previous
}

// Right — process all in parallel
await Promise.all(ids.map(id => processItem(id)));
\`\`\``,
    },

    {
      type: 'js',
      instruction: `### Sequential vs Parallel — Timing Proof

Click each button and watch the timer. The sequential version takes 3× as long as the parallel version, even though they do the same work.`,
      html: `<div class="app">
  <div class="col">
    <div class="label">Sequential (await each)</div>
    <div id="seq-bar" class="time-bar"><div id="seq-fill" class="fill"></div></div>
    <div id="seq-result" class="result">—</div>
    <button id="seqBtn">Run Sequential</button>
  </div>
  <div class="col">
    <div class="label">Parallel (Promise.all)</div>
    <div id="par-bar" class="time-bar"><div id="par-fill" class="fill par"></div></div>
    <div id="par-result" class="result">—</div>
    <button id="parBtn">Run Parallel</button>
  </div>
</div>`,
      css: `.app{height:100%;background:#09111c;padding:16px;border-radius:12px;display:grid;grid-template-columns:1fr 1fr;gap:14px;font-family:monospace;}
.col{display:flex;flex-direction:column;gap:8px;}
.label{color:#475569;font-size:10px;letter-spacing:.08em;text-transform:uppercase;}
.time-bar{background:#111827;border-radius:6px;height:8px;overflow:hidden;}
.fill{height:100%;width:0%;background:#f87171;border-radius:6px;transition:width .05s linear;}
.fill.par{background:#34d399;}
.result{background:#050e1a;border:1px solid #1e293b;border-radius:8px;padding:10px;color:#e2e8f0;font-size:13px;flex:1;}
button{background:#1e2a3f;border:1px solid #334155;color:#94a3b8;padding:10px;border-radius:8px;cursor:pointer;font-size:12px;font-family:monospace;}`,
      startCode: `const DELAY = 500; // each "request" takes 500ms

function fakeRequest(name) {
  return new Promise(r => setTimeout(() => r(name + " data"), DELAY));
}

function animateBar(fillId, durationMs) {
  const fill = document.getElementById(fillId);
  fill.style.width = '0%';
  const start = Date.now();
  const interval = setInterval(() => {
    const pct = Math.min(((Date.now() - start) / durationMs) * 100, 100);
    fill.style.width = pct + '%';
    if (pct >= 100) clearInterval(interval);
  }, 30);
}

document.getElementById('seqBtn').onclick = async () => {
  document.getElementById('seq-result').textContent = 'running…';
  animateBar('seq-fill', DELAY * 3 + 50);
  const t = Date.now();

  const a = await fakeRequest('users');
  const b = await fakeRequest('posts');
  const c = await fakeRequest('comments');

  const elapsed = Date.now() - t;
  document.getElementById('seq-result').textContent =
    'Got: ' + [a,b,c].join(', ') + '\nTime: ' + elapsed + 'ms  (3 × ' + DELAY + 'ms)';
};

document.getElementById('parBtn').onclick = async () => {
  document.getElementById('par-result').textContent = 'running…';
  animateBar('par-fill', DELAY + 50);
  const t = Date.now();

  const [a, b, c] = await Promise.all([
    fakeRequest('users'),
    fakeRequest('posts'),
    fakeRequest('comments'),
  ]);

  const elapsed = Date.now() - t;
  document.getElementById('par-result').textContent =
    'Got: ' + [a,b,c].join(', ') + '\nTime: ' + elapsed + 'ms  (~' + DELAY + 'ms)';
};`,
      outputHeight: 300,
    },

    {
      type: 'markdown',
      instruction: `## Part 4 — async/await Under the Hood

Every \`async\` function is transformed by the JavaScript engine into a state machine built on Promises. When you write:

\`\`\`js
async function f() {
  const a = await p1();
  const b = await p2(a);
  return a + b;
}
\`\`\`

The engine generates roughly:

\`\`\`js
function f() {
  return p1().then(a => {
    return p2(a).then(b => {
      return a + b;
    });
  });
}
\`\`\`

This means:
- \`async\` functions always return a Promise, even if you return a plain value
- \`await\` is equivalent to \`.then()\` — it schedules a microtask and releases the call stack
- Unhandled rejections in async functions produce unhandled Promise rejections — they do not silently disappear

**The IIFE pattern** — running async code at the top level in environments without top-level await:
\`\`\`js
(async () => {
  const data = await fetchSomething();
  console.log(data);
})();
\`\`\`

This immediately-invoked async function expression is the standard pattern in scripts and older bundler environments.`,
    },

    {
      type: 'markdown',
      instruction: `### Before the Challenges`,
    },

    {
      type: 'challenge',
      instruction: `### Challenge 1: Convert to async/await

Convert the promise chain below to an equivalent \`async\` function named \`getData\`. It should return the same final value and handle errors the same way.

\`\`\`js
function getData() {
  return fetch('https://jsonplaceholder.typicode.com/todos/1')
    .then(res => res.json())
    .then(data => data.title)
    .catch(() => "fallback title");
}
\`\`\``,
      startCode: `async function getData() {
  // convert the chain to async/await with try/catch
}

getData().then(title => console.log("title:", title));`,
      solutionCode: `async function getData() {
  try {
    const res  = await fetch('https://jsonplaceholder.typicode.com/todos/1');
    const data = await res.json();
    return data.title;
  } catch {
    return "fallback title";
  }
}
getData().then(title => console.log("title:", title));`,
      check: (code) =>
        /async\s+function\s+getData/.test(code) &&
        /await\s+fetch/.test(code) &&
        /await\s+res\.json\(\)|await\s+\w+\.json\(\)/.test(code) &&
        /try/.test(code),
      successMessage: 'Correct! async/await and promise chains are equivalent — choose whichever is clearer.',
      failMessage: 'Use async function getData(), await the fetch, await .json(), and wrap in try/catch.',
    },

    {
      type: 'challenge',
      instruction: `### Challenge 2: Parallel Fetch

The function below fetches two URLs sequentially. Rewrite it to fetch them in **parallel** using \`Promise.all\`. Log the total number of items across both arrays.

Both endpoints return arrays. Expected log: \`total items: N\` (some number > 0)`,
      startCode: `async function loadBoth() {
  // Currently sequential — fetch them in parallel instead
  const todos   = await fetch('https://jsonplaceholder.typicode.com/todos').then(r => r.json());
  const posts   = await fetch('https://jsonplaceholder.typicode.com/posts').then(r => r.json());
  console.log("total items:", todos.length + posts.length);
}

loadBoth();`,
      solutionCode: `async function loadBoth() {
  const [todos, posts] = await Promise.all([
    fetch('https://jsonplaceholder.typicode.com/todos').then(r => r.json()),
    fetch('https://jsonplaceholder.typicode.com/posts').then(r => r.json()),
  ]);
  console.log("total items:", todos.length + posts.length);
}
loadBoth();`,
      check: (code) =>
        /Promise\.all/.test(code) && /await\s+Promise\.all/.test(code),
      successMessage: 'Correct! Parallel fetching with Promise.all cuts wait time to that of the slowest request.',
      failMessage: 'Wrap both fetches in Promise.all([...]) and await the result with destructuring.',
    },

  ],
};

export default {
  id: 'js-core-3-3-async-await',
  slug: 'async-await-promises-you-can-read',
  chapter: 'js3.1',
  order: 2,
  title: 'async/await — Promises You Can Read',
  subtitle: 'Sugar over Promises. Sequential vs parallel. try/catch error handling.',
  tags: ['javascript', 'async', 'await', 'promises', 'try-catch', 'parallel'],

  hook: {
    question: 'If async/await is just Promises, why does it exist?',
    realWorldContext: 'Real async code has 10+ chained steps with error handling at each level. async/await makes that readable. It is the syntax you will write every day in modern JavaScript.',
    previewVisualizationId: 'JSNotebook',
  },

  intuition: {
    prose: [
      '`async` functions always return a Promise. `await` pauses the function and returns control to the event loop.',
      'try/catch inside async functions catches awaited rejections — same syntax as synchronous error handling.',
      'If requests are independent, run them in parallel with Promise.all — never await in a loop over independent items.',
    ],
    callouts: [
      {
        type: 'warning',
        title: 'The Loop Trap',
        body: '`for (const id of ids) { await fetch(id); }` runs sequentially. Use `Promise.all(ids.map(id => fetch(id)))` for parallel execution.',
      },
      {
        type: 'tip',
        title: 'async Always Returns a Promise',
        body: '`async function f() { return 42; }` returns `Promise.resolve(42)`. You must `.then()` or `await` the result — you cannot unwrap a Promise synchronously.',
      },
    ],
    visualizations: [
      {
        id: 'JSNotebook',
        title: 'async/await — Sequential, Parallel, Error Handling',
        props: { lesson: LESSON_JS_CORE_3_3 },
      },
    ],
  },

  math: { prose: [], callouts: [], visualizations: [] },
  rigor: { prose: [], callouts: [], visualizations: [] },
  examples: [],
  challenges: [],
  mentalModel: [
    '`async` function = function that returns a Promise automatically.',
    '`await expr` = pause here, schedule a microtask, resume when the promise settles.',
    'Sequential awaits: each line waits for the previous. Parallel: Promise.all starts all simultaneously.',
    'try/catch in async functions catches rejected awaits — identical to sync error handling.',
  ],
  checkpoints: ['read-intuition'],
  quiz: [],
};
