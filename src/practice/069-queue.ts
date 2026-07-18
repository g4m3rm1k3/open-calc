import type { PracticeChallenge } from './loader'

export const title = 'Queue'

const challenges: PracticeChallenge[] = [
  {
    level: 1,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Write `makeQueue()` returning `{ enqueue(x), dequeue(), size() }`, FIFO ordered.',
        starter: '',
        tests: `
const q = makeQueue()
assert (q.enqueue(1), true)
assert (q.enqueue(2), true)
assert q.dequeue() === 1
assert q.size() === 1
`,
        solution: 'function makeQueue() { const items = []; return { enqueue: x => items.push(x), dequeue: () => items.shift(), size: () => items.length }; }',
      },
    ],
  },
  {
    level: 2,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Finish `simulatePrintQueue(jobs)` so it processes `jobs` strictly FIFO, returning the order they were processed in.',
        starter: 'function simulatePrintQueue(jobs) {\n  // TODO: process jobs in FIFO order, returning the order they were processed\n}',
        tests: `
assert JSON.stringify(simulatePrintQueue(['a','b','c'])) === JSON.stringify(['a','b','c'])
`,
        solution: 'function simulatePrintQueue(jobs) { const processed = []; const queue = [...jobs]; while (queue.length > 0) { processed.push(queue.shift()); } return processed; }',
      },
    ],
  },
  {
    level: 3,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Write `bfsLevels(adjList, start)` that returns an array of arrays — each level of nodes reachable via BFS, one level at a time — using a queue.',
        starter: '',
        tests: `
const graph = { A: ['B','C'], B: ['D'], C: ['D'], D: [] }
assert JSON.stringify(bfsLevels(graph, 'A')) === JSON.stringify([['A'],['B','C'],['D']])
`,
        solution: `function bfsLevels(adjList, start) {
  const visited = new Set([start])
  let queue = [start]
  const levels = []
  while (queue.length > 0) {
    levels.push([...queue])
    const next = []
    for (const node of queue) {
      for (const neighbor of (adjList[node] || [])) {
        if (!visited.has(neighbor)) {
          visited.add(neighbor)
          next.push(neighbor)
        }
      }
    }
    queue = next
  }
  return levels
}`,
      },
    ],
  },
]

export default challenges
