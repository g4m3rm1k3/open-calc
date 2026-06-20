// J13 — Lesson 6-2: Web Workers — True Parallelism in the Browser

const LESSON_JS_CORE_6_2 = {
  title: 'Web Workers — True Parallelism in the Browser',
  subtitle: 'Move heavy computation off the main thread so your UI never freezes.',
  sequential: true,

  cells: [

    {
      type: 'markdown',
      instruction: `## Part 1 — The Single-Threaded Problem

JavaScript runs on a **single thread** — the main thread. That thread also handles:
- Rendering (painting pixels to screen)
- Layout calculations
- User input (click, scroll, keyboard)

When your code runs, **all of that stops**. A loop that takes 500ms freezes the page for 500ms. The user sees a janky, unresponsive UI.

\`\`\`js
// This blocks EVERYTHING for ~1 second
function heavyCompute() {
  let total = 0;
  for (let i = 0; i < 1_000_000_000; i++) total += i;
  return total;
}
heavyCompute();  // page is frozen — no clicks, no scroll, no render
\`\`\`

**Web Workers** solve this by running code in a **separate OS thread**:
- Spawned from the main thread, lives until terminated
- Communicates via \`postMessage\` / \`onmessage\` (message passing, like Go channels or Erlang actors)
- Has its own separate global scope — no access to \`document\`, \`window\`, or the DOM
- Can use \`fetch\`, \`indexedDB\`, \`crypto\`, \`setTimeout\`, and \`importScripts\`

**In C/C++**, this is like spawning a \`pthread\` and communicating through a message queue — but without the shared memory footprint and without the data race risk (workers share nothing by default).`,
    },

    {
      type: 'markdown',
      instruction: `## Part 2 — The Worker API

**Creating a worker** (normally you'd pass a separate .js file URL):
\`\`\`js
const worker = new Worker('./worker.js');
\`\`\`

**Sending a message to the worker:**
\`\`\`js
worker.postMessage({ type: 'compute', data: largeArray });
\`\`\`

**Receiving from the worker (main thread):**
\`\`\`js
worker.onmessage = (event) => {
  console.log('Result:', event.data);
};
worker.onerror = (err) => {
  console.error('Worker error:', err.message);
};
\`\`\`

**Inside worker.js:**
\`\`\`js
self.onmessage = (event) => {
  const { type, data } = event.data;
  if (type === 'compute') {
    const result = heavyCompute(data);
    self.postMessage({ result });  // send back to main thread
  }
};
\`\`\`

**Terminating:**
\`\`\`js
worker.terminate();   // from main thread
self.close();         // from inside the worker
\`\`\`

**Inline workers** — you can create a worker from a string using a Blob URL, which is useful when you cannot host a separate file:

\`\`\`js
const code = \`
  self.onmessage = ({ data }) => {
    const result = data.n * 2;
    self.postMessage(result);
  };
\`;
const blob = new Blob([code], { type: 'application/javascript' });
const worker = new Worker(URL.createObjectURL(blob));
\`\`\``,
    },

    {
      type: 'js',
      instruction: `### Blocking vs Non-Blocking: The UI Freeze Demo

Watch what happens when heavy computation runs on the main thread vs a worker. Click "Block Main Thread" and try to interact with the counter — you'll see the freeze. Then click "Use Worker" to see the difference.`,
      html: `<div style="background:#09111c;padding:16px;border-radius:12px;font-family:monospace;font-size:13px;display:flex;flex-direction:column;gap:12px;">
  <div style="display:flex;gap:10px;align-items:center;">
    <div style="color:var(--color-text-secondary, #475569);font-size:11px;">Interaction test:</div>
    <button id="counter" style="background:#1e2a3f;border:1px solid #334155;color:#94a3b8;padding:6px 14px;border-radius:6px;cursor:pointer;font-family:monospace;font-size:12px;">Clicks: 0</button>
  </div>
  <div style="display:flex;gap:8px;">
    <button id="blockBtn" style="flex:1;background:#7f1d1d;border:none;color:#fca5a5;padding:8px;border-radius:6px;cursor:pointer;font-family:monospace;font-size:12px;">Block Main Thread</button>
    <button id="workerBtn" style="flex:1;background:#14532d;border:none;color:#86efac;padding:8px;border-radius:6px;cursor:pointer;font-family:monospace;font-size:12px;">Use Worker</button>
  </div>
  <div id="status" style="background:#0f172a;border-radius:8px;padding:12px;color:#38bdf8;font-size:12px;min-height:60px;white-space:pre-wrap;"></div>
</div>`,
      css: `body{margin:0;padding:0;background:#09111c;}`,
      startCode: `let clicks = 0;
const counterBtn = document.getElementById('counter');
const status = document.getElementById('status');

counterBtn.onclick = () => {
  clicks++;
  counterBtn.textContent = 'Clicks: ' + clicks;
};

// Simulate heavy work — sum 500 million iterations
function heavyWork(n) {
  let total = 0;
  for (let i = 0; i < n; i++) total += i;
  return total;
}

// BAD: runs on main thread, freezes UI
document.getElementById('blockBtn').onclick = () => {
  status.textContent = 'Computing on main thread... (try clicking the counter!)';
  // Give the browser one frame to render the status text before blocking
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      const t = performance.now();
      const result = heavyWork(500_000_000);
      const ms = (performance.now() - t).toFixed(0);
      status.textContent = 'Result: ' + result + '\nTime: ' + ms + 'ms (UI was frozen!)';
    });
  });
};

// GOOD: runs in a worker, main thread stays free
document.getElementById('workerBtn').onclick = () => {
  status.textContent = 'Worker computing... (try clicking the counter — it still works!)';

  const workerCode = \`
    self.onmessage = ({ data }) => {
      let total = 0;
      for (let i = 0; i < data.n; i++) total += i;
      self.postMessage({ result: total, ms: data.startTime });
    };
  \`;

  const blob = new Blob([workerCode], { type: 'application/javascript' });
  const worker = new Worker(URL.createObjectURL(blob));

  const startTime = performance.now();
  worker.postMessage({ n: 500_000_000, startTime });

  worker.onmessage = ({ data }) => {
    const ms = (performance.now() - startTime).toFixed(0);
    status.textContent = 'Result: ' + data.result + '\nTime: ' + ms + 'ms (UI stayed responsive!)';
    worker.terminate();
  };
};`,
      outputHeight: 280,
    },

    {
      type: 'js',
      instruction: `### Worker Pool — Processing Multiple Tasks in Parallel

For many tasks, spawn multiple workers and distribute the work. This is the parallel map pattern.`,
      html: `<div style="background:#09111c;padding:16px;border-radius:12px;font-family:monospace;font-size:12px;color:#94a3b8;display:flex;flex-direction:column;gap:10px;">
  <button id="runBtn" style="background:#3b82f6;border:none;color:#fff;padding:8px;border-radius:6px;cursor:pointer;font-family:monospace;font-size:12px;">Run Parallel + Serial</button>
  <div id="results" style="background:#0f172a;border-radius:8px;padding:12px;min-height:120px;white-space:pre-wrap;color:#38bdf8;font-size:12px;"></div>
</div>`,
      css: `body{margin:0;padding:0;background:#09111c;}`,
      startCode: `// Worker that checks if a number is prime
const primeWorkerCode = \`
  function isPrime(n) {
    if (n < 2) return false;
    if (n === 2) return true;
    if (n % 2 === 0) return false;
    for (let i = 3; i <= Math.sqrt(n); i += 2) {
      if (n % i === 0) return false;
    }
    return true;
  }
  self.onmessage = ({ data }) => {
    const primes = data.nums.filter(isPrime);
    self.postMessage({ primes, id: data.id });
  };
\`;

function makeWorker() {
  const blob = new Blob([primeWorkerCode], { type: 'application/javascript' });
  return new Worker(URL.createObjectURL(blob));
}

// Generate a big list of numbers to check
const NUMBERS = Array.from({ length: 100_000 }, (_, i) => i + 2);
const CHUNK_SIZE = 25_000;
const chunks = [
  NUMBERS.slice(0, CHUNK_SIZE),
  NUMBERS.slice(CHUNK_SIZE, CHUNK_SIZE * 2),
  NUMBERS.slice(CHUNK_SIZE * 2, CHUNK_SIZE * 3),
  NUMBERS.slice(CHUNK_SIZE * 3),
];

document.getElementById('runBtn').onclick = async () => {
  const out = document.getElementById('results');
  out.textContent = 'Running...\n';

  // PARALLEL: 4 workers, each gets a chunk
  const t1 = performance.now();
  const results = await Promise.all(
    chunks.map((nums, id) => new Promise(resolve => {
      const w = makeWorker();
      w.postMessage({ nums, id });
      w.onmessage = ({ data }) => { resolve(data.primes); w.terminate(); };
    }))
  );
  const parallelTime = (performance.now() - t1).toFixed(0);
  const allPrimes = results.flat();

  // SERIAL: same work on main thread for comparison
  function isPrime(n) {
    if (n < 2) return false;
    if (n === 2) return true;
    if (n % 2 === 0) return false;
    for (let i = 3; i <= Math.sqrt(n); i += 2) if (n % i === 0) return false;
    return true;
  }
  const t2 = performance.now();
  const serialPrimes = NUMBERS.filter(isPrime);
  const serialTime = (performance.now() - t2).toFixed(0);

  out.textContent =
    'Parallel (4 workers): ' + parallelTime + 'ms — ' + allPrimes.length + ' primes\n' +
    'Serial (main thread): ' + serialTime + 'ms — ' + serialPrimes.length + ' primes\n' +
    'Speedup: ~' + (serialTime / parallelTime).toFixed(1) + 'x';
};`,
      outputHeight: 260,
    },

    {
      type: 'markdown',
      instruction: `## Part 3 — Transferable Objects

By default \`postMessage\` **copies** the data (structured clone algorithm — like a deep JSON clone). For large binary data (images, audio buffers, typed arrays), copying is expensive.

**Transferable objects** transfer ownership instead of copying — zero copy, O(1) regardless of size:

\`\`\`js
const buffer = new ArrayBuffer(1024 * 1024 * 100);  // 100 MB

// COPY — expensive
worker.postMessage(buffer);                  // 100 MB copied

// TRANSFER — O(1) — main thread loses access
worker.postMessage(buffer, [buffer]);        // buffer is now in the worker
console.log(buffer.byteLength);             // 0 — detached, can't use it anymore
\`\`\`

Transferable types: \`ArrayBuffer\`, \`MessagePort\`, \`ImageBitmap\`, \`OffscreenCanvas\`

**SharedArrayBuffer** — shares memory between threads (unlike transferables, both threads can read/write simultaneously). Requires \`Atomics\` for safe coordination and specific HTTP headers (\`Cross-Origin-Opener-Policy\`, \`Cross-Origin-Embedder-Policy\`) to be enabled. Use this only when you truly need shared mutable state — it reintroduces data race risks.

## When to Use Workers

- Image processing / resizing
- CSV / JSON parsing of large files
- Cryptography (hashing, key generation)
- Physics simulation, pathfinding, game AI
- Compiling / transpiling code client-side
- Any loop that runs longer than ~16ms (one frame)`,
    },

    {
      type: 'challenge',
      instruction: `### Challenge: Offload a Sort

Using an inline Blob worker, sort the array \`[9,3,7,1,5,2,8,4,6,0]\` inside a worker and send the sorted result back to the main thread. Log the sorted array.

Expected output: \`[0,1,2,3,4,5,6,7,8,9]\``,
      startCode: `const data = [9, 3, 7, 1, 5, 2, 8, 4, 6, 0];

// Create an inline worker that:
// 1. Receives an array via postMessage
// 2. Sorts it
// 3. Posts the sorted array back

// When the worker responds, log the result and terminate the worker`,
      solutionCode: `const data = [9, 3, 7, 1, 5, 2, 8, 4, 6, 0];

const code = \`
  self.onmessage = ({ data }) => {
    const sorted = [...data].sort((a, b) => a - b);
    self.postMessage(sorted);
  };
\`;

const blob = new Blob([code], { type: 'application/javascript' });
const worker = new Worker(URL.createObjectURL(blob));

worker.onmessage = ({ data: sorted }) => {
  console.log(JSON.stringify(sorted));
  worker.terminate();
};

worker.postMessage(data);`,
      check: (code, logs) =>
        /Worker/.test(code) &&
        /Blob/.test(code) &&
        /postMessage/.test(code) &&
        logs[0] === '[0,1,2,3,4,5,6,7,8,9]',
      successMessage: 'Correct! For a tiny array this is overkill, but for a million-row dataset or a complex sort algorithm, a worker keeps the UI responsive.',
      failMessage: 'Create a Blob worker, send the array with postMessage, receive in onmessage, sort it, postMessage back. Log the result in the main thread onmessage handler.',
      outputHeight: 220,
    },

  ],
};

