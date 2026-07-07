export default {
  id: 'l3-click-events',
  title: 'Handle clicks',
  phase: 2,
  phaseLabel: 'Phase 2 — Make it interactive',
  tags: ['addEventListener', 'event delegation', 'data attributes'],
  starter: `// OpenSocial — Lesson 3
// Goal: click a post card → show that post's full content

const app = document.getElementById('app')
const posts = await (await fetch('https://jsonplaceholder.typicode.com/posts?_limit=10')).json()

function renderFeed() {
  app.innerHTML = \`
    <div style="max-width:600px;margin:0 auto;padding:20px">
      <h1 style="font-size:28px;margin-bottom:24px">OpenSocial</h1>
      \${posts.map(p => \`
        <div
          data-id="\${p.id}"
          style="border:1px solid #e2e8f0;border-radius:8px;padding:16px;margin-bottom:12px;cursor:pointer"
          onmouseover="this.style.borderColor='#2563eb'"
          onmouseout="this.style.borderColor='#e2e8f0'"
        >
          <div style="font-size:18px;font-weight:600;margin-bottom:6px">\${p.title}</div>
          <div style="color:#64748b;font-size:14px">\${p.body.slice(0, 80)}...</div>
          <div style="margin-top:10px;font-size:12px;color:#94a3b8">User #\${p.userId}</div>
        </div>
      \`).join('')}
    </div>
  \`
}

renderFeed()

// TODO: add a click listener that shows a detail view when a card is clicked
`,
  content: [
    { type: 'p', text: 'The feed looks good. Now the most fundamental thing in UI programming: responding to what the user does.' },
    { type: 'divider' },
    { type: 'h2', text: 'addEventListener' },
    { type: 'p', text: 'Any element in the DOM can listen for events. You register a callback to run when something happens:' },
    { type: 'code', lang: 'typescript', text: `const button = document.getElementById('myButton')

button.addEventListener('click', (event) => {
  console.log('clicked!', event.target)
})` },
    { type: 'divider' },
    { type: 'h2', text: 'Event delegation — one listener for many elements' },
    { type: 'p', text: 'You could add a click listener to every card — but every time you re-render the list those listeners get destroyed. The better pattern: put one listener on the parent, then figure out which child was clicked.' },
    { type: 'code', lang: 'typescript', text: `app.addEventListener('click', (event) => {
  // walk up the DOM from the clicked element until we hit a card
  const card = (event.target as Element).closest('[data-id]')
  if (!card) return  // clicked outside any card

  const id = Number(card.getAttribute('data-id'))
  const post = posts.find(p => p.id === id)
  console.log('clicked post:', post.title)
})` },
    { type: 'note', text: 'data-id is a custom HTML attribute for storing data on an element. closest() walks up the DOM tree to find the nearest matching ancestor.' },
    { type: 'divider' },
    { type: 'h2', text: 'Your task' },
    { type: 'task', steps: [
      'Run the starter — clicking cards does nothing yet',
      'Add a click listener on app using event delegation (see code above)',
      'When a card is clicked, find the matching post with posts.find()',
      'Write a renderDetail(post) function that replaces the feed with the full post',
      'Add a "← Back" button in the detail view that calls renderFeed() to go back',
    ]},
    { type: 'tip', text: 'Fetch extra data in the detail view:\nconst comments = await (await fetch(`https://jsonplaceholder.typicode.com/posts/${post.id}/comments`)).json()' },
    { type: 'callout', text: 'Done when: clicking a card shows the full post, and Back returns to the feed.' },
  ],
}
