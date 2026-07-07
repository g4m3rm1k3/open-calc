export default {
  id: 'l8-forms',
  title: 'Forms and POST requests',
  phase: 4,
  phaseLabel: 'Phase 4 — Write data',
  tags: ['forms', 'POST', 'fetch', 'input'],

  verify(doc) {
    const form = doc.querySelector('form, #post-form')
    if (!form) return { pass: false, message: 'No form found — click the "+ New post" button to see the form first, then Check' }
    const titleInput = doc.querySelector('input[id*="title"], input[name*="title"]')
    const bodyInput = doc.querySelector('textarea[id*="body"], textarea[name*="body"]')
    if (!titleInput || !bodyInput) return { pass: false, message: 'Form needs both a title input and a body textarea' }
    const submitBtn = doc.querySelector('button[type="submit"]')
    if (!submitBtn) return { pass: false, message: 'Add a <button type="submit"> to the form' }
    const successMsg = doc.querySelector('.alert-success, [class*="success"]')
    if (successMsg) return { pass: true, message: 'Post submitted and success message shown — form is working!' }
    return { pass: true, message: 'Form is ready — fill it out and submit to see the POST request in the Events tab!' }
  },

  starter: `// OpenSocial — Lesson 8
// Users need to create posts. That means forms, input handling, and POST requests.

const app = document.getElementById('app')!

interface Post { id: number; userId: number; title: string; body: string }

const state: {
  view: 'feed' | 'new-post'
  posts: Post[]
  submitting: boolean
  lastCreated: Post | null
} = { view: 'feed', posts: [], submitting: false, lastCreated: null }

function setState(patch: Partial<typeof state>) { Object.assign(state, patch); render() }

// ── New post form ─────────────────────────────────────────────────────
function NewPostForm(submitting: boolean): string {
  return \`
    <div style="max-width:600px;margin:0 auto;padding:20px">
      <button id="back" style="margin-bottom:20px;background:none;border:1px solid #e2e8f0;padding:6px 14px;border-radius:6px;cursor:pointer">← Back</button>
      <h1 style="font-size:24px;margin-bottom:24px">New Post</h1>
      <form id="post-form">
        <div style="margin-bottom:16px">
          <label style="display:block;font-size:13px;font-weight:600;margin-bottom:6px;color:#374151">Title</label>
          <input id="title" name="title" type="text" placeholder="What's on your mind?" required
            style="width:100%;padding:10px 12px;border:1px solid #e2e8f0;border-radius:6px;font-size:14px;outline:none;box-sizing:border-box"
            onfocus="this.style.borderColor='#2563eb'" onblur="this.style.borderColor='#e2e8f0'">
        </div>
        <div style="margin-bottom:20px">
          <label style="display:block;font-size:13px;font-weight:600;margin-bottom:6px;color:#374151">Body</label>
          <textarea id="body" name="body" rows="5" placeholder="Write your post..." required
            style="width:100%;padding:10px 12px;border:1px solid #e2e8f0;border-radius:6px;font-size:14px;outline:none;resize:vertical;box-sizing:border-box;font-family:inherit"
            onfocus="this.style.borderColor='#2563eb'" onblur="this.style.borderColor='#e2e8f0'"></textarea>
        </div>
        <button type="submit"
          style="padding:10px 24px;background:\${submitting ? '#93c5fd' : '#2563eb'};color:#fff;border:none;border-radius:6px;font-size:14px;font-weight:600;cursor:\${submitting ? 'not-allowed' : 'pointer'}">
          \${submitting ? 'Posting...' : 'Publish post'}
        </button>
      </form>
      \${state.lastCreated ? \`
        <div style="margin-top:20px;padding:12px 16px;background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;color:#166534;font-size:14px">
          ✓ Post published! ID: \${state.lastCreated.id} — <strong>\${state.lastCreated.title}</strong>
        </div>
      \` : ''}
    </div>
  \`
}

function Feed(posts: Post[]): string {
  return \`
    <div style="max-width:600px;margin:0 auto;padding:20px">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:24px">
        <h1 style="font-size:28px;margin:0">OpenSocial</h1>
        <button id="new-post" style="padding:8px 16px;background:#2563eb;color:#fff;border:none;border-radius:6px;font-size:13px;font-weight:600;cursor:pointer">+ New post</button>
      </div>
      \${posts.map(p => \`
        <div style="border:1px solid #e2e8f0;border-radius:8px;padding:16px;margin-bottom:12px">
          <h2 style="font-size:17px;font-weight:600;margin:0 0 6px">\${p.title}</h2>
          <p style="color:#64748b;font-size:14px;margin:0">\${p.body.slice(0,80)}...</p>
        </div>
      \`).join('')}
    </div>
  \`
}

function render() {
  if (state.view === 'feed') {
    app.innerHTML = Feed(state.posts)
    document.getElementById('new-post')!.addEventListener('click', () => setState({ view: 'new-post', lastCreated: null }))
  }
  if (state.view === 'new-post') {
    app.innerHTML = NewPostForm(state.submitting)
    document.getElementById('back')!.addEventListener('click', () => setState({ view: 'feed' }))

    document.getElementById('post-form')!.addEventListener('submit', async e => {
      e.preventDefault()
      const title = (document.getElementById('title') as HTMLInputElement).value
      const body = (document.getElementById('body') as HTMLTextAreaElement).value

      setState({ submitting: true })

      // POST the new post to the API
      const created: Post = await (await fetch('https://jsonplaceholder.typicode.com/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, body, userId: 1 }),
      })).json()

      setState({ submitting: false, lastCreated: created })
    })
  }
}

const posts: Post[] = await (await fetch('https://jsonplaceholder.typicode.com/posts?_limit=10')).json()
setState({ posts })
`,
  content: [
    { type: 'p', text: 'So far the app only reads data. Real applications also write it — users create posts, leave comments, update profiles. That means forms and POST requests.' },
    { type: 'divider' },
    { type: 'h2', text: 'Handling form submission' },
    { type: 'p', text: 'Always use addEventListener on the submit event — not onclick on the button. The submit event handles keyboard submission (Enter key) too, and you get the native form validation for free.' },
    { type: 'code', lang: 'typescript', text: `form.addEventListener('submit', async (e) => {
  e.preventDefault()  // stop the browser from reloading the page

  const title = (document.getElementById('title') as HTMLInputElement).value
  const body  = (document.getElementById('body')  as HTMLTextAreaElement).value

  // Now send to the server...
})` },
    { type: 'divider' },
    { type: 'h2', text: 'POST requests with a JSON body' },
    { type: 'p', text: 'GET requests just need a URL. POST requests also need a method, headers, and a body:' },
    { type: 'code', lang: 'typescript', text: `const response = await fetch('https://example.com/posts', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ title, body, userId: 1 }),
})
const created = await response.json()` },
    { type: 'note', text: 'JSONPlaceholder simulates a POST — it returns a fake created object with id: 101 but doesn\'t actually store anything. That\'s fine for learning the pattern.' },
    { type: 'divider' },
    { type: 'h2', text: 'Optimistic vs confirmed UI updates' },
    { type: 'p', text: 'The starter shows a success message after the server responds (confirmed update). A faster pattern is to add the post to the list immediately before the server replies, then update if it fails (optimistic update). Twitter and most social apps use optimistic updates.' },
    { type: 'divider' },
    { type: 'h2', text: 'Your task' },
    { type: 'task', steps: [
      'Run the starter — fill out the form and press Publish, watch the Events tab for the POST request',
      'Add the created post to the top of the feed immediately after it\'s confirmed',
      'Add form validation: show an error message if the title is under 5 characters',
      'Try the optimistic pattern: add the post to the feed before the fetch resolves',
    ]},
    { type: 'tip', text: 'Add the new post optimistically:\nsetState({ posts: [{ id: Date.now(), ...formData }, ...state.posts] })\n// then confirm or rollback after the fetch' },
    { type: 'callout', text: 'Done when: submitting the form shows the new post in the feed.' },
  ],
}