export default {
  id: 'js-core-6-2-web-workers',
  slug: 'web-workers-true-parallelism',
  chapter: 'js6.1',
  order: 1,
  title: 'Web Workers — True Parallelism in the Browser',
  subtitle: 'Run CPU-heavy code in a separate thread, communicate via messages, and never freeze the UI again.',
  tags: ['javascript', 'web-workers', 'parallelism', 'threads', 'performance', 'blob', 'postmessage'],

  hook: {
    question: 'What happens to your UI when JavaScript runs a 500ms loop?',
    realWorldContext: 'Image editors, spreadsheet apps, games, and data tools all process large datasets client-side. Web Workers are the only way to do that without freezing the browser — and they\'re built into every modern browser with no CDN required.',
    previewVisualizationId: 'JSNotebook',
  },

  intuition: {
    prose: [
      'JavaScript is single-threaded. Heavy compute on the main thread freezes the UI.',
      'new Worker(url) spawns a real OS thread. Workers have no DOM access.',
      'postMessage() sends data (copied). onmessage receives it. Both ends use the same API.',
      'Inline workers: create a Blob from a code string, pass its URL to new Worker().',
      'Transferable objects (ArrayBuffer) transfer ownership in O(1) — no copy.',
    ],
    callouts: [
      {
        type: 'tip',
        title: 'The 16ms Budget',
        body: 'At 60fps, each frame has ~16ms. Any synchronous JS that takes longer causes a dropped frame (jank). setTimeout and requestAnimationFrame break up work into smaller chunks — Workers run it in parallel without blocking the frame at all.',
      },
      {
        type: 'warning',
        title: 'Workers Are Heavyweight',
        body: 'Each Worker is a real OS thread with its own JS engine instance. Spawning a worker has overhead (~10–50ms). Reuse long-running workers or use a pool rather than creating one per task. For lightweight async work (setTimeout, fetch), the event loop is sufficient.',
      },
    ],
    visualizations: [
      {
        id: 'JSNotebook',
        title: 'Web Workers — True Parallelism in the Browser',
        props: { lesson: LESSON_JS_CORE_6_2 },
      },
    ],
  },

  math: { prose: [], callouts: [], visualizations: [] },
  rigor: { prose: [], callouts: [], visualizations: [] },
  examples: [],
  challenges: [],
  mentalModel: [
    'Main thread = UI + your JS. Block it and the page freezes.',
    'Worker = separate thread. new Worker(url). No DOM. Communicates via postMessage.',
    'Inline worker: Blob([codeString]) → URL.createObjectURL() → new Worker(url).',
    'postMessage copies data (structured clone). Pass [buffer] as 2nd arg to transfer instead.',
    'Terminate with worker.terminate() (main) or self.close() (inside worker).',
  ],
  checkpoints: ['read-intuition'],
  quiz: [
    {
      id: 'q1',
      type: 'choice',
      text: 'You run a heavy computation on the main thread. What happens to the UI while it runs?',
      options: [
        'The UI continues normally — the browser prioritises rendering',
        'The page freezes — the main thread handles both JS and rendering, so blocking JS blocks the UI',
        'The browser moves the computation to a background thread automatically',
      ],
      correct: 1,
    },
    {
      id: 'q2',
      type: 'choice',
      text: 'A Web Worker runs on a separate thread. Can it directly access and modify the DOM?',
      options: [
        'Yes — workers have full DOM access',
        'No — workers have no access to the DOM; they communicate with the main thread via postMessage',
        'Yes, but only to read DOM properties, not write them',
      ],
      correct: 1,
    },
    {
      id: 'q3',
      type: 'choice',
      text: 'By default, postMessage copies data to the worker. What is the alternative for large typed arrays?',
      options: [
        'Share a reference to the original object — workers share the same memory space',
        'Transfer ownership of the buffer by passing it in the second argument — the original becomes unusable, but no copy is made',
        'Use JSON.stringify to send — it avoids the copy overhead',
      ],
      correct: 1,
    },
    {
      id: 'q4',
      type: 'choice',
      text: 'How do you stop a running Web Worker from the main thread?',
      options: [
        'Call worker.cancel()',
        'Call worker.terminate() — it immediately stops the worker regardless of what it is doing',
        'Send a "stop" message via postMessage and the worker stops itself',
      ],
      correct: 1,
    },
  ],
};
