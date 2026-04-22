// J7 — Lesson 5-2: Lodash + Axios from CDN

const LESSON_JS_CORE_5_2 = {
  title: 'Lodash and Axios — Utility and HTTP Libraries',
  subtitle: 'Practical data manipulation with Lodash and cleaner HTTP requests with Axios.',
  sequential: true,

  cells: [

    {
      type: 'markdown',
      instruction: `## Part 1 — Lodash: A Utility Belt for JavaScript

**Lodash** (\`_\`) is a utility library providing over 200 functions for arrays, objects, strings, and functions. Modern JavaScript has absorbed many features Lodash pioneered, but Lodash still provides:

- Deep object operations (\`_.cloneDeep\`, \`_.merge\`, \`_.get\`)
- Powerful collection operations (\`_.groupBy\`, \`_.orderBy\`, \`_.chunk\`)
- Function utilities (\`_.debounce\`, \`_.throttle\`, \`_.memoize\`)
- Type checking (\`_.isArray\`, \`_.isObject\`, \`_.isEmpty\`)

\`\`\`html
<script src="https://cdn.jsdelivr.net/npm/lodash"></script>
<!-- _ is now available globally -->
\`\`\`

**Why use Lodash?**
- \`_.cloneDeep\` handles nested objects correctly — spread only does shallow copies
- \`_.debounce\` is the correct way to rate-limit event handlers
- \`_.groupBy\` turns a flat array into a grouped object in one line
- \`_.get(obj, 'a.b.c', default)\` safely reads nested paths without crashes

If you know the built-in array methods well (from our Arrays lesson), you will recognize what most Lodash functions do — Lodash just adds the cases the built-ins miss.`,
    },

    {
      type: 'js',
      instruction: `### Lodash: groupBy, orderBy, chunk, cloneDeep

The most useful operations for real data manipulation. Run this and compare the output to what you would need to write manually.`,
      html: `<div style="height:100%;background:#09111c;padding:14px;border-radius:12px;box-sizing:border-box;display:flex;flex-direction:column;gap:6px;font-family:monospace;overflow:auto;">
  <script src="https://cdn.jsdelivr.net/npm/lodash"></script>
  <div id="log" style="flex:1;font-size:11px;color:#93c5fd;line-height:1.9;white-space:pre-wrap;overflow:auto;"></div>
</div>`,
      css: `body{margin:0;padding:0;background:#09111c;height:100vh;}`,
      startCode: `const log = (label, val) => {
  const el = document.getElementById('log');
  el.textContent += label + ':\n' + JSON.stringify(val, null, 2) + '\n\n';
};

const employees = [
  { name: "Alice",   dept: "Engineering", salary: 95000, level: "senior" },
  { name: "Bob",     dept: "Marketing",   salary: 72000, level: "mid" },
  { name: "Carol",   dept: "Engineering", salary: 110000, level: "lead" },
  { name: "Dave",    dept: "Marketing",   salary: 68000, level: "junior" },
  { name: "Eve",     dept: "Engineering", salary: 88000, level: "mid" },
  { name: "Frank",   dept: "Design",      salary: 82000, level: "senior" },
];

// _.groupBy — group by any property
const byDept = _.groupBy(employees, 'dept');
log('groupBy dept (dept names only)', Object.keys(byDept));

// _.orderBy — sort by multiple fields, mixed directions
const ordered = _.orderBy(employees, ['dept', 'salary'], ['asc', 'desc']);
log('orderBy dept asc, salary desc', ordered.map(e => e.dept + ' / ' + e.name + ' / $' + e.salary));

// _.chunk — split array into groups of n
const chunks = _.chunk(employees.map(e => e.name), 2);
log('chunk names by 2', chunks);

// _.cloneDeep — true deep copy
const original = { settings: { theme: 'dark', nested: { val: 1 } } };
const copy = _.cloneDeep(original);
copy.settings.nested.val = 999;
log('cloneDeep: original.settings.nested.val (unchanged)', original.settings.nested.val);

console.log('Lodash version:', _.VERSION);`,
      outputHeight: 360,
    },

    {
      type: 'markdown',
      instruction: `## Part 2 — debounce and throttle

Two of Lodash's most practically important functions. Both limit how often a function runs — but for different reasons.

**debounce(fn, wait)** — only calls \`fn\` after \`wait\` ms of silence. Use for: search inputs, resize handlers, form validation.

\`\`\`js
const search = _.debounce(async (query) => {
  const results = await api.search(query);
  renderResults(results);
}, 300);

searchInput.addEventListener('input', (e) => search(e.target.value));
// If the user types 10 characters in 200ms, the API is called exactly once
// — 300ms after they stop typing
\`\`\`

**throttle(fn, wait)** — calls \`fn\` at most once per \`wait\` ms. Use for: scroll handlers, mouse move, live previews.

\`\`\`js
const onScroll = _.throttle(() => {
  updateNavbarStyle(window.scrollY);
}, 100);

window.addEventListener('scroll', onScroll);
// Even if scroll fires 60 times per second, updateNavbarStyle runs at most 10x/s
\`\`\`

**The real cost without them:**
- Typing in a search box without debounce → one API call per keystroke → potentially 10+ calls in a second
- Scroll handler without throttle → hundreds of calls per second → janky UI

Both are included in the browser's performance toolkit — learn them early and use them reflexively whenever connecting to a rapid-fire event.`,
    },

    {
      type: 'js',
      instruction: `### debounce vs throttle — Side by Side

Type in the first input to see debounce (only fires when you stop). Move the mouse over the second area to see throttle (fires at most every 200ms regardless of speed).`,
      html: `<div style="height:100%;background:#09111c;padding:14px;border-radius:12px;box-sizing:border-box;display:flex;flex-direction:column;gap:10px;font-family:monospace;">
  <script src="https://cdn.jsdelivr.net/npm/lodash"></script>
  <div style="color:#475569;font-size:10px;text-transform:uppercase;letter-spacing:.08em;">Debounce (fires 300ms after you stop typing)</div>
  <input id="searchInput" type="text" placeholder="Type something…"
    style="background:#111827;border:1px solid #334155;border-radius:8px;padding:10px;color:#e2e8f0;font-family:monospace;font-size:13px;outline:none;" />
  <div id="searchLog" style="background:#050e1a;border:1px solid #1e293b;border-radius:8px;padding:8px;font-size:12px;color:#4ade80;min-height:50px;"></div>
  <div style="color:#475569;font-size:10px;text-transform:uppercase;letter-spacing:.08em;">Throttle (fires at most every 200ms on mouse move)</div>
  <div id="throttleArea" style="flex:1;background:#111827;border:1px solid #334155;border-radius:8px;display:flex;align-items:center;justify-content:center;color:#64748b;font-size:12px;cursor:crosshair;">Move mouse here</div>
  <div id="throttleLog" style="background:#050e1a;border:1px solid #1e293b;border-radius:8px;padding:8px;font-size:12px;color:#38bdf8;"></div>
</div>`,
      css: `body{margin:0;padding:0;background:#09111c;height:100vh;}`,
      startCode: `let rawInputCount = 0;
let debouncedCount = 0;
let rawMoveCount = 0;
let throttledCount = 0;

// Debounce — only fires 300ms after the last keystroke
const debouncedSearch = _.debounce((query) => {
  debouncedCount++;
  document.getElementById('searchLog').textContent =
    'Raw keystrokes: ' + rawInputCount + '  |  Debounced API calls: ' + debouncedCount +
    '\nLast query: "' + query + '"';
  console.log('debounced search:', query);
}, 300);

document.getElementById('searchInput').addEventListener('input', (e) => {
  rawInputCount++;
  debouncedSearch(e.target.value);
});

// Throttle — fires at most every 200ms regardless of how fast the mouse moves
const throttledMove = _.throttle((x, y) => {
  throttledCount++;
  document.getElementById('throttleLog').textContent =
    'Raw mousemove events: ' + rawMoveCount + '  |  Throttled handler calls: ' + throttledCount +
    '\nLast pos: (' + x + ', ' + y + ')';
}, 200);

document.getElementById('throttleArea').addEventListener('mousemove', (e) => {
  rawMoveCount++;
  throttledMove(e.offsetX, e.offsetY);
});`,
      outputHeight: 360,
    },

    {
      type: 'markdown',
      instruction: `## Part 3 — Axios: HTTP Requests Done Right

**Axios** is an HTTP client library that improves on raw \`fetch\` in several ways:

| Feature | fetch | Axios |
|---|---|---|
| Auto JSON parse | No (need \`.json()\`) | Yes — response.data is already parsed |
| Throw on 4xx/5xx | No (check \`res.ok\`) | Yes — rejects automatically |
| Request timeout | No built-in | Yes — \`timeout: 5000\` |
| Request interceptors | No | Yes — add auth headers globally |
| Response interceptors | No | Yes — handle errors globally |
| Progress events | No | Yes — upload/download progress |
| Cancel requests | AbortController | Built-in via CancelToken |

\`\`\`html
<script src="https://cdn.jsdelivr.net/npm/axios/dist/axios.min.js"></script>
\`\`\`

**Basic usage:**
\`\`\`js
// GET
const { data } = await axios.get('https://api.example.com/users');
// data is already parsed — no .json() call needed

// POST
const { data: created } = await axios.post('/users', { name: 'Alice' });
// Content-Type: application/json is set automatically

// With config
const { data } = await axios.get('/search', {
  params: { q: 'javascript', limit: 10 },   // appended as ?q=javascript&limit=10
  timeout: 5000,
  headers: { Authorization: 'Bearer ' + token },
});
\`\`\``,
    },

    {
      type: 'js',
      instruction: `### Axios: Cleaner API Calls

Compare this to the fetch version — no manual \`.json()\`, no \`response.ok\` check, automatic JSON body for POST. The same JSONPlaceholder API, much less boilerplate.`,
      html: `<div style="height:100%;background:#09111c;padding:14px;border-radius:12px;box-sizing:border-box;display:flex;flex-direction:column;gap:10px;font-family:monospace;">
  <script src="https://cdn.jsdelivr.net/npm/axios/dist/axios.min.js"></script>
  <div style="display:flex;gap:8px;flex-wrap:wrap;">
    <button id="getBtn"    style="flex:1;background:#1e2a3f;border:1px solid #334155;color:#94a3b8;padding:10px;border-radius:8px;cursor:pointer;font-size:12px;">GET /posts/1</button>
    <button id="postBtn"   style="flex:1;background:#1e2a3f;border:1px solid #334155;color:#94a3b8;padding:10px;border-radius:8px;cursor:pointer;font-size:12px;">POST /posts</button>
    <button id="errorBtn"  style="flex:1;background:#1e2a3f;border:1px solid #334155;color:#94a3b8;padding:10px;border-radius:8px;cursor:pointer;font-size:12px;">GET 404</button>
  </div>
  <pre id="output" style="flex:1;background:#050e1a;border:1px solid #1e293b;border-radius:8px;padding:12px;color:#4ade80;font-size:11px;overflow:auto;white-space:pre-wrap;margin:0;"></pre>
</div>`,
      css: `body{margin:0;padding:0;background:#09111c;height:100vh;}`,
      startCode: `const BASE = 'https://jsonplaceholder.typicode.com';
const out = document.getElementById('output');
function show(data, label = '') {
  out.textContent = (label ? label + '\n\n' : '') + JSON.stringify(data, null, 2);
}

document.getElementById('getBtn').onclick = async () => {
  out.textContent = 'Loading…';
  try {
    const { data } = await axios.get(BASE + '/posts/1');
    // data is already parsed — no await res.json() needed
    show(data, 'GET /posts/1 — data is pre-parsed:');
    console.log('axios GET status:', 200, 'data type:', typeof data);
  } catch(e) {
    show({ error: e.message });
  }
};

document.getElementById('postBtn').onclick = async () => {
  out.textContent = 'Posting…';
  try {
    const { data } = await axios.post(BASE + '/posts', {
      title: 'My Post',
      body: 'Created with Axios',
      userId: 1,
    });
    // Axios automatically sets Content-Type: application/json
    show(data, 'POST /posts — Axios auto-sets Content-Type:');
    console.log('Created:', data.id);
  } catch(e) {
    show({ error: e.message });
  }
};

document.getElementById('errorBtn').onclick = async () => {
  out.textContent = 'Fetching nonexistent…';
  try {
    await axios.get(BASE + '/posts/99999999');
  } catch(e) {
    // Axios THROWS on 4xx/5xx — unlike fetch
    show({
      message: e.message,
      status: e.response?.status,
      note: 'Axios threw automatically on 404 — no manual response.ok check needed'
    }, 'GET 404 — Axios throws, fetch does not:');
  }
};`,
      outputHeight: 360,
    },

    {
      type: 'markdown',
      instruction: `## Part 4 — Axios Interceptors

Interceptors let you add behavior to every request or response without repeating yourself.

\`\`\`js
// Create a custom instance for your API
const api = axios.create({
  baseURL: 'https://api.yourapp.com',
  timeout: 10000,
});

// Request interceptor — add auth header to every request
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = 'Bearer ' + token;
  return config;
});

// Response interceptor — handle 401 globally
api.interceptors.response.use(
  response => response,           // pass through on success
  error => {
    if (error.response?.status === 401) {
      logout();                   // token expired — log out everywhere
    }
    return Promise.reject(error); // still propagate the error
  }
);

// Every call through \`api\` gets auth headers and 401 handling automatically
const { data } = await api.get('/profile');
const { data: posts } = await api.get('/posts');
\`\`\`

This is the production pattern: create one Axios instance per backend, attach interceptors, and import it throughout your app. Never call raw \`fetch\` or \`axios\` directly in component code.`,
    },

    {
      type: 'challenge',
      instruction: `### Challenge: Lodash groupBy + Chart.js Visualization

Using **both** Lodash and Chart.js (already in the HTML):

1. Fetch todos from \`'https://jsonplaceholder.typicode.com/todos'\`
2. Use \`_.groupBy(todos, 'userId')\` to group them
3. For each user, calculate the **percentage** of completed todos
4. Render a horizontal bar chart showing completion % per user

Each bar should show a userId label and its completion percentage.`,
      html: `<div style="height:100%;background:#09111c;padding:14px;border-radius:12px;box-sizing:border-box;display:flex;flex-direction:column;gap:8px;">
  <script src="https://cdn.jsdelivr.net/npm/lodash"></script>
  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
  <div id="status" style="color:#64748b;font-family:monospace;font-size:12px;">Loading…</div>
  <canvas id="completionChart" style="flex:1;"></canvas>
</div>`,
      css: `body{margin:0;padding:0;background:#09111c;height:100vh;}`,
      startCode: `async function buildCompletionChart() {
  // 1. fetch todos
  // 2. _.groupBy by userId
  // 3. calculate completion % per user
  // 4. render horizontal bar chart
}

buildCompletionChart();`,
      solutionCode: `async function buildCompletionChart() {
  const todos = await fetch('https://jsonplaceholder.typicode.com/todos').then(r => r.json());
  const byUser = _.groupBy(todos, 'userId');
  const labels = Object.keys(byUser).map(id => 'User ' + id);
  const data   = Object.values(byUser).map(group => {
    const pct = (group.filter(t => t.completed).length / group.length) * 100;
    return Math.round(pct);
  });
  document.getElementById('status').textContent = 'Loaded ' + todos.length + ' todos';
  new Chart(document.getElementById('completionChart'), {
    type: 'bar',
    data: { labels, datasets: [{ label: 'Completion %', data, backgroundColor: 'rgba(52,211,153,0.7)', borderRadius: 4 }] },
    options: { indexAxis: 'y', responsive: true, maintainAspectRatio: false, scales: { x: { min: 0, max: 100, ticks: { color: '#64748b' }, grid: { color: '#1e293b' } }, y: { ticks: { color: '#64748b' } } }, plugins: { legend: { labels: { color: '#94a3b8' } } } },
  });
}
buildCompletionChart();`,
      check: (code) =>
        /_.groupBy/.test(code) &&
        /fetch/.test(code) &&
        /new Chart/.test(code),
      successMessage: 'Correct! This is the real-world pattern: fetch → lodash transform → chart render.',
      failMessage: 'Use _.groupBy(todos, "userId"), calculate percentages for each group, then render with Chart.js.',
      outputHeight: 340,
    },

  ],
};

