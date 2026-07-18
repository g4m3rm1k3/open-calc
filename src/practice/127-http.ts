import type { PracticeChallenge } from './loader'

export const title = 'HTTP'

const challenges: PracticeChallenge[] = [
  {
    level: 1,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Write `handleRequest(method, path)` returning `{ status, body }`: `GET /users/42` returns `200` with `{ name: \'Alice\' }`; `GET /users/99` returns `404` with `null` body; anything else returns `405`.',
        starter: '',
        tests: `
assert JSON.stringify(handleRequest('GET','/users/42')) === JSON.stringify({status:200, body:{name:'Alice'}})
assert JSON.stringify(handleRequest('GET','/users/99')) === JSON.stringify({status:404, body:null})
`,
        solution: `function handleRequest(method, path) {
  const users = { 42: { name: 'Alice' } }
  if (method === 'GET' && path === '/users/42') {
    return { status: 200, body: users[42] }
  }
  if (method === 'GET' && path === '/users/99') {
    return { status: 404, body: null }
  }
  return { status: 405, body: null }
}`,
      },
    ],
  },
  {
    level: 2,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Fix `handleRequest` so `POST /users` returns `201` (Created), not `200` — a successful creation and a successful read are both "2xx success," but they carry different, conventional status codes.',
        starter: 'function handleRequest(method, path) {\n  const users = { 42: { name: \'Alice\' } }\n  if (method === \'GET\' && path === \'/users/42\') {\n    return { status: 200, body: users[42] }\n  }\n  // TODO: a successful POST that creates a new resource should return 201\n  // (Created), not 200 — they\'re both "successful" but mean different things\n  if (method === \'POST\' && path === \'/users\') {\n    return { status: 200, body: { name: \'New User\' } }\n  }\n  return { status: 405, body: null }\n}',
        tests: `
assert JSON.stringify(handleRequest('POST','/users')) === JSON.stringify({status:201, body:{name:'New User'}})
assert JSON.stringify(handleRequest('GET','/users/42')) === JSON.stringify({status:200, body:{name:'Alice'}})
`,
        solution: `function handleRequest(method, path) {
  const users = { 42: { name: 'Alice' } }
  if (method === 'GET' && path === '/users/42') {
    return { status: 200, body: users[42] }
  }
  if (method === 'POST' && path === '/users') {
    return { status: 201, body: { name: 'New User' } }
  }
  return { status: 405, body: null }
}`,
      },
    ],
  },
  {
    level: 3,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Write `classifyStatus(code)` returning `\'success\'` for 2xx, `\'client error\'` for 4xx, `\'server error\'` for 5xx, or `\'other\'` — distinguishing "the request itself was wrong" from "the server failed on a valid request," which need different handling.',
        starter: '',
        tests: `
assert classifyStatus(200) === 'success'
assert classifyStatus(201) === 'success'
assert classifyStatus(404) === 'client error'
assert classifyStatus(500) === 'server error'
`,
        solution: `function classifyStatus(code) {
  if (code >= 200 && code < 300) return 'success'
  if (code >= 400 && code < 500) return 'client error'
  if (code >= 500 && code < 600) return 'server error'
  return 'other'
}`,
      },
    ],
  },
]

export default challenges
