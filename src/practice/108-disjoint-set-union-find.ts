import type { PracticeChallenge } from './loader'

export const title = 'Disjoint Set / Union-Find'

const challenges: PracticeChallenge[] = [
  {
    level: 1,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Write `makeUnionFind()` returning `{ makeSet(x), find(x), union(a, b) }`. `find` follows parent pointers to a group\'s root (with path compression); `union` merges two elements\' groups by pointing one root at the other.',
        starter: '',
        tests: `
const uf = makeUnionFind()
for (const x of [1,2,3,4,5]) uf.makeSet(x)
assert (uf.union(1,2), true)
assert (uf.union(2,3), true)
assert (uf.union(4,5), true)
assert uf.find(1) === uf.find(3)
assert uf.find(1) !== uf.find(4)
`,
        solution: `function makeUnionFind() {
  const parent = new Map()
  function find(x) {
    if (parent.get(x) !== x) parent.set(x, find(parent.get(x)))
    return parent.get(x)
  }
  return {
    makeSet(x) { parent.set(x, x) },
    find,
    union(a, b) {
      const rootA = find(a), rootB = find(b)
      if (rootA !== rootB) parent.set(rootA, rootB)
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
        prompt: 'Finish `hasCycle(edges, n)`, where `edges` is an array of `[a, b]` pairs over nodes `1..n`. Using `makeUnionFind()`, return `true` if adding all edges in order ever connects two nodes ALREADY in the same group (which means that edge closes a cycle).',
        starter: 'function makeUnionFind() {\n  const parent = new Map()\n  function find(x) {\n    if (parent.get(x) !== x) parent.set(x, find(parent.get(x)))\n    return parent.get(x)\n  }\n  return {\n    makeSet(x) { parent.set(x, x) },\n    find,\n    union(a, b) {\n      const rootA = find(a), rootB = find(b)\n      if (rootA !== rootB) parent.set(rootA, rootB)\n    },\n  }\n}\nfunction hasCycle(edges, n) {\n  // TODO: use makeUnionFind() — for each edge [a,b], if find(a) === find(b)\n  // BEFORE unioning them, that edge closes a cycle; otherwise union(a,b)\n  const uf = makeUnionFind()\n  for (let i = 1; i <= n; i++) uf.makeSet(i)\n  for (const [a, b] of edges) {\n    uf.union(a, b)\n  }\n  return false\n}',
        tests: `
assert hasCycle([[1,2],[2,3],[3,1]], 3) === true
assert hasCycle([[1,2],[2,3]], 3) === false
`,
        solution: `function makeUnionFind() {
  const parent = new Map()
  function find(x) {
    if (parent.get(x) !== x) parent.set(x, find(parent.get(x)))
    return parent.get(x)
  }
  return {
    makeSet(x) { parent.set(x, x) },
    find,
    union(a, b) {
      const rootA = find(a), rootB = find(b)
      if (rootA !== rootB) parent.set(rootA, rootB)
    },
  }
}
function hasCycle(edges, n) {
  const uf = makeUnionFind()
  for (let i = 1; i <= n; i++) uf.makeSet(i)
  for (const [a, b] of edges) {
    if (uf.find(a) === uf.find(b)) return true
    uf.union(a, b)
  }
  return false
}`,
      },
    ],
  },
  {
    level: 3,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Write `countGroups(pairs, n)`, where `pairs` is an array of `[a, b]` unions to apply over nodes `1..n`. Return the number of DISTINCT groups remaining after applying every union.',
        starter: '',
        tests: `
assert countGroups([[1,2],[2,3],[4,5]], 5) === 2
assert countGroups([], 5) === 5
assert countGroups([[1,2],[3,4],[1,3]], 5) === 2
`,
        solution: `function makeUnionFind() {
  const parent = new Map()
  function find(x) {
    if (parent.get(x) !== x) parent.set(x, find(parent.get(x)))
    return parent.get(x)
  }
  return {
    makeSet(x) { parent.set(x, x) },
    find,
    union(a, b) {
      const rootA = find(a), rootB = find(b)
      if (rootA !== rootB) parent.set(rootA, rootB)
    },
  }
}
function countGroups(pairs, n) {
  const uf = makeUnionFind()
  for (let i = 1; i <= n; i++) uf.makeSet(i)
  for (const [a, b] of pairs) uf.union(a, b)
  const roots = new Set()
  for (let i = 1; i <= n; i++) roots.add(uf.find(i))
  return roots.size
}`,
      },
    ],
  },
]

export default challenges
