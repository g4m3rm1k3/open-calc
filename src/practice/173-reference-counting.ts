import type { PracticeChallenge } from './loader'

export const title = 'Reference Counting'

const challenges: PracticeChallenge[] = [
  {
    level: 1,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Write `makeRefCounted()` returning `{ addRef(), removeRef(), count, isFreed }`. `isFreed` must flip to `true` the INSTANT `count` reaches `0` after a `removeRef()` call — no delay, no separate pass.',
        starter: '',
        tests: `
const obj = makeRefCounted()
assert (obj.addRef(), true)
assert obj.count === 1 && obj.isFreed === false
assert (obj.addRef(), true)
assert obj.count === 2 && obj.isFreed === false
assert (obj.removeRef(), true)
assert obj.count === 1 && obj.isFreed === false
assert (obj.removeRef(), true)
assert obj.count === 0 && obj.isFreed === true
`,
        solution: `function makeRefCounted() {
  let count = 0
  let freed = false
  return {
    addRef() { count++ },
    removeRef() { count--; if (count === 0) freed = true },
    get count() { return count },
    get isFreed() { return freed },
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
        prompt: 'Finish `createCycle()`: `a` and `b` must reference EACH OTHER (`a.addRef()` for `b`\'s reference to `a`, `b.addRef()` for `a`\'s reference to `b`) in addition to their external references, before those external references are removed — demonstrating that pure reference counting can\'t free a cycle even when nothing outside it points to either object anymore.',
        starter: 'function makeRefCounted() {\n  let count = 0\n  let freed = false\n  return {\n    addRef() { count++ },\n    removeRef() { count--; if (count === 0) freed = true },\n    get count() { return count },\n    get isFreed() { return freed },\n  }\n}\nfunction createCycle() {\n  const a = makeRefCounted()\n  const b = makeRefCounted()\n  a.addRef()\n  b.addRef()\n  // TODO: a and b must reference EACH OTHER too (a.addRef() for b\'s\n  // reference to a, b.addRef() for a\'s reference to b), simulating a cycle,\n  // before the external references are removed below\n  a.removeRef()\n  b.removeRef()\n  return { a, b }\n}',
        tests: `
const cycle = createCycle()
assert cycle.a.isFreed === false
assert cycle.b.isFreed === false
assert cycle.a.count === 1
assert cycle.b.count === 1
`,
        solution: `function makeRefCounted() {
  let count = 0
  let freed = false
  return {
    addRef() { count++ },
    removeRef() { count--; if (count === 0) freed = true },
    get count() { return count },
    get isFreed() { return freed },
  }
}
function createCycle() {
  const a = makeRefCounted()
  const b = makeRefCounted()
  a.addRef()
  b.addRef()
  a.addRef()
  b.addRef()
  a.removeRef()
  b.removeRef()
  return { a, b }
}`,
      },
    ],
  },
  {
    level: 3,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Write `collectCycles(objects, externalRoots)` — a supplementary cycle detector: trace reachability from `externalRoots` outward through each object\'s `refs`, then return every object NOT reached, even if its own reference count would never naturally hit zero (because it\'s only kept "alive" by another object in the same unreachable cycle).',
        starter: '',
        tests: `
const objects = {
  A: { refs: ['B'] },
  B: { refs: ['A'] },
  C: { refs: [] },
}
const externalRoots = ['C']
assert JSON.stringify(collectCycles(objects, externalRoots).sort()) === JSON.stringify(['A','B'])
`,
        solution: `function collectCycles(objects, externalRoots) {
  const reachable = new Set(externalRoots)
  const queue = [...externalRoots]
  while (queue.length > 0) {
    const id = queue.shift()
    for (const ref of objects[id].refs) {
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
]

export default challenges