export default {
  id: 'js-core-5-2-lodash-axios',
  slug: 'lodash-and-axios-utility-and-http',
  chapter: 'js5.1',
  order: 1,
  title: 'Lodash and Axios — Utility and HTTP Libraries',
  subtitle: 'groupBy, debounce, cloneDeep, and cleaner HTTP requests with automatic JSON and error throwing.',
  tags: ['javascript', 'lodash', 'axios', 'cdn', 'http', 'debounce', 'groupby', 'deep-clone'],

  hook: {
    question: 'What libraries do professional JavaScript developers use every day?',
    realWorldContext: 'Lodash and Axios appear in the majority of production JavaScript codebases. Lodash solves the data manipulation problems that native methods miss. Axios solves the boilerplate problems that raw fetch leaves behind.',
    previewVisualizationId: 'JSNotebook',
  },

  intuition: {
    prose: [
      'Lodash fills the gaps: deep clone, group by, debounce, chunk — operations that native JS makes verbose.',
      'Axios improves on fetch: auto JSON parsing, throws on 4xx/5xx, request interceptors for auth.',
      'Debounce: fires after silence. Throttle: fires at most every N ms. Both are essential for performance.',
    ],
    callouts: [
      {
        type: 'tip',
        title: 'When to Use Lodash',
        body: 'Use it for cloneDeep (spread is shallow), groupBy (map + reduce is verbose), and debounce/throttle (hard to implement correctly from scratch). Skip it for things native JS does well — map, filter, reduce.',
      },
      {
        type: 'tip',
        title: 'Axios Instance Pattern',
        body: 'Never use the global `axios` in app code. Create an instance with `axios.create({ baseURL, timeout })` and attach interceptors. Import that instance everywhere.',
      },
    ],
    visualizations: [
      {
        id: 'JSNotebook',
        title: 'Lodash + Axios — groupBy, debounce, interceptors',
        props: { lesson: LESSON_JS_CORE_5_2 },
      },
    ],
  },

  math: { prose: [], callouts: [], visualizations: [] },
  rigor: { prose: [], callouts: [], visualizations: [] },
  examples: [],
  challenges: [],
  mentalModel: [
    '_.cloneDeep = truly independent copy of nested objects. _.groupBy = group flat array by key.',
    '_.debounce(fn, ms) = fn fires ms after last call. _.throttle(fn, ms) = fn fires at most every ms.',
    'Axios: auto-parses JSON, throws on 4xx/5xx, supports timeout and interceptors.',
    'Axios instance = configured axios with base URL and interceptors. Use this, not global axios.',
  ],
  checkpoints: ['read-intuition'],
  quiz: [],
};
