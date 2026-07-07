export default {
  id: 'l2-render-list',
  title: 'Build a real feed',
  phase: 1,
  phaseLabel: 'Phase 1 — Connect to data',
  tags: ['Array.map', 'template literals', 'CSS'],
  starter: `// OpenSocial — Lesson 2
// Goal: make the feed look like a real product

const app = document.getElementById('app')
const posts = await (await fetch('https://jsonplaceholder.typicode.com/posts?_limit=10')).json()

// This renders a basic list — your job is to make it look good
app.innerHTML = \`
  <div style="max-width:600px;margin:0 auto;padding:20px">
    <h1 style="font-size:28px;margin-bottom:24px">OpenSocial</h1>
    \${posts.map(p => \`
      <div style="border:1px solid #e2e8f0;border-radius:8px;padding:16px;margin-bottom:12px">
        <div style="font-size:18px;font-weight:600">\${p.title}</div>
      </div>
    \`).join('')}
  </div>
\`
`,
  content: [
    { type: 'p', text: 'The data is flowing. Now make it look like something a person would actually use.' },
    { type: 'divider' },
    { type: 'h2', text: 'Chaining awaits' },
    { type: 'p', text: 'When you only need the parsed data — not the response object itself — you can collapse both awaits onto one line:' },
    { type: 'code', lang: 'typescript', text: `// Two lines
const response = await fetch(url)
const posts = await response.json()

// Chained onto one line — same result
const posts = await (await fetch(url)).json()` },
    { type: 'divider' },
    { type: 'h2', text: 'Array.map + template literals' },
    { type: 'p', text: 'The pattern for turning data into HTML is always the same: map over the array, return an HTML string per item, join the results.' },
    { type: 'code', lang: 'typescript', text: `const html = posts.map(post => \`
  <div>
    <h2>\${post.title}</h2>
    <p>\${post.body}</p>
  </div>
\`).join('')

app.innerHTML = html` },
    { type: 'note', text: '.join(\'\') is important — without it Array.toString() puts commas between every card.' },
    { type: 'divider' },
    { type: 'h2', text: 'Your task' },
    { type: 'task', steps: [
      'Run the starter — you should see a basic list of post titles',
      'Add the post body below each title (p.body)',
      'Add "by User #" + p.userId as a byline at the bottom of each card',
      'Style the cards: try adding a hover effect or a colored left border',
    ]},
    { type: 'tip', text: 'Hover effect with inline styles:\nonmouseover="this.style.borderColor=\'#2563eb\'"\nonmouseout="this.style.borderColor=\'#e2e8f0\'"' },
    { type: 'callout', text: 'Done when: each card shows title, body, and a user byline.' },
  ],
}
