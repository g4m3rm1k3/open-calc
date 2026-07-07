export default {
  id: 'l2-render-list',
  title: 'Build a real feed',
  phase: 1,
  phaseLabel: 'Phase 1 — Connect to data',
  tags: ['Array.map', 'template literals', 'CSS'],

  verify(doc) {
    const cards = [...doc.querySelectorAll('.card')]
    if (cards.length < 5) return { pass: false, message: `Found ${cards.length} cards — render at least 5 posts using the .card class` }
    const withAuthor = cards.filter(c => /user\s*#?\d/i.test(c.textContent))
    if (withAuthor.length < 3) return { pass: false, message: 'Add a "User #N" byline to each card — check the tip for the field name' }
    const withBody = cards.filter(c => {
      const els = [...c.querySelectorAll('*')]
      return els.filter(e => e.children.length === 0 && e.textContent.trim().length > 20).length >= 2
    })
    if (withBody.length < 3) return { pass: false, message: 'Each card needs a title AND body text — show more than just the title' }
    return { pass: true, message: `${cards.length} cards with title, body, and author — looking good!` }
  },

  starter: `const app = document.getElementById('app')
const posts = await (await fetch('https://jsonplaceholder.typicode.com/posts?_limit=10')).json()

// Helper: turn a userId into a consistent avatar colour
const COLOURS = ['#6366f1','#ec4899','#f59e0b','#10b981','#3b82f6','#8b5cf6','#ef4444','#14b8a6','#f97316','#06b6d4']
const avatarColour = (id) => COLOURS[id % COLOURS.length]
const initials = (id) => \`U\${id}\`

app.innerHTML = \`
  <nav class="nav">
    <span class="nav-brand">OpenSocial</span>
    <div class="nav-actions">
      <span class="badge badge-blue">\${posts.length} posts</span>
    </div>
  </nav>
  <div class="container mt-4">
    \${posts.map(p => \`
      <div class="card card-clickable">
        <div class="flex items-center gap-3 mb-3">
          <div class="avatar avatar-sm" style="background:\${avatarColour(p.userId)}">\${initials(p.userId)}</div>
          <div>
            <div style="font-size:13px;font-weight:600">User #\${p.userId}</div>
            <div class="caption">Post #\${p.id}</div>
          </div>
        </div>
        <p class="title-sm mb-1">\${p.title}</p>
        <p class="body-text">\${p.body.slice(0, 100)}...</p>
      </div>
    \`).join('')}
  </div>
\`
`,

  content: [
    { type: 'p', text: 'The data is there. Now make it look like a real product. Great apps are designed from the first line of code — not as an afterthought.' },
    { type: 'divider' },
    { type: 'h2', text: 'Chaining awaits' },
    { type: 'code', lang: 'typescript', text: `// Two lines
const response = await fetch(url)
const posts = await response.json()

// One line — same result
const posts = await (await fetch(url)).json()` },
    { type: 'divider' },
    { type: 'h2', text: 'The design system classes' },
    { type: 'p', text: 'The sandbox includes a full set of CSS classes. Combine them to build polished UIs without writing a single style tag:' },
    { type: 'code', lang: 'html', text: `<div class="card card-clickable">
  <div class="flex items-center gap-3 mb-3">
    <div class="avatar avatar-sm" style="background:#6366f1">U1</div>
    <div>
      <div style="font-size:13px;font-weight:600">User #1</div>
      <div class="caption">Post #42</div>
    </div>
  </div>
  <p class="title-sm mb-1">The post title</p>
  <p class="body-text">A short excerpt of the post body...</p>
</div>` },
    { type: 'divider' },
    { type: 'h2', text: 'Your task' },
    { type: 'task', steps: [
      'Run the starter — it already renders the full feed with avatars and badges',
      'Study the starter code: find where it uses avatarColour(), initials(), and the design classes',
      'Add a ❤ count to each card using p.id as a stand-in for likes (e.g. p.id * 7)',
      'Add tag-style chips showing "Post #N" in a .tag element at the bottom of each card',
    ]},
    { type: 'tip', text: 'Fake a like count: Math.floor(p.id * 7.3) — consistent per post, looks real' },
    { type: 'callout', text: 'Done when: cards show avatar, title, body excerpt, and author. Hit ✓ Check.' },
  ],
}
