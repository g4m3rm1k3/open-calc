// J4 — Lesson 3-4: The Fetch API — Talking to Servers

const LESSON_JS_CORE_3_4 = {
  title: 'Fetch — Talking to Servers',
  subtitle: 'HTTP basics, GET and POST, JSON, headers, and handling real API responses.',
  sequential: true,

  cells: [

    {
      type: 'markdown',
      instruction: `## Part 1 — How HTTP Works

Before touching any code, understand what is actually happening over the network. When your browser (or Node.js) talks to a server, it speaks **HTTP** — a text-based request/response protocol.

**A request has:**
- **Method**: GET (read), POST (create), PUT/PATCH (update), DELETE (delete)
- **URL**: where the request goes
- **Headers**: metadata — content type, auth tokens, cache control
- **Body**: data sent to the server (for POST/PUT)

**A response has:**
- **Status code**: 200 OK, 201 Created, 400 Bad Request, 401 Unauthorized, 404 Not Found, 500 Server Error
- **Headers**: content type, caching info
- **Body**: the actual data (usually JSON for APIs)

**What the browser does without any JavaScript:**
Every link click is a GET request. Every form submit is a GET or POST. The response replaces the current page.

**What JavaScript + fetch does:**
Make HTTP requests in the background, without navigating away from the page, and handle the response yourself.

\`\`\`
fetch(url)
  ↓
Network request (background — does not block JS)
  ↓
Server responds with status + headers + body
  ↓
Promise<Response> resolves
  ↓
response.json() reads the body as JSON
  ↓
Promise<data> resolves
  ↓
Your code runs with the data
\`\`\``,
    },

    {
      type: 'markdown',
      instruction: `## Part 2 — Basic GET: Fetching JSON

\`\`\`js
const response = await fetch('https://api.example.com/users');

// response.ok is true for 2xx status codes
if (!response.ok) {
  throw new Error('HTTP error: ' + response.status);
}

const users = await response.json();   // parse body as JSON
\`\`\`

**Critical distinction**: \`fetch\` only rejects its Promise on **network failure** (no connection, DNS failure, CORS block). A 404 or 500 response still *fulfills* the fetch promise — it just has \`response.ok === false\`.

This trips everyone up: you must manually check \`response.ok\`.

\`\`\`js
// Wrong — this will not catch a 404
const data = await fetch(url).then(r => r.json());

// Right — check ok before parsing
const res  = await fetch(url);
if (!res.ok) throw new Error('HTTP ' + res.status);
const data = await res.json();
\`\`\`

We will use [JSONPlaceholder](https://jsonplaceholder.typicode.com) — a free fake REST API for practice. It supports GET, POST, PUT, DELETE with simulated responses.`,
    },

    {
      type: 'js',
      instruction: `### Your First Real API Call

This fetches a real endpoint and displays the data. Open the console to see the raw response object properties. Try changing the URL to \`/todos/5\` or \`/users/1\`.`,
      html: `<div class="app">
  <div class="url-bar">
    <span class="method">GET</span>
    <span id="url-display" class="url">https://jsonplaceholder.typicode.com/todos/1</span>
  </div>
  <div id="status-bar" class="status-bar">—</div>
  <pre id="result" class="result">Press Run</pre>
  <button id="fetchBtn">Fetch</button>
</div>`,
      css: `.app{height:100%;background:#09111c;padding:14px;border-radius:12px;display:flex;flex-direction:column;gap:10px;font-family:monospace;}
.url-bar{display:flex;align-items:center;gap:8px;background:#111827;border:1px solid #334155;border-radius:8px;padding:8px 12px;}
.method{color:#34d399;font-weight:800;font-size:11px;letter-spacing:.08em;}
.url{color:#93c5fd;font-size:11px;word-break:break-all;}
.status-bar{background:#111827;border:1px solid #1e293b;border-radius:6px;padding:6px 10px;font-size:12px;color:var(--color-text-secondary, #475569);}
.result{flex:1;background:#050e1a;border:1px solid #1e293b;border-radius:8px;padding:10px;color:#4ade80;font-size:12px;margin:0;overflow:auto;white-space:pre-wrap;}
button{background:#1e3a5f;border:1px solid #38bdf8;color:#93c5fd;padding:10px;border-radius:8px;cursor:pointer;font-family:monospace;font-size:12px;}`,
      startCode: `const URL = 'https://jsonplaceholder.typicode.com/todos/1';

document.getElementById('fetchBtn').onclick = async () => {
  const statusEl = document.getElementById('status-bar');
  const resultEl = document.getElementById('result');

  statusEl.textContent = '⏳ Fetching…';
  resultEl.textContent = '';

  try {
    const response = await fetch(URL);

    // Log response metadata
    console.log('Status:', response.status, response.statusText);
    console.log('OK:', response.ok);
    console.log('Content-Type:', response.headers.get('content-type'));

    if (!response.ok) {
      throw new Error('HTTP error: ' + response.status);
    }

    const data = await response.json();

    statusEl.textContent = '✓ ' + response.status + ' OK — ' + response.headers.get('content-type');
    statusEl.style.color = '#4ade80';
    resultEl.textContent = JSON.stringify(data, null, 2);
    console.log('Data:', data);

  } catch (error) {
    statusEl.textContent = '✗ Error: ' + error.message;
    statusEl.style.color = '#f87171';
    resultEl.textContent = error.message;
    console.log('Failed:', error.message);
  }
};`,
      outputHeight: 320,
    },

    {
      type: 'markdown',
      instruction: `## Part 3 — POST: Sending Data

GET retrieves data. POST sends data to the server to create something.

\`\`\`js
const response = await fetch('https://api.example.com/posts', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',   // tell server what you're sending
  },
  body: JSON.stringify({                  // serialize your object
    title: 'Hello',
    body:  'World',
    userId: 1,
  }),
});

const created = await response.json();
console.log('Created with id:', created.id);
\`\`\`

**Key points:**
- Set \`Content-Type: application/json\` so the server knows how to parse the body
- Use \`JSON.stringify()\` to convert your object to a JSON string — fetch cannot send objects directly
- The server usually returns the created resource with an assigned ID (201 Created)

**PUT vs PATCH:**
- \`PUT\` replaces the entire resource
- \`PATCH\` updates only specified fields
- Both use the same structure as POST`,
    },

    {
      type: 'js',
      instruction: `### POST, PUT, DELETE — Full CRUD

Use the form to build a request. JSONPlaceholder simulates all operations — resources are not actually stored, but the responses look real.`,
      html: `<div class="app">
  <div class="form">
    <select id="method">
      <option value="GET">GET /posts/1</option>
      <option value="POST">POST /posts</option>
      <option value="PUT">PUT /posts/1</option>
      <option value="DELETE">DELETE /posts/1</option>
    </select>
    <button id="sendBtn">Send Request</button>
  </div>
  <div id="request-display" class="block">Request will appear here</div>
  <div id="response-display" class="block green">Response will appear here</div>
</div>`,
      css: `.app{height:100%;background:#09111c;padding:14px;border-radius:12px;display:flex;flex-direction:column;gap:10px;font-family:monospace;}
.form{display:flex;gap:8px;}
select{flex:1;background:#111827;border:1px solid #334155;border-radius:8px;padding:10px;color:#e2e8f0;font-family:monospace;font-size:12px;}
button{background:#1e3a5f;border:1px solid #38bdf8;color:#93c5fd;padding:10px 16px;border-radius:8px;cursor:pointer;font-size:12px;font-family:monospace;}
.block{flex:1;background:#050e1a;border:1px solid #1e293b;border-radius:8px;padding:10px;font-size:11px;color:var(--color-text-secondary, #475569);white-space:pre-wrap;overflow:auto;}
.green{color:#4ade80;}`,
      startCode: `const BASE = 'https://jsonplaceholder.typicode.com';

const configs = {
  GET: {
    url: BASE + '/posts/1',
    options: {},
  },
  POST: {
    url: BASE + '/posts',
    options: {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'New Post', body: 'Content here', userId: 1 }),
    },
  },
  PUT: {
    url: BASE + '/posts/1',
    options: {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: 1, title: 'Updated Post', body: 'New content', userId: 1 }),
    },
  },
  DELETE: {
    url: BASE + '/posts/1',
    options: { method: 'DELETE' },
  },
};

document.getElementById('sendBtn').onclick = async () => {
  const method = document.getElementById('method').value;
  const { url, options } = configs[method];

  document.getElementById('request-display').textContent =
    method + ' ' + url + '\n' +
    (options.headers ? 'Headers: ' + JSON.stringify(options.headers) + '\n' : '') +
    (options.body    ? 'Body: '    + options.body : '');

  document.getElementById('response-display').textContent = 'loading…';

  try {
    const res  = await fetch(url, options);
    const text = await res.text();
    const data = text ? JSON.parse(text) : '(empty body)';

    document.getElementById('response-display').textContent =
      'Status: ' + res.status + ' ' + res.statusText + '\n\n' +
      JSON.stringify(data, null, 2);
    console.log(method, res.status, data);
  } catch (e) {
    document.getElementById('response-display').textContent = 'Error: ' + e.message;
  }
};`,
      outputHeight: 360,
    },

    {
      type: 'markdown',
      instruction: `## Part 4 — Headers and Authentication

Real APIs require you to identify yourself. The most common mechanism is a **Bearer token** in the \`Authorization\` header:

\`\`\`js
const response = await fetch('https://api.example.com/protected', {
  headers: {
    'Authorization': 'Bearer ' + userToken,
    'Content-Type': 'application/json',
  },
});
\`\`\`

**Common headers you will set:**
| Header | Purpose |
|---|---|
| \`Content-Type\` | What format you're sending (\`application/json\`) |
| \`Authorization\` | Auth token or API key |
| \`Accept\` | What format you want back |
| \`X-API-Key\` | API key (varies by service) |

**CORS — Cross-Origin Resource Sharing:**

Browsers block JavaScript from fetching URLs on a different domain unless the server explicitly allows it with CORS headers (\`Access-Control-Allow-Origin\`). You will hit this when:
- Your frontend is on localhost:3000 and your API is on localhost:8000
- You try to fetch an API that does not have CORS enabled for your domain

The browser adds an \`Origin\` header to every cross-origin request. The server must respond with \`Access-Control-Allow-Origin: *\` (or your specific origin) or the browser blocks the response.

**CORS is a browser security feature** — it does not exist in Node.js or Postman. If a fetch works in Postman but not in the browser, CORS is usually why.

## Part 5 — A Real API Client Module

In real projects, you do not call \`fetch\` directly everywhere — you write a thin API layer:

\`\`\`js
const api = {
  baseUrl: 'https://api.example.com',

  async get(path) {
    const res = await fetch(this.baseUrl + path, {
      headers: { 'Authorization': 'Bearer ' + getToken() },
    });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    return res.json();
  },

  async post(path, body) {
    const res = await fetch(this.baseUrl + path, {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + getToken(),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    return res.json();
  },
};

// Usage:
const users = await api.get('/users');
const newUser = await api.post('/users', { name: 'Alice' });
\`\`\`

This pattern — a single object that wraps fetch and handles auth, base URL, and error checking — is the foundation of every API client library including Axios.`,
    },

    {
      type: 'js',
      instruction: `### Building a Mini API Client

This builds a small API client and uses it to fetch, display, and simulate creating a post. This is the architecture you will use in real applications.`,
      html: `<div class="app">
  <div class="toolbar">
    <button id="listBtn">List Posts</button>
    <button id="getBtn">Get Post #5</button>
    <button id="createBtn">Create Post</button>
  </div>
  <div id="output" class="output">Click a button to make a request.</div>
</div>`,
      css: `.app{height:100%;background:#09111c;padding:14px;border-radius:12px;display:flex;flex-direction:column;gap:10px;font-family:monospace;}
.toolbar{display:flex;gap:8px;flex-wrap:wrap;}
button{flex:1;background:#1e2a3f;border:1px solid #334155;color:#94a3b8;padding:10px;border-radius:8px;cursor:pointer;font-size:12px;font-family:monospace;}
.output{flex:1;background:#050e1a;border:1px solid #1e293b;border-radius:8px;padding:12px;color:#93c5fd;font-size:11px;overflow:auto;white-space:pre-wrap;}`,
      startCode: `// ─── Minimal API Client ───────────────────────────────────────────────
const api = {
  base: 'https://jsonplaceholder.typicode.com',

  async get(path) {
    const res = await fetch(this.base + path);
    if (!res.ok) throw new Error('HTTP ' + res.status);
    return res.json();
  },

  async post(path, body) {
    const res = await fetch(this.base + path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    return res.json();
  },
};

// ─── UI ───────────────────────────────────────────────────────────────
const out = document.getElementById('output');
function show(data) { out.textContent = JSON.stringify(data, null, 2); }
function showErr(e) { out.textContent = '✗ Error: ' + e.message; }
function loading() { out.textContent = 'Loading…'; }

document.getElementById('listBtn').onclick = async () => {
  loading();
  try {
    const posts = await api.get('/posts?_limit=5');
    show(posts.map(p => ({ id: p.id, title: p.title })));
    console.log('Fetched', posts.length, 'posts');
  } catch(e) { showErr(e); }
};

document.getElementById('getBtn').onclick = async () => {
  loading();
  try {
    const post = await api.get('/posts/5');
    show(post);
    console.log('Post:', post.title);
  } catch(e) { showErr(e); }
};

document.getElementById('createBtn').onclick = async () => {
  loading();
  try {
    const created = await api.post('/posts', {
      title: 'My New Post',
      body: 'Created via fetch API',
      userId: 1,
    });
    show(created);
    console.log('Created with id:', created.id);
  } catch(e) { showErr(e); }
};`,
      outputHeight: 360,
    },

    {
      type: 'markdown',
      instruction: `### Before the Challenges`,
    },

    {
      type: 'challenge',
      instruction: `### Challenge 1: Safe Fetch

Write a function \`safeFetch(url)\` that:
1. Fetches the URL
2. Throws if \`response.ok\` is false (include the status code in the error message)
3. Returns the parsed JSON

Then call it with \`'https://jsonplaceholder.typicode.com/users/3'\` and log \`user.name\`.`,
      startCode: `async function safeFetch(url) {
  // fetch, check ok, parse json, return
}

safeFetch('https://jsonplaceholder.typicode.com/users/3')
  .then(user => console.log("name:", user.name))
  .catch(err => console.log("error:", err.message));`,
      solutionCode: `async function safeFetch(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error('HTTP ' + res.status);
  return res.json();
}
safeFetch('https://jsonplaceholder.typicode.com/users/3')
  .then(user => console.log("name:", user.name))
  .catch(err => console.log("error:", err.message));`,
      check: (code) =>
        /response\.ok|res\.ok/.test(code) &&
        /throw/.test(code) &&
        /\.json\(\)/.test(code),
      successMessage: 'Correct! Always check response.ok — fetch does not throw on 4xx/5xx responses.',
      failMessage: 'Check response.ok and throw an error if false. Then return response.json().',
    },

    {
      type: 'challenge',
      instruction: `### Challenge 2: POST and Read the Response

Send a POST request to \`'https://jsonplaceholder.typicode.com/posts'\` with body \`{ title: "Test", userId: 99 }\`. Log the \`id\` that the server assigns to the new post.

Expected log: \`created id: 101\` (JSONPlaceholder always returns id 101 for new posts)`,
      startCode: `async function createPost(data) {
  // POST to /posts with JSON body
  // return the created post object
}

createPost({ title: "Test", userId: 99 })
  .then(post => console.log("created id:", post.id))
  .catch(err => console.log("error:", err.message));`,
      solutionCode: `async function createPost(data) {
  const res = await fetch('https://jsonplaceholder.typicode.com/posts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('HTTP ' + res.status);
  return res.json();
}
createPost({ title: "Test", userId: 99 })
  .then(post => console.log("created id:", post.id))
  .catch(err => console.log("error:", err.message));`,
      check: (code) =>
        /method\s*:\s*['"]POST['"]/.test(code) &&
        /JSON\.stringify/.test(code) &&
        /Content-Type/.test(code),
      successMessage: 'Correct! POST requires method, Content-Type header, and a JSON.stringify\'d body.',
      failMessage: 'Set method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data).',
    },

  ],
};

export default {
  id: 'js-core-3-4-fetch',
  slug: 'fetch-talking-to-servers',
  chapter: 'js3.1',
  order: 3,
  title: 'Fetch — Talking to Servers',
  subtitle: 'HTTP, GET, POST, headers, CORS, and building a real API client.',
  tags: ['javascript', 'fetch', 'http', 'api', 'json', 'rest', 'cors', 'async'],

  hook: {
    question: 'How does your JavaScript code talk to a server?',
    realWorldContext: 'Every web application — login, search, shopping cart, social feed — works by JavaScript sending HTTP requests and handling the responses. Fetch is the built-in browser API that makes this possible.',
    previewVisualizationId: 'JSNotebook',
  },

  intuition: {
    prose: [
      'fetch() only rejects on network failure — a 404 or 500 still resolves. Always check response.ok.',
      'POST requires method, Content-Type: application/json header, and JSON.stringify\'d body.',
      'CORS is a browser security feature — the server must allow your origin or the browser blocks the response.',
    ],
    callouts: [
      {
        type: 'warning',
        title: '404 Does Not Throw',
        body: 'fetch("https://example.com/notfound") resolves (not rejects) even if the server returns 404. Check response.ok and throw manually if false.',
      },
      {
        type: 'warning',
        title: 'JSON.stringify is Required',
        body: 'fetch cannot send a plain object as a body. You must JSON.stringify() it and set Content-Type: application/json.',
      },
    ],
    visualizations: [
      {
        id: 'JSNotebook',
        title: 'Fetch — GET, POST, PUT, DELETE, API client',
        props: { lesson: LESSON_JS_CORE_3_4 },
      },
    ],
  },

  math: { prose: [], callouts: [], visualizations: [] },
  rigor: { prose: [], callouts: [], visualizations: [] },
  examples: [],
  challenges: [],
  mentalModel: [
    'fetch returns Promise<Response>. response.json() returns Promise<data>. Two awaits needed.',
    'response.ok = status 200-299. Anything else: throw manually.',
    'POST: method, Content-Type header, JSON.stringify body.',
    'CORS: browser blocks cross-origin responses unless the server sends the right headers.',
  ],
  checkpoints: ['read-intuition'],
  quiz: [
    {
      id: 'q1',
      type: 'choice',
      text: 'You fetch a URL and get a response back. Is the data already available in the response object?',
      options: [
        'Yes — fetch resolves with the parsed data directly',
        'No — fetch resolves with a Response object; you must call .json() (which returns another Promise) to get the data',
        'Yes, but only if the server sends a Content-Type: application/json header',
      ],
      correct: 1,
    },
    {
      id: 'q2',
      type: 'choice',
      text: 'A server returns a 404 response. Does the fetch Promise reject?',
      options: [
        'Yes — any non-200 status rejects the Promise',
        'No — fetch only rejects on network failure; a 404 resolves, but response.ok will be false',
        'It depends on the browser — Chrome rejects, Firefox resolves',
      ],
      correct: 1,
    },
    {
      id: 'q3',
      type: 'choice',
      text: 'You POST data to an API with fetch. What do you need to include in the options object?',
      options: [
        'Only the URL — fetch automatically detects POST requests',
        'method: "POST", a Content-Type header set to application/json, and the body as JSON.stringify(data)',
        'method: "POST" and the data object directly — fetch serialises it automatically',
      ],
      correct: 1,
    },
    {
      id: 'q4',
      type: 'choice',
      text: 'Your JavaScript on site A tries to fetch data from site B. The browser blocks the request. What is this called and who enforces it?',
      options: [
        'SSL mismatch — the certificate authorities reject cross-site requests',
        'CORS (Cross-Origin Resource Sharing) — the browser blocks cross-origin responses unless site B sends the correct CORS headers',
        'CSP (Content Security Policy) — JavaScript files cannot make external requests by design',
      ],
      correct: 1,
    },
  ],
};
