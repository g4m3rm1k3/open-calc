export default {
  id: 'l5-components',
  title: 'Components as functions',
  phase: 3,
  phaseLabel: 'Phase 3 — Build structure',
  tags: ['functions', 'reusability', 'DRY'],

  verify(doc) {
    const win = doc.defaultView
    if (!win) return { pass: false, message: 'Run the code first' }
    // Check for named component functions exposed on window or check DOM structure
    const cards = [...doc.querySelectorAll('.card')]
    if (cards.length < 3) return { pass: false, message: 'Need at least 3 post cards rendered using your component functions' }
    // Check that cards have consistent structure (evidence of a shared function)
    const firstStructure = cards[0]?.innerHTML.length
    const consistent = cards.slice(1).every(c => Math.abs(c.innerHTML.length - firstStructure) < firstStructure * 0.5)
    if (!consistent) return { pass: false, message: 'Card structure looks inconsistent — make sure all cards use the same PostCard() function' }
    return { pass: true, message: 'Component functions working — consistent card structure across all posts!' }
  },
  starter: `// OpenSocial — Lesson 5
// Notice the card HTML written twice — once in renderFeed, once in renderDetail.
// Extract it into a reusable function and the duplication disappears.

const app = document.getElementById('app')
const posts = await (await fetch('https://jsonplaceholder.typicode.com/posts?_limit=10')).json()

const state = { view: 'feed', selected: null as any }
function setState(patch: any) { Object.assign(state, patch); render() }

// ── Component functions ───────────────────────────────────────────────
// A component is just a function that takes data and returns an HTML string.

function PostCard(post: any): string {
  return \`
    <div data-id="\${post.id}"
      style="border:1px solid #e2e8f0;border-radius:8px;padding:16px;margin-bottom:12px;cursor:pointer"
      onmouseover="this.style.borderColor='#2563eb'" onmouseout="this.style.borderColor='#e2e8f0'">
      <h2 style="font-size:17px;font-weight:600;margin:0 0 6px">\${post.title}</h2>
      <p style="color:#64748b;font-size:14px;margin:0">\${post.body.slice(0, 80)}...</p>
      <span style="font-size:12px;color:#94a3b8;margin-top:8px;display:block">User #\${post.userId}</span>
    </div>
  \`
}

function Feed(posts: any[]): string {
  return \`
    <div style="max-width:600px;margin:0 auto;padding:20px">
      <h1 style="font-size:28px;margin-bottom:24px">OpenSocial</h1>
      \${posts.map(PostCard).join('')}
    </div>
  \`
}

function Detail(post: any): string {
  return \`
    <div style="max-width:600px;margin:0 auto;padding:20px">
      <button id="back" style="margin-bottom:20px;background:none;border:1px solid #e2e8f0;padding:6px 14px;border-radius:6px;cursor:pointer">← Back</button>
      <h1 style="font-size:24px;margin-bottom:12px">\${post.title}</h1>
      <p style="color:#475569;line-height:1.7">\${post.body}</p>
    </div>
  \`
}

// ── render uses the components ────────────────────────────────────────
function render() {
  if (state.view === 'feed') {
    app.innerHTML = Feed(state.posts as any)
    app.addEventListener('click', e => {
      const card = (e.target as Element).closest('[data-id]')
      if (!card) return
      setState({ view: 'detail', selected: state.posts.find((p: any) => p.id === Number(card.getAttribute('data-id'))) })
    }, { once: true })
  }
  if (state.view === 'detail') {
    app.innerHTML = Detail(state.selected)
    document.getElementById('back')!.addEventListener('click', () => setState({ view: 'feed' }))
  }
}

const stateWithPosts = state as any
stateWithPosts.posts = posts
stateWithPosts.view = 'feed'
render()
`,
  content: [
    { type: 'p', text: 'Look at lessons 3 and 4. The card HTML appears in renderFeed and renderDetail. If you want to change how a card looks, you have to find every copy and update them all.' },
    { type: 'p', text: 'This is the problem that led to the concept of components. A component is just a function that takes data and returns markup.' },
    { type: 'divider' },
    { type: 'h2', text: 'A component is a function' },
    { type: 'p', text: 'There\'s nothing magic about it. A component is a plain function — it takes data in, returns an HTML string out:' },
    { type: 'code', lang: 'typescript', text: `function PostCard(post: any): string {
  return \`
    <div>
      <h2>\${post.title}</h2>
      <p>\${post.body}</p>
    </div>
  \`
}

// Use it anywhere — no duplication
app.innerHTML = posts.map(PostCard).join('')` },
    { type: 'p', text: 'When you want to change the card layout, you change it once in PostCard. Every place that calls it gets the update automatically. This is what React components do — the syntax just changes, the idea is identical.' },
    { type: 'divider' },
    { type: 'h2', text: 'Composing components' },
    { type: 'p', text: 'Components can call other components. A Feed component renders a list of PostCards:' },
    { type: 'code', lang: 'typescript', text: `function Feed(posts: any[]): string {
  return \`
    <div>
      <h1>OpenSocial</h1>
      \${posts.map(PostCard).join('')}
    </div>
  \`
}` },
    { type: 'note', text: 'posts.map(PostCard) works because PostCard is a function that takes one argument — exactly what Array.map expects.' },
    { type: 'divider' },
    { type: 'h2', text: 'Your task' },
    { type: 'task', steps: [
      'Run the starter — the feed and detail views should both work',
      'Add a Header(title, subtitle) component function that renders the page header',
      'Add a Button(label, id) component function and use it for the Back button',
      'Add a UserBadge(userId) component that shows "User #N" in a styled badge',
    ]},
    { type: 'tip', text: 'Compose small components into bigger ones:\nfunction Feed(posts) {\n  return Header("OpenSocial") + posts.map(PostCard).join(\'\')\n}' },
    { type: 'callout', text: 'Done when: the app uses at least 3 named component functions and no raw HTML is repeated.' },
  ],
}
