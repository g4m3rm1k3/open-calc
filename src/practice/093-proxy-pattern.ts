import type { PracticeChallenge } from './loader'

export const title = 'Proxy Pattern'

const challenges: PracticeChallenge[] = [
  {
    level: 1,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Write `makeLoggingProxy(realDb)` returning `{ query(sql), getLog() }`. `query` must record every `sql` string it\'s called with (in order) before forwarding the call to `realDb.query(sql)` and returning its result.',
        starter: '',
        tests: `
const realDb = { query: sql => \`Result of: \${sql}\` }
const db = makeLoggingProxy(realDb)
assert db.query('SELECT * FROM users') === 'Result of: SELECT * FROM users'
assert db.query('SELECT * FROM orders') === 'Result of: SELECT * FROM orders'
assert JSON.stringify(db.getLog()) === JSON.stringify(['SELECT * FROM users','SELECT * FROM orders'])
`,
        solution: `function makeLoggingProxy(realDb) {
  const log = []
  return {
    query(sql) {
      log.push(sql)
      return realDb.query(sql)
    },
    getLog() { return log },
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
        prompt: 'Finish `makeCachingProxy(fetchData)` returning `{ fetchData(id) }` — a caching proxy that calls the real `fetchData(id)` only the FIRST time for a given `id`, returning a cached result (without calling it again) on every later call with that same `id`.',
        starter: 'function makeCachingProxy(fetchData) {\n  // TODO: return { fetchData(id) } that calls fetchData(id) only the FIRST time\n  // for a given id, returning a cached result for every later call with that id\n  return {\n    fetchData(id) { return fetchData(id) },\n  }\n}',
        tests: `
let calls = 0
const fetchData = id => { calls++; return \`data-\${id}\` }
const proxy = makeCachingProxy(fetchData)
assert proxy.fetchData(1) === 'data-1'
assert proxy.fetchData(1) === 'data-1'
assert calls === 1
assert proxy.fetchData(2) === 'data-2'
assert calls === 2
`,
        solution: `function makeCachingProxy(fetchData) {
  const cache = new Map()
  return {
    fetchData(id) {
      if (!cache.has(id)) cache.set(id, fetchData(id))
      return cache.get(id)
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
        prompt: 'Write `makeProtectionProxy(realObj, isAdmin)` returning `{ deleteRecord(id) }` — a protection proxy that forwards to `realObj.deleteRecord(id)` only if `isAdmin` is `true`; otherwise it returns `null` WITHOUT calling `realObj.deleteRecord` at all.',
        starter: '',
        tests: `
const realObj = { deleteRecord: id => \`deleted \${id}\` }
const adminProxy = makeProtectionProxy(realObj, true)
const userProxy = makeProtectionProxy(realObj, false)
assert adminProxy.deleteRecord(5) === 'deleted 5'
assert userProxy.deleteRecord(5) === null
`,
        solution: `function makeProtectionProxy(realObj, isAdmin) {
  return {
    deleteRecord(id) {
      if (!isAdmin) return null
      return realObj.deleteRecord(id)
    },
  }
}`,
      },
    ],
  },
]

export default challenges
