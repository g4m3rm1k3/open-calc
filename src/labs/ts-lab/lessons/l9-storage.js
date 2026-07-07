export default {
  id: 'l9-storage',
  title: 'Persist with localStorage',
  phase: 4,
  phaseLabel: 'Phase 4 — Write data',
  tags: ['localStorage', 'persistence', 'JSON'],

  verify(doc) {
    const win = doc.defaultView
    if (!win) return { pass: false, message: 'Run the code first' }
    const keys = Object.keys(win.localStorage).filter(k => k.startsWith('opensocial:'))
    if (keys.length === 0) return { pass: false, message: 'No opensocial: keys in localStorage yet — toggle dark mode or open the new post form and start typing' }
    const hasDark = keys.includes('opensocial:dark')
    const hasDraft = keys.includes('opensocial:draft')
    if (!hasDark) return { pass: false, message: 'Toggle dark mode — it should persist to localStorage under "opensocial:dark"' }
    if (!hasDraft) return { pass: false, message: 'Open the new post form and type something — the draft should auto-save to "opensocial:draft"' }
    return { pass: true, message: `localStorage working! Keys: ${keys.join(', ')}. Now refresh the page — your settings should survive.` }
  },

  starter: `// OpenSocial — Lesson 9
// The app resets every time you refresh. Fix that with localStorage —
// the browser's built-in key-value store that survives page loads.

const app = document.getElementById('app')!

interface Post { id: number; userId: number; title: string; body: string }
interface Draft { title: string; body: string; savedAt: string }

// ── localStorage helpers ──────────────────────────────────────────────
// localStorage only stores strings, so we JSON.stringify/parse around it.

function save<T>(key: string, value: T): void {
  localStorage.setItem(key, JSON.stringify(value))
}

function load<T>(key: string, fallback: T): T {
  const raw = localStorage.getItem(key)
  if (!raw) return fallback
  try { return JSON.parse(raw) as T }
  catch { return fallback }
}

// ── State with persistence ────────────────────────────────────────────
const state = {
  view: 'feed' as 'feed' | 'new-post',
  posts: [] as Post[],
  draft: load<Draft>('opensocial:draft', { title: '', body: '', savedAt: '' }),
  darkMode: load<boolean>('opensocial:dark', false),
}

function setState(patch: Partial<typeof state>) {
  Object.assign(state, patch)
  // Persist draft and dark mode automatically on every state change
  save('opensocial:draft', state.draft)
  save('opensocial:dark', state.darkMode)
  render()
}

// ── Apply dark mode ───────────────────────────────────────────────────
function applyTheme() {
  document.body.style.background = state.darkMode ? '#0f172a' : '#fff'
  document.body.style.color = state.darkMode ? '#e2e8f0' : '#0f172a'
}

function NewPostForm(): string {
  const d = state.darkMode
  const inputStyle = \`width:100%;padding:10px 12px;border:1px solid \${d ? '#334155' : '#e2e8f0'};border-radius:6px;font-size:14px;outline:none;box-sizing:border-box;background:\${d ? '#1e293b' : '#fff'};color:\${d ? '#e2e8f0' : '#0f172a'};font-family:inherit\`
  return \`
    <div style="max-width:600px;margin:0 auto;padding:20px">
      <button id="back" style="margin-bottom:20px;background:none;border:1px solid \${d ? '#334155' : '#e2e8f0'};padding:6px 14px;border-radius:6px;cursor:pointer;color:inherit">← Back</button>
      <h1 style="font-size:24px;margin-bottom:8px">New Post</h1>
      \${state.draft.savedAt ? \`<p style="font-size:12px;color:#94a3b8;margin-bottom:20px">Draft saved \${state.draft.savedAt}</p>\` : '<div style="height:20px"></div>'}
      <form id="post-form">
        <div style="margin-bottom:16px">
          <label style="display:block;font-size:13px;font-weight:600;margin-bottom:6px">Title</label>
          <input id="title" value="\${state.draft.title}" placeholder="What's on your mind?" style="\${inputStyle}">
        </div>
        <div style="margin-bottom:20px">
          <label style="display:block;font-size:13px;font-weight:600;margin-bottom:6px">Body</label>
          <textarea id="body" rows="5" placeholder="Write your post..." style="\${inputStyle}">\${state.draft.body}</textarea>
        </div>
        <button type="submit" style="padding:10px 24px;background:#2563eb;color:#fff;border:none;border-radius:6px;font-size:14px;font-weight:600;cursor:pointer">Publish</button>
        <button type="button" id="clear-draft" style="margin-left:10px;padding:10px 16px;background:none;border:1px solid \${d ? '#334155' : '#e2e8f0'};border-radius:6px;font-size:13px;cursor:pointer;color:inherit">Clear draft</button>
      </form>
    </div>
  \`
}

function Feed(posts: Post[]): string {
  const d = state.darkMode
  return \`
    <div style="max-width:600px;margin:0 auto;padding:20px">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:24px">
        <h1 style="font-size:28px;margin:0">OpenSocial</h1>
        <div style="display:flex;gap:8px">
          <button id="toggle-dark" style="padding:6px 12px;background:none;border:1px solid \${d ? '#334155' : '#e2e8f0'};border-radius:6px;font-size:12px;cursor:pointer;color:inherit">
            \${d ? '☀ Light' : '☾ Dark'}
          </button>
          <button id="new-post" style="padding:8px 16px;background:#2563eb;color:#fff;border:none;border-radius:6px;font-size:13px;font-weight:600;cursor:pointer">+ New post</button>
        </div>
      </div>
      \${posts.map(p => \`
        <div style="border:1px solid \${d ? '#1e293b' : '#e2e8f0'};border-radius:8px;padding:16px;margin-bottom:12px;background:\${d ? '#0f172a' : '#fff'}">
          <h2 style="font-size:17px;font-weight:600;margin:0 0 6px">\${p.title}</h2>
          <p style="color:#64748b;font-size:14px;margin:0">\${p.body.slice(0,80)}...</p>
        </div>
      \`).join('')}
    </div>
  \`
}

function render() {
  applyTheme()
  if (state.view === 'feed') {
    app.innerHTML = Feed(state.posts)
    document.getElementById('new-post')!.addEventListener('click', () => setState({ view: 'new-post' }))
    document.getElementById('toggle-dark')!.addEventListener('click', () => setState({ darkMode: !state.darkMode }))
  }
  if (state.view === 'new-post') {
    app.innerHTML = NewPostForm()
    document.getElementById('back')!.addEventListener('click', () => setState({ view: 'feed' }))
    document.getElementById('clear-draft')!.addEventListener('click', () => setState({ draft: { title: '', body: '', savedAt: '' } }))
    // Auto-save draft as user types
    document.getElementById('title')!.addEventListener('input', e => {
      state.draft.title = (e.target as HTMLInputElement).value
      state.draft.savedAt = new Date().toLocaleTimeString()
      save('opensocial:draft', state.draft)
    })
    document.getElementById('body')!.addEventListener('input', e => {
      state.draft.body = (e.target as HTMLTextAreaElement).value
      state.draft.savedAt = new Date().toLocaleTimeString()
      save('opensocial:draft', state.draft)
    })
    document.getElementById('post-form')!.addEventListener('submit', async e => {
      e.preventDefault()
      await fetch('https://jsonplaceholder.typicode.com/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: state.draft.title, body: state.draft.body, userId: 1 }),
      })
      setState({ view: 'feed', draft: { title: '', body: '', savedAt: '' } })
    })
  }
}

const posts: Post[] = await (await fetch('https://jsonplaceholder.typicode.com/posts?_limit=10')).json()
setState({ posts })
`,
  content: [
    { type: 'p', text: 'Every time you refresh the page, the app starts from zero. Real apps remember things: your dark mode preference, a half-written draft, which posts you\'ve read.' },
    { type: 'p', text: 'localStorage is the browser\'s built-in key-value store. It survives page reloads, browser restarts, and even computer reboots.' },
    { type: 'divider' },
    { type: 'h2', text: 'localStorage basics' },
    { type: 'code', lang: 'typescript', text: `// Store a string
localStorage.setItem('username', 'janedoe')

// Read it back
const name = localStorage.getItem('username')  // 'janedoe'

// Remove it
localStorage.removeItem('username')` },
    { type: 'divider' },
    { type: 'h2', text: 'Storing objects' },
    { type: 'p', text: 'localStorage only stores strings — but JSON.stringify/parse lets you store any object:' },
    { type: 'code', lang: 'typescript', text: `// Save an object
localStorage.setItem('draft', JSON.stringify({ title: 'Hello', body: '...' }))

// Load it back
const raw = localStorage.getItem('draft')
const draft = raw ? JSON.parse(raw) : null` },
    { type: 'note', text: 'Wrap load() in a try/catch — if the stored value is malformed JSON (e.g. from a bug or old version of the app), JSON.parse will throw.' },
    { type: 'divider' },
    { type: 'h2', text: 'Your task' },
    { type: 'task', steps: [
      'Run the starter and toggle dark mode — then refresh. The theme should persist.',
      'Open the new post form, type something, then refresh the page and re-open it — the draft should still be there.',
      'Check the Application tab in the Preview pane\'s DevTools to see your localStorage keys',
      'Add a "read" feature: mark posts as read, store read post IDs in localStorage, show them differently in the feed',
    ]},
    { type: 'tip', text: 'Store a set of IDs:\nconst read = new Set(load<number[]>(\'read\', []))\nread.add(post.id)\nsave(\'read\', [...read])' },
    { type: 'callout', text: 'Done when: dark mode and draft both survive a page refresh.' },
  ],
}
