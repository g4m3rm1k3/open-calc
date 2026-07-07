export default {
  id: 'l3-click-events',
  title: 'Handle clicks',
  phase: 2,
  phaseLabel: 'Phase 2 — Make it interactive',
  tags: ['addEventListener', 'event delegation', 'data attributes'],

  verify(doc) {
    const cards = doc.querySelectorAll('[data-id]')
    if (cards.length < 5) return { pass: false, message: `Found ${cards.length} elements with data-id — each post card needs a data-id attribute for the click handler` }
    const back = doc.querySelector('[id*="back"], [data-action="back"]')
    const isDetail = back !== null
    const hasDetailContent = doc.querySelector('[data-view="detail"]') !== null || isDetail
    if (!hasDetailContent) return { pass: false, message: 'Click a card — does it show a detail view? Add a renderDetail() function and wire it to the click listener' }
    return { pass: true, message: 'Click delegation working and detail view rendering!' }
  },

  starter: `const app = document.getElementById('app')
const COLOURS = ['#6366f1','#ec4899','#f59e0b','#10b981','#3b82f6','#8b5cf6','#ef4444','#14b8a6','#f97316','#06b6d4']
const avatarBg = (id) => COLOURS[id % COLOURS.length]

const posts = await (await fetch('https://jsonplaceholder.typicode.com/posts?_limit=10')).json()

// ── Components ────────────────────────────────────────────────────────
function PostCard(p) {
  return \`
    <div class="card card-clickable" data-id="\${p.id}">
      <div class="flex items-center gap-3 mb-3">
        <div class="avatar avatar-sm" style="background:\${avatarBg(p.userId)}">U\${p.userId}</div>
        <div>
          <div style="font-size:13px;font-weight:600">User #\${p.userId}</div>
          <div class="caption">Post #\${p.id}</div>
        </div>
      </div>
      <p class="title-sm mb-1">\${p.title}</p>
      <p class="body-text">\${p.body.slice(0, 100)}...</p>
      <div class="flex items-center gap-2 mt-3">
        <span class="caption">❤ \${p.id * 7}</span>
        <span class="caption">· 💬 \${p.id * 3}</span>
      </div>
    </div>
  \`
}

function renderFeed() {
  app.innerHTML = \`
    <nav class="nav">
      <span class="nav-brand">OpenSocial</span>
      <span class="badge badge-blue">\${posts.length} posts</span>
    </nav>
    <div class="container mt-4">
      \${posts.map(PostCard).join('')}
    </div>
  \`

  // Event delegation — one listener handles all card clicks
  app.addEventListener('click', e => {
    const card = e.target.closest('[data-id]')
    if (!card) return
    const id = Number(card.getAttribute('data-id'))
    const post = posts.find(p => p.id === id)
    renderDetail(post)
  }, { once: true })
}

// TODO: write renderDetail(post) — show the full post with a Back button
function renderDetail(post) {
  app.innerHTML = \`
    <nav class="nav">
      <button id="back" class="btn btn-ghost btn-sm">← Back</button>
      <span class="nav-brand">OpenSocial</span>
    </nav>
    <div class="page" data-view="detail">
      <p class="body-text mb-3">by User #\${post.userId}</p>
      <h1 class="title-lg mb-4">\${post.title}</h1>
      <p class="body-text">\${post.body}</p>

      <!-- TODO: fetch and render comments for this post -->
    </div>
  \`
  document.getElementById('back').addEventListener('click', renderFeed)
}

renderFeed()
`,

  content: [
    { type: 'p', text: 'A feed that looks good but does nothing is a mockup, not an app. Now make it respond to the user.' },
    { type: 'divider' },
    { type: 'h2', text: 'Event delegation' },
    { type: 'p', text: 'Instead of adding a listener to every card (which breaks when you re-render), put one listener on the parent and check which child was clicked:' },
    { type: 'code', lang: 'typescript', text: `app.addEventListener('click', (e) => {
  const card = (e.target as Element).closest('[data-id]')
  if (!card) return  // missed — clicked between cards

  const id = Number(card.getAttribute('data-id'))
  const post = posts.find(p => p.id === id)
  renderDetail(post)
})` },
    { type: 'note', text: 'closest() walks up the DOM from the clicked element until it finds an ancestor matching the selector. This works even if the user clicks the title text inside the card.' },
    { type: 'divider' },
    { type: 'h2', text: 'Your task' },
    { type: 'task', steps: [
      'Run the starter — clicking cards already works, but the detail view is minimal',
      'Improve renderDetail(): fetch comments for the post and render them below the body',
      'Style comments as a list of small cards with the commenter\'s name and email',
      'Add a comment count badge to each post card in the feed',
    ]},
    { type: 'tip', text: 'Fetch post comments:\nconst comments = await (await fetch(`https://jsonplaceholder.typicode.com/posts/${post.id}/comments`)).json()' },
    { type: 'callout', text: 'Done when: clicking a card shows the detail view with a Back button that works. Hit ✓ Check.' },
  ],
}
