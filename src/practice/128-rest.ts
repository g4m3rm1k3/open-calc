import type { PracticeChallenge } from './loader'

export const title = 'REST'

const challenges: PracticeChallenge[] = [
  {
    level: 1,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Write `makeRestRouter()` returning `{ handle(method, path) }`, organizing operations around the `/users` resource: `GET /users/42` reads, `POST /users` creates (returning `201` with a new `id`), `DELETE /users/42` removes (returning `204`).',
        starter: '',
        tests: `
const router = makeRestRouter()
assert JSON.stringify(router.handle('GET','/users/42')) === JSON.stringify({status:200, body:{name:'Alice'}})
const created = router.handle('POST','/users')
assert created.status === 201
assert created.body.id === 43
assert JSON.stringify(router.handle('DELETE','/users/42')) === JSON.stringify({status:204, body:null})
`,
        solution: `function makeRestRouter() {
  const users = { 42: { name: 'Alice' } }
  let nextId = 43
  return {
    handle(method, path) {
      if (method === 'GET' && path === '/users/42') return { status: 200, body: users[42] }
      if (method === 'POST' && path === '/users') {
        const id = nextId++
        users[id] = { name: 'NewUser' }
        return { status: 201, body: { id, ...users[id] } }
      }
      if (method === 'DELETE' && path === '/users/42') {
        delete users[42]
        return { status: 204, body: null }
      }
      return { status: 404, body: null }
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
        prompt: 'Fix `PUT /users/42`: it must UPDATE the stored user with the given body and return the updated resource — not just echo the incoming body straight back without ever touching the stored data.',
        starter: 'function makeRestRouter() {\n  const users = { 42: { name: \'Alice\' } }\n  return {\n    handle(method, path, body) {\n      if (method === \'GET\' && path === \'/users/42\') return { status: 200, body: users[42] }\n      // TODO: PUT /users/42 should update users[42] with the given body and\n      // return the UPDATED resource, not just echo the incoming body back\n      if (method === \'PUT\' && path === \'/users/42\') {\n        return { status: 200, body: body }\n      }\n      return { status: 404, body: null }\n    },\n  }\n}',
        tests: `
const router = makeRestRouter()
const updated = router.handle('PUT','/users/42', { name: 'Alicia' })
assert updated.status === 200
assert updated.body.name === 'Alicia'
assert router.handle('GET','/users/42').body.name === 'Alicia'
`,
        solution: `function makeRestRouter() {
  const users = { 42: { name: 'Alice' } }
  return {
    handle(method, path, body) {
      if (method === 'GET' && path === '/users/42') return { status: 200, body: users[42] }
      if (method === 'PUT' && path === '/users/42') {
        users[42] = { ...users[42], ...body }
        return { status: 200, body: users[42] }
      }
      return { status: 404, body: null }
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
        prompt: 'Write `makeCommentsRouter()` for a nested resource — blog post comments. `GET /posts/:postId/comments` lists them, `POST /posts/:postId/comments` adds one (`201`, returns the created comment with an `id`), `DELETE /posts/:postId/comments/:commentId` removes one (`204`).',
        starter: '',
        tests: `
const router = makeCommentsRouter()
assert JSON.stringify(router.handle('GET','/posts/1/comments')) === JSON.stringify({status:200, body:[]})
const added = router.handle('POST','/posts/1/comments', { text: 'Nice post!' })
assert added.status === 201
assert added.body.text === 'Nice post!'
const listAfter = router.handle('GET','/posts/1/comments')
assert listAfter.body.length === 1
const deletePath = '/posts/1/comments/' + added.body.id
const deleted = router.handle('DELETE', deletePath)
assert deleted.status === 204
assert router.handle('GET','/posts/1/comments').body.length === 0
`,
        solution: `function makeCommentsRouter() {
  const comments = {}
  let nextId = 1
  function getComments(postId) {
    if (!comments[postId]) comments[postId] = []
    return comments[postId]
  }
  return {
    handle(method, path, body) {
      const listMatch = path.match(/^\\/posts\\/(\\d+)\\/comments$/)
      const itemMatch = path.match(/^\\/posts\\/(\\d+)\\/comments\\/(\\d+)$/)
      if (method === 'GET' && listMatch) {
        return { status: 200, body: getComments(listMatch[1]) }
      }
      if (method === 'POST' && listMatch) {
        const comment = { id: nextId++, text: body.text }
        getComments(listMatch[1]).push(comment)
        return { status: 201, body: comment }
      }
      if (method === 'DELETE' && itemMatch) {
        const postId = itemMatch[1]
        const commentId = itemMatch[2]
        const list = getComments(postId)
        const idx = list.findIndex(c => c.id === Number(commentId))
        if (idx !== -1) list.splice(idx, 1)
        return { status: 204, body: null }
      }
      return { status: 404, body: null }
    },
  }
}`,
      },
    ],
  },
]

export default challenges
