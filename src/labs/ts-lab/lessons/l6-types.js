export default {
  id: 'l6-types',
  title: 'TypeScript types',
  phase: 3,
  phaseLabel: 'Phase 3 — Build structure',
  tags: ['interface', 'types', 'TypeScript'],

  verify(doc) {
    const hasAuthor = /user\s*#?\d|@\w+/i.test(doc.body.textContent ?? '')
    if (!hasAuthor) return { pass: false, message: 'Open a post — the detail view should show the author\'s name fetched from /users/:id' }
    const detail = doc.querySelector('[data-view="detail"]')
    if (!detail) return { pass: false, message: 'Click a post card to open the detail view first, then Check' }
    const hasComments = detail.querySelectorAll('.card, li, [data-comment]').length > 0
    if (!hasComments) return { pass: false, message: 'Add comments to the detail view — fetch /posts/:id/comments and render them' }
    return { pass: true, message: 'Author info and comments both rendering in the detail view!' }
  },

  starter: `// OpenSocial — Lesson 6
// Replace every 'any' with a real type — the editor will catch mistakes before you run.

const app = document.getElementById('app')!

// ── Types ─────────────────────────────────────────────────────────────
interface Post {
  id: number
  userId: number
  title: string
  body: string
}

interface User {
  id: number
  name: string
  username: string
  email: string
}

// ── State ─────────────────────────────────────────────────────────────
const state: {
  view: 'feed' | 'detail'
  posts: Post[]
  selected: Post | null
  author: User | null
} = {
  view: 'feed',
  posts: [],
  selected: null,
  author: null,
}

function setState(patch: Partial<typeof state>) { Object.assign(state, patch); render() }

// ── Components ────────────────────────────────────────────────────────
function PostCard(post: Post): string {
  return \`
    <div data-id="\${post.id}"
      style="border:1px solid #e2e8f0;border-radius:8px;padding:16px;margin-bottom:12px;cursor:pointer"
      onmouseover="this.style.borderColor='#2563eb'" onmouseout="this.style.borderColor='#e2e8f0'">
      <h2 style="font-size:17px;font-weight:600;margin:0 0 6px">\${post.title}</h2>
      <p style="color:#64748b;font-size:14px;margin:0">\${post.body.slice(0, 80)}...</p>
    </div>
  \`
}

function Detail(post: Post, author: User | null): string {
  return \`
    <div style="max-width:600px;margin:0 auto;padding:20px">
      <button id="back" style="margin-bottom:20px;background:none;border:1px solid #e2e8f0;padding:6px 14px;border-radius:6px;cursor:pointer">← Back</button>
      <h1 style="font-size:24px;margin-bottom:8px">\${post.title}</h1>
      \${author ? \`<p style="font-size:13px;color:#64748b;margin-bottom:16px">by \${author.name} (@\${author.username})</p>\` : ''}
      <p style="color:#475569;line-height:1.7">\${post.body}</p>
    </div>
  \`
}

function render() {
  if (state.view === 'feed') {
    app.innerHTML = \`
      <div style="max-width:600px;margin:0 auto;padding:20px">
        <h1 style="font-size:28px;margin-bottom:24px">OpenSocial</h1>
        \${state.posts.map(PostCard).join('')}
      </div>
    \`
    app.addEventListener('click', async e => {
      const card = (e.target as Element).closest('[data-id]')
      if (!card) return
      const id = Number(card.getAttribute('data-id'))
      const post = state.posts.find(p => p.id === id)!
      // Fetch the author when opening detail — a second API call!
      const author: User = await (await fetch(\`https://jsonplaceholder.typicode.com/users/\${post.userId}\`)).json()
      setState({ view: 'detail', selected: post, author })
    }, { once: true })
  }
  if (state.view === 'detail') {
    app.innerHTML = Detail(state.selected!, state.author)
    document.getElementById('back')!.addEventListener('click', () => setState({ view: 'feed', selected: null, author: null }))
  }
}

const posts: Post[] = await (await fetch('https://jsonplaceholder.typicode.com/posts?_limit=10')).json()
setState({ posts })
`,
  content: [
    { type: 'p', text: 'Every time you\'ve written any you\'ve been turning off TypeScript\'s most useful feature: the ability to tell you immediately when you use data wrong.' },
    { type: 'p', text: 'Now that you know the shape of your data, you can describe it — and the editor will catch mistakes before the browser ever sees them.' },
    { type: 'divider' },
    { type: 'h2', text: 'interface' },
    { type: 'p', text: 'An interface describes the shape of an object — what properties it has and what type each one is:' },
    { type: 'code', lang: 'typescript', text: `interface Post {
  id: number
  userId: number
  title: string
  body: string
}

// Now TypeScript knows what a Post looks like
function PostCard(post: Post): string {
  return post.titl  // ← editor catches the typo before you run
}` },
    { type: 'divider' },
    { type: 'h2', text: 'Typed state' },
    { type: 'p', text: 'When you type your state object, every property access everywhere in the app is checked:' },
    { type: 'code', lang: 'typescript', text: `const state: {
  view: 'feed' | 'detail'  // only these two strings are valid
  posts: Post[]
  selected: Post | null     // either a Post or nothing
} = {
  view: 'feed',
  posts: [],
  selected: null,
}` },
    { type: 'note', text: '\'feed\' | \'detail\' is a union type — it means the value can only ever be one of those two strings. TypeScript will error if you try to set view to anything else.' },
    { type: 'divider' },
    { type: 'h2', text: 'Multiple fetch calls' },
    { type: 'p', text: 'The starter code fetches the post author when you open a detail view — a second API call. Notice that the click handler is now async so it can await the user fetch.' },
    { type: 'divider' },
    { type: 'h2', text: 'Your task' },
    { type: 'task', steps: [
      'Run the starter — click a post and watch the author name appear in the detail view',
      'Check the Events tab: you\'ll see two fetch calls fire when you open a post',
      'Add a Comment interface with id, postId, name, email, body fields',
      'In the detail view, fetch and render the post\'s comments (/posts/{id}/comments)',
    ]},
    { type: 'tip', text: 'Fetch comments in parallel with the author:\nconst [author, comments] = await Promise.all([\n  fetch(`/users/${post.userId}`).then(r => r.json()),\n  fetch(`/posts/${post.id}/comments`).then(r => r.json())\n])' },
    { type: 'callout', text: 'Done when: the detail view shows the author name and a list of comments.' },
  ],
}
