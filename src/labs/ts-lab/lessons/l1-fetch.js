export default {
  id: 'l1-fetch',
  title: 'Your first fetch',
  phase: 1,
  phaseLabel: 'Phase 1 — Connect to data',
  tags: ['fetch', 'async/await', 'JSON'],

  verify(doc) {
    const app = doc.getElementById('app')
    if (!app) return { pass: false, message: 'No #app element found — make sure you\'re rendering into document.getElementById(\'app\')' }
    const items = [...app.querySelectorAll('*')].filter(el => el.children.length === 0 && el.textContent.trim().length > 8)
    if (items.length < 5) return { pass: false, message: `Found ${items.length} text item${items.length === 1 ? '' : 's'} — you need at least 5 post titles visible in the preview` }
    const hasRealContent = items.some(el => !el.classList.contains('skeleton'))
    if (!hasRealContent) return { pass: false, message: 'Still showing loading skeletons — the fetch may have failed. Check the Events tab.' }
    return { pass: true, message: `${items.length} posts rendered — nice work!` }
  },

  starter: `const app = document.getElementById('app')

// Show a loading skeleton while we wait for the network
app.innerHTML = \`
  <nav class="nav">
    <span class="nav-brand">OpenSocial</span>
  </nav>
  <div class="container mt-4">
    \${[1,2,3,4,5].map(() => \`
      <div class="card">
        <div class="skeleton mb-2" style="height:16px;width:65%"></div>
        <div class="skeleton mb-1" style="height:13px;width:90%"></div>
        <div class="skeleton" style="height:13px;width:40%"></div>
      </div>
    \`).join('')}
  </div>
\`

// 1. Make the request
const response = await fetch('https://jsonplaceholder.typicode.com/posts?_limit=5')

// 2. Parse the JSON body — returns an array of posts
const posts = await response.json()

// 3. Log it so you can see the shape of the data
console.log('First post:', posts[0])

// TODO: Replace the loading skeleton with real posts
// Each post has: id, userId, title, body
// Hint: app.innerHTML = posts.map(p => \`<div class="card">...\`).join('')
`,

  content: [
    { type: 'p', text: 'You\'re going to build OpenSocial — a real social platform. By lesson 10 you\'ll have authentication, persistent state, a router, and forms. All in vanilla TypeScript.' },
    { type: 'p', text: 'First step: connect to a live API and get data onto the screen.' },
    { type: 'divider' },
    { type: 'h2', text: 'What is fetch?' },
    { type: 'p', text: 'fetch is the browser\'s built-in HTTP client. Give it a URL, get back whatever the server sends.' },
    { type: 'code', lang: 'typescript', text: `const response = await fetch('https://example.com/posts')
const posts = await response.json()  // parse the JSON body

console.log(posts[0].title)` },
    { type: 'note', text: 'Two awaits — one for the response headers, one for the body. The body is a stream that has to fully download before you can parse it.' },
    { type: 'divider' },
    { type: 'h2', text: 'The design system' },
    { type: 'p', text: 'The sandbox has CSS classes built in. Use them so the app looks good from the start:' },
    { type: 'code', lang: 'html', text: `<nav class="nav"><span class="nav-brand">OpenSocial</span></nav>
<div class="container">
  <div class="card card-clickable">
    <p class="title-sm">Post title here</p>
    <p class="body-text">Post body here</p>
  </div>
</div>` },
    { type: 'divider' },
    { type: 'h2', text: 'Your task' },
    { type: 'task', steps: [
      'Run the code — you\'ll see a loading skeleton, then the first post logged to the Console tab',
      'Open the Console tab and look at the post object — find title and body',
      'Replace the TODO with real rendered posts using the .card class',
      'Hit ✓ Check when you can see 5 posts in the preview',
    ]},
    { type: 'tip', text: 'app.innerHTML = `<nav class="nav">...</nav><div class="container">${posts.map(p => `<div class="card"><p class="title-sm">${p.title}</p></div>`).join(\'\')}</div>`' },
    { type: 'callout', text: 'Done when: 5 posts appear in the preview with the nav bar and card styling.' },
  ],
}
