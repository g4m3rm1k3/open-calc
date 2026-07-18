import type { PracticeChallenge } from './loader'

export const title = 'Authentication vs Authorization'

const challenges: PracticeChallenge[] = [
  {
    level: 1,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Write `authenticate(users, username, password)` (verifies WHO — returns `{ authenticated, username, role }` or `{ authenticated: false }`) and `authorize(session, action)` (verifies WHAT — for `\'delete-any-account\'`, only an `admin` role passes; every other action is allowed for any authenticated session).',
        starter: '',
        tests: `
const users = { alice: { password: 'secret123', role: 'admin' }, bob: { password: 'hunter2', role: 'user' } }
const bobSession = authenticate(users, 'bob', 'hunter2')
assert bobSession.authenticated === true
assert authorize(bobSession, 'delete-any-account') === false
const aliceSession = authenticate(users, 'alice', 'secret123')
assert authorize(aliceSession, 'delete-any-account') === true
`,
        solution: `function authenticate(users, username, password) {
  const user = users[username]
  if (!user || user.password !== password) return { authenticated: false }
  return { authenticated: true, username, role: user.role }
}
function authorize(session, action) {
  if (!session.authenticated) return false
  if (action === 'delete-any-account') return session.role === 'admin'
  return true
}`,
      },
    ],
  },
  {
    level: 2,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Fix `authorizePerResource(session, action, resource)`: being authenticated isn\'t enough to edit ANY document — for `\'edit-document\'`, only the document\'s OWNER (`session.username === resource.ownerId`) or an `admin` should pass.',
        starter: 'function authorizePerResource(session, action, resource) {\n  // TODO: an authenticated user isn\'t automatically allowed to edit ANY\n  // document — only the document\'s OWNER (or an admin) should pass for\n  // \'edit-document\'; check session.username against resource.ownerId\n  if (!session.authenticated) return false\n  return true\n}',
        tests: `
const doc = { id: 1, ownerId: 'bob' }
const bobSession = { authenticated: true, username: 'bob', role: 'user' }
const carolSession = { authenticated: true, username: 'carol', role: 'user' }
const adminSession = { authenticated: true, username: 'alice', role: 'admin' }
assert authorizePerResource(bobSession, 'edit-document', doc) === true
assert authorizePerResource(carolSession, 'edit-document', doc) === false
assert authorizePerResource(adminSession, 'edit-document', doc) === true
`,
        solution: `function authorizePerResource(session, action, resource) {
  if (!session.authenticated) return false
  if (session.role === 'admin') return true
  if (action === 'edit-document') return session.username === resource.ownerId
  return true
}`,
      },
    ],
  },
  {
    level: 3,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Write `handleApiRequest(session, action)` returning `{ allowed, reason? }` — the server-side check for `\'delete-any-account\'`. It must decide based ONLY on `session.role`, never on any client-supplied UI hint the session object might also carry (like a claimed `uiShowsAdminPanel` flag) — a hidden button client-side is not real authorization.',
        starter: '',
        tests: `
const forgedSession = { authenticated: true, username: 'bob', role: 'user', uiShowsAdminPanel: true }
const result = handleApiRequest(forgedSession, 'delete-any-account')
assert result.allowed === false
`,
        solution: `function handleApiRequest(session, action) {
  if (!session.authenticated) return { allowed: false, reason: 'not authenticated' }
  if (action === 'delete-any-account' && session.role !== 'admin') {
    return { allowed: false, reason: 'not authorized' }
  }
  return { allowed: true }
}`,
      },
    ],
  },
]

export default challenges
