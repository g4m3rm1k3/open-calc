// J10 — Lesson 6-1: Browser Storage — localStorage, sessionStorage, and Cookies

const LESSON_JS_CORE_6_1 = {
  title: 'Browser Storage — localStorage, sessionStorage, and Cookies',
  subtitle: 'Persist data between page loads using the browser\'s built-in storage APIs.',
  sequential: true,

  cells: [

    {
      type: 'markdown',
      instruction: `## Part 1 — The Three Browser Storage Options

The browser gives you three ways to persist data on the client — no server needed:

| API | Persists across tabs | Persists across sessions | Capacity | Sent with requests |
|-----|---------------------|--------------------------|----------|--------------------|
| **localStorage** | Yes (same origin) | Yes (until cleared) | ~5–10 MB | No |
| **sessionStorage** | No (per tab) | No (tab close = gone) | ~5–10 MB | No |
| **Cookies** | Yes (same origin) | Configurable (expires) | ~4 KB | Yes (every request) |

**Same origin** means same protocol + domain + port. \`https://myapp.com\` and \`http://myapp.com\` are different origins.

**When to use which:**
- \`localStorage\`: user preferences, theme, cached API data, auth tokens (if not using HttpOnly cookies)
- \`sessionStorage\`: temporary form state, single-session data (shopping cart step, wizard progress)
- \`Cookies\`: auth sessions (HttpOnly flag prevents JS access — more secure), cross-tab state that must be included in HTTP requests

**In contrast**, in a C program you would write to a file directly. In a server-side language (Node, Python, Go) you would read/write a database. localStorage is the browser's equivalent of a simple file write — synchronous, local, and limited in size.`,
    },

    {
      type: 'js',
      instruction: `### localStorage — Read, Write, Delete

The localStorage API is synchronous and only stores strings. Objects require \`JSON.stringify\` / \`JSON.parse\`.`,
      html: `<div style="background:#09111c;padding:20px;border-radius:12px;color:#94a3b8;font-family:monospace;font-size:13px;min-height:200px;">
  <div style="display:flex;gap:8px;margin-bottom:12px;">
    <input id="keyIn" placeholder="key" style="flex:1;background:#1e2a3f;border:1px solid #334155;color:#e2e8f0;padding:8px;border-radius:6px;font-family:monospace;font-size:12px;">
    <input id="valIn" placeholder="value" style="flex:2;background:#1e2a3f;border:1px solid #334155;color:#e2e8f0;padding:8px;border-radius:6px;font-family:monospace;font-size:12px;">
    <button id="setBtn" style="background:#3b82f6;border:none;color:#fff;padding:8px 14px;border-radius:6px;cursor:pointer;font-family:monospace;font-size:12px;">Set</button>
    <button id="getBtn" style="background:#1e2a3f;border:1px solid #334155;color:#94a3b8;padding:8px 14px;border-radius:6px;cursor:pointer;font-family:monospace;font-size:12px;">Get</button>
    <button id="delBtn" style="background:#7f1d1d;border:none;color:#fca5a5;padding:8px 14px;border-radius:6px;cursor:pointer;font-family:monospace;font-size:12px;">Del</button>
  </div>
  <div id="output" style="background:#0f172a;border-radius:8px;padding:12px;min-height:80px;color:#38bdf8;font-size:12px;white-space:pre-wrap;"></div>
  <div style="margin-top:8px;display:flex;gap:8px;">
    <button id="listBtn" style="flex:1;background:#1e2a3f;border:1px solid #334155;color:#94a3b8;padding:6px;border-radius:6px;cursor:pointer;font-family:monospace;font-size:11px;">List All</button>
    <button id="clearBtn" style="flex:1;background:#1e2a3f;border:1px solid #334155;color:#94a3b8;padding:6px;border-radius:6px;cursor:pointer;font-family:monospace;font-size:11px;">Clear All</button>
  </div>
</div>`,
      css: `body{margin:0;padding:0;background:#09111c;}`,
      startCode: `const out = document.getElementById('output');
const log = (msg) => { out.textContent += msg + '\n'; };

function refreshDisplay() {
  out.textContent = '';
  const count = localStorage.length;
  log('localStorage (' + count + ' item' + (count !== 1 ? 's' : '') + '):');
  for (let i = 0; i < count; i++) {
    const k = localStorage.key(i);
    log('  ' + k + ' = ' + localStorage.getItem(k));
  }
}

document.getElementById('setBtn').onclick = () => {
  const k = document.getElementById('keyIn').value.trim();
  const v = document.getElementById('valIn').value.trim();
  if (!k) return;
  localStorage.setItem(k, v);
  log('Set: ' + k + ' = ' + v);
  refreshDisplay();
};

document.getElementById('getBtn').onclick = () => {
  const k = document.getElementById('keyIn').value.trim();
  const v = localStorage.getItem(k);
  log('Get: ' + k + ' = ' + (v === null ? '(not found)' : v));
};

document.getElementById('delBtn').onclick = () => {
  const k = document.getElementById('keyIn').value.trim();
  localStorage.removeItem(k);
  log('Removed: ' + k);
  refreshDisplay();
};

document.getElementById('listBtn').onclick = refreshDisplay;

document.getElementById('clearBtn').onclick = () => {
  localStorage.clear();
  log('Cleared all');
  refreshDisplay();
};

// Seed some initial data
localStorage.setItem('theme', 'dark');
localStorage.setItem('username', 'alice');
localStorage.setItem('lastVisit', new Date().toLocaleDateString());
refreshDisplay();`,
      outputHeight: 300,
    },

    {
      type: 'markdown',
      instruction: `## Part 2 — Storing Objects

localStorage only stores strings. The pattern for objects is always:

\`\`\`js
// Write
localStorage.setItem('user', JSON.stringify({ name: 'Alice', age: 30 }));

// Read
const user = JSON.parse(localStorage.getItem('user'));
console.log(user.name);   // 'Alice'
\`\`\`

**The null trap** — always check before parsing:

\`\`\`js
function getItem(key, fallback = null) {
  const raw = localStorage.getItem(key);
  if (raw === null) return fallback;
  try {
    return JSON.parse(raw);
  } catch {
    return raw;   // stored as plain string, not JSON
  }
}
\`\`\`

**Storage limits** — when you exceed the quota (typically 5–10 MB), \`setItem\` throws a \`QuotaExceededError\`. Wrap writes in try/catch for production code.

**localStorage is synchronous** — it blocks the main thread. For large data (hundreds of KB+), use **IndexedDB** instead, which is async. For most apps, localStorage is fine.`,
    },

    {
      type: 'js',
      instruction: `### Storing and Restoring Complex State

A real-world pattern: persist a todo list across reloads.`,
      html: `<div style="background:#09111c;padding:16px;border-radius:12px;color:#94a3b8;font-family:monospace;font-size:13px;">
  <div style="display:flex;gap:8px;margin-bottom:12px;">
    <input id="todoIn" placeholder="New todo..." style="flex:1;background:#1e2a3f;border:1px solid #334155;color:#e2e8f0;padding:8px;border-radius:6px;font-family:monospace;font-size:12px;">
    <button id="addBtn" style="background:#3b82f6;border:none;color:#fff;padding:8px 14px;border-radius:6px;cursor:pointer;font-family:monospace;font-size:12px;">Add</button>
  </div>
  <div id="list" style="display:flex;flex-direction:column;gap:6px;margin-bottom:10px;"></div>
  <div style="display:flex;gap:8px;">
    <button id="clearDone" style="flex:1;background:#1e2a3f;border:1px solid #334155;color:#94a3b8;padding:6px;border-radius:6px;cursor:pointer;font-family:monospace;font-size:11px;">Clear Done</button>
    <div id="status" style="flex:2;color:var(--color-text-secondary, #475569);font-size:11px;display:flex;align-items:center;padding:0 8px;">Loaded from localStorage</div>
  </div>
</div>`,
      css: `body{margin:0;padding:0;background:#09111c;}`,
      startCode: `const STORAGE_KEY = 'todos_demo';

function loadTodos() {
  const raw = localStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : [];
}

function saveTodos(todos) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
}

let todos = loadTodos();
if (todos.length === 0) {
  todos = [
    { id: 1, text: 'Learn localStorage', done: true },
    { id: 2, text: 'Build a persistent todo list', done: false },
  ];
  saveTodos(todos);
}

function renderTodos() {
  const list = document.getElementById('list');
  list.innerHTML = '';
  todos.forEach(todo => {
    const row = document.createElement('div');
    row.style.cssText = 'display:flex;align-items:center;gap:8px;background:#1e2a3f;padding:8px;border-radius:6px;';
    row.innerHTML = \`
      <input type="checkbox" \${todo.done ? 'checked' : ''} data-id="\${todo.id}" style="cursor:pointer;">
      <span style="flex:1;color:\${todo.done ? '#475569' : '#e2e8f0'};text-decoration:\${todo.done ? 'line-through' : 'none'};">\${todo.text}</span>
      <button data-del="\${todo.id}" style="background:#7f1d1d;border:none;color:#fca5a5;padding:2px 8px;border-radius:4px;cursor:pointer;font-size:11px;">✕</button>
    \`;
    list.appendChild(row);
  });
}

document.getElementById('list').addEventListener('click', e => {
  const delId = e.target.dataset.del;
  if (delId) {
    todos = todos.filter(t => t.id !== Number(delId));
    saveTodos(todos);
    renderTodos();
  }
  const chk = e.target.closest('input[type=checkbox]');
  if (chk) {
    const id = Number(chk.dataset.id);
    todos = todos.map(t => t.id === id ? { ...t, done: chk.checked } : t);
    saveTodos(todos);
    renderTodos();
  }
});

document.getElementById('addBtn').onclick = () => {
  const input = document.getElementById('todoIn');
  const text = input.value.trim();
  if (!text) return;
  const id = Date.now();
  todos.push({ id, text, done: false });
  saveTodos(todos);
  input.value = '';
  renderTodos();
};

document.getElementById('clearDone').onclick = () => {
  todos = todos.filter(t => !t.done);
  saveTodos(todos);
  renderTodos();
};

renderTodos();`,
      outputHeight: 300,
    },

    {
      type: 'markdown',
      instruction: `## Part 3 — sessionStorage and the storage Event

**sessionStorage** has the exact same API as localStorage — \`setItem\`, \`getItem\`, \`removeItem\`, \`clear\` — but data lives only for the lifetime of the browser tab.

Use it for:
- Multi-step form wizard state (don't lose if user refreshes)
- Scroll position restoration within a session
- Temporary auth state before full login completes

**The storage event** — fired when localStorage changes in *another* tab:

\`\`\`js
window.addEventListener('storage', (event) => {
  console.log(event.key);       // which key changed
  console.log(event.oldValue);  // previous value
  console.log(event.newValue);  // new value
  console.log(event.url);       // origin tab URL
});
\`\`\`

This is how you build **cross-tab communication** without a server. Two tabs on the same origin can send messages by writing to localStorage — the other tab receives the \`storage\` event.

## Part 4 — Cookies in Brief

Cookies are set via \`document.cookie\` (a horrible API) or the \`Set-Cookie\` HTTP header (server-side). For client-side use, localStorage is almost always better. The one thing cookies do that localStorage cannot: they are included in every HTTP request automatically. This makes them necessary for server-side sessions.

\`\`\`js
// Write
document.cookie = 'theme=dark; max-age=86400; path=/';

// Read — terrible API, requires parsing
function getCookie(name) {
  return document.cookie.split('; ')
    .find(r => r.startsWith(name + '='))
    ?.split('=')[1];
}
getCookie('theme');   // 'dark'
\`\`\`

For real cookie management in JS, use a library like \`js-cookie\`.`,
    },

    {
      type: 'challenge',
      instruction: `### Challenge 1: User Preferences Store

Build a \`prefs\` object with \`set(key, value)\`, \`get(key, default)\`, and \`reset()\` methods that persist user preferences to localStorage under the key \`'user_prefs'\`.

Requirements:
- All preferences stored as a single JSON object under \`'user_prefs'\`
- \`get\` returns the default value if the key does not exist
- \`reset\` clears the preferences back to \`{}\`

Log:
\`\`\`
dark
16
default-theme
\`\`\``,
      startCode: `const prefs = {
  set(key, value) {
    // your code
  },
  get(key, defaultValue = null) {
    // your code
  },
  reset() {
    // your code
  }
};

prefs.set('theme', 'dark');
prefs.set('fontSize', 16);
console.log(prefs.get('theme'));
console.log(prefs.get('fontSize'));
prefs.reset();
console.log(prefs.get('theme', 'default-theme'));`,
      solutionCode: `const prefs = {
  _key: 'user_prefs',
  _load() { return JSON.parse(localStorage.getItem(this._key) || '{}'); },
  _save(data) { localStorage.setItem(this._key, JSON.stringify(data)); },
  set(key, value) { const d = this._load(); d[key] = value; this._save(d); },
  get(key, defaultValue = null) { return this._load()[key] ?? defaultValue; },
  reset() { this._save({}); }
};
prefs.set('theme', 'dark');
prefs.set('fontSize', 16);
console.log(prefs.get('theme'));
console.log(prefs.get('fontSize'));
prefs.reset();
console.log(prefs.get('theme', 'default-theme'));`,
      check: (code, logs) =>
        logs[0] === 'dark' &&
        logs[1] === '16' &&
        logs[2] === 'default-theme' &&
        /localStorage/.test(code),
      successMessage: 'Correct! Storing all prefs under one key keeps storage organized and lets you atomic-reset without touching other keys.',
      failMessage: 'Store all prefs as one JSON object under a single localStorage key. get() should return the defaultValue when the key is missing after reset().',
      outputHeight: 200,
    },

    {
      type: 'challenge',
      instruction: `### Challenge 2: Form Auto-Save

Wire up the form so it auto-saves to \`sessionStorage\` on every input event, and restores its values on load.

The form has three fields: \`#name\`, \`#email\`, \`#message\`. Log \`'saved'\` on each save and \`'restored: ' + name\` on restore (where name is the saved name value).`,
      html: `<div style="background:#09111c;padding:16px;border-radius:12px;color:#94a3b8;font-family:monospace;font-size:13px;">
  <form id="contactForm" style="display:flex;flex-direction:column;gap:10px;">
    <input id="name" placeholder="Name" style="background:#1e2a3f;border:1px solid #334155;color:#e2e8f0;padding:8px;border-radius:6px;font-family:monospace;font-size:12px;">
    <input id="email" placeholder="Email" style="background:#1e2a3f;border:1px solid #334155;color:#e2e8f0;padding:8px;border-radius:6px;font-family:monospace;font-size:12px;">
    <textarea id="message" rows="3" placeholder="Message" style="background:#1e2a3f;border:1px solid #334155;color:#e2e8f0;padding:8px;border-radius:6px;font-family:monospace;font-size:12px;resize:none;"></textarea>
    <button type="submit" style="background:#3b82f6;border:none;color:#fff;padding:8px;border-radius:6px;cursor:pointer;font-family:monospace;font-size:12px;">Submit</button>
  </form>
  <div id="status" style="margin-top:8px;color:var(--color-text-secondary, #475569);font-size:11px;"></div>
</div>`,
      css: `body{margin:0;padding:0;background:#09111c;}`,
      startCode: `const FORM_KEY = 'contact_draft';
const form = document.getElementById('contactForm');
const fields = ['name', 'email', 'message'];

function saveForm() {
  // Save all field values to sessionStorage as a JSON object
  // console.log('saved')
}

function restoreForm() {
  // Restore field values from sessionStorage
  // console.log('restored: ' + savedName)
}

// Call restoreForm on load
// Add 'input' event listener to the form that calls saveForm
// On submit, clear the draft from sessionStorage`,
      solutionCode: `const FORM_KEY = 'contact_draft';
const form = document.getElementById('contactForm');
const fields = ['name', 'email', 'message'];

function saveForm() {
  const data = {};
  fields.forEach(f => data[f] = document.getElementById(f).value);
  sessionStorage.setItem(FORM_KEY, JSON.stringify(data));
  console.log('saved');
}

function restoreForm() {
  const raw = sessionStorage.getItem(FORM_KEY);
  if (!raw) return;
  const data = JSON.parse(raw);
  fields.forEach(f => { if (data[f]) document.getElementById(f).value = data[f]; });
  console.log('restored: ' + data.name);
}

restoreForm();
form.addEventListener('input', saveForm);
form.addEventListener('submit', e => {
  e.preventDefault();
  sessionStorage.removeItem(FORM_KEY);
  document.getElementById('status').textContent = 'Submitted and draft cleared!';
});`,
      check: (code, logs) =>
        /sessionStorage/.test(code) &&
        /addEventListener\s*\(\s*['"]input['"]/.test(code) &&
        logs.some(l => l === 'saved'),
      successMessage: 'Correct! Form auto-save prevents users from losing data on accidental refresh. sessionStorage is ideal because the draft should not persist across sessions.',
      failMessage: 'Add an \'input\' event listener on the form that saves all field values to sessionStorage. Restore on load and log the right messages.',
      outputHeight: 300,
    },

  ],
};

export default {
  id: 'js-core-6-1-browser-storage',
  slug: 'browser-storage-localstorage-sessionstorage-cookies',
  chapter: 'js6.1',
  order: 0,
  title: 'Browser Storage — localStorage, sessionStorage, and Cookies',
  subtitle: 'Persist data between page loads, build cross-tab state, and understand when to use each storage API.',
  tags: ['javascript', 'localstorage', 'sessionstorage', 'cookies', 'browser-storage', 'persistence'],

  hook: {
    question: 'How do websites remember your preferences after you close the tab?',
    realWorldContext: 'Every app that remembers your theme, saved cart, or draft text uses browser storage. Understanding the three options and their trade-offs is essential for building any stateful web app.',
    previewVisualizationId: 'JSNotebook',
  },

  intuition: {
    prose: [
      'localStorage: persists forever, shared across tabs. For settings, cached data, tokens.',
      'sessionStorage: same API, but cleared when the tab closes. For temporary form state.',
      'Cookies: sent with every HTTP request. Use for server-managed sessions. Client API is painful.',
      'Objects must be JSON.stringify\'d before storing; JSON.parse\'d after reading.',
      'The storage event fires in OTHER tabs when localStorage changes — cross-tab messaging for free.',
    ],
    callouts: [
      {
        type: 'warning',
        title: 'Never Store Sensitive Data in localStorage',
        body: 'localStorage is accessible from any JavaScript on the page. An XSS vulnerability exposes everything in it. Store auth tokens in HttpOnly cookies (the server sets them, JS cannot read them) for anything security-critical.',
      },
      {
        type: 'tip',
        title: 'IndexedDB for Large Data',
        body: 'localStorage is synchronous and limited to ~5 MB. For large structured data (images, large datasets), use IndexedDB — an async, transactional, key-value store built into every browser. Libraries like Dexie.js make the API bearable.',
      },
    ],
    visualizations: [
      {
        id: 'JSNotebook',
        title: 'Browser Storage — localStorage, sessionStorage, Cookies',
        props: { lesson: LESSON_JS_CORE_6_1 },
      },
    ],
  },

  math: { prose: [], callouts: [], visualizations: [] },
  rigor: { prose: [], callouts: [], visualizations: [] },
  examples: [],
  challenges: [],
  mentalModel: [
    'localStorage: string key-value store, ~5 MB, same origin, permanent until cleared.',
    'sessionStorage: same API, scoped to one tab, cleared on close.',
    'Objects: JSON.stringify to write, JSON.parse to read. Always guard against null.',
    'storage event: fires in OTHER tabs on localStorage change — cross-tab communication.',
    'Cookies: auto-sent in HTTP headers. HttpOnly flag makes them inaccessible to JS — more secure.',
  ],
  checkpoints: ['read-intuition'],
  quiz: [],
};
