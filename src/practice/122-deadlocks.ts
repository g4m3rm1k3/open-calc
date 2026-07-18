import type { PracticeChallenge } from './loader'

export const title = 'Deadlocks'

const challenges: PracticeChallenge[] = [
  {
    level: 1,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Write `hasDeadlock(holds, waitsFor, startThread)`, where `holds` and `waitsFor` map each thread name to the resource it holds / is waiting for. Follow the "waiting for" chain starting at `startThread`; if it ever loops back to a thread already in the chain, that\'s a circular wait — a deadlock.',
        starter: '',
        tests: `
const holds = { threadA: 'lock1', threadB: 'lock2' }
const waitsFor = { threadA: 'lock2', threadB: 'lock1' }
assert hasDeadlock(holds, waitsFor, 'threadA') === true
`,
        solution: `function hasDeadlock(holds, waitsFor, startThread) {
  function heldBy(resource) {
    return Object.keys(holds).find(t => holds[t] === resource)
  }
  function hasCycle(thread, visited = new Set()) {
    if (visited.has(thread)) return true
    visited.add(thread)
    const wantedResource = waitsFor[thread]
    const blockingThread = heldBy(wantedResource)
    if (!blockingThread) return false
    return hasCycle(blockingThread, visited)
  }
  return hasCycle(startThread)
}`,
      },
    ],
  },
  {
    level: 2,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Fix `hasDeadlock`: if the resource a thread is waiting for isn\'t held by anyone (`blockingThread` is `undefined`), that resource is FREE — return `false` immediately instead of recursing further. Without this check, a free resource is mistaken for part of a cycle.',
        starter: 'function hasDeadlock(holds, waitsFor, startThread) {\n  function heldBy(resource) {\n    return Object.keys(holds).find(t => holds[t] === resource)\n  }\n  function hasCycle(thread, visited = new Set()) {\n    if (visited.has(thread)) return true\n    visited.add(thread)\n    const wantedResource = waitsFor[thread]\n    const blockingThread = heldBy(wantedResource)\n    // TODO: if blockingThread is undefined, the wanted resource is FREE —\n    // return false immediately instead of recursing further\n    return hasCycle(blockingThread, visited)\n  }\n  return hasCycle(startThread)\n}',
        tests: `
const cyclicHolds = { threadA: 'lock1', threadB: 'lock2' }
const cyclicWaits = { threadA: 'lock2', threadB: 'lock1' }
assert hasDeadlock(cyclicHolds, cyclicWaits, 'threadA') === true
const safeHolds = { threadA: 'lock1', threadB: 'lock2' }
const safeWaits = { threadA: 'lock2', threadB: 'lock3' }
assert hasDeadlock(safeHolds, safeWaits, 'threadA') === false
`,
        solution: `function hasDeadlock(holds, waitsFor, startThread) {
  function heldBy(resource) {
    return Object.keys(holds).find(t => holds[t] === resource)
  }
  function hasCycle(thread, visited = new Set()) {
    if (visited.has(thread)) return true
    visited.add(thread)
    const wantedResource = waitsFor[thread]
    const blockingThread = heldBy(wantedResource)
    if (!blockingThread) return false
    return hasCycle(blockingThread, visited)
  }
  return hasCycle(startThread)
}`,
      },
    ],
  },
  {
    level: 3,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Write `hasConsistentLockOrder(acquisitionSequences)`, where each sequence is an array of lock names in the order one thread acquires them. Return `false` if any two threads acquire the same pair of locks in OPPOSITE relative order (the exact structural risk enforcing a global lock order is meant to prevent) — `true` otherwise.',
        starter: '',
        tests: `
assert hasConsistentLockOrder([['lock1','lock2'], ['lock1','lock2']]) === true
assert hasConsistentLockOrder([['lock1','lock2'], ['lock2','lock1']]) === false
`,
        solution: `function hasConsistentLockOrder(acquisitionSequences) {
  const edges = new Set()
  for (const seq of acquisitionSequences) {
    for (let i = 0; i < seq.length - 1; i++) {
      edges.add(seq[i] + '->' + seq[i + 1])
    }
  }
  for (const edge of edges) {
    const [a, b] = edge.split('->')
    if (edges.has(b + '->' + a)) return false
  }
  return true
}`,
      },
    ],
  },
]

export default challenges
