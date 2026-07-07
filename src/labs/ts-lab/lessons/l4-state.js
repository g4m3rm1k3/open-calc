export default {
  id: 'l4-state',
  title: 'Introduce state',
  phase: 2,
  phaseLabel: 'Phase 2 — Make it interactive',
  tags: ['state', 'render function', 'architecture'],
  starter: `// OpenSocial — Lesson 4
// The pattern every UI framework is built on: state + render()

const app = document.getElementById('app')
const API = 'https://jsonplaceholder.typicode.com'

// ── State ─────────────────────────────────────────────────────────────
const state = {
  view: 'loading' as 'loading' | 'feed' | 'detail',
  posts: [] as any[],
  selected: null as any,
}

// ── setState: the ONLY way to change state ────────────────────────────
function setState(patch: Partial<typeof state>) {
  Object.assign(state, patch)
  render()
}

// ── render: builds the entire UI from state ───────────────────────────
function render() {
  if (state.view === 'loading') {
    app.innerHTML = '<p style="padding:40px;color:#94a3b8">Loading...</p>'
    return
  }

  if (state.view === 'feed') {
    app.innerHTML = \`
      <div style="max-width:600px;margin:0 auto;padding:20px">
        <h1 style="font-size:28px;margin-bottom:24px">OpenSocial</h1>
        \${state.posts.map(p => \`
          <div data-id="\${p.id}" style="border:1px solid #e2e8f0;border-radius:8px;padding:16px;margin-bottom:12px;cursor:pointer"
            onmouseover="this.style.borderColor='#2563eb'" onmouseout="this.style.borderColor='#e2e8f0'">
            <div style="font-size:18px;font-weight:600">\${p.title}</div>
            <div style="color:#64748b;font-size:14px;margin-top:4px">\${p.body.slice(0, 80)}...</div>
          </div>
        \`).join('')}
      </div>
    \`
    app.addEventListener('click', e => {
      const card = (e.target as Element).closest('[data-id]')
      if (!card) return
      setState({ view: 'detail', selected: state.posts.find(p => p.id === Number(card.getAttribute('data-id'))) })
    }, { once: true })
  }

  if (state.view === 'detail') {
    app.innerHTML = \`
      <div style="max-width:600px;margin:0 auto;padding:20px">
        <button id="back" style="margin-bottom:20px;background:none;border:1px solid #e2e8f0;padding:6px 14px;border-radius:6px;cursor:pointer">← Back</button>
        <h1 style="font-size:24px;margin-bottom:12px">\${state.selected.title}</h1>
        <p style="color:#475569;line-height:1.7">\${state.selected.body}</p>
        <p style="margin-top:12px;font-size:13px;color:#94a3b8">User #\${state.selected.userId}</p>
      </div>
    \`
    document.getElementById('back').addEventListener('click', () => setState({ view: 'feed' }))
  }
}

// ── Boot ──────────────────────────────────────────────────────────────
render()
const posts = await (await fetch(\`\${API}/posts?_limit=10\`)).json()
setState({ posts, view: 'feed' })
`,
  content: [
    { type: 'p', text: 'You\'ve noticed that every time something changes, you write to the DOM directly. It works — but as the app grows the writes scatter everywhere and it becomes impossible to follow what\'s happening.' },
    { type: 'p', text: 'What you\'re about to code is the exact idea that every UI framework — React, Vue, Svelte — is built on. Once you build it yourself from scratch, those frameworks will make complete sense.' },
    { type: 'divider' },
    { type: 'h2', text: 'The pattern: state + render()' },
    { type: 'p', text: 'Instead of writing to the DOM directly anywhere you want, you follow one rule: change the state object, then call render(). The render function is the only place the DOM gets touched.' },
    { type: 'code', lang: 'typescript', text: `// 1. State — everything the UI needs to know, in one place
const state = { view: 'loading', posts: [], selected: null }

// 2. render — rebuilds the full UI from state every time it's called
function render() {
  if (state.view === 'loading') { app.innerHTML = 'Loading...' }
  if (state.view === 'feed')    { app.innerHTML = buildFeed(state.posts) }
  if (state.view === 'detail')  { app.innerHTML = buildDetail(state.selected) }
}

// 3. setState — patches state then always re-renders
function setState(patch) {
  Object.assign(state, patch)
  render()
}` },
    { type: 'note', text: 'This is exactly what React\'s useState does, what Vue\'s ref() does, what Svelte\'s $ stores do. The syntax changes but the idea is always: change state → re-render.' },
    { type: 'divider' },
    { type: 'h2', text: 'Your task' },
    { type: 'p', text: 'The starter code has the full state + render pattern wired up. Run it and verify it works, then extend it.' },
    { type: 'task', steps: [
      'Run the starter — verify feed → detail → back flow works',
      'Add the post count to the heading: "OpenSocial (10 posts)"',
      'Add a loading spinner or animation to the loading state',
      'Make setState log every state change: console.log(\'→\', state.view, state.selected?.title ?? \'\')',
      'Watch the Events tab as you click — you\'ll see clicks and DOM updates appear in sequence',
    ]},
    { type: 'tip', text: 'Watch the Events tab at the bottom while using the app. You can see the exact sequence: click → DOM update. That sequence is what React\'s virtual DOM optimizes.' },
    { type: 'callout', text: 'Done when: feed → detail → back works and setState logs to the console.' },
  ],
}
