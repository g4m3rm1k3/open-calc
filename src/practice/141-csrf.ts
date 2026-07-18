import type { PracticeChallenge } from './loader'

export const title = 'Cross-Site Request Forgery (CSRF)'

const challenges: PracticeChallenge[] = [
  {
    level: 1,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Write `makeServer()` returning `{ renderTransferForm(), transfer(amount, providedToken) }`. `transfer` must reject (`{ ok: false, reason }`) unless `providedToken` matches the server\'s real CSRF token — only obtainable via `renderTransferForm()`.',
        starter: '',
        tests: `
const server = makeServer()
assert JSON.stringify(server.transfer(500,'guessed-token')) === JSON.stringify({ok:false, reason:'invalid or missing CSRF token'})
const form = server.renderTransferForm()
assert JSON.stringify(server.transfer(500, form.token)) === JSON.stringify({ok:true, balance:500})
`,
        solution: `function makeServer() {
  const csrfToken = 'a1b2c3-legit-token'
  let balance = 1000
  return {
    renderTransferForm() { return { token: csrfToken } },
    transfer(amount, providedToken) {
      if (providedToken !== csrfToken) {
        return { ok: false, reason: 'invalid or missing CSRF token' }
      }
      balance -= amount
      return { ok: true, balance }
    },
  }
}`,
      },
    ],
  },
  {
    level: 2,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Fix `deleteAccount(providedToken)`: it\'s a state-changing action just like `transfer`, so it must check `providedToken` against the real CSRF token too — protecting only ONE endpoint while leaving others open is a common, incomplete CSRF defense.',
        starter: 'function makeServer() {\n  const csrfToken = \'a1b2c3-legit-token\'\n  let accountDeleted = false\n  return {\n    renderTransferForm() { return { token: csrfToken } },\n    // TODO: deleteAccount is a state-changing action too — it must check\n    // providedToken against csrfToken exactly like transfer() would\n    deleteAccount(providedToken) {\n      accountDeleted = true\n      return { ok: true }\n    },\n  }\n}',
        tests: `
const server = makeServer()
const result1 = server.deleteAccount('guessed')
assert result1.ok === false
const form = server.renderTransferForm()
const result2 = server.deleteAccount(form.token)
assert result2.ok === true
`,
        solution: `function makeServer() {
  const csrfToken = 'a1b2c3-legit-token'
  let accountDeleted = false
  return {
    renderTransferForm() { return { token: csrfToken } },
    deleteAccount(providedToken) {
      if (providedToken !== csrfToken) {
        return { ok: false, reason: 'invalid or missing CSRF token' }
      }
      accountDeleted = true
      return { ok: true }
    },
  }
}`,
      },
    ],
  },
  {
    level: 3,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Write `makeServerWithRotatingToken()`: after each successful `transfer`, generate a NEW CSRF token so the just-used one becomes stale — a captured/replayed request reusing an old (already-spent) token must be rejected, even though it was valid moments earlier.',
        starter: '',
        tests: `
const server = makeServerWithRotatingToken()
const form = server.renderTransferForm()
const result1 = server.transfer(100, form.token)
assert result1.ok === true
const replay = server.transfer(100, form.token)
assert replay.ok === false
const form2 = server.renderTransferForm()
const result2 = server.transfer(100, form2.token)
assert result2.ok === true
`,
        solution: `function makeServerWithRotatingToken() {
  let csrfToken = 'token-v1'
  let balance = 1000
  let tokenCounter = 1
  return {
    renderTransferForm() { return { token: csrfToken } },
    transfer(amount, providedToken) {
      if (providedToken !== csrfToken) {
        return { ok: false, reason: 'invalid or missing CSRF token' }
      }
      balance -= amount
      tokenCounter++
      csrfToken = 'token-v' + tokenCounter
      return { ok: true, balance }
    },
  }
}`,
      },
    ],
  },
]

export default challenges
