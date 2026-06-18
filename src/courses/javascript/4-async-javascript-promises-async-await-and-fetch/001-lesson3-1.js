// J4 — Lesson 3-1: The Event Loop — How JavaScript Really Runs

const LESSON_JS_CORE_3_1 = {
  title: 'The Event Loop — Under the Hood',
  subtitle: 'Call stack, task queue, microtask queue — the real execution model.',
  sequential: true,

  cells: [

    {
      type: 'markdown',
      instruction: `## Part 1 — JavaScript Is Single-Threaded

Here is the thing that confuses everyone: JavaScript does only one thing at a time. There is exactly one thread. No parallelism, no true concurrency.

And yet — a JavaScript program can download a file, wait for a timer, listen for clicks, and animate the screen all at once without freezing.

How?

The answer is the **event loop** — a coordination mechanism built into the JavaScript runtime. Understanding it precisely means you will never be surprised by async code again.

The runtime has five components:

\`\`\`
┌─────────────────────────────────────────┐
│               Call Stack                │  ← where code executes (LIFO)
├─────────────────────────────────────────┤
│                  Heap                   │  ← where objects live
├─────────────────────────────────────────┤
│          Web APIs / Node APIs           │  ← setTimeout, fetch, DOM events
├─────────────────────────────────────────┤
│            Microtask Queue              │  ← Promise callbacks (HIGH priority)
├─────────────────────────────────────────┤
│          Macrotask Queue (Task Queue)   │  ← setTimeout, setInterval (LOW priority)
└─────────────────────────────────────────┘
\`\`\`

The **event loop** does one thing on every tick: if the call stack is empty, pull the next task from the microtask queue first, then from the macrotask queue.

The critical insight: **microtasks always drain completely before any macrotask runs.**`,
    },

    {
      type: 'js',
      instruction: `### Visualizing the Event Loop

Press Run and watch the event loop process tasks in real time. The green tasks are microtasks (Promise callbacks) — they all run before any macrotask (yellow, setTimeout) gets a turn.

Watch the order carefully. Predict before each step which queue drains next.`,
      html: `<div class="el-container">
  <div class="panel">
    <div class="panel-label">Call Stack</div>
    <div id="stack" class="stack-box"></div>
  </div>
  <div class="panel">
    <div class="panel-label">Microtask Queue (Promises)</div>
    <div id="micro" class="queue-box micro"></div>
  </div>
  <div class="panel">
    <div class="panel-label">Macrotask Queue (setTimeout)</div>
    <div id="macro" class="queue-box macro"></div>
  </div>
  <div class="log-panel">
    <div class="panel-label">Execution Log</div>
    <div id="log" class="log-box"></div>
  </div>
</div>`,
      css: `.el-container{height:100%;background:#050e1a;padding:12px;border-radius:12px;display:grid;grid-template-columns:1fr 1fr 1fr;grid-template-rows:auto 1fr;gap:8px;font-family:monospace;}
.panel{display:flex;flex-direction:column;gap:4px;}
.panel-label{color:var(--color-text-secondary, #475569);font-size:9px;letter-spacing:.08em;text-transform:uppercase;}
.stack-box{flex:1;background:#09111c;border:1px solid #1e293b;border-radius:8px;padding:6px;display:flex;flex-direction:column-reverse;gap:4px;min-height:100px;}
.queue-box{flex:1;background:#09111c;border:1px solid #1e293b;border-radius:8px;padding:6px;display:flex;flex-direction:column;gap:4px;min-height:100px;}
.frame{border-radius:6px;padding:6px 8px;font-size:11px;font-weight:600;transition:all .3s;}
.stack-frame{background:#0f2233;border:1px solid #38bdf8;color:#93c5fd;}
.micro .frame{background:#14222e;border:1px solid #34d399;color:#6ee7b7;}
.macro .frame{background:#1c1a0a;border:1px solid #fbbf24;color:#fcd34d;}
.log-panel{grid-column:1/-1;display:flex;flex-direction:column;gap:4px;}
.log-box{background:#09111c;border:1px solid #1e293b;border-radius:8px;padding:8px;font-size:11px;color:var(--color-text-secondary, #475569);line-height:1.7;max-height:120px;overflow-y:auto;}
.log-box .m{color:#6ee7b7;}.log-box .t{color:#fcd34d;}.log-box .s{color:#93c5fd;}`,
      startCode: `const stackEl = document.getElementById('stack');
const microEl = document.getElementById('micro');
const macroEl = document.getElementById('macro');
const logEl   = document.getElementById('log');

function addFrame(container, text, cls) {
  const d = document.createElement('div');
  d.className = 'frame ' + cls;
  d.textContent = text;
  container.appendChild(d);
  return d;
}
function log(msg, cls = 's') {
  const d = document.createElement('div');
  d.className = cls;
  d.textContent = '→ ' + msg;
  logEl.appendChild(d);
  logEl.scrollTop = logEl.scrollHeight;
}
function delay(ms) { return new Promise(r => setTimeout(r, ms)); }

async function simulate() {
  log('Script starts executing', 's');

  // Push synchronous frames
  addFrame(stackEl, 'main()', 'stack-frame');
  await delay(400);

  log('Scheduling setTimeout (goes to Web API)', 't');
  addFrame(macroEl, 'setTimeout cb', '');
  await delay(400);

  log('Scheduling Promise.resolve (microtask)', 'm');
  const mf = addFrame(microEl, 'Promise.then cb', '');
  await delay(600);

  log('Synchronous code done — stack pops', 's');
  stackEl.innerHTML = '';
  await delay(500);

  log('EVENT LOOP: microtask queue drains FIRST', 'm');
  mf.style.background = '#064e3b';
  await delay(400);
  microEl.innerHTML = '';
  log('Microtask ran: Promise callback executed', 'm');
  await delay(600);

  log('EVENT LOOP: now macrotask queue gets a turn', 't');
  const tf = macroEl.querySelector('.frame');
  if (tf) tf.style.background = '#451a03';
  await delay(400);
  macroEl.innerHTML = '';
  log('Macrotask ran: setTimeout callback executed', 't');
  await delay(300);

  log('Queue empty — event loop idles', 's');
}

simulate();`,
      outputHeight: 340,
    },

    {
      type: 'markdown',
      instruction: `## Part 2 — Microtasks vs Macrotasks

This distinction is the source of almost every confusing async ordering bug.

**Macrotasks (Task Queue):**
- \`setTimeout(fn, 0)\`
- \`setInterval(fn, n)\`
- DOM events (click, input)
- I/O callbacks (Node.js)

**Microtasks (Microtask Queue):**
- \`Promise.then()\` / \`Promise.catch()\` / \`Promise.finally()\`
- \`queueMicrotask(fn)\`
- \`MutationObserver\` callbacks

**The rule**: after each macrotask, the engine drains the **entire** microtask queue before picking the next macrotask. If a microtask schedules another microtask, that also runs before any macrotask.

Watch what this produces:

\`\`\`js
console.log("1 — synchronous");

setTimeout(() => console.log("2 — macrotask"), 0);

Promise.resolve().then(() => console.log("3 — microtask"));

console.log("4 — synchronous");

// Output order:
// 1 — synchronous
// 4 — synchronous
// 3 — microtask      ← microtask runs before macrotask, even though setTimeout was scheduled first
// 2 — macrotask
\`\`\`

This surprises most people the first time. \`setTimeout(fn, 0)\` does NOT mean "run immediately after this line". It means "queue a macrotask". Anything in the microtask queue runs first.`,
    },

    {
      type: 'js',
      instruction: `### The Order Proof

Run this and see the actual execution order. Predict it before you press Run. If you get it right on the first try, you understand the event loop.`,
      startCode: `console.log("A — sync start");

setTimeout(() => console.log("B — setTimeout 0ms"), 0);

Promise.resolve()
  .then(() => {
    console.log("C — promise 1");
    return Promise.resolve();
  })
  .then(() => console.log("D — promise 2 (chained)"));

queueMicrotask(() => console.log("E — queueMicrotask"));

setTimeout(() => console.log("F — setTimeout 0ms (second)"), 0);

console.log("G — sync end");

// Predicted order before running: ?
// Actual order: A G C E D B F`,
      showDom: false,
      outputHeight: 200,
    },

    {
      type: 'markdown',
      instruction: `## Part 3 — The Danger Zone: Starving the Queue

Because microtasks drain completely before any macrotask runs, an infinite microtask loop will **freeze the browser** — no rendering, no user input, nothing. This is called **queue starvation**.

\`\`\`js
// This freezes the tab permanently — do NOT run this
function loop() {
  Promise.resolve().then(loop);
}
loop();
\`\`\`

The browser never gets to run a render frame because microtasks never stop.

Compare to \`setTimeout\`:
\`\`\`js
// This is fine — each iteration goes through a macrotask cycle
// allowing renders and user input between iterations
function loop() {
  setTimeout(loop, 0);
}
loop();
\`\`\`

**Practical consequence**: keep microtask chains short. Long promise chains are fine — each \`.then()\` is one microtask. What you want to avoid is creating new microtasks in a tight loop.

## Part 4 — Why This Matters for Your Code

Understanding the event loop answers questions that otherwise seem magical:

- **Why does my DOM update not appear until after a function finishes?** — The render step is a macrotask. It cannot run until your synchronous code (and all microtasks) finish.
- **Why does \`await\` not block other callbacks?** — \`await\` pauses the async function and gives up the call stack, allowing other code to run.
- **Why do my promises resolve "out of order"?** — Microtask vs macrotask priority.
- **Why does \`setTimeout(fn, 0)\` not mean instant?** — It queues a macrotask, which runs after all synchronous code and pending microtasks.`,
    },

    {
      type: 'js',
      instruction: `### Async Does Not Block — Proof

This cell starts a 1-second "async operation" (a timer) and then immediately starts synchronous work. The async work finishes while the synchronous counter runs. Press Run and watch both happen concurrently — but on one thread.`,
      html: `<div class="app">
  <div class="row"><span class="label">Async timer:</span><span id="timer" class="val">waiting…</span></div>
  <div class="row"><span class="label">Sync counter:</span><span id="counter" class="val">0</span></div>
  <div class="row"><span class="label">Status:</span><span id="status" class="val">running</span></div>
</div>`,
      css: `.app{height:100%;background:#09111c;padding:20px;border-radius:12px;display:flex;flex-direction:column;gap:14px;font-family:monospace;}
.row{display:flex;align-items:center;gap:12px;}
.label{color:var(--color-text-secondary, #475569);font-size:12px;width:120px;}
.val{color:#38bdf8;font-size:15px;font-weight:700;}`,
      startCode: `// Start a 1000ms async operation
setTimeout(() => {
  document.getElementById('timer').textContent = '✓ done (1000ms elapsed)';
  document.getElementById('timer').style.color = '#4ade80';
}, 1000);

// Meanwhile, synchronous counting loop runs without being blocked
let n = 0;
const interval = setInterval(() => {
  n++;
  document.getElementById('counter').textContent = n;
  if (n >= 20) {
    clearInterval(interval);
    document.getElementById('status').textContent = 'counter finished';
  }
}, 80);

console.log('Both started. Async and sync run side by side on one thread.');
console.log('The timer fires its callback via the macrotask queue when ready.');`,
      outputHeight: 200,
    },

    {
      type: 'markdown',
      instruction: `### Before the Challenges

The following challenges test whether you can predict event loop ordering without running the code.`,
    },

    {
      type: 'challenge',
      instruction: `### Challenge 1: Predict the Output

What order do these log in? Change the array \`prediction\` to contain the correct letters in execution order.

\`\`\`js
console.log('A');
setTimeout(() => console.log('B'), 0);
Promise.resolve().then(() => console.log('C'));
console.log('D');
\`\`\``,
      startCode: `// What will the output order be?
// Change the array to the correct order:
const prediction = ['?', '?', '?', '?'];

// Prove it:
console.log('A');
setTimeout(() => console.log('B'), 0);
Promise.resolve().then(() => console.log('C'));
console.log('D');`,
      solutionCode: `const prediction = ['A', 'D', 'C', 'B'];
console.log('A');
setTimeout(() => console.log('B'), 0);
Promise.resolve().then(() => console.log('C'));
console.log('D');`,
      check: (code) => {
        const m = code.match(/prediction\s*=\s*\[([^\]]+)\]/);
        if (!m) return false;
        const vals = m[1].replace(/['"]/g, '').split(',').map(s => s.trim());
        return vals.join('') === 'ADCB';
      },
      successMessage: 'Correct! Sync (A,D) → microtask (C) → macrotask (B). setTimeout 0ms always loses to Promise.then.',
      failMessage: 'Remember: sync code finishes first, then microtasks (Promise.then), then macrotasks (setTimeout).',
    },

    {
      type: 'challenge',
      instruction: `### Challenge 2: Two Promises, One Timer

Predict the order. Change the \`prediction\` array.

\`\`\`js
setTimeout(() => console.log('timer'), 0);
Promise.resolve()
  .then(() => { console.log('p1'); return Promise.resolve(); })
  .then(() => console.log('p2'));
console.log('sync');
\`\`\``,
      startCode: `const prediction = ['?', '?', '?', '?'];
// Expected output order stored in prediction

setTimeout(() => console.log('timer'), 0);
Promise.resolve()
  .then(() => { console.log('p1'); return Promise.resolve(); })
  .then(() => console.log('p2'));
console.log('sync');`,
      solutionCode: `const prediction = ['sync', 'p1', 'p2', 'timer'];
setTimeout(() => console.log('timer'), 0);
Promise.resolve()
  .then(() => { console.log('p1'); return Promise.resolve(); })
  .then(() => console.log('p2'));
console.log('sync');`,
      check: (code) => {
        const m = code.match(/prediction\s*=\s*\[([^\]]+)\]/);
        if (!m) return false;
        const vals = m[1].replace(/['"]/g, '').split(',').map(s => s.trim());
        return vals[0] === 'sync' && vals[1] === 'p1' && vals[2] === 'p2' && vals[3] === 'timer';
      },
      successMessage: 'Correct! The chained .then schedules a new microtask — but both microtasks run before the timer macrotask.',
      failMessage: 'Both promise .then callbacks run as microtasks, in chain order, before the macrotask timer fires.',
    },

  ],
};

export default {
  id: 'js-core-3-1-event-loop',
  slug: 'event-loop-under-the-hood',
  chapter: 'js3.1',
  order: 0,
  title: 'The Event Loop — Under the Hood',
  subtitle: 'Call stack, microtask queue, macrotask queue, and why order matters.',
  tags: ['javascript', 'event-loop', 'async', 'microtasks', 'macrotasks', 'concurrency'],

  hook: {
    question: 'JavaScript is single-threaded — so how does it do multiple things at once?',
    realWorldContext: 'Every async bug you will ever encounter — wrong order, missed updates, frozen UIs — traces back to the event loop. Understanding it precisely turns mysterious bugs into predictable, fixable problems.',
    previewVisualizationId: 'JSNotebook',
  },

  intuition: {
    prose: [
      'The call stack runs synchronous code. When it empties, the event loop checks queues.',
      'Microtasks (Promises) always drain completely before any macrotask (setTimeout) runs.',
      '`await` pauses an async function and releases the call stack — other code can run in that gap.',
    ],
    callouts: [
      {
        type: 'warning',
        title: 'setTimeout(fn, 0) Is Not Instant',
        body: 'It queues a macrotask. Promise.then() — a microtask — always runs first, even if scheduled after the setTimeout.',
      },
      {
        type: 'warning',
        title: 'Infinite Microtask Loop = Frozen Browser',
        body: 'If a microtask schedules another microtask indefinitely, the macrotask queue (and the renderer) never gets a turn. The page locks up.',
      },
    ],
    visualizations: [
      {
        id: 'JSNotebook',
        title: 'Event Loop — Stack, Microtasks, Macrotasks',
        props: { lesson: LESSON_JS_CORE_3_1 },
      },
    ],
  },

  math: { prose: [], callouts: [], visualizations: [] },
  rigor: { prose: [], callouts: [], visualizations: [] },
  examples: [],
  challenges: [],
  mentalModel: [
    'Single thread: one thing at a time. Async ≠ parallelism — it is queued deferred work.',
    'Event loop rule: drain entire microtask queue, then take one macrotask, repeat.',
    'Sync code → microtasks → render → macrotask → microtasks → render → ...',
    'Promise.then = microtask. setTimeout = macrotask. Microtasks always win priority.',
  ],
  checkpoints: ['read-intuition'],
  quiz: [],
};
