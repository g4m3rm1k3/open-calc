import type { PracticeChallenge } from './loader'

export const title = 'Topological Sort'

const challenges: PracticeChallenge[] = [
  {
    level: 1,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Write `topologicalSort(nodes, edges)` using Kahn\'s algorithm: repeatedly output a node with zero remaining incoming edges, then decrement its neighbors\' incoming-edge counts, queuing any that reach zero.',
        starter: '',
        tests: `
const nodes = ['Shirt','Underwear','Pants','Jacket']
const edges = [['Shirt','Jacket'],['Underwear','Pants'],['Pants','Jacket']]
assert JSON.stringify(topologicalSort(nodes, edges)) === JSON.stringify(['Shirt','Underwear','Pants','Jacket'])
`,
        solution: `function topologicalSort(nodes, edges) {
  const inDegree = Object.fromEntries(nodes.map(n => [n, 0]))
  const adjacency = Object.fromEntries(nodes.map(n => [n, []]))
  for (const [from, to] of edges) {
    adjacency[from].push(to)
    inDegree[to]++
  }
  const queue = nodes.filter(n => inDegree[n] === 0)
  const order = []
  while (queue.length > 0) {
    const node = queue.shift()
    order.push(node)
    for (const next of adjacency[node]) {
      inDegree[next]--
      if (inDegree[next] === 0) queue.push(next)
    }
  }
  return order.length === nodes.length ? order : null
}`,
      },
    ],
  },
  {
    level: 2,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Fix `topologicalSort` so it returns `null` when the graph contains a cycle. If `order.length !== nodes.length` after the algorithm runs out of zero-incoming-edge nodes to process, some nodes never got output — that\'s exactly what a cycle looks like.',
        starter: 'function topologicalSort(nodes, edges) {\n  const inDegree = Object.fromEntries(nodes.map(n => [n, 0]))\n  const adjacency = Object.fromEntries(nodes.map(n => [n, []]))\n  for (const [from, to] of edges) {\n    adjacency[from].push(to)\n    inDegree[to]++\n  }\n  const queue = nodes.filter(n => inDegree[n] === 0)\n  const order = []\n  while (queue.length > 0) {\n    const node = queue.shift()\n    order.push(node)\n    for (const next of adjacency[node]) {\n      inDegree[next]--\n      if (inDegree[next] === 0) queue.push(next)\n    }\n  }\n  // TODO: if order.length !== nodes.length, some nodes never reached zero\n  // incoming edges — that means a cycle exists, so return null instead\n  return order\n}',
        tests: `
const nodes = ['Shirt','Underwear','Pants','Jacket']
const edgesCyclic = [['Shirt','Jacket'],['Underwear','Pants'],['Pants','Jacket'],['Jacket','Shirt']]
assert topologicalSort(nodes, edgesCyclic) === null
const edgesValid = [['Shirt','Jacket'],['Underwear','Pants'],['Pants','Jacket']]
assert JSON.stringify(topologicalSort(nodes, edgesValid)) === JSON.stringify(['Shirt','Underwear','Pants','Jacket'])
`,
        solution: `function topologicalSort(nodes, edges) {
  const inDegree = Object.fromEntries(nodes.map(n => [n, 0]))
  const adjacency = Object.fromEntries(nodes.map(n => [n, []]))
  for (const [from, to] of edges) {
    adjacency[from].push(to)
    inDegree[to]++
  }
  const queue = nodes.filter(n => inDegree[n] === 0)
  const order = []
  while (queue.length > 0) {
    const node = queue.shift()
    order.push(node)
    for (const next of adjacency[node]) {
      inDegree[next]--
      if (inDegree[next] === 0) queue.push(next)
    }
  }
  return order.length === nodes.length ? order : null
}`,
      },
    ],
  },
  {
    level: 3,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Write `canFinishCourses(numCourses, prerequisites)`, where `prerequisites` is an array of `[course, prereq]` pairs (numbered `0..numCourses-1`) meaning `prereq` must be taken before `course`. Return `true` if every course can eventually be completed (no circular prerequisite chain).',
        starter: '',
        tests: `
assert canFinishCourses(2, [[1,0]]) === true
assert canFinishCourses(2, [[1,0],[0,1]]) === false
assert canFinishCourses(4, [[1,0],[2,0],[3,1],[3,2]]) === true
`,
        solution: `function canFinishCourses(numCourses, prerequisites) {
  const inDegree = new Array(numCourses).fill(0)
  const adjacency = Array.from({length: numCourses}, () => [])
  for (const [course, prereq] of prerequisites) {
    adjacency[prereq].push(course)
    inDegree[course]++
  }
  const queue = []
  for (let i = 0; i < numCourses; i++) if (inDegree[i] === 0) queue.push(i)
  let visitedCount = 0
  while (queue.length > 0) {
    const node = queue.shift()
    visitedCount++
    for (const next of adjacency[node]) {
      inDegree[next]--
      if (inDegree[next] === 0) queue.push(next)
    }
  }
  return visitedCount === numCourses
}`,
      },
    ],
  },
]

export default challenges
