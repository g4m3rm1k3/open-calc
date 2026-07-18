import type { PracticeChallenge } from './loader'

export const title = 'Minimum Spanning Tree'

const challenges: PracticeChallenge[] = [
  {
    level: 1,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Write `makeUnionFind()` (`{ makeSet, find, union }`, `union` returning `false` if the two are already connected) and `kruskal(nodes, edges)`, where `edges` is an array of `[u, v, weight]`. Sort edges by weight ascending, adding each one only if it doesn\'t create a cycle.',
        starter: '',
        tests: `
const edges = [['A','B',1],['B','C',2],['A','C',3]]
assert JSON.stringify(kruskal(['A','B','C'], edges)) === JSON.stringify([['A','B',1],['B','C',2]])
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
      if (rootA === rootB) return false
      parent.set(rootA, rootB)
      return true
    },
  }
}
function kruskal(nodes, edges) {
  const uf = makeUnionFind()
  for (const node of nodes) uf.makeSet(node)
  const sorted = [...edges].sort((a, b) => a[2] - b[2])
  const mst = []
  for (const [u, v, weight] of sorted) {
    if (uf.union(u, v)) mst.push([u, v, weight])
  }
  return mst
}`,
      },
    ],
  },
  {
    level: 2,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Fix `kruskal`: it must only add an edge to the MST when `uf.union(u, v)` returns `true` — adding every edge unconditionally (ignoring the cycle check) produces something that isn\'t a valid spanning tree at all.',
        starter: 'function makeUnionFind() {\n  const parent = new Map()\n  function find(x) {\n    if (parent.get(x) !== x) parent.set(x, find(parent.get(x)))\n    return parent.get(x)\n  }\n  return {\n    makeSet(x) { parent.set(x, x) },\n    find,\n    union(a, b) {\n      const rootA = find(a), rootB = find(b)\n      if (rootA === rootB) return false\n      parent.set(rootA, rootB)\n      return true\n    },\n  }\n}\nfunction kruskal(nodes, edges) {\n  const uf = makeUnionFind()\n  for (const node of nodes) uf.makeSet(node)\n  const sorted = [...edges].sort((a, b) => a[2] - b[2])\n  const mst = []\n  // TODO: only push an edge if uf.union(u, v) returns true — otherwise this\n  // edge would create a cycle and must be skipped\n  for (const [u, v, weight] of sorted) {\n    uf.union(u, v)\n    mst.push([u, v, weight])\n  }\n  return mst\n}',
        tests: `
const edges = [['A','B',1],['B','C',2],['A','C',3],['C','D',1]]
assert JSON.stringify(kruskal(['A','B','C','D'], edges)) === JSON.stringify([['A','B',1],['C','D',1],['B','C',2]])
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
      if (rootA === rootB) return false
      parent.set(rootA, rootB)
      return true
    },
  }
}
function kruskal(nodes, edges) {
  const uf = makeUnionFind()
  for (const node of nodes) uf.makeSet(node)
  const sorted = [...edges].sort((a, b) => a[2] - b[2])
  const mst = []
  for (const [u, v, weight] of sorted) {
    if (uf.union(u, v)) mst.push([u, v, weight])
  }
  return mst
}`,
      },
    ],
  },
  {
    level: 3,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Write `prim(nodes, edges)` — Prim\'s algorithm, the node-first alternative to Kruskal\'s edge-first approach. Starting from `nodes[0]`, repeatedly grow a `visited` set by adding whichever edge is cheapest among all edges connecting a visited node to an unvisited one.',
        starter: '',
        tests: `
const edges = [['A','B',1],['B','C',2],['A','C',3]]
assert JSON.stringify(prim(['A','B','C'], edges)) === JSON.stringify([['A','B',1],['B','C',2]])
`,
        solution: `function prim(nodes, edges) {
  const adj = {}
  for (const node of nodes) adj[node] = []
  for (const [u, v, w] of edges) {
    adj[u].push([v, w])
    adj[v].push([u, w])
  }
  const visited = new Set([nodes[0]])
  const mst = []
  while (visited.size < nodes.length) {
    let best = null
    for (const node of visited) {
      for (const [neighbor, weight] of adj[node]) {
        if (!visited.has(neighbor)) {
          if (!best || weight < best[2]) best = [node, neighbor, weight]
        }
      }
    }
    if (!best) break
    visited.add(best[1])
    mst.push(best)
  }
  return mst
}`,
      },
    ],
  },
]

export default challenges
