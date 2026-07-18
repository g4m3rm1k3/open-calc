import type { PracticeChallenge } from './loader'

export const title = 'Garbage Collection'

const challenges: PracticeChallenge[] = [
  {
    level: 1,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Write `makeTracker()` returning `{ create(id), addRef(id), removeRef(id), isReachable(id) }`, tracking a reference count per object. An object is reachable while its count is `> 0`; it only becomes unreachable once EVERY reference has been removed.',
        starter: '',
        tests: `
const tracker = makeTracker()
const objId = tracker.create('obj1')
assert (tracker.addRef(objId), true)
assert (tracker.addRef(objId), true)
assert tracker.isReachable(objId) === true
assert (tracker.removeRef(objId), true)
assert tracker.isReachable(objId) === true
assert (tracker.removeRef(objId), true)
assert tracker.isReachable(objId) === false
`,
        solution: `function makeTracker() {
  const registry = new Map()
  return {
    create(id) { registry.set(id, { refs: 0 }); return id },
    addRef(id) { registry.get(id).refs++ },
    removeRef(id) { registry.get(id).refs-- },
    isReachable(id) { return registry.get(id).refs > 0 },
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
        prompt: 'Fix `findUnreachableObjects(objects, roots)`: trace OUTWARD from `roots` through every object\'s `refs` — an object referenced by something already reachable is ALSO reachable, transitively, not just the roots themselves. Return the ids of everything NEVER reached by that trace.',
        starter: 'function findUnreachableObjects(objects, roots) {\n  // TODO: trace OUTWARD from the roots through every object\'s refs — an\n  // object referenced by something reachable is ALSO reachable, not just\n  // the roots themselves\n  const reachable = new Set(roots)\n  return Object.keys(objects).filter(id => !reachable.has(id))\n}',
        tests: `
const objects = {
  A: { refs: ['B'] },
  B: { refs: ['C'] },
  C: { refs: [] },
  D: { refs: [] },
}
const roots = ['A']
assert JSON.stringify(findUnreachableObjects(objects, roots).sort()) === JSON.stringify(['D'])
`,
        solution: `function findUnreachableObjects(objects, roots) {
  const reachable = new Set(roots)
  const queue = [...roots]
  while (queue.length > 0) {
    const id = queue.shift()
    const obj = objects[id]
    for (const ref of obj.refs) {
      if (!reachable.has(ref)) {
        reachable.add(ref)
        queue.push(ref)
      }
    }
  }
  return Object.keys(objects).filter(id => !reachable.has(id))
}`,
      },
    ],
  },
  {
    level: 3,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Write `makeBoundedCache(maxSize)` returning `{ set(key, value), size }`. Once the cache reaches `maxSize`, adding a genuinely NEW key must evict the oldest entry first — an ever-growing cache with no eviction is a real "logical" memory leak even though the GC correctly sees every entry as reachable.',
        starter: '',
        tests: `
const cache = makeBoundedCache(3)
assert (cache.set('a', 1), true)
assert (cache.set('b', 2), true)
assert (cache.set('c', 3), true)
assert (cache.set('d', 4), true)
assert cache.size === 3
`,
        solution: `function makeBoundedCache(maxSize) {
  const cache = new Map()
  return {
    set(key, value) {
      if (cache.size >= maxSize && !cache.has(key)) {
        const oldestKey = cache.keys().next().value
        cache.delete(oldestKey)
      }
      cache.set(key, value)
    },
    get size() { return cache.size },
  }
}`,
      },
    ],
  },
]

export default challenges
