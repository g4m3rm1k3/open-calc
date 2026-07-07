export default {
  id: 'l7-router',
  title: 'Build a router',
  phase: 3,
  phaseLabel: 'Phase 3 — Build structure',
  tags: ['routing', 'URL hash', 'history'],

  verify(doc) {
    const win = doc.defaultView
    if (!win) return { pass: false, message: 'Run the code first' }
    const hash = win.location.hash
    const hasHashRouting = typeof win.navigate === 'function'
    if (!hasHashRouting) return { pass: false, message: 'No navigate() function found on window — make sure you expose it with window.navigate = navigate' }
    const cards = doc.querySelectorAll('[data-id], .card-clickable')
    if (cards.length < 3) return { pass: false, message: 'Need at least 3 clickable post cards in the feed' }
    return { pass: true, message: `Router working! Current hash: ${hash || '#feed'}. Click a post and check the address bar.` }
  },

  starter: `// OpenSocial — Lesson 7
// Real apps have URLs. Right now clicking a post doesn't change the address bar —
// you can't share a link to a specific post or hit the back button.
// Fix that with a hash-based router.

const app = document.getElementById('app')!

interface Post { id: number; userId: number; title: string; body: string }

let posts: Post[] = []

// ── Router ────────────────────────────────────────────────────────────
// The hash is everything after # in the URL: #feed, #post/3, #about

function getRoute(): { name: string; id?: number } {
  const hash = window.location.hash.slice(1) || 'feed'
  if (hash.startsWith('post/')) return { name: 'post', id: Number(hash.slice(5)) }
  return { name: hash }
}

function navigate(path: string) {
  window.location.hash = path
  // hashchange event fires → router re-renders
}

// ── Components ────────────────────────────────────────────────────────
function Feed(posts: Post[]): string {
  return \`
    <div style="max-width:600px;margin:0 auto;padding:20px">
      <h1 style="font-size:28px;margin-bottom:24px">OpenSocial</h1>
      \${posts.map(p => \`
        <div onclick="navigate('post/\${p.id}')" style="border:1px solid #e2e8f0;border-radius:8px;padding:16px;margin-bottom:12px;cursor:pointer"
          onmouseover="this.style.borderColor='#2563eb'" onmouseout="this.style.borderColor='#e2e8f0'">
          <h2 style="font-size:17px;font-weight:600;margin:0 0 6px">\${p.title}</h2>
          <p style="color:#64748b;font-size:14px;margin:0">\${p.body.slice(0,80)}...</p>
        </div>
      \`).join('')}
    </div>
  \`
}

async function PostDetail(id: number): Promise<string> {
  const post: Post = await (await fetch(\`https://jsonplaceholder.typicode.com/posts/\${id}\`)).json()
  return \`
    <div style="max-width:600px;margin:0 auto;padding:20px">
      <button onclick="navigate('feed')" style="margin-bottom:20px;background:none;border:1px solid #e2e8f0;padding:6px 14px;border-radius:6px;cursor:pointer">← Back</button>
      <h1 style="font-size:24px;margin-bottom:12px">\${post.title}</h1>
      <p style="color:#475569;line-height:1.7">\${post.body}</p>
    </div>
  \`
}

// ── Render current route ──────────────────────────────────────────────
async function render() {
  const route = getRoute()
  if (route.name === 'feed') {
    app.innerHTML = Feed(posts)
  } else if (route.name === 'post' && route.id) {
    app.innerHTML = '<p style="padding:40px;color:#94a3b8">Loading...</p>'
    app.innerHTML = await PostDetail(route.id)
  }
}

// Re-render whenever the URL hash changes (back button, forward button, navigate())
window.addEventListener('hashchange', render)

// Make navigate available to inline onclick handlers
;(window as any).navigate = navigate

// Boot
posts = await (await fetch('https://jsonplaceholder.typicode.com/posts?_limit=10')).json()
render()
`,
  content: [
    { type: 'p', text: 'There\'s a problem with the app so far: clicking a post doesn\'t change the URL. You can\'t bookmark a specific post, share a link to it, or use the browser\'s back button.' },
    { type: 'p', text: 'Real apps have URLs for every view. You\'re going to build a router — the code that maps URLs to views.' },
    { type: 'divider' },
    { type: 'h2', text: 'Hash-based routing' },
    { type: 'p', text: 'The simplest routing strategy uses the URL hash — everything after the # symbol. Changing the hash doesn\'t reload the page, but it does fire a hashchange event and gets saved in browser history.' },
    { type: 'code', lang: 'typescript', text: `// Current URL: http://localhost:5173/#post/3
window.location.hash          // '#post/3'
window.location.hash.slice(1) // 'post/3'

// Navigate without a page reload
function navigate(path: string) {
  window.location.hash = path
}

// Re-render when the hash changes (back/forward buttons work!)
window.addEventListener('hashchange', render)` },
    { type: 'divider' },
    { type: 'h2', text: 'Parsing the route' },
    { type: 'p', text: 'A router parses the current hash into a structured route object your render function can act on:' },
    { type: 'code', lang: 'typescript', text: `function getRoute() {
  const hash = window.location.hash.slice(1) || 'feed'
  if (hash.startsWith('post/')) return { name: 'post', id: Number(hash.slice(5)) }
  return { name: hash }
}

async function render() {
  const route = getRoute()
  if (route.name === 'feed') { app.innerHTML = Feed(posts) }
  if (route.name === 'post') { app.innerHTML = await PostDetail(route.id!) }
}` },
    { type: 'note', text: 'Watch the address bar in the Preview pane as you navigate. You\'ll also see the Events tab log a new fetch each time you open a post — the detail fetches on demand.' },
    { type: 'divider' },
    { type: 'h2', text: 'Your task' },
    { type: 'task', steps: [
      'Run the starter and click posts — watch the URL hash change as you navigate',
      'Press the browser\'s back button — it should return to the feed',
      'Add a #profile/{userId} route that fetches and shows the user\'s profile',
      'Add a Not Found view that renders when the hash doesn\'t match any route',
    ]},
    { type: 'tip', text: 'Fetch a user profile:\nconst user = await (await fetch(`https://jsonplaceholder.typicode.com/users/${id}`)).json()' },
    { type: 'callout', text: 'Done when: back/forward buttons work and you\'ve added at least one new route.' },
  ],
}
