export default {
  id: 'l10-auth',
  title: 'Authentication',
  phase: 4,
  phaseLabel: 'Phase 4 — Write data',
  tags: ['auth', 'JWT', 'login', 'tokens'],

  verify(doc) {
    const win = doc.defaultView
    if (!win) return { pass: false, message: 'Run the code first' }
    const token = win.localStorage.getItem('opensocial:token')
    const user = win.localStorage.getItem('opensocial:user')
    if (!token && !user) {
      const loginForm = doc.querySelector('#login-form, form')
      if (!loginForm) return { pass: false, message: 'No login form found — run the code first' }
      return { pass: false, message: 'Not logged in yet — enter "Bret" as username with any password and sign in' }
    }
    const username = user ? JSON.parse(user).username : '?'
    const feed = doc.querySelector('.card')
    if (!feed) return { pass: false, message: `Logged in as @${username} but the feed hasn't loaded yet` }
    const myPosts = doc.querySelector('.badge-blue, [class*="your"]')
    if (!myPosts) return { pass: false, message: `Logged in as @${username} and feed loaded — add "Your post" badges to posts by the current user` }
    return { pass: true, message: `Authenticated as @${username} — token stored, feed loaded, and user posts are highlighted!` }
  },

  starter: `// OpenSocial — Lesson 10
// The final piece: authentication. Who is the current user?
// We simulate login here (JSONPlaceholder has no auth), but the
// patterns — token storage, protected routes, auth headers — are real.

const app = document.getElementById('app')!

interface User { id: number; name: string; username: string; email: string }
interface Post { id: number; userId: number; title: string; body: string }

// ── Auth helpers ──────────────────────────────────────────────────────

function getToken(): string | null {
  return localStorage.getItem('opensocial:token')
}

function getUser(): User | null {
  const raw = localStorage.getItem('opensocial:user')
  try { return raw ? JSON.parse(raw) : null } catch { return null }
}

function login(user: User, token: string) {
  localStorage.setItem('opensocial:token', token)
  localStorage.setItem('opensocial:user', JSON.stringify(user))
  setState({ view: 'feed' })
}

function logout() {
  localStorage.removeItem('opensocial:token')
  localStorage.removeItem('opensocial:user')
  setState({ view: 'login' })
}

// ── Authenticated fetch ───────────────────────────────────────────────
// Real APIs require a token in the Authorization header for protected endpoints.

async function authFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const token = getToken()
  return fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: \`Bearer \${token}\` } : {}),
      ...options.headers,
    },
  })
}

// ── State ─────────────────────────────────────────────────────────────
const state: {
  view: 'login' | 'feed'
  posts: Post[]
  user: User | null
  loginError: string
} = {
  view: getToken() ? 'feed' : 'login',  // if token exists, skip login
  posts: [],
  user: getUser(),
  loginError: '',
}

function setState(patch: Partial<typeof state>) { Object.assign(state, patch); render() }

// ── Views ─────────────────────────────────────────────────────────────
function LoginView(error: string): string {
  return \`
    <div style="max-width:380px;margin:80px auto;padding:32px;border:1px solid #e2e8f0;border-radius:12px">
      <h1 style="font-size:24px;margin:0 0 8px">OpenSocial</h1>
      <p style="color:#64748b;font-size:14px;margin:0 0 28px">Sign in to your account</p>
      \${error ? \`<div style="padding:10px 14px;background:#fee2e2;color:#991b1b;border-radius:6px;font-size:13px;margin-bottom:16px">\${error}</div>\` : ''}
      <form id="login-form">
        <div style="margin-bottom:14px">
          <label style="display:block;font-size:13px;font-weight:600;margin-bottom:5px">Username</label>
          <input id="username" type="text" placeholder="Try: Bret" autocomplete="username"
            style="width:100%;padding:9px 12px;border:1px solid #e2e8f0;border-radius:6px;font-size:14px;outline:none;box-sizing:border-box">
        </div>
        <div style="margin-bottom:20px">
          <label style="display:block;font-size:13px;font-weight:600;margin-bottom:5px">Password</label>
          <input id="password" type="password" placeholder="Any password works"
            style="width:100%;padding:9px 12px;border:1px solid #e2e8f0;border-radius:6px;font-size:14px;outline:none;box-sizing:border-box">
        </div>
        <button type="submit"
          style="width:100%;padding:10px;background:#2563eb;color:#fff;border:none;border-radius:6px;font-size:14px;font-weight:600;cursor:pointer">
          Sign in
        </button>
      </form>
    </div>
  \`
}

function FeedView(posts: Post[], user: User | null): string {
  return \`
    <div style="max-width:600px;margin:0 auto;padding:20px">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:24px">
        <h1 style="font-size:28px;margin:0">OpenSocial</h1>
        <div style="display:flex;align-items:center;gap:12px">
          \${user ? \`<span style="font-size:13px;color:#64748b">@\${user.username}</span>\` : ''}
          <button id="logout" style="padding:6px 14px;background:none;border:1px solid #e2e8f0;border-radius:6px;font-size:13px;cursor:pointer">Sign out</button>
        </div>
      </div>
      \${posts.map(p => \`
        <div style="border:1px solid #e2e8f0;border-radius:8px;padding:16px;margin-bottom:12px">
          <h2 style="font-size:17px;font-weight:600;margin:0 0 6px">\${p.title}</h2>
          <p style="color:#64748b;font-size:14px;margin:0 0 8px">\${p.body.slice(0,80)}...</p>
          \${p.userId === user?.id ? \`<span style="font-size:11px;font-weight:700;color:#2563eb;background:#eff6ff;padding:2px 8px;border-radius:999px">Your post</span>\` : ''}
        </div>
      \`).join('')}
    </div>
  \`
}

function render() {
  if (state.view === 'login') {
    app.innerHTML = LoginView(state.loginError)
    document.getElementById('login-form')!.addEventListener('submit', async e => {
      e.preventDefault()
      const username = (document.getElementById('username') as HTMLInputElement).value.trim()
      const password = (document.getElementById('password') as HTMLInputElement).value

      if (!username || !password) {
        setState({ loginError: 'Please enter a username and password' })
        return
      }

      // Find the user by username (simulating a login API call)
      const users: User[] = await (await fetch('https://jsonplaceholder.typicode.com/users')).json()
      const user = users.find(u => u.username.toLowerCase() === username.toLowerCase())

      if (!user) {
        setState({ loginError: \`No account found for "\${username}". Try: Bret, Antonette, Samantha\` })
        return
      }

      // In a real app the server returns a JWT. We simulate one.
      const token = btoa(\`\${user.id}:\${Date.now()}\`)
      login(user, token)
    })
  }

  if (state.view === 'feed') {
    app.innerHTML = FeedView(state.posts, state.user)
    document.getElementById('logout')!.addEventListener('click', logout)
  }
}

// Boot: render immediately (login screen or feed based on stored token)
render()

// Load posts in background if already logged in
if (getToken()) {
  authFetch('https://jsonplaceholder.typicode.com/posts?_limit=20')
    .then(r => r.json())
    .then((posts: Post[]) => setState({ posts }))
}
`,
  content: [
    { type: 'p', text: 'Every social platform needs to know who you are. Authentication is how the server establishes identity — and it\'s one of the most important concepts to understand before working with any real API.' },
    { type: 'divider' },
    { type: 'h2', text: 'How token auth works' },
    { type: 'p', text: 'The flow is always the same, regardless of the platform:' },
    { type: 'task', steps: [
      'User submits username + password',
      'Server verifies credentials and returns a token (usually a JWT)',
      'Client stores the token (localStorage)',
      'Every subsequent request includes the token in the Authorization header',
      'Server validates the token and knows who\'s making the request',
    ]},
    { type: 'divider' },
    { type: 'h2', text: 'Storing and sending the token' },
    { type: 'code', lang: 'typescript', text: `// Store after login
localStorage.setItem('token', tokenFromServer)

// Send with every request
const response = await fetch('/api/posts', {
  headers: {
    Authorization: \`Bearer \${localStorage.getItem('token')}\`
  }
})` },
    { type: 'divider' },
    { type: 'h2', text: 'Protected routes' },
    { type: 'p', text: 'Check for a token before showing protected content. If there\'s no token, redirect to the login view:' },
    { type: 'code', lang: 'typescript', text: `function render() {
  const token = localStorage.getItem('token')

  if (!token) {
    app.innerHTML = LoginView()  // force login
    return
  }

  app.innerHTML = FeedView()   // show protected content
}` },
    { type: 'note', text: 'We\'re simulating auth here — JSONPlaceholder has no real login endpoint. In a real app the server validates credentials and issues a JWT. The client-side patterns are identical.' },
    { type: 'divider' },
    { type: 'h2', text: 'Your task' },
    { type: 'task', steps: [
      'Run the starter — try logging in with username "Bret" (any password works)',
      'After login, refresh the page — you should still be logged in (token persists)',
      'Note how "Your post" badges appear next to posts by the logged-in user',
      'Add a Profile view that fetches the current user\'s posts and shows them',
      'Add a Sign up form that "creates" a new user via POST /users',
    ]},
    { type: 'tip', text: 'Valid test usernames: Bret, Antonette, Samantha, Karianne, Kamren, Leopoldo_Corkery, Elwyn.Skiles, Maxime_Nienow, Delphine, Moriah.Stanton' },
    { type: 'callout', text: 'Done when: login persists across refresh, logout clears the token, and the feed shows "Your post" badges correctly.' },
  ],
}
