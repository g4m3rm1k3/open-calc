import type { PracticeChallenge } from './loader'

export const title = 'Caching'

const challenges: PracticeChallenge[] = [
  {
    level: 1,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Write `makeProfileCache()` returning `{ get(userId), updateProfile(userId, newData) }`. `get` caches on first fetch (`fromCache: false`) and serves from cache thereafter (`fromCache: true`); `updateProfile` updates the real data AND invalidates the stale cache entry.',
        starter: '',
        tests: `
const cache = makeProfileCache()
assert JSON.stringify(cache.get(42)) === JSON.stringify({name:'Alice', fromCache:false})
assert JSON.stringify(cache.get(42)) === JSON.stringify({name:'Alice', fromCache:true})
assert (cache.updateProfile(42, {name:'Alice Smith'}), true)
assert JSON.stringify(cache.get(42)) === JSON.stringify({name:'Alice Smith', fromCache:false})
`,
        solution: `function makeProfileCache() {
  const cache = new Map()
  const db = { 42: { name: 'Alice' } }
  return {
    get(userId) {
      if (cache.has(userId)) return { ...cache.get(userId), fromCache: true }
      const data = db[userId]
      cache.set(userId, data)
      return { ...data, fromCache: false }
    },
    updateProfile(userId, newData) {
      db[userId] = newData
      cache.delete(userId)
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
        prompt: 'Fix `updateProfile`: it must invalidate the now-stale cache entry after updating the real data — without this, `get()` keeps serving the OLD cached value indefinitely, even though the underlying data has changed.',
        starter: 'function makeProfileCache() {\n  const cache = new Map()\n  const db = { 42: { name: \'Alice\' } }\n  return {\n    get(userId) {\n      if (cache.has(userId)) return { ...cache.get(userId), fromCache: true }\n      const data = db[userId]\n      cache.set(userId, data)\n      return { ...data, fromCache: false }\n    },\n    updateProfile(userId, newData) {\n      // TODO: updating the real data must also INVALIDATE the now-stale\n      // cache entry — otherwise get() keeps serving the old cached value\n      db[userId] = newData\n    },\n  }\n}',
        tests: `
const cache = makeProfileCache()
assert (cache.get(42), true)
assert (cache.updateProfile(42, {name:'Alice Smith'}), true)
const result = cache.get(42)
assert result.name === 'Alice Smith'
assert result.fromCache === false
`,
        solution: `function makeProfileCache() {
  const cache = new Map()
  const db = { 42: { name: 'Alice' } }
  return {
    get(userId) {
      if (cache.has(userId)) return { ...cache.get(userId), fromCache: true }
      const data = db[userId]
      cache.set(userId, data)
      return { ...data, fromCache: false }
    },
    updateProfile(userId, newData) {
      db[userId] = newData
      cache.delete(userId)
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
        prompt: 'Write `makeCacheWithTTL(ttlMs, nowFn)` returning `{ get(userId), dbCalls }`. A cache entry is only valid while `nowFn() - cachedAt < ttlMs`; once the TTL passes, treat it as a miss and re-fetch, incrementing `dbCalls` — this is the tradeoff between staleness and load a cache TTL has to balance.',
        starter: '',
        tests: `
let currentTime = 0
const cache = makeCacheWithTTL(1000, () => currentTime)
assert (cache.get(42), true)
assert (cache.get(42), true)
assert cache.dbCalls === 1
currentTime = 1500
assert (cache.get(42), true)
assert cache.dbCalls === 2
`,
        solution: `function makeCacheWithTTL(ttlMs, nowFn) {
  const cache = new Map()
  const db = { 42: { name: 'Alice' } }
  let dbCalls = 0
  return {
    get(userId) {
      const cached = cache.get(userId)
      if (cached && nowFn() - cached.cachedAt < ttlMs) {
        return { ...cached.data, fromCache: true }
      }
      dbCalls++
      const data = db[userId]
      cache.set(userId, { data, cachedAt: nowFn() })
      return { ...data, fromCache: false }
    },
    get dbCalls() { return dbCalls },
  }
}`,
      },
    ],
  },
]

export default challenges
